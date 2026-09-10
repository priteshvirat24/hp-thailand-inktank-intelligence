import { describe, it, expect } from 'vitest';

describe('InfoTooltip Component & Module Contract', () => {
  it('exports InfoTooltip as a valid React component function', async () => {
    const mod = await import('@/components/ui/InfoTooltip');
    expect(mod.InfoTooltip).toBeDefined();
    expect(typeof mod.InfoTooltip).toBe('function');
  });

  it('declares displayName or name for debugging', async () => {
    const mod = await import('@/components/ui/InfoTooltip');
    expect(mod.InfoTooltip.name).toBe('InfoTooltip');
  });
});
