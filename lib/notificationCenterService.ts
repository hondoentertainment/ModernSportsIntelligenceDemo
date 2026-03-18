import { store } from './dal/syncStore';
import { CardInventory } from '../types';

// ---- Types ----

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export type NotificationCategory =
  | 'Trading'
  | 'Analytics'
  | 'Social'
  | 'Alerts'
  | 'Achievements'
  | 'System';

export type NotificationSource =
  | 'price_alert'
  | 'trade_offer'
  | 'anomaly'
  | 'rebalancing'
  | 'auth_alert'
  | 'rule_trigger'
  | 'achievement'
  | 'seasonal'
  | 'event'
  | 'goal';

export type DeliveryPreference = 'immediate' | 'daily_digest' | 'weekly_digest' | 'muted';

export type NotificationActionType = 'view_card' | 'accept_trade' | 'dismiss' | 'navigate' | 'acknowledge';

export interface NotificationAction {
  id: string;
  label: string;
  type: NotificationActionType;
  targetId?: string;
  variant: 'primary' | 'secondary' | 'danger';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  source: NotificationSource;
  priority: NotificationPriority;
  priorityScore: number; // 0-100
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
  expiresAt: string | null;
  groupId: string | null;
  cardId: string | null;
  actions: NotificationAction[];
  metadata?: Record<string, string | number>;
}

export interface NotificationGroup {
  id: string;
  label: string;
  category: NotificationCategory;
  notifications: Notification[];
  latestAt: string;
  priority: NotificationPriority;
}

export interface NotificationPreferences {
  categories: Record<NotificationCategory, DeliveryPreference>;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm
  quietHoursEnd: string;
  soundEnabled: boolean;
  badgeEnabled: boolean;
}

export interface DailyDigest {
  id: string;
  date: string;
  generatedAt: string;
  summary: string;
  highlights: DigestHighlight[];
  stats: DigestStats;
}

export interface DigestHighlight {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  notificationId: string;
}

export interface DigestStats {
  totalNotifications: number;
  criticalCount: number;
  highCount: number;
  categoryCounts: Record<NotificationCategory, number>;
  topCategory: NotificationCategory;
  actionableCount: number;
}

export interface NotificationSummary {
  totalUnread: number;
  totalCount: number;
  criticalUnread: number;
  highUnread: number;
  categoryCounts: Record<NotificationCategory, number>;
  categoryUnread: Record<NotificationCategory, number>;
  topPriority: Notification[];
  recentDigest: DailyDigest | null;
}

// ---- Constants ----

const _STORAGE_KEY = 'msi_notification_center';
const PREFS_KEY = 'msi_notification_prefs';
const DIGEST_KEY = 'msi_notification_digests';
const READ_KEY = 'msi_notification_read_ids';
const DISMISSED_KEY = 'msi_notification_dismissed_ids';

const PRIORITY_WEIGHTS: Record<NotificationPriority, number> = {
  critical: 90,
  high: 70,
  medium: 40,
  low: 15,
};

const SOURCE_CATEGORY_MAP: Record<NotificationSource, NotificationCategory> = {
  price_alert: 'Alerts',
  trade_offer: 'Trading',
  anomaly: 'Analytics',
  rebalancing: 'Analytics',
  auth_alert: 'System',
  rule_trigger: 'Alerts',
  achievement: 'Achievements',
  seasonal: 'Social',
  event: 'Social',
  goal: 'System',
};

const SOURCE_PRIORITY_MAP: Record<NotificationSource, NotificationPriority> = {
  price_alert: 'high',
  trade_offer: 'high',
  anomaly: 'critical',
  rebalancing: 'medium',
  auth_alert: 'critical',
  rule_trigger: 'medium',
  achievement: 'low',
  seasonal: 'low',
  event: 'medium',
  goal: 'medium',
};

const ALL_CATEGORIES: NotificationCategory[] = [
  'Trading',
  'Analytics',
  'Social',
  'Alerts',
  'Achievements',
  'System',
];

// ---- Deterministic seed helpers ----

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function deterministicId(prefix: string, index: number): string {
  return `${prefix}_${index.toString(36).padStart(6, '0')}`;
}

