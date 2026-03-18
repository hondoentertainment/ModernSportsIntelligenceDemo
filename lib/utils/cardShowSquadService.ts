// ---- Types ----

export type ShowStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';
export type CheckInStatus = 'en-route' | 'on-floor' | 'at-booth' | 'break' | 'departed';
export type MemberAssignment = 'scout' | 'buyer' | 'seller' | 'photographer' | 'general';

export interface ShowVendor {
  id: string;
  name: string;
  boothNumber: string;
  rating: number;
  specialties: string[];
  priceRating: 'cheap' | 'fair' | 'premium';
  notes: string;
  visitedBy: string[];
}

export interface SquadMember {
  userId: string;
  handle: string;
  role: MemberAssignment;
  checkInStatus: CheckInStatus;
  wantListItems: number;
  foundItems: number;
  spent: number;
  lastCheckIn: string;
  location: string;
}

export interface HaulItem {
  id: string;
  memberHandle: string;
  cardName: string;
  price: number;
  estimatedValue: number;
  vendor: string;
  timestamp: string;
  isHighlight: boolean;
  photo: string | null;
}

export interface CardShow {
  id: string;
  name: string;
  venue: string;
  city: string;
  state: string;
  date: string;
  endDate: string;
  status: ShowStatus;
  squadSize: number;
  members: SquadMember[];
  vendors: ShowVendor[];
  haul: HaulItem[];
  totalSquadSpend: number;
  totalHaulValue: number;
  wantListHitRate: number;
  squadScore: number;
}

export interface CardShowStats {
  showsAttended: number;
  totalSquadSpend: number;
  totalHaulValue: number;
  avgROI: number;
  bestFind: string;
  wantListCompletionRate: number;
  vendorsRated: number;
  upcomingShows: number;
}

// ---- Color Helpers ----

