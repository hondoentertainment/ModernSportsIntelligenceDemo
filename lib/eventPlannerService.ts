import { CardInventory, TargetWatchlist } from '../types';
import { store } from './dal/syncStore';

// ---- Types ----

export type EventType = 'national' | 'regional' | 'local' | 'trade_night';
export type AttendanceTier = 'massive' | 'large' | 'medium' | 'small';
export type DealType = 'buy' | 'sell' | 'trade';

export interface CardEvent {
  id: string;
  name: string;
  date: string; // ISO date
  endDate?: string;
  location: string;
  type: EventType;
  attendanceTier: AttendanceTier;
  description: string;
  estimatedAttendance?: number;
  websiteUrl?: string;
}

export interface EventPrepItem {
  cardId: string;
  targetSalePrice: number;
  notes?: string;
  status: 'pending' | 'ready' | 'sold';
}

export interface EventPrepList {
  eventId: string;
  items: EventPrepItem[];
  createdAt: string;
  updatedAt: string;
}

export interface EventBudget {
  eventId: string;
  travel: number;
  hotel: number;
  table: number;
  spending: number;
  food: number;
  other: number;
  notes?: string;
}

export interface EventDeal {
  id: string;
  eventId: string;
  type: DealType;
  player: string;
  cardDescription: string;
  price: number;
  tradeValue?: number;
  notes?: string;
  timestamp: string;
}

export interface EventROI {
  eventId: string;
  eventName: string;
  totalBudgetSpent: number;
  totalDealsSpent: number;
  totalDealsEarned: number;
  totalTradeValue: number;
  netROI: number;
  dealCount: number;
}

export interface WantListItem {
  id: string;
  player: string;
  cardDescription: string;
  targetPrice: number;
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
}

// ---- Constants ----

const _EVENTS_KEY = 'msi_events';
const PREP_KEY = 'msi_event_prep';
const BUDGET_KEY = 'msi_event_budgets';
const DEALS_KEY = 'msi_event_deals';

// ---- Pre-built Events ----

function getBaseYear(): number {
  return new Date().getFullYear();
}

function generatePrebuiltEvents(): CardEvent[] {
  const year = getBaseYear();
  return [
    {
      id: 'evt_national',
      name: 'The National Sports Collectors Convention',
      date: `${year}-07-23`,
      endDate: `${year}-07-27`,
      location: 'Cleveland, OH',
      type: 'national',
      attendanceTier: 'massive',
      description: 'The largest sports collectibles event in the world. 800+ dealers, exclusive releases, and celebrity signings.',
      estimatedAttendance: 100000,
      websiteUrl: 'https://nsccshow.com',
    },
    {
      id: 'evt_dallas_spring',
      name: 'Dallas Card Show',
      date: `${year}-03-14`,
      endDate: `${year}-03-16`,
      location: 'Dallas, TX',
      type: 'regional',
      attendanceTier: 'large',
      description: 'Premier regional show in the Southwest with 200+ tables and top-tier inventory.',
      estimatedAttendance: 15000,
    },
    {
      id: 'evt_chicago_spring',
      name: 'Chicago Card Show',
      date: `${year}-04-11`,
      endDate: `${year}-04-13`,
      location: 'Chicago, IL',
      type: 'regional',
      attendanceTier: 'large',
      description: 'Major Midwest show with strong vintage and modern selection.',
      estimatedAttendance: 12000,
    },
    {
      id: 'evt_houston_spring',
      name: 'Houston Card Show',
      date: `${year}-05-09`,
      endDate: `${year}-05-11`,
      location: 'Houston, TX',
      type: 'regional',
      attendanceTier: 'large',
      description: 'Growing regional show with excellent baseball card selection.',
      estimatedAttendance: 8000,
    },
    {
      id: 'evt_atlanta_summer',
      name: 'Atlanta Sports Card & Memorabilia Expo',
      date: `${year}-06-20`,
      endDate: `${year}-06-22`,
      location: 'Atlanta, GA',
      type: 'regional',
      attendanceTier: 'medium',
      description: 'Southeast premier card show with 150+ dealers.',
      estimatedAttendance: 6000,
    },
    {
      id: 'evt_la_fall',
      name: 'LA Card Show',
      date: `${year}-09-12`,
      endDate: `${year}-09-14`,
      location: 'Los Angeles, CA',
      type: 'regional',
      attendanceTier: 'large',
      description: 'West Coast flagship show with celebrity appearances and exclusive breaks.',
      estimatedAttendance: 10000,
    },
    {
      id: 'evt_philly_fall',
      name: 'Philly Non-Sports & Sports Card Show',
      date: `${year}-10-17`,
      endDate: `${year}-10-19`,
      location: 'Philadelphia, PA',
      type: 'regional',
      attendanceTier: 'medium',
      description: 'Historic East Coast show with strong vintage presence.',
      estimatedAttendance: 5000,
    },
    {
      id: 'evt_local_trade_jan',
      name: 'Monthly Trade Night - January',
      date: `${year}-01-15`,
      location: 'Local Card Shop',
      type: 'trade_night',
      attendanceTier: 'small',
      description: 'Monthly community trade night. Bring your duplicates and want lists!',
      estimatedAttendance: 30,
    },
    {
      id: 'evt_local_trade_feb',
      name: 'Monthly Trade Night - February',
      date: `${year}-02-19`,
      location: 'Local Card Shop',
      type: 'trade_night',
      attendanceTier: 'small',
      description: 'Monthly community trade night. Great for networking and finding deals.',
      estimatedAttendance: 30,
    },
    {
      id: 'evt_local_trade_mar',
      name: 'Monthly Trade Night - March',
      date: `${year}-03-19`,
      location: 'Local Card Shop',
      type: 'trade_night',
      attendanceTier: 'small',
      description: 'Monthly community trade night. Spring cleaning edition!',
      estimatedAttendance: 35,
    },
    {
      id: 'evt_local_trade_apr',
      name: 'Monthly Trade Night - April',
      date: `${year}-04-16`,
      location: 'Local Card Shop',
      type: 'trade_night',
      attendanceTier: 'small',
      description: 'Monthly community trade night. Baseball season kickoff special!',
      estimatedAttendance: 40,
    },
    {
      id: 'evt_local_show_may',
      name: 'Spring Local Card Show',
      date: `${year}-05-03`,
      location: 'Community Center',
      type: 'local',
      attendanceTier: 'small',
      description: 'Small local show with 20-30 tables. Great for bargain hunting.',
      estimatedAttendance: 200,
    },
    {
      id: 'evt_local_show_nov',
      name: 'Fall Local Card Show',
      date: `${year}-11-08`,
      location: 'Community Center',
      type: 'local',
      attendanceTier: 'small',
      description: 'End-of-year local show. Dealers looking to move inventory before holidays.',
      estimatedAttendance: 250,
    },
  ];
}

