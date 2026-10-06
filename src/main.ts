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
import { getPhraseFromURL, setPhraseInURL, copyShareLink } from './ui/share.ts';
import { saveRecent, renderRecent, loadRecent } from './ui/history.ts';
import { createFrameCache, drawCachedFrame, type FrameCache } from './render/cache.ts';
import { updateEncodeBadge } from './ui/encodeBadge.ts';
import { exportFramesAsZip } from './encode/zipFallback.ts';
import { updatePosterMeta } from './ui/poster.ts';
import { ASPECT_DIMS, DEFAULTS, getExportDims } from './config.ts';
import { renderTemplates, applyTemplateToForm } from './ui/templates.ts';
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
const recentWrap = document.getElementById('recent') as HTMLElement | null;
const btnCopy = document.getElementById('btnCopyLink') as HTMLButtonElement | null;
const copyFeedback = document.getElementById('copyFeedback') as HTMLElement | null;
const badgeEl = document.getElementById('encodeBadge') as HTMLElement | null;
const templatesGrid = document.getElementById('templatesGrid') as HTMLElement | null;
if (canvas) {
  const d = ASPECT_DIMS[DEFAULTS.aspect];
  canvas.width = d.width / 2;
  canvas.height = d.height / 2;
}
let seed = DEFAULTS.seed,
  timeline: Timeline = [],
  parsed: import('./types.ts').ParsedInput | null = null,
  raf = 0,
  startMs = 0,
  histIdx = -1,
  cache: FrameCache = [],
  previewFps: number = DEFAULTS.cutsPerSec,
  cacheFontScale: number = DEFAULTS.letterSize,
  cacheZoom: number = DEFAULTS.zoomMax,
  cacheBlur: number = DEFAULTS.blurMax,
  cacheCuts: number = DEFAULTS.cutsPerSec,
  cacheTextAlign: string = DEFAULTS.textAlign,
  cacheBold: boolean = DEFAULTS.textBold,
  cacheItalic: boolean = DEFAULTS.textItalic,
  cacheStrike: boolean = DEFAULTS.textStrike,
  cacheUnderline: boolean = DEFAULTS.textUnderline,
  cacheBackground: string = DEFAULTS.templateBackground;
