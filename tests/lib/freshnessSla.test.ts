import { describe, expect, it } from 'vitest';
import { selectPreferredValuation } from '../../lib/pricing/compConsensus';
import {
  FRESHNESS_SLA_DISCLOSURE,
  FRESHNESS_SLA_POLICY,
  classifyAgeBand,
  classifyStampSla,
  classifyTapeSla,
  freshnessSlaForCard,
  freshnessSlaFromPreferred,
  resolveFreshnessSla,
  slaBandLabel,
  summarizeInventorySla,
  worseSlaBand,
} from '../../lib/pricing/freshnessSla';
import { makeCard } from '../helpers';

const NOW = Date.parse('2026-09-15T12:00:00.000Z');

function sale(price: number, soldAt: string) {
  return { title: `Comp ${price}`, condition: 'Raw', price, soldAt };
}

describe('freshnessSla', () => {
  it('classifies stamp and tape bands from the disclosed policy', () => {
    expect(FRESHNESS_SLA_POLICY.stampStaleAfterDays).toBe(7);
    expect(FRESHNESS_SLA_POLICY.tapeStaleAfterDays).toBe(90);
    expect(classifyStampSla(1)).toBe('fresh');
    expect(classifyStampSla(5)).toBe('aging');
    expect(classifyStampSla(7)).toBe('stale');
    expect(classifyTapeSla(20)).toBe('fresh');
    expect(classifyTapeSla(45)).toBe('aging');
    expect(classifyTapeSla(90)).toBe('stale');
    expect(classifyAgeBand(null, { freshMax: 2, agingMax: 6 })).toBe('unknown');
    expect(worseSlaBand('fresh', 'aging')).toBe('aging');
    expect(slaBandLabel('unknown')).toBe('SLA unknown');
    expect(FRESHNESS_SLA_DISCLOSURE).toMatch(/#77/);
  });

  it('combines stamp + tape and prefers the worse band', () => {
    const preferred = selectPreferredValuation({
      salesData: [sale(240, '2026-08-20'), sale(260, '2026-08-22'), sale(250, '2026-08-25')],
      nowMs: NOW,
    });
    const fresh = resolveFreshnessSla({
      preferred,
      timestamp: '2026-09-14T12:00:00.000Z',
      nowMs: NOW,
    });
    expect(fresh.meetsSla).toBe(true);
    expect(fresh.band).toBe('fresh');
    expect(fresh.channel).toBe('combined');

    const agingStamp = resolveFreshnessSla({
      preferred,
      timestamp: '2026-09-10T12:00:00.000Z',
      nowMs: NOW,
    });
    expect(agingStamp.band).toBe('aging');
    expect(agingStamp.stampBand).toBe('aging');
  });

  it('flags stale tape and unknown marks', () => {
    const staleTape = selectPreferredValuation({
      salesData: [sale(100, '2026-04-01')],
      nowMs: NOW,
    });
    const tape = freshnessSlaFromPreferred(staleTape, { nowMs: NOW });
    expect(tape.tapeBand).toBe('stale');
    expect(tape.channel).toBe('tape');

    const ai = selectPreferredValuation({ aiEstimate: 400, nowMs: NOW });
    const unknown = resolveFreshnessSla({ preferred: ai, nowMs: NOW });
    expect(unknown.band).toBe('unknown');
    expect(unknown.meetsSla).toBe(false);
  });

  it('summarizes inventory SLA and ignores sold cards', () => {
    const freshCard = makeCard({
      id: 'a',
      valuationTimestamp: '2026-09-14T12:00:00.000Z',
      salesData: [sale(240, '2026-08-20'), sale(260, '2026-08-22'), sale(250, '2026-08-25')],
    });
    const sold = makeCard({
      id: 'b',
      status: 'sold',
      lastValuationDate: '2026-01-01',
    });
    const summary = summarizeInventorySla([freshCard, sold], NOW);
    expect(summary.total).toBe(1);
    expect(summary.fresh).toBe(1);
    expect(summary.slaPct).toBe(100);
    expect(freshnessSlaForCard(freshCard, NOW).meetsSla).toBe(true);
    expect(summarizeInventorySla([], NOW).worstBand).toBe('unknown');
  });

  it('treats non-stale tape with comps but no fresh clears as aging', () => {
    const preferred = {
      value: 100,
      source: 'historical-comps' as const,
      confidence: 0.42,
      thinMarket: true,
      stale: false,
      label: 'Thin sold comps',
      method: 'thin-comp-fallback' as const,
      rationale: 'synthetic',
      compCount: 2,
      freshCompCount: 0,
      newestSoldAt: '2026-07-20T12:00:00.000Z',
    };
    const aging = resolveFreshnessSla({ preferred, nowMs: NOW });
    expect(aging.tapeBand).toBe('aging');
    expect(aging.channel).toBe('tape');
  });

  it('covers stamp-only channels, labels, and stale sold-comp tape', () => {
    expect(classifyAgeBand(-1, { freshMax: 2, agingMax: 6 })).toBe('unknown');
    expect(classifyAgeBand(Number.NaN, { freshMax: 2, agingMax: 6 })).toBe('unknown');
    expect(slaBandLabel('fresh')).toBe('SLA fresh');
    expect(slaBandLabel('aging')).toBe('SLA aging');
    expect(slaBandLabel('stale')).toBe('SLA stale');
    const stampOnly = resolveFreshnessSla({
      preferred: selectPreferredValuation({ aiEstimate: 400, nowMs: NOW }),
      timestamp: '2026-09-15T00:00:00.000Z',
      nowMs: NOW,
    });
    expect(stampOnly.channel).toBe('stamp');
    const staleSold = {
      value: 100,
      source: 'sold-comps' as const,
      confidence: 0.7,
      thinMarket: false,
      stale: true,
      label: 'Stale sold',
      method: 'sold-comp-consensus' as const,
      rationale: 'synthetic',
      compCount: 3,
      freshCompCount: 1,
      newestSoldAt: '2026-04-01T12:00:00.000Z',
    };
    expect(freshnessSlaFromPreferred(staleSold, { nowMs: NOW }).tapeBand).toBe('stale');
    const staleNoFresh = { ...staleSold, freshCompCount: 0, newestSoldAt: undefined };
    expect(freshnessSlaFromPreferred(staleNoFresh, {
      lastValuationDate: '2026-01-01',
      nowMs: NOW,
    }).tapeBand).toBe('stale');
    expect(freshnessSlaForCard(makeCard({ id: 'now' })).band).toBeTruthy();
    expect(summarizeInventorySla([makeCard({ id: 'now' })]).total).toBe(1);
  });

  it('uses the newest sold-comp stamp so 31–89 day tape is aging, not fake-fresh', () => {
    const preferred = selectPreferredValuation({
      salesData: [sale(240, '2026-07-22'), sale(250, '2026-07-28')],
      nowMs: NOW,
    });
    expect(preferred.newestSoldAt).toBeTruthy();
    const sla = resolveFreshnessSla({ preferred, nowMs: NOW });
    expect(sla.tapeBand).toBe('aging');
    expect(sla.tapeDays).toBeGreaterThan(30);
    expect(sla.tapeDays).toBeLessThan(90);
    expect(resolveFreshnessSla({
      preferred: { ...preferred, newestSoldAt: '   ', stale: false },
      nowMs: NOW,
    }).tapeBand).toBe('unknown');
    expect(resolveFreshnessSla({
      preferred: { ...preferred, newestSoldAt: 'not-a-date', stale: false, compCount: 2 },
      nowMs: NOW,
    }).tapeBand).toBe('unknown');
  });
});
