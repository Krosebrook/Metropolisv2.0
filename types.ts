
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export enum BuildingType {
  None = 'None',
  Road = 'Road',
  Residential = 'Residential',
  Commercial = 'Commercial',
  Industrial = 'Industrial',
  Park = 'Park',
  PowerPlant = 'PowerPlant',
  WaterTower = 'WaterTower',
  Landmark = 'Landmark',
  Upgrade = 'Upgrade',
}

export interface BuildingConfig {
  type: BuildingType;
  cost: number;
  name: string;
  description: string;
  color: string;
  popGen: number;
  incomeGen: number;
  powerReq: number;
  waterReq: number;
  isUtility?: boolean;
}

export interface TileData {
  x: number;
  y: number;
  buildingType: BuildingType;
  level: number;
  hasPower: boolean;
  hasWater: boolean;
  happiness: number; // 0 to 100
}

export type Grid = TileData[][];

export interface CityStats {
  money: number;
  population: number;
  day: number;
  happiness: number;
  powerSupply: number;
  waterSupply: number;
  powerUsage: number;
  waterUsage: number;
  weather: 'clear' | 'rain' | 'storm';
  time: number; // 0 to 24
}

export interface AIGoal {
  description: string;
  targetType: 'population' | 'money' | 'building_count' | 'happiness';
  targetValue: number;
  buildingType?: BuildingType;
  reward: number;
  completed: boolean;
}

export interface NewsItem {
  id: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral' | 'urgent';
}

export interface SaveData {
  grid: Grid;
  stats: CityStats;
  day: number;
}
