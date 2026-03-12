import { CardInventory, Sport, TargetWatchlist } from '../types';

// ── Types ────────────────────────────────────────────────────────────────────────

export type EventType = 'national' | 'regional_show' | 'local_show' | 'trade_night' | 'card_convention';
export type AttendanceTier = 'mega' | 'large' | 'medium' | 'small' | 'micro';
export type DealType = 'bought' | 'sold' | 'traded';
export type PrepCardStatus = 'pending' | 'packed' | 'sold' | 'traded' | 'unsold';

export interface CardShowEvent {
  id: string;
  name: string;
  type: EventType;
  location: string;
  city: string;
  state: string;
  startDate: string;
  endDate: string;
  attendanceTier: AttendanceTier;
  estimatedAttendance: number;
  tableCost: number;
  admissionCost: number;
  description: string;
  sports: Sport[];
  isRecurring: boolean;
  website?: string;
}

export interface PrepListCard {
  id: string;
  eventId: string;
  cardId: string;
  player: string;
  cardDescription: string;
  targetPrice: number;
  minAcceptPrice: number;
  purpose: 'sale' | 'trade';
  status: PrepCardStatus;
  notes?: string;
  addedAt: string;
}

export interface EventBudget {
  id: string;
  eventId: string;
  totalBudget: number;
  travelCost: number;
  hotelCost: number;
  tableCost: number;
  admissionCost: number;
  foodEstimate: number;
  miscExpenses: number;
  spentSoFar: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventDeal {
  id: string;
  eventId: string;
  type: DealType;
  player: string;
  cardDescription: string;
  amount: number;
  tradeValue?: number;
  counterparty?: string;
  notes?: string;
  sport: Sport;
  timestamp: string;
}

export interface UserEvent {
  id: string;
  eventId: string;
  eventName: string;
  status: 'planned' | 'attending' | 'completed';
  registeredAt: string;
  budget?: EventBudget;
  prepListCount: number;
  dealCount: number;
}

export interface EventROI {
  eventId: string;
  eventName: string;
  totalSpent: number;
  totalValueAcquired: number;
  totalSalesRevenue: number;
  totalTradeValueGained: number;
  travelCosts: number;
  tableCosts: number;
  netROI: number;
  roiPercentage: number;
  dealCount: number;
  date: string;
}

export interface WantListItem {
  id: string;
  player: string;
  cardDescription: string;
  maxPrice: number;
  priority: 'high' | 'medium' | 'low';
  sport: Sport;
  notes?: string;
}

// ── Storage Keys ─────────────────────────────────────────────────────────────────

const EVENTS_KEY = 'msi_event_planner_events';
const PREP_LIST_KEY = 'msi_event_prep_lists';
const BUDGET_KEY = 'msi_event_budgets';
const DEALS_KEY = 'msi_event_deals';
const USER_EVENTS_KEY = 'msi_user_events';

// ── Deterministic Seed Helpers ───────────────────────────────────────────────────

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

function seededInt(seed: number, offset: number, min: number, max: number): number {
  return Math.floor(seededRange(seed, offset, min, max + 1));
}

function seededPick<T>(seed: number, offset: number, arr: T[]): T {
  return arr[Math.floor(seededRandom(seed, offset) * arr.length)];
}

function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Pre-Built Event Database ─────────────────────────────────────────────────────

const EVENT_DATABASE: CardShowEvent[] = [
  {
    id: 'evt_national_2026',
    name: 'The National Sports Collectors Convention',
    type: 'national',
    location: 'Atlantic City Convention Center',
    city: 'Atlantic City',
    state: 'NJ',
    startDate: '2026-07-29',
    endDate: '2026-08-02',
    attendanceTier: 'mega',
    estimatedAttendance: 100000,
    tableCost: 2500,
    admissionCost: 25,
    description: 'The largest annual sports card and memorabilia event in the world. Over 800 dealer tables, exclusive releases, and celebrity signings.',
    sports: ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'],
    isRecurring: true,
    website: 'https://nsccshow.com',
  },
  {
    id: 'evt_dallas_show',
    name: 'Dallas Card Show',
    type: 'regional_show',
    location: 'Dallas Market Hall',
    city: 'Dallas',
    state: 'TX',
    startDate: '2026-04-18',
    endDate: '2026-04-19',
    attendanceTier: 'large',
    estimatedAttendance: 15000,
    tableCost: 800,
    admissionCost: 15,
    description: 'Premier regional card show featuring 300+ dealers, breaking events, and autograph sessions.',
    sports: ['Baseball', 'Basketball', 'Football'],
    isRecurring: true,
  },
  {
    id: 'evt_chicago_sportsfest',
    name: 'Chicago SportsFest',
    type: 'regional_show',
    location: 'Rosemont Convention Center',
    city: 'Rosemont',
    state: 'IL',
    startDate: '2026-05-09',
    endDate: '2026-05-10',
    attendanceTier: 'large',
    estimatedAttendance: 12000,
    tableCost: 650,
    admissionCost: 12,
    description: 'Chicagoland premier card show with 250+ tables, box breaks, and grading submissions.',
    sports: ['Baseball', 'Basketball', 'Football', 'Hockey'],
    isRecurring: true,
  },
  {
    id: 'evt_socal_monthly',
    name: 'SoCal Monthly Card Show',
    type: 'local_show',
    location: 'Frank & Son Collectible Show',
    city: 'City of Industry',
    state: 'CA',
    startDate: '2026-04-04',
    endDate: '2026-04-04',
    attendanceTier: 'medium',
    estimatedAttendance: 3000,
    tableCost: 200,
    admissionCost: 5,
    description: 'Popular monthly show in Southern California. Great for finding bargains and local trades.',
    sports: ['Baseball', 'Basketball', 'Football', 'Soccer'],
    isRecurring: true,
  },
  {
    id: 'evt_hobby_expo_east',
    name: 'Hobby Expo East',
    type: 'card_convention',
    location: 'Pennsylvania Convention Center',
    city: 'Philadelphia',
    state: 'PA',
    startDate: '2026-06-12',
    endDate: '2026-06-14',
    attendanceTier: 'large',
    estimatedAttendance: 20000,
    tableCost: 1200,
    admissionCost: 20,
    description: 'East Coast premier hobby convention featuring manufacturers, grading companies, and exclusive product releases.',
    sports: ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'],
    isRecurring: true,
  },
  {
    id: 'evt_seattle_trade_night',
    name: 'Seattle Card Collectors Trade Night',
    type: 'trade_night',
    location: 'Seattle Community Center',
    city: 'Seattle',
    state: 'WA',
    startDate: '2026-03-27',
    endDate: '2026-03-27',
    attendanceTier: 'micro',
    estimatedAttendance: 80,
    tableCost: 0,
    admissionCost: 0,
    description: 'Weekly trade night for Seattle area collectors. Bring your trade binders and doubles!',
    sports: ['Baseball', 'Basketball', 'Football'],
    isRecurring: true,
  },
  {
    id: 'evt_ny_vintage_show',
    name: 'New York Vintage Card Show',
    type: 'regional_show',
    location: 'Javits Center',
    city: 'New York',
    state: 'NY',
    startDate: '2026-09-19',
    endDate: '2026-09-20',
    attendanceTier: 'large',
    estimatedAttendance: 18000,
    tableCost: 1500,
    admissionCost: 20,
    description: 'Specializing in pre-war and vintage cards. A must-attend for serious vintage collectors.',
    sports: ['Baseball', 'Basketball', 'Football', 'Hockey'],
    isRecurring: true,
  },
  {
    id: 'evt_community_trade',
    name: 'Community Card Swap & Trade',
    type: 'trade_night',
    location: 'Community Recreation Center',
    city: 'Austin',
    state: 'TX',
    startDate: '2026-03-20',
    endDate: '2026-03-20',
    attendanceTier: 'micro',
    estimatedAttendance: 50,
    tableCost: 0,
    admissionCost: 0,
    description: 'Bi-weekly community card swap. Family friendly, all experience levels welcome.',
    sports: ['Baseball', 'Basketball', 'Football'],
    isRecurring: true,
  },
  {
    id: 'evt_miami_sports_cards',
    name: 'Miami Sports Card Expo',
    type: 'local_show',
    location: 'Miami Beach Convention Center',
    city: 'Miami',
    state: 'FL',
    startDate: '2026-05-30',
    endDate: '2026-05-31',
    attendanceTier: 'medium',
    estimatedAttendance: 5000,
    tableCost: 400,
    admissionCost: 10,
    description: 'South Florida card expo with emphasis on basketball and international soccer cards.',
    sports: ['Basketball', 'Football', 'Soccer'],
    isRecurring: true,
  },
  {
    id: 'evt_denver_mile_high',
    name: 'Mile High Card Show',
    type: 'local_show',
    location: 'National Western Complex',
    city: 'Denver',
    state: 'CO',
    startDate: '2026-04-25',
    endDate: '2026-04-26',
    attendanceTier: 'medium',
    estimatedAttendance: 4000,
    tableCost: 350,
    admissionCost: 8,
    description: 'Denver\'s largest card show with 150+ dealers, grading submissions, and break sessions.',
    sports: ['Baseball', 'Basketball', 'Football', 'Hockey'],
    isRecurring: true,
  },
  {
    id: 'evt_atlanta_collectors',
    name: 'Atlanta Collectors Showcase',
    type: 'regional_show',
    location: 'Georgia World Congress Center',
    city: 'Atlanta',
    state: 'GA',
    startDate: '2026-08-15',
    endDate: '2026-08-16',
    attendanceTier: 'large',
    estimatedAttendance: 10000,
    tableCost: 700,
    admissionCost: 15,
    description: 'Southeast premiere card show with focus on basketball, football, and vintage cards.',
    sports: ['Baseball', 'Basketball', 'Football'],
    isRecurring: true,
  },
  {
    id: 'evt_portland_trade',
    name: 'Portland Cards & Coffee Trade Night',
    type: 'trade_night',
    location: 'Rose City Brewing',
    city: 'Portland',
    state: 'OR',
    startDate: '2026-03-25',
    endDate: '2026-03-25',
    attendanceTier: 'micro',
    estimatedAttendance: 40,
    tableCost: 0,
    admissionCost: 0,
    description: 'Casual trade night at a local brewery. Bring cards, grab a coffee or beer, make trades.',
    sports: ['Baseball', 'Basketball', 'Football', 'Soccer'],
    isRecurring: true,
  },
];

// ── Event Access ─────────────────────────────────────────────────────────────────

export function getAllEvents(): CardShowEvent[] {
  return [...EVENT_DATABASE];
}

export function getEventById(id: string): CardShowEvent | undefined {
  return EVENT_DATABASE.find(e => e.id === id);
}

export function getUpcomingEvents(limit = 5): CardShowEvent[] {
  const now = new Date().toISOString().split('T')[0];
  return EVENT_DATABASE
    .filter(e => e.startDate >= now)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, limit);
}

