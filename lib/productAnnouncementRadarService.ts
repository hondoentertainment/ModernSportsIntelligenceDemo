// Predictive Product Announcement Radar Service

export interface PredictedAnnouncement {
  id: string;
  productName: string;
  manufacturer: string;
  sport: string;
  predictedAnnouncementDate: string;
  confidence: number;
  predictionBasis: string[];
  expectedKeyRookies: string[];
  historicalAnnouncementPattern: string;
  signalStrength: 'weak' | 'moderate' | 'strong' | 'very strong';
  daysUntilPredicted: number;
  marketImpact: 'low' | 'medium' | 'high' | 'very high';
  relatedCardsToWatch: string[];
}

export interface ManufacturerCadence {
  manufacturer: string;
  avgDaysBetweenReleases: number;
  preferredAnnouncementDay: string;
  leadTimeToRelease: number;
  currentYearReleases: number;
  predictedRemainingReleases: number;
}

export interface AnnouncementSignal {
  id: string;
  signalType: 'retailer_listing' | 'social_buzz' | 'trademark_filing' | 'distributor_order' | 'influencer_preview';
  description: string;
  manufacturer: string;
  product: string;
  detectedAt: string;
  strength: number;
}

export interface HistoricalAccuracy {
  year: number;
  predictionsTotal: number;
  correct: number;
  avgDaysEarly: number;
  bestCall: string;
}

export interface PrePositioningOpportunity {
  productId: string;
  productName: string;
  cardToWatch: string;
  currentPrice: number;
  expectedPostAnnouncementPrice: number;
  expectedROI: number;
  action: 'buy now' | 'watch';
  reasoning: string;
}

// ---- Mock Data ----

