// Card Show Navigator Service — show discovery, routing, and dealer booth info

export interface CardShow {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  startDate: string;
  endDate: string;
  dealers: number;
  attendance: number;
  tier: 'national' | 'regional' | 'local';
  highlights: string[];
  distance: number;
  entryFee: number;
  rating: number;
}

export interface DealerBooth {
  id: string;
  showId: string;
  dealerName: string;
  boothNumber: string;
  specialties: string[];
  rating: number;
  inventoryHighlights: string[];
  priceLevel: 'budget' | 'mid' | 'premium' | 'ultra-premium';
  acceptsOffers: boolean;
  hasGradedCards: boolean;
}

export function getShows(): CardShow[] {
  return [
    { id: 'cs-1', name: 'The National Sports Collectors Convention', location: 'Atlantic City Convention Center', city: 'Atlantic City', state: 'NJ', startDate: '2026-07-22', endDate: '2026-07-26', dealers: 800, attendance: 100000, tier: 'national', highlights: ['VIP signings', 'Corporate booths', 'Breaks pavilion'], distance: 45, entryFee: 25, rating: 4.8 },
    { id: 'cs-2', name: 'Dallas Card Show', location: 'Dallas Market Hall', city: 'Dallas', state: 'TX', startDate: '2026-04-10', endDate: '2026-04-12', dealers: 350, attendance: 25000, tier: 'regional', highlights: ['Vintage alley', 'Grading on-site'], distance: 820, entryFee: 10, rating: 4.5 },
    { id: 'cs-3', name: 'Chantilly Card Show', location: 'Dulles Expo Center', city: 'Chantilly', state: 'VA', startDate: '2026-03-28', endDate: '2026-03-29', dealers: 200, attendance: 8000, tier: 'regional', highlights: ['Wax boxes', 'Estate collections'], distance: 120, entryFee: 8, rating: 4.2 },
    { id: 'cs-4', name: 'Monthly Collectors Meet', location: 'Holiday Inn Ballroom', city: 'Philadelphia', state: 'PA', startDate: '2026-03-21', endDate: '2026-03-21', dealers: 40, attendance: 500, tier: 'local', highlights: ['Bargain bins', 'Trade tables'], distance: 12, entryFee: 3, rating: 3.8 },
    { id: 'cs-5', name: 'Chicago Sports Spectacular', location: 'Donald E. Stephens Center', city: 'Rosemont', state: 'IL', startDate: '2026-05-15', endDate: '2026-05-17', dealers: 450, attendance: 35000, tier: 'regional', highlights: ['Jordan memorabilia', 'Free PSA raffle'], distance: 680, entryFee: 15, rating: 4.6 },
  ];
}

export function getDealerBooths(): DealerBooth[] {
  return [
    { id: 'db-1', showId: 'cs-1', dealerName: 'Vintage Kings', boothNumber: 'A-101', specialties: ['Pre-war', '1950s Topps', 'Mantle'], rating: 4.9, inventoryHighlights: ['1952 Topps lot', 'T206 commons'], priceLevel: 'ultra-premium', acceptsOffers: true, hasGradedCards: true },
    { id: 'db-2', showId: 'cs-1', dealerName: 'Chrome City Cards', boothNumber: 'B-215', specialties: ['Modern Chrome', 'Prizm', 'Select'], rating: 4.3, inventoryHighlights: ['2023 Prizm cases', 'Wemby RCs'], priceLevel: 'mid', acceptsOffers: true, hasGradedCards: true },
    { id: 'db-3', showId: 'cs-1', dealerName: 'Slab Warehouse', boothNumber: 'C-330', specialties: ['PSA 10 inventory', 'BGS 9.5 inventory'], rating: 4.6, inventoryHighlights: ['500+ PSA 10 RCs', 'Bulk deals'], priceLevel: 'premium', acceptsOffers: false, hasGradedCards: true },
    { id: 'db-4', showId: 'cs-2', dealerName: 'Texas Card Ranch', boothNumber: '12', specialties: ['Football', 'Cowboys memorabilia'], rating: 4.1, inventoryHighlights: ['Aikman collection', 'Prescott RCs'], priceLevel: 'mid', acceptsOffers: true, hasGradedCards: true },
    { id: 'db-5', showId: 'cs-3', dealerName: 'Beltway Breaks', boothNumber: '45', specialties: ['Breaks', 'Sealed wax'], rating: 3.9, inventoryHighlights: ['Hobby boxes', 'Group break signups'], priceLevel: 'budget', acceptsOffers: false, hasGradedCards: false },
    { id: 'db-6', showId: 'cs-4', dealerName: 'Philly Flips', boothNumber: '8', specialties: ['Eagles cards', 'Phillies vintage'], rating: 4.0, inventoryHighlights: ['Jalen Hurts RCs', 'Schmidt RCs'], priceLevel: 'budget', acceptsOffers: true, hasGradedCards: true },
  ];
}