function deterministicDate(baseSeed: number, daysBack: number): string {
  const now = new Date('2026-03-12T09:00:00Z');
  const hoursBack = daysBack * 24 + (baseSeed % 24);
  const minutesOffset = baseSeed % 60;
  now.setHours(now.getHours() - hoursBack);
  now.setMinutes(minutesOffset);
  return now.toISOString();
}

// ---- Notification Generation ----

function generatePriceAlerts(cards: CardInventory[], rng: () => number): Notification[] {
  const results: Notification[] = [];
  const eligible = cards.filter((c) => c.currentValue && c.currentValue > 0);
  const count = Math.min(eligible.length, 4);

  for (let i = 0; i < count; i++) {
    const card = eligible[Math.floor(rng() * eligible.length)];
    const pctChange = (rng() * 30 - 10).toFixed(1);
    const isUp = parseFloat(pctChange) > 0;
    const severity: NotificationPriority = Math.abs(parseFloat(pctChange)) > 20 ? 'critical' : Math.abs(parseFloat(pctChange)) > 10 ? 'high' : 'medium';

    results.push({
      id: deterministicId('pa', i),
      title: isUp ? 'Price Surge Detected' : 'Price Drop Alert',
      message: `${card.player} (${card.year} ${card.set}) ${isUp ? 'up' : 'down'} ${Math.abs(parseFloat(pctChange))}% in the last 24h`,
      category: 'Alerts',
      source: 'price_alert',
      priority: severity,
      priorityScore: PRIORITY_WEIGHTS[severity] + Math.abs(parseFloat(pctChange)),
      isRead: false,
      isDismissed: false,
      createdAt: deterministicDate(i * 7 + 3, rng() * 2),
      expiresAt: null,
      groupId: 'grp_price_alerts',
      cardId: card.id,
      actions: [
        { id: `pa_act_view_${i}`, label: 'View Card', type: 'view_card', targetId: card.id, variant: 'primary' },
        { id: `pa_act_dismiss_${i}`, label: 'Dismiss', type: 'dismiss', variant: 'secondary' },
      ],
    });
  }
  return results;
}

function generateTradeOffers(cards: CardInventory[], rng: () => number): Notification[] {
  const results: Notification[] = [];
  const traders = ['CardKing_99', 'VintageCollector', 'GradeHunter', 'SportsVault', 'RookieScout'];
  const count = Math.min(cards.length, 3);

  for (let i = 0; i < count; i++) {
    const card = cards[Math.floor(rng() * cards.length)];
    const trader = traders[Math.floor(rng() * traders.length)];
    const offerValue = Math.round((card.currentValue || card.purchasePrice) * (0.85 + rng() * 0.35));

    results.push({
      id: deterministicId('to', i),
      title: 'New Trade Offer',
      message: `${trader} wants to trade for your ${card.player} ${card.year} — offering $${offerValue}`,
      category: 'Trading',
      source: 'trade_offer',
      priority: 'high',
      priorityScore: PRIORITY_WEIGHTS.high + (offerValue > (card.currentValue || 0) ? 15 : 0),
      isRead: false,
      isDismissed: false,
      createdAt: deterministicDate(i * 5 + 1, rng() * 3),
      expiresAt: deterministicDate(i * 5, -3),
      groupId: 'grp_trade_offers',
      cardId: card.id,
      actions: [
        { id: `to_act_accept_${i}`, label: 'Accept Trade', type: 'accept_trade', targetId: card.id, variant: 'primary' },
        { id: `to_act_view_${i}`, label: 'View Card', type: 'view_card', targetId: card.id, variant: 'secondary' },
        { id: `to_act_dismiss_${i}`, label: 'Decline', type: 'dismiss', variant: 'danger' },
      ],
    });
  }
  return results;
}

