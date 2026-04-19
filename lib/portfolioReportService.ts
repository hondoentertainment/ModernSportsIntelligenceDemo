import { CardInventory } from '../types';

export type ExportFormat = 'pdf' | 'csv' | 'json';
export type ReportType = 'portfolio' | 'tax' | 'grading' | 'liquidity' | 'stress' | 'insurance' | 'performance';

export interface ReportConfig {
  title: string;
  type: ReportType;
  format: ExportFormat;
  includeSold: boolean;
  sportFilter?: string;
  dateRange?: { start: string; end: string };
}

export interface SportAllocation {
  count: number;
  value: number;
  percent: number;
}

export interface PortfolioReport {
  totalValue: number;
  costBasis: number;
  pnl: number;
  pnlPercent: number;
  cardCount: number;
  sportAllocation: Record<string, SportAllocation>;
  graderDistribution: Record<string, number>;
  topPerformers: { player: string; pnl: number; pnlPercent: number }[];
  bottomPerformers: { player: string; pnl: number; pnlPercent: number }[];
  diversificationScore: number;
}

export interface TaxReport {
  unrealizedGains: number;
  unrealizedLosses: number;
  shortTermCount: number;
  longTermCount: number;
  shortTermGains: number;
  longTermGains: number;
  harvestableLosses: number;
  estimatedTaxLiability15: number;
  estimatedTaxLiability25: number;
  cardDetails: { player: string; purchasePrice: number; currentValue: number; gainLoss: number; holdingPeriod: 'short' | 'long' }[];
}

export interface GradingReport {
  totalCards: number;
  gradedCount: number;
  rawCount: number;
  gemRate: number;
  gradeDistribution: Record<string, number>;
  graderBreakdown: Record<string, number>;
  avgGrade: number;
}

export interface LiquidityReport {
  portfolioLiquidityScore: number;
  avgDaysToSell: number;
  illiquidCount: number;
  liquidIn7Days: number;
  liquidIn30Days: number;
  cardScores: { player: string; score: number; daysToSell: number }[];
}

export interface StressTestReport {
  var95: number;
  var99: number;
  worstCase: number;
  concentrationRisks: { type: string; name: string; exposure: number }[];
  diversificationBenefit: number;
}

export interface InsuranceReport {
  totalInsurableValue: number;
  estimatedPremium: number;
  coverageGapEstimate: number;
  highValueCards: { player: string; value: number }[];
  premiumRate: number;
}

export interface PerformanceReport {
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
}

export interface ReportHistoryEntry {
  id: string;
  config: ReportConfig;
  generatedAt: string;
}

const STORAGE_KEY = 'msi_report_history';

