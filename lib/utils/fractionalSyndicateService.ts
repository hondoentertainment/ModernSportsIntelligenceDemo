// ---- Types ----

export interface SyndicateMember {
  id: string;
  name: string;
  ownershipPercent: number;
  capitalContributed: number;
  currentValue: number;
  votingPower: number;
  joinedAt: string;
  role: 'lead' | 'member' | 'advisor';
}

export interface Syndicate {
  id: string;
  name: string;
  description: string;
  leadManager: string;
  members: SyndicateMember[];
  totalCapital: number;
  deployedCapital: number;
  unrealizedGain: number;
  status: 'forming' | 'active' | 'liquidating' | 'closed';
  createdAt: string;
  votingThreshold: number;
  minInvestment: number;
}

export interface SyndicateAsset {
  id: string;
  syndicateId: string;
  cardName: string;
  playerName: string;
  purchasePrice: number;
  currentValue: number;
  acquisitionDate: string;
  acquisitionVote: { forPercent: number; againstPercent: number };
  status: 'held' | 'listed' | 'sold';
}

export interface GovernanceVote {
  id: string;
  syndicateId: string;
  proposalTitle: string;
  proposalType: 'acquire' | 'sell' | 'distribute' | 'add-member' | 'dissolve';
  status: 'active' | 'passed' | 'rejected' | 'expired';
  forVotes: number;
  againstVotes: number;
  deadline: string;
  quorum: number;
}

export interface SyndicateStats {
  totalSyndicates: number;
  totalCapitalManaged: number;
  avgReturn: number;
  activeSyndicates: number;
  pendingVotes: number;
  totalMembers: number;
}

// ---- Mock Members ----

const mockMembers: Record<string, SyndicateMember[]> = {
  syn_1: [
    { id: 'mem_1', name: 'Marcus Chen', ownershipPercent: 35, capitalContributed: 52500, currentValue: 63875, votingPower: 35, joinedAt: '2024-08-15', role: 'lead' },
    { id: 'mem_2', name: 'Sarah Kowalski', ownershipPercent: 25, capitalContributed: 37500, currentValue: 45625, votingPower: 25, joinedAt: '2024-08-18', role: 'member' },
    { id: 'mem_3', name: 'Derek Williams', ownershipPercent: 20, capitalContributed: 30000, currentValue: 36500, votingPower: 20, joinedAt: '2024-08-20', role: 'member' },
    { id: 'mem_4', name: 'Lena Okafor', ownershipPercent: 15, capitalContributed: 22500, currentValue: 27375, votingPower: 15, joinedAt: '2024-09-01', role: 'member' },
    { id: 'mem_5', name: 'Tom Reeves', ownershipPercent: 5, capitalContributed: 7500, currentValue: 9125, votingPower: 5, joinedAt: '2024-09-10', role: 'advisor' },
  ],
  syn_2: [
    { id: 'mem_6', name: 'Angela Ruiz', ownershipPercent: 30, capitalContributed: 75000, currentValue: 81000, votingPower: 30, joinedAt: '2024-06-01', role: 'lead' },
    { id: 'mem_7', name: 'Jake Thornton', ownershipPercent: 25, capitalContributed: 62500, currentValue: 67500, votingPower: 25, joinedAt: '2024-06-05', role: 'member' },
    { id: 'mem_8', name: 'Priya Nair', ownershipPercent: 20, capitalContributed: 50000, currentValue: 54000, votingPower: 20, joinedAt: '2024-06-10', role: 'member' },
    { id: 'mem_9', name: 'Carlos Vega', ownershipPercent: 15, capitalContributed: 37500, currentValue: 40500, votingPower: 15, joinedAt: '2024-06-15', role: 'member' },
    { id: 'mem_10', name: 'Hannah Liu', ownershipPercent: 10, capitalContributed: 25000, currentValue: 27000, votingPower: 10, joinedAt: '2024-07-01', role: 'advisor' },
  ],
  syn_3: [
    { id: 'mem_11', name: 'Ray Patterson', ownershipPercent: 40, capitalContributed: 20000, currentValue: 18400, votingPower: 40, joinedAt: '2025-01-10', role: 'lead' },
    { id: 'mem_12', name: 'Mia Santos', ownershipPercent: 35, capitalContributed: 17500, currentValue: 16100, votingPower: 35, joinedAt: '2025-01-12', role: 'member' },
    { id: 'mem_13', name: 'Nolan Beck', ownershipPercent: 25, capitalContributed: 12500, currentValue: 11500, votingPower: 25, joinedAt: '2025-01-15', role: 'member' },
  ],
  syn_4: [
    { id: 'mem_14', name: 'Olivia Grant', ownershipPercent: 25, capitalContributed: 100000, currentValue: 122000, votingPower: 25, joinedAt: '2024-03-01', role: 'lead' },
    { id: 'mem_15', name: 'Ethan Brooks', ownershipPercent: 20, capitalContributed: 80000, currentValue: 97600, votingPower: 20, joinedAt: '2024-03-05', role: 'member' },
    { id: 'mem_16', name: 'Sofia Alvarez', ownershipPercent: 20, capitalContributed: 80000, currentValue: 97600, votingPower: 20, joinedAt: '2024-03-08', role: 'member' },
    { id: 'mem_17', name: 'Will Nguyen', ownershipPercent: 15, capitalContributed: 60000, currentValue: 73200, votingPower: 15, joinedAt: '2024-03-12', role: 'member' },
    { id: 'mem_18', name: 'Ava Kim', ownershipPercent: 10, capitalContributed: 40000, currentValue: 48800, votingPower: 10, joinedAt: '2024-04-01', role: 'member' },
    { id: 'mem_19', name: 'James Patel', ownershipPercent: 10, capitalContributed: 40000, currentValue: 48800, votingPower: 10, joinedAt: '2024-04-15', role: 'advisor' },
  ],
  syn_5: [
    { id: 'mem_20', name: 'Zara Mitchell', ownershipPercent: 34, capitalContributed: 8500, currentValue: 8500, votingPower: 34, joinedAt: '2025-03-01', role: 'lead' },
    { id: 'mem_21', name: 'Leo Fernandez', ownershipPercent: 33, capitalContributed: 8250, currentValue: 8250, votingPower: 33, joinedAt: '2025-03-02', role: 'member' },
    { id: 'mem_22', name: 'Nina Park', ownershipPercent: 33, capitalContributed: 8250, currentValue: 8250, votingPower: 33, joinedAt: '2025-03-03', role: 'member' },
  ],
};

