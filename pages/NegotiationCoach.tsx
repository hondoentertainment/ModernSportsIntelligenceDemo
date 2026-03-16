import React, { useState, useMemo } from 'react';
import { MessageSquare, Clock, TrendingDown, Target, BookOpen, AlertTriangle, Send, DollarSign, BarChart3, Zap, Shield, Users, ChevronRight, Timer, RefreshCw, ThumbsUp, ThumbsDown, Bot, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface Negotiation {
  id: string;
  cardName: string;
  seller: string;
  sellerRating: number;
  askingPrice: number;
  currentOffer: number;
  listingAgeDays: number;
  urgencyScore: number;
  urgencyLabel: 'Low' | 'Medium' | 'High' | 'Critical';
  priceDrops: number;
  platform: string;
  lastActivity: string;
  suggestedAction: string;
  status: 'active' | 'pending' | 'countered';
}

const mockNegotiations: Negotiation[] = [
  {
    id: 'n1',
    cardName: '2020 Panini Prizm Joe Burrow RC PSA 10',
    seller: 'CardKingCincinnati',
    sellerRating: 4.7,
    askingPrice: 1850,
    currentOffer: 0,
    listingAgeDays: 47,
    urgencyScore: 88,
    urgencyLabel: 'Critical',
    priceDrops: 3,
    platform: 'eBay',
    lastActivity: '2h ago',
    suggestedAction: 'Open at 62% of asking ($1,147). Seller listed 47 days ago — high urgency.',
    status: 'active',
  },
  {
    id: 'n2',
    cardName: '2018 Topps Update Juan Soto RC PSA 9',
    seller: 'DCSlabDealer',
    sellerRating: 4.9,
    askingPrice: 420,
    currentOffer: 340,
    listingAgeDays: 12,
    urgencyScore: 35,
    urgencyLabel: 'Low',
    priceDrops: 0,
    platform: 'COMC',
    lastActivity: '1d ago',
    suggestedAction: 'Seller is firm. Wait 2 weeks or match at $400.',
    status: 'countered',
  },
  {
    id: 'n3',
    cardName: '2021 Topps Chrome Wander Franco RC Auto',
    seller: 'RaysCollector99',
    sellerRating: 4.3,
    askingPrice: 2200,
    currentOffer: 1600,
    listingAgeDays: 31,
    urgencyScore: 72,
    urgencyLabel: 'High',
    priceDrops: 2,
    platform: 'eBay',
    lastActivity: '6h ago',
    suggestedAction: 'Counter at $1,760. Two price drops signal flexibility.',
    status: 'countered',
  },
  {
    id: 'n4',
    cardName: '2019 Optic Zion Williamson Holo PSA 10',
    seller: 'PelicansCards',
    sellerRating: 4.5,
    askingPrice: 780,
    currentOffer: 0,
    listingAgeDays: 63,
    urgencyScore: 94,
    urgencyLabel: 'Critical',
    priceDrops: 4,
    platform: 'Mercari',
    lastActivity: '30m ago',
    suggestedAction: 'Seller desperate — 63 days listed, 4 drops. Offer $460 (59%).',
    status: 'active',
  },
  {
    id: 'n5',
    cardName: '2022 Bowman Chrome Elly De La Cruz 1st Auto',
    seller: 'ProspectHunterOH',
    sellerRating: 4.8,
    askingPrice: 950,
    currentOffer: 750,
    listingAgeDays: 8,
    urgencyScore: 22,
    urgencyLabel: 'Low',
    priceDrops: 0,
    platform: 'eBay',
    lastActivity: '3h ago',
    suggestedAction: 'Fresh listing, strong seller. Patience play — revisit in 3 weeks.',
    status: 'pending',
  },
  {
    id: 'n6',
    cardName: '2020 Select Justin Herbert Tie-Dye /25 PSA 9',
    seller: 'ChargersVault',
    sellerRating: 4.2,
    askingPrice: 3400,
    currentOffer: 2400,
    listingAgeDays: 38,
    urgencyScore: 78,
    urgencyLabel: 'High',
    priceDrops: 2,
    platform: 'MySlabs',
    lastActivity: '12h ago',
    suggestedAction: 'Offer $2,650 — split the difference. Seller responded quickly last time.',
    status: 'countered',
  },
  {
    id: 'n7',
    cardName: '2023 Topps Chrome Victor Wembanyama RC PSA 10',
    seller: 'SpursNation_Cards',
    sellerRating: 4.6,
    askingPrice: 1200,
    currentOffer: 0,
    listingAgeDays: 5,
    urgencyScore: 15,
    urgencyLabel: 'Low',
    priceDrops: 0,
    platform: 'eBay',
    lastActivity: '1h ago',
    suggestedAction: 'New listing, high demand. Market price is $1,150 — offer $1,050.',
    status: 'active',
  },
  {
    id: 'n8',
    cardName: '2018 Panini National Treasures Luka Doncic RPA /99',
    seller: 'DallasMavStar',
    sellerRating: 4.4,
    askingPrice: 8500,
    currentOffer: 6000,
    listingAgeDays: 52,
    urgencyScore: 85,
    urgencyLabel: 'Critical',
    priceDrops: 3,
    platform: 'eBay',
    lastActivity: '4h ago',
    suggestedAction: 'High urgency — counter at $6,800. Seller has dropped 3x in 52 days.',
    status: 'countered',
  },
];

interface UrgencySignal {
  signal: string;
  weight: number;
  value: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

const mockUrgencySignals: UrgencySignal[] = [
  { signal: 'Listing Age', weight: 30, value: '47 days', impact: 'positive', description: 'Listings over 30 days indicate seller fatigue and willingness to negotiate' },
  { signal: 'Price Drops', weight: 25, value: '3 reductions', impact: 'positive', description: 'Multiple price reductions show desperation to sell' },
  { signal: 'Relist Count', weight: 15, value: '2 relists', impact: 'positive', description: 'Relisting signals failure to sell at previous terms' },
  { signal: 'Response Time', weight: 10, value: '< 1 hour', impact: 'positive', description: 'Fast responses indicate eagerness to close a deal' },
  { signal: 'Seller Inventory', weight: 10, value: '47 active', impact: 'neutral', description: 'High inventory sellers may accept lower margins for volume' },
  { signal: 'Market Trend', weight: 5, value: 'Declining -8%', impact: 'positive', description: 'Declining market makes sellers more willing to negotiate' },
  { signal: 'Competing Listings', weight: 5, value: '12 similar', impact: 'positive', description: 'High competition gives buyers leverage in negotiations' },
];

interface OfferDataPoint {
  percentage: number;
  acceptance: number;
  optimal: number;
}

const mockOfferRangeData: OfferDataPoint[] = [
  { percentage: 45, acceptance: 5, optimal: 0 },
  { percentage: 50, acceptance: 12, optimal: 0 },
  { percentage: 55, acceptance: 25, optimal: 10 },
  { percentage: 58, acceptance: 35, optimal: 30 },
  { percentage: 60, acceptance: 48, optimal: 55 },
  { percentage: 62, acceptance: 58, optimal: 72 },
  { percentage: 65, acceptance: 68, optimal: 65 },
  { percentage: 68, acceptance: 76, optimal: 48 },
  { percentage: 70, acceptance: 82, optimal: 35 },
  { percentage: 75, acceptance: 90, optimal: 18 },
  { percentage: 80, acceptance: 95, optimal: 8 },
  { percentage: 85, acceptance: 98, optimal: 3 },
  { percentage: 90, acceptance: 99, optimal: 1 },
];

interface TimingSlot {
  day: string;
  hour: string;
  score: number;
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];

const mockTimingHeatmap: TimingSlot[] = days.flatMap((day) =>
  hours.map((hour) => ({
    day,
    hour,
    score:
      day === 'Tue' && (hour === '8PM' || hour === '10PM')
        ? 95
        : day === 'Wed' && hour === '6PM'
          ? 90
          : day === 'Sun' && (hour === '8AM' || hour === '10AM')
            ? 88
            : day === 'Mon' && hour === '8AM'
              ? 42
              : day === 'Fri' && hour === '6PM'
                ? 82
                : day === 'Sat' && hour === '10AM'
                  ? 78
                  : Math.floor(Math.random() * 40) + 30,
  }))
);

interface SeasonalPattern {
  month: string;
  buyerPower: number;
  sellerUrgency: number;
}

const mockSeasonalData: SeasonalPattern[] = [
  { month: 'Jan', buyerPower: 72, sellerUrgency: 65 },
  { month: 'Feb', buyerPower: 68, sellerUrgency: 58 },
  { month: 'Mar', buyerPower: 55, sellerUrgency: 45 },
  { month: 'Apr', buyerPower: 48, sellerUrgency: 40 },
  { month: 'May', buyerPower: 45, sellerUrgency: 35 },
  { month: 'Jun', buyerPower: 50, sellerUrgency: 42 },
  { month: 'Jul', buyerPower: 60, sellerUrgency: 55 },
  { month: 'Aug', buyerPower: 65, sellerUrgency: 60 },
  { month: 'Sep', buyerPower: 70, sellerUrgency: 68 },
  { month: 'Oct', buyerPower: 62, sellerUrgency: 55 },
  { month: 'Nov', buyerPower: 78, sellerUrgency: 72 },
  { month: 'Dec', buyerPower: 85, sellerUrgency: 80 },
];

interface Playbook {
  id: string;
  name: string;
  icon: React.ReactNode;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  successRate: number;
  avgSavings: number;
  description: string;
  steps: string[];
  bestFor: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

const mockPlaybooks: Playbook[] = [
  {
    id: 'pb1',
    name: 'Lowball Anchor',
    icon: <Target className="w-5 h-5" />,
    difficulty: 'Intermediate',
    successRate: 64,
    avgSavings: 28,
    description: 'Start with an aggressively low offer to anchor the negotiation range in your favor. The initial number shapes all subsequent counteroffers.',
    steps: [
      'Research fair market value and recent comps thoroughly',
      'Open at 50-60% of asking price with comp justification',
      'Allow seller to counter — expect 85-90% of ask, then counter at 65-70%',
      'Close at 70-75% of original asking price with patience signals',
    ],
    bestFor: 'Listings aged 30+ days with motivated sellers',
    riskLevel: 'Medium',
  },
  {
    id: 'pb2',
    name: 'Patience Play',
    icon: <Timer className="w-5 h-5" />,
    difficulty: 'Beginner',
    successRate: 78,
    avgSavings: 18,
    description: 'Use time as your greatest weapon. Monitor the listing without engaging, wait for price drops, then strike when urgency peaks.',
    steps: [
      'Add listing to watchlist without making contact — monitor 2-4 weeks',
      'Track seller activity, inventory levels, and price reductions',
      'After 2+ price drops, initiate contact at last reduced price minus 10%',
      'Respond slowly (12-24h) to create inverse urgency and close at target',
    ],
    bestFor: 'New listings from sellers with large inventory',
    riskLevel: 'Low',
  },
  {
    id: 'pb3',
    name: 'Bundle Deal',
    icon: <Users className="w-5 h-5" />,
    difficulty: 'Advanced',
    successRate: 71,
    avgSavings: 32,
    description: 'Negotiate discounts by combining multiple purchases from the same seller. Volume creates incentive for the seller to reduce per-item pricing.',
    steps: [
      'Identify 3-5 cards from the same seller and calculate combined asking price',
      'Propose buying all items at 70-75% of combined asking',
      'Emphasize reduced shipping costs, single transaction, and immediate payment',
      'If seller resists bundle price, negotiate individual item values',
    ],
    bestFor: 'Sellers with 10+ cards you want from their inventory',
    riskLevel: 'Low',
  },
  {
    id: 'pb4',
    name: 'Competing Offers',
    icon: <Shield className="w-5 h-5" />,
    difficulty: 'Expert',
    successRate: 56,
    avgSavings: 35,
    description: 'Create perceived competition by referencing alternative listings. Works best when multiple sellers have similar inventory.',
    steps: [
      'Find 2-3 competing listings and screenshot or reference their prices',
      'Open negotiation mentioning you are comparing multiple options',
      'Share the lowest competing price as your benchmark — ask seller to beat it',
      'Be prepared to walk away — credibility is the key to this strategy',
    ],
    bestFor: 'Common cards with multiple sellers and price variance',
    riskLevel: 'High',
  },
  {
    id: 'pb5',
    name: 'Rapport Builder',
    icon: <ThumbsUp className="w-5 h-5" />,
    difficulty: 'Beginner',
    successRate: 82,
    avgSavings: 15,
    description: 'Build a personal connection with the seller before negotiating price. People give better deals to people they like.',
    steps: [
      'Compliment the seller\'s collection and ask about the card\'s provenance',
      'Share your collecting goals and why this card matters to you',
      'Mention you are a repeat buyer who leaves great reviews',
      'After building rapport, suggest a "fair deal for both of us" and close with gratitude',
    ],
    bestFor: 'Private sellers and small hobby shop dealers',
    riskLevel: 'Low',
  },
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const initialChatMessages: ChatMessage[] = [
  {
    id: 'c1',
    role: 'assistant',
    text: 'Welcome to AI Negotiation Coach. I can help you craft counter-offers, analyze seller urgency, and time your moves. What card are you negotiating for?',
    timestamp: '10:00 AM',
  },
];

const assistantResponses: Record<string, string> = {
  burrow: 'The 2020 Prizm Burrow RC PSA 10 at $1,850 has been listed for 47 days with 3 price drops. Seller urgency is Critical (88/100). I recommend opening at $1,147 (62%). The seller responded to the last inquiry within 45 minutes — they are eager. Send your offer Tuesday evening between 8-10 PM for highest acceptance probability.',
  counter: 'Based on the current spread, I suggest countering at 68% of the latest ask. Reference recent eBay comps that sold at $1,100-$1,250 range. Mention you can pay immediately via preferred payment method to incentivize acceptance.',
  timing: 'The optimal window for sending offers this week is Tuesday 8-10 PM or Wednesday around 6 PM. Sellers are most responsive and flexible during evening hours mid-week. Avoid Monday mornings — seller rejection rates are 34% higher.',
  strategy: 'For a listing this old (47 days), I recommend the Lowball Anchor strategy. Open at 60%, justify with comps, and be patient. The seller has already dropped price 3 times — they want to sell. Your target should be 68-72% of the original asking price.',
  default: 'I can help with that. Tell me the card name, asking price, and how long it has been listed. I will analyze the seller urgency signals and recommend your optimal opening offer, counter-offer strategy, and best timing to send it.',
};

// ─── Helper Components ────────────────────────────────────────────────────────

function getUrgencyColor(label: string): string {
  switch (label) {
    case 'Critical': return 'text-red-400';
    case 'High': return 'text-orange-400';
    case 'Medium': return 'text-yellow-400';
    default: return 'text-green-400';
  }
}

function getUrgencyBg(label: string): string {
  switch (label) {
    case 'Critical': return 'bg-red-500/20 border-red-500/30';
    case 'High': return 'bg-orange-500/20 border-orange-500/30';
    case 'Medium': return 'bg-yellow-500/20 border-yellow-500/30';
    default: return 'bg-green-500/20 border-green-500/30';
  }
}

function getStatusBadge(status: string): string {
  switch (status) {
    case 'active': return 'bg-lime-500/20 text-lime-400 border border-lime-500/30';
    case 'countered': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
  }
}

function getHeatColor(score: number): string {
  if (score >= 85) return 'bg-lime-500';
  if (score >= 70) return 'bg-lime-600';
  if (score >= 55) return 'bg-yellow-600';
  if (score >= 40) return 'bg-orange-700';
  return 'bg-red-900';
}

function getDifficultyColor(d: string): string {
  switch (d) {
    case 'Expert': return 'text-red-400';
    case 'Advanced': return 'text-orange-400';
    case 'Intermediate': return 'text-yellow-400';
    default: return 'text-green-400';
  }
}

function getRiskColor(r: string): string {
  switch (r) {
    case 'High': return 'text-red-400';
    case 'Medium': return 'text-yellow-400';
    default: return 'text-green-400';
  }
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-slate-300 text-sm font-medium mb-1">{label}% of asking</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  );
};

const SeasonalTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-slate-300 text-sm font-medium mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

type TabKey = 'negotiations' | 'urgency' | 'counter' | 'timing' | 'playbook';

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'negotiations', label: 'Active Negotiations', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'urgency', label: 'Urgency Analyzer', icon: <AlertTriangle className="w-4 h-4" /> },
  { key: 'counter', label: 'Counter-Offer Engine', icon: <Target className="w-4 h-4" /> },
  { key: 'timing', label: 'Timing Optimizer', icon: <Clock className="w-4 h-4" /> },
  { key: 'playbook', label: 'Playbook Library', icon: <BookOpen className="w-4 h-4" /> },
];

const NegotiationCoach: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('negotiations');
  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);
  const [askingPrice, setAskingPrice] = useState<string>('1850');
  const [listingAge, setListingAge] = useState<string>('47');
  const [priceDropCount, setPriceDropCount] = useState<string>('3');
  const [expandedPlaybook, setExpandedPlaybook] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [chatInput, setChatInput] = useState('');
  const [selectedUrgencyNeg, setSelectedUrgencyNeg] = useState<Negotiation>(mockNegotiations[0]);

  // Counter-offer calculation
  const counterOfferCalc = useMemo(() => {
    const price = parseFloat(askingPrice) || 0;
    const age = parseInt(listingAge) || 0;
    const drops = parseInt(priceDropCount) || 0;

    let urgencyMultiplier = 0;
    if (age > 45) urgencyMultiplier += 0.15;
    else if (age > 30) urgencyMultiplier += 0.10;
    else if (age > 14) urgencyMultiplier += 0.05;

    urgencyMultiplier += drops * 0.04;

    const baseDiscount = 0.30;
    const totalDiscount = Math.min(baseDiscount + urgencyMultiplier, 0.45);
    const recommendedOffer = Math.round(price * (1 - totalDiscount));
    const lowEnd = Math.round(price * (1 - totalDiscount - 0.05));
    const highEnd = Math.round(price * (1 - totalDiscount + 0.08));
    const percentage = Math.round((1 - totalDiscount) * 100);

    return { recommendedOffer, lowEnd, highEnd, percentage, urgencyMultiplier, totalDiscount };
  }, [askingPrice, listingAge, priceDropCount]);

  // Chat handler
  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const lower = chatInput.toLowerCase();
    let responseKey = 'default';
    if (lower.includes('burrow') || lower.includes('prizm')) responseKey = 'burrow';
    else if (lower.includes('counter') || lower.includes('offer')) responseKey = 'counter';
    else if (lower.includes('time') || lower.includes('when')) responseKey = 'timing';
    else if (lower.includes('strategy') || lower.includes('approach') || lower.includes('playbook')) responseKey = 'strategy';

    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: assistantResponses[responseKey],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, userMsg, assistantMsg]);
    setChatInput('');
  };

  // Urgency meter calculation for selected negotiation
  const urgencyBreakdown = useMemo(() => {
    const n = selectedUrgencyNeg;
    return [
      { label: 'Listing Age', score: Math.min(n.listingAgeDays * 1.5, 100), max: 100 },
      { label: 'Price Drops', score: Math.min(n.priceDrops * 22, 100), max: 100 },
      { label: 'Response Speed', score: n.urgencyScore > 70 ? 85 : 45, max: 100 },
      { label: 'Market Decline', score: n.urgencyScore > 60 ? 72 : 30, max: 100 },
      { label: 'Inventory Size', score: 55, max: 100 },
    ];
  }, [selectedUrgencyNeg]);

  // ─── Summary Stats ─────────────────────────────────────────────────────────
  const summaryStats = useMemo(() => {
    const critical = mockNegotiations.filter((n) => n.urgencyLabel === 'Critical').length;
    const avgUrgency = Math.round(mockNegotiations.reduce((s, n) => s + n.urgencyScore, 0) / mockNegotiations.length);
    const totalValue = mockNegotiations.reduce((s, n) => s + n.askingPrice, 0);
    const potentialSavings = Math.round(totalValue * 0.28);
    return { critical, avgUrgency, totalValue, potentialSavings, total: mockNegotiations.length };
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-lime-500/20 rounded-lg">
            <MessageSquare className="w-7 h-7 text-lime-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Negotiation Coach</h1>
            <p className="text-slate-400 text-sm">Real-time negotiation advisor — detect seller urgency, craft counter-offers, and optimize timing</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {[
            { label: 'Active Negotiations', value: summaryStats.total, icon: <MessageSquare className="w-5 h-5 text-lime-400" /> },
            { label: 'Critical Urgency', value: summaryStats.critical, icon: <AlertTriangle className="w-5 h-5 text-red-400" /> },
            { label: 'Avg Urgency Score', value: `${summaryStats.avgUrgency}/100`, icon: <Zap className="w-5 h-5 text-amber-400" /> },
            { label: 'Total Asking Value', value: `$${summaryStats.totalValue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5 text-emerald-400" /> },
            { label: 'Potential Savings', value: `$${summaryStats.potentialSavings.toLocaleString()}`, icon: <TrendingDown className="w-5 h-5 text-cyan-400" /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                {stat.icon}
                <span className="text-slate-400 text-xs">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content — spans 2 cols */}
        <div className="lg:col-span-2 space-y-6">

          {/* ══════════ Active Negotiations Tab ══════════ */}
          {activeTab === 'negotiations' && (
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-lime-400" />
                  Active Negotiations ({mockNegotiations.length})
                </h2>
                <div className="space-y-3">
                  {mockNegotiations.map((neg) => (
                    <div
                      key={neg.id}
                      onClick={() => setSelectedNegotiation(selectedNegotiation?.id === neg.id ? null : neg)}
                      className={`bg-slate-900 rounded-xl border p-4 cursor-pointer transition-all ${
                        selectedNegotiation?.id === neg.id
                          ? 'border-lime-500/50 ring-1 ring-lime-500/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white truncate">{neg.cardName}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {neg.seller} · {neg.platform} · {neg.sellerRating}★
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(neg.status)}`}>
                            {neg.status}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getUrgencyBg(neg.urgencyLabel)}`}>
                            <span className={getUrgencyColor(neg.urgencyLabel)}>{neg.urgencyLabel}</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 mt-3 text-center">
                        <div>
                          <p className="text-xs text-slate-500">Asking</p>
                          <p className="text-sm font-semibold text-white">${neg.askingPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Your Offer</p>
                          <p className="text-sm font-semibold text-white">
                            {neg.currentOffer > 0 ? `$${neg.currentOffer.toLocaleString()}` : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Listed</p>
                          <p className="text-sm font-semibold text-white">{neg.listingAgeDays}d</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Urgency</p>
                          <p className={`text-sm font-semibold ${getUrgencyColor(neg.urgencyLabel)}`}>{neg.urgencyScore}</p>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {selectedNegotiation?.id === neg.id && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <div className="bg-slate-800 rounded-lg p-3 mb-3">
                            <div className="flex items-start gap-2">
                              <Bot className="w-4 h-4 text-lime-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs text-lime-400 font-medium mb-1">AI Recommendation</p>
                                <p className="text-sm text-slate-300">{neg.suggestedAction}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex-1 bg-lime-500/20 text-lime-400 border border-lime-500/30 rounded-lg py-2 text-sm font-medium hover:bg-lime-500/30 transition-colors">
                              Send Offer
                            </button>
                            <button className="flex-1 bg-slate-700 text-slate-300 rounded-lg py-2 text-sm font-medium hover:bg-slate-600 transition-colors">
                              View Comps
                            </button>
                            <button className="bg-slate-700 text-slate-300 rounded-lg py-2 px-3 text-sm font-medium hover:bg-slate-600 transition-colors">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ Urgency Analyzer Tab ══════════ */}
          {activeTab === 'urgency' && (
            <div className="space-y-4">
              {/* Negotiation Selector */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Select Negotiation to Analyze
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mockNegotiations.map((neg) => (
                    <button
                      key={neg.id}
                      onClick={() => setSelectedUrgencyNeg(neg)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        selectedUrgencyNeg.id === neg.id
                          ? 'border-lime-500/50 bg-lime-500/10'
                          : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                      }`}
                    >
                      <p className="text-sm font-medium text-white truncate">{neg.cardName}</p>
                      <p className="text-xs text-slate-400">{neg.seller} · {neg.listingAgeDays}d listed</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Urgency Meter */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Urgency Meter — {selectedUrgencyNeg.cardName}
                </h2>

                {/* Overall Score */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative w-28 h-28 shrink-0">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#334155" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke={selectedUrgencyNeg.urgencyScore >= 80 ? '#ef4444' : selectedUrgencyNeg.urgencyScore >= 60 ? '#f97316' : '#84cc16'}
                        strokeWidth="8"
                        strokeDasharray={`${selectedUrgencyNeg.urgencyScore * 2.64} 264`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white">{selectedUrgencyNeg.urgencyScore}</span>
                      <span className={`text-xs font-medium ${getUrgencyColor(selectedUrgencyNeg.urgencyLabel)}`}>
                        {selectedUrgencyNeg.urgencyLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-300 mb-2">
                      <span className="font-medium text-white">{selectedUrgencyNeg.seller}</span> has had this listing for{' '}
                      <span className="text-amber-400 font-semibold">{selectedUrgencyNeg.listingAgeDays} days</span> with{' '}
                      <span className="text-amber-400 font-semibold">{selectedUrgencyNeg.priceDrops} price drop{selectedUrgencyNeg.priceDrops !== 1 ? 's' : ''}</span>.
                    </p>
                    <p className="text-sm text-slate-400">
                      Last activity: {selectedUrgencyNeg.lastActivity}. Platform: {selectedUrgencyNeg.platform}.
                    </p>
                  </div>
                </div>

                {/* Breakdown Bars */}
                <div className="space-y-3">
                  {urgencyBreakdown.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-white font-medium">{Math.round(item.score)}/100</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.score >= 75 ? 'bg-red-500' : item.score >= 50 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Urgency Signals Table */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Behavioral Signals
                </h2>
                <div className="space-y-3">
                  {mockUrgencySignals.map((sig) => (
                    <div key={sig.signal} className="bg-slate-900 rounded-lg border border-slate-700 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{sig.signal}</span>
                          <span className="text-xs text-slate-500">Weight: {sig.weight}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${
                            sig.impact === 'positive' ? 'text-lime-400' : sig.impact === 'negative' ? 'text-red-400' : 'text-slate-400'
                          }`}>
                            {sig.value}
                          </span>
                          {sig.impact === 'positive' ? (
                            <ThumbsUp className="w-3.5 h-3.5 text-lime-400" />
                          ) : sig.impact === 'negative' ? (
                            <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                          ) : null}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">{sig.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ Counter-Offer Engine Tab ══════════ */}
          {activeTab === 'counter' && (
            <div className="space-y-4">
              {/* Input Panel */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-lime-400" />
                  Counter-Offer Calculator
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Asking Price ($)</label>
                    <input
                      type="number"
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Listing Age (days)</label>
                    <input
                      type="number"
                      value={listingAge}
                      onChange={(e) => setListingAge(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Price Drops (#)</label>
                    <input
                      type="number"
                      value={priceDropCount}
                      onChange={(e) => setPriceDropCount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20"
                    />
                  </div>
                </div>

                {/* Result */}
                <div className="bg-slate-900 rounded-xl border border-lime-500/30 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-5 h-5 text-lime-400" />
                    <h3 className="text-sm font-semibold text-lime-400">AI Recommendation</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Low End</p>
                      <p className="text-lg font-bold text-amber-400">${counterOfferCalc.lowEnd.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Recommended Offer</p>
                      <p className="text-2xl font-bold text-lime-400">${counterOfferCalc.recommendedOffer.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">{counterOfferCalc.percentage}% of asking</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">High End</p>
                      <p className="text-lg font-bold text-cyan-400">${counterOfferCalc.highEnd.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 text-sm text-slate-300">
                    <p>
                      <span className="text-white font-medium">Reasoning: </span>
                      Listing age of {listingAge} days{parseInt(listingAge) > 30 ? ' exceeds the 30-day threshold, indicating seller fatigue' : ' is relatively fresh'}.
                      {parseInt(priceDropCount) > 0
                        ? ` With ${priceDropCount} price drop${parseInt(priceDropCount) > 1 ? 's' : ''}, the seller has demonstrated willingness to negotiate.`
                        : ' No price drops yet — seller may be firm.'
                      }{' '}
                      Open at ${counterOfferCalc.recommendedOffer.toLocaleString()} ({counterOfferCalc.percentage}%) and expect a counter around{' '}
                      ${Math.round((counterOfferCalc.recommendedOffer + parseFloat(askingPrice)) / 2).toLocaleString()}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Optimal Offer Range Chart */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Optimal Offer Range Analysis
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  The green area shows acceptance probability. The lime area shows the optimal value zone — where savings and acceptance overlap.
                </p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockOfferRangeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        dataKey="percentage"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="acceptance"
                        name="Acceptance Rate"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="optimal"
                        name="Optimal Value"
                        stroke="#84cc16"
                        fill="#84cc16"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/40 inline-block" /> Acceptance Rate</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-lime-500/40 inline-block" /> Optimal Value Zone</span>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ Timing Optimizer Tab ══════════ */}
          {activeTab === 'timing' && (
            <div className="space-y-4">
              {/* Heatmap */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-lime-400" />
                  Offer Acceptance Heatmap — Day & Time
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Brighter cells indicate higher acceptance rates. Send offers during peak windows for best results.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-xs text-slate-500 p-1 text-left w-12" />
                        {hours.map((h) => (
                          <th key={h} className="text-xs text-slate-500 p-1 text-center">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map((day) => (
                        <tr key={day}>
                          <td className="text-xs text-slate-400 font-medium p-1">{day}</td>
                          {hours.map((hour) => {
                            const slot = mockTimingHeatmap.find((s) => s.day === day && s.hour === hour);
                            const score = slot?.score || 0;
                            return (
                              <td key={`${day}-${hour}`} className="p-1">
                                <div
                                  className={`rounded-md h-9 flex items-center justify-center text-xs font-medium ${getHeatColor(score)} ${
                                    score >= 70 ? 'text-white' : 'text-slate-300'
                                  }`}
                                  title={`${day} ${hour}: ${score}% acceptance`}
                                >
                                  {score}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                  <span>Acceptance Rate:</span>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-3 rounded bg-red-900 inline-block" /> Low
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-3 rounded bg-orange-700 inline-block" /> Medium
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-3 rounded bg-yellow-600 inline-block" /> Good
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-3 rounded bg-lime-600 inline-block" /> Great
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-3 rounded bg-lime-500 inline-block" /> Peak
                  </div>
                </div>
              </div>

              {/* Seasonal Patterns */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-cyan-400" />
                  Seasonal Negotiation Patterns
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Buyer power peaks in December-January (post-holiday selling) and September (end of season sell-off).
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockSeasonalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip content={<SeasonalTooltip />} />
                      <Bar dataKey="buyerPower" name="Buyer Power" fill="#84cc16" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="sellerUrgency" name="Seller Urgency" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-lime-500 inline-block" /> Buyer Power</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-cyan-500 inline-block" /> Seller Urgency</span>
                </div>
              </div>

              {/* Key Insights */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Timing Insights
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: 'Best Day', value: 'Tuesday Evening', detail: '8-10 PM shows 95% peak acceptance', color: 'text-lime-400' },
                    { title: 'Worst Day', value: 'Monday Morning', detail: '8 AM shows only 42% acceptance rate', color: 'text-red-400' },
                    { title: 'Weekend Sweet Spot', value: 'Sunday Morning', detail: '8-10 AM — sellers check messages after coffee', color: 'text-cyan-400' },
                    { title: 'Best Season', value: 'Dec-Jan', detail: 'Post-holiday sellers need cash — max leverage', color: 'text-amber-400' },
                  ].map((insight) => (
                    <div key={insight.title} className="bg-slate-900 rounded-lg border border-slate-700 p-3">
                      <p className="text-xs text-slate-500 mb-1">{insight.title}</p>
                      <p className={`text-sm font-semibold ${insight.color}`}>{insight.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{insight.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ Playbook Library Tab ══════════ */}
          {activeTab === 'playbook' && (
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-lime-400" />
                  Negotiation Playbooks
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Pre-built strategies ranked by success rate. Click to expand step-by-step instructions.
                </p>
                <div className="space-y-3">
                  {mockPlaybooks.map((pb) => (
                    <div
                      key={pb.id}
                      className={`bg-slate-900 rounded-xl border transition-all ${
                        expandedPlaybook === pb.id ? 'border-lime-500/50 ring-1 ring-lime-500/20' : 'border-slate-700'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedPlaybook(expandedPlaybook === pb.id ? null : pb.id)}
                        className="w-full text-left p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg text-lime-400">
                              {pb.icon}
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-white">{pb.name}</h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-xs ${getDifficultyColor(pb.difficulty)}`}>{pb.difficulty}</span>
                                <span className="text-xs text-slate-500">·</span>
                                <span className="text-xs text-slate-400">Risk: <span className={getRiskColor(pb.riskLevel)}>{pb.riskLevel}</span></span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-lime-400">{pb.successRate}%</p>
                              <p className="text-xs text-slate-500">Success</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-cyan-400">{pb.avgSavings}%</p>
                              <p className="text-xs text-slate-500">Avg Savings</p>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expandedPlaybook === pb.id ? 'rotate-90' : ''}`} />
                          </div>
                        </div>
                      </button>

                      {expandedPlaybook === pb.id && (
                        <div className="px-4 pb-4 border-t border-slate-700 pt-4">
                          <p className="text-sm text-slate-300 mb-4">{pb.description}</p>

                          <div className="mb-4">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Step-by-Step</h4>
                            <div className="space-y-2">
                              {pb.steps.map((step, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="shrink-0 w-5 h-5 rounded-full bg-lime-500/20 text-lime-400 text-xs flex items-center justify-center font-semibold mt-0.5">
                                    {i + 1}
                                  </span>
                                  <p className="text-sm text-slate-300">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-slate-800 rounded-lg p-3">
                            <p className="text-xs text-slate-400">
                              <span className="font-medium text-white">Best for: </span>{pb.bestFor}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══════ Chat Assistant Panel (Right Sidebar) ═══════ */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col h-[700px] sticky top-6">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-lime-500/20 rounded-lg">
                  <Bot className="w-4 h-4 text-lime-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Negotiation Assistant</h3>
                  <p className="text-xs text-slate-400">Ask about strategies, timing, or specific deals</p>
                </div>
                <span className="ml-auto w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 ${
                      msg.role === 'user'
                        ? 'bg-lime-500/20 text-lime-100 border border-lime-500/30'
                        : 'bg-slate-900 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1 mb-1">
                        <Bot className="w-3 h-3 text-lime-400" />
                        <span className="text-xs text-lime-400 font-medium">Coach</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-lime-400/50' : 'text-slate-500'}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Suggestions */}
            <div className="px-4 py-2 border-t border-slate-700 shrink-0">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  'Analyze Burrow listing',
                  'Best counter strategy?',
                  'When should I send?',
                  'Playbook for this deal',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setChatInput(suggestion);
                    }}
                    className="text-xs bg-slate-900 text-slate-400 border border-slate-700 rounded-full px-2.5 py-1 hover:text-lime-400 hover:border-lime-500/30 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-slate-700 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleChatSend();
                  }}
                  placeholder="Ask about a negotiation..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20"
                />
                <button
                  onClick={handleChatSend}
                  className="p-2 bg-lime-500/20 text-lime-400 rounded-lg hover:bg-lime-500/30 transition-colors border border-lime-500/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NegotiationCoach;
