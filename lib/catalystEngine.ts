import { CardInventory } from '../types';

export type CatalystType = 'call_up' | 'playoff' | 'award_race' | 'injury_recovery' | 'scarcity_spike';
export type CatalystBias = 'bullish' | 'neutral' | 'defensive';

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
}

function clamp(num: number, min: number, max: number) {
    return Math.min(max, Math.max(min, num));
}

function assetName(card: CardInventory) {
    return `${card.year} ${card.player} ${card.set}`.trim();
}

export const CatalystEngine = {
    generateScenarios(inventory: CardInventory[]): CatalystScenario[] {
        return inventory
            .filter(card => (card.currentValue || 0) > 0)
            .slice(0, 12)
            .map(card => {
                const confidence = clamp(((card.valuationConfidence || 0.65) + ((card.liquidityScore || 50) / 100)) / 2, 0.45, 0.96);
                const scarcityBoost = (card.scarcityIndex || 50) / 10;
                const opportunityBoost = (card.opportunityScore || 50) / 8;
                const baselineMove = Math.round((scarcityBoost + opportunityBoost + (card.league === 'MiLB' ? 6 : 3)) * 10) / 10;

                if (card.league === 'MiLB') {
                    return {
                        id: `${card.id}-call-up`,
                        assetId: card.id,
                        assetName: assetName(card),
                        catalyst: 'call_up',
                        headline: `${card.player} promotion watch`,
                        triggerWindow: 'Next 14-30 days',
                        confidence,
                        expectedMovePct: baselineMove + 4,
                        downsidePct: 6,
                        suggestedAction: 'Accumulate',
                        bias: 'bullish'
                    };
                }

                if ((card.popCount || 0) > 0 && (card.popHigher || 0) <= 3) {
                    return {
                        id: `${card.id}-scarcity`,
                        assetId: card.id,
                        assetName: assetName(card),
                        catalyst: 'scarcity_spike',
                        headline: `${card.player} low-pop supply squeeze`,
                        triggerWindow: 'Next major show cycle',
                        confidence,
                        expectedMovePct: baselineMove + 2,
                        downsidePct: 4,
                        suggestedAction: 'Hold',
                        bias: 'bullish'
                    };
                }

                if ((card.currentValue || 0) > (card.purchasePrice || 0) * 1.35) {
                    return {
                        id: `${card.id}-award-race`,
                        assetId: card.id,
                        assetName: assetName(card),
                        catalyst: 'award_race',
                        headline: `${card.player} sentiment premium at risk`,
                        triggerWindow: 'Next 7-21 days',
                        confidence,
                        expectedMovePct: baselineMove,
                        downsidePct: 8,
                        suggestedAction: 'Trim',
                        bias: 'defensive'
                    };
                }

                return {
                    id: `${card.id}-playoff`,
                    assetId: card.id,
                    assetName: assetName(card),
                    catalyst: 'playoff',
                    headline: `${card.player} event-driven demand window`,
                    triggerWindow: 'Next marquee schedule window',
                    confidence,
                    expectedMovePct: baselineMove,
                    downsidePct: 5,
                    suggestedAction: 'Monitor',
                    bias: 'neutral'
                };
            })
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
