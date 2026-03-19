// ---- Types ----

export type VaultTheme = 'luxury-vault' | 'sports-hall' | 'modern-gallery' | 'collector-den' | 'museum-wing' | 'skybox-suite';

export type VaultVisibility = 'private' | 'shared' | 'public';

export interface VaultRoom {
  id: string;
  name: string;
  theme: VaultTheme;
  cardSlots: number;
  occupiedSlots: number;
  visibility: VaultVisibility;
  viewCount: number;
  createdAt: string;
  lastModified: string;
  thumbnailGradient: string;
  description: string;
  ownerAlias: string;
  rating: number;
  shareCount: number;
}

export interface VaultCard {
  id: string;
  roomId: string;
  cardName: string;
  playerName: string;
  year: number;
  grade: string;
  currentValue: number;
  previousValue: number;
  position: { x: number; y: number; z: number };
  rotation: number;
  spotlight: boolean;
  priceTickerEnabled: boolean;
  sport: string;
  set: string;
  slabImage: string;
}

export interface VaultTourWaypoint {
  x: number;
  y: number;
  z: number;
  lookAt: { x: number; y: number; z: number };
  label?: string;
}

export interface VaultTour {
  id: string;
  roomId: string;
  tourName: string;
  waypoints: VaultTourWaypoint[];
  duration: number;
  isLive: boolean;
  viewerCount: number;
  createdAt: string;
  recordedUrl?: string;
  thumbnailGradient: string;
}

export interface VaultStats {
  totalRooms: number;
  totalCardsDisplayed: number;
  totalViews: number;
  totalShares: number;
  avgTimeSpent: number;
  topRoom: { id: string; name: string; views: number };
  totalPortfolioValue: number;
  publicRooms: number;
}

// ---- Theme Metadata ----

export const VAULT_THEME_META: Record<VaultTheme, { label: string; icon: string; color: string }> = {
  'luxury-vault': { label: 'Luxury Vault', icon: 'crown', color: 'text-amber-400' },
  'sports-hall': { label: 'Sports Hall', icon: 'trophy', color: 'text-emerald-400' },
  'modern-gallery': { label: 'Modern Gallery', icon: 'frame', color: 'text-blue-400' },
  'collector-den': { label: "Collector's Den", icon: 'armchair', color: 'text-orange-400' },
  'museum-wing': { label: 'Museum Wing', icon: 'landmark', color: 'text-purple-400' },
  'skybox-suite': { label: 'Skybox Suite', icon: 'monitor', color: 'text-cyan-400' },
};

// ---- Mock Data: Vault Rooms ----

