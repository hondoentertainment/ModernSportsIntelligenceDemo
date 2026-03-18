// Phase 241 — Flip Streak Analytics Service

export interface FlipRecord {
  id: string;
  card: string;
  player: string;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  date: string;
  isWin: boolean;
}

export interface StreakAnalysis {
  currentStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
  totalFlips: number;
  winRate: number;
  avgProfit: number;
  hotCards: string[];
}

const flipRecords: FlipRecord[] = [
  {
    id: 'fl-001',
    card: '2023 Prizm Base #181',
    player: 'Victor Wembanyama',
    buyPrice: 35,
    sellPrice: 72,
    profit: 37,
    date: '2025-04-10',
    isWin: true,
  },
  {
    id: 'fl-002',
    card: '2024 Topps Chrome #200',
    player: 'Paul Skenes',
    buyPrice: 28,
    sellPrice: 44,
    profit: 16,
    date: '2025-04-12',
    isWin: true,
  },
  {
    id: 'fl-003',
    card: '2022 Select Concourse #45',
    player: 'Luka Dončić',
    buyPrice: 120,
    sellPrice: 98,
    profit: -22,
    date: '2025-04-15',
    isWin: false,
  },
  {
    id: 'fl-004',
    card: '2020 Prizm Base #258',
    player: 'Anthony Edwards',
    buyPrice: 55,
    sellPrice: 89,
    profit: 34,
    date: '2025-04-18',
    isWin: true,
  },
  {
    id: 'fl-005',
    card: '2023 Topps Chrome #150',
    player: 'Elly De La Cruz',
    buyPrice: 42,
    sellPrice: 61,
    profit: 19,
    date: '2025-04-20',
    isWin: true,
  },
  {
    id: 'fl-006',
    card: '2024 Panini Prizm Draft #1',
    player: 'Caleb Williams',
    buyPrice: 48,
    sellPrice: 31,
    profit: -17,
    date: '2025-04-22',
    isWin: false,
  },
  {
    id: 'fl-007',
    card: '2024 Donruss Optic #201',
    player: 'Chet Holmgren',
    buyPrice: 22,
    sellPrice: 19,
    profit: -3,
    date: '2025-04-25',
    isWin: false,
  },
  {
    id: 'fl-008',
    card: '2017 Prizm Base #16',
    player: 'Jayson Tatum',
    buyPrice: 85,
    sellPrice: 130,
    profit: 45,
    date: '2025-04-28',
    isWin: true,
  },
  {
    id: 'fl-009',
    card: '2023 Prizm Silver #181',
    player: 'Victor Wembanyama',
    buyPrice: 190,
    sellPrice: 265,
    profit: 75,
    date: '2025-05-01',
    isWin: true,
  },
  {
    id: 'fl-010',
    card: '2024 Topps Series 1 #1',
    player: 'Shohei Ohtani',
    buyPrice: 15,
    sellPrice: 38,
    profit: 23,
    date: '2025-05-04',
    isWin: true,
  },
];

const streakAnalysis: StreakAnalysis = {
  currentStreak: 3,
  longestWinStreak: 4,
  longestLossStreak: 2,
  totalFlips: flipRecords.length,
  winRate: 70,
  avgProfit:
    Math.round(
      (flipRecords.reduce((sum, f) => sum + f.profit, 0) / flipRecords.length) * 100
    ) / 100,
  hotCards: [
    '2023 Prizm Silver #181 — Wembanyama',
    '2017 Prizm Base #16 — Tatum',
    '2024 Topps Series 1 #1 — Ohtani',
  ],
};

export function getFlipRecords(): FlipRecord[] {
  return flipRecords;
}

export function getStreakAnalysis(): StreakAnalysis {
  return streakAnalysis;
}

export function getFlipStats() {
  const wins = flipRecords.filter((f) => f.isWin).length;
  const losses = flipRecords.filter((f) => !f.isWin).length;
  const totalProfit = flipRecords.reduce((sum, f) => sum + f.profit, 0);
  const biggestWin = Math.max(...flipRecords.map((f) => f.profit));
  const biggestLoss = Math.min(...flipRecords.map((f) => f.profit));

  return {
    totalFlips: flipRecords.length,
    wins,
    losses,
    winRate: Math.round((wins / flipRecords.length) * 100),
    totalProfit,
    avgProfit: Math.round((totalProfit / flipRecords.length) * 100) / 100,
    biggestWin,
    biggestLoss,
    currentStreak: streakAnalysis.currentStreak,
  };
}

const flipStreakAnalyticsService = {
  getFlipRecords,
  getStreakAnalysis,
  getFlipStats,
};

export default flipStreakAnalyticsService;
