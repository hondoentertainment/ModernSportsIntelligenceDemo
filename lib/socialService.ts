import { CardInventory, Sport } from '../types';

// ---- Types ----

export type ActivityType =
  | 'listing'
  | 'trade'
  | 'achievement'
  | 'follow'
  | 'grading'
  | 'purchase'
  | 'price_milestone';

export type CollectorTier = 'Rookie' | 'Veteran' | 'All-Star' | 'Hall of Fame' | 'Whale';

export interface CollectorProfile {
  id: string;
  displayName: string;
  initials: string;
  bio: string;
  avatarColor: string;
  totalValue: number;
  cardCount: number;
  topSport: Sport;
  tradeReputation: number; // 0-5 stars
  tier: CollectorTier;
  joinedAt: string;
  isOnline: boolean;
  sampleCards: { player: string; year: number; sport: Sport; value: number }[];
  wantList: { player: string; sport: Sport }[];
}

export interface FollowRelation {
  followerId: string;
  followedId: string;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  cardAttachment?: {
    id: string;
    player: string;
    year: number;
    set: string;
    currentValue: number;
    sport: Sport;
  };
  timestamp: string;
  isRead: boolean;
}

export interface ChatThread {
  id: string;
  participantIds: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface TradeMatch {
  collectorId: string;
  collectorName: string;
  initials: string;
  avatarColor: string;
  tier: CollectorTier;
  matchScore: number; // 0-100
  theyHaveYouWant: { player: string; sport: Sport; value: number }[];
  youHaveTheyWant: { player: string; sport: Sport; value: number }[];
  reputation: number;
}

export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  collectorId: string;
  collectorName: string;
  initials: string;
  avatarColor: string;
  description: string;
  timestamp: string;
  metadata?: {
    player?: string;
    value?: number;
    sport?: Sport;
    achievement?: string;
  };
}

// ---- Constants ----

const PROFILE_KEY = 'msi_social_profile';
const FOLLOWS_KEY = 'msi_social_follows';
const MESSAGES_KEY = 'msi_social_messages';
const BLOCKS_KEY = 'msi_social_blocks';

const MY_USER_ID = 'user_me';

const AVATAR_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
  '#84cc16', '#e11d48', '#0ea5e9', '#a855f7', '#22c55e',
  '#eab308', '#d946ef', '#64748b', '#fb923c', '#2dd4bf',
];

const FIRST_NAMES = [
  'Marcus', 'Elena', 'Jordan', 'Sophia', 'Derek',
  'Aisha', 'Tyler', 'Mika', 'Carlos', 'Priya',
  'Brandon', 'Naomi', 'Evan', 'Zoe', 'Andre',
  'Lily', 'Jamal', 'Harper', 'Diego', 'Chloe',
];

const LAST_NAMES = [
  'Rivera', 'Chen', 'Williams', 'Patel', 'Okafor',
  'Tanaka', 'Brooks', 'Nakamura', 'Fernandez', 'Gupta',
  'Mitchell', 'Sato', 'Thompson', 'Larsson', 'Dubois',
  'Kim', 'Jackson', 'Silva', 'Anderson', 'Yamamoto',
];

const BIOS = [
  'PSA 10 or nothing. Vintage baseball is my game.',
  'Building the ultimate basketball rookie collection.',
  'Football cards and fantasy stats — the dream combo.',
  'Hockey collector since the 90s. Love the chase.',
  'Soccer cards are undervalued. Change my mind.',
  'Grading everything. The slab life chose me.',
  'Flipping cards and funding my hobby since 2019.',
  'Long-term investor in cardboard gold.',
  'Set builder at heart. Need that last card!',
  'Prospecting on minor league talent. Buy low, sell high.',
  'Cross-sport diversification strategy. Data-driven.',
  'Autograph hunter. In-person autos only.',
  'Vintage specialist — nothing after 1980.',
  'Modern chrome and color parallels are my weakness.',
  'Collecting for my kids. Building generational wealth.',
  'Just here for the Jordan rookies.',
  'International soccer RC collector. Future HOFers.',
  'Card show weekends are my religion.',
  'Topps Chrome devotee. Refractors everywhere.',
  'Portfolio approach — treating cards like equities.',
];

