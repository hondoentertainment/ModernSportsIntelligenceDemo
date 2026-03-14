// ── Phase 134: Influencer Impact Attribution Engine ──────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────────

export type Platform = 'youtube' | 'tiktok' | 'twitter' | 'instagram' | 'twitch';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ImpactDirection = 'pump' | 'dump' | 'neutral';

export interface Influencer {
  id: string;
  name: string;
  platform: Platform;
  followers: number;
  alpha_score: number;
  reliability_score: number;
  avg_price_impact_pct: number;
  total_mentions: number;
  avatar_color: string;
  bio: string;
}

export interface ContentEvent {
  id: string;
  influencer_id: string;
  influencer_name: string;
  card_mentioned: string;
  video_url: string;
  publish_date: string;
  views: number;
  price_before: number;
  price_after_24h: number;
  price_after_7d: number;
  volume_change_pct: number;
  platform: Platform;
  title: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

export interface ImpactAnalysis {
  event_id: string;
  peak_impact_pct: number;
  peak_time_hours: number;
  reversion_pct: number;
  reversion_time_days: number;
  net_impact_7d_pct: number;
  volume_multiplier: number;
  timeline: { hours: number; price_change_pct: number }[];
}

export interface PumpDumpAlert {
  id: string;
  influencer_id: string;
  influencer_name: string;
  card_name: string;
  alert_type: 'pump_detected' | 'dump_warning' | 'accumulation_pre_mention' | 'coordinated_pump';
  severity: AlertSeverity;
  description: string;
  evidence: string[];
  detected_at: string;
  price_impact_pct: number;
}

export interface InfluencerRanking {
  influencer_id: string;
  name: string;
  platform: Platform;
  alpha_score: number;
  reliability_score: number;
  avg_impact_pct: number;
  total_events: number;
  profitable_calls_pct: number;
}

export interface AccumulationSignal {
  id: string;
  influencer_id: string;
  influencer_name: string;
  card_name: string;
  estimated_buy_date: string;
  mention_date: string;
  days_before_mention: number;
  estimated_position_size: number;
  price_at_buy: number;
  price_at_mention: number;
  confidence: number;
}

export interface MarketManipulationFlag {
  id: string;
  type: 'wash_trading' | 'coordinated_pump' | 'fake_scarcity' | 'shill_network';
  description: string;
  influencers_involved: string[];
  cards_affected: string[];
  severity: AlertSeverity;
  detected_at: string;
  evidence_strength: number;
}

export interface PlatformImpact {
  platform: Platform;
  avg_impact_pct: number;
  avg_decay_hours: number;
  total_events: number;
  most_impactful_influencer: string;
  avg_views_per_event: number;
}

export interface TrendingMention {
  card_name: string;
  mention_count_24h: number;
  influencers: string[];
  combined_reach: number;
  price_change_pct: number;
  momentum: 'accelerating' | 'stable' | 'decelerating';
}

// ── Mock Influencers ────────────────────────────────────────────────────────────

const MOCK_INFLUENCERS: Influencer[] = [
  { id: 'inf-001', name: 'CardBreaker Mike', platform: 'youtube', followers: 2400000, alpha_score: 82, reliability_score: 78, avg_price_impact_pct: 28.5, total_mentions: 340, avatar_color: 'bg-red-500', bio: 'The king of live card breaks with 2.4M subscribers. Known for calling out undervalued rookies.' },
  { id: 'inf-002', name: 'Vintage Vault TV', platform: 'youtube', followers: 1800000, alpha_score: 91, reliability_score: 88, avg_price_impact_pct: 22.3, total_mentions: 210, avatar_color: 'bg-amber-500', bio: 'Premium vintage card content. Highest reliability score among YouTube creators.' },
  { id: 'inf-003', name: 'Grading Room', platform: 'youtube', followers: 950000, alpha_score: 76, reliability_score: 82, avg_price_impact_pct: 18.7, total_mentions: 180, avatar_color: 'bg-blue-500', bio: 'Grading advice and PSA submission walkthroughs. Trusted for grading market insights.' },
  { id: 'inf-004', name: 'RipCity Cards', platform: 'tiktok', followers: 3200000, alpha_score: 45, reliability_score: 35, avg_price_impact_pct: 38.2, total_mentions: 520, avatar_color: 'bg-pink-500', bio: 'Viral TikTok card content. High impact but low reliability — classic pump-and-hype style.' },
  { id: 'inf-005', name: 'SportsCardsNonStop', platform: 'tiktok', followers: 2100000, alpha_score: 52, reliability_score: 42, avg_price_impact_pct: 31.4, total_mentions: 410, avatar_color: 'bg-violet-500', bio: 'Fast-paced TikTok card reviews. Frequent "STEAL" and "BUY NOW" language drives spikes.' },
  { id: 'inf-006', name: 'Card Market Edge', platform: 'twitter', followers: 680000, alpha_score: 88, reliability_score: 85, avg_price_impact_pct: 15.2, total_mentions: 890, avatar_color: 'bg-sky-500', bio: 'Data-driven card market analysis on Twitter/X. Institutional-grade insights.' },
  { id: 'inf-007', name: 'Eric Whiteback', platform: 'twitter', followers: 420000, alpha_score: 85, reliability_score: 90, avg_price_impact_pct: 12.8, total_mentions: 640, avatar_color: 'bg-emerald-500', bio: 'Veteran card market analyst. Highest reliability score in the ecosystem.' },
  { id: 'inf-008', name: 'GemMint10', platform: 'instagram', followers: 1500000, alpha_score: 68, reliability_score: 62, avg_price_impact_pct: 20.1, total_mentions: 290, avatar_color: 'bg-orange-500', bio: 'Instagram showcase of PSA 10 and BGS 9.5 slabs. Visual-first content drives aspirational buying.' },
  { id: 'inf-009', name: 'HoopsHype Cards', platform: 'instagram', followers: 890000, alpha_score: 72, reliability_score: 70, avg_price_impact_pct: 16.5, total_mentions: 250, avatar_color: 'bg-indigo-500', bio: 'Basketball card specialist. Strong following among NBA fans crossing into the hobby.' },
  { id: 'inf-010', name: 'PackManPaul', platform: 'twitch', followers: 560000, alpha_score: 58, reliability_score: 55, avg_price_impact_pct: 24.8, total_mentions: 180, avatar_color: 'bg-purple-500', bio: 'Live Twitch breaks and rips. Real-time audience creates immediate buying pressure.' },
  { id: 'inf-011', name: 'Wax Museum Al', platform: 'youtube', followers: 720000, alpha_score: 74, reliability_score: 76, avg_price_impact_pct: 19.4, total_mentions: 160, avatar_color: 'bg-teal-500', bio: 'Deep dives into wax-era and junk-era cards. Niche but highly engaged audience.' },
  { id: 'inf-012', name: 'CardClinic Joe', platform: 'tiktok', followers: 1400000, alpha_score: 48, reliability_score: 40, avg_price_impact_pct: 29.6, total_mentions: 380, avatar_color: 'bg-rose-500', bio: 'TikTok card flipping content. High entertainment value, questionable financial advice.' },
  { id: 'inf-013', name: 'Diamond Dealer Dex', platform: 'twitter', followers: 310000, alpha_score: 80, reliability_score: 78, avg_price_impact_pct: 11.5, total_mentions: 520, avatar_color: 'bg-cyan-500', bio: 'Twitter thread king for card market analysis. Specializes in arbitrage opportunities.' },
  { id: 'inf-014', name: 'SlabQueenSarah', platform: 'instagram', followers: 1100000, alpha_score: 65, reliability_score: 60, avg_price_impact_pct: 17.8, total_mentions: 220, avatar_color: 'bg-fuchsia-500', bio: 'Lifestyle meets card collecting. Brings new demographics into the hobby.' },
  { id: 'inf-015', name: 'TurboBreaks Dan', platform: 'twitch', followers: 380000, alpha_score: 55, reliability_score: 52, avg_price_impact_pct: 21.3, total_mentions: 140, avatar_color: 'bg-lime-500', bio: 'High-energy Twitch breaker. Marathon streams create extended buying windows.' },
];

// ── Mock Content Events ─────────────────────────────────────────────────────────

const MOCK_CONTENT_EVENTS: ContentEvent[] = [
  { id: 'evt-001', influencer_id: 'inf-001', influencer_name: 'CardBreaker Mike', card_mentioned: '2023 Prizm Silver Wembanyama RC', video_url: 'https://youtube.com/watch?v=example1', publish_date: '2026-03-12T14:00:00Z', views: 1200000, price_before: 840, price_after_24h: 1020, price_after_7d: 940, volume_change_pct: 285, platform: 'youtube', title: 'Why Wemby Prizm Silver is THE Card of 2026', sentiment: 'bullish' },
  { id: 'evt-002', influencer_id: 'inf-004', influencer_name: 'RipCity Cards', card_mentioned: '2024 Optic Caleb Williams RC', video_url: 'https://tiktok.com/@ripcity/example2', publish_date: '2026-03-12T15:30:00Z', views: 1800000, price_before: 180, price_after_24h: 260, price_after_7d: 215, volume_change_pct: 420, platform: 'tiktok', title: 'This Rookie Card is a STEAL at $180!! 🔥', sentiment: 'bullish' },
  { id: 'evt-003', influencer_id: 'inf-006', influencer_name: 'Card Market Edge', card_mentioned: '2022 Bowman Chrome 1st Jackson Holliday', video_url: 'https://twitter.com/cardmarketedge/status/example3', publish_date: '2026-03-11T10:00:00Z', views: 320000, price_before: 295, price_after_24h: 340, price_after_7d: 375, volume_change_pct: 145, platform: 'twitter', title: 'Thread: Holliday BC 1st undervalued by 35% based on comp analysis', sentiment: 'bullish' },
  { id: 'evt-004', influencer_id: 'inf-005', influencer_name: 'SportsCardsNonStop', card_mentioned: '2017 Prizm Jaylen Brown RC', video_url: 'https://tiktok.com/@scns/example4', publish_date: '2026-03-13T08:00:00Z', views: 3200000, price_before: 420, price_after_24h: 380, price_after_7d: 365, volume_change_pct: 180, platform: 'tiktok', title: 'SELL THIS CARD NOW Before It TANKS 📉', sentiment: 'bearish' },
  { id: 'evt-005', influencer_id: 'inf-002', influencer_name: 'Vintage Vault TV', card_mentioned: '2018 Bowman Chrome Shohei Ohtani RC', video_url: 'https://youtube.com/watch?v=example5', publish_date: '2026-03-10T12:00:00Z', views: 890000, price_before: 4500, price_after_24h: 5100, price_after_7d: 4800, volume_change_pct: 95, platform: 'youtube', title: 'Ohtani Bowman Chrome: The $10K Card in 2027?', sentiment: 'bullish' },
  { id: 'evt-006', influencer_id: 'inf-008', influencer_name: 'GemMint10', card_mentioned: '2023 Topps Chrome Lamine Yamal RC', video_url: 'https://instagram.com/p/example6', publish_date: '2026-03-12T10:00:00Z', views: 540000, price_before: 1200, price_after_24h: 1420, price_after_7d: 1380, volume_change_pct: 210, platform: 'instagram', title: 'PSA 10 Yamal Topps Chrome — Soccer GOAT in the Making', sentiment: 'bullish' },
  { id: 'evt-007', influencer_id: 'inf-007', influencer_name: 'Eric Whiteback', card_mentioned: '2020 Prizm Anthony Edwards RC', video_url: 'https://twitter.com/ericwhiteback/status/example7', publish_date: '2026-03-12T18:00:00Z', views: 210000, price_before: 1100, price_after_24h: 1250, price_after_7d: 1220, volume_change_pct: 88, platform: 'twitter', title: 'Edwards Prizm: On-court performance supports 25%+ upside from here', sentiment: 'bullish' },
  { id: 'evt-008', influencer_id: 'inf-010', influencer_name: 'PackManPaul', card_mentioned: '2024 Bowman Chrome 1st Roki Sasaki', video_url: 'https://twitch.tv/packmanpaul/example8', publish_date: '2026-03-13T20:00:00Z', views: 85000, price_before: 260, price_after_24h: 315, price_after_7d: 290, volume_change_pct: 175, platform: 'twitch', title: 'LIVE BREAK: Sasaki Bowman Chrome 1st Pull + Market Analysis', sentiment: 'bullish' },
  { id: 'evt-009', influencer_id: 'inf-012', influencer_name: 'CardClinic Joe', card_mentioned: '2024 Optic Caleb Williams RC', video_url: 'https://tiktok.com/@cardclinic/example9', publish_date: '2026-03-13T11:00:00Z', views: 2400000, price_before: 230, price_after_24h: 260, price_after_7d: 220, volume_change_pct: 350, platform: 'tiktok', title: 'Caleb Williams is the NEXT MAHOMES — Buy Buy Buy! 🚀', sentiment: 'bullish' },
  { id: 'evt-010', influencer_id: 'inf-003', influencer_name: 'Grading Room', card_mentioned: '2018 Bowman Chrome Shohei Ohtani RC', video_url: 'https://youtube.com/watch?v=example10', publish_date: '2026-03-11T16:00:00Z', views: 420000, price_before: 4650, price_after_24h: 4800, price_after_7d: 4750, volume_change_pct: 65, platform: 'youtube', title: 'Should You Grade Your Raw Ohtani? PSA vs BGS Economics Breakdown', sentiment: 'bullish' },
  { id: 'evt-011', influencer_id: 'inf-009', influencer_name: 'HoopsHype Cards', card_mentioned: '2020 Prizm Anthony Edwards RC', video_url: 'https://instagram.com/p/example11', publish_date: '2026-03-12T19:00:00Z', views: 210000, price_before: 1150, price_after_24h: 1250, price_after_7d: 1210, volume_change_pct: 120, platform: 'instagram', title: 'Ant-Man is Having an MVP Season — His Cards Should Reflect That', sentiment: 'bullish' },
  { id: 'evt-012', influencer_id: 'inf-013', influencer_name: 'Diamond Dealer Dex', card_mentioned: '2012 Topps Chrome Bryce Harper RC', video_url: 'https://twitter.com/diamonddealerdex/status/example12', publish_date: '2026-03-10T14:00:00Z', views: 155000, price_before: 720, price_after_24h: 690, price_after_7d: 680, volume_change_pct: 45, platform: 'twitter', title: 'Harper Chrome — nice card but overpriced at $720. Fair value is $620.', sentiment: 'bearish' },
  { id: 'evt-013', influencer_id: 'inf-001', influencer_name: 'CardBreaker Mike', card_mentioned: '2024 Bowman Chrome 1st Roki Sasaki', video_url: 'https://youtube.com/watch?v=example13', publish_date: '2026-03-09T15:00:00Z', views: 780000, price_before: 220, price_after_24h: 275, price_after_7d: 260, volume_change_pct: 230, platform: 'youtube', title: 'Roki Sasaki: The Japanese Phenom Card You NEED', sentiment: 'bullish' },
  { id: 'evt-014', influencer_id: 'inf-014', influencer_name: 'SlabQueenSarah', card_mentioned: '2023 Topps Chrome Lamine Yamal RC', video_url: 'https://instagram.com/p/example14', publish_date: '2026-03-11T13:00:00Z', views: 480000, price_before: 1150, price_after_24h: 1280, price_after_7d: 1350, volume_change_pct: 165, platform: 'instagram', title: 'Added this beauty to my PC — Yamal is generational 🌟', sentiment: 'bullish' },
  { id: 'evt-015', influencer_id: 'inf-004', influencer_name: 'RipCity Cards', card_mentioned: '2023 Prizm Silver Wembanyama RC', video_url: 'https://tiktok.com/@ripcity/example15', publish_date: '2026-03-11T09:00:00Z', views: 2600000, price_before: 780, price_after_24h: 920, price_after_7d: 870, volume_change_pct: 380, platform: 'tiktok', title: 'WEMBY IS GOING TO $2000!! 📈🔥 Get In NOW!!', sentiment: 'bullish' },
  { id: 'evt-016', influencer_id: 'inf-011', influencer_name: 'Wax Museum Al', card_mentioned: '1989 Upper Deck Ken Griffey Jr RC', video_url: 'https://youtube.com/watch?v=example16', publish_date: '2026-03-08T11:00:00Z', views: 340000, price_before: 185, price_after_24h: 210, price_after_7d: 205, volume_change_pct: 80, platform: 'youtube', title: 'Griffey Upper Deck: Still the King of Junk Wax', sentiment: 'bullish' },
  { id: 'evt-017', influencer_id: 'inf-006', influencer_name: 'Card Market Edge', card_mentioned: '2017 Prizm Silver Patrick Mahomes RC', video_url: 'https://twitter.com/cardmarketedge/status/example17', publish_date: '2026-03-13T07:00:00Z', views: 280000, price_before: 8200, price_after_24h: 8600, price_after_7d: 8450, volume_change_pct: 55, platform: 'twitter', title: 'Mahomes Prizm Silver: Data shows institutional accumulation phase beginning', sentiment: 'bullish' },
  { id: 'evt-018', influencer_id: 'inf-015', influencer_name: 'TurboBreaks Dan', card_mentioned: '2024 Optic Caleb Williams RC', video_url: 'https://twitch.tv/turbobreaks/example18', publish_date: '2026-03-13T21:00:00Z', views: 42000, price_before: 245, price_after_24h: 260, price_after_7d: 235, volume_change_pct: 95, platform: 'twitch', title: 'Marathon Break Night — Caleb Williams Optic Hunting', sentiment: 'bullish' },
  { id: 'evt-019', influencer_id: 'inf-002', influencer_name: 'Vintage Vault TV', card_mentioned: '1986 Fleer Michael Jordan RC', video_url: 'https://youtube.com/watch?v=example19', publish_date: '2026-03-07T14:00:00Z', views: 1400000, price_before: 32000, price_after_24h: 33500, price_after_7d: 33200, volume_change_pct: 40, platform: 'youtube', title: 'The Jordan Fleer: Why It Will Never Be Cheap Again', sentiment: 'bullish' },
  { id: 'evt-020', influencer_id: 'inf-005', influencer_name: 'SportsCardsNonStop', card_mentioned: '2023 Prizm Silver Wembanyama RC', video_url: 'https://tiktok.com/@scns/example20', publish_date: '2026-03-13T12:00:00Z', views: 1900000, price_before: 910, price_after_24h: 980, price_after_7d: 940, volume_change_pct: 290, platform: 'tiktok', title: 'WEMBY PRIZM SILVER — Last Chance Under $1000!! 🏀', sentiment: 'bullish' },
  { id: 'evt-021', influencer_id: 'inf-001', influencer_name: 'CardBreaker Mike', card_mentioned: '2022 Bowman Chrome 1st Jackson Holliday', video_url: 'https://youtube.com/watch?v=example21', publish_date: '2026-03-13T16:00:00Z', views: 650000, price_before: 340, price_after_24h: 375, price_after_7d: 370, volume_change_pct: 160, platform: 'youtube', title: 'Holliday BC 1st: MLB Season Preview + Card Market Outlook', sentiment: 'bullish' },
  { id: 'evt-022', influencer_id: 'inf-012', influencer_name: 'CardClinic Joe', card_mentioned: '2017 Prizm Jaylen Brown RC', video_url: 'https://tiktok.com/@cardclinic/example22', publish_date: '2026-03-12T20:00:00Z', views: 1100000, price_before: 410, price_after_24h: 395, price_after_7d: 380, volume_change_pct: 140, platform: 'tiktok', title: 'Brown Prizm Crashing — Should You Panic Sell? 😱', sentiment: 'bearish' },
  { id: 'evt-023', influencer_id: 'inf-007', influencer_name: 'Eric Whiteback', card_mentioned: '2023 Topps Chrome Lamine Yamal RC', video_url: 'https://twitter.com/ericwhiteback/status/example23', publish_date: '2026-03-13T09:00:00Z', views: 185000, price_before: 1350, price_after_24h: 1420, price_after_7d: 1400, volume_change_pct: 75, platform: 'twitter', title: 'Yamal Chrome: European soccer market underpriced vs basketball comparables. Thread.', sentiment: 'bullish' },
  { id: 'evt-024', influencer_id: 'inf-008', influencer_name: 'GemMint10', card_mentioned: '2020 Prizm Anthony Edwards RC', video_url: 'https://instagram.com/p/example24', publish_date: '2026-03-11T15:00:00Z', views: 380000, price_before: 1080, price_after_24h: 1150, price_after_7d: 1200, volume_change_pct: 110, platform: 'instagram', title: 'This PSA 10 Edwards Prizm is a thing of beauty 💎', sentiment: 'bullish' },
  { id: 'evt-025', influencer_id: 'inf-004', influencer_name: 'RipCity Cards', card_mentioned: '2024 Bowman Chrome 1st Roki Sasaki', video_url: 'https://tiktok.com/@ripcity/example25', publish_date: '2026-03-12T17:00:00Z', views: 2100000, price_before: 250, price_after_24h: 310, price_after_7d: 275, volume_change_pct: 340, platform: 'tiktok', title: 'SASAKI IS THE NEXT OHTANI!! 🇯🇵🔥 This Card Will 10x!!', sentiment: 'bullish' },
  { id: 'evt-026', influencer_id: 'inf-013', influencer_name: 'Diamond Dealer Dex', card_mentioned: '2022 Bowman Chrome 1st Jackson Holliday', video_url: 'https://twitter.com/diamonddealerdex/status/example26', publish_date: '2026-03-12T08:00:00Z', views: 140000, price_before: 310, price_after_24h: 335, price_after_7d: 360, volume_change_pct: 65, platform: 'twitter', title: 'Holliday comps suggest $400+ fair value. Accumulating here.', sentiment: 'bullish' },
  { id: 'evt-027', influencer_id: 'inf-003', influencer_name: 'Grading Room', card_mentioned: '2023 Prizm Silver Wembanyama RC', video_url: 'https://youtube.com/watch?v=example27', publish_date: '2026-03-13T14:00:00Z', views: 520000, price_before: 940, price_after_24h: 960, price_after_7d: 950, volume_change_pct: 85, platform: 'youtube', title: 'Grading Your Wemby Prizm Silver — PSA 10 Premium Analysis', sentiment: 'bullish' },
  { id: 'evt-028', influencer_id: 'inf-009', influencer_name: 'HoopsHype Cards', card_mentioned: '2023 Prizm Silver Wembanyama RC', video_url: 'https://instagram.com/p/example28', publish_date: '2026-03-12T11:00:00Z', views: 290000, price_before: 860, price_after_24h: 910, price_after_7d: 920, volume_change_pct: 125, platform: 'instagram', title: 'Wemby Week: The cards every basketball collector needs', sentiment: 'bullish' },
  { id: 'evt-029', influencer_id: 'inf-010', influencer_name: 'PackManPaul', card_mentioned: '2023 Topps Chrome Lamine Yamal RC', video_url: 'https://twitch.tv/packmanpaul/example29', publish_date: '2026-03-10T22:00:00Z', views: 65000, price_before: 1100, price_after_24h: 1180, price_after_7d: 1200, volume_change_pct: 90, platform: 'twitch', title: 'LIVE: Topps Chrome Soccer Box Break — Yamal Hunt!', sentiment: 'bullish' },
  { id: 'evt-030', influencer_id: 'inf-014', influencer_name: 'SlabQueenSarah', card_mentioned: '2024 Optic Caleb Williams RC', video_url: 'https://instagram.com/p/example30', publish_date: '2026-03-11T18:00:00Z', views: 350000, price_before: 195, price_after_24h: 220, price_after_7d: 210, volume_change_pct: 135, platform: 'instagram', title: 'Adding some football to the PC — Caleb Williams Optic 🏈', sentiment: 'bullish' },
  { id: 'evt-031', influencer_id: 'inf-011', influencer_name: 'Wax Museum Al', card_mentioned: '1993 SP Derek Jeter RC', video_url: 'https://youtube.com/watch?v=example31', publish_date: '2026-03-09T13:00:00Z', views: 280000, price_before: 4200, price_after_24h: 4500, price_after_7d: 4400, volume_change_pct: 55, platform: 'youtube', title: 'Jeter SP: The Most Iconic Modern Vintage Card', sentiment: 'bullish' },
  { id: 'evt-032', influencer_id: 'inf-015', influencer_name: 'TurboBreaks Dan', card_mentioned: '2020 Prizm Anthony Edwards RC', video_url: 'https://twitch.tv/turbobreaks/example32', publish_date: '2026-03-13T23:00:00Z', views: 35000, price_before: 1200, price_after_24h: 1240, price_after_7d: 1220, volume_change_pct: 45, platform: 'twitch', title: 'Late Night Prizm Basketball Rip — Edwards Hit!', sentiment: 'bullish' },
  { id: 'evt-033', influencer_id: 'inf-006', influencer_name: 'Card Market Edge', card_mentioned: '2024 Optic Caleb Williams RC', video_url: 'https://twitter.com/cardmarketedge/status/example33', publish_date: '2026-03-13T13:00:00Z', views: 240000, price_before: 250, price_after_24h: 255, price_after_7d: 240, volume_change_pct: 35, platform: 'twitter', title: 'Williams Optic: Overheated. Fair value is $190-$210 based on comp data. Wait for reversion.', sentiment: 'bearish' },
  { id: 'evt-034', influencer_id: 'inf-002', influencer_name: 'Vintage Vault TV', card_mentioned: '1952 Topps Mickey Mantle', video_url: 'https://youtube.com/watch?v=example34', publish_date: '2026-03-06T10:00:00Z', views: 1100000, price_before: 180000, price_after_24h: 185000, price_after_7d: 184000, volume_change_pct: 15, platform: 'youtube', title: 'The Holy Grail: Why the 52 Mantle Will Hit $500K', sentiment: 'bullish' },
  { id: 'evt-035', influencer_id: 'inf-001', influencer_name: 'CardBreaker Mike', card_mentioned: '2020 Prizm Anthony Edwards RC', video_url: 'https://youtube.com/watch?v=example35', publish_date: '2026-03-11T20:00:00Z', views: 920000, price_before: 1050, price_after_24h: 1150, price_after_7d: 1180, volume_change_pct: 155, platform: 'youtube', title: 'Edwards Prizm: My #1 Basketball Buy Right Now', sentiment: 'bullish' },
  { id: 'evt-036', influencer_id: 'inf-005', influencer_name: 'SportsCardsNonStop', card_mentioned: '2024 Bowman Chrome 1st Roki Sasaki', video_url: 'https://tiktok.com/@scns/example36', publish_date: '2026-03-13T15:00:00Z', views: 1600000, price_before: 290, price_after_24h: 320, price_after_7d: 300, volume_change_pct: 260, platform: 'tiktok', title: 'SASAKI BC 1st — Why Everyone Is Buying This Card RIGHT NOW 🔥', sentiment: 'bullish' },
  { id: 'evt-037', influencer_id: 'inf-012', influencer_name: 'CardClinic Joe', card_mentioned: '2023 Prizm Silver Wembanyama RC', video_url: 'https://tiktok.com/@cardclinic/example37', publish_date: '2026-03-12T22:00:00Z', views: 1300000, price_before: 900, price_after_24h: 950, price_after_7d: 935, volume_change_pct: 195, platform: 'tiktok', title: 'I Just Bought 5 Wemby Prizm Silvers — Here\'s Why 🤑', sentiment: 'bullish' },
  { id: 'evt-038', influencer_id: 'inf-007', influencer_name: 'Eric Whiteback', card_mentioned: '2012 Topps Chrome Bryce Harper RC', video_url: 'https://twitter.com/ericwhiteback/status/example38', publish_date: '2026-03-09T11:00:00Z', views: 170000, price_before: 730, price_after_24h: 710, price_after_7d: 680, volume_change_pct: 30, platform: 'twitter', title: 'Harper Chrome showing distribution pattern. Smart money exiting. Target: $600-$650.', sentiment: 'bearish' },
  { id: 'evt-039', influencer_id: 'inf-008', influencer_name: 'GemMint10', card_mentioned: '2017 Prizm Silver Patrick Mahomes RC', video_url: 'https://instagram.com/p/example39', publish_date: '2026-03-12T14:00:00Z', views: 620000, price_before: 8000, price_after_24h: 8200, price_after_7d: 8400, volume_change_pct: 50, platform: 'instagram', title: 'The crown jewel of my football collection — Mahomes Prizm Silver PSA 10 👑', sentiment: 'bullish' },
  { id: 'evt-040', influencer_id: 'inf-004', influencer_name: 'RipCity Cards', card_mentioned: '2017 Prizm Jaylen Brown RC', video_url: 'https://tiktok.com/@ripcity/example40', publish_date: '2026-03-13T10:00:00Z', views: 2200000, price_before: 400, price_after_24h: 385, price_after_7d: 370, volume_change_pct: 310, platform: 'tiktok', title: 'JAYLEN BROWN — I\'m OUT. Here\'s Why You Should Be Too 👋', sentiment: 'bearish' },
];

// ── Mock Pump & Dump Alerts ─────────────────────────────────────────────────────

const MOCK_PUMP_DUMP_ALERTS: PumpDumpAlert[] = [
  {
    id: 'pda-001', influencer_id: 'inf-004', influencer_name: 'RipCity Cards',
    card_name: '2024 Optic Caleb Williams RC', alert_type: 'pump_detected', severity: 'critical',
    description: 'RipCity Cards TikTok drove a 44% spike with classic pump language. 65% reversion expected within 24h.',
    evidence: ['Used "STEAL" and "BUY NOW" language', 'Price spiked 44% within 4 hours of posting', 'Historical pattern: 72% of RipCity pumps revert 50%+ within 48h', 'Similar Stroud pump in January reverted 61%'],
    detected_at: '2026-03-12T19:30:00Z', price_impact_pct: 44.4,
  },
  {
    id: 'pda-002', influencer_id: 'inf-012', influencer_name: 'CardClinic Joe',
    card_name: '2024 Optic Caleb Williams RC', alert_type: 'coordinated_pump', severity: 'high',
    description: 'CardClinic Joe posted a follow-up pump on the same card within 20 hours of RipCity Cards. Possible coordination.',
    evidence: ['Two major TikTok accounts pumped the same card within 20h', 'Combined reach: 4.2M views', 'Both used nearly identical bullish language', 'Unusual pattern — these accounts rarely overlap on the same card'],
    detected_at: '2026-03-13T11:30:00Z', price_impact_pct: 13.0,
  },
  {
    id: 'pda-003', influencer_id: 'inf-004', influencer_name: 'RipCity Cards',
    card_name: '2024 Bowman Chrome 1st Roki Sasaki', alert_type: 'accumulation_pre_mention', severity: 'high',
    description: 'Market data suggests RipCity Cards accumulated Sasaki BC 1st positions 5 days before their viral TikTok.',
    evidence: ['Unusual buy volume from linked accounts 5 days prior', 'Price crept up 8% before the TikTok', 'Historical pattern: RipCity has done this 4 times in 6 months', 'Estimated position: 15-20 copies at avg $240'],
    detected_at: '2026-03-12T20:00:00Z', price_impact_pct: 24.0,
  },
  {
    id: 'pda-004', influencer_id: 'inf-005', influencer_name: 'SportsCardsNonStop',
    card_name: '2023 Prizm Silver Wembanyama RC', alert_type: 'pump_detected', severity: 'medium',
    description: 'SportsCardsNonStop posted a Wemby pump TikTok with urgency language. Moderate reversion risk.',
    evidence: ['"Last Chance Under $1000" urgency framing', 'Price impact: +7.7% within 6 hours', 'This influencer has a 42% reliability score', 'Avg reversion from SCNS pumps: 48% within 7 days'],
    detected_at: '2026-03-13T15:00:00Z', price_impact_pct: 7.7,
  },
  {
    id: 'pda-005', influencer_id: 'inf-012', influencer_name: 'CardClinic Joe',
    card_name: '2023 Prizm Silver Wembanyama RC', alert_type: 'accumulation_pre_mention', severity: 'medium',
    description: 'CardClinic Joe\'s TikTok claimed to have "just bought 5 copies" — market data suggests the buys occurred 3 days earlier.',
    evidence: ['Claimed "just bought" in video but buys detected 3 days prior', 'Average buy price ~$860 vs $900 at time of posting', 'Pattern consistent with previous accumulation-then-shill behavior'],
    detected_at: '2026-03-13T01:00:00Z', price_impact_pct: 5.6,
  },
];

// ── Mock Accumulation Signals ───────────────────────────────────────────────────

const MOCK_ACCUMULATION_SIGNALS: AccumulationSignal[] = [
  { id: 'acc-001', influencer_id: 'inf-004', influencer_name: 'RipCity Cards', card_name: '2024 Bowman Chrome 1st Roki Sasaki', estimated_buy_date: '2026-03-07T00:00:00Z', mention_date: '2026-03-12T17:00:00Z', days_before_mention: 5, estimated_position_size: 4200, price_at_buy: 240, price_at_mention: 310, confidence: 85 },
  { id: 'acc-002', influencer_id: 'inf-012', influencer_name: 'CardClinic Joe', card_name: '2023 Prizm Silver Wembanyama RC', estimated_buy_date: '2026-03-09T00:00:00Z', mention_date: '2026-03-12T22:00:00Z', days_before_mention: 3, estimated_position_size: 4300, price_at_buy: 860, price_at_mention: 900, confidence: 72 },
  { id: 'acc-003', influencer_id: 'inf-004', influencer_name: 'RipCity Cards', card_name: '2024 Optic Caleb Williams RC', estimated_buy_date: '2026-03-09T00:00:00Z', mention_date: '2026-03-12T15:30:00Z', days_before_mention: 3, estimated_position_size: 2800, price_at_buy: 170, price_at_mention: 180, confidence: 78 },
  { id: 'acc-004', influencer_id: 'inf-005', influencer_name: 'SportsCardsNonStop', card_name: '2024 Bowman Chrome 1st Roki Sasaki', estimated_buy_date: '2026-03-10T00:00:00Z', mention_date: '2026-03-13T15:00:00Z', days_before_mention: 3, estimated_position_size: 1800, price_at_buy: 265, price_at_mention: 290, confidence: 65 },
];

// ── Mock Market Manipulation Flags ──────────────────────────────────────────────

const MOCK_MANIPULATION_FLAGS: MarketManipulationFlag[] = [
  { id: 'mmf-001', type: 'coordinated_pump', description: 'RipCity Cards and CardClinic Joe both pumped Caleb Williams Optic within a 20-hour window. Combined reach: 4.2M views.', influencers_involved: ['RipCity Cards', 'CardClinic Joe'], cards_affected: ['2024 Optic Caleb Williams RC'], severity: 'high', detected_at: '2026-03-13T12:00:00Z', evidence_strength: 78 },
  { id: 'mmf-002', type: 'shill_network', description: 'Three TikTok accounts with overlapping follower bases all mentioned the same card within 48 hours using similar language.', influencers_involved: ['RipCity Cards', 'SportsCardsNonStop', 'CardClinic Joe'], cards_affected: ['2024 Bowman Chrome 1st Roki Sasaki'], severity: 'medium', detected_at: '2026-03-13T18:00:00Z', evidence_strength: 62 },
  { id: 'mmf-003', type: 'fake_scarcity', description: 'Multiple listings pulled from eBay before influencer mention, creating artificial scarcity signal.', influencers_involved: ['RipCity Cards'], cards_affected: ['2023 Prizm Silver Wembanyama RC'], severity: 'medium', detected_at: '2026-03-11T10:00:00Z', evidence_strength: 55 },
];

// ── Mock Platform Impact Data ───────────────────────────────────────────────────

const MOCK_PLATFORM_IMPACT: PlatformImpact[] = [
  { platform: 'youtube', avg_impact_pct: 21.5, avg_decay_hours: 72, total_events: 890, most_impactful_influencer: 'CardBreaker Mike', avg_views_per_event: 680000 },
  { platform: 'tiktok', avg_impact_pct: 32.8, avg_decay_hours: 36, total_events: 1310, most_impactful_influencer: 'RipCity Cards', avg_views_per_event: 1900000 },
  { platform: 'twitter', avg_impact_pct: 13.4, avg_decay_hours: 120, total_events: 2050, most_impactful_influencer: 'Card Market Edge', avg_views_per_event: 220000 },
  { platform: 'instagram', avg_impact_pct: 18.2, avg_decay_hours: 48, total_events: 760, most_impactful_influencer: 'GemMint10', avg_views_per_event: 420000 },
  { platform: 'twitch', avg_impact_pct: 22.8, avg_decay_hours: 24, total_events: 320, most_impactful_influencer: 'PackManPaul', avg_views_per_event: 55000 },
];

// ── Mock Trending Mentions ──────────────────────────────────────────────────────

const MOCK_TRENDING_MENTIONS: TrendingMention[] = [
  { card_name: '2023 Prizm Silver Wembanyama RC', mention_count_24h: 8, influencers: ['CardBreaker Mike', 'RipCity Cards', 'SportsCardsNonStop', 'Grading Room', 'HoopsHype Cards'], combined_reach: 7800000, price_change_pct: 11.9, momentum: 'accelerating' },
  { card_name: '2024 Optic Caleb Williams RC', mention_count_24h: 5, influencers: ['RipCity Cards', 'CardClinic Joe', 'Card Market Edge', 'TurboBreaks Dan'], combined_reach: 4700000, price_change_pct: 44.4, momentum: 'decelerating' },
  { card_name: '2024 Bowman Chrome 1st Roki Sasaki', mention_count_24h: 4, influencers: ['CardBreaker Mike', 'RipCity Cards', 'PackManPaul', 'SportsCardsNonStop'], combined_reach: 4600000, price_change_pct: 21.2, momentum: 'stable' },
  { card_name: '2020 Prizm Anthony Edwards RC', mention_count_24h: 4, influencers: ['CardBreaker Mike', 'HoopsHype Cards', 'GemMint10', 'TurboBreaks Dan'], combined_reach: 1750000, price_change_pct: 13.6, momentum: 'accelerating' },
  { card_name: '2023 Topps Chrome Lamine Yamal RC', mention_count_24h: 3, influencers: ['GemMint10', 'Eric Whiteback', 'SlabQueenSarah'], combined_reach: 1600000, price_change_pct: 18.3, momentum: 'stable' },
];

// ── Helper Functions ─────────────────────────────────────────────────────────────

function platformLabel(platform: Platform): string {
  const map: Record<Platform, string> = {
    youtube: 'YouTube',
    tiktok: 'TikTok',
    twitter: 'Twitter/X',
    instagram: 'Instagram',
    twitch: 'Twitch',
  };
  return map[platform];
}

function platformColor(platform: Platform): string {
  const map: Record<Platform, string> = {
    youtube: 'text-red-400',
    tiktok: 'text-pink-400',
    twitter: 'text-sky-400',
    instagram: 'text-orange-400',
    twitch: 'text-purple-400',
  };
  return map[platform];
}

function platformBadgeColor(platform: Platform): string {
  const map: Record<Platform, string> = {
    youtube: 'bg-red-500/20 text-red-400 border-red-500/40',
    tiktok: 'bg-pink-500/20 text-pink-400 border-pink-500/40',
    twitter: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
    instagram: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    twitch: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  };
  return map[platform];
}

function severityBadgeColor(severity: AlertSeverity): string {
  const map: Record<AlertSeverity, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/40',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  };
  return map[severity];
}

function formatFollowers(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

function formatViews(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

function momentumColor(momentum: 'accelerating' | 'stable' | 'decelerating'): string {
  const map = { accelerating: 'text-emerald-400', stable: 'text-amber-400', decelerating: 'text-red-400' };
  return map[momentum];
}

// ── Public API ───────────────────────────────────────────────────────────────────

/** Get top influencers sorted by alpha score */
export function getTopInfluencers(): Influencer[] {
  return [...MOCK_INFLUENCERS].sort((a, b) => b.alpha_score - a.alpha_score);
}

/** Get full influencer profile by ID */
export function getInfluencerProfile(id: string): Influencer | null {
  return MOCK_INFLUENCERS.find(i => i.id === id) ?? null;
}

/** Get content events with optional filters */
export function getContentEvents(filters?: { influencer_id?: string; card?: string; platform?: Platform; limit?: number }): ContentEvent[] {
  let events = [...MOCK_CONTENT_EVENTS].sort(
    (a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
  );
  if (filters?.influencer_id) events = events.filter(e => e.influencer_id === filters.influencer_id);
  if (filters?.card) events = events.filter(e => e.card_mentioned.toLowerCase().includes(filters.card!.toLowerCase()));
  if (filters?.platform) events = events.filter(e => e.platform === filters.platform);
  if (filters?.limit) events = events.slice(0, filters.limit);
  return events;
}

/** Measure impact of a specific content event */
export function measureImpact(eventId: string): ImpactAnalysis | null {
  const event = MOCK_CONTENT_EVENTS.find(e => e.id === eventId);
  if (!event) return null;

  const impact24h = ((event.price_after_24h - event.price_before) / event.price_before) * 100;
  const impact7d = ((event.price_after_7d - event.price_before) / event.price_before) * 100;
  const peakImpact = impact24h * 1.3;
  const reversion = peakImpact - impact7d;

  return {
    event_id: eventId,
    peak_impact_pct: Math.round(peakImpact * 100) / 100,
    peak_time_hours: event.platform === 'tiktok' ? 6 : event.platform === 'twitch' ? 3 : 18,
    reversion_pct: Math.round(reversion * 100) / 100,
    reversion_time_days: event.platform === 'tiktok' ? 5 : event.platform === 'twitter' ? 10 : 7,
    net_impact_7d_pct: Math.round(impact7d * 100) / 100,
    volume_multiplier: Math.round(event.volume_change_pct / 100 * 10) / 10,
    timeline: [
      { hours: 0, price_change_pct: 0 },
      { hours: 2, price_change_pct: Math.round(peakImpact * 0.4 * 100) / 100 },
      { hours: 6, price_change_pct: Math.round(peakImpact * 0.85 * 100) / 100 },
      { hours: 12, price_change_pct: Math.round(peakImpact * 100) / 100 },
      { hours: 24, price_change_pct: Math.round(impact24h * 100) / 100 },
      { hours: 48, price_change_pct: Math.round((impact24h + impact7d) / 2 * 100) / 100 },
      { hours: 72, price_change_pct: Math.round(impact7d * 1.1 * 100) / 100 },
      { hours: 120, price_change_pct: Math.round(impact7d * 1.02 * 100) / 100 },
      { hours: 168, price_change_pct: Math.round(impact7d * 100) / 100 },
    ],
  };
}

/** Detect accumulation signals for an influencer */
export function detectAccumulation(influencerId: string): AccumulationSignal[] {
  return MOCK_ACCUMULATION_SIGNALS.filter(s => s.influencer_id === influencerId);
}

/** Get all pump & dump alerts sorted by severity */
export function getPumpDumpAlerts(): PumpDumpAlert[] {
  const severityOrder: Record<AlertSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...MOCK_PUMP_DUMP_ALERTS].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

/** Get influencer alpha score rankings */
export function getInfluencerAlphaScores(): InfluencerRanking[] {
  return MOCK_INFLUENCERS
    .map(i => ({
      influencer_id: i.id,
      name: i.name,
      platform: i.platform,
      alpha_score: i.alpha_score,
      reliability_score: i.reliability_score,
      avg_impact_pct: i.avg_price_impact_pct,
      total_events: i.total_mentions,
      profitable_calls_pct: Math.round(i.reliability_score * 0.9 + Math.random() * 10),
    }))
    .sort((a, b) => b.alpha_score - a.alpha_score);
}

/** Get market manipulation flags */
export function getMarketManipulationFlags(): MarketManipulationFlag[] {
  return MOCK_MANIPULATION_FLAGS;
}

/** Get influencer content timeline */
export function getInfluencerTimeline(id: string): ContentEvent[] {
  return getContentEvents({ influencer_id: id });
}

/** Get all mentions for a specific card */
export function getCardMentions(cardName: string): ContentEvent[] {
  return getContentEvents({ card: cardName });
}

/** Get impact breakdown by platform */
export function getImpactByPlatform(): PlatformImpact[] {
  return MOCK_PLATFORM_IMPACT;
}

/** Get trending mentions in the last 24 hours */
export function getTrendingMentions(): TrendingMention[] {
  return MOCK_TRENDING_MENTIONS;
}

/** Get correlation between two influencers */
export function getInfluencerCorrelation(id1: string, id2: string): { influencer1: string; influencer2: string; overlap_pct: number; coordinated_events: number; correlation_score: number } {
  const inf1 = MOCK_INFLUENCERS.find(i => i.id === id1);
  const inf2 = MOCK_INFLUENCERS.find(i => i.id === id2);
  if (!inf1 || !inf2) return { influencer1: 'Unknown', influencer2: 'Unknown', overlap_pct: 0, coordinated_events: 0, correlation_score: 0 };

  // Simulate higher correlation for TikTok creators
  const isTikTokPair = inf1.platform === 'tiktok' && inf2.platform === 'tiktok';
  return {
    influencer1: inf1.name,
    influencer2: inf2.name,
    overlap_pct: isTikTokPair ? 34 : 12,
    coordinated_events: isTikTokPair ? 8 : 2,
    correlation_score: isTikTokPair ? 72 : 25,
  };
}

// Re-export helpers for use in components
export {
  platformLabel,
  platformColor,
  platformBadgeColor,
  severityBadgeColor,
  formatFollowers,
  formatViews,
  momentumColor,
};
