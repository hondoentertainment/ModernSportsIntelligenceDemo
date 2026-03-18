import { beforeEach, describe, expect, it } from 'vitest';
import {
    buildCounterpartyTrustGraph,
    buildLiquidityTwinAssets,
    ensureCatalystMarket,
    runScenarioTheater,
} from '../../lib/fiveDifferentiatorService';
import { CardInventory } from '../../types';

const sampleInventory: CardInventory[] = [
    {
        id: 'card-1',
        player: 'Luka Doncic',
        year: 2018,
        manufacturer: 'Panini',
        cardNumber: '280',
        set: 'Prizm Silver',
        sport: 'Basketball',
        league: 'NBA',
        isAutographed: false,
        condition: 'Mint',
        isGraded: true,
        grade: 'PSA 10',
        purchasePrice: 3200,
        purchaseDate: '2025-01-01',
        currentValue: 5200,
        liquidityScore: 82,
        valuationConfidence: 0.88,
        status: 'active',
    },
    {
        id: 'card-2',
        player: 'Jackson Holliday',
        year: 2024,
        manufacturer: 'Bowman',
        cardNumber: 'BA-1',
        set: 'Chrome Auto',
        sport: 'Baseball',
        league: 'MiLB',
        isAutographed: true,
        condition: 'Mint',
        isGraded: false,
        purchasePrice: 450,
        purchaseDate: '2025-02-01',
        currentValue: 780,
        liquidityScore: 55,
        opportunityScore: 87,
        valuationConfidence: 0.72,
        status: 'active',
    },
];

describe('fiveDifferentiatorService', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('builds liquidity twin assets for active inventory', async () => {
        const assets = await buildLiquidityTwinAssets(sampleInventory);
        expect(assets.length).toBeGreaterThan(0);
        expect(assets.some(a => a.assetName.includes('Luka'))).toBe(true);
    });

    it('seeds a counterparty trust graph when none exists', async () => {
        const graph = await buildCounterpartyTrustGraph();
        expect(graph.counterparties.length).toBeGreaterThan(0);
        expect(graph.edges.length).toBeGreaterThan(0);
    });

    it('persists catalyst events and scenario runs', async () => {
        const events = await ensureCatalystMarket(undefined, sampleInventory);
        const theater = await runScenarioTheater(sampleInventory);

        expect(events.length).toBeGreaterThan(0);
        expect(theater.snapshots.length).toBeGreaterThan(0);
        expect(theater.runs.length).toBeGreaterThan(0);
    });
});
