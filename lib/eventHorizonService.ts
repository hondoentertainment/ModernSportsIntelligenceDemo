// ─────────────────────────────────────────────────────────────────────────────
// Event Horizon Scanner Service
// Forecasts market impact of upcoming sports and hobby events on card values
// ─────────────────────────────────────────────────────────────────────────────

export interface UpcomingEvent {
  id: string;
  name: string;
  date: string;
  daysUntil: number;
  category: 'draft' | 'playoff' | 'award' | 'release' | 'cultural' | 'grading';
  expectedImpact: number;
  affectedSegments: string[];
  historicalAvgMove: number;
  confidence: number;
  actionWindow: string;
}

export interface ImpactForecast {
  id: string;
  eventId: string;
  eventName: string;
  segment: string;
  predictedMove: number;
  lowEstimate: number;
  highEstimate: number;
  optimalEntryDays: number;
  optimalExitDays: number;
  modelAccuracy: number;
}

export interface HistoricalEventImpact {
  id: string;
  eventName: string;
  date: string;
  category: string;
  actualMove: number;
  predictedMove: number;
  forecastError: number;
  peakImpactDay: number;
  recoveryDays: number;
  lesson: string;
}

export interface EventCategory {
  category: string;
  avgImpact: number;
  eventCount: number;
  avgDuration: number;
  bestPerformingSegment: string;
  reliability: number;
}

const upcomingEvents: UpcomingEvent[] = [
  { id: 'EV-01', name: 'MLB Draft 2026', date: '2026-07-12', daysUntil: 85, category: 'draft', expectedImpact: 8.5, affectedSegments: ['Prospect Chrome', 'Modern Rookies', 'Parallel Universe'], historicalAvgMove: 12.3, confidence: 88, actionWindow: 'pre-event' },
  { id: 'EV-02', name: 'MLB All-Star Game', date: '2026-07-14', daysUntil: 87, category: 'cultural', expectedImpact: 4.2, affectedSegments: ['Modern Rookies', 'Auto/Relic', 'Graded Gems'], historicalAvgMove: 3.8, confidence: 72, actionWindow: 'during' },
  { id: 'EV-03', name: 'MLB Trade Deadline', date: '2026-07-31', daysUntil: 104, category: 'cultural', expectedImpact: 6.8, affectedSegments: ['Prospect Chrome', 'Modern Rookies', 'Set Builders'], historicalAvgMove: 7.1, confidence: 81, actionWindow: 'pre-event' },
  { id: 'EV-04', name: 'World Series 2026', date: '2026-10-20', daysUntil: 185, category: 'playoff', expectedImpact: 9.2, affectedSegments: ['Modern Rookies', 'Auto/Relic', 'Graded Gems', 'Parallel Universe'], historicalAvgMove: 15.6, confidence: 85, actionWindow: 'during' },
  { id: 'EV-05', name: 'NFL Draft 2026', date: '2026-04-23', daysUntil: 5, category: 'draft', expectedImpact: 9.5, affectedSegments: ['Prospect Chrome', 'Modern Rookies', 'Raw Lots', 'Parallel Universe'], historicalAvgMove: 18.2, confidence: 92, actionWindow: 'pre-event' },
  { id: 'EV-06', name: 'NBA Draft 2026', date: '2026-06-25', daysUntil: 68, category: 'draft', expectedImpact: 7.8, affectedSegments: ['Prospect Chrome', 'Modern Rookies', 'Auto/Relic'], historicalAvgMove: 14.5, confidence: 86, actionWindow: 'pre-event' },
  { id: 'EV-07', name: 'Bowman Chrome Release', date: '2026-09-15', daysUntil: 150, category: 'release', expectedImpact: 7.5, affectedSegments: ['Prospect Chrome', 'Raw Lots', 'Parallel Universe', 'Set Builders'], historicalAvgMove: 9.8, confidence: 79, actionWindow: 'pre-event' },
  { id: 'EV-08', name: 'Topps Series 2 Release', date: '2026-06-10', daysUntil: 53, category: 'release', expectedImpact: 5.8, affectedSegments: ['Modern Rookies', 'Set Builders', 'Raw Lots', 'Parallel Universe'], historicalAvgMove: 6.2, confidence: 83, actionWindow: 'post-event' },
  { id: 'EV-09', name: 'HOF Induction Ceremony', date: '2026-07-26', daysUntil: 99, category: 'award', expectedImpact: 6.5, affectedSegments: ['Vintage HOF', 'Graded Gems', 'Auto/Relic'], historicalAvgMove: 11.4, confidence: 90, actionWindow: 'pre-event' },
  { id: 'EV-10', name: 'PSA Turnaround Change', date: '2026-05-01', daysUntil: 13, category: 'grading', expectedImpact: -3.5, affectedSegments: ['Graded Gems', 'Raw Lots', 'Vintage HOF'], historicalAvgMove: -4.2, confidence: 68, actionWindow: 'post-event' },
  { id: 'EV-11', name: 'National Card Show', date: '2026-07-29', daysUntil: 102, category: 'cultural', expectedImpact: 5.5, affectedSegments: ['Vintage HOF', 'Auto/Relic', 'Graded Gems', 'Raw Lots'], historicalAvgMove: 4.8, confidence: 77, actionWindow: 'during' },
  { id: 'EV-12', name: 'Black Friday Sales', date: '2026-11-27', daysUntil: 223, category: 'cultural', expectedImpact: -4.8, affectedSegments: ['Modern Rookies', 'Raw Lots', 'Set Builders', 'Parallel Universe'], historicalAvgMove: -6.1, confidence: 74, actionWindow: 'during' },
];

