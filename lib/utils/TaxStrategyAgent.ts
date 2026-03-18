
import { CardInventory, AgentInsight } from '../../types';
import { FiscalService } from './FiscalService';

export const TaxStrategyAgent = {
    id: 'tax-strategy-agent',
    name: 'Fiscal Strategist',
    persona: 'Expert in capital gains optimization and tax-loss harvesting.',

    /**
     * Analyzes the collection for tax-saving opportunities.
     */
    generateInsights(inventory: CardInventory[]): AgentInsight[] {
        const insights: AgentInsight[] = [];
        const now = new Date();
        const yearInMs = 365 * 24 * 60 * 60 * 1000;
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

        const activeAssets = inventory.filter(p => p.status !== 'sold');

        // 1. Tax Loss Harvesting Detection
        const losses = activeAssets.filter(item => {
            const basis = (item.purchasePrice || 0) + (item.overheadCost || 0);
            return (item.currentValue || 0) < basis;
        });

        if (losses.length > 0) {
            const totalLossValue = losses.reduce((sum, item) => {
                const basis = (item.purchasePrice || 0) + (item.overheadCost || 0);
                return sum + (basis - (item.currentValue || 0));
            }, 0);

            insights.push({
                agentId: this.id,
                agentName: this.name,
                persona: this.persona,
                sentiment: 'neutral',
                confidence: 0.95,
                insight: `Identified ${losses.length} Tax Loss Harvesting opportunities worth $${totalLossValue.toFixed(2)}. Consider selling these to offset realized gains.`
            });
        }

        // 2. Holding Period Optimization (Short-term to Long-term transition)
        const transitioning = activeAssets.filter(item => {
            const purchaseDate = new Date(item.purchaseDate || now.toISOString());
            const age = now.getTime() - purchaseDate.getTime();
            return age > (yearInMs - thirtyDaysInMs) && age < yearInMs;
        });

        if (transitioning.length > 0) {
            insights.push({
                agentId: this.id,
                agentName: this.name,
                persona: this.persona,
                sentiment: 'positive',
                confidence: 0.9,
                insight: `${transitioning.length} assets are within 30 days of transitioning to Long-Term Capital Gains (20% vs 35%). Delaying sales could save significant tax.`
            });
        }

        // 3. 1099-K Exposure Warning
        const exposure = FiscalService.get1099KExposure(inventory);
        if (exposure.isNearThreshold) {
            insights.push({
                agentId: this.id,
                agentName: this.name,
                persona: this.persona,
                sentiment: 'negative',
                confidence: 1.0,
                insight: `URGENT: Annual sales volume ($${exposure.volume.toFixed(2)}) is nearing the $${exposure.threshold} reporting threshold. Expect a 1099-K filing.`
            });
        }

        const optimizerTop = FiscalService.optimizeExitPlan(activeAssets).find(plan => plan.recommendedAction !== 'Hold');
        if (optimizerTop) {
            insights.push({
                agentId: this.id,
                agentName: this.name,
                persona: this.persona,
                sentiment: optimizerTop.recommendedAction === 'Harvest Loss' ? 'neutral' : 'positive',
                confidence: 0.88,
                insight: `Optimizer suggests "${optimizerTop.recommendedAction}" for ${optimizerTop.assetName} via ${optimizerTop.targetVenue}. Estimated lift: $${optimizerTop.liftVsBase.toFixed(0)}.`
            });
        }

        return insights;
    }
};
