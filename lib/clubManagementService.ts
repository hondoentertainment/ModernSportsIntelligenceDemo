/**
 * Club & Guild Management Service
 * Create and manage collector clubs with shared goals, treasury, and member hierarchy.
 */

export type ClubTier = 'casual' | 'competitive' | 'elite' | 'institutional';
export type MemberRole = 'founder' | 'officer' | 'member' | 'recruit';
export type ActivityType = 'trade' | 'acquisition' | 'sale' | 'achievement' | 'milestone' | 'event';

export interface ClubMember {
  id: string;
  handle: string;
  role: MemberRole;
  joinedDate: string;
  portfolioValue: number;
  contributionScore: number;
  lastActive: string;
  specialties: string[];
}

export interface ClubGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  contributorCount: number;
  status: 'active' | 'completed' | 'expired';
}

export interface ClubActivity {
  id: string;
  type: ActivityType;
  memberHandle: string;
  description: string;
  timestamp: string;
  value: number | null;
}

export interface ClubTreasury {
  balance: number;
  monthlyDues: number;
  totalCollected: number;
  totalSpent: number;
  sharedAssets: number;
  pendingExpenses: number;
}

export interface Club {
  id: string;
  name: string;
  motto: string;
  tier: ClubTier;
  founderHandle: string;
  createdDate: string;
  memberCount: number;
  maxMembers: number;
  members: ClubMember[];
  goals: ClubGoal[];
  recentActivity: ClubActivity[];
  treasury: ClubTreasury;
  totalPortfolioValue: number;
  avgMemberROI: number;
  weeklyActiveMembers: number;
  focus: string[];
}

export interface ClubStats {
  totalClubs: number;
  totalMembers: number;
  avgClubSize: number;
  topClubByValue: string;
  avgMemberRetention: number;
  goalsCompleted: number;
}

