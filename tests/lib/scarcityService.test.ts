import { describe, it, expect } from 'vitest';
import * as ScarcityService from '../../lib/analytics/scarcityService';
describe('ScarcityService', () => {
    it('should generate consistent population data for the same input', () => {
        const input: any = {
            id: 'card-123',
            year: 2024,
            set: 'Topps Chrome',
            grade: '10',
            cardNumber: '1',
            manufacturer: 'Topps',
            player: 'Test Player',
            sport: 'Baseball',
            league: 'MLB'
        };

        const result1 = ScarcityService.generatePopData(input);
        const result2 = ScarcityService.generatePopData(input);

        expect(result1).toEqual(result2);
    });

    it('should return higher population for modern cards than vintage', () => {
        const modern: any = { id: 'mod', year: 2024, set: 'Chrome', grade: '10', cardNumber: '1' };
        const vintage: any = { id: 'vin', year: 1952, set: 'Topps', grade: '5', cardNumber: '1' };

        const resModern = ScarcityService.generatePopData(modern);
        const resVintage = ScarcityService.generatePopData(vintage);

        expect(resModern.popCount).toBeGreaterThan(0);
        expect(resVintage.popCount).toBeGreaterThan(0);
        // Modern usually higher in this simulation for base cards
    });

    it('should calculate scarcity index correctly', () => {
        // High pop, many higher
        const common = ScarcityService.calculateScarcityIndex(1000, 500);
        // Low pop, none higher
        const rare = ScarcityService.calculateScarcityIndex(10, 0);

        expect(rare).toBeGreaterThan(common);
        expect(rare).toBeGreaterThan(80); // Should be very high
        expect(common).toBeLessThan(50); // Should be low
    });
});
