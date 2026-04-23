// @ts-nocheck
// ─────────────────────────────────────────────────────────────
// Circadian Market Rhythm Optimizer – Service Layer
// Chronoeconomic analysis for optimal transaction timing
// ─────────────────────────────────────────────────────────────

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeSlot {
  hour: number; // 0-23
  buyerActivity: number; // 0-100
  sellerActivity: number; // 0-100
  bidCompetition: number; // 0-100
  priceEfficiency: number; // 0-100, higher = closer to fair value
  impulseBuyerConcentration: number; // 0-100
}

export interface DayProfile {
  day: DayOfWeek;
  peakBuyingHour: number;
  peakSellingHour: number;
  avgPricePremium: number; // %
  bestListingTime: string;
  worstListingTime: string;
  liquidityScore: number; // 0-100
  slots: TimeSlot[];
}

export interface SeasonalPattern {
  name: string;
  description: string;
  priceImpact: number; // %
  timing: string;
  recurrence: string;
  confidence: number; // 0-100
}

export interface TimingRecommendation {
  action: 'list' | 'bid' | 'buy-now' | 'hold';
  optimalWindow: string;
  expectedBenefit: string;
  confidence: number; // 0-100
  reasoning: string;
}

export interface CircadianStats {
  currentMarketPhase: 'pre-market' | 'morning-rush' | 'midday-lull' | 'afternoon-surge' | 'evening-peak' | 'late-night-impulse';
  currentBuyerActivity: number; // 0-100
  bestTimeToList: string;
  bestTimeToBid: string;
  payrollCycleEffect: string;
  nextMacroEvent: {
    name: string;
    date: string;
    expectedImpact: string;
  };
}

// ── Helper: generate 24 TimeSlots for a given day pattern ────

function generateSlots(pattern: {
  peakBuyHour: number;
  peakSellHour: number;
  nightActivity: number;
  dayIntensity: number;
}): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let h = 0; h < 24; h++) {
    const distFromBuyPeak = Math.abs(h - pattern.peakBuyHour);
    const distFromSellPeak = Math.abs(h - pattern.peakSellHour);
    const isNight = h < 6 || h >= 23;
    const baseActivity = isNight ? pattern.nightActivity : 30 + pattern.dayIntensity;

    const buyerActivity = Math.min(100, Math.max(5, Math.round(
      baseActivity + Math.max(0, (60 - distFromBuyPeak * 8)) * (pattern.dayIntensity / 50)
    )));
    const sellerActivity = Math.min(100, Math.max(5, Math.round(
      baseActivity * 0.8 + Math.max(0, (55 - distFromSellPeak * 7)) * (pattern.dayIntensity / 55)
    )));
    const bidCompetition = Math.min(100, Math.max(3, Math.round(buyerActivity * 0.85 + (isNight ? -10 : 5))));
    const priceEfficiency = Math.min(100, Math.max(20, Math.round(
      65 + (isNight ? 15 : 0) - (buyerActivity > 70 ? 20 : 0) + (h >= 2 && h <= 5 ? 12 : 0)
    )));
    const impulseBuyerConcentration = Math.min(100, Math.max(2, Math.round(
      isNight ? 55 + Math.random() * 20 : 15 + buyerActivity * 0.3
    )));

    slots.push({
      hour: h,
      buyerActivity,
      sellerActivity,
      bidCompetition,
      priceEfficiency,
      impulseBuyerConcentration,
    });
  }
  return slots;
}

// ── Mock Day Profiles (7 days) ───────────────────────────────

