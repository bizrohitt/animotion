// src/audio/effects.ts — six synthesized sound effects (no samples)

import type { SoundEffect } from '../types.ts';
import { envelope, makeNoiseBuffer } from './synth.ts';

export type EffectFn = (ctx: BaseAudioContext, at: number) => void;

function paperShuffle(ctx: BaseAudioContext, at: number): void {
  const buf = makeNoiseBuffer(ctx, 0.08, 11);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = 900;
  const gain = ctx.createGain();
  envelope(gain, at, 0.006, 0.08, 0.85);
  src.connect(filt).connect(gain).connect(ctx.destination);
  src.start(at);
  src.stop(at + 0.09);
}

function cameraShutter(ctx: BaseAudioContext, at: number): void {
  for (const offset of [0, 0.04]) {
    const buf = makeNoiseBuffer(ctx, 0.03, 22 + Math.round(offset * 1000));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 2600;
    filt.Q.value = 1.2;
    const gain = ctx.createGain();
    envelope(gain, at + offset, 0.002, 0.028, 0.9);
    src.connect(filt).connect(gain).connect(ctx.destination);
    src.start(at + offset);
    src.stop(at + offset + 0.035);
  }
}

function filmAdvance(ctx: BaseAudioContext, at: number): void {
  const offsets = [0, 0.04, 0.08];
  for (const off of offsets) {
    const buf = makeNoiseBuffer(ctx, 0.02, 33 + Math.round(off * 1000));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 1800;
    filt.Q.value = 1.5;
    const gain = ctx.createGain();
    envelope(gain, at + off, 0.001, 0.018, 0.8);
    src.connect(filt).connect(gain).connect(ctx.destination);
    src.start(at + off);
    src.stop(at + off + 0.025);
  }
  // longer last tick
  const buf = makeNoiseBuffer(ctx, 0.05, 44);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = 1600;
  filt.Q.value = 0.9;
  const gain = ctx.createGain();
  envelope(gain, at + 0.13, 0.002, 0.045, 0.75);
  src.connect(filt).connect(gain).connect(ctx.destination);
  src.start(at + 0.13);
  src.stop(at + 0.185);
}

function polaroid(ctx: BaseAudioContext, at: number): void {
  // thud
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 120;
  const g1 = ctx.createGain();
  envelope(g1, at, 0.004, 0.06, 0.9);
  osc.connect(g1).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + 0.07);
  // swish
  const buf = makeNoiseBuffer(ctx, 0.12, 55);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = 1100;
  filt.Q.value = 0.8;
  const g2 = ctx.createGain();
  envelope(g2, at + 0.03, 0.008, 0.11, 0.6);
  src.connect(filt).connect(g2).connect(ctx.destination);
  src.start(at + 0.03);
  src.stop(at + 0.15);
}

function flashPop(ctx: BaseAudioContext, at: number): void {
  const buf = makeNoiseBuffer(ctx, 0.04, 66);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = 3200;
  filt.Q.value = 1.0;
  const gain = ctx.createGain();
  envelope(gain, at, 0.001, 0.035, 0.95);
  src.connect(filt).connect(gain).connect(ctx.destination);
  src.start(at);
  src.stop(at + 0.045);
}

function none(): void {
  // silent
}

export function getEffectFn(name: SoundEffect): EffectFn {
  switch (name) {
    case 'paperShuffle':
      return paperShuffle;
    case 'cameraShutter':
      return cameraShutter;
    case 'filmAdvance':
      return filmAdvance;
    case 'polaroid':
      return polaroid;
    case 'flashPop':
      return flashPop;
    case 'none':
    default:
      return none as unknown as EffectFn;
  }
}

export const EFFECT_NAMES: SoundEffect[] = [
  'paperShuffle',
  'cameraShutter',
  'filmAdvance',
  'polaroid',
  'flashPop',
  'none',
];
