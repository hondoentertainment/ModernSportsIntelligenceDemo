// ---- Types ----

export interface CardShow {
  id: string;
  name: string;
  city: string;
  state: string;
  venue: string;
  date: string;
  endDate: string;
  lat: number;
  lng: number;
  attendees: number;
  dealerCount: number;
  status: 'upcoming' | 'live' | 'completed';
}

export interface ShowInventoryItem {
  id: string;
  showId: string;
  player: string;
  cardDescription: string;
  askingPrice: number;
  estimatedMarketValue: number;
  boothNumber: string;
  reportedBy: string;
  reportedAt: string;
  verified: boolean;
  condition: 'raw' | 'graded';
}

export interface DealerBooth {
  id: string;
  showId: string;
  boothNumber: string;
  dealerName: string;
  specialty: string;
  rating: number;
  priceLevel: 'low' | 'fair' | 'high';
  willingToNegotiate: boolean;
  notes: string;
}

export interface DealAlert {
  id: string;
  showId: string;
  player: string;
  cardDescription: string;
  askingPrice: number;
  marketValue: number;
  discount: number;
  boothNumber: string;
  alertedAt: string;
  status: 'active' | 'sold' | 'expired';
}

export interface ShowReport {
  id: string;
  showId: string;
  reporter: string;
  reportedAt: string;
  crowdLevel: 'light' | 'moderate' | 'packed';
  overallPricing: 'below_market' | 'at_market' | 'above_market';
  bestFind: string;
  notes: string;
  rating: number;
}

// ---- Mock Data ----

const MOCK_SHOWS: CardShow[] = [
  {
    id: 'show-1', name: 'National Sports Collectors Convention', city: 'Cleveland', state: 'OH',
    venue: 'Huntington Convention Center', date: '2026-07-22', endDate: '2026-07-26',
    lat: 41.4993, lng: -81.6944, attendees: 45000, dealerCount: 800, status: 'upcoming',
  },
  {
    id: 'show-2', name: 'Dallas Card Show', city: 'Dallas', state: 'TX',
    venue: 'Dallas Market Hall', date: '2026-03-21', endDate: '2026-03-22',
    lat: 32.7937, lng: -96.8198, attendees: 6500, dealerCount: 220, status: 'upcoming',
  },
  {
    id: 'show-3', name: 'Chantilly Card Show', city: 'Chantilly', state: 'VA',
    venue: 'Dulles Expo Center', date: '2026-03-14', endDate: '2026-03-15',
    lat: 38.8628, lng: -77.4320, attendees: 4200, dealerCount: 180, status: 'live',
  },
  {
    id: 'show-4', name: 'Chicago Sun-Times Sports Collectibles Show', city: 'Rosemont', state: 'IL',
    venue: 'Donald E. Stephens Convention Center', date: '2026-04-11', endDate: '2026-04-12',
    lat: 41.9842, lng: -87.8634, attendees: 8000, dealerCount: 310, status: 'upcoming',
  },
];

const MOCK_INVENTORY: ShowInventoryItem[] = [
  { id: 'inv-1', showId: 'show-3', player: 'LeBron James', cardDescription: '2003 Topps Chrome #111 RC PSA 9', askingPrice: 18500, estimatedMarketValue: 22000, boothNumber: 'A-14', reportedBy: 'scout_mike', reportedAt: new Date(Date.now() - 30 * 60000).toISOString(), verified: true, condition: 'graded' },
  { id: 'inv-2', showId: 'show-3', player: 'Shohei Ohtani', cardDescription: '2018 Topps Update #US1 PSA 10', askingPrice: 310, estimatedMarketValue: 420, boothNumber: 'B-07', reportedBy: 'card_hunter99', reportedAt: new Date(Date.now() - 45 * 60000).toISOString(), verified: true, condition: 'graded' },
  { id: 'inv-3', showId: 'show-3', player: 'Victor Wembanyama', cardDescription: '2023 Prizm Silver #1 Raw', askingPrice: 275, estimatedMarketValue: 310, boothNumber: 'C-22', reportedBy: 'dmv_collector', reportedAt: new Date(Date.now() - 15 * 60000).toISOString(), verified: false, condition: 'raw' },
  { id: 'inv-4', showId: 'show-3', player: 'Mike Trout', cardDescription: '2011 Topps Update #US175 BGS 9.5', askingPrice: 1100, estimatedMarketValue: 1400, boothNumber: 'A-03', reportedBy: 'scout_mike', reportedAt: new Date(Date.now() - 60 * 60000).toISOString(), verified: true, condition: 'graded' },
  { id: 'inv-5', showId: 'show-3', player: 'Caitlin Clark', cardDescription: '2024 Prizm Base #101 RC Raw', askingPrice: 85, estimatedMarketValue: 95, boothNumber: 'D-11', reportedBy: 'va_flips', reportedAt: new Date(Date.now() - 10 * 60000).toISOString(), verified: false, condition: 'raw' },
  { id: 'inv-6', showId: 'show-3', player: 'Patrick Mahomes', cardDescription: '2017 Prizm #269 RC PSA 10', askingPrice: 4200, estimatedMarketValue: 4800, boothNumber: 'A-14', reportedBy: 'card_hunter99', reportedAt: new Date(Date.now() - 90 * 60000).toISOString(), verified: true, condition: 'graded' },
];

