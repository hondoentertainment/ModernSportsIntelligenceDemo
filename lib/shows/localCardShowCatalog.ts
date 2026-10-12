/**
 * Seeded public-style card-show calendar.
 * Venues, cities, and dates are a labeled demo catalog — not a live promoter
 * scrape, not a paid listings API, and not a claim of Market Movers parity.
 */
import type { Sport } from '../../types';

export const LOCAL_CARD_SHOW_SOURCE = 'seeded-public-calendar' as const;

export const LOCAL_CARD_SHOW_DISCLOSURE =
  'Seeded public-style calendar of card shows (venue, dates, city). Not a live promoter feed and not a paid listings API. Distance stays unknown until this browser shares a location.';

export type ShowTableStyle = 'singles' | 'wax' | 'mixed' | 'vintage' | 'graded';
export type ShowCalendarStatus = 'upcoming' | 'in-progress';

export interface LocalCardShow {
  id: string;
  name: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  /** Month (1–12) and day the show opens. Occurrences roll forward after they end. */
  month: number;
  day: number;
  durationDays: number;
  admissionUsd: number;
  vendorCount: number;
  expectedAttendance: number;
  sports: Sport[];
  /** Highlighted names dealers tend to bring. Empty means open tables in `sports`. */
  focusPlayers: string[];
  tableStyle: ShowTableStyle;
  notes: string;
}

export interface ResolvedLocalCardShow extends LocalCardShow {
  startDate: string;
  endDate: string;
  status: ShowCalendarStatus;
  daysUntilStart: number;
  source: typeof LOCAL_CARD_SHOW_SOURCE;
}

