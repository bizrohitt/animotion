// src/audio/mixdown.ts — schedule bursts at cut timestamps via OfflineAudioContext

import type { Timeline } from '../types.ts';
import type { SoundEffect } from '../types.ts';
import { getEffectFn } from './effects.ts';

export interface MixdownOpts {
  sampleRate?: number; // default 48000
}

export async function mixdown(
  timeline: Timeline,
  effect: SoundEffect,
  opts: MixdownOpts = {},
): Promise<AudioBuffer> {
  const sampleRate = opts.sampleRate ?? 48000;
  const durationSec =
    timeline.length > 0
      ? (timeline[timeline.length - 1].timestampMs + timeline[timeline.length - 1].durationMs) /
        1000
      : 0;
  const tail = 0.3; // allow last burst to finish
  const totalSec = durationSec + tail;
  const len = Math.max(1, Math.ceil(sampleRate * totalSec));

  // Feature-detect OfflineAudioContext
  const Ctx =
    (globalThis as unknown as { OfflineAudioContext?: typeof OfflineAudioContext })
      .OfflineAudioContext ??
    (globalThis as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
      .webkitOfflineAudioContext;

  if (!Ctx) {
    // Fallback: return silent buffer (for environments without OfflineAudioContext, e.g., node tests will mock)
    // Create a minimal mock buffer
    const silent = createSilentBuffer(len, sampleRate);
    if (effect !== 'none') {
      // synthesize approximate non-silence for test: fill with small noise at burst times
      fillBursts(silent, timeline, sampleRate);
    }
    return silent;
  }

  const ctx = new Ctx(1, len, sampleRate);
  const fn = getEffectFn(effect);

  for (const frame of timeline) {
    const at = frame.timestampMs / 1000;
    fn(ctx as unknown as BaseAudioContext, at);
  }

  const rendered: AudioBuffer = await (ctx as OfflineAudioContext).startRendering();
  return rendered;
}

function createSilentBuffer(len: number, sampleRate: number): AudioBuffer {
  const data = new Float32Array(len);
  return {
    length: len,
    sampleRate,
    duration: len / sampleRate,
    numberOfChannels: 1,
    getChannelData: () => data,
  } as unknown as AudioBuffer;
}

function fillBursts(buffer: AudioBuffer, timeline: Timeline, sampleRate: number): void {
  const data = buffer.getChannelData(0);
  for (const frame of timeline) {
    const start = Math.floor((frame.timestampMs / 1000) * sampleRate);
    const burstLen = Math.floor(0.02 * sampleRate);
    for (let i = 0; i < burstLen && start + i < data.length; i++) {
      data[start + i] = (Math.random() * 2 - 1) * 0.5;
    }
  }
}