function generateAnomalyNotifications(cards: CardInventory[], rng: () => number): Notification[] {
  const results: Notification[] = [];
  const anomalyTypes = ['Price spike', 'Volume surge', 'Arbitrage opportunity', 'Stale pricing'];
  const count = Math.min(cards.length, 3);

  for (let i = 0; i < count; i++) {
    const card = cards[Math.floor(rng() * cards.length)];
    const anomalyType = anomalyTypes[Math.floor(rng() * anomalyTypes.length)];

    results.push({
      id: deterministicId('an', i),
      title: `Anomaly: ${anomalyType}`,
      message: `${anomalyType} detected for ${card.player} (${card.year} ${card.set}). Review recommended.`,
      category: 'Analytics',
      source: 'anomaly',
      priority: 'critical',
      priorityScore: PRIORITY_WEIGHTS.critical + 5,
      isRead: false,
      isDismissed: false,
      createdAt: deterministicDate(i * 3 + 2, rng() * 1.5),
      expiresAt: null,
      groupId: 'grp_anomalies',
      cardId: card.id,
      actions: [
        { id: `an_act_view_${i}`, label: 'View Card', type: 'view_card', targetId: card.id, variant: 'primary' },
        { id: `an_act_ack_${i}`, label: 'Acknowledge', type: 'acknowledge', variant: 'secondary' },
      ],
    });
  }
  return results;
}

function generateRebalanceNotifications(cards: CardInventory[], rng: () => number): Notification[] {
  const results: Notification[] = [];
  const sports = [...new Set(cards.map((c) => c.sport))];
  if (sports.length < 2) return results;

  const overweight = sports[Math.floor(rng() * sports.length)];
  const pct = (40 + rng() * 30).toFixed(0);

  results.push({
    id: deterministicId('rb', 0),
    title: 'Rebalance Recommendation',
    message: `Portfolio is ${pct}% concentrated in ${overweight}. Consider diversifying to reduce risk.`,
    category: 'Analytics',
    source: 'rebalancing',
    priority: 'medium',
    priorityScore: PRIORITY_WEIGHTS.medium + parseInt(pct) / 5,
    isRead: false,
    isDismissed: false,
    createdAt: deterministicDate(11, rng() * 5),
    expiresAt: null,
    groupId: null,
    cardId: null,
    actions: [
      { id: 'rb_act_nav_0', label: 'View Portfolio', type: 'navigate', variant: 'primary' },
      { id: 'rb_act_dismiss_0', label: 'Dismiss', type: 'dismiss', variant: 'secondary' },
    ],
  });

  return results;
}

function generateRuleTriggers(_cards: CardInventory[], rng: () => number): Notification[] {
  const results: Notification[] = [];
  const ruleNames = ['Stop-Loss Guard', 'Profit Taker', 'ROI Floor Alert', 'Holding Period Trigger'];
  const count = 2;

  for (let i = 0; i < count; i++) {
    const ruleName = ruleNames[Math.floor(rng() * ruleNames.length)];
    results.push({
      id: deterministicId('rt', i),
      title: `Rule Triggered: ${ruleName}`,
      message: `Automated rule "${ruleName}" was triggered. Check the rules engine for details.`,
      category: 'Alerts',
      source: 'rule_trigger',
      priority: 'medium',
      priorityScore: PRIORITY_WEIGHTS.medium + 10,
      isRead: false,
      isDismissed: false,
      createdAt: deterministicDate(i * 8 + 4, rng() * 4),
      expiresAt: null,
      groupId: 'grp_rules',
      cardId: null,
      actions: [
        { id: `rt_act_nav_${i}`, label: 'View Rules', type: 'navigate', variant: 'primary' },
        { id: `rt_act_ack_${i}`, label: 'Acknowledge', type: 'acknowledge', variant: 'secondary' },
      ],
    });
  }
  return results;
}

function generateAchievementNotifications(_cards: CardInventory[], rng: () => number): Notification[] {
  const achievements = [
    { name: 'First Card', desc: 'Added your first card to the collection' },
    { name: 'Diversifier', desc: 'Own cards from 3+ sports' },
    { name: 'Grading Pro', desc: 'Graded 5+ cards' },
    { name: 'Profit Maker', desc: 'Achieved 50%+ ROI on a card' },
  ];
  const results: Notification[] = [];
  const count = Math.min(achievements.length, 2);

  for (let i = 0; i < count; i++) {
    const ach = achievements[Math.floor(rng() * achievements.length)];
    results.push({
      id: deterministicId('ac', i),
      title: `Achievement Unlocked: ${ach.name}`,
      message: ach.desc,
      category: 'Achievements',
      source: 'achievement',
      priority: 'low',
      priorityScore: PRIORITY_WEIGHTS.low + 5,
      isRead: false,
      isDismissed: false,
      createdAt: deterministicDate(i * 12 + 6, rng() * 7),
      expiresAt: null,
      groupId: 'grp_achievements',
      cardId: null,
      actions: [
        { id: `ac_act_nav_${i}`, label: 'View Achievements', type: 'navigate', variant: 'primary' },
      ],
    });
  }
  return results;
}

