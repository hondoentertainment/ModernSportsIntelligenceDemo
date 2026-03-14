// ── Phase 114: AI Portfolio Copilot ─────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────────

export type CopilotIntent =
  | 'buy_signal'
  | 'sell_signal'
  | 'rebalance'
  | 'grading_advice'
  | 'market_alert'
  | 'general';

export type NudgePriority = 'critical' | 'high' | 'medium' | 'low';
export type MessageRole = 'user' | 'copilot';

export interface CopilotMessage {
  id: string;
  threadId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  intent?: CopilotIntent;
  suggestions?: CopilotSuggestion[];
}

export interface ConversationThread {
  id: string;
  title: string;
  messages: CopilotMessage[];
  createdAt: string;
  updatedAt: string;
  intent: CopilotIntent;
  isActive: boolean;
}

export interface CopilotSuggestion {
  id: string;
  type: 'action' | 'insight' | 'warning';
  title: string;
  description: string;
  cardName?: string;
  actionLabel?: string;
  confidence: number;
  intent: CopilotIntent;
}

export interface DailyBriefing {
  id: string;
  date: string;
  portfolioValue: number;
  portfolioChangePct: number;
  portfolioChange24h: number;
  topMovers: {
    cardName: string;
    changePct: number;
    currentValue: number;
    direction: 'up' | 'down';
  }[];
  alerts: {
    id: string;
    message: string;
    priority: NudgePriority;
    intent: CopilotIntent;
  }[];
  recommendations: {
    id: string;
    title: string;
    description: string;
    intent: CopilotIntent;
    confidence: number;
  }[];
  performanceData: { day: string; value: number }[];
  summary: string;
}

export interface ProactiveNudge {
  id: string;
  message: string;
  detail: string;
  priority: NudgePriority;
  intent: CopilotIntent;
  cardName?: string;
  timestamp: string;
  isRead: boolean;
  actionLabel?: string;
}

export interface VoiceCommand {
  id: string;
  transcript: string;
  parsedIntent: CopilotIntent;
  confidence: number;
  response: string;
  timestamp: string;
}

// ── Mock Conversation Threads ────────────────────────────────────────────────────

