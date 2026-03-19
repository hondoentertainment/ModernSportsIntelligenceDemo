// ============================================================
// Card Show GPS Navigator – Service Layer
// Feature #138: Booth-level card show intelligence
// ============================================================

// ---- Interfaces ----

export interface CardShow {
  id: string;
  name: string;
  venue: string;
  city: string;
  state: string;
  date: string;
  endDate: string;
  hours: string;
  admissionFee: number;
  totalBooths: number;
  expectedAttendance: number;
  floorRows: number;
  floorCols: number;
  description: string;
  isActive: boolean;
  imageUrl?: string;
}

export interface DealerProfile {
  id: string;
  name: string;
  rating: number;
  totalReviews: number;
  specialties: string[];
  yearsInBusiness: number;
  acceptsOffers: boolean;
  socialMedia?: string;
  verified: boolean;
}

export interface Booth {
  id: string;
  showId: string;
  dealer: DealerProfile;
  row: number;
  col: number;
  label: string;
  specialty: string;
  inventoryHighlights: string[];
  dealQualityScore: number;
  priceLevel: 'budget' | 'mid' | 'premium' | 'high-end';
  isOpen: boolean;
  lastVisitedCount: number;
  tags: string[];
}

export interface PriceSighting {
  id: string;
  showId: string;
  boothId: string;
  boothLabel: string;
  dealerName: string;
  cardName: string;
  cardYear: string;
  cardSet: string;
  condition: string;
  askingPrice: number;
  estimatedMarketValue: number;
  discountPercent: number;
  reportedBy: string;
  timestamp: number;
  verified: boolean;
  upvotes: number;
}

export interface WalkingRoute {
  id: string;
  name: string;
  stops: RouteStop[];
  totalDistanceMeters: number;
  estimatedMinutes: number;
  priorityScore: number;
  description: string;
}

export interface RouteStop {
  boothId: string;
  boothLabel: string;
  dealerName: string;
  order: number;
  reasonToVisit: string;
  estimatedBrowseMinutes: number;
  row: number;
  col: number;
}

export interface DealAlert {
  id: string;
  showId: string;
  boothId: string;
  boothLabel: string;
  dealerName: string;
  cardName: string;
  originalPrice: number;
  newPrice: number;
  dropPercent: number;
  alertType: 'price_drop' | 'flash_sale' | 'new_arrival' | 'last_one' | 'bundle_deal';
  message: string;
  timestamp: number;
  expiresAt: number | null;
  isActive: boolean;
}

export interface ShowMap {
  showId: string;
  rows: number;
  cols: number;
  booths: Booth[];
  entrances: { row: number; col: number; label: string }[];
  amenities: { row: number; col: number; label: string; type: string }[];
}

// ---- Dealer Profiles ----

