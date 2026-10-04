// src/main.ts — wiring only (<150 lines)
import { parseInput } from './parser/parseInput.ts';
import { buildTimeline } from './timeline/buildTimeline.ts';
import { drawFrame, ensureFontsLoaded } from './render/drawFrame.ts';
import { setProgress } from './ui/progress.ts';
import { renderExamples } from './ui/examples.ts';
import { ASPECT_DIMS, DEFAULTS, LIMITS } from './config.ts';
import type { Timeline } from './types.ts';

const input = document.getElementById('phraseInput') as HTMLInputElement | null;
const counter = document.getElementById('charCounter') as HTMLElement | null;
const errEl = document.getElementById('error') as HTMLElement | null;
const canvas = document.getElementById('preview') as HTMLCanvasElement | null;
const ctx = canvas?.getContext('2d') ?? null;
const progressWrap = document.getElementById('progressWrap') as HTMLElement | null;
const btnGen = document.getElementById('btnGenerate') as HTMLButtonElement | null;
const btnReg = document.getElementById('btnRegenerate') as HTMLButtonElement | null;
const exWrap = document.getElementById('examples') as HTMLElement | null;

const dims = ASPECT_DIMS['9:16'];
if (canvas) {
  canvas.width = dims.width / 2;
  canvas.height = dims.height / 2;
}
let seed = DEFAULTS.seed;
let timeline: Timeline = [];
let parsed: import('./types.ts').ParsedInput | null = null;
let raf = 0;
let startMs = 0;

const progressEl = document.createElement('div');
progressEl.style.height = '6px';
progressEl.style.background = '#111';
progressEl.style.width = '0%';
if (progressWrap) progressWrap.appendChild(progressEl);

function updateCounter(raw: string): void {
  if (!counter) return;
  const r = parseInput(raw);
  const n = r.ok ? r.parsed.focalWord.length : 0;
  counter.textContent = `${n}/${LIMITS.focalMaxChars}`;
  counter.style.color = n > LIMITS.focalMaxChars ? 'crimson' : '';
}

function showPlaceholder(msg: string): void {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f9f9f9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#888';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
}

async function build(raw: string): Promise<boolean> {
  const res = parseInput(raw);
  if (!res.ok) {
    if (errEl) errEl.textContent = res.error;
    showPlaceholder('Type ==word== to preview');
    return false;
  }
  if (errEl) errEl.textContent = '';
  parsed = res.parsed;
  timeline = buildTimeline(parsed, {
    cutsPerSec: DEFAULTS.cutsPerSec,
    durationSec: DEFAULTS.durationSec,
    zoomMax: DEFAULTS.zoomMax,
    blurMax: DEFAULTS.blurMax,
    seed,
  });
  const fonts = [...new Set(timeline.map((f) => f.fontFamily))];
  await ensureFontsLoaded(fonts);
  return true;
}

function loop(now: number): void {
  if (!ctx || !canvas || timeline.length === 0 || !parsed) return;
  if (startMs === 0) startMs = now;
  const elapsed = now - startMs;
  const frameDur = 1000 / DEFAULTS.cutsPerSec;
  const idx = Math.floor(elapsed / frameDur) % timeline.length;
  const spec = timeline[idx];
  const previewDims = { width: canvas.width, height: canvas.height, aspect: '9:16' as const };
  drawFrame(ctx, spec, parsed, previewDims);
  setProgress(progressEl, (idx + 1) / timeline.length);
  raf = requestAnimationFrame(loop);
}

function startLoop(): void {
  cancelAnimationFrame(raf);
  startMs = 0;
  raf = requestAnimationFrame(loop);
}

async function onGenerate(): Promise<void> {
  if (!input) return;
  updateCounter(input.value);
  if (await build(input.value)) startLoop();
}

function init(): void {
  if (!input || !ctx) return;
  input.value = 'Markets jittery. ==TACO again==.';
  if (exWrap)
    renderExamples(exWrap, (t) => {
      input.value = t;
      void onGenerate();
    });
  updateCounter(input.value);
  void onGenerate();
  input.addEventListener('input', () => updateCounter(input.value));
  btnGen?.addEventListener('click', () => {
    seed = (seed + 1) >>> 0;
    void onGenerate();
  });
  btnReg?.addEventListener('click', () => {
    seed = (seed + 54321) >>> 0;
    void onGenerate();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
      e.preventDefault();
      input.focus();
    }
  });
}
init();
