import { describe, it, expect } from 'vitest';
import { NoopGate, supportGate, isGateNoop } from '../src/gate/SupportGate.ts';

function ensureDocument(): void {
  if (typeof document === 'undefined') {
    (globalThis as unknown as { document: Document }).document = {
      createElement: (tag: string) =>
        ({ textContent: '', style: {}, tagName: tag.toUpperCase() }) as unknown as HTMLElement,
    } as unknown as Document;
  }
}

describe('SupportGate', () => {
  it('disabled by default renders nothing', () => {
    const gate = new NoopGate();
    expect(gate.enabled).toBe(false);
    const mockDiv = {
      appendChild: () => {
        throw new Error('should not append');
      },
    } as unknown as HTMLElement;
    expect(() => gate.render(mockDiv)).not.toThrow();
    expect(isGateNoop(gate)).toBe(true);
  });

  it('enabled renders placeholder without network', () => {
    ensureDocument();
    const gate = new NoopGate();
    gate.enable();
    expect(gate.enabled).toBe(true);
    const calls: string[] = [];
    const mockDiv = {
      appendChild: (el: HTMLElement) =>
        calls.push((el as unknown as { textContent: string }).textContent ?? ''),
    } as unknown as HTMLElement;
    const origCreate = document.createElement;
    document.createElement = (_tag: string) =>
      ({ textContent: '', style: {} }) as unknown as HTMLElement;
    gate.render(mockDiv);
    document.createElement = origCreate;
    expect(calls.length).toBe(1);
    expect(isGateNoop(gate)).toBe(false);
  });

  it('on/off are no-ops and do not throw', () => {
    const gate = new NoopGate();
    expect(() => gate.on('click', () => {})).not.toThrow();
    expect(() => gate.off?.('click', () => {})).not.toThrow();
  });

  it('singleton is disabled', () => {
    expect(supportGate.enabled).toBe(false);
    expect(isGateNoop(supportGate)).toBe(true);
  });

  it('disable after enable returns to noop', () => {
    const gate = new NoopGate();
    gate.enable();
    gate.disable();
    expect(gate.enabled).toBe(false);
  });
});
