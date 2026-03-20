import { CardInventory, Sport } from '../../types';
import { store } from '../dal/syncStore';

// ---- Types ----

export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
export type HoldingClass = 'short-term' | 'long-term';
export type HarvestPriority = 'high' | 'medium' | 'low';
export type WashSaleStatus = 'clear' | 'restricted' | 'expiring_soon';

export interface UnrealizedLoss {
  cardId: string;
  player: string;
  sport: Sport;
  set: string;
  year: number;
  purchasePrice: number;
  currentValue: number;
  lossAmount: number;
  lossPercent: number;
  holdingDays: number;
  holdingClass: HoldingClass;
  daysToLongTerm: number; // 0 if already long-term
  costBasis: number; // purchasePrice + fees
  taxLotId: string;
}

export interface HarvestRecommendation {
  id: string;
  cardId: string;
  player: string;
  sport: Sport;
  set: string;
  year: number;
  lossAmount: number;
  holdingClass: HoldingClass;
  applicableTaxRate: number;
  taxBenefit: number; // lossAmount * taxRate
  opportunityCost: number; // estimated cost of selling at current value vs holding
  netBenefit: number; // taxBenefit - opportunityCost
  priority: HarvestPriority;
  washSaleStatus: WashSaleStatus;
  washSaleEndDate: string | null;
  replacementSuggestions: ReplacementCard[];
}

export interface ReplacementCard {
  id: string;
  player: string;
  sport: Sport;
  set: string;
  year: number;
  estimatedPrice: number;
  reason: string;
}

export interface WashSaleWindow {
  cardId: string;
  player: string;
  sport: Sport;
  saleDate: string;
  windowStartDate: string;
  windowEndDate: string;
  daysRemaining: number;
  status: WashSaleStatus;
  restrictedFromRepurchase: boolean;
}

export interface TaxBracketInfo {
  filingStatus: FilingStatus;
  estimatedIncome: number;
  marginalRate: number;
  effectiveRate: number;
  shortTermRate: number; // same as marginal for short-term gains
  longTermRate: number; // preferential long-term rate
  stateRate: number;
  combinedShortTermRate: number;
  combinedLongTermRate: number;
}

export interface HarvestCalendarMonth {
  month: number; // 1-12
  monthName: string;
  shortTermHarvests: number;
  longTermHarvests: number;
  totalLoss: number;
  totalTaxSavings: number;
  cardsApproachingLongTerm: number;
  isOptimalWindow: boolean;
}

export interface AnnualTaxSummary {
  totalHarvestableShortTerm: number;
  totalHarvestableLongTerm: number;
  totalHarvestable: number;
  estimatedShortTermSavings: number;
  estimatedLongTermSavings: number;
  estimatedTotalSavings: number;
  cardsWithLosses: number;
  cardsApproachingLongTerm: number;
  washSaleRestrictions: number;
  netCapitalLossCarryover: number;
  capitalLossDeductionLimit: number; // $3,000 limit
  effectiveDeduction: number;
  harvestedThisYear: HarvestedRecord[];
}

export interface HarvestedRecord {
  id: string;
  cardId: string;
  player: string;
  sport: Sport;
  harvestDate: string;
  lossAmount: number;
  holdingClass: HoldingClass;
  taxSaved: number;
  washSaleEndDate: string;
}

export interface TaxHarvestPreferences {
  filingStatus: FilingStatus;
  estimatedIncome: number;
  stateCode: string;
  includeStateRate: boolean;
  autoDetectWashSales: boolean;
}

export interface TaxHarvestSummary {
  totalHarvestable: number;
  estimatedSavings: number;
  cardsWithLosses: number;
  cardsApproachingLongTerm: number;
  washSaleRestrictions: number;
  topRecommendation: HarvestRecommendation | null;
}

// ---- Constants ----

const STORAGE_PREFS_KEY = 'msi_tax_harvest_prefs';
const STORAGE_HARVESTED_KEY = 'msi_tax_harvest_records';
const STORAGE_WASH_SALES_KEY = 'msi_tax_harvest_wash_sales';