const SPORTS_LIST: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

const SAMPLE_PLAYERS: Record<Sport, string[]> = {
  Baseball: ['Mike Trout', 'Shohei Ohtani', 'Ronald Acuna Jr.', 'Julio Rodriguez', 'Mookie Betts'],
  Basketball: ['Luka Doncic', 'Victor Wembanyama', 'Anthony Edwards', 'Jayson Tatum', 'Shai Gilgeous-Alexander'],
  Football: ['Patrick Mahomes', 'Josh Allen', 'Justin Jefferson', 'CeeDee Lamb', 'Ja\'Marr Chase'],
  Hockey: ['Connor McDavid', 'Cale Makar', 'Auston Matthews', 'Connor Bedard', 'Jack Hughes'],
  Soccer: ['Jude Bellingham', 'Erling Haaland', 'Kylian Mbappe', 'Pedri', 'Bukayo Saka'],
};

// ---- Deterministic Helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededInt(seed: number, offset: number, min: number, max: number): number {
  return Math.floor(min + seededRandom(seed, offset) * (max - min));
}

function seededFloat(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

function seededPick<T>(arr: T[], seed: number, offset: number): T {
  return arr[seededInt(seed, offset, 0, arr.length)];
}

function dateSeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function minuteAgo(mins: number): string {
  return new Date(Date.now() - mins * 60000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

// ---- Generate 20 Collector Profiles ----

let cachedProfiles: CollectorProfile[] | null = null;

function generateCollectorProfiles(): CollectorProfile[] {
  if (cachedProfiles) return cachedProfiles;

  const profiles: CollectorProfile[] = [];
  const baseSeed = 49_000;

  for (let i = 0; i < 20; i++) {
    const s = baseSeed + i;
    const firstName = FIRST_NAMES[i];
    const lastName = LAST_NAMES[i];
    const displayName = `${firstName} ${lastName}`;
    const initials = `${firstName[0]}${lastName[0]}`;

    const totalValue = Math.round(seededFloat(s, 1, 2000, 250000));
    const cardCount = seededInt(s, 2, 15, 500);
    const topSport = seededPick(SPORTS_LIST, s, 3);
    const reputation = Math.round(seededFloat(s, 4, 2.5, 5.0) * 10) / 10;

    let tier: CollectorTier;
    if (totalValue > 150000) tier = 'Whale';
    else if (totalValue > 80000) tier = 'Hall of Fame';
    else if (totalValue > 30000) tier = 'All-Star';
    else if (totalValue > 10000) tier = 'Veteran';
    else tier = 'Rookie';

    // Generate sample cards this collector "owns"
    const sampleCards: CollectorProfile['sampleCards'] = [];
    const numSample = seededInt(s, 10, 3, 6);
    for (let j = 0; j < numSample; j++) {
      const sport = seededPick(SPORTS_LIST, s, 20 + j);
      const player = seededPick(SAMPLE_PLAYERS[sport], s, 30 + j);
      sampleCards.push({
        player,
        year: seededInt(s, 40 + j, 2018, 2025),
        sport,
        value: Math.round(seededFloat(s, 50 + j, 20, 2000)),
      });
    }

    // Generate want list
    const wantList: CollectorProfile['wantList'] = [];
    const numWant = seededInt(s, 60, 2, 5);
    for (let j = 0; j < numWant; j++) {
      const sport = seededPick(SPORTS_LIST, s, 70 + j);
      const player = seededPick(SAMPLE_PLAYERS[sport], s, 80 + j);
      wantList.push({ player, sport });
    }

    profiles.push({
      id: `collector_${String(i).padStart(3, '0')}`,
      displayName,
      initials,
      bio: BIOS[i],
      avatarColor: AVATAR_COLORS[i],
      totalValue,
      cardCount,
      topSport,
      tradeReputation: reputation,
      tier,
      joinedAt: daysAgo(seededInt(s, 5, 30, 900)),
      isOnline: seededRandom(s, 6) > 0.6,
      sampleCards,
      wantList,
    });
  }

  cachedProfiles = profiles;
  return profiles;
}

// ---- localStorage Helpers ----

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota exceeded
  }
}

// ---- My Profile ----

interface MyProfile {
  displayName: string;
  bio: string;
  initials: string;
  avatarColor: string;
}

const DEFAULT_PROFILE: MyProfile = {
  displayName: 'You',
  bio: 'Sports card collector and investor.',
  initials: 'ME',
  avatarColor: '#3b82f6',
};

export function getMyProfile(): MyProfile {
  return loadJSON<MyProfile>(PROFILE_KEY, DEFAULT_PROFILE);
}

export function updateMyProfile(updates: Partial<MyProfile>): MyProfile {
  const current = getMyProfile();
  const updated = { ...current, ...updates };
  saveJSON(PROFILE_KEY, updated);
  return updated;
}

// ---- Collector Profiles ----

export function getCollectorProfiles(filter?: {
  search?: string;
  sport?: Sport;
  minCards?: number;
}): CollectorProfile[] {
  let profiles = generateCollectorProfiles();

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    profiles = profiles.filter(
      p => p.displayName.toLowerCase().includes(q) || p.bio.toLowerCase().includes(q)
    );
  }
  if (filter?.sport) {
    profiles = profiles.filter(p => p.topSport === filter.sport);
  }
  if (filter?.minCards) {
    profiles = profiles.filter(p => p.cardCount >= filter.minCards!);
  }

  return profiles;
}

