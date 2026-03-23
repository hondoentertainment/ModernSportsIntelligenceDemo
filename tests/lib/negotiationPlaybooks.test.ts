import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import {
  getPlaybookById,
  getSelectedPlaybook,
  getSelectedPlaybookId,
  NEGOTIATION_PLAYBOOKS,
  setSelectedPlaybookId,
} from '../../lib/trading/negotiationPlaybooks';
import { getSmartPricingRecommendation } from '../../lib/trading/autonomousAcquisitionService';

describe('negotiationPlaybooks', () => {
  beforeEach(() => {
    store.clear();
  });

  it('defaults to fair market anchor', () => {
    expect(getSelectedPlaybookId()).toBe('fair_market_anchor');
    expect(getSelectedPlaybook().id).toBe('fair_market_anchor');
  });

  it('setSelectedPlaybookId ignores unknown ids', () => {
    setSelectedPlaybookId('nope');
    expect(getSelectedPlaybookId()).toBe('fair_market_anchor');
  });

  it('persists selection via store', () => {
    setSelectedPlaybookId('lowball_walk');
    expect(getSelectedPlaybookId()).toBe('lowball_walk');
    expect(getPlaybookById('lowball_walk')?.label).toContain('Lowball');
  });

  it('getSmartPricingRecommendation reflects playbook opening level', () => {
    const price = 1000;
    setSelectedPlaybookId('lowball_walk');
    const low = getSmartPricingRecommendation({
      price,
      player: 'Test',
      grade: 'PSA 10',
      platform: 'eBay',
    });
    setSelectedPlaybookId('fair_market_anchor');
    const fair = getSmartPricingRecommendation({
      price,
      player: 'Test',
      grade: 'PSA 10',
      platform: 'eBay',
    });
    expect(low.openingOffer).toBeLessThan(fair.openingOffer);
    expect(low.playbookId).toBe('lowball_walk');
    expect(fair.playbookId).toBe('fair_market_anchor');
  });

  it('exports four built-in playbooks', () => {
    expect(NEGOTIATION_PLAYBOOKS).toHaveLength(4);
  });
});