const dealers: DealerProfile[] = [
  { id: 'd1', name: 'Vintage Kings', rating: 4.8, totalReviews: 312, specialties: ['Vintage', 'Pre-War'], yearsInBusiness: 22, acceptsOffers: true, verified: true },
  { id: 'd2', name: 'Rookie Rush Cards', rating: 4.5, totalReviews: 189, specialties: ['Rookies', 'Modern'], yearsInBusiness: 8, acceptsOffers: true, verified: true },
  { id: 'd3', name: 'Graded Gems LLC', rating: 4.9, totalReviews: 421, specialties: ['PSA Graded', 'BGS Graded'], yearsInBusiness: 15, acceptsOffers: false, verified: true },
  { id: 'd4', name: 'Budget Box Breaks', rating: 4.2, totalReviews: 98, specialties: ['Wax', 'Sealed Product'], yearsInBusiness: 5, acceptsOffers: true, verified: false },
  { id: 'd5', name: 'The Auto Zone', rating: 4.7, totalReviews: 256, specialties: ['Autographs', 'Memorabilia'], yearsInBusiness: 12, acceptsOffers: true, verified: true },
  { id: 'd6', name: 'Patch Palace', rating: 4.4, totalReviews: 134, specialties: ['Game-Used', 'Patches'], yearsInBusiness: 9, acceptsOffers: true, verified: true },
  { id: 'd7', name: 'Diamond Cuts Sports', rating: 4.6, totalReviews: 278, specialties: ['Baseball', 'Vintage'], yearsInBusiness: 18, acceptsOffers: true, verified: true },
  { id: 'd8', name: 'Hoop Dreams Cards', rating: 4.3, totalReviews: 167, specialties: ['Basketball', 'Modern'], yearsInBusiness: 6, acceptsOffers: true, verified: false },
  { id: 'd9', name: 'Gridiron Legends', rating: 4.5, totalReviews: 201, specialties: ['Football', 'Vintage'], yearsInBusiness: 14, acceptsOffers: true, verified: true },
  { id: 'd10', name: 'Wax Museum Sports', rating: 4.1, totalReviews: 87, specialties: ['Wax', 'Hobby Boxes'], yearsInBusiness: 4, acceptsOffers: false, verified: false },
  { id: 'd11', name: 'PC Paradise', rating: 4.8, totalReviews: 345, specialties: ['PC Lots', 'Team Sets'], yearsInBusiness: 11, acceptsOffers: true, verified: true },
  { id: 'd12', name: 'Mint Condition Sports', rating: 4.9, totalReviews: 390, specialties: ['High-End', 'Investment Grade'], yearsInBusiness: 20, acceptsOffers: false, verified: true },
  { id: 'd13', name: 'Pack Rat Comics & Cards', rating: 4.0, totalReviews: 65, specialties: ['Commons', 'Bulk Lots'], yearsInBusiness: 3, acceptsOffers: true, verified: false },
  { id: 'd14', name: 'Silver Streak Collectibles', rating: 4.6, totalReviews: 223, specialties: ['Refractors', 'Parallels'], yearsInBusiness: 10, acceptsOffers: true, verified: true },
  { id: 'd15', name: 'True Gem Authentication', rating: 4.7, totalReviews: 188, specialties: ['Authentication', 'Grading Submissions'], yearsInBusiness: 7, acceptsOffers: false, verified: true },
  { id: 'd16', name: 'Prospect Pipeline', rating: 4.4, totalReviews: 112, specialties: ['Prospects', 'Bowman'], yearsInBusiness: 5, acceptsOffers: true, verified: false },
  { id: 'd17', name: 'Old School Cardboard', rating: 4.8, totalReviews: 299, specialties: ['Pre-War', '1950s-60s'], yearsInBusiness: 25, acceptsOffers: true, verified: true },
  { id: 'd18', name: 'Modern Marvels Cards', rating: 4.3, totalReviews: 143, specialties: ['Panini', 'Topps Chrome'], yearsInBusiness: 6, acceptsOffers: true, verified: true },
];

// ---- Mock Shows ----

const shows: CardShow[] = [
  {
    id: 'show1',
    name: 'National Sports Collectors Convention',
    venue: 'Atlantic City Convention Center',
    city: 'Atlantic City',
    state: 'NJ',
    date: '2026-04-10',
    endDate: '2026-04-14',
    hours: '10:00 AM - 6:00 PM',
    admissionFee: 25,
    totalBooths: 18,
    expectedAttendance: 12000,
    floorRows: 6,
    floorCols: 4,
    description: 'The premier national sports card and memorabilia convention with 800+ dealer booths.',
    isActive: true,
  },
  {
    id: 'show2',
    name: 'Midwest Card Expo',
    venue: 'Rosemont Convention Center',
    city: 'Rosemont',
    state: 'IL',
    date: '2026-04-25',
    endDate: '2026-04-27',
    hours: '9:00 AM - 5:00 PM',
    admissionFee: 15,
    totalBooths: 16,
    expectedAttendance: 5000,
    floorRows: 5,
    floorCols: 4,
    description: 'The Midwest\'s largest regional card show featuring top dealers and exclusive releases.',
    isActive: false,
  },
  {
    id: 'show3',
    name: 'West Coast Sports Card Summit',
    venue: 'Los Angeles Convention Center',
    city: 'Los Angeles',
    state: 'CA',
    date: '2026-05-08',
    endDate: '2026-05-10',
    hours: '10:00 AM - 7:00 PM',
    admissionFee: 20,
    totalBooths: 17,
    expectedAttendance: 8000,
    floorRows: 5,
    floorCols: 4,
    description: 'West Coast\'s biggest card summit with celebrity signings and live breaks.',
    isActive: false,
  },
  {
    id: 'show4',
    name: 'Southern Card Classic',
    venue: 'Georgia World Congress Center',
    city: 'Atlanta',
    state: 'GA',
    date: '2026-06-05',
    endDate: '2026-06-07',
    hours: '10:00 AM - 5:00 PM',
    admissionFee: 10,
    totalBooths: 15,
    expectedAttendance: 3500,
    floorRows: 5,
    floorCols: 4,
    description: 'A growing regional show with excellent deals and a friendly community atmosphere.',
    isActive: false,
  },
];

