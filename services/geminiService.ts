
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
      description: "A mystical, fairytale-themed description of the quest from the Royal Wizard.",
    },
    targetType: {
      type: Type.STRING,
      enum: ["population", "money", "building_count", "happiness"],
      description: "The metric the player must reach.",
    },
    targetValue: {
      type: Type.INTEGER,
      description: "Target numeric value. Keep it challenging but reachable.",
    },
    buildingType: {
      type: Type.STRING,
      enum: Object.values(BuildingType),
      description: "Required building type if targetType is building_count.",
    },
    reward: {
      type: Type.INTEGER,
      description: "Gold reward for completion (typically 500-2000).",
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
    Kingdom Mood: ${stats.happiness}%
    
    You are the Ancient Royal Wizard. Create a specific, magical decree or prophecy for the Sovereign to fulfill.
    Choose one of these goals:
    1. Reach a population threshold.
    2. Reach a treasury gold count.
    3. Construct a certain number of specific buildings (like 3 Taverns or 2 Wizard Towers).
    4. Reach a high happiness level.
    
    The description must be flavorful, high-fantasy, and address the current state of the kingdom.
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
    
    Generate a one-sentence news scroll update for the herald's parchment.
    Keep the tone whimsical and atmospheric.
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