// ---- Follow System ----

export function getFollowing(): string[] {
  return loadJSON<string[]>(FOLLOWS_KEY, []);
}

export function getFollowers(): string[] {
  // Simulate some followers deterministically
  const profiles = generateCollectorProfiles();
  const seed = dateSeed();
  const followers: string[] = [];
  for (let i = 0; i < profiles.length; i++) {
    if (seededRandom(seed, i + 100) > 0.65) {
      followers.push(profiles[i].id);
    }
  }
  return followers;
}

export function followCollector(id: string): void {
  const following = getFollowing();
  if (!following.includes(id)) {
    following.push(id);
    saveJSON(FOLLOWS_KEY, following);
  }
}

export function unfollowCollector(id: string): void {
  const following = getFollowing().filter(f => f !== id);
  saveJSON(FOLLOWS_KEY, following);
}

// ---- Block System ----

export function getBlockedList(): string[] {
  return loadJSON<string[]>(BLOCKS_KEY, []);
}

export function blockCollector(id: string): void {
  const blocked = getBlockedList();
  if (!blocked.includes(id)) {
    blocked.push(id);
    saveJSON(BLOCKS_KEY, blocked);
  }
  // Also unfollow
  unfollowCollector(id);
}

// ---- Messaging System ----

interface StoredMessages {
  threads: ChatThread[];
  messages: DirectMessage[];
}

function getStoredMessages(): StoredMessages {
  return loadJSON<StoredMessages>(MESSAGES_KEY, { threads: [], messages: [] });
}

