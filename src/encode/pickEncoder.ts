// src/encode/pickEncoder.ts — choose best encoder (stub for T-060, full at T-061)

import type { Timeline, ParsedInput, RenderDims } from '../types.ts';
import { encodeWebM, isWebMSupported } from './webmEncoder.ts';

export type EncodeFn = (
  timeline: Timeline,
  parsed: ParsedInput,
  opts: {
    dims: RenderDims;
    fps: number;
    audioBuffer?: AudioBuffer | null;
    onProgress?: (r: number) => void;
  },
) => Promise<Blob>;

export function isWebCodecsSupported(): boolean {
  return typeof window !== 'undefined' && 'VideoEncoder' in window && 'AudioEncoder' in window;
}

export function pickEncoder(): { fn: EncodeFn; mimeType: string; ext: string } {
  // T-060: only WebM available. T-061 will add MP4 via WebCodecs.
  if (isWebMSupported()) {
    return { fn: encodeWebM as unknown as EncodeFn, mimeType: 'video/webm', ext: 'webm' };
  }
  throw new Error(
    'No supported encoder. Use a browser with MediaRecorder (WebM) or WebCodecs (MP4).',
  );
}

export async function encodeWithFallback(
  timeline: Timeline,
  parsed: ParsedInput,
  opts: {
    dims: RenderDims;
    fps: number;
    audioBuffer?: AudioBuffer | null;
    onProgress?: (r: number) => void;
  },
): Promise<{ blob: Blob; mimeType: string; ext: string }> {
  const pick = pickEncoder();
  const blob = await pick.fn(timeline, parsed, opts);
  return { blob, mimeType: pick.mimeType, ext: pick.ext };
}
