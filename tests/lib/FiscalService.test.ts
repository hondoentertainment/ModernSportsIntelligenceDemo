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

    it('splits short-term vs long-term tax liability and ignores sold / zero-gain rows', () => {
        const longTerm = makeCard({
            id: 'lt',
            purchaseDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
            purchasePrice: 100,
            currentValue: 200,
        });
        const shortTerm = makeCard({
            id: 'st',
            purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            purchasePrice: 100,
            currentValue: 200,
        });
        const sold = makeCard({ id: 'sold', status: 'sold', currentValue: 999 });
        const flat = makeCard({ id: 'flat', currentValue: 100, purchasePrice: 100 });

        const liability = FiscalService.calculateTaxLiability([longTerm, shortTerm, sold, flat]);
        expect(liability.totalGain).toBe(200);
        expect(liability.longTerm).toBeCloseTo(20, 5);
        expect(liability.shortTerm).toBeCloseTo(35, 5);
        expect(liability.total).toBeCloseTo(55, 5);
    });

    it('tracks 1099-K volume for the current calendar year only', () => {
        const year = new Date().getFullYear();
        const exposure = FiscalService.get1099KExposure([
            makeCard({
                id: 'this-year',
                status: 'sold',
                saleDate: `${year}-04-01`,
                salePrice: 4200,
                purchasePrice: 1000,
            }),
            makeCard({
                id: 'last-year',
                status: 'sold',
                saleDate: `${year - 1}-04-01`,
                salePrice: 9000,
                purchasePrice: 1000,
            }),
        ]);
        expect(exposure.volume).toBe(4200);
        expect(exposure.gain).toBe(3200);
        expect(exposure.count).toBe(1);
        expect(exposure.isNearThreshold).toBe(true);
        expect(exposure.threshold).toBe(5000);
    });
});
