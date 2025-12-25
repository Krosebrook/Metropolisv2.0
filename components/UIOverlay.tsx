
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { BuildingType, CityStats, AIGoal, NewsItem } from '../types';
import { BUILDINGS } from '../constants';

const UIOverlay = ({ stats, selectedTool, onSelectTool, newsFeed, aiEnabled }: any) => {
  const formatTime = (t: number) => {
    const hours = Math.floor(t);
    const mins = Math.floor((t % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
      {/* Top Bar: Stats & Meters */}
      <div className="flex justify-between items-start pointer-events-auto gap-4">
        <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex gap-6 items-center">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Treasury</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">${stats.money.toLocaleString()}</span>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">City Happiness</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 transition-all" style={{ width: `${stats.happiness}%` }} />
              </div>
              <span className="text-xs font-bold text-yellow-200">{stats.happiness}%</span>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Time</span>
            <span className="text-lg font-bold text-white font-mono">{formatTime(stats.time)}</span>
          </div>
        </div>

        {/* Utility Meters */}
        <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl shadow-2xl backdrop-blur-xl space-y-2 w-48">
          <div className="flex flex-col gap-1">
             <div className="flex justify-between text-[8px] uppercase font-bold text-orange-400">
               <span>Power</span>
               <span>{stats.powerUsage}/{stats.powerSupply}</span>
             </div>
             <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-orange-500 transition-all" style={{ width: `${Math.min(100, (stats.powerUsage/stats.powerSupply)*100)}%` }} />
             </div>
          </div>
          <div className="flex flex-col gap-1">
             <div className="flex justify-between text-[8px] uppercase font-bold text-sky-400">
               <span>Water</span>
               <span>{stats.waterUsage}/{stats.waterSupply}</span>
             </div>
             <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-sky-500 transition-all" style={{ width: `${Math.min(100, (stats.waterUsage/stats.waterSupply)*100)}%` }} />
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Tool Bar */}
      <div className="flex justify-between items-end pointer-events-auto gap-4">
        <div className="flex gap-2 bg-slate-950/90 p-2 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl overflow-x-auto no-scrollbar max-w-[70vw]">
          {Object.values(BuildingType).map(type => {
            const config = BUILDINGS[type as BuildingType];
            if (!config) return null;
            return (
              <button 
                key={type}
                onClick={() => onSelectTool(type)}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${selectedTool === type ? 'border-white bg-white/10 scale-105 shadow-lg' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800'}`}
              >
                <div className="w-4 h-4 rounded-sm mb-1 shadow-inner" style={{ background: config.color }} />
                <span className="text-[8px] font-bold text-white uppercase truncate px-1 w-full text-center">{config.name}</span>
                {config.cost > 0 && <span className="text-[8px] text-emerald-400 font-mono">${config.cost}</span>}
              </button>
            );
          })}
        </div>

        {/* News Feed */}
        <div className="w-64 h-40 bg-black/90 rounded-2xl border border-slate-800 p-3 overflow-y-auto no-scrollbar font-mono text-[10px] text-blue-300 shadow-2xl">
           <div className="border-b border-slate-800 pb-1 mb-2 text-slate-500 font-bold uppercase tracking-widest text-[8px]">Metropolis Wireless Ticker</div>
           <div className="space-y-2">
             {newsFeed.map((news: any) => (
               <div key={news.id} className={`pl-2 border-l ${news.type === 'urgent' ? 'border-red-500 text-red-400 animate-pulse' : 'border-blue-500'}`}>
                 {news.text}
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