const impactForecasts: ImpactForecast[] = [
  { id: 'IF-01', eventId: 'EV-05', eventName: 'NFL Draft 2026', segment: 'Prospect Chrome', predictedMove: 22.5, lowEstimate: 15.2, highEstimate: 31.8, optimalEntryDays: 14, optimalExitDays: 3, modelAccuracy: 84 },
  { id: 'IF-02', eventId: 'EV-05', eventName: 'NFL Draft 2026', segment: 'Modern Rookies', predictedMove: 12.8, lowEstimate: 7.5, highEstimate: 18.4, optimalEntryDays: 10, optimalExitDays: 7, modelAccuracy: 79 },
  { id: 'IF-03', eventId: 'EV-01', eventName: 'MLB Draft 2026', segment: 'Prospect Chrome', predictedMove: 15.4, lowEstimate: 9.8, highEstimate: 22.1, optimalEntryDays: 21, optimalExitDays: 5, modelAccuracy: 81 },
  { id: 'IF-04', eventId: 'EV-04', eventName: 'World Series 2026', segment: 'Modern Rookies', predictedMove: 18.2, lowEstimate: 11.5, highEstimate: 26.8, optimalEntryDays: 7, optimalExitDays: 14, modelAccuracy: 76 },
  { id: 'IF-05', eventId: 'EV-09', eventName: 'HOF Induction Ceremony', segment: 'Vintage HOF', predictedMove: 14.8, lowEstimate: 10.2, highEstimate: 19.5, optimalEntryDays: 30, optimalExitDays: 7, modelAccuracy: 88 },
  { id: 'IF-06', eventId: 'EV-07', eventName: 'Bowman Chrome Release', segment: 'Prospect Chrome', predictedMove: -8.5, lowEstimate: -14.2, highEstimate: -3.1, optimalEntryDays: 0, optimalExitDays: 14, modelAccuracy: 72 },
  { id: 'IF-07', eventId: 'EV-06', eventName: 'NBA Draft 2026', segment: 'Modern Rookies', predictedMove: 16.5, lowEstimate: 10.8, highEstimate: 23.2, optimalEntryDays: 12, optimalExitDays: 5, modelAccuracy: 82 },
  { id: 'IF-08', eventId: 'EV-10', eventName: 'PSA Turnaround Change', segment: 'Graded Gems', predictedMove: -5.2, lowEstimate: -9.8, highEstimate: -1.5, optimalEntryDays: 0, optimalExitDays: 21, modelAccuracy: 65 },
  { id: 'IF-09', eventId: 'EV-08', eventName: 'Topps Series 2 Release', segment: 'Set Builders', predictedMove: 7.2, lowEstimate: 3.5, highEstimate: 11.8, optimalEntryDays: 7, optimalExitDays: 14, modelAccuracy: 77 },
  { id: 'IF-10', eventId: 'EV-12', eventName: 'Black Friday Sales', segment: 'Raw Lots', predictedMove: -9.5, lowEstimate: -15.2, highEstimate: -4.8, optimalEntryDays: 0, optimalExitDays: 30, modelAccuracy: 71 },
];

