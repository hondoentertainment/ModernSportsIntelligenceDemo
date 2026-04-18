// Anniversary Effect Tracker Service
// Tracks how anniversary dates of historic sports moments create predictable price effects

export interface AnniversaryEvent {
  id: string;
  eventName: string;
  originalDate: string;
  anniversaryDate: string;
  yearsAgo: number;
  category: 'championship' | 'record' | 'debut' | 'milestone' | 'cultural';
  affectedCards: string[];
  expectedPriceEffect: number;
  historicalAvgEffect: number;
  daysUntilAnniversary: number;
}

export interface PriceEffect {
  id: string;
  eventId: string;
  eventName: string;
  year: number;
  preDays: number;
  peakDay: number;
  postDays: number;
  priceChange: number;
  volumeChange: number;
  sustainedEffect: boolean;
}

export interface EffectPattern {
  id: string;
  patternName: string;
  description: string;
  avgMagnitude: number;
  avgDuration: number;
  reliability: number;
  bestExploitStrategy: string;
  occurrenceCount: number;
  category: string;
}

export interface AnniversaryCalendar {
  month: string;
  events: number;
  avgImpact: number;
  topEvent: string;
  cumulativeEffect: number;
}

export interface AnniversarySummary {
  upcomingEvents30d: number;
  avgEffect: number;
  strongestPattern: string;
  calendarCoverage: number;
}

