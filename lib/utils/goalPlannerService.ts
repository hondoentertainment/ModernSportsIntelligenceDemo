import { CardInventory } from '../../types';
import { store } from '../dal/syncStore';

// ---- Types ----

export type GoalType =
  | 'portfolio_value'
  | 'card_count'
  | 'sport_diversification'
  | 'roi_target'
  | 'set_completion';

export type GoalStatus = 'active' | 'completed' | 'abandoned';
export type TrackingStatus = 'ahead' | 'on_track' | 'behind';
export type ArchetypeId = 'casual' | 'investor' | 'set_builder' | 'flipper';

export interface CollectionGoal {
  id: string;
  type: GoalType;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  startValue: number;
  startDate: string;
  targetDate: string;
  status: GoalStatus;
  trackingStatus: TrackingStatus;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, string>;
}

export interface GoalMilestone {
  id: string;
  goalId: string;
  label: string;
  targetValue: number;
  targetDate: string;
  achieved: boolean;
  achievedDate?: string;
  progress: number;
}

export interface ProgressSnapshot {
  id: string;
  goalId: string;
  date: string;
  value: number;
  projectedValue: number;
  note?: string;
}

export interface GapAnalysis {
  goalId: string;
  currentValue: number;
  targetValue: number;
  gap: number;
  gapPercent: number;
  daysRemaining: number;
  dailyRateNeeded: number;
  monthlyRateNeeded: number;
  projectedCompletionDate: string;
  willReachTarget: boolean;
  estimatedMonthlyContribution: number;
  historicalMonthlyGrowth: number;
}

export interface GoalTemplate {
  id: string;
  archetype: ArchetypeId;
  archetypeLabel: string;
  archetypeDescription: string;
  goals: Omit<CollectionGoal, 'id' | 'currentValue' | 'startValue' | 'createdAt' | 'updatedAt' | 'trackingStatus' | 'progress'>[];
}

export interface GoalSummary {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  primaryGoal: CollectionGoal | null;
  overallProgress: number;
  aheadCount: number;
  onTrackCount: number;
  behindCount: number;
  nextMilestone: GoalMilestone | null;
  achievementTriggers: string[];
}

// ---- Constants & Keys ----

const GOALS_KEY = 'msi_collection_goals';
const MILESTONES_KEY = 'msi_goal_milestones';
const SNAPSHOTS_KEY = 'msi_goal_snapshots';

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  portfolio_value: 'Portfolio Value',
  card_count: 'Card Count',
  sport_diversification: 'Sport Diversification',
  roi_target: 'ROI Target',
  set_completion: 'Set Completion',
};

const GOAL_TYPE_UNITS: Record<GoalType, string> = {
  portfolio_value: '$',
  card_count: 'cards',
  sport_diversification: 'sports',
  roi_target: '%',
  set_completion: '%',
};

export { GOAL_TYPE_LABELS, GOAL_TYPE_UNITS };

// ---- Deterministic helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset * 9301 + 49297) * 49979;
  return x - Math.floor(x);
}