// ---- localStorage helpers ----

function loadJSON<T>(key: string, fallback: T): T {
  return store.get<T>(key, fallback);
}

function saveJSON<T>(key: string, data: T): void {
  store.set(key, data);
}

// ---- Events ----

export function getUpcomingEvents(filterType?: EventType): CardEvent[] {
  const events = generatePrebuiltEvents();
  const today = new Date().toISOString().slice(0, 10);

  let upcoming = events
    .filter(e => e.date >= today || (e.endDate && e.endDate >= today))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (filterType) {
    upcoming = upcoming.filter(e => e.type === filterType);
  }

  return upcoming;
}

export function getAllEvents(): CardEvent[] {
  return generatePrebuiltEvents().sort((a, b) => a.date.localeCompare(b.date));
}

export function getEventById(eventId: string): CardEvent | undefined {
  return generatePrebuiltEvents().find(e => e.id === eventId);
}

// ---- Prep Lists ----

export function createPrepList(eventId: string, items: EventPrepItem[]): EventPrepList {
  const allPrep = loadJSON<EventPrepList[]>(PREP_KEY, []);
  const now = new Date().toISOString();

  const existing = allPrep.findIndex(p => p.eventId === eventId);
  const prepList: EventPrepList = {
    eventId,
    items,
    createdAt: existing >= 0 ? allPrep[existing].createdAt : now,
    updatedAt: now,
  };

  if (existing >= 0) {
    allPrep[existing] = prepList;
  } else {
    allPrep.push(prepList);
  }

  saveJSON(PREP_KEY, allPrep);
  return prepList;
}

export function getPrepList(eventId: string): EventPrepList | null {
  const allPrep = loadJSON<EventPrepList[]>(PREP_KEY, []);
  return allPrep.find(p => p.eventId === eventId) ?? null;
}

// ---- Budgets ----

export function setBudget(eventId: string, budget: Omit<EventBudget, 'eventId'>): EventBudget {
  const allBudgets = loadJSON<EventBudget[]>(BUDGET_KEY, []);
  const fullBudget: EventBudget = { eventId, ...budget };

  const existing = allBudgets.findIndex(b => b.eventId === eventId);
  if (existing >= 0) {
    allBudgets[existing] = fullBudget;
  } else {
    allBudgets.push(fullBudget);
  }

  saveJSON(BUDGET_KEY, allBudgets);
  return fullBudget;
}

export function getBudget(eventId: string): EventBudget | null {
  const allBudgets = loadJSON<EventBudget[]>(BUDGET_KEY, []);
  return allBudgets.find(b => b.eventId === eventId) ?? null;
}

function getTotalBudget(budget: EventBudget): number {
  return budget.travel + budget.hotel + budget.table + budget.spending + budget.food + budget.other;
}

// ---- Deals ----

