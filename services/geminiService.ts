
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";
import { AIGoal, BuildingType, CityStats, Grid, NewsItem } from "../types";
import { BUILDINGS } from "../constants";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-3-pro-preview for complex reasoning and city building logic
const modelId = 'gemini-3-pro-preview';

// --- Goal Generation ---

const goalSchema = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "A short, creative description of the goal from the perspective of city council or citizens.",
    },
    targetType: {
      type: Type.STRING,
      description: "The metric to track. Must be one of: population, money, building_count.",
    },
    targetValue: {
      type: Type.INTEGER,
      description: "The target numeric value to reach.",
    },
    buildingType: {
      type: Type.STRING,
      description: "Required if targetType is building_count. Must be one of: Residential, Commercial, Industrial, Park, Road.",
    },
    reward: {
      type: Type.INTEGER,
      description: "Monetary reward for completion.",
    },
  },
  required: ['description', 'targetType', 'targetValue', 'reward'],
};

export const generateCityGoal = async (stats: CityStats, grid: Grid): Promise<AIGoal | null> => {
  // Count buildings
  const counts: Record<string, number> = {};
  grid.flat().forEach(tile => {
    counts[tile.buildingType] = (counts[tile.buildingType] || 0) + 1;
  });

  const context = `
    Current City Stats:
    Day: ${stats.day}
    Money: $${stats.money}
    Population: ${stats.population}
    Buildings: ${JSON.stringify(counts)}
    Building Costs/Stats: ${JSON.stringify(
      Object.values(BUILDINGS).filter(b => b.type !== BuildingType.None).map(b => ({type: b.type, cost: b.cost, pop: b.popGen, income: b.incomeGen}))
    )}
  `;

  const prompt = `You are the AI City Advisor for a simulation game. Based on the current city stats, generate a challenging but achievable short-term goal for the player to help the city grow. Return JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `${context}\n${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: goalSchema,
        temperature: 0.7,
      },
    });

    // Extracting text output from GenerateContentResponse using .text property
    if (response.text) {
      const jsonStr = response.text.trim();
      const goalData = JSON.parse(jsonStr) as Omit<AIGoal, 'completed'>;
      return { ...goalData, completed: false };
    }
  } catch (error) {
    console.error("Error generating goal:", error);
  }
  return null;
};

// --- News Feed Generation ---

const newsSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING, description: "A one-sentence news headline representing life in the city." },
    type: { type: Type.STRING, description: "The type of news. Must be one of: positive, negative, neutral." },
  },
  required: ['text', 'type'],
};

export const generateNewsEvent = async (stats: CityStats, recentAction: string | null): Promise<NewsItem | null> => {
  const context = `City Stats - Pop: ${stats.population}, Money: ${stats.money}, Day: ${stats.day}. ${recentAction ? `Recent Action: ${recentAction}` : ''}`;
  const prompt = "Generate a very short, isometric-sim-city style news headline based on the city state. Can be funny, cynical, or celebratory.";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `${context}\n${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: newsSchema,
        temperature: 1.1,
      },
    });

    // Extracting text output from GenerateContentResponse using .text property
    if (response.text) {
      const jsonStr = response.text.trim();
      const data = JSON.parse(jsonStr);
      return {
        id: Date.now().toString() + Math.random(),
        text: data.text,
        type: data.type,
      };
    }
  } catch (error) {
    console.error("Error generating news:", error);
  }
  return null;
};