function generateId(): string {
  return 'goal_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const d1 = new Date(from).getTime();
  const d2 = new Date(to).getTime();
  return Math.max(0, Math.round((d2 - d1) / 86400000));
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

// ---- localStorage helpers ----

function loadGoals(): CollectionGoal[] {
  return store.get<CollectionGoal[]>(GOALS_KEY, []);
}

function saveGoals(goals: CollectionGoal[]): void {
  store.set(GOALS_KEY, goals);
}

function loadMilestones(): GoalMilestone[] {
  return store.get<GoalMilestone[]>(MILESTONES_KEY, []);
}

function saveMilestones(milestones: GoalMilestone[]): void {
  store.set(MILESTONES_KEY, milestones);
}

function loadSnapshots(): ProgressSnapshot[] {
  return store.get<ProgressSnapshot[]>(SNAPSHOTS_KEY, []);
}

function saveSnapshots(snapshots: ProgressSnapshot[]): void {
  store.set(SNAPSHOTS_KEY, snapshots);
}

// ---- Portfolio metric calculators ----

function getPortfolioValue(inventory: CardInventory[]): number {
  return inventory.reduce((sum, c) => sum + (c.currentValue ?? c.purchasePrice), 0);
}

function getCardCount(inventory: CardInventory[]): number {
  return inventory.filter(c => c.status !== 'sold').length;
}

function getSportCount(inventory: CardInventory[]): number {
  const sports = new Set(inventory.map(c => c.sport));
  return sports.size;
}

function getPortfolioROI(inventory: CardInventory[]): number {
  const totalCost = inventory.reduce((s, c) => s + c.purchasePrice, 0);
  if (totalCost === 0) return 0;
  const totalValue = getPortfolioValue(inventory);
  return ((totalValue - totalCost) / totalCost) * 100;
}

function getSetCompletionPercent(inventory: CardInventory[], setName?: string): number {
  if (!setName) return 0;
  const setCards = inventory.filter(c => c.set === setName);
  // Simulate set sizes deterministically
  const seed = setName.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const setSize = Math.floor(seededRandom(seed, 1) * 300) + 50;
  return Math.min(100, Math.round((setCards.length / setSize) * 100));
}

export function getCurrentValueForGoal(type: GoalType, inventory: CardInventory[], metadata?: Record<string, string>): number {
  switch (type) {
    case 'portfolio_value': return getPortfolioValue(inventory);
    case 'card_count': return getCardCount(inventory);
    case 'sport_diversification': return getSportCount(inventory);
    case 'roi_target': return getPortfolioROI(inventory);
    case 'set_completion': return getSetCompletionPercent(inventory, metadata?.setName);
  }
}

// ---- Tracking status calculation ----

function computeTrackingStatus(goal: CollectionGoal): TrackingStatus {
  const totalDays = daysBetween(goal.startDate, goal.targetDate);
  const elapsedDays = daysBetween(goal.startDate, today());
  if (totalDays === 0) return 'on_track';

  const timePercent = Math.min(1, elapsedDays / totalDays);
  const expectedProgress = timePercent * 100;
  const actualProgress = goal.progress;

  if (actualProgress >= expectedProgress + 10) return 'ahead';
  if (actualProgress >= expectedProgress - 10) return 'on_track';
  return 'behind';
}

function computeProgress(current: number, start: number, target: number): number {
  if (target <= start) return current >= target ? 100 : 0;
  const raw = ((current - start) / (target - start)) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

// ---- Gap analysis ----

export function analyzeGap(goal: CollectionGoal, inventory: CardInventory[]): GapAnalysis {
  const current = getCurrentValueForGoal(goal.type, inventory, goal.metadata);
  const gap = Math.max(0, goal.targetValue - current);
  const gapPercent = goal.targetValue > 0 ? (gap / goal.targetValue) * 100 : 0;
  const daysRemaining = daysBetween(today(), goal.targetDate);
  const daysElapsed = daysBetween(goal.startDate, today());

  // Historical growth rate
  const growth = daysElapsed > 0 ? (current - goal.startValue) / daysElapsed : 0;
  const dailyRateNeeded = daysRemaining > 0 ? gap / daysRemaining : gap;
  const monthlyRateNeeded = dailyRateNeeded * 30;
  const historicalMonthlyGrowth = growth * 30;

  // Projected completion
  let projectedCompletionDate = goal.targetDate;
  let willReachTarget = true;
  if (growth > 0 && gap > 0) {
    const daysToComplete = Math.ceil(gap / growth);
    const projDate = new Date();
    projDate.setDate(projDate.getDate() + daysToComplete);
    projectedCompletionDate = projDate.toISOString().slice(0, 10);
    willReachTarget = projectedCompletionDate <= goal.targetDate;
  } else if (gap > 0 && growth <= 0) {
    willReachTarget = false;
    const fallback = new Date(goal.targetDate);
    fallback.setFullYear(fallback.getFullYear() + 2);
    projectedCompletionDate = fallback.toISOString().slice(0, 10);
  }

  // Monthly contribution estimate: assumes ~6% annual appreciation on cards
  const annualAppreciation = 0.06;
  const monthsRemaining = Math.max(1, daysRemaining / 30);
  const monthlyAppreciationRate = Math.pow(1 + annualAppreciation, 1 / 12) - 1;
  let estimatedMonthlyContribution = 0;
  if (goal.type === 'portfolio_value' && gap > 0) {
    if (monthlyAppreciationRate > 0) {
      // Future value of annuity formula: FV = PMT * ((1+r)^n - 1) / r
      const compoundFactor = (Math.pow(1 + monthlyAppreciationRate, monthsRemaining) - 1) / monthlyAppreciationRate;
      estimatedMonthlyContribution = compoundFactor > 0 ? gap / compoundFactor : gap / monthsRemaining;
    } else {
      estimatedMonthlyContribution = gap / monthsRemaining;
    }
  }

  return {
    goalId: goal.id,
    currentValue: current,
    targetValue: goal.targetValue,
    gap,
    gapPercent: Math.round(gapPercent * 10) / 10,
    daysRemaining,
    dailyRateNeeded: Math.round(dailyRateNeeded * 100) / 100,
    monthlyRateNeeded: Math.round(monthlyRateNeeded * 100) / 100,
    projectedCompletionDate,
    willReachTarget,
    estimatedMonthlyContribution: Math.round(estimatedMonthlyContribution),
    historicalMonthlyGrowth: Math.round(historicalMonthlyGrowth * 100) / 100,
  };
}

// ---- Milestone generation ----

function generateMilestones(goal: CollectionGoal): GoalMilestone[] {
  const milestones: GoalMilestone[] = [];
  const totalDays = daysBetween(goal.startDate, goal.targetDate);
  const quarters = Math.max(1, Math.floor(totalDays / 90));
  const valueRange = goal.targetValue - goal.startValue;

  for (let i = 1; i <= Math.min(quarters, 8); i++) {
    const fraction = i / (quarters + 1);
    const targetDate = addMonths(goal.startDate, i * 3);
    if (targetDate >= goal.targetDate) break;
    milestones.push({
      id: `ms_${goal.id}_q${i}`,
      goalId: goal.id,
      label: `Q${i} Checkpoint`,
      targetValue: Math.round(goal.startValue + valueRange * fraction),
      targetDate,
      achieved: false,
      progress: 0,
    });
  }

  // Final milestone at 100%
  milestones.push({
    id: `ms_${goal.id}_final`,
    goalId: goal.id,
    label: 'Goal Complete',
    targetValue: goal.targetValue,
    targetDate: goal.targetDate,
    achieved: false,
    progress: 0,
  });

  return milestones;
}

function updateMilestones(goalId: string, currentValue: number): void {
  const milestones = loadMilestones();
  let changed = false;
  milestones.forEach(ms => {
    if (ms.goalId !== goalId) return;
    if (!ms.achieved && currentValue >= ms.targetValue) {
      ms.achieved = true;
      ms.achievedDate = today();
      ms.progress = 100;
      changed = true;
    } else if (!ms.achieved) {
      const goalStart = loadGoals().find(g => g.id === goalId)?.startValue ?? 0;
      const range = ms.targetValue - goalStart;
      ms.progress = range > 0 ? Math.min(100, Math.round(((currentValue - goalStart) / range) * 100)) : 0;
      changed = true;
    }
  });
  if (changed) saveMilestones(milestones);
}

// ---- Snapshot recording ----

function recordSnapshot(goal: CollectionGoal, inventory: CardInventory[]): void {
  const snapshots = loadSnapshots();
  const todayStr = today();
  // One snapshot per goal per day
  const exists = snapshots.some(s => s.goalId === goal.id && s.date === todayStr);
  if (exists) return;

  const analysis = analyzeGap(goal, inventory);
  snapshots.push({
    id: `snap_${Date.now().toString(36)}`,
    goalId: goal.id,
    date: todayStr,
    value: analysis.currentValue,
    projectedValue: analysis.willReachTarget ? goal.targetValue : analysis.currentValue + analysis.historicalMonthlyGrowth * (analysis.daysRemaining / 30),
  });
  saveSnapshots(snapshots);
}

// ---- CRUD Operations ----

export function createGoal(
  type: GoalType,
  title: string,
  description: string,
  targetValue: number,
  targetDate: string,
  inventory: CardInventory[],
  metadata?: Record<string, string>
): CollectionGoal {
  const currentValue = getCurrentValueForGoal(type, inventory, metadata);
  const now = new Date().toISOString();

  const goal: CollectionGoal = {
    id: generateId(),
    type,
    title,
    description,
    targetValue,
    currentValue,
    startValue: currentValue,
    startDate: today(),
    targetDate,
    status: 'active',
    trackingStatus: 'on_track',
    progress: computeProgress(currentValue, currentValue, targetValue),
    createdAt: now,
    updatedAt: now,
    metadata,
  };

  const goals = loadGoals();
  goals.push(goal);
  saveGoals(goals);

  // Generate milestones
  const milestones = loadMilestones();
  milestones.push(...generateMilestones(goal));
  saveMilestones(milestones);

  // Initial snapshot
  recordSnapshot(goal, inventory);

  return goal;
}

export function updateGoal(goalId: string, updates: Partial<Pick<CollectionGoal, 'title' | 'description' | 'targetValue' | 'targetDate' | 'status'>>): CollectionGoal | null {
  const goals = loadGoals();
  const idx = goals.findIndex(g => g.id === goalId);
  if (idx === -1) return null;

  goals[idx] = { ...goals[idx], ...updates, updatedAt: new Date().toISOString() };
  saveGoals(goals);
  return goals[idx];
}

export function deleteGoal(goalId: string): void {
  const goals = loadGoals().filter(g => g.id !== goalId);
  saveGoals(goals);
  const milestones = loadMilestones().filter(m => m.goalId !== goalId);
  saveMilestones(milestones);
  const snapshots = loadSnapshots().filter(s => s.goalId !== goalId);
  saveSnapshots(snapshots);
}

export function getGoals(): CollectionGoal[] {
  return loadGoals();
}

export function getGoalById(goalId: string): CollectionGoal | null {
  return loadGoals().find(g => g.id === goalId) ?? null;
}

export function getMilestonesForGoal(goalId: string): GoalMilestone[] {
  return loadMilestones().filter(m => m.goalId === goalId);
}

export function getSnapshotsForGoal(goalId: string): ProgressSnapshot[] {
  return loadSnapshots().filter(s => s.goalId === goalId);
}

// ---- Refresh all goals against inventory ----

export function refreshGoals(inventory: CardInventory[]): CollectionGoal[] {
  const goals = loadGoals();
  let changed = false;

  goals.forEach(goal => {
    if (goal.status !== 'active') return;

    const current = getCurrentValueForGoal(goal.type, inventory, goal.metadata);
    const progress = computeProgress(current, goal.startValue, goal.targetValue);
    const trackingStatus = computeTrackingStatus({ ...goal, currentValue: current, progress });

    if (goal.currentValue !== current || goal.progress !== progress || goal.trackingStatus !== trackingStatus) {
      goal.currentValue = current;
      goal.progress = progress;
      goal.trackingStatus = trackingStatus;
      goal.updatedAt = new Date().toISOString();

      if (progress >= 100 && goal.status === 'active') {
        goal.status = 'completed';
      }

      changed = true;
      updateMilestones(goal.id, current);
      recordSnapshot(goal, inventory);
    }
  });

  if (changed) saveGoals(goals);
  return goals;
}

// ---- Goal Templates ----

export function getGoalTemplates(): GoalTemplate[] {
  return [
    {
      id: 'tmpl_casual',
      archetype: 'casual',
      archetypeLabel: 'Casual Collector',
      archetypeDescription: 'Enjoy collecting at your own pace with modest growth targets',
      goals: [
        {
          type: 'card_count',
          title: 'Build a 100-Card Collection',
          description: 'Grow your collection to 100 cards across any sport',
          targetValue: 100,
          startDate: today(),
          targetDate: addMonths(today(), 12),
          status: 'active',
        },
        {
          type: 'sport_diversification',
          title: 'Explore 3 Sports',
          description: 'Diversify by collecting cards from at least 3 different sports',
          targetValue: 3,
          startDate: today(),
          targetDate: addMonths(today(), 6),
          status: 'active',
        },
      ],
    },
    {
      id: 'tmpl_investor',
      archetype: 'investor',
      archetypeLabel: 'Serious Investor',
      archetypeDescription: 'Maximize portfolio value and ROI through strategic acquisitions',
      goals: [
        {
          type: 'portfolio_value',
          title: 'Reach $100K Portfolio',
          description: 'Build a six-figure sports card portfolio through smart investing',
          targetValue: 100000,
          startDate: today(),
          targetDate: addMonths(today(), 24),
          status: 'active',
        },
        {
          type: 'roi_target',
          title: '25% Annual ROI',
          description: 'Achieve a 25% return on investment across your portfolio',
          targetValue: 25,
          startDate: today(),
          targetDate: addMonths(today(), 12),
          status: 'active',
        },
      ],
    },
    {
      id: 'tmpl_set_builder',
      archetype: 'set_builder',
      archetypeLabel: 'Set Builder',
      archetypeDescription: 'Complete full sets and build comprehensive collections',
      goals: [
        {
          type: 'card_count',
          title: 'Reach 500 Cards',
          description: 'Build an extensive collection of 500 cards for set completion',
          targetValue: 500,
          startDate: today(),
          targetDate: addMonths(today(), 18),
          status: 'active',
        },
        {
          type: 'set_completion',
          title: 'Complete a Set to 75%',
          description: 'Get at least 75% completion on any single card set',
          targetValue: 75,
          startDate: today(),
          targetDate: addMonths(today(), 12),
          status: 'active',
          metadata: { setName: '2023 Topps Chrome' },
        },
      ],
    },
    {
      id: 'tmpl_flipper',
      archetype: 'flipper',
      archetypeLabel: 'Flipper',
      archetypeDescription: 'Buy low, sell high — maximize trading profits quickly',
      goals: [
        {
          type: 'roi_target',
          title: '50% ROI in 6 Months',
          description: 'Generate aggressive returns through strategic flipping',
          targetValue: 50,
          startDate: today(),
          targetDate: addMonths(today(), 6),
          status: 'active',
        },
        {
          type: 'portfolio_value',
          title: '$25K Trading Profit',
          description: 'Reach $25K in total portfolio value from flipping activity',
          targetValue: 25000,
          startDate: today(),
          targetDate: addMonths(today(), 12),
          status: 'active',
        },
      ],
    },
  ];
}

// ---- Apply a template ----

export function applyTemplate(archetype: ArchetypeId, inventory: CardInventory[]): CollectionGoal[] {
  const templates = getGoalTemplates();
  const tmpl = templates.find(t => t.archetype === archetype);
  if (!tmpl) return [];

  const created: CollectionGoal[] = [];
  tmpl.goals.forEach(g => {
    const goal = createGoal(g.type, g.title, g.description, g.targetValue, g.targetDate, inventory, g.metadata);
    created.push(goal);
  });
  return created;
}

// ---- Generate deterministic demo snapshots for a goal ----

export function generateDemoSnapshots(goal: CollectionGoal): ProgressSnapshot[] {
  const snapshots: ProgressSnapshot[] = [];
  const totalDays = daysBetween(goal.startDate, today());
  const intervals = Math.min(12, Math.max(4, Math.floor(totalDays / 14)));
  const valueRange = goal.currentValue - goal.startValue;

  for (let i = 0; i <= intervals; i++) {
    const fraction = i / intervals;
    const date = new Date(goal.startDate);
    date.setDate(date.getDate() + Math.floor(totalDays * fraction));
    const dateStr = date.toISOString().slice(0, 10);

    // Add slight randomness to simulate real progress
    const noise = seededRandom(goal.id.length, i) * 0.1 - 0.05;
    const value = goal.startValue + valueRange * (fraction + noise);
    const idealValue = goal.startValue + (goal.targetValue - goal.startValue) * fraction;

    snapshots.push({
      id: `demo_snap_${goal.id}_${i}`,
      goalId: goal.id,
      date: dateStr,
      value: Math.round(value * 100) / 100,
      projectedValue: Math.round(idealValue * 100) / 100,
    });
  }

  return snapshots;
}

// ---- Summary for widget ----

export function getGoalSummary(inventory: CardInventory[]): GoalSummary {
  const goals = refreshGoals(inventory);
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  // Primary goal = first active goal, or most recently created
  const primaryGoal = activeGoals.length > 0
    ? activeGoals.reduce((best, g) => new Date(g.createdAt) < new Date(best.createdAt) ? g : best)
    : null;

  const overallProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length)
    : 0;

  const aheadCount = activeGoals.filter(g => g.trackingStatus === 'ahead').length;
  const onTrackCount = activeGoals.filter(g => g.trackingStatus === 'on_track').length;
  const behindCount = activeGoals.filter(g => g.trackingStatus === 'behind').length;

  // Next milestone
  const allMilestones = loadMilestones().filter(m => !m.achieved);
  const nextMilestone = allMilestones.length > 0
    ? allMilestones.reduce((closest, m) => !closest || m.targetDate < closest.targetDate ? m : closest)
    : null;

  // Achievement triggers (mention Phase 37)
  const achievementTriggers: string[] = [];
  if (completedGoals.length >= 1) achievementTriggers.push('goal_completer');
  if (activeGoals.length >= 3) achievementTriggers.push('ambitious_planner');
  if (aheadCount > 0) achievementTriggers.push('overachiever');

  return {
    totalGoals: goals.length,
    activeGoals: activeGoals.length,
    completedGoals: completedGoals.length,
    primaryGoal,
    overallProgress,
    aheadCount,
    onTrackCount,
    behindCount,
    nextMilestone,
    achievementTriggers,
  };
}

// ---- Format helpers ----

export function formatGoalValue(type: GoalType, value: number): string {
  switch (type) {
    case 'portfolio_value':
      return value >= 1000 ? `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K` : `$${Math.round(value)}`;
    case 'card_count':
      return `${Math.round(value)} cards`;
    case 'sport_diversification':
      return `${Math.round(value)} sport${value !== 1 ? 's' : ''}`;
    case 'roi_target':
      return `${value.toFixed(1)}%`;
    case 'set_completion':
      return `${Math.round(value)}%`;
  }
}

export function formatCurrency(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return `$${Math.round(value)}`;
}

export function getTrackingColor(status: TrackingStatus): { text: string; bg: string; border: string } {
  switch (status) {
    case 'ahead': return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    case 'on_track': return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    case 'behind': return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
  }
}

export function getTrackingLabel(status: TrackingStatus): string {
  switch (status) {
    case 'ahead': return 'Ahead of Schedule';
    case 'on_track': return 'On Track';
    case 'behind': return 'Behind Schedule';
  }
}
