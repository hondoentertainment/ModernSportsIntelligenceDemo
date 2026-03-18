// ---- Types ----

export type BreakType = 'hobby-box' | 'jumbo-box' | 'mega-box' | 'blaster' | 'hanger' | 'cello' | 'retail-pack' | 'group-break';
export type HitType = 'auto' | 'relic' | 'numbered' | 'parallel' | 'insert' | 'base' | 'sp' | 'ssp' | '1-of-1';

export interface WaxBreak {
  id: string;
  date: string;
  product: string;
  year: string;
  sport: string;
  breakType: BreakType;
  cost: number;
  totalHitsValue: number;
  roi: number;
  roiPercent: number;
  hits: Hit[];
  notes: string;
}

export interface Hit {
  id: string;
  cardName: string;
  player: string;
  hitType: HitType;
  numbered: string | null;
  estimatedValue: number;
  sold: boolean;
  soldPrice: number | null;
}

export interface BreakProduct {
  name: string;
  avgCost: number;
  avgRoi: number;
  avgRoiPercent: number;
  breakCount: number;
  bestHit: string;
  bestHitValue: number;
  hitRate: number;
}

export interface RoiTrend {
  month: string;
  totalSpent: number;
  totalReturn: number;
  roi: number;
  breakCount: number;
}

export interface BreakStats {
  totalBreaks: number;
  totalSpent: number;
  totalReturn: number;
  overallRoi: number;
  overallRoiPercent: number;
  bestBreakId: string;
  bestBreakRoi: number;
  worstBreakId: string;
  worstBreakRoi: number;
  avgHitsPerBreak: number;
  hitRate: number;
  profitableBreakRate: number;
}

// ---- Mock Data ----

const mockBreaks: WaxBreak[] = [
  {
    id: 'wb-1',
    date: '2026-03-14',
    product: '2024 Topps Chrome Baseball Hobby Box',
    year: '2024',
    sport: 'Baseball',
    breakType: 'hobby-box',
    cost: 325,
    totalHitsValue: 580,
    roi: 255,
    roiPercent: 78.5,
    hits: [
      { id: 'h1', cardName: 'Elly De La Cruz Gold Refractor /50', player: 'Elly De La Cruz', hitType: 'numbered', numbered: '/50', estimatedValue: 320, sold: false, soldPrice: null },
      { id: 'h2', cardName: 'Paul Skenes Auto', player: 'Paul Skenes', hitType: 'auto', numbered: null, estimatedValue: 185, sold: true, soldPrice: 195 },
      { id: 'h3', cardName: 'Jackson Chourio Pink Refractor', player: 'Jackson Chourio', hitType: 'parallel', numbered: null, estimatedValue: 45, sold: false, soldPrice: null },
      { id: 'h4', cardName: 'Shohei Ohtani Base', player: 'Shohei Ohtani', hitType: 'base', numbered: null, estimatedValue: 30, sold: false, soldPrice: null },
    ],
    notes: 'Great box! Gold /50 was the gem.',
  },
  {
    id: 'wb-2',
    date: '2026-03-10',
    product: '2023 Panini Prizm Basketball Hobby Box',
    year: '2023',
    sport: 'Basketball',
    breakType: 'hobby-box',
    cost: 850,
    totalHitsValue: 620,
    roi: -230,
    roiPercent: -27.1,
    hits: [
      { id: 'h5', cardName: 'Victor Wembanyama Silver Prizm', player: 'Victor Wembanyama', hitType: 'parallel', numbered: null, estimatedValue: 380, sold: false, soldPrice: null },
      { id: 'h6', cardName: 'Brandon Miller Auto', player: 'Brandon Miller', hitType: 'auto', numbered: null, estimatedValue: 120, sold: true, soldPrice: 115 },
      { id: 'h7', cardName: 'Scoot Henderson Green', player: 'Scoot Henderson', hitType: 'parallel', numbered: null, estimatedValue: 65, sold: false, soldPrice: null },
      { id: 'h8', cardName: 'Amen Thompson Base', player: 'Amen Thompson', hitType: 'base', numbered: null, estimatedValue: 55, sold: false, soldPrice: null },
    ],
    notes: 'Overpaid for box. Silver Wemby saved it.',
  },
  {
    id: 'wb-3',
    date: '2026-03-05',
    product: '2024 Donruss Football Mega Box',
    year: '2024',
    sport: 'Football',
    breakType: 'mega-box',
    cost: 65,
    totalHitsValue: 42,
    roi: -23,
    roiPercent: -35.4,
    hits: [
      { id: 'h9', cardName: 'Caleb Williams Rated Rookie', player: 'Caleb Williams', hitType: 'base', numbered: null, estimatedValue: 25, sold: false, soldPrice: null },
      { id: 'h10', cardName: 'Drake Maye Insert', player: 'Drake Maye', hitType: 'insert', numbered: null, estimatedValue: 12, sold: false, soldPrice: null },
      { id: 'h11', cardName: 'Marvin Harrison Jr Base', player: 'Marvin Harrison Jr', hitType: 'base', numbered: null, estimatedValue: 5, sold: false, soldPrice: null },
    ],
    notes: 'Retail has been rough lately.',
  },
  {
    id: 'wb-4',
    date: '2026-02-28',
    product: '2024 Bowman Chrome Baseball Hobby Box',
    year: '2024',
    sport: 'Baseball',
    breakType: 'hobby-box',
    cost: 275,
    totalHitsValue: 1250,
    roi: 975,
    roiPercent: 354.5,
    hits: [
      { id: 'h12', cardName: 'Paul Skenes Gold Auto /50', player: 'Paul Skenes', hitType: 'auto', numbered: '/50', estimatedValue: 850, sold: true, soldPrice: 920 },
      { id: 'h13', cardName: 'Ethan Salas 1st Auto', player: 'Ethan Salas', hitType: 'auto', numbered: null, estimatedValue: 280, sold: false, soldPrice: null },
      { id: 'h14', cardName: 'Roman Anthony Refractor', player: 'Roman Anthony', hitType: 'parallel', numbered: null, estimatedValue: 75, sold: false, soldPrice: null },
      { id: 'h15', cardName: 'Jackson Holliday Base', player: 'Jackson Holliday', hitType: 'base', numbered: null, estimatedValue: 45, sold: false, soldPrice: null },
    ],
    notes: 'Monster box! Skenes gold auto paid for everything.',
  },
  {
    id: 'wb-5',
    date: '2026-02-20',
    product: '2024 Topps Series 1 Baseball Hobby Box',
    year: '2024',
    sport: 'Baseball',
    breakType: 'hobby-box',
    cost: 125,
    totalHitsValue: 95,
    roi: -30,
    roiPercent: -24.0,
    hits: [
      { id: 'h16', cardName: 'Shohei Ohtani SP', player: 'Shohei Ohtani', hitType: 'sp', numbered: null, estimatedValue: 55, sold: false, soldPrice: null },
      { id: 'h17', cardName: 'Ronald Acuña Jr Relic', player: 'Ronald Acuña Jr', hitType: 'relic', numbered: null, estimatedValue: 25, sold: false, soldPrice: null },
      { id: 'h18', cardName: 'Corbin Carroll Insert', player: 'Corbin Carroll', hitType: 'insert', numbered: null, estimatedValue: 15, sold: false, soldPrice: null },
    ],
    notes: 'Standard hobby box, no big hits.',
  },
];

