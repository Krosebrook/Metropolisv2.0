
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { BuildingConfig, BuildingType } from './types';

export const GRID_SIZE = 15;
export const MAX_LEVEL = 3;
export const TICK_RATE_MS = 2500;
export const INITIAL_MONEY = 1500;

export const BUILDINGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.None]: {
    type: BuildingType.None, cost: 0, name: 'Bulldoze', description: 'Clear tile', color: '#ef4444', popGen: 0, incomeGen: 0, powerReq: 0, waterReq: 0
  },
  [BuildingType.Upgrade]: {
    type: BuildingType.Upgrade, cost: 0, name: 'Upgrade', description: 'Level up', color: '#a855f7', popGen: 0, incomeGen: 0, powerReq: 0, waterReq: 0
  },
  [BuildingType.Road]: {
    type: BuildingType.Road, cost: 10, name: 'Road', description: 'Connects city', color: '#374151', popGen: 0, incomeGen: 0, powerReq: 0, waterReq: 0
  },
  [BuildingType.Residential]: {
    type: BuildingType.Residential, cost: 100, name: 'House', description: '+Pop', color: '#f87171', popGen: 5, incomeGen: 0, powerReq: 1, waterReq: 1
  },
  [BuildingType.Commercial]: {
    type: BuildingType.Commercial, cost: 250, name: 'Shop', description: '+$$', color: '#60a5fa', popGen: 0, incomeGen: 20, powerReq: 2, waterReq: 1
  },
  [BuildingType.Industrial]: {
    type: BuildingType.Industrial, cost: 500, name: 'Factory', description: '++$$', color: '#facc15', popGen: 0, incomeGen: 50, powerReq: 5, waterReq: 3
  },
  [BuildingType.Park]: {
    type: BuildingType.Park, cost: 150, name: 'Park', description: '+Happy', color: '#4ade80', popGen: 1, incomeGen: 0, powerReq: 0, waterReq: 2
  },
  [BuildingType.PowerPlant]: {
    type: BuildingType.PowerPlant, cost: 800, name: 'Power', description: '+50 Power', color: '#fb923c', popGen: 0, incomeGen: -20, powerReq: 0, waterReq: 2, isUtility: true
  },
  [BuildingType.WaterTower]: {
    type: BuildingType.WaterTower, cost: 600, name: 'Water', description: '+50 Water', color: '#38bdf8', popGen: 0, incomeGen: -15, powerReq: 2, waterReq: 0, isUtility: true
  },
  [BuildingType.Landmark]: {
    type: BuildingType.Landmark, cost: 2500, name: 'Monolith', description: 'High Prestige', color: '#e879f9', popGen: 0, incomeGen: 100, powerReq: 10, waterReq: 5
  },
};
