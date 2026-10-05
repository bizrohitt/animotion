// src/types.ts — shared interfaces for MatchCutter
// All modules talk only through these types. No circular imports.

export type AspectRatio = '9:16' | '1:1' | '16:9';

export type VideoFormat = 'mp4' | 'webm';

export type ExportQuality = '720p' | '1080p' | '4K';

export type SoundEffect =
  'paperShuffle' | 'cameraShutter' | 'filmAdvance' | 'polaroid' | 'flashPop' | 'none';

export type HighlightStyle = 'marker' | 'underline' | 'box';

export interface ParsedInput {
  raw: string;
  fullPhrase: string; // phrase without == markers
  focalWord: string;
  focalStart: number; // index in fullPhrase
  focalEnd: number; // exclusive
}

export type ParseResult = { ok: true; parsed: ParsedInput } | { ok: false; error: string };

export interface PaperStyle {
  id: string;
  tint: string; // css color hex
  grain: number; // 0-1 noise intensity
}

export interface LayoutPreset {
  id: string;
  fontFamily: string;
  fontWeight: number;
  paperStyle: PaperStyle;
  rotationDeg: [number, number]; // min/max
  highlightStyle: HighlightStyle;
}

export interface FrameSpec {
  index: number;
  timestampMs: number; // start time in ms
  durationMs: number; // per-frame duration
  fontFamily: string;
  fontWeight: number;
  paperStyle: PaperStyle;
  rotation: number; // degrees
  highlightStyle: HighlightStyle;
  fillerLines: string[];
  zoom: number; // 1.0 = no zoom
  blur: number; // 0-3 px
}

export type Timeline = FrameSpec[];

export interface TimelineOpts {
  cutsPerSec: number; // 4-30
  durationSec: number; // 1-5
  zoomMax: number; // 1.0-3.0
  blurMax: number; // 0-3
  seed: number; // u32
}

export interface RenderDims {
  width: number;
  height: number;
  aspect: AspectRatio;
}

export interface EncodeOpts {
  dims: RenderDims;
  fps: number; // equals cutsPerSec
  onProgress?: (p: number) => void;
}

export interface EncodeResult {
  blob: Blob;
  filename: string;
  mimeType: string;
  durationSec: number;
}

export interface RNG {
  /** float in [0,1) */
  next(): number;
  /** int in [0, max) — max exclusive */
  nextInt(max: number): number;
  /** fork new RNG from current state */
  fork?(): RNG;
}

export interface SupportGate {
  enabled: boolean;
  render(container: HTMLElement): void;
  on(event: string, handler: () => void): void;
  off?(event: string, handler: () => void): void;
}

export interface Anchor {
  cx: number;
  cy: number;
}

export interface AppConfig {
  aspect: AspectRatio;
  format: VideoFormat;
  exportQuality: ExportQuality;
  soundEnabled: boolean;
  soundEffect: SoundEffect;
  cutsPerSec: number;
  zoomMax: number;
  blurMax: number;
  durationSec: number;
  lockedFont: string; // 'auto' or exact fontFamily from presets
}