const historicalEventImpacts: HistoricalEventImpact[] = [
  { id: 'HE-01', eventName: 'NFL Draft 2025', date: '2025-04-24', category: 'draft', actualMove: 19.8, predictedMove: 17.2, forecastError: 2.6, peakImpactDay: 2, recoveryDays: 28, lesson: 'Top-5 pick prospect cards spike hardest in first 48 hours; fade quickly if player falls in draft' },
  { id: 'HE-02', eventName: 'MLB Draft 2025', date: '2025-07-13', category: 'draft', actualMove: 11.5, predictedMove: 13.8, forecastError: -2.3, peakImpactDay: 1, recoveryDays: 21, lesson: 'Baseball draft has less immediate impact than NFL/NBA; Bowman 1st cards of top picks see strongest moves' },
  { id: 'HE-03', eventName: 'World Series 2025', date: '2025-10-21', category: 'playoff', actualMove: 16.2, predictedMove: 14.5, forecastError: 1.7, peakImpactDay: 5, recoveryDays: 42, lesson: 'Championship winners sustain premiums longer than expected; MVPs see permanent price floor increases' },
  { id: 'HE-04', eventName: 'Bowman Chrome 2025', date: '2025-09-10', category: 'release', actualMove: -7.8, predictedMove: -9.2, forecastError: 1.4, peakImpactDay: 3, recoveryDays: 35, lesson: 'Existing prospect chromes sell off as new supply enters; buy the dip on proven players 2-3 weeks post-release' },
  { id: 'HE-05', eventName: 'HOF Induction 2025', date: '2025-07-27', category: 'award', actualMove: 13.2, predictedMove: 11.8, forecastError: 1.4, peakImpactDay: -7, recoveryDays: 60, lesson: 'Most appreciation happens pre-announcement; buy when rumors circulate, sell into ceremony day hype' },
  { id: 'HE-06', eventName: 'NBA Draft 2025', date: '2025-06-26', category: 'draft', actualMove: 15.5, predictedMove: 14.1, forecastError: 1.4, peakImpactDay: 1, recoveryDays: 18, lesson: 'Top-3 pick Prizm and Optic rookies spike hardest; international prospects benefit most from draft-day exposure' },
  { id: 'HE-07', eventName: 'National Card Show 2025', date: '2025-07-30', category: 'cultural', actualMove: 5.2, predictedMove: 4.5, forecastError: 0.7, peakImpactDay: 3, recoveryDays: 14, lesson: 'Vintage segment benefits most from in-person show exposure; chase card reveals create short-term spikes' },
  { id: 'HE-08', eventName: 'PSA Price Increase 2025', date: '2025-03-15', category: 'grading', actualMove: -6.5, predictedMove: -4.8, forecastError: -1.7, peakImpactDay: 7, recoveryDays: 45, lesson: 'Grading price hikes cause immediate sell-off in raw cards as submission ROI declines; graded inventory premiums increase' },
  { id: 'HE-09', eventName: 'Topps Series 2 2025', date: '2025-06-11', category: 'release', actualMove: 5.8, predictedMove: 6.5, forecastError: -0.7, peakImpactDay: 1, recoveryDays: 21, lesson: 'SP and SSP variations drive set builder demand; photo variation checklists create immediate hunt frenzy' },
  { id: 'HE-10', eventName: 'Black Friday 2025', date: '2025-11-28', category: 'cultural', actualMove: -7.2, predictedMove: -5.9, forecastError: -1.3, peakImpactDay: 1, recoveryDays: 30, lesson: 'Retail hobby box discounts suppress online single prices; low-end modern cards hit hardest, vintage is resilient' },
  { id: 'HE-11', eventName: 'Super Bowl LVIII', date: '2025-02-09', category: 'playoff', actualMove: 14.8, predictedMove: 12.5, forecastError: 2.3, peakImpactDay: 0, recoveryDays: 35, lesson: 'Winning QB and MVP cards spike instantly; hold through parade week for maximum extraction' },
  { id: 'HE-12', eventName: 'MLB All-Star Game 2025', date: '2025-07-15', category: 'cultural', actualMove: 3.5, predictedMove: 4.2, forecastError: -0.7, peakImpactDay: 0, recoveryDays: 7, lesson: 'Minimal lasting impact; best used as liquidity event to sell into increased eyeball traffic' },
];

