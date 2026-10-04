import type { LayoutPreset, RNG } from '../types.ts';
import { LAYOUT_PRESETS } from './layoutPresets.ts';

/**
 * mulberry32 PRNG — deterministic, fast, 32-bit.
 * Seed is uint32. Returns float in [0,1).
 */
export function createRNG(seed: number): RNG {
  let t = seed >>> 0;
  return {
    next(): number {
      t += 0x6d2b79f5;
      let x = t;
      x = Math.imul(x ^ (x >>> 15), x | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    },
    nextInt(max: number): number {
      if (max <= 0) return 0;
      return Math.floor(this.next() * max);
    },
  };
}

/**
 * Pick a layout preset, never returning same id as prevId.
 * Uses rng to choose index; re-rolls if collision (at most a few tries).
 */
export function pickLayout(rng: RNG, prevId: string | null): LayoutPreset {
  if (LAYOUT_PRESETS.length === 0) throw new Error('No layout presets');
  if (LAYOUT_PRESETS.length === 1) return LAYOUT_PRESETS[0];

  let idx = rng.nextInt(LAYOUT_PRESETS.length);
  let preset = LAYOUT_PRESETS[idx];
  // Avoid immediate repeat
  let guard = 0;
  while (preset.id === prevId && guard < 10) {
    idx = rng.nextInt(LAYOUT_PRESETS.length);
    preset = LAYOUT_PRESETS[idx];
    guard++;
  }
  // Fallback sequential if still same (extremely unlikely)
  if (preset.id === prevId) {
    const prevIdx = LAYOUT_PRESETS.findIndex((p) => p.id === prevId);
    idx = (prevIdx + 1) % LAYOUT_PRESETS.length;
    preset = LAYOUT_PRESETS[idx];
  }
  return preset;
}

/**
 * Compute rotation in degrees within preset range using rng.
 */
export function randomRotation(rng: RNG, preset: LayoutPreset): number {
  const [min, max] = preset.rotationDeg;
  return min + rng.next() * (max - min);
}

/**
 * Anchor math: compute the x origin so focal word centre lands on cx.
 * measure: (text, font) => width — abstracted for testability.
 * Returns x0 (left origin for fullPhrase).
 *
 * Example: origin = cx - (prefixWidth + focalWidth/2)
 */
export function computeAnchorX(
  fullPhrase: string,
  focalWord: string,
  focalStart: number,
  measure: (text: string) => number,
  cx: number,
): number {
  const prefix = fullPhrase.slice(0, focalStart);
  const prefixW = measure(prefix);
  const focalW = measure(focalWord);
  const focalCenterFromOrigin = prefixW + focalW / 2;
  return cx - focalCenterFromOrigin;
}

/**
 * Full anchor: returns { x, y } where y is baseline so focal word
 * centre lands on cy. For simplicity, y = cy (caller adjusts for font metrics if needed).
 * We expose y computation separately for canvas textBaseline handling.
 */
export function computeAnchor(
  fullPhrase: string,
  focalWord: string,
  focalStart: number,
  measure: (text: string) => number,
  cx: number,
  cy: number,
): { x: number; y: number } {
  const x = computeAnchorX(fullPhrase, focalWord, focalStart, measure, cx);
  // y is cy — caller should use textBaseline middle or adjust via metrics
  return { x, y: cy };
}

/**
 * Verify focal centre given origin x.
 * Returns centre x of focal word when drawn at origin x.
 */
export function focalCenterAtOrigin(
  fullPhrase: string,
  focalWord: string,
  focalStart: number,
  measure: (text: string) => number,
  originX: number,
): number {
  const prefix = fullPhrase.slice(0, focalStart);
  const prefixW = measure(prefix);
  const focalW = measure(focalWord);
  return originX + prefixW + focalW / 2;
}
