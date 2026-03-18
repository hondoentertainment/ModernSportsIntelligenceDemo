// ---- Types ----

export interface SuccessionPlan {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  totalCollectionValue: number;
  status: 'draft' | 'active' | 'needs_review';
  heirCount: number;
  allocationComplete: boolean;
  lastReviewDate: string;
  nextReviewDate: string;
}

export interface Heir {
  id: string;
  planId: string;
  name: string;
  relationship: string;
  age: number;
  knowledgeLevel: 'none' | 'beginner' | 'intermediate' | 'advanced';
  educationProgress: number; // 0-100
  allocatedValue: number;
  allocatedPercentage: number;
  preferredAction: 'keep' | 'sell' | 'undecided';
  notes: string;
}

export interface CollectionWill {
  id: string;
  planId: string;
  section: string;
  description: string;
  estimatedValue: number;
  assignedHeirId: string;
  assignedHeirName: string;
  instructions: string;
  priority: number;
}

export interface LiquidationTrigger {
  id: string;
  planId: string;
  name: string;
  condition: string;
  action: string;
  threshold: number | null;
  enabled: boolean;
  lastTriggered: string | null;
}

export interface EducationModule {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'grading' | 'market' | 'selling' | 'storage';
  durationMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completedBy: string[];
  contentSummary: string;
}

// ---- Mock Data ----

const MOCK_PLAN: SuccessionPlan = {
  id: 'sp-1', name: 'Roberts Family Collection Succession Plan', createdAt: '2025-06-15',
  updatedAt: '2026-03-01', totalCollectionValue: 287500, status: 'active', heirCount: 3,
  allocationComplete: true, lastReviewDate: '2026-03-01', nextReviewDate: '2026-09-01',
};

const MOCK_HEIRS: Heir[] = [
  { id: 'heir-1', planId: 'sp-1', name: 'Marcus Roberts', relationship: 'Son', age: 34, knowledgeLevel: 'intermediate', educationProgress: 72, allocatedValue: 143750, allocatedPercentage: 50, preferredAction: 'keep', notes: 'Active collector. Understands grading and market values. Will maintain the vintage baseball section.' },
  { id: 'heir-2', planId: 'sp-1', name: 'Sarah Roberts-Chen', relationship: 'Daughter', age: 31, knowledgeLevel: 'beginner', educationProgress: 35, allocatedValue: 86250, allocatedPercentage: 30, preferredAction: 'sell', notes: 'Not interested in collecting but understands the financial value. Prefers liquidation through consignment.' },
  { id: 'heir-3', planId: 'sp-1', name: 'James Roberts', relationship: 'Grandson', age: 14, knowledgeLevel: 'beginner', educationProgress: 18, allocatedValue: 57500, allocatedPercentage: 20, preferredAction: 'undecided', notes: 'Showing early interest in basketball cards. Currently working through education modules. Allocation held in trust until age 21.' },
];

const MOCK_WILL: CollectionWill[] = [
  { id: 'cw-1', planId: 'sp-1', section: 'Vintage Baseball (Pre-1970)', description: '1952 Topps Mantle, 1955 Topps Clemente RC, 1954 Topps Aaron RC, and 47 other vintage baseball cards', estimatedValue: 125000, assignedHeirId: 'heir-1', assignedHeirName: 'Marcus Roberts', instructions: 'Store in climate-controlled vault. Do not sell the Mantle under any circumstances — it anchors the collection. Annual appraisal required.', priority: 1 },
  { id: 'cw-2', planId: 'sp-1', section: 'Modern Basketball Graded', description: 'LeBron, Giannis, Luka, Wemby rookies — 23 PSA/BGS slabs', estimatedValue: 68000, assignedHeirId: 'heir-3', assignedHeirName: 'James Roberts', instructions: 'Held in trust until age 21. Marcus serves as custodian. Insurance must be maintained. Sell only if college funding is needed.', priority: 2 },
  { id: 'cw-3', planId: 'sp-1', section: 'Modern Football & Baseball Graded', description: 'Mahomes, Ohtani, Trout, Soto rookies — 35 graded cards', estimatedValue: 52000, assignedHeirId: 'heir-2', assignedHeirName: 'Sarah Roberts-Chen', instructions: 'Liquidate through PWCC or Heritage Auctions. Target 90-day sell window to avoid flooding market. Minimum reserve at 85% of appraised value.', priority: 3 },
  { id: 'cw-4', planId: 'sp-1', section: 'Raw Lot & Commons', description: 'Approximately 5,000 raw cards including commons, inserts, and parallels from 1990-2024', estimatedValue: 15500, assignedHeirId: 'heir-2', assignedHeirName: 'Sarah Roberts-Chen', instructions: 'Sell as bulk lots on eBay or consign to local card shop. Do not spend time individually grading.', priority: 4 },
  { id: 'cw-5', planId: 'sp-1', section: 'Autograph Collection', description: 'On-card autos of Griffey Jr, Jeter, Kobe, Jordan — 12 authenticated pieces', estimatedValue: 27000, assignedHeirId: 'heir-1', assignedHeirName: 'Marcus Roberts', instructions: 'Keep in UV-protected cases. The Kobe auto is the most volatile — monitor market and consider selling if it exceeds $12,000.', priority: 2 },
];

