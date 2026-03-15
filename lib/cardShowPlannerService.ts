// ---- Types ----

export type ShowType = 'local' | 'regional' | 'national' | 'convention';
export type Priority = 'high' | 'medium' | 'low';

export interface CardShow {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  date: string;
  endDate: string;
  type: ShowType;
  venue: string;
  description: string;
  vendors: number;
  expectedAttendance: number;
  admissionCost: number;
  website?: string;
  featured: boolean;
}

export interface WantListItem {
  cardName: string;
  player: string;
  maxPrice: number;
  priority: Priority;
}

export interface ExpenseItem {
  category: string;
  amount: number;
  note: string;
}

export interface ShowPlan {
  id: string;
  showId: string;
  budget: number;
  wantList: WantListItem[];
  expenses: ExpenseItem[];
  totalSpent: number;
  notes: string;
  rating?: number; // 1-5
}

export interface ShowStats {
  totalAttended: number;
  totalSpent: number;
  totalCardsAcquired: number;
  avgSpendPerShow: number;
  upcomingShows: number;
  favoriteVenue: string;
}

export interface AcquiredCard {
  cardName: string;
  player: string;
  price: number;
  booth: string;
}

export interface PostShowReport {
  showId: string;
  cardsAcquired: AcquiredCard[];
  totalSpent: number;
  budgetRemaining: number;
  highlights: string;
  rating: number;
}

// ---- Constants & Keys ----

const PLANS_KEY = 'msi_card_show_planner_plans';
const REPORTS_KEY = 'msi_card_show_planner_reports';

// ---- Mock Data ----