const MOCK_ROOMS: VaultRoom[] = [
  {
    id: 'vr-001',
    name: 'The Grail Wall',
    theme: 'luxury-vault',
    cardSlots: 24,
    occupiedSlots: 18,
    visibility: 'public',
    viewCount: 12847,
    createdAt: '2025-08-14T10:00:00Z',
    lastModified: '2026-03-12T16:45:00Z',
    thumbnailGradient: 'from-amber-900/40 to-slate-900',
    description: 'My top-tier grails under museum lighting. PSA 10s and BGS 9.5+ only.',
    ownerAlias: 'VaultKing99',
    rating: 4.9,
    shareCount: 342,
  },
  {
    id: 'vr-002',
    name: 'Rookie Rotation',
    theme: 'sports-hall',
    cardSlots: 36,
    occupiedSlots: 28,
    visibility: 'public',
    viewCount: 8234,
    createdAt: '2025-11-02T14:30:00Z',
    lastModified: '2026-03-10T09:15:00Z',
    thumbnailGradient: 'from-emerald-900/40 to-slate-900',
    description: 'Rookie cards across all sports. Rotating weekly highlights.',
    ownerAlias: 'RookieHunter',
    rating: 4.7,
    shareCount: 187,
  },
  {
    id: 'vr-003',
    name: 'Modern Minimalist',
    theme: 'modern-gallery',
    cardSlots: 12,
    occupiedSlots: 12,
    visibility: 'shared',
    viewCount: 5621,
    createdAt: '2025-12-20T08:00:00Z',
    lastModified: '2026-03-08T11:30:00Z',
    thumbnailGradient: 'from-blue-900/40 to-slate-900',
    description: 'Curated dozen. Clean lines, floating displays, white-wall aesthetic.',
    ownerAlias: 'MinimalCollector',
    rating: 4.8,
    shareCount: 256,
  },
  {
    id: 'vr-004',
    name: 'The Man Cave',
    theme: 'collector-den',
    cardSlots: 48,
    occupiedSlots: 41,
    visibility: 'private',
    viewCount: 1204,
    createdAt: '2025-06-10T19:00:00Z',
    lastModified: '2026-03-14T22:00:00Z',
    thumbnailGradient: 'from-orange-900/40 to-slate-900',
    description: 'Full collection den with cozy vibes. Every card tells a story.',
    ownerAlias: 'CardDaddy',
    rating: 4.5,
    shareCount: 89,
  },
  {
    id: 'vr-005',
    name: 'Hall of Legends',
    theme: 'museum-wing',
    cardSlots: 20,
    occupiedSlots: 16,
    visibility: 'public',
    viewCount: 15390,
    createdAt: '2025-09-05T12:00:00Z',
    lastModified: '2026-03-11T14:20:00Z',
    thumbnailGradient: 'from-purple-900/40 to-slate-900',
    description: 'HOF inductees only. Marble pedestals with engraved plaques.',
    ownerAlias: 'MuseumCurator',
    rating: 4.95,
    shareCount: 512,
  },
  {
    id: 'vr-006',
    name: 'Skybox Experience',
    theme: 'skybox-suite',
    cardSlots: 16,
    occupiedSlots: 10,
    visibility: 'shared',
    viewCount: 3876,
    createdAt: '2026-01-15T17:00:00Z',
    lastModified: '2026-03-13T20:10:00Z',
    thumbnailGradient: 'from-cyan-900/40 to-slate-900',
    description: 'Stadium skybox vibe with live game feeds and card displays.',
    ownerAlias: 'SkyboxCollector',
    rating: 4.6,
    shareCount: 134,
  },
];

// ---- Mock Data: Vault Cards ----

