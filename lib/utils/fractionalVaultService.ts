// ---------------------------------------------------------------------------
// Fractional Ownership Vault Service
// Tokenized fractional ownership of high-value sports cards with governance,
// dividend distribution, and secondary-market share trading.
// ---------------------------------------------------------------------------

// ---- Types ----------------------------------------------------------------

export type VaultStatus = 'open' | 'funded' | 'locked' | 'appreciating' | 'liquidating';
export type TransactionType = 'buy' | 'sell' | 'dividend' | 'split';
export type DividendSource = 'appreciation' | 'rental' | 'exhibition';
export type ProposalType = 'sell' | 'insure' | 'exhibit' | 'regrade';
export type ProposalStatus = 'voting' | 'passed' | 'rejected' | 'executed';
export type OrderType = 'buy' | 'sell';
export type OrderStatus = 'open' | 'filled' | 'partial' | 'cancelled';

export interface Shareholder {
  username: string;
  shares: number;
  joinedDate: string;
}

export interface VaultCard {
  id: string;
  cardName: string;
  player: string;
  year: number;
  grade: string;
  sport: string;
  totalValue: number;
  totalShares: number;
  availableShares: number;
  pricePerShare: number;
  minInvestment: number;
  vaultStatus: VaultStatus;
  custodian: string;
  insuranceValue: number;
  annualizedReturn: number;
  imageUrl: string;
  shareholders: Shareholder[];
  createdDate: string;
  description: string;
}

export interface SharePosition {
  id: string;
  vaultCardId: string;
  ownerUsername: string;
  shares: number;
  avgCostBasis: number;
  currentValue: number;
  unrealizedPnL: number;
  acquiredDate: string;
}

export interface VaultTransaction {
  id: string;
  type: TransactionType;
  vaultCardId: string;
  shares: number;
  pricePerShare: number;
  totalAmount: number;
  timestamp: string;
  fromUser: string;
  toUser: string;
}

export interface DividendDistribution {
  id: string;
  vaultCardId: string;
  totalAmount: number;
  perShareAmount: number;
  distributionDate: string;
  source: DividendSource;
  description: string;
}

export interface GovernanceProposal {
  id: string;
  vaultCardId: string;
  title: string;
  description: string;
  type: ProposalType;
  proposedBy: string;
  votesFor: number;
  votesAgainst: number;
  quorumRequired: number;
  status: ProposalStatus;
  deadline: string;
  createdDate: string;
}

export interface VaultGovernance {
  vaultCardId: string;
  proposals: GovernanceProposal[];
}

export interface SecondaryMarketOrder {
  id: string;
  vaultCardId: string;
  type: OrderType;
  shares: number;
  pricePerShare: number;
  status: OrderStatus;
  userId: string;
  createdAt: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalPnL: number;
  pnlPercent: number;
  positions: SharePosition[];
  totalDividendsReceived: number;
  vaultCount: number;
}

export interface VaultPerformance {
  vaultCardId: string;
  monthlyReturns: { month: string; vaultReturn: number; marketBenchmark: number; sp500: number }[];
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  beta: number;
}

// ---- Helpers --------------------------------------------------------------

const uid = (prefix: string, i: number) => `${prefix}-${String(i).padStart(4, '0')}`;