// ---- Mock Syndicates ----

const mockSyndicates: Syndicate[] = [
  {
    id: 'syn_1',
    name: 'Alpha Grail Hunters',
    description: 'Focused on acquiring PSA 10 grail cards from the 1986-1996 basketball era. Targeting iconic rookies with long-term appreciation potential.',
    leadManager: 'mem_1',
    members: mockMembers['syn_1'],
    totalCapital: 150000,
    deployedCapital: 118500,
    unrealizedGain: 32500,
    status: 'active',
    createdAt: '2024-08-15',
    votingThreshold: 66,
    minInvestment: 5000,
  },
  {
    id: 'syn_2',
    name: 'Modern Prospects Fund',
    description: 'Investing in current NFL and NBA rookie cards with breakout potential. High-conviction bets on upcoming superstars before mainstream recognition.',
    leadManager: 'mem_6',
    members: mockMembers['syn_2'],
    totalCapital: 250000,
    deployedCapital: 195000,
    unrealizedGain: 20000,
    status: 'active',
    createdAt: '2024-06-01',
    votingThreshold: 75,
    minInvestment: 10000,
  },
  {
    id: 'syn_3',
    name: 'Vintage Baseball Collective',
    description: 'Targeting pre-war and post-war baseball cards in mid-grade condition. Contrarian play on undervalued vintage assets.',
    leadManager: 'mem_11',
    members: mockMembers['syn_3'],
    totalCapital: 50000,
    deployedCapital: 42000,
    unrealizedGain: -4000,
    status: 'active',
    createdAt: '2025-01-10',
    votingThreshold: 51,
    minInvestment: 2500,
  },
  {
    id: 'syn_4',
    name: 'Blue Chip Index SPV',
    description: 'Diversified portfolio mirroring the top 20 most traded sports cards by volume. Passive index-style exposure to the overall market.',
    leadManager: 'mem_14',
    members: mockMembers['syn_4'],
    totalCapital: 400000,
    deployedCapital: 348000,
    unrealizedGain: 88000,
    status: 'active',
    createdAt: '2024-03-01',
    votingThreshold: 80,
    minInvestment: 25000,
  },
  {
    id: 'syn_5',
    name: 'Soccer Emerging Stars',
    description: 'Early-stage bets on international soccer prospects. Targeting Topps Chrome and Panini Prizm rookies from European leagues.',
    leadManager: 'mem_20',
    members: mockMembers['syn_5'],
    totalCapital: 25000,
    deployedCapital: 0,
    unrealizedGain: 0,
    status: 'forming',
    createdAt: '2025-03-01',
    votingThreshold: 60,
    minInvestment: 2000,
  },
];

