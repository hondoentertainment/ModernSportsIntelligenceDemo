import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import {
  createCampaign,
  getActiveCampaigns,
  pauseCampaign,
  resumeCampaign,
  getAcquisitionAnalytics,
  getAllAcquisitionResults,
  getAllNegotiations,
  AUTONOMOUS_ACQUISITION_STORE_KEYS,
} from '../../lib/trading/autonomousAcquisitionService';

describe('autonomousAcquisitionService hardening', () => {
  beforeEach(() => {
    for (const key of Object.values(AUTONOMOUS_ACQUISITION_STORE_KEYS)) {
      store.remove(key);
    }
  });

  it('sanitizes invalid campaign criteria and persists campaign data', () => {
    const before = getActiveCampaigns().length;
    const created = createCampaign({
      player: '  Test Prospect  ',
      set: '  Prism  ',
      grade: '  PSA 10 ',
      maxPrice: Number.NaN,
      targetROI: Number.NaN,
      urgency: 'medium',
      platforms: [],
      notes: '  keep an eye on comps ',
    });

    expect(created.criteria.player).toBe('Test Prospect');
    expect(created.criteria.set).toBe('Prism');
    expect(created.criteria.grade).toBe('PSA 10');
    expect(created.criteria.maxPrice).toBe(1);
    expect(created.criteria.targetROI).toBe(0);
    expect(created.criteria.platforms).toEqual(['eBay']);
    expect(created.criteria.notes).toBe('keep an eye on comps');
    expect(getActiveCampaigns().length).toBe(before + 1);

    const persisted = store.get<{ id: string }[]>(AUTONOMOUS_ACQUISITION_STORE_KEYS.campaigns, []);
    expect(persisted.some((campaign) => campaign.id === created.id)).toBe(true);
  });

  it('persists status transitions when pausing/resuming campaigns', () => {
    const active = getActiveCampaigns().find((campaign) => campaign.status === 'active');
    expect(active).toBeTruthy();
    if (!active) return;

    const paused = pauseCampaign(active.id);
    expect(paused?.status).toBe('paused');

    const resumed = resumeCampaign(active.id);
    expect(resumed?.status).toBe('active');
  });

  it('aligns analytics totals and monthly rollups with persisted acquisition results', () => {
    const results = getAllAcquisitionResults();
    const analytics = getAcquisitionAnalytics();
    const sumSaved = results.reduce((s, r) => s + r.savings, 0);
    const sumSpent = results.reduce((s, r) => s + r.acquiredPrice, 0);
    expect(analytics.totalSaved).toBe(sumSaved);
    expect(analytics.totalSpent).toBe(sumSpent);
    expect(analytics.successfulAcquisitions).toBe(results.length);
    const chartSaved = analytics.monthlySavings.reduce((s, m) => s + m.saved, 0);
    const chartSpent = analytics.monthlySavings.reduce((s, m) => s + m.spent, 0);
    expect(chartSaved).toBe(sumSaved);
    expect(chartSpent).toBe(sumSpent);
  });

  it('exposes persisted negotiation sessions after store hydration', () => {
    expect(getAllNegotiations().length).toBeGreaterThanOrEqual(5);
  });
});

