/**
 * Pure portfolio math for collection / NAV views.
 * Kept framework-free for unit tests and reuse outside React.
 */

export interface PortfolioCardLike {
    currentValue?: number | null;
    purchasePrice?: number | null;
    /** Omitted or unknown statuses are treated like active (included when excluding sold). */
    status?: 'active' | 'sold' | 'consignment' | string;
}

export interface ComputePortfolioStatsOptions {
    /**
     * When true (default), drop `sold` rows — matches the main inventory tab.
     * When false, include every card (legacy header totals on Collection).
     */
    excludeSold?: boolean;
}

export interface PortfolioStats {
    /** Net asset value: sum of current values (null/undefined → 0). */
    nav: number;
    totalCost: number;
    unrealizedPl: number;
    /** ROI as a percentage (e.g. 25 means +25%). 0 if totalCost is 0. */
    roiPercent: number;
    cardCount: number;
}

function num(v: number | null | undefined): number {
    if (v == null || Number.isNaN(v)) return 0;
    return v;
}

/** True if the card counts as disposed (vault), same as Collection inventory filter. */
export function isSoldStatus(status: PortfolioCardLike['status']): boolean {
    return status === 'sold';
}

export function filterActiveHoldings<T extends PortfolioCardLike>(cards: readonly T[]): T[] {
    return cards.filter((c) => !isSoldStatus(c.status));
}

export function computePortfolioStats(
    cards: readonly PortfolioCardLike[],
    options?: ComputePortfolioStatsOptions,
): PortfolioStats {
    const excludeSold = options?.excludeSold !== false;
    const rows = excludeSold ? filterActiveHoldings(cards) : [...cards];

    const nav = rows.reduce((sum, c) => sum + num(c.currentValue), 0);
    const totalCost = rows.reduce((sum, c) => sum + num(c.purchasePrice), 0);
    const unrealizedPl = nav - totalCost;
    const roiPercent = totalCost > 0 ? (unrealizedPl / totalCost) * 100 : 0;

    return {
        nav,
        totalCost,
        unrealizedPl,
        roiPercent,
        cardCount: rows.length,
    };
}
