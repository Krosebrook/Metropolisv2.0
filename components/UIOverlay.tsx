
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { BuildingType } from '../types';
import { BUILDINGS } from '../constants';
import AdvisorPanel from './AdvisorPanel';

const UIOverlay = ({ stats, selectedTool, onSelectTool, newsFeed, grid }: any) => {
  const [showAdvisor, setShowAdvisor] = useState(false);
  
  const formatTime = (t: number) => {
    const hours = Math.floor(t);
    const mins = Math.floor((t % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const netIncome = stats.incomeTotal - stats.maintenanceTotal;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-20 font-serif">
      {/* Top Bar: Royal Treasury */}
      <div className="flex justify-between items-start pointer-events-auto gap-4">
        <div className="bg-stone-900/95 border-2 border-amber-600/50 p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl flex gap-8 items-center border-b-4">
          <div className="flex flex-col">
            <span className="text-[11px] text-amber-500 uppercase font-black tracking-[0.2em]">Royal Gold</span>
            <div className="flex items-baseline gap-2">
               <span className={`text-3xl font-black font-serif ${stats.money < 0 ? 'text-rose-500' : 'text-amber-400'}`}>
                 {stats.money.toLocaleString()}g
               </span>
               <span className={`text-xs font-bold ${netIncome >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                 {netIncome >= 0 ? '+' : ''}{netIncome}/tick
               </span>
            </div>
          </div>
          <div className="w-px h-12 bg-stone-700" />
          <div className="flex flex-col">
            <span className="text-[11px] text-amber-500 uppercase font-black tracking-[0.2em]">Kingdom Joy</span>
            <div className="flex items-center gap-3">
              <div className="w-28 h-4 bg-stone-800 rounded-full overflow-hidden border border-stone-700 shadow-inner">
                <div className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-500 transition-all duration-1000" style={{ width: `${stats.happiness}%` }} />
              </div>
              <span className="text-sm font-black text-stone-100">{stats.happiness}%</span>
            </div>
          </div>
          <div className="w-px h-12 bg-stone-700" />
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-amber-500 uppercase font-black tracking-[0.2em]">Sun Dial</span>
            <span className="text-xl font-black text-white font-mono">{formatTime(stats.time)}</span>
          </div>
          
          <button 
            onClick={() => setShowAdvisor(true)}
            className="ml-4 px-6 py-3 bg-amber-700 hover:bg-amber-600 text-amber-50 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-900/40 border border-amber-500/30"
          >
            Summon Wizard
          </button>
        </div>

        {/* Magical Meters */}
        <div className="flex flex-col gap-3">
          <div className="bg-stone-900/90 border-2 border-amber-600/40 p-5 rounded-2xl shadow-2xl backdrop-blur-xl space-y-5 w-60">
            <Meter label="Mana Flow" current={stats.manaUsage} supply={stats.manaSupply} color="fuchsia" />
            <Meter label="Essence Flow" current={stats.essenceUsage} supply={stats.essenceSupply} color="blue" />
          </div>
          
          <div className="bg-stone-900/90 border border-stone-700 p-3 rounded-xl flex justify-center gap-4 text-[11px] font-black uppercase tracking-widest text-amber-600">
             <span>Cycle {stats.day}</span>
             <span className="text-stone-700">|</span>
             <span className="text-stone-100">Subjects: {stats.population.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {showAdvisor && <AdvisorPanel stats={stats} grid={grid} onClose={() => setShowAdvisor(false)} />}

      {/* Bottom Builder Interface */}
      <div className="flex justify-between items-end pointer-events-auto gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 bg-stone-950/95 p-4 rounded-3xl border-2 border-amber-900/50 shadow-2xl overflow-x-auto no-scrollbar max-w-[85vw] backdrop-blur-md">
            {Object.values(BuildingType).map(type => {
              const config = BUILDINGS[type as BuildingType];
              if (!config || type === BuildingType.Upgrade) return null;
              
              const isSelected = selectedTool === type;
              return (
                <button 
                  key={type}
                  onClick={() => onSelectTool(type)}
                  className={`flex-shrink-0 w-20 h-24 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${isSelected ? 'border-amber-400 bg-amber-500/10 scale-105 shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'border-stone-800 bg-stone-900 hover:border-stone-700'}`}
                >
                  <div className="w-6 h-6 rounded-md mb-2 shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ background: config.color }} />
                  <span className="text-[10px] font-black text-stone-200 uppercase truncate px-1 w-full text-center leading-tight">{config.name}</span>
                  {config.cost > 0 && <span className="text-[9px] text-amber-500 font-bold mt-1">{config.cost}g</span>}
                </button>
              );
            })}
            
            <div className="w-px h-16 self-center bg-stone-800 mx-2" />
            
            <button 
              onClick={() => onSelectTool(BuildingType.Upgrade)}
              className={`flex-shrink-0 w-20 h-24 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${selectedTool === BuildingType.Upgrade ? 'border-fuchsia-400 bg-fuchsia-500/10 scale-105' : 'border-stone-800 bg-stone-900 hover:border-stone-700'}`}
            >
              <div className="w-7 h-7 rounded-full bg-fuchsia-600 mb-2 shadow-lg flex items-center justify-center text-[12px] font-bold text-white">✨</div>
              <span className="text-[10px] font-black text-stone-200 uppercase leading-tight">Enhance</span>
            </button>
          </div>
        </div>

        {/* Royal Scrolls (News Feed) */}
        <div className="w-80 h-52 bg-[#2d241c] rounded-2xl border-2 border-amber-900/80 p-5 overflow-y-auto no-scrollbar shadow-[0_0_50px_rgba(0,0,0,0.6)] relative">
           <div className="sticky top-0 bg-[#2d241c]/90 backdrop-blur-sm border-b border-amber-900/40 pb-2 mb-3 text-amber-600 font-black uppercase tracking-[0.2em] text-[10px]">Royal Scrolls</div>
           <div className="space-y-4">
             {newsFeed.length === 0 && <div className="text-stone-600 italic text-xs">The kingdom is quiet...</div>}
             {newsFeed.map((news: any) => (
               <div key={news.id} className={`pl-3 border-l-2 ${news.type === 'urgent' ? 'border-rose-600 text-rose-300 animate-pulse' : news.type === 'positive' ? 'border-emerald-600 text-emerald-300' : 'border-amber-900 text-amber-200/70'} text-[12px] leading-snug font-serif italic`}>
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
    <div className="flex flex-col gap-2">
       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-amber-500">
         <span className="text-stone-400">{label}</span>
         <span className={percent > 90 ? 'text-rose-400 animate-pulse' : ''}>{current}/{supply}</span>
       </div>
       <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800 shadow-inner">
         <div 
           className={`h-full transition-all duration-700 ${percent > 90 ? 'bg-rose-600' : percent > 75 ? 'bg-amber-600' : `bg-${color}-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]`}`} 
           style={{ width: `${Math.min(100, percent)}%` }} 
         />
       </div>
    </div>
  );
};

export default UIOverlay;