const PREDICTED_ANNOUNCEMENTS: PredictedAnnouncement[] = [
  {
    id: 'pa001',
    productName: '2025 Topps Chrome Baseball',
    manufacturer: 'Topps',
    sport: 'Baseball',
    predictedAnnouncementDate: '2026-03-28',
    confidence: 94,
    predictionBasis: [
      'Topps Chrome announced in late March in 4 of last 5 years',
      'Dave & Adam\'s retailer listing detected with placeholder SKU',
      'Distributor pre-order form circulating since March 1st',
      'Topps filed "Chrome Baseball 2025" trademark Feb 14th',
    ],
    expectedKeyRookies: ['Jackson Holliday', 'Paul Skenes', 'Jackson Chourio', 'Wyatt Langford'],
    historicalAnnouncementPattern: 'Last 5 years: March 22, March 25, March 29, April 2, March 26',
    signalStrength: 'very strong',
    daysUntilPredicted: 10,
    marketImpact: 'very high',
    relatedCardsToWatch: ['2024 Topps Chrome Jackson Holliday RC', '2024 Bowman Chrome Paul Skenes auto'],
  },
  {
    id: 'pa002',
    productName: '2025 Panini Prizm Basketball',
    manufacturer: 'Panini',
    sport: 'Basketball',
    predictedAnnouncementDate: '2026-04-07',
    confidence: 88,
    predictionBasis: [
      'Panini Prizm Basketball historically announced 1st week of April',
      'Target placeholder listing spotted March 10th',
      'Social media chatter from known Panini reps spiked 340% this week',
      'Panini distributor order confirmed through secondary source',
    ],
    expectedKeyRookies: ['Zaccharie Risacher', 'Alex Sarr', 'Reed Sheppard', 'Stephon Castle'],
    historicalAnnouncementPattern: 'Last 4 years: April 3, April 8, April 5, April 11',
    signalStrength: 'strong',
    daysUntilPredicted: 20,
    marketImpact: 'very high',
    relatedCardsToWatch: ['2024-25 Panini Prizm Zaccharie Risacher RC', '2024 Bowman Stephon Castle auto'],
  },
  {
    id: 'pa003',
    productName: '2025 Topps Update Series Baseball',
    manufacturer: 'Topps',
    sport: 'Baseball',
    predictedAnnouncementDate: '2026-04-18',
    confidence: 81,
    predictionBasis: [
      'Topps Update announced mid-April consistently since 2020',
      'Checklist draft spotted on hobby distributor forum',
      'Influencer @HobbyBreaks_Mike received review copy per Instagram story',
    ],
    expectedKeyRookies: ['Bubba Chandler', 'Roman Anthony', 'Chase DeLauter'],
    historicalAnnouncementPattern: 'Last 5 years: April 14–20 window',
    signalStrength: 'strong',
    daysUntilPredicted: 31,
    marketImpact: 'high',
    relatedCardsToWatch: ['2024 Topps Update Roman Anthony RC', 'Bubba Chandler 2024 Bowman Draft'],
  },
  {
    id: 'pa004',
    productName: '2025 Bowman Draft Baseball',
    manufacturer: 'Topps',
    sport: 'Baseball',
    predictedAnnouncementDate: '2026-04-29',
    confidence: 76,
    predictionBasis: [
      'Bowman Draft follows MLB Draft by approx. 10 months annually',
      'MLBPA filing for 2025 Draft class card rights detected',
      'Blaster box dimensions registered at major retail warehouse',
    ],
    expectedKeyRookies: ['Braden Montgomery', 'Charlie Condon', 'Cam Collier'],
    historicalAnnouncementPattern: 'Released ~10 months post-draft, consistently late April/early May',
    signalStrength: 'moderate',
    daysUntilPredicted: 42,
    marketImpact: 'high',
    relatedCardsToWatch: ['2024 Bowman Draft Braden Montgomery auto', 'Charlie Condon 2025 draft prospectetimates'],
  },
  {
    id: 'pa005',
    productName: '2025 Upper Deck Series 1 Hockey',
    manufacturer: 'Upper Deck',
    sport: 'Hockey',
    predictedAnnouncementDate: '2026-05-05',
    confidence: 83,
    predictionBasis: [
      'Upper Deck Series 1 Hockey announced first week of May every year since 2018',
      'Retailer hobby shop pre-orders opened without announcement',
      'Trademark filing for "UD Series 1 2025" detected USPTO March 3rd',
    ],
    expectedKeyRookies: ['Matvei Michkov', 'Leo Carlsson', 'Connor Bedard Year 2 inserts'],
    historicalAnnouncementPattern: 'May 1–8 window, 6 of last 6 years',
    signalStrength: 'strong',
    daysUntilPredicted: 48,
    marketImpact: 'medium',
    relatedCardsToWatch: ['2024-25 Upper Deck Matvei Michkov Young Guns RC', '2024-25 UD Connor Bedard'],
  },
  {
    id: 'pa006',
    productName: '2025 Panini Select Football',
    manufacturer: 'Panini',
    sport: 'Football',
    predictedAnnouncementDate: '2026-05-14',
    confidence: 71,
    predictionBasis: [
      'Panini Select Football typically follows NFL Draft by 3–4 weeks',
      'NFL Draft class NFLPA rights filings suggest imminent product window',
      'Weak social signal from Panini employees on LinkedIn',
    ],
    expectedKeyRookies: ['Cam Ward', 'Travis Hunter', 'Shedeur Sanders'],
    historicalAnnouncementPattern: 'Announced mid-May, 4 of last 5 years post-draft',
    signalStrength: 'moderate',
    daysUntilPredicted: 57,
    marketImpact: 'very high',
    relatedCardsToWatch: ['2024 Panini Prizm Marvin Harrison Jr. RC', 'Cam Ward 2025 draft autos (presale)'],
  },
  {
    id: 'pa007',
    productName: '2025 Topps Allen & Ginter Baseball',
    manufacturer: 'Topps',
    sport: 'Baseball',
    predictedAnnouncementDate: '2026-05-22',
    confidence: 68,
    predictionBasis: [
      'Allen & Ginter announced late May to early June annually',
      'Retailer placeholder listing detected at shop.topps.com',
    ],
    expectedKeyRookies: ['Various crossover athletes and pop culture inclusions'],
    historicalAnnouncementPattern: 'May 20 – June 5 window',
    signalStrength: 'moderate',
    daysUntilPredicted: 65,
    marketImpact: 'medium',
    relatedCardsToWatch: ['2024 Allen & Ginter minis short prints', 'Non-sport crossover insert targets'],
  },
  {
    id: 'pa008',
    productName: '2025 Panini Immaculate Football',
    manufacturer: 'Panini',
    sport: 'Football',
    predictedAnnouncementDate: '2026-06-10',
    confidence: 62,
    predictionBasis: [
      'Panini Immaculate Football announced June each of last 3 years',
      'Faint distributor signal — no confirmation yet',
    ],
    expectedKeyRookies: ['Cam Ward', 'Travis Hunter', 'Will Johnson'],
    historicalAnnouncementPattern: 'June 5–15 window, 3 years consistent',
    signalStrength: 'weak',
    daysUntilPredicted: 84,
    marketImpact: 'high',
    relatedCardsToWatch: ['2024 Panini Immaculate Patrick Mahomes patch auto', 'High-end RC autos of 2025 NFL Draft class'],
  },
  {
    id: 'pa009',
    productName: '2025 Topps Stadium Club Baseball',
    manufacturer: 'Topps',
    sport: 'Baseball',
    predictedAnnouncementDate: '2026-06-20',
    confidence: 58,
    predictionBasis: [
      'Stadium Club announced late June, 3 of last 4 years',
      'Photography crew spotted at several MLB stadiums Feb–March',
    ],
    expectedKeyRookies: ['Various MLB stars — photography-focused product'],
    historicalAnnouncementPattern: 'June 18–28 window',
    signalStrength: 'weak',
    daysUntilPredicted: 94,
    marketImpact: 'medium',
    relatedCardsToWatch: ['2024 Stadium Club Fernando Tatis Jr. base', 'Short print photography inserts'],
  },
];