export function getNextUpcomingEvent(): CardShowEvent | null {
  const upcoming = getUpcomingEvents(1);
  return upcoming.length > 0 ? upcoming[0] : null;
}

export function getEventsByType(type: EventType): CardShowEvent[] {
  return EVENT_DATABASE.filter(e => e.type === type);
}

export function getAttendanceTierLabel(tier: AttendanceTier): string {
  const labels: Record<AttendanceTier, string> = {
    mega: 'Mega (50K+)',
    large: 'Large (10K+)',
    medium: 'Medium (1K-10K)',
    small: 'Small (200-1K)',
    micro: 'Micro (<200)',
  };
  return labels[tier];
}

export function getEventTypeLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    national: 'National Convention',
    regional_show: 'Regional Show',
    local_show: 'Local Show',
    trade_night: 'Trade Night',
    card_convention: 'Card Convention',
  };
  return labels[type];
}

export function getEventTypeColor(type: EventType): string {
  const colors: Record<EventType, string> = {
    national: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    regional_show: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    local_show: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    trade_night: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    card_convention: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  };
  return colors[type];
}

// ── User Events (Registration/Attendance) ────────────────────────────────────────

export function getUserEvents(): UserEvent[] {
  try {
    const raw = localStorage.getItem(USER_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUserEvents(events: UserEvent[]): void {
  localStorage.setItem(USER_EVENTS_KEY, JSON.stringify(events));
}

export function registerForEvent(eventId: string): UserEvent {
  const events = getUserEvents();
  const existing = events.find(e => e.eventId === eventId);
  if (existing) return existing;

  const show = getEventById(eventId);
  const userEvent: UserEvent = {
    id: generateId(),
    eventId,
    eventName: show?.name ?? 'Unknown Event',
    status: 'planned',
    registeredAt: new Date().toISOString(),
    prepListCount: 0,
    dealCount: 0,
  };
  events.push(userEvent);
  saveUserEvents(events);
  return userEvent;
}

export function updateUserEventStatus(eventId: string, status: UserEvent['status']): void {
  const events = getUserEvents();
  const idx = events.findIndex(e => e.eventId === eventId);
  if (idx >= 0) {
    events[idx].status = status;
    saveUserEvents(events);
  }
}

export function unregisterFromEvent(eventId: string): void {
  const events = getUserEvents().filter(e => e.eventId !== eventId);
  saveUserEvents(events);
}

export function isRegistered(eventId: string): boolean {
  return getUserEvents().some(e => e.eventId === eventId);
}

// ── Prep Lists ───────────────────────────────────────────────────────────────────

export function getPrepList(eventId: string): PrepListCard[] {
  try {
    const raw = localStorage.getItem(PREP_LIST_KEY);
    const all: PrepListCard[] = raw ? JSON.parse(raw) : [];
    return all.filter(p => p.eventId === eventId);
  } catch {
    return [];
  }
}

export function getAllPrepLists(): PrepListCard[] {
  try {
    const raw = localStorage.getItem(PREP_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePrepLists(items: PrepListCard[]): void {
  localStorage.setItem(PREP_LIST_KEY, JSON.stringify(items));
}

export function addToPrepList(
  eventId: string,
  card: CardInventory,
  targetPrice: number,
  minAcceptPrice: number,
  purpose: 'sale' | 'trade'
): PrepListCard {
  const all = getAllPrepLists();
  const item: PrepListCard = {
    id: generateId(),
    eventId,
    cardId: card.id,
    player: card.player,
    cardDescription: `${card.year} ${card.manufacturer} ${card.set} #${card.cardNumber}${card.isGraded ? ` ${card.gradingCompany} ${card.grade}` : ''}`,
    targetPrice,
    minAcceptPrice,
    purpose,
    status: 'pending',
    addedAt: new Date().toISOString(),
  };
  all.push(item);
  savePrepLists(all);
  return item;
}

export function updatePrepCardStatus(prepId: string, status: PrepCardStatus): void {
  const all = getAllPrepLists();
  const idx = all.findIndex(p => p.id === prepId);
  if (idx >= 0) {
    all[idx].status = status;
    savePrepLists(all);
  }
}

export function removeFromPrepList(prepId: string): void {
  const all = getAllPrepLists().filter(p => p.id !== prepId);
  savePrepLists(all);
}

// ── Budgets ──────────────────────────────────────────────────────────────────────

export function getEventBudget(eventId: string): EventBudget | null {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    const all: EventBudget[] = raw ? JSON.parse(raw) : [];
    return all.find(b => b.eventId === eventId) ?? null;
  } catch {
    return null;
  }
}

export function getAllBudgets(): EventBudget[] {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBudgets(budgets: EventBudget[]): void {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
}

export function createOrUpdateBudget(eventId: string, data: Partial<EventBudget>): EventBudget {
  const all = getAllBudgets();
  const idx = all.findIndex(b => b.eventId === eventId);
  const show = getEventById(eventId);

  if (idx >= 0) {
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    saveBudgets(all);
    return all[idx];
  }

  const budget: EventBudget = {
    id: generateId(),
    eventId,
    totalBudget: data.totalBudget ?? 500,
    travelCost: data.travelCost ?? 0,
    hotelCost: data.hotelCost ?? 0,
    tableCost: data.tableCost ?? show?.tableCost ?? 0,
    admissionCost: data.admissionCost ?? show?.admissionCost ?? 0,
    foodEstimate: data.foodEstimate ?? 50,
    miscExpenses: data.miscExpenses ?? 0,
    spentSoFar: data.spentSoFar ?? 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.push(budget);
  saveBudgets(all);
  return budget;
}

export function getBudgetRemaining(budget: EventBudget): number {
  const fixedCosts = budget.travelCost + budget.hotelCost + budget.tableCost +
    budget.admissionCost + budget.foodEstimate + budget.miscExpenses;
  return budget.totalBudget - fixedCosts - budget.spentSoFar;
}

export function getBudgetBreakdown(budget: EventBudget) {
  const fixedCosts = budget.travelCost + budget.hotelCost + budget.tableCost +
    budget.admissionCost + budget.foodEstimate + budget.miscExpenses;
  const remaining = budget.totalBudget - fixedCosts - budget.spentSoFar;
  const utilizationPct = budget.totalBudget > 0
    ? ((fixedCosts + budget.spentSoFar) / budget.totalBudget) * 100
    : 0;

  return {
    fixedCosts,
    cardSpending: budget.spentSoFar,
    remaining,
    utilizationPct,
    categories: [
      { label: 'Travel', amount: budget.travelCost, color: '#3b82f6' },
      { label: 'Hotel', amount: budget.hotelCost, color: '#8b5cf6' },
      { label: 'Table', amount: budget.tableCost, color: '#f59e0b' },
      { label: 'Admission', amount: budget.admissionCost, color: '#06b6d4' },
      { label: 'Food', amount: budget.foodEstimate, color: '#10b981' },
      { label: 'Misc', amount: budget.miscExpenses, color: '#6b7280' },
      { label: 'Cards', amount: budget.spentSoFar, color: '#ef4444' },
    ].filter(c => c.amount > 0),
  };
}

// ── Deals ────────────────────────────────────────────────────────────────────────

export function getEventDeals(eventId: string): EventDeal[] {
  try {
    const raw = localStorage.getItem(DEALS_KEY);
    const all: EventDeal[] = raw ? JSON.parse(raw) : [];
    return all.filter(d => d.eventId === eventId);
  } catch {
    return [];
  }
}

export function getAllDeals(): EventDeal[] {
  try {
    const raw = localStorage.getItem(DEALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDeals(deals: EventDeal[]): void {
  localStorage.setItem(DEALS_KEY, JSON.stringify(deals));
}

export function logDeal(
  eventId: string,
  type: DealType,
  player: string,
  cardDescription: string,
  amount: number,
  sport: Sport,
  options?: { tradeValue?: number; counterparty?: string; notes?: string }
): EventDeal {
  const all = getAllDeals();
  const deal: EventDeal = {
    id: generateId(),
    eventId,
    type,
    player,
    cardDescription,
    amount,
    tradeValue: options?.tradeValue,
    counterparty: options?.counterparty,
    notes: options?.notes,
    sport,
    timestamp: new Date().toISOString(),
  };
  all.push(deal);
  saveDeals(all);

  // Update budget spending for buys
  if (type === 'bought') {
    const budget = getEventBudget(eventId);
    if (budget) {
      createOrUpdateBudget(eventId, { spentSoFar: budget.spentSoFar + amount });
    }
  }

  return deal;
}

export function removeDeal(dealId: string): void {
  const all = getAllDeals().filter(d => d.id !== dealId);
  saveDeals(all);
}

// ── ROI Calculations ─────────────────────────────────────────────────────────────

export function getEventROI(eventId: string): EventROI {
  const event = getEventById(eventId);
  const deals = getEventDeals(eventId);
  const budget = getEventBudget(eventId);

  const totalBuys = deals.filter(d => d.type === 'bought').reduce((s, d) => s + d.amount, 0);
  const totalSales = deals.filter(d => d.type === 'sold').reduce((s, d) => s + d.amount, 0);
  const tradeValueGained = deals
    .filter(d => d.type === 'traded')
    .reduce((s, d) => s + (d.tradeValue ?? 0) - d.amount, 0);

  const travelCosts = budget ? budget.travelCost + budget.hotelCost : 0;
  const tableCosts = budget?.tableCost ?? 0;
  const otherCosts = budget
    ? budget.admissionCost + budget.foodEstimate + budget.miscExpenses
    : 0;

  const totalSpent = totalBuys + travelCosts + tableCosts + otherCosts;
  const totalValueAcquired = totalSales + tradeValueGained;
  const netROI = totalValueAcquired - totalSpent;
  const roiPercentage = totalSpent > 0 ? (netROI / totalSpent) * 100 : 0;

  return {
    eventId,
    eventName: event?.name ?? 'Unknown Event',
    totalSpent,
    totalValueAcquired,
    totalSalesRevenue: totalSales,
    totalTradeValueGained: tradeValueGained,
    travelCosts,
    tableCosts,
    netROI,
    roiPercentage,
    dealCount: deals.length,
    date: event?.startDate ?? '',
  };
}

export function getAllEventROIs(): EventROI[] {
  const userEvents = getUserEvents();
  return userEvents.map(ue => getEventROI(ue.eventId));
}

export function getAggregateROI(): { totalSpent: number; totalGained: number; netROI: number; roiPct: number; eventCount: number } {
  const rois = getAllEventROIs();
  const totalSpent = rois.reduce((s, r) => s + r.totalSpent, 0);
  const totalGained = rois.reduce((s, r) => s + r.totalValueAcquired, 0);
  const netROI = totalGained - totalSpent;
  const roiPct = totalSpent > 0 ? (netROI / totalSpent) * 100 : 0;
  return { totalSpent, totalGained, netROI, roiPct, eventCount: rois.length };
}

// ── Want List Generator ──────────────────────────────────────────────────────────

export function generateWantList(targets: TargetWatchlist[]): WantListItem[] {
  return targets
    .filter(t => t.status === 'active')
    .map(t => ({
      id: t.id,
      player: t.player,
      cardDescription: t.cardDescription,
      maxPrice: t.targetPrice,
      priority: t.priority,
      sport: t.sport,
      notes: t.notes,
    }))
    .sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2 };
      return pOrder[a.priority] - pOrder[b.priority];
    });
}

export function formatWantListForPrint(items: WantListItem[]): string {
  const header = '═══════════════════════════════════════════════════\n';
  const title = '            CARD SHOW WANT LIST\n';
  const date = `            Generated: ${new Date().toLocaleDateString()}\n`;
  const divider = '───────────────────────────────────────────────────\n';

  let output = header + title + date + header + '\n';

  const grouped: Record<string, WantListItem[]> = {};
  items.forEach(item => {
    const key = item.sport;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  Object.entries(grouped).forEach(([sport, sportItems]) => {
    output += `◆ ${sport.toUpperCase()}\n`;
    output += divider;
    sportItems.forEach((item, i) => {
      const priorityTag = item.priority === 'high' ? '★★★' : item.priority === 'medium' ? '★★ ' : '★  ';
      output += `  ${i + 1}. ${priorityTag} ${item.player}\n`;
      output += `     ${item.cardDescription}\n`;
      output += `     Max: $${item.maxPrice.toFixed(0)}`;
      if (item.notes) output += ` | ${item.notes}`;
      output += '\n\n';
    });
  });

  output += header;
  output += `  Total items: ${items.length}\n`;
  output += header;

  return output;
}

// ── Prep List Print Format ───────────────────────────────────────────────────────

export function formatPrepListForPrint(eventId: string): string {
  const event = getEventById(eventId);
  const items = getPrepList(eventId);
  const header = '═══════════════════════════════════════════════════\n';
  const title = `     SHOW INVENTORY - ${(event?.name ?? 'Event').toUpperCase()}\n`;
  const date = `     ${event?.startDate ?? ''} | ${event?.city ?? ''}, ${event?.state ?? ''}\n`;
  const divider = '───────────────────────────────────────────────────\n';

  let output = header + title + date + header + '\n';

  const forSale = items.filter(i => i.purpose === 'sale');
  const forTrade = items.filter(i => i.purpose === 'trade');

  if (forSale.length > 0) {
    output += '▸ FOR SALE\n' + divider;
    forSale.forEach((item, i) => {
      output += `  ${i + 1}. ${item.player}\n`;
      output += `     ${item.cardDescription}\n`;
      output += `     Ask: $${item.targetPrice.toFixed(0)} | Min: $${item.minAcceptPrice.toFixed(0)}\n`;
      if (item.notes) output += `     Note: ${item.notes}\n`;
      output += '\n';
    });
    const totalAsk = forSale.reduce((s, i) => s + i.targetPrice, 0);
    output += `  Total Asking: $${totalAsk.toFixed(0)}\n\n`;
  }

  if (forTrade.length > 0) {
    output += '▸ FOR TRADE\n' + divider;
    forTrade.forEach((item, i) => {
      output += `  ${i + 1}. ${item.player}\n`;
      output += `     ${item.cardDescription}\n`;
      output += `     Value: $${item.targetPrice.toFixed(0)}\n`;
      if (item.notes) output += `     Note: ${item.notes}\n`;
      output += '\n';
    });
  }

  output += header;
  output += `  Total items: ${items.length} (${forSale.length} sale, ${forTrade.length} trade)\n`;
  output += header;

  return output;
}

// ── Simulated Past Event Data (for demo ROI history) ─────────────────────────────

export function getSimulatedEventHistory(): EventROI[] {
  const seed = 42;
  const pastEvents = [
    { name: 'The National 2025', date: '2025-07-30' },
    { name: 'Dallas Card Show - Feb', date: '2025-02-15' },
    { name: 'Chicago SportsFest Fall', date: '2025-10-11' },
    { name: 'SoCal Monthly - Dec', date: '2025-12-06' },
    { name: 'Local Trade Night - Nov', date: '2025-11-14' },
    { name: 'Hobby Expo East', date: '2025-06-14' },
    { name: 'Dallas Card Show - Oct', date: '2025-10-18' },
    { name: 'Local Trade Night - Sep', date: '2025-09-12' },
  ];

  return pastEvents.map((pe, i) => {
    const totalSpent = Math.round(seededRange(seed, i * 10, 100, 3000));
    const roiMult = seededRange(seed, i * 10 + 1, -0.15, 0.45);
    const totalValueAcquired = Math.round(totalSpent * (1 + roiMult));
    const salesRev = Math.round(totalValueAcquired * seededRange(seed, i * 10 + 2, 0.4, 0.8));
    const tradeGain = totalValueAcquired - salesRev;
    const travelCosts = Math.round(seededRange(seed, i * 10 + 3, 0, 500));
    const tableCosts = Math.round(seededRange(seed, i * 10 + 4, 0, 1000));
    const netROI = totalValueAcquired - totalSpent;
    const roiPct = totalSpent > 0 ? (netROI / totalSpent) * 100 : 0;

    return {
      eventId: `sim_${i}`,
      eventName: pe.name,
      totalSpent,
      totalValueAcquired,
      totalSalesRevenue: salesRev,
      totalTradeValueGained: tradeGain,
      travelCosts,
      tableCosts,
      netROI,
      roiPercentage: roiPct,
      dealCount: seededInt(seed, i * 10 + 5, 2, 25),
      date: pe.date,
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

// ── Dashboard Summary ────────────────────────────────────────────────────────────

export interface EventDashboardSummary {
  nextEvent: CardShowEvent | null;
  daysUntilNext: number | null;
  prepListCount: number;
  prepListReady: number;
  recentROI: EventROI | null;
  aggregateROI: { totalSpent: number; totalGained: number; netROI: number; roiPct: number; eventCount: number };
  upcomingRegistered: UserEvent[];
}

export function getDashboardSummary(): EventDashboardSummary {
  const nextEvent = getNextUpcomingEvent();
  const now = new Date();
  let daysUntilNext: number | null = null;
  if (nextEvent) {
    const eventDate = new Date(nextEvent.startDate);
    daysUntilNext = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  const userEvents = getUserEvents();
  const upcomingRegistered = userEvents.filter(ue => ue.status !== 'completed');

  // Get prep status for next event
  let prepListCount = 0;
  let prepListReady = 0;
  if (nextEvent) {
    const prep = getPrepList(nextEvent.id);
    prepListCount = prep.length;
    prepListReady = prep.filter(p => p.status === 'packed').length;
  }

  // Most recent completed event ROI
  const history = getSimulatedEventHistory();
  const recentROI = history.length > 0 ? history[history.length - 1] : null;

  const aggregateROI = getAggregateROI();

  // Merge simulated data into aggregate if no real data
  if (aggregateROI.eventCount === 0 && history.length > 0) {
    const simTotalSpent = history.reduce((s, r) => s + r.totalSpent, 0);
    const simTotalGained = history.reduce((s, r) => s + r.totalValueAcquired, 0);
    return {
      nextEvent,
      daysUntilNext,
      prepListCount,
      prepListReady,
      recentROI,
      aggregateROI: {
        totalSpent: simTotalSpent,
        totalGained: simTotalGained,
        netROI: simTotalGained - simTotalSpent,
        roiPct: simTotalSpent > 0 ? ((simTotalGained - simTotalSpent) / simTotalSpent) * 100 : 0,
        eventCount: history.length,
      },
      upcomingRegistered,
    };
  }

  return {
    nextEvent,
    daysUntilNext,
    prepListCount,
    prepListReady,
    recentROI,
    aggregateROI,
    upcomingRegistered,
  };
}
