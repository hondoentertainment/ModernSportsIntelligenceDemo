// @ts-nocheck
// ---- Types ----

export type NotificationChannel =
  | 'price_alert'
  | 'auction_ending'
  | 'grading_update'
  | 'trade_offer'
  | 'market_movement'
  | 'portfolio_change'
  | 'social_mention'
  | 'system';

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export type WebSocketConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

export interface NotificationAction {
  id: string;
  label: string;
  type: 'link' | 'dismiss' | 'accept' | 'decline' | 'view';
  payload?: string;
}

export interface RealtimeNotification {
  id: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isDismissed: boolean;
  icon?: string;
  imageUrl?: string;
  actions: NotificationAction[];
  metadata: Record<string, string | number | boolean>;
}

export interface NotificationFilter {
  channels?: NotificationChannel[];
  priorities?: NotificationPriority[];
  isRead?: boolean;
  search?: string;
  since?: string;
  limit?: number;
}

export interface NotificationStats {
  totalReceived: number;
  totalUnread: number;
  totalDismissed: number;
  byChannel: Record<NotificationChannel, number>;
  byPriority: Record<NotificationPriority, number>;
  avgResponseTimeMs: number;
  peakHour: number;
  lastReceivedAt: string | null;
}

export interface NotificationPreference {
  channel: NotificationChannel;
  enabled: boolean;
  soundEnabled: boolean;
  priority: NotificationPriority;
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string;   // HH:mm
}

export interface NotificationDigest {
  period: 'hourly' | 'daily' | 'weekly';
  generatedAt: string;
  totalCount: number;
  highlights: RealtimeNotification[];
  channelBreakdown: Record<NotificationChannel, number>;
  topPriorityItems: RealtimeNotification[];
}

export interface NotificationRule {
  id: string;
  name: string;
  channel: NotificationChannel;
  condition: string;       // e.g. 'price_drop > 10%'
  threshold: number;
  enabled: boolean;
  createdAt: string;
  triggeredCount: number;
}

// ---- Constants ----

const ALL_CHANNELS: NotificationChannel[] = [
  'price_alert', 'auction_ending', 'grading_update', 'trade_offer',
  'market_movement', 'portfolio_change', 'social_mention', 'system',
];

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  price_alert: 'Price Alert',
  auction_ending: 'Auction Ending',
  grading_update: 'Grading Update',
  trade_offer: 'Trade Offer',
  market_movement: 'Market Movement',
  portfolio_change: 'Portfolio Change',
  social_mention: 'Social Mention',
  system: 'System',
};

export { ALL_CHANNELS, CHANNEL_LABELS };

// ---- Mock data helpers ----

const PLAYER_NAMES = [
  'Shohei Ohtani', 'Victor Wembanyama', 'Patrick Mahomes', 'Connor McDavid',
  'Luka Doncic', 'Mike Trout', 'Jayson Tatum', 'Jude Bellingham',
  'Caitlin Clark', 'Lamar Jackson', 'Lionel Messi', 'Anthony Edwards',
  'Juan Soto', 'Connor Bedard', 'CJ Stroud', 'Tyrese Haliburton',
];

const CARD_SETS = [
  '2023 Topps Chrome', '2023 Panini Prizm', '2022 Bowman Chrome', '2024 Select',
  '2023 Optic', '2024 Topps Series 1', '2023 Mosaic', '2024 Donruss',
];

const GRADES = ['PSA 10', 'PSA 9', 'BGS 9.5', 'SGC 10', 'CGC 9.8', 'PSA 8'];