const MOCK_THREADS: ConversationThread[] = [
  {
    id: 'thread-001',
    title: 'Wembanyama Prizm Silver Strategy',
    createdAt: '2026-03-13T08:15:00Z',
    updatedAt: '2026-03-13T08:22:00Z',
    intent: 'buy_signal',
    isActive: true,
    messages: [
      {
        id: 'msg-001', threadId: 'thread-001', role: 'user',
        content: 'Should I buy more Wemby Prizm Silver at $940? I already have two copies.',
        timestamp: '2026-03-13T08:15:00Z',
      },
      {
        id: 'msg-002', threadId: 'thread-001', role: 'copilot',
        content: 'Based on current market data, the 2023 Prizm Silver Wembanyama RC at $940 is sitting below its 30-day average of $1,020. Three influencers mentioned it in the past 48 hours with a combined reach of 4.4M, and Gary V\'s mention drove a 31.8% spike that has partially reverted. Historically, post-hype floors for this card trend ~10% above pre-mention prices. Adding a third copy would increase your Wemby concentration to roughly 18% of portfolio value — manageable, but near the upper end of single-player exposure I\'d recommend.',
        timestamp: '2026-03-13T08:16:00Z',
        intent: 'buy_signal',
        suggestions: [
          {
            id: 'sug-001', type: 'action', title: 'Buy 1 Copy at $940',
            description: 'Price is below 30-day average with strong floor support.',
            cardName: '2023 Prizm Silver Wembanyama RC', actionLabel: 'Set Buy Alert',
            confidence: 74, intent: 'buy_signal',
          },
          {
            id: 'sug-002', type: 'warning', title: 'Concentration Risk',
            description: 'A third copy puts Wemby at ~18% of your portfolio. Consider diversifying into other basketball RCs.',
            confidence: 82, intent: 'rebalance',
          },
        ],
      },
      {
        id: 'msg-003', threadId: 'thread-001', role: 'user',
        content: 'What price should I target for the buy?',
        timestamp: '2026-03-13T08:20:00Z',
      },
      {
        id: 'msg-004', threadId: 'thread-001', role: 'copilot',
        content: 'I\'d target $880-$920. The hype decay model shows the Gary V mention is still decaying with about 62% reversion expected. That puts the predicted floor around $890. Set a buy alert at $900 to catch the next dip — there\'s a 68% probability it touches that level within 72 hours based on the current decay curve.',
        timestamp: '2026-03-13T08:22:00Z',
        intent: 'buy_signal',
        suggestions: [
          {
            id: 'sug-003', type: 'action', title: 'Set Alert at $900',
            description: 'Predicted floor based on hype decay model is ~$890.',
            cardName: '2023 Prizm Silver Wembanyama RC', actionLabel: 'Set Price Alert',
            confidence: 68, intent: 'buy_signal',
          },
        ],
      },
    ],
  },
  {
    id: 'thread-002',
    title: 'Portfolio Rebalancing Discussion',
    createdAt: '2026-03-12T14:30:00Z',
    updatedAt: '2026-03-12T14:45:00Z',
    intent: 'rebalance',
    isActive: true,
    messages: [
      {
        id: 'msg-005', threadId: 'thread-002', role: 'user',
        content: 'My portfolio feels too heavy on basketball. What should I rebalance into?',
        timestamp: '2026-03-12T14:30:00Z',
      },
      {
        id: 'msg-006', threadId: 'thread-002', role: 'copilot',
        content: 'You\'re right — basketball makes up 64% of your portfolio value, which is significantly above the recommended 40% max for any single sport. Here\'s what I\'d suggest:\n\n1. Reduce basketball exposure by selling your lowest-conviction hold (Jaylen Brown Prizm, currently down 9.5%)\n2. Add baseball exposure — Jackson Holliday Bowman Chrome 1st is showing strong fundamentals with low influencer-driven volatility\n3. Consider soccer — Lamine Yamal Topps Chrome has high upside with global appeal\n\nThis would bring basketball down to ~52% and diversify your risk profile.',
        timestamp: '2026-03-12T14:33:00Z',
        intent: 'rebalance',
        suggestions: [
          {
            id: 'sug-004', type: 'action', title: 'Sell Jaylen Brown Prizm',
            description: 'Lowest conviction basketball hold, down 9.5%. Rebalancing opportunity.',
            cardName: '2017 Prizm Jaylen Brown RC', actionLabel: 'Review Sale',
            confidence: 76, intent: 'sell_signal',
          },
          {
            id: 'sug-005', type: 'insight', title: 'Buy Jackson Holliday BC 1st',
            description: 'Strong prospect fundamentals with 80% reliability rating from influencer signals.',
            cardName: '2022 Bowman Chrome 1st Jackson Holliday', actionLabel: 'Research Card',
            confidence: 78, intent: 'buy_signal',
          },
          {
            id: 'sug-006', type: 'insight', title: 'Add Lamine Yamal Topps Chrome',
            description: 'Soccer diversification play with high global growth potential.',
            cardName: '2023 Topps Chrome Lamine Yamal RC', actionLabel: 'Research Card',
            confidence: 70, intent: 'buy_signal',
          },
        ],
      },
    ],
  },
  {
    id: 'thread-003',
    title: 'Grading My Ohtani Bowman Chrome',
    createdAt: '2026-03-11T10:00:00Z',
    updatedAt: '2026-03-11T10:15:00Z',
    intent: 'grading_advice',
    isActive: false,
    messages: [
      {
        id: 'msg-007', threadId: 'thread-003', role: 'user',
        content: 'Is now a good time to grade my raw Ohtani Bowman Chrome? It looks clean.',
        timestamp: '2026-03-11T10:00:00Z',
      },
      {
        id: 'msg-008', threadId: 'thread-003', role: 'copilot',
        content: 'Great timing to consider it. PSA turnaround times are currently at 45 days for regular service ($50/card), and the raw-to-graded premium for a PSA 10 Ohtani Bowman Chrome is approximately 2.8x ($4,800 raw vs $13,400 PSA 10). Even a PSA 9 yields a 1.6x premium. Current submission volumes are down 15% from the holiday surge, so expect slightly faster turnaround. If your card is truly clean with sharp corners and good centering, I\'d recommend the regular service tier — the economics strongly favor grading.',
        timestamp: '2026-03-11T10:05:00Z',
        intent: 'grading_advice',
        suggestions: [
          {
            id: 'sug-007', type: 'action', title: 'Submit for PSA Grading',
            description: 'Raw-to-graded premium is 2.8x for PSA 10. Turnaround: ~45 days.',
            cardName: '2018 Bowman Chrome Shohei Ohtani RC', actionLabel: 'Start Submission',
            confidence: 82, intent: 'grading_advice',
          },
          {
            id: 'sug-008', type: 'insight', title: 'Consider BGS as Alternative',
            description: 'BGS 9.5 commands a similar premium with potentially faster turnaround.',
            confidence: 65, intent: 'grading_advice',
          },
        ],
      },
    ],
  },
  {
    id: 'thread-004',
    title: 'Caleb Williams Market Alert',
    createdAt: '2026-03-12T16:10:00Z',
    updatedAt: '2026-03-12T16:18:00Z',
    intent: 'market_alert',
    isActive: true,
    messages: [
      {
        id: 'msg-009', threadId: 'thread-004', role: 'user',
        content: 'I just saw Caleb Williams Optic spiked 44%. Is this real or hype?',
        timestamp: '2026-03-12T16:10:00Z',
      },
      {
        id: 'msg-010', threadId: 'thread-004', role: 'copilot',
        content: 'This is primarily hype-driven. RipCity Cards posted a TikTok that reached 1.8M viewers calling it a "STEAL" — classic pump language. The hype decay model shows this is still in the spiking phase with predicted peak at +82%, but expected reversion of 65%. The card was $180 before the mention and is now at $260. Based on similar RipCity signals, I\'d expect it to settle around $210-$230 within 24 hours. If you own it, consider taking profits above $280. If you\'re looking to buy, wait for the reversion.',
        timestamp: '2026-03-12T16:14:00Z',
        intent: 'market_alert',
        suggestions: [
          {
            id: 'sug-009', type: 'warning', title: 'Hype-Driven Spike — Caution',
            description: 'RipCity Cards TikTok is driving this. 65% reversion expected within 24h.',
            cardName: '2024 Optic Caleb Williams RC', actionLabel: 'View Decay Curve',
            confidence: 65, intent: 'market_alert',
          },
          {
            id: 'sug-010', type: 'action', title: 'Take Profits Above $280',
            description: 'If you own this card, consider selling before the reversion.',
            cardName: '2024 Optic Caleb Williams RC', actionLabel: 'Set Sell Alert',
            confidence: 72, intent: 'sell_signal',
          },
        ],
      },
    ],
  },
  {
    id: 'thread-005',
    title: 'Which Mahomes to Hold Long Term?',
    createdAt: '2026-03-10T19:00:00Z',
    updatedAt: '2026-03-10T19:12:00Z',
    intent: 'general',
    isActive: false,
    messages: [
      {
        id: 'msg-011', threadId: 'thread-005', role: 'user',
        content: 'I have a Mahomes Prizm Silver and a Mahomes Optic Rated Rookie. Which is the better long-term hold?',
        timestamp: '2026-03-10T19:00:00Z',
      },
      {
        id: 'msg-012', threadId: 'thread-005', role: 'copilot',
        content: 'For long-term holding, the Prizm Silver is the stronger play. Here\'s why:\n\n• Higher liquidity — 3.2x more sales volume on secondary markets\n• Stronger brand recognition — Prizm is the flagship modern football set\n• Better influencer signal quality — mentions from high-reliability influencers (Card Market Edge, Eric Whiteback) correlate with lasting price floors\n• Lower reversion rates — 38% avg reversion vs 52% for Optic\n\nThe Optic Rated Rookie is a solid card, but it trades at a discount for a reason. If you need to consolidate, sell the Optic and use the proceeds to dollar-cost into your Prizm Silver position.',
        timestamp: '2026-03-10T19:06:00Z',
        intent: 'general',
        suggestions: [
          {
            id: 'sug-011', type: 'insight', title: 'Hold Prizm Silver',
            description: 'Higher liquidity, better brand recognition, lower reversion.',
            cardName: '2017 Prizm Silver Patrick Mahomes RC',
            confidence: 84, intent: 'general',
          },
        ],
      },
    ],
  },
];