const mockProducts: BreakProduct[] = [
  { name: '2024 Topps Chrome Baseball Hobby', avgCost: 325, avgRoi: 128, avgRoiPercent: 39.4, breakCount: 3, bestHit: 'Elly De La Cruz Gold /50', bestHitValue: 320, hitRate: 0.85 },
  { name: '2024 Bowman Chrome Baseball Hobby', avgCost: 275, avgRoi: 512, avgRoiPercent: 186.2, breakCount: 2, bestHit: 'Paul Skenes Gold Auto /50', bestHitValue: 850, hitRate: 0.90 },
  { name: '2023 Prizm Basketball Hobby', avgCost: 850, avgRoi: -145, avgRoiPercent: -17.1, breakCount: 4, bestHit: 'Wembanyama Silver Prizm', bestHitValue: 380, hitRate: 0.78 },
  { name: '2024 Donruss Football Mega', avgCost: 65, avgRoi: -18, avgRoiPercent: -27.7, breakCount: 5, bestHit: 'Caleb Williams Rated Rookie', bestHitValue: 25, hitRate: 0.45 },
  { name: '2024 Topps Series 1 Baseball Hobby', avgCost: 125, avgRoi: -15, avgRoiPercent: -12.0, breakCount: 3, bestHit: 'Shohei Ohtani SP', bestHitValue: 55, hitRate: 0.65 },
];

const mockTrends: RoiTrend[] = [
  { month: '2025-10', totalSpent: 1200, totalReturn: 980, roi: -220, breakCount: 5 },
  { month: '2025-11', totalSpent: 850, totalReturn: 1150, roi: 300, breakCount: 3 },
  { month: '2025-12', totalSpent: 1500, totalReturn: 1280, roi: -220, breakCount: 6 },
  { month: '2026-01', totalSpent: 975, totalReturn: 1450, roi: 475, breakCount: 4 },
  { month: '2026-02', totalSpent: 675, totalReturn: 1620, roi: 945, breakCount: 3 },
  { month: '2026-03', totalSpent: 1240, totalReturn: 1242, roi: 2, breakCount: 3 },
];

// ---- Service Functions ----

export function getBreaks(): WaxBreak[] {
  return mockBreaks;
}

export function getBreak(id: string): WaxBreak | undefined {
  return mockBreaks.find(b => b.id === id);
}

export function getProducts(): BreakProduct[] {
  return mockProducts;
}

export function getRoiTrends(): RoiTrend[] {
  return mockTrends;
}

export function getBreakStats(): BreakStats {
  const totalSpent = mockBreaks.reduce((s, b) => s + b.cost, 0);
  const totalReturn = mockBreaks.reduce((s, b) => s + b.totalHitsValue, 0);
  return {
    totalBreaks: mockBreaks.length,
    totalSpent,
    totalReturn,
    overallRoi: totalReturn - totalSpent,
    overallRoiPercent: ((totalReturn - totalSpent) / totalSpent) * 100,
    bestBreakId: 'wb-4',
    bestBreakRoi: 354.5,
    worstBreakId: 'wb-3',
    worstBreakRoi: -35.4,
    avgHitsPerBreak: mockBreaks.reduce((s, b) => s + b.hits.length, 0) / mockBreaks.length,
    hitRate: 0.73,
    profitableBreakRate: mockBreaks.filter(b => b.roi > 0).length / mockBreaks.length,
  };
}