const MANUFACTURER_CADENCES: ManufacturerCadence[] = [
  {
    manufacturer: 'Topps',
    avgDaysBetweenReleases: 21,
    preferredAnnouncementDay: 'Tuesday',
    leadTimeToRelease: 45,
    currentYearReleases: 4,
    predictedRemainingReleases: 8,
  },
  {
    manufacturer: 'Panini',
    avgDaysBetweenReleases: 18,
    preferredAnnouncementDay: 'Wednesday',
    leadTimeToRelease: 38,
    currentYearReleases: 3,
    predictedRemainingReleases: 11,
  },
  {
    manufacturer: 'Upper Deck',
    avgDaysBetweenReleases: 35,
    preferredAnnouncementDay: 'Monday',
    leadTimeToRelease: 60,
    currentYearReleases: 2,
    predictedRemainingReleases: 4,
  },
  {
    manufacturer: 'Bowman',
    avgDaysBetweenReleases: 28,
    preferredAnnouncementDay: 'Tuesday',
    leadTimeToRelease: 42,
    currentYearReleases: 2,
    predictedRemainingReleases: 3,
  },
];

const ANNOUNCEMENT_SIGNALS: AnnouncementSignal[] = [
  {
    id: 's001',
    signalType: 'retailer_listing',
    description: "Dave & Adam's placeholder listing for '2025 Topps Chrome Baseball' detected with live SKU",
    manufacturer: 'Topps',
    product: '2025 Topps Chrome Baseball',
    detectedAt: '2026-03-16 09:14',
    strength: 92,
  },
  {
    id: 's002',
    signalType: 'trademark_filing',
    description: "USPTO filing: 'Chrome Baseball 2025' filed by Topps/Fanatics on Feb 14th — standard 6-week lead",
    manufacturer: 'Topps',
    product: '2025 Topps Chrome Baseball',
    detectedAt: '2026-03-14 11:30',
    strength: 88,
  },
  {
    id: 's003',
    signalType: 'distributor_order',
    description: 'GTS Distribution pre-order form for Panini Prizm Basketball 2025 circulating to LCS owners',
    manufacturer: 'Panini',
    product: '2025 Panini Prizm Basketball',
    detectedAt: '2026-03-15 14:22',
    strength: 85,
  },
  {
    id: 's004',
    signalType: 'social_buzz',
    description: 'Social media mentions of "Prizm Basketball 2025" spiked 340% in 48 hours — fan speculation turning to confirmation signals',
    manufacturer: 'Panini',
    product: '2025 Panini Prizm Basketball',
    detectedAt: '2026-03-17 08:05',
    strength: 74,
  },
  {
    id: 's005',
    signalType: 'influencer_preview',
    description: '@HobbyBreaks_Mike posted Instagram story hinting at "something big coming from Topps next week" with partial card image',
    manufacturer: 'Topps',
    product: '2025 Topps Chrome Baseball',
    detectedAt: '2026-03-17 19:41',
    strength: 79,
  },
  {
    id: 's006',
    signalType: 'trademark_filing',
    description: "USPTO filing: 'UD Series 1 2025 Hockey' — Upper Deck trademark Mar 3rd",
    manufacturer: 'Upper Deck',
    product: '2025 Upper Deck Series 1 Hockey',
    detectedAt: '2026-03-12 10:00',
    strength: 83,
  },
  {
    id: 's007',
    signalType: 'retailer_listing',
    description: 'Target.com placeholder for Panini Prizm Basketball hobby box — price $229.99 visible for 4 hours before removal',
    manufacturer: 'Panini',
    product: '2025 Panini Prizm Basketball',
    detectedAt: '2026-03-10 07:30',
    strength: 91,
  },
  {
    id: 's008',
    signalType: 'distributor_order',
    description: 'MLBPA rights filing for 2025 Draft class — Topps/Fanatics claiming card production rights ahead of Bowman Draft window',
    manufacturer: 'Topps',
    product: '2025 Bowman Draft Baseball',
    detectedAt: '2026-03-13 15:00',
    strength: 67,
  },
  {
    id: 's009',
    signalType: 'social_buzz',
    description: 'Multiple Panini employees updated LinkedIn with "new product launch" in upcoming weeks — correlated to Select Football window',
    manufacturer: 'Panini',
    product: '2025 Panini Select Football',
    detectedAt: '2026-03-16 12:45',
    strength: 55,
  },
  {
    id: 's010',
    signalType: 'retailer_listing',
    description: 'shop.topps.com placeholder page briefly live for "2025 Allen & Ginter" — cached version captured',
    manufacturer: 'Topps',
    product: '2025 Topps Allen & Ginter Baseball',
    detectedAt: '2026-03-11 16:20',
    strength: 61,
  },
];

