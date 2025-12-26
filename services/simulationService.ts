
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Grid, CityStats, BuildingType, TileData } from '../types';
import { BUILDINGS, GRID_SIZE } from '../constants';

export class SimulationService {
  static calculateTick(grid: Grid, stats: CityStats): { newStats: CityStats, newGrid: Grid } {
    let incomeTotal = 0;
    let maintenanceTotal = 0;
    let popGrowth = 0;
    let manaSupply = 0;
    let essenceSupply = 0;
    let manaUsed = 0;
    let essenceUsed = 0;
    let totalHappiness = 0;
    let residentialCount = 0;

    const guardMap = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false));
    const mageMap = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false));
    const wisdomMap = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false));
    const forestMap = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false));

    // Phase 1: Supplies and Magical Coverage
    grid.forEach(row => row.forEach(tile => {
      const config = BUILDINGS[tile.buildingType];
      if (tile.buildingType === BuildingType.PowerPlant) manaSupply += 120 * tile.level;
      if (tile.buildingType === BuildingType.WaterTower) essenceSupply += 100 * tile.level;
      
      maintenanceTotal += config.maintenance * tile.level;

      if (config.serviceRadius) {
        const r = config.serviceRadius + (tile.level - 1);
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const ny = tile.y + dy;
            const nx = tile.x + dx;
            if (ny >= 0 && ny < GRID_SIZE && nx >= 0 && nx < GRID_SIZE) {
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist <= r) {
                if (tile.buildingType === BuildingType.PoliceStation) guardMap[ny][nx] = true;
                if (tile.buildingType === BuildingType.FireStation) mageMap[ny][nx] = true;
                if (tile.buildingType === BuildingType.School) wisdomMap[ny][nx] = true;
                if (tile.buildingType === BuildingType.Park) forestMap[ny][nx] = true;
              }
            }
          }
        }
      }
    }));

    // Phase 2: Processing Tiles
    const newGrid = grid.map((row, y) => row.map((tile, x) => {
      if (tile.buildingType === BuildingType.None || tile.buildingType === BuildingType.Road) {
        return { ...tile, happiness: 100, hasMana: true, hasEssence: true };
      }

      const config = BUILDINGS[tile.buildingType];
      const mReq = config.manaReq * tile.level;
      const eReq = config.essenceReq * tile.level;

      const canMana = (manaUsed + mReq) <= manaSupply;
      const canEssence = (essenceUsed + eReq) <= essenceSupply;

      if (canMana) manaUsed += mReq;
      if (canEssence) essenceUsed += eReq;

      let happiness = 80; // Baseline Kingdom Contentment
      if (!canMana) happiness -= 35;
      if (!canEssence) happiness -= 35;
      
      if (tile.buildingType === BuildingType.Residential) {
        residentialCount++;
        if (guardMap[y][x]) happiness += 12; else happiness -= 18;
        if (mageMap[y][x]) happiness += 12; else happiness -= 12;
        if (wisdomMap[y][x]) happiness += 15; else happiness -= 5;
        if (forestMap[y][x]) happiness += 15;
        
        // Mine pollution/noise
        if (this.checkProximity(grid, x, y, BuildingType.Industrial, 3)) happiness -= 25;
      }

      happiness = Math.max(0, Math.min(100, happiness));
      totalHappiness += happiness;

      const efficiency = (canMana && canEssence) ? (happiness / 100) : 0.05;
      incomeTotal += config.incomeGen * tile.level * efficiency;
      popGrowth += config.popGen * tile.level * efficiency;

      return { 
        ...tile, 
        hasMana: canMana, 
        hasEssence: canEssence, 
        hasGuards: guardMap[y][x],
        hasMagicSafety: mageMap[y][x],
        hasWisdom: wisdomMap[y][x],
        happiness 
      };
    }));

    const avgHappiness = residentialCount > 0 ? totalHappiness / residentialCount : 100;

    return {
      newGrid,
      newStats: {
        ...stats,
        money: stats.money + Math.floor(incomeTotal - maintenanceTotal),
        population: Math.max(0, stats.population + Math.floor(popGrowth)),
        happiness: Math.floor(avgHappiness),
        manaSupply,
        essenceSupply,
        manaUsage: manaUsed,
        essenceUsage: essenceUsed,
        incomeTotal: Math.floor(incomeTotal),
        maintenanceTotal: Math.floor(maintenanceTotal),
        day: stats.day + 1,
        time: (stats.time + 0.5) % 24
      }
    };
  }

  private static checkProximity(grid: Grid, x: number, y: number, type: BuildingType, radius: number): boolean {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (ny >= 0 && ny < GRID_SIZE && nx >= 0 && nx < GRID_SIZE) {
          if (grid[ny][nx].buildingType === type) return true;
        }
      }
    }
    return false;
  }
}
