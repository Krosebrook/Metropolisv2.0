
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Grid, CityStats } from '../types';

const SAVE_KEY = 'skymetropolis_save_v1';

export class SaveService {
  static save(grid: Grid, stats: CityStats) {
    const data = JSON.stringify({ grid, stats });
    localStorage.setItem(SAVE_KEY, data);
  }

  static load(): { grid: Grid, stats: CityStats } | null {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static clear() {
    localStorage.removeItem(SAVE_KEY);
  }
}