// ---- Mock Assets ----

const mockAssets: SyndicateAsset[] = [
  // syn_1 assets (Alpha Grail Hunters)
  { id: 'ast_1', syndicateId: 'syn_1', cardName: '1986 Fleer #57 Michael Jordan RC', playerName: 'Michael Jordan', purchasePrice: 42000, currentValue: 51500, acquisitionDate: '2024-09-01', acquisitionVote: { forPercent: 92, againstPercent: 8 }, status: 'held' },
  { id: 'ast_2', syndicateId: 'syn_1', cardName: '1996 Topps Chrome #138 Kobe Bryant RC', playerName: 'Kobe Bryant', purchasePrice: 28000, currentValue: 35200, acquisitionDate: '2024-10-15', acquisitionVote: { forPercent: 85, againstPercent: 15 }, status: 'held' },
  { id: 'ast_3', syndicateId: 'syn_1', cardName: '1986 Fleer #68 Karl Malone RC', playerName: 'Karl Malone', purchasePrice: 4500, currentValue: 5100, acquisitionDate: '2024-11-20', acquisitionVote: { forPercent: 72, againstPercent: 28 }, status: 'listed' },
  { id: 'ast_4', syndicateId: 'syn_1', cardName: '1992 Topps Gold #362 Shaquille ONeal RC', playerName: 'Shaquille ONeal', purchasePrice: 44000, currentValue: 59200, acquisitionDate: '2024-09-18', acquisitionVote: { forPercent: 88, againstPercent: 12 }, status: 'held' },

  // syn_2 assets (Modern Prospects Fund)
  { id: 'ast_5', syndicateId: 'syn_2', cardName: '2020 Panini Prizm #280 Justin Herbert RC', playerName: 'Justin Herbert', purchasePrice: 18500, currentValue: 22400, acquisitionDate: '2024-07-10', acquisitionVote: { forPercent: 78, againstPercent: 22 }, status: 'held' },
  { id: 'ast_6', syndicateId: 'syn_2', cardName: '2023 Panini Prizm #301 Victor Wembanyama RC', playerName: 'Victor Wembanyama', purchasePrice: 65000, currentValue: 71200, acquisitionDate: '2024-08-05', acquisitionVote: { forPercent: 95, againstPercent: 5 }, status: 'held' },
  { id: 'ast_7', syndicateId: 'syn_2', cardName: '2022 Topps Chrome #150 Julio Rodriguez RC', playerName: 'Julio Rodriguez', purchasePrice: 12000, currentValue: 9800, acquisitionDate: '2024-09-20', acquisitionVote: { forPercent: 65, againstPercent: 35 }, status: 'held' },
  { id: 'ast_8', syndicateId: 'syn_2', cardName: '2021 Panini Prizm #331 Cade Cunningham RC', playerName: 'Cade Cunningham', purchasePrice: 8500, currentValue: 6200, acquisitionDate: '2024-10-01', acquisitionVote: { forPercent: 58, againstPercent: 42 }, status: 'sold' },

  // syn_3 assets (Vintage Baseball Collective)
  { id: 'ast_9', syndicateId: 'syn_3', cardName: '1952 Topps #311 Mickey Mantle', playerName: 'Mickey Mantle', purchasePrice: 25000, currentValue: 23500, acquisitionDate: '2025-01-25', acquisitionVote: { forPercent: 80, againstPercent: 20 }, status: 'held' },
  { id: 'ast_10', syndicateId: 'syn_3', cardName: '1955 Topps #164 Roberto Clemente RC', playerName: 'Roberto Clemente', purchasePrice: 12000, currentValue: 11200, acquisitionDate: '2025-02-10', acquisitionVote: { forPercent: 74, againstPercent: 26 }, status: 'held' },
  { id: 'ast_11', syndicateId: 'syn_3', cardName: '1954 Topps #128 Hank Aaron RC', playerName: 'Hank Aaron', purchasePrice: 5000, currentValue: 5300, acquisitionDate: '2025-02-28', acquisitionVote: { forPercent: 90, againstPercent: 10 }, status: 'held' },

  // syn_4 assets (Blue Chip Index SPV)
  { id: 'ast_12', syndicateId: 'syn_4', cardName: '2018 Panini Prizm #280 Luka Doncic RC', playerName: 'Luka Doncic', purchasePrice: 95000, currentValue: 118000, acquisitionDate: '2024-04-01', acquisitionVote: { forPercent: 98, againstPercent: 2 }, status: 'held' },
  { id: 'ast_13', syndicateId: 'syn_4', cardName: '2019 Panini Prizm #248 Ja Morant RC', playerName: 'Ja Morant', purchasePrice: 42000, currentValue: 38500, acquisitionDate: '2024-04-15', acquisitionVote: { forPercent: 82, againstPercent: 18 }, status: 'held' },
  { id: 'ast_14', syndicateId: 'syn_4', cardName: '2020 Panini Prizm #258 Anthony Edwards RC', playerName: 'Anthony Edwards', purchasePrice: 55000, currentValue: 72000, acquisitionDate: '2024-05-01', acquisitionVote: { forPercent: 91, againstPercent: 9 }, status: 'held' },
  { id: 'ast_15', syndicateId: 'syn_4', cardName: '2003 Topps Chrome #111 LeBron James RC', playerName: 'LeBron James', purchasePrice: 156000, currentValue: 209500, acquisitionDate: '2024-06-10', acquisitionVote: { forPercent: 96, againstPercent: 4 }, status: 'held' },
];

