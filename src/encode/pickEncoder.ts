// src/encode/pickEncoder.ts — choose best encoder (MP4 via WebCodecs, fallback WebM)

import type { Timeline, ParsedInput, RenderDims } from '../types.ts';
import { encodeWebM, isWebMSupported } from './webmEncoder.ts';
import { encodeMP4, isMP4Supported } from './mp4Encoder.ts';

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
  if (isMP4Supported()) {
    return { fn: encodeMP4 as unknown as EncodeFn, mimeType: 'video/mp4', ext: 'mp4' };
  }
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