const MOCK_CARDS: VaultCard[] = [
  // Room 1 - The Grail Wall
  { id: 'vc-001', roomId: 'vr-001', cardName: '2011 Topps Update #US175', playerName: 'Mike Trout', year: 2011, grade: 'PSA 10', currentValue: 425000, previousValue: 418000, position: { x: 0, y: 1.5, z: -2 }, rotation: 0, spotlight: true, priceTickerEnabled: true, sport: 'Baseball', set: 'Topps Update', slabImage: '/slabs/trout-rc.jpg' },
  { id: 'vc-002', roomId: 'vr-001', cardName: '2003 Topps Chrome #221', playerName: 'LeBron James', year: 2003, grade: 'BGS 9.5', currentValue: 285000, previousValue: 291000, position: { x: 2, y: 1.5, z: -2 }, rotation: 5, spotlight: true, priceTickerEnabled: true, sport: 'Basketball', set: 'Topps Chrome', slabImage: '/slabs/lebron-rc.jpg' },
  { id: 'vc-003', roomId: 'vr-001', cardName: '2000 Playoff Contenders #144', playerName: 'Tom Brady', year: 2000, grade: 'PSA 10', currentValue: 780000, previousValue: 765000, position: { x: -2, y: 1.5, z: -2 }, rotation: -5, spotlight: true, priceTickerEnabled: true, sport: 'Football', set: 'Playoff Contenders', slabImage: '/slabs/brady-rc.jpg' },
  { id: 'vc-004', roomId: 'vr-001', cardName: '1986 Fleer #57', playerName: 'Michael Jordan', year: 1986, grade: 'PSA 10', currentValue: 540000, previousValue: 525000, position: { x: 4, y: 1.5, z: -2 }, rotation: 0, spotlight: true, priceTickerEnabled: true, sport: 'Basketball', set: 'Fleer', slabImage: '/slabs/jordan-rc.jpg' },

  // Room 2 - Rookie Rotation
  { id: 'vc-005', roomId: 'vr-002', cardName: '2018 Panini Prizm #280', playerName: 'Luka Doncic', year: 2018, grade: 'PSA 10', currentValue: 4250, previousValue: 4100, position: { x: 0, y: 1.2, z: -1.5 }, rotation: 0, spotlight: false, priceTickerEnabled: true, sport: 'Basketball', set: 'Panini Prizm', slabImage: '/slabs/luka-rc.jpg' },
  { id: 'vc-006', roomId: 'vr-002', cardName: '2020 Panini Prizm #339', playerName: 'Justin Herbert', year: 2020, grade: 'PSA 10', currentValue: 1850, previousValue: 1920, position: { x: 1.5, y: 1.2, z: -1.5 }, rotation: 0, spotlight: false, priceTickerEnabled: true, sport: 'Football', set: 'Panini Prizm', slabImage: '/slabs/herbert-rc.jpg' },
  { id: 'vc-007', roomId: 'vr-002', cardName: '2019 Topps Chrome #201', playerName: 'Yordan Alvarez', year: 2019, grade: 'PSA 10', currentValue: 520, previousValue: 485, position: { x: -1.5, y: 1.2, z: -1.5 }, rotation: 0, spotlight: false, priceTickerEnabled: true, sport: 'Baseball', set: 'Topps Chrome', slabImage: '/slabs/alvarez-rc.jpg' },
  { id: 'vc-008', roomId: 'vr-002', cardName: '2020 Panini Prizm #278', playerName: 'Anthony Edwards', year: 2020, grade: 'BGS 9.5', currentValue: 2100, previousValue: 1950, position: { x: 3, y: 1.2, z: -1.5 }, rotation: 8, spotlight: true, priceTickerEnabled: true, sport: 'Basketball', set: 'Panini Prizm', slabImage: '/slabs/edwards-rc.jpg' },
  { id: 'vc-009', roomId: 'vr-002', cardName: '2021 Topps Chrome #27', playerName: 'Bobby Witt Jr.', year: 2021, grade: 'PSA 10', currentValue: 380, previousValue: 350, position: { x: -3, y: 1.2, z: -1.5 }, rotation: -8, spotlight: false, priceTickerEnabled: true, sport: 'Baseball', set: 'Topps Chrome', slabImage: '/slabs/witt-rc.jpg' },
  { id: 'vc-010', roomId: 'vr-002', cardName: '2017 Panini Prizm #269', playerName: 'Patrick Mahomes', year: 2017, grade: 'PSA 10', currentValue: 18500, previousValue: 18200, position: { x: 4.5, y: 1.2, z: -1.5 }, rotation: 0, spotlight: true, priceTickerEnabled: true, sport: 'Football', set: 'Panini Prizm', slabImage: '/slabs/mahomes-rc.jpg' },

  // Room 3 - Modern Minimalist
  { id: 'vc-011', roomId: 'vr-003', cardName: '2018 Topps Update #US250', playerName: 'Shohei Ohtani', year: 2018, grade: 'PSA 10', currentValue: 3200, previousValue: 3050, position: { x: 0, y: 1.6, z: -3 }, rotation: 0, spotlight: true, priceTickerEnabled: true, sport: 'Baseball', set: 'Topps Update', slabImage: '/slabs/ohtani-rc.jpg' },
  { id: 'vc-012', roomId: 'vr-003', cardName: '2019 Panini Prizm #248', playerName: 'Ja Morant', year: 2019, grade: 'PSA 10', currentValue: 1450, previousValue: 1380, position: { x: 2, y: 1.6, z: -3 }, rotation: 0, spotlight: true, priceTickerEnabled: true, sport: 'Basketball', set: 'Panini Prizm', slabImage: '/slabs/morant-rc.jpg' },
  { id: 'vc-013', roomId: 'vr-003', cardName: '2020 Topps Chrome #46', playerName: 'Luis Robert', year: 2020, grade: 'BGS 9.5', currentValue: 680, previousValue: 710, position: { x: -2, y: 1.6, z: -3 }, rotation: 0, spotlight: false, priceTickerEnabled: true, sport: 'Baseball', set: 'Topps Chrome', slabImage: '/slabs/robert-rc.jpg' },

  // Room 4 - The Man Cave
  { id: 'vc-014', roomId: 'vr-004', cardName: '2019 Panini Prizm #75', playerName: 'Zion Williamson', year: 2019, grade: 'PSA 10', currentValue: 1200, previousValue: 1280, position: { x: 1, y: 1, z: -1 }, rotation: 15, spotlight: false, priceTickerEnabled: true, sport: 'Basketball', set: 'Panini Prizm', slabImage: '/slabs/zion-rc.jpg' },
  { id: 'vc-015', roomId: 'vr-004', cardName: '2021 Panini Prizm #331', playerName: 'Trevor Lawrence', year: 2021, grade: 'PSA 10', currentValue: 420, previousValue: 395, position: { x: -1, y: 1, z: -1 }, rotation: -10, spotlight: false, priceTickerEnabled: true, sport: 'Football', set: 'Panini Prizm', slabImage: '/slabs/lawrence-rc.jpg' },
  { id: 'vc-016', roomId: 'vr-004', cardName: '2023 Topps Chrome #200', playerName: 'Elly De La Cruz', year: 2023, grade: 'PSA 10', currentValue: 275, previousValue: 240, position: { x: 3, y: 1, z: -1 }, rotation: 5, spotlight: true, priceTickerEnabled: true, sport: 'Baseball', set: 'Topps Chrome', slabImage: '/slabs/elly-rc.jpg' },

  // Room 5 - Hall of Legends
  { id: 'vc-017', roomId: 'vr-005', cardName: '1952 Topps #311', playerName: 'Mickey Mantle', year: 1952, grade: 'PSA 8', currentValue: 2850000, previousValue: 2800000, position: { x: 0, y: 2, z: -4 }, rotation: 0, spotlight: true, priceTickerEnabled: true, sport: 'Baseball', set: 'Topps', slabImage: '/slabs/mantle-52.jpg' },
  { id: 'vc-018', roomId: 'vr-005', cardName: '1979 O-Pee-Chee #18', playerName: 'Wayne Gretzky', year: 1979, grade: 'PSA 10', currentValue: 3750000, previousValue: 3700000, position: { x: 3, y: 2, z: -4 }, rotation: 0, spotlight: true, priceTickerEnabled: true, sport: 'Hockey', set: 'O-Pee-Chee', slabImage: '/slabs/gretzky-rc.jpg' },
  { id: 'vc-019', roomId: 'vr-005', cardName: '1933 Goudey #53', playerName: 'Babe Ruth', year: 1933, grade: 'PSA 7', currentValue: 1450000, previousValue: 1420000, position: { x: -3, y: 2, z: -4 }, rotation: 0, spotlight: true, priceTickerEnabled: true, sport: 'Baseball', set: 'Goudey', slabImage: '/slabs/ruth-33.jpg' },

  // Room 6 - Skybox Experience
  { id: 'vc-020', roomId: 'vr-006', cardName: '2022 Panini Prizm #1', playerName: 'Victor Wembanyama', year: 2022, grade: 'PSA 10', currentValue: 8500, previousValue: 7800, position: { x: 0, y: 1.3, z: -2 }, rotation: 0, spotlight: true, priceTickerEnabled: true, sport: 'Basketball', set: 'Panini Prizm', slabImage: '/slabs/wemby-rc.jpg' },
  { id: 'vc-021', roomId: 'vr-006', cardName: '2023 Bowman Chrome #BCP-1', playerName: 'Paul Skenes', year: 2023, grade: 'BGS 9.5', currentValue: 950, previousValue: 870, position: { x: 2, y: 1.3, z: -2 }, rotation: 0, spotlight: false, priceTickerEnabled: true, sport: 'Baseball', set: 'Bowman Chrome', slabImage: '/slabs/skenes-rc.jpg' },
  { id: 'vc-022', roomId: 'vr-006', cardName: '2023 Panini Prizm #301', playerName: 'Caleb Williams', year: 2023, grade: 'PSA 10', currentValue: 620, previousValue: 580, position: { x: -2, y: 1.3, z: -2 }, rotation: 0, spotlight: false, priceTickerEnabled: true, sport: 'Football', set: 'Panini Prizm', slabImage: '/slabs/williams-rc.jpg' },
];