// ---- Mock Governance Votes ----

const mockVotes: GovernanceVote[] = [
  { id: 'vote_1', syndicateId: 'syn_1', proposalTitle: 'Acquire 1993 Finest Refractor #1 Jordan', proposalType: 'acquire', status: 'active', forVotes: 55, againstVotes: 20, deadline: '2025-03-25', quorum: 66 },
  { id: 'vote_2', syndicateId: 'syn_1', proposalTitle: 'List Karl Malone RC for $5,500', proposalType: 'sell', status: 'active', forVotes: 40, againstVotes: 35, deadline: '2025-03-22', quorum: 66 },
  { id: 'vote_3', syndicateId: 'syn_2', proposalTitle: 'Acquire 2024 Bowman #1 Jackson Holliday', proposalType: 'acquire', status: 'active', forVotes: 62, againstVotes: 13, deadline: '2025-03-28', quorum: 75 },
  { id: 'vote_4', syndicateId: 'syn_2', proposalTitle: 'Add new member: David Chang ($15,000)', proposalType: 'add-member', status: 'passed', forVotes: 80, againstVotes: 5, deadline: '2025-03-10', quorum: 75 },
  { id: 'vote_5', syndicateId: 'syn_3', proposalTitle: 'Dissolve syndicate and distribute assets', proposalType: 'dissolve', status: 'rejected', forVotes: 25, againstVotes: 75, deadline: '2025-03-05', quorum: 51 },
  { id: 'vote_6', syndicateId: 'syn_4', proposalTitle: 'Distribute Q1 2025 profits to members', proposalType: 'distribute', status: 'active', forVotes: 70, againstVotes: 10, deadline: '2025-03-30', quorum: 80 },
  { id: 'vote_7', syndicateId: 'syn_4', proposalTitle: 'Sell Ja Morant RC at market price', proposalType: 'sell', status: 'active', forVotes: 48, againstVotes: 32, deadline: '2025-03-20', quorum: 80 },
  { id: 'vote_8', syndicateId: 'syn_5', proposalTitle: 'Set initial acquisition targets for fund', proposalType: 'acquire', status: 'expired', forVotes: 30, againstVotes: 30, deadline: '2025-03-08', quorum: 60 },
];

