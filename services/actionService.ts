
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Grid, BuildingType, CityStats } from '../types';
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
   * Dispatches the correct kingdom action based on tool selection
   */
  static execute(tool: BuildingType, grid: Grid, stats: CityStats, x: number, y: number): ActionResponse {
    switch (tool) {
      case BuildingType.Upgrade:
        return this.upgradeTile(grid, stats, x, y);
      case BuildingType.None:
        return this.bulldozeTile(grid, stats, x, y);
      default:
        return this.buildTile(grid, stats, x, y, tool);
    }
  }

  private static getUpgradeCost(bType: BuildingType, currentLevel: number): number {
    const baseCost = BUILDINGS[bType].cost;
    return Math.floor(baseCost * (currentLevel + 1) * 1.8);
  }

  static upgradeTile(grid: Grid, stats: CityStats, x: number, y: number): ActionResponse {
    const tile = grid[y][x];
    const bType = tile.buildingType;

    if (bType === BuildingType.None || bType === BuildingType.Road) {
      return { newGrid: grid, newStats: stats, success: false, message: "Only structures can be enhanced.", type: 'neutral' };
    }

    if (tile.level >= MAX_LEVEL) {
      return { newGrid: grid, newStats: stats, success: false, message: "Structure is already at max magical resonance.", type: 'neutral' };
    }

    const cost = this.getUpgradeCost(bType, tile.level);

    if (stats.money < cost) {
      return { newGrid: grid, newStats: stats, success: false, message: `The treasury lacks the ${cost}g required for this rite.`, type: 'negative' };
    }

    const newGrid = grid.map((row, ridx) => ridx === y ? row.map((t, cidx) => cidx === x ? { ...t, level: t.level + 1 } : t) : row);
    const newStats = { ...stats, money: stats.money - cost };

    return {
      newGrid, newStats, success: true,
      message: `${BUILDINGS[bType].name} enhanced to Tier ${tile.level + 1}.`,
      type: 'positive'
    };
  }

  static buildTile(grid: Grid, stats: CityStats, x: number, y: number, tool: BuildingType): ActionResponse {
    const tile = grid[y][x];
    const config = BUILDINGS[tool];

    if (tile.buildingType !== BuildingType.None) {
      return { newGrid: grid, newStats: stats, success: false, message: "That land is already occupied.", type: 'neutral' };
    }

    if (stats.money < config.cost) {
      return { newGrid: grid, newStats: stats, success: false, message: `Thy treasury needs ${config.cost}g to establish this ${config.name}.`, type: 'negative' };
    }

    const newGrid = grid.map((row, ridx) => ridx === y ? row.map((t, cidx) => cidx === x ? { ...t, buildingType: tool, level: 1 } : t) : row);
    const newStats = { ...stats, money: stats.money - config.cost };

    return {
      newGrid, newStats, success: true,
      message: `Established ${config.name}.`,
      type: 'positive'
    };
  }

  static bulldozeTile(grid: Grid, stats: CityStats, x: number, y: number): ActionResponse {
    const tile = grid[y][x];
    if (tile.buildingType === BuildingType.None) return { newGrid: grid, newStats: stats, success: false, message: "The land is already clear.", type: 'neutral' };

    const newGrid = grid.map((row, ridx) => ridx === y ? row.map((t, cidx) => cidx === x ? { ...t, buildingType: BuildingType.None, level: 1 } : t) : row);
    const newStats = { ...stats, money: Math.max(0, stats.money - 20) };

    return {
      newGrid, newStats, success: true,
      message: "Tile cleared by Royal decree.",
      type: 'neutral'
    };
  }
}
