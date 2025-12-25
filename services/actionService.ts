
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Grid, BuildingType, CityStats, TileData } from '../types';
import { BUILDINGS, MAX_LEVEL } from '../constants';

export interface ActionResponse {
  newGrid: Grid;
  newStats: CityStats;
  success: boolean;
  message: string;
  type: 'positive' | 'negative' | 'neutral';
}

export class ActionService {
  /**
   * Calculates the cost to upgrade a building.
   * Formula: cost = baseCost * currentLevel * 1.5
   */
  static getUpgradeCost(bType: BuildingType, currentLevel: number): number {
    const baseCost = BUILDINGS[bType].cost;
    return Math.floor(baseCost * currentLevel * 1.5);
  }

  static upgradeTile(grid: Grid, stats: CityStats, x: number, y: number): ActionResponse {
    const tile = grid[y][x];
    const bType = tile.buildingType;

    if (bType === BuildingType.None || bType === BuildingType.Road || bType === BuildingType.Upgrade) {
      return { newGrid: grid, newStats: stats, success: false, message: "This tile cannot be upgraded.", type: 'neutral' };
    }

    if (tile.level >= MAX_LEVEL) {
      return { newGrid: grid, newStats: stats, success: false, message: "Building is already at maximum level.", type: 'neutral' };
    }

    const cost = this.getUpgradeCost(bType, tile.level);

    if (stats.money < cost) {
      return { newGrid: grid, newStats: stats, success: false, message: `Insufficient funds. Need $${cost}.`, type: 'negative' };
    }

    const newGrid = grid.map((row, ridx) => ridx === y ? row.map((t, cidx) => cidx === x ? { ...t, level: t.level + 1 } : t) : row);
    const newStats = { ...stats, money: stats.money - cost };

    return {
      newGrid,
      newStats,
      success: true,
      message: `${BUILDINGS[bType].name} upgraded to level ${tile.level + 1}!`,
      type: 'positive'
    };
  }

  static buildTile(grid: Grid, stats: CityStats, x: number, y: number, tool: BuildingType): ActionResponse {
    const tile = grid[y][x];
    const config = BUILDINGS[tool];

    if (tile.buildingType !== BuildingType.None) {
      return { newGrid: grid, newStats: stats, success: false, message: "Tile is already occupied.", type: 'neutral' };
    }

    if (stats.money < config.cost) {
      return { newGrid: grid, newStats: stats, success: false, message: `Cannot afford ${config.name} ($${config.cost}).`, type: 'negative' };
    }

    const newGrid = grid.map((row, ridx) => ridx === y ? row.map((t, cidx) => cidx === x ? { ...t, buildingType: tool, level: 1 } : t) : row);
    const newStats = { ...stats, money: stats.money - config.cost };

    return {
      newGrid,
      newStats,
      success: true,
      message: `${config.name} constructed.`,
      type: 'positive'
    };
  }

  static bulldozeTile(grid: Grid, stats: CityStats, x: number, y: number): ActionResponse {
    const tile = grid[y][x];
    const fee = 10;

    if (tile.buildingType === BuildingType.None) {
      return { newGrid: grid, newStats: stats, success: false, message: "Tile is already empty.", type: 'neutral' };
    }

    const newGrid = grid.map((row, ridx) => ridx === y ? row.map((t, cidx) => cidx === x ? { ...t, buildingType: BuildingType.None, level: 1 } : t) : row);
    const newStats = { ...stats, money: Math.max(0, stats.money - fee) };

    return {
      newGrid,
      newStats,
      success: true,
      message: "Tile cleared.",
      type: 'neutral'
    };
  }
}
