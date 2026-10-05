// src/encode/mp4Encoder.ts — WebCodecs + mp4-muxer (MIT) → MP4

import type { Timeline, ParsedInput, RenderDims } from '../types.ts';
import { drawFrame } from '../render/drawFrame.ts';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

export interface MP4EncodeOpts {
  dims: RenderDims;
  fps: number;
  audioBuffer?: AudioBuffer | null;
  onProgress?: (ratio: number) => void;
}

export function isMP4Supported(): boolean {
  return typeof window !== 'undefined' && 'VideoEncoder' in window && 'AudioEncoder' in window;
}

export async function encodeMP4(
  timeline: Timeline,
  parsed: ParsedInput,
  opts: MP4EncodeOpts,
): Promise<Blob> {
  if (!isMP4Supported()) {
    throw new Error('WebCodecs not supported (VideoEncoder/AudioEncoder missing).');
  }
  if (timeline.length === 0) throw new Error('Empty timeline');

  const { dims, fps, audioBuffer, onProgress } = opts;
  const width = dims.width;
  const height = dims.height;

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: 'avc', width, height },
    audio: audioBuffer
      ? {
          codec: 'aac',
          sampleRate: audioBuffer.sampleRate,
          numberOfChannels: audioBuffer.numberOfChannels,
        }
      : undefined,
    fastStart: 'in-memory',
  });

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error('VideoEncoder error', e),
  });

  // Bitrate: 6 Mbps for 1080p, 16 Mbps for 4K (crisp text needs high)
  const is4K = width >= 3000 || height >= 3000 || width * height >= 3840 * 2160;
  const bitrate = is4K ? 16_000_000 : 6_000_000;
  const videoCodec = 'avc1.4d002a';
  try {
    videoEncoder.configure({
      codec: videoCodec,
      width,
      height,
      bitrate,
      framerate: fps,
    });
  } catch (e) {
    throw new Error(`VideoEncoder configure failed for ${videoCodec}`, {
      // eslint-disable-next-line preserve-caught-error
      cause: e as Error,
    });
  }

  let audioEncoder: AudioEncoder | null = null;
  if (audioBuffer) {
    audioEncoder = new AudioEncoder({
      output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
      error: (e) => console.error('AudioEncoder error', e),
    });
    audioEncoder.configure({
      codec: 'mp4a.40.2',
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
      bitrate: 128000,
    });
  }

  // Encode audio first (if any)
  if (audioBuffer && audioEncoder) {
    const numSamples = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    // Chunk audio into 1024 samples per AudioData
    const chunkSize = 1024;
    for (let i = 0; i < numSamples; i += chunkSize) {
      const frames = Math.min(chunkSize, numSamples - i);
      const data = new Float32Array(frames * audioBuffer.numberOfChannels);
      for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
        const channel = audioBuffer.getChannelData(ch);
        for (let j = 0; j < frames; j++)
          data[j * audioBuffer.numberOfChannels + ch] = channel[i + j] ?? 0;
      }
      // WebCodecs expects planar? For simplicity use interleaved and let encoder handle
      // Create AudioData — feature may need AudioData support
      try {
        const audioData = new AudioData({
          format: 'f32',
          sampleRate,
          numberOfFrames: frames,
          numberOfChannels: audioBuffer.numberOfChannels,
          timestamp: (i / sampleRate) * 1_000_000,
          data,
        });
        audioEncoder.encode(audioData);
        audioData.close();
      } catch {
        // Fallback: skip audio if AudioData not supported
        break;
      }
    }
    await audioEncoder.flush();
    audioEncoder.close();
  }

  // Create canvas for rendering
  const canvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(width, height)
      : document.createElement('canvas');
  if (!(canvas instanceof OffscreenCanvas)) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = (canvas as unknown as HTMLCanvasElement).getContext(
    '2d',
  ) as CanvasRenderingContext2D | null;
  if (!ctx) throw new Error('Canvas 2D not available');

  for (let i = 0; i < timeline.length; i++) {
    const spec = timeline[i];
    // clear and draw
    drawFrame(ctx as CanvasRenderingContext2D, spec, parsed, dims);
    // VideoFrame from canvas
    const timestamp = spec.timestampMs * 1000; // µs
    const frame = new VideoFrame(canvas as unknown as CanvasImageSource, {
      timestamp,
      duration: spec.durationMs * 1000,
    });
    videoEncoder.encode(frame, { keyFrame: i === 0 });
    frame.close();
    if (onProgress) onProgress((i + 1) / timeline.length);
  }

  await videoEncoder.flush();
  videoEncoder.close();
  muxer.finalize();

  const buffer = target.buffer;
  if (!buffer) throw new Error('Muxer produced empty buffer');
  return new Blob([buffer], { type: 'video/mp4' });
}
