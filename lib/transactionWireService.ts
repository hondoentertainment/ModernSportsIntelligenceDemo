// Transaction Wire Service — Real-time market transaction feed
// Bloomberg-style transaction ticker for sports card market intelligence.

// ── Interfaces ──────────────────────────────────────────────────────────────────

export type Sport = 'MLB' | 'NBA' | 'NFL';
export type BuyerType = 'Collector' | 'Investor' | 'Dealer' | 'Institutional' | 'Flipper';
export type SellerType = 'Collector' | 'Dealer' | 'Estate' | 'Consignor' | 'Auction House';
export type Platform = 'eBay' | 'PWCC' | 'Goldin' | 'Heritage' | 'MySlabs' | 'Fanatics';

export interface Transaction {
  id: string;
  player: string;
  cardDescription: string;
  price: number;
  previousPrice: number;
  buyerType: BuyerType;
  sellerType: SellerType;
  platform: Platform;
  timestamp: string; // ISO date
  sport: Sport;
  isNotable: boolean;
}

export interface TransactionStats {
  totalVolume: number;
  avgPrice: number;
  notableDeals: number;
  platformCount: number;
  totalTransactions: number;
  volumeByHour: { hour: string; volume: number; count: number }[];
  volumeBySport: { sport: Sport; volume: number; count: number }[];
}

export interface TopMover {
  player: string;
  sport: Sport;
  avgPrice: number;
  priceChange: number; // percentage
  transactionCount: number;
  direction: 'up' | 'down';
}

// ── Storage ─────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'msi_transaction_wire_v1';

