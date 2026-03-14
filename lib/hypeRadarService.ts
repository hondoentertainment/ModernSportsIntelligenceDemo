// Phase 125: Sentiment & Hype Radar (Social Listening)
// Real-time social monitoring, influencer tracking, viral detection, and narrative momentum

// ---- Types ----

export type SocialPlatform = 'twitter' | 'youtube' | 'reddit' | 'tiktok' | 'blowout_forums' | 'instagram';

export type SentimentLabel = 'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish';

export type ViralStatus = 'not_viral' | 'emerging' | 'trending' | 'viral' | 'mega_viral';

export type MomentumDirection = 'building' | 'peaking' | 'fading' | 'dormant';

export interface SocialMention {
  id: string;
  platform: SocialPlatform;
  author: string;
  authorFollowers: number;
  isVerified: boolean;
  content: string;
  timestamp: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views: number;
  };
  sentiment: SentimentLabel;
  sentimentScore: number; // -1 to 1
  cardOrPlayer: string;
  tags: string[];
  url: string;
}

export interface TrendingTopic {
  id: string;
  topic: string;
  category: 'player' | 'card' | 'set' | 'market' | 'event' | 'general';
  mentionCount: number;
  mentionDelta: number; // % change from previous period
  sentiment: SentimentLabel;
  sentimentScore: number;
  topPlatforms: SocialPlatform[];
  peakHour: string;
  relatedCards: string[];
  priceImpact: number; // % price change correlated
}

export interface InfluencerAlert {
  id: string;
  influencer: string;
  platform: SocialPlatform;
  followers: number;
  isVerified: boolean;
  tier: 'mega' | 'macro' | 'micro' | 'nano';
  mentionedCard: string;
  mentionedPlayer: string;
  mentionTimestamp: string;
  sentiment: SentimentLabel;
  preDelta: number; // price before mention
  postDelta: number; // price after mention
  impactScore: number; // 0-100
  historicalAccuracy: number; // % of past calls that were correct
  content: string;
}

export interface ViralDetection {
  id: string;
  subject: string;
  type: 'player' | 'card' | 'set' | 'event';
  status: ViralStatus;
  velocityScore: number; // how fast it's spreading (0-100)
  platforms: { platform: SocialPlatform; mentionCount: number; growth: number }[];
  totalMentions: number;
  timeDetected: string;
  peakProjection: string;
  estimatedReach: number;
  priceImpact: number;
  triggerEvent: string;
  confidence: number;
}

export interface NarrativeMomentum {
  id: string;
  narrative: string;
  player: string;
  direction: MomentumDirection;
  momentumScore: number; // 0-100
  daysTrending: number;
  peakMentions: number;
  currentMentions: number;
  sentimentTrend: number[]; // last 7 days
  relatedTopics: string[];
  priceCorrelation: number; // -1 to 1
}

export interface HypeScore {
  player: string;
  card: string;
  overallScore: number; // 0-100
  components: {
    socialVolume: number;
    sentimentStrength: number;
    influencerBuzz: number;
    viralPotential: number;
    narrativeMomentum: number;
    priceAction: number;
  };
  trend: 'rising' | 'stable' | 'falling';
  percentile: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
}

export interface SentimentTimeline {
  timestamp: string;
  bullish: number;
  bearish: number;
  neutral: number;
  volume: number;
  avgScore: number;
}

export interface PlatformBreakdown {
  platform: SocialPlatform;
  mentions: number;
  sentiment: number;
  engagement: number;
  growth: number;
  topAuthor: string;
}

export interface TopInfluencer {
  name: string;
  platform: SocialPlatform;
  followers: number;
  isVerified: boolean;
  tier: 'mega' | 'macro' | 'micro' | 'nano';
  avgImpactScore: number;
  totalMentions: number;
  accuracy: number;
  recentCalls: { card: string; sentiment: SentimentLabel; result: number }[];
}

// ---- Helpers ----

const platformIcons: Record<SocialPlatform, string> = {
  twitter: 'X',
  youtube: 'YT',
  reddit: 'Reddit',
  tiktok: 'TikTok',
  blowout_forums: 'Blowout',
  instagram: 'IG',
};

export const getPlatformLabel = (platform: SocialPlatform): string => platformIcons[platform];

