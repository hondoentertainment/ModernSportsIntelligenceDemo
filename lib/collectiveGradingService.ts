/**
 * Collective Bargaining for Grading Submissions Service
 * Pool grading submissions for volume discounts, shared shipping, and negotiated turnaround.
 */

export type GradingCompany = 'PSA' | 'BGS' | 'SGC' | 'CGC' | 'HGA';
export type ServiceTier = 'bulk' | 'economy' | 'regular' | 'express' | 'super-express' | 'walk-through';
export type PoolStatus = 'forming' | 'accepting' | 'locked' | 'shipped' | 'at-grader' | 'returning' | 'completed';
export type SubmissionStatus = 'pending' | 'accepted' | 'rejected' | 'graded';

export interface PoolSubmission {
  id: string;
  ownerHandle: string;
  cardName: string;
  estimatedValue: number;
  expectedGrade: string;
  status: SubmissionStatus;
  actualGrade: string | null;
  gradedValue: number | null;
}

export interface GradingPool {
  id: string;
  name: string;
  gradingCompany: GradingCompany;
  serviceTier: ServiceTier;
  status: PoolStatus;
  organizerHandle: string;
  individualPrice: number;
  poolPrice: number;
  savingsPerCard: number;
  savingsPercent: number;
  minCards: number;
  maxCards: number;
  currentCards: number;
  participants: number;
  submissions: PoolSubmission[];
  deadline: string;
  estimatedReturn: string;
  shippingCostPerPerson: number;
  totalSavings: number;
}

export interface GradingPoolHistory {
  poolId: string;
  gradingCompany: GradingCompany;
  serviceTier: ServiceTier;
  completedDate: string;
  cardsSubmitted: number;
  yourCards: number;
  yourSavings: number;
  avgGrade: number;
  turnaroundDays: number;
}

export interface CollectiveGradingStats {
  totalPoolsJoined: number;
  totalCardsSaved: number;
  totalMoneySaved: number;
  avgSavingsPercent: number;
  avgTurnaroundDays: number;
  preferredCompany: string;
  poolsForming: number;
  activePoolCards: number;
}

function getGradingPools(): GradingPool[] {
  return [
    {
      id: 'gp-1',
      name: 'March PSA Bulk Pool #4',
      gradingCompany: 'PSA',
      serviceTier: 'bulk',
      status: 'accepting',
      organizerHandle: 'SlabCollector',
      individualPrice: 22,
      poolPrice: 15,
      savingsPerCard: 7,
      savingsPercent: 32,
      minCards: 100,
      maxCards: 200,
      currentCards: 134,
      participants: 18,
      submissions: [
        { id: 'ps-1', ownerHandle: 'CardShark92', cardName: '2024 Topps Chrome Paul Skenes RC', estimatedValue: 45, expectedGrade: '9', status: 'accepted', actualGrade: null, gradedValue: null },
        { id: 'ps-2', ownerHandle: 'ProspectHunter', cardName: '2025 Bowman 1st Travis Bazzana', estimatedValue: 120, expectedGrade: '10', status: 'accepted', actualGrade: null, gradedValue: null },
        { id: 'ps-3', ownerHandle: 'WaxBreaker99', cardName: '2024 Prizm Caleb Williams RC', estimatedValue: 30, expectedGrade: '9', status: 'pending', actualGrade: null, gradedValue: null },
        { id: 'ps-4', ownerHandle: 'GrailChaser', cardName: '2024 Select Jayden Daniels Concourse', estimatedValue: 55, expectedGrade: '10', status: 'accepted', actualGrade: null, gradedValue: null },
      ],
      deadline: '2026-03-25',
      estimatedReturn: '2026-07-15',
      shippingCostPerPerson: 8.50,
      totalSavings: 938,
    },
    {
      id: 'gp-2',
      name: 'BGS Express – Basketball RCs',
      gradingCompany: 'BGS',
      serviceTier: 'express',
      status: 'forming',
      organizerHandle: 'HoopsInvestor',
      individualPrice: 150,
      poolPrice: 110,
      savingsPerCard: 40,
      savingsPercent: 27,
      minCards: 20,
      maxCards: 50,
      currentCards: 8,
      participants: 5,
      submissions: [
        { id: 'ps-5', ownerHandle: 'HoopsInvestor', cardName: '2024 Prizm Stephon Castle Silver', estimatedValue: 320, expectedGrade: '9.5', status: 'accepted', actualGrade: null, gradedValue: null },
        { id: 'ps-6', ownerHandle: 'DunkTrader', cardName: '2024 Select Reed Sheppard Concourse', estimatedValue: 85, expectedGrade: '9.5', status: 'pending', actualGrade: null, gradedValue: null },
      ],
      deadline: '2026-04-01',
      estimatedReturn: '2026-05-01',
      shippingCostPerPerson: 12.00,
      totalSavings: 320,
    },
    {
      id: 'gp-3',
      name: 'SGC Vintage Collective – February',
      gradingCompany: 'SGC',
      serviceTier: 'regular',
      status: 'completed',
      organizerHandle: 'VintageKing',
      individualPrice: 30,
      poolPrice: 20,
      savingsPerCard: 10,
      savingsPercent: 33,
      minCards: 50,
      maxCards: 100,
      currentCards: 72,
      participants: 12,
      submissions: [
        { id: 'ps-7', ownerHandle: 'VintageKing', cardName: '1955 Topps Sandy Koufax RC', estimatedValue: 2800, expectedGrade: '5', status: 'graded', actualGrade: '5.5', gradedValue: 3400 },
        { id: 'ps-8', ownerHandle: 'SlabCollector', cardName: '1952 Bowman Willie Mays', estimatedValue: 1200, expectedGrade: '4', status: 'graded', actualGrade: '3.5', gradedValue: 900 },
      ],
      deadline: '2026-02-10',
      estimatedReturn: '2026-03-10',
      shippingCostPerPerson: 6.50,
      totalSavings: 720,
    },
  ];
}

