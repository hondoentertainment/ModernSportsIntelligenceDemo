// @ts-nocheck
// Mentorship & Knowledge Exchange Service
// Expert-to-novice pairing, guided collecting paths, skill progression trees, AMA scheduling, and knowledge sharing

export type MentorStatus = 'available' | 'at-capacity' | 'on-break' | 'inactive';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
export type SessionType = 'one-on-one' | 'group' | 'ama' | 'workshop' | 'review';

export interface SkillNode {
  id: string;
  name: string;
  category: string;
  level: SkillLevel;
  description: string;
  prerequisites: string[];
  completedBy: number;
  estimatedHours: number;
}

export interface Mentor {
  id: string;
  handle: string;
  name: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  menteeCount: number;
  maxMentees: number;
  status: MentorStatus;
  yearExperience: number;
  portfolioValue: number;
  topSkills: SkillNode[];
  bio: string;
  responseTime: string;
  sessionsCompleted: number;
}

export interface MentorSession {
  id: string;
  mentorHandle: string;
  menteeHandle: string;
  type: SessionType;
  topic: string;
  scheduledDate: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  rating: number | null;
  notes: string | null;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  skillCount: number;
  completedSkills: number;
  category: string;
  estimatedWeeks: number;
  enrolledCount: number;
  skills: SkillNode[];
}

export interface MentorshipStats {
  totalMentors: number;
  activePairings: number;
  sessionsThisMonth: number;
  avgRating: number;
  skillsUnlocked: number;
  pathsCompleted: number;
  amasScheduled: number;
  knowledgeArticles: number;
}

// --- Skill Nodes ---

const SKILL_NODES: SkillNode[] = [
  {
    id: 'sk-001',
    name: 'Card Identification Basics',
    category: 'Fundamentals',
    level: 'beginner',
    description: 'Learn to identify card sets, years, manufacturers, and print runs from visual cues.',
    prerequisites: [],
    completedBy: 4821,
    estimatedHours: 3,
  },
  {
    id: 'sk-002',
    name: 'Market Price Research',
    category: 'Valuation',
    level: 'beginner',
    description: 'Understand how to use comp sales, auction history, and price guides to value cards.',
    prerequisites: ['sk-001'],
    completedBy: 3940,
    estimatedHours: 4,
  },
  {
    id: 'sk-003',
    name: 'Centering & Surface Analysis',
    category: 'Grading',
    level: 'intermediate',
    description: 'Evaluate card centering ratios, surface imperfections, and print defects for pre-grade assessment.',
    prerequisites: ['sk-001'],
    completedBy: 2876,
    estimatedHours: 6,
  },
  {
    id: 'sk-004',
    name: 'Vintage Card Authentication',
    category: 'Authentication',
    level: 'advanced',
    description: 'Detect trimming, recoloring, and reprints on pre-1980 cards using forensic techniques.',
    prerequisites: ['sk-003'],
    completedBy: 1205,
    estimatedHours: 10,
  },
  {
    id: 'sk-005',
    name: 'RC & Prospect Scouting',
    category: 'Modern',
    level: 'intermediate',
    description: 'Identify undervalued rookie cards and prospect hits using prospect rankings and scouting data.',
    prerequisites: ['sk-002'],
    completedBy: 2340,
    estimatedHours: 5,
  },
  {
    id: 'sk-006',
    name: 'Portfolio Diversification Strategy',
    category: 'Portfolio',
    level: 'advanced',
    description: 'Balance a collection across eras, sports, and asset classes for risk-adjusted growth.',
    prerequisites: ['sk-002', 'sk-005'],
    completedBy: 1087,
    estimatedHours: 8,
  },
  {
    id: 'sk-007',
    name: 'Auction Strategy & Sniping',
    category: 'Trading',
    level: 'advanced',
    description: 'Master bidding psychology, proxy strategies, and last-second sniping techniques for online auctions.',
    prerequisites: ['sk-002'],
    completedBy: 1532,
    estimatedHours: 6,
  },
  {
    id: 'sk-008',
    name: 'Grading Submission Optimization',
    category: 'Grading',
    level: 'expert',
    description: 'Maximize ROI on grading submissions by selecting the right service tier, turnaround, and bulk strategy.',
    prerequisites: ['sk-003', 'sk-007'],
    completedBy: 764,
    estimatedHours: 7,
  },
  {
    id: 'sk-009',
    name: 'Tax & Estate Planning for Collectors',
    category: 'Portfolio',
    level: 'expert',
    description: 'Navigate capital gains, 1031 exchanges, insurance valuation, and estate succession for high-value collections.',
    prerequisites: ['sk-006'],
    completedBy: 412,
    estimatedHours: 12,
  },
  {
    id: 'sk-010',
    name: 'Market Maker & Arbitrage Mastery',
    category: 'Trading',
    level: 'master',
    description: 'Identify cross-platform arbitrage, exploit market inefficiencies, and operate as a liquidity provider.',
    prerequisites: ['sk-007', 'sk-006'],
    completedBy: 198,
    estimatedHours: 15,
  },
];