function generateSeasonalNotifications(rng: () => number): Notification[] {
  const events = [
    { title: 'MLB Season Opening', msg: 'Baseball season starts soon — expect price movement on top prospects.' },
    { title: 'NBA Playoffs Approaching', msg: 'Playoff performers historically see 15-25% value increases.' },
    { title: 'NFL Draft Week', msg: 'Rookie card values are volatile during draft week. Monitor closely.' },
  ];
  const ev = events[Math.floor(rng() * events.length)];

  return [{
    id: deterministicId('se', 0),
    title: ev.title,
    message: ev.msg,
    category: 'Social',
    source: 'seasonal',
    priority: 'low',
    priorityScore: PRIORITY_WEIGHTS.low + 3,
    isRead: false,
    isDismissed: false,
    createdAt: deterministicDate(15, rng() * 5),
    expiresAt: null,
    groupId: null,
    cardId: null,
    actions: [
      { id: 'se_act_nav_0', label: 'View Calendar', type: 'navigate', variant: 'primary' },
    ],
  }];
}

function generateAuthAlerts(rng: () => number): Notification[] {
  return [{
    id: deterministicId('au', 0),
    title: 'Security: New Device Login',
    message: 'A new login was detected from Chrome on Windows. If this was not you, secure your account immediately.',
    category: 'System',
    source: 'auth_alert',
    priority: 'critical',
    priorityScore: PRIORITY_WEIGHTS.critical + 10,
    isRead: false,
    isDismissed: false,
    createdAt: deterministicDate(2, rng() * 0.5),
    expiresAt: null,
    groupId: null,
    cardId: null,
    actions: [
      { id: 'au_act_ack_0', label: 'This Was Me', type: 'acknowledge', variant: 'primary' },
      { id: 'au_act_nav_0', label: 'Secure Account', type: 'navigate', variant: 'danger' },
    ],
  }];
}

function generateGoalNotifications(cards: CardInventory[], rng: () => number): Notification[] {
  const totalValue = cards.reduce((sum, c) => sum + (c.currentValue || c.purchasePrice), 0);
  const goalTarget = Math.round(totalValue * 1.2);

  return [{
    id: deterministicId('go', 0),
    title: 'Goal Progress Update',
    message: `Portfolio value is $${totalValue.toLocaleString()} — ${((totalValue / goalTarget) * 100).toFixed(0)}% toward your $${goalTarget.toLocaleString()} target.`,
    category: 'System',
    source: 'goal',
    priority: 'medium',
    priorityScore: PRIORITY_WEIGHTS.medium + 5,
    isRead: false,
    isDismissed: false,
    createdAt: deterministicDate(8, rng() * 3),
    expiresAt: null,
    groupId: null,
    cardId: null,
    actions: [
      { id: 'go_act_nav_0', label: 'View Goals', type: 'navigate', variant: 'primary' },
    ],
  }];
}

// ---- Core Logic ----

