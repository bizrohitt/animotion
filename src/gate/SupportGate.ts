// src/gate/SupportGate.ts — optional no-op interface (disabled by default)

import type { SupportGate } from '../types.ts';

export class NoopGate implements SupportGate {
  enabled = false;

  render(_container: HTMLElement): void {
    if (!this.enabled) return;
    const el = document.createElement('div');
    el.className = 'support-gate';
    el.textContent = 'Support MatchCutter — donations via maintainer link (placeholder)';
    _container.appendChild(el);
  }

  on(_event: string, _handler: () => void): void {
    // no-op
  }

  off(_event: string, _handler: () => void): void {
    // no-op
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }
}

// Singleton disabled by default — to enable, in src/main.ts add:
// import { supportGate } from './gate/SupportGate.ts';
// const gateEl = document.getElementById('gate');
// if (gateEl) { supportGate.enable(); supportGate.render(gateEl); }
// Keeps no-op until maintainer opts in; zero network, zero watermark.
export const supportGate: SupportGate = new NoopGate();

// Helper to check that disabled gate emits no network requests
export function isGateNoop(gate: SupportGate): boolean {
  return !gate.enabled;
}
