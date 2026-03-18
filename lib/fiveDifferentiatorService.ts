import {
    CardInventory,
    CatalystMarketEvent,
    CounterpartyEdge,
    CounterpartyProfile,
    ListingOfferRecord,
    MarketplaceListingRecord,
    ScenarioRunRecord,
    ScenarioSnapshot,
} from '../types';
import {
    fetchCatalystEvents,
    fetchCounterparties,
    fetchCounterpartyEdges,
    fetchExecutionIntents,
    fetchListingOffers,
    fetchMarketplaceListings,
    fetchScenarioRuns,
    fetchScenarioSnapshots,
    fetchTrustEvents,
    upsertCatalystEvent,
    upsertCounterpartyEdge,
    upsertCounterpartyProfile,
    upsertScenarioRun,
    upsertScenarioSnapshot,
} from './differentiatorData';
import { getActiveListingsAsync, getTopSellers, Listing } from './p2pMarketplaceService';
import { createDealRoomAsync, DealRoom } from './dealRoomService';
import { CatalystEngine } from './catalystEngine';
import { getAllScenarios, runStressTest } from './stressTestService';
import {
    getAllCards,
    getLiquidityScore,
    getPortfolioLiquidity,
    getSyntheticOrderBook,
    getSyntheticSpread,
    getTargetPricing,
} from './predictiveMarketMakerService';

export interface LiquidityTwinAssetView {
    assetId: string;
    assetName: string;
    player: string;
    liquidityScore: number;
    spreadPct: number;
    timeToExitDays: number;
    recommendedVenue: 'ebay' | 'private' | 'internal';
    bestBid?: number;
    bestAsk?: number;
    midpointValue?: number;
    comparableSalesCount?: number;
    activeListings: number;
    openOffers: number;
}

export interface CounterpartyTrustGraphView {
    counterparties: CounterpartyProfile[];
    edges: CounterpartyEdge[];
    totalTrustEvents: number;
    totalExecutionIntents: number;
}

export interface ScenarioTheaterView {
    snapshots: ScenarioSnapshot[];
    runs: ScenarioRunRecord[];
}

function matchPredictiveCard(card: CardInventory) {
    const query = `${card.player} ${card.set}`.toLowerCase();
    return getAllCards().find(item => {
        const player = item.player.toLowerCase();
        const desc = item.cardDescription.toLowerCase();
        return query.includes(player) || player.includes(card.player.toLowerCase()) || desc.includes(card.set.toLowerCase());
    });
}

function recommendedVenueForAsset(listings: MarketplaceListingRecord[], offers: ListingOfferRecord[]) {
    if (offers.length >= 3) return 'private' as const;
    if (listings.some(listing => listing.sourceVenue === 'ebay')) return 'ebay' as const;
    return 'internal' as const;
}

export async function buildLiquidityTwinAssets(inventory: CardInventory[], userId?: string): Promise<LiquidityTwinAssetView[]> {
    const [listings, offers] = await Promise.all([
        fetchMarketplaceListings(userId),
        fetchListingOffers(),
    ]);

    return inventory
        .filter(card => (card.currentValue || 0) > 0)
        .slice(0, 8)
        .map(card => {
            const predictiveCard = matchPredictiveCard(card);
            const spread = predictiveCard ? getSyntheticSpread(predictiveCard.id) : null;
            const liquidity = predictiveCard ? getLiquidityScore(predictiveCard.id) : null;
            const oracle = predictiveCard ? getTargetPricing(predictiveCard.id) : null;
            const cardListings = listings.filter(listing => listing.player.toLowerCase().includes(card.player.toLowerCase()));
            const cardOffers = offers.filter(offer => cardListings.some(listing => listing.id === offer.listingId));

            return {
                assetId: card.id,
                assetName: `${card.year} ${card.player} ${card.set}`,
                player: card.player,
                liquidityScore: liquidity?.score || card.liquidityScore || 50,
                spreadPct: spread?.spreadWidth || Math.max(4, 18 - (card.liquidityScore || 50) / 4),
                timeToExitDays: liquidity?.avgDaysToSell || 14,
                recommendedVenue: recommendedVenueForAsset(cardListings, cardOffers),
                bestBid: spread?.bid,
                bestAsk: spread?.ask,
                midpointValue: spread?.midpoint || card.currentValue,
                comparableSalesCount: spread?.comparableSalesCount,
                activeListings: cardListings.length,
                openOffers: cardOffers.filter(offer => offer.status === 'pending').length,
            };
        })
        .sort((a, b) => a.timeToExitDays - b.timeToExitDays);
}