function generateAllNotifications(cards: CardInventory[]): Notification[] {
  const rng = seededRandom(cards.length * 7919 + 42);
  if (cards.length === 0) return [];

  const all: Notification[] = [
    ...generatePriceAlerts(cards, rng),
    ...generateTradeOffers(cards, rng),
    ...generateAnomalyNotifications(cards, rng),
    ...generateRebalanceNotifications(cards, rng),
    ...generateRuleTriggers(cards, rng),
    ...generateAchievementNotifications(cards, rng),
    ...generateSeasonalNotifications(rng),
    ...generateAuthAlerts(rng),
    ...generateGoalNotifications(cards, rng),
  ];

  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function computePriorityScore(notification: Notification): number {
  const basePriority = PRIORITY_WEIGHTS[notification.priority];
  const ageHours = (Date.now() - new Date(notification.createdAt).getTime()) / 3600000;
  const agePenalty = Math.min(ageHours * 0.5, 20);
  const unreadBonus = notification.isRead ? 0 : 10;
  const actionBonus = notification.actions.length > 1 ? 5 : 0;
  return Math.max(0, Math.min(100, basePriority - agePenalty + unreadBonus + actionBonus));
}

// ---- Smart Grouping ----

export function groupNotifications(notifications: Notification[]): NotificationGroup[] {
  const groupMap = new Map<string, Notification[]>();

  for (const n of notifications) {
    if (n.isDismissed) continue;
    const key = n.groupId || `solo_${n.id}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(n);
  }

  const groups: NotificationGroup[] = [];
  for (const [id, items] of groupMap) {
    const sorted = items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const highestPriority = sorted.reduce((best, n) => {
      const order: NotificationPriority[] = ['critical', 'high', 'medium', 'low'];
      return order.indexOf(n.priority) < order.indexOf(best) ? n.priority : best;
    }, 'low' as NotificationPriority);

    const groupLabels: Record<string, string> = {
      grp_price_alerts: 'Price Alerts',
      grp_trade_offers: 'Trade Offers',
      grp_anomalies: 'Market Anomalies',
      grp_rules: 'Rule Triggers',
      grp_achievements: 'Achievements',
    };

    groups.push({
      id,
      label: groupLabels[id] || sorted[0].title,
      category: sorted[0].category,
      notifications: sorted,
      latestAt: sorted[0].createdAt,
      priority: highestPriority,
    });
  }

  return groups.sort((a, b) => {
    const priorityOrder: NotificationPriority[] = ['critical', 'high', 'medium', 'low'];
    const pa = priorityOrder.indexOf(a.priority);
    const pb = priorityOrder.indexOf(b.priority);
    if (pa !== pb) return pa - pb;
    return new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime();
  });
}

// ---- localStorage Persistence ----

function loadReadIds(): Set<string> {
  return new Set(store.get<string[]>(READ_KEY, []));
}

function saveReadIds(ids: Set<string>): void {
  store.set(READ_KEY, [...ids]);
}

function loadDismissedIds(): Set<string> {
  return new Set(store.get<string[]>(DISMISSED_KEY, []));
}

function saveDismissedIds(ids: Set<string>): void {
  store.set(DISMISSED_KEY, [...ids]);
}

export function loadPreferences(): NotificationPreferences {
  return store.get<NotificationPreferences>(PREFS_KEY, getDefaultPreferences());
}

export function savePreferences(prefs: NotificationPreferences): void {
  store.set(PREFS_KEY, prefs);
}

function getDefaultPreferences(): NotificationPreferences {
  const categories = {} as Record<NotificationCategory, DeliveryPreference>;
  for (const cat of ALL_CATEGORIES) {
    categories[cat] = cat === 'System' || cat === 'Alerts' ? 'immediate' : 'daily_digest';
  }
  return {
    categories,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    soundEnabled: true,
    badgeEnabled: true,
  };
}

function loadDigests(): DailyDigest[] {
  return store.get<DailyDigest[]>(DIGEST_KEY, []);
}

function saveDigests(digests: DailyDigest[]): void {
  store.set(DIGEST_KEY, digests);
}

// ---- Public API ----

export function getNotifications(cards: CardInventory[]): Notification[] {
  const generated = generateAllNotifications(cards);
  const readIds = loadReadIds();
  const dismissedIds = loadDismissedIds();

  return generated.map((n) => ({
    ...n,
    isRead: readIds.has(n.id),
    isDismissed: dismissedIds.has(n.id),
    priorityScore: computePriorityScore({ ...n, isRead: readIds.has(n.id) }),
  }));
}

export function getActiveNotifications(cards: CardInventory[]): Notification[] {
  const prefs = loadPreferences();
  return getNotifications(cards).filter((n) => {
    if (n.isDismissed) return false;
    if (prefs.categories[n.category] === 'muted') return false;
    return true;
  });
}

export function markAsRead(notificationId: string): void {
  const ids = loadReadIds();
  ids.add(notificationId);
  saveReadIds(ids);
}

export function markAllAsRead(notificationIds: string[]): void {
  const ids = loadReadIds();
  for (const id of notificationIds) ids.add(id);
  saveReadIds(ids);
}

export function dismissNotification(notificationId: string): void {
  const ids = loadDismissedIds();
  ids.add(notificationId);
  saveDismissedIds(ids);
}

export function clearAllDismissed(): void {
  saveDismissedIds(new Set());
}

export function getNotificationsByCategory(
  cards: CardInventory[],
  category: NotificationCategory
): Notification[] {
  return getActiveNotifications(cards).filter((n) => n.category === category);
}

export function searchNotifications(
  cards: CardInventory[],
  query: string,
  dateFrom?: string,
  dateTo?: string
): Notification[] {
  const all = getNotifications(cards);
  const lowerQuery = query.toLowerCase();

  return all.filter((n) => {
    const matchesQuery =
      !query ||
      n.title.toLowerCase().includes(lowerQuery) ||
      n.message.toLowerCase().includes(lowerQuery);

    const matchesFrom = !dateFrom || new Date(n.createdAt) >= new Date(dateFrom);
    const matchesTo = !dateTo || new Date(n.createdAt) <= new Date(dateTo);

    return matchesQuery && matchesFrom && matchesTo;
  });
}

export function generateDailyDigest(cards: CardInventory[]): DailyDigest {
  const notifications = getActiveNotifications(cards);
  const today = new Date().toISOString().split('T')[0];

  const existing = loadDigests();
  const existingToday = existing.find((d) => d.date === today);
  if (existingToday) return existingToday;

  const categoryCounts = {} as Record<NotificationCategory, number>;
  for (const cat of ALL_CATEGORIES) categoryCounts[cat] = 0;

  let criticalCount = 0;
  let highCount = 0;
  let actionableCount = 0;

  for (const n of notifications) {
    categoryCounts[n.category] = (categoryCounts[n.category] || 0) + 1;
    if (n.priority === 'critical') criticalCount++;
    if (n.priority === 'high') highCount++;
    if (n.actions.length > 0) actionableCount++;
  }

  const topCategory = ALL_CATEGORIES.reduce((best, cat) =>
    categoryCounts[cat] > categoryCounts[best] ? cat : best
  );

  const highlights: DigestHighlight[] = notifications
    .filter((n) => !n.isRead)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5)
    .map((n) => ({
      id: `dh_${n.id}`,
      title: n.title,
      description: n.message,
      category: n.category,
      priority: n.priority,
      notificationId: n.id,
    }));

  const summaryParts: string[] = [];
  if (criticalCount > 0) summaryParts.push(`${criticalCount} critical alert${criticalCount > 1 ? 's' : ''}`);
  if (highCount > 0) summaryParts.push(`${highCount} high-priority item${highCount > 1 ? 's' : ''}`);
  summaryParts.push(`${notifications.length} total notifications across ${Object.values(categoryCounts).filter((c) => c > 0).length} categories`);

  const digest: DailyDigest = {
    id: `digest_${today}`,
    date: today,
    generatedAt: new Date().toISOString(),
    summary: `Morning Briefing: ${summaryParts.join(', ')}.`,
    highlights,
    stats: {
      totalNotifications: notifications.length,
      criticalCount,
      highCount,
      categoryCounts,
      topCategory,
      actionableCount,
    },
  };

  const updated = [digest, ...existing].slice(0, 30);
  saveDigests(updated);

  return digest;
}

export function getNotificationSummary(cards: CardInventory[]): NotificationSummary {
  const notifications = getActiveNotifications(cards);
  const unread = notifications.filter((n) => !n.isRead);

  const categoryCounts = {} as Record<NotificationCategory, number>;
  const categoryUnread = {} as Record<NotificationCategory, number>;
  for (const cat of ALL_CATEGORIES) {
    categoryCounts[cat] = 0;
    categoryUnread[cat] = 0;
  }

  for (const n of notifications) {
    categoryCounts[n.category]++;
    if (!n.isRead) categoryUnread[n.category]++;
  }

  const topPriority = [...unread]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 3);

  const digests = loadDigests();

  return {
    totalUnread: unread.length,
    totalCount: notifications.length,
    criticalUnread: unread.filter((n) => n.priority === 'critical').length,
    highUnread: unread.filter((n) => n.priority === 'high').length,
    categoryCounts,
    categoryUnread,
    topPriority,
    recentDigest: digests.length > 0 ? digests[0] : null,
  };
}

export {
  ALL_CATEGORIES,
  PRIORITY_WEIGHTS,
  SOURCE_CATEGORY_MAP,
  SOURCE_PRIORITY_MAP,
};
