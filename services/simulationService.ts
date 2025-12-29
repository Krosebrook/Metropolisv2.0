
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Grid, CityStats, BuildingType, TileData } from '../types';
import { BUILDINGS, GRID_SIZE } from '../constants';

export class SimulationService {
  /**
   * Processes one logical time step of the kingdom simulation.
   */
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

    // Spatial coverage maps
    const coverage = {
      guards: Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)),
      mages: Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)),
      wisdom: Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)),
      nature: Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)),
      sweets: Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)), // Bakery boost
    };

    // Pre-pass: Calculate total utility supply and service coverage
    grid.forEach(row => row.forEach(tile => {
      const config = BUILDINGS[tile.buildingType];
      if (!config) return;

      if (tile.buildingType === BuildingType.PowerPlant) manaSupply += 120 * tile.level;
      if (tile.buildingType === BuildingType.WaterTower) essenceSupply += 100 * tile.level;
      
      maintenanceTotal += config.maintenance * tile.level;

      if (config.serviceRadius) {
        const radius = config.serviceRadius + (tile.level - 1);
        this.applyCoverage(coverage, tile.x, tile.y, radius, tile.buildingType);
      }
    }));

    // Main pass: Apply logic to each tile
    const newGrid = grid.map((row, y) => row.map((tile, x) => {
      if (tile.buildingType === BuildingType.None || tile.buildingType === BuildingType.Road) {
        return { ...tile, happiness: 100, hasMana: true, hasEssence: true };
      }

      const config = BUILDINGS[tile.buildingType];
      const mReq = config.manaReq * tile.level;
      const eReq = config.essenceReq * tile.level;

      const hasMana = (manaUsed + mReq) <= manaSupply;
      const hasEssence = (essenceUsed + eReq) <= essenceSupply;

      if (hasMana) manaUsed += mReq;
      if (hasEssence) essenceUsed += eReq;

      // Happiness logic: Multi-factor weighted system
      let happiness = 75; // Baseline
      
      if (!hasMana) happiness -= 40;
      if (!hasEssence) happiness -= 40;
      
      if (tile.buildingType === BuildingType.Residential) {
        residentialCount++;
        
        // Services
        happiness += coverage.guards[y][x] ? 15 : -20;
        happiness += coverage.mages[y][x] ? 15 : -15;
        happiness += coverage.wisdom[y][x] ? 20 : 0;
        happiness += coverage.nature[y][x] ? 20 : 0;
        happiness += coverage.sweets[y][x] ? 12 : 0; // Bakery bonus
        
        // Proximity penalties for industrial pollution (Mines & Lumber Mills)
        if (this.checkIndustrialProximity(grid, x, y, 3)) happiness -= 30;
      }

      happiness = Math.max(0, Math.min(100, happiness));
      totalHappiness += happiness;

      // Economic output is throttled by happiness and utility availability
      const effectiveness = (hasMana && hasEssence) ? (0.2 + (happiness / 100) * 0.8) : 0.1;
      incomeTotal += config.incomeGen * tile.level * effectiveness;
      popGrowth += config.popGen * tile.level * effectiveness;

      return { 
        ...tile, 
        hasMana, 
        hasEssence, 
        hasGuards: coverage.guards[y][x],
        hasMagicSafety: coverage.mages[y][x],
        hasWisdom: coverage.wisdom[y][x],
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

  private static applyCoverage(coverage: any, cx: number, cy: number, r: number, type: BuildingType) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
          if (Math.sqrt(dx * dx + dy * dy) <= r) {
            if (type === BuildingType.PoliceStation) coverage.guards[ny][nx] = true;
            if (type === BuildingType.FireStation) coverage.mages[ny][nx] = true;
            if (type === BuildingType.School || type === BuildingType.Library || type === BuildingType.MagicAcademy) coverage.wisdom[ny][nx] = true;
            if (type === BuildingType.Park || type === BuildingType.LuminaBloom) coverage.nature[ny][nx] = true;
            if (type === BuildingType.Bakery) coverage.sweets[ny][nx] = true;
          }
        }
      }
    }
  }

  private static checkIndustrialProximity(grid: Grid, x: number, y: number, radius: number): boolean {
    const industrialTypes = [BuildingType.Industrial, BuildingType.LumberMill, BuildingType.Windmill];
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
          if (industrialTypes.includes(grid[ny][nx].buildingType)) return true;
        }
      }
    }
    return false;
  }
}
