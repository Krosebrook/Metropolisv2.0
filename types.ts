
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
  // New Buildings
  LumberMill = 'LumberMill',
  Bakery = 'Bakery',
  Library = 'GreatLibrary',
  LuminaBloom = 'LuminaBloom',
  Windmill = 'Windmill',
  MarketSquare = 'MarketSquare',
  MagicAcademy = 'MagicAcademy',
  GrandObservatory = 'GrandObservatory',
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
  manaReq: number;   
  essenceReq: number; 
  serviceRadius?: number;
  isUtility?: boolean;
}

export interface TileData {
  x: number;
  y: number;
  buildingType: BuildingType;
  level: number;
  hasMana: boolean;   
  hasEssence: boolean; 
  hasGuards: boolean;  
  hasMagicSafety: boolean; 
  hasWisdom: boolean;  
  happiness: number; 
  lastUpgraded?: number;
  variant?: number;
}

export type Grid = TileData[][];

export interface CityStats {
  money: number; 
  population: number; 
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
  taxRate: number; // New: To allow fiscal management refactor
}

export interface AIGoal {
  id: string;
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
  timestamp: number;
}
