import { describe, it, expect } from 'vitest';
import { getEffectFn, EFFECT_NAMES } from '../src/audio/effects.ts';

// mock BaseAudioContext that records scheduled events
function mockAudioCtx() {
  const events: string[] = [];
  const ctx = {
    sampleRate: 48000,
    destination: {},
    createBuffer(channels: number, len: number, rate: number) {
      const data = new Float32Array(len);
      return {
        numberOfChannels: channels,
        length: len,
        sampleRate: rate,
        getChannelData: () => data,
      } as unknown as AudioBuffer;
    },
    createBufferSource() {
      return {
        buffer: null as AudioBuffer | null,
        connect() {
          return this as unknown as AudioNode;
        },
        start(t: number) {
          events.push(`src start ${t}`);
        },
        stop(t: number) {
          events.push(`src stop ${t}`);
        },
      } as unknown as AudioBufferSourceNode;
    },
    createBiquadFilter() {
      return {
        type: 'lowpass' as BiquadFilterType,
        frequency: { value: 0 },
        Q: { value: 0 },
        connect() {
          return this as unknown as AudioNode;
        },
      } as unknown as BiquadFilterNode;
    },
    createOscillator() {
      return {
        type: 'sine' as OscillatorType,
        frequency: { value: 0 },
        connect() {
          return this as unknown as AudioNode;
        },
        start(t: number) {
          events.push(`osc start ${t}`);
        },
        stop(t: number) {
          events.push(`osc stop ${t}`);
        },
      } as unknown as OscillatorNode;
    },
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
        connect() {
          return this as unknown as AudioNode;
        },
      } as unknown as GainNode;
    },
  } as unknown as BaseAudioContext & { events: string[] };
  (ctx as unknown as { events: string[] }).events = events;
  return { ctx, events };
}

describe('effects', () => {
  it('all six names have effect fns', () => {
    for (const name of EFFECT_NAMES) {
      const fn = getEffectFn(name);
      expect(typeof fn).toBe('function');
    }
  });

  for (const name of EFFECT_NAMES.filter((n) => n !== 'none')) {
    it(`${name} schedules audible nodes (<300ms, non-silent)`, () => {
      const { ctx, events } = mockAudioCtx();
      const fn = getEffectFn(name as unknown as never);
      fn(ctx, 0.5);
      // should have scheduled at least one start
      expect(events.length).toBeGreaterThan(0);
      // check max stop time < 300ms after start
      const stops = events.filter((e) => e.includes('stop')).map((e) => Number(e.split(' ')[2]));
      const starts = events.filter((e) => e.includes('start')).map((e) => Number(e.split(' ')[2]));
      if (stops.length > 0) {
        const maxDur = Math.max(...stops) - Math.min(...starts);
        expect(maxDur).toBeLessThan(0.3);
        expect(maxDur).toBeGreaterThan(0);
      }
    });
  }

  it('none is silent (no events)', () => {
    const { ctx, events } = mockAudioCtx();
    const fn = getEffectFn('none');
    fn(ctx, 0.2);
    expect(events.length).toBe(0);
  });

  it('effects are distinct (different event counts or timings)', () => {
    const counts = new Map<string, number>();
    for (const name of EFFECT_NAMES) {
      const { ctx, events } = mockAudioCtx();
      getEffectFn(name)(ctx, 0);
      counts.set(name, events.length);
    }
    // none should be 0, others >0 and at least two different counts
    expect(counts.get('none')).toBe(0);
    const nonNone = [...counts.entries()].filter(([k]) => k !== 'none').map(([, v]) => v);
    expect(new Set(nonNone).size).toBeGreaterThan(1);
  });
});
