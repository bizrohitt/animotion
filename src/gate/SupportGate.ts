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

// Singleton disabled by default
export const supportGate: SupportGate = new NoopGate();

// Helper to check that disabled gate emits no network requests
export function isGateNoop(gate: SupportGate): boolean {
  return !gate.enabled;
}
