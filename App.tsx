
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, TileData, BuildingType, CityStats, AIGoal, NewsItem } from './types';
import { GRID_SIZE, TICK_RATE_MS, INITIAL_MONEY } from './constants';
import IsoMap from './components/IsoMap';
import UIOverlay from './components/UIOverlay';
import StartScreen from './components/StartScreen';
import { generateNewsEvent, generateCityGoal } from './services/geminiService';
import { soundService } from './services/soundService';
import { SimulationService } from './services/simulationService';
import { SaveService } from './services/saveService';
import { ActionService } from './services/actionService';

const createInitialGrid = (): Grid => {
  const grid: Grid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: TileData[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({ 
        x, y, 
        buildingType: BuildingType.None, 
        level: 1, 
        hasMana: true, hasEssence: true, 
        hasGuards: false, hasMagicSafety: false, hasWisdom: false, 
        happiness: 100 
      });
    }
    grid.push(row);
  }
  return grid;
};

const INITIAL_STATS: CityStats = {
  money: INITIAL_MONEY, population: 0, day: 1, happiness: 100, 
  manaSupply: 0, essenceSupply: 0, manaUsage: 0, essenceUsage: 0,
  maintenanceTotal: 0, incomeTotal: 0, weather: 'clear', time: 10,
  taxRate: 1.0
};

const FALLBACK_NEWS: NewsItem[] = [
  { id: '1', text: "A gentle breeze whispers through the ancient valley.", type: 'neutral', timestamp: Date.now() },
  { id: '2', text: "The Royal Wizard awaits your command.", type: 'positive', timestamp: Date.now() - 1000 }
];

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [grid, setGrid] = useState<Grid>(createInitialGrid);
  const [stats, setStats] = useState<CityStats>(INITIAL_STATS);
  const [selectedTool, setSelectedTool] = useState<BuildingType>(BuildingType.Road);
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>(FALLBACK_NEWS);
  const [currentGoal, setCurrentGoal] = useState<AIGoal | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const gridRef = useRef(grid);
  const statsRef = useRef(stats);
  const goalRef = useRef(currentGoal);
  
  useEffect(() => { 
    gridRef.current = grid; 
    statsRef.current = stats; 
    goalRef.current = currentGoal;
  }, [grid, stats, currentGoal]);

  useEffect(() => {
    const saved = SaveService.load();
    if (saved) {
      setGrid(saved.grid);
      setStats(saved.stats);
    }
  }, []);

  const checkGoalProgression = useCallback(() => {
    const goal = goalRef.current;
    if (!goal || goal.completed) return;

    let currentValue = 0;
    const currentStats = statsRef.current;
    const currentGrid = gridRef.current;

    switch (goal.targetType) {
      case 'population': currentValue = currentStats.population; break;
      case 'money': currentValue = currentStats.money; break;
      case 'happiness': currentValue = currentStats.happiness; break;
      case 'building_count':
        currentValue = currentGrid.flat().filter(t => t.buildingType === goal.buildingType).length;
        break;
    }

    if (currentValue >= goal.targetValue) {
      const reward = goal.reward;
      setStats(prev => ({ ...prev, money: prev.money + reward }));
      setCurrentGoal(prev => prev ? { ...prev, completed: true } : null);
      setNewsFeed(prev => [{
        id: Math.random().toString(36),
        text: `The Prophecy is Fulfilled! ${reward} gold granted to the treasury.`,
        type: 'positive',
        timestamp: Date.now()
      }, ...prev].slice(0, 15));
      soundService.playReward();
      setTimeout(() => setCurrentGoal(null), 8000);
    }
  }, []);

  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(() => {
      const { newStats, newGrid } = SimulationService.calculateTick(gridRef.current, statsRef.current);
      setStats(newStats);
      setGrid(newGrid);
      checkGoalProgression();
      if (Math.random() < 0.1 && aiEnabled) fetchNews();
      if (!currentGoal && Math.random() < 0.05 && aiEnabled) fetchGoal();
      SaveService.save(newGrid, newStats);
    }, TICK_RATE_MS);
    return () => clearInterval(interval);
  }, [gameStarted, aiEnabled, currentGoal, checkGoalProgression]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || isPanelOpen) return;
      const key = e.key.toLowerCase();
      const shortcutMap: Record<string, BuildingType> = {
        '1': BuildingType.Road, '2': BuildingType.Residential, '3': BuildingType.Commercial,
        '4': BuildingType.Industrial, '5': BuildingType.Park, '6': BuildingType.PowerPlant,
        '7': BuildingType.WaterTower, '8': BuildingType.PoliceStation, '9': BuildingType.FireStation,
        '0': BuildingType.School, 'b': BuildingType.None, 'e': BuildingType.Upgrade,
      };
      if (shortcutMap[key]) setSelectedTool(shortcutMap[key]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, isPanelOpen]);

  const fetchNews = async () => {
    const news = await generateNewsEvent(statsRef.current, "Quiet prosperity");
    if (news) setNewsFeed(prev => [news, ...prev].slice(0, 12));
  };

  const fetchGoal = async () => {
    const goal = await generateCityGoal(statsRef.current, gridRef.current);
    if (goal) setCurrentGoal(goal);
  };

  const handleTileClick = useCallback((x: number, y: number) => {
    if (!gameStarted) return;
    const targetTile = grid[y][x];
    const result = ActionService.execute(selectedTool, grid, stats, x, y);
    if (result.success) {
      setGrid(result.newGrid);
      setStats(result.newStats);
      soundService.playForAction(selectedTool, targetTile.buildingType, targetTile.level + 1);
    }
    if (result.message) {
      setNewsFeed(prev => [{ 
        id: Math.random().toString(36), 
        text: result.message, 
        type: result.type,
        timestamp: Date.now() 
      }, ...prev].slice(0, 12));
    }
  }, [grid, stats, selectedTool, gameStarted]);

  const handleStart = (enabled: boolean) => {
    setAiEnabled(enabled);
    setGameStarted(true);
    soundService.playReward(); 
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <IsoMap 
        grid={grid} 
        onTileClick={handleTileClick} 
        onSelectTool={setSelectedTool}
        hoveredTool={selectedTool}
        time={stats.time}
        weather={stats.weather}
        isLocked={isPanelOpen}
      />
      {!gameStarted && <StartScreen onStart={handleStart} />}
      {gameStarted && (
        <UIOverlay
          stats={stats}
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          currentGoal={currentGoal}
          newsFeed={newsFeed}
          grid={grid}
          onPanelStateChange={setIsPanelOpen}
        />
      )}
    </div>
  );
}

export default App;