const MOCK_DEALERS: DealerBooth[] = [
  { id: 'dlr-1', showId: 'show-3', boothNumber: 'A-14', dealerName: 'Prestige Cards', specialty: 'High-end vintage & modern graded', rating: 4.8, priceLevel: 'fair', willingToNegotiate: true, notes: 'Large inventory of PSA 10s. Ask about bulk discounts on multi-card purchases.' },
  { id: 'dlr-2', showId: 'show-3', boothNumber: 'B-07', dealerName: 'Diamond Athletics', specialty: 'Baseball rookies & prospect autos', rating: 4.5, priceLevel: 'low', willingToNegotiate: true, notes: 'Prices below eBay comps. Accepts cash offers 10% below sticker.' },
  { id: 'dlr-3', showId: 'show-3', boothNumber: 'C-22', dealerName: 'Next Gen Collectibles', specialty: 'Modern basketball & football', rating: 3.9, priceLevel: 'high', willingToNegotiate: false, notes: 'Firm prices. Good selection of Wemby and Ant Edwards parallels.' },
  { id: 'dlr-4', showId: 'show-3', boothNumber: 'A-03', dealerName: 'Old School Sportscards', specialty: 'Vintage pre-1980 and HOF rookies', rating: 4.7, priceLevel: 'fair', willingToNegotiate: true, notes: 'Excellent vintage selection. Owner has 30+ years in the hobby.' },
  { id: 'dlr-5', showId: 'show-3', boothNumber: 'D-11', dealerName: 'Flip City Cards', specialty: 'Raw modern singles and breaks', rating: 3.5, priceLevel: 'low', willingToNegotiate: true, notes: 'Low prices but check condition carefully. Mixed raw lots available.' },
];

const MOCK_ALERTS: DealAlert[] = [
  { id: 'alert-1', showId: 'show-3', player: 'Shohei Ohtani', cardDescription: '2018 Topps Update #US1 PSA 10', askingPrice: 310, marketValue: 420, discount: 26.2, boothNumber: 'B-07', alertedAt: new Date(Date.now() - 45 * 60000).toISOString(), status: 'active' },
  { id: 'alert-2', showId: 'show-3', player: 'Mike Trout', cardDescription: '2011 Topps Update #US175 BGS 9.5', askingPrice: 1100, marketValue: 1400, discount: 21.4, boothNumber: 'A-03', alertedAt: new Date(Date.now() - 60 * 60000).toISOString(), status: 'active' },
  { id: 'alert-3', showId: 'show-3', player: 'Patrick Mahomes', cardDescription: '2017 Prizm #269 RC PSA 10', askingPrice: 4200, marketValue: 4800, discount: 12.5, boothNumber: 'A-14', alertedAt: new Date(Date.now() - 90 * 60000).toISOString(), status: 'sold' },
  { id: 'alert-4', showId: 'show-3', player: 'LeBron James', cardDescription: '2003 Topps Chrome #111 RC PSA 9', askingPrice: 18500, marketValue: 22000, discount: 15.9, boothNumber: 'A-14', alertedAt: new Date(Date.now() - 30 * 60000).toISOString(), status: 'active' },
];

const MOCK_REPORTS: ShowReport[] = [
  { id: 'rpt-1', showId: 'show-3', reporter: 'scout_mike', reportedAt: new Date(Date.now() - 120 * 60000).toISOString(), crowdLevel: 'moderate', overallPricing: 'below_market', bestFind: 'LeBron Topps Chrome RC PSA 9 for $18.5K (market $22K)', notes: 'Good deals in Aisle A. Vintage dealers pricing to move. Modern basketball booths overpriced.', rating: 4 },
  { id: 'rpt-2', showId: 'show-3', reporter: 'va_flips', reportedAt: new Date(Date.now() - 90 * 60000).toISOString(), crowdLevel: 'packed', overallPricing: 'at_market', bestFind: 'Ohtani Update PSA 10 for $310 at B-07', notes: 'Packed near the entrance. Back aisles less crowded with better deals. Parking lot is full.', rating: 3 },
  { id: 'rpt-3', showId: 'show-3', reporter: 'dmv_collector', reportedAt: new Date(Date.now() - 60 * 60000).toISOString(), crowdLevel: 'moderate', overallPricing: 'below_market', bestFind: 'Trout Update BGS 9.5 at A-03 for $1100', notes: 'Crowd thinning out in afternoon. Dealers more willing to negotiate. Good time to make offers.', rating: 4 },
];

// ---- Service Functions ----

export function getShows(): CardShow[] {
  return [...MOCK_SHOWS].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getInventory(showId?: string): ShowInventoryItem[] {
  const items = showId ? MOCK_INVENTORY.filter((i) => i.showId === showId) : MOCK_INVENTORY;
  return [...items].sort((a, b) => {
    const discountA = (a.estimatedMarketValue - a.askingPrice) / a.estimatedMarketValue;
    const discountB = (b.estimatedMarketValue - b.askingPrice) / b.estimatedMarketValue;
    return discountB - discountA;
  });
}

export function getDealers(showId?: string): DealerBooth[] {
  const dealers = showId ? MOCK_DEALERS.filter((d) => d.showId === showId) : MOCK_DEALERS;
  return [...dealers].sort((a, b) => b.rating - a.rating);
}

export function getDealAlerts(showId?: string): DealAlert[] {
  const alerts = showId ? MOCK_ALERTS.filter((a) => a.showId === showId) : MOCK_ALERTS;
  return [...alerts].filter((a) => a.status === 'active').sort((a, b) => b.discount - a.discount);
}

export function getShowReports(showId?: string): ShowReport[] {
  const reports = showId ? MOCK_REPORTS.filter((r) => r.showId === showId) : MOCK_REPORTS;
  return [...reports].sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
}

export default {
  getShows,
  getInventory,
  getDealers,
  getDealAlerts,
  getShowReports,
};
