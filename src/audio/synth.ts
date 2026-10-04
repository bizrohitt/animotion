// src/audio/synth.ts — Web Audio primitives (synthesized, no samples)

export function makeNoiseBuffer(ctx: BaseAudioContext, durationSec: number, seed = 0): AudioBuffer {
  const len = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  // seeded pseudo-random for determinism
  let t = seed >>> 0 || 1;
  for (let i = 0; i < len; i++) {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    const v = ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    data[i] = v * 2 - 1;
  }
  return buf;
}

export function envelope(
  gain: GainNode,
  at: number,
  attack = 0.005,
  decay = 0.12,
  peak = 0.9,
): void {
  const g = gain.gain;
  g.setValueAtTime(0, at);
  g.linearRampToValueAtTime(peak, at + attack);
  g.exponentialRampToValueAtTime(0.001, at + decay);
}

export function filteredNoise(
  ctx: BaseAudioContext,
  durationSec: number,
  freq: number,
  q = 1,
  type: BiquadFilterType = 'bandpass',
  seed = 0,
): { source: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode } {
  const buf = makeNoiseBuffer(ctx, durationSec, seed);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const gain = ctx.createGain();
  return { source: src, filter, gain };
}

export function sineBlip(
  ctx: BaseAudioContext,
  freq: number,
  durationSec: number,
): { osc: OscillatorNode; gain: GainNode } {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const gain = ctx.createGain();
  osc.connect(gain);
  void durationSec;
  return { osc, gain };
}
