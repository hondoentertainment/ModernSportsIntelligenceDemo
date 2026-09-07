import { CardInventory } from '../../types';

export type CatalystType =
    | 'call_up'
    | 'playoff'
    | 'award_race'
    | 'injury_recovery'
    | 'injury'
    | 'transaction'
    | 'scarcity_spike';
export type CatalystBias = 'bullish' | 'neutral' | 'defensive';
export type CatalystDataSource = 'holdings_heuristic' | 'seeded_demo';

export interface CatalystScenario {
    id: string;
    assetId: string;
    assetName: string;
    catalyst: CatalystType;
    headline: string;
    triggerWindow: string;
    confidence: number;
    expectedMovePct: number;
    downsidePct: number;
    suggestedAction: 'Accumulate' | 'Trim' | 'Monitor' | 'Hold';
    bias: CatalystBias;
    source?: CatalystDataSource;
    disclosure?: string;
}

const SEEDED_IMPACT: Array<{
    match: RegExp;
    catalyst: Extract<CatalystType, 'injury' | 'transaction'>;
    headline: (player: string) => string;
    triggerWindow: string;
    bias: CatalystBias;
    action: CatalystScenario['suggestedAction'];
    move: number;
    down: number;
}> = [
    {
        match: /ohtani/i,
        catalyst: 'injury',
        headline: (p) => `${p} IL / workload watch (seeded)`,
        triggerWindow: 'Next 7-21 days',
        bias: 'defensive',
        action: 'Trim',
        move: 6,
        down: 14,
    },
    {
        match: /trout/i,
        catalyst: 'injury',
        headline: (p) => `${p} calf / availability catalyst (seeded)`,
        triggerWindow: 'Next 10-30 days',
        bias: 'defensive',
        action: 'Monitor',
        move: 4,
        down: 11,
    },
    {
        match: /judge/i,
        catalyst: 'transaction',
        headline: (p) => `${p} lineup / contract tape (seeded)`,
        triggerWindow: 'Next reporting window',
        bias: 'bullish',
        action: 'Hold',
        move: 5,
        down: 7,
    },
    {
        match: /wembanyama|wemby/i,
        catalyst: 'injury',
        headline: (p) => `${p} load-management shock (seeded)`,
        triggerWindow: 'Next 14 days',
        bias: 'defensive',
        action: 'Monitor',
        move: 8,
        down: 16,
    },
    {
        match: /mahomes/i,
        catalyst: 'transaction',
        headline: (p) => `${p} extension / scheme news (seeded)`,
        triggerWindow: 'Offseason window',
        bias: 'neutral',
        action: 'Hold',
        move: 3,
        down: 6,
    },
];

function hashPlayer(name: string): number {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return h;
}

function seededImpactFor(card: CardInventory): (typeof SEEDED_IMPACT)[number] | null {
    const named = SEEDED_IMPACT.find((row) => row.match.test(card.player));
    if (named) return named;
    const bucket = hashPlayer(card.player) % 7;
    if (bucket === 0) {
        return {
            match: /.*/,
            catalyst: 'injury',
            headline: (p) => `${p} availability / IL heuristic (seeded)`,
            triggerWindow: 'Next 14-30 days',
            bias: 'defensive',
            action: 'Monitor',
            move: 4,
            down: 9,
        };
    }
    if (bucket === 1) {
        return {
            match: /.*/,
            catalyst: 'transaction',
            headline: (p) => `${p} call-up / DFA / trade rumor (seeded)`,
            triggerWindow: 'Next transaction cluster',
            bias: 'bullish',
            action: 'Accumulate',
            move: 7,
            down: 8,
        };
    }
    return null;
}

function clamp(num: number, min: number, max: number) {
    return Math.min(max, Math.max(min, num));
}

function assetName(card: CardInventory) {
    return `${card.year} ${card.player} ${card.set}`.trim();
}