// ---- Mock Data: Tours ----

const MOCK_TOURS: VaultTour[] = [
  {
    id: 'vt-001',
    roomId: 'vr-001',
    tourName: 'Grail Wall Grand Tour',
    waypoints: [
      { x: 0, y: 1.7, z: 2, lookAt: { x: 0, y: 1.5, z: -2 }, label: 'Entrance Overview' },
      { x: -2, y: 1.7, z: 0, lookAt: { x: -2, y: 1.5, z: -2 }, label: 'Brady Spotlight' },
      { x: 0, y: 1.7, z: -0.5, lookAt: { x: 0, y: 1.5, z: -2 }, label: 'Trout Centerpiece' },
      { x: 2, y: 1.7, z: 0, lookAt: { x: 2, y: 1.5, z: -2 }, label: 'LeBron Close-up' },
      { x: 4, y: 1.7, z: 0, lookAt: { x: 4, y: 1.5, z: -2 }, label: 'Jordan Finale' },
    ],
    duration: 180,
    isLive: true,
    viewerCount: 47,
    createdAt: '2026-03-12T16:45:00Z',
    thumbnailGradient: 'from-amber-500/20 to-slate-900',
  },
  {
    id: 'vt-002',
    roomId: 'vr-005',
    tourName: 'Legends Museum Walk',
    waypoints: [
      { x: 0, y: 2.2, z: 3, lookAt: { x: 0, y: 2, z: -4 }, label: 'Grand Hall Entry' },
      { x: -3, y: 2.2, z: 0, lookAt: { x: -3, y: 2, z: -4 }, label: 'Ruth Wing' },
      { x: 0, y: 2.2, z: -1, lookAt: { x: 0, y: 2, z: -4 }, label: 'Mantle Pedestal' },
      { x: 3, y: 2.2, z: 0, lookAt: { x: 3, y: 2, z: -4 }, label: 'Gretzky Gallery' },
    ],
    duration: 240,
    isLive: false,
    viewerCount: 0,
    createdAt: '2026-02-28T12:00:00Z',
    recordedUrl: '/tours/legends-walk.mp4',
    thumbnailGradient: 'from-purple-500/20 to-slate-900',
  },
  {
    id: 'vt-003',
    roomId: 'vr-002',
    tourName: 'Rookie Highlights Reel',
    waypoints: [
      { x: 0, y: 1.5, z: 1, lookAt: { x: 0, y: 1.2, z: -1.5 }, label: 'Start' },
      { x: 4.5, y: 1.5, z: 0, lookAt: { x: 4.5, y: 1.2, z: -1.5 }, label: 'Mahomes Feature' },
      { x: 3, y: 1.5, z: 0, lookAt: { x: 3, y: 1.2, z: -1.5 }, label: 'Edwards Rising' },
    ],
    duration: 120,
    isLive: true,
    viewerCount: 23,
    createdAt: '2026-03-14T09:30:00Z',
    thumbnailGradient: 'from-emerald-500/20 to-slate-900',
  },
  {
    id: 'vt-004',
    roomId: 'vr-006',
    tourName: 'Skybox Quick View',
    waypoints: [
      { x: 0, y: 1.6, z: 2, lookAt: { x: 0, y: 1.3, z: -2 }, label: 'Suite Entrance' },
      { x: 0, y: 1.6, z: 0, lookAt: { x: 0, y: 1.3, z: -2 }, label: 'Wemby Center Stage' },
    ],
    duration: 60,
    isLive: false,
    viewerCount: 0,
    createdAt: '2026-03-10T18:00:00Z',
    recordedUrl: '/tours/skybox-quick.mp4',
    thumbnailGradient: 'from-cyan-500/20 to-slate-900',
  },
];

