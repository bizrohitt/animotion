import { describe, it, expect } from 'vitest';
import { makeNoiseBuffer, envelope } from '../src/audio/synth.ts';

// Minimal mock for BaseAudioContext with createBuffer
function mockCtx(sampleRate = 48000): BaseAudioContext & { buffers: AudioBuffer[] } {
  const buffers: AudioBuffer[] = [];
  const ctx = {
    sampleRate,
    createBuffer(channels: number, len: number, rate: number) {
      const buf = {
        numberOfChannels: channels,
        length: len,
        sampleRate: rate,
        getChannelData() {
          const data = new Float32Array(len);
          (buf as unknown as { _data: Float32Array })._data = data;
          return data;
        },
      } as unknown as AudioBuffer;
      // store data for access
      const data = new Float32Array(len);
      (buf as unknown as { _data: Float32Array })._data = data;
      buf.getChannelData = () => data;
      buffers.push(buf);
      return buf;
    },
  } as unknown as BaseAudioContext & { buffers: AudioBuffer[] };
  return ctx;
}

function mockGain(): GainNode & { events: string[] } {
  const events: string[] = [];
  const gain = {
    events,
    gain: {
      setValueAtTime(v: number, t: number) {
        events.push(`set ${v} at ${t}`);
      },
      linearRampToValueAtTime(v: number, t: number) {
        events.push(`linear ${v} at ${t}`);
      },
      exponentialRampToValueAtTime(v: number, t: number) {
        events.push(`exp ${v} at ${t}`);
      },
    },
  } as unknown as GainNode & { events: string[] };
  return gain;
}

describe('synth primitives', () => {
  it('makeNoiseBuffer creates non-silent buffer with correct length', () => {
    const ctx = mockCtx(48000);
    const buf = makeNoiseBuffer(ctx, 0.1, 123);
    expect(buf.length).toBe(4800);
    expect(buf.sampleRate).toBe(48000);
    const data = buf.getChannelData(0);
    // check not silent: at least some samples non-zero and within [-1,1]
    let nonZero = 0;
    let outOfRange = false;
    for (let i = 0; i < data.length; i++) {
      if (Math.abs(data[i]) > 0.01) nonZero++;
      if (data[i] < -1 || data[i] > 1) outOfRange = true;
    }
    expect(nonZero).toBeGreaterThan(data.length * 0.5);
    expect(outOfRange).toBe(false);
  });

  it('makeNoiseBuffer deterministic with same seed', () => {
    const ctx1 = mockCtx(48000);
    const ctx2 = mockCtx(48000);
    const b1 = makeNoiseBuffer(ctx1, 0.05, 999);
    const b2 = makeNoiseBuffer(ctx2, 0.05, 999);
    const d1 = b1.getChannelData(0);
    const d2 = b2.getChannelData(0);
    expect(d1[0]).toBe(d2[0]);
    expect(d1[10]).toBe(d2[10]);
  });

  it('envelope schedules correct automation (no zero exponential)', () => {
    const gain = mockGain();
    envelope(gain, 1.0, 0.005, 0.12, 0.9);
    expect(gain.events.length).toBe(3);
    expect(gain.events[0]).toContain('set 0 at 1');
    expect(gain.events[1]).toContain('linear 0.9 at 1.005');
    expect(gain.events[2]).toContain('exp 0.001 at 1.12');
    // ensure not scheduling 0 for exponential
    expect(gain.events[2]).not.toContain('exp 0 at');
  });

  it('envelope with different params', () => {
    const gain = mockGain();
    envelope(gain, 0.5, 0.01, 0.05, 0.5);
    expect(gain.events[1]).toContain('0.5 at 0.51');
  });
});
