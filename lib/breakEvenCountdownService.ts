// Phase 239 — Break-Even Countdown Timer Service

export interface BreakEvenCard {
  id: string;
  player: string;
  card: string;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  dailyAppreciation: number;
  projectedBreakEvenDate: string;
  daysRemaining: number;
  status: 'profitable' | 'on-track' | 'behind' | 'underwater';
}

export interface BreakEvenStats {
  totalCards: number;
  profitable: number;
  onTrack: number;
  underwater: number;
  avgDaysToBreakEven: number;
}

const breakEvenCards: BreakEvenCard[] = [
  {
    id: 'be-001',
    player: 'Victor Wembanyama',
    card: '2023 Prizm Silver #181',
    purchasePrice: 450,
    purchaseDate: '2024-06-10',
    currentValue: 620,
    dailyAppreciation: 0.85,
    projectedBreakEvenDate: '2024-12-01',
    daysRemaining: 0,
    status: 'profitable',
  },
  {
    id: 'be-002',
    player: 'Jayson Tatum',
    card: '2017 Prizm Base #16',
    purchasePrice: 320,
    purchaseDate: '2024-09-01',
    currentValue: 295,
    dailyAppreciation: 0.42,
    projectedBreakEvenDate: '2025-08-15',
    daysRemaining: 60,
    status: 'on-track',
  },
  {
    id: 'be-003',
    player: 'Luka Dončić',
    card: '2018 Prizm Silver #280',
    purchasePrice: 1200,
    purchaseDate: '2024-03-15',
    currentValue: 880,
    dailyAppreciation: -1.15,
    projectedBreakEvenDate: '2026-09-30',
    daysRemaining: 562,
    status: 'underwater',
  },
  {
    id: 'be-004',
    player: 'Anthony Edwards',
    card: '2020 Prizm Base #258',
    purchasePrice: 275,
    purchaseDate: '2024-11-20',
    currentValue: 310,
    dailyAppreciation: 0.55,
    projectedBreakEvenDate: '2025-04-10',
    daysRemaining: 0,
    status: 'profitable',
  },
  {
    id: 'be-005',
    player: 'Elly De La Cruz',
    card: '2023 Topps Chrome #150',
    purchasePrice: 180,
    purchaseDate: '2025-01-05',
    currentValue: 155,
    dailyAppreciation: 0.22,
    projectedBreakEvenDate: '2025-12-20',
    daysRemaining: 205,
    status: 'behind',
  },
  {
    id: 'be-006',
    player: 'Caleb Williams',
    card: '2024 Panini Prizm Draft #1',
    purchasePrice: 95,
    purchaseDate: '2024-08-10',
    currentValue: 62,
    dailyAppreciation: -0.08,
    projectedBreakEvenDate: '2027-03-01',
    daysRemaining: 730,
    status: 'underwater',
  },
  {
    id: 'be-007',
    player: 'Paul Skenes',
    card: '2024 Topps Chrome #250',
    purchasePrice: 210,
    purchaseDate: '2025-02-01',
    currentValue: 198,
    dailyAppreciation: 0.35,
    projectedBreakEvenDate: '2025-09-05',
    daysRemaining: 120,
    status: 'on-track',
  },
  {
    id: 'be-008',
    player: 'Chet Holmgren',
    card: '2022 Prizm Base #249',
    purchasePrice: 140,
    purchaseDate: '2024-10-15',
    currentValue: 105,
    dailyAppreciation: 0.10,
    projectedBreakEvenDate: '2026-06-15',
    daysRemaining: 410,
    status: 'behind',
  },
];

export function getBreakEvenCards(): BreakEvenCard[] {
  return breakEvenCards;
}

export function getBreakEvenStats(): BreakEvenStats {
  const totalCards = breakEvenCards.length;
  const profitable = breakEvenCards.filter((c) => c.status === 'profitable').length;
  const onTrack = breakEvenCards.filter((c) => c.status === 'on-track').length;
  const underwater = breakEvenCards.filter((c) => c.status === 'underwater').length;
  const cardsWithDaysRemaining = breakEvenCards.filter((c) => c.daysRemaining > 0);
  const avgDaysToBreakEven =
    cardsWithDaysRemaining.length > 0
      ? Math.round(
          cardsWithDaysRemaining.reduce((sum, c) => sum + c.daysRemaining, 0) /
            cardsWithDaysRemaining.length
        )
      : 0;

  return {
    totalCards,
    profitable,
    onTrack,
    underwater,
    avgDaysToBreakEven,
  };
}

const breakEvenCountdownService = {
  getBreakEvenCards,
  getBreakEvenStats,
};

export default breakEvenCountdownService;