const MOCK_DAY_PROFILES: DayProfile[] = [
  {
    day: 'monday',
    peakBuyingHour: 12,
    peakSellingHour: 10,
    avgPricePremium: -2.1,
    bestListingTime: '10:00 AM — sellers dominate, buyers returning from weekend',
    worstListingTime: '3:00 PM — low engagement, buyers still at work',
    liquidityScore: 58,
    slots: generateSlots({ peakBuyHour: 12, peakSellHour: 10, nightActivity: 8, dayIntensity: 42 }),
  },
  {
    day: 'tuesday',
    peakBuyingHour: 20,
    peakSellingHour: 11,
    avgPricePremium: -1.4,
    bestListingTime: '7:00 PM — evening browsers with disposable income',
    worstListingTime: '2:00 PM — lowest engagement day midday',
    liquidityScore: 52,
    slots: generateSlots({ peakBuyHour: 20, peakSellHour: 11, nightActivity: 10, dayIntensity: 38 }),
  },
  {
    day: 'wednesday',
    peakBuyingHour: 21,
    peakSellingHour: 14,
    avgPricePremium: 0.3,
    bestListingTime: '8:00 PM — mid-week hobby browsing peak',
    worstListingTime: '6:00 AM — dead zone',
    liquidityScore: 61,
    slots: generateSlots({ peakBuyHour: 21, peakSellHour: 14, nightActivity: 12, dayIntensity: 45 }),
  },
  {
    day: 'thursday',
    peakBuyingHour: 20,
    peakSellingHour: 15,
    avgPricePremium: 1.8,
    bestListingTime: '7:30 PM — TNF anticipation + payday proximity',
    worstListingTime: '5:00 AM — pre-dawn dead zone',
    liquidityScore: 68,
    slots: generateSlots({ peakBuyHour: 20, peakSellHour: 15, nightActivity: 14, dayIntensity: 52 }),
  },
  {
    day: 'friday',
    peakBuyingHour: 22,
    peakSellingHour: 16,
    avgPricePremium: 3.2,
    bestListingTime: '9:00 PM — payday impulse buying peak',
    worstListingTime: '8:00 AM — commute hours',
    liquidityScore: 74,
    slots: generateSlots({ peakBuyHour: 22, peakSellHour: 16, nightActivity: 22, dayIntensity: 55 }),
  },
  {
    day: 'saturday',
    peakBuyingHour: 14,
    peakSellingHour: 11,
    avgPricePremium: 4.7,
    bestListingTime: '1:00 PM — weekend hobby time, highest engagement',
    worstListingTime: '7:00 AM — Saturday morning sleep-in',
    liquidityScore: 82,
    slots: generateSlots({ peakBuyHour: 14, peakSellHour: 11, nightActivity: 25, dayIntensity: 65 }),
  },
  {
    day: 'sunday',
    peakBuyingHour: 19,
    peakSellingHour: 13,
    avgPricePremium: 5.4,
    bestListingTime: '6:00 PM — NFL Sunday effect, peak sports card sentiment',
    worstListingTime: '6:00 AM — Sunday morning dead zone',
    liquidityScore: 88,
    slots: generateSlots({ peakBuyHour: 19, peakSellHour: 13, nightActivity: 20, dayIntensity: 60 }),
  },
];

// ── Mock Seasonal Patterns (8 items) ─────────────────────────

const MOCK_SEASONAL_PATTERNS: SeasonalPattern[] = [
  {
    name: 'NFL Sunday Effect',
    description: 'Football card prices spike during NFL game windows as fans impulse-buy after big plays.',
    priceImpact: 8.4,
    timing: 'Sundays 1:00 PM – 11:00 PM ET (Sep–Feb)',
    recurrence: 'Weekly during NFL season',
    confidence: 92,
  },
  {
    name: 'Payday Surge',
    description: 'Buying activity increases 15-20% on the 1st and 15th of each month as disposable income refreshes.',
    priceImpact: 5.2,
    timing: '1st and 15th of each month, peaking 6-9 PM ET',
    recurrence: 'Bi-monthly',
    confidence: 88,
  },
  {
    name: 'Tax Refund Rally',
    description: 'February–April sees increased high-value purchases as tax refunds arrive.',
    priceImpact: 12.1,
    timing: 'February through mid-April',
    recurrence: 'Annual',
    confidence: 85,
  },
  {
    name: 'Draft Night Mania',
    description: 'Rookie card prices for projected picks surge 24-48 hours before and after NFL/NBA drafts.',
    priceImpact: 22.5,
    timing: 'NFL Draft (late April), NBA Draft (late June)',
    recurrence: 'Annual',
    confidence: 94,
  },
  {
    name: 'Monday Morning Hangover',
    description: 'Post-weekend listing flood depresses prices as weekend impulse sellers list cards Monday morning.',
    priceImpact: -3.8,
    timing: 'Mondays 8:00 AM – 12:00 PM ET',
    recurrence: 'Weekly',
    confidence: 79,
  },
  {
    name: 'Holiday Dead Zone',
    description: 'Market liquidity drops 40% between Christmas and New Year as collectors shift to spending elsewhere.',
    priceImpact: -6.2,
    timing: 'December 24 – January 2',
    recurrence: 'Annual',
    confidence: 91,
  },
  {
    name: 'All-Star Break Bump',
    description: 'NBA/MLB All-Star selections trigger price spikes for selected players\' cards.',
    priceImpact: 9.8,
    timing: 'NBA All-Star (February), MLB All-Star (July)',
    recurrence: 'Annual',
    confidence: 82,
  },
  {
    name: 'Late-Night Impulse Window',
    description: 'Buyers between 11 PM – 2 AM ET pay 7-12% premiums due to reduced rational decision-making.',
    priceImpact: 9.5,
    timing: 'Nightly 11:00 PM – 2:00 AM ET',
    recurrence: 'Daily',
    confidence: 76,
  },
];

