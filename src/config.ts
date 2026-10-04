// src/config.ts — constants, presets, limits (stubs for T-001)

export const APP_NAME = 'MatchCutter';
export const VERSION = '0.1.0';

export const LIMITS = {
  focalMaxChars: 23,
  cutsPerSec: { min: 4, max: 30, default: 12 },
  zoom: { min: 1.0, max: 3.0, default: 1.2 },
  blur: { min: 0, max: 3, default: 0 },
  durationSec: { default: 2, min: 1, max: 5 },
} as const;

export const ASPECT_DIMS: Record<
  import('./types.ts').AspectRatio,
  { width: number; height: number }
> = {
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
  '16:9': { width: 1920, height: 1080 },
};

export const DEFAULTS = {
  aspect: '9:16' as const,
  format: 'mp4' as const,
  soundEnabled: true,
  soundEffect: 'paperShuffle' as const,
  cutsPerSec: 12,
  zoomMax: 1.2,
  blurMax: 0,
};
