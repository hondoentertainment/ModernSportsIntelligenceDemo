
import { CardInventory } from '../types';

export interface ExitVenueEstimate {
    venue: 'eBay' | 'Auction House' | 'Card Show' | 'Direct Deal';
    feeRate: number;
    saleFees: number;
    estimatedTax: number;
    netAfterTax: number;
}

export interface ExitSimulationResult {
    targetPrice: number;
    saleFees: number;
    totalBasis: number;
    grossProfit: number;
    estimatedTax: number;
    netProfit: number;
    roi: number;
    taxTreatment: 'Short Term' | 'Long Term';
    daysToLongTerm: number;
    venueEstimates: ExitVenueEstimate[];
}

export interface ExitRecommendation {
    cardId: string;
    assetName: string;
    recommendedAction: 'Sell Now' | 'Wait For Long-Term' | 'Harvest Loss' | 'Hold';
    targetVenue: ExitVenueEstimate['venue'];
    targetPrice: number;
    netAfterTax: number;
    liftVsBase: number;
    reason: string;
}

function getHoldingDays(item: CardInventory): number {
    const purchaseDate = new Date(item.purchaseDate || new Date().toISOString());
    const diff = Date.now() - purchaseDate.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function getTaxProfile(item: CardInventory, shortTermRate: number, longTermRate: number) {
    const holdingDays = getHoldingDays(item);
    const taxTreatment: ExitSimulationResult['taxTreatment'] = holdingDays >= 365 ? 'Long Term' : 'Short Term';
    const daysToLongTerm = Math.max(0, 365 - holdingDays);

    return {
        taxTreatment,
        daysToLongTerm,
        taxRate: taxTreatment === 'Long Term' ? longTermRate : shortTermRate
    };
}

export const FiscalService = {
    /**
     * Calculates total estimated tax liability for active assets.
     */
    calculateTaxLiability(inventory: CardInventory[], shortTermRate = 0.35, longTermRate = 0.20) {
        const activeAssets = inventory.filter(item => item.status !== 'sold');
        const now = new Date();
        const yearInMs = 365 * 24 * 60 * 60 * 1000;

        return activeAssets.reduce((acc, item) => {
            const basis = (item.purchasePrice || 0) + (item.overheadCost || 0);
            const gain = Math.max(0, (item.currentValue || 0) - basis);

            if (gain === 0) return acc;

            const purchaseDate = new Date(item.purchaseDate || now.toISOString());
            const isLongTerm = (now.getTime() - purchaseDate.getTime()) > yearInMs;

            const tax = isLongTerm ? gain * longTermRate : gain * shortTermRate;

            acc.total += tax;
            if (isLongTerm) acc.longTerm += tax;
            else acc.shortTerm += tax;
            acc.totalGain += gain;

            return acc;
        }, { total: 0, shortTerm: 0, longTerm: 0, totalGain: 0 });
    },

    /**
     * Simulates a sale event to determine net profit after tax and overhead.
     */
    simulateExit(item: CardInventory, targetPrice: number, taxRate?: number): ExitSimulationResult {
        const currentOverhead = (item.gradingFees || 0) + (item.shippingFees || 0) + (item.insuranceFees || 0);
        const totalBasis = (item.purchasePrice || 0) + currentOverhead;
        const taxProfile = getTaxProfile(item, taxRate ?? 0.35, 0.2);
        const baseSaleFees = targetPrice * 0.13; // Average marketplace fee (eBay ~13%)
        const grossProfit = targetPrice - totalBasis - baseSaleFees;
        const estimatedTax = Math.max(0, grossProfit * taxProfile.taxRate);
        const netProfit = grossProfit - estimatedTax;
        const venueInputs: Array<Pick<ExitVenueEstimate, 'venue' | 'feeRate'>> = [
            { venue: 'eBay', feeRate: 0.13 },
            { venue: 'Auction House', feeRate: 0.18 },
            { venue: 'Card Show', feeRate: 0.04 },
            { venue: 'Direct Deal', feeRate: 0.02 }
        ];
        const venueEstimates = venueInputs.map(({ venue, feeRate }) => {
            const saleFees = targetPrice * feeRate;
            const profitBeforeTax = targetPrice - totalBasis - saleFees;
            const venueTax = Math.max(0, profitBeforeTax * taxProfile.taxRate);

            return {
                venue,
                feeRate,
                saleFees,
                estimatedTax: venueTax,
                netAfterTax: profitBeforeTax - venueTax
            };
        }).sort((a, b) => b.netAfterTax - a.netAfterTax);

        return {
            targetPrice,
            saleFees: baseSaleFees,
            totalBasis,
            grossProfit,
            estimatedTax,
            netProfit,
            roi: totalBasis > 0 ? (netProfit / totalBasis) * 100 : 0,
            taxTreatment: taxProfile.taxTreatment,
            daysToLongTerm: taxProfile.daysToLongTerm,
            venueEstimates
        };
    },

    optimizeExitPlan(inventory: CardInventory[]): ExitRecommendation[] {
        return inventory
            .filter(item => item.status !== 'sold' && (item.currentValue || 0) > 0)
            .map(item => {
                const currentValue = item.currentValue || 0;
                const immediate = this.simulateExit(item, currentValue);
                const deferred = this.simulateExit(item, currentValue * 1.05, 0.2);
                const basis = immediate.totalBasis;
                const unrealized = currentValue - basis;
                const bestImmediateVenue = immediate.venueEstimates[0];
                const bestDeferredVenue = deferred.venueEstimates[0];

                if (unrealized < 0) {
                    return {
                        cardId: item.id,
                        assetName: `${item.year} ${item.player} ${item.set}`.trim(),
                        recommendedAction: 'Harvest Loss' as const,
                        targetVenue: bestImmediateVenue.venue,
                        targetPrice: currentValue,
                        netAfterTax: bestImmediateVenue.netAfterTax,
                        liftVsBase: 0,
                        reason: 'Position is underwater versus basis and can offset realized gains.'
                    };
                }

                if (immediate.daysToLongTerm > 0 && immediate.daysToLongTerm <= 45 && bestDeferredVenue.netAfterTax > bestImmediateVenue.netAfterTax) {
                    return {
                        cardId: item.id,
                        assetName: `${item.year} ${item.player} ${item.set}`.trim(),
                        recommendedAction: 'Wait For Long-Term' as const,
                        targetVenue: bestDeferredVenue.venue,
                        targetPrice: currentValue * 1.05,
                        netAfterTax: bestDeferredVenue.netAfterTax,
                        liftVsBase: bestDeferredVenue.netAfterTax - bestImmediateVenue.netAfterTax,
                        reason: `Holding ${immediate.daysToLongTerm} more days should reduce tax drag materially.`
                    };
                }

                if (bestImmediateVenue.netAfterTax > basis * 1.15) {
                    return {
                        cardId: item.id,
                        assetName: `${item.year} ${item.player} ${item.set}`.trim(),
                        recommendedAction: 'Sell Now' as const,
                        targetVenue: bestImmediateVenue.venue,
                        targetPrice: currentValue,
                        netAfterTax: bestImmediateVenue.netAfterTax,
                        liftVsBase: 0,
                        reason: 'Net proceeds are attractive now after fees and taxes.'
                    };
                }

                return {
                    cardId: item.id,
                    assetName: `${item.year} ${item.player} ${item.set}`.trim(),
                    recommendedAction: 'Hold' as const,
                    targetVenue: bestDeferredVenue.venue,
                    targetPrice: currentValue * 1.05,
                    netAfterTax: bestDeferredVenue.netAfterTax,
                    liftVsBase: Math.max(0, bestDeferredVenue.netAfterTax - bestImmediateVenue.netAfterTax),
                    reason: 'Current spread does not justify exiting after friction costs.'
                };
            })
            .sort((a, b) => b.liftVsBase - a.liftVsBase);
    },

    /**
     * Tracks total sales in the current calendar year for 1099-K threshold monitoring.
     */
    get1099KExposure(inventory: CardInventory[]) {
        const currentYear = new Date().getFullYear();
        const salesThisYear = inventory.filter(item => {
            if (item.status !== 'sold' || !item.saleDate) return false;
            return new Date(item.saleDate).getFullYear() === currentYear;
        });

        const totalSalesVolume = salesThisYear.reduce((sum, item) => sum + (item.salePrice || 0), 0);
        const totalRealizedGain = salesThisYear.reduce((sum, item) => {
            const basis = (item.purchasePrice || 0) + (item.overheadCost || 0);
            return sum + ((item.salePrice || 0) - basis);
        }, 0);

        return {
            volume: totalSalesVolume,
            gain: totalRealizedGain,
            count: salesThisYear.length,
            threshold: 5000, // Common reporting threshold
            isNearThreshold: totalSalesVolume > 4000
        };
    }
};