function dateStr(daysAgo: number): string {
  const d = new Date('2026-03-15T12:00:00Z');
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function formatCurrencyPrecise(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function formatPercent(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

// ---- Seeded random for deterministic mock data ----------------------------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

// ---- Mock shareholders pool -----------------------------------------------

const USERNAMES: string[] = [
  'CardShark_99', 'MintCondition', 'SlabKing', 'WaxPackWizard', 'GradeGuru',
  'VintageVault', 'RookieHunter', 'HallOfFamer', 'DiamondMint', 'TopDeckTrader',
  'PSA10Chaser', 'InvestorMike', 'SportsCapital', 'FractionalFan', 'TokenCollector',
  'CardWhale', 'EliteGrading', 'PatchAutoKing', 'SerialSniper', 'ChromeCollector',
  'JerseySwap', 'OneOfOneClub', 'BGS9Point5', 'PopReport', 'CenturyCards',
  'RarityHunter', 'BlueChipCards', 'ModernMint', 'LegacyInvestor', 'CardVaultPro',
  'GemMintGuy', 'SlabStack', 'RefractorKing', 'TrueGem10', 'PrismCollector',
  'DualAutoFan', 'NumberedCards', 'VaultedAssets', 'AltInvestor', 'GoldStandard',
  'PlatinumPull', 'EmeraldEdge', 'SapphireSlabs', 'DiamondDeck', 'RubyRC',
];

const CURRENT_USER = 'CardShark_99';

// ---- Mock vault cards (15) ------------------------------------------------

function makeShareholders(total: number, available: number): Shareholder[] {
  const takenShares = total - available;
  const holders: Shareholder[] = [];
  let remaining = takenShares;
  let idx = 0;
  while (remaining > 0 && idx < USERNAMES.length) {
    const chunk = Math.min(remaining, Math.max(1, Math.floor(rand() * (total * 0.15))));
    holders.push({ username: USERNAMES[idx], shares: chunk, joinedDate: dateStr(Math.floor(rand() * 300) + 30) });
    remaining -= chunk;
    idx++;
  }
  if (remaining > 0 && holders.length > 0) {
    holders[0].shares += remaining;
  }
  return holders;
}

const VAULT_CARDS: VaultCard[] = [
  {
    id: 'vc-0001', cardName: '1952 Topps #311 Mickey Mantle', player: 'Mickey Mantle', year: 1952,
    grade: 'PSA 8 NM-MT', sport: 'Baseball', totalValue: 4_800_000, totalShares: 10000,
    availableShares: 0, pricePerShare: 480, minInvestment: 480, vaultStatus: 'appreciating',
    custodian: 'PWCC Vault', insuranceValue: 5_280_000, annualizedReturn: 14.2,
    imageUrl: '', shareholders: [], createdDate: dateStr(540),
    description: 'The holy grail of post-war baseball cards. Population 12 in PSA 8 with only 6 higher.',
  },
  {
    id: 'vc-0002', cardName: '2003 Topps Chrome #111 LeBron James RC', player: 'LeBron James', year: 2003,
    grade: 'PSA 10 Gem Mint', sport: 'Basketball', totalValue: 1_250_000, totalShares: 5000,
    availableShares: 420, pricePerShare: 250, minInvestment: 250, vaultStatus: 'open',
    custodian: 'PSA Vault', insuranceValue: 1_375_000, annualizedReturn: 18.7,
    imageUrl: '', shareholders: [], createdDate: dateStr(320),
    description: 'King James rookie in perfect condition. Population 218 in PSA 10.',
  },
  {
    id: 'vc-0003', cardName: '2000 Playoff Contenders #144 Tom Brady RC Auto', player: 'Tom Brady', year: 2000,
    grade: 'BGS 9.5 Gem Mint', sport: 'Football', totalValue: 3_100_000, totalShares: 10000,
    availableShares: 0, pricePerShare: 310, minInvestment: 310, vaultStatus: 'appreciating',
    custodian: 'Goldin Vault', insuranceValue: 3_410_000, annualizedReturn: 22.4,
    imageUrl: '', shareholders: [], createdDate: dateStr(480),
    description: 'The GOAT auto rookie. Population 3 in BGS 9.5. Cornerstone football card.',
  },
  {
    id: 'vc-0004', cardName: '1979 O-Pee-Chee #18 Wayne Gretzky RC', player: 'Wayne Gretzky', year: 1979,
    grade: 'PSA 10 Gem Mint', sport: 'Hockey', totalValue: 3_750_000, totalShares: 7500,
    availableShares: 0, pricePerShare: 500, minInvestment: 500, vaultStatus: 'appreciating',
    custodian: 'PWCC Vault', insuranceValue: 4_125_000, annualizedReturn: 12.8,
    imageUrl: '', shareholders: [], createdDate: dateStr(600),
    description: 'The Great One in perfect 10. Population 2 — one of the rarest hockey cards in existence.',
  },
  {
    id: 'vc-0005', cardName: '1986 Fleer #57 Michael Jordan RC', player: 'Michael Jordan', year: 1986,
    grade: 'PSA 10 Gem Mint', sport: 'Basketball', totalValue: 1_680_000, totalShares: 8000,
    availableShares: 800, pricePerShare: 210, minInvestment: 210, vaultStatus: 'open',
    custodian: 'PSA Vault', insuranceValue: 1_848_000, annualizedReturn: 11.5,
    imageUrl: '', shareholders: [], createdDate: dateStr(400),
    description: 'His Airness in Gem Mint. The benchmark basketball card from the junk wax era.',
  },
  {
    id: 'vc-0006', cardName: '1916 Sporting News #151 Babe Ruth RC', player: 'Babe Ruth', year: 1916,
    grade: 'PSA 3 VG', sport: 'Baseball', totalValue: 7_200_000, totalShares: 20000,
    availableShares: 0, pricePerShare: 360, minInvestment: 360, vaultStatus: 'locked',
    custodian: 'Heritage Auctions Vault', insuranceValue: 8_640_000, annualizedReturn: 9.1,
    imageUrl: '', shareholders: [], createdDate: dateStr(720),
    description: 'Pre-war legend. One of roughly 10 examples known in any grade.',
  },
  {
    id: 'vc-0007', cardName: '2018 Panini National Treasures #163 Luka Doncic RPA', player: 'Luka Doncic', year: 2018,
    grade: 'BGS 9.5 Gem Mint', sport: 'Basketball', totalValue: 820_000, totalShares: 4000,
    availableShares: 1200, pricePerShare: 205, minInvestment: 205, vaultStatus: 'open',
    custodian: 'PWCC Vault', insuranceValue: 902_000, annualizedReturn: 24.6,
    imageUrl: '', shareholders: [], createdDate: dateStr(180),
    description: 'Luka rookie patch auto /99. One of the hottest modern basketball investments.',
  },
  {
    id: 'vc-0008', cardName: '1933 Goudey #53 Babe Ruth', player: 'Babe Ruth', year: 1933,
    grade: 'PSA 7 NM', sport: 'Baseball', totalValue: 1_100_000, totalShares: 5000,
    availableShares: 0, pricePerShare: 220, minInvestment: 220, vaultStatus: 'appreciating',
    custodian: 'Goldin Vault', insuranceValue: 1_210_000, annualizedReturn: 8.3,
    imageUrl: '', shareholders: [], createdDate: dateStr(510),
    description: 'Iconic Goudey issue. The yellow background Ruth is one of the most recognizable cards ever.',
  },
  {
    id: 'vc-0009', cardName: '2017 Panini National Treasures #161 Patrick Mahomes RPA', player: 'Patrick Mahomes', year: 2017,
    grade: 'BGS 9 Mint', sport: 'Football', totalValue: 960_000, totalShares: 4800,
    availableShares: 0, pricePerShare: 200, minInvestment: 200, vaultStatus: 'funded',
    custodian: 'PSA Vault', insuranceValue: 1_056_000, annualizedReturn: 28.3,
    imageUrl: '', shareholders: [], createdDate: dateStr(260),
    description: 'Mahomes RPA /99. Two-time Super Bowl MVP. Peak modern football investment.',
  },
  {
    id: 'vc-0010', cardName: '1909 T206 Honus Wagner', player: 'Honus Wagner', year: 1909,
    grade: 'SGC 3 VG', sport: 'Baseball', totalValue: 6_600_000, totalShares: 20000,
    availableShares: 0, pricePerShare: 330, minInvestment: 330, vaultStatus: 'appreciating',
    custodian: 'Heritage Auctions Vault', insuranceValue: 7_920_000, annualizedReturn: 7.5,
    imageUrl: '', shareholders: [], createdDate: dateStr(900),
    description: 'The most famous baseball card ever produced. Fewer than 60 known examples.',
  },
  {
    id: 'vc-0011', cardName: '2020 Panini Prizm #279 Justin Herbert RC', player: 'Justin Herbert', year: 2020,
    grade: 'PSA 10 Gem Mint', sport: 'Football', totalValue: 280_000, totalShares: 2000,
    availableShares: 600, pricePerShare: 140, minInvestment: 140, vaultStatus: 'open',
    custodian: 'PWCC Vault', insuranceValue: 308_000, annualizedReturn: 16.2,
    imageUrl: '', shareholders: [], createdDate: dateStr(120),
    description: 'Silver Prizm Herbert RC in perfect 10. One of the top modern football investments.',
  },
  {
    id: 'vc-0012', cardName: '2019 Panini Prizm #248 Zion Williamson RC', player: 'Zion Williamson', year: 2019,
    grade: 'PSA 10 Gem Mint', sport: 'Basketball', totalValue: 340_000, totalShares: 2000,
    availableShares: 300, pricePerShare: 170, minInvestment: 170, vaultStatus: 'open',
    custodian: 'PSA Vault', insuranceValue: 374_000, annualizedReturn: -4.8,
    imageUrl: '', shareholders: [], createdDate: dateStr(210),
    description: 'Silver Prizm Zion RC. High risk / high reward play tied to health and performance.',
  },
  {
    id: 'vc-0013', cardName: '2001 SP Authentic #91 Tiger Woods RC Auto', player: 'Tiger Woods', year: 2001,
    grade: 'BGS 9.5 Gem Mint', sport: 'Golf', totalValue: 520_000, totalShares: 2600,
    availableShares: 0, pricePerShare: 200, minInvestment: 200, vaultStatus: 'appreciating',
    custodian: 'Goldin Vault', insuranceValue: 572_000, annualizedReturn: 10.9,
    imageUrl: '', shareholders: [], createdDate: dateStr(365),
    description: 'Tiger Woods gold auto RC /900. The benchmark golf card. Consistently appreciating.',
  },
  {
    id: 'vc-0014', cardName: '2023 Panini Prizm #275 Victor Wembanyama RC', player: 'Victor Wembanyama', year: 2023,
    grade: 'PSA 10 Gem Mint', sport: 'Basketball', totalValue: 185_000, totalShares: 1000,
    availableShares: 450, pricePerShare: 185, minInvestment: 185, vaultStatus: 'open',
    custodian: 'PWCC Vault', insuranceValue: 203_500, annualizedReturn: 42.1,
    imageUrl: '', shareholders: [], createdDate: dateStr(60),
    description: 'Wemby Silver Prizm RC. Generational talent with massive upside. Early-stage vault.',
  },
  {
    id: 'vc-0015', cardName: '1969 Topps #260 Reggie Jackson RC', player: 'Reggie Jackson', year: 1969,
    grade: 'PSA 9 Mint', sport: 'Baseball', totalValue: 210_000, totalShares: 1500,
    availableShares: 0, pricePerShare: 140, minInvestment: 140, vaultStatus: 'liquidating',
    custodian: 'Heritage Auctions Vault', insuranceValue: 231_000, annualizedReturn: 6.2,
    imageUrl: '', shareholders: [], createdDate: dateStr(800),
    description: 'Mr. October RC in near-perfect grade. Governance approved liquidation at 6.2% annualized.',
  },
];

// Populate shareholders for each vault card
VAULT_CARDS.forEach((vc) => {
  vc.shareholders = makeShareholders(vc.totalShares, vc.availableShares);
});

// ---- Mock share positions for current user --------------------------------

const SHARE_POSITIONS: SharePosition[] = [
  { id: 'sp-0001', vaultCardId: 'vc-0001', ownerUsername: CURRENT_USER, shares: 120, avgCostBasis: 420, currentValue: 120 * 480, unrealizedPnL: 120 * (480 - 420), acquiredDate: dateStr(500) },
  { id: 'sp-0002', vaultCardId: 'vc-0002', ownerUsername: CURRENT_USER, shares: 80, avgCostBasis: 215, currentValue: 80 * 250, unrealizedPnL: 80 * (250 - 215), acquiredDate: dateStr(280) },
  { id: 'sp-0003', vaultCardId: 'vc-0003', ownerUsername: CURRENT_USER, shares: 200, avgCostBasis: 275, currentValue: 200 * 310, unrealizedPnL: 200 * (310 - 275), acquiredDate: dateStr(450) },
  { id: 'sp-0004', vaultCardId: 'vc-0004', ownerUsername: CURRENT_USER, shares: 50, avgCostBasis: 465, currentValue: 50 * 500, unrealizedPnL: 50 * (500 - 465), acquiredDate: dateStr(550) },
  { id: 'sp-0005', vaultCardId: 'vc-0005', ownerUsername: CURRENT_USER, shares: 150, avgCostBasis: 195, currentValue: 150 * 210, unrealizedPnL: 150 * (210 - 195), acquiredDate: dateStr(370) },
  { id: 'sp-0006', vaultCardId: 'vc-0010', ownerUsername: CURRENT_USER, shares: 300, avgCostBasis: 290, currentValue: 300 * 330, unrealizedPnL: 300 * (330 - 290), acquiredDate: dateStr(800) },
  { id: 'sp-0007', vaultCardId: 'vc-0009', ownerUsername: CURRENT_USER, shares: 100, avgCostBasis: 165, currentValue: 100 * 200, unrealizedPnL: 100 * (200 - 165), acquiredDate: dateStr(240) },
  { id: 'sp-0008', vaultCardId: 'vc-0013', ownerUsername: CURRENT_USER, shares: 60, avgCostBasis: 180, currentValue: 60 * 200, unrealizedPnL: 60 * (200 - 180), acquiredDate: dateStr(340) },
  { id: 'sp-0009', vaultCardId: 'vc-0014', ownerUsername: CURRENT_USER, shares: 40, avgCostBasis: 155, currentValue: 40 * 185, unrealizedPnL: 40 * (185 - 155), acquiredDate: dateStr(50) },
  { id: 'sp-0010', vaultCardId: 'vc-0015', ownerUsername: CURRENT_USER, shares: 75, avgCostBasis: 128, currentValue: 75 * 140, unrealizedPnL: 75 * (140 - 128), acquiredDate: dateStr(750) },
];

// ---- Mock transactions (130+) ---------------------------------------------

function generateTransactions(): VaultTransaction[] {
  const txns: VaultTransaction[] = [];
  let counter = 1;
  const vaultIds = VAULT_CARDS.map((v) => v.id);
  const rng = seededRandom(1337);

  for (let day = 360; day >= 0; day -= 2) {
    const count = day % 7 === 0 ? 4 : day % 5 === 0 ? 3 : day % 3 === 0 ? 2 : 1;
    for (let j = 0; j < count && counter <= 135; j++) {
      const vcIdx = counter % vaultIds.length;
      const vc = VAULT_CARDS[vcIdx];
      const typeRoll = counter % 10;
      let type: TransactionType = 'buy';
      if (typeRoll < 5) type = 'buy';
      else if (typeRoll < 8) type = 'sell';
      else if (typeRoll === 8) type = 'dividend';
      else type = 'split';

      const shares = type === 'dividend' ? vc.totalShares : Math.floor(rng() * 50) + 5;
      const pps = type === 'dividend'
        ? +(vc.pricePerShare * 0.005 * (1 + rng())).toFixed(2)
        : +(vc.pricePerShare * (0.92 + rng() * 0.16)).toFixed(2);
      const from = type === 'buy' ? 'Vault' : USERNAMES[counter % USERNAMES.length];
      const to = type === 'sell' ? 'Vault' : USERNAMES[(counter + 7) % USERNAMES.length];

      txns.push({
        id: uid('tx', counter),
        type,
        vaultCardId: vc.id,
        shares,
        pricePerShare: pps,
        totalAmount: +(shares * pps).toFixed(2),
        timestamp: dateStr(day),
        fromUser: from,
        toUser: to,
      });
      counter++;
    }
  }
  return txns;
}

const TRANSACTIONS: VaultTransaction[] = generateTransactions();

// ---- Mock dividend distributions ------------------------------------------

function generateDividends(): DividendDistribution[] {
  const divs: DividendDistribution[] = [];
  let counter = 1;
  const sources: DividendSource[] = ['appreciation', 'rental', 'exhibition'];
  const sourceDescs: Record<DividendSource, string[]> = {
    appreciation: ['Quarterly appreciation mark-to-market', 'Semi-annual reappraisal gain', 'Annual valuation increase distribution'],
    rental: ['Card loaned for PSA set registry display', 'Museum exhibition loan fee', 'Private showing rental income'],
    exhibition: ['National Card Show exhibition revenue', 'Hall of Fame display partnership', 'ESPN documentary usage license'],
  };

  for (const vc of VAULT_CARDS) {
    if (vc.vaultStatus === 'open') continue;
    const numDivs = vc.vaultStatus === 'appreciating' ? 8 : vc.vaultStatus === 'locked' ? 5 : 3;
    for (let i = 0; i < numDivs; i++) {
      const source = sources[counter % 3];
      const perShare = +(vc.pricePerShare * (0.003 + rand() * 0.012)).toFixed(2);
      divs.push({
        id: uid('div', counter),
        vaultCardId: vc.id,
        totalAmount: +(perShare * vc.totalShares).toFixed(2),
        perShareAmount: perShare,
        distributionDate: dateStr(i * 45 + 15),
        source,
        description: sourceDescs[source][counter % sourceDescs[source].length],
      });
      counter++;
    }
  }
  return divs;
}

const DIVIDENDS: DividendDistribution[] = generateDividends();

// ---- Mock governance proposals (8 active + historical) --------------------

const GOVERNANCE_PROPOSALS: GovernanceProposal[] = [
  {
    id: 'gp-0001', vaultCardId: 'vc-0001', title: 'Loan Mantle to Cooperstown Exhibit',
    description: 'The National Baseball Hall of Fame has offered $45,000/year to display the 1952 Mantle for a 2-year rotating exhibit. Insurance fully covered by the museum.',
    type: 'exhibit', proposedBy: 'HallOfFamer', votesFor: 6800, votesAgainst: 1200, quorumRequired: 5000,
    status: 'voting', deadline: dateStr(-14), createdDate: dateStr(30),
  },
  {
    id: 'gp-0002', vaultCardId: 'vc-0003', title: 'Regrade Brady RC from BGS to PSA',
    description: 'Cross-grading the Brady RC Auto from BGS 9.5 to PSA could yield a PSA 10, which would increase value by an estimated 40-60%. Risk: could also receive PSA 9.',
    type: 'regrade', proposedBy: 'GradeGuru', votesFor: 4200, votesAgainst: 3800, quorumRequired: 5000,
    status: 'voting', deadline: dateStr(-7), createdDate: dateStr(21),
  },
  {
    id: 'gp-0003', vaultCardId: 'vc-0010', title: 'Increase Insurance Coverage to $10M',
    description: 'Recent T206 Wagner sales suggest our current $7.92M insurance is undervalued. Proposal to increase to $10M. Additional annual premium: $18,400.',
    type: 'insure', proposedBy: 'VaultedAssets', votesFor: 14500, votesAgainst: 2100, quorumRequired: 10000,
    status: 'passed', deadline: dateStr(10), createdDate: dateStr(45),
  },
  {
    id: 'gp-0004', vaultCardId: 'vc-0015', title: 'Liquidate Reggie Jackson RC Vault',
    description: 'After 2+ years of modest 6.2% returns, proposal to sell at Heritage Auctions May 2026 event. Expected hammer: $210K-$240K.',
    type: 'sell', proposedBy: 'InvestorMike', votesFor: 1100, votesAgainst: 250, quorumRequired: 750,
    status: 'executed', deadline: dateStr(20), createdDate: dateStr(60),
  },
  {
    id: 'gp-0005', vaultCardId: 'vc-0004', title: 'Exhibit Gretzky RC at Hockey Hall of Fame',
    description: 'Toronto Hockey HoF exhibition deal: $60,000/year for 3-year loan. Card remains insured under vault policy. Exhibition income distributed as quarterly dividends.',
    type: 'exhibit', proposedBy: 'DiamondMint', votesFor: 5100, votesAgainst: 900, quorumRequired: 3750,
    status: 'voting', deadline: dateStr(-10), createdDate: dateStr(25),
  },
  {
    id: 'gp-0006', vaultCardId: 'vc-0005', title: 'Sell MJ RC at Goldin 100 Auction',
    description: 'Goldin has offered a guaranteed minimum of $1.8M for the Jordan RC in their elite Goldin 100 auction format. This represents a 7.1% premium to current NAV.',
    type: 'sell', proposedBy: 'SportsCapital', votesFor: 2400, votesAgainst: 4100, quorumRequired: 4000,
    status: 'voting', deadline: dateStr(-21), createdDate: dateStr(15),
  },
  {
    id: 'gp-0007', vaultCardId: 'vc-0009', title: 'Regrade Mahomes RPA to PSA',
    description: 'BGS 9 to PSA cross could yield PSA 10 (estimated 25% probability) or PSA 9 (65%). PSA 10 value: ~$1.8M. Current BGS 9 value: $960K.',
    type: 'regrade', proposedBy: 'PSA10Chaser', votesFor: 1800, votesAgainst: 2200, quorumRequired: 2400,
    status: 'voting', deadline: dateStr(-5), createdDate: dateStr(18),
  },
  {
    id: 'gp-0008', vaultCardId: 'vc-0006', title: 'Insure Babe Ruth RC for $10M',
    description: 'Current insurance at $8.64M is below recent comparable sales. 1916 Ruth RC PSA 2 sold for $7.2M. Our PSA 3 warrants $10M coverage minimum.',
    type: 'insure', proposedBy: 'LegacyInvestor', votesFor: 12000, votesAgainst: 3500, quorumRequired: 10000,
    status: 'passed', deadline: dateStr(5), createdDate: dateStr(40),
  },
];

// ---- Mock secondary market orders -----------------------------------------

function generateOrders(): SecondaryMarketOrder[] {
  const orders: SecondaryMarketOrder[] = [];
  let c = 1;
  const rng = seededRandom(9999);
  for (const vc of VAULT_CARDS) {
    for (let i = 0; i < 4; i++) {
      const discount = 0.92 + rng() * 0.06;
      orders.push({
        id: uid('ord', c++),
        vaultCardId: vc.id,
        type: 'buy',
        shares: Math.floor(rng() * 30) + 5,
        pricePerShare: +(vc.pricePerShare * discount).toFixed(2),
        status: 'open',
        userId: USERNAMES[c % USERNAMES.length],
        createdAt: dateStr(Math.floor(rng() * 14)),
      });
    }
    for (let i = 0; i < 3; i++) {
      const premium = 1.02 + rng() * 0.08;
      orders.push({
        id: uid('ord', c++),
        vaultCardId: vc.id,
        type: 'sell',
        shares: Math.floor(rng() * 25) + 3,
        pricePerShare: +(vc.pricePerShare * premium).toFixed(2),
        status: 'open',
        userId: USERNAMES[(c + 3) % USERNAMES.length],
        createdAt: dateStr(Math.floor(rng() * 14)),
      });
    }
    orders.push({
      id: uid('ord', c++),
      vaultCardId: vc.id,
      type: 'buy',
      shares: Math.floor(rng() * 20) + 2,
      pricePerShare: +(vc.pricePerShare * (0.98 + rng() * 0.04)).toFixed(2),
      status: 'filled',
      userId: USERNAMES[(c + 5) % USERNAMES.length],
      createdAt: dateStr(Math.floor(rng() * 30) + 14),
    });
    c++;
  }
  return orders;
}

const SECONDARY_ORDERS: SecondaryMarketOrder[] = generateOrders();

// ---- Performance data generator -------------------------------------------

function generatePerformance(vc: VaultCard): VaultPerformance {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthly: VaultPerformance['monthlyReturns'] = [];
  let cumulativeVault = 0;
  let cumulativeMarket = 0;
  let cumulativeSP = 0;
  const rng = seededRandom(vc.totalValue % 99999);

  for (let y = 2024; y <= 2026; y++) {
    const endMonth = y === 2026 ? 2 : 11;
    for (let m = 0; m <= endMonth; m++) {
      const vr = +(vc.annualizedReturn / 12 * (0.4 + rng() * 1.2) * (rng() > 0.25 ? 1 : -1)).toFixed(2);
      const mr = +((8.5 / 12) * (0.3 + rng() * 1.4) * (rng() > 0.35 ? 1 : -1)).toFixed(2);
      const sp = +((10.2 / 12) * (0.3 + rng() * 1.4) * (rng() > 0.4 ? 1 : -1)).toFixed(2);
      cumulativeVault += vr;
      cumulativeMarket += mr;
      cumulativeSP += sp;
      monthly.push({
        month: `${months[m]} ${y}`,
        vaultReturn: +cumulativeVault.toFixed(2),
        marketBenchmark: +cumulativeMarket.toFixed(2),
        sp500: +cumulativeSP.toFixed(2),
      });
    }
  }

  return {
    vaultCardId: vc.id,
    monthlyReturns: monthly,
    totalReturn: +cumulativeVault.toFixed(2),
    sharpeRatio: +(0.8 + rng() * 1.8).toFixed(2),
    maxDrawdown: +(-(3 + rng() * 12)).toFixed(2),
    volatility: +(8 + rng() * 18).toFixed(2),
    beta: +(0.3 + rng() * 0.9).toFixed(2),
  };
}

const PERFORMANCE_CACHE: Record<string, VaultPerformance> = {};
VAULT_CARDS.forEach((vc) => {
  PERFORMANCE_CACHE[vc.id] = generatePerformance(vc);
});

// ---- Public API -----------------------------------------------------------

export function getVaultCards(): VaultCard[] {
  return VAULT_CARDS;
}

export function getVaultDetail(id: string): VaultCard | undefined {
  return VAULT_CARDS.find((v) => v.id === id);
}

export function getSharePosition(vaultId: string, userId: string = CURRENT_USER): SharePosition | undefined {
  return SHARE_POSITIONS.find((sp) => sp.vaultCardId === vaultId && sp.ownerUsername === userId);
}

export function getAllSharePositions(userId: string = CURRENT_USER): SharePosition[] {
  return SHARE_POSITIONS.filter((sp) => sp.ownerUsername === userId);
}

export function getVaultTransactions(vaultId: string): VaultTransaction[] {
  return TRANSACTIONS.filter((t) => t.vaultCardId === vaultId);
}

export function getAllTransactions(): VaultTransaction[] {
  return TRANSACTIONS;
}

export function getDividendHistory(vaultId: string): DividendDistribution[] {
  return DIVIDENDS.filter((d) => d.vaultCardId === vaultId);
}

export function getAllDividends(): DividendDistribution[] {
  return DIVIDENDS;
}

export function getGovernanceProposals(vaultId?: string): GovernanceProposal[] {
  if (vaultId) return GOVERNANCE_PROPOSALS.filter((g) => g.vaultCardId === vaultId);
  return GOVERNANCE_PROPOSALS;
}

export function getSecondaryMarket(vaultId?: string): SecondaryMarketOrder[] {
  if (vaultId) return SECONDARY_ORDERS.filter((o) => o.vaultCardId === vaultId);
  return SECONDARY_ORDERS;
}

export function getPortfolioSummary(userId: string = CURRENT_USER): PortfolioSummary {
  const positions = SHARE_POSITIONS.filter((sp) => sp.ownerUsername === userId);
  const totalInvested = positions.reduce((s, p) => s + p.avgCostBasis * p.shares, 0);
  const currentValue = positions.reduce((s, p) => s + p.currentValue, 0);
  const totalPnL = currentValue - totalInvested;

  const heldVaultIds = new Set(positions.map((p) => p.vaultCardId));
  let totalDividendsReceived = 0;
  for (const div of DIVIDENDS) {
    if (heldVaultIds.has(div.vaultCardId)) {
      const pos = positions.find((p) => p.vaultCardId === div.vaultCardId);
      if (pos) totalDividendsReceived += div.perShareAmount * pos.shares;
    }
  }

  return {
    totalInvested,
    currentValue,
    totalPnL,
    pnlPercent: totalInvested > 0 ? +((totalPnL / totalInvested) * 100).toFixed(2) : 0,
    positions,
    totalDividendsReceived: +totalDividendsReceived.toFixed(2),
    vaultCount: positions.length,
  };
}

export function getVaultPerformance(vaultId: string): VaultPerformance | undefined {
  return PERFORMANCE_CACHE[vaultId];
}

export function getCurrentUser(): string {
  return CURRENT_USER;
}