function getPoolHistory(): GradingPoolHistory[] {
  return [
    { poolId: 'gp-3', gradingCompany: 'SGC', serviceTier: 'regular', completedDate: '2026-03-08', cardsSubmitted: 72, yourCards: 8, yourSavings: 80, avgGrade: 5.2, turnaroundDays: 26 },
    { poolId: 'ph-1', gradingCompany: 'PSA', serviceTier: 'bulk', completedDate: '2026-01-20', cardsSubmitted: 156, yourCards: 12, yourSavings: 84, avgGrade: 8.1, turnaroundDays: 95 },
    { poolId: 'ph-2', gradingCompany: 'BGS', serviceTier: 'regular', completedDate: '2025-12-05', cardsSubmitted: 45, yourCards: 5, yourSavings: 75, avgGrade: 8.8, turnaroundDays: 35 },
    { poolId: 'ph-3', gradingCompany: 'PSA', serviceTier: 'economy', completedDate: '2025-11-15', cardsSubmitted: 88, yourCards: 10, yourSavings: 50, avgGrade: 7.9, turnaroundDays: 60 },
  ];
}

function getCollectiveGradingStats(): CollectiveGradingStats {
  return {
    totalPoolsJoined: 14,
    totalCardsSaved: 35,
    totalMoneySaved: 289,
    avgSavingsPercent: 30,
    avgTurnaroundDays: 54,
    preferredCompany: 'PSA',
    poolsForming: 3,
    activePoolCards: 142,
  };
}

function getCompanyColor(company: GradingCompany): string {
  const colors: Record<GradingCompany, string> = {
    PSA: 'text-red-400 bg-red-500/10 border-red-500/30',
    BGS: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    SGC: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    CGC: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    HGA: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  };
  return colors[company];
}

function getPoolStatusLabel(status: PoolStatus): string {
  const labels: Record<PoolStatus, string> = {
    forming: 'Forming', accepting: 'Accepting', locked: 'Locked',
    shipped: 'Shipped', 'at-grader': 'At Grader', returning: 'Returning', completed: 'Completed',
  };
  return labels[status];
}

function getPoolStatusColor(status: PoolStatus): string {
  const colors: Record<PoolStatus, string> = {
    forming: 'text-slate-400 bg-slate-500/10',
    accepting: 'text-green-400 bg-green-500/10',
    locked: 'text-amber-400 bg-amber-500/10',
    shipped: 'text-blue-400 bg-blue-500/10',
    'at-grader': 'text-purple-400 bg-purple-500/10',
    returning: 'text-cyan-400 bg-cyan-500/10',
    completed: 'text-emerald-400 bg-emerald-500/10',
  };
  return colors[status];
}

export {
  getGradingPools,
  getPoolHistory,
  getCollectiveGradingStats,
  getCompanyColor,
  getPoolStatusLabel,
  getPoolStatusColor,
};