export const getSentimentColor = (sentiment: SentimentLabel): { text: string; bg: string; border: string } => {
  switch (sentiment) {
    case 'very_bullish': return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    case 'bullish': return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
    case 'neutral': return { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
    case 'bearish': return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
    case 'very_bearish': return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  }
};

export const getViralStatusColor = (status: ViralStatus): { text: string; bg: string; border: string } => {
  switch (status) {
    case 'not_viral': return { text: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
    case 'emerging': return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
    case 'trending': return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
    case 'viral': return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    case 'mega_viral': return { text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20' };
  }
};

export const getMomentumColor = (direction: MomentumDirection): { text: string; bg: string; border: string } => {
  switch (direction) {
    case 'building': return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    case 'peaking': return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    case 'fading': return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    case 'dormant': return { text: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
  }
};

export const getTierColor = (tier: string): string => {
  switch (tier) {
    case 'mega': return 'text-fuchsia-400';
    case 'macro': return 'text-amber-400';
    case 'micro': return 'text-cyan-400';
    case 'nano': return 'text-slate-400';
    default: return 'text-slate-400';
  }
};

export const getRecommendationColor = (rec: string): { text: string; bg: string; border: string } => {
  switch (rec) {
    case 'strong_buy': return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    case 'buy': return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
    case 'hold': return { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
    case 'sell': return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
    case 'strong_sell': return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    default: return { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
  }
};

// ---- Mock Data ----

const socialMentions: SocialMention[] = [
  { id: 'sm-1', platform: 'twitter', author: 'CardBreaks247', authorFollowers: 245000, isVerified: true, content: 'Just pulled a 1/1 Victor Wembanyama Prizm Gold from a break! This kid is going to be a generational talent. Hold your Wemby cards!', timestamp: '2026-03-13T09:15:00Z', engagement: { likes: 4520, shares: 1230, comments: 342, views: 189000 }, sentiment: 'very_bullish', sentimentScore: 0.92, cardOrPlayer: 'Victor Wembanyama', tags: ['wemby', 'prizm', '1of1', 'spurs'], url: 'https://x.com/cardbreaks247/status/1' },
  { id: 'sm-2', platform: 'youtube', author: 'Jabs Family', authorFollowers: 520000, isVerified: true, content: 'MASSIVE Caitlin Clark Rookie Card Haul! These are going to 10X by next season. Full video breakdown of every RC available.', timestamp: '2026-03-13T08:30:00Z', engagement: { likes: 12400, shares: 3200, comments: 890, views: 456000 }, sentiment: 'very_bullish', sentimentScore: 0.88, cardOrPlayer: 'Caitlin Clark', tags: ['caitlin-clark', 'rookie', 'wnba', 'investment'], url: 'https://youtube.com/watch?v=abc123' },
  { id: 'sm-3', platform: 'reddit', author: 'BaseballCardCollector99', authorFollowers: 15000, isVerified: false, content: 'Hot take: Shohei Ohtani PSA 10 Bowman Chrome 1st are still undervalued. Compare to Trout 1st at the same career point. Easy 2x from here.', timestamp: '2026-03-13T07:45:00Z', engagement: { likes: 890, shares: 120, comments: 234, views: 34000 }, sentiment: 'bullish', sentimentScore: 0.72, cardOrPlayer: 'Shohei Ohtani', tags: ['ohtani', 'bowman-chrome', 'psa10', 'undervalued'], url: 'https://reddit.com/r/baseballcards/1' },
  { id: 'sm-4', platform: 'tiktok', author: 'RookieFlips', authorFollowers: 890000, isVerified: true, content: 'POV: You bought Caleb Williams cards at the peak and now they are down 60% #sportscards #cardflipping #pain', timestamp: '2026-03-13T10:00:00Z', engagement: { likes: 34500, shares: 8900, comments: 2100, views: 1200000 }, sentiment: 'very_bearish', sentimentScore: -0.85, cardOrPlayer: 'Caleb Williams', tags: ['caleb-williams', 'bears', 'loss', 'rookie'], url: 'https://tiktok.com/@rookieflips/1' },
  { id: 'sm-5', platform: 'blowout_forums', author: 'VintageGuru', authorFollowers: 2300, isVerified: false, content: 'Market update: 1986 Fleer Jordan PSA 10 just sold for $420K at Heritage. Thats 15% below the Jan high. Smart money accumulating.', timestamp: '2026-03-13T06:30:00Z', engagement: { likes: 156, shares: 23, comments: 67, views: 4500 }, sentiment: 'bullish', sentimentScore: 0.65, cardOrPlayer: 'Michael Jordan', tags: ['jordan', 'fleer', 'psa10', 'vintage', 'heritage'], url: 'https://blowoutforums.com/thread/1' },
  { id: 'sm-6', platform: 'instagram', author: 'PSAcard', authorFollowers: 1200000, isVerified: true, content: 'Pop report alert: Only 3 known PSA 10 copies of the 2024 Topps Chrome Elly De La Cruz Gold Refractor /50. Rarity meets performance!', timestamp: '2026-03-13T11:00:00Z', engagement: { likes: 8900, shares: 1500, comments: 432, views: 234000 }, sentiment: 'bullish', sentimentScore: 0.78, cardOrPlayer: 'Elly De La Cruz', tags: ['elly', 'topps-chrome', 'gold-refractor', 'psa10', 'pop-report'], url: 'https://instagram.com/p/abc123' },
  { id: 'sm-7', platform: 'twitter', author: 'SportsCardInvestor', authorFollowers: 178000, isVerified: true, content: 'Luka Doncic PSA 10 Prizm Silver has bottomed. The chart is screaming reversal. Loading up here. NFA.', timestamp: '2026-03-13T09:45:00Z', engagement: { likes: 3200, shares: 870, comments: 445, views: 145000 }, sentiment: 'bullish', sentimentScore: 0.75, cardOrPlayer: 'Luka Doncic', tags: ['luka', 'prizm-silver', 'psa10', 'bottom', 'reversal'], url: 'https://x.com/scinvestor/status/2' },
  { id: 'sm-8', platform: 'youtube', author: 'Gary Vee', authorFollowers: 4200000, isVerified: true, content: 'Sports cards are STILL the most undervalued asset class. Im telling you guys, the 2025 rookie class is going to print money. Patience wins.', timestamp: '2026-03-12T18:00:00Z', engagement: { likes: 45000, shares: 12000, comments: 5600, views: 2300000 }, sentiment: 'very_bullish', sentimentScore: 0.95, cardOrPlayer: 'General Market', tags: ['market', 'investment', 'rookie-class', 'patience'], url: 'https://youtube.com/watch?v=def456' },
  { id: 'sm-9', platform: 'reddit', author: 'FootballCardKing', authorFollowers: 8700, isVerified: false, content: 'Jayden Daniels cards are quietly climbing. Commanders playoff run changed everything. His Bowman University is up 40% this month alone.', timestamp: '2026-03-13T08:15:00Z', engagement: { likes: 567, shares: 89, comments: 123, views: 21000 }, sentiment: 'bullish', sentimentScore: 0.68, cardOrPlayer: 'Jayden Daniels', tags: ['jayden-daniels', 'commanders', 'bowman', 'rising'], url: 'https://reddit.com/r/footballcards/2' },
  { id: 'sm-10', platform: 'tiktok', author: 'CardCollectorKid', authorFollowers: 340000, isVerified: false, content: 'This $2 card from a dollar store pack just got graded PSA 10 and is worth $500! Never sleep on retail! #sportscards #psa10', timestamp: '2026-03-13T12:00:00Z', engagement: { likes: 67000, shares: 15000, comments: 3400, views: 3400000 }, sentiment: 'bullish', sentimentScore: 0.6, cardOrPlayer: 'General Market', tags: ['retail', 'psa10', 'dollar-store', 'sleeper'], url: 'https://tiktok.com/@cardcollectorkid/2' },
  { id: 'sm-11', platform: 'twitter', author: 'WaxRippers', authorFollowers: 67000, isVerified: false, content: 'Panini losing the NBA license is going to absolutely TANK Prizm and Select values long term. Get out while you can. Fanatics era incoming.', timestamp: '2026-03-13T07:00:00Z', engagement: { likes: 2100, shares: 890, comments: 567, views: 98000 }, sentiment: 'very_bearish', sentimentScore: -0.82, cardOrPlayer: 'Panini/Prizm', tags: ['panini', 'prizm', 'select', 'fanatics', 'license'], url: 'https://x.com/waxrippers/status/3' },
  { id: 'sm-12', platform: 'blowout_forums', author: 'SetBuilder2000', authorFollowers: 1200, isVerified: false, content: 'Anyone else noticing 2024 Topps Series 1 hobby boxes are drying up? Distributors saying allocation is maxed. Could see $200+ boxes soon.', timestamp: '2026-03-13T05:45:00Z', engagement: { likes: 89, shares: 12, comments: 45, views: 3200 }, sentiment: 'bullish', sentimentScore: 0.55, cardOrPlayer: 'Topps Series 1', tags: ['topps', 'hobby', 'allocation', 'scarcity'], url: 'https://blowoutforums.com/thread/2' },
  { id: 'sm-13', platform: 'instagram', author: 'TheHobbyFamily', authorFollowers: 456000, isVerified: true, content: 'Just acquired a 1952 Topps Mickey Mantle PSA 5. Dream card checked off the list. The vintage market is where generational wealth is built.', timestamp: '2026-03-13T10:30:00Z', engagement: { likes: 15600, shares: 2300, comments: 890, views: 345000 }, sentiment: 'very_bullish', sentimentScore: 0.9, cardOrPlayer: 'Mickey Mantle', tags: ['mantle', '1952-topps', 'vintage', 'grail'], url: 'https://instagram.com/p/def456' },
  { id: 'sm-14', platform: 'twitter', author: 'BreakingNewsCards', authorFollowers: 89000, isVerified: true, content: 'BREAKING: Anthony Edwards just dropped 52 points. His National Treasures RPA just jumped 25% in the last hour on eBay. Ant-Man is HIM.', timestamp: '2026-03-13T11:30:00Z', engagement: { likes: 5600, shares: 2100, comments: 678, views: 234000 }, sentiment: 'very_bullish', sentimentScore: 0.93, cardOrPlayer: 'Anthony Edwards', tags: ['ant-man', 'edwards', 'national-treasures', 'rpa', 'performance'], url: 'https://x.com/breakingnewscards/status/4' },
  { id: 'sm-15', platform: 'youtube', author: 'Layton Sports Cards', authorFollowers: 380000, isVerified: true, content: 'We just opened $50,000 worth of 2025 Bowman Chrome. Heres every hit and the ROI breakdown. Spoiler: not great.', timestamp: '2026-03-12T20:00:00Z', engagement: { likes: 8900, shares: 1800, comments: 1200, views: 567000 }, sentiment: 'bearish', sentimentScore: -0.45, cardOrPlayer: 'Bowman Chrome', tags: ['bowman-chrome', 'roi', 'case-break', 'hobby'], url: 'https://youtube.com/watch?v=ghi789' },
  { id: 'sm-16', platform: 'reddit', author: 'SilverRefractorHunter', authorFollowers: 4500, isVerified: false, content: 'Unpopular opinion: Bryce Harper 2012 Bowman Chrome Auto is the best long-term baseball card investment right now. 2x WS champion, multiple MVPs.', timestamp: '2026-03-13T09:00:00Z', engagement: { likes: 345, shares: 56, comments: 89, views: 12000 }, sentiment: 'bullish', sentimentScore: 0.7, cardOrPlayer: 'Bryce Harper', tags: ['harper', 'bowman-chrome', 'auto', 'investment'], url: 'https://reddit.com/r/baseballcards/3' },
  { id: 'sm-17', platform: 'tiktok', author: 'HoopsCards', authorFollowers: 560000, isVerified: true, content: 'I predicted the LeBron Topps Chrome RC PSA 10 would hit $50K and people laughed. Its at $48K now. Next stop $60K. #sportscards #lebron', timestamp: '2026-03-13T13:00:00Z', engagement: { likes: 23000, shares: 5600, comments: 1800, views: 890000 }, sentiment: 'very_bullish', sentimentScore: 0.88, cardOrPlayer: 'LeBron James', tags: ['lebron', 'topps-chrome', 'psa10', 'prediction'], url: 'https://tiktok.com/@hoopscards/3' },
  { id: 'sm-18', platform: 'blowout_forums', author: 'GradeMaster', authorFollowers: 3400, isVerified: false, content: 'PSA turnaround times are getting worse again. 90 day service taking 120+. BGS is faster right now. Consider switching for your submissions.', timestamp: '2026-03-13T04:30:00Z', engagement: { likes: 234, shares: 45, comments: 89, views: 5600 }, sentiment: 'bearish', sentimentScore: -0.4, cardOrPlayer: 'PSA Grading', tags: ['psa', 'bgs', 'grading', 'turnaround'], url: 'https://blowoutforums.com/thread/3' },
  { id: 'sm-19', platform: 'twitter', author: 'CardPriceDaily', authorFollowers: 134000, isVerified: true, content: 'Market Watch: The top 10 basketball RCs are down an average of 8% this week. Seasonal dip or something bigger? Were watching closely.', timestamp: '2026-03-13T08:00:00Z', engagement: { likes: 1800, shares: 560, comments: 234, views: 89000 }, sentiment: 'bearish', sentimentScore: -0.35, cardOrPlayer: 'Basketball RCs', tags: ['market-watch', 'basketball', 'rookies', 'decline'], url: 'https://x.com/cardpricedaily/status/5' },
  { id: 'sm-20', platform: 'instagram', author: 'GemMintCards', authorFollowers: 890000, isVerified: true, content: 'Grabbed this insane Ja Morant Flawless 1/1 Logoman at auction for $35K. With his return and playoff push this is going to moon!', timestamp: '2026-03-13T14:00:00Z', engagement: { likes: 21000, shares: 4500, comments: 1200, views: 456000 }, sentiment: 'very_bullish', sentimentScore: 0.85, cardOrPlayer: 'Ja Morant', tags: ['ja-morant', 'flawless', 'logoman', '1of1', 'grizzlies'], url: 'https://instagram.com/p/ghi789' },
  { id: 'sm-21', platform: 'twitter', author: 'TheCardfather', authorFollowers: 210000, isVerified: true, content: 'Connor Bedard Upper Deck Young Guns PSA 10 just cracked $2,000. Reminder: this kid is 19 and already elite. Hockey card market heating up.', timestamp: '2026-03-13T10:15:00Z', engagement: { likes: 3800, shares: 1100, comments: 345, views: 167000 }, sentiment: 'bullish', sentimentScore: 0.77, cardOrPlayer: 'Connor Bedard', tags: ['bedard', 'young-guns', 'psa10', 'hockey'], url: 'https://x.com/thecardfather/status/6' },
  { id: 'sm-22', platform: 'reddit', author: 'WembyWatch', authorFollowers: 12000, isVerified: false, content: 'Tracking all Wembanyama Prizm Silver PSA 10 sales. Average is $1,850 this week, up from $1,600 last week. Demand is accelerating.', timestamp: '2026-03-13T11:00:00Z', engagement: { likes: 678, shares: 145, comments: 167, views: 28000 }, sentiment: 'bullish', sentimentScore: 0.73, cardOrPlayer: 'Victor Wembanyama', tags: ['wemby', 'prizm-silver', 'psa10', 'tracking'], url: 'https://reddit.com/r/basketballcards/4' },
  { id: 'sm-23', platform: 'youtube', author: 'SportscardRadio', authorFollowers: 145000, isVerified: true, content: 'EMERGENCY POD: Fanatics just announced exclusive NFL card deal starting 2027. What this means for your Panini collection. Must watch.', timestamp: '2026-03-13T07:00:00Z', engagement: { likes: 6700, shares: 3400, comments: 1500, views: 389000 }, sentiment: 'bearish', sentimentScore: -0.55, cardOrPlayer: 'NFL Cards/Fanatics', tags: ['fanatics', 'nfl', 'panini', 'exclusive', 'license'], url: 'https://youtube.com/watch?v=jkl012' },
  { id: 'sm-24', platform: 'tiktok', author: 'CardFlipQueen', authorFollowers: 720000, isVerified: true, content: 'Turned $200 into $4,000 flipping Caitlin Clark cards in 30 days. Heres exactly what I bought and sold. Full tutorial. #sportscards', timestamp: '2026-03-12T22:00:00Z', engagement: { likes: 89000, shares: 23000, comments: 5600, views: 5600000 }, sentiment: 'very_bullish', sentimentScore: 0.82, cardOrPlayer: 'Caitlin Clark', tags: ['caitlin-clark', 'flipping', 'tutorial', 'profit'], url: 'https://tiktok.com/@cardflipqueen/4' },
  { id: 'sm-25', platform: 'blowout_forums', author: 'InvestorMike', authorFollowers: 5600, isVerified: false, content: 'Just ran the numbers: Patrick Mahomes Prizm Silver PSA 10 is returning to 2022 price levels. Three-peat narrative driving renewed demand.', timestamp: '2026-03-13T06:00:00Z', engagement: { likes: 178, shares: 34, comments: 78, views: 6700 }, sentiment: 'bullish', sentimentScore: 0.66, cardOrPlayer: 'Patrick Mahomes', tags: ['mahomes', 'prizm-silver', 'psa10', 'chiefs', 'three-peat'], url: 'https://blowoutforums.com/thread/4' },
  { id: 'sm-26', platform: 'twitter', author: 'AltInvestDaily', authorFollowers: 320000, isVerified: true, content: 'Data: Sports card market total volume is up 22% YoY. The "cards are dead" narrative was always wrong. Smart money never left.', timestamp: '2026-03-13T12:30:00Z', engagement: { likes: 7800, shares: 3400, comments: 890, views: 345000 }, sentiment: 'very_bullish', sentimentScore: 0.87, cardOrPlayer: 'General Market', tags: ['market-data', 'volume', 'growth', 'alternative-investment'], url: 'https://x.com/altinvestdaily/status/7' },
  { id: 'sm-27', platform: 'instagram', author: 'BreakNinja', authorFollowers: 567000, isVerified: true, content: 'The 2025 Topps Chrome Baseball design is absolutely FIRE. Best design since 2018. These are going to fly. Pre-orders already sold out at most shops.', timestamp: '2026-03-13T13:30:00Z', engagement: { likes: 12000, shares: 2800, comments: 567, views: 234000 }, sentiment: 'bullish', sentimentScore: 0.72, cardOrPlayer: 'Topps Chrome 2025', tags: ['topps-chrome', 'design', 'baseball', 'pre-order'], url: 'https://instagram.com/p/jkl012' },
];

const trendingTopics: TrendingTopic[] = [
  { id: 'tt-1', topic: 'Caitlin Clark Rookie Cards', category: 'player', mentionCount: 14500, mentionDelta: 127, sentiment: 'very_bullish', sentimentScore: 0.84, topPlatforms: ['tiktok', 'youtube', 'twitter'], peakHour: '2026-03-13T14:00:00Z', relatedCards: ['Prizm RC', 'Optic RC', 'Select RC'], priceImpact: 18.5 },
  { id: 'tt-2', topic: 'Fanatics NFL License Deal', category: 'market', mentionCount: 9800, mentionDelta: 340, sentiment: 'bearish', sentimentScore: -0.52, topPlatforms: ['twitter', 'youtube', 'reddit'], peakHour: '2026-03-13T08:00:00Z', relatedCards: ['Panini Prizm', 'Select', 'National Treasures'], priceImpact: -12.3 },
  { id: 'tt-3', topic: 'Anthony Edwards 52-Point Game', category: 'event', mentionCount: 8200, mentionDelta: 890, sentiment: 'very_bullish', sentimentScore: 0.91, topPlatforms: ['twitter', 'instagram', 'tiktok'], peakHour: '2026-03-13T11:30:00Z', relatedCards: ['NT RPA', 'Prizm Silver', 'Optic Holo'], priceImpact: 25.2 },
  { id: 'tt-4', topic: 'Victor Wembanyama Prizm', category: 'card', mentionCount: 7600, mentionDelta: 45, sentiment: 'bullish', sentimentScore: 0.76, topPlatforms: ['twitter', 'reddit', 'blowout_forums'], peakHour: '2026-03-13T09:00:00Z', relatedCards: ['Prizm Base', 'Prizm Silver', 'Prizm Gold'], priceImpact: 8.7 },
  { id: 'tt-5', topic: 'PSA Grading Delays', category: 'market', mentionCount: 5400, mentionDelta: 67, sentiment: 'bearish', sentimentScore: -0.42, topPlatforms: ['blowout_forums', 'reddit', 'twitter'], peakHour: '2026-03-13T06:00:00Z', relatedCards: [], priceImpact: -3.1 },
  { id: 'tt-6', topic: 'Vintage Market Rally', category: 'market', mentionCount: 4200, mentionDelta: 23, sentiment: 'bullish', sentimentScore: 0.68, topPlatforms: ['twitter', 'blowout_forums', 'instagram'], peakHour: '2026-03-13T10:00:00Z', relatedCards: ['1952 Topps Mantle', '1986 Fleer Jordan', '1979 OPC Gretzky'], priceImpact: 6.4 },
  { id: 'tt-7', topic: 'Connor Bedard Young Guns', category: 'card', mentionCount: 3800, mentionDelta: 56, sentiment: 'bullish', sentimentScore: 0.74, topPlatforms: ['twitter', 'reddit', 'youtube'], peakHour: '2026-03-13T10:15:00Z', relatedCards: ['Upper Deck YG', 'YG Canvas', 'YG Exclusives'], priceImpact: 11.2 },
  { id: 'tt-8', topic: 'Caleb Williams Card Crash', category: 'player', mentionCount: 6100, mentionDelta: -15, sentiment: 'very_bearish', sentimentScore: -0.78, topPlatforms: ['tiktok', 'twitter', 'reddit'], peakHour: '2026-03-13T10:00:00Z', relatedCards: ['Prizm RC', 'Optic RC', 'Bowman Chrome'], priceImpact: -34.5 },
  { id: 'tt-9', topic: 'Patrick Mahomes Three-Peat Hype', category: 'player', mentionCount: 5800, mentionDelta: 89, sentiment: 'bullish', sentimentScore: 0.71, topPlatforms: ['twitter', 'youtube', 'instagram'], peakHour: '2026-03-13T12:00:00Z', relatedCards: ['Prizm Silver', 'Optic Holo', 'NT RPA'], priceImpact: 14.8 },
  { id: 'tt-10', topic: '2025 Topps Chrome Design Reveal', category: 'set', mentionCount: 3200, mentionDelta: 210, sentiment: 'bullish', sentimentScore: 0.7, topPlatforms: ['instagram', 'twitter', 'youtube'], peakHour: '2026-03-13T13:30:00Z', relatedCards: ['Topps Chrome Base', 'Refractor', 'Gold Refractor'], priceImpact: 4.2 },
];

const influencerAlerts: InfluencerAlert[] = [
  { id: 'ia-1', influencer: 'Gary Vee', platform: 'youtube', followers: 4200000, isVerified: true, tier: 'mega', mentionedCard: '2025 Rookie Class', mentionedPlayer: 'General Market', mentionTimestamp: '2026-03-12T18:00:00Z', sentiment: 'very_bullish', preDelta: 0, postDelta: 5.2, impactScore: 94, historicalAccuracy: 62, content: 'Sports cards are STILL the most undervalued asset class.' },
  { id: 'ia-2', influencer: 'Jabs Family', platform: 'youtube', followers: 520000, isVerified: true, tier: 'macro', mentionedCard: 'Caitlin Clark RC', mentionedPlayer: 'Caitlin Clark', mentionTimestamp: '2026-03-13T08:30:00Z', sentiment: 'very_bullish', preDelta: 0, postDelta: 12.4, impactScore: 82, historicalAccuracy: 71, content: 'MASSIVE Caitlin Clark Rookie Card Haul! These are going to 10X.' },
  { id: 'ia-3', influencer: 'SportsCardInvestor', platform: 'twitter', followers: 178000, isVerified: true, tier: 'macro', mentionedCard: 'Luka Prizm Silver PSA 10', mentionedPlayer: 'Luka Doncic', mentionTimestamp: '2026-03-13T09:45:00Z', sentiment: 'bullish', preDelta: 0, postDelta: 7.8, impactScore: 76, historicalAccuracy: 68, content: 'Luka Doncic PSA 10 Prizm Silver has bottomed. Loading up here.' },
  { id: 'ia-4', influencer: 'CardFlipQueen', platform: 'tiktok', followers: 720000, isVerified: true, tier: 'macro', mentionedCard: 'Caitlin Clark Cards', mentionedPlayer: 'Caitlin Clark', mentionTimestamp: '2026-03-12T22:00:00Z', sentiment: 'very_bullish', preDelta: 0, postDelta: 8.9, impactScore: 88, historicalAccuracy: 74, content: 'Turned $200 into $4,000 flipping Caitlin Clark cards in 30 days.' },
  { id: 'ia-5', influencer: 'Layton Sports Cards', platform: 'youtube', followers: 380000, isVerified: true, tier: 'macro', mentionedCard: '2025 Bowman Chrome', mentionedPlayer: 'Various', mentionTimestamp: '2026-03-12T20:00:00Z', sentiment: 'bearish', preDelta: 0, postDelta: -4.2, impactScore: 71, historicalAccuracy: 77, content: 'We just opened $50,000 worth of 2025 Bowman Chrome. ROI: not great.' },
  { id: 'ia-6', influencer: 'TheCardfather', platform: 'twitter', followers: 210000, isVerified: true, tier: 'macro', mentionedCard: 'Bedard Young Guns PSA 10', mentionedPlayer: 'Connor Bedard', mentionTimestamp: '2026-03-13T10:15:00Z', sentiment: 'bullish', preDelta: 0, postDelta: 6.3, impactScore: 69, historicalAccuracy: 72, content: 'Connor Bedard Upper Deck Young Guns PSA 10 just cracked $2,000.' },
  { id: 'ia-7', influencer: 'RookieFlips', platform: 'tiktok', followers: 890000, isVerified: true, tier: 'macro', mentionedCard: 'Caleb Williams RC', mentionedPlayer: 'Caleb Williams', mentionTimestamp: '2026-03-13T10:00:00Z', sentiment: 'very_bearish', preDelta: 0, postDelta: -8.5, impactScore: 85, historicalAccuracy: 59, content: 'POV: You bought Caleb Williams cards at the peak and now they are down 60%.' },
  { id: 'ia-8', influencer: 'AltInvestDaily', platform: 'twitter', followers: 320000, isVerified: true, tier: 'macro', mentionedCard: 'General Market', mentionedPlayer: 'General Market', mentionTimestamp: '2026-03-13T12:30:00Z', sentiment: 'very_bullish', preDelta: 0, postDelta: 2.1, impactScore: 73, historicalAccuracy: 81, content: 'Sports card market total volume is up 22% YoY.' },
];

const viralDetections: ViralDetection[] = [
  { id: 'vd-1', subject: 'Anthony Edwards', type: 'player', status: 'viral', velocityScore: 92, platforms: [{ platform: 'twitter', mentionCount: 4200, growth: 340 }, { platform: 'instagram', mentionCount: 2800, growth: 210 }, { platform: 'tiktok', mentionCount: 3100, growth: 450 }], totalMentions: 10100, timeDetected: '2026-03-13T11:35:00Z', peakProjection: '2026-03-13T16:00:00Z', estimatedReach: 12500000, priceImpact: 25.2, triggerEvent: '52-point game performance', confidence: 94 },
  { id: 'vd-2', subject: 'Caitlin Clark', type: 'player', status: 'mega_viral', velocityScore: 98, platforms: [{ platform: 'tiktok', mentionCount: 8900, growth: 560 }, { platform: 'youtube', mentionCount: 3400, growth: 180 }, { platform: 'twitter', mentionCount: 5600, growth: 290 }, { platform: 'instagram', mentionCount: 4100, growth: 320 }], totalMentions: 22000, timeDetected: '2026-03-12T14:00:00Z', peakProjection: '2026-03-14T10:00:00Z', estimatedReach: 45000000, priceImpact: 18.5, triggerEvent: 'Viral TikTok flipping tutorial + Jabs Family YouTube feature', confidence: 97 },
  { id: 'vd-3', subject: 'Fanatics NFL License', type: 'event', status: 'trending', velocityScore: 78, platforms: [{ platform: 'twitter', mentionCount: 4500, growth: 230 }, { platform: 'youtube', mentionCount: 2100, growth: 340 }, { platform: 'reddit', mentionCount: 1800, growth: 190 }], totalMentions: 8400, timeDetected: '2026-03-13T07:10:00Z', peakProjection: '2026-03-13T18:00:00Z', estimatedReach: 8900000, priceImpact: -12.3, triggerEvent: 'Official announcement of exclusive NFL deal', confidence: 89 },
  { id: 'vd-4', subject: 'Caleb Williams Card Crash', type: 'player', status: 'trending', velocityScore: 71, platforms: [{ platform: 'tiktok', mentionCount: 3200, growth: 180 }, { platform: 'twitter', mentionCount: 2100, growth: 120 }, { platform: 'reddit', mentionCount: 1400, growth: 90 }], totalMentions: 6700, timeDetected: '2026-03-13T09:45:00Z', peakProjection: '2026-03-13T14:00:00Z', estimatedReach: 5600000, priceImpact: -34.5, triggerEvent: 'Viral TikTok showing 60% loss compilation', confidence: 86 },
  { id: 'vd-5', subject: 'Connor Bedard', type: 'player', status: 'emerging', velocityScore: 55, platforms: [{ platform: 'twitter', mentionCount: 1800, growth: 120 }, { platform: 'reddit', mentionCount: 900, growth: 80 }], totalMentions: 2700, timeDetected: '2026-03-13T10:20:00Z', peakProjection: '2026-03-14T08:00:00Z', estimatedReach: 2100000, priceImpact: 11.2, triggerEvent: 'Young Guns PSA 10 crossing $2,000 threshold', confidence: 72 },
];

const narrativeMomentums: NarrativeMomentum[] = [
  { id: 'nm-1', narrative: 'Caitlin Clark is the GOAT of women\'s basketball investing', player: 'Caitlin Clark', direction: 'building', momentumScore: 94, daysTrending: 18, peakMentions: 22000, currentMentions: 14500, sentimentTrend: [65, 72, 78, 82, 85, 89, 94], relatedTopics: ['WNBA viewership', 'Nike deal', 'Rookie cards'], priceCorrelation: 0.89 },
  { id: 'nm-2', narrative: 'Panini/Prizm values will crash with Fanatics takeover', player: 'Panini/Prizm', direction: 'building', momentumScore: 78, daysTrending: 12, peakMentions: 9800, currentMentions: 9800, sentimentTrend: [30, 35, 42, 48, 55, 65, 78], relatedTopics: ['Fanatics license', 'NBA rights', 'NFL rights'], priceCorrelation: -0.72 },
  { id: 'nm-3', narrative: 'Anthony Edwards is the next Jordan for card values', player: 'Anthony Edwards', direction: 'peaking', momentumScore: 91, daysTrending: 3, peakMentions: 10100, currentMentions: 8200, sentimentTrend: [40, 55, 72, 85, 91, 89, 91], relatedTopics: ['52-point game', 'Timberwolves playoffs', 'NT RPA'], priceCorrelation: 0.93 },
  { id: 'nm-4', narrative: 'Caleb Williams is a bust - sell everything', player: 'Caleb Williams', direction: 'fading', momentumScore: 42, daysTrending: 45, peakMentions: 15000, currentMentions: 6100, sentimentTrend: [85, 78, 68, 58, 52, 48, 42], relatedTopics: ['Bears rebuild', 'rookie struggles', 'sell pressure'], priceCorrelation: -0.81 },
  { id: 'nm-5', narrative: 'Vintage cards are the ultimate safe haven', player: 'Vintage Market', direction: 'building', momentumScore: 67, daysTrending: 30, peakMentions: 6000, currentMentions: 4200, sentimentTrend: [45, 48, 52, 55, 58, 62, 67], relatedTopics: ['1952 Topps', '1986 Fleer', 'Heritage auctions'], priceCorrelation: 0.64 },
  { id: 'nm-6', narrative: 'Mahomes three-peat dynasty premium', player: 'Patrick Mahomes', direction: 'building', momentumScore: 73, daysTrending: 21, peakMentions: 7200, currentMentions: 5800, sentimentTrend: [40, 48, 55, 60, 65, 70, 73], relatedTopics: ['Chiefs dynasty', 'Super Bowl', 'Prizm Silver'], priceCorrelation: 0.76 },
  { id: 'nm-7', narrative: 'Wembanyama is the safest long-term basketball hold', player: 'Victor Wembanyama', direction: 'peaking', momentumScore: 80, daysTrending: 60, peakMentions: 12000, currentMentions: 7600, sentimentTrend: [75, 78, 80, 82, 81, 80, 80], relatedTopics: ['Spurs rebuild', 'generational talent', 'Prizm'], priceCorrelation: 0.71 },
  { id: 'nm-8', narrative: 'Hockey cards are the next frontier', player: 'Connor Bedard', direction: 'building', momentumScore: 58, daysTrending: 14, peakMentions: 4500, currentMentions: 3800, sentimentTrend: [32, 38, 42, 46, 50, 54, 58], relatedTopics: ['Upper Deck', 'Young Guns', 'hockey market'], priceCorrelation: 0.55 },
];

const hypeScores: HypeScore[] = [
  { player: 'Caitlin Clark', card: 'Prizm RC PSA 10', overallScore: 96, components: { socialVolume: 98, sentimentStrength: 92, influencerBuzz: 95, viralPotential: 99, narrativeMomentum: 94, priceAction: 88 }, trend: 'rising', percentile: 99, recommendation: 'strong_buy' },
  { player: 'Anthony Edwards', card: 'National Treasures RPA', overallScore: 93, components: { socialVolume: 90, sentimentStrength: 95, influencerBuzz: 82, viralPotential: 92, narrativeMomentum: 91, priceAction: 96 }, trend: 'rising', percentile: 98, recommendation: 'strong_buy' },
  { player: 'Victor Wembanyama', card: 'Prizm Silver PSA 10', overallScore: 85, components: { socialVolume: 82, sentimentStrength: 80, influencerBuzz: 78, viralPotential: 75, narrativeMomentum: 80, priceAction: 92 }, trend: 'stable', percentile: 92, recommendation: 'buy' },
  { player: 'Patrick Mahomes', card: 'Prizm Silver PSA 10', overallScore: 79, components: { socialVolume: 75, sentimentStrength: 78, influencerBuzz: 72, viralPotential: 68, narrativeMomentum: 73, priceAction: 85 }, trend: 'rising', percentile: 88, recommendation: 'buy' },
  { player: 'Connor Bedard', card: 'Young Guns PSA 10', overallScore: 72, components: { socialVolume: 65, sentimentStrength: 76, influencerBuzz: 69, viralPotential: 55, narrativeMomentum: 58, priceAction: 82 }, trend: 'rising', percentile: 82, recommendation: 'buy' },
  { player: 'Luka Doncic', card: 'Prizm Silver PSA 10', overallScore: 68, components: { socialVolume: 60, sentimentStrength: 72, influencerBuzz: 76, viralPotential: 52, narrativeMomentum: 55, priceAction: 78 }, trend: 'stable', percentile: 76, recommendation: 'hold' },
  { player: 'LeBron James', card: 'Topps Chrome RC PSA 10', overallScore: 74, components: { socialVolume: 70, sentimentStrength: 82, influencerBuzz: 88, viralPotential: 48, narrativeMomentum: 60, priceAction: 75 }, trend: 'stable', percentile: 84, recommendation: 'hold' },
  { player: 'Caleb Williams', card: 'Prizm RC PSA 10', overallScore: 31, components: { socialVolume: 72, sentimentStrength: 15, influencerBuzz: 85, viralPotential: 45, narrativeMomentum: 42, priceAction: 8 }, trend: 'falling', percentile: 12, recommendation: 'strong_sell' },
  { player: 'Shohei Ohtani', card: 'Bowman Chrome 1st PSA 10', overallScore: 77, components: { socialVolume: 68, sentimentStrength: 80, influencerBuzz: 65, viralPotential: 58, narrativeMomentum: 70, priceAction: 88 }, trend: 'rising', percentile: 86, recommendation: 'buy' },
  { player: 'Ja Morant', card: 'Flawless 1/1 Logoman', overallScore: 65, components: { socialVolume: 58, sentimentStrength: 72, influencerBuzz: 80, viralPotential: 50, narrativeMomentum: 48, priceAction: 68 }, trend: 'rising', percentile: 72, recommendation: 'hold' },
];

const sentimentTimelines: SentimentTimeline[] = [
  { timestamp: '2026-03-07', bullish: 45, bearish: 30, neutral: 25, volume: 12400, avgScore: 0.22 },
  { timestamp: '2026-03-08', bullish: 48, bearish: 28, neutral: 24, volume: 13100, avgScore: 0.28 },
  { timestamp: '2026-03-09', bullish: 42, bearish: 35, neutral: 23, volume: 14800, avgScore: 0.12 },
  { timestamp: '2026-03-10', bullish: 50, bearish: 25, neutral: 25, volume: 16200, avgScore: 0.35 },
  { timestamp: '2026-03-11', bullish: 55, bearish: 22, neutral: 23, volume: 18500, avgScore: 0.42 },
  { timestamp: '2026-03-12', bullish: 52, bearish: 28, neutral: 20, volume: 21300, avgScore: 0.34 },
  { timestamp: '2026-03-13', bullish: 58, bearish: 24, neutral: 18, volume: 24800, avgScore: 0.48 },
];

const topInfluencers: TopInfluencer[] = [
  { name: 'Gary Vee', platform: 'youtube', followers: 4200000, isVerified: true, tier: 'mega', avgImpactScore: 94, totalMentions: 342, accuracy: 62, recentCalls: [{ card: '2025 Rookie Class', sentiment: 'very_bullish', result: 5.2 }, { card: 'Bowman Chrome Boxes', sentiment: 'bullish', result: -2.1 }, { card: 'Vintage Baseball', sentiment: 'very_bullish', result: 12.8 }] },
  { name: 'CardFlipQueen', platform: 'tiktok', followers: 720000, isVerified: true, tier: 'macro', avgImpactScore: 88, totalMentions: 567, accuracy: 74, recentCalls: [{ card: 'Caitlin Clark RC', sentiment: 'very_bullish', result: 18.5 }, { card: 'Jayden Daniels RC', sentiment: 'bullish', result: 8.2 }, { card: 'Bowman University', sentiment: 'bullish', result: 4.1 }] },
  { name: 'RookieFlips', platform: 'tiktok', followers: 890000, isVerified: true, tier: 'macro', avgImpactScore: 85, totalMentions: 891, accuracy: 59, recentCalls: [{ card: 'Caleb Williams RC', sentiment: 'very_bearish', result: -34.5 }, { card: 'Drake Maye RC', sentiment: 'bearish', result: -12.3 }, { card: 'Ant Edwards NT', sentiment: 'very_bullish', result: 25.2 }] },
  { name: 'Jabs Family', platform: 'youtube', followers: 520000, isVerified: true, tier: 'macro', avgImpactScore: 82, totalMentions: 234, accuracy: 71, recentCalls: [{ card: 'Caitlin Clark RC', sentiment: 'very_bullish', result: 12.4 }, { card: 'Wemby Prizm Silver', sentiment: 'bullish', result: 8.7 }, { card: '2025 Topps Chrome', sentiment: 'bullish', result: 4.2 }] },
  { name: 'SportsCardInvestor', platform: 'twitter', followers: 178000, isVerified: true, tier: 'macro', avgImpactScore: 76, totalMentions: 1245, accuracy: 68, recentCalls: [{ card: 'Luka Prizm Silver PSA 10', sentiment: 'bullish', result: 7.8 }, { card: 'Ohtani Bowman 1st', sentiment: 'bullish', result: 6.1 }, { card: 'Panini Select', sentiment: 'bearish', result: -8.4 }] },
  { name: 'Layton Sports Cards', platform: 'youtube', followers: 380000, isVerified: true, tier: 'macro', avgImpactScore: 71, totalMentions: 456, accuracy: 77, recentCalls: [{ card: '2025 Bowman Chrome', sentiment: 'bearish', result: -4.2 }, { card: 'Topps Series 1', sentiment: 'bullish', result: 3.8 }, { card: 'Bedard YG', sentiment: 'bullish', result: 11.2 }] },
  { name: 'AltInvestDaily', platform: 'twitter', followers: 320000, isVerified: true, tier: 'macro', avgImpactScore: 73, totalMentions: 890, accuracy: 81, recentCalls: [{ card: 'Market Overall', sentiment: 'very_bullish', result: 2.1 }, { card: 'Vintage Index', sentiment: 'bullish', result: 6.4 }, { card: 'Modern RC Index', sentiment: 'bullish', result: 3.2 }] },
  { name: 'TheCardfather', platform: 'twitter', followers: 210000, isVerified: true, tier: 'macro', avgImpactScore: 69, totalMentions: 678, accuracy: 72, recentCalls: [{ card: 'Bedard YG PSA 10', sentiment: 'bullish', result: 6.3 }, { card: 'Harper Bowman Auto', sentiment: 'bullish', result: 2.8 }, { card: 'Mahomes Prizm Silver', sentiment: 'bullish', result: 14.8 }] },
];

// ---- Service Functions ----

export function getTrendingTopics(): TrendingTopic[] {
  return trendingTopics;
}

export function getSocialMentions(platform?: SocialPlatform): SocialMention[] {
  if (platform) return socialMentions.filter(m => m.platform === platform);
  return socialMentions;
}

export function getInfluencerAlerts(): InfluencerAlert[] {
  return influencerAlerts;
}

export function detectViral(): ViralDetection[] {
  return viralDetections;
}

export function getNarrativeMomentum(): NarrativeMomentum[] {
  return narrativeMomentums;
}

export function getHypeScores(): HypeScore[] {
  return hypeScores.sort((a, b) => b.overallScore - a.overallScore);
}

export function getSentimentTimeline(): SentimentTimeline[] {
  return sentimentTimelines;
}

export function getTopInfluencers(): TopInfluencer[] {
  return topInfluencers.sort((a, b) => b.avgImpactScore - a.avgImpactScore);
}

export function getPlatformBreakdown(): PlatformBreakdown[] {
  const platforms: SocialPlatform[] = ['twitter', 'youtube', 'reddit', 'tiktok', 'blowout_forums', 'instagram'];
  return platforms.map(platform => {
    const mentions = socialMentions.filter(m => m.platform === platform);
    const totalEngagement = mentions.reduce((sum, m) => sum + m.engagement.likes + m.engagement.shares + m.engagement.comments, 0);
    const avgSentiment = mentions.length > 0 ? mentions.reduce((sum, m) => sum + m.sentimentScore, 0) / mentions.length : 0;
    const topAuthor = mentions.sort((a, b) => b.authorFollowers - a.authorFollowers)[0]?.author || 'N/A';
    return {
      platform,
      mentions: mentions.length,
      sentiment: Math.round(avgSentiment * 100) / 100,
      engagement: totalEngagement,
      growth: Math.round(Math.random() * 40 + 10),
      topAuthor,
    };
  });
}
