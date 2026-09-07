import jsPDF from 'jspdf';
import { CardInventory } from '../../types';

export interface LeagueAllocationSlice {
    league: string;
    value: number;
    count: number;
    pct: number;
}

const LEAGUE_BAR_COLORS: Record<string, [number, number, number]> = {
    MLB: [34, 197, 94],
    MiLB: [132, 204, 22],
    NBA: [249, 115, 22],
    NFL: [59, 130, 246],
    Other: [148, 163, 184],
};

export function buildLeagueAllocation(inventory: CardInventory[]): LeagueAllocationSlice[] {
    const totalValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
    const leagueMap = new Map<string, { value: number; count: number }>();
    inventory.forEach((card) => {
        const league = card.league || 'Other';
        const current = leagueMap.get(league) || { value: 0, count: 0 };
        leagueMap.set(league, {
            value: current.value + (card.currentValue || 0),
            count: current.count + 1,
        });
    });
    return Array.from(leagueMap.entries())
        .map(([league, data]) => ({
            league,
            value: data.value,
            count: data.count,
            pct: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value);
}

type PdfShapeDoc = {
    setFillColor: (r: number, g: number, b: number) => unknown;
    rect: (x: number, y: number, w: number, h: number, style?: string) => unknown;
    setTextColor: (r: number, g: number, b: number) => unknown;
    setFontSize: (n: number) => unknown;
    setFont: (name: string, style: string) => unknown;
    text: (text: string, x: number, y: number) => unknown;
};

/** Horizontal league bars using existing jsPDF rects — no html2canvas. */
export function drawLeagueAllocationBars(
    doc: PdfShapeDoc,
    slices: LeagueAllocationSlice[],
    origin: { x: number; y: number; width: number; barHeight?: number },
): number {
    const barHeight = origin.barHeight ?? 8;
    let y = origin.y;
    slices.forEach((slice) => {
        const color = LEAGUE_BAR_COLORS[slice.league] || LEAGUE_BAR_COLORS.Other;
        const barWidth = Math.max(2, (origin.width * slice.pct) / 100);
        doc.setFillColor(226, 232, 240);
        doc.rect(origin.x, y, origin.width, barHeight, 'F');
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(origin.x, y, barWidth, barHeight, 'F');
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`${slice.league}  ${slice.pct.toFixed(1)}%  $${Math.round(slice.value).toLocaleString()}`, origin.x, y + barHeight + 4);
        y += barHeight + 10;
    });
    return y;
}

interface _PortfolioSummary {
    totalValue: number;
    totalCost: number;
    profit: number;
    roi: number;
    cardCount: number;
    topCards: CardInventory[];
    leagueBreakdown: { league: string; value: number; count: number }[];
    generatedAt: string;
}

/**
 * Generate a professional PDF report of the portfolio
 */
export function generatePortfolioReport(
    inventory: CardInventory[],
    userName: string = 'Collector'
): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    // Calculate summary stats
    const totalValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
    const totalCost = inventory.reduce((sum, c) => sum + (c.purchasePrice || 0), 0);
    const profit = totalValue - totalCost;
    const roi = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

    // Top 5 cards by value
    const topCards = [...inventory]
        .sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0))
        .slice(0, 5);

    const leagueBreakdown = buildLeagueAllocation(inventory);

    // === HEADER ===
    doc.setFillColor(30, 41, 59); // brand-charcoal
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('MODERN SPORTS INTELLIGENCE', margin, 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Portfolio Intelligence Report', margin, 30);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | ${userName}`, margin, 38);

    y = 55;

    // === SUMMARY SECTION ===
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PORTFOLIO SUMMARY', margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const summaryData = [
        ['Net Asset Value (NAV)', `$${totalValue.toLocaleString()}`],
        ['Total Cost Basis', `$${totalCost.toLocaleString()}`],
        ['Unrealized P/L', `${profit >= 0 ? '+' : ''}$${profit.toLocaleString()}`],
        ['ROI', `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`],
        ['Total Assets', `${inventory.length} cards`]
    ];

    summaryData.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'bold');
        doc.text(value, margin + 80, y);
        y += 7;
    });

    y += 10;

    // === LEAGUE ALLOCATION ===
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LEAGUE ALLOCATION', margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('League', margin, y);
    doc.text('Value', margin + 50, y);
    doc.text('Cards', margin + 90, y);
    doc.text('% of Portfolio', margin + 120, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    leagueBreakdown.forEach(({ league, value, count, pct }) => {
        doc.text(league, margin, y);
        doc.text(`$${value.toLocaleString()}`, margin + 50, y);
        doc.text(count.toString(), margin + 90, y);
        doc.text(`${pct.toFixed(1)}%`, margin + 120, y);
        y += 6;
    });
    y += 4;
    y = drawLeagueAllocationBars(doc, leagueBreakdown, { x: margin, y, width: pageWidth - margin * 2 });

    y += 15;

    // === TOP HOLDINGS ===
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TOP 5 HOLDINGS', margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Player', margin, y);
    doc.text('Set', margin + 55, y);
    doc.text('Value', margin + 120, y);
    doc.text('ROI', margin + 155, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    topCards.forEach(card => {
        const cardRoi = card.purchasePrice && card.currentValue
            ? ((card.currentValue - card.purchasePrice) / card.purchasePrice) * 100
            : 0;

        doc.text(card.player.substring(0, 20), margin, y);
        doc.text((card.set || '').substring(0, 25), margin + 55, y);
        doc.text(`$${(card.currentValue || 0).toLocaleString()}`, margin + 120, y);
        doc.text(`${cardRoi >= 0 ? '+' : ''}${cardRoi.toFixed(1)}%`, margin + 155, y);
        y += 6;
    });

    y += 15;

    // === FOOTER ===
    doc.setFillColor(217, 249, 157); // brand-lime
    doc.rect(0, 280, pageWidth, 17, 'F');

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Modern Sports Intelligence — Sports as an Asset Class', margin, 288);
    doc.text('Generated by MSI Portfolio Engine', pageWidth - margin - 60, 288);

    // Save the PDF
    doc.save(`MSI_Portfolio_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Generate a simplified Morning Briefing PDF
 */
export function generateBriefingReport(
    inventory: CardInventory[],
    alerts: { title: string; description: string }[] = []
): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    // Stats
    const totalValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
    const topMovers = [...inventory]
        .filter(c => c.currentValue && c.purchasePrice)
        .sort((a, b) => {
            const roiA = ((a.currentValue! - a.purchasePrice) / a.purchasePrice) * 100;
            const roiB = ((b.currentValue! - b.purchasePrice) / b.purchasePrice) * 100;
            return roiB - roiA;
        })
        .slice(0, 3);

    // === HEADER ===
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('MORNING BRIEFING', margin, 18);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), margin, 30);

    y = 50;

    // === NAV ===
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Portfolio NAV', margin, y);
    y += 8;

    doc.setFontSize(28);
    doc.setTextColor(34, 197, 94); // green
    doc.text(`$${totalValue.toLocaleString()}`, margin, y);
    y += 20;

    // === TOP MOVERS ===
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Movers', margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    topMovers.forEach((card, i) => {
        const roi = ((card.currentValue! - card.purchasePrice) / card.purchasePrice) * 100;
        doc.text(`${i + 1}. ${card.player} — ${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`, margin, y);
        y += 7;
    });

    y += 12;

    const leagueSlices = buildLeagueAllocation(inventory);
    if (leagueSlices.length > 0) {
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('League Allocation', margin, y);
        y += 8;
        y = drawLeagueAllocationBars(doc, leagueSlices, { x: margin, y, width: pageWidth - margin * 2 });
        y += 6;
    }

    // === ALERTS ===
    if (alerts.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Intelligence Alerts', margin, y);
        y += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        alerts.slice(0, 5).forEach(alert => {
            doc.setFont('helvetica', 'bold');
            doc.text(`• ${alert.title}`, margin, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            doc.text(`  ${alert.description.substring(0, 80)}`, margin, y);
            y += 8;
        });
    }

    // Save
    doc.save(`MSI_Morning_Briefing_${new Date().toISOString().split('T')[0]}.pdf`);
}