const progressEl =
  (document.getElementById('progressBar') as HTMLElement | null) ??
  (() => {
    const el = document.createElement('div');
    el.className = 'progress-bar';
    el.style.width = '0%';
    if (progressWrap) progressWrap.appendChild(el);
    return el;
  })();
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
  previewFps = c.cutsPerSec;
  timeline = buildTimeline(parsed, {
    cutsPerSec: c.cutsPerSec,
    durationSec: c.durationSec,
    zoomMax: c.zoomMax,
    blurMax: c.blurMax,
    seed,
  });
  if (c.lockedFont && c.lockedFont !== 'auto') {
    timeline = timeline.map((f) => ({ ...f, fontFamily: c.lockedFont }));
  }
  await ensureFontsLoaded([...new Set([...timeline.map((f) => f.fontFamily), '"JetBrains Mono"'])]);
  if (parsed) updatePosterMeta(parsed);
  return true;
}
function loop(now: number): void {
  if (!ctx || !canvas || timeline.length === 0 || !parsed) return;
  if (startMs === 0) startMs = now;
  const c = getControls();
  const fps = previewFps > 0 ? previewFps : c.cutsPerSec;
  const idx = Math.floor((now - startMs) / (1000 / fps)) % timeline.length;
  const liveDims = {
    width: canvas.width,
    height: canvas.height,
    aspect: c.aspect,
    fontScale: c.letterSize,
    textAlign: c.textAlign,
    bold: c.bold,
    italic: c.italic,
    strike: c.strike,
    underline: c.underline,
    templateBackground: c.templateBackground,
  } as const;
  const cacheStale =
    cache.length === timeline.length &&
    (cacheFontScale !== c.letterSize ||
      cacheZoom !== c.zoomMax ||
      cacheBlur !== c.blurMax ||
      cacheCuts !== c.cutsPerSec ||
      cacheTextAlign !== c.textAlign ||
      cacheBold !== c.bold ||
      cacheItalic !== c.italic ||
      cacheStrike !== c.strike ||
      cacheUnderline !== c.underline ||
      cacheBackground !== c.templateBackground);
  if (cache.length === timeline.length && !cacheStale) {
    drawCachedFrame(ctx, cache, idx, canvas.width, canvas.height);
  } else {
    // Live override so slider feels instant even before onGenerate rebuilds timeline
    const base = timeline[idx];
    const t = timeline.length > 1 ? idx / (timeline.length - 1) : 0;
    const liveZoom = 1 + t * (c.zoomMax - 1);
    // keep tiny jitter for feel
    const jitter = c.zoomMax > 1 ? (Math.sin(idx * 12.9898) * 0.5 + 0.5 - 0.5) * 0.02 * (c.zoomMax - 1) : 0;
    const specLive = { ...base, zoom: Math.max(1, Math.min(c.zoomMax, liveZoom + jitter)), blur: c.blurMax > 0 ? (base.blur / (cacheBlur || 1)) * c.blurMax : 0 };
    drawFrame(ctx, specLive, parsed, liveDims);
  }
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
  if (await build(input.value)) {
    // build preview cache (half-res) for instant rAF blit — ~10x faster than per-frame drawFrame
    if (parsed && canvas) {
      const c = getControls();
      const dims = {
        width: canvas.width,
        height: canvas.height,
        aspect: c.aspect,
        fontScale: c.letterSize,
        textAlign: c.textAlign,
        bold: c.bold,
        italic: c.italic,
        strike: c.strike,
        underline: c.underline,
        templateBackground: c.templateBackground,
      } as const;
      const t0 = performance.now();
      try {
        cache = createFrameCache(timeline, parsed, dims);
        cacheFontScale = c.letterSize;
        cacheZoom = c.zoomMax;
        cacheBlur = c.blurMax;
        cacheCuts = c.cutsPerSec;
        cacheTextAlign = c.textAlign;
        cacheBold = c.bold;
        cacheItalic = c.italic;
        cacheStrike = c.strike;
        cacheUnderline = c.underline;
        cacheBackground = c.templateBackground;
      } catch {
        cache = [];
      }
      if (errEl && cache.length > 0) {
        const ms = Math.round(performance.now() - t0);
        // subtle perf hint, only in dev (M10 guard) — import.meta.env may be untyped in tsc
        const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
        if (ms > 500 && isDev) console.warn(`cache built in ${ms}ms for ${timeline.length} frames`);
      }
    } else {
      cache = [];
    }
    startLoop();
    const ok = parsed !== null;
    if (ok) {
      saveRecent(input.value);
      setPhraseInURL(input.value);
      if (recentWrap)
        renderRecent(recentWrap, (p) => {
          input.value = p;
          void onGenerate();
        });
      histIdx = -1;
    }
  } else {
    cache = [];
  }
}
async function onDownload(): Promise<void> {
  if (!parsed || timeline.length === 0) {
    if (errEl) errEl.textContent = 'Generate preview first.';
    return;
  }
  if (btnDl) btnDl.disabled = true;
  const dbg = (...a: unknown[]): void => {
    try { console.log('[MatchCutter download]', ...a); } catch {}
  };
  try {
    setProgress(progressEl, 0);
    if (errEl) errEl.textContent = 'Mixing audio...';
    const c = getControls();
    dbg('controls', c);
    const audioBuf = await mixdown(timeline, c.soundEnabled ? c.soundEffect : 'none');
    dbg('mixdown done', audioBuf?.duration, audioBuf?.sampleRate);
    if (errEl) errEl.textContent = 'Encoding video...';
    const exp = getExportDims(c.aspect, c.exportQuality);
    const fullDims = {
      width: exp.width,
      height: exp.height,
      aspect: c.aspect,
      fontScale: c.letterSize,
      textAlign: c.textAlign,
      bold: c.bold,
      italic: c.italic,
      strike: c.strike,
      underline: c.underline,
      templateBackground: c.templateBackground,
    } as const;
    dbg('export dims', fullDims, 'fps', c.cutsPerSec, 'fmt', c.format);
    const enc = c.format === 'webm' ? encodeWebM : encodeMP4;
    let blob: Blob;
    let filename: string;
    try {
      let ext = c.format;
      try {
        dbg('try primary', ext);
        blob = await enc(timeline, parsed, {
          dims: fullDims,
          fps: c.cutsPerSec,
          audioBuffer: audioBuf,
          onProgress: (r: number) => setProgress(progressEl, r),
          quality: c.exportQuality,
        } as never);
        dbg('primary ok', blob.size, blob.type);
      } catch (e1) {
        dbg('primary failed', String((e1 as Error)?.message ?? e1), 'try fallback');
        const fb = c.format === 'mp4' ? encodeWebM : encodeMP4;
        blob = await fb(timeline, parsed, {
          dims: fullDims,
          fps: c.cutsPerSec,
          audioBuffer: audioBuf,
          onProgress: (r: number) => setProgress(progressEl, r),
          quality: c.exportQuality,
        } as never);
        ext = c.format === 'mp4' ? 'webm' : 'mp4';
        dbg('fallback ok', blob.size, blob.type, 'ext', ext);
      }
      if (!blob || blob.size === 0) throw new Error('Encoder produced empty file');
      filename = filenameFor(ext as 'mp4' | 'webm');
      if (errEl) errEl.textContent = `Downloaded ${ext.toUpperCase()} (${Math.round(blob.size / 1024)} KB)`;
    } catch (e2) {
      dbg('both encoders failed', String((e2 as Error)?.message ?? e2), '→ ZIP');
      if (errEl) errEl.textContent = 'Encoders unavailable — exporting PNG ZIP…';
      try {
        blob = await exportFramesAsZip(timeline, parsed, fullDims, (r) => setProgress(progressEl, r));
        dbg('ZIP ok', blob.size);
      } catch (e3) {
        dbg('ZIP failed', String((e3 as Error)?.message ?? e3), '→ single PNG fallback');
        // Last resort: single-frame PNG so user still gets something
        const canvas1 = document.createElement('canvas');
        canvas1.width = fullDims.width;
        canvas1.height = fullDims.height;
        const ctx1 = canvas1.getContext('2d');
        if (!ctx1) throw e3;
        drawFrame(ctx1, timeline[0], parsed, fullDims);
        const pngBlob: Blob | null = await new Promise((res) =>
          canvas1.toBlob((b) => res(b), 'image/png'),
        );
        if (!pngBlob) throw e3;
        blob = pngBlob;
        dbg('PNG fallback ok', blob.size);
      }
      filename = blob.type.includes('zip') || blob.size > 50000 ? 'matchcutter-frames.zip' : 'matchcutter-frame.png';
      // Ensure extension matches blob type
      if (blob.type === 'image/png' && !filename.endsWith('.png')) filename = 'matchcutter-frame.png';
      if (blob.type.includes('zip') && !filename.endsWith('.zip')) filename = 'matchcutter-frames.zip';
      if (errEl) errEl.textContent = `Downloaded ${filename.includes('.zip') ? 'ZIP' : 'PNG'} (${Math.round(blob.size / 1024)} KB) — ${filename.includes('.zip') ? 'import frames to editor' : 'single frame fallback'}`;
    }
    dbg('triggerDownload', filename, blob.size, blob.type);
    try {
      triggerDownload(blob, filename);
    } catch (e4) {
      dbg('triggerDownload threw', String((e4 as Error)?.message ?? e4));
      // Ultimate fallback: open blob in new tab
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      if (errEl) errEl.textContent = `Opened in new tab (${Math.round(blob.size/1024)}KB) — allow popups and Save As`;
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
    setProgress(progressEl, 1);
  } catch (e) {
    const msg = String((e as Error).message ?? e);
    dbg('outer failed', msg, e);
    console.error(e);
    if (errEl) errEl.textContent = `Download failed: ${msg} (try 720p/WebM or check console)`;
  } finally {
    if (btnDl) btnDl.disabled = false;
  }
}
function init(): void {
  if (!input || !ctx || !counter) return;
  const fromURL = getPhraseFromURL();
  input.value = fromURL ?? 'Markets jittery. ==TACO again==.';
  if (templatesGrid) {
    renderTemplates(templatesGrid, (t) => {
      input.value = t.phrase;
      applyTemplateToForm(t);
      // ensure counter updates instantly before generate
      updateCounter(input, counter);
      void onGenerate();
    });
  }
  if (exWrap)
    renderExamples(exWrap, (t) => {
      input.value = t;
      void onGenerate();
    });
  if (recentWrap)
    renderRecent(recentWrap, (p) => {
      input.value = p;
      void onGenerate();
    });
  updateCounter(input, counter);
  void onGenerate();
  input.addEventListener('input', () => updateCounter(input, counter));
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const rec = loadRecent();
    if (rec.length === 0) return;
    e.preventDefault();
    if (e.key === 'ArrowUp') histIdx = Math.min(histIdx + 1, rec.length - 1);
    else histIdx = Math.max(histIdx - 1, -1);
    input.value = histIdx >= 0 ? rec[histIdx] : (getPhraseFromURL() ?? '');
    updateCounter(input, counter);
    if (histIdx >= 0) void onGenerate();
  });
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
  btnCopy?.addEventListener('click', async () => {
    const ok = await copyShareLink(input.value);
    if (copyFeedback) copyFeedback.textContent = ok ? 'Link copied!' : 'Copy failed';
    setTimeout(() => {
      if (copyFeedback) copyFeedback.textContent = '';
    }, 2000);
  });
  updateEncodeBadge(badgeEl);
  setupShortcuts(input);
  setupControls(() => void onGenerate());
}
init();