function loadFromStorage(): Transaction[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

function saveToStorage(data: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// ── Mock Data ───────────────────────────────────────────────────────────────────

function generateMockTransactions(): Transaction[] {
  const now = Date.now();
  const h = (hours: number) => new Date(now - hours * 3600_000).toISOString();

  const transactions: Transaction[] = [
    {
      id: 'txn-001',
      player: 'Shohei Ohtani',
      cardDescription: '2018 Topps Chrome Update Auto PSA 10',
      price: 48500,
      previousPrice: 42000,
      buyerType: 'Institutional',
      sellerType: 'Consignor',
      platform: 'Goldin',
      timestamp: h(0.2),
      sport: 'MLB',
      isNotable: true,
    },
    {
      id: 'txn-002',
      player: 'Victor Wembanyama',
      cardDescription: '2023 Panini Prizm Silver PSA 10',
      price: 12800,
      previousPrice: 14200,
      buyerType: 'Collector',
      sellerType: 'Dealer',
      platform: 'eBay',
      timestamp: h(0.5),
      sport: 'NBA',
      isNotable: true,
    },
    {
      id: 'txn-003',
      player: 'Caleb Williams',
      cardDescription: '2024 Panini Prizm Base Auto BGS 9.5',
      price: 3200,
      previousPrice: 2800,
      buyerType: 'Investor',
      sellerType: 'Collector',
      platform: 'PWCC',
      timestamp: h(0.8),
      sport: 'NFL',
      isNotable: false,
    },
    {
      id: 'txn-004',
      player: 'Luka Doncic',
      cardDescription: '2018 Panini Prizm Silver PSA 10',
      price: 22500,
      previousPrice: 25800,
      buyerType: 'Dealer',
      sellerType: 'Estate',
      platform: 'Heritage',
      timestamp: h(1.1),
      sport: 'NBA',
      isNotable: true,
    },
    {
      id: 'txn-005',
      player: 'Gunnar Henderson',
      cardDescription: '2023 Topps Chrome Auto PSA 10',
      price: 5400,
      previousPrice: 4600,
      buyerType: 'Collector',
      sellerType: 'Dealer',
      platform: 'eBay',
      timestamp: h(1.5),
      sport: 'MLB',
      isNotable: false,
    },
    {
      id: 'txn-006',
      player: 'Anthony Edwards',
      cardDescription: '2020 Panini Prizm Silver PSA 10',
      price: 8900,
      previousPrice: 7200,
      buyerType: 'Flipper',
      sellerType: 'Auction House',
      platform: 'Goldin',
      timestamp: h(1.9),
      sport: 'NBA',
      isNotable: true,
    },
    {
      id: 'txn-007',
      player: 'CJ Stroud',
      cardDescription: '2023 Panini Prizm Neon Green /18 PSA 10',
      price: 7600,
      previousPrice: 6900,
      buyerType: 'Investor',
      sellerType: 'Consignor',
      platform: 'PWCC',
      timestamp: h(2.3),
      sport: 'NFL',
      isNotable: false,
    },
    {
      id: 'txn-008',
      player: 'Mike Trout',
      cardDescription: '2011 Topps Update PSA 10',
      price: 165000,
      previousPrice: 172000,
      buyerType: 'Institutional',
      sellerType: 'Consignor',
      platform: 'Heritage',
      timestamp: h(2.8),
      sport: 'MLB',
      isNotable: true,
    },
    {
      id: 'txn-009',
      player: 'Jayson Tatum',
      cardDescription: '2017 Panini Prizm Silver PSA 10',
      price: 4100,
      previousPrice: 4500,
      buyerType: 'Collector',
      sellerType: 'Dealer',
      platform: 'eBay',
      timestamp: h(3.2),
      sport: 'NBA',
      isNotable: false,
    },
    {
      id: 'txn-010',
      player: 'Elly De La Cruz',
      cardDescription: '2023 Bowman Chrome Auto PSA 10',
      price: 6200,
      previousPrice: 5100,
      buyerType: 'Flipper',
      sellerType: 'Collector',
      platform: 'MySlabs',
      timestamp: h(3.5),
      sport: 'MLB',
      isNotable: true,
    },
    {
      id: 'txn-011',
      player: 'Patrick Mahomes',
      cardDescription: '2017 Panini Prizm Silver PSA 10',
      price: 28500,
      previousPrice: 31000,
      buyerType: 'Institutional',
      sellerType: 'Estate',
      platform: 'Goldin',
      timestamp: h(4.0),
      sport: 'NFL',
      isNotable: true,
    },
    {
      id: 'txn-012',
      player: 'Paul Skenes',
      cardDescription: '2024 Topps Chrome Auto PSA 10',
      price: 9800,
      previousPrice: 8200,
      buyerType: 'Investor',
      sellerType: 'Dealer',
      platform: 'Fanatics',
      timestamp: h(4.5),
      sport: 'MLB',
      isNotable: true,
    },
    {
      id: 'txn-013',
      player: 'Chet Holmgren',
      cardDescription: '2022 Panini Prizm Silver Auto PSA 10',
      price: 3800,
      previousPrice: 4300,
      buyerType: 'Dealer',
      sellerType: 'Collector',
      platform: 'eBay',
      timestamp: h(5.0),
      sport: 'NBA',
      isNotable: false,
    },
    {
      id: 'txn-014',
      player: 'Marvin Harrison Jr.',
      cardDescription: '2024 Panini Prizm Base Auto BGS 9.5',
      price: 4500,
      previousPrice: 3600,
      buyerType: 'Collector',
      sellerType: 'Consignor',
      platform: 'PWCC',
      timestamp: h(5.8),
      sport: 'NFL',
      isNotable: false,
    },
    {
      id: 'txn-015',
      player: 'Juan Soto',
      cardDescription: '2019 Topps Chrome Update Auto PSA 10',
      price: 18700,
      previousPrice: 16500,
      buyerType: 'Institutional',
      sellerType: 'Auction House',
      platform: 'Heritage',
      timestamp: h(6.2),
      sport: 'MLB',
      isNotable: true,
    },
    {
      id: 'txn-016',
      player: 'Ja Morant',
      cardDescription: '2019 Panini Prizm Silver PSA 10',
      price: 2900,
      previousPrice: 3800,
      buyerType: 'Flipper',
      sellerType: 'Dealer',
      platform: 'eBay',
      timestamp: h(6.8),
      sport: 'NBA',
      isNotable: false,
    },
    {
      id: 'txn-017',
      player: 'Travis Hunter',
      cardDescription: '2025 Bowman University Chrome Auto /99',
      price: 5600,
      previousPrice: 4200,
      buyerType: 'Investor',
      sellerType: 'Collector',
      platform: 'Fanatics',
      timestamp: h(7.5),
      sport: 'NFL',
      isNotable: true,
    },
    {
      id: 'txn-018',
      player: 'Jackson Holliday',
      cardDescription: '2024 Topps Chrome Refractor Auto PSA 10',
      price: 7200,
      previousPrice: 6100,
      buyerType: 'Collector',
      sellerType: 'Dealer',
      platform: 'Goldin',
      timestamp: h(8.0),
      sport: 'MLB',
      isNotable: false,
    },
  ];

  return transactions;
}

// ── Service Functions ───────────────────────────────────────────────────────────

let cachedTransactions: Transaction[] | null = null;

function getTransactions(): Transaction[] {
  if (cachedTransactions) return cachedTransactions;
  const stored = loadFromStorage();
  if (stored && stored.length > 0) {
    cachedTransactions = stored;
    return stored;
  }
  const generated = generateMockTransactions();
  saveToStorage(generated);
  cachedTransactions = generated;
  return generated;
}

export function getRecentTransactions(limit?: number): Transaction[] {
  const txns = getTransactions().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return limit ? txns.slice(0, limit) : txns;
}

export function getTransactionStats(): TransactionStats {
  const txns = getTransactions();
  const totalVolume = txns.reduce((sum, t) => sum + t.price, 0);
  const avgPrice = totalVolume / txns.length;
  const notableDeals = txns.filter(t => t.isNotable).length;
  const platforms = new Set(txns.map(t => t.platform));

  // Volume by hour (last 12 hours)
  const volumeByHour: { hour: string; volume: number; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const hourStart = Date.now() - (i + 1) * 3600_000;
    const hourEnd = Date.now() - i * 3600_000;
    const hourTxns = txns.filter(t => {
      const ts = new Date(t.timestamp).getTime();
      return ts >= hourStart && ts < hourEnd;
    });
    const hourLabel = new Date(hourEnd).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: undefined,
      hour12: true,
    });
    volumeByHour.push({
      hour: hourLabel,
      volume: hourTxns.reduce((sum, t) => sum + t.price, 0),
      count: hourTxns.length,
    });
  }

  // Volume by sport
  const sportMap = new Map<Sport, { volume: number; count: number }>();
  txns.forEach(t => {
    const existing = sportMap.get(t.sport) || { volume: 0, count: 0 };
    existing.volume += t.price;
    existing.count += 1;
    sportMap.set(t.sport, existing);
  });
  const volumeBySport = Array.from(sportMap.entries()).map(([sport, data]) => ({
    sport,
    ...data,
  }));

  return {
    totalVolume,
    avgPrice,
    notableDeals,
    platformCount: platforms.size,
    totalTransactions: txns.length,
    volumeByHour,
    volumeBySport,
  };
}

export function getTopMovers(): TopMover[] {
  const txns = getTransactions();
  const playerMap = new Map<string, Transaction[]>();
  txns.forEach(t => {
    const existing = playerMap.get(t.player) || [];
    existing.push(t);
    playerMap.set(t.player, existing);
  });

  const movers: TopMover[] = [];
  playerMap.forEach((playerTxns, player) => {
    const avgPrice = playerTxns.reduce((s, t) => s + t.price, 0) / playerTxns.length;
    const avgPrev = playerTxns.reduce((s, t) => s + t.previousPrice, 0) / playerTxns.length;
    const priceChange = ((avgPrice - avgPrev) / avgPrev) * 100;
    movers.push({
      player,
      sport: playerTxns[0].sport,
      avgPrice,
      priceChange,
      transactionCount: playerTxns.length,
      direction: priceChange >= 0 ? 'up' : 'down',
    });
  });

  return movers.sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));
}

export default {
  getRecentTransactions,
  getTransactionStats,
  getTopMovers,
};
