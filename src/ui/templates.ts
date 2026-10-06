// src/ui/templates.ts — one-click visual templates (newspaper, book, magazine, etc.)
// Pure data + DOM render, no heavy logic. All original copy, permissive.

import type { Template } from '../types.ts';
import { setTemplateBackground } from './form.ts';

export const TEMPLATES: Template[] = [
  {
    id: 'newspaper',
    name: 'Newspaper',
    description: 'Ink on newsprint — bold header, marker yellow, tight grain.',
    phrase: 'BREAKING: ==NEWS== hits the stands.',
    aspect: '4:3',
    font: '"Playfair Display", serif',
    textAlign: 'center',
    bold: true,
    italic: false,
    strike: false,
    underline: false,
    letterSize: 1.1,
    cutsPerSec: 12,
    zoomMax: 1.6,
    blurMax: 0.3,
    accent: '#b91c1c',
    paperHint: 'newsprint',
    background: 'newspaper',
  },
  {
    id: 'book',
    name: 'Book',
    description: 'Literary serif — aged paper, underline, calm cuts.',
    phrase: 'Chapter One: ==Mystery== unfolds quietly.',
    aspect: '3:4',
    font: '"Lora", serif',
    textAlign: 'center',
    bold: false,
    italic: true,
    strike: false,
    underline: true,
    letterSize: 1.0,
    cutsPerSec: 8,
    zoomMax: 1.2,
    blurMax: 0.2,
    accent: '#8b5a2b',
    paperHint: 'aged',
    background: 'book',
  },
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Glossy editorial — bright paper, boxed highlight, punchy.',
    phrase: 'Extra! ==STYLE== of the season.',
    aspect: '4:5',
    font: '"Montserrat", sans-serif',
    textAlign: 'center',
    bold: true,
    italic: false,
    strike: false,
    underline: false,
    letterSize: 1.15,
    cutsPerSec: 14,
    zoomMax: 1.8,
    blurMax: 0,
    accent: '#1a4d8f',
    paperHint: 'bright',
    background: 'magazine',
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    description: 'Filed report — mono Courier, sepia, underline like a draft.',
    phrase: 'Filed: ==EVIDENCE== found on site.',
    aspect: '3:2',
    font: '"Courier Prime", monospace',
    textAlign: 'left',
    bold: false,
    italic: false,
    strike: false,
    underline: true,
    letterSize: 1.0,
    cutsPerSec: 10,
    zoomMax: 1.3,
    blurMax: 0.4,
    accent: '#5a5a5a',
    paperHint: 'sepia',
    background: 'typewriter',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: '1874 letters — Old Standard, warm cream, soft blur.',
    phrase: 'Memoirs of ==1874== — lost letters.',
    aspect: '5:4',
    font: '"Old Standard TT", serif',
    textAlign: 'center',
    bold: false,
    italic: false,
    strike: false,
    underline: false,
    letterSize: 1.05,
    cutsPerSec: 9,
    zoomMax: 1.4,
    blurMax: 0.5,
    accent: '#a67c52',
    paperHint: 'cream',
    background: 'vintage',
  },
  {
    id: 'tabloid',
    name: 'Tabloid',
    description: 'Loud tabloid — Anton impact, newsprint, boxed, fast cuts.',
    phrase: '==SCANDAL== rocks the city!',
    aspect: '9:16',
    font: '"Anton", sans-serif',
    textAlign: 'center',
    bold: false,
    italic: false,
    strike: false,
    underline: false,
    letterSize: 1.2,
    cutsPerSec: 16,
    zoomMax: 2.0,
    blurMax: 0,
    accent: '#111111',
    paperHint: 'newsprint',
    background: 'newspaper',
  },
  {
    id: 'notebook',
    name: 'Notebook',
    description: 'Handwritten — Special Elite on warm paper, marker bleed.',
    phrase: 'Scribbled: ==IDEA== on paper.',
    aspect: '2:3',
    font: '"Special Elite", cursive',
    textAlign: 'left',
    bold: false,
    italic: false,
    strike: false,
    underline: false,
    letterSize: 1.0,
    cutsPerSec: 7,
    zoomMax: 1.3,
    blurMax: 0.2,
    accent: '#2a7a3b',
    paperHint: 'warm',
    background: 'notebook',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Swiss clean — Inter, bright, minimal, centered.',
    phrase: 'Trending now: ==VIRAL== moment.',
    aspect: '16:9',
    font: '"Inter", sans-serif',
    textAlign: 'center',
    bold: true,
    italic: false,
    strike: false,
    underline: false,
    letterSize: 1.0,
    cutsPerSec: 12,
    zoomMax: 1.5,
    blurMax: 0,
    accent: '#0f172a',
    paperHint: 'bright',
    background: 'modern',
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Wide screen — Oswald stark, sepia, slow zoom.',
    phrase: 'Final scene: ==CUT== to black.',
    aspect: '21:9',
    font: '"Oswald", sans-serif',
    textAlign: 'center',
    bold: true,
    italic: false,
    strike: false,
    underline: false,
    letterSize: 1.25,
    cutsPerSec: 6,
    zoomMax: 2.2,
    blurMax: 0.2,
    accent: '#7c3aed',
    paperHint: 'aged',
    background: 'cinematic',
  },
];

