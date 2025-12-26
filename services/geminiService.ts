
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";
import { AIGoal, BuildingType, CityStats, Grid, NewsItem } from "../types";
import { BUILDINGS } from "../constants";

const modelId = 'gemini-3-flash-preview';

const goalSchema = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "A mystical, fairytale-themed description of the quest or kingdom goal.",
    },
    targetType: {
      type: Type.STRING,
      description: "Must be: population, money, building_count.",
    },
    targetValue: {
      type: Type.INTEGER,
      description: "Target numeric value.",
    },
    buildingType: {
      type: Type.STRING,
      description: "Used if targetType is building_count.",
    },
    reward: {
      type: Type.INTEGER,
      description: "Gold reward for completion.",
    },
  },
  required: ['description', 'targetType', 'targetValue', 'reward'],
};

export const generateCityGoal = async (stats: CityStats, grid: Grid): Promise<AIGoal | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const counts: Record<string, number> = {};
  grid.flat().forEach(tile => {
    counts[tile.buildingType] = (counts[tile.buildingType] || 0) + 1;
  });

  const context = `
    Realm Stats:
    Day: ${stats.day}
    Gold: ${stats.money}g
    Subjects: ${stats.population}
    Structures: ${JSON.stringify(counts)}
  `;

  const prompt = `You are the Royal Wizard. Generate a mystical 'Quest' for the player. Use high-fantasy language. Return JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `${context}\n${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: goalSchema,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return { ...data, completed: false };
    }
  } catch (error) { console.error(error); }
  return null;
};

const newsSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING, description: "A fairytale headline (e.g., 'Dragon spotted near tavern')." },
    type: { type: Type.STRING, description: "positive, negative, neutral." },
  },
  required: ['text', 'type'],
};

export const generateNewsEvent = async (stats: CityStats, recentAction: string | null): Promise<NewsItem | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const context = `Kingdom - Subjects: ${stats.population}, Gold: ${stats.money}, Day: ${stats.day}.`;
  const prompt = "Generate a one-sentence news scroll for a fairytale kingdom. Use whimsical or mystical language.";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `${context}\n${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: newsSchema,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return {
        id: Math.random().toString(),
        text: data.text,
        type: data.type,
      };
    }
  } catch (error) { console.error(error); }
  return null;
};
