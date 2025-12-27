
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { BuildingConfig, BuildingType } from './types';

export const GRID_SIZE = 25;
export const MAX_LEVEL = 3;
export const TICK_RATE_MS = 2500;
export const INITIAL_MONEY = 3000; // Starting Gold

export const BUILDINGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.None]: {
    type: BuildingType.None, cost: 0, maintenance: 0, name: 'Banish', description: 'Clear tile', color: '#7f1d1d', popGen: 0, incomeGen: 0, manaReq: 0, essenceReq: 0
  },
  [BuildingType.Upgrade]: {
    type: BuildingType.Upgrade, cost: 0, maintenance: 0, name: 'Enhance', description: 'Infuse with more magic', color: '#d946ef', popGen: 0, incomeGen: 0, manaReq: 0, essenceReq: 0
  },
  [BuildingType.Road]: {
    type: BuildingType.Road, cost: 15, maintenance: 1, name: 'Cobblestone', description: 'Royal path', color: '#4b5563', popGen: 0, incomeGen: 0, manaReq: 0, essenceReq: 0
  },
  [BuildingType.Residential]: {
    type: BuildingType.Residential, cost: 120, maintenance: 4, name: 'Cottage', description: 'Home for subjects', color: '#fca5a5', popGen: 6, incomeGen: 0, manaReq: 1, essenceReq: 1
  },
  [BuildingType.Commercial]: {
    type: BuildingType.Commercial, cost: 300, maintenance: 12, name: 'Tavern', description: 'Merchant hub', color: '#fbbf24', popGen: 0, incomeGen: 35, manaReq: 2, essenceReq: 2
  },
  [BuildingType.Industrial]: {
    type: BuildingType.Industrial, cost: 600, maintenance: 35, name: 'Mine', description: 'Extract gold and jewels', color: '#9ca3af', popGen: 0, incomeGen: 90, manaReq: 5, essenceReq: 3
  },
  [BuildingType.Park]: {
    type: BuildingType.Park, cost: 200, maintenance: 8, name: 'Enchanted Forest', description: 'Sacred grove', color: '#22c55e', popGen: 2, incomeGen: 0, manaReq: 0, essenceReq: 2, serviceRadius: 4
  },
  [BuildingType.PowerPlant]: {
    type: BuildingType.PowerPlant, cost: 1500, maintenance: 120, name: 'Wizard Tower', description: 'Generates Mana', color: '#a855f7', popGen: 0, incomeGen: 0, manaReq: 0, essenceReq: 4, isUtility: true
  },
  [BuildingType.WaterTower]: {
    type: BuildingType.WaterTower, cost: 900, maintenance: 60, name: 'Ancient Well', description: 'Sacred Essence flow', color: '#3b82f6', popGen: 0, incomeGen: 0, manaReq: 4, essenceReq: 0, isUtility: true
  },
  [BuildingType.PoliceStation]: {
    type: BuildingType.PoliceStation, cost: 700, maintenance: 40, name: 'Guard Post', description: 'Protects against bandits', color: '#2563eb', popGen: 0, incomeGen: 0, manaReq: 3, essenceReq: 2, serviceRadius: 5
  },
  [BuildingType.FireStation]: {
    type: BuildingType.FireStation, cost: 700, maintenance: 40, name: 'Mage Sanctum', description: 'Wards against dragons and fires', color: '#dc2626', popGen: 0, incomeGen: 0, manaReq: 5, essenceReq: 8, serviceRadius: 5
  },
  [BuildingType.School]: {
    type: BuildingType.School, cost: 1000, maintenance: 70, name: 'Alchemy Academy', description: 'Teach forbidden wisdom', color: '#059669', popGen: 0, incomeGen: 0, manaReq: 10, essenceReq: 5, serviceRadius: 6
  },
  [BuildingType.Landmark]: {
    type: BuildingType.Landmark, cost: 6000, maintenance: 300, name: 'Great Castle', description: 'The Heart of the Kingdom', color: '#eab308', popGen: 20, incomeGen: 250, manaReq: 25, essenceReq: 20
  },
  [BuildingType.LumberMill]: {
    type: BuildingType.LumberMill, cost: 450, maintenance: 25, name: 'Lumber Mill', description: 'Harvest magical timber', color: '#854d0e', popGen: 0, incomeGen: 65, manaReq: 2, essenceReq: 2
  },
  [BuildingType.Bakery]: {
    type: BuildingType.Bakery, cost: 180, maintenance: 6, name: 'Bakery', description: 'Sweet treats for the soul', color: '#fdba74', popGen: 1, incomeGen: 20, manaReq: 1, essenceReq: 1, serviceRadius: 3
  },
  [BuildingType.Library]: {
    type: BuildingType.Library, cost: 800, maintenance: 50, name: 'Great Library', description: 'Preserve ancient scrolls', color: '#1e40af', popGen: 0, incomeGen: 0, manaReq: 8, essenceReq: 2, serviceRadius: 7
  },
  [BuildingType.LuminaBloom]: {
    type: BuildingType.LuminaBloom, cost: 250, maintenance: 10, name: 'Lumina Bloom', description: 'A flower that absorbs ambient mana', color: '#a78bfa', popGen: 3, incomeGen: 0, manaReq: 0, essenceReq: 3, serviceRadius: 4
  },
};