async function seedCounterparties(userId?: string): Promise<CounterpartyProfile[]> {
    const topSellers = getTopSellers().slice(0, 6);
    const seeded: CounterpartyProfile[] = [];

    for (const seller of topSellers) {
        const profile: CounterpartyProfile = {
            id: crypto.randomUUID(),
            ownerUserId: userId || null,
            displayName: seller.username,
            marketplaceVenue: 'ebay',
            externalReference: seller.id,
            verificationTier: seller.verified ? 'verified' : 'unverified',
            trustScore: seller.rating * 20,
            reputationScore: seller.completionRate,
            successfulDeals: seller.totalSales,
            disputedDeals: Math.max(0, Math.round((100 - seller.completionRate) / 10)),
            avgResponseHours: seller.responseTime.includes('< 1') ? 1 : 6,
            totalVolumeUsd: seller.totalVolume,
            riskLevel: seller.verified ? 'low' : 'medium',
            createdAt: new Date().toISOString(),
        };
        await upsertCounterpartyProfile(profile);
        seeded.push(profile);
    }

    for (let i = 0; i < seeded.length - 1; i++) {
        await upsertCounterpartyEdge({
            id: crypto.randomUUID(),
            sourceCounterpartyId: seeded[i].id,
            targetCounterpartyId: seeded[i + 1].id,
            edgeType: i % 2 === 0 ? 'transaction' : 'referral',
            weight: 0.6 + i * 0.05,
            trustDelta: 2 + i,
            evidenceCount: 1 + i,
            createdAt: new Date().toISOString(),
        }, userId);
    }

    return seeded;
}

export async function buildCounterpartyTrustGraph(userId?: string): Promise<CounterpartyTrustGraphView> {
    let counterparties = await fetchCounterparties(userId);
    if (counterparties.length === 0) {
        counterparties = await seedCounterparties(userId);
    }

    let edges = await fetchCounterpartyEdges(userId);
    if (edges.length === 0 && counterparties.length > 1) {
        edges = await fetchCounterpartyEdges(userId);
    }

    const [trustEvents, executionIntents] = await Promise.all([
        fetchTrustEvents(),
        fetchExecutionIntents(userId),
    ]);

    return {
        counterparties,
        edges,
        totalTrustEvents: trustEvents.length,
        totalExecutionIntents: executionIntents.length,
    };
}

export async function ensureCatalystMarket(userId: string | undefined, inventory: CardInventory[]): Promise<CatalystMarketEvent[]> {
    const persisted = await fetchCatalystEvents(userId);
    if (persisted.length > 0) {
        return persisted;
    }

    const [listings, _activeListings] = await Promise.all([
        fetchMarketplaceListings(userId),
        getActiveListingsAsync(userId),
    ]);
    const generated = CatalystEngine.generateScenarios(inventory).map<CatalystMarketEvent>(scenario => {
        const linkedListing = listings.find(listing => listing.player.toLowerCase().includes(scenario.assetName.toLowerCase().split(' ')[1]?.toLowerCase() || ''));
        return {
            id: crypto.randomUUID(),
            assetId: scenario.assetId,
            assetName: scenario.assetName,
            catalystType: scenario.catalyst,
            headline: scenario.headline,
            narrative: `${scenario.headline} with ${Math.round(scenario.confidence * 100)}% confidence and ${scenario.expectedMovePct}% upside scenario.`,
            confidence: Math.round(scenario.confidence * 100) / 100,
            expectedMovePct: scenario.expectedMovePct,
            downsidePct: scenario.downsidePct,
            severity: scenario.expectedMovePct >= 12 ? 'urgent' : scenario.expectedMovePct >= 8 ? 'actionable' : 'watch',
            triggerWindow: scenario.triggerWindow,
            source: 'engine',
            linkedListingId: linkedListing?.id,
            linkedDealRoomId: null,
            createdAt: new Date().toISOString(),
        };
    });

    for (const event of generated) {
        await upsertCatalystEvent(event, userId);
    }

    return generated;
}

