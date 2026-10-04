// src/ui/progress.ts — progress bar helper

export function setProgress(el: HTMLElement, ratio: number): void {
  const pct = Math.max(0, Math.min(100, ratio * 100));
  el.style.width = `${pct}%`;
  el.setAttribute('aria-valuenow', String(Math.round(pct)));
}

export function createProgress(container: HTMLElement): {
  set: (r: number) => void;
  reset: () => void;
} {
  const bar = document.createElement('div');
  bar.style.height = '6px';
  bar.style.background = '#111';
  bar.style.width = '0%';
  bar.style.transition = 'width 0.1s linear';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', '0');
  container.appendChild(bar);
  return {
    set: (r: number) => setProgress(bar, r),
    reset: () => setProgress(bar, 0),
  };
}
