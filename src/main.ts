// src/main.ts — wiring only (<150 lines)
import { parseInput } from './parser/parseInput.ts';
import { buildTimeline } from './timeline/buildTimeline.ts';
import { drawFrame, ensureFontsLoaded } from './render/drawFrame.ts';
import { setProgress } from './ui/progress.ts';
import { renderExamples } from './ui/examples.ts';
import { triggerDownload, filenameFor } from './ui/download.ts';
import { mixdown } from './audio/mixdown.ts';
import { encodeWebM } from './encode/webmEncoder.ts';
import { encodeMP4 } from './encode/mp4Encoder.ts';
import { updateCounter, wrapSelection, getControls, setupControls } from './ui/form.ts';
import { setupShortcuts } from './ui/shortcuts.ts';
import { ASPECT_DIMS, DEFAULTS } from './config.ts';
import type { Timeline } from './types.ts';

const input = document.getElementById('phraseInput') as HTMLInputElement | null;
const counter = document.getElementById('charCounter') as HTMLElement | null;
const errEl = document.getElementById('error') as HTMLElement | null;
const canvas = document.getElementById('preview') as HTMLCanvasElement | null;
const ctx = canvas?.getContext('2d') ?? null;
const progressWrap = document.getElementById('progressWrap') as HTMLElement | null;
const btnGen = document.getElementById('btnGenerate') as HTMLButtonElement | null;
const btnReg = document.getElementById('btnRegenerate') as HTMLButtonElement | null;
const btnDl = document.getElementById('btnDownload') as HTMLButtonElement | null;
const btnHi = document.getElementById('btnHighlight') as HTMLButtonElement | null;
const exWrap = document.getElementById('examples') as HTMLElement | null;

if (canvas) {
  const d = ASPECT_DIMS[DEFAULTS.aspect];
  canvas.width = d.width / 2;
  canvas.height = d.height / 2;
}
let seed = DEFAULTS.seed,
  timeline: Timeline = [],
  parsed: import('./types.ts').ParsedInput | null = null,
  raf = 0,
  startMs = 0;
const progressEl = document.createElement('div');
progressEl.style.height = '6px';
progressEl.style.background = '#111';
progressEl.style.width = '0%';
if (progressWrap) progressWrap.appendChild(progressEl);

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
  const c = getControls();
  timeline = buildTimeline(parsed, {
    cutsPerSec: c.cutsPerSec,
    durationSec: c.durationSec,
    zoomMax: c.zoomMax,
    blurMax: c.blurMax,
    seed,
  });
  await ensureFontsLoaded([...new Set(timeline.map((f) => f.fontFamily))]);
  return true;
}
function loop(now: number): void {
  if (!ctx || !canvas || timeline.length === 0 || !parsed) return;
  if (startMs === 0) startMs = now;
  const c = getControls();
  const idx = Math.floor((now - startMs) / (1000 / c.cutsPerSec)) % timeline.length;
  drawFrame(ctx, timeline[idx], parsed, {
    width: canvas.width,
    height: canvas.height,
    aspect: c.aspect,
  });
  setProgress(progressEl, (idx + 1) / timeline.length);
  raf = requestAnimationFrame(loop);
}
function startLoop(): void {
  cancelAnimationFrame(raf);
  startMs = 0;
  raf = requestAnimationFrame(loop);
}
async function onGenerate(): Promise<void> {
  if (!input || !counter) return;
  updateCounter(input, counter);
  if (await build(input.value)) startLoop();
}
async function onDownload(): Promise<void> {
  if (!parsed || timeline.length === 0) {
    if (errEl) errEl.textContent = 'Generate preview first.';
    return;
  }
  if (btnDl) btnDl.disabled = true;
  try {
    setProgress(progressEl, 0);
    if (errEl) errEl.textContent = 'Mixing audio...';
    const c = getControls();
    const audioBuf = await mixdown(timeline, c.soundEnabled ? c.soundEffect : 'none');
    if (errEl) errEl.textContent = 'Encoding video...';
    const d = ASPECT_DIMS[c.aspect];
    const fullDims = { width: d.width, height: d.height, aspect: c.aspect } as const;
    const encode = c.format === 'webm' ? encodeWebM : encodeMP4;
    let blob: Blob;
    let ext = c.format;
    try {
      blob = await encode(timeline, parsed, {
        dims: fullDims,
        fps: c.cutsPerSec,
        audioBuffer: audioBuf,
        onProgress: (r) => setProgress(progressEl, r),
      });
    } catch {
      const fallback = c.format === 'mp4' ? encodeWebM : encodeMP4;
      blob = await fallback(timeline, parsed, {
        dims: fullDims,
        fps: c.cutsPerSec,
        audioBuffer: audioBuf,
        onProgress: (r) => setProgress(progressEl, r),
      });
      ext = c.format === 'mp4' ? 'webm' : 'mp4';
    }
    triggerDownload(blob, filenameFor(ext));
    if (errEl)
      errEl.textContent = `Downloaded ${ext.toUpperCase()} (${Math.round(blob.size / 1024)} KB)`;
    setProgress(progressEl, 1);
  } catch (e) {
    if (errEl) errEl.textContent = String((e as Error).message);
  } finally {
    if (btnDl) btnDl.disabled = false;
  }
}
function init(): void {
  if (!input || !ctx || !counter) return;
  input.value = 'Markets jittery. ==TACO again==.';
  if (exWrap)
    renderExamples(exWrap, (t) => {
      input.value = t;
      void onGenerate();
    });
  updateCounter(input, counter);
  void onGenerate();
  input.addEventListener('input', () => updateCounter(input, counter));
  btnGen?.addEventListener('click', () => {
    seed = (seed + 1) >>> 0;
    void onGenerate();
  });
  btnReg?.addEventListener('click', () => {
    seed = (seed + 54321) >>> 0;
    void onGenerate();
  });
  btnDl?.addEventListener('click', () => void onDownload());
  btnHi?.addEventListener('click', () => {
    wrapSelection(input);
    updateCounter(input, counter);
    void onGenerate();
  });
  setupShortcuts(input);
  setupControls(() => void onGenerate());
}
init();
