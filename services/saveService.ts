
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import Dexie, { Table } from 'dexie';
import { Grid, CityStats } from '../types';

const CURRENT_PROFILE_KEY = 'fablerealm_active_profile';

export interface KingdomProfile {
  id: string;
  name: string;
  lastPlayed: number;
  playTime: number;
  stats: CityStats;
  grid: Grid;
}

// Use direct instantiation with type intersection to avoid TypeScript issues 
// with class inheritance (e.g., "Property 'version' does not exist").
const db = new Dexie('FableRealmDB') as Dexie & {
  profiles: Table<KingdomProfile>;
};

db.version(1).stores({
  profiles: 'id, lastPlayed' // Primary key and indexed props
});

export class SaveService {
  /**
   * Asynchronously saves the kingdom state to IndexedDB
   */
  static async save(grid: Grid, stats: CityStats, profileId: string = 'default'): Promise<void> {
    const profile: KingdomProfile = {
      id: profileId,
      name: `Kingdom of ${profileId}`,
      lastPlayed: Date.now(),
      playTime: 0, // In a full implementation, we'd track session duration
      stats,
      grid
    };

    try {
      await db.profiles.put(profile);
      // Keep lightweight reference in localStorage for fast startup checks if needed
      localStorage.setItem(CURRENT_PROFILE_KEY, profileId);
    } catch (error) {
      console.error("Failed to save kingdom:", error);
    }
  }

  /**
   * Asynchronously loads the kingdom state from IndexedDB
   */
  static async load(profileId: string = 'default'): Promise<KingdomProfile | undefined> {
    try {
      // Check localStorage for the last active profile if default is requested
      const targetId = profileId === 'default' 
        ? (localStorage.getItem(CURRENT_PROFILE_KEY) || 'default') 
        : profileId;
        
      return await db.profiles.get(targetId);
    } catch (error) {
      console.error("Failed to load kingdom:", error);
      return undefined;
    }
  }

  static getActiveProfileId(): string {
    return localStorage.getItem(CURRENT_PROFILE_KEY) || 'default';
  }

  static async listProfiles(): Promise<KingdomProfile[]> {
    return await db.profiles.orderBy('lastPlayed').reverse().toArray();
  }

  static async deleteProfile(profileId: string): Promise<void> {
    await db.profiles.delete(profileId);
    if (this.getActiveProfileId() === profileId) {
      localStorage.removeItem(CURRENT_PROFILE_KEY);
    }
  }
}
