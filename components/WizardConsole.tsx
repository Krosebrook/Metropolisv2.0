
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CityStats, Grid } from '../types';

interface WizardConsoleProps {
  stats: CityStats;
  grid: Grid;
  onCommand: (cmd: string, args: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const WizardConsole: React.FC<WizardConsoleProps> = ({ stats, grid, onCommand, isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>(['FableRealm OS v2.4.0', 'Type "help" for a list of magic incantations.']);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const scry = async (query: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    setHistory(prev => [...prev, `> Scrying the ethereal planes for: "${query}"...`]);
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are the Wizard's Grimoire Terminal. Answer the user's scrying query about the game world or their current kingdom state. 
        Current Gold: ${stats.money}g, Pop: ${stats.population}.
        Query: ${query}`,
      });
      setHistory(prev => [...prev, `[Grimoire]: ${response.text}`]);
    } catch (e) {
      setHistory(prev => [...prev, `[Error]: The connection to the ethereal plane was severed.`]);
    }
  };

  const handleInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const parts = input.trim().split(' ');
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      setHistory(prev => [...prev, `> ${input}`]);

      if (cmd === 'help') {
        setHistory(prev => [...prev, 'Available: scry [query], gift [gold], rain [type], stats, clear, exit']);
      } else if (cmd === 'scry') {
        scry(args.join(' '));
      } else if (cmd === 'clear') {
        setHistory([]);
      } else if (cmd === 'exit') {
        onClose();
      } else if (cmd === 'stats') {
        setHistory(prev => [...prev, JSON.stringify({ gold: stats.money, pop: stats.population, day: stats.day }, null, 2)]);
      } else {
        onCommand(cmd, args);
      }
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 font-mono text-emerald-500 p-8 flex flex-col backdrop-blur-md">
      <div className="flex justify-between items-center mb-4 border-b border-emerald-900 pb-2">
        <span className="text-xs uppercase tracking-widest font-bold opacity-50">Wizard's Grimoire Console</span>
        <button onClick={onClose} className="hover:text-white">EXIT_SESSION</button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar mb-4 space-y-1 text-sm">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <span className="animate-pulse">_</span>
        <input
          autoFocus
          className="bg-transparent border-none outline-none flex-1 text-emerald-400"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInput}
          placeholder="Enter incantation..."
        />
      </div>
    </div>
  );
};

export default WizardConsole;