export function logDeal(eventId: string, deal: Omit<EventDeal, 'id' | 'eventId' | 'timestamp'>): EventDeal {
  const allDeals = loadJSON<EventDeal[]>(DEALS_KEY, []);
  const newDeal: EventDeal = {
    ...deal,
    id: `deal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    eventId,
    timestamp: new Date().toISOString(),
  };

  allDeals.push(newDeal);
  saveJSON(DEALS_KEY, allDeals);
  return newDeal;
}

export function getDeals(eventId: string): EventDeal[] {
  const allDeals = loadJSON<EventDeal[]>(DEALS_KEY, []);
  return allDeals.filter(d => d.eventId === eventId);
}

export function getAllDeals(): EventDeal[] {
  return loadJSON<EventDeal[]>(DEALS_KEY, []);
}

// ---- Want List ----

export function generateWantList(watchlistCards: TargetWatchlist[]): WantListItem[] {
  return watchlistCards
    .filter(w => w.status === 'active')
    .map(w => ({
      id: w.id,
      player: w.player,
      cardDescription: w.cardDescription,
      targetPrice: w.targetPrice,
      priority: w.priority,
      notes: w.notes,
    }))
    .sort((a, b) => {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

// ---- ROI ----

export function calculateEventROI(eventId: string): EventROI {
  const event = getEventById(eventId);
  const budget = getBudget(eventId);
  const deals = getDeals(eventId);

  const totalBudgetSpent = budget ? getTotalBudget(budget) : 0;
  const totalDealsSpent = deals
    .filter(d => d.type === 'buy')
    .reduce((sum, d) => sum + d.price, 0);
  const totalDealsEarned = deals
    .filter(d => d.type === 'sell')
    .reduce((sum, d) => sum + d.price, 0);
  const totalTradeValue = deals
    .filter(d => d.type === 'trade')
    .reduce((sum, d) => sum + (d.tradeValue ?? 0), 0);

  const totalSpent = totalBudgetSpent + totalDealsSpent;
  const totalGained = totalDealsEarned + totalTradeValue;
  const netROI = totalGained - totalSpent;

  return {
    eventId,
    eventName: event?.name ?? 'Unknown Event',
    totalBudgetSpent,
    totalDealsSpent,
    totalDealsEarned,
    totalTradeValue,
    netROI,
    dealCount: deals.length,
  };
}

// ---- Event History ----

export function getEventHistory(): EventROI[] {
  const events = generatePrebuiltEvents();
  const today = new Date().toISOString().slice(0, 10);
  const allDeals = loadJSON<EventDeal[]>(DEALS_KEY, []);

  // Events that have passed and have deals or budgets
  const pastEventIds = new Set<string>();
  events.forEach(e => {
    const endDate = e.endDate ?? e.date;
    if (endDate < today) {
      pastEventIds.add(e.id);
    }
  });

  // Also include events with deals regardless of date
  allDeals.forEach(d => pastEventIds.add(d.eventId));

  return Array.from(pastEventIds)
    .map(id => calculateEventROI(id))
    .filter(roi => roi.dealCount > 0 || roi.totalBudgetSpent > 0)
    .sort((a, b) => {
      const eventA = getEventById(a.eventId);
      const eventB = getEventById(b.eventId);
      return (eventB?.date ?? '').localeCompare(eventA?.date ?? '');
    });
}

// ---- Export ----

export function exportPrepListHTML(eventId: string, cards: CardInventory[]): string {
  const event = getEventById(eventId);
  const prepList = getPrepList(eventId);
  if (!prepList || !event) return '<p>No prep list found.</p>';

  const cardMap = new Map(cards.map(c => [c.id, c]));

  const rows = prepList.items.map(item => {
    const card = cardMap.get(item.cardId);
    if (!card) return '';
    return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #333;">${card.player}</td>
        <td style="padding:8px;border-bottom:1px solid #333;">${card.year} ${card.manufacturer} ${card.set} #${card.cardNumber}</td>
        <td style="padding:8px;border-bottom:1px solid #333;">${card.isGraded ? `${card.gradingCompany} ${card.grade}` : card.condition}</td>
        <td style="padding:8px;border-bottom:1px solid #333;">$${card.purchasePrice.toFixed(2)}</td>
        <td style="padding:8px;border-bottom:1px solid #333;font-weight:bold;">$${item.targetSalePrice.toFixed(2)}</td>
        <td style="padding:8px;border-bottom:1px solid #333;">${item.notes ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid #333;">${item.status}</td>
      </tr>
    `;
  }).filter(Boolean).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <title>${event.name} - Prep List</title>
  <style>
    body { font-family: Arial, sans-serif; background: #0a0f1c; color: #e2e8f0; padding: 20px; }
    h1 { color: #3b82f6; }
    h2 { color: #94a3b8; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { text-align: left; padding: 8px; border-bottom: 2px solid #3b82f6; color: #3b82f6; font-size: 12px; text-transform: uppercase; }
    td { font-size: 13px; }
    .footer { margin-top: 24px; font-size: 11px; color: #64748b; }
    @media print { body { background: white; color: black; } th { color: #1e40af; border-color: #1e40af; } }
  </style>
</head>
<body>
  <h1>${event.name}</h1>
  <h2>${event.date} | ${event.location} | ${prepList.items.length} cards</h2>
  <table>
    <thead>
      <tr>
        <th>Player</th>
        <th>Card</th>
        <th>Condition/Grade</th>
        <th>Cost</th>
        <th>Target Price</th>
        <th>Notes</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">Generated by MSI on ${new Date().toLocaleDateString()}</div>
</body>
</html>`;
}
