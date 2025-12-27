
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";
import { AIGoal, BuildingType, CityStats, Grid, NewsItem } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

const goalSchema = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "A mystical, fairytale-themed description of the quest.",
    },
    targetType: {
      type: Type.STRING,
      enum: ["population", "money", "building_count", "happiness"],
      description: "The metric the player must reach.",
    },
    targetValue: {
      type: Type.INTEGER,
      description: "Target numeric value.",
    },
    buildingType: {
      type: Type.STRING,
      description: "Required building type if targetType is building_count.",
    },
    reward: {
      type: Type.INTEGER,
      description: "Gold reward for completion.",
    },
  },
  required: ['description', 'targetType', 'targetValue', 'reward'],
};

const newsSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING, description: "A whimsical fairytale headline." },
    type: { type: Type.STRING, enum: ["positive", "negative", "neutral", "urgent"] },
  },
  required: ['text', 'type'],
};

/**
 * Generates a mystical quest from the Royal Wizard
 */
export const generateCityGoal = async (stats: CityStats, grid: Grid): Promise<AIGoal | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const counts: Record<string, number> = {};
  grid.flat().forEach(tile => {
    if (tile.buildingType !== BuildingType.None) {
      counts[tile.buildingType] = (counts[tile.buildingType] || 0) + 1;
    }
  });

  const prompt = `
    Context:
    Day: ${stats.day}
    Gold: ${stats.money}
    Population: ${stats.population}
    Buildings: ${JSON.stringify(counts)}
    
    You are the Royal Wizard. Create a specific, magical objective for the Sovereign.
    Use epic, high-fantasy language. 
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: goalSchema,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return { 
        ...data, 
        id: Math.random().toString(36).substring(7),
        completed: false 
      };
    }
  } catch (error) {
    console.error("Failed to generate quest:", error);
  }
  return null;
};

/**
 * Generates atmospheric world-building news items
 */
export const generateNewsEvent = async (stats: CityStats, recentAction: string | null): Promise<NewsItem | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Kingdom Snapshot: Pop ${stats.population}, Gold ${stats.money}, Day ${stats.day}.
    Recent Event: ${recentAction || 'The sun rises over the valley.'}
    
    Generate a one-sentence news scroll. It should sound like it's from a magical scroll or herald.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: newsSchema,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return {
        id: Math.random().toString(36).substring(7),
        text: data.text,
        type: data.type,
        timestamp: Date.now()
      };
    }
  } catch (error) {
    console.error("Failed to generate news:", error);
  }
  return null;
};
