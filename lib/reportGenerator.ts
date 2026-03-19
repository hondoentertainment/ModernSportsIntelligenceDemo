
import { CardInventory } from '../types.ts';

export interface PortfolioReport {
    generatedAt: string;
    summary: {
        totalAssets: number;
        totalInvested: number;
        currentValue: number;
        unrealizedGainLoss: number;
        roi: number;
    };
    topGainers: { card: CardInventory; gainLoss: number; roiPercent: number }[];
    topLosers: { card: CardInventory; gainLoss: number; roiPercent: number }[];
    byLeague: { league: string; count: number; value: number }[];
    assets: CardInventory[];
}

/**
 * Generate a comprehensive portfolio report
 */
export function generateReport(inventory: CardInventory[]): PortfolioReport {
    const now = new Date().toISOString();

    const totalInvested = inventory.reduce((sum, c) => sum + (c.purchasePrice || 0), 0);
    const currentValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
    const unrealizedGainLoss = currentValue - totalInvested;
    const roi = totalInvested > 0 ? (unrealizedGainLoss / totalInvested) * 100 : 0;

    // Calculate per-card performance
    const withPerformance = inventory.map(card => {
        const gainLoss = (card.currentValue || 0) - (card.purchasePrice || 0);
        const roiPercent = card.purchasePrice > 0 ? (gainLoss / card.purchasePrice) * 100 : 0;
        return { card, gainLoss, roiPercent };
    });

    // Sort for top gainers/losers
    const sorted = [...withPerformance].sort((a, b) => b.roiPercent - a.roiPercent);
    const topGainers = sorted.filter(p => p.roiPercent > 0).slice(0, 5);
    const topLosers = sorted.filter(p => p.roiPercent < 0).slice(-5).reverse();

    // Group by league
    const leagueMap = new Map<string, { count: number; value: number }>();
    inventory.forEach(card => {
        const existing = leagueMap.get(card.league) || { count: 0, value: 0 };
        leagueMap.set(card.league, {
            count: existing.count + 1,
            value: existing.value + (card.currentValue || 0)
        });
    });
    const byLeague = Array.from(leagueMap.entries()).map(([league, data]) => ({
        league,
        count: data.count,
        value: data.value
    })).sort((a, b) => b.value - a.value);

    return {
        generatedAt: now,
        summary: {
            totalAssets: inventory.length,
            totalInvested,
            currentValue,
            unrealizedGainLoss,
            roi
        },
        topGainers,
        topLosers,
        byLeague,
        assets: inventory
    };
}

/**
 * Export report as CSV
 */
export function exportToCSV(report: PortfolioReport): string {
    const headers = [
        'Player',
        'Year',
        'Manufacturer',
        'Set',
        'Card Number',
        'Sport',
        'League',
        'Graded',
        'Grade',
        'Purchase Price',
        'Current Value',
        'Gain/Loss',
        'ROI %'
    ];

    const rows = report.assets.map(card => {
        const gainLoss = (card.currentValue || 0) - (card.purchasePrice || 0);
        const roi = card.purchasePrice > 0 ? (gainLoss / card.purchasePrice) * 100 : 0;
        return [
            card.player,
            card.year,
            card.manufacturer,
            card.set,
            card.cardNumber,
            card.sport,
            card.league,
            card.isGraded ? 'Yes' : 'No',
            card.isGraded ? `${card.gradingCompany} ${card.grade}` : 'N/A',
            card.purchasePrice.toFixed(2),
            (card.currentValue || 0).toFixed(2),
            gainLoss.toFixed(2),
            roi.toFixed(2)
        ];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}

/**
 * Generate text summary for the report
 */
export function generateTextReport(report: PortfolioReport): string {
    const { summary, topGainers, topLosers, byLeague } = report;
    const date = new Date(report.generatedAt).toLocaleDateString();

    let text = `
PORTFOLIO PERFORMANCE REPORT
Generated: ${date}
${'='.repeat(50)}

PORTFOLIO SUMMARY
-----------------
Total Assets: ${summary.totalAssets}
Total Invested: $${summary.totalInvested.toLocaleString()}
Current Value: $${summary.currentValue.toLocaleString()}
Unrealized G/L: ${summary.unrealizedGainLoss >= 0 ? '+' : ''}$${summary.unrealizedGainLoss.toLocaleString()}
ROI: ${summary.roi >= 0 ? '+' : ''}${summary.roi.toFixed(2)}%

TOP GAINERS
-----------`;

    topGainers.forEach((item, i) => {
        text += `\n${i + 1}. ${item.card.player} (${item.card.set})`;
        text += `\n   ROI: +${item.roiPercent.toFixed(1)}% | G/L: +$${item.gainLoss.toLocaleString()}`;
    });

    text += `\n\nTOP LOSERS\n----------`;
    topLosers.forEach((item, i) => {
        text += `\n${i + 1}. ${item.card.player} (${item.card.set})`;
        text += `\n   ROI: ${item.roiPercent.toFixed(1)}% | G/L: -$${Math.abs(item.gainLoss).toLocaleString()}`;
    });

    text += `\n\nBY LEAGUE\n---------`;
    byLeague.forEach(item => {
        text += `\n${item.league}: ${item.count} cards | $${item.value.toLocaleString()}`;
    });

    return text;
}

/**
 * Download a file in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
