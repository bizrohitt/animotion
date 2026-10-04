# Skill: Web Audio Synthesis (Cut Sound Effects)

## Purpose
Synthesize every cut sound effect with the Web Audio API only — no samples — to stay license-clean, then schedule bursts at cut timestamps and render to an AudioBuffer via OfflineAudioContext.

## Rules
1. No external audio files. Synthesize with primitives: `AudioBufferSourceNode` (noise), `BiquadFilterNode`, `GainNode` (envelope), `OscillatorNode` (tone blips). CC0 samples only if source+license recorded in `docs/LICENSES.md` — default to synthesis.
2. Render via `OfflineAudioContext` (48kHz, stereo or mono) so mixdown is offline, deterministic, and fast. One burst per cut at `t = i / cutsPerSec`.
3. Each effect <300ms, non-silent (except `none`), and perceptually distinct.
4. Effects must be selectable: `paper shuffle, camera shutter, film advance, polaroid, flash pop, none` plus `sound on/off`. `none` or `off` → silent buffer.
5. Keep graph simple; disconnect nodes after use; no memory leak.

## Code Patterns (short)

```ts
// noise buffer
function noiseBuffer(ctx: BaseAudioContext, lenSec: number): AudioBuffer {
  const b = ctx.createBuffer(1, ctx.sampleRate*lenSec, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  return b;
}
```

```ts
// envelope
function envelope(gain: GainNode, t: number, attack=0.005, decay=0.12, peak=0.9) {
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak, t+attack);
  gain.gain.exponentialRampToValueAtTime(0.001, t+decay);
}
```

```ts
// schedule one burst at cut time
const src = ctx.createBufferSource(); src.buffer = noiseBuf;
const filt = ctx.createBiquadFilter(); filt.type='bandpass'; filt.frequency.value=1200;
const gain = ctx.createGain(); envelope(gain, t);
src.connect(filt).connect(gain).connect(ctx.destination);
src.start(t);
```

## Recipes (guidance, tweak by ear)
- **paper shuffle:** short white-noise burst (80ms) → lowpass ~900Hz, gentle attack, quick decay.
- **camera shutter:** two clicks: high bandpass noise at `t` + second blip at `t+40ms`, fast attack.
- **film advance:** rapid ticks: 3× 20ms noise + 1× slightly longer, bandpass 1.5-2kHz.
- **polaroid:** soft thud (low sine ~120Hz 60ms) + high-frequency eject swish (filtered noise).
- **flash pop:** bright transient: white noise 40ms + high bandpass, snappy envelope, slight distortion via `WaveShaper` optional.
- **none:** schedule nothing; return near-silent buffer.

## Pitfalls
- `exponentialRampToValueAtTime(0)` throws — ramp to `0.001`.
- `OfflineAudioContext` length must cover `timelineDuration + tail` or last burst is clipped.
- Sample rate mismatch when feeding AudioBuffer to encoder — use 48000 to match AAC config.
- Triggering >30 cuts/s can overlap bursts — keep bursts short or duck gain.

## Definition of Done
- `getEffectFn(name)` returns correct synthesizer; `mixdown()` returns AudioBuffer with one burst per cut, duration ≈ timeline, silent only for `none`/`off`.
- All six options selectable in UI; sound toggle works.
- No fetches; no samples; no GPL.
- Unit tests assert buffer duration and non-silence.
