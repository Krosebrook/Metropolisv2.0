
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
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const gridRef = useRef(grid);
  const statsRef = useRef(stats);
  const isFetchingGoal = useRef(false);
  
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

    // Handle PWA Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
  };

  // Main simulation tick
  useEffect(() => {
    if (!gameStarted || isConsoleOpen) return;
    const interval = setInterval(() => {
      if (document.hidden) return;
      const { newStats, newGrid } = SimulationService.calculateTick(gridRef.current, statsRef.current);
      setStats(newStats);
      setGrid(newGrid);
      if (Math.random() < 0.1 && aiEnabled) generateNewsEvent(statsRef.current, "Prosperity").then(news => news && setNewsFeed(p => [news, ...p].slice(0, 10)));
      SaveService.save(newGrid, newStats);
    }, TICK_RATE_MS);
    return () => clearInterval(interval);
  }, [gameStarted, aiEnabled, isConsoleOpen]);

  // Goal logic: Completion check and automatic generation
  useEffect(() => {
    if (!gameStarted || !aiEnabled) return;

    // 1. If goal is active and not completed, check if it's met
    if (currentGoal && !currentGoal.completed) {
      const goal = currentGoal;
      let met = false;

      if (goal.targetType === 'population') met = stats.population >= goal.targetValue;
      else if (goal.targetType === 'money') met = stats.money >= goal.targetValue;
      else if (goal.targetType === 'happiness') met = stats.happiness >= goal.targetValue;
      else if (goal.targetType === 'building_count' && goal.buildingType) {
        const count = grid.flat().filter(t => t.buildingType === goal.buildingType).length;
        met = count >= goal.targetValue;
      }

      if (met) {
        soundService.playReward();
        setStats(prev => ({ ...prev, money: prev.money + goal.reward }));
        setCurrentGoal(prev => prev ? { ...prev, completed: true } : null);
        // Herald notification
        const completionNews: NewsItem = {
          id: Math.random().toString(36).substring(7),
          text: `Huzzah! The Royal Wizard's decree has been fulfilled!`,
          type: 'positive',
          timestamp: Date.now()
        };
        setNewsFeed(p => [completionNews, ...p].slice(0, 10));
      }
      return;
    }

    // 2. If no goal or goal is completed, fetch a new one
    if (!currentGoal || currentGoal.completed) {
      if (isFetchingGoal.current) return;
      isFetchingGoal.current = true;

      const timer = setTimeout(async () => {
        try {
          const goal = await generateCityGoal(statsRef.current, gridRef.current);
          if (goal) {
            setCurrentGoal(goal);
            // Herald notification
            const arrivalNews: NewsItem = {
              id: Math.random().toString(36).substring(7),
              text: `A new magical prophecy has been delivered by the Royal Wizard.`,
              type: 'urgent',
              timestamp: Date.now()
            };
            setNewsFeed(p => [arrivalNews, ...p].slice(0, 10));
          }
        } finally {
          isFetchingGoal.current = false;
        }
      }, 3000); // 3-second pause between goals
      return () => clearTimeout(timer);
    }
  }, [gameStarted, aiEnabled, stats.population, stats.money, stats.happiness, grid, currentGoal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`') { setIsConsoleOpen(prev => !prev); return; }
      if (!gameStarted || isConsoleOpen || isPanelOpen) return;
      const key = e.key.toLowerCase();
      const shortcutMap: Record<string, BuildingType> = {
        '1': BuildingType.Road, '2': BuildingType.Residential, '3': BuildingType.Commercial,
        '4': BuildingType.Industrial, '5': BuildingType.Park, '6': BuildingType.PowerPlant,
        '7': BuildingType.WaterTower, '8': BuildingType.PoliceStation, '9': BuildingType.FireStation,
        '0': BuildingType.School, 'b': BuildingType.None, 'e': BuildingType.Upgrade,
        'w': BuildingType.Windmill, 'm': BuildingType.MarketSquare, 'a': BuildingType.MagicAcademy,
        'l': BuildingType.Library, 'k': BuildingType.Bakery, 'f': BuildingType.Park,
        'g': BuildingType.PoliceStation, 'c': BuildingType.Landmark
      };
      if (shortcutMap[key]) setSelectedTool(shortcutMap[key]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, isConsoleOpen, isPanelOpen]);

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
      <IsoMap grid={grid} onTileClick={handleTileClick} onSelectTool={setSelectedTool} time={stats.time} weather={stats.weather} isLocked={isPanelOpen || isConsoleOpen} />
      {!gameStarted && <StartScreen onStart={(ai) => { setAiEnabled(ai); setGameStarted(true); }} />}
      {gameStarted && (
        <UIOverlay 
          stats={stats} 
          selectedTool={selectedTool} 
          onSelectTool={setSelectedTool} 
          currentGoal={currentGoal} 
          newsFeed={newsFeed} 
          grid={grid} 
          onPanelStateChange={setIsPanelOpen}
          onInstall={deferredPrompt ? handleInstallClick : undefined}
        />
      )}
      <WizardConsole stats={stats} grid={grid} isOpen={isConsoleOpen} onClose={() => setIsConsoleOpen(false)} onCommand={(cmd, args) => {
        if (cmd === 'gift') setStats(p => ({ ...p, money: p.money + (parseInt(args[0]) || 1000) }));
        if (cmd === 'weather') setStats(p => ({ ...p, weather: args[0] as any || 'rain' }));
      }} />
    </div>
  );
}

export default App;