const LONG_TERM_DAYS = 366; // > 1 year = long-term
const WASH_SALE_DAYS = 30;
const CAPITAL_LOSS_DEDUCTION_LIMIT = 3000;
const APPROACHING_LONG_TERM_DAYS = 30; // within 30 days of crossing 1-year

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Federal tax brackets 2024 (simplified)
const FEDERAL_BRACKETS: Record<FilingStatus, { limit: number; rate: number }[]> = {
  single: [
    { limit: 11600, rate: 0.10 },
    { limit: 47150, rate: 0.12 },
    { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: 243725, rate: 0.32 },
    { limit: 609350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ],
  married_joint: [
    { limit: 23200, rate: 0.10 },
    { limit: 94300, rate: 0.12 },
    { limit: 201050, rate: 0.22 },
    { limit: 383900, rate: 0.24 },
    { limit: 487450, rate: 0.32 },
    { limit: 731200, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ],
  married_separate: [
    { limit: 11600, rate: 0.10 },
    { limit: 47150, rate: 0.12 },
    { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: 243725, rate: 0.32 },
    { limit: 365600, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { limit: 16550, rate: 0.10 },
    { limit: 63100, rate: 0.12 },
    { limit: 100500, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: 243700, rate: 0.32 },
    { limit: 609350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ],
};

const LONG_TERM_RATES = [
  { limit: 47025, rate: 0.00 },
  { limit: 518900, rate: 0.15 },
  { limit: Infinity, rate: 0.20 },
];

// Simplified state tax rates by code
const STATE_RATES: Record<string, number> = {
  CA: 0.093, NY: 0.0882, NJ: 0.0675, MA: 0.05, IL: 0.0495,
  PA: 0.0307, OH: 0.04, TX: 0, FL: 0, WA: 0, NV: 0,
  TN: 0, WY: 0, AK: 0, SD: 0, NH: 0.05, OR: 0.099,
  MN: 0.0985, HI: 0.11, CT: 0.0699, OTHER: 0.05,
};

// ---- Seed helpers ----

function dateSeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ---- Core Functions ----

function getHoldingDays(purchaseDate: string): number {
  const purchase = new Date(purchaseDate);
  const now = new Date();
  return Math.floor((now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24));
}

function getHoldingClass(holdingDays: number): HoldingClass {
  return holdingDays >= LONG_TERM_DAYS ? 'long-term' : 'short-term';
}

function getCostBasis(card: CardInventory): number {
  return (card.taxBasis ?? card.purchasePrice) + (card.gradingFees ?? 0) + (card.shippingFees ?? 0);
}

export function getMarginalRate(income: number, filingStatus: FilingStatus): number {
  const brackets = FEDERAL_BRACKETS[filingStatus];
  for (const bracket of brackets) {
    if (income <= bracket.limit) return bracket.rate;
  }
  return 0.37;
}

function getEffectiveRate(income: number, filingStatus: FilingStatus): number {
  const brackets = FEDERAL_BRACKETS[filingStatus];
  let totalTax = 0;
  let remaining = income;
  let prevLimit = 0;

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, bracket.limit - prevLimit);
    totalTax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    prevLimit = bracket.limit;
  }

  return income > 0 ? totalTax / income : 0;
}

function getLongTermRate(income: number): number {
  for (const bracket of LONG_TERM_RATES) {
    if (income <= bracket.limit) return bracket.rate;
  }
  return 0.20;
}

export function getTaxBracketInfo(
  filingStatus: FilingStatus,
  estimatedIncome: number,
  stateCode: string = 'OTHER'
): TaxBracketInfo {
  const marginalRate = getMarginalRate(estimatedIncome, filingStatus);
  const effectiveRate = getEffectiveRate(estimatedIncome, filingStatus);
  const longTermRate = getLongTermRate(estimatedIncome);
  const stateRate = STATE_RATES[stateCode] ?? STATE_RATES['OTHER'];

  return {
    filingStatus,
    estimatedIncome,
    marginalRate,
    effectiveRate,
    shortTermRate: marginalRate,
    longTermRate,
    stateRate,
    combinedShortTermRate: marginalRate + stateRate,
    combinedLongTermRate: longTermRate + stateRate,
  };
}

// ---- Unrealized Loss Scanner ----

export function scanUnrealizedLosses(cards: CardInventory[]): UnrealizedLoss[] {
  const activeCards = cards.filter(c => (c.status ?? 'active') === 'active');
  const losses: UnrealizedLoss[] = [];

  for (const card of activeCards) {
    const currentValue = card.currentValue ?? card.purchasePrice;
    const costBasis = getCostBasis(card);

    if (currentValue < costBasis) {
      const holdingDays = getHoldingDays(card.purchaseDate);
      const holdingClass = getHoldingClass(holdingDays);
      const lossAmount = costBasis - currentValue;
      const daysToLongTerm = holdingClass === 'long-term' ? 0 : Math.max(0, LONG_TERM_DAYS - holdingDays);

      losses.push({
        cardId: card.id,
        player: card.player,
        sport: card.sport,
        set: card.set,
        year: card.year,
        purchasePrice: card.purchasePrice,
        currentValue,
        lossAmount,
        lossPercent: (lossAmount / costBasis) * 100,
        holdingDays,
        holdingClass,
        daysToLongTerm,
        costBasis,
        taxLotId: `TL-${card.id.slice(0, 8)}`,
      });
    }
  }

  return losses.sort((a, b) => b.lossAmount - a.lossAmount);
}

// ---- Replacement Card Suggestions ----

function generateReplacements(card: CardInventory, allCards: CardInventory[]): ReplacementCard[] {
  const seed = hashString(card.id);
  const replacements: ReplacementCard[] = [];

  // Find similar cards in portfolio (same player, different set/year)
  const samePlayer = allCards.filter(
    c => c.player === card.player && c.id !== card.id && (c.status ?? 'active') === 'active'
  );

  for (const sp of samePlayer.slice(0, 2)) {
    replacements.push({
      id: `rep-${sp.id}`,
      player: sp.player,
      sport: sp.sport,
      set: sp.set,
      year: sp.year,
      estimatedPrice: sp.currentValue ?? sp.purchasePrice,
      reason: 'Same player, different set - maintains exposure without triggering wash sale',
    });
  }

  // Generate synthetic replacement suggestions
  const syntheticSets = ['Prizm', 'Select', 'Optic', 'Mosaic', 'Chronicles', 'Donruss'];
  const altYears = [card.year - 1, card.year + 1, card.year - 2].filter(y => y > 2015);

  for (let i = 0; i < Math.min(3 - replacements.length, 3); i++) {
    const setIdx = (seed + i) % syntheticSets.length;
    const yearIdx = i % altYears.length;
    const basePrice = card.currentValue ?? card.purchasePrice;
    const priceVariance = 0.7 + seededRandom(seed + i * 17) * 0.6;

    replacements.push({
      id: `rep-syn-${card.id}-${i}`,
      player: card.player,
      sport: card.sport,
      set: syntheticSets[setIdx],
      year: altYears[yearIdx] ?? card.year - 1,
      estimatedPrice: Math.round(basePrice * priceVariance * 100) / 100,
      reason: `Substantially different card (${syntheticSets[setIdx]} ${altYears[yearIdx] ?? card.year - 1}) - safe from wash sale rule`,
    });
  }

  return replacements.slice(0, 3);
}

// ---- Harvest Recommendations ----

export function getHarvestRecommendations(
  cards: CardInventory[],
  bracketInfo: TaxBracketInfo
): HarvestRecommendation[] {
  const losses = scanUnrealizedLosses(cards);
  const washSales = getWashSaleWindows();
  const recommendations: HarvestRecommendation[] = [];

  for (const loss of losses) {
    const card = cards.find(c => c.id === loss.cardId);
    if (!card) continue;

    const taxRate = loss.holdingClass === 'short-term'
      ? bracketInfo.combinedShortTermRate
      : bracketInfo.combinedLongTermRate;

    const taxBenefit = loss.lossAmount * taxRate;

    // Opportunity cost: estimated potential recovery based on loss depth
    const seed = hashString(loss.cardId);
    const recoveryChance = Math.max(0.1, 0.5 - (loss.lossPercent / 200));
    const opportunityCost = loss.lossAmount * recoveryChance * seededRandom(seed + 7) * 0.3;
    const netBenefit = taxBenefit - opportunityCost;

    // Check wash sale status
    const existingWash = washSales.find(w => w.cardId === loss.cardId && w.restrictedFromRepurchase);
    let washSaleStatus: WashSaleStatus = 'clear';
    let washSaleEndDate: string | null = null;
    if (existingWash) {
      washSaleStatus = existingWash.daysRemaining <= 5 ? 'expiring_soon' : 'restricted';
      washSaleEndDate = existingWash.windowEndDate;
    }

    // Priority based on net benefit
    let priority: HarvestPriority = 'low';
    if (netBenefit > 200) priority = 'high';
    else if (netBenefit > 50) priority = 'medium';

    recommendations.push({
      id: `harvest-${loss.cardId}`,
      cardId: loss.cardId,
      player: loss.player,
      sport: loss.sport,
      set: loss.set,
      year: loss.year,
      lossAmount: Math.round(loss.lossAmount * 100) / 100,
      holdingClass: loss.holdingClass,
      applicableTaxRate: Math.round(taxRate * 10000) / 100,
      taxBenefit: Math.round(taxBenefit * 100) / 100,
      opportunityCost: Math.round(opportunityCost * 100) / 100,
      netBenefit: Math.round(netBenefit * 100) / 100,
      priority,
      washSaleStatus,
      washSaleEndDate,
      replacementSuggestions: generateReplacements(card, cards),
    });
  }

  return recommendations.sort((a, b) => b.netBenefit - a.netBenefit);
}

// ---- Wash Sale Tracker ----

export function getWashSaleWindows(): WashSaleWindow[] {
  const windows = store.get<WashSaleWindow[]>(STORAGE_WASH_SALES_KEY, []);
  const now = new Date();
  return windows.map(w => ({
    ...w,
    daysRemaining: Math.max(0, Math.floor((new Date(w.windowEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
    status: getWashStatus(w.windowEndDate),
    restrictedFromRepurchase: new Date(w.windowEndDate) > now,
  })).filter(w => w.daysRemaining >= 0 || new Date(w.windowEndDate) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
}

function getWashStatus(endDate: string): WashSaleStatus {
  const now = new Date();
  const end = new Date(endDate);
  const daysRemaining = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysRemaining <= 0) return 'clear';
  if (daysRemaining <= 5) return 'expiring_soon';
  return 'restricted';
}

export function recordHarvest(
  card: CardInventory,
  lossAmount: number,
  holdingClass: HoldingClass,
  taxSaved: number
): void {
  const now = new Date();
  const washEndDate = new Date(now.getTime() + WASH_SALE_DAYS * 24 * 60 * 60 * 1000);

  // Save harvested record
  const records = loadHarvestedRecords();
  const record: HarvestedRecord = {
    id: `hrv-${card.id}-${Date.now()}`,
    cardId: card.id,
    player: card.player,
    sport: card.sport,
    harvestDate: now.toISOString(),
    lossAmount,
    holdingClass,
    taxSaved,
    washSaleEndDate: washEndDate.toISOString(),
  };
  records.push(record);
  saveHarvestedRecords(records);

  // Create wash sale window
  const washWindows = getWashSaleWindows();
  const newWindow: WashSaleWindow = {
    cardId: card.id,
    player: card.player,
    sport: card.sport,
    saleDate: now.toISOString(),
    windowStartDate: now.toISOString(),
    windowEndDate: washEndDate.toISOString(),
    daysRemaining: WASH_SALE_DAYS,
    status: 'restricted',
    restrictedFromRepurchase: true,
  };
  washWindows.push(newWindow);
  saveWashSaleWindows(washWindows);
}

// ---- Harvest Calendar ----

export function getHarvestCalendar(cards: CardInventory[], bracketInfo: TaxBracketInfo): HarvestCalendarMonth[] {
  const losses = scanUnrealizedLosses(cards);
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-based

  return MONTH_NAMES.map((name, i) => {
    const monthOffset = (i - currentMonth + 12) % 12;
    const _seed = dateSeed() + i;

    // Cards whose long-term threshold falls in this month
    const approachingLT = losses.filter(l => {
      if (l.holdingClass === 'long-term') return false;
      const daysToLT = l.daysToLongTerm;
      const monthsToLT = daysToLT / 30;
      return Math.floor(monthsToLT) === monthOffset;
    });

    // Distribute losses across months based on optimal timing
    const shortTermLosses = losses.filter(l => l.holdingClass === 'short-term');
    const longTermLosses = losses.filter(l => l.holdingClass === 'long-term');

    // Optimal months: Dec for year-end harvesting, months where cards transition
    const isYearEnd = i === 11;
    const isQuarterEnd = i === 2 || i === 5 || i === 8 || i === 11;
    const isOptimal = isYearEnd || (isQuarterEnd && approachingLT.length > 0);

    // Estimate harvests per month - heavier in Q4
    const monthWeight = isYearEnd ? 0.3 : isQuarterEnd ? 0.12 : 0.06;
    const stHarvests = Math.round(shortTermLosses.length * monthWeight);
    const ltHarvests = Math.round(longTermLosses.length * monthWeight);

    const totalLoss = losses.reduce((sum, l) => sum + l.lossAmount, 0) * monthWeight;
    const stSavings = totalLoss * (shortTermLosses.length / Math.max(1, losses.length)) * bracketInfo.combinedShortTermRate;
    const ltSavings = totalLoss * (longTermLosses.length / Math.max(1, losses.length)) * bracketInfo.combinedLongTermRate;

    return {
      month: i + 1,
      monthName: name,
      shortTermHarvests: stHarvests,
      longTermHarvests: ltHarvests,
      totalLoss: Math.round(totalLoss * 100) / 100,
      totalTaxSavings: Math.round((stSavings + ltSavings) * 100) / 100,
      cardsApproachingLongTerm: approachingLT.length,
      isOptimalWindow: isOptimal,
    };
  });
}

// ---- Annual Tax Summary ----

export function getAnnualTaxSummary(cards: CardInventory[], bracketInfo: TaxBracketInfo): AnnualTaxSummary {
  const losses = scanUnrealizedLosses(cards);
  const harvested = loadHarvestedRecords();
  const currentYear = new Date().getFullYear();
  const thisYearHarvests = harvested.filter(h => new Date(h.harvestDate).getFullYear() === currentYear);

  const shortTermLosses = losses.filter(l => l.holdingClass === 'short-term');
  const longTermLosses = losses.filter(l => l.holdingClass === 'long-term');

  const totalShortTerm = shortTermLosses.reduce((s, l) => s + l.lossAmount, 0);
  const totalLongTerm = longTermLosses.reduce((s, l) => s + l.lossAmount, 0);
  const totalHarvestable = totalShortTerm + totalLongTerm;

  const stSavings = totalShortTerm * bracketInfo.combinedShortTermRate;
  const ltSavings = totalLongTerm * bracketInfo.combinedLongTermRate;

  const approachingLT = losses.filter(
    l => l.holdingClass === 'short-term' && l.daysToLongTerm <= APPROACHING_LONG_TERM_DAYS
  );
  const washRestrictions = getWashSaleWindows().filter(w => w.restrictedFromRepurchase).length;

  // Capital loss carryover from previous harvests
  const alreadyHarvested = thisYearHarvests.reduce((s, h) => s + h.lossAmount, 0);
  const netCarryover = Math.max(0, alreadyHarvested - CAPITAL_LOSS_DEDUCTION_LIMIT);
  const effectiveDeduction = Math.min(totalHarvestable + alreadyHarvested, CAPITAL_LOSS_DEDUCTION_LIMIT);

  return {
    totalHarvestableShortTerm: Math.round(totalShortTerm * 100) / 100,
    totalHarvestableLongTerm: Math.round(totalLongTerm * 100) / 100,
    totalHarvestable: Math.round(totalHarvestable * 100) / 100,
    estimatedShortTermSavings: Math.round(stSavings * 100) / 100,
    estimatedLongTermSavings: Math.round(ltSavings * 100) / 100,
    estimatedTotalSavings: Math.round((stSavings + ltSavings) * 100) / 100,
    cardsWithLosses: losses.length,
    cardsApproachingLongTerm: approachingLT.length,
    washSaleRestrictions: washRestrictions,
    netCapitalLossCarryover: Math.round(netCarryover * 100) / 100,
    capitalLossDeductionLimit: CAPITAL_LOSS_DEDUCTION_LIMIT,
    effectiveDeduction: Math.round(effectiveDeduction * 100) / 100,
    harvestedThisYear: thisYearHarvests,
  };
}

// ---- Widget Summary ----

export function getTaxHarvestSummary(cards: CardInventory[]): TaxHarvestSummary {
  const prefs = loadPreferences();
  const bracketInfo = getTaxBracketInfo(prefs.filingStatus, prefs.estimatedIncome, prefs.stateCode);
  const losses = scanUnrealizedLosses(cards);
  const totalHarvestable = losses.reduce((s, l) => s + l.lossAmount, 0);

  const stLosses = losses.filter(l => l.holdingClass === 'short-term');
  const ltLosses = losses.filter(l => l.holdingClass === 'long-term');
  const stSavings = stLosses.reduce((s, l) => s + l.lossAmount, 0) * bracketInfo.combinedShortTermRate;
  const ltSavings = ltLosses.reduce((s, l) => s + l.lossAmount, 0) * bracketInfo.combinedLongTermRate;

  const approaching = losses.filter(
    l => l.holdingClass === 'short-term' && l.daysToLongTerm <= APPROACHING_LONG_TERM_DAYS
  );
  const washRestrictions = getWashSaleWindows().filter(w => w.restrictedFromRepurchase).length;

  const recommendations = getHarvestRecommendations(cards, bracketInfo);
  const topRec = recommendations.length > 0 ? recommendations[0] : null;

  return {
    totalHarvestable: Math.round(totalHarvestable * 100) / 100,
    estimatedSavings: Math.round((stSavings + ltSavings) * 100) / 100,
    cardsWithLosses: losses.length,
    cardsApproachingLongTerm: approaching.length,
    washSaleRestrictions: washRestrictions,
    topRecommendation: topRec,
  };
}

// ---- Tax harvest persistence (DAL-backed syncStore) ----

function loadHarvestedRecords(): HarvestedRecord[] {
  return store.get<HarvestedRecord[]>(STORAGE_HARVESTED_KEY, []);
}

function saveHarvestedRecords(records: HarvestedRecord[]): void {
  store.set(STORAGE_HARVESTED_KEY, records);
}

function saveWashSaleWindows(windows: WashSaleWindow[]): void {
  store.set(STORAGE_WASH_SALES_KEY, windows);
}

export function loadPreferences(): TaxHarvestPreferences {
  return store.get<TaxHarvestPreferences>(STORAGE_PREFS_KEY, {
    filingStatus: 'single',
    estimatedIncome: 85000,
    stateCode: 'CA',
    includeStateRate: true,
    autoDetectWashSales: true,
  });
}

export function savePreferences(prefs: TaxHarvestPreferences): void {
  store.set(STORAGE_PREFS_KEY, prefs);
}

export function clearTaxHarvestData(): void {
  store.remove(STORAGE_PREFS_KEY);
  store.remove(STORAGE_HARVESTED_KEY);
  store.remove(STORAGE_WASH_SALES_KEY);
}

export { MONTH_NAMES, CAPITAL_LOSS_DEDUCTION_LIMIT, LONG_TERM_DAYS, APPROACHING_LONG_TERM_DAYS };
