// src/encode/webmEncoder.ts — MediaRecorder → WebM fallback

import type { Timeline, ParsedInput, RenderDims } from '../types.ts';
import { drawFrame } from '../render/drawFrame.ts';

export interface WebMEncodeOpts {
  dims: RenderDims;
  fps: number;
  audioBuffer?: AudioBuffer | null;
  onProgress?: (ratio: number) => void;
}

export function isWebMSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const MR = (window as unknown as { MediaRecorder?: typeof MediaRecorder }).MediaRecorder;
  if (!MR) return false;
  try {
    return MR.isTypeSupported('video/webm;codecs=vp9') || MR.isTypeSupported('video/webm');
  } catch {
    return false;
  }
}

export async function encodeWebM(
  timeline: Timeline,
  parsed: ParsedInput,
  opts: WebMEncodeOpts,
): Promise<Blob> {
  if (!isWebMSupported()) {
    throw new Error('MediaRecorder WebM not supported in this browser.');
  }

  const { dims, fps, audioBuffer, onProgress } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not supported');

  const stream = (
    canvas as unknown as { captureStream: (fps: number) => MediaStream }
  ).captureStream(fps);
  // Mix audio if provided
  let audioCtx: AudioContext | null = null;
  if (audioBuffer) {
    audioCtx = new AudioContext({ sampleRate: audioBuffer.sampleRate });
    const dest = audioCtx.createMediaStreamDestination();
    const src = audioCtx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(dest);
    src.start();
    for (const track of dest.stream.getAudioTracks()) stream.addTrack(track);
  }

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
  const chunks: BlobPart[] = [];

  return new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = () => reject(new Error('MediaRecorder error'));
    recorder.onstop = () => {
      if (audioCtx) void audioCtx.close();
      for (const t of stream.getTracks()) t.stop();
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    recorder.start(100);

    let idx = 0;
    const total = timeline.length;
    const frameDur = 1000 / fps;

    function drawNext(): void {
      if (idx >= total) {
        // allow a bit extra to flush
        setTimeout(() => recorder.stop(), 200);
        return;
      }
      const spec = timeline[idx];
      drawFrame(ctx as CanvasRenderingContext2D, spec, parsed, dims);
      if (onProgress) onProgress((idx + 1) / total);
      idx++;
      setTimeout(drawNext, frameDur);
    }

    drawNext();
  });
}