export const CatalystEngine = {
    generateImpactSignals(inventory: CardInventory[]): CatalystScenario[] {
        return inventory
            .filter((card) => card.status !== 'sold' && (card.currentValue || card.purchasePrice || 0) > 0)
            .flatMap((card) => {
                const seed = seededImpactFor(card);
                if (!seed) return [];
                const confidence = clamp(((card.valuationConfidence || 0.62) + ((card.liquidityScore || 48) / 100)) / 2, 0.4, 0.88);
                return [{
                    id: `${card.id}-${seed.catalyst}`,
                    assetId: card.id,
                    assetName: assetName(card),
                    catalyst: seed.catalyst,
                    headline: seed.headline(card.player),
                    triggerWindow: seed.triggerWindow,
                    confidence,
                    expectedMovePct: seed.move,
                    downsidePct: seed.down,
                    suggestedAction: seed.action,
                    bias: seed.bias,
                    source: 'seeded_demo' as const,
                    disclosure: 'Seeded injury/transaction heuristic — not a live MLB/NBA feed.',
                }];
            })
            .sort((a, b) => (b.expectedMovePct * b.confidence) - (a.expectedMovePct * a.confidence));
    },

    generateScenarios(inventory: CardInventory[]): CatalystScenario[] {
        const impact = this.generateImpactSignals(inventory);
        const impactIds = new Set(impact.map((s) => s.assetId));
        const classic = inventory
            .filter(card => (card.currentValue || 0) > 0 && !impactIds.has(card.id))
            .slice(0, 12)
            .map(card => {
                const confidence = clamp(((card.valuationConfidence || 0.65) + ((card.liquidityScore || 50) / 100)) / 2, 0.45, 0.96);
                const scarcityBoost = (card.scarcityIndex || 50) / 10;
                const opportunityBoost = (card.opportunityScore || 50) / 8;
                const baselineMove = Math.round((scarcityBoost + opportunityBoost + (card.league === 'MiLB' ? 6 : 3)) * 10) / 10;
                const disclosure = 'Holdings-linked heuristic — not a live transaction wire.';

                if (card.league === 'MiLB') {
                    return {
                        id: `${card.id}-call-up`,
                        assetId: card.id,
                        assetName: assetName(card),
                        catalyst: 'call_up' as const,
                        headline: `${card.player} promotion watch`,
                        triggerWindow: 'Next 14-30 days',
                        confidence,
                        expectedMovePct: baselineMove + 4,
                        downsidePct: 6,
                        suggestedAction: 'Accumulate' as const,
                        bias: 'bullish' as const,
                        source: 'holdings_heuristic' as const,
                        disclosure,
                    };
                }

                if ((card.popCount || 0) > 0 && (card.popHigher || 0) <= 3) {
                    return {
                        id: `${card.id}-scarcity`,
                        assetId: card.id,
                        assetName: assetName(card),
                        catalyst: 'scarcity_spike' as const,
                        headline: `${card.player} low-pop supply squeeze`,
                        triggerWindow: 'Next major show cycle',
                        confidence,
                        expectedMovePct: baselineMove + 2,
                        downsidePct: 4,
                        suggestedAction: 'Hold' as const,
                        bias: 'bullish' as const,
                        source: 'holdings_heuristic' as const,
                        disclosure,
                    };
                }

                if ((card.currentValue || 0) > (card.purchasePrice || 0) * 1.35) {
                    return {
                        id: `${card.id}-award-race`,
                        assetId: card.id,
                        assetName: assetName(card),
                        catalyst: 'award_race' as const,
                        headline: `${card.player} sentiment premium at risk`,
                        triggerWindow: 'Next 7-21 days',
                        confidence,
                        expectedMovePct: baselineMove,
                        downsidePct: 8,
                        suggestedAction: 'Trim' as const,
                        bias: 'defensive' as const,
                        source: 'holdings_heuristic' as const,
                        disclosure,
                    };
                }

                return {
                    id: `${card.id}-playoff`,
                    assetId: card.id,
                    assetName: assetName(card),
                    catalyst: 'playoff' as const,
                    headline: `${card.player} event-driven demand window`,
                    triggerWindow: 'Next marquee schedule window',
                    confidence,
                    expectedMovePct: baselineMove,
                    downsidePct: 5,
                    suggestedAction: 'Monitor' as const,
                    bias: 'neutral' as const,
                    source: 'holdings_heuristic' as const,
                    disclosure,
                };
            });

        return [...impact, ...classic]
            .sort((a, b) => (b.expectedMovePct * b.confidence) - (a.expectedMovePct * a.confidence));
    },

    summarizeScenarios(scenarios: CatalystScenario[]) {
        const bullish = scenarios.filter(scenario => scenario.bias === 'bullish').length;
        const defensive = scenarios.filter(scenario => scenario.bias === 'defensive').length;
        const avgMove = scenarios.length > 0
            ? scenarios.reduce((sum, scenario) => sum + scenario.expectedMovePct, 0) / scenarios.length
            : 0;

        return {
            bullish,
            defensive,
            avgMove
        };
    }
};