let _idCounter = 0;
function makeId(): string {
  _idCounter += 1;
  return `ntf_${Date.now()}_${_idCounter}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// ---- Notification generators per channel ----

function generatePriceAlert(): RealtimeNotification {
  const player = pick(PLAYER_NAMES);
  const card = pick(CARD_SETS);
  const grade = pick(GRADES);
  const priceDrop = randBetween(5, 35);
  const oldPrice = randBetween(80, 2500);
  const newPrice = Math.round(oldPrice * (1 - priceDrop / 100) * 100) / 100;
  const isCritical = priceDrop > 25;
  return {
    id: makeId(),
    channel: 'price_alert',
    priority: isCritical ? 'critical' : priceDrop > 15 ? 'high' : 'medium',
    title: `Price ${priceDrop > 0 ? 'Drop' : 'Spike'}: ${player}`,
    body: `${card} ${grade} dropped ${priceDrop}% — now $${newPrice.toLocaleString()} (was $${oldPrice.toLocaleString()})`,
    timestamp: new Date().toISOString(),
    isRead: false,
    isDismissed: false,
    actions: [
      { id: 'view', label: 'View Card', type: 'view' },
      { id: 'dismiss', label: 'Dismiss', type: 'dismiss' },
    ],
    metadata: { player, card, grade, priceDrop, oldPrice, newPrice },
  };
}

function generateAuctionEnding(): RealtimeNotification {
  const player = pick(PLAYER_NAMES);
  const card = pick(CARD_SETS);
  const minutesLeft = pick([1, 2, 3, 5, 10, 15]);
  const currentBid = randBetween(50, 3000);
  const bidders = Math.floor(Math.random() * 20) + 2;
  return {
    id: makeId(),
    channel: 'auction_ending',
    priority: minutesLeft <= 2 ? 'critical' : minutesLeft <= 5 ? 'high' : 'medium',
    title: `Auction Ending: ${minutesLeft}min left`,
    body: `${player} ${card} — Current bid $${currentBid.toLocaleString()} (${bidders} bidders)`,
    timestamp: new Date().toISOString(),
    isRead: false,
    isDismissed: false,
    actions: [
      { id: 'bid', label: 'Place Bid', type: 'link', payload: '/auctions' },
      { id: 'watch', label: 'Watch', type: 'view' },
    ],
    metadata: { player, card, minutesLeft, currentBid, bidders },
  };
}

function generateGradingUpdate(): RealtimeNotification {
  const player = pick(PLAYER_NAMES);
  const card = pick(CARD_SETS);
  const grade = pick(GRADES);
  const status = pick(['Graded', 'Received', 'Research & ID', 'Assembly', 'Shipped']);
  const orderNum = `PSA-${Math.floor(Math.random() * 9000000) + 1000000}`;
  return {
    id: makeId(),
    channel: 'grading_update',
    priority: status === 'Graded' ? 'high' : 'low',
    title: `Grading ${status}: ${player}`,
    body: status === 'Graded'
      ? `${card} received ${grade}! Order ${orderNum}`
      : `${card} — Status updated to "${status}". Order ${orderNum}`,
    timestamp: new Date().toISOString(),
    isRead: false,
    isDismissed: false,
    actions: [
      { id: 'view', label: 'View Order', type: 'view' },
    ],
    metadata: { player, card, grade, status, orderNum },
  };
}

function generateTradeOffer(): RealtimeNotification {
  const fromUser = pick(['CardKing99', 'SlabMaster', 'WaxBreaker', 'PrizmHunter', 'ToppsKid', 'MintCondition']);
  const offerPlayer = pick(PLAYER_NAMES);
  const requestPlayer = pick(PLAYER_NAMES);
  const cashAdded = Math.random() > 0.5 ? randBetween(20, 500) : 0;
  return {
    id: makeId(),
    channel: 'trade_offer',
    priority: 'high',
    title: `Trade Offer from ${fromUser}`,
    body: `Offering ${offerPlayer} for your ${requestPlayer}${cashAdded ? ` + $${cashAdded}` : ''}`,
    timestamp: new Date().toISOString(),
    isRead: false,
    isDismissed: false,
    actions: [
      { id: 'accept', label: 'Accept', type: 'accept' },
      { id: 'decline', label: 'Decline', type: 'decline' },
      { id: 'view', label: 'View Details', type: 'view' },
    ],
    metadata: { fromUser, offerPlayer, requestPlayer, cashAdded },
  };
}

function generateMarketMovement(): RealtimeNotification {
  const sector = pick(['Basketball Rookies', 'Baseball Vintage', 'Football QBs', 'Soccer International', 'Hockey Prospects']);
  const changePct = randBetween(-12, 15);
  const direction = changePct >= 0 ? 'up' : 'down';
  const volume = Math.floor(Math.random() * 5000) + 500;
  return {
    id: makeId(),
    channel: 'market_movement',
    priority: Math.abs(changePct) > 8 ? 'high' : 'medium',
    title: `Market ${direction === 'up' ? 'Rally' : 'Dip'}: ${sector}`,
    body: `${sector} index ${direction} ${Math.abs(changePct)}% in the last hour. Volume: ${volume.toLocaleString()} trades`,
    timestamp: new Date().toISOString(),
    isRead: false,
    isDismissed: false,
    actions: [
      { id: 'view', label: 'View Market', type: 'link', payload: '/market' },
    ],
    metadata: { sector, changePct, direction, volume },
  };
}

function generatePortfolioChange(): RealtimeNotification {
  const changePct = randBetween(-5, 8);
  const totalValue = randBetween(5000, 150000);
  const changeAbs = Math.round(totalValue * (changePct / 100) * 100) / 100;
  const topMover = pick(PLAYER_NAMES);
  return {
    id: makeId(),
    channel: 'portfolio_change',
    priority: Math.abs(changePct) > 4 ? 'high' : 'low',
    title: `Portfolio ${changePct >= 0 ? 'Up' : 'Down'} ${Math.abs(changePct)}%`,
    body: `Total value: $${totalValue.toLocaleString()} (${changePct >= 0 ? '+' : ''}$${changeAbs.toLocaleString()}). Top mover: ${topMover}`,
    timestamp: new Date().toISOString(),
    isRead: false,
    isDismissed: false,
    actions: [
      { id: 'view', label: 'View Portfolio', type: 'link', payload: '/portfolio' },
    ],
    metadata: { changePct, totalValue, changeAbs, topMover },
  };
}

function generateSocialMention(): RealtimeNotification {
  const platform = pick(['Twitter/X', 'Reddit', 'Instagram', 'YouTube', 'Bluesky']);
  const user = pick(['@BreakingCards', '@SlabStash', '@WaxMuseum', '@CardInvestor', '@HobbyHotTakes']);
  const player = pick(PLAYER_NAMES);
  const engagement = Math.floor(Math.random() * 10000) + 100;
  return {
    id: makeId(),
    channel: 'social_mention',
    priority: engagement > 5000 ? 'high' : 'low',
    title: `Trending on ${platform}`,
    body: `${user} mentioned ${player} — ${engagement.toLocaleString()} engagements in the last hour`,
    timestamp: new Date().toISOString(),
    isRead: false,
    isDismissed: false,
    actions: [
      { id: 'view', label: 'View Post', type: 'link' },
    ],
    metadata: { platform, user, player, engagement },
  };
}

function generateSystemNotification(): RealtimeNotification {
  const msgs = [
    { title: 'Sync Complete', body: 'All marketplace data has been synced successfully. 1,247 cards updated.' },
    { title: 'Maintenance Window', body: 'Scheduled maintenance tonight at 2:00 AM EST. Expected downtime: 15 minutes.' },
    { title: 'New Feature Available', body: 'AI-powered card scanning is now available. Try it from the Tools menu.' },
    { title: 'Security Alert', body: 'New login detected from Chrome on Windows. If this was not you, please change your password.' },
    { title: 'Backup Complete', body: 'Your portfolio data has been backed up. 342 cards, 89 transactions saved.' },
    { title: 'API Rate Limit Warning', body: 'You have used 85% of your daily API quota. Consider upgrading your plan.' },
  ];
  const msg = pick(msgs);
  return {
    id: makeId(),
    channel: 'system',
    priority: msg.title.includes('Security') ? 'critical' : 'low',
    title: msg.title,
    body: msg.body,
    timestamp: new Date().toISOString(),
    isRead: false,
    isDismissed: false,
    actions: [
      { id: 'dismiss', label: 'Dismiss', type: 'dismiss' },
    ],
    metadata: {},
  };
}

const GENERATORS: Record<NotificationChannel, () => RealtimeNotification> = {
  price_alert: generatePriceAlert,
  auction_ending: generateAuctionEnding,
  grading_update: generateGradingUpdate,
  trade_offer: generateTradeOffer,
  market_movement: generateMarketMovement,
  portfolio_change: generatePortfolioChange,
  social_mention: generateSocialMention,
  system: generateSystemNotification,
};

// ---- RealtimeNotificationManager class ----

type ChannelCallback = (notification: RealtimeNotification) => void;

export class RealtimeNotificationManager {
  private connectionState: WebSocketConnectionState = 'disconnected';
  private notifications: RealtimeNotification[] = [];
  private subscribers: Map<NotificationChannel, Set<ChannelCallback>> = new Map();
  private globalSubscribers: Set<ChannelCallback> = new Set();
  private preferences: NotificationPreference[] = [];
  private rules: NotificationRule[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private connectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private statsReceived = 0;
  private statsDismissed = 0;

  constructor() {
    // Initialize default preferences
    this.preferences = ALL_CHANNELS.map((ch) => ({
      channel: ch,
      enabled: true,
      soundEnabled: ch === 'price_alert' || ch === 'auction_ending' || ch === 'trade_offer',
      priority: 'medium' as NotificationPriority,
    }));

    // Seed some initial rules
    this.rules = [
      {
        id: 'rule_1',
        name: 'Big Price Drop Alert',
        channel: 'price_alert',
        condition: 'price_drop > 20%',
        threshold: 20,
        enabled: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        triggeredCount: 7,
      },
      {
        id: 'rule_2',
        name: 'Auction Ending Soon',
        channel: 'auction_ending',
        condition: 'minutes_left < 5',
        threshold: 5,
        enabled: true,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        triggeredCount: 23,
      },
    ];

    // Seed some historical notifications
    this._seedHistory();
  }

  private _seedHistory(): void {
    const now = Date.now();
    for (let i = 0; i < 25; i++) {
      const channel = pick(ALL_CHANNELS);
      const n = GENERATORS[channel]();
      n.timestamp = new Date(now - Math.random() * 3600000 * 4).toISOString();
      n.isRead = Math.random() > 0.4;
      this.notifications.push(n);
    }
    this.notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    this.statsReceived = this.notifications.length;
  }

  connect(): void {
    if (this.connectionState === 'connected') return;
    this.connectionState = 'connecting';
    this._notifyState();

    this.connectTimeoutId = setTimeout(() => {
      this.connectionState = 'connected';
      this._notifyState();

      // Simulate incoming notifications every 3-8 seconds
      this.intervalId = setInterval(() => {
        this._generateRandomNotification();
      }, 3000 + Math.random() * 5000);
    }, 800);
  }

  disconnect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.connectTimeoutId) {
      clearTimeout(this.connectTimeoutId);
      this.connectTimeoutId = null;
    }
    this.connectionState = 'disconnected';
    this._notifyState();
  }

  getConnectionState(): WebSocketConnectionState {
    return this.connectionState;
  }

  subscribe(channel: NotificationChannel | '*', callback: ChannelCallback): () => void {
    if (channel === '*') {
      this.globalSubscribers.add(callback);
      return () => { this.globalSubscribers.delete(callback); };
    }
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);
    return () => { this.subscribers.get(channel)?.delete(callback); };
  }

  getNotificationHistory(filter?: NotificationFilter): RealtimeNotification[] {
    let results = this.notifications.filter((n) => !n.isDismissed);

    if (filter?.channels?.length) {
      results = results.filter((n) => filter.channels!.includes(n.channel));
    }
    if (filter?.priorities?.length) {
      results = results.filter((n) => filter.priorities!.includes(n.priority));
    }
    if (filter?.isRead !== undefined) {
      results = results.filter((n) => n.isRead === filter.isRead);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      results = results.filter(
        (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      );
    }
    if (filter?.since) {
      const sinceTime = new Date(filter.since).getTime();
      results = results.filter((n) => new Date(n.timestamp).getTime() >= sinceTime);
    }
    if (filter?.limit) {
      results = results.slice(0, filter.limit);
    }
    return results;
  }

  markAsRead(id: string): void {
    const n = this.notifications.find((x) => x.id === id);
    if (n) n.isRead = true;
  }

  markAllRead(channel?: NotificationChannel): void {
    this.notifications.forEach((n) => {
      if (!channel || n.channel === channel) n.isRead = true;
    });
  }

  dismiss(id: string): void {
    const n = this.notifications.find((x) => x.id === id);
    if (n) {
      n.isDismissed = true;
      this.statsDismissed += 1;
    }
  }

  dismissAll(channel?: NotificationChannel): void {
    this.notifications.forEach((n) => {
      if (!channel || n.channel === channel) {
        if (!n.isDismissed) {
          n.isDismissed = true;
          this.statsDismissed += 1;
        }
      }
    });
  }

  setPreferences(prefs: NotificationPreference[]): void {
    this.preferences = prefs;
  }

  getPreferences(): NotificationPreference[] {
    return [...this.preferences];
  }

  getStats(): NotificationStats {
    const byChannel = {} as Record<NotificationChannel, number>;
    const byPriority = {} as Record<NotificationPriority, number>;
    ALL_CHANNELS.forEach((ch) => { byChannel[ch] = 0; });
    (['critical', 'high', 'medium', 'low'] as NotificationPriority[]).forEach((p) => { byPriority[p] = 0; });

    const active = this.notifications.filter((n) => !n.isDismissed);
    active.forEach((n) => {
      byChannel[n.channel] = (byChannel[n.channel] || 0) + 1;
      byPriority[n.priority] = (byPriority[n.priority] || 0) + 1;
    });

    return {
      totalReceived: this.statsReceived,
      totalUnread: active.filter((n) => !n.isRead).length,
      totalDismissed: this.statsDismissed,
      byChannel,
      byPriority,
      avgResponseTimeMs: Math.round(Math.random() * 1200 + 300),
      peakHour: new Date().getHours(),
      lastReceivedAt: active.length ? active[0].timestamp : null,
    };
  }

  createRule(rule: Omit<NotificationRule, 'id' | 'createdAt' | 'triggeredCount'>): NotificationRule {
    const newRule: NotificationRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      createdAt: new Date().toISOString(),
      triggeredCount: 0,
    };
    this.rules.push(newRule);
    return newRule;
  }

  getRules(): NotificationRule[] {
    return [...this.rules];
  }

  deleteRule(id: string): void {
    this.rules = this.rules.filter((r) => r.id !== id);
  }

  toggleRule(id: string): void {
    const rule = this.rules.find((r) => r.id === id);
    if (rule) rule.enabled = !rule.enabled;
  }

  getDigest(period: 'hourly' | 'daily' | 'weekly'): NotificationDigest {
    const periodMs = period === 'hourly' ? 3600000 : period === 'daily' ? 86400000 : 604800000;
    const since = new Date(Date.now() - periodMs).toISOString();
    const items = this.getNotificationHistory({ since });

    const channelBreakdown = {} as Record<NotificationChannel, number>;
    ALL_CHANNELS.forEach((ch) => { channelBreakdown[ch] = 0; });
    items.forEach((n) => { channelBreakdown[n.channel] += 1; });

    const priorityOrder: NotificationPriority[] = ['critical', 'high', 'medium', 'low'];
    const topPriority = [...items].sort(
      (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
    ).slice(0, 5);

    return {
      period,
      generatedAt: new Date().toISOString(),
      totalCount: items.length,
      highlights: items.slice(0, 5),
      channelBreakdown,
      topPriorityItems: topPriority,
    };
  }

  // ---- Private ----

  private _generateRandomNotification(): void {
    const enabledChannels = this.preferences.filter((p) => p.enabled).map((p) => p.channel);
    if (enabledChannels.length === 0) return;

    // Weight certain channels higher
    const weights: Record<NotificationChannel, number> = {
      price_alert: 3,
      auction_ending: 2,
      grading_update: 1,
      trade_offer: 2,
      market_movement: 2,
      portfolio_change: 1,
      social_mention: 1,
      system: 0.5,
    };

    const pool: NotificationChannel[] = [];
    enabledChannels.forEach((ch) => {
      const w = Math.ceil(weights[ch] || 1);
      for (let i = 0; i < w; i++) pool.push(ch);
    });

    const channel = pick(pool);
    const notification = GENERATORS[channel]();

    this.notifications.unshift(notification);
    this.statsReceived += 1;

    // Cap history at 200
    if (this.notifications.length > 200) {
      this.notifications = this.notifications.slice(0, 200);
    }

    // Notify subscribers
    this.globalSubscribers.forEach((cb) => cb(notification));
    this.subscribers.get(channel)?.forEach((cb) => cb(notification));
  }

  private _stateCallbacks: Set<(state: WebSocketConnectionState) => void> = new Set();

  onConnectionStateChange(cb: (state: WebSocketConnectionState) => void): () => void {
    this._stateCallbacks.add(cb);
    return () => { this._stateCallbacks.delete(cb); };
  }

  private _notifyState(): void {
    this._stateCallbacks.forEach((cb) => cb(this.connectionState));
  }
}

// ---- Singleton export ----

let _instance: RealtimeNotificationManager | null = null;

export function getNotificationManager(): RealtimeNotificationManager {
  if (!_instance) {
    _instance = new RealtimeNotificationManager();
  }
  return _instance;
}

export default getNotificationManager;