function getClubs(): Club[] {
  return [
    {
      id: 'club-1',
      name: 'Diamond Collectors Guild',
      motto: 'Collect smart, trade smarter',
      tier: 'elite',
      founderHandle: 'CardShark92',
      createdDate: '2025-06-01',
      memberCount: 24,
      maxMembers: 30,
      members: [
        { id: 'm1', handle: 'CardShark92', role: 'founder', joinedDate: '2025-06-01', portfolioValue: 185000, contributionScore: 98, lastActive: '10m ago', specialties: ['Modern RC', 'Bowman'] },
        { id: 'm2', handle: 'ProspectHunter', role: 'officer', joinedDate: '2025-06-05', portfolioValue: 92000, contributionScore: 87, lastActive: '1h ago', specialties: ['Prospects', '1st Bowman'] },
        { id: 'm3', handle: 'VintageKing', role: 'officer', joinedDate: '2025-07-01', portfolioValue: 420000, contributionScore: 72, lastActive: '3h ago', specialties: ['Pre-War', 'HOF Vintage'] },
        { id: 'm4', handle: 'WaxBreaker99', role: 'member', joinedDate: '2025-08-10', portfolioValue: 35000, contributionScore: 65, lastActive: '2h ago', specialties: ['Wax', 'Breaks'] },
        { id: 'm5', handle: 'GrailChaser', role: 'member', joinedDate: '2025-09-01', portfolioValue: 155000, contributionScore: 58, lastActive: '5h ago', specialties: ['Grails', 'PSA 10'] },
      ],
      goals: [
        { id: 'g1', title: 'Club Portfolio $1M', description: 'Reach combined portfolio value of $1,000,000', targetValue: 1000000, currentValue: 887000, deadline: '2026-06-01', contributorCount: 24, status: 'active' },
        { id: 'g2', title: 'Complete 1956 Topps Master Set', description: 'Collectively own every card in the 1956 Topps set', targetValue: 340, currentValue: 288, deadline: '2026-12-31', contributorCount: 8, status: 'active' },
        { id: 'g3', title: '100 Graded Submissions', description: 'Submit 100 cards for grading as a group this quarter', targetValue: 100, currentValue: 100, deadline: '2026-03-31', contributorCount: 15, status: 'completed' },
      ],
      recentActivity: [
        { id: 'a1', type: 'acquisition', memberHandle: 'VintageKing', description: 'Acquired 1956 Topps #135 Mickey Mantle PSA 5', timestamp: '2h ago', value: 12500 },
        { id: 'a2', type: 'achievement', memberHandle: 'ProspectHunter', description: 'Earned "Prospect Prophet" badge', timestamp: '4h ago', value: null },
        { id: 'a3', type: 'trade', memberHandle: 'WaxBreaker99', description: 'Traded 2024 Chrome lot to CardShark92', timestamp: '6h ago', value: 450 },
        { id: 'a4', type: 'milestone', memberHandle: 'Club', description: 'Guild reached $875K combined portfolio', timestamp: '1d ago', value: 875000 },
        { id: 'a5', type: 'sale', memberHandle: 'GrailChaser', description: 'Sold 2023 Bowman Holograph Auto for $2,200', timestamp: '2d ago', value: 2200 },
      ],
      treasury: { balance: 3200, monthlyDues: 25, totalCollected: 8400, totalSpent: 5200, sharedAssets: 4, pendingExpenses: 800 },
      totalPortfolioValue: 887000,
      avgMemberROI: 22.5,
      weeklyActiveMembers: 18,
      focus: ['Baseball', 'Vintage', 'Modern RC'],
    },
    {
      id: 'club-2',
      name: 'Hoop Dreams Collective',
      motto: 'Court to card, we profit together',
      tier: 'competitive',
      founderHandle: 'HoopsInvestor',
      createdDate: '2025-09-15',
      memberCount: 16,
      maxMembers: 25,
      members: [
        { id: 'm6', handle: 'HoopsInvestor', role: 'founder', joinedDate: '2025-09-15', portfolioValue: 67000, contributionScore: 95, lastActive: '5m ago', specialties: ['NBA RC', 'Prizm'] },
        { id: 'm7', handle: 'DunkTrader', role: 'officer', joinedDate: '2025-09-20', portfolioValue: 45000, contributionScore: 82, lastActive: '30m ago', specialties: ['Basketball', 'Autos'] },
        { id: 'm8', handle: 'CourtVision', role: 'member', joinedDate: '2025-10-01', portfolioValue: 28000, contributionScore: 70, lastActive: '2h ago', specialties: ['Prospects', 'Select'] },
      ],
      goals: [
        { id: 'g4', title: 'Top 5 Leaderboard', description: 'Get 3+ members into platform Top 5 leaderboard', targetValue: 3, currentValue: 1, deadline: '2026-06-30', contributorCount: 16, status: 'active' },
      ],
      recentActivity: [
        { id: 'a6', type: 'acquisition', memberHandle: 'DunkTrader', description: 'Bought Stephon Castle Prizm Silver Auto /25', timestamp: '1h ago', value: 480 },
        { id: 'a7', type: 'event', memberHandle: 'HoopsInvestor', description: 'Hosted group break — 2024 Prizm Basketball', timestamp: '1d ago', value: 2400 },
      ],
      treasury: { balance: 1100, monthlyDues: 15, totalCollected: 2160, totalSpent: 1060, sharedAssets: 1, pendingExpenses: 200 },
      totalPortfolioValue: 340000,
      avgMemberROI: 15.8,
      weeklyActiveMembers: 12,
      focus: ['Basketball', 'NBA', 'Prospects'],
    },
  ];
}

function getClubStats(): ClubStats {
  return {
    totalClubs: 8,
    totalMembers: 142,
    avgClubSize: 18,
    topClubByValue: 'Diamond Collectors Guild',
    avgMemberRetention: 89,
    goalsCompleted: 23,
  };
}

function getTierLabel(tier: ClubTier): string {
  const labels: Record<ClubTier, string> = { casual: 'Casual', competitive: 'Competitive', elite: 'Elite', institutional: 'Institutional' };
  return labels[tier];
}

function getTierColor(tier: ClubTier): string {
  const colors: Record<ClubTier, string> = {
    casual: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    competitive: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    elite: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    institutional: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  };
  return colors[tier];
}

function getRoleColor(role: MemberRole): string {
  const colors: Record<MemberRole, string> = {
    founder: 'text-amber-400',
    officer: 'text-blue-400',
    member: 'text-slate-300',
    recruit: 'text-slate-500',
  };
  return colors[role];
}

export {
  getClubs,
  getClubStats,
  getTierLabel,
  getTierColor,
  getRoleColor,
};