function formatCurrency(n: number): string {
  return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

function formatDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function filterCards(cards: CardInventory[], config?: Partial<ReportConfig>): CardInventory[] {
  let filtered = [...cards];
  if (config && !config.includeSold) {
    filtered = filtered.filter(c => c.status !== 'sold');
  }
  if (config?.sportFilter && config.sportFilter !== 'All') {
    filtered = filtered.filter(c => c.sport === config.sportFilter);
  }
  return filtered;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49979;
  return x - Math.floor(x);
}

export function generatePortfolioSummary(cards: CardInventory[], config?: Partial<ReportConfig>): PortfolioReport {
  const filtered = filterCards(cards, config);
  const totalValue = filtered.reduce((sum, c) => sum + (c.currentValue ?? c.purchasePrice), 0);
  const costBasis = filtered.reduce((sum, c) => sum + c.purchasePrice, 0);
  const pnl = totalValue - costBasis;
  const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

  const sportAlloc: Record<string, SportAllocation> = {};
  for (const card of filtered) {
    if (!sportAlloc[card.sport]) sportAlloc[card.sport] = { count: 0, value: 0, percent: 0 };
    sportAlloc[card.sport].count++;
    sportAlloc[card.sport].value += card.currentValue ?? card.purchasePrice;
  }
  for (const sport of Object.keys(sportAlloc)) {
    sportAlloc[sport].percent = totalValue > 0 ? (sportAlloc[sport].value / totalValue) * 100 : 0;
  }

  const graderDist: Record<string, number> = {};
  for (const card of filtered) {
    if (card.isGraded && card.gradingCompany) {
      graderDist[card.gradingCompany] = (graderDist[card.gradingCompany] || 0) + 1;
    } else {
      graderDist['Raw'] = (graderDist['Raw'] || 0) + 1;
    }
  }

  const performers = filtered.map(c => ({
    player: c.player,
    pnl: (c.currentValue ?? c.purchasePrice) - c.purchasePrice,
    pnlPercent: c.purchasePrice > 0 ? (((c.currentValue ?? c.purchasePrice) - c.purchasePrice) / c.purchasePrice) * 100 : 0,
  }));
  performers.sort((a, b) => b.pnl - a.pnl);

  const sportCounts = Object.values(sportAlloc).map(s => s.value);
  const hhi = totalValue > 0
    ? sportCounts.reduce((sum, v) => sum + Math.pow(v / totalValue, 2), 0)
    : 1;
  const diversificationScore = Math.round((1 - hhi) * 100);

  return {
    totalValue, costBasis, pnl, pnlPercent,
    cardCount: filtered.length,
    sportAllocation: sportAlloc,
    graderDistribution: graderDist,
    topPerformers: performers.slice(0, 5),
    bottomPerformers: performers.slice(-5).reverse(),
    diversificationScore,
  };
}

export function generateTaxReport(cards: CardInventory[], config?: Partial<ReportConfig>): TaxReport {
  const filtered = filterCards(cards, config);
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  let unrealizedGains = 0, unrealizedLosses = 0;
  let shortTermCount = 0, longTermCount = 0;
  let shortTermGains = 0, longTermGains = 0;
  let harvestableLosses = 0;

  const cardDetails = filtered.map(c => {
    const cv = c.currentValue ?? c.purchasePrice;
    const gl = cv - c.purchasePrice;
    const purchaseDate = new Date(c.purchaseDate);
    const isLongTerm = purchaseDate < oneYearAgo;
    if (isLongTerm) longTermCount++; else shortTermCount++;
    if (gl >= 0) {
      unrealizedGains += gl;
      if (isLongTerm) longTermGains += gl; else shortTermGains += gl;
    } else {
      unrealizedLosses += Math.abs(gl);
      harvestableLosses += Math.abs(gl);
    }
    return { player: c.player, purchasePrice: c.purchasePrice, currentValue: cv, gainLoss: gl, holdingPeriod: (isLongTerm ? 'long' : 'short') as 'short' | 'long' };
  });

  return {
    unrealizedGains, unrealizedLosses,
    shortTermCount, longTermCount,
    shortTermGains, longTermGains,
    harvestableLosses,
    estimatedTaxLiability15: (shortTermGains * 0.25 + longTermGains * 0.15),
    estimatedTaxLiability25: (shortTermGains * 0.32 + longTermGains * 0.20),
    cardDetails,
  };
}

export function generateGradingReport(cards: CardInventory[], config?: Partial<ReportConfig>): GradingReport {
  const filtered = filterCards(cards, config);
  const graded = filtered.filter(c => c.isGraded);
  const raw = filtered.filter(c => !c.isGraded);

  const gradeDist: Record<string, number> = {};
  const graderBreak: Record<string, number> = {};
  let gradeSum = 0;
  let gradeCount = 0;

  for (const c of graded) {
    const g = c.grade || 'Unknown';
    gradeDist[g] = (gradeDist[g] || 0) + 1;
    const company = c.gradingCompany || 'Unknown';
    graderBreak[company] = (graderBreak[company] || 0) + 1;
    const numGrade = parseFloat(g);
    if (!isNaN(numGrade)) { gradeSum += numGrade; gradeCount++; }
  }

  const gems = graded.filter(c => parseFloat(c.grade || '0') === 10).length;
  const gemRate = graded.length > 0 ? (gems / graded.length) * 100 : 0;

  return {
    totalCards: filtered.length,
    gradedCount: graded.length,
    rawCount: raw.length,
    gemRate,
    gradeDistribution: gradeDist,
    graderBreakdown: graderBreak,
    avgGrade: gradeCount > 0 ? gradeSum / gradeCount : 0,
  };
}

export function generateLiquidityReport(cards: CardInventory[], config?: Partial<ReportConfig>): LiquidityReport {
  const filtered = filterCards(cards, config);
  const sportPopularity: Record<string, number> = { Baseball: 0.7, Basketball: 0.9, Football: 0.85, Hockey: 0.5, Soccer: 0.6 };

  const cardScores = filtered.map((c, i) => {
    const pop = sportPopularity[c.sport] || 0.5;
    const gradeBonus = c.isGraded ? 15 : 0;
    const valueBonus = Math.min((c.currentValue ?? c.purchasePrice) / 500, 20);
    const base = seededRandom(i + c.player.length) * 30;
    const score = Math.min(100, Math.round(pop * 40 + gradeBonus + valueBonus + base));
    const daysToSell = Math.max(1, Math.round(60 * (1 - score / 100) + seededRandom(i * 7) * 10));
    return { player: c.player, score, daysToSell };
  });

  const avgScore = cardScores.length > 0 ? cardScores.reduce((s, c) => s + c.score, 0) / cardScores.length : 0;
  const avgDays = cardScores.length > 0 ? cardScores.reduce((s, c) => s + c.daysToSell, 0) / cardScores.length : 0;
  const illiquid = cardScores.filter(c => c.score < 30).length;
  const liquid7 = cardScores.filter(c => c.daysToSell <= 7).length;
  const liquid30 = cardScores.filter(c => c.daysToSell <= 30).length;

  return {
    portfolioLiquidityScore: Math.round(avgScore),
    avgDaysToSell: Math.round(avgDays),
    illiquidCount: illiquid,
    liquidIn7Days: liquid7,
    liquidIn30Days: liquid30,
    cardScores: cardScores.sort((a, b) => b.score - a.score),
  };
}

export function generateStressTestReport(cards: CardInventory[], config?: Partial<ReportConfig>): StressTestReport {
  const filtered = filterCards(cards, config);
  const totalValue = filtered.reduce((sum, c) => sum + (c.currentValue ?? c.purchasePrice), 0);

  const sportVolatility: Record<string, number> = { Baseball: 0.18, Basketball: 0.25, Football: 0.22, Hockey: 0.20, Soccer: 0.15 };
  const weightedVol = filtered.reduce((sum, c) => {
    const w = (c.currentValue ?? c.purchasePrice) / (totalValue || 1);
    return sum + w * (sportVolatility[c.sport] || 0.20);
  }, 0);

  const var95 = totalValue * weightedVol * 1.645;
  const var99 = totalValue * weightedVol * 2.326;
  const worstCase = totalValue * weightedVol * 3.0;

  const playerExposure: Record<string, number> = {};
  const sportExposure: Record<string, number> = {};
  for (const c of filtered) {
    const v = c.currentValue ?? c.purchasePrice;
    playerExposure[c.player] = (playerExposure[c.player] || 0) + v;
    sportExposure[c.sport] = (sportExposure[c.sport] || 0) + v;
  }

  const risks: { type: string; name: string; exposure: number }[] = [];
  for (const [name, value] of Object.entries(playerExposure)) {
    const pct = totalValue > 0 ? (value / totalValue) * 100 : 0;
    if (pct > 15) risks.push({ type: 'Player', name, exposure: pct });
  }
  for (const [name, value] of Object.entries(sportExposure)) {
    const pct = totalValue > 0 ? (value / totalValue) * 100 : 0;
    if (pct > 40) risks.push({ type: 'Sport', name, exposure: pct });
  }
  risks.sort((a, b) => b.exposure - a.exposure);

  const sportValues = Object.values(sportExposure);
  const hhi = totalValue > 0 ? sportValues.reduce((s, v) => s + Math.pow(v / totalValue, 2), 0) : 1;
  const divBenefit = Math.round((1 - hhi) * 100);

  return { var95, var99, worstCase, concentrationRisks: risks.slice(0, 10), diversificationBenefit: divBenefit };
}

export function generateInsuranceReport(cards: CardInventory[], config?: Partial<ReportConfig>): InsuranceReport {
  const filtered = filterCards(cards, config);
  const totalValue = filtered.reduce((sum, c) => sum + (c.currentValue ?? c.purchasePrice), 0);
  const premiumRate = totalValue > 50000 ? 0.01 : totalValue > 10000 ? 0.015 : 0.02;
  const premium = totalValue * premiumRate;
  const highValue = filtered
    .filter(c => (c.currentValue ?? c.purchasePrice) > 500)
    .map(c => ({ player: c.player, value: c.currentValue ?? c.purchasePrice }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
  const coveredEstimate = totalValue * 0.65;
  const gap = totalValue - coveredEstimate;

  return { totalInsurableValue: totalValue, estimatedPremium: premium, coverageGapEstimate: gap, highValueCards: highValue, premiumRate };
}

export function generatePerformanceReport(cards: CardInventory[], config?: Partial<ReportConfig>): PerformanceReport {
  const filtered = filterCards(cards, config);
  const totalValue = filtered.reduce((sum, c) => sum + (c.currentValue ?? c.purchasePrice), 0);
  const costBasis = filtered.reduce((sum, c) => sum + c.purchasePrice, 0);
  const totalReturn = totalValue - costBasis;
  const totalReturnPercent = costBasis > 0 ? (totalReturn / costBasis) * 100 : 0;

  const dates = filtered.map(c => new Date(c.purchaseDate).getTime()).filter(d => !isNaN(d));
  const earliest = dates.length > 0 ? Math.min(...dates) : Date.now();
  const yearsHeld = Math.max(0.25, (Date.now() - earliest) / (365.25 * 24 * 60 * 60 * 1000));
  const annualizedReturn = costBasis > 0 ? (Math.pow(totalValue / costBasis, 1 / yearsHeld) - 1) * 100 : 0;

  const winners = filtered.filter(c => (c.currentValue ?? c.purchasePrice) >= c.purchasePrice).length;
  const winRate = filtered.length > 0 ? (winners / filtered.length) * 100 : 0;

  const volatility = 0.20;
  const riskFreeRate = 0.05;
  const sharpeRatio = volatility > 0 ? (annualizedReturn / 100 - riskFreeRate) / volatility : 0;
  const maxDrawdown = Math.min(0, -totalReturnPercent * 0.4 - 5);

  return { totalReturn, totalReturnPercent, annualizedReturn, sharpeRatio, maxDrawdown, winRate };
}

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    const val = row[h];
    const str = String(val ?? '');
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"` : str;
  }).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  triggerDownload(csv, filename + '.csv', 'text/csv');
}