// ---- Service Functions ----

export function getVaultRooms(): VaultRoom[] {
  return MOCK_ROOMS;
}

export function getVaultRoom(id: string): VaultRoom | undefined {
  return MOCK_ROOMS.find((r) => r.id === id);
}

export function getCardsInRoom(roomId: string): VaultCard[] {
  return MOCK_CARDS.filter((c) => c.roomId === roomId);
}

export function getAllVaultCards(): VaultCard[] {
  return MOCK_CARDS;
}

export function getVaultTours(): VaultTour[] {
  return MOCK_TOURS;
}

export function getToursForRoom(roomId: string): VaultTour[] {
  return MOCK_TOURS.filter((t) => t.roomId === roomId);
}

export function getPublicVaults(): VaultRoom[] {
  return MOCK_ROOMS.filter((r) => r.visibility === 'public');
}

export function getSharedVaults(): VaultRoom[] {
  return MOCK_ROOMS.filter((r) => r.visibility !== 'private');
}

export function calculateRoomValue(roomId: string): number {
  const cards = getCardsInRoom(roomId);
  return cards.reduce((sum, c) => sum + c.currentValue, 0);
}

export function calculateRoomValueChange(roomId: string): { absolute: number; percent: number } {
  const cards = getCardsInRoom(roomId);
  const current = cards.reduce((sum, c) => sum + c.currentValue, 0);
  const previous = cards.reduce((sum, c) => sum + c.previousValue, 0);
  const absolute = current - previous;
  const percent = previous > 0 ? (absolute / previous) * 100 : 0;
  return { absolute, percent };
}

