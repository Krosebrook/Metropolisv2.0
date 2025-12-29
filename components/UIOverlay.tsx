
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

const BuildingTooltip = ({ config }: { config: BuildingConfig }) => {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 w-80 bg-stone-950/98 border-2 border-amber-500/80 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-3xl pointer-events-none z-[70] overflow-hidden ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200 origin-bottom">
      <div className="bg-gradient-to-br from-amber-900/40 to-stone-950 p-6 border-b border-amber-500/20">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-white font-black uppercase text-xl tracking-tight drop-shadow-md leading-tight">{config.name}</h4>
          <span className="bg-amber-400 text-stone-950 px-2.5 py-1 rounded-lg font-black text-[10px] whitespace-nowrap shadow-md">{config.cost}G</span>
        </div>
        <p className="text-amber-100/70 text-xs leading-relaxed italic">"{config.description}"</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {config.popGen > 0 && (
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
              <StatIcon type="pop" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-stone-50">+{config.popGen}</span>
                <span className="text-[7px] text-stone-500 font-black uppercase tracking-tighter">Subjects</span>
              </div>
            </div>
          )}
          {config.incomeGen > 0 && (
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
              <StatIcon type="gold" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-emerald-400">+{config.incomeGen}</span>
                <span className="text-[7px] text-stone-500 font-black uppercase tracking-tighter">Gold</span>
              </div>
            </div>
          )}
          {config.maintenance > 0 && (
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
              <StatIcon type="upkeep" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-rose-400">-{config.maintenance}</span>
                <span className="text-[7px] text-stone-500 font-black uppercase tracking-tighter">Upkeep</span>
              </div>
            </div>
          )}
          {config.serviceRadius && (
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
              <StatIcon type="range" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-sky-400">{config.serviceRadius}</span>
                <span className="text-[7px] text-stone-500 font-black uppercase tracking-tighter">Reach</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UIOverlay = ({ stats, selectedTool, onSelectTool, newsFeed, grid, currentGoal, onPanelStateChange }: any) => {
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingType | null>(null);
  
  useEffect(() => { onPanelStateChange(showAdvisor); }, [showAdvisor, onPanelStateChange]);

  const formatTime = (t: number) => {
    const hours = Math.floor(t);
    const mins = Math.floor((t % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const netIncome = stats.incomeTotal - stats.maintenanceTotal;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-20 font-serif">
      <div className="flex justify-between items-start pointer-events-auto gap-4">
        <div className="bg-stone-950/95 border-2 border-amber-600/60 p-8 rounded-[3rem] shadow-2xl backdrop-blur-3xl flex gap-12 items-center ring-1 ring-white/10">
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-500 uppercase font-black tracking-[0.3em] mb-1">Treasury</span>
            <div className="flex items-baseline gap-3">
               <span className={`text-5xl font-black ${stats.money < 0 ? 'text-rose-500' : 'text-amber-400'}`}>
                 {stats.money.toLocaleString()}g
               </span>
               <span className={`text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-tighter ${netIncome >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                 {netIncome >= 0 ? '+' : ''}{netIncome}/tick
               </span>
            </div>
          </div>
          <div className="w-px h-16 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-500 uppercase font-black tracking-[0.3em] mb-1">Public Joy</span>
            <div className="flex items-center gap-6">
              <div className="w-40 h-6 bg-stone-950 rounded-full overflow-hidden ring-2 ring-stone-900 p-1">
                <div className="h-full bg-gradient-to-r from-rose-600 via-amber-400 to-emerald-500 transition-all duration-1000 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.3)]" style={{ width: `${stats.happiness}%` }} />
              </div>
              <span className="text-xl font-black text-stone-100">{stats.happiness}%</span>
            </div>
          </div>
          <div className="w-px h-16 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-500 uppercase font-black tracking-[0.3em] mb-1">Sun Dial</span>
            <span className="text-3xl font-black text-white font-mono tracking-tighter">{formatTime(stats.time)}</span>
          </div>
          <button onClick={() => setShowAdvisor(true)} className="ml-8 px-10 py-5 bg-gradient-to-b from-amber-500 to-amber-700 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]">Advisor</button>
        </div>
      </div>

      <div className="flex justify-between items-end pointer-events-auto gap-4">
        <div className="flex flex-col gap-6 max-w-[75vw]">
          <div className="flex items-center gap-4 ml-8 mb-1">
             <div className="text-[11px] text-amber-400 font-black uppercase tracking-[0.5em] underline decoration-amber-500/30 underline-offset-8">Architect's Satchel</div>
             <div className="text-[9px] text-stone-500 font-bold uppercase tracking-widest italic opacity-70">Right-Click to Banish</div>
          </div>
          <div className="flex gap-4 bg-stone-950/98 p-6 rounded-[3.5rem] border-2 border-amber-900/40 shadow-[0_35px_100px_rgba(0,0,0,1)] overflow-x-auto no-scrollbar backdrop-blur-3xl ring-1 ring-white/10">
            {Object.values(BuildingType).map(type => {
              const config = BUILDINGS[type as BuildingType];
              if (!config || type === BuildingType.Upgrade) return null;
              const isSelected = selectedTool === type;

              return (
                <div key={type} className="relative group flex-shrink-0">
                  <button 
                    onMouseEnter={() => setHoveredBuilding(type as BuildingType)}
                    onMouseLeave={() => setHoveredBuilding(null)}
                    onClick={() => onSelectTool(type)}
                    className={`flex flex-col items-center justify-center w-28 h-32 rounded-[2.5rem] border-2 transition-all relative ${isSelected ? 'border-amber-400 bg-amber-500/20 scale-110 shadow-[0_0_30px_rgba(251,191,36,0.3)] z-10' : 'border-stone-800 bg-stone-900/40 hover:bg-stone-800 hover:border-stone-600 hover:scale-105'}`}
                  >
                    <div className="w-10 h-10 rounded-2xl mb-4 shadow-xl transition-transform group-hover:scale-110" style={{ background: config.color }} />
                    <span className="text-[10px] font-black text-amber-50 uppercase tracking-tighter px-2 text-center leading-none group-hover:text-white transition-colors">{config.name}</span>
                    {config.cost > 0 && <span className="text-[10px] text-amber-500 font-black mt-2">{config.cost}g</span>}
                  </button>
                  {hoveredBuilding === type && <BuildingTooltip config={config} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {showAdvisor && <AdvisorPanel stats={stats} grid={grid} onClose={() => setShowAdvisor(false)} />}
    </div>
  );
};

const Meter = ({ label, current, supply, color }: any) => {
  const percent = supply > 0 ? (current / supply) * 100 : 0;
  return (
    <div className="flex flex-col gap-3.5">
       <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-amber-500/90">
         <span className="text-stone-500">{label}</span>
         <span className={`font-mono text-xs ${percent > 90 ? 'text-rose-400 animate-pulse' : 'text-stone-300'}`}>{Math.floor(current)} / {Math.floor(supply)}</span>
       </div>
       <div className="w-full h-4 bg-stone-950 rounded-full overflow-hidden ring-2 ring-stone-900">
         <div className={`h-full transition-all duration-1000 rounded-full bg-${color}-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]`} style={{ width: `${Math.min(100, percent)}%` }} />
       </div>
    </div>
  );
};

export default UIOverlay;