const MOCK_TRIGGERS: LiquidationTrigger[] = [
  { id: 'lt-1', planId: 'sp-1', name: 'Market Crash Protection', condition: 'Collection value drops more than 30% from peak in 90 days', action: 'Notify all heirs and financial advisor. Begin staged liquidation of volatile modern cards.', threshold: 30, enabled: true, lastTriggered: null },
  { id: 'lt-2', planId: 'sp-1', name: 'Incapacity Clause', condition: 'Primary collector becomes unable to manage collection', action: 'Transfer management to Marcus Roberts immediately. Activate annual appraisal schedule.', threshold: null, enabled: true, lastTriggered: null },
  { id: 'lt-3', planId: 'sp-1', name: 'Emergency Liquidity', condition: 'Heir requests emergency funds exceeding $10,000', action: 'Liquidate from heir\'s allocation starting with highest-liquidity cards. Requires two-heir approval.', threshold: 10000, enabled: true, lastTriggered: null },
  { id: 'lt-4', planId: 'sp-1', name: 'Insurance Lapse Warning', condition: 'Collection insurance premium unpaid for 30+ days', action: 'Alert all heirs via email and text. Move high-value items to bank vault.', threshold: 30, enabled: true, lastTriggered: null },
  { id: 'lt-5', planId: 'sp-1', name: 'Grandson Trust Activation', condition: 'James Roberts reaches age 21', action: 'Transfer basketball card allocation from trust to James. Schedule education assessment before handoff.', threshold: 21, enabled: true, lastTriggered: null },
];

const MOCK_EDUCATION: EducationModule[] = [
  { id: 'em-1', title: 'Understanding Card Grading', description: 'Learn how PSA, BGS, and SGC grading works and why it matters for value', category: 'grading', durationMinutes: 25, difficulty: 'beginner', completedBy: ['heir-1', 'heir-2', 'heir-3'], contentSummary: 'Covers grading scales, population reports, grade value multipliers, and how to read a slab label.' },
  { id: 'em-2', title: 'How to Read Market Comps', description: 'Using recent sales data to determine fair market value', category: 'market', durationMinutes: 30, difficulty: 'beginner', completedBy: ['heir-1', 'heir-2'], contentSummary: 'Walks through eBay sold listings, 130point, and PWCC data. Explains how to filter outliers and calculate true market value.' },
  { id: 'em-3', title: 'Selling on eBay and Consignment', description: 'Step-by-step guide to listing cards and choosing consignment partners', category: 'selling', durationMinutes: 40, difficulty: 'intermediate', completedBy: ['heir-1'], contentSummary: 'Covers eBay listing best practices, photography, shipping, fee structures, and consignment houses like PWCC and Heritage.' },
  { id: 'em-4', title: 'Proper Card Storage & Handling', description: 'How to store, handle, and protect valuable cards', category: 'storage', durationMinutes: 15, difficulty: 'beginner', completedBy: ['heir-1', 'heir-3'], contentSummary: 'Penny sleeves, top loaders, magnetic cases, climate control, and UV protection explained.' },
  { id: 'em-5', title: 'Card Collecting Basics', description: 'Introduction to sports card collecting terminology and concepts', category: 'basics', durationMinutes: 20, difficulty: 'beginner', completedBy: ['heir-1', 'heir-2', 'heir-3'], contentSummary: 'Covers rookies, parallels, refractors, inserts, base cards, serial numbering, and hobby vs retail.' },
  { id: 'em-6', title: 'Advanced Market Analysis', description: 'Using indices, seasonality, and sentiment to time buys and sells', category: 'market', durationMinutes: 45, difficulty: 'advanced', completedBy: ['heir-1'], contentSummary: 'Seasonal trends, player lifecycle curves, pop report analysis, and macro factors affecting the card market.' },
  { id: 'em-7', title: 'Tax Implications of Card Sales', description: 'Understanding capital gains, cost basis tracking, and collectibles tax rates', category: 'selling', durationMinutes: 35, difficulty: 'intermediate', completedBy: [], contentSummary: 'Federal collectibles tax rate of 28%, state variations, cost basis documentation, and 1099-K thresholds.' },
];

// ---- Service Functions ----

export function getPlan(): SuccessionPlan {
  return { ...MOCK_PLAN };
}

export function getHeirs(): Heir[] {
  return [...MOCK_HEIRS].sort((a, b) => b.allocatedPercentage - a.allocatedPercentage);
}

export function getWill(): CollectionWill[] {
  return [...MOCK_WILL].sort((a, b) => a.priority - b.priority);
}

export function getTriggers(): LiquidationTrigger[] {
  return [...MOCK_TRIGGERS].filter((t) => t.enabled);
}

export function getEducationModules(): EducationModule[] {
  return [...MOCK_EDUCATION].sort((a, b) => {
    const diffOrder = { beginner: 0, intermediate: 1, advanced: 2 };
    return diffOrder[a.difficulty] - diffOrder[b.difficulty];
  });
}

export default {
  getPlan,
  getHeirs,
  getWill,
  getTriggers,
  getEducationModules,
};
