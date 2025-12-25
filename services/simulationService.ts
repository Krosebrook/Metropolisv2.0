
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Grid, CityStats, BuildingType, TileData } from '../types';
import { BUILDINGS, GRID_SIZE } from '../constants';

export class SimulationService {
  static calculateTick(grid: Grid, stats: CityStats): { newStats: CityStats, newGrid: Grid } {
    let totalIncome = 0;
    let totalPopGrowth = 0;
    let powerSupply = 0;
    let waterSupply = 0;
    let powerUsage = 0;
    let waterUsage = 0;
    let totalHappiness = 0;
    let activeBuildings = 0;

    // First pass: Utilities and supply
    grid.forEach(row => row.forEach(tile => {
      if (tile.buildingType === BuildingType.PowerPlant) powerSupply += 50 * tile.level;
      if (tile.buildingType === BuildingType.WaterTower) waterSupply += 50 * tile.level;
    }));

    const newGrid = grid.map(row => row.map(tile => {
      const config = BUILDINGS[tile.buildingType];
      if (tile.buildingType === BuildingType.None || tile.buildingType === BuildingType.Road) {
        return { ...tile, hasPower: true, hasWater: true, happiness: 100 };
      }

      const pReq = config.powerReq * tile.level;
      const wReq = config.waterReq * tile.level;

      const canPower = (powerUsage + pReq) <= powerSupply;
      const canWater = (waterUsage + wReq) <= waterSupply;

      if (canPower) powerUsage += pReq;
      if (canWater) waterUsage += wReq;

      // Happiness logic: Neighbor check
      let happiness = 70;
      if (!canPower || !canWater) happiness -= 40;
      
      // AoE Check
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = tile.x + dx;
          const ny = tile.y + dy;
          if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
            const neighbor = grid[ny][nx];
            if (neighbor.buildingType === BuildingType.Park) happiness += 5;
            if (neighbor.buildingType === BuildingType.Industrial) happiness -= 3;
          }
        }
      }

      happiness = Math.max(0, Math.min(100, happiness));
      totalHappiness += happiness;
      activeBuildings++;

      // Output multipliers
      const efficiency = (canPower && canWater) ? (happiness / 100) : 0.1;
      totalIncome += config.incomeGen * tile.level * efficiency;
      totalPopGrowth += config.popGen * tile.level * efficiency;

      return { ...tile, hasPower: canPower, hasWater: canWater, happiness };
    }));

    const avgHappiness = activeBuildings > 0 ? totalHappiness / activeBuildings : 100;

    const newStats: CityStats = {
      ...stats,
      money: stats.money + Math.floor(totalIncome),
      population: Math.max(0, stats.population + Math.floor(totalPopGrowth)),
      happiness: Math.floor(avgHappiness),
      powerSupply,
      waterSupply,
      powerUsage,
      waterUsage,
      day: stats.day + 1,
      time: (stats.time + 0.5) % 24
    };

    return { newStats, newGrid };
  }
}
