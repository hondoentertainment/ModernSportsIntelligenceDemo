import { store } from './dal/syncStore';

// ---- Types ----

export type ReportType =
  | 'weekly_market'
  | 'player_analysis'
  | 'sector_deep_dive'
  | 'event_preview'
  | 'contrarian_report'
  | 'special_report';

export type ReportAuthor = 'MSI AI Analyst' | 'MSI Quant Team' | 'MSI Market Strategy';

export type PlayerRating = 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';

export interface ReportSection {
  title: string;
  content: string;
  dataPoints?: { label: string; value: string; change?: string }[];
  chartData?: any;
}

export interface ResearchReport {
  id: string;
  title: string;
  type: ReportType;
  author: ReportAuthor;
  publishedAt: string;
  summary: string;
  sections: ReportSection[];
  tags: string[];
  sport?: string;
  player?: string;
  readTime: number;
  views: number;
  bookmarked: boolean;
}

export interface PlayerResearchNote {
  player: string;
  sport: string;
  team: string;
  rating: PlayerRating;
  priceTarget: number;
  currentPrice: number;
  upside: number;
  thesis: string;
  keyRisks: string[];
  catalysts: string[];
  comparables: string[];
  lastUpdated: string;
}

export interface ContrarianPick {
  player: string;
  cardDescription: string;
  currentPrice: number;
  declinePercent: number;
  fundamentalScore: number;
  marketSentiment: 'bearish' | 'very_bearish';
  contraryThesis: string;
  riskReward: string;
  timeframe: string;
}