const HISTORICAL_ACCURACY: HistoricalAccuracy[] = [
  {
    year: 2023,
    predictionsTotal: 31,
    correct: 22,
    avgDaysEarly: 14.2,
    bestCall: 'Predicted Panini Prizm Football 18 days before announcement — 96% confidence',
  },
  {
    year: 2024,
    predictionsTotal: 38,
    correct: 30,
    avgDaysEarly: 16.8,
    bestCall: 'Called 2024 Topps Chrome exact week — 3-signal convergence model nailed it',
  },
  {
    year: 2025,
    predictionsTotal: 42,
    correct: 35,
    avgDaysEarly: 18.3,
    bestCall: 'Predicted Upper Deck Young Guns insert set 21 days early based on trademark + distributor combo',
  },
];

const PRE_POSITIONING_OPPORTUNITIES: PrePositioningOpportunity[] = [
  {
    productId: 'pa001',
    productName: '2025 Topps Chrome Baseball',
    cardToWatch: '2024 Topps Chrome Jackson Holliday RC PSA 10',
    currentPrice: 145,
    expectedPostAnnouncementPrice: 195,
    expectedROI: 34.5,
    action: 'buy now',
    reasoning: 'Holliday is the headliner rookie for Chrome 2025. Announcement historically pumps prior-year Chrome RCs 25–40%. Window closes in 10 days.',
  },
  {
    productId: 'pa001',
    productName: '2025 Topps Chrome Baseball',
    cardToWatch: '2024 Bowman Chrome Paul Skenes auto PSA 10',
    currentPrice: 380,
    expectedPostAnnouncementPrice: 490,
    expectedROI: 28.9,
    action: 'buy now',
    reasoning: 'Skenes rookie autos run up each time a new Chrome set is announced featuring him. 90-day comp trend already turning upward.',
  },
  {
    productId: 'pa002',
    productName: '2025 Panini Prizm Basketball',
    cardToWatch: '2024-25 Panini Prizm Zaccharie Risacher RC Silver',
    currentPrice: 62,
    expectedPostAnnouncementPrice: 95,
    expectedROI: 53.2,
    action: 'buy now',
    reasoning: 'Risacher is the #1 overall pick and expected Prizm checklist leader. Prior-year Prizm base RCs of top picks spike 40–60% on announcement day.',
  },
  {
    productId: 'pa002',
    productName: '2025 Panini Prizm Basketball',
    cardToWatch: '2024-25 Panini Prizm Reed Sheppard RC Silver',
    currentPrice: 38,
    expectedPostAnnouncementPrice: 55,
    expectedROI: 44.7,
    action: 'buy now',
    reasoning: 'Sheppard buzz is building. Sleeper pick — low current price creates asymmetric upside on announcement pump.',
  },
  {
    productId: 'pa006',
    productName: '2025 Panini Select Football',
    cardToWatch: 'Cam Ward 2025 Draft auto (presale)',
    currentPrice: 210,
    expectedPostAnnouncementPrice: 310,
    expectedROI: 47.6,
    action: 'watch',
    reasoning: 'Wait for NFL Draft confirmation before committing. If Ward goes #1 overall as projected, Select announcement will trigger 40–50% run on presale autos.',
  },
  {
    productId: 'pa005',
    productName: '2025 Upper Deck Series 1 Hockey',
    cardToWatch: '2024-25 Upper Deck Matvei Michkov Young Guns RC',
    currentPrice: 88,
    expectedPostAnnouncementPrice: 120,
    expectedROI: 36.4,
    action: 'buy now',
    reasoning: 'Michkov is the generational hockey talent. Young Guns RCs historically spike on Series 1 announcement. 48-day window to accumulate.',
  },
];

