import { describe, expect, it } from 'vitest';
import { getPlaybookById } from '../../lib/trading/negotiationPlaybooks';
import {
  buildSellerPromptAddendum,
  counterSourceLabel,
  estimateSellerFirmness,
  playbookCounterThresholds,
} from '../../lib/trading/negotiationContext';

const fair = getPlaybookById('fair_market_anchor')!;
const lowball = getPlaybookById('lowball_walk')!;

describe('negotiationContext', () => {
  it('keeps default playbook accept/lowball bands aligned with historic Arena tests', () => {
    const t = playbookCounterThresholds(fair);
    expect(t.acceptGapPct).toBe(0.05);
    expect(t.lowballGapPct).toBe(0.4);
    expect(t.concessionMin).toBeGreaterThanOrEqual(0.3);
  });

  it('labels close offers flexible and lowballs firm', () => {
    expect(estimateSellerFirmness(0.02, fair).label).toBe('Flexible');
    expect(estimateSellerFirmness(0.55, fair).label).toBe('Firm');
    expect(estimateSellerFirmness(0.2, fair).label).toBe('Measured');
  });

  it('lowball playbook is firmer than fair-market at the same gap', () => {
    const gap = 0.22;
    expect(estimateSellerFirmness(gap, lowball).score).toBeGreaterThan(
      estimateSellerFirmness(gap, fair).score,
    );
  });

  it('prompt addendum includes playbook directive and demo-honesty', () => {
    const block = buildSellerPromptAddendum(fair, estimateSellerFirmness(0.2, fair));
    expect(block).toMatch(/Fair Market Anchor/);
    expect(block).toMatch(/simulated seller/i);
    expect(block).not.toMatch(/live marketplace execution/i);
  });

  it('labels counter provenance honestly', () => {
    expect(counterSourceLabel('gemini')).toMatch(/not live marketplace/i);
    expect(counterSourceLabel('deterministic')).toMatch(/fallback/i);
    expect(counterSourceLabel(undefined)).toMatch(/when available/i);
  });
});