export const LOCAL_CARD_SHOW_CATALOG: LocalCardShow[] = [
  {
    id: 'nscc-atlantic-city',
    name: 'National Sports Collectors Convention',
    venue: 'Atlantic City Convention Center',
    address: '1 Convention Center Dr',
    city: 'Atlantic City',
    state: 'NJ',
    lat: 39.3632,
    lng: -74.4399,
    month: 7,
    day: 22,
    durationDays: 6,
    admissionUsd: 25,
    vendorCount: 800,
    expectedAttendance: 50000,
    sports: ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'],
    focusPlayers: [],
    tableStyle: 'mixed',
    notes: 'National room. Travel only pays off when several gaps or deals line up.',
  },
  {
    id: 'nyc-monthly',
    name: 'NYC Monthly Card Meetup',
    venue: 'Javits Center North Hall',
    address: '655 W 34th St',
    city: 'New York',
    state: 'NY',
    lat: 40.7571,
    lng: -74.0023,
    month: 10,
    day: 18,
    durationDays: 1,
    admissionUsd: 5,
    vendorCount: 50,
    expectedAttendance: 1200,
    sports: ['Baseball', 'Basketball'],
    focusPlayers: ['Mike Trout', 'Aaron Judge', 'Jayson Tatum'],
    tableStyle: 'singles',
    notes: 'Local singles meetup. Best for one or two targeted buys.',
  },
  {
    id: 'dallas-card-show',
    name: 'Dallas Card Show',
    venue: 'Kay Bailey Hutchison Convention Center',
    address: '650 S Griffin St',
    city: 'Dallas',
    state: 'TX',
    lat: 32.774,
    lng: -96.801,
    month: 11,
    day: 7,
    durationDays: 2,
    admissionUsd: 10,
    vendorCount: 250,
    expectedAttendance: 8000,
    sports: ['Football', 'Baseball'],
    focusPlayers: ['Patrick Mahomes', 'CeeDee Lamb', 'Mike Trout'],
    tableStyle: 'mixed',
    notes: 'Regional football-and-baseball room.',
  },
  {
    id: 'chicago-spectacular',
    name: 'Chicago Sports Spectacular',
    venue: 'Donald E. Stephens Convention Center',
    address: '5555 N River Rd',
    city: 'Rosemont',
    state: 'IL',
    lat: 41.9796,
    lng: -87.8603,
    month: 11,
    day: 21,
    durationDays: 2,
    admissionUsd: 12,
    vendorCount: 300,
    expectedAttendance: 10000,
    sports: ['Baseball', 'Basketball', 'Football'],
    focusPlayers: [],
    tableStyle: 'mixed',
    notes: 'Chicagoland regional. Open tables across the big three sports.',
  },
  {
    id: 'bay-area-expo',
    name: 'Bay Area Card Expo',
    venue: 'Hyatt Regency SFO',
    address: '1333 Bayshore Hwy',
    city: 'Burlingame',
    state: 'CA',
    lat: 37.5847,
    lng: -122.3656,
    month: 12,
    day: 5,
    durationDays: 2,
    admissionUsd: 8,
    vendorCount: 150,
    expectedAttendance: 5000,
    sports: ['Baseball', 'Basketball'],
    focusPlayers: ['Shohei Ohtani', 'Stephen Curry'],
    tableStyle: 'vintage',
    notes: 'West Coast vintage and modern singles.',
  },
  {
    id: 'orlando-florida',
    name: 'Florida Card & Memorabilia Show',
    venue: 'Orange County Convention Center',
    address: '9800 International Dr',
    city: 'Orlando',
    state: 'FL',
    lat: 28.4255,
    lng: -81.469,
    month: 1,
    day: 17,
    durationDays: 2,
    admissionUsd: 10,
    vendorCount: 200,
    expectedAttendance: 7000,
    sports: ['Baseball', 'Football', 'Basketball'],
    focusPlayers: [],
    tableStyle: 'mixed',
    notes: 'Florida regional. Wax and singles share the floor.',
  },
  {
    id: 'phoenix-vintage',
    name: 'Phoenix Vintage Sports Show',
    venue: 'Phoenix Convention Center',
    address: '100 N 3rd St',
    city: 'Phoenix',
    state: 'AZ',
    lat: 33.4484,
    lng: -112.074,
    month: 2,
    day: 7,
    durationDays: 2,
    admissionUsd: 8,
    vendorCount: 120,
    expectedAttendance: 3500,
    sports: ['Baseball', 'Basketball'],
    focusPlayers: [],
    tableStyle: 'vintage',
    notes: 'Vintage-leaning room. Modern wax is thin here.',
  },
  {
    id: 'atlanta-hobby',
    name: 'Atlanta Hobby Expo',
    venue: 'Georgia World Congress Center',
    address: '285 Andrew Young Intl Blvd NW',
    city: 'Atlanta',
    state: 'GA',
    lat: 33.758,
    lng: -84.3977,
    month: 2,
    day: 21,
    durationDays: 2,
    admissionUsd: 12,
    vendorCount: 220,
    expectedAttendance: 6500,
    sports: ['Football', 'Basketball'],
    focusPlayers: ['Lamar Jackson', 'Jayson Tatum'],
    tableStyle: 'graded',
    notes: 'Graded football and basketball tables.',
  },
  {
    id: 'seattle-northwest',
    name: 'Northwest Card Show',
    venue: 'Seattle Convention Center',
    address: '705 Pike St',
    city: 'Seattle',
    state: 'WA',
    lat: 47.6115,
    lng: -122.3316,
    month: 3,
    day: 14,
    durationDays: 2,
    admissionUsd: 10,
    vendorCount: 140,
    expectedAttendance: 4000,
    sports: ['Baseball', 'Football', 'Soccer'],
    focusPlayers: ['Julio Rodríguez'],
    tableStyle: 'singles',
    notes: 'Northwest singles, including a small soccer aisle.',
  },
  {
    id: 'houston-south',
    name: 'Houston Sports Card Convention',
    venue: 'George R. Brown Convention Center',
    address: '1001 Avenida De Las Americas',
    city: 'Houston',
    state: 'TX',
    lat: 29.752,
    lng: -95.3579,
    month: 3,
    day: 28,
    durationDays: 2,
    admissionUsd: 10,
    vendorCount: 180,
    expectedAttendance: 5500,
    sports: ['Baseball', 'Football'],
    focusPlayers: ['Jose Altuve', 'Patrick Mahomes'],
    tableStyle: 'mixed',
    notes: 'South regional. Strong baseball PC tables.',
  },
  {
    id: 'boston-monthly',
    name: 'Boston Card Night',
    venue: 'Boston Convention & Exhibition Center',
    address: '415 Summer St',
    city: 'Boston',
    state: 'MA',
    lat: 42.346,
    lng: -71.0456,
    month: 4,
    day: 11,
    durationDays: 1,
    admissionUsd: 5,
    vendorCount: 40,
    expectedAttendance: 900,
    sports: ['Baseball', 'Basketball', 'Hockey'],
    focusPlayers: ['Rafael Devers', 'Jayson Tatum'],
    tableStyle: 'singles',
    notes: 'One-night local show with a hockey aisle.',
  },
  {
    id: 'denver-mile-high',
    name: 'Mile High Card Show',
    venue: 'Colorado Convention Center',
    address: '700 14th St',
    city: 'Denver',
    state: 'CO',
    lat: 39.7436,
    lng: -104.996,
    month: 5,
    day: 2,
    durationDays: 2,
    admissionUsd: 8,
    vendorCount: 110,
    expectedAttendance: 3200,
    sports: ['Football', 'Basketball', 'Hockey'],
    focusPlayers: [],
    tableStyle: 'mixed',
    notes: 'Mountain regional. Football, basketball, and hockey.',
  },
  {
    id: 'minneapolis-north',
    name: 'Twin Cities Collectors Show',
    venue: 'Minneapolis Convention Center',
    address: '1301 2nd Ave S',
    city: 'Minneapolis',
    state: 'MN',
    lat: 44.97,
    lng: -93.2733,
    month: 5,
    day: 16,
    durationDays: 2,
    admissionUsd: 8,
    vendorCount: 130,
    expectedAttendance: 3800,
    sports: ['Hockey', 'Baseball', 'Football'],
    focusPlayers: ['Kirill Kaprizov'],
    tableStyle: 'singles',
    notes: 'Hockey-forward room with baseball singles.',
  },
  {
    id: 'san-diego-summer',
    name: 'San Diego Summer Card Fest',
    venue: 'San Diego Convention Center',
    address: '111 W Harbor Dr',
    city: 'San Diego',
    state: 'CA',
    lat: 32.7063,
    lng: -117.1611,
    month: 6,
    day: 6,
    durationDays: 2,
    admissionUsd: 10,
    vendorCount: 160,
    expectedAttendance: 4500,
    sports: ['Baseball', 'Soccer'],
    focusPlayers: ['Fernando Tatis Jr.'],
    tableStyle: 'wax',
    notes: 'Wax-heavy summer show with a soccer row.',
  },
  {
    id: 'indy-midwest',
    name: 'Midwest Sports Card Convention',
    venue: 'Indiana Convention Center',
    address: '100 S Capitol Ave',
    city: 'Indianapolis',
    state: 'IN',
    lat: 39.7643,
    lng: -86.1633,
    month: 6,
    day: 20,
    durationDays: 2,
    admissionUsd: 15,
    vendorCount: 400,
    expectedAttendance: 15000,
    sports: ['Baseball', 'Basketball', 'Football', 'Hockey'],
    focusPlayers: [],
    tableStyle: 'mixed',
    notes: 'Large Midwest convention. Worth the drive when the book has several gaps.',
  },
  {
    id: 'columbus-local',
    name: 'Columbus Sunday Card Show',
    venue: 'Greater Columbus Convention Center',
    address: '400 N High St',
    city: 'Columbus',
    state: 'OH',
    lat: 39.9712,
    lng: -82.999,
    month: 9,
    day: 13,
    durationDays: 1,
    admissionUsd: 5,
    vendorCount: 60,
    expectedAttendance: 1500,
    sports: ['Football', 'Baseball'],
    focusPlayers: [],
    tableStyle: 'singles',
    notes: 'Local Sunday show. Cheap admission, modest dealer count.',
  },
];