// --- Mentors ---

export function getMentors(): Mentor[] {
  return [
    {
      id: 'mn-001',
      handle: '@VintageVault_Ed',
      name: 'Ed Bancroft',
      specialties: ['Pre-War Cards', 'T206', 'Tobacco Cards', 'Vintage Authentication'],
      rating: 4.96,
      reviewCount: 342,
      menteeCount: 3,
      maxMentees: 5,
      status: 'available',
      yearExperience: 28,
      portfolioValue: 2850000,
      topSkills: [SKILL_NODES[3], SKILL_NODES[8]],
      bio: '28-year collector specializing in pre-war tobacco and caramel cards. PSA Set Registry Hall of Fame member. Former authenticator consultant for major auction houses.',
      responseTime: '< 2 hours',
      sessionsCompleted: 487,
    },
    {
      id: 'mn-002',
      handle: '@RCHunter_Mia',
      name: 'Mia Chen',
      specialties: ['Modern Rookies', 'Prospect Scouting', 'Bowman Chrome', 'Parallels'],
      rating: 4.88,
      reviewCount: 218,
      menteeCount: 5,
      maxMentees: 5,
      status: 'at-capacity',
      yearExperience: 9,
      portfolioValue: 620000,
      topSkills: [SKILL_NODES[4], SKILL_NODES[6]],
      bio: 'Full-time modern RC specialist. Turned a $5K hobby budget into a six-figure portfolio by focusing on prospect scouting and pre-hype acquisitions. Host of the "Wax Rippers Weekly" podcast.',
      responseTime: '< 4 hours',
      sessionsCompleted: 312,
    },
    {
      id: 'mn-003',
      handle: '@GradeKing_Marcus',
      name: 'Marcus Whitfield',
      specialties: ['PSA Grading', 'BGS Grading', 'Centering Analysis', 'Crossover Strategy'],
      rating: 4.92,
      reviewCount: 276,
      menteeCount: 4,
      maxMentees: 6,
      status: 'available',
      yearExperience: 15,
      portfolioValue: 1340000,
      topSkills: [SKILL_NODES[2], SKILL_NODES[7]],
      bio: 'Former grading company employee turned independent grading consultant. Submitted 12,000+ cards across all major services. Known for 94% PSA 10 hit rate on pre-screened submissions.',
      responseTime: '< 1 hour',
      sessionsCompleted: 541,
    },
    {
      id: 'mn-004',
      handle: '@ProspectPro_Jake',
      name: 'Jake Rivera',
      specialties: ['MLB Prospects', 'International Scouting', 'Bowman 1st', 'Statistical Modeling'],
      rating: 4.79,
      reviewCount: 164,
      menteeCount: 2,
      maxMentees: 4,
      status: 'available',
      yearExperience: 6,
      portfolioValue: 285000,
      topSkills: [SKILL_NODES[4], SKILL_NODES[5]],
      bio: 'Data-driven prospect analyst combining sabermetrics with card market trends. Built custom ML models that predicted 7 of the last 10 top Bowman Chrome performers before call-up.',
      responseTime: '< 3 hours',
      sessionsCompleted: 198,
    },
    {
      id: 'mn-005',
      handle: '@ArbitrageSage',
      name: 'Diane Kessler',
      specialties: ['Cross-Platform Arbitrage', 'Portfolio Strategy', 'Market Making', 'Tax Optimization'],
      rating: 4.91,
      reviewCount: 203,
      menteeCount: 0,
      maxMentees: 3,
      status: 'on-break',
      yearExperience: 18,
      portfolioValue: 3100000,
      topSkills: [SKILL_NODES[9], SKILL_NODES[8]],
      bio: 'Former Wall Street trader who applies institutional finance strategies to the card market. Pioneer of cross-platform arbitrage techniques and tax-advantaged collecting structures.',
      responseTime: '< 6 hours',
      sessionsCompleted: 374,
    },
  ];
}

// --- Sessions ---

