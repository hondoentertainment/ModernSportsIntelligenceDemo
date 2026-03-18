import { store } from '../dal/syncStore';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PostType = 'pickup' | 'pull' | 'collection_highlight' | 'grading_result' | 'milestone';

export interface FeedComment {
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface FeedPost {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  type: PostType;
  content: string;
  cardName?: string;
  player?: string;
  imageUrl?: string;
  likes: number;
  comments: FeedComment[];
  timestamp: string;
  tags: string[];
  sport?: string;
}

export interface UserProfile {
  userId: string;
  username: string;
  avatar: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  joinedDate: string;
  badges: string[];
}

export interface FeedStats {
  totalPosts: number;
  activeUsers: number;
  postsToday: number;
  topPost: { id: string; likes: number };
  trendingTags: string[];
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  fromUser: string;
  message: string;
  read: boolean;
  timestamp: string;
}

// ─── Storage keys ────────────────────────────────────────────────────────────

const POSTS_KEY = 'msi_social_feed_posts';
const FOLLOWING_KEY = 'msi_social_feed_following';
const NOTIFICATIONS_KEY = 'msi_social_feed_notifications';
const PROFILES_KEY = 'msi_social_feed_profiles';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readJson<T>(key: string, fallback: T): T {
  return store.get<T>(key, fallback);
}

function writeJson<T>(key: string, value: T): void {
  store.set(key, value);
}

function generateId(): string {
  return `sf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_POSTS: FeedPost[] = [
  {
    id: 'post-1', userId: 'user-1', username: 'CardKing23', avatar: '/avatars/u1.png',
    type: 'pickup', content: 'Just picked up this incredible 2023 Bowman Chrome 1st!',
    cardName: '2023 Bowman Chrome 1st Auto', player: 'Jackson Holliday', imageUrl: '/cards/holliday.jpg',
    likes: 142, comments: [{ userId: 'user-2', username: 'SlabQueen', text: 'Fire pickup! 🔥', timestamp: '2026-03-14T10:30:00Z' }],
    timestamp: '2026-03-14T09:00:00Z', tags: ['bowman', 'chrome', 'prospect'], sport: 'Baseball',
  },
  {
    id: 'post-2', userId: 'user-2', username: 'SlabQueen', avatar: '/avatars/u2.png',
    type: 'grading_result', content: 'PSA 10 comeback! Waited 6 months but worth it.',
    cardName: '2022 Prizm Silver', player: 'Luka Doncic', imageUrl: '/cards/luka.jpg',
    likes: 231, comments: [{ userId: 'user-3', username: 'WaxRipper', text: 'Congrats on the gem!', timestamp: '2026-03-13T15:00:00Z' }],
    timestamp: '2026-03-13T14:00:00Z', tags: ['psa10', 'prizm', 'basketball'], sport: 'Basketball',
  },
  {
    id: 'post-3', userId: 'user-3', username: 'WaxRipper', avatar: '/avatars/u3.png',
    type: 'pull', content: 'Insane hit from a hobby box! 1/1 superfractor!',
    cardName: '2024 Topps Chrome Superfractor', player: 'Elly De La Cruz', imageUrl: '/cards/elly.jpg',
    likes: 503, comments: [
      { userId: 'user-1', username: 'CardKing23', text: 'No way! Unreal pull!', timestamp: '2026-03-12T20:00:00Z' },
      { userId: 'user-4', username: 'VintageVibes', text: 'Sell or hold??', timestamp: '2026-03-12T20:15:00Z' },
    ],
    timestamp: '2026-03-12T19:30:00Z', tags: ['topps', 'superfractor', '1of1', 'baseball'], sport: 'Baseball',
  },
  {
    id: 'post-4', userId: 'user-4', username: 'VintageVibes', avatar: '/avatars/u4.png',
    type: 'collection_highlight', content: 'My complete 1986 Fleer Basketball set. Years in the making.',
    imageUrl: '/cards/fleer86.jpg',
    likes: 389, comments: [], timestamp: '2026-03-12T12:00:00Z', tags: ['vintage', 'fleer', 'completeset', 'basketball'], sport: 'Basketball',
  },
  {
    id: 'post-5', userId: 'user-5', username: 'RookieHunter', avatar: '/avatars/u5.png',
    type: 'milestone', content: 'Hit 1,000 cards in my collection today! What a journey.',
    likes: 178, comments: [{ userId: 'user-6', username: 'GradeMaster', text: 'Awesome milestone!', timestamp: '2026-03-11T18:00:00Z' }],
    timestamp: '2026-03-11T16:00:00Z', tags: ['milestone', 'collection'], sport: 'Baseball',
  },
  {
    id: 'post-6', userId: 'user-6', username: 'GradeMaster', avatar: '/avatars/u6.png',
    type: 'grading_result', content: 'BGS 9.5 on my Wemby Prizm Silver! Sub-grades: 9.5/9.5/10/9.',
    cardName: 'Prizm Silver', player: 'Victor Wembanyama', imageUrl: '/cards/wemby.jpg',
    likes: 295, comments: [], timestamp: '2026-03-11T10:00:00Z', tags: ['bgs', 'prizm', 'wemby', 'basketball'], sport: 'Basketball',
  },
  {
    id: 'post-7', userId: 'user-7', username: 'PackPuller99', avatar: '/avatars/u7.png',
    type: 'pull', content: 'Ripped a blaster and hit a numbered auto /25!',
    cardName: '2024 Donruss Auto /25', player: 'Caleb Williams', imageUrl: '/cards/caleb.jpg',
    likes: 167, comments: [{ userId: 'user-8', username: 'GridironCards', text: 'Blaster luck is real!', timestamp: '2026-03-10T22:00:00Z' }],
    timestamp: '2026-03-10T21:00:00Z', tags: ['donruss', 'auto', 'football', 'numbered'], sport: 'Football',
  },
  {
    id: 'post-8', userId: 'user-8', username: 'GridironCards', avatar: '/avatars/u8.png',
    type: 'pickup', content: 'Finally got my grail card. 2020 Prizm Joe Burrow PSA 10.',
    cardName: 'Prizm Base PSA 10', player: 'Joe Burrow', imageUrl: '/cards/burrow.jpg',
    likes: 210, comments: [], timestamp: '2026-03-10T14:00:00Z', tags: ['prizm', 'psa10', 'football', 'grail'], sport: 'Football',
  },
  {
    id: 'post-9', userId: 'user-9', username: 'DiamondDave', avatar: '/avatars/u9.png',
    type: 'collection_highlight', content: 'Showcasing my Shohei Ohtani rainbow — 15 parallels deep.',
    player: 'Shohei Ohtani', imageUrl: '/cards/ohtani.jpg',
    likes: 445, comments: [
      { userId: 'user-1', username: 'CardKing23', text: 'This rainbow is INSANE', timestamp: '2026-03-09T17:00:00Z' },
    ],
    timestamp: '2026-03-09T15:00:00Z', tags: ['rainbow', 'ohtani', 'parallel', 'baseball'], sport: 'Baseball',
  },
  {
    id: 'post-10', userId: 'user-10', username: 'HoopsCollector', avatar: '/avatars/u10.png',
    type: 'pickup', content: 'Added a Ja Morant Optic Holo to the PC. Great deal at $85.',
    cardName: 'Optic Holo', player: 'Ja Morant', imageUrl: '/cards/ja.jpg',
    likes: 98, comments: [], timestamp: '2026-03-09T11:00:00Z', tags: ['optic', 'holo', 'basketball'], sport: 'Basketball',
  },
  {
    id: 'post-11', userId: 'user-1', username: 'CardKing23', avatar: '/avatars/u1.png',
    type: 'milestone', content: 'Portfolio value crossed $50,000! Started with $500 two years ago.',
    likes: 612, comments: [
      { userId: 'user-5', username: 'RookieHunter', text: 'Incredible growth!', timestamp: '2026-03-08T20:00:00Z' },
      { userId: 'user-9', username: 'DiamondDave', text: 'Goals right here', timestamp: '2026-03-08T20:30:00Z' },
    ],
    timestamp: '2026-03-08T18:00:00Z', tags: ['milestone', 'portfolio', 'investing'],
  },
  {
    id: 'post-12', userId: 'user-11', username: 'PuckCollector', avatar: '/avatars/u11.png',
    type: 'pull', content: 'Upper Deck Ice Premieres auto — Connor Bedard!',
    cardName: 'Ice Premieres Auto', player: 'Connor Bedard', imageUrl: '/cards/bedard.jpg',
    likes: 377, comments: [], timestamp: '2026-03-08T12:00:00Z', tags: ['upperdeck', 'hockey', 'auto', 'bedard'], sport: 'Hockey',
  },
  {
    id: 'post-13', userId: 'user-12', username: 'SetBuilder', avatar: '/avatars/u12.png',
    type: 'collection_highlight', content: 'Completed 2024 Topps Series 1 base set — all 350 cards!',
    imageUrl: '/cards/topps2024.jpg',
    likes: 124, comments: [{ userId: 'user-3', username: 'WaxRipper', text: 'Set building is underrated', timestamp: '2026-03-07T16:00:00Z' }],
    timestamp: '2026-03-07T14:00:00Z', tags: ['topps', 'setbuilding', 'completeset', 'baseball'], sport: 'Baseball',
  },
  {
    id: 'post-14', userId: 'user-6', username: 'GradeMaster', avatar: '/avatars/u6.png',
    type: 'grading_result', content: 'CGC 9.8 on my 1993 SP Foil Jeter! Best $30 grading fee ever.',
    cardName: '1993 SP Foil', player: 'Derek Jeter', imageUrl: '/cards/jeter.jpg',
    likes: 456, comments: [
      { userId: 'user-4', username: 'VintageVibes', text: 'That card is iconic!', timestamp: '2026-03-07T10:00:00Z' },
    ],
    timestamp: '2026-03-07T08:00:00Z', tags: ['cgc', 'jeter', 'vintage', 'baseball'], sport: 'Baseball',
  },
  {
    id: 'post-15', userId: 'user-7', username: 'PackPuller99', avatar: '/avatars/u7.png',
    type: 'pickup', content: 'Snagged a Caitlin Clark Prizm RC for the PC. WNBA collecting is booming!',
    cardName: 'Prizm RC', player: 'Caitlin Clark', imageUrl: '/cards/clark.jpg',
    likes: 334, comments: [
      { userId: 'user-10', username: 'HoopsCollector', text: 'Smart buy! She is going to be a legend', timestamp: '2026-03-06T19:00:00Z' },
    ],
    timestamp: '2026-03-06T17:00:00Z', tags: ['prizm', 'wnba', 'rookie', 'basketball'], sport: 'Basketball',
  },
  {
    id: 'post-16', userId: 'user-2', username: 'SlabQueen', avatar: '/avatars/u2.png',
    type: 'milestone', content: '100 PSA 10s in the vault! Quality over quantity always wins.',
    likes: 287, comments: [], timestamp: '2026-03-06T09:00:00Z', tags: ['psa10', 'milestone', 'grading'],
  },
];

const MOCK_PROFILES: UserProfile[] = [
  { userId: 'user-1', username: 'CardKing23', avatar: '/avatars/u1.png', bio: 'Prospect hunter. Baseball first.', followersCount: 2340, followingCount: 180, postsCount: 412, joinedDate: '2023-01-15', badges: ['Early Adopter', 'Top Contributor', '1K Followers'] },
  { userId: 'user-2', username: 'SlabQueen', avatar: '/avatars/u2.png', bio: 'PSA submitter & slab enthusiast.', followersCount: 5100, followingCount: 320, postsCount: 678, joinedDate: '2022-06-01', badges: ['Verified Collector', 'Grading Expert'] },
  { userId: 'user-3', username: 'WaxRipper', avatar: '/avatars/u3.png', bio: 'Ripping packs for the thrill.', followersCount: 8900, followingCount: 150, postsCount: 1023, joinedDate: '2021-11-20', badges: ['Pack Ripper', 'Top Puller', '5K Followers'] },
  { userId: 'current-user', username: 'MyProfile', avatar: '/avatars/me.png', bio: 'Sports card investor and collector.', followersCount: 450, followingCount: 95, postsCount: 67, joinedDate: '2024-02-10', badges: ['Newcomer'] },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', type: 'like', fromUser: 'WaxRipper', message: 'liked your post about Bowman Chrome pickup', read: false, timestamp: '2026-03-14T11:00:00Z' },
  { id: 'notif-2', type: 'comment', fromUser: 'SlabQueen', message: 'commented on your collection highlight', read: false, timestamp: '2026-03-14T10:30:00Z' },
  { id: 'notif-3', type: 'follow', fromUser: 'RookieHunter', message: 'started following you', read: true, timestamp: '2026-03-13T09:00:00Z' },
  { id: 'notif-4', type: 'mention', fromUser: 'DiamondDave', message: 'mentioned you in a post about rainbows', read: false, timestamp: '2026-03-13T08:00:00Z' },
  { id: 'notif-5', type: 'like', fromUser: 'GradeMaster', message: 'liked your grading result', read: true, timestamp: '2026-03-12T16:00:00Z' },
];

// ─── Service functions ───────────────────────────────────────────────────────

function ensureSeeded(): void {
  if (!store.has(POSTS_KEY)) {
    writeJson(POSTS_KEY, MOCK_POSTS);
  }
  if (!store.has(PROFILES_KEY)) {
    writeJson(PROFILES_KEY, MOCK_PROFILES);
  }
  if (!store.has(NOTIFICATIONS_KEY)) {
    writeJson(NOTIFICATIONS_KEY, MOCK_NOTIFICATIONS);
  }
  if (!store.has(FOLLOWING_KEY)) {
    writeJson(FOLLOWING_KEY, ['user-1', 'user-3']);
  }
}

export function getFeedPosts(): FeedPost[] {
  ensureSeeded();
  const posts = readJson<FeedPost[]>(POSTS_KEY, []);
  return posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function createPost(post: Omit<FeedPost, 'id' | 'likes' | 'comments' | 'timestamp'>): FeedPost {
  ensureSeeded();
  const newPost: FeedPost = {
    ...post,
    id: generateId(),
    likes: 0,
    comments: [],
    timestamp: new Date().toISOString(),
  };
  const posts = readJson<FeedPost[]>(POSTS_KEY, []);
  posts.unshift(newPost);
  writeJson(POSTS_KEY, posts);
  return newPost;
}

export function likePost(id: string): FeedPost | null {
  ensureSeeded();
  const posts = readJson<FeedPost[]>(POSTS_KEY, []);
  const post = posts.find(p => p.id === id);
  if (!post) return null;
  post.likes += 1;
  writeJson(POSTS_KEY, posts);
  return post;
}

export function addComment(postId: string, comment: Omit<FeedComment, 'timestamp'>): FeedPost | null {
  ensureSeeded();
  const posts = readJson<FeedPost[]>(POSTS_KEY, []);
  const post = posts.find(p => p.id === postId);
  if (!post) return null;
  post.comments.push({ ...comment, timestamp: new Date().toISOString() });
  writeJson(POSTS_KEY, posts);
  return post;
}

export function getUserProfile(userId: string): UserProfile | null {
  ensureSeeded();
  const profiles = readJson<UserProfile[]>(PROFILES_KEY, []);
  return profiles.find(p => p.userId === userId) ?? null;
}

export function getFollowing(): string[] {
  ensureSeeded();
  return readJson<string[]>(FOLLOWING_KEY, []);
}

export function followUser(userId: string): string[] {
  ensureSeeded();
  const following = readJson<string[]>(FOLLOWING_KEY, []);
  if (!following.includes(userId)) {
    following.push(userId);
    writeJson(FOLLOWING_KEY, following);
  }
  return following;
}

export function unfollowUser(userId: string): string[] {
  ensureSeeded();
  let following = readJson<string[]>(FOLLOWING_KEY, []);
  following = following.filter(id => id !== userId);
  writeJson(FOLLOWING_KEY, following);
  return following;
}

export function getFeedStats(): FeedStats {
  ensureSeeded();
  const posts = readJson<FeedPost[]>(POSTS_KEY, []);
  const today = new Date().toISOString().slice(0, 10);
  const postsToday = posts.filter(p => p.timestamp.slice(0, 10) === today).length;

  const topPost = posts.reduce(
    (best, p) => (p.likes > best.likes ? { id: p.id, likes: p.likes } : best),
    { id: '', likes: 0 },
  );

  const uniqueUsers = new Set(posts.map(p => p.userId));

  const tagCounts: Record<string, number> = {};
  for (const post of posts) {
    for (const tag of post.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  const trendingTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);

  return {
    totalPosts: posts.length,
    activeUsers: uniqueUsers.size,
    postsToday,
    topPost,
    trendingTags,
  };
}

export function getTrendingTags(): string[] {
  return getFeedStats().trendingTags;
}

export function getNotifications(): Notification[] {
  ensureSeeded();
  return readJson<Notification[]>(NOTIFICATIONS_KEY, [])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function markNotificationRead(id: string): Notification | null {
  ensureSeeded();
  const notifications = readJson<Notification[]>(NOTIFICATIONS_KEY, []);
  const notif = notifications.find(n => n.id === id);
  if (!notif) return null;
  notif.read = true;
  writeJson(NOTIFICATIONS_KEY, notifications);
  return notif;
}

export function searchPosts(query: string): FeedPost[] {
  const posts = getFeedPosts();
  const q = query.toLowerCase();
  return posts.filter(
    p =>
      p.content.toLowerCase().includes(q) ||
      (p.cardName && p.cardName.toLowerCase().includes(q)) ||
      (p.player && p.player.toLowerCase().includes(q)) ||
      p.username.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)),
  );
}

export function filterByType(type: PostType): FeedPost[] {
  return getFeedPosts().filter(p => p.type === type);
}

export function formatTimestamp(ts: string): string {
  const now = Date.now();
  const then = new Date(ts).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(ts).toLocaleDateString();
}

export function getPostTypeColor(type: PostType): string {
  const colors: Record<PostType, string> = {
    pickup: 'text-green-400',
    pull: 'text-yellow-400',
    collection_highlight: 'text-blue-400',
    grading_result: 'text-purple-400',
    milestone: 'text-orange-400',
  };
  return colors[type] ?? 'text-slate-400';
}

export function getPostTypeLabel(type: PostType): string {
  const labels: Record<PostType, string> = {
    pickup: 'Pickup',
    pull: 'Pack Pull',
    collection_highlight: 'Collection Highlight',
    grading_result: 'Grading Result',
    milestone: 'Milestone',
  };
  return labels[type] ?? type;
}

export function getPostTypeIcon(type: PostType): string {
  const icons: Record<PostType, string> = {
    pickup: 'ShoppingBag',
    pull: 'Package',
    collection_highlight: 'Star',
    grading_result: 'Award',
    milestone: 'Trophy',
  };
  return icons[type] ?? 'FileText';
}
