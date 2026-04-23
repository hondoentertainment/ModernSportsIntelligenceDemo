// @ts-nocheck
// ---- Types ----

export type DisplayMode = 'rotate' | 'spotlight' | 'stack';

export interface ShowcaseCard {
  id: string;
  player: string;
  image: string;
  grade: string;
  value: number;
  sport: string;
  displayMode: DisplayMode;
  year: number;
  set: string;
  change24h: number;
}

export interface ShowcaseTheme {
  id: string;
  name: string;
  background: string;
  lighting: string;
}

export interface ShowcaseStats {
  totalCards: number;
  totalValue: number;
  avgGrade: number;
  topSport: string;
  viewCount: number;
  shareCount: number;
}

// ---- Mock Data ----

const MOCK_CARDS: ShowcaseCard[] = [
  {
    id: 'ar-001',
    player: 'Mike Trout',
    image: '/cards/trout-2011.jpg',
    grade: 'PSA 10',
    value: 42500,
    sport: 'Baseball',
    displayMode: 'spotlight',
    year: 2011,
    set: 'Topps Update',
    change24h: 3.2,
  },
  {
    id: 'ar-002',
    player: 'Patrick Mahomes',
    image: '/cards/mahomes-2017.jpg',
    grade: 'BGS 9.5',
    value: 18750,
    sport: 'Football',
    displayMode: 'rotate',
    year: 2017,
    set: 'Panini Prizm',
    change24h: -1.4,
  },
  {
    id: 'ar-003',
    player: 'Luka Doncic',
    image: '/cards/doncic-2018.jpg',
    grade: 'PSA 10',
    value: 31200,
    sport: 'Basketball',
    displayMode: 'rotate',
    year: 2018,
    set: 'Panini Prizm Silver',
    change24h: 5.7,
  },
  {
    id: 'ar-004',
    player: 'Shohei Ohtani',
    image: '/cards/ohtani-2018.jpg',
    grade: 'SGC 10',
    value: 22800,
    sport: 'Baseball',
    displayMode: 'spotlight',
    year: 2018,
    set: 'Topps Chrome',
    change24h: 2.1,
  },
  {
    id: 'ar-005',
    player: 'Connor McDavid',
    image: '/cards/mcdavid-2015.jpg',
    grade: 'PSA 10',
    value: 15400,
    sport: 'Hockey',
    displayMode: 'stack',
    year: 2015,
    set: 'Upper Deck Young Guns',
    change24h: -0.8,
  },
  {
    id: 'ar-006',
    player: 'Victor Wembanyama',
    image: '/cards/wemby-2023.jpg',
    grade: 'BGS 9.5',
    value: 28900,
    sport: 'Basketball',
    displayMode: 'rotate',
    year: 2023,
    set: 'Panini Prizm',
    change24h: 8.3,
  },
  {
    id: 'ar-007',
    player: 'Aaron Judge',
    image: '/cards/judge-2017.jpg',
    grade: 'PSA 9',
    value: 8750,
    sport: 'Baseball',
    displayMode: 'stack',
    year: 2017,
    set: 'Topps Chrome',
    change24h: 1.6,
  },
  {
    id: 'ar-008',
    player: 'Justin Jefferson',
    image: '/cards/jefferson-2020.jpg',
    grade: 'PSA 10',
    value: 12300,
    sport: 'Football',
    displayMode: 'rotate',
    year: 2020,
    set: 'Panini Mosaic',
    change24h: -2.1,
  },
  {
    id: 'ar-009',
    player: 'Jayson Tatum',
    image: '/cards/tatum-2017.jpg',
    grade: 'BGS 9.5',
    value: 9800,
    sport: 'Basketball',
    displayMode: 'spotlight',
    year: 2017,
    set: 'Panini Prizm Silver',
    change24h: 0.9,
  },
];

const THEMES: ShowcaseTheme[] = [
  {
    id: 'midnight',
    name: 'Midnight Gallery',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    lighting: 'radial-gradient(ellipse at 50% 30%, rgba(132,204,22,0.12) 0%, transparent 70%)',
  },
  {
    id: 'neon',
    name: 'Neon Vault',
    background: 'linear-gradient(135deg, #0a0020 0%, #1a0040 50%, #0d002b 100%)',
    lighting: 'radial-gradient(ellipse at 50% 30%, rgba(168,85,247,0.15) 0%, transparent 70%)',
  },
  {
    id: 'ember',
    name: 'Ember Room',
    background: 'linear-gradient(135deg, #1c0a00 0%, #2d1200 50%, #1a0800 100%)',
    lighting: 'radial-gradient(ellipse at 50% 30%, rgba(249,115,22,0.12) 0%, transparent 70%)',
  },
  {
    id: 'frost',
    name: 'Frost Display',
    background: 'linear-gradient(135deg, #0c1929 0%, #132e4a 50%, #0a1628 100%)',
    lighting: 'radial-gradient(ellipse at 50% 30%, rgba(56,189,248,0.12) 0%, transparent 70%)',
  },
  {
    id: 'gold',
    name: 'Gold Standard',
    background: 'linear-gradient(135deg, #1a1400 0%, #2d2200 50%, #1a1400 100%)',
    lighting: 'radial-gradient(ellipse at 50% 30%, rgba(234,179,8,0.15) 0%, transparent 70%)',
  },
];

// ---- Service Functions ----

export function getShowcaseCards(): ShowcaseCard[] {
  return MOCK_CARDS;
}

export function getThemes(): ShowcaseTheme[] {
  return THEMES;
}

export function getShareableLink(cardIds: string[]): string {
  const hash = cardIds.join('-').split('').reduce((acc, ch) => {
    return ((acc << 5) - acc) + ch.charCodeAt(0) | 0;
  }, 0);
  const shareId = Math.abs(hash).toString(36).padStart(8, '0');
  return `https://msi.cards/ar-showcase/${shareId}`;
}

export function getShowcaseStats(cards: ShowcaseCard[]): ShowcaseStats {
  if (cards.length === 0) {
    return {
      totalCards: 0,
      totalValue: 0,
      avgGrade: 0,
      topSport: 'N/A',
      viewCount: 0,
      shareCount: 0,
    };
  }

  const totalValue = cards.reduce((sum, c) => sum + c.value, 0);

  // Parse numeric grades from strings like "PSA 10", "BGS 9.5"
  const grades = cards.map(c => {
    const match = c.grade.match(/[\d.]+$/);
    return match ? parseFloat(match[0]) : 0;
  });
  const avgGrade = grades.reduce((sum, g) => sum + g, 0) / grades.length;

  // Find top sport by count
  const sportCounts: Record<string, number> = {};
  cards.forEach(c => {
    sportCounts[c.sport] = (sportCounts[c.sport] || 0) + 1;
  });
  const topSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0][0];

  // Deterministic view/share counts based on card count
  const seed = cards.length * 137 + totalValue;
  const viewCount = Math.round((Math.sin(seed) * 0.5 + 0.5) * 5000 + cards.length * 200);
  const shareCount = Math.round(viewCount * 0.12);

  return {
    totalCards: cards.length,
    totalValue,
    avgGrade: Math.round(avgGrade * 10) / 10,
    topSport,
    viewCount,
    shareCount,
  };
}

export default {
  getShowcaseCards,
  getThemes,
  getShareableLink,
  getShowcaseStats,
};
