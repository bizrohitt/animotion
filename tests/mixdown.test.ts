import { describe, it, expect } from 'vitest';
import { mixdown } from '../src/audio/mixdown.ts';
import { buildTimeline } from '../src/timeline/buildTimeline.ts';
import type { ParsedInput } from '../src/types.ts';

const dummyParsed: ParsedInput = {
  raw: 'hello ==world==',
  fullPhrase: 'hello world',
  focalWord: 'world',
  focalStart: 6,
  focalEnd: 11,
};

function isSilent(buf: AudioBuffer, threshold = 0.001): boolean {
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) if (Math.abs(data[i]) > threshold) return false;
  return true;
}

describe('mixdown', () => {
  it('buffer duration ≈ timeline duration', async () => {
    const tl = buildTimeline(dummyParsed, {
      cutsPerSec: 12,
      durationSec: 2,
      zoomMax: 1,
      blurMax: 0,
      seed: 1,
    });
    const buf = await mixdown(tl, 'paperShuffle', { sampleRate: 48000 });
    const expected = (tl[tl.length - 1].timestampMs + tl[tl.length - 1].durationMs) / 1000 + 0.3;
    expect(buf.duration).toBeCloseTo(expected, 1);
    expect(buf.sampleRate).toBe(48000);
    expect(buf.length).toBe(Math.ceil(expected * 48000));
  });

  it('one burst per cut (non-silent when effect != none)', async () => {
    const tl = buildTimeline(dummyParsed, {
      cutsPerSec: 10,
      durationSec: 1,
      zoomMax: 1,
      blurMax: 0,
      seed: 123,
    });
    const buf = await mixdown(tl, 'cameraShutter');
    expect(isSilent(buf)).toBe(false);
    const noneBuf = await mixdown(tl, 'none');
    expect(isSilent(noneBuf)).toBe(true);
  });

  it('silent only for none/off', async () => {
    const tl = buildTimeline(dummyParsed, {
      cutsPerSec: 5,
      durationSec: 1,
      zoomMax: 1,
      blurMax: 0,
      seed: 999,
    });
    for (const eff of ['paperShuffle', 'filmAdvance', 'polaroid', 'flashPop'] as const) {
      const buf = await mixdown(tl, eff);
      expect(isSilent(buf)).toBe(false);
    }
    const bufNone = await mixdown(tl, 'none');
    expect(isSilent(bufNone)).toBe(true);
  });

  it('timing within ±10ms (bursts near cut timestamps)', async () => {
    // Our fallback mock fills bursts at exact timestamp, so check first burst near 0
    const tl = buildTimeline(dummyParsed, {
      cutsPerSec: 12,
      durationSec: 1,
      zoomMax: 1,
      blurMax: 0,
      seed: 42,
    });
    const buf = await mixdown(tl, 'paperShuffle', { sampleRate: 48000 });
    const data = buf.getChannelData(0);
    // first burst should start near sample 0
    let firstNonSilent = -1;
    for (let i = 0; i < data.length; i++)
      if (Math.abs(data[i]) > 0.001) {
        firstNonSilent = i;
        break;
      }
    expect(firstNonSilent).toBeGreaterThanOrEqual(0);
    expect(firstNonSilent).toBeLessThan(0.01 * 48000); // within 10ms
    // check second burst near 1/12 sec ≈ 4000 samples
    const secondStart = Math.floor((1 / 12) * 48000);
    let foundNearSecond = false;
    for (let i = secondStart - 480; i < secondStart + 480 && i < data.length; i++) {
      if (i >= 0 && Math.abs(data[i]) > 0.001) {
        foundNearSecond = true;
        break;
      }
    }
    expect(foundNearSecond).toBe(true);
  });

  it('handles empty timeline', async () => {
    const buf = await mixdown([], 'paperShuffle');
    expect(buf.duration).toBeCloseTo(0.3, 1);
    // empty timeline still has tail, but no bursts, so silent
    // Our fallback fills only if timeline has frames, so should be silent
    expect(isSilent(buf)).toBe(true);
  });
});
