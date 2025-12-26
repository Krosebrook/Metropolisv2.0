
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export enum BuildingType {
  None = 'None',
  Road = 'Cobblestone',
  Residential = 'Cottage',
  Commercial = 'Tavern',
  Industrial = 'Mine',
  Park = 'EnchantedForest',
  PowerPlant = 'WizardTower', // Magic Source
  WaterTower = 'AncientWell',   // Essence Source
  Landmark = 'GreatCastle',
  Upgrade = 'Enhance',
  // Services
  PoliceStation = 'GuardPost',
  FireStation = 'MageSanctum',
  School = 'AlchemyAcademy',
}

export interface BuildingConfig {
  type: BuildingType;
  cost: number;
  maintenance: number; 
  name: string;
  description: string;
  color: string;
  popGen: number;
  incomeGen: number;
  manaReq: number;   // Replaced powerReq
  essenceReq: number; // Replaced waterReq
  serviceRadius?: number;
  isUtility?: boolean;
}

export interface TileData {
  x: number;
  y: number;
  buildingType: BuildingType;
  level: number;
  hasMana: boolean;   // Replaced hasPower
  hasEssence: boolean; // Replaced hasWater
  hasGuards: boolean;  // Replaced hasPolice
  hasMagicSafety: boolean; // Replaced hasFire
  hasWisdom: boolean;  // Replaced hasSchool
  happiness: number; 
}

export type Grid = TileData[][];

export interface CityStats {
  money: number; // Gold
  population: number; // Subjects
  day: number;
  happiness: number;
  manaSupply: number;
  essenceSupply: number;
  manaUsage: number;
  essenceUsage: number;
  maintenanceTotal: number;
  incomeTotal: number;
  weather: 'clear' | 'rain' | 'storm';
  time: number;
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