// ── Mock Timing Recommendations (5 items) ────────────────────

const MOCK_TIMING_RECOMMENDATIONS: TimingRecommendation[] = [
  {
    action: 'list',
    optimalWindow: 'Sunday 6:00 PM – 8:00 PM ET',
    expectedBenefit: '+5.4% above weekday average price',
    confidence: 88,
    reasoning: 'NFL Sunday effect drives peak engagement. Impulse buyers are most active during evening game windows. List high-value football cards during this window for maximum visibility and premium pricing.',
  },
  {
    action: 'bid',
    optimalWindow: 'Tuesday 2:00 AM – 5:00 AM ET',
    expectedBenefit: 'Win 23% more auctions with 8% lower final prices',
    confidence: 82,
    reasoning: 'Tuesday early morning has the lowest bid competition of any time slot. Auctions ending in this window attract 60% fewer bidders. Set snipe bids for auctions ending during this dead zone.',
  },
  {
    action: 'buy-now',
    optimalWindow: 'Monday 9:00 AM – 11:00 AM ET',
    expectedBenefit: '-3.8% below market average on Buy-It-Now listings',
    confidence: 79,
    reasoning: 'Monday morning hangover effect — weekend impulse sellers list cards at lower prices to generate quick sales. Best window for Buy-It-Now deals on cards listed in the past 12 hours.',
  },
  {
    action: 'hold',
    optimalWindow: 'Now through April 15 (Tax Refund Rally)',
    expectedBenefit: 'Hold inventory for +12.1% seasonal appreciation',
    confidence: 85,
    reasoning: 'Tax refund season drives increased purchasing power. High-value cards ($500+) see the strongest lift. Avoid selling during this window unless you need immediate liquidity.',
  },
  {
    action: 'list',
    optimalWindow: 'Friday 8:00 PM – 10:00 PM ET',
    expectedBenefit: '+3.2% premium from payday impulse buyers',
    confidence: 74,
    reasoning: 'Friday evening combines payday liquidity with weekend hobby browsing. Impulse buyer concentration peaks at 9 PM. Optimal for mid-range cards ($100–$500).',
  },
];

// ── Public API Functions ─────────────────────────────────────

export function getDayProfiles(): DayProfile[] {
  return MOCK_DAY_PROFILES;
}

export function getSeasonalPatterns(): SeasonalPattern[] {
  return MOCK_SEASONAL_PATTERNS;
}

export function getTimingRecommendations(): TimingRecommendation[] {
  return MOCK_TIMING_RECOMMENDATIONS;
}

export function getCircadianStats(): CircadianStats {
  const hour = new Date().getHours();
  let phase: CircadianStats['currentMarketPhase'];
  if (hour < 6) phase = 'late-night-impulse';
  else if (hour < 9) phase = 'pre-market';
  else if (hour < 12) phase = 'morning-rush';
  else if (hour < 14) phase = 'midday-lull';
  else if (hour < 17) phase = 'afternoon-surge';
  else phase = 'evening-peak';

  const currentDay = MOCK_DAY_PROFILES[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const currentSlot = currentDay.slots.find(s => s.hour === hour) ?? currentDay.slots[12];

  return {
    currentMarketPhase: phase,
    currentBuyerActivity: currentSlot.buyerActivity,
    bestTimeToList: 'Sunday 6:00 PM ET',
    bestTimeToBid: 'Tuesday 3:00 AM ET',
    payrollCycleEffect: 'Next payday surge: April 1 — expect +5.2% buying pressure',
    nextMacroEvent: {
      name: 'NFL Draft 2026',
      date: '2026-04-23',
      expectedImpact: '+22.5% on projected first-round pick rookie cards',
    },
  };
}

export function getMarketPhaseColor(phase: CircadianStats['currentMarketPhase']): string {
  const colors: Record<CircadianStats['currentMarketPhase'], string> = {
    'pre-market': 'text-slate-400',
    'morning-rush': 'text-amber-400',
    'midday-lull': 'text-blue-400',
    'afternoon-surge': 'text-orange-400',
    'evening-peak': 'text-green-400',
    'late-night-impulse': 'text-purple-400',
  };
  return colors[phase];
}

export function getDayColor(day: DayOfWeek): string {
  const colors: Record<DayOfWeek, string> = {
    monday: 'text-slate-400',
    tuesday: 'text-blue-400',
    wednesday: 'text-indigo-400',
    thursday: 'text-amber-400',
    friday: 'text-green-400',
    saturday: 'text-emerald-400',
    sunday: 'text-orange-400',
  };
  return colors[day];
}