function generateSimulatedThreads(): StoredMessages {
  const profiles = generateCollectorProfiles();
  const _seed = dateSeed();
  const threads: ChatThread[] = [];
  const messages: DirectMessage[] = [];

  // Generate 5 simulated conversation threads
  const threadProfiles = [profiles[0], profiles[3], profiles[7], profiles[12], profiles[18]];

  const conversations: { msgs: { fromMe: boolean; text: string; minsAgo: number }[] }[] = [
    {
      msgs: [
        { fromMe: false, text: 'Hey! Saw your Wembanyama RC. Would you consider trading?', minsAgo: 180 },
        { fromMe: true, text: 'Maybe! What do you have to offer?', minsAgo: 150 },
        { fromMe: false, text: 'I have a PSA 10 Luka Doncic Prizm Silver. Interested?', minsAgo: 120 },
        { fromMe: true, text: 'That\'s tempting. Let me think about it.', minsAgo: 90 },
        { fromMe: false, text: 'No rush! Let me know when you decide.', minsAgo: 45 },
      ],
    },
    {
      msgs: [
        { fromMe: true, text: 'Do you still have the Ohtani auto?', minsAgo: 600 },
        { fromMe: false, text: 'Yes! It\'s a 2018 Topps Chrome auto, BGS 9.5.', minsAgo: 540 },
        { fromMe: true, text: 'What are you looking to get for it?', minsAgo: 480 },
        { fromMe: false, text: 'Looking for around $800 or a comparable trade.', minsAgo: 420 },
      ],
    },
    {
      msgs: [
        { fromMe: false, text: 'Just pulled a Connor Bedard Young Guns! 🔥', minsAgo: 1200 },
        { fromMe: true, text: 'Nice pull! Are you keeping or selling?', minsAgo: 1140 },
        { fromMe: false, text: 'Keeping for now. The kid is going to be special.', minsAgo: 1080 },
      ],
    },
    {
      msgs: [
        { fromMe: false, text: 'Thanks for the trade tip on the Mahomes lot. Worked out great!', minsAgo: 2400 },
        { fromMe: true, text: 'Glad it worked out! Football season always brings demand.', minsAgo: 2340 },
      ],
    },
    {
      msgs: [
        { fromMe: false, text: 'Are you going to the card show this weekend?', minsAgo: 4800 },
        { fromMe: true, text: 'Planning on it! Looking for vintage basketball.', minsAgo: 4700 },
        { fromMe: false, text: 'I\'ll be at table 42. Stop by — I have some Jordan inserts.', minsAgo: 4600 },
      ],
    },
  ];

  threadProfiles.forEach((profile, idx) => {
    const threadId = `thread_${profile.id}`;
    const conv = conversations[idx];
    const threadMessages: DirectMessage[] = conv.msgs.map((m, mi) => ({
      id: `msg_${threadId}_${mi}`,
      threadId,
      senderId: m.fromMe ? MY_USER_ID : profile.id,
      text: m.text,
      timestamp: minuteAgo(m.minsAgo),
      isRead: m.fromMe || m.minsAgo > 60,
    }));

    messages.push(...threadMessages);

    const lastMsg = conv.msgs[conv.msgs.length - 1];
    const unread = conv.msgs.filter(m => !m.fromMe && m.minsAgo <= 60).length;

    threads.push({
      id: threadId,
      participantIds: [MY_USER_ID, profile.id],
      participantNames: ['You', profile.displayName],
      lastMessage: lastMsg.text,
      lastMessageTime: minuteAgo(lastMsg.minsAgo),
      unreadCount: unread,
    });
  });

  return { threads, messages };
}

export function getThreads(): ChatThread[] {
  const stored = getStoredMessages();
  if (stored.threads.length > 0) return stored.threads;

  // Initialize with simulated data
  const simulated = generateSimulatedThreads();
  saveJSON(MESSAGES_KEY, simulated);
  return simulated.threads;
}

export function getThread(threadId: string): { thread: ChatThread | null; messages: DirectMessage[] } {
  const stored = getStoredMessages();
  let data = stored;
  if (stored.threads.length === 0) {
    data = generateSimulatedThreads();
    saveJSON(MESSAGES_KEY, data);
  }

  const thread = data.threads.find(t => t.id === threadId) ?? null;
  const messages = data.messages
    .filter(m => m.threadId === threadId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Mark messages as read
  if (thread) {
    thread.unreadCount = 0;
    const updated: StoredMessages = {
      threads: data.threads.map(t => t.id === threadId ? { ...t, unreadCount: 0 } : t),
      messages: data.messages.map(m =>
        m.threadId === threadId ? { ...m, isRead: true } : m
      ),
    };
    saveJSON(MESSAGES_KEY, updated);
  }

  return { thread, messages };
}

export function sendMessage(
  threadId: string,
  text: string,
  cardAttachment?: DirectMessage['cardAttachment']
): DirectMessage {
  const data = getStoredMessages().threads.length > 0
    ? getStoredMessages()
    : (() => { const sim = generateSimulatedThreads(); saveJSON(MESSAGES_KEY, sim); return sim; })();

  const newMsg: DirectMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    threadId,
    senderId: MY_USER_ID,
    text,
    cardAttachment,
    timestamp: new Date().toISOString(),
    isRead: true,
  };

  data.messages.push(newMsg);

  // Update thread
  const threadIdx = data.threads.findIndex(t => t.id === threadId);
  if (threadIdx >= 0) {
    data.threads[threadIdx].lastMessage = text;
    data.threads[threadIdx].lastMessageTime = newMsg.timestamp;
  }

  saveJSON(MESSAGES_KEY, data);
  return newMsg;
}

