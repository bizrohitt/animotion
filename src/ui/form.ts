// src/ui/form.ts — phrase input polish + controls wiring

import { parseInput, toggleMarkers } from '../parser/parseInput.ts';
import { LIMITS, DEFAULTS, ASPECT_DIMS } from '../config.ts';
import type { AspectRatio, SoundEffect, VideoFormat, AppConfig } from '../types.ts';

export function updateCounter(input: HTMLInputElement, counter: HTMLElement): void {
  const res = parseInput(input.value);
  const inside = input.value.match(/==(.+?)==/);
  const len = res.ok ? res.parsed.focalWord.length : inside ? inside[1].trim().length : 0;
  counter.textContent = `${len}/${LIMITS.focalMaxChars}`;
  counter.style.color = len > LIMITS.focalMaxChars ? 'crimson' : '';
}

export function validateInput(input: HTMLInputElement, errorEl: HTMLElement | null): boolean {
  const res = parseInput(input.value);
  if (!res.ok) {
    if (errorEl) errorEl.textContent = res.error;
    return false;
  }
  if (errorEl) errorEl.textContent = '';
  return true;
}

export function wrapSelection(input: HTMLInputElement): void {
  const start = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? 0;
  if (start === end) {
    const pos = start;
    const text = input.value;
    let s = pos;
    let e = pos;
    while (s > 0 && /\S/.test(text[s - 1] ?? '')) s--;
    while (e < text.length && /\S/.test(text[e] ?? '')) e++;
    if (s !== e) {
      input.setSelectionRange(s, e);
      const updated = toggleMarkers(input.value, s, e);
      if (updated !== input.value) {
        input.value = updated;
        input.setSelectionRange(s, s + updated.slice(s).indexOf('==') + 2);
      }
      return;
    }
    return;
  }
  const updated = toggleMarkers(input.value, start, end);
  if (updated !== input.value) {
    input.value = updated;
    input.setSelectionRange(
      start,
      start + (updated.length - input.value.length) + (end - start) + 4,
    );
  }
  input.focus();
}

export function setupForm(
  input: HTMLInputElement,
  counter: HTMLElement,
  errorEl: HTMLElement | null,
  onChange: (raw: string) => void,
): void {
  const onInput = (): void => {
    updateCounter(input, counter);
    validateInput(input, errorEl);
    onChange(input.value);
  };
  input.addEventListener('input', onInput);
}

export function getControls(): AppConfig {
  const aspect = (document.getElementById('aspectSelect') as HTMLSelectElement | null)?.value as
    AspectRatio | undefined;
  const format = (document.getElementById('formatSelect') as HTMLSelectElement | null)?.value as
    VideoFormat | undefined;
  const soundEnabled = (document.getElementById('soundToggle') as HTMLInputElement | null)?.checked;
  const soundEffect = (document.getElementById('soundEffect') as HTMLSelectElement | null)
    ?.value as SoundEffect | undefined;
  const cuts = Number((document.getElementById('cutsInput') as HTMLInputElement | null)?.value);
  const zoom = Number((document.getElementById('zoomInput') as HTMLInputElement | null)?.value);
  const blur = Number((document.getElementById('blurInput') as HTMLInputElement | null)?.value);
  return {
    aspect: aspect ?? DEFAULTS.aspect,
    format: format ?? DEFAULTS.format,
    soundEnabled: soundEnabled ?? DEFAULTS.soundEnabled,
    soundEffect: soundEffect ?? DEFAULTS.soundEffect,
    cutsPerSec: Number.isFinite(cuts)
      ? Math.max(LIMITS.cutsPerSec.min, Math.min(LIMITS.cutsPerSec.max, Math.round(cuts)))
      : DEFAULTS.cutsPerSec,
    zoomMax: Number.isFinite(zoom)
      ? Math.max(LIMITS.zoom.min, Math.min(LIMITS.zoom.max, zoom))
      : DEFAULTS.zoomMax,
    blurMax: Number.isFinite(blur)
      ? Math.max(LIMITS.blur.min, Math.min(LIMITS.blur.max, blur))
      : DEFAULTS.blurMax,
    durationSec: DEFAULTS.durationSec,
  };
}

export function setupControls(onChange: () => void): void {
  const ids = [
    'aspectSelect',
    'formatSelect',
    'soundToggle',
    'soundEffect',
    'cutsInput',
    'zoomInput',
    'blurInput',
  ];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.addEventListener('change', onChange);
    el.addEventListener('input', onChange);
  }
  // live value displays
  const cutsIn = document.getElementById('cutsInput') as HTMLInputElement | null;
  const cutsVal = document.getElementById('cutsVal');
  const zoomIn = document.getElementById('zoomInput') as HTMLInputElement | null;
  const zoomVal = document.getElementById('zoomVal');
  const blurIn = document.getElementById('blurInput') as HTMLInputElement | null;
  const blurVal = document.getElementById('blurVal');
  const sync = (): void => {
    if (cutsIn && cutsVal) cutsVal.textContent = String(cutsIn.value);
    if (zoomIn && zoomVal) zoomVal.textContent = `${Number(zoomIn.value).toFixed(1)}x`;
    if (blurIn && blurVal) blurVal.textContent = String(blurIn.value);
    // update preview canvas size on aspect change
    const canvas = document.getElementById('preview') as HTMLCanvasElement | null;
    const aspect = (document.getElementById('aspectSelect') as HTMLSelectElement | null)?.value as
      AspectRatio | undefined;
    if (canvas && aspect && ASPECT_DIMS[aspect]) {
      const d = ASPECT_DIMS[aspect];
      canvas.width = d.width / 2;
      canvas.height = d.height / 2;
    }
  };
  for (const el of [cutsIn, zoomIn, blurIn, document.getElementById('aspectSelect')]) {
    el?.addEventListener('input', sync);
    el?.addEventListener('change', sync);
  }
  sync();
}
