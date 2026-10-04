// src/config.ts — constants, presets, limits

import type { AspectRatio, SoundEffect, HighlightStyle, VideoFormat } from './types.ts';

export const APP_NAME = 'MatchCutter';
export const VERSION = '0.1.0';

export const LIMITS = {
  focalMaxChars: 23,
  cutsPerSec: { min: 4, max: 30, default: 12 },
  zoom: { min: 1.0, max: 3.0, default: 1.2 },
  blur: { min: 0, max: 3, default: 0 },
  durationSec: { default: 2, min: 1, max: 5 },
  phraseMaxLen: 120,
} as const;

export const ASPECT_DIMS: Record<AspectRatio, { width: number; height: number }> = {
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
  '16:9': { width: 1920, height: 1080 },
};

export const VIDEO_FORMATS: readonly VideoFormat[] = ['mp4', 'webm'] as const;

export const SOUND_EFFECTS: readonly SoundEffect[] = [
  'paperShuffle',
  'cameraShutter',
  'filmAdvance',
  'polaroid',
  'flashPop',
  'none',
] as const;

export const HIGHLIGHT_STYLES: readonly HighlightStyle[] = ['marker', 'underline', 'box'] as const;

export const FONT_FAMILIES: readonly string[] = [
  '"Playfair Display", serif',
  '"Libre Baskerville", serif',
  '"Old Standard TT", serif',
  '"Special Elite", cursive',
  '"IM Fell English", serif',
  '"Courier Prime", monospace',
] as const;

export const DEFAULTS = {
  aspect: '9:16' as AspectRatio,
  format: 'mp4' as VideoFormat,
  soundEnabled: true,
  soundEffect: 'paperShuffle' as SoundEffect,
  cutsPerSec: 12,
  zoomMax: 1.2,
  blurMax: 0,
  durationSec: 2,
  seed: 0x12345678,
} as const;

export function clampCutsPerSec(n: number): number {
  return Math.max(LIMITS.cutsPerSec.min, Math.min(LIMITS.cutsPerSec.max, Math.round(n)));
}

export function clampZoom(n: number): number {
  return Math.max(LIMITS.zoom.min, Math.min(LIMITS.zoom.max, n));
}

export function clampBlur(n: number): number {
  return Math.max(LIMITS.blur.min, Math.min(LIMITS.blur.max, n));
}