export function getVaultStats(): VaultStats {
  const rooms = MOCK_ROOMS;
  const cards = MOCK_CARDS;
  const totalViews = rooms.reduce((sum, r) => sum + r.viewCount, 0);
  const totalShares = rooms.reduce((sum, r) => sum + r.shareCount, 0);
  const totalCardsDisplayed = cards.length;
  const totalPortfolioValue = cards.reduce((sum, c) => sum + c.currentValue, 0);
  const publicRooms = rooms.filter((r) => r.visibility === 'public').length;

  const topRoom = rooms.reduce(
    (best, room) => (room.viewCount > best.views ? { id: room.id, name: room.name, views: room.viewCount } : best),
    { id: '', name: '', views: 0 }
  );

  return {
    totalRooms: rooms.length,
    totalCardsDisplayed,
    totalViews,
    totalShares,
    avgTimeSpent: 4.7,
    topRoom,
    totalPortfolioValue,
    publicRooms,
  };
}

export function searchPublicVaults(query: string): VaultRoom[] {
  const q = query.toLowerCase();
  return MOCK_ROOMS.filter(
    (r) =>
      r.visibility === 'public' &&
      (r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ownerAlias.toLowerCase().includes(q) ||
        r.theme.toLowerCase().includes(q))
  );
}

export function sortVaults(rooms: VaultRoom[], sortBy: 'views' | 'value' | 'rating' | 'recent'): VaultRoom[] {
  const sorted = [...rooms];
  switch (sortBy) {
    case 'views':
      return sorted.sort((a, b) => b.viewCount - a.viewCount);
    case 'value':
      return sorted.sort((a, b) => calculateRoomValue(b.id) - calculateRoomValue(a.id));
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'recent':
      return sorted.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    default:
      return sorted;
  }
}

export function getFeaturedRoom(): VaultRoom {
  return MOCK_ROOMS.reduce((best, room) => (room.viewCount > best.viewCount ? room : best), MOCK_ROOMS[0]);
}

export function getLiveTours(): VaultTour[] {
  return MOCK_TOURS.filter((t) => t.isLive);
}