const anniversaryEvents: AnniversaryEvent[] = [
  { id: 'ae-001', eventName: "Derek Jeter's 3000th Hit", originalDate: '2011-07-09', anniversaryDate: '2026-07-09', yearsAgo: 15, category: 'milestone', affectedCards: ['1993 SP Foil', '1993 Upper Deck', '2014 Topps Chrome'], expectedPriceEffect: 14.2, historicalAvgEffect: 11.8, daysUntilAnniversary: 82 },
  { id: 'ae-002', eventName: 'Ken Griffey Jr. HOF Induction', originalDate: '2016-07-24', anniversaryDate: '2026-07-24', yearsAgo: 10, category: 'milestone', affectedCards: ['1989 Upper Deck #1', '1989 Donruss Rated Rookie', '1989 Bowman'], expectedPriceEffect: 18.5, historicalAvgEffect: 15.3, daysUntilAnniversary: 97 },
  { id: 'ae-003', eventName: "Shohei Ohtani's 50/50 Season", originalDate: '2024-09-19', anniversaryDate: '2026-09-19', yearsAgo: 2, category: 'record', affectedCards: ['2018 Topps Chrome', '2018 Bowman Chrome Auto', '2018 Topps Update'], expectedPriceEffect: 22.4, historicalAvgEffect: 19.8, daysUntilAnniversary: 154 },
  { id: 'ae-004', eventName: "Mike Trout's MLB Debut", originalDate: '2011-07-08', anniversaryDate: '2026-07-08', yearsAgo: 15, category: 'debut', affectedCards: ['2011 Topps Update #US175', '2009 Bowman Chrome Draft Auto', '2011 Bowman Chrome'], expectedPriceEffect: 12.6, historicalAvgEffect: 10.4, daysUntilAnniversary: 81 },
  { id: 'ae-005', eventName: "Michael Jordan's Final Game", originalDate: '2003-04-16', anniversaryDate: '2026-04-16', yearsAgo: 23, category: 'cultural', affectedCards: ['1986 Fleer #57', '1984 Star #101', '1997 Metal Universe'], expectedPriceEffect: 8.5, historicalAvgEffect: 9.2, daysUntilAnniversary: -2 },
  { id: 'ae-006', eventName: "Tom Brady's Super Bowl LI Comeback", originalDate: '2017-02-05', anniversaryDate: '2027-02-05', yearsAgo: 10, category: 'championship', affectedCards: ['2000 Bowman Chrome #236', '2000 Playoff Contenders Auto', '2000 SP Authentic'], expectedPriceEffect: 16.8, historicalAvgEffect: 14.1, daysUntilAnniversary: 293 },
  { id: 'ae-007', eventName: "Aaron Judge's 62nd Home Run", originalDate: '2022-10-04', anniversaryDate: '2026-10-04', yearsAgo: 4, category: 'record', affectedCards: ['2014 Bowman Chrome Auto', '2017 Topps Chrome', '2017 Bowman Chrome'], expectedPriceEffect: 15.3, historicalAvgEffect: 13.7, daysUntilAnniversary: 169 },
  { id: 'ae-008', eventName: "Ichiro Suzuki's 3000th Hit", originalDate: '2016-08-07', anniversaryDate: '2026-08-07', yearsAgo: 10, category: 'milestone', affectedCards: ['2001 Topps Chrome #T266', '2001 SP Authentic', '2001 Bowman Chrome'], expectedPriceEffect: 13.1, historicalAvgEffect: 11.5, daysUntilAnniversary: 111 },
  { id: 'ae-009', eventName: "Kobe Bryant's 81-Point Game", originalDate: '2006-01-22', anniversaryDate: '2027-01-22', yearsAgo: 21, category: 'record', affectedCards: ['1996 Topps Chrome Refractor', '1996 Finest Refractor', '1996 Bowman Best'], expectedPriceEffect: 19.6, historicalAvgEffect: 21.4, daysUntilAnniversary: 279 },
  { id: 'ae-010', eventName: "Wayne Gretzky's Final Game", originalDate: '1999-04-18', anniversaryDate: '2026-04-18', yearsAgo: 27, category: 'cultural', affectedCards: ['1979 O-Pee-Chee #18', '1979 Topps #18', '1981 O-Pee-Chee'], expectedPriceEffect: 7.8, historicalAvgEffect: 8.9, daysUntilAnniversary: 0 },
  { id: 'ae-011', eventName: "Stephen Curry's 3-Point Record", originalDate: '2021-12-14', anniversaryDate: '2026-12-14', yearsAgo: 5, category: 'record', affectedCards: ['2009 Topps Chrome Refractor', '2009 Bowman Chrome Auto', '2009 National Treasures'], expectedPriceEffect: 16.2, historicalAvgEffect: 14.8, daysUntilAnniversary: 240 },
  { id: 'ae-012', eventName: "LeBron James's NBA Debut", originalDate: '2003-10-29', anniversaryDate: '2026-10-29', yearsAgo: 23, category: 'debut', affectedCards: ['2003 Topps Chrome Refractor', '2003 Exquisite Collection RPA', '2003 Upper Deck'], expectedPriceEffect: 11.4, historicalAvgEffect: 12.6, daysUntilAnniversary: 194 },
];

