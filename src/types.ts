// src/types.ts — shared interfaces for MatchCutter
// All modules talk only through these types. No circular imports.

export type AspectRatio = '9:16' | '1:1' | '16:9';

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
  tint: string; // css color
  grain: number; // 0-1
}

export interface LayoutPreset {
  id: string;
  fontFamily: string;
  fontWeight: number;
  paperStyle: PaperStyle;
  rotationDeg: [number, number]; // range
  highlightStyle: HighlightStyle;
}

export interface FrameSpec {
  index: number;
  fontFamily: string;
  fontWeight: number;
  paperStyle: PaperStyle;
  rotation: number; // degrees
  highlightStyle: HighlightStyle;
  fillerLines: string[];
  zoom: number;
  blur: number;
}

export interface TimelineOpts {
  cutsPerSec: number;
  durationSec: number;
  zoomMax: number;
  blurMax: number;
  seed: number;
}

export interface RenderDims {
  width: number;
  height: number;
  aspect: AspectRatio;
}

export interface EncodeResult {
  blob: Blob;
  filename: string;
  mimeType: string;
}

export interface RNG {
  /** float in [0,1) */
  next(): number;
  /** int in [0, max) */
  nextInt(max: number): number;
}

export interface SupportGate {
  enabled: boolean;
  render(container: HTMLElement): void;
  on(event: string, handler: () => void): void;
}