// ---- Booth Generator ----

function generateBooths(show: CardShow): Booth[] {
  const specialtyColors: Record<string, string> = {
    Vintage: 'vintage',
    Modern: 'modern',
    Graded: 'graded',
    Wax: 'wax',
    Autographs: 'auto',
    'Game-Used': 'relic',
    Baseball: 'baseball',
    Basketball: 'basketball',
    Football: 'football',
    'High-End': 'highend',
    Bulk: 'bulk',
    Authentication: 'auth',
    Prospects: 'prospects',
    Refractors: 'refractors',
  };

  const boothAssignments: { dealerIdx: number; row: number; col: number; highlights: string[]; specialty: string; priceLevel: Booth['priceLevel']; tags: string[] }[] = [
    { dealerIdx: 0, row: 0, col: 0, highlights: ['1952 Topps Mickey Mantle PSA 3', '1969 Topps Reggie Jackson RC'], specialty: 'Vintage', priceLevel: 'high-end', tags: ['must-visit', 'vintage', 'investment'] },
    { dealerIdx: 1, row: 0, col: 1, highlights: ['2024 Bowman Chrome 1st Autos', 'Victor Wembanyama Prizm RC'], specialty: 'Modern', priceLevel: 'mid', tags: ['rookies', 'modern', 'hot-deals'] },
    { dealerIdx: 2, row: 0, col: 2, highlights: ['PSA 10 Jeter Rookie', 'BGS 9.5 LeBron Topps Chrome'], specialty: 'Graded', priceLevel: 'premium', tags: ['graded', 'investment', 'certified'] },
    { dealerIdx: 3, row: 0, col: 3, highlights: ['2024 Topps Series 1 Hobby Case', '2023 Panini Prizm Football Mega'], specialty: 'Wax', priceLevel: 'budget', tags: ['sealed', 'wax', 'breaks'] },
    { dealerIdx: 4, row: 1, col: 0, highlights: ['Mike Trout Signed Jersey', 'Patrick Mahomes Auto Helmet'], specialty: 'Autographs', priceLevel: 'premium', tags: ['autos', 'memorabilia', 'certified'] },
    { dealerIdx: 5, row: 1, col: 1, highlights: ['Ohtani Game-Used Bat Relic /25', 'LeBron Triple Patch Auto /10'], specialty: 'Game-Used', priceLevel: 'high-end', tags: ['relics', 'patches', 'game-used'] },
    { dealerIdx: 6, row: 1, col: 2, highlights: ['1956 Topps Roberto Clemente', '1961 Topps Roger Maris'], specialty: 'Baseball', priceLevel: 'premium', tags: ['baseball', 'vintage', 'HOF'] },
    { dealerIdx: 7, row: 1, col: 3, highlights: ['Luka Doncic Mosaic Prizm RC', 'Anthony Edwards Select RC'], specialty: 'Basketball', priceLevel: 'mid', tags: ['basketball', 'modern', 'rookies'] },
    { dealerIdx: 8, row: 2, col: 0, highlights: ['1986 Topps Jerry Rice RC PSA 8', 'Joe Montana Upper Deck Auto'], specialty: 'Football', priceLevel: 'premium', tags: ['football', 'vintage', 'HOF'] },
    { dealerIdx: 9, row: 2, col: 1, highlights: ['2024 Topps Hobby Box $89', '2023 Bowman Mega Box $35'], specialty: 'Wax', priceLevel: 'budget', tags: ['wax', 'deals', 'sealed'] },
    { dealerIdx: 10, row: 2, col: 2, highlights: ['Complete 1987 Topps Set', 'Aaron Judge PC Lot 50 Cards'], specialty: 'Bulk', priceLevel: 'budget', tags: ['bulk', 'sets', 'team-lots'] },
    { dealerIdx: 11, row: 2, col: 3, highlights: ['2023 National Treasures Mahomes /5', 'Wembanyama Flawless RPA /20'], specialty: 'High-End', priceLevel: 'high-end', tags: ['ultra-premium', 'investment', 'numbered'] },
    { dealerIdx: 12, row: 3, col: 0, highlights: ['$1 Card Bins', 'Team Lots Starting at $5'], specialty: 'Bulk', priceLevel: 'budget', tags: ['budget', 'commons', 'starter'] },
    { dealerIdx: 13, row: 3, col: 1, highlights: ['Topps Chrome Refractor Lot', '2024 Prizm Silver Collection'], specialty: 'Refractors', priceLevel: 'mid', tags: ['refractors', 'parallels', 'shiny'] },
    { dealerIdx: 14, row: 3, col: 2, highlights: ['On-Site PSA Grading $30/card', 'Bulk Submission Specials'], specialty: 'Authentication', priceLevel: 'mid', tags: ['grading', 'authentication', 'service'] },
    { dealerIdx: 15, row: 3, col: 3, highlights: ['2025 Bowman 1st Chrome Autos', 'Top 100 Prospect Lot'], specialty: 'Prospects', priceLevel: 'mid', tags: ['prospects', 'bowman', 'future-stars'] },
    { dealerIdx: 16, row: 4, col: 0, highlights: ['1909 T206 Honus Wagner (trimmed)', '1933 Goudey Babe Ruth #53'], specialty: 'Vintage', priceLevel: 'high-end', tags: ['pre-war', 'ultra-vintage', 'museum'] },
    { dealerIdx: 17, row: 4, col: 1, highlights: ['2024 Panini Select Hobby Box', 'Topps Chrome Update Mega'], specialty: 'Modern', priceLevel: 'mid', tags: ['modern', 'current-year', 'hot'] },
  ];

  const count = Math.min(show.totalBooths, boothAssignments.length);
  const booths: Booth[] = [];

  for (let i = 0; i < count; i++) {
    const a = boothAssignments[i];
    const dealer = dealers[a.dealerIdx];
    booths.push({
      id: `${show.id}-b${i + 1}`,
      showId: show.id,
      dealer,
      row: a.row,
      col: a.col,
      label: `${String.fromCharCode(65 + a.row)}${a.col + 1}`,
      specialty: a.specialty,
      inventoryHighlights: a.highlights,
      dealQualityScore: Math.round(60 + Math.random() * 35),
      priceLevel: a.priceLevel,
      isOpen: show.isActive ? Math.random() > 0.1 : true,
      lastVisitedCount: Math.floor(Math.random() * 200),
      tags: a.tags,
    });
  }

  return booths;
}

