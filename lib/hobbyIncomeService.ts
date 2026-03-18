import { store } from './dal/syncStore';

// ---- Types ----

export type TransactionType = 'buy' | 'sell' | 'trade' | 'grading_fee' | 'shipping' | 'supplies';

export type Platform = 'eBay' | 'COMC' | 'MySlabs' | 'Local' | 'Show' | 'Other';

export interface Transaction {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  type: TransactionType;
  amount: number;
  date: string;
  platform: Platform;
  notes: string;
  grade?: string;
  imageUrl?: string;
}

export interface PnLSummary {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  marginPercent: number;
  transactionCount: number;
  avgProfit: number;
  bestFlip: { cardName: string; profit: number };
  worstFlip: { cardName: string; loss: number };
}

export interface TaxThreshold {
  currentIncome: number;
  hobbyLimit: number;
  businessThreshold: number;
  isApproachingLimit: boolean;
  percentToLimit: number;
  recommendation: string;
}

export interface MonthlyBreakdown {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
  transactionCount: number;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_hobby_income';
const HOBBY_LIMIT = 600; // IRS 1099-K threshold
const BUSINESS_THRESHOLD = 20000;

// ---- Mock Data ----

function generateMockTransactions(): Transaction[] {
  return [
    { id: '1', cardName: '2023 Topps Chrome Refractor', player: 'Gunnar Henderson', sport: 'Baseball', year: 2023, set: 'Topps Chrome', type: 'buy', amount: 45.00, date: '2025-01-10', platform: 'eBay', notes: 'Raw card, great centering' },
    { id: '2', cardName: '2023 Topps Chrome Refractor', player: 'Gunnar Henderson', sport: 'Baseball', year: 2023, set: 'Topps Chrome', type: 'grading_fee', amount: 25.00, date: '2025-01-15', platform: 'Other', notes: 'PSA grading fee' },
    { id: '3', cardName: '2023 Topps Chrome Refractor', player: 'Gunnar Henderson', sport: 'Baseball', year: 2023, set: 'Topps Chrome', type: 'sell', amount: 185.00, date: '2025-03-01', platform: 'eBay', notes: 'Sold as PSA 10', grade: 'PSA 10' },
    { id: '4', cardName: '2022 Panini Prizm Silver', player: 'Paolo Banchero', sport: 'Basketball', year: 2022, set: 'Panini Prizm', type: 'buy', amount: 120.00, date: '2025-01-20', platform: 'COMC', notes: 'Purchased graded', grade: 'BGS 9.5' },
    { id: '5', cardName: '2022 Panini Prizm Silver', player: 'Paolo Banchero', sport: 'Basketball', year: 2022, set: 'Panini Prizm', type: 'sell', amount: 95.00, date: '2025-02-15', platform: 'eBay', notes: 'Sold at a loss', grade: 'BGS 9.5' },
    { id: '6', cardName: '2023 Bowman Chrome Auto', player: 'Jackson Holliday', sport: 'Baseball', year: 2023, set: 'Bowman Chrome', type: 'buy', amount: 200.00, date: '2025-02-01', platform: 'Show', notes: 'Purchased at local card show' },
    { id: '7', cardName: '2023 Bowman Chrome Auto', player: 'Jackson Holliday', sport: 'Baseball', year: 2023, set: 'Bowman Chrome', type: 'sell', amount: 350.00, date: '2025-04-10', platform: 'MySlabs', notes: 'Great flip after call-up' },
    { id: '8', cardName: '2024 Panini Flawless', player: 'Victor Wembanyama', sport: 'Basketball', year: 2024, set: 'Panini Flawless', type: 'buy', amount: 500.00, date: '2025-03-05', platform: 'eBay', notes: 'High-end investment card' },
    { id: '9', cardName: '2024 Panini Flawless', player: 'Victor Wembanyama', sport: 'Basketball', year: 2024, set: 'Panini Flawless', type: 'shipping', amount: 15.00, date: '2025-03-06', platform: 'Other', notes: 'Insured shipping' },
    { id: '10', cardName: '2024 Panini Flawless', player: 'Victor Wembanyama', sport: 'Basketball', year: 2024, set: 'Panini Flawless', type: 'sell', amount: 820.00, date: '2025-05-20', platform: 'eBay', notes: 'Sold after All-Star break' },
    { id: '11', cardName: '2023 Topps Heritage', player: 'Adley Rutschman', sport: 'Baseball', year: 2023, set: 'Topps Heritage', type: 'buy', amount: 30.00, date: '2025-04-01', platform: 'Local', notes: 'LCS pickup' },
    { id: '12', cardName: '2023 Topps Heritage', player: 'Adley Rutschman', sport: 'Baseball', year: 2023, set: 'Topps Heritage', type: 'sell', amount: 55.00, date: '2025-06-15', platform: 'eBay', notes: 'Quick flip' },
    { id: '13', cardName: 'Card supplies', player: 'N/A', sport: 'N/A', year: 2025, set: 'N/A', type: 'supplies', amount: 75.00, date: '2025-01-05', platform: 'Other', notes: 'Top loaders, penny sleeves, team bags' },
    { id: '14', cardName: '2023 Select Concourse', player: 'CJ Stroud', sport: 'Football', year: 2023, set: 'Select', type: 'buy', amount: 85.00, date: '2025-05-01', platform: 'eBay', notes: 'Rookie card' },
    { id: '15', cardName: '2023 Select Concourse', player: 'CJ Stroud', sport: 'Football', year: 2023, set: 'Select', type: 'sell', amount: 140.00, date: '2025-07-20', platform: 'Show', notes: 'Sold at National' },
    { id: '16', cardName: 'Shipping supplies', player: 'N/A', sport: 'N/A', year: 2025, set: 'N/A', type: 'shipping', amount: 35.00, date: '2025-02-10', platform: 'Other', notes: 'Bubble mailers and tape' },
  ];
}

// ---- Storage Helpers ----

function loadTransactions(): Transaction[] {
  if (store.has(STORAGE_KEY)) {
    return store.get<Transaction[]>(STORAGE_KEY, []);
  }
  const mock = generateMockTransactions();
  store.set(STORAGE_KEY, mock);
  return mock;
}

function saveTransactions(txns: Transaction[]): void {
  store.set(STORAGE_KEY, txns);
}

// ---- Public API ----

export function getTransactions(): Transaction[] {
  return loadTransactions();
}

export function addTransaction(t: Omit<Transaction, 'id'>): Transaction {
  const txns = loadTransactions();
  const newTxn: Transaction = {
    ...t,
    id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
  txns.push(newTxn);
  saveTransactions(txns);
  return newTxn;
}

export function deleteTransaction(id: string): boolean {
  const txns = loadTransactions();
  const idx = txns.findIndex(t => t.id === id);
  if (idx === -1) return false;
  txns.splice(idx, 1);
  saveTransactions(txns);
  return true;
}

function isRevenue(type: TransactionType): boolean {
  return type === 'sell';
}

function isCost(type: TransactionType): boolean {
  return type === 'buy' || type === 'grading_fee' || type === 'shipping' || type === 'supplies';
}

export function getPnLSummary(dateRange?: { start: string; end: string }): PnLSummary {
  let txns = loadTransactions();

  if (dateRange) {
    const startDate = new Date(dateRange.start).getTime();
    const endDate = new Date(dateRange.end).getTime();
    txns = txns.filter(t => {
      const d = new Date(t.date).getTime();
      return d >= startDate && d <= endDate;
    });
  }

  const totalRevenue = txns.filter(t => isRevenue(t.type)).reduce((sum, t) => sum + t.amount, 0);
  const totalCosts = txns.filter(t => isCost(t.type)).reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalCosts;
  const marginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const transactionCount = txns.length;
  const sellCount = txns.filter(t => t.type === 'sell').length;
  const avgProfit = sellCount > 0 ? netProfit / sellCount : 0;

  // Find best and worst flips by matching sell transactions
  const sells = txns.filter(t => t.type === 'sell');
  const buys = txns.filter(t => t.type === 'buy');

  let bestFlip = { cardName: 'N/A', profit: 0 };
  let worstFlip = { cardName: 'N/A', loss: 0 };

  for (const sell of sells) {
    const matchingBuy = buys.find(b => b.cardName === sell.cardName);
    const cost = matchingBuy ? matchingBuy.amount : 0;
    const profit = sell.amount - cost;

    if (profit > bestFlip.profit) {
      bestFlip = { cardName: sell.cardName, profit };
    }
    if (profit < worstFlip.loss) {
      worstFlip = { cardName: sell.cardName, loss: profit };
    }
  }

  return {
    totalRevenue,
    totalCosts,
    netProfit,
    marginPercent,
    transactionCount,
    avgProfit,
    bestFlip,
    worstFlip,
  };
}

export function getTaxThreshold(): TaxThreshold {
  const txns = loadTransactions();
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const ytdSells = txns.filter(t => {
    return t.type === 'sell' && new Date(t.date) >= yearStart;
  });

  const currentIncome = ytdSells.reduce((sum, t) => sum + t.amount, 0);
  const percentToLimit = Math.min((currentIncome / HOBBY_LIMIT) * 100, 100);
  const isApproachingLimit = percentToLimit >= 75;

  let recommendation: string;
  if (currentIncome >= BUSINESS_THRESHOLD) {
    recommendation = 'You have exceeded the business threshold. Consider consulting a tax professional about Schedule C filing.';
  } else if (currentIncome >= HOBBY_LIMIT) {
    recommendation = 'You have exceeded the 1099-K threshold. Expect to receive a 1099-K from platforms. Track all expenses for deductions.';
  } else if (isApproachingLimit) {
    recommendation = 'You are approaching the 1099-K threshold. Keep detailed records of all expenses to offset income.';
  } else {
    recommendation = 'You are below the 1099-K reporting threshold. Continue tracking transactions for personal records.';
  }

  return {
    currentIncome,
    hobbyLimit: HOBBY_LIMIT,
    businessThreshold: BUSINESS_THRESHOLD,
    isApproachingLimit,
    percentToLimit,
    recommendation,
  };
}

export function getMonthlyBreakdown(): MonthlyBreakdown[] {
  const txns = loadTransactions();
  const monthMap = new Map<string, MonthlyBreakdown>();

  for (const t of txns) {
    const d = new Date(t.date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { month: monthKey, revenue: 0, costs: 0, profit: 0, transactionCount: 0 });
    }

    const entry = monthMap.get(monthKey)!;
    if (isRevenue(t.type)) {
      entry.revenue += t.amount;
    }
    if (isCost(t.type)) {
      entry.costs += t.amount;
    }
    entry.profit = entry.revenue - entry.costs;
    entry.transactionCount += 1;
  }

  return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export function getTopFlips(limit: number = 5): Array<{ cardName: string; buyPrice: number; sellPrice: number; profit: number; roi: number }> {
  const txns = loadTransactions();
  const sells = txns.filter(t => t.type === 'sell');
  const buys = txns.filter(t => t.type === 'buy');

  const flips = sells.map(sell => {
    const matchingBuy = buys.find(b => b.cardName === sell.cardName);
    const buyPrice = matchingBuy ? matchingBuy.amount : 0;
    const profit = sell.amount - buyPrice;
    const roi = buyPrice > 0 ? (profit / buyPrice) * 100 : 0;
    return { cardName: sell.cardName, buyPrice, sellPrice: sell.amount, profit, roi };
  });

  return flips.sort((a, b) => b.profit - a.profit).slice(0, limit);
}

export function getPlatformBreakdown(): Array<{ platform: Platform; revenue: number; costs: number; profit: number; count: number }> {
  const txns = loadTransactions();
  const platformMap = new Map<Platform, { revenue: number; costs: number; profit: number; count: number }>();

  for (const t of txns) {
    if (!platformMap.has(t.platform)) {
      platformMap.set(t.platform, { revenue: 0, costs: 0, profit: 0, count: 0 });
    }
    const entry = platformMap.get(t.platform)!;
    if (isRevenue(t.type)) {
      entry.revenue += t.amount;
    }
    if (isCost(t.type)) {
      entry.costs += t.amount;
    }
    entry.profit = entry.revenue - entry.costs;
    entry.count += 1;
  }

  return Array.from(platformMap.entries()).map(([platform, data]) => ({ platform, ...data }));
}

export function getSportBreakdown(): Array<{ sport: string; revenue: number; costs: number; profit: number; count: number }> {
  const txns = loadTransactions();
  const sportMap = new Map<string, { revenue: number; costs: number; profit: number; count: number }>();

  for (const t of txns) {
    if (!sportMap.has(t.sport)) {
      sportMap.set(t.sport, { revenue: 0, costs: 0, profit: 0, count: 0 });
    }
    const entry = sportMap.get(t.sport)!;
    if (isRevenue(t.type)) {
      entry.revenue += t.amount;
    }
    if (isCost(t.type)) {
      entry.costs += t.amount;
    }
    entry.profit = entry.revenue - entry.costs;
    entry.count += 1;
  }

  return Array.from(sportMap.entries()).map(([sport, data]) => ({ sport, ...data }));
}

export function getYTDSummary(): { revenue: number; costs: number; profit: number; transactionCount: number; daysInYear: number; projectedAnnual: number } {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.ceil((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));

  const txns = loadTransactions().filter(t => new Date(t.date) >= yearStart);

  const revenue = txns.filter(t => isRevenue(t.type)).reduce((sum, t) => sum + t.amount, 0);
  const costs = txns.filter(t => isCost(t.type)).reduce((sum, t) => sum + t.amount, 0);
  const profit = revenue - costs;
  const transactionCount = txns.length;
  const projectedAnnual = dayOfYear > 0 ? (profit / dayOfYear) * 365 : 0;

  return { revenue, costs, profit, transactionCount, daysInYear: dayOfYear, projectedAnnual };
}

export function exportCSV(): string {
  const txns = loadTransactions();
  const headers = ['ID', 'Card Name', 'Player', 'Sport', 'Year', 'Set', 'Type', 'Amount', 'Date', 'Platform', 'Notes', 'Grade', 'Image URL'];
  const rows = txns.map(t => [
    t.id,
    `"${t.cardName}"`,
    `"${t.player}"`,
    t.sport,
    String(t.year),
    `"${t.set}"`,
    t.type,
    t.amount.toFixed(2),
    t.date,
    t.platform,
    `"${t.notes}"`,
    t.grade || '',
    t.imageUrl || '',
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

export function formatCurrency(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return n < 0 ? `-${formatted}` : formatted;
}

export function formatPercent(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
}

export function getProfitColor(amount: number): string {
  if (amount > 0) return 'text-emerald-400';
  if (amount < 0) return 'text-red-400';
  return 'text-slate-400';
}

export function getPlatformColor(platform: Platform): string {
  const colors: Record<Platform, string> = {
    eBay: '#3b82f6',
    COMC: '#10b981',
    MySlabs: '#8b5cf6',
    Local: '#f59e0b',
    Show: '#ef4444',
    Other: '#6b7280',
  };
  return colors[platform] || '#6b7280';
}