// ── Mock Daily Briefing ──────────────────────────────────────────────────────────

const MOCK_BRIEFING: DailyBriefing = {
  id: 'brief-2026-03-13',
  date: '2026-03-13',
  portfolioValue: 48_750,
  portfolioChangePct: 2.4,
  portfolioChange24h: 1_150,
  topMovers: [
    { cardName: '2023 Prizm Silver Wembanyama RC', changePct: 10.6, currentValue: 940, direction: 'up' },
    { cardName: '2024 Optic Caleb Williams RC', changePct: 44.4, currentValue: 260, direction: 'up' },
    { cardName: '2023 Topps Chrome Lamine Yamal RC', changePct: 18.3, currentValue: 1420, direction: 'up' },
    { cardName: '2020 Prizm Anthony Edwards RC', changePct: 13.6, currentValue: 1250, direction: 'up' },
    { cardName: '2017 Prizm Jaylen Brown RC', changePct: -9.5, currentValue: 380, direction: 'down' },
    { cardName: '2012 Topps Chrome Bryce Harper RC', changePct: -5.6, currentValue: 680, direction: 'down' },
  ],
  alerts: [
    { id: 'ba-001', message: 'Gary V mentioned your Wembanyama Prizm Silver — expect volatility', priority: 'critical', intent: 'market_alert' },
    { id: 'ba-002', message: 'Caleb Williams Optic spiking on TikTok hype — 65% reversion expected', priority: 'high', intent: 'market_alert' },
    { id: 'ba-003', message: 'PSA grading turnaround times dropped to 45 days — optimal window', priority: 'medium', intent: 'grading_advice' },
    { id: 'ba-004', message: 'Basketball over-concentration: 64% of portfolio (recommended max 40%)', priority: 'high', intent: 'rebalance' },
  ],
  recommendations: [
    { id: 'rec-001', title: 'Set Buy Alert for Wemby at $900', description: 'Hype decay model predicts floor at $890 within 72 hours. Strong buy opportunity.', intent: 'buy_signal', confidence: 68 },
    { id: 'rec-002', title: 'Take Profits on Caleb Williams Above $280', description: 'TikTok-driven spike with high reversion probability. Sell before decay.', intent: 'sell_signal', confidence: 72 },
    { id: 'rec-003', title: 'Submit Ohtani for PSA Grading', description: 'Raw-to-graded premium is 2.8x. Submission volumes are low — faster turnaround.', intent: 'grading_advice', confidence: 82 },
    { id: 'rec-004', title: 'Diversify into Baseball or Soccer', description: 'Portfolio is 64% basketball. Add Jackson Holliday or Lamine Yamal to rebalance.', intent: 'rebalance', confidence: 76 },
  ],
  performanceData: [
    { day: 'Mar 7', value: 46_200 },
    { day: 'Mar 8', value: 46_800 },
    { day: 'Mar 9', value: 47_100 },
    { day: 'Mar 10', value: 46_900 },
    { day: 'Mar 11', value: 47_400 },
    { day: 'Mar 12', value: 47_600 },
    { day: 'Mar 13', value: 48_750 },
  ],
  summary: 'Your portfolio gained $1,150 (+2.4%) in the last 24 hours, driven primarily by influencer-fueled spikes on Wembanyama and Caleb Williams. Caution: both are showing elevated hype decay risk. Basketball concentration remains high at 64%. Consider rebalancing into baseball or soccer assets.',
};