const priceEffects: PriceEffect[] = [
  { id: 'pe-001', eventId: 'ae-001', eventName: "Jeter's 3000th Hit", year: 2024, preDays: 14, peakDay: 0, postDays: 10, priceChange: 12.4, volumeChange: 45.2, sustainedEffect: false },
  { id: 'pe-002', eventId: 'ae-001', eventName: "Jeter's 3000th Hit", year: 2023, preDays: 12, peakDay: 1, postDays: 8, priceChange: 10.8, volumeChange: 38.6, sustainedEffect: false },
  { id: 'pe-003', eventId: 'ae-002', eventName: 'Griffey HOF Induction', year: 2024, preDays: 18, peakDay: 0, postDays: 14, priceChange: 16.1, volumeChange: 62.3, sustainedEffect: true },
  { id: 'pe-004', eventId: 'ae-002', eventName: 'Griffey HOF Induction', year: 2023, preDays: 15, peakDay: 2, postDays: 11, priceChange: 14.2, volumeChange: 51.8, sustainedEffect: false },
  { id: 'pe-005', eventId: 'ae-003', eventName: "Ohtani's 50/50", year: 2025, preDays: 21, peakDay: 0, postDays: 18, priceChange: 19.8, volumeChange: 78.4, sustainedEffect: true },
  { id: 'pe-006', eventId: 'ae-005', eventName: "Jordan's Final Game", year: 2025, preDays: 10, peakDay: 0, postDays: 7, priceChange: 9.2, volumeChange: 32.1, sustainedEffect: false },
  { id: 'pe-007', eventId: 'ae-005', eventName: "Jordan's Final Game", year: 2024, preDays: 8, peakDay: 1, postDays: 6, priceChange: 8.8, volumeChange: 28.5, sustainedEffect: false },
  { id: 'pe-008', eventId: 'ae-007', eventName: "Judge's 62nd HR", year: 2025, preDays: 16, peakDay: 0, postDays: 12, priceChange: 14.5, volumeChange: 55.2, sustainedEffect: true },
  { id: 'pe-009', eventId: 'ae-007', eventName: "Judge's 62nd HR", year: 2024, preDays: 14, peakDay: 1, postDays: 10, priceChange: 12.8, volumeChange: 48.6, sustainedEffect: false },
  { id: 'pe-010', eventId: 'ae-009', eventName: "Kobe's 81 Points", year: 2025, preDays: 20, peakDay: 0, postDays: 16, priceChange: 22.1, volumeChange: 85.3, sustainedEffect: true },
  { id: 'pe-011', eventId: 'ae-009', eventName: "Kobe's 81 Points", year: 2024, preDays: 18, peakDay: 0, postDays: 15, priceChange: 20.8, volumeChange: 79.6, sustainedEffect: true },
  { id: 'pe-012', eventId: 'ae-011', eventName: "Curry's 3-Point Record", year: 2025, preDays: 12, peakDay: 0, postDays: 9, priceChange: 14.8, volumeChange: 52.4, sustainedEffect: false },
  { id: 'pe-013', eventId: 'ae-004', eventName: "Trout's MLB Debut", year: 2024, preDays: 10, peakDay: 0, postDays: 7, priceChange: 10.4, volumeChange: 34.8, sustainedEffect: false },
  { id: 'pe-014', eventId: 'ae-008', eventName: "Ichiro's 3000th Hit", year: 2024, preDays: 13, peakDay: 1, postDays: 9, priceChange: 11.2, volumeChange: 41.5, sustainedEffect: false },
  { id: 'pe-015', eventId: 'ae-012', eventName: "LeBron's NBA Debut", year: 2025, preDays: 14, peakDay: 0, postDays: 11, priceChange: 12.6, volumeChange: 46.2, sustainedEffect: false },
];

const effectPatterns: EffectPattern[] = [
  { id: 'ep-001', patternName: 'Milestone Anniversary Premium', description: 'Career counting stats milestones (3000 hits, 500 HR) generate reliable anniversary bumps that strengthen at round-number years.', avgMagnitude: 13.8, avgDuration: 18, reliability: 82, bestExploitStrategy: 'Buy 3-4 weeks before anniversary, sell within 48 hours of date', occurrenceCount: 34, category: 'milestone' },
  { id: 'ep-002', patternName: 'Championship Nostalgia Spike', description: 'Title-winning moments create emotional buying surges, especially at 5/10/25 year intervals when media coverage increases.', avgMagnitude: 16.4, avgDuration: 22, reliability: 75, bestExploitStrategy: 'Target championship MVPs, buy 1 month out, ride the media cycle', occurrenceCount: 28, category: 'championship' },
  { id: 'ep-003', patternName: 'Debut Anniversary Buzz', description: 'Rookie debut dates generate moderate effects, strongest for players still active who can amplify with current performance.', avgMagnitude: 10.2, avgDuration: 12, reliability: 68, bestExploitStrategy: 'Focus on active players having strong current seasons near debut anniversary', occurrenceCount: 42, category: 'debut' },
  { id: 'ep-004', patternName: 'Record-Breaking Resurgence', description: 'Record-setting moments create the strongest and most sustained anniversary effects, especially when the record still stands.', avgMagnitude: 18.6, avgDuration: 24, reliability: 86, bestExploitStrategy: 'Identify unbroken records approaching round anniversaries, accumulate early', occurrenceCount: 22, category: 'record' },
  { id: 'ep-005', patternName: 'Cultural Moment Echo', description: 'Culturally transcendent moments (last games, iconic performances) create emotional trading spikes independent of on-field relevance.', avgMagnitude: 12.1, avgDuration: 14, reliability: 71, bestExploitStrategy: 'Monitor social media sentiment 2 weeks before date for early momentum signals', occurrenceCount: 18, category: 'cultural' },
  { id: 'ep-006', patternName: 'Round Year Amplifier', description: 'Anniversary effects are 2-3x stronger at round-number years (5, 10, 20, 25) due to increased media retrospectives and collector nostalgia.', avgMagnitude: 22.4, avgDuration: 28, reliability: 89, bestExploitStrategy: 'Calendar scan for upcoming round-year anniversaries 6 months ahead, build position slowly', occurrenceCount: 15, category: 'milestone' },
];

