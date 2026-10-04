// src/timeline/buildTimeline.ts — cuts/s → FrameSpec[]

import type { ParsedInput, Timeline, TimelineOpts } from '../types.ts';
import { createRNG, pickLayout, randomRotation } from '../layout/layoutEngine.ts';
import { generateFillerLines } from '../layout/fillerText.ts';
import { LIMITS } from '../config.ts';

export function buildTimeline(parsed: ParsedInput, opts: TimelineOpts): Timeline {
  const cuts = Math.max(
    LIMITS.cutsPerSec.min,
    Math.min(LIMITS.cutsPerSec.max, Math.round(opts.cutsPerSec)),
  );
  const duration = Math.max(
    LIMITS.durationSec.min,
    Math.min(LIMITS.durationSec.max, opts.durationSec),
  );
  const zoomMax = Math.max(LIMITS.zoom.min, Math.min(LIMITS.zoom.max, opts.zoomMax));
  const blurMax = Math.max(LIMITS.blur.min, Math.min(LIMITS.blur.max, opts.blurMax));

  const frameCount = Math.max(1, Math.round(cuts * duration));
  const frameDur = 1000 / cuts;

  const rng = createRNG(opts.seed >>> 0);
  const timeline: Timeline = [];

  let prevId: string | null = null;
  const tailStart = Math.floor(frameCount * 0.8);

  for (let i = 0; i < frameCount; i++) {
    const preset = pickLayout(rng, prevId);
    prevId = preset.id;

    const rotation = randomRotation(rng, preset);
    const fillerLines = generateFillerLines(rng, 4);

    // zoom ramp in last 20%
    let zoom = 1;
    if (i >= tailStart && frameCount > tailStart) {
      const tailLen = frameCount - tailStart;
      const t = (i - tailStart) / Math.max(1, tailLen - 1); // 0..1
      zoom = 1 + t * (zoomMax - 1);
    }

    const blur = blurMax > 0 ? rng.next() * blurMax * 0.6 : 0;

    timeline.push({
      index: i,
      timestampMs: Math.round(i * frameDur),
      durationMs: Math.round(frameDur),
      fontFamily: preset.fontFamily,
      fontWeight: preset.fontWeight,
      paperStyle: preset.paperStyle,
      rotation,
      highlightStyle: preset.highlightStyle,
      fillerLines,
      zoom,
      blur,
    });
  }

  // attach parsed for convenience? not needed — caller keeps parsed separate
  void parsed;

  return timeline;
}

export function getTimelineDuration(timeline: Timeline): number {
  if (timeline.length === 0) return 0;
  const last = timeline[timeline.length - 1];
  return (last.timestampMs + last.durationMs) / 1000;
}