// Start a new thread with a collector
export function startThread(collectorId: string): ChatThread {
  const data = getStoredMessages().threads.length > 0
    ? getStoredMessages()
    : (() => { const sim = generateSimulatedThreads(); saveJSON(MESSAGES_KEY, sim); return sim; })();

  const existing = data.threads.find(t => t.participantIds.includes(collectorId));
  if (existing) return existing;

  const profiles = generateCollectorProfiles();
  const profile = profiles.find(p => p.id === collectorId);

  const thread: ChatThread = {
    id: `thread_${collectorId}`,
    participantIds: [MY_USER_ID, collectorId],
    participantNames: ['You', profile?.displayName ?? 'Collector'],
    lastMessage: '',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0,
  };

  data.threads.push(thread);
  saveJSON(MESSAGES_KEY, data);
  return thread;
}

// ---- Trade Matches ----

export function getTradeMatches(
  myCards: CardInventory[],
  _myWatchlist?: { player: string; sport: Sport }[]
): TradeMatch[] {
  const profiles = generateCollectorProfiles();
  const blocked = getBlockedList();

  // Build sets for matching
  const myPlayers = new Set(myCards.map(c => c.player));
  const mySports = new Set(myCards.map(c => c.sport));

  const matches: TradeMatch[] = [];

  for (const profile of profiles) {
    if (blocked.includes(profile.id)) continue;

    // What they have that matches user interests (simulated from their sample cards)
    const theyHaveYouWant = profile.sampleCards.filter(sc =>
      !myPlayers.has(sc.player) && mySports.has(sc.sport)
    );

    // What user has that they want (based on their want list)
    const youHaveTheyWant = profile.wantList
      .filter(w => myPlayers.has(w.player))
      .map(w => {
        const card = myCards.find(c => c.player === w.player);
        return {
          player: w.player,
          sport: w.sport,
          value: card?.currentValue ?? card?.purchasePrice ?? 0,
        };
      });

    if (theyHaveYouWant.length === 0 && youHaveTheyWant.length === 0) continue;

    // Calculate match score
    const overlapScore = Math.min(50, (theyHaveYouWant.length + youHaveTheyWant.length) * 12);
    const reputationBonus = (profile.tradeReputation / 5) * 25;
    const mutualBonus = (theyHaveYouWant.length > 0 && youHaveTheyWant.length > 0) ? 25 : 0;
    const matchScore = Math.min(100, Math.round(overlapScore + reputationBonus + mutualBonus));

    matches.push({
      collectorId: profile.id,
      collectorName: profile.displayName,
      initials: profile.initials,
      avatarColor: profile.avatarColor,
      tier: profile.tier,
      matchScore,
      theyHaveYouWant,
      youHaveTheyWant,
      reputation: profile.tradeReputation,
    });
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

// ---- Activity Feed ----

export function getActivityFeed(scope: 'global' | 'following'): ActivityFeedItem[] {
  const profiles = generateCollectorProfiles();
  const following = getFollowing();
  const blocked = getBlockedList();
  const seed = dateSeed();

  const filteredProfiles = scope === 'following'
    ? profiles.filter(p => following.includes(p.id))
    : profiles;

  const items: ActivityFeedItem[] = [];

  const activityTemplates: { type: ActivityType; template: (_name: string, _player: string, _sport: Sport, _value: number) => string }[] = [
    { type: 'listing', template: (_, player, _s, value) => `Listed a ${player} card for $${value.toLocaleString()}` },
    { type: 'trade', template: (_, player) => `Completed a trade involving ${player}` },
    { type: 'achievement', template: () => `Earned the "Set Builder" achievement` },
    { type: 'grading', template: (_, player) => `Got a ${player} card graded PSA 10` },
    { type: 'purchase', template: (_, player, _s, value) => `Acquired a ${player} card for $${value.toLocaleString()}` },
    { type: 'price_milestone', template: (_, player) => `${player} card hit a new all-time high!` },
    { type: 'follow', template: (name) => `${name} joined the community` },
  ];

  // Generate ~30 activity items
  for (let i = 0; i < 30; i++) {
    const profile = filteredProfiles.length > 0
      ? filteredProfiles[seededInt(seed, i * 7, 0, filteredProfiles.length)]
      : profiles[seededInt(seed, i * 7, 0, profiles.length)];

    if (blocked.includes(profile.id)) continue;

    const templateIdx = seededInt(seed, i * 7 + 1, 0, activityTemplates.length);
    const template = activityTemplates[templateIdx];
    const sport = seededPick(SPORTS_LIST, seed, i * 7 + 2);
    const player = seededPick(SAMPLE_PLAYERS[sport], seed, i * 7 + 3);
    const value = Math.round(seededFloat(seed, i * 7 + 4, 50, 5000));

    items.push({
      id: `activity_${seed}_${i}`,
      type: template.type,
      collectorId: profile.id,
      collectorName: profile.displayName,
      initials: profile.initials,
      avatarColor: profile.avatarColor,
      description: template.template(profile.displayName, player, sport, value),
      timestamp: minuteAgo(seededInt(seed, i * 7 + 5, 5, 4320)),
      metadata: {
        player,
        value,
        sport,
      },
    });
  }

  return items.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ---- Convenience getters for widget ----

export function getUnreadMessageCount(): number {
  const threads = getThreads();
  return threads.reduce((sum, t) => sum + t.unreadCount, 0);
}

export function getNewFollowerCount(): number {
  const followers = getFollowers();
  // Simulate "new" as a subset
  const seed = dateSeed();
  let count = 0;
  for (let i = 0; i < followers.length; i++) {
    if (seededRandom(seed, i + 200) > 0.8) count++;
  }
  return count;
}

export { generateCollectorProfiles };

// ---- Legacy Compatibility Exports ----
// These functions were in the original socialService.ts and are used by
// pages/Leaderboard.tsx and pages/PublicPortfolio.tsx

import { LeaderboardEntry, UserProfile } from '../types';
import { MOCK_CARDS } from '../constants';

const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-1',
    username: 'sportsking',
    displayName: 'Sports King',
    bio: 'Collecting only the finest 90s inserts.',
    isPublic: true,
    joinedAt: '2023-01-15',
    alphaScore: 92,
    portfolioValue: 145000,
    roi: 24.5,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    tier: 'Whale',
  },
  {
    id: 'user-2',
    username: 'gem_mint_jay',
    displayName: 'Jay The Grader',
    bio: 'PSA 10 or bust.',
    isPublic: true,
    joinedAt: '2023-03-22',
    alphaScore: 88,
    portfolioValue: 89000,
    roi: 18.2,
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    tier: 'Shark',
  },
  {
    id: 'user-3',
    username: 'bitcoin_baseball',
    displayName: 'Crypto Slugger',
    bio: 'Diversifying into cardboard.',
    isPublic: true,
    joinedAt: '2023-06-10',
    alphaScore: 75,
    portfolioValue: 210000,
    roi: -2.4,
    avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    tier: 'Collector',
  },
];

export async function fetchPublicProfile(username: string): Promise<UserProfile | null> {
  return MOCK_USERS.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export async function fetchPublicInventory(userId: string): Promise<CardInventory[]> {
  const seed = userId.charCodeAt(userId.length - 1);
  const start = seed % 5;
  return MOCK_CARDS.slice(start, start + 10);
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  return MOCK_USERS.map((user, index) => ({
    rank: index + 1,
    user,
    alphaScore: user.alphaScore,
    change24h: (seededRandom(dateSeed(), index) * 5) * (seededRandom(dateSeed(), index + 50) > 0.5 ? 1 : -1),
  }))
    .sort((a, b) => b.alphaScore - a.alphaScore)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

export function generateShareLink(username: string): string {
  return `${window.location.origin}/#/p/${username}`;
}