// ---- Exported Functions ----

export function getPredictedAnnouncements(): PredictedAnnouncement[] {
  return [...PREDICTED_ANNOUNCEMENTS].sort((a, b) => a.daysUntilPredicted - b.daysUntilPredicted);
}

export function getPredictedAnnouncement(id: string): PredictedAnnouncement | undefined {
  return PREDICTED_ANNOUNCEMENTS.find(p => p.id === id);
}

export function getManufacturerCadences(): ManufacturerCadence[] {
  return MANUFACTURER_CADENCES;
}

export function getAnnouncementSignals(): AnnouncementSignal[] {
  return [...ANNOUNCEMENT_SIGNALS].sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
}

export function getSignalsForProduct(productName: string): AnnouncementSignal[] {
  return ANNOUNCEMENT_SIGNALS.filter(s => s.product === productName);
}

export function getHistoricalAccuracy(): HistoricalAccuracy[] {
  return HISTORICAL_ACCURACY;
}

export function getOverallAccuracyRate(): number {
  const totals = HISTORICAL_ACCURACY.reduce((acc, h) => ({ total: acc.total + h.predictionsTotal, correct: acc.correct + h.correct }), { total: 0, correct: 0 });
  return Math.round((totals.correct / totals.total) * 100);
}

export function getPrePositioningOpportunities(): PrePositioningOpportunity[] {
  return PRE_POSITIONING_OPPORTUNITIES;
}

export function getSignalTypeLabel(type: AnnouncementSignal['signalType']): string {
  const labels: Record<AnnouncementSignal['signalType'], string> = {
    retailer_listing: 'Retailer Listing',
    social_buzz: 'Social Buzz',
    trademark_filing: 'Trademark Filing',
    distributor_order: 'Distributor Order',
    influencer_preview: 'Influencer Preview',
  };
  return labels[type];
}

export function getSignalTypeColor(type: AnnouncementSignal['signalType']): string {
  const colors: Record<AnnouncementSignal['signalType'], string> = {
    retailer_listing: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    social_buzz: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    trademark_filing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    distributor_order: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    influencer_preview: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  };
  return colors[type];
}

export function getSignalStrengthColor(strength: PredictedAnnouncement['signalStrength']): string {
  const colors: Record<PredictedAnnouncement['signalStrength'], string> = {
    'very strong': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'strong': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'moderate': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'weak': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return colors[strength];
}

export function getMarketImpactColor(impact: PredictedAnnouncement['marketImpact']): string {
  const colors: Record<PredictedAnnouncement['marketImpact'], string> = {
    'very high': 'text-red-400',
    'high': 'text-amber-400',
    'medium': 'text-blue-400',
    'low': 'text-slate-400',
  };
  return colors[impact];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}