export interface ResearchStats {
  totalReports: number;
  thisWeek: number;
  playersCovered: number;
  avgAccuracy: number;
  topPerformingCall: string;
  reportsBookmarked: number;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_research_reports';
const BOOKMARKS_KEY = 'msi_research_bookmarks';

// ---- Simulated Data ----

const REPORTS: ResearchReport[] = [
  {
    id: 'rpt-001',
    title: 'MSI Weekly: March 2026 — Modern Card Rally Continues',
    type: 'weekly_market',
    author: 'MSI Market Strategy',
    publishedAt: '2026-03-09T08:00:00Z',
    summary:
      'The modern card market extended its rally for a fifth consecutive week, led by basketball rookies and baseball prospect cards. Total market volume rose 12% week-over-week as institutional buyers increased allocations. Our proprietary MSI Composite Index climbed 3.2% to 1,847, its highest reading since November 2024. We maintain our Overweight stance on modern basketball and recommend selective accumulation in baseball prospects ahead of the 2026 draft.',
    sections: [
      {
        title: 'Market Overview',
        content:
          'The sports card market posted another strong week with broad-based gains across all major sports segments. Trading volume on major platforms surged to $47.3M, up 12% from the prior week and 34% year-over-year. The rally was fueled by a combination of strong NBA playoff positioning, early MLB season hype, and continued institutional inflows from alternative asset allocators.\n\nNotably, the bid-ask spread on high-end modern cards narrowed to 4.7%, the tightest reading in 18 months, suggesting improved market liquidity and growing buyer confidence. Our desk observed particularly aggressive buying in the $500-$2,000 price tier, which we attribute to mid-market collectors upgrading their portfolios.\n\nThe MSI Composite Index rose 3.2% to 1,847, now up 17.4% year-to-date. All six sub-indices posted gains, with Basketball Modern (+5.1%) leading and Vintage Baseball (+0.8%) lagging.',
        dataPoints: [
          { label: 'MSI Composite', value: '1,847', change: '+3.2%' },
          { label: 'Weekly Volume', value: '$47.3M', change: '+12%' },
          { label: 'Bid-Ask Spread', value: '4.7%', change: '-0.5pp' },
          { label: 'YTD Return', value: '+17.4%', change: '' },
        ],
      },
      {
        title: 'Sector Performance',
        content:
          'Basketball Modern was the standout performer this week, rising 5.1% as Victor Wembanyama rookie cards surged on his historic triple-double streak. The Panini Prizm Silver PSA 10 crossed $1,200 for the first time since release. We see further upside here as playoff narratives build.\n\nBaseball Prospects gained 3.8%, driven by early spring training standouts and pre-draft speculation. Paul Skenes Bowman Chrome autos led the segment with a 9% jump. Baseball Vintage was the laggard at +0.8%, though we note the segment remains attractively valued relative to its historical premium.\n\nFootball Modern rose 2.4% despite the offseason, supported by draft anticipation and strong performances at the NFL Combine. Hockey and Soccer segments posted modest gains of 1.9% and 2.1% respectively.',
        dataPoints: [
          { label: 'Basketball Modern', value: '+5.1%', change: '' },
          { label: 'Baseball Prospects', value: '+3.8%', change: '' },
          { label: 'Football Modern', value: '+2.4%', change: '' },
          { label: 'Baseball Vintage', value: '+0.8%', change: '' },
        ],
      },
      {
        title: 'Key Calls & Recommendations',
        content:
          'We reiterate our Overweight on modern basketball cards, with particular conviction in Wembanyama and Chet Holmgren positions. The upcoming playoff push should serve as a near-term catalyst, and we believe the current pricing still underestimates Wembanyama\'s generational ceiling.\n\nWe upgrade Baseball Prospects from Neutral to Overweight ahead of the 2026 MLB Draft. Historical data shows prospect card prices appreciate an average of 22% in the 90 days leading up to the draft, and this cycle shows early signs of following that pattern.\n\nWe maintain our Underweight on Football Modern due to seasonal headwinds, though selective buying in projected top-5 draft picks is warranted. Vintage Baseball remains a Hold — fundamentals are sound but momentum is absent.',
        dataPoints: [
          { label: 'Basketball Modern', value: 'Overweight', change: '' },
          { label: 'Baseball Prospects', value: 'Overweight', change: 'Upgraded' },
          { label: 'Football Modern', value: 'Underweight', change: '' },
          { label: 'Vintage Baseball', value: 'Neutral', change: '' },
        ],
      },
    ],
    tags: ['weekly', 'market-overview', 'basketball', 'baseball', 'strategy'],
    readTime: 8,
    views: 2847,
    bookmarked: false,
  },
  {
    id: 'rpt-002',
    title: 'Victor Wembanyama: Generational Talent, Generational Cards',
    type: 'player_analysis',
    author: 'MSI AI Analyst',
    publishedAt: '2026-03-07T10:30:00Z',
    summary:
      'We initiate coverage of Victor Wembanyama with a Strong Buy rating and a 12-month price target of $2,400 on the Panini Prizm Silver PSA 10 (current: $1,180). Wembanyama is redefining what is possible for a 7\'4" player, and his card market is only beginning to price in his generational ceiling. With MVP-caliber numbers in his second season, playoff upside, and an international fanbase rivaling LeBron\'s early trajectory, we see significant upside from current levels.',
    sections: [
      {
        title: 'Investment Thesis',
        content:
          'Victor Wembanyama represents the highest-conviction position in the modern sports card market. At 21 years old, he is posting 28.3 PPG, 11.2 RPG, and 4.1 BPG — numbers that place him in historically elite company. His combination of size, skill, and defensive impact has drawn comparisons to a hypothetical blend of Kevin Durant and Rudy Gobert, but the reality may exceed even that lofty ceiling.\n\nThe card market has recognized Wembanyama\'s talent, but we believe pricing still significantly underestimates his long-term trajectory. Our proprietary Player Impact Score rates him at 97.3 out of 100, the highest for any player in their first two seasons since our model\'s inception. Comparable analysis against LeBron James, Kevin Durant, and Tim Duncan at similar career stages suggests 80-120% upside over the next 12-24 months.\n\nCritically, Wembanyama benefits from structural tailwinds: he is the first true generational international NBA star of the modern card era, commanding attention from European and Asian collectors who represent a rapidly growing segment of the market.',
        dataPoints: [
          { label: 'Current Price (Prizm Silver PSA 10)', value: '$1,180', change: '+42% YTD' },
          { label: '12-Month Target', value: '$2,400', change: '+103%' },
          { label: 'Player Impact Score', value: '97.3/100', change: '' },
          { label: 'Market Cap (All Wemby Cards)', value: '$8.2M', change: '+38% YTD' },
        ],
      },
      {
        title: 'Comparable Analysis',
        content:
          'To arrive at our price target, we analyzed the card price trajectories of generational talents at equivalent career stages. LeBron James\' Topps Chrome RC PSA 10 traded at approximately $1,500 adjusted during his second season, before appreciating to over $4,500 within 24 months as he reached his first Finals. Tim Duncan\'s Topps Chrome RC followed a similar pattern, appreciating 135% from Year 2 to Year 4.\n\nWembanyama\'s statistical profile at age 21 is more impressive than any of these comparables at the same age. His per-36 numbers, advanced metrics, and defensive impact are historically unprecedented for a sophomore. The only knock — team success — is likely to improve as the Spurs roster develops around him.\n\nAdjusting for market inflation and the expanded collector base, we believe a $2,400 price target on the Prizm Silver PSA 10 is conservative. In a bull case where the Spurs make a deep playoff run, we see $3,000+ as achievable within 18 months.',
        dataPoints: [
          { label: 'LeBron Year 2 → Year 4', value: '+198%', change: '' },
          { label: 'Durant Year 2 → Year 4', value: '+156%', change: '' },
          { label: 'Duncan Year 2 → Year 4', value: '+135%', change: '' },
          { label: 'Wemby Implied Upside', value: '+103% to +154%', change: '' },
        ],
      },
      {
        title: 'Risk Factors',
        content:
          'The primary risk to our thesis is injury. Wembanyama\'s 7\'4" frame, while remarkably durable so far, carries inherent durability concerns given the historical precedent for players of his height. A significant injury could result in a 30-50% drawdown in card prices.\n\nSecondary risks include team performance disappointment (a lottery finish would likely cap near-term upside), a broader market correction in modern cards, and competition from the 2024 and 2025 draft classes for collector attention and capital.\n\nWe also note concentration risk: Wembanyama cards represent an outsized share of many modern basketball portfolios, which could amplify selling pressure in a downturn. We recommend position sizing of no more than 15-20% of a basketball card portfolio.',
        dataPoints: [
          { label: 'Injury Risk Impact', value: '-30% to -50%', change: '' },
          { label: 'Recommended Position Size', value: '15-20%', change: '' },
          { label: 'Support Level', value: '$850', change: '' },
          { label: 'Resistance Level', value: '$1,400', change: '' },
        ],
      },
      {
        title: 'Catalysts & Timeline',
        content:
          'Near-term catalysts include the NBA Playoff push (April-June), which historically drives 15-25% appreciation in star player cards. Wembanyama\'s first All-NBA selection (virtually certain) should provide a sentiment boost, as should any MVP voting recognition.\n\nMedium-term, the 2026-27 season could see the Spurs emerge as genuine contenders with roster additions, unlocking the "winning premium" that has historically been the single biggest driver of card appreciation for franchise players.\n\nWe recommend accumulating Prizm Silver PSA 10 and Select Courtside PSA 10 as core positions, with speculative additions in Panini National Treasures RPAs for collectors with higher risk tolerance.',
        dataPoints: [
          { label: 'Next Catalyst', value: 'NBA Playoffs (Apr)', change: '' },
          { label: 'Playoff Price Boost (Historical)', value: '+15-25%', change: '' },
          { label: 'Best Entry Point', value: 'Dips below $1,100', change: '' },
          { label: 'Rating', value: 'Strong Buy', change: '' },
        ],
      },
    ],
    tags: ['player-analysis', 'basketball', 'wembanyama', 'strong-buy', 'spurs'],
    sport: 'Basketball',
    player: 'Victor Wembanyama',
    readTime: 12,
    views: 4213,
    bookmarked: true,
  },
  {
    id: 'rpt-003',
    title: 'The State of Vintage Baseball: Q1 2026 Deep Dive',
    type: 'sector_deep_dive',
    author: 'MSI Quant Team',
    publishedAt: '2026-03-05T09:00:00Z',
    summary:
      'Vintage baseball cards remain the bedrock of the sports card market, but the segment has underperformed modern cards by 14 percentage points year-to-date. Our analysis shows this divergence is primarily driven by generational capital flows rather than fundamental deterioration. We see Q2 2026 as a potential turning point as seasonal factors and the MLB season create renewed interest. Maintain Neutral with selective Buy opportunities in pre-war Hall of Famers.',
    sections: [
      {
        title: 'Q1 Performance Review',
        content:
          'The MSI Vintage Baseball Index returned +3.2% in Q1 2026, compared to +17.4% for the broader MSI Composite. This 14.2 percentage point underperformance continues a trend that began in mid-2025, when modern cards began decisively outperforming on the back of a strong NBA rookie class and speculative fervor around AI-graded cards.\n\nHowever, the picture is nuanced. Pre-war Hall of Famers (T206 Wagner, Ruth Goudey, etc.) actually appreciated 6.8% in Q1, outperforming the vintage segment average. The drag came from post-war commons and mid-grade examples, which saw flat to slightly negative returns as collectors rotated into higher-conviction modern positions.\n\nAuction house data tells a similar story: Heritage Auctions reported record sell-through rates (94%) on vintage items graded PSA 7 or above, but weaker results (78%) on mid-grade and ungraded lots.',
        dataPoints: [
          { label: 'Vintage Baseball Q1 Return', value: '+3.2%', change: '' },
          { label: 'Pre-War HOF Return', value: '+6.8%', change: '' },
          { label: 'Post-War Commons', value: '-1.2%', change: '' },
          { label: 'Auction Sell-Through (PSA 7+)', value: '94%', change: '' },
        ],
      },
      {
        title: 'Capital Flow Analysis',
        content:
          'Our capital flow models suggest the underperformance is driven by a generational shift in collector demographics rather than fundamental weakness. Millennials and Gen-Z collectors, who represent 62% of market participants by transaction count, allocate an average of only 8% of their portfolios to vintage, compared to 45% for collectors aged 50+.\n\nThis demographic headwind is partially offset by institutional buyers, including sports card funds and alternative asset platforms, who continue to acquire trophy-piece vintage cards as portfolio anchors. We track 14 known institutional holders of T206 Wagner cards, up from 9 two years ago.\n\nThe implication is a barbell market: ultra-premium vintage will continue to appreciate as it gains institutional acceptance, while mid-market vintage faces ongoing pressure from the demographic shift.',
        dataPoints: [
          { label: 'Millennial/Gen-Z Vintage Allocation', value: '8%', change: '' },
          { label: 'Boomer Vintage Allocation', value: '45%', change: '' },
          { label: 'Institutional Holders (T206 Wagner)', value: '14', change: '+5 in 2 yrs' },
          { label: 'Avg. Vintage Portfolio Weight', value: '18%', change: '-3pp YoY' },
        ],
      },
      {
        title: 'Outlook & Recommendations',
        content:
          'We maintain our Neutral sector rating on Vintage Baseball but see selective opportunities. The MLB season opener (March 27) historically provides a 3-5% sentiment boost to baseball card prices, and vintage tends to participate in this seasonal lift.\n\nOur top picks within the sector are high-grade pre-war Hall of Famers, particularly 1933 Goudey Ruth (#53 and #149) in PSA 5-7 range, where we see 15-20% upside over 12 months. We also like 1952 Topps Mantle PSA 4-5 as a value play, trading at a 25% discount to its 2023 peak.\n\nWe recommend underweighting post-war commons and mid-grade post-war stars, which face the most headwinds from the demographic rotation. For collectors seeking vintage exposure, quality over quantity remains the guiding principle.',
        dataPoints: [
          { label: 'Sector Rating', value: 'Neutral', change: '' },
          { label: '1933 Goudey Ruth PSA 6', value: '$38,500', change: 'Target: $45,000' },
          { label: '1952 Topps Mantle PSA 4', value: '$82,000', change: '-25% from peak' },
          { label: 'Seasonal Boost (Hist. Avg)', value: '+3-5%', change: '' },
        ],
      },
    ],
    tags: ['sector-analysis', 'vintage', 'baseball', 'quarterly-review'],
    sport: 'Baseball',
    readTime: 10,
    views: 1923,
    bookmarked: false,
  },
  {
    id: 'rpt-004',
    title: '2026 MLB Draft Preview: Impact on Prospect Cards',
    type: 'event_preview',
    author: 'MSI AI Analyst',
    publishedAt: '2026-03-03T11:00:00Z',
    summary:
      'The 2026 MLB Draft (July 12-14) is shaping up as one of the deepest in recent memory, with 4-5 potential franchise-altering talents at the top. We preview the key prospects, analyze historical draft-related card price movements, and identify the best risk-adjusted positions ahead of the event. Our top pre-draft accumulation targets are Jace LaViolette and Charlie Condon Bowman Chrome autos.',
    sections: [
      {
        title: 'Draft Class Overview',
        content:
          'The 2026 MLB Draft projects as an above-average class with exceptional depth in college hitting and prep pitching. Our draft models, which incorporate scouting data, statistical projections, and historical comparisons, identify 4 potential All-Star caliber talents in the top 10 — compared to an average of 2.3 per draft class over the last 20 years.\n\nThe consensus top pick is Jace LaViolette (OF, LSU), a 6\'4" power-hitting outfielder drawing Paul Goldschmidt comparisons. LaViolette\'s combination of hit tool, raw power, and plate discipline grades out as an 80th-percentile draft prospect in our model. His Bowman Chrome 1st autos are currently trading at $320-$380, which we view as fair value with upside.\n\nCharlie Condon (3B/OF, Georgia) and Braden Montgomery (OF, Texas A&M) round out the top tier, with both projecting as middle-of-the-order bats at the next level.',
        dataPoints: [
          { label: 'Draft Date', value: 'July 12-14, 2026', change: '' },
          { label: 'Projected All-Stars (Top 10)', value: '4', change: 'vs 2.3 avg' },
          { label: 'LaViolette Bowman Auto', value: '$320-$380', change: '' },
          { label: 'Condon Bowman Auto', value: '$180-$220', change: '' },
        ],
      },
      {
        title: 'Historical Draft Price Patterns',
        content:
          'Our analysis of draft-related card price movements over the last 10 years reveals a consistent pattern. Prospect cards for consensus top-5 picks appreciate an average of 22% in the 90 days before the draft, with the bulk of the move occurring in the final 30 days as media coverage intensifies.\n\nPost-draft, there is typically a 5-10% "sell the news" reaction in the first week, followed by a secondary rally of 15-30% as signing bonuses are announced and prospect rankings are updated. The net 6-month return from 90 days pre-draft to 90 days post-draft averages +31% for top-5 picks.\n\nImportantly, the spread between winners and losers is wide. The top-performing prospect card in each draft class has returned an average of +87% over this window, while the worst performer among top-5 picks has returned an average of -12%.',
        dataPoints: [
          { label: 'Pre-Draft Rally (90 days)', value: '+22% avg', change: '' },
          { label: 'Post-Draft Dip (1 week)', value: '-5 to -10%', change: '' },
          { label: '6-Month Net Return', value: '+31% avg', change: '' },
          { label: 'Best vs Worst Spread', value: '99pp', change: '' },
        ],
      },
      {
        title: 'Recommended Positions',
        content:
          'Our top pre-draft accumulation target is Jace LaViolette Bowman Chrome 1st Autos in the $320-$380 range. We see 25-35% upside to draft day, with further upside if he goes #1 overall as expected. Position size: 5-8% of a baseball prospect portfolio.\n\nCharlie Condon is our secondary pick at current levels of $180-$220. His floor is higher than most prospects due to his advanced hit tool, but the ceiling may be capped by defensive questions. We recommend a smaller position (3-5%) with a target of $280.\n\nWe would avoid overpaying for prep arms in this class, as historical data shows prep pitchers carry the highest bust rate (42%) among prospect categories. Wait for post-draft prices on pitchers unless compelling value emerges.',
        dataPoints: [
          { label: 'Top Pick: LaViolette', value: 'Buy $320-$380', change: 'Target: $480' },
          { label: 'Secondary: Condon', value: 'Buy $180-$220', change: 'Target: $280' },
          { label: 'Avoid', value: 'Prep Pitchers', change: '42% bust rate' },
          { label: 'Best Entry Window', value: 'Now through May', change: '' },
        ],
      },
    ],
    tags: ['event-preview', 'mlb-draft', 'prospects', 'baseball'],
    sport: 'Baseball',
    readTime: 9,
    views: 1654,
    bookmarked: false,
  },
  {
    id: 'rpt-005',
    title: 'Contrarian Corner: 5 Cards the Market Has Wrong',
    type: 'contrarian_report',
    author: 'MSI Quant Team',
    publishedAt: '2026-03-01T07:30:00Z',
    summary:
      'Our monthly contrarian screener identifies cards where market sentiment has diverged significantly from our fundamental models. This month\'s picks include several high-profile names that have been oversold on narrative rather than substance. Our contrarian picks have returned +34% annualized since inception versus +18% for the broader market. We present 5 opportunities with favorable risk/reward profiles.',
    sections: [
      {
        title: 'Contrarian Methodology',
        content:
          'Our contrarian screening process combines three proprietary signals: (1) our Fundamental Score, which evaluates player performance, career trajectory, and card scarcity on a 0-100 scale; (2) Market Sentiment, derived from price momentum, social media analysis, and trading volume patterns; and (3) the Divergence Score, which measures the gap between fundamentals and sentiment.\n\nCards qualify for the contrarian list when they exhibit a Fundamental Score above 65 (indicating solid underlying value) combined with bearish or very bearish sentiment and a Divergence Score above 25. This combination identifies situations where emotional selling has pushed prices below fair value.\n\nSince we launched this screen in January 2025, our contrarian picks have generated an annualized return of +34%, compared to +18% for the MSI Composite Index. The hit rate is 68% (percentage of picks that outperform over 6 months).',
        dataPoints: [
          { label: 'Annualized Return', value: '+34%', change: 'vs +18% market' },
          { label: 'Hit Rate', value: '68%', change: '' },
          { label: 'Avg. Holding Period', value: '4.2 months', change: '' },
          { label: 'Current Picks', value: '5', change: '' },
        ],
      },
      {
        title: 'This Month\'s Picks',
        content:
          '1. Chet Holmgren Prizm Silver PSA 10 ($285): Down 38% from September highs on injury concerns, but Holmgren has returned to form and is posting 20/9/3 with elite rim protection. Fundamental Score: 78. Our model sees $420 fair value.\n\n2. CJ Stroud Prizm Silver PSA 10 ($410): Oversold after the Texans\' Wild Card exit. Stroud\'s sophomore metrics remain elite and the team is loading up for another run. Fundamental Score: 82. Target: $580.\n\n3. Elly De La Cruz Bowman Chrome 1st Auto ($520): Down 28% on strikeout concerns, but the power-speed combination is generational. Spring training reports are glowing. Fundamental Score: 75. Target: $720.\n\n4. Anthony Edwards Prizm Silver PSA 10 ($680): The market has shifted attention to Wembanyama, creating a relative value opportunity. Edwards is arguably the second-best player under 25. Fundamental Score: 88. Target: $950.\n\n5. Caleb Williams Prizm Silver PSA 10 ($195): Rookie growing pains have cratered prices from $340. But Williams\' raw talent is evident and Year 2 QBs historically show the biggest card price recoveries. Fundamental Score: 71. Target: $310.',
        dataPoints: [
          { label: 'Avg. Fundamental Score', value: '78.8', change: '' },
          { label: 'Avg. Decline from Peak', value: '-31%', change: '' },
          { label: 'Avg. Upside to Target', value: '+47%', change: '' },
          { label: 'Avg. Risk/Reward', value: '2.8:1', change: '' },
        ],
      },
      {
        title: 'Risk Management',
        content:
          'Contrarian investing in sports cards requires discipline and patience. We recommend the following risk management framework for these positions:\n\nPosition sizing: No single contrarian pick should exceed 5% of total portfolio value. The combined contrarian allocation should stay below 20%. These are higher-volatility positions that can experience further drawdowns before recovering.\n\nStop-loss guidance: We recommend a mental stop-loss at 15% below entry. If a pick declines beyond this threshold, reassess the thesis rather than automatically selling, but be prepared to cut losses if the fundamental picture has deteriorated.\n\nTime horizon: Our contrarian picks are designed to be held for 3-6 months. Avoid the temptation to take profits too early — our backtesting shows that 60% of the total return on contrarian picks comes in months 3-6 as sentiment normalizes.',
        dataPoints: [
          { label: 'Max Position Size', value: '5% per pick', change: '' },
          { label: 'Max Contrarian Allocation', value: '20%', change: '' },
          { label: 'Stop-Loss Guideline', value: '-15%', change: '' },
          { label: 'Target Holding Period', value: '3-6 months', change: '' },
        ],
      },
    ],
    tags: ['contrarian', 'value-investing', 'screener', 'multi-sport'],
    readTime: 11,
    views: 3541,
    bookmarked: true,
  },
  {
    id: 'rpt-006',
    title: 'Paul Skenes: Ace Potential at a Discount',
    type: 'player_analysis',
    author: 'MSI AI Analyst',
    publishedAt: '2026-02-27T10:00:00Z',
    summary:
      'We initiate coverage of Paul Skenes with a Buy rating and a 12-month price target of $1,100 on the Bowman Chrome 1st Auto PSA 10 (current: $740). Skenes\' elite stuff, advanced pitch mix, and improving command profile project an ace trajectory. While injury risk is inherent with power arms, we believe the market is underpricing his upside following a dominant but workload-managed rookie season.',
    sections: [
      {
        title: 'Investment Thesis',
        content:
          'Paul Skenes represents one of the most compelling risk-adjusted opportunities in baseball cards today. His rookie season confirmed what scouts projected: a 100+ mph fastball with elite spin, a devastating splinker, and a rapidly improving slider that gives him three plus-or-better pitches.\n\nSkenes\' 2025 rookie line — 11-5, 2.78 ERA, 198 K in 154 IP — was achieved despite the Pirates carefully managing his workload. Peripherals suggest even better results ahead: his 32.4% K rate, 6.2% BB rate, and .218 xBA against ranked in the top 5% of all starters. Our projection model sees a sub-2.50 ERA in a full 200+ inning season.\n\nThe current price of $740 for the Bowman Chrome 1st Auto PSA 10 reflects a market still haunted by the broader prospect card correction of late 2024. We believe this discount is unwarranted given Skenes\' performance confirmation and see significant upside as he establishes himself as a Cy Young contender.',
        dataPoints: [
          { label: 'Current Price', value: '$740', change: '-18% from debut peak' },
          { label: '12-Month Target', value: '$1,100', change: '+49%' },
          { label: '2025 ERA', value: '2.78', change: '' },
          { label: 'K Rate', value: '32.4%', change: 'Top 5%' },
        ],
      },
      {
        title: 'Comparable Pitchers',
        content:
          'The most relevant card market comparable for Skenes is Gerrit Cole, who shared a similar profile at the same career stage: elite velocity, swing-and-miss stuff, and a Pirates pedigree. Cole\'s Bowman Chrome 1st Auto PSA 10 appreciated from approximately $800 to $2,200 from his age-24 to age-27 seasons as he became a perennial Cy Young contender.\n\nSpencer Strider offers a cautionary tale: his meteoric card price rise was followed by an injury-driven 60% decline. However, Skenes\' mechanical profile carries lower injury risk flags than Strider\'s according to biomechanical analysis. His delivery is cleaner and he has shown better durability markers in our monitoring.\n\nAdjusting for market conditions, we see a realistic range of $900-$1,300 for Skenes\' flagship card within 12 months, depending on his health and performance arc.',
        dataPoints: [
          { label: 'Cole Comparable Path', value: '$800 → $2,200', change: '+175%' },
          { label: 'Strider Risk Case', value: '-60%', change: 'injury-driven' },
          { label: 'Skenes Range (12-mo)', value: '$900-$1,300', change: '' },
          { label: 'Biomechanical Risk Score', value: 'Low-Medium', change: '' },
        ],
      },
      {
        title: 'Catalysts & Risks',
        content:
          'The primary near-term catalyst is the 2026 MLB season, where Skenes is expected to pitch a full 200+ inning workload for the first time. Strong early-season performance should drive renewed market interest, particularly if he is in the Cy Young conversation by the All-Star break.\n\nA Cy Young Award in 2026 or 2027 would be a major re-rating event, potentially pushing the Bowman Chrome 1st Auto to the $1,800-$2,500 range based on historical comparables (deGrom, Verlander award cycles).\n\nKey risks include injury (the eternal risk with power arms), team competitiveness (a losing Pirates team could suppress narrative appeal), and the upcoming prospect card supply from the 2026 Bowman release, which could create temporary selling pressure as capital rotates to new names.',
        dataPoints: [
          { label: 'Next Catalyst', value: 'MLB Opening Day (Mar 27)', change: '' },
          { label: 'Cy Young Scenario', value: '$1,800-$2,500', change: '' },
          { label: 'Injury Risk Impact', value: '-40% to -60%', change: '' },
          { label: 'Rating', value: 'Buy', change: '' },
        ],
      },
    ],
    tags: ['player-analysis', 'baseball', 'skenes', 'buy', 'pirates', 'pitching'],
    sport: 'Baseball',
    player: 'Paul Skenes',
    readTime: 10,
    views: 2187,
    bookmarked: false,
  },
  {
    id: 'rpt-007',
    title: 'Basketball Card Market: Post-Season Outlook',
    type: 'sector_deep_dive',
    author: 'MSI Market Strategy',
    publishedAt: '2026-02-24T08:30:00Z',
    summary:
      'With the NBA regular season entering its final stretch, we analyze the basketball card market\'s positioning ahead of the playoffs. Historical data shows playoff runs generate outsized returns for star players on contending teams. We identify the best risk-adjusted positions for the post-season and flag potential pitfalls in overpaying for playoff hype.',
    sections: [
      {
        title: 'Pre-Playoff Market Positioning',
        content:
          'The basketball card market has been the strongest major segment year-to-date, with the MSI Basketball Modern Index up 22.1%. However, this aggregate figure masks significant dispersion: cards of players on playoff-bound teams are up 31%, while those on lottery teams are up only 8%.\n\nHistorically, the 30 days before the NBA playoffs (roughly March 15 to April 15) represent the single best period for basketball card returns, averaging +8.2% for the segment as a whole and +14.7% for eventual deep playoff run players. This is the "anticipation premium" — collectors bid up cards in expectation of memorable postseason moments.\n\nWe recommend increasing basketball card exposure now, but being selective. Focus on star players whose teams are genuine contenders, and avoid overpaying for first-round exit candidates.',
        dataPoints: [
          { label: 'YTD Basketball Modern', value: '+22.1%', change: '' },
          { label: 'Playoff Team Stars', value: '+31%', change: '' },
          { label: 'Lottery Team Stars', value: '+8%', change: '' },
          { label: 'Pre-Playoff Avg Return', value: '+8.2%', change: '30-day window' },
        ],
      },
      {
        title: 'Top Playoff Positions',
        content:
          'Our top playoff-oriented positions combine team strength, individual star power, and card valuation:\n\nVictor Wembanyama (Spurs, 6th seed projected): Despite being a lower seed, Wembanyama\'s individual brilliance makes him a must-own. Even a first-round loss would generate highlight moments that support card prices. If the Spurs pull an upset, the upside is extraordinary.\n\nShai Gilgeous-Alexander (Thunder, 1st seed projected): SGA is having an MVP-caliber season and his cards remain undervalued relative to his performance level. A deep Thunder run could push his Prizm Silver PSA 10 from $520 to $750+.\n\nAnthony Edwards (Wolves, 4th seed projected): Our contrarian pick. Edwards\' cards have lagged the market but a playoff breakout could rapidly close the gap. Entry point at $680 offers excellent risk/reward.\n\nJayson Tatum (Celtics, 2nd seed projected): The defending champion narrative is powerful. Tatum\'s cards are fairly valued but could spike 20%+ on a repeat championship run.',
        dataPoints: [
          { label: 'Wembanyama', value: 'Strong Buy', change: 'Highest ceiling' },
          { label: 'SGA', value: 'Buy', change: 'Best value' },
          { label: 'Edwards', value: 'Buy', change: 'Contrarian upside' },
          { label: 'Tatum', value: 'Hold/Buy', change: 'Repeat champ thesis' },
        ],
      },
      {
        title: 'Post-Season Sell Discipline',
        content:
          'One of the most common mistakes in basketball card investing is failing to sell into playoff strength. Our data shows that the optimal selling window is during the Conference Finals (or Finals) for players whose teams are still alive. Prices peak during the emotional high of a deep run and typically decline 10-15% in the offseason even for players who performed well.\n\nWe recommend setting price alerts at 20-30% above current levels for playoff positions and being willing to take profits when they hit. The exception is truly generational players (Wembanyama) where the long-term thesis justifies holding through seasonal volatility.\n\nFor players whose teams are eliminated early, expect a 5-10% drawdown within a week of elimination. This is often an overcorrection and can present re-entry opportunities for the patient investor.',
        dataPoints: [
          { label: 'Optimal Sell Window', value: 'Conference Finals', change: '' },
          { label: 'Offseason Avg Decline', value: '-10 to -15%', change: '' },
          { label: 'Early Elimination Drop', value: '-5 to -10%', change: '' },
          { label: 'Profit Target', value: '+20-30%', change: '' },
        ],
      },
    ],
    tags: ['sector-analysis', 'basketball', 'playoffs', 'strategy'],
    sport: 'Basketball',
    readTime: 9,
    views: 2654,
    bookmarked: false,
  },
  {
    id: 'rpt-008',
    title: 'Special Report: AI Grading Revolution — Winners & Losers',
    type: 'special_report',
    author: 'MSI Quant Team',
    publishedAt: '2026-02-20T09:00:00Z',
    summary:
      'AI-powered card grading is disrupting the $500M+ grading industry, with three major companies launching AI-assisted services in Q1 2026. We analyze the implications for card values, grading premiums, and market structure. Our conclusion: AI grading will expand the market by reducing costs and turnaround times, but will compress premiums for PSA 10s by 8-12% as supply of accurately graded high-grade cards increases.',
    sections: [
      {
        title: 'The AI Grading Landscape',
        content:
          'Three significant AI grading developments emerged in Q1 2026: PSA launched "PSA Vision" (AI-assisted pre-screening), BGS integrated machine learning into its grading process, and newcomer GradeTech AI launched a fully automated grading service with 24-hour turnaround.\n\nThe technology has reached an inflection point. Independent testing by CardBoard Analytics found that AI grading systems now agree with human expert graders 89% of the time (within 0.5 grade points), up from 71% two years ago. For the critical PSA 9 vs 10 determination, AI accuracy is 83%, approaching but not yet matching the 91% inter-grader agreement rate among human experts.\n\nThe market implications are significant. AI grading promises to reduce average turnaround from 45 days to under 7 days for standard submissions, and costs from $20-$50 per card to $5-$15. This will dramatically lower the barrier to grading, potentially flooding the market with newly graded inventory.',
        dataPoints: [
          { label: 'AI-Human Agreement Rate', value: '89%', change: '+18pp in 2 yrs' },
          { label: 'PSA 9/10 Accuracy', value: '83%', change: '' },
          { label: 'Turnaround Reduction', value: '45 → 7 days', change: '-84%' },
          { label: 'Cost Reduction', value: '$35 → $10 avg', change: '-71%' },
        ],
      },
      {
        title: 'Impact on Card Values',
        content:
          'Our modeling suggests AI grading will have a nuanced impact on card values. The primary effect will be PSA 10 premium compression: as more cards are accurately graded, the supply of verified PSA 10s (or equivalent) will increase, reducing the scarcity premium that currently drives 40-60% of the price difference between PSA 9 and PSA 10.\n\nWe estimate PSA 10 premiums will compress by 8-12% over the next 18 months as AI grading scales. This is most impactful for modern cards with large print runs, where the PSA 10 population could increase 30-50% as previously ungraded or incorrectly graded cards are re-evaluated.\n\nHowever, for vintage cards and truly scarce modern cards (low population reports), the impact will be minimal. The PSA 10 premium on a 1952 Topps Mantle is driven by genuine scarcity, not grading friction, and AI grading won\'t create new gem-mint copies of 70-year-old cards.\n\nThe net market impact is positive: by reducing costs and barriers, AI grading will bring more participants and capital into the market, more than offsetting the premium compression effect.',
        dataPoints: [
          { label: 'PSA 10 Premium Compression', value: '-8 to -12%', change: '18-month outlook' },
          { label: 'Modern Card PSA 10 Supply', value: '+30-50%', change: 'projected' },
          { label: 'Vintage Impact', value: 'Minimal', change: '' },
          { label: 'Net Market Impact', value: 'Positive', change: 'More participants' },
        ],
      },
      {
        title: 'Winners & Losers',
        content:
          'Winners: (1) Raw card holders who can now affordably grade their collections — the estimated 2 billion ungraded cards in circulation represent a massive untapped market. (2) Mid-market modern cards ($50-$500 range) where grading fees previously represented a prohibitive percentage of card value. (3) Grading companies that embrace AI, particularly newcomers like GradeTech AI that can undercut incumbents on price and speed.\n\nLosers: (1) PSA 10 "flippers" who rely on grading arbitrage — the 9-to-10 upgrade play becomes less profitable as AI reduces grading inconsistency. (2) Traditional grading companies slow to adopt AI, risking market share loss. (3) Holders of large PSA 10 modern card positions who will see mild premium compression.\n\nOur recommendation: Gradually rotate modern card holdings toward PSA 9 examples, which we believe will appreciate as the 9-to-10 premium narrows. For vintage, continue to prioritize high-grade PSA examples where the premium reflects genuine scarcity.',
        dataPoints: [
          { label: 'Ungraded Cards in Market', value: '~2 Billion', change: '' },
          { label: 'PSA 9 Upside (Premium Narrowing)', value: '+5-10%', change: '' },
          { label: 'Grading Arbitrage Profit Impact', value: '-25-35%', change: '' },
          { label: 'New Market Entrants (Est.)', value: '+500K', change: '12-month' },
        ],
      },
      {
        title: 'Strategic Implications',
        content:
          'The AI grading revolution is net positive for the sports card market, but requires strategic adaptation. We recommend the following portfolio adjustments:\n\n1. Increase allocation to raw/ungraded cards from known-quality sources, as the cost of grading them will decline significantly.\n2. Shift modern card PSA 10 positions toward truly scarce parallels (numbered /25 or less) where population growth is inherently limited.\n3. Consider PSA 9 modern cards as a value play — the gap to PSA 10 pricing should narrow by 15-20% as premiums compress.\n4. Maintain vintage card allocations unchanged — AI grading is a tailwind for vintage as it validates existing grades and increases buyer confidence.\n\nThe AI grading trend is accelerating and will reshape the market over the next 2-3 years. Early adapters will benefit most.',
        dataPoints: [
          { label: 'Raw Card Allocation', value: 'Increase', change: '' },
          { label: 'PSA 10 Modern Strategy', value: 'Shift to scarce parallels', change: '' },
          { label: 'PSA 9 Opportunity', value: '+15-20% gap narrowing', change: '' },
          { label: 'Vintage Strategy', value: 'Hold/Accumulate', change: '' },
        ],
      },
    ],
    tags: ['special-report', 'ai-grading', 'industry-disruption', 'strategy', 'grading'],
    readTime: 14,
    views: 5832,
    bookmarked: true,
  },
];

const PLAYER_RESEARCH_NOTES: PlayerResearchNote[] = [
  {
    player: 'Victor Wembanyama',
    sport: 'Basketball',
    team: 'San Antonio Spurs',
    rating: 'Strong Buy',
    priceTarget: 2400,
    currentPrice: 1180,
    upside: 103,
    thesis:
      'Generational two-way talent posting historically elite sophomore numbers. MVP-caliber trajectory with international fanbase creating structural demand. Card prices significantly underestimate long-term ceiling based on comparable analysis (LeBron, Duncan, Durant at same age).',
    keyRisks: [
      'Injury risk due to 7\'4" frame',
      'Team competitiveness may limit playoff narrative',
      'Concentration risk in collector portfolios',
      'Broader modern card market correction',
    ],
    catalysts: [
      'NBA Playoffs (April-June 2026)',
      'All-NBA First Team selection',
      'MVP voting top-3 finish',
      'Spurs roster improvements (2026 offseason)',
    ],
    comparables: ['LeBron James (Year 2)', 'Tim Duncan (Year 2)', 'Kevin Durant (Year 2)', 'Giannis Antetokounmpo (Year 3)'],
    lastUpdated: '2026-03-07',
  },
  {
    player: 'Paul Skenes',
    sport: 'Baseball',
    team: 'Pittsburgh Pirates',
    rating: 'Buy',
    priceTarget: 1100,
    currentPrice: 740,
    upside: 49,
    thesis:
      'Elite stuff confirmed in rookie season (2.78 ERA, 32.4% K rate). Market underpricing upside after prospect card correction. Full 200+ inning workload in 2026 is the key catalyst. Cy Young-caliber ceiling with clean biomechanical profile reducing injury risk versus comparable power arms.',
    keyRisks: [
      'Injury risk inherent with power arms',
      'Pirates team competitiveness concerns',
      'New Bowman release supply pressure',
      'Workload management uncertainty',
    ],
    catalysts: [
      'MLB Opening Day (March 27)',
      'Full-season 200+ IP workload',
      'All-Star Game selection',
      'Cy Young contention by mid-season',
    ],
    comparables: ['Gerrit Cole (Year 2)', 'Spencer Strider (Year 1)', 'Jacob deGrom (Year 2)', 'Justin Verlander (Year 2)'],
    lastUpdated: '2026-02-27',
  },
  {
    player: 'Shai Gilgeous-Alexander',
    sport: 'Basketball',
    team: 'Oklahoma City Thunder',
    rating: 'Buy',
    priceTarget: 750,
    currentPrice: 520,
    upside: 44,
    thesis:
      'MVP-caliber season on the top-seeded Thunder. Cards remain undervalued relative to his production level and team success. A deep playoff run or MVP award would trigger a significant re-rating. The Thunder\'s young core provides a multi-year winning window.',
    keyRisks: [
      'Playoff performance uncertainty (limited deep run history)',
      'Crowded MVP race may leave him empty-handed',
      'Thunder young core salary cap constraints ahead',
      'Modern basketball card market saturation',
    ],
    catalysts: [
      'MVP Award announcement',
      'Deep Thunder playoff run',
      'Conference Finals/Finals appearance',
      'Continued 30+ PPG production',
    ],
    comparables: ['Stephen Curry (pre-championship)', 'Dwyane Wade (Year 4)', 'Allen Iverson (MVP season)'],
    lastUpdated: '2026-03-05',
  },
  {
    player: 'Elly De La Cruz',
    sport: 'Baseball',
    team: 'Cincinnati Reds',
    rating: 'Hold',
    priceTarget: 720,
    currentPrice: 520,
    upside: 38,
    thesis:
      'Generational power-speed combination — 30/60 potential is real. Strikeout rate is the key swing factor: improvement to sub-28% unlocks Strong Buy territory. Spring training reports are encouraging. The market has overcorrected on K-rate concerns, but we need more data before upgrading.',
    keyRisks: [
      'Strikeout rate remains elevated (33% in 2025)',
      'Defensive questions at shortstop long-term',
      'Reds roster may not contend in 2026',
      'Prospect fatigue — market may have moved on',
    ],
    catalysts: [
      'Improved K-rate in spring training / early 2026',
      '30-30 season achievement',
      'All-Star selection',
      'Reds competitive improvement',
    ],
    comparables: ['Fernando Tatis Jr. (Year 2)', 'Bo Jackson (rookie hype)', 'Ronald Acuna Jr. (Year 2)'],
    lastUpdated: '2026-03-01',
  },
  {
    player: 'Caleb Williams',
    sport: 'Football',
    team: 'Chicago Bears',
    rating: 'Buy',
    priceTarget: 310,
    currentPrice: 195,
    upside: 59,
    thesis:
      'Rookie season growing pains have cratered prices 43% from debut peak, creating a compelling entry point. Year 2 QBs historically show the strongest card price recoveries (+38% average). Williams\' raw talent — arm strength, mobility, improvisational ability — is undeniable. Bears roster upgrades in 2026 should provide a better supporting cast.',
    keyRisks: [
      'Second-year regression is possible',
      'Bears offensive line and weapons remain a concern',
      'NFL QB bust rate is historically high',
      'Competition from 2025 QB draft class for collector attention',
    ],
    catalysts: [
      'Strong offseason/preseason performance',
      'Bears offensive roster additions',
      'Year 2 statistical improvement',
      '2026 NFL season week 1 (September)',
    ],
    comparables: ['Justin Herbert (Year 1 to Year 2)', 'Josh Allen (Year 1 to Year 2)', 'Jalen Hurts (early career)'],
    lastUpdated: '2026-02-25',
  },
  {
    player: 'Anthony Edwards',
    sport: 'Basketball',
    team: 'Minnesota Timberwolves',
    rating: 'Buy',
    priceTarget: 950,
    currentPrice: 680,
    upside: 40,
    thesis:
      'The market has rotated attention and capital toward Wembanyama, creating a relative value opportunity in Edwards. He is arguably the second-best player under 25 in the NBA, with superstar charisma and a game built for the postseason. A deep Wolves playoff run would rapidly re-rate his cards. Current pricing offers an attractive entry for patient investors.',
    keyRisks: [
      'Timberwolves roster construction concerns post-Gobert trade',
      'Edwards narrative overshadowed by Wembanyama',
      'Consistency concerns — volatile game-to-game production',
      'Western Conference depth limits playoff upside',
    ],
    catalysts: [
      'NBA Playoff performance',
      'Scoring title contention',
      'Deep Wolves playoff run',
      'Team USA / Olympics exposure (2028)',
    ],
    comparables: ['Dwyane Wade (Year 3-4)', 'Kobe Bryant (Year 4)', 'Tracy McGrady (prime years)'],
    lastUpdated: '2026-03-02',
  },
];

const CONTRARIAN_PICKS: ContrarianPick[] = [
  {
    player: 'Chet Holmgren',
    cardDescription: 'Panini Prizm Silver PSA 10',
    currentPrice: 285,
    declinePercent: 38,
    fundamentalScore: 78,
    marketSentiment: 'very_bearish',
    contraryThesis:
      'Holmgren has returned to full health and is posting 20/9/3 with elite rim protection. The 38% decline from September highs is an overcorrection driven by injury fears that are no longer supported by the data. His unique skill set as a 7\'1" shot-blocker who can shoot threes gives him a high floor and All-Star ceiling.',
    riskReward: '3.2:1',
    timeframe: '4-6 months',
  },
  {
    player: 'CJ Stroud',
    cardDescription: 'Panini Prizm Silver PSA 10',
    currentPrice: 410,
    declinePercent: 26,
    fundamentalScore: 82,
    marketSentiment: 'bearish',
    contraryThesis:
      'The Texans\' Wild Card exit triggered a sell-off that ignores Stroud\'s elite sophomore metrics. His passer rating, completion percentage, and yards per attempt all ranked top-8 in the NFL. The Texans are aggressively adding weapons this offseason, and Stroud\'s Year 3 should see a significant leap. The market is pricing in playoff disappointment, not the underlying talent.',
    riskReward: '2.8:1',
    timeframe: '6-9 months',
  },
  {
    player: 'Elly De La Cruz',
    cardDescription: 'Bowman Chrome 1st Auto PSA 10',
    currentPrice: 520,
    declinePercent: 28,
    fundamentalScore: 75,
    marketSentiment: 'bearish',
    contraryThesis:
      'The market is overly focused on De La Cruz\'s strikeout rate while ignoring his generational power-speed combination. Only 5 players in MLB history have posted a 30-60 season, and De La Cruz has the tools to join that club. Spring training reports indicate mechanical adjustments that could significantly reduce his K-rate. At a 28% discount, the risk/reward is compelling.',
    riskReward: '2.5:1',
    timeframe: '3-6 months',
  },
  {
    player: 'Anthony Edwards',
    cardDescription: 'Panini Prizm Silver PSA 10',
    currentPrice: 680,
    declinePercent: 22,
    fundamentalScore: 88,
    marketSentiment: 'bearish',
    contraryThesis:
      'Edwards\' cards have underperformed the basketball market by 15pp year-to-date as collector attention shifted to Wembanyama. This relative underperformance ignores that Edwards is a top-5 NBA player with superstar charisma and postseason fire. His 88 Fundamental Score is the highest on our contrarian list. The Wolves\' playoff run will be the catalyst.',
    riskReward: '3.0:1',
    timeframe: '3-5 months',
  },
  {
    player: 'Caleb Williams',
    cardDescription: 'Panini Prizm Silver PSA 10',
    currentPrice: 195,
    declinePercent: 43,
    fundamentalScore: 71,
    marketSentiment: 'very_bearish',
    contraryThesis:
      'Williams\' rookie season was rough, but the 43% price decline prices in a bust scenario that his talent doesn\'t warrant. Year 2 QBs show the strongest card recoveries historically (+38% average), and the Bears are investing heavily in the offensive line and skill positions. Williams\' arm talent and mobility are undeniable — he needs a system, not a miracle.',
    riskReward: '2.5:1',
    timeframe: '6-9 months',
  },
  {
    player: 'Caitlin Clark',
    cardDescription: 'Panini Prizm Silver PSA 10',
    currentPrice: 340,
    declinePercent: 31,
    fundamentalScore: 80,
    marketSentiment: 'bearish',
    contraryThesis:
      'The WNBA offseason has allowed Clark\'s card prices to drift lower, but her cultural impact and on-court production (Rookie of the Year, record viewership) are undeniable. The 2026 WNBA season will bring renewed attention, and Clark\'s Fever are expected to be playoff contenders. Her crossover appeal to non-traditional card collectors provides a structural demand floor.',
    riskReward: '2.8:1',
    timeframe: '3-6 months',
  },
];

// ---- Helpers ----

function loadBookmarks(): Set<string> {
  return new Set(store.get<string[]>(BOOKMARKS_KEY, []));
}

function saveBookmarks(bookmarks: Set<string>): void {
  store.set(BOOKMARKS_KEY, [...bookmarks]);
}

function loadReadReports(): Set<string> {
  return new Set(store.get<string[]>(STORAGE_KEY + '_read', []));
}

function saveReadReports(read: Set<string>): void {
  store.set(STORAGE_KEY + '_read', [...read]);
}

// ---- Public API ----

export function getRecentReports(): ResearchReport[] {
  const bookmarks = loadBookmarks();
  return REPORTS.map((r) => ({ ...r, bookmarked: bookmarks.has(r.id) }));
}

export function getReportById(id: string): ResearchReport | undefined {
  const bookmarks = loadBookmarks();
  const report = REPORTS.find((r) => r.id === id);
  if (!report) return undefined;

  // Mark as read
  const read = loadReadReports();
  read.add(id);
  saveReadReports(read);

  return { ...report, bookmarked: bookmarks.has(report.id) };
}

export function getPlayerResearchNotes(): PlayerResearchNote[] {
  return [...PLAYER_RESEARCH_NOTES];
}

export function getPlayerResearchNote(player: string): PlayerResearchNote | undefined {
  return PLAYER_RESEARCH_NOTES.find(
    (n) => n.player.toLowerCase() === player.toLowerCase()
  );
}

export function getContrarianPicks(): ContrarianPick[] {
  return [...CONTRARIAN_PICKS];
}

export function getResearchStats(): ResearchStats {
  const bookmarks = loadBookmarks();
  return {
    totalReports: REPORTS.length,
    thisWeek: REPORTS.filter((r) => {
      const published = new Date(r.publishedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return published >= weekAgo;
    }).length,
    playersCovered: PLAYER_RESEARCH_NOTES.length,
    avgAccuracy: 78.4,
    topPerformingCall: 'Wembanyama Strong Buy (+42% YTD)',
    reportsBookmarked: [...bookmarks].filter((id) => REPORTS.some((r) => r.id === id)).length,
  };
}

export function searchReports(query: string): ResearchReport[] {
  const q = query.toLowerCase();
  const bookmarks = loadBookmarks();
  return REPORTS.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q)) ||
      r.sections.some(
        (s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
      )
  ).map((r) => ({ ...r, bookmarked: bookmarks.has(r.id) }));
}

export function toggleBookmark(reportId: string): boolean {
  const bookmarks = loadBookmarks();
  if (bookmarks.has(reportId)) {
    bookmarks.delete(reportId);
    saveBookmarks(bookmarks);
    return false;
  } else {
    bookmarks.add(reportId);
    saveBookmarks(bookmarks);
    return true;
  }
}

export function isReportRead(reportId: string): boolean {
  const read = loadReadReports();
  return read.has(reportId);
}

export function getUnreadCount(): number {
  const read = loadReadReports();
  return REPORTS.filter((r) => !read.has(r.id)).length;
}
