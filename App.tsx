
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
import { generateNewsEvent } from './services/geminiService';
import { soundService } from './services/soundService';
import { SimulationService } from './services/simulationService';
import { SaveService } from './services/saveService';
import { ActionService, ActionResponse } from './services/actionService';

const createInitialGrid = (): Grid => {
  const grid: Grid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: TileData[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      // Fix: Use property names from types.ts (hasMana, hasEssence, hasGuards, hasMagicSafety, hasWisdom)
      row.push({ 
        x, 
        y, 
        buildingType: BuildingType.None, 
        level: 1, 
        hasMana: true, 
        hasEssence: true, 
        hasGuards: false, 
        hasMagicSafety: false, 
        hasWisdom: false, 
        happiness: 100 
      });
    }
    grid.push(row);
  }
  return grid;
};

// Fix: Use property names from types.ts (manaSupply, essenceSupply, manaUsage, essenceUsage)
const INITIAL_STATS: CityStats = {
  money: INITIAL_MONEY, 
  population: 0, 
  day: 1, 
  happiness: 100, 
  manaSupply: 0, 
  essenceSupply: 0, 
  manaUsage: 0, 
  essenceUsage: 0,
  maintenanceTotal: 0,
  incomeTotal: 0,
  weather: 'clear', 
  time: 10
};

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [grid, setGrid] = useState<Grid>(createInitialGrid);
  const [stats, setStats] = useState<CityStats>(INITIAL_STATS);
  const [selectedTool, setSelectedTool] = useState<BuildingType>(BuildingType.Road);
  const [currentGoal] = useState<AIGoal | null>(null);
  const [isGeneratingGoal] = useState(false);
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);

  const gridRef = useRef(grid);
  const statsRef = useRef(stats);
  useEffect(() => { gridRef.current = grid; statsRef.current = stats; }, [grid, stats]);

  // --- Core Persistence ---
  useEffect(() => {
    const saved = SaveService.load();
    if (saved) {
      setGrid(saved.grid);
      setStats(saved.stats);
    }
  }, []);

  useEffect(() => {
    if (gameStarted) SaveService.save(grid, stats);
  }, [grid, stats, gameStarted]);

  // --- Simulation Loop ---
  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(() => {
      const { newStats, newGrid } = SimulationService.calculateTick(gridRef.current, statsRef.current);
      
      // AI Disaster / Event System
      if (Math.random() < 0.05 && aiEnabled) {
         triggerAIEvent();
      }

      setStats(newStats);
      setGrid(newGrid);
    }, TICK_RATE_MS);
    return () => clearInterval(interval);
  }, [gameStarted, aiEnabled]);

  const triggerAIEvent = async () => {
    const news = await generateNewsEvent(statsRef.current, "City is evolving.");
    if (news) setNewsFeed(prev => [...prev.slice(-10), news]);
  };

  const addNewsEntry = useCallback((text: string, type: NewsItem['type']) => {
    setNewsFeed(prev => [...prev.slice(-9), { id: Date.now().toString(), text, type }]);
  }, []);

  const handleTileClick = useCallback((x: number, y: number) => {
    if (!gameStarted) return;
    
    let result: ActionResponse;

    if (selectedTool === BuildingType.Upgrade) {
      result = ActionService.upgradeTile(grid, stats, x, y);
    } else if (selectedTool === BuildingType.None) {
      result = ActionService.bulldozeTile(grid, stats, x, y);
    } else {
      result = ActionService.buildTile(grid, stats, x, y, selectedTool);
    }

    if (result.success) {
      setGrid(result.newGrid);
      setStats(result.newStats);
      
      // Play sound based on tool
      if (selectedTool === BuildingType.Upgrade) {
        soundService.playUpgrade();
      } else if (selectedTool === BuildingType.None) {
        soundService.playDemolish();
      } else {
        soundService.playBuild(selectedTool);
      }
    }

    if (result.message) {
      addNewsEntry(result.message, result.type);
    }
  }, [grid, stats, selectedTool, gameStarted, addNewsEntry]);

  const handleStart = (enabled: boolean) => {
    setAiEnabled(enabled);
    setGameStarted(true);
    soundService.playReward(); 
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      <IsoMap 
        grid={grid} 
        onTileClick={handleTileClick} 
        hoveredTool={selectedTool}
        population={stats.population}
        money={stats.money}
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
          onClaimReward={() => {}}
          isGeneratingGoal={isGeneratingGoal}
          aiEnabled={aiEnabled}
          grid={grid}
        />
      )}
      <style>{`
        @keyframes drift { from { transform: translateX(-10%); } to { transform: translateX(10%); } }
        .weather-layer { pointer-events: none; position: absolute; inset: 0; z-index: 5; }
        .rain-drop { position: absolute; width: 1px; height: 20px; background: rgba(255,255,255,0.2); animation: rain-fall 0.8s linear infinite; }
        @keyframes rain-fall { from { transform: translateY(-100vh); } to { transform: translateY(100vh); } }
      `}</style>
    </div>
  );
}

export default App;