// ---- Cache booth data per show ----

const boothCache: Record<string, Booth[]> = {};

function getBoothsForShow(showId: string): Booth[] {
  if (!boothCache[showId]) {
    const show = shows.find((s) => s.id === showId);
    if (!show) return [];
    boothCache[showId] = generateBooths(show);
  }
  return boothCache[showId];
}

// ---- Price Sightings ----

const baseSightings: Omit<PriceSighting, 'id' | 'timestamp'>[] = [
  { showId: 'show1', boothId: 'show1-b1', boothLabel: 'A1', dealerName: 'Vintage Kings', cardName: 'Mickey Mantle', cardYear: '1952', cardSet: 'Topps', condition: 'PSA 3', askingPrice: 42000, estimatedMarketValue: 55000, discountPercent: 24, reportedBy: 'CardHunter99', verified: true, upvotes: 34 },
  { showId: 'show1', boothId: 'show1-b2', boothLabel: 'A2', dealerName: 'Rookie Rush Cards', cardName: 'Victor Wembanyama', cardYear: '2023', cardSet: 'Prizm Silver', condition: 'Raw NM', askingPrice: 280, estimatedMarketValue: 350, discountPercent: 20, reportedBy: 'WembyFan23', verified: true, upvotes: 18 },
  { showId: 'show1', boothId: 'show1-b3', boothLabel: 'A3', dealerName: 'Graded Gems LLC', cardName: 'Derek Jeter RC', cardYear: '1993', cardSet: 'SP', condition: 'PSA 10', askingPrice: 8500, estimatedMarketValue: 9200, discountPercent: 8, reportedBy: 'JeterFanNYC', verified: true, upvotes: 22 },
  { showId: 'show1', boothId: 'show1-b5', boothLabel: 'B1', dealerName: 'The Auto Zone', cardName: 'Mike Trout Auto', cardYear: '2011', cardSet: 'Topps Update', condition: 'PSA/DNA', askingPrice: 1200, estimatedMarketValue: 1500, discountPercent: 20, reportedBy: 'AngelsFan27', verified: true, upvotes: 15 },
  { showId: 'show1', boothId: 'show1-b6', boothLabel: 'B2', dealerName: 'Patch Palace', cardName: 'LeBron James Triple Patch', cardYear: '2020', cardSet: 'National Treasures', condition: '/10', askingPrice: 3800, estimatedMarketValue: 4500, discountPercent: 16, reportedBy: 'KingJames_PC', verified: false, upvotes: 9 },
  { showId: 'show1', boothId: 'show1-b7', boothLabel: 'B3', dealerName: 'Diamond Cuts Sports', cardName: 'Roberto Clemente', cardYear: '1956', cardSet: 'Topps', condition: 'PSA 5', askingPrice: 4200, estimatedMarketValue: 5000, discountPercent: 16, reportedBy: 'PittsburghCollector', verified: true, upvotes: 12 },
  { showId: 'show1', boothId: 'show1-b8', boothLabel: 'B4', dealerName: 'Hoop Dreams Cards', cardName: 'Luka Doncic Mosaic', cardYear: '2018', cardSet: 'Panini Mosaic', condition: 'PSA 10', askingPrice: 750, estimatedMarketValue: 900, discountPercent: 17, reportedBy: 'MavsFanatic', verified: true, upvotes: 20 },
  { showId: 'show1', boothId: 'show1-b9', boothLabel: 'C1', dealerName: 'Gridiron Legends', cardName: 'Jerry Rice RC', cardYear: '1986', cardSet: 'Topps', condition: 'PSA 8', askingPrice: 320, estimatedMarketValue: 400, discountPercent: 20, reportedBy: '49erGold', verified: true, upvotes: 11 },
  { showId: 'show1', boothId: 'show1-b10', boothLabel: 'C2', dealerName: 'Wax Museum Sports', cardName: 'Topps Hobby Box', cardYear: '2024', cardSet: 'Topps Series 1', condition: 'Sealed', askingPrice: 85, estimatedMarketValue: 110, discountPercent: 23, reportedBy: 'WaxRipper', verified: false, upvotes: 7 },
  { showId: 'show1', boothId: 'show1-b11', boothLabel: 'C3', dealerName: 'PC Paradise', cardName: 'Aaron Judge PC Lot', cardYear: 'Mixed', cardSet: 'Various', condition: 'NM-MT', askingPrice: 150, estimatedMarketValue: 220, discountPercent: 32, reportedBy: 'YankeesFan99', verified: true, upvotes: 25 },
  { showId: 'show1', boothId: 'show1-b12', boothLabel: 'C4', dealerName: 'Mint Condition Sports', cardName: 'Wembanyama Flawless RPA', cardYear: '2023', cardSet: 'Panini Flawless', condition: '/20', askingPrice: 12000, estimatedMarketValue: 15000, discountPercent: 20, reportedBy: 'HighEndHunter', verified: true, upvotes: 31 },
  { showId: 'show1', boothId: 'show1-b13', boothLabel: 'D1', dealerName: 'Pack Rat Comics & Cards', cardName: 'Bulk Lot 500 Cards', cardYear: 'Mixed', cardSet: 'Various', condition: 'Mixed', askingPrice: 15, estimatedMarketValue: 25, discountPercent: 40, reportedBy: 'BargainBin', verified: false, upvotes: 4 },
  { showId: 'show1', boothId: 'show1-b14', boothLabel: 'D2', dealerName: 'Silver Streak Collectibles', cardName: 'Ohtani Prizm Silver', cardYear: '2018', cardSet: 'Panini Prizm', condition: 'PSA 10', askingPrice: 2200, estimatedMarketValue: 2800, discountPercent: 21, reportedBy: 'OhtaniSZN', verified: true, upvotes: 19 },
  { showId: 'show1', boothId: 'show1-b15', boothLabel: 'D3', dealerName: 'True Gem Authentication', cardName: 'Grading Special', cardYear: 'N/A', cardSet: 'Service', condition: 'N/A', askingPrice: 30, estimatedMarketValue: 50, discountPercent: 40, reportedBy: 'GradeMyCards', verified: true, upvotes: 14 },
  { showId: 'show1', boothId: 'show1-b16', boothLabel: 'D4', dealerName: 'Prospect Pipeline', cardName: 'Top Prospect Auto Lot', cardYear: '2025', cardSet: 'Bowman Chrome', condition: 'Raw', askingPrice: 500, estimatedMarketValue: 650, discountPercent: 23, reportedBy: 'FutureStar', verified: false, upvotes: 8 },
  { showId: 'show1', boothId: 'show1-b17', boothLabel: 'E1', dealerName: 'Old School Cardboard', cardName: 'T206 Honus Wagner', cardYear: '1909', cardSet: 'T206', condition: 'Trimmed', askingPrice: 185000, estimatedMarketValue: 250000, discountPercent: 26, reportedBy: 'PreWarKing', verified: true, upvotes: 45 },
  { showId: 'show1', boothId: 'show1-b18', boothLabel: 'E2', dealerName: 'Modern Marvels Cards', cardName: 'Caleb Williams Prizm RC', cardYear: '2024', cardSet: 'Panini Prizm', condition: 'Raw Mint', askingPrice: 95, estimatedMarketValue: 130, discountPercent: 27, reportedBy: 'BearDown', verified: true, upvotes: 16 },
  { showId: 'show1', boothId: 'show1-b1', boothLabel: 'A1', dealerName: 'Vintage Kings', cardName: 'Reggie Jackson RC', cardYear: '1969', cardSet: 'Topps', condition: 'PSA 6', askingPrice: 650, estimatedMarketValue: 800, discountPercent: 19, reportedBy: 'MrOctober', verified: true, upvotes: 10 },
  { showId: 'show1', boothId: 'show1-b3', boothLabel: 'A3', dealerName: 'Graded Gems LLC', cardName: 'LeBron James RC', cardYear: '2003', cardSet: 'Topps Chrome', condition: 'BGS 9.5', askingPrice: 28000, estimatedMarketValue: 32000, discountPercent: 13, reportedBy: 'ChromeChaser', verified: true, upvotes: 28 },
  { showId: 'show1', boothId: 'show1-b4', boothLabel: 'A4', dealerName: 'Budget Box Breaks', cardName: 'Prizm Football Mega', cardYear: '2023', cardSet: 'Panini Prizm', condition: 'Sealed', askingPrice: 55, estimatedMarketValue: 70, discountPercent: 21, reportedBy: 'BoxBreaker', verified: false, upvotes: 6 },
  { showId: 'show1', boothId: 'show1-b12', boothLabel: 'C4', dealerName: 'Mint Condition Sports', cardName: 'Mahomes National Treasures', cardYear: '2023', cardSet: 'National Treasures', condition: '/5', askingPrice: 18500, estimatedMarketValue: 22000, discountPercent: 16, reportedBy: 'ChiefsKingdom', verified: true, upvotes: 27 },
  { showId: 'show1', boothId: 'show1-b8', boothLabel: 'B4', dealerName: 'Hoop Dreams Cards', cardName: 'Anthony Edwards Select RC', cardYear: '2020', cardSet: 'Panini Select', condition: 'PSA 10', askingPrice: 420, estimatedMarketValue: 520, discountPercent: 19, reportedBy: 'AntMan_PC', verified: true, upvotes: 13 },
  { showId: 'show1', boothId: 'show1-b7', boothLabel: 'B3', dealerName: 'Diamond Cuts Sports', cardName: 'Roger Maris', cardYear: '1961', cardSet: 'Topps', condition: 'PSA 4', askingPrice: 1800, estimatedMarketValue: 2200, discountPercent: 18, reportedBy: 'MarisChaser', verified: true, upvotes: 9 },
];