// ── Mock Proactive Nudges ────────────────────────────────────────────────────────

const MOCK_NUDGES: ProactiveNudge[] = [
  {
    id: 'nudge-001',
    message: 'Jaylen Brown Prizm dropped 9.5% — sell or hold?',
    detail: 'SportsCardsNonStop posted a bearish TikTok reaching 3.2M viewers. The card has been declining since the Finals hype faded. Consider selling to reduce basketball concentration.',
    priority: 'high',
    intent: 'sell_signal',
    cardName: '2017 Prizm Jaylen Brown RC',
    timestamp: '2026-03-13T07:30:00Z',
    isRead: false,
    actionLabel: 'Review Position',
  },
  {
    id: 'nudge-002',
    message: 'Grading window optimal for your Ohtani raw',
    detail: 'PSA regular service turnaround dropped to 45 days with submission volumes down 15%. The raw-to-PSA 10 premium is 2.8x ($4,800 raw → $13,400 graded). This is one of the best grading windows in 6 months.',
    priority: 'medium',
    intent: 'grading_advice',
    cardName: '2018 Bowman Chrome Shohei Ohtani RC',
    timestamp: '2026-03-13T08:00:00Z',
    isRead: false,
    actionLabel: 'Start Submission',
  },
  {
    id: 'nudge-003',
    message: 'Caleb Williams Optic spiking +44% on TikTok hype',
    detail: 'RipCity Cards TikTok drove a massive spike. Hype decay model predicts 65% reversion within 24 hours. If you own this card, consider taking profits above $280.',
    priority: 'critical',
    intent: 'market_alert',
    cardName: '2024 Optic Caleb Williams RC',
    timestamp: '2026-03-12T16:05:00Z',
    isRead: true,
    actionLabel: 'View Decay Curve',
  },
  {
    id: 'nudge-004',
    message: 'Portfolio rebalance needed — basketball at 64%',
    detail: 'Your basketball exposure is well above the recommended 40% maximum. Consider diversifying into baseball (Jackson Holliday) or soccer (Lamine Yamal) to reduce single-sport risk.',
    priority: 'high',
    intent: 'rebalance',
    timestamp: '2026-03-13T06:00:00Z',
    isRead: false,
    actionLabel: 'View Suggestions',
  },
  {
    id: 'nudge-005',
    message: 'Anthony Edwards Prizm up 13.6% — momentum building',
    detail: 'HoopsHype Cards posted a bullish take reaching 210K viewers. Edwards\' on-court performance supports the price movement. This signal has a 64% confidence rating with moderate reversion risk.',
    priority: 'medium',
    intent: 'buy_signal',
    cardName: '2020 Prizm Anthony Edwards RC',
    timestamp: '2026-03-12T19:10:00Z',
    isRead: true,
    actionLabel: 'View Analysis',
  },
  {
    id: 'nudge-006',
    message: 'Bryce Harper Topps Chrome trending down — exit signal',
    detail: 'CardCollector2 posted a bearish analysis. The card is down 5.6% and showing weak buy-side demand. Reliability score of 78% suggests this signal is trustworthy.',
    priority: 'medium',
    intent: 'sell_signal',
    cardName: '2012 Topps Chrome Bryce Harper RC',
    timestamp: '2026-03-10T16:00:00Z',
    isRead: true,
    actionLabel: 'Review Position',
  },
  {
    id: 'nudge-007',
    message: 'Lamine Yamal Topps Chrome — soccer breakout candidate',
    detail: 'GemMint10 Instagram post drove an 18.3% spike. Soccer card market is underrepresented in your portfolio and showing strong global growth trends.',
    priority: 'low',
    intent: 'buy_signal',
    cardName: '2023 Topps Chrome Lamine Yamal RC',
    timestamp: '2026-03-12T12:10:00Z',
    isRead: true,
    actionLabel: 'Research Card',
  },
];