export function getUpcomingSessions(): MentorSession[] {
  return [
    {
      id: 'sess-001',
      mentorHandle: '@GradeKing_Marcus',
      menteeHandle: '@NewCollector_Sam',
      type: 'one-on-one',
      topic: 'Pre-screening your first PSA submission batch',
      scheduledDate: '2026-03-18T14:00:00Z',
      duration: 45,
      status: 'scheduled',
      rating: null,
      notes: null,
    },
    {
      id: 'sess-002',
      mentorHandle: '@VintageVault_Ed',
      menteeHandle: '@HobbyFan_Tyler',
      type: 'review',
      topic: 'Authenticating a 1952 Topps Mantle — live card review',
      scheduledDate: '2026-03-19T18:00:00Z',
      duration: 60,
      status: 'scheduled',
      rating: null,
      notes: null,
    },
    {
      id: 'sess-003',
      mentorHandle: '@RCHunter_Mia',
      menteeHandle: 'Community',
      type: 'ama',
      topic: 'AMA: 2026 Bowman Draft — Sleepers & Sells',
      scheduledDate: '2026-03-20T20:00:00Z',
      duration: 90,
      status: 'scheduled',
      rating: null,
      notes: null,
    },
    {
      id: 'sess-004',
      mentorHandle: '@ProspectPro_Jake',
      menteeHandle: '@DataNerd_Priya',
      type: 'workshop',
      topic: 'Building a prospect valuation model with Python',
      scheduledDate: '2026-03-21T16:00:00Z',
      duration: 120,
      status: 'scheduled',
      rating: null,
      notes: null,
    },
    {
      id: 'sess-005',
      mentorHandle: '@GradeKing_Marcus',
      menteeHandle: '@SlabNewbie_Jon',
      type: 'group',
      topic: 'BGS vs PSA vs SGC: Which service for which card?',
      scheduledDate: '2026-03-22T15:00:00Z',
      duration: 60,
      status: 'scheduled',
      rating: null,
      notes: null,
    },
    {
      id: 'sess-006',
      mentorHandle: '@VintageVault_Ed',
      menteeHandle: '@CardInvestor_Liz',
      type: 'one-on-one',
      topic: 'Building a pre-war portfolio on a $10K budget',
      scheduledDate: '2026-03-17T12:00:00Z',
      duration: 45,
      status: 'completed',
      rating: 5,
      notes: 'Excellent session — Ed walked through T206 tier pricing and identified 3 undervalued commons.',
    },
  ];
}

// --- Learning Paths ---

export function getLearningPaths(): LearningPath[] {
  return [
    {
      id: 'lp-001',
      name: 'Vintage Investing 101',
      description: 'A comprehensive guide to building wealth through pre-1980 vintage cards. Covers authentication, market cycles, condition census, and long-term hold strategies.',
      skillCount: 6,
      completedSkills: 2,
      category: 'Vintage',
      estimatedWeeks: 8,
      enrolledCount: 1247,
      skills: [SKILL_NODES[0], SKILL_NODES[1], SKILL_NODES[2], SKILL_NODES[3], SKILL_NODES[5], SKILL_NODES[8]],
    },
    {
      id: 'lp-002',
      name: 'Modern RC Mastery',
      description: 'Master the art of modern rookie card investing — from identifying prospects before they break out to timing your exits for maximum profit.',
      skillCount: 5,
      completedSkills: 3,
      category: 'Modern',
      estimatedWeeks: 6,
      enrolledCount: 2034,
      skills: [SKILL_NODES[0], SKILL_NODES[1], SKILL_NODES[4], SKILL_NODES[6], SKILL_NODES[5]],
    },
    {
      id: 'lp-003',
      name: 'Grading & Authentication',
      description: 'Become an expert at evaluating card condition, selecting grading services, and maximizing your submission ROI. Includes live card review exercises.',
      skillCount: 5,
      completedSkills: 1,
      category: 'Grading',
      estimatedWeeks: 7,
      enrolledCount: 1589,
      skills: [SKILL_NODES[0], SKILL_NODES[2], SKILL_NODES[3], SKILL_NODES[7], SKILL_NODES[6]],
    },
    {
      id: 'lp-004',
      name: 'Portfolio Management',
      description: 'Apply institutional finance principles to your card collection — diversification, risk management, tax optimization, and estate planning for serious collectors.',
      skillCount: 6,
      completedSkills: 4,
      category: 'Portfolio',
      estimatedWeeks: 10,
      enrolledCount: 876,
      skills: [SKILL_NODES[0], SKILL_NODES[1], SKILL_NODES[5], SKILL_NODES[6], SKILL_NODES[8], SKILL_NODES[9]],
    },
  ];
}

// --- Skill Tree ---

export function getSkillTree(): SkillNode[] {
  return [...SKILL_NODES];
}

// --- Stats ---

export function getMentorshipStats(): MentorshipStats {
  return {
    totalMentors: 127,
    activePairings: 342,
    sessionsThisMonth: 1284,
    avgRating: 4.89,
    skillsUnlocked: 18742,
    pathsCompleted: 4210,
    amasScheduled: 14,
    knowledgeArticles: 896,
  };
}

// --- Color Helpers ---

export function getSkillLevelColor(level: SkillLevel): string {
  switch (level) {
    case 'beginner':
      return '#22c55e';
    case 'intermediate':
      return '#3b82f6';
    case 'advanced':
      return '#a855f7';
    case 'expert':
      return '#f59e0b';
    case 'master':
      return '#ef4444';
    default:
      return '#94a3b8';
  }
}

export function getMentorStatusColor(status: MentorStatus): string {
  switch (status) {
    case 'available':
      return '#22c55e';
    case 'at-capacity':
      return '#f59e0b';
    case 'on-break':
      return '#3b82f6';
    case 'inactive':
      return '#64748b';
    default:
      return '#94a3b8';
  }
}
