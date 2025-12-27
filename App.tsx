
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

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [grid, setGrid] = useState<Grid>(createInitialGrid);
  const [stats, setStats] = useState<CityStats>(INITIAL_STATS);
  const [selectedTool, setSelectedTool] = useState<BuildingType>(BuildingType.Road);
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  const [currentGoal, setCurrentGoal] = useState<AIGoal | null>(null);

  // Refs for consistent access in the simulation loop
  const gridRef = useRef(grid);
  const statsRef = useRef(stats);
  useEffect(() => { gridRef.current = grid; statsRef.current = stats; }, [grid, stats]);

  // Load Persistence
  useEffect(() => {
    const saved = SaveService.load();
    if (saved) {
      setGrid(saved.grid);
      setStats(saved.stats);
    }
  }, []);

  // Simulation Loop
  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(() => {
      const { newStats, newGrid } = SimulationService.calculateTick(gridRef.current, statsRef.current);
      
      // Chance of AI News Event
      if (Math.random() < 0.08 && aiEnabled) {
         fetchNews();
      }

      // Quest checking
      if (!currentGoal && Math.random() < 0.03 && aiEnabled) {
        fetchGoal();
      }

      setStats(newStats);
      setGrid(newGrid);
      SaveService.save(newGrid, newStats);
    }, TICK_RATE_MS);
    return () => clearInterval(interval);
  }, [gameStarted, aiEnabled, currentGoal]);

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
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950">
      <IsoMap 
        grid={grid} 
        onTileClick={handleTileClick} 
        hoveredTool={selectedTool}
        time={stats.time}
        weather={stats.weather}
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
        />
      )}
      
      <style>{`
        ::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default App;