// ── Mock Voice Commands ──────────────────────────────────────────────────────────

const MOCK_VOICE_COMMANDS: VoiceCommand[] = [
  {
    id: 'vc-001',
    transcript: 'What is my portfolio worth today?',
    parsedIntent: 'general',
    confidence: 95,
    response: 'Your portfolio is currently valued at $48,750, up $1,150 (+2.4%) from yesterday.',
    timestamp: '2026-03-13T08:30:00Z',
  },
  {
    id: 'vc-002',
    transcript: 'Should I sell my Jaylen Brown card?',
    parsedIntent: 'sell_signal',
    confidence: 88,
    response: 'The Jaylen Brown Prizm RC is down 9.5% and has a bearish influencer signal from SportsCardsNonStop. Given your basketball over-concentration at 64%, selling would help rebalance your portfolio.',
    timestamp: '2026-03-13T08:32:00Z',
  },
  {
    id: 'vc-003',
    transcript: 'Set a buy alert for Wemby at nine hundred dollars',
    parsedIntent: 'buy_signal',
    confidence: 92,
    response: 'Buy alert set for 2023 Prizm Silver Wembanyama RC at $900. You\'ll be notified when the price drops to this level.',
    timestamp: '2026-03-13T08:35:00Z',
  },
];

// ── Intent Classification ────────────────────────────────────────────────────────