function generateSightings(): PriceSighting[] {
  const now = Date.now();
  return baseSightings.map((s, i) => ({
    ...s,
    id: `sight-${i + 1}`,
    timestamp: now - Math.floor(Math.random() * 3600000 * 4),
  }));
}

// ---- Deal Alerts ----

function generateDealAlerts(showId: string): DealAlert[] {
  const now = Date.now();
  return [
    { id: 'deal1', showId, boothId: `${showId}-b1`, boothLabel: 'A1', dealerName: 'Vintage Kings', cardName: '1969 Topps Reggie Jackson RC', originalPrice: 800, newPrice: 650, dropPercent: 19, alertType: 'price_drop', message: 'Price reduced! Reggie Jackson RC dropped from $800 to $650 at Vintage Kings.', timestamp: now - 600000, expiresAt: null, isActive: true },
    { id: 'deal2', showId, boothId: `${showId}-b4`, boothLabel: 'A4', dealerName: 'Budget Box Breaks', cardName: 'All Sealed Wax', originalPrice: 0, newPrice: 0, dropPercent: 25, alertType: 'flash_sale', message: '25% OFF all sealed wax at Budget Box Breaks until 2 PM!', timestamp: now - 1200000, expiresAt: now + 3600000, isActive: true },
    { id: 'deal3', showId, boothId: `${showId}-b12`, boothLabel: 'C4', dealerName: 'Mint Condition Sports', cardName: 'Wembanyama Flawless RPA /20', originalPrice: 15000, newPrice: 12000, dropPercent: 20, alertType: 'price_drop', message: 'Major drop! Wembanyama Flawless RPA now $12,000 (was $15K) at Mint Condition Sports.', timestamp: now - 300000, expiresAt: null, isActive: true },
    { id: 'deal4', showId, boothId: `${showId}-b14`, boothLabel: 'D2', dealerName: 'Silver Streak Collectibles', cardName: 'Ohtani Prizm Silver PSA 10', originalPrice: 2800, newPrice: 2200, dropPercent: 21, alertType: 'price_drop', message: 'Ohtani Prizm Silver PSA 10 reduced to $2,200 at Silver Streak. Below market!', timestamp: now - 900000, expiresAt: null, isActive: true },
    { id: 'deal5', showId, boothId: `${showId}-b13`, boothLabel: 'D1', dealerName: 'Pack Rat Comics & Cards', cardName: 'Everything in $1 Bins', originalPrice: 0, newPrice: 0, dropPercent: 50, alertType: 'flash_sale', message: '$1 bin blowout at Pack Rat! Everything must go — last day of the show.', timestamp: now - 1800000, expiresAt: now + 7200000, isActive: true },
    { id: 'deal6', showId, boothId: `${showId}-b5`, boothLabel: 'B1', dealerName: 'The Auto Zone', cardName: 'Mike Trout Signed Jersey', originalPrice: 1500, newPrice: 1200, dropPercent: 20, alertType: 'last_one', message: 'Last one! Mike Trout signed jersey now $1,200. Won\'t last long.', timestamp: now - 180000, expiresAt: null, isActive: true },
    { id: 'deal7', showId, boothId: `${showId}-b11`, boothLabel: 'C3', dealerName: 'PC Paradise', cardName: 'Buy 3 PC Lots, Get 1 Free', originalPrice: 0, newPrice: 0, dropPercent: 25, alertType: 'bundle_deal', message: 'Bundle deal at PC Paradise! Buy any 3 PC lots and get the 4th free.', timestamp: now - 2400000, expiresAt: now + 10800000, isActive: true },
    { id: 'deal8', showId, boothId: `${showId}-b2`, boothLabel: 'A2', dealerName: 'Rookie Rush Cards', cardName: 'Caleb Williams Prizm Auto', originalPrice: 0, newPrice: 450, dropPercent: 0, alertType: 'new_arrival', message: 'New arrival! Caleb Williams Prizm Auto just added at Rookie Rush — $450.', timestamp: now - 120000, expiresAt: null, isActive: true },
    { id: 'deal9', showId, boothId: `${showId}-b17`, boothLabel: 'E1', dealerName: 'Old School Cardboard', cardName: '1933 Goudey Babe Ruth #53', originalPrice: 35000, newPrice: 29000, dropPercent: 17, alertType: 'price_drop', message: 'Babe Ruth Goudey dropped to $29K from $35K at Old School Cardboard!', timestamp: now - 60000, expiresAt: null, isActive: true },
    { id: 'deal10', showId, boothId: `${showId}-b15`, boothLabel: 'D3', dealerName: 'True Gem Authentication', cardName: 'Grading Special', originalPrice: 50, newPrice: 25, dropPercent: 50, alertType: 'flash_sale', message: 'Half-price grading! True Gem offering $25/card submissions for the next 2 hours.', timestamp: now - 30000, expiresAt: now + 7200000, isActive: true },
  ];
}