const MOCK_SHOWS: CardShow[] = [
  {
    id: 'show-1',
    name: 'National Sports Collectors Convention',
    location: '1 Convention Center Dr, Atlantic City, NJ',
    city: 'Atlantic City',
    state: 'NJ',
    date: '2026-07-22',
    endDate: '2026-07-27',
    type: 'national',
    venue: 'Atlantic City Convention Center',
    description: 'The largest annual sports card and memorabilia convention in the United States.',
    vendors: 800,
    expectedAttendance: 50000,
    admissionCost: 25,
    website: 'https://nsccshow.com',
    featured: true,
  },
  {
    id: 'show-2',
    name: 'Dallas Card Show',
    location: '1400 S Lamar St, Dallas, TX',
    city: 'Dallas',
    state: 'TX',
    date: '2026-04-11',
    endDate: '2026-04-12',
    type: 'regional',
    venue: 'Dallas Convention Center',
    description: 'Major regional card show featuring top dealers from across the South.',
    vendors: 250,
    expectedAttendance: 8000,
    admissionCost: 10,
    website: 'https://dallascardshow.com',
    featured: true,
  },
  {
    id: 'show-3',
    name: 'Chicago Sports Spectacular',
    location: '9291 W Maryland Ave, Rosemont, IL',
    city: 'Rosemont',
    state: 'IL',
    date: '2026-05-16',
    endDate: '2026-05-17',
    type: 'regional',
    venue: 'Donald E. Stephens Convention Center',
    description: 'Chicagoland\'s premier sports card and memorabilia show.',
    vendors: 300,
    expectedAttendance: 10000,
    admissionCost: 12,
    featured: true,
  },
  {
    id: 'show-4',
    name: 'Bay Area Card Expo',
    location: '1333 Bayshore Hwy, Burlingame, CA',
    city: 'Burlingame',
    state: 'CA',
    date: '2026-06-06',
    endDate: '2026-06-07',
    type: 'regional',
    venue: 'Hyatt Regency SFO',
    description: 'West Coast card show with a focus on vintage and modern wax.',
    vendors: 150,
    expectedAttendance: 5000,
    admissionCost: 8,
    featured: false,
  },
  {
    id: 'show-5',
    name: 'NYC Monthly Card Meetup',
    location: '655 W 34th St, New York, NY',
    city: 'New York',
    state: 'NY',
    date: '2026-04-04',
    endDate: '2026-04-04',
    type: 'local',
    venue: 'Javits Center North Hall',
    description: 'Monthly meetup for NYC area collectors and dealers.',
    vendors: 50,
    expectedAttendance: 1200,
    admissionCost: 5,
    featured: false,
  },
  {
    id: 'show-6',
    name: 'Midwest Sports Card Convention',
    location: '100 W Washington St, Indianapolis, IN',
    city: 'Indianapolis',
    state: 'IN',
    date: '2026-03-21',
    endDate: '2026-03-22',
    type: 'convention',
    venue: 'Indiana Convention Center',
    description: 'Large convention featuring autograph guests, panels, and 400+ vendors.',
    vendors: 400,
    expectedAttendance: 15000,
    admissionCost: 15,
    website: 'https://midwestsportscon.com',
    featured: true,
  },
  {
    id: 'show-7',
    name: 'Florida Card & Memorabilia Show',
    location: '9800 International Dr, Orlando, FL',
    city: 'Orlando',
    state: 'FL',
    date: '2026-05-02',
    endDate: '2026-05-03',
    type: 'regional',
    venue: 'Orange County Convention Center',
    description: 'Florida\'s biggest card show with top regional and national dealers.',
    vendors: 200,
    expectedAttendance: 7000,
    admissionCost: 10,
    featured: false,
  },
  {
    id: 'show-8',
    name: 'Phoenix Vintage Sports Show',
    location: '1826 W McDowell Rd, Phoenix, AZ',
    city: 'Phoenix',
    state: 'AZ',
    date: '2026-04-25',
    endDate: '2026-04-26',
    type: 'local',
    venue: 'Arizona State Fairgrounds',
    description: 'Vintage-focused show with pre-war and mid-century cards.',
    vendors: 80,
    expectedAttendance: 2500,
    admissionCost: 5,
    featured: false,
  },
  {
    id: 'show-9',
    name: 'Seattle Collectors Convention',
    location: '800 Convention Pl, Seattle, WA',
    city: 'Seattle',
    state: 'WA',
    date: '2026-06-20',
    endDate: '2026-06-21',
    type: 'convention',
    venue: 'Washington State Convention Center',
    description: 'Pacific Northwest\'s top collector convention with panels and signings.',
    vendors: 175,
    expectedAttendance: 6000,
    admissionCost: 12,
    website: 'https://seattlecollectorscon.com',
    featured: false,
  },
  {
    id: 'show-10',
    name: 'Boston Sports Card Expo',
    location: '415 Summer St, Boston, MA',
    city: 'Boston',
    state: 'MA',
    date: '2026-03-07',
    endDate: '2026-03-08',
    type: 'regional',
    venue: 'Boston Convention & Exhibition Center',
    description: 'New England\'s premier sports card show featuring Red Sox, Celtics, and more.',
    vendors: 180,
    expectedAttendance: 5500,
    admissionCost: 10,
    featured: false,
  },
  {
    id: 'show-11',
    name: 'Denver Mile High Card Show',
    location: '700 14th St, Denver, CO',
    city: 'Denver',
    state: 'CO',
    date: '2026-05-30',
    endDate: '2026-05-31',
    type: 'local',
    venue: 'Colorado Convention Center',
    description: 'Rocky Mountain region card show with a great mix of modern and vintage.',
    vendors: 100,
    expectedAttendance: 3000,
    admissionCost: 7,
    featured: false,
  },
  {
    id: 'show-12',
    name: 'Atlanta Trading Card Festival',
    location: '285 Andrew Young International Blvd, Atlanta, GA',
    city: 'Atlanta',
    state: 'GA',
    date: '2026-02-14',
    endDate: '2026-02-15',
    type: 'convention',
    venue: 'Georgia World Congress Center',
    description: 'Southeastern trading card festival with live breaks, vendors, and celebrity guests.',
    vendors: 220,
    expectedAttendance: 8500,
    admissionCost: 12,
    website: 'https://atlantacardfest.com',
    featured: true,
  },
  {
    id: 'show-13',
    name: 'Houston Hobby Expo',
    location: '8400 Kirby Dr, Houston, TX',
    city: 'Houston',
    state: 'TX',
    date: '2026-03-28',
    endDate: '2026-03-29',
    type: 'local',
    venue: 'NRG Center',
    description: 'Local hobby show with a friendly community atmosphere and good deals.',
    vendors: 60,
    expectedAttendance: 1800,
    admissionCost: 5,
    featured: false,
  },
];

// ---- Helper: today's date ----