const INTENT_KEYWORDS: Record<CopilotIntent, string[]> = {
  buy_signal: ['buy', 'purchase', 'acquire', 'add', 'pick up', 'target', 'undervalued', 'cheap', 'deal', 'alert'],
  sell_signal: ['sell', 'dump', 'exit', 'take profits', 'offload', 'get rid', 'overvalued', 'peaked'],
  rebalance: ['rebalance', 'diversify', 'concentration', 'heavy', 'allocate', 'redistribute', 'exposure', 'mix'],
  grading_advice: ['grade', 'grading', 'psa', 'bgs', 'sgc', 'submit', 'slab', 'raw', 'centering', 'corners'],
  market_alert: ['spike', 'crash', 'alert', 'hype', 'trending', 'viral', 'pump', 'dump', 'volatile', 'breaking'],
  general: ['worth', 'value', 'portfolio', 'how', 'what', 'which', 'compare', 'best', 'opinion', 'think'],
};

// ── Helper Functions ─────────────────────────────────────────────────────────────

function intentLabel(intent: CopilotIntent): string {
  const map: Record<CopilotIntent, string> = {
    buy_signal: 'Buy Signal',
    sell_signal: 'Sell Signal',
    rebalance: 'Rebalance',
    grading_advice: 'Grading Advice',
    market_alert: 'Market Alert',
    general: 'General',
  };
  return map[intent];
}

function intentColor(intent: CopilotIntent): string {
  const map: Record<CopilotIntent, string> = {
    buy_signal: 'text-emerald-400',
    sell_signal: 'text-red-400',
    rebalance: 'text-purple-400',
    grading_advice: 'text-sky-400',
    market_alert: 'text-amber-400',
    general: 'text-slate-400',
  };
  return map[intent];
}

function intentBadgeColor(intent: CopilotIntent): string {
  const map: Record<CopilotIntent, string> = {
    buy_signal: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    sell_signal: 'bg-red-500/20 text-red-400 border-red-500/40',
    rebalance: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    grading_advice: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
    market_alert: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    general: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  };
  return map[intent];
}

function priorityColor(priority: NudgePriority): string {
  const map: Record<NudgePriority, string> = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-amber-400',
    low: 'text-slate-400',
  };
  return map[priority];
}

function priorityBadgeColor(priority: NudgePriority): string {
  const map: Record<NudgePriority, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/40',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  };
  return map[priority];
}