// ---- Route Generator ----

function generateRoute(showId: string, priorities: string[]): WalkingRoute {
  const booths = getBoothsForShow(showId);
  const prioritySet = new Set(priorities.map((p) => p.toLowerCase()));

  const scored = booths.map((b) => {
    let score = b.dealQualityScore;
    const tags = b.tags.map((t) => t.toLowerCase());
    const specialtyLower = b.specialty.toLowerCase();
    if (prioritySet.has(specialtyLower) || tags.some((t) => prioritySet.has(t))) {
      score += 40;
    }
    if (b.priceLevel === 'budget') score += 10;
    if (b.dealer.acceptsOffers) score += 5;
    if (b.dealer.rating >= 4.7) score += 10;
    return { booth: b, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Simple nearest-neighbor route from entrance
  const ordered: typeof scored = [];
  const remaining = [...scored];
  let currentRow = -1;
  let currentCol = 0;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const dist =
        Math.abs(remaining[i].booth.row - currentRow) +
        Math.abs(remaining[i].booth.col - currentCol) -
        remaining[i].score * 0.02;
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    const chosen = remaining.splice(bestIdx, 1)[0];
    ordered.push(chosen);
    currentRow = chosen.booth.row;
    currentCol = chosen.booth.col;
  }

  const stops: RouteStop[] = ordered.map((item, i) => ({
    boothId: item.booth.id,
    boothLabel: item.booth.label,
    dealerName: item.booth.dealer.name,
    order: i + 1,
    reasonToVisit: item.score >= 90
      ? 'High-priority match for your want-list'
      : item.score >= 70
        ? 'Strong deals and good inventory'
        : 'Worth a quick browse',
    estimatedBrowseMinutes: item.score >= 90 ? 15 : item.score >= 70 ? 8 : 4,
    row: item.booth.row,
    col: item.booth.col,
  }));

  const totalBrowse = stops.reduce((sum, s) => sum + s.estimatedBrowseMinutes, 0);
  const walkingMinutes = stops.length * 2;

  return {
    id: `route-${showId}-${Date.now()}`,
    name: priorities.length > 0 ? `Optimized for: ${priorities.join(', ')}` : 'General Tour',
    stops,
    totalDistanceMeters: stops.length * 25,
    estimatedMinutes: totalBrowse + walkingMinutes,
    priorityScore: ordered.reduce((sum, s) => sum + s.score, 0),
    description: `Visit ${stops.length} booths in an optimized walking order. Estimated ${totalBrowse + walkingMinutes} minutes total.`,
  };
}

// ---- Public API ----

export function getUpcomingShows(): CardShow[] {
  return shows;
}

export function getShowMap(showId: string): ShowMap {
  const show = shows.find((s) => s.id === showId);
  if (!show) {
    return { showId, rows: 0, cols: 0, booths: [], entrances: [], amenities: [] };
  }
  return {
    showId,
    rows: show.floorRows,
    cols: show.floorCols,
    booths: getBoothsForShow(showId),
    entrances: [
      { row: -1, col: 1, label: 'Main Entrance' },
      { row: show.floorRows, col: 2, label: 'Side Entrance' },
    ],
    amenities: [
      { row: 0, col: show.floorCols, label: 'Restrooms', type: 'restroom' },
      { row: 2, col: show.floorCols, label: 'Food Court', type: 'food' },
      { row: 4, col: show.floorCols, label: 'ATM', type: 'atm' },
    ],
  };
}

export function getOptimalRoute(showId: string, priorities?: string[]): WalkingRoute {
  return generateRoute(showId, priorities ?? []);
}

export function getPriceSightings(showId: string): PriceSighting[] {
  return generateSightings().filter((s) => s.showId === showId);
}

export function getDealAlerts(showId: string): DealAlert[] {
  return generateDealAlerts(showId);
}

export function getBoothDetails(showId: string, boothId: string): Booth | null {
  const booths = getBoothsForShow(showId);
  return booths.find((b) => b.id === boothId) ?? null;
}

export function getAllBooths(showId: string): Booth[] {
  return getBoothsForShow(showId);
}

export function getSpecialtyColor(specialty: string): string {
  const colorMap: Record<string, string> = {
    Vintage: '#f59e0b',
    Modern: '#3b82f6',
    Graded: '#8b5cf6',
    Wax: '#ef4444',
    Autographs: '#10b981',
    'Game-Used': '#ec4899',
    Baseball: '#f97316',
    Basketball: '#06b6d4',
    Football: '#84cc16',
    'High-End': '#eab308',
    Bulk: '#6b7280',
    Authentication: '#14b8a6',
    Prospects: '#a855f7',
    Refractors: '#64748b',
  };
  return colorMap[specialty] ?? '#94a3b8';
}

export function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${value.toLocaleString()}`;
  }
  return `$${value}`;
}

export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function getAlertTypeLabel(type: DealAlert['alertType']): string {
  const labels: Record<DealAlert['alertType'], string> = {
    price_drop: 'Price Drop',
    flash_sale: 'Flash Sale',
    new_arrival: 'New Arrival',
    last_one: 'Last One!',
    bundle_deal: 'Bundle Deal',
  };
  return labels[type];
}

export function getAlertTypeColor(type: DealAlert['alertType']): string {
  const colors: Record<DealAlert['alertType'], string> = {
    price_drop: 'text-red-400',
    flash_sale: 'text-amber-400',
    new_arrival: 'text-emerald-400',
    last_one: 'text-rose-400',
    bundle_deal: 'text-cyan-400',
  };
  return colors[type];
}
