
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { BuildingType } from '../types';

class SoundService {
  private ctx: AudioContext | null = null;

  private getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * High-level sound dispatcher for player actions
   */
  playForAction(tool: BuildingType, targetType?: BuildingType, level?: number) {
    if (tool === BuildingType.Upgrade && targetType && level !== undefined) {
      this.playUpgrade(targetType, level);
    } else if (tool === BuildingType.None) {
      this.playDemolish();
    } else {
      this.playBuild(tool);
    }
  }

  playBuild(type: BuildingType) {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    switch (type) {
      case BuildingType.Road:
        this.playStonePath(ctx, now);
        break;
      case BuildingType.Residential:
        this.playCottageWood(ctx, now);
        break;
      case BuildingType.Commercial:
      case BuildingType.Bakery:
        this.playTavernClink(ctx, now);
        break;
      case BuildingType.Industrial:
      case BuildingType.LumberMill:
        this.playMineStrike(ctx, now);
        break;
      case BuildingType.Park:
      case BuildingType.LuminaBloom:
        this.playForestShimmer(ctx, now);
        break;
      case BuildingType.PowerPlant:
        this.playWizardTowerMagic(ctx, now);
        break;
      case BuildingType.WaterTower:
        this.playAncientWellBubble(ctx, now);
        break;
      case BuildingType.Landmark:
        this.playCastleGrandeur(ctx, now);
        break;
      case BuildingType.PoliceStation:
        this.playGuardArmorClank(ctx, now);
        break;
      case BuildingType.FireStation:
        this.playMageSanctumWarp(ctx, now);
        break;
      case BuildingType.School:
      case BuildingType.Library:
        this.playAlchemyCrystals(ctx, now);
        break;
      default:
        this.playGeneric(ctx, now);
    }
  }

  private playStonePath(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(10, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.1);
  }

  private playCottageWood(ctx: AudioContext, now: number) {
    [0, 0.08].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now + delay);
      osc.frequency.exponentialRampToValueAtTime(40, now + delay + 0.1);
      gain.gain.setValueAtTime(0.2, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.1);
    });
  }

  private playTavernClink(ctx: AudioContext, now: number) {
    [0, 0.05, 0.12].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000 + (i * 500), now + delay);
      gain.gain.setValueAtTime(0.05, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.2);
    });
  }

  private playMineStrike(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.4);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.4);
  }

  private playForestShimmer(ctx: AudioContext, now: number) {
    [1046, 1318, 1567, 2093].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + (i * 0.03));
      gain.gain.setValueAtTime(0.03, now + (i * 0.03));
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.03) + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + (i * 0.03));
      osc.stop(now + (i * 0.03) + 0.5);
    });
  }

  private playWizardTowerMagic(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.6);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.6);
  }

  private playAncientWellBubble(ctx: AudioContext, now: number) {
    for(let i = 0; i < 8; i++) {
      const delay = i * 0.04;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400 + Math.random() * 800, now + delay);
      osc.frequency.exponentialRampToValueAtTime(1200, now + delay + 0.05);
      gain.gain.setValueAtTime(0.04, now + delay);
      gain.gain.linearRampToValueAtTime(0, now + delay + 0.05);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.05);
    }
  }

  private playCastleGrandeur(ctx: AudioContext, now: number) {
    const base = ctx.createOscillator();
    const hum = ctx.createOscillator();
    const gain = ctx.createGain();
    base.type = 'triangle';
    base.frequency.setValueAtTime(80, now);
    hum.type = 'sine';
    hum.frequency.setValueAtTime(120, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    base.connect(gain);
    hum.connect(gain);
    gain.connect(ctx.destination);
    base.start();
    hum.start();
    base.stop(now + 1.2);
    hum.stop(now + 1.2);
  }

  private playGuardArmorClank(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.08);
  }

  private playMageSanctumWarp(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.4);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.4);
  }

  private playAlchemyCrystals(ctx: AudioContext, now: number) {
    [2093, 2349, 2637, 3136].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);
      gain.gain.setValueAtTime(0.05, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.2);
    });
  }

  private playGeneric(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.1);
  }

  /**
   * Plays a magical upgrade sound.
   * Features a base 'flavor' note depending on type, and a rising shimmer based on level.
   */
  playUpgrade(type: BuildingType, level: number) {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    
    // 1. Base Impact flavor
    const baseOsc = ctx.createOscillator();
    const baseGain = ctx.createGain();
    const levelMulti = 1 + (level * 0.2); // Pitch rises with level

    switch (type) {
      case BuildingType.Residential:
      case BuildingType.Park:
      case BuildingType.LuminaBloom:
        baseOsc.type = 'triangle';
        baseOsc.frequency.setValueAtTime(220 * levelMulti, now);
        break;
      case BuildingType.Industrial:
      case BuildingType.Road:
      case BuildingType.LumberMill:
        baseOsc.type = 'square';
        baseOsc.frequency.setValueAtTime(110 * levelMulti, now);
        break;
      case BuildingType.PowerPlant:
      case BuildingType.WaterTower:
      case BuildingType.FireStation:
      case BuildingType.School:
      case BuildingType.Library:
        baseOsc.type = 'sine';
        baseOsc.frequency.setValueAtTime(330 * levelMulti, now);
        break;
      default:
        baseOsc.type = 'sine';
        baseOsc.frequency.setValueAtTime(440 * levelMulti, now);
    }

    baseGain.gain.setValueAtTime(0.15, now);
    baseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    baseOsc.connect(baseGain).connect(ctx.destination);
    baseOsc.start();
    baseOsc.stop(now + 0.5);

    // 2. Magical Shimmer (Arpeggio)
    // More complex/faster for higher levels
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    const particleCount = level * 2; // Level 2: 4 notes, Level 3: 6 notes
    const speed = 0.08 / level; // Faster for higher levels

    for (let i = 0; i < Math.min(notes.length, particleCount); i++) {
      const delay = i * speed;
      const shimOsc = ctx.createOscillator();
      const shimGain = ctx.createGain();
      
      shimOsc.type = 'sine';
      // Pitch goes up with level and note index
      shimOsc.frequency.setValueAtTime(notes[i] * levelMulti, now + delay);
      
      shimGain.gain.setValueAtTime(0.06, now + delay);
      shimGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);
      
      shimOsc.connect(shimGain).connect(ctx.destination);
      shimOsc.start(now + delay);
      shimOsc.stop(now + delay + 0.3);
    }
  }

  playDemolish() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  playReward() {
    const ctx = this.getCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.3);
    });
  }
}

export const soundService = new SoundService();
