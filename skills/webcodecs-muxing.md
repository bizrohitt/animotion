# Skill: WebCodecs Muxing (Encoding Pipeline)

## Purpose

Turn rendered canvases + mixed audio into a downloadable MP4 (WebCodecs + mp4-muxer) with a MediaRecorder→WebM fallback, fully client-side and license-clean.

## Rules

1. Verify `mp4-muxer` (or successor `mediabunny`) license is MIT before installing. Record name, version, license, URL in `docs/LICENSES.md`. If not MIT, pick a MIT alternative or ship WebM-only and document why.
2. Feature-detect: `if ('VideoEncoder' in window && 'AudioEncoder' in window)` → MP4 path; else if `MediaRecorder.isTypeSupported('video/webm')` → WebM; else show user-friendly error.
3. MP4 path: create `VideoEncoder` (H.264 `avc1.4d002a`) + `AudioEncoder` (AAC `mp4a.40.2`), encode each `VideoFrame`/`AudioData` with explicit `timestamp` (µs, monotonic), collect `EncodedVideoChunk`/`EncodedAudioChunk` via `output` callback, feed to `Muxer` (mp4-muxer `ArrayBufferTarget`), then `muxer.finalize()` → `Blob`.
4. Never use `canvas.captureStream()` for MP4 — it is real-time and non-deterministic. Render → `VideoFrame` directly (`new VideoFrame(canvas, {timestamp})`).
5. `await VideoEncoder.flush()` and `AudioEncoder.flush()` before finalize.
6. WebM fallback: `canvas.captureStream(fps)` + mix AudioBuffer via `AudioContext.createMediaStreamDestination()` → `MediaRecorder` → `Blob`. Keep duration deterministic.
7. Always `VideoFrame.close()` after encoding to avoid memory leak.
8. Download via `URL.createObjectURL(blob)` + `<a download>`; `revokeObjectURL` after click.

## Code Patterns (short)

```ts
// feature pick
export async function pickEncoder() {
  if (isWebCodecsSupported()) return encodeMP4;
  if (MediaRecorder.isTypeSupported('video/webm')) return encodeWebM;
  throw new Error('No supported encoder');
}
```

```ts
// VideoEncoder chunk handling
const muxer = new Muxer({
  target: new ArrayBufferTarget(),
  video: { codec: 'avc', width, height },
  audio: { codec: 'aac', sampleRate: 48000 },
});
const vEnc = new VideoEncoder({
  output: (chunk, md) => muxer.addVideoChunk(chunk, md),
  error: (e) => reject(e),
});
vEnc.configure({ codec: 'avc1.4d002a', width, height, bitrate: 4_000_000, framerate: cps });
for (const vf of frames) {
  vEnc.encode(vf);
  vf.close();
}
await vEnc.flush();
```

## Pitfalls

- Codec string unsupported on some devices — wrap `configure` in try/catch and fall back.
- Forgetting `VideoFrame.close()` leaks GPU memory and crashes on long videos.
- `AudioEncoder` needs correct `numberOfChannels`/`sampleRate` matching the AudioBuffer.
- MP4 duration mismatch if timestamps not monotonic or not in µs.
- `mp4-muxer` API changed across versions — pin version and test.

## Definition of Done

- On WebCodecs browsers: MP4 Blob plays in Chrome/VLC, H.264+AAC, duration correct.
- On non-WebCodecs browsers: WebM Blob downloads via fallback.
- Clear error message if neither available.
- `docs/LICENSES.md` documents muxer choice with license verification.
- Encode <15s for ~2s×12fps on mid-range laptop.