export function getCheckInColor(status: CheckInStatus): string {
  switch (status) {
    case 'en-route':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'on-floor':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'at-booth':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'break':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'departed':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

export function getShowStatusColor(status: ShowStatus): string {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'live':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'completed':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    case 'cancelled':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

// ---- Helper ----

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export { formatCurrency };

// ---- Mock Data ----

const MOCK_SHOWS: CardShow[] = [
  {
    id: 'show-national-2026',
    name: '2026 National Sports Collectors Convention',
    venue: 'Atlantic City Convention Center',
    city: 'Atlantic City',
    state: 'NJ',
    date: '2026-07-29',
    endDate: '2026-08-02',
    status: 'upcoming',
    squadSize: 5,
    members: [
      {
        userId: 'u1',
        handle: 'CardKingMike',
        role: 'buyer',
        checkInStatus: 'en-route',
        wantListItems: 18,
        foundItems: 0,
        spent: 0,
        lastCheckIn: '2026-07-29T06:30:00Z',
        location: 'Driving — ETA 2hrs',
      },
      {
        userId: 'u2',
        handle: 'WaxRipperJen',
        role: 'scout',
        checkInStatus: 'en-route',
        wantListItems: 12,
        foundItems: 0,
        spent: 0,
        lastCheckIn: '2026-07-29T07:00:00Z',
        location: 'On the train from NYC',
      },
      {
        userId: 'u3',
        handle: 'PatchAutoTony',
        role: 'seller',
        checkInStatus: 'en-route',
        wantListItems: 6,
        foundItems: 0,
        spent: 0,
        lastCheckIn: '2026-07-29T06:45:00Z',
        location: 'Hotel lobby — packing inventory',
      },
      {
        userId: 'u4',
        handle: 'GradeGuru99',
        role: 'photographer',
        checkInStatus: 'en-route',
        wantListItems: 9,
        foundItems: 0,
        spent: 0,
        lastCheckIn: '2026-07-29T07:15:00Z',
        location: 'Parking garage at venue',
      },
      {
        userId: 'u5',
        handle: 'RookieHunterSam',
        role: 'general',
        checkInStatus: 'en-route',
        wantListItems: 14,
        foundItems: 0,
        spent: 0,
        lastCheckIn: '2026-07-29T05:00:00Z',
        location: 'Flight landing at 9am',
      },
    ],
    vendors: [
      {
        id: 'v1',
        name: 'Blowout Cards',
        boothNumber: 'A-101',
        rating: 4.8,
        specialties: ['Sealed Wax', 'Hobby Boxes', 'Breaks'],
        priceRating: 'fair',
        notes: 'Best prices on sealed product at The National. Go early.',
        visitedBy: [],
      },
      {
        id: 'v2',
        name: 'Burbank Sportscards',
        boothNumber: 'B-220',
        rating: 4.5,
        specialties: ['Vintage', 'Pre-War', 'Graded HOF'],
        priceRating: 'premium',
        notes: 'High-end vintage showcase. Good for photography.',
        visitedBy: [],
      },
      {
        id: 'v3',
        name: 'Steel City Collectibles',
        boothNumber: 'C-314',
        rating: 4.6,
        specialties: ['Modern Singles', 'Autos', 'Patches'],
        priceRating: 'fair',
        notes: 'Great for modern RCs and autos. Negotiate on bulk.',
        visitedBy: [],
      },
      {
        id: 'v4',
        name: "Dave's Vintage Cards",
        boothNumber: 'D-105',
        rating: 4.2,
        specialties: ['1950s-1970s', 'Commons', 'Set Builds'],
        priceRating: 'cheap',
        notes: 'Dollar bins and nickel boxes — great for set builders.',
        visitedBy: [],
      },
      {
        id: 'v5',
        name: 'PWCC Marketplace',
        boothNumber: 'A-300',
        rating: 4.9,
        specialties: ['Consignment', 'High-End', 'Investment Grade'],
        priceRating: 'premium',
        notes: 'Auction preview items on display. Photo-ops with big cards.',
        visitedBy: [],
      },
    ],
    haul: [],
    totalSquadSpend: 0,
    totalHaulValue: 0,
    wantListHitRate: 0,
    squadScore: 0,
  },
  {
    id: 'show-regional-midwest',
    name: 'Midwest Sports Card Expo',
    venue: 'Schaumburg Convention Center',
    city: 'Schaumburg',
    state: 'IL',
    date: '2026-03-15',
    endDate: '2026-03-16',
    status: 'live',
    squadSize: 4,
    members: [
      {
        userId: 'u1',
        handle: 'CardKingMike',
        role: 'buyer',
        checkInStatus: 'at-booth',
        wantListItems: 12,
        foundItems: 5,
        spent: 847.5,
        lastCheckIn: '2026-03-15T14:22:00Z',
        location: 'Booth F-112 — checking vintage Mantles',
      },
      {
        userId: 'u2',
        handle: 'WaxRipperJen',
        role: 'scout',
        checkInStatus: 'on-floor',
        wantListItems: 8,
        foundItems: 3,
        spent: 215.0,
        lastCheckIn: '2026-03-15T14:35:00Z',
        location: 'Row G — found cheap Griffey RCs, texting squad',
      },
      {
        userId: 'u6',
        handle: 'SlabMasterDave',
        role: 'buyer',
        checkInStatus: 'break',
        wantListItems: 10,
        foundItems: 4,
        spent: 1320.0,
        lastCheckIn: '2026-03-15T14:10:00Z',
        location: 'Food court — grabbing lunch',
      },
      {
        userId: 'u4',
        handle: 'GradeGuru99',
        role: 'photographer',
        checkInStatus: 'on-floor',
        wantListItems: 6,
        foundItems: 2,
        spent: 175.0,
        lastCheckIn: '2026-03-15T14:40:00Z',
        location: 'Shooting pics at PSA booth for group post',
      },
    ],
    vendors: [
      {
        id: 'v6',
        name: 'Chi-Town Cards',
        boothNumber: 'A-15',
        rating: 4.3,
        specialties: ['Modern Basketball', 'Football Rookies', 'Autos'],
        priceRating: 'fair',
        notes: 'Good Luka and Wemby selection. Prices negotiable end of day.',
        visitedBy: ['CardKingMike', 'WaxRipperJen'],
      },
      {
        id: 'v7',
        name: 'Midwest Vintage Co.',
        boothNumber: 'B-08',
        rating: 4.7,
        specialties: ['Vintage Baseball', '1960s Topps', 'Mantle', 'Aaron'],
        priceRating: 'fair',
        notes: 'Excellent 1965 Topps lot. CardKingMike grabbed a Mantle PSA 5.',
        visitedBy: ['CardKingMike', 'SlabMasterDave'],
      },
      {
        id: 'v8',
        name: 'Dollar Bin Danny',
        boothNumber: 'F-22',
        rating: 3.9,
        specialties: ['Bargain Lots', 'Commons', 'Junk Wax'],
        priceRating: 'cheap',
        notes: 'Hidden gems in the dollar bins. Jen found a Griffey RC for $1.',
        visitedBy: ['WaxRipperJen'],
      },
      {
        id: 'v9',
        name: 'Pristine Grading Services',
        boothNumber: 'C-01',
        rating: 4.1,
        specialties: ['On-site Grading', 'Slabbing', 'Authentication'],
        priceRating: 'fair',
        notes: 'Walk-up grading available. 3-day turnaround for show submissions.',
        visitedBy: ['GradeGuru99', 'SlabMasterDave'],
      },
    ],
    haul: [
      {
        id: 'h1',
        memberHandle: 'CardKingMike',
        cardName: '1965 Topps Mickey Mantle #350 PSA 5',
        price: 425.0,
        estimatedValue: 575.0,
        vendor: 'Midwest Vintage Co.',
        timestamp: '2026-03-15T11:15:00Z',
        isHighlight: true,
        photo: null,
      },
      {
        id: 'h2',
        memberHandle: 'WaxRipperJen',
        cardName: '1989 Upper Deck Ken Griffey Jr. #1 Raw NM',
        price: 1.0,
        estimatedValue: 35.0,
        vendor: 'Dollar Bin Danny',
        timestamp: '2026-03-15T10:45:00Z',
        isHighlight: true,
        photo: null,
      },
      {
        id: 'h3',
        memberHandle: 'SlabMasterDave',
        cardName: '2023-24 Prizm Victor Wembanyama Silver PSA 10',
        price: 780.0,
        estimatedValue: 950.0,
        vendor: 'Chi-Town Cards',
        timestamp: '2026-03-15T12:30:00Z',
        isHighlight: true,
        photo: null,
      },
      {
        id: 'h4',
        memberHandle: 'CardKingMike',
        cardName: '2020 Bowman Chrome Jasson Dominguez 1st Auto',
        price: 310.0,
        estimatedValue: 380.0,
        vendor: 'Chi-Town Cards',
        timestamp: '2026-03-15T13:05:00Z',
        isHighlight: false,
        photo: null,
      },
      {
        id: 'h5',
        memberHandle: 'GradeGuru99',
        cardName: '2022 Topps Chrome Julio Rodriguez RC Refractor',
        price: 95.0,
        estimatedValue: 130.0,
        vendor: 'Midwest Vintage Co.',
        timestamp: '2026-03-15T11:50:00Z',
        isHighlight: false,
        photo: null,
      },
      {
        id: 'h6',
        memberHandle: 'SlabMasterDave',
        cardName: '2018 Prizm Luka Doncic Base RC PSA 9',
        price: 540.0,
        estimatedValue: 625.0,
        vendor: 'Chi-Town Cards',
        timestamp: '2026-03-15T13:45:00Z',
        isHighlight: false,
        photo: null,
      },
    ],
    totalSquadSpend: 2557.5,
    totalHaulValue: 2695.0,
    wantListHitRate: 38.9,
    squadScore: 82,
  },
  {
    id: 'show-local-feb',
    name: 'Phoenix Card & Memorabilia Show',
    venue: 'Mesa Convention Center',
    city: 'Mesa',
    state: 'AZ',
    date: '2026-02-08',
    endDate: '2026-02-08',
    status: 'completed',
    squadSize: 3,
    members: [
      {
        userId: 'u1',
        handle: 'CardKingMike',
        role: 'buyer',
        checkInStatus: 'departed',
        wantListItems: 8,
        foundItems: 6,
        spent: 1245.0,
        lastCheckIn: '2026-02-08T16:30:00Z',
        location: 'Departed — heading home',
      },
      {
        userId: 'u5',
        handle: 'RookieHunterSam',
        role: 'scout',
        checkInStatus: 'departed',
        wantListItems: 10,
        foundItems: 7,
        spent: 430.0,
        lastCheckIn: '2026-02-08T16:00:00Z',
        location: 'Departed — heading home',
      },
      {
        userId: 'u6',
        handle: 'SlabMasterDave',
        role: 'general',
        checkInStatus: 'departed',
        wantListItems: 7,
        foundItems: 5,
        spent: 890.0,
        lastCheckIn: '2026-02-08T15:45:00Z',
        location: 'Departed — heading home',
      },
    ],
    vendors: [
      {
        id: 'v10',
        name: 'Desert Cards AZ',
        boothNumber: '12',
        rating: 4.6,
        specialties: ['Modern Baseball', 'Football', 'Rookie Cards'],
        priceRating: 'fair',
        notes: 'Best booth at the show. Great Ohtani and Trout selection.',
        visitedBy: ['CardKingMike', 'RookieHunterSam', 'SlabMasterDave'],
      },
      {
        id: 'v11',
        name: 'Cactus League Collectibles',
        boothNumber: '25',
        rating: 4.0,
        specialties: ['Spring Training Exclusives', 'Game-Used', 'Autographs'],
        priceRating: 'premium',
        notes: 'Unique game-used pieces. Overpriced on autos but rare inventory.',
        visitedBy: ['CardKingMike', 'SlabMasterDave'],
      },
      {
        id: 'v12',
        name: 'The Bargain Box',
        boothNumber: '7',
        rating: 4.4,
        specialties: ['Lot Deals', 'Team Sets', 'Budget Singles'],
        priceRating: 'cheap',
        notes: 'Sam found 3 want-list cards in the $5 bin. Incredible value.',
        visitedBy: ['RookieHunterSam'],
      },
    ],
    haul: [
      {
        id: 'h7',
        memberHandle: 'CardKingMike',
        cardName: '2023 Topps Chrome Shohei Ohtani SP Refractor',
        price: 285.0,
        estimatedValue: 420.0,
        vendor: 'Desert Cards AZ',
        timestamp: '2026-02-08T10:20:00Z',
        isHighlight: true,
        photo: null,
      },
      {
        id: 'h8',
        memberHandle: 'RookieHunterSam',
        cardName: '2024 Bowman 1st Paul Skenes Auto',
        price: 180.0,
        estimatedValue: 260.0,
        vendor: 'Desert Cards AZ',
        timestamp: '2026-02-08T11:10:00Z',
        isHighlight: true,
        photo: null,
      },
      {
        id: 'h9',
        memberHandle: 'SlabMasterDave',
        cardName: '2021 Panini Select Justin Herbert Tie-Dye /25 PSA 10',
        price: 520.0,
        estimatedValue: 710.0,
        vendor: 'Cactus League Collectibles',
        timestamp: '2026-02-08T12:45:00Z',
        isHighlight: true,
        photo: null,
      },
      {
        id: 'h10',
        memberHandle: 'RookieHunterSam',
        cardName: '2023 Topps Series 1 Corbin Carroll RC Lot (x5)',
        price: 25.0,
        estimatedValue: 55.0,
        vendor: 'The Bargain Box',
        timestamp: '2026-02-08T10:50:00Z',
        isHighlight: false,
        photo: null,
      },
      {
        id: 'h11',
        memberHandle: 'CardKingMike',
        cardName: '2022 Panini Prizm Brock Purdy Silver RC PSA 9',
        price: 480.0,
        estimatedValue: 540.0,
        vendor: 'Desert Cards AZ',
        timestamp: '2026-02-08T13:30:00Z',
        isHighlight: false,
        photo: null,
      },
      {
        id: 'h12',
        memberHandle: 'SlabMasterDave',
        cardName: '2020 Topps Chrome Luis Robert RC Refractor',
        price: 370.0,
        estimatedValue: 430.0,
        vendor: 'Desert Cards AZ',
        timestamp: '2026-02-08T14:15:00Z',
        isHighlight: false,
        photo: null,
      },
    ],
    totalSquadSpend: 2565.0,
    totalHaulValue: 3415.0,
    wantListHitRate: 72.0,
    squadScore: 91,
  },
];

// ---- Public Functions ----

export function getCardShows(): CardShow[] {
  return MOCK_SHOWS;
}

export function getCardShowStats(): CardShowStats {
  const completed = MOCK_SHOWS.filter((s) => s.status === 'completed' || s.status === 'live');
  const totalSpend = completed.reduce((sum, s) => sum + s.totalSquadSpend, 0);
  const totalValue = completed.reduce((sum, s) => sum + s.totalHaulValue, 0);
  const allVendors = completed.flatMap((s) => s.vendors);
  const ratedVendors = allVendors.filter((v) => v.visitedBy.length > 0);

  return {
    showsAttended: completed.length,
    totalSquadSpend: totalSpend,
    totalHaulValue: totalValue,
    avgROI: totalSpend > 0 ? Math.round(((totalValue - totalSpend) / totalSpend) * 100 * 10) / 10 : 0,
    bestFind: '1989 UD Griffey Jr. #1 — $1 buy / $35 value',
    wantListCompletionRate: 55.5,
    vendorsRated: ratedVendors.length,
    upcomingShows: MOCK_SHOWS.filter((s) => s.status === 'upcoming').length,
  };
}