function today(): string {
  return new Date().toISOString().split('T')[0];
}

// ---- Show Functions ----

export function getAllShows(): CardShow[] {
  return [...MOCK_SHOWS];
}

export function getShowById(id: string): CardShow | undefined {
  return MOCK_SHOWS.find((s) => s.id === id);
}

export function getUpcomingShows(): CardShow[] {
  const t = today();
  return MOCK_SHOWS.filter((s) => s.date >= t).sort((a, b) => a.date.localeCompare(b.date));
}

export function getPastShows(): CardShow[] {
  const t = today();
  return MOCK_SHOWS.filter((s) => s.endDate < t).sort((a, b) => b.date.localeCompare(a.date));
}

export function getShowsByState(state: string): CardShow[] {
  const upper = state.toUpperCase();
  return MOCK_SHOWS.filter((s) => s.state.toUpperCase() === upper);
}

// ---- Plan Functions ----

function loadPlans(): ShowPlan[] {
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePlans(plans: ShowPlan[]): void {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

export function getShowPlans(): ShowPlan[] {
  return loadPlans();
}

export function createShowPlan(plan: ShowPlan): ShowPlan {
  const plans = loadPlans();
  plans.push(plan);
  savePlans(plans);
  return plan;
}

export function updateShowPlan(id: string, updates: Partial<ShowPlan>): ShowPlan | undefined {
  const plans = loadPlans();
  const idx = plans.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  plans[idx] = { ...plans[idx], ...updates, id };
  savePlans(plans);
  return plans[idx];
}

export function addExpense(planId: string, expense: ExpenseItem): ShowPlan | undefined {
  const plans = loadPlans();
  const idx = plans.findIndex((p) => p.id === planId);
  if (idx === -1) return undefined;
  plans[idx].expenses.push(expense);
  plans[idx].totalSpent = plans[idx].expenses.reduce((sum, e) => sum + e.amount, 0);
  savePlans(plans);
  return plans[idx];
}

// ---- Post-Show Report Functions ----

function loadReports(): PostShowReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveReports(reports: PostShowReport[]): void {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export function getPostShowReports(): PostShowReport[] {
  return loadReports();
}

export function createPostShowReport(report: PostShowReport): PostShowReport {
  const reports = loadReports();
  reports.push(report);
  saveReports(reports);
  return report;
}

// ---- Stats ----

export function getShowStats(): ShowStats {
  const reports = loadReports();
  const plans = loadPlans();
  const upcoming = getUpcomingShows();

  const totalAttended = reports.length;
  const totalSpent = reports.reduce((sum, r) => sum + r.totalSpent, 0);
  const totalCardsAcquired = reports.reduce((sum, r) => sum + r.cardsAcquired.length, 0);
  const avgSpendPerShow = totalAttended > 0 ? totalSpent / totalAttended : 0;

  // Determine favorite venue by counting plan occurrences
  const venueCounts: Record<string, number> = {};
  for (const plan of plans) {
    const show = getShowById(plan.showId);
    if (show) {
      venueCounts[show.venue] = (venueCounts[show.venue] || 0) + 1;
    }
  }
  let favoriteVenue = 'N/A';
  let maxCount = 0;
  for (const [venue, count] of Object.entries(venueCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteVenue = venue;
    }
  }

  return {
    totalAttended,
    totalSpent,
    totalCardsAcquired,
    avgSpendPerShow,
    upcomingShows: upcoming.length,
    favoriteVenue,
  };
}

// ---- Formatting Utilities ----

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function getShowTypeColor(type: ShowType): string {
  switch (type) {
    case 'national':
      return 'bg-purple-600';
    case 'regional':
      return 'bg-blue-600';
    case 'convention':
      return 'bg-amber-600';
    case 'local':
      return 'bg-green-600';
    default:
      return 'bg-gray-600';
  }
}

export function getShowTypeLabel(type: ShowType): string {
  switch (type) {
    case 'national':
      return 'National';
    case 'regional':
      return 'Regional';
    case 'convention':
      return 'Convention';
    case 'local':
      return 'Local';
    default:
      return type;
  }
}

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 'high':
      return 'text-red-400';
    case 'medium':
      return 'text-yellow-400';
    case 'low':
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
}
