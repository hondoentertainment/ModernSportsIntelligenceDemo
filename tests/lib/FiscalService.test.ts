import { describe, expect, it } from 'vitest';
import { FiscalService } from '../../lib/utils/FiscalService';
import { CardInventory } from '../../types';

const makeCard = (overrides: Partial<CardInventory> = {}): CardInventory => ({
    id: 'card-1',
    player: 'Demo Player',
    year: 2024,
    manufacturer: 'Topps',
    cardNumber: '1',
    set: 'Chrome',
    sport: 'Baseball',
    league: 'MLB',
    isAutographed: false,
    condition: 'Near Mint',
    isGraded: false,
    purchasePrice: 100,
    purchaseDate: new Date(Date.now() - 320 * 24 * 60 * 60 * 1000).toISOString(),
    currentValue: 180,
    status: 'active',
    ...overrides
});

describe('FiscalService', () => {
    it('simulates exits with venue comparisons', () => {
        const result = FiscalService.simulateExit(makeCard(), 200);
        expect(result.venueEstimates.length).toBe(4);
        expect(result.taxTreatment).toBe('Short Term');
    });

    it('recommends harvesting losses and long-term waits', () => {
        const recommendations = FiscalService.optimizeExitPlan([
            makeCard({ id: 'loss', currentValue: 70 }),
            makeCard({ id: 'wait', purchaseDate: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000).toISOString(), currentValue: 180 })
        ]);

        expect(recommendations.some(item => item.recommendedAction === 'Harvest Loss')).toBe(true);
        expect(recommendations.some(item => item.recommendedAction === 'Wait For Long-Term')).toBe(true);
    });
});
