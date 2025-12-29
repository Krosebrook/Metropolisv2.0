
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { BuildingType, BuildingConfig, CityStats, Grid } from '../types';
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
          <h4 className="text-white font-black uppercase text-xl tracking-tight leading-tight">{config.name}</h4>
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

interface ToolButtonProps {
  type: BuildingType;
  selected: boolean;
  onClick: () => void;
}

// Fix: typed ToolButton to correctly allow React reserved props like 'key' when mapping
const ToolButton: React.FC<ToolButtonProps> = ({ type, selected, onClick }) => {
  const config = BUILDINGS[type];
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button
        onClick={onClick}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 relative group overflow-hidden ${
          selected 
            ? 'bg-amber-500 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.5)] z-20' 
            : 'bg-stone-900/60 hover:bg-stone-800 border border-white/5 hover:border-white/20'
        }`}
      >
        <div className={`text-2xl transition-transform duration-500 group-hover:scale-125 ${selected ? 'scale-110 drop-shadow-md' : 'opacity-70 group-hover:opacity-100'}`}>
          {getIconForType(type)}
        </div>
        {selected && (
          <div className="absolute inset-0 border-2 border-white/40 rounded-2xl animate-pulse"></div>
        )}
      </button>
      {hovered && <BuildingTooltip config={config} />}
    </div>
  );
};

const getIconForType = (type: BuildingType) => {
  switch (type) {
    case BuildingType.Road: return '🛣️';
    case BuildingType.Residential: return '🏠';
    case BuildingType.Commercial: return '🍻';
    case BuildingType.Industrial: return '⛏️';
    case BuildingType.Park: return '🌳';
    case BuildingType.PowerPlant: return '🔮';
    case BuildingType.WaterTower: return '💧';
    case BuildingType.PoliceStation: return '🛡️';
    case BuildingType.FireStation: return '🔥';
    case BuildingType.School: return '🧪';
    case BuildingType.Landmark: return '🏰';
    case BuildingType.LumberMill: return '🪵';
    case BuildingType.Bakery: return '🥐';
    case BuildingType.Library: return '📜';
    case BuildingType.LuminaBloom: return '🌸';
    case BuildingType.Windmill: return '🌾';
    case BuildingType.MarketSquare: return '⚖️';
    case BuildingType.MagicAcademy: return '🎩';
    case BuildingType.Upgrade: return '✨';
    case BuildingType.None: return '🧹';
    default: return '❓';
  }
};

interface UIOverlayProps {
  stats: CityStats;
  selectedTool: BuildingType;
  onSelectTool: (t: BuildingType) => void;
  currentGoal: any;
  newsFeed: any[];
  grid: Grid;
  onPanelStateChange: (open: boolean) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ stats, selectedTool, onSelectTool, currentGoal, newsFeed, grid, onPanelStateChange }) => {
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('abodes');

  // Fix: Imported and used useEffect to ensure external state stays in sync with local panel state
  useEffect(() => onPanelStateChange(isAdvisorOpen), [isAdvisorOpen, onPanelStateChange]);

  const categories = [
    { id: 'abodes', name: 'Abodes', icon: '🏠', types: [BuildingType.Residential] },
    { id: 'treasury', name: 'Treasury', icon: '💰', types: [BuildingType.Commercial, BuildingType.Industrial, BuildingType.LumberMill, BuildingType.Bakery, BuildingType.Windmill, BuildingType.MarketSquare] },
    { id: 'arcane', name: 'Arcane', icon: '🔮', types: [BuildingType.PowerPlant, BuildingType.WaterTower, BuildingType.LuminaBloom, BuildingType.FireStation] },
    { id: 'society', name: 'Society', icon: '🎓', types: [BuildingType.PoliceStation, BuildingType.School, BuildingType.Library, BuildingType.MagicAcademy, BuildingType.Park] },
    { id: 'monuments', name: 'Relics', icon: '🏰', types: [BuildingType.Landmark] },
    { id: 'tools', name: 'Tools', icon: '⚒️', types: [BuildingType.Road, BuildingType.Upgrade, BuildingType.None] }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col font-serif">
      {/* Top Header */}
      <div className="p-8 flex justify-between items-start bg-gradient-to-b from-stone-950/80 to-transparent">
        <div className="flex gap-6">
          <div className="bg-stone-900/80 border border-white/10 rounded-3xl p-5 backdrop-blur-md shadow-2xl flex gap-8 items-center pointer-events-auto ring-1 ring-white/5">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <StatIcon type="gold" />
                <span className="text-2xl font-black text-amber-50 tracking-tight">{stats.money.toLocaleString()}</span>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${stats.incomeTotal >= stats.maintenanceTotal ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stats.incomeTotal >= stats.maintenanceTotal ? 'Profit' : 'Loss'}: {Math.abs(stats.incomeTotal - stats.maintenanceTotal)}g
              </span>
            </div>
            
            <div className="w-px h-10 bg-white/10" />

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <StatIcon type="pop" />
                <span className="text-2xl font-black text-emerald-50 tracking-tight">{stats.population.toLocaleString()}</span>
              </div>
              <div className="w-24 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${stats.happiness}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Advisor Trigger */}
        <button 
          onClick={() => setIsAdvisorOpen(true)}
          className="pointer-events-auto bg-fuchsia-950/40 hover:bg-fuchsia-900/60 border-2 border-fuchsia-500/40 p-4 rounded-3xl backdrop-blur-md shadow-[0_0_40px_rgba(217,70,239,0.2)] group transition-all"
        >
          <div className="text-3xl animate-pulse group-hover:scale-110 transition-transform">🧙‍♂️</div>
        </button>
      </div>

      {/* Main Toolbelt */}
      <div className="mt-auto p-12 flex flex-col items-center">
        <div className="bg-stone-950/90 border-2 border-white/10 p-2 rounded-[2.5rem] backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] pointer-events-auto flex flex-col items-center min-w-[500px]">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 p-1 bg-white/5 rounded-2xl w-full">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${
                  activeTab === cat.id ? 'bg-amber-500 text-stone-950 shadow-lg' : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Tools Grid */}
          <div className="flex gap-4 p-2 min-h-[70px] items-center">
            {categories.find(c => c.id === activeTab)?.types.map(t => (
              <ToolButton 
                key={t} 
                type={t} 
                selected={selectedTool === t} 
                onClick={() => onSelectTool(t)} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Herald News Scroll (Bottom Right) */}
      <div className="absolute bottom-12 right-12 w-80 space-y-3">
        {newsFeed.slice(0, 3).map((news, i) => (
          <div 
            key={news.id} 
            className="bg-stone-950/80 border border-white/5 p-4 rounded-2xl backdrop-blur-md animate-in slide-in-from-right duration-500 shadow-xl"
            style={{ opacity: 1 - (i * 0.3) }}
          >
            <p className="text-amber-100/90 text-[11px] font-serif leading-relaxed italic">"{news.text}"</p>
          </div>
        ))}
      </div>

      {isAdvisorOpen && <AdvisorPanel stats={stats} grid={grid} onClose={() => setIsAdvisorOpen(false)} />}
    </div>
  );
};

export default UIOverlay;
