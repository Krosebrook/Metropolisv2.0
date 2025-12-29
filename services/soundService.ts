
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
        this.playTavernClink(ctx, now);
        break;
      case BuildingType.Industrial:
        this.playMineStrike(ctx, now);
        break;
      case BuildingType.Park:
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
        this.playAlchemyCrystals(ctx, now);
        break;
      case BuildingType.LumberMill:
        this.playLumberMillSaw(ctx, now);
        break;
      case BuildingType.Bakery:
        this.playBakeryWarmth(ctx, now);
        break;
      case BuildingType.Library:
        this.playLibraryWisdom(ctx, now);
        break;
      case BuildingType.LuminaBloom:
        this.playLuminaBloomRadiance(ctx, now);
        break;
      case BuildingType.Windmill:
        this.playWindmillCreak(ctx, now);
        break;
      case BuildingType.MarketSquare:
        this.playMarketHubbub(ctx, now);
        break;
      case BuildingType.MagicAcademy:
        this.playAcademyResonance(ctx, now);
        break;
      case BuildingType.GrandObservatory:
        this.playObservatoryGears(ctx, now);
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

  private playLumberMillSaw(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.3);
  }

  private playBakeryWarmth(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.25);
  }

  private playLibraryWisdom(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(112, now + 0.8); // Subtle vibrato-like drift
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.8);
  }

  private playLuminaBloomRadiance(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1567.98, now); // G6
    osc.frequency.exponentialRampToValueAtTime(3135.96, now + 0.4); // G7
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.4);
  }

  private playWindmillCreak(ctx: AudioContext, now: number) {
    // 1. Wood creak (slow sawtooth)
    const creak = ctx.createOscillator();
    const creakGain = ctx.createGain();
    creak.type = 'sawtooth';
    creak.frequency.setValueAtTime(20, now);
    creak.frequency.exponentialRampToValueAtTime(15, now + 0.6);
    creakGain.gain.setValueAtTime(0.05, now);
    creakGain.gain.linearRampToValueAtTime(0, now + 0.6);
    creak.connect(creakGain).connect(ctx.destination);
    creak.start();
    creak.stop(now + 0.6);

    // 2. Wind swoosh (white noise)
    const bufferSize = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(100, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(600, now + 0.4);
    noiseFilter.frequency.exponentialRampToValueAtTime(200, now + 0.8);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.05, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
    noise.start();
    noise.stop(now + 0.8);
  }

  private playMarketHubbub(ctx: AudioContext, now: number) {
    // 1. Simulated voices (multi-sine cluster)
    [350, 420, 560, 680].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Fast jittery volume
      for(let t = 0; t < 0.6; t += 0.05) {
        gain.gain.setValueAtTime(0.02 * Math.random(), now + t);
      }
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.6);
    });

    // 2. Coin jingle
    const coin = ctx.createOscillator();
    const coinGain = ctx.createGain();
    coin.type = 'sine';
    coin.frequency.setValueAtTime(4500, now + 0.1);
    coinGain.gain.setValueAtTime(0.04, now + 0.1);
    coinGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    coin.connect(coinGain).connect(ctx.destination);
    coin.start(now + 0.1);
    coin.stop(now + 0.3);
  }

  private playAcademyResonance(ctx: AudioContext, now: number) {
    // High-pitched "sparkle" sweep
    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweep.type = 'sine';
    sweep.frequency.setValueAtTime(1000, now);
    sweep.frequency.exponentialRampToValueAtTime(4000, now + 0.8);
    sweepGain.gain.setValueAtTime(0, now);
    sweepGain.gain.linearRampToValueAtTime(0.06, now + 0.2);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    sweep.connect(sweepGain).connect(ctx.destination);
    sweep.start();
    sweep.stop(now + 0.8);

    // Resonant low chord
    [110, 165, 220].forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(now + 1.2);
    });
  }

  private playObservatoryGears(ctx: AudioContext, now: number) {
    // 1. Clockwork ticks
    for(let i = 0; i < 4; i++) {
      const t = now + i * 0.15;
      const tick = ctx.createOscillator();
      const tickGain = ctx.createGain();
      tick.type = 'square';
      tick.frequency.setValueAtTime(1200, t);
      tickGain.gain.setValueAtTime(0.03, t);
      tickGain.gain.linearRampToValueAtTime(0, t + 0.02);
      tick.connect(tickGain).connect(ctx.destination);
      tick.start(t);
      tick.stop(t + 0.02);
    }

    // 2. Celestial drone
    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(70, now);
    drone.frequency.exponentialRampToValueAtTime(72, now + 1.0);
    droneGain.gain.setValueAtTime(0, now);
    droneGain.gain.linearRampToValueAtTime(0.1, now + 0.3);
    droneGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    drone.connect(droneGain).connect(ctx.destination);
    drone.start();
    drone.stop(now + 1.0);
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

  playUpgrade(type: BuildingType, level: number) {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    
    const baseOsc = ctx.createOscillator();
    const baseGain = ctx.createGain();
    const levelMulti = 1 + (level * 0.2);

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

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    const particleCount = level * 2;
    const speed = 0.08 / level;

    for (let i = 0; i < Math.min(notes.length, particleCount); i++) {
      const delay = i * speed;
      const shimOsc = ctx.createOscillator();
      const shimGain = ctx.createGain();
      
      shimOsc.type = 'sine';
      shimOsc.frequency.setValueAtTime(notes[i] * levelMulti, now + delay);
      
      shimGain.gain.setValueAtTime(0.06, now + delay);
      shimGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);
      
      shimOsc.connect(shimGain).connect(ctx.destination);
      shimOsc.start(now + delay);
      shimOsc.stop(now + delay + 0.3);
    }
  }

  /**
   * Plays a distinct "Banishment" (Demolish) sound effect.
   * Consists of a heavy thud and a stone-crumbling noise layer.
   */
  playDemolish() {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    // 1. Low-Frequency Structural Thud
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(100, now);
    thud.frequency.exponentialRampToValueAtTime(10, now + 0.3);
    
    thudGain.gain.setValueAtTime(0.2, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    thud.connect(thudGain).connect(ctx.destination);
    thud.start();
    thud.stop(now + 0.3);

    // 2. Stone Crumbling Noise Layer
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // White noise
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1000, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.4);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.linearRampToValueAtTime(0.05, now + 0.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
    noise.start();
    noise.stop(now + 0.4);
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