export function exportToJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  triggerDownload(json, filename + '.json', 'application/json');
}

export async function exportToPDF(report: PortfolioReport, config: ReportConfig): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setTextColor(132, 204, 22);
  doc.setFontSize(10);
  doc.text('MODERN SPORTS INTELLIGENCE', 15, 15);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(config.title || 'Portfolio Report', 15, 28);

  doc.setTextColor(150, 150, 170);
  doc.setFontSize(9);
  doc.text(`Generated: ${formatDate(new Date())}`, 15, 35);

  let y = 48;
  doc.setFillColor(30, 30, 55);
  doc.roundedRect(15, y, 85, 22, 3, 3, 'F');
  doc.roundedRect(110, y, 85, 22, 3, 3, 'F');
  doc.setTextColor(150, 150, 170);
  doc.setFontSize(8);
  doc.text('TOTAL VALUE', 20, y + 8);
  doc.text('COST BASIS', 115, y + 8);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(formatCurrency(report.totalValue), 20, y + 17);
  doc.text(formatCurrency(report.costBasis), 115, y + 17);

  y += 28;
  doc.setFillColor(30, 30, 55);
  doc.roundedRect(15, y, 85, 22, 3, 3, 'F');
  doc.roundedRect(110, y, 85, 22, 3, 3, 'F');
  doc.setTextColor(150, 150, 170);
  doc.setFontSize(8);
  doc.text('P&L', 20, y + 8);
  doc.text('CARDS', 115, y + 8);
  doc.setTextColor(report.pnl >= 0 ? 132 : 239, report.pnl >= 0 ? 204 : 68, report.pnl >= 0 ? 22 : 68);
  doc.setFontSize(14);
  doc.text(`${report.pnl >= 0 ? '+' : '-'}${formatCurrency(report.pnl)} (${formatPercent(report.pnlPercent)})`, 20, y + 17);
  doc.setTextColor(255, 255, 255);
  doc.text(String(report.cardCount), 115, y + 17);

  y += 32;
  doc.setTextColor(132, 204, 22);
  doc.setFontSize(11);
  doc.text('TOP PERFORMERS', 15, y);
  y += 6;
  doc.setFillColor(35, 35, 60);
  doc.setTextColor(150, 150, 170);
  doc.setFontSize(8);
  doc.text('PLAYER', 17, y + 4);
  doc.text('P&L', 130, y + 4);
  doc.text('RETURN', 165, y + 4);
  doc.rect(15, y, 180, 7, 'F');
  y += 8;

  doc.setTextColor(255, 255, 255);
  for (const p of report.topPerformers.slice(0, 5)) {
    if (y > 270) break;
    doc.setFontSize(9);
    doc.text(p.player, 17, y + 4);
    doc.setTextColor(p.pnl >= 0 ? 132 : 239, p.pnl >= 0 ? 204 : 68, p.pnl >= 0 ? 22 : 68);
    doc.text(`${p.pnl >= 0 ? '+' : ''}${formatCurrency(p.pnl)}`, 130, y + 4);
    doc.text(formatPercent(p.pnlPercent), 165, y + 4);
    doc.setTextColor(255, 255, 255);
    y += 7;
  }

  y += 8;
  doc.setTextColor(132, 204, 22);
  doc.setFontSize(11);
  doc.text('SPORT ALLOCATION', 15, y);
  y += 6;

  for (const [sport, alloc] of Object.entries(report.sportAllocation)) {
    if (y > 280) break;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(sport, 17, y + 4);
    doc.text(`${alloc.count} cards`, 80, y + 4);
    doc.text(formatCurrency(alloc.value), 120, y + 4);
    doc.text(`${alloc.percent.toFixed(1)}%`, 170, y + 4);
    y += 7;
  }

  doc.setTextColor(100, 100, 120);
  doc.setFontSize(7);
  doc.text(`Page 1 of 1 | Modern Sports Intelligence`, 15, 290);

  doc.save((config.title || 'portfolio-report').replace(/\s+/g, '-').toLowerCase() + '.pdf');
}

export function exportAllData(): void {
  const allData: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('msi_')) {
      try {
        allData[key] = JSON.parse(localStorage.getItem(key) || '');
      } catch {
        allData[key] = localStorage.getItem(key);
      }
    }
  }
  allData._exportedAt = new Date().toISOString();
  allData._version = '1.0';
  exportToJSON(allData, 'msi-full-backup-' + new Date().toISOString().slice(0, 10));
}

export function saveReportToHistory(config: ReportConfig): void {
  const history = getReportHistory();
  const entry: ReportHistoryEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    config,
    generatedAt: new Date().toISOString(),
  };
  history.unshift(entry);
  if (history.length > 50) history.length = 50;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getReportHistory(): ReportHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
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

export { formatCurrency, formatPercent, formatDate };