export async function runScenarioTheater(inventory: CardInventory[], userId?: string, scenarioId?: string): Promise<ScenarioTheaterView> {
    const scenarios = getAllScenarios();
    const scenario = scenarios.find(item => item.id === scenarioId) || scenarios[0];
    const result = runStressTest(inventory, scenario, 365) as ReturnType<typeof runStressTest> & {
        portfolioValue?: number;
        percentileBands?: { mean: number }[];
        riskScore?: number;
        var95?: number;
        drawdown?: number;
        hedgingRecommendations?: { rationale: string }[];
        horizon?: number;
    };
    const portfolioValue =
        result.portfolioValue ??
        inventory.reduce((s, c) => s + (c.currentValue ?? c.purchasePrice ?? 0), 0);
    const bands = Array.isArray(result.percentileBands) ? result.percentileBands : [];
    const lastBand = bands[bands.length - 1];
    const projected = lastBand?.mean ?? portfolioValue * (1 + (result.impact ?? 0) / 100);
    const snapshot: ScenarioSnapshot = {
        id: crypto.randomUUID(),
        ownerUserId: userId || null,
        name: `${scenario.name} Snapshot`,
        templateKind: scenario.category === 'market' ? 'market' : scenario.category === 'player' ? 'player' : 'custom',
        description: scenario.description,
        inputs: { scenarioId: scenario.id, shocks: scenario.shocks, assetCount: inventory.length },
        summary: `Scenario theater snapshot for ${scenario.name}`,
        createdAt: new Date().toISOString(),
    };
    await upsertScenarioSnapshot(snapshot);

    const run: ScenarioRunRecord = {
        id: crypto.randomUUID(),
        ownerUserId: userId || null,
        snapshotId: snapshot.id,
        scenarioName: scenario.name,
        scenarioKind: snapshot.templateKind,
        portfolioValue,
        projectedValue: projected,
        navDelta: projected - portfolioValue,
        riskScore: result.riskScore ?? Math.min(100, Math.abs(result.impact ?? 0) * 2),
        summary: result.hedgingRecommendations?.[0]?.rationale || `Stress: ${scenario.name} (${result.impact ?? 0}% impact).`,
        inputs: { scenarioId: scenario.id, horizon: result.horizon ?? 365 },
        outputs: {
            var95: result.var95 ?? 0,
            drawdown: result.drawdown ?? Math.abs(result.impact ?? 0),
            hedgingRecommendations: result.hedgingRecommendations ?? [],
        },
        createdAt: new Date().toISOString(),
    };
    await upsertScenarioRun(run);

    const [snapshots, runs] = await Promise.all([
        fetchScenarioSnapshots(userId),
        fetchScenarioRuns(userId),
    ]);

    return { snapshots, runs };
}

export async function createPrivateDealRoomAgentFromListing(listing: Listing, userId?: string): Promise<DealRoom> {
    return createDealRoomAsync(
        {
            player: listing.player,
            description: listing.cardDescription,
            grade: listing.grade,
            estimatedValue: listing.marketValue,
        },
        'sell',
        listing.askingPrice,
        userId || null,
    );
}

export async function getPortfolioLiquiditySummary(inventory: CardInventory[]) {
    return getPortfolioLiquidity(inventory);
}

export async function getLiquidityTwinOrderBook(card: CardInventory) {
    const predictiveCard = matchPredictiveCard(card);
    if (!predictiveCard) {
        return null;
    }
    return getSyntheticOrderBook(predictiveCard.id);
}