function utcMidnight(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day));
}

function todayUtc(now: Date): Date {
  return utcMidnight(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export function resolveLocalCardShow(show: LocalCardShow, now: Date): ResolvedLocalCardShow {
  const today = todayUtc(now);
  let year = today.getUTCFullYear();
  let start = utcMidnight(year, show.month - 1, show.day);
  let end = utcMidnight(year, show.month - 1, show.day + Math.max(1, show.durationDays) - 1);
  if (end.getTime() < today.getTime()) {
    year += 1;
    start = utcMidnight(year, show.month - 1, show.day);
    end = utcMidnight(year, show.month - 1, show.day + Math.max(1, show.durationDays) - 1);
  }
  const daysUntilStart = Math.round((start.getTime() - today.getTime()) / 86_400_000);
  return {
    ...show,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    status: daysUntilStart > 0 ? 'upcoming' : 'in-progress',
    daysUntilStart: Math.max(0, daysUntilStart),
    source: LOCAL_CARD_SHOW_SOURCE,
  };
}

export function listResolvedLocalCardShows(now: Date = new Date()): ResolvedLocalCardShow[] {
  return LOCAL_CARD_SHOW_CATALOG.map((show) => resolveLocalCardShow(show, now)).sort(
    (a, b) => a.daysUntilStart - b.daysUntilStart || a.city.localeCompare(b.city),
  );
}

/** Great-circle miles, rounded to 0.1. */
export function distanceMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const miles = 3958.8 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.round(miles * 10) / 10;
}

export function formatShowDateRange(show: Pick<ResolvedLocalCardShow, 'startDate' | 'endDate'>): string {
  const fmt = (iso: string) => {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };
  if (show.startDate === show.endDate) return fmt(show.startDate);
  return `${fmt(show.startDate)} – ${fmt(show.endDate)}`;
}
