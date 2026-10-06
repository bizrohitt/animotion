import type { LayoutPreset, PaperStyle, HighlightStyle } from '../types.ts';

export const PAPER_STYLES: Record<string, PaperStyle> = {
  cream: { id: 'cream', tint: '#f2e8d5', grain: 0.12 },
  aged: { id: 'aged', tint: '#e8e0d0', grain: 0.15 },
  bright: { id: 'bright', tint: '#fffef8', grain: 0.08 },
  warm: { id: 'warm', tint: '#fdf6e3', grain: 0.1 },
  newsprint: { id: 'newsprint', tint: '#e9e6dd', grain: 0.18 },
  sepia: { id: 'sepia', tint: '#ede3c8', grain: 0.14 },
};

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'broadsheet',
    fontFamily: '"Playfair Display", serif',
    fontWeight: 700,
    paperStyle: PAPER_STYLES.cream,
    rotationDeg: [-1.2, 1.2],
    highlightStyle: 'marker',
  },
  {
    id: 'ledger',
    fontFamily: '"Libre Baskerville", serif',
    fontWeight: 700,
    paperStyle: PAPER_STYLES.aged,
    rotationDeg: [-1.5, 1.0],
    highlightStyle: 'box',
  },
  {
    id: 'gazette',
    fontFamily: '"Old Standard TT", serif',
    fontWeight: 700,
    paperStyle: PAPER_STYLES.bright,
    rotationDeg: [-0.8, 0.8],
    highlightStyle: 'underline',
  },
  {
    id: 'dispatch',
    fontFamily: '"Special Elite", cursive',
    fontWeight: 400,
    paperStyle: PAPER_STYLES.newsprint,
    rotationDeg: [-2.0, 2.0],
    highlightStyle: 'marker',
  },
  {
    id: 'herald',
    fontFamily: '"IM Fell English", serif',
    fontWeight: 400,
    paperStyle: PAPER_STYLES.warm,
    rotationDeg: [-1.0, 1.3],
    highlightStyle: 'box',
  },
  {
    id: 'courier',
    fontFamily: '"Courier Prime", monospace',
    fontWeight: 700,
    paperStyle: PAPER_STYLES.sepia,
    rotationDeg: [-1.8, 1.8],
    highlightStyle: 'underline',
  },
  {
    id: 'bulletin',
    fontFamily: '"Playfair Display", serif',
    fontWeight: 400,
    paperStyle: PAPER_STYLES.newsprint,
    rotationDeg: [-0.9, 1.1],
    highlightStyle: 'box',
  },
  {
    id: 'chronicle',
    fontFamily: '"Libre Baskerville", serif',
    fontWeight: 400,
    paperStyle: PAPER_STYLES.cream,
    rotationDeg: [-2.2, 1.6],
    highlightStyle: 'marker',
  },
  // ── New OFL fonts — more variety for mixed clippings ──
  {
    id: 'impact',
    fontFamily: '"Anton", sans-serif',
    fontWeight: 400,
    paperStyle: PAPER_STYLES.newsprint,
    rotationDeg: [-1.1, 1.4],
    highlightStyle: 'box',
  },
  {
    id: 'banner',
    fontFamily: '"Bebas Neue", sans-serif',
    fontWeight: 400,
    paperStyle: PAPER_STYLES.cream,
    rotationDeg: [-1.3, 1.3],
    highlightStyle: 'marker',
  },
  {
    id: 'moderne',
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 700,
    paperStyle: PAPER_STYLES.bright,
    rotationDeg: [-1.4, 1.4],
    highlightStyle: 'underline',
  },
  {
    id: 'stark',
    fontFamily: '"Oswald", sans-serif',
    fontWeight: 700,
    paperStyle: PAPER_STYLES.warm,
    rotationDeg: [-1.6, 1.6],
    highlightStyle: 'marker',
  },
  {
    id: 'editorial',
    fontFamily: '"Merriweather", serif',
    fontWeight: 700,
    paperStyle: PAPER_STYLES.sepia,
    rotationDeg: [-1.0, 1.0],
    highlightStyle: 'box',
  },
  {
    id: 'literary',
    fontFamily: '"Lora", serif',
    fontWeight: 400,
    paperStyle: PAPER_STYLES.aged,
    rotationDeg: [-0.9, 1.2],
    highlightStyle: 'underline',
  },
  {
    id: 'swiss',
    fontFamily: '"Inter", sans-serif',
    fontWeight: 700,
    paperStyle: PAPER_STYLES.bright,
    rotationDeg: [-1.2, 1.2],
    highlightStyle: 'marker',
  },
  {
    id: 'grotesk',
    fontFamily: '"Raleway", sans-serif',
    fontWeight: 400,
    paperStyle: PAPER_STYLES.cream,
    rotationDeg: [-1.5, 1.5],
    highlightStyle: 'box',
  },
];

export const FONT_FAMILIES_IN_PRESETS: string[] = [
  ...new Set(LAYOUT_PRESETS.map((p) => p.fontFamily)),
];

export const HIGHLIGHT_POOL: HighlightStyle[] = ['marker', 'underline', 'box'];
