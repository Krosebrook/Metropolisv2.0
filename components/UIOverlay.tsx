
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo } from 'react';
import { BuildingType, BuildingConfig, AIGoal } from '../types';
import { BUILDINGS } from '../constants';
import AdvisorPanel from './AdvisorPanel';

const StatIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'pop': return <span className="text-emerald-400">👥</span>;
    case 'gold': return <span className="text-amber-400">💰</span>;
    case 'mana': return <span className="text-fuchsia-400">✨</span>;
    case 'essence': return <span className="text-blue-400">💧</span>;
    case 'upkeep': return <span className="text-rose-400">📜</span>;
    case 'range': return <span className="text-sky-400">🏹</span>;
    default: return null;
  }
};

const QuestTracker = ({ goal, stats, grid }: { goal: AIGoal, stats: any, grid: any }) => {
  const progress = useMemo(() => {
    if (!goal) return 0;
    let current = 0;
    switch (goal.targetType) {
      case 'population': current = stats.population; break;
      case 'money': current = stats.money; break;
      case 'happiness': current = stats.happiness; break;
      case 'building_count': 
        current = grid.flat().filter((t: any) => t.buildingType === goal.buildingType).length;
        break;
    }
    return Math.min(100, (current / goal.targetValue) * 100);
  }, [goal, stats, grid]);

  return (
    <div className={`pointer-events-auto absolute top-24 left-6 w-80 bg-stone-900/90 border-2 ${goal.completed ? 'border-emerald-500 animate-bounce' : 'border-amber-900/60'} rounded-3xl p-5 shadow-2xl backdrop-blur-xl transition-all duration-500 ring-1 ring-white/5`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Royal Decree</span>
        {goal.completed && <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse">FULFILLED</span>}
      </div>
      <p className="text-amber-100 font-serif italic text-sm leading-snug mb-4">"{goal.description}"</p>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black text-stone-400 uppercase tracking-widest">
          <span>Progress</span>
          <span className={goal.completed ? 'text-emerald-400' : 'text-amber-500'}>{Math.floor(progress)}%</span>
        </div>
        <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden p-0.5 ring-1 ring-white/5">
          <div 
            className={`h-full transition-all duration-1000 rounded-full ${goal.completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-600 to-amber-400'}`} 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-[9px] font-bold text-stone-500 uppercase">Reward:</span>
          <span className="text-amber-400 font-black text-xs">💰 {goal.reward} GOLD</span>
        </div>
      </div>
    </div>
  );
};

const BuildingTooltip = ({ config }: { config: BuildingConfig }) => {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-80 bg-stone-900/95 border-2 border-amber-500/60 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl pointer-events-none z-50 overflow-hidden ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200 origin-bottom">
      <div className="bg-gradient-to-br from-amber-900/60 to-transparent p-5 border-b border-white/5">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-amber-50 font-black uppercase text-base tracking-widest drop-shadow-md">{config.name}</h4>
          <div className="bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/40">
            <span className="text-amber-400 font-black text-[11px] tracking-tight">{config.cost} GOLD</span>
          </div>
        </div>
        <p className="text-stone-300 text-[11px] leading-relaxed italic opacity-90 mt-1">"{config.description}"</p>
      </div>
      <div className="p-5 space-y-5">
        <div>
          <h5 className="text-[9px] font-black text-stone-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-3">
            <span className="h-px flex-1 bg-stone-800"></span>
            Scroll of Records
            <span className="h-px flex-1 bg-stone-800"></span>
          </h5>
          <div className="grid grid-cols-2 gap-4">
            {config.popGen > 0 && (
              <div className="flex items-center gap-3 bg-stone-950/40 p-2 rounded-xl border border-white/5">
                <StatIcon type="pop" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-stone-100">+{config.popGen} Subjects</span>
                  <span className="text-[8px] text-stone-500 font-black uppercase tracking-tighter">Population</span>
                </div>
              </div>
            )}
            {config.incomeGen > 0 && (
              <div className="flex items-center gap-3 bg-stone-950/40 p-2 rounded-xl border border-white/5">
                <StatIcon type="gold" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-emerald-400">+{config.incomeGen}g</span>
                  <span className="text-[8px] text-stone-500 font-black uppercase tracking-tighter">Revenue</span>
                </div>
              </div>
            )}
            {config.maintenance > 0 && (
              <div className="flex items-center gap-3 bg-stone-950/40 p-2 rounded-xl border border-white/5">
                <StatIcon type="upkeep" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-rose-400">-{config.maintenance}g</span>
                  <span className="text-[8px] text-stone-500 font-black uppercase tracking-tighter">Maintenance</span>
                </div>
              </div>
            )}
            {config.serviceRadius && (
              <div className="flex items-center gap-3 bg-stone-950/40 p-2 rounded-xl border border-white/5">
                <StatIcon type="range" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-sky-400">{config.serviceRadius} tiles</span>
                  <span className="text-[8px] text-stone-500 font-black uppercase tracking-tighter">Blessing Reach</span>
                </div>
              </div>
            )}
          </div>
        </div>
        {(config.manaReq > 0 || config.essenceReq > 0) && (
          <div>
            <h5 className="text-[9px] font-black text-stone-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-3">
              <span className="h-px flex-1 bg-stone-800"></span>
              Arcane Cost
              <span className="h-px flex-1 bg-stone-800"></span>
            </h5>
            <div className="flex gap-3">
              {config.manaReq > 0 && (
                <div className="flex items-center gap-3 bg-fuchsia-500/10 px-4 py-2 rounded-2xl border border-fuchsia-500/30 flex-1">
                  <StatIcon type="mana" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-fuchsia-300">{config.manaReq} Units</span>
                    <span className="text-[8px] text-fuchsia-500/80 font-black uppercase">Mana Flow</span>
                  </div>
                </div>
              )}
              {config.essenceReq > 0 && (
                <div className="flex items-center gap-3 bg-blue-500/10 px-4 py-2 rounded-2xl border border-blue-500/30 flex-1">
                  <StatIcon type="essence" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-blue-300">{config.essenceReq} Units</span>
                    <span className="text-[8px] text-blue-500/80 font-black uppercase">Essence Veil</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="bg-amber-500/10 p-3 text-center border-t border-white/5">
        <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest animate-pulse">Select to Issue Royal Decree</span>
      </div>
    </div>
  );
};

const UIOverlay = ({ stats, selectedTool, onSelectTool, newsFeed, grid, currentGoal, onPanelStateChange }: any) => {
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingType | null>(null);
  
  useEffect(() => {
    onPanelStateChange(showAdvisor);
  }, [showAdvisor, onPanelStateChange]);

  const formatTime = (t: number) => {
    const hours = Math.floor(t);
    const mins = Math.floor((t % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const netIncome = stats.incomeTotal - stats.maintenanceTotal;

  const shortcutHints: Record<string, string> = {
    [BuildingType.Road]: '1',
    [BuildingType.Residential]: '2',
    [BuildingType.Commercial]: '3',
    [BuildingType.Industrial]: '4',
    [BuildingType.Park]: '5',
    [BuildingType.PowerPlant]: '6',
    [BuildingType.WaterTower]: '7',
    [BuildingType.PoliceStation]: '8',
    [BuildingType.FireStation]: '9',
    [BuildingType.School]: '0',
    [BuildingType.None]: 'B',
    [BuildingType.Upgrade]: 'E',
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-20 font-serif">
      {/* Top Header */}
      <div className="flex justify-between items-start pointer-events-auto gap-4">
        <div className="bg-stone-900/95 border-2 border-amber-500/50 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex gap-10 items-center">
          <div className="flex flex-col">
            <span className="text-[11px] text-amber-500 uppercase font-black tracking-[0.2em] mb-1">Royal Gold</span>
            <div className="flex items-baseline gap-2">
               <span className={`text-4xl font-black ${stats.money < 0 ? 'text-rose-500' : 'text-amber-400'}`}>
                 {stats.money.toLocaleString()}g
               </span>
               <span className={`text-xs font-bold px-2 py-1 rounded-lg ${netIncome >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                 {netIncome >= 0 ? '+' : ''}{netIncome}/tick
               </span>
            </div>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[11px] text-amber-500 uppercase font-black tracking-[0.2em] mb-1">Kingdom Joy</span>
            <div className="flex items-center gap-4">
              <div className="w-32 h-5 bg-stone-950 rounded-full overflow-hidden border border-white/5 ring-1 ring-white/10 p-1">
                <div className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-1000 rounded-full" style={{ width: `${stats.happiness}%` }} />
              </div>
              <span className="text-sm font-black text-stone-100">{stats.happiness}%</span>
            </div>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-amber-500 uppercase font-black tracking-[0.2em] mb-1">Sun Dial</span>
            <span className="text-2xl font-black text-white font-mono tracking-tighter">{formatTime(stats.time)}</span>
          </div>
          <button 
            onClick={() => setShowAdvisor(true)}
            className="ml-6 px-8 py-4 bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl border border-amber-300/30 active:scale-95"
          >
            Summon Wizard
          </button>
        </div>

        {/* Meters */}
        <div className="flex flex-col gap-4">
          <div className="bg-stone-900/90 border-2 border-amber-600/40 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl space-y-6 w-64 ring-1 ring-white/10">
            <Meter label="Mana Reserves" current={stats.manaUsage} supply={stats.manaSupply} color="fuchsia" />
            <Meter label="Essence Reserves" current={stats.essenceUsage} supply={stats.essenceSupply} color="blue" />
          </div>
          <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-2xl flex justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 ring-1 ring-white/10 backdrop-blur-sm">
             <span className="flex items-center gap-2">📜 Cycle {stats.day}</span>
             <span className="text-stone-700">|</span>
             <span className="text-stone-100">Subjects: {stats.population.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {currentGoal && <QuestTracker goal={currentGoal} stats={stats} grid={grid} />}

      {showAdvisor && <AdvisorPanel stats={stats} grid={grid} onClose={() => setShowAdvisor(false)} />}

      {/* Building Tools */}
      <div className="flex justify-between items-end pointer-events-auto gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 ml-6 mb-1">
             <div className="text-[10px] text-amber-500/80 font-black uppercase tracking-[0.4em] drop-shadow-sm">Royal Architect's Satchel</div>
             <div className="h-px w-20 bg-amber-500/20"></div>
             <div className="text-[9px] text-stone-500 font-bold uppercase tracking-widest italic">Right-Click Map to Banish Selection</div>
          </div>
          <div className="flex gap-3 bg-stone-900/95 p-5 rounded-[3rem] border-2 border-amber-900/40 shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-x-auto no-scrollbar max-w-[88vw] backdrop-blur-3xl ring-1 ring-white/5">
            {Object.values(BuildingType).map(type => {
              const config = BUILDINGS[type as BuildingType];
              if (!config || type === BuildingType.Upgrade) return null;
              const isSelected = selectedTool === type;
              const hint = shortcutHints[type];

              return (
                <div key={type} className="relative group">
                  <button 
                    onMouseEnter={() => setHoveredBuilding(type as BuildingType)}
                    onMouseLeave={() => setHoveredBuilding(null)}
                    onClick={() => onSelectTool(type)}
                    className={`flex-shrink-0 w-24 h-28 rounded-3xl border-2 flex flex-col items-center justify-center transition-all relative ${isSelected ? 'border-amber-400 bg-amber-500/20 scale-105 shadow-[0_0_35px_rgba(251,191,36,0.4)] ring-2 ring-amber-400/20' : 'border-stone-800 bg-stone-950/40 hover:bg-stone-800/80 hover:border-stone-600 hover:scale-[1.04]'}`}
                  >
                    {hint && <span className="absolute top-2 right-3 text-[9px] font-black text-amber-500/40">{hint}</span>}
                    <div className="w-8 h-8 rounded-xl mb-3 shadow-xl transition-transform group-hover:scale-110" style={{ background: config.color }} />
                    <span className="text-[10px] font-black text-stone-100 uppercase truncate px-2 w-full text-center tracking-tight">{config.name}</span>
                    {config.cost > 0 && <span className="text-[9px] text-amber-500/70 font-bold mt-1.5">{config.cost}g</span>}
                  </button>
                  {hoveredBuilding === type && <BuildingTooltip config={config} />}
                </div>
              );
            })}
            <div className="w-px h-16 self-center bg-white/5 mx-3" />
            <div className="relative">
              <button 
                onMouseEnter={() => setHoveredBuilding(BuildingType.Upgrade)}
                onMouseLeave={() => setHoveredBuilding(null)}
                onClick={() => onSelectTool(BuildingType.Upgrade)}
                className={`flex-shrink-0 w-24 h-28 rounded-3xl border-2 flex flex-col items-center justify-center transition-all ${selectedTool === BuildingType.Upgrade ? 'border-fuchsia-400 bg-fuchsia-500/20 scale-105 shadow-[0_0_35px_rgba(192,132,252,0.4)]' : 'border-stone-800 bg-stone-950/40 hover:bg-stone-800'}`}
              >
                <span className="absolute top-2 right-3 text-[9px] font-black text-fuchsia-500/40">E</span>
                <div className="w-10 h-10 rounded-full bg-fuchsia-600 mb-3 shadow-2xl flex items-center justify-center text-sm animate-pulse border-2 border-fuchsia-400/30">✨</div>
                <span className="text-[10px] font-black text-stone-100 uppercase tracking-tight">Enhance</span>
              </button>
              {hoveredBuilding === BuildingType.Upgrade && <BuildingTooltip config={BUILDINGS[BuildingType.Upgrade]} />}
            </div>
          </div>
        </div>

        {/* Scroll of News */}
        <div className="w-80 h-64 bg-stone-900/95 border-2 border-amber-900/60 rounded-[2.5rem] p-7 overflow-y-auto no-scrollbar shadow-[0_20px_60px_rgba(0,0,0,0.7)] relative ring-1 ring-white/5">
           <div className="sticky top-0 bg-stone-900/95 backdrop-blur-md border-b border-amber-900/10 pb-3 mb-4 text-amber-600 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
             <span className="text-lg">📜</span> Kingdom Chronicles
           </div>
           <div className="space-y-5">
             {newsFeed.length === 0 && <div className="text-stone-600 italic text-xs text-center py-10 px-4 leading-relaxed">The realm sleeps in peaceful silence, waiting for thy hand to guide its fate...</div>}
             {newsFeed.map((news: any) => (
               <div key={news.id} className={`pl-4 border-l-2 transition-all hover:translate-x-1 ${news.type === 'urgent' ? 'border-rose-500 text-rose-200' : news.type === 'positive' ? 'border-emerald-500 text-emerald-100' : 'border-amber-700 text-amber-50/70'} text-[12px] leading-relaxed font-serif italic`}>
                 {news.text}
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const Meter = ({ label, current, supply, color }: any) => {
  const percent = supply > 0 ? (current / supply) * 100 : 0;
  return (
    <div className="flex flex-col gap-2.5">
       <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-amber-500/80">
         <span className="text-stone-400">{label}</span>
         <span className={`font-mono ${percent > 90 ? 'text-rose-400 animate-pulse font-black' : 'text-stone-200'}`}>{Math.floor(current)} / {Math.floor(supply)}</span>
       </div>
       <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner ring-1 ring-stone-800">
         <div 
           className={`h-full transition-all duration-1000 rounded-full ${percent > 90 ? 'bg-rose-500' : percent > 75 ? 'bg-amber-500' : `bg-${color}-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]`}`} 
           style={{ width: `${Math.min(100, percent)}%` }} 
         />
       </div>
    </div>
  );
};

export default UIOverlay;
