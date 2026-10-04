// src/main.ts — wiring only (<150 lines)
import { parseInput } from './parser/parseInput.ts';
import { createRNG, pickLayout, randomRotation } from './layout/layoutEngine.ts';
import { generateFillerLines } from './layout/fillerText.ts';
import { drawFrame, ensureFontsLoaded } from './render/drawFrame.ts';
import type { FrameSpec } from './types.ts';
import { LAYOUT_PRESETS } from './layout/layoutPresets.ts';
import { ASPECT_DIMS, LIMITS } from './config.ts';

const input = document.getElementById('phraseInput') as HTMLInputElement | null;
const counter = document.getElementById('charCounter') as HTMLElement | null;
const errEl = document.getElementById('error') as HTMLElement | null;
const canvas = document.getElementById('preview') as HTMLCanvasElement | null;
const ctx = canvas?.getContext('2d') ?? null;

const dims = ASPECT_DIMS['9:16'];
if (canvas) {
  canvas.width = dims.width / 2;
  canvas.height = dims.height / 2;
}

let seed = 123456;

function updateCounter(raw: string): void {
  if (!counter) return;
  const r = parseInput(raw);
  const n = r.ok ? r.parsed.focalWord.length : 0;
  counter.textContent = `${n}/${LIMITS.focalMaxChars}`;
  counter.style.color = n > LIMITS.focalMaxChars ? 'crimson' : '';
}

async function renderPreview(raw: string): Promise<void> {
  if (!ctx || !canvas) return;
  const res = parseInput(raw);
  if (!res.ok) {
    if (errEl) errEl.textContent = res.error;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#888';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Type ==word== to preview', canvas.width / 2, canvas.height / 2);
    return;
  }
  if (errEl) errEl.textContent = '';
  const rng = createRNG(seed);
  const preset = pickLayout(rng, null);
  const rotation = randomRotation(rng, preset);
  const filler = generateFillerLines(rng, 4);
  const spec: FrameSpec = {
    index: 0,
    timestampMs: 0,
    durationMs: 83,
    fontFamily: preset.fontFamily,
    fontWeight: preset.fontWeight,
    paperStyle: preset.paperStyle,
    rotation,
    highlightStyle: preset.highlightStyle,
    fillerLines: filler,
    zoom: 1,
    blur: 0,
  };
  await ensureFontsLoaded([preset.fontFamily]);
  // Use preview dims (canvas size)
  const previewDims = { width: canvas.width, height: canvas.height, aspect: '9:16' as const };
  drawFrame(ctx, spec, res.parsed, previewDims);
}

function init(): void {
  if (!input || !ctx) return;
  // initial
  input.value = 'Markets jittery. ==TACO again==.';
  updateCounter(input.value);
  void renderPreview(input.value);
  input.addEventListener('input', () => {
    updateCounter(input.value);
    void renderPreview(input.value);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      seed = (seed + 1) >>> 0;
      void renderPreview(input.value);
    }
  });
  // "/" to focus
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
      e.preventDefault();
      input.focus();
    }
  });
  console.log('[MatchCutter] preview ready', LAYOUT_PRESETS.length, 'presets');
}

init();