const anniversaryCalendar: AnniversaryCalendar[] = [
  { month: 'January', events: 3, avgImpact: 14.2, topEvent: "Kobe's 81-Point Game", cumulativeEffect: 42.6 },
  { month: 'February', events: 2, avgImpact: 15.8, topEvent: "Brady's Super Bowl LI", cumulativeEffect: 31.6 },
  { month: 'March', events: 1, avgImpact: 8.4, topEvent: 'March Madness Draft Buzz', cumulativeEffect: 8.4 },
  { month: 'April', events: 3, avgImpact: 9.5, topEvent: "Jordan's Final Game", cumulativeEffect: 28.5 },
  { month: 'May', events: 1, avgImpact: 7.2, topEvent: "Ichiro's 262-Hit Season Start", cumulativeEffect: 7.2 },
  { month: 'June', events: 2, avgImpact: 12.8, topEvent: 'NBA Finals Anniversary Week', cumulativeEffect: 25.6 },
  { month: 'July', events: 4, avgImpact: 14.6, topEvent: "Griffey's HOF Induction", cumulativeEffect: 58.4 },
  { month: 'August', events: 2, avgImpact: 11.5, topEvent: "Ichiro's 3000th Hit", cumulativeEffect: 23.0 },
  { month: 'September', events: 3, avgImpact: 17.8, topEvent: "Ohtani's 50/50 Season", cumulativeEffect: 53.4 },
  { month: 'October', events: 4, avgImpact: 15.2, topEvent: "Judge's 62nd HR", cumulativeEffect: 60.8 },
  { month: 'November', events: 1, avgImpact: 8.8, topEvent: 'MLB Award Announcements', cumulativeEffect: 8.8 },
  { month: 'December', events: 2, avgImpact: 14.8, topEvent: "Curry's 3-Point Record", cumulativeEffect: 29.6 },
];

// --- Getter Functions ---

export function getAnniversaryEvents(): AnniversaryEvent[] {
  return anniversaryEvents;
}

export function getPriceEffects(): PriceEffect[] {
  return priceEffects;
}

export function getEffectPatterns(): EffectPattern[] {
  return effectPatterns;
}

export function getAnniversaryCalendar(): AnniversaryCalendar[] {
  return anniversaryCalendar;
}

export function getAnniversarySummary(): AnniversarySummary {
  const upcomingEvents30d = anniversaryEvents.filter(e => e.daysUntilAnniversary >= 0 && e.daysUntilAnniversary <= 30).length;
  const avgEffect = parseFloat((anniversaryEvents.reduce((sum, e) => sum + e.historicalAvgEffect, 0) / anniversaryEvents.length).toFixed(1));
  const strongest = effectPatterns.reduce((a, b) => (a.reliability > b.reliability ? a : b));
  const monthsWithEvents = anniversaryCalendar.filter(c => c.events > 0).length;
  const calendarCoverage = Math.round((monthsWithEvents / 12) * 100);

  return {
    upcomingEvents30d,
    avgEffect,
    strongestPattern: strongest.patternName,
    calendarCoverage,
  };
}
