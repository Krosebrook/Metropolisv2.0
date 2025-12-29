
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
import WizardConsole from './components/WizardConsole';
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

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [grid, setGrid] = useState<Grid>(createInitialGrid);
  const [stats, setStats] = useState<CityStats>(INITIAL_STATS);
  const [selectedTool, setSelectedTool] = useState<BuildingType>(BuildingType.Road);
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  const [currentGoal, setCurrentGoal] = useState<AIGoal | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const gridRef = useRef(grid);
  const statsRef = useRef(stats);
  
  useEffect(() => { 
    gridRef.current = grid; 
    statsRef.current = stats; 
  }, [grid, stats]);

  useEffect(() => {
    const profile = SaveService.load();
    if (profile) {
      setGrid(profile.grid);
      setStats(profile.stats);
    }
  }, []);

  const fetchNews = async () => {
    const news = await generateNewsEvent(statsRef.current, "Quiet prosperity");
    if (news) setNewsFeed(prev => [news, ...prev].slice(0, 12));
  };

  const fetchGoal = async () => {
    const goal = await generateCityGoal(statsRef.current, gridRef.current);
    if (goal) setCurrentGoal(goal);
  };

  useEffect(() => {
    if (!gameStarted || isConsoleOpen) return;
    const interval = setInterval(() => {
      if (document.hidden) return; // Pause logic for better performance
      const { newStats, newGrid } = SimulationService.calculateTick(gridRef.current, statsRef.current);
      setStats(newStats);
      setGrid(newGrid);
      if (Math.random() < 0.1 && aiEnabled) fetchNews();
      if (!currentGoal && Math.random() < 0.05 && aiEnabled) fetchGoal();
      SaveService.save(newGrid, newStats);
    }, TICK_RATE_MS);
    return () => clearInterval(interval);
  }, [gameStarted, aiEnabled, currentGoal, isConsoleOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`') {
        setIsConsoleOpen(prev => !prev);
        return;
      }
      if (!gameStarted || isConsoleOpen || isPanelOpen) return;
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
  }, [gameStarted, isConsoleOpen, isPanelOpen]);

  const handleConsoleCommand = (cmd: string, args: string[]) => {
    if (cmd === 'gift') {
      const amount = parseInt(args[0]) || 1000;
      setStats(prev => ({ ...prev, money: prev.money + amount }));
    }
    if (cmd === 'rain') {
      setStats(prev => ({ ...prev, weather: args[0] as any || 'rain' }));
    }
  };

  const handleTileClick = useCallback((x: number, y: number) => {
    if (!gameStarted || isConsoleOpen) return;
    const result = ActionService.execute(selectedTool, grid, stats, x, y);
    if (result.success) {
      setGrid(result.newGrid);
      setStats(result.newStats);
      soundService.playForAction(selectedTool, grid[y][x].buildingType, grid[y][x].level + 1);
    }
  }, [grid, stats, selectedTool, gameStarted, isConsoleOpen]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <IsoMap 
        grid={grid} 
        onTileClick={handleTileClick} 
        onSelectTool={setSelectedTool}
        time={stats.time}
        weather={stats.weather}
        isLocked={isPanelOpen || isConsoleOpen}
      />
      {!gameStarted && <StartScreen onStart={() => setGameStarted(true)} />}
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
      <WizardConsole 
        stats={stats} 
        grid={grid} 
        isOpen={isConsoleOpen} 
        onClose={() => setIsConsoleOpen(false)} 
        onCommand={handleConsoleCommand}
      />
    </div>
  );
}

export default App;
