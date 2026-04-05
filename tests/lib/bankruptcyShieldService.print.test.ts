import { describe, it, expect } from 'vitest';
import { renderCashOutPlanHTML } from '../../lib/utils/bankruptcyShieldService';
import type { CashOutPlan } from '../../lib/utils/bankruptcyShieldService';

describe('renderCashOutPlanHTML', () => {
  it('escapes dynamic strings for print HTML', () => {
    const plan: CashOutPlan = {
      id: 't',
      generatedAt: '2020-01-01T00:00:00.000Z',
      urgency: 'week',
      targetAmount: 1,
      totalRecovery: 1,
      steps: [
        {
          order: 1,
          action: '<script>alert(1)</script>',
          channel: 'eBay & "quotes"',
          expectedProceeds: 100,
          estimatedDays: 2,
          cumulativeRecovery: 100,
          notes: '<b>note</b>',
          asset: {
            id: 'a',
            playerName: 'Test',
            cardYear: 2020,
            cardSet: 'Set',
            cardNumber: '1',
            grade: '10',
            grader: 'PSA',
            marketValue: 100,
            fireSaleValues: [],
            liquidityScore: 50,
            liquidityTier: 1,
            optimalChannel: 'eBay',
            estimatedSaleDays: 1,
            demandIndex: 50,
            volatility: 0.1,
            category: 'baseball',
          },
        },
      ],
      summary: {
        totalAssets: 1,
        totalMarketValue: 100,
        totalExpectedRecovery: 90,
        recoveryPercent: 90,
        estimatedCompletionDays: 7,
        highestRecoveryAsset: '<evil>',
        lowestRecoveryAsset: 'Safe',
        averageDiscountPercent: 10,
      },
    };
    const html = renderCashOutPlanHTML(plan);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
    expect(html).toContain('&lt;b&gt;');
    expect(html).toContain('&lt;evil&gt;');
  });
});