const eventCategories: EventCategory[] = [
  { category: 'Draft', avgImpact: 8.9, eventCount: 24, avgDuration: 22, bestPerformingSegment: 'Prospect Chrome', reliability: 87 },
  { category: 'Playoff', avgImpact: 7.8, eventCount: 18, avgDuration: 38, bestPerformingSegment: 'Modern Rookies', reliability: 82 },
  { category: 'Award', avgImpact: 6.2, eventCount: 12, avgDuration: 45, bestPerformingSegment: 'Vintage HOF', reliability: 85 },
  { category: 'Release', avgImpact: 5.5, eventCount: 30, avgDuration: 25, bestPerformingSegment: 'Set Builders', reliability: 76 },
  { category: 'Cultural', avgImpact: 4.1, eventCount: 36, avgDuration: 12, bestPerformingSegment: 'Raw Lots', reliability: 71 },
  { category: 'Grading', avgImpact: 4.8, eventCount: 8, avgDuration: 35, bestPerformingSegment: 'Graded Gems', reliability: 68 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Event Window Analysis
// Breaks down events by their optimal action timing windows
// ─────────────────────────────────────────────────────────────────────────────

export interface EventWindowBreakdown {
  window: string;
  count: number;
  avgImpact: number;
  events: string[];
}

function buildWindowBreakdown(): EventWindowBreakdown[] {
  const windows = ['pre-event', 'during', 'post-event'];
  return windows.map(window => {
    const matching = upcomingEvents.filter(e => e.actionWindow === window);
    const avgImpact = matching.length > 0
      ? Math.round((matching.reduce((s, e) => s + e.expectedImpact, 0) / matching.length) * 10) / 10
      : 0;
    return {
      window,
      count: matching.length,
      avgImpact,
      events: matching.map(e => e.name),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Segment Exposure Index
// Measures how many events affect each segment and cumulative expected impact
// ─────────────────────────────────────────────────────────────────────────────

export interface SegmentExposure {
  segment: string;
  eventCount: number;
  totalExpectedImpact: number;
  avgConfidence: number;
  nearestEvent: string;
  nearestEventDays: number;
}

function buildSegmentExposures(): SegmentExposure[] {
  const segmentMap = new Map<string, UpcomingEvent[]>();
  for (const event of upcomingEvents) {
    for (const seg of event.affectedSegments) {
      if (!segmentMap.has(seg)) segmentMap.set(seg, []);
      segmentMap.get(seg)!.push(event);
    }
  }
  const exposures: SegmentExposure[] = [];
  for (const [segment, events] of segmentMap) {
    const sorted = [...events].sort((a, b) => a.daysUntil - b.daysUntil);
    exposures.push({
      segment,
      eventCount: events.length,
      totalExpectedImpact: Math.round(events.reduce((s, e) => s + e.expectedImpact, 0) * 10) / 10,
      avgConfidence: Math.round(events.reduce((s, e) => s + e.confidence, 0) / events.length),
      nearestEvent: sorted[0].name,
      nearestEventDays: sorted[0].daysUntil,
    });
  }
  return exposures.sort((a, b) => b.totalExpectedImpact - a.totalExpectedImpact);
}

// ─────────────────────────────────────────────────────────────────────────────
// Getters
// ─────────────────────────────────────────────────────────────────────────────

export function getUpcomingEvents(): UpcomingEvent[] {
  return upcomingEvents;
}

export function getImpactForecasts(): ImpactForecast[] {
  return impactForecasts;
}

export function getHistoricalEventImpacts(): HistoricalEventImpact[] {
  return historicalEventImpacts;
}

export function getEventCategories(): EventCategory[] {
  return eventCategories;
}

export function getEventWindowBreakdown(): EventWindowBreakdown[] {
  return buildWindowBreakdown();
}

export function getSegmentExposures(): SegmentExposure[] {
  return buildSegmentExposures();
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

export function getEventSummary(): {
  eventsNext30Days: number;
  highestImpactEvent: string;
  avgForecastAccuracy: number;
  totalEventsTracked: number;
} {
  const eventsNext30Days = upcomingEvents.filter(e => e.daysUntil <= 30).length;

  const sorted = [...upcomingEvents].sort(
    (a, b) => Math.abs(b.expectedImpact) - Math.abs(a.expectedImpact)
  );
  const highestImpactEvent = sorted[0].name;

  const errors = historicalEventImpacts.map(h => Math.abs(h.forecastError));
  const avgError = errors.reduce((s, e) => s + e, 0) / errors.length;
  const avgForecastAccuracy = Math.round((1 - avgError / 10) * 100);

  const totalEventsTracked = upcomingEvents.length + historicalEventImpacts.length;

  return {
    eventsNext30Days,
    highestImpactEvent,
    avgForecastAccuracy,
    totalEventsTracked,
  };
}
