// src/ui/form.ts — phrase input polish

import { parseInput, toggleMarkers } from '../parser/parseInput.ts';
import { LIMITS } from '../config.ts';

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
