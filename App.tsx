
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, TileData, BuildingType, CityStats, AIGoal, NewsItem } from './types';
import { GRID_SIZE, BUILDINGS, TICK_RATE_MS, INITIAL_MONEY, MAX_LEVEL } from './constants';
import IsoMap from './components/IsoMap';
import UIOverlay from './components/UIOverlay';
import StartScreen from './components/StartScreen';
import { generateCityGoal, generateNewsEvent } from './services/geminiService';
import { soundService } from './services/soundService';
import { SimulationService } from './services/simulationService';
import { SaveService } from './services/saveService';

const createInitialGrid = (): Grid => {
  const grid: Grid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: TileData[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({ x, y, buildingType: BuildingType.None, level: 1, hasPower: true, hasWater: true, happiness: 100 });
    }
    grid.push(row);
  }
  return grid;
};

const INITIAL_STATS: CityStats = {
  money: INITIAL_MONEY, population: 0, day: 1, happiness: 100, 
  powerSupply: 0, waterSupply: 0, powerUsage: 0, waterUsage: 0,
  weather: 'clear', time: 10
};

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [grid, setGrid] = useState<Grid>(createInitialGrid);
  const [stats, setStats] = useState<CityStats>(INITIAL_STATS);
  const [selectedTool, setSelectedTool] = useState<BuildingType>(BuildingType.Road);
  const [currentGoal, setCurrentGoal] = useState<AIGoal | null>(null);
  const [isGeneratingGoal, setIsGeneratingGoal] = useState(false);
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

  const handleTileClick = useCallback((x: number, y: number) => {
    if (!gameStarted) return;
    const tool = selectedTool;
    const currentTile = grid[y][x];
    
    // 1. Upgrade Tool Logic
    if (tool === BuildingType.Upgrade) {
      const bType = currentTile.buildingType;
      // Only upgrade buildings that have levels (exclude road and none)
      const isUpgradable = bType !== BuildingType.None && bType !== BuildingType.Road && bType !== BuildingType.Upgrade;
      
      if (isUpgradable) {
        if (currentTile.level < MAX_LEVEL) {
          const baseCost = BUILDINGS[bType].cost;
          const upgradeCost = Math.floor(baseCost * currentTile.level * 1.5);
          
          if (stats.money >= upgradeCost) {
            // Immutable grid update
            const newGrid = grid.map((row, ridx) => ridx === y ? [...row] : row);
            newGrid[y][x] = { ...currentTile, level: currentTile.level + 1 };
            
            setGrid(newGrid);
            setStats(s => ({ ...s, money: s.money - upgradeCost }));
            soundService.playUpgrade();
            
            setNewsFeed(prev => [...prev.slice(-9), {
              id: Date.now().toString(),
              text: `${BUILDINGS[bType].name} upgraded to Level ${currentTile.level + 1}.`,
              type: 'positive'
            }]);
          } else {
            setNewsFeed(prev => [...prev.slice(-9), {
              id: Date.now().toString(),
              text: `Insufficient funds for upgrade ($${upgradeCost} needed).`,
              type: 'negative'
            }]);
          }
        } else {
          setNewsFeed(prev => [...prev.slice(-9), {
            id: Date.now().toString(),
            text: "This building is already at maximum level.",
            type: 'neutral'
          }]);
        }
      }
      return;
    }

    // 2. Bulldoze Tool Logic
    if (tool === BuildingType.None) {
      if (currentTile.buildingType !== BuildingType.None) {
        const newGrid = grid.map((row, ridx) => ridx === y ? [...row] : row);
        newGrid[y][x] = { ...currentTile, buildingType: BuildingType.None, level: 1 };
        setGrid(newGrid);
        setStats(s => ({ ...s, money: Math.max(0, s.money - 10) })); // Small demolition fee
        soundService.playDemolish();
      }
      return;
    }

    // 3. Build Tool Logic
    const config = BUILDINGS[tool];
    if (currentTile.buildingType === BuildingType.None) {
      if (stats.money >= config.cost) {
        const newGrid = grid.map((row, ridx) => ridx === y ? [...row] : row);
        newGrid[y][x] = { ...currentTile, buildingType: tool, level: 1 };
        setGrid(newGrid);
        setStats(s => ({ ...s, money: s.money - config.cost }));
        soundService.playBuild();
      } else {
        setNewsFeed(prev => [...prev.slice(-9), {
          id: Date.now().toString(),
          text: `Cannot afford ${config.name} ($${config.cost}).`,
          type: 'negative'
        }]);
      }
    }
  }, [grid, stats.money, selectedTool, gameStarted]);

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
