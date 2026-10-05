// src/encode/pickEncoder.ts — choose best encoder (MP4 via WebCodecs, fallback WebM)

import type { Timeline, ParsedInput, RenderDims, ExportQuality } from '../types.ts';
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
    quality?: ExportQuality;
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
    quality?: ExportQuality;
  },
): Promise<{ blob: Blob; mimeType: string; ext: string }> {
  const pick = pickEncoder();
  try {
    const blob = await pick.fn(timeline, parsed, opts);
    return { blob, mimeType: pick.mimeType, ext: pick.ext };
  } catch (e) {
    // M8: auto-fallback to the other encoder instead of surfacing to caller
    const fallbackFn = pick.ext === 'mp4' ? encodeWebM : encodeMP4;
    const fallbackExt = pick.ext === 'mp4' ? 'webm' : 'mp4';
    const fallbackMime = fallbackExt === 'mp4' ? 'video/mp4' : 'video/webm';
    try {
      const blob = await (fallbackFn as unknown as EncodeFn)(timeline, parsed, opts);
      return { blob, mimeType: fallbackMime, ext: fallbackExt };
    } catch {
      throw e;
    }
  }
}
