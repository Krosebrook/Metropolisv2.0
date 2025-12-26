
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';

interface StartScreenProps {
  onStart: (aiEnabled: boolean) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [aiEnabled, setAiEnabled] = useState(true);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 text-white font-serif p-6 bg-stone-950/60 backdrop-blur-md transition-all duration-1000">
      <div className="max-w-md w-full bg-[#1c1917]/95 p-10 rounded-[2.5rem] border-2 border-amber-900/60 shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden animate-fade-in">
        {/* Magic aura glows */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-amber-600/20 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>
        
        <div className="relative z-10 text-center">
            <h1 className="text-6xl font-black mb-1 bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 bg-clip-text text-transparent tracking-tighter italic">
            FableRealm
            </h1>
            <p className="text-amber-600/70 mb-10 text-[10px] font-black uppercase tracking-[0.4em]">
            Kingdom of Castle & Sorcery
            </p>

            <div className="bg-stone-900/80 p-6 rounded-2xl border border-amber-900/30 mb-10 shadow-inner group transition-all hover:bg-stone-800">
            <label className="flex items-center justify-between cursor-pointer">
                <div className="flex flex-col gap-1 text-left">
                <span className="font-bold text-lg text-amber-100 group-hover:text-amber-400 transition-colors flex items-center gap-2">
                    Royal Wizard Advisor
                    {aiEnabled && <span className="flex h-2 w-2 rounded-full bg-fuchsia-500 animate-ping"></span>}
                </span>
                <span className="text-xs text-stone-500 leading-tight">
                    Receive magical scrolls and quests from the Wizard Council (Gemini)
                </span>
                </div>
                
                <div className="relative flex-shrink-0 ml-4 scale-110">
                <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={aiEnabled}
                    onChange={(e) => setAiEnabled(e.target.checked)}
                />
                <div className="w-12 h-6 bg-stone-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-fuchsia-500/40 peer-checked:after:translate-x-full peer-checked:after:border-amber-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-stone-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-900 peer-checked:after:bg-amber-400"></div>
                </div>
            </label>
            </div>

            <button 
            onClick={() => onStart(aiEnabled)}
            className="w-full py-5 bg-gradient-to-b from-amber-600 to-amber-900 hover:from-amber-500 hover:to-amber-800 text-amber-50 font-black rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform transition-all hover:scale-[1.03] active:scale-[0.98] text-xl tracking-widest uppercase border border-amber-400/30"
            >
            Establish Realm
            </button>

            <div className="mt-10">
                <a 
                    href="#" 
                    className="inline-flex items-center gap-2 text-[10px] text-stone-600 hover:text-amber-500 transition-colors font-serif uppercase tracking-widest"
                >
                    Designed for the Crown
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
