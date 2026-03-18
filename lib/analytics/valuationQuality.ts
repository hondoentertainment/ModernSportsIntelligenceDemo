import { PricingAnalysis, ValuationQuality } from '../../types';

function hoursBetween(startIso: string, end: Date): number {
    const start = new Date(startIso);
    if (Number.isNaN(start.getTime())) {
        return Number.POSITIVE_INFINITY;
    }
    return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
}

export function evaluateValuationQuality(
    analysis: PricingAnalysis,
    now: Date = new Date()
): ValuationQuality {
    const freshnessHours = hoursBetween(analysis.valuationTimestamp || analysis.lastUpdated, now);
    const isStale = freshnessHours > 48;

    const confidence = Math.max(0, Math.min(1, analysis.confidence || 0));
    const confidenceTier: ValuationQuality['confidenceTier'] =
        confidence >= 0.8 ? 'High' : confidence >= 0.55 ? 'Medium' : 'Low';

    const freshnessScore = freshnessHours <= 24
        ? 1
        : freshnessHours >= 168
            ? 0
            : 1 - ((freshnessHours - 24) / (168 - 24));

    const salesDepthScore = Math.max(0, Math.min(1, (analysis.salesCount || 0) / 20));
    const sourceBoost = analysis.valuationSource === 'ebay-api' ? 8 : analysis.valuationSource === 'gemini' ? 3 : 0;

    const qualityScore = Math.round(
        Math.max(0, Math.min(100,
            (confidence * 70) +
            (freshnessScore * 20) +
            (salesDepthScore * 10) +
            sourceBoost
        ))
    );

    const warnings: string[] = [];
    if (isStale) warnings.push('Valuation data is stale (>48h).');
    if ((analysis.salesCount || 0) < 3) warnings.push('Low sales depth may reduce reliability.');
    if (confidenceTier === 'Low') warnings.push('Model confidence is low.');

    return {
        isStale,
        freshnessHours: Math.round(freshnessHours * 10) / 10,
        confidenceTier,
        qualityScore,
        warnings
    };
}

export function attachValuationQuality(
    analysis: PricingAnalysis,
    now: Date = new Date()
): PricingAnalysis {
    return {
        ...analysis,
        quality: evaluateValuationQuality(analysis, now)
    };
}
