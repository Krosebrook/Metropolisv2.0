
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CityStats, Grid } from '../types';

interface AdvisorPanelProps {
  stats: CityStats;
  grid: Grid;
  onClose: () => void;
}

const AdvisorPanel: React.FC<AdvisorPanelProps> = ({ stats, grid, onClose }) => {
  const [response, setResponse] = useState<string>('Summoning the Royal Wizard...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeRealm = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const buildings = grid.flat().filter(t => t.buildingType !== 'None');
      const buildingCounts = buildings.reduce((acc, b) => {
        acc[b.buildingType] = (acc[b.buildingType] || 0) + 1;
        return acc;
      }, {} as any);

      const prompt = `
        You are the Ancient Royal Wizard and Grand Advisor to the Crown. 
        Analyze the state of FableRealm and provide 3-4 magical prophecies or strategic decrees.
        
        Kingdom State:
        - Gold in Treasury: ${stats.money}g (Gain: ${stats.incomeTotal}/tick, Upkeep: ${stats.maintenanceTotal}/tick)
        - Loyal Subjects: ${stats.population}
        - Public Mood: ${stats.happiness}%
        - Mana Reserves: ${stats.manaUsage}/${stats.manaSupply}
        - Essence Reserves: ${stats.essenceUsage}/${stats.essenceSupply}
        - Kingdom Structures: ${JSON.stringify(buildingCounts)}
        
        Address specific magical catastrophes such as Mana droughts, lack of Guard Posts or Mage Sanctums, or poor placement of Mines near Cottages.
        Keep your tone mystical, authoritative, and helpful. Use words like "Sire", "Kingdom", "Mana", and "Decree".
      `;

      try {
        const result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        setResponse(result.text || "The crystal ball is clouded. Ensure your tribute (API Key) is valid.");
      } catch (e) {
        setResponse("A dark force blocks our magical communication. Check your connectivity spells.");
      } finally {
        setLoading(false);
      }
    };

    analyzeRealm();
  }, [stats, grid]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-stone-950/80 backdrop-blur-xl pointer-events-auto">
      <div className="w-full max-w-xl bg-[#1c1917] border-2 border-amber-800/80 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500 font-serif">
        <div className="p-8 border-b border-amber-900/40 flex justify-between items-center bg-fuchsia-950/20">
          <div>
            <h3 className="text-2xl font-black text-amber-100 italic tracking-tight">Royal Wizard Diagnostic</h3>
            <p className="text-[10px] text-fuchsia-400 font-bold tracking-[0.3em] uppercase">Ethereal Connection Established</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 hover:bg-stone-800 rounded-full transition-colors text-amber-600 flex items-center justify-center text-xl">✕</button>
        </div>
        
        <div className="p-10 flex-1 overflow-y-auto no-scrollbar font-serif">
          {loading ? (
            <div className="space-y-6">
              <div className="h-4 bg-stone-800 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-stone-800 rounded animate-pulse w-full" />
              <div className="h-4 bg-stone-800 rounded animate-pulse w-5/6" />
            </div>
          ) : (
            <div className="text-amber-100/90 leading-relaxed text-lg whitespace-pre-wrap italic">
              {response}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-amber-900/40 bg-stone-950/50 flex justify-center">
          <button 
            onClick={onClose}
            className="px-12 py-4 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-50 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl"
          >
            I Heed Thy Word
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvisorPanel;
