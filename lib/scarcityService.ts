import { CardInventory, PopReport } from '../types';

export class ScarcityService {
    /**
     * Determines scarcity data for a card. 
     * In a production environment, this would hit PSA/BGS APIs.
     * Here, we use a deterministic model with random variance to simulate live data.
     */
    static async getPopReport(card: CardInventory): Promise<PopReport> {
        // Base population model based on card attributes
        const basePop = this.calculateBasePop(card);
        const gradeImpact = this.getGradeImpact(card.grade || '10');

        // Simulate "Live" Fetching delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const popAtGrade = Math.max(1, Math.floor(basePop * gradeImpact));
        const popTotal = Math.floor(basePop * 2.5);
        const popHigher = card.grade === '10' ? 0 : Math.floor(popAtGrade * 0.15);

        return {
            popTotal,
            popAtGrade,
            popHigher,
            lastChecked: new Date().toISOString(),
            source: card.gradingCompany?.toLowerCase().includes('psa') ? 'psa' : 'bgs',
            badge: this.getBadgeType(popAtGrade, popHigher)
        };
    }

    static getBadgeType(popAtGrade: number, popHigher: number): 'Apex' | 'Low Pop' | 'Standard' {
        if (popAtGrade === 1 && popHigher === 0) return 'Apex';
        if (popAtGrade < 50) return 'Low Pop';
        return 'Standard';
    }

    private static calculateBasePop(card: CardInventory): number {
        let base = 5000; // Standard base for modern cards

        if (card.year < 2000) base = 2500;
        if (card.year < 1980) base = 1000;
        if (card.year < 1960) base = 500;

        // Sub-set or Parallel adjustments
        if (card.set.toLowerCase().includes('refractor')) base *= 0.2;
        if (card.set.toLowerCase().includes('prizm')) base *= 0.5;
        if (card.set.toLowerCase().includes('chrome')) base *= 0.7;

        return base;
    }

    private static getGradeImpact(grade: string): number {
        const g = grade.toString();
        if (g === '10' || g === 'Gem Mint') return 0.05; // Hard to get a 10
        if (g === '9' || g === 'Mint') return 0.20;
        if (g === '8') return 0.40;
        return 0.60;
    }

    /**
     * Multiplier for valuation based on scarcity.
     */
    static getScarcityMultiplier(report: PopReport): number {
        if (report.popTotal === 1) return 2.5; // Pop 1 rarity
        if (report.popAtGrade < 20) return 1.8;
        if (report.popAtGrade < 100) return 1.4;
        if (report.popAtGrade < 500) return 1.1;
        return 1.0;
    }

    /**
     * Calculates the ROI of grading this card.
     */
    static calculateGradingRoi(card: CardInventory): number {
        if (!card.purchasePrice) return 0;

        const totalBasis = (card.purchasePrice || 0) + (card.gradingFees || 0) + (card.shippingFees || 0);
        if (totalBasis === 0) return 0;

        const currentVal = card.currentValue || 0;
        if (currentVal === 0) return 0;

        return ((currentVal - totalBasis) / totalBasis) * 100;
    }

    /**
     * Synchronous estimator for analytics engine.
     * Uses actual card.popCount / card.popHigher when already populated
     * (e.g. from a previous live pop-report fetch) to avoid overwriting
     * real data with simulated values.
     */
    static generatePopData(card: CardInventory) {
        const basePop = this.calculateBasePop(card);
        const gradeImpact = this.getGradeImpact(card.grade || '10');
        const estimatedPop = Math.max(1, Math.floor(basePop * gradeImpact));

        const popCount = card.popCount ?? estimatedPop;
        const popHigher = card.popHigher ?? (card.grade === '10' ? 0 : Math.floor(popCount * 0.15));
        const scarcityIndex = this.calculateScarcityIndex(popCount, popHigher);
        const gradingRoi = this.calculateGradingRoi(card);

        return {
            popCount,
            popHigher,
            scarcityIndex,
            gradingRoi
        };
    }

    /**
     * Calculates a scarcity score from 0-100.
     */
    static calculateScarcityIndex(popAtGrade: number, popHigher: number): number {
        if (popAtGrade <= 0) return 0;

        // Base logic: higher pop = lower index, higher "pop higher" = much lower index
        const popPenalty = Math.min(60, popAtGrade / 10);
        const higherPenalty = Math.min(40, popHigher * 2);

        return Math.max(0, Math.round(100 - popPenalty - higherPenalty));
    }
}

export const generatePopData = (card: CardInventory) => ScarcityService.generatePopData(card);
export const calculateScarcityIndex = (popAtGrade: number, popHigher: number) => ScarcityService.calculateScarcityIndex(popAtGrade, popHigher);