// ---- Service Functions ----

export function getSyndicates(): Syndicate[] {
  return mockSyndicates;
}

export function getSyndicate(id: string): Syndicate | undefined {
  return mockSyndicates.find(s => s.id === id);
}

export function getSyndicateAssets(syndicateId: string): SyndicateAsset[] {
  return mockAssets.filter(a => a.syndicateId === syndicateId);
}

export function getGovernanceVotes(syndicateId: string): GovernanceVote[] {
  return mockVotes.filter(v => v.syndicateId === syndicateId);
}

export function getAllGovernanceVotes(): GovernanceVote[] {
  return mockVotes;
}

export function getSyndicateStats(): SyndicateStats {
  const activeSyndicates = mockSyndicates.filter(s => s.status === 'active').length;
  const totalCapitalManaged = mockSyndicates.reduce((sum, s) => sum + s.totalCapital, 0);
  const totalGain = mockSyndicates
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.unrealizedGain, 0);
  const totalDeployed = mockSyndicates
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.deployedCapital, 0);
  const avgReturn = totalDeployed > 0 ? Math.round((totalGain / totalDeployed) * 1000) / 10 : 0;
  const pendingVotes = mockVotes.filter(v => v.status === 'active').length;
  const totalMembers = new Set(
    mockSyndicates.flatMap(s => s.members.map(m => m.id))
  ).size;

  return {
    totalSyndicates: mockSyndicates.length,
    totalCapitalManaged,
    avgReturn,
    activeSyndicates,
    pendingVotes,
    totalMembers,
  };
}

export function getMemberPortfolio(memberId: string): {
  member: SyndicateMember | null;
  syndicates: Syndicate[];
  assets: SyndicateAsset[];
  totalValue: number;
  totalContributed: number;
} {
  const syndicates = mockSyndicates.filter(s =>
    s.members.some(m => m.id === memberId)
  );

  let member: SyndicateMember | null = null;
  for (const s of syndicates) {
    const found = s.members.find(m => m.id === memberId);
    if (found) {
      member = found;
      break;
    }
  }

  const assets: SyndicateAsset[] = [];
  for (const s of syndicates) {
    const synAssets = mockAssets.filter(a => a.syndicateId === s.id);
    assets.push(...synAssets);
  }

  const totalValue = syndicates.reduce((sum, s) => {
    const m = s.members.find(mem => mem.id === memberId);
    return sum + (m?.currentValue ?? 0);
  }, 0);

  const totalContributed = syndicates.reduce((sum, s) => {
    const m = s.members.find(mem => mem.id === memberId);
    return sum + (m?.capitalContributed ?? 0);
  }, 0);

  return { member, syndicates, assets, totalValue, totalContributed };
}

export function calculateDistribution(syndicateId: string): {
  syndicateId: string;
  totalValue: number;
  distributions: { memberId: string; memberName: string; ownershipPercent: number; distributionAmount: number; capitalContributed: number; gainLoss: number; taxableGain: number }[];
} | null {
  const syndicate = mockSyndicates.find(s => s.id === syndicateId);
  if (!syndicate) return null;

  const synAssets = mockAssets.filter(a => a.syndicateId === syndicateId);
  const totalValue = synAssets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalCost = synAssets.reduce((sum, a) => sum + a.purchasePrice, 0);
  const totalGainLoss = totalValue - totalCost;

  const distributions = syndicate.members.map(m => {
    const distributionAmount = Math.round(totalValue * (m.ownershipPercent / 100));
    const costBasis = Math.round(totalCost * (m.ownershipPercent / 100));
    const gainLoss = distributionAmount - costBasis;
    // Short-term capital gains assumed for simplicity
    const taxableGain = Math.max(0, gainLoss);

    return {
      memberId: m.id,
      memberName: m.name,
      ownershipPercent: m.ownershipPercent,
      distributionAmount,
      capitalContributed: m.capitalContributed,
      gainLoss,
      taxableGain,
    };
  });

  return {
    syndicateId,
    totalValue,
    distributions,
  };
}
