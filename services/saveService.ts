
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Grid, CityStats } from '../types';

const SAVE_KEY_PREFIX = 'fablerealm_save_';
const CURRENT_PROFILE_KEY = 'fablerealm_active_profile';

export interface KingdomProfile {
  id: string;
  name: string;
  lastPlayed: number;
  playTime: number;
  stats: CityStats;
  grid: Grid;
}

export class SaveService {
  static save(grid: Grid, stats: CityStats, profileId: string = 'default') {
    const profile: KingdomProfile = {
      id: profileId,
      name: `Kingdom of ${profileId}`,
      lastPlayed: Date.now(),
      playTime: 0, // In a full implementation, we'd track session duration
      stats,
      grid
    };
    localStorage.setItem(`${SAVE_KEY_PREFIX}${profileId}`, JSON.stringify(profile));
    localStorage.setItem(CURRENT_PROFILE_KEY, profileId);
  }

  static load(profileId: string = 'default'): KingdomProfile | null {
    const data = localStorage.getItem(`${SAVE_KEY_PREFIX}${profileId}`);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static getActiveProfileId(): string {
    return localStorage.getItem(CURRENT_PROFILE_KEY) || 'default';
  }

  static listProfiles(): string[] {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(SAVE_KEY_PREFIX))
      .map(key => key.replace(SAVE_KEY_PREFIX, ''));
  }

  static deleteProfile(profileId: string) {
    localStorage.removeItem(`${SAVE_KEY_PREFIX}${profileId}`);
  }
}