export function renderTemplates(
  container: HTMLElement,
  onPick: (t: Template) => void,
): void {
  container.innerHTML = '';
  container.setAttribute('role', 'list');
  for (const t of TEMPLATES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'template-card';
    btn.setAttribute('role', 'listitem');
    btn.setAttribute('aria-label', `${t.name}: ${t.description}`);
    btn.dataset.templateId = t.id;
    // accent bar via inline style (no extra CSS needed per template)
    btn.style.setProperty('--tmpl-accent', t.accent);
    // inner
    btn.innerHTML = `
      <span class="tmpl-accent" aria-hidden="true"></span>
      <span class="tmpl-name">${t.name}</span>
      <span class="tmpl-desc">${t.description}</span>
      <span class="tmpl-meta">${t.font.replace(/"/g, '').split(',')[0]} · ${t.aspect} · ${t.cutsPerSec}c/s</span>
      <span class="tmpl-phrase">${t.phrase.replace(/==/g, '')}</span>
    `;
    btn.addEventListener('click', () => onPick(t));
    container.appendChild(btn);
  }
}

export function applyTemplateToForm(t: Template): void {
  const setVal = (id: string, val: string | number | boolean): void => {
    const el = document.getElementById(id) as
      | HTMLInputElement
      | HTMLSelectElement
      | null;
    if (!el) return;
    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      el.checked = Boolean(val);
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (el instanceof HTMLInputElement && el.type === 'range') {
      el.value = String(val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (el instanceof HTMLSelectElement) {
      el.value = String(val);
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };
  setVal('aspectSelect', t.aspect);
  setVal('fontSelect', t.font);
  setVal('textAlignSelect', t.textAlign);
  setVal('textBold', t.bold);
  setVal('textItalic', t.italic);
  setVal('textStrike', t.strike);
  setVal('textUnderline', t.underline);
  setVal('letterSizeInput', t.letterSize);
  setVal('cutsInput', t.cutsPerSec);
  setVal('zoomInput', t.zoomMax);
  setVal('blurInput', t.blurMax);
  // template background (drives newspaper/book/magazine printed bg alongside highlight)
  setTemplateBackground(t.background);
  const bgEl = document.getElementById('templateBackground') as HTMLSelectElement | null;
  if (bgEl) {
    bgEl.value = t.background;
    bgEl.dispatchEvent(new Event('change', { bubbles: true }));
  }
  // also update the visible outputs (form sync does it on input, but ensure)
  const syncIds = ['cutsInput', 'zoomInput', 'blurInput', 'letterSizeInput', 'aspectSelect'];
  for (const id of syncIds) {
    const el = document.getElementById(id);
    el?.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