// ── Public API ───────────────────────────────────────────────────────────────────

/** Get a conversation thread by ID */
export function getConversation(threadId: string): ConversationThread | null {
  return MOCK_THREADS.find(t => t.id === threadId) ?? null;
}

/** Get all conversation threads, sorted by most recent */
export function getAllConversations(): ConversationThread[] {
  return [...MOCK_THREADS].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/** Simulate sending a message and getting a copilot response */
export function sendMessage(threadId: string, content: string): CopilotMessage {
  const intent = getIntentFromQuery(content);
  const responses: Record<CopilotIntent, string> = {
    buy_signal: 'I\'ve analyzed the current market conditions and influencer signals. Based on recent social alpha data and price trends, this looks like a solid entry point. Let me pull up the hype decay model and liquidity metrics for a more detailed recommendation.',
    sell_signal: 'Looking at the sell-side indicators, I see some concerning signals. The influencer sentiment has shifted bearish, and the hype decay curve suggests further downside. Let me analyze your cost basis and tax implications before recommending an exit.',
    rebalance: 'Your portfolio allocation could use some adjustments. I\'m seeing over-concentration in certain areas and underexposure in sectors with strong upside potential. Let me model a few rebalancing scenarios for you.',
    grading_advice: 'I\'ve checked current grading turnaround times and the raw-to-graded premiums for this card. The economics look favorable right now. Let me break down the expected ROI across PSA, BGS, and SGC to find the best option.',
    market_alert: 'I\'m tracking this market movement closely. The social signal data shows this is primarily driven by influencer activity with a high probability of reversion. Let me quantify the expected decay timeline so you can make an informed decision.',
    general: 'Great question. Let me pull up the relevant data from your portfolio analytics, market trends, and social signals to give you a comprehensive answer.',
  };

  return {
    id: `msg-resp-${Date.now()}`,
    threadId,
    role: 'copilot',
    content: responses[intent],
    timestamp: new Date().toISOString(),
    intent,
  };
}

/** Get today's daily briefing */
export function getDailyBriefing(): DailyBriefing {
  return MOCK_BRIEFING;
}

/** Get all proactive nudges, sorted by priority and recency */
export function getProactiveNudges(): ProactiveNudge[] {
  const priorityOrder: Record<NudgePriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...MOCK_NUDGES].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    const priDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priDiff !== 0) return priDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

/** Parse a simulated voice command and return the result */
export function parseVoiceCommand(transcript: string): VoiceCommand {
  const intent = getIntentFromQuery(transcript);
  const existing = MOCK_VOICE_COMMANDS.find(vc =>
    transcript.toLowerCase().includes(vc.transcript.toLowerCase().split(' ').slice(0, 3).join(' '))
  );

  if (existing) return existing;

  return {
    id: `vc-${Date.now()}`,
    transcript,
    parsedIntent: intent,
    confidence: 75,
    response: `I understood your request about "${transcript}". Let me analyze your portfolio data and market signals to provide a response.`,
    timestamp: new Date().toISOString(),
  };
}

/** Get copilot suggestions based on current portfolio state */
export function getCopilotSuggestions(): CopilotSuggestion[] {
  const allSuggestions: CopilotSuggestion[] = [];
  for (const thread of MOCK_THREADS) {
    for (const msg of thread.messages) {
      if (msg.suggestions) {
        allSuggestions.push(...msg.suggestions);
      }
    }
  }
  return allSuggestions.sort((a, b) => b.confidence - a.confidence);
}

/** Classify intent from a natural language query */
export function getIntentFromQuery(query: string): CopilotIntent {
  const lower = query.toLowerCase();
  let bestIntent: CopilotIntent = 'general';
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [CopilotIntent, string[]][]) {
    const score = keywords.reduce((sum, kw) => sum + (lower.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestIntent;
}

// Re-export helpers for use in components
export {
  intentLabel,
  intentColor,
  intentBadgeColor,
  priorityColor,
  priorityBadgeColor,
};
