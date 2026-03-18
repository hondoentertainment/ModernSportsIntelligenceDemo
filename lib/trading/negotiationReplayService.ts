// AI Negotiation Replay Theater — Phase 231
// Record, replay, and study negotiation sessions like game film

export interface NegotiationReplay {
  id: string;
  title: string;
  cardName: string;
  player: string;
  counterparty: string;
  date: string;
  duration: number;
  outcome: 'won' | 'lost' | 'walked' | 'compromised';
  startPrice: number;
  finalPrice: number;
  targetPrice: number;
  savingsVsAsk: number;
  moves: NegotiationMove[];
  aiAnalysis: ReplayAnalysis;
  tags: string[];
}

export interface NegotiationMove {
  id: string;
  turn: number;
  actor: 'buyer' | 'seller';
  type: 'offer' | 'counter' | 'anchor' | 'concession' | 'walkaway-threat' | 'information-reveal' | 'deadline-pressure' | 'bundle-proposal';
  amount: number;
  message: string;
  tacticalScore: number;
  emotionalTone: 'confident' | 'aggressive' | 'conciliatory' | 'desperate' | 'neutral' | 'firm';
  timestamp: number;
}

export interface ReplayAnalysis {
  overallGrade: string;
  tacticalScore: number;
  emotionalControl: number;
  anchoringEffectiveness: number;
  concessionPattern: string;
  missedOpportunities: string[];
  strongMoves: string[];
  lessonsLearned: string[];
  improvementAreas: string[];
}

export interface NegotiationPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  avgSavings: number;
  bestAgainst: string;
  winRate: number;
}

const MOCK_REPLAYS: NegotiationReplay[] = [
  { id: 'nr-1', title: 'Ohtani RC — Patience Pays Off', cardName: '2018 Topps Update Shohei Ohtani RC PSA 10', player: 'Shohei Ohtani', counterparty: 'premium_cards_tx', date: '2026-03-14', duration: 34, outcome: 'won', startPrice: 520, finalPrice: 385, targetPrice: 400, savingsVsAsk: 25.9, moves: [
    { id: 'm-1', turn: 1, actor: 'seller', type: 'anchor', amount: 520, message: 'Firm at $520, recent comps support this price.', tacticalScore: 72, emotionalTone: 'confident', timestamp: 0 },
    { id: 'm-2', turn: 2, actor: 'buyer', type: 'counter', amount: 340, message: 'I see PSA 10s moving at $350-380 range. Starting at $340.', tacticalScore: 85, emotionalTone: 'firm', timestamp: 120 },
    { id: 'm-3', turn: 3, actor: 'seller', type: 'counter', amount: 480, message: 'Can come down a bit. $480 is my best.', tacticalScore: 58, emotionalTone: 'conciliatory', timestamp: 340 },
    { id: 'm-4', turn: 4, actor: 'buyer', type: 'information-reveal', amount: 360, message: 'Last 5 eBay sales averaged $372. Happy to wait for the right price at $360.', tacticalScore: 91, emotionalTone: 'confident', timestamp: 680 },
    { id: 'm-5', turn: 5, actor: 'seller', type: 'concession', amount: 420, message: 'Meet in the middle? $420 shipped.', tacticalScore: 45, emotionalTone: 'desperate', timestamp: 1020 },
    { id: 'm-6', turn: 6, actor: 'buyer', type: 'walkaway-threat', amount: 375, message: 'Appreciate it but max is $375. Have another lined up at $380.', tacticalScore: 88, emotionalTone: 'firm', timestamp: 1250 },
    { id: 'm-7', turn: 7, actor: 'seller', type: 'concession', amount: 385, message: 'Split the difference — $385 and we deal.', tacticalScore: 52, emotionalTone: 'conciliatory', timestamp: 1580 },
    { id: 'm-8', turn: 8, actor: 'buyer', type: 'offer', amount: 385, message: 'Deal at $385. Sending payment now.', tacticalScore: 78, emotionalTone: 'confident', timestamp: 1620 },
  ], aiAnalysis: { overallGrade: 'A', tacticalScore: 88, emotionalControl: 92, anchoringEffectiveness: 85, concessionPattern: 'Controlled — only 2 small concessions', missedOpportunities: ['Could have asked for free shipping as additional concession'], strongMoves: ['Data-backed counter (#4) shifted power', 'Walkaway threat (#6) was well-timed with alternative'], lessonsLearned: ['Patience and data citations are highly effective', 'Sellers concede faster when alternative offers mentioned'], improvementAreas: ['Consider bundle offers for additional leverage'] }, tags: ['patience', 'data-driven', 'walkaway'] },
  { id: 'nr-2', title: 'Wemby Prizm — Impulse Buy Autopsy', cardName: '2023 Panini Prizm Victor Wembanyama RC Silver', player: 'Victor Wembanyama', counterparty: 'hoops_grails_99', date: '2026-03-10', duration: 8, outcome: 'lost', startPrice: 1200, finalPrice: 1150, targetPrice: 950, savingsVsAsk: 4.2, moves: [
    { id: 'm-9', turn: 1, actor: 'seller', type: 'anchor', amount: 1200, message: 'Silver Prizm PSA 10. Won\'t last at $1,200.', tacticalScore: 82, emotionalTone: 'aggressive', timestamp: 0 },
    { id: 'm-10', turn: 2, actor: 'buyer', type: 'counter', amount: 1000, message: 'Interested! Would you take $1,000?', tacticalScore: 45, emotionalTone: 'desperate', timestamp: 60 },
    { id: 'm-11', turn: 3, actor: 'seller', type: 'deadline-pressure', amount: 1180, message: 'Have 2 others interested. Best I can do is $1,180 if you move now.', tacticalScore: 90, emotionalTone: 'aggressive', timestamp: 180 },
    { id: 'm-12', turn: 4, actor: 'buyer', type: 'concession', amount: 1150, message: 'OK, $1,150 right now.', tacticalScore: 28, emotionalTone: 'desperate', timestamp: 240 },
  ], aiAnalysis: { overallGrade: 'D+', tacticalScore: 35, emotionalControl: 28, anchoringEffectiveness: 40, concessionPattern: 'Rapid capitulation — folded in 2 moves', missedOpportunities: ['Should have researched comps before engaging', 'Never challenged the deadline pressure claim', 'Jumped $150 in one concession — too much'], strongMoves: ['Initial counter was in the right direction'], lessonsLearned: ['FOMO and urgency are seller tactics — always verify competing offers', 'Never concede more than 5% in a single move', 'Research comps before negotiations, not during'], improvementAreas: ['Emotional discipline', 'Pre-negotiation research', 'Counter-pressure techniques'] }, tags: ['impulse', 'fomo', 'lesson'] },
  { id: 'nr-3', title: 'Griffey UD RC — Bundle Strategy Win', cardName: '1989 Upper Deck Ken Griffey Jr RC #1 PSA 9', player: 'Ken Griffey Jr', counterparty: 'vintage_kings_chi', date: '2026-03-08', duration: 45, outcome: 'compromised', startPrice: 280, finalPrice: 425, targetPrice: 420, savingsVsAsk: 0, moves: [
    { id: 'm-13', turn: 1, actor: 'buyer', type: 'anchor', amount: 200, message: 'Interested in the Griffey PSA 9 and the Ripken PSA 8. Would you do $200 for the Griffey?', tacticalScore: 78, emotionalTone: 'confident', timestamp: 0 },
    { id: 'm-14', turn: 2, actor: 'seller', type: 'counter', amount: 280, message: '$280 firm on the Griffey. Ripken is $185 separately.', tacticalScore: 70, emotionalTone: 'firm', timestamp: 180 },
    { id: 'm-15', turn: 3, actor: 'buyer', type: 'bundle-proposal', amount: 380, message: 'What if I take both? $380 for the pair — that\'s $465 worth, saves you two shipping costs.', tacticalScore: 92, emotionalTone: 'confident', timestamp: 420 },
    { id: 'm-16', turn: 4, actor: 'seller', type: 'counter', amount: 440, message: 'Appreciate the bundle idea. Could do $440 for both.', tacticalScore: 68, emotionalTone: 'conciliatory', timestamp: 720 },
    { id: 'm-17', turn: 5, actor: 'buyer', type: 'counter', amount: 400, message: '$400 is my ceiling for the pair. Both are fair market at best.', tacticalScore: 82, emotionalTone: 'firm', timestamp: 960 },
    { id: 'm-18', turn: 6, actor: 'seller', type: 'concession', amount: 425, message: 'Final offer: $425 shipped with tracking. That\'s $40 off for you.', tacticalScore: 72, emotionalTone: 'firm', timestamp: 1200 },
    { id: 'm-19', turn: 7, actor: 'buyer', type: 'offer', amount: 425, message: 'Deal. $425 shipped for both. Sending now.', tacticalScore: 70, emotionalTone: 'neutral', timestamp: 1350 },
  ], aiAnalysis: { overallGrade: 'B+', tacticalScore: 78, emotionalControl: 85, anchoringEffectiveness: 72, concessionPattern: 'Moderate — bundle strategy created value for both sides', missedOpportunities: ['Could have pushed harder at $400 with a walkaway'], strongMoves: ['Bundle proposal (#3) changed the negotiation dynamic', 'Ceiling statement (#5) was credible and effective'], lessonsLearned: ['Bundling creates win-win value that single-card negotiations miss', 'Saving seller on shipping costs is real leverage'], improvementAreas: ['Could be more patient with counter-timing'] }, tags: ['bundle', 'vintage', 'multi-card'] },
];

const MOCK_PATTERNS: NegotiationPattern[] = [
  { id: 'np-1', name: 'Data-Backed Counter', description: 'Lead with specific comparable sales data to anchor realistic expectations', frequency: 34, avgSavings: 18.5, bestAgainst: 'Emotional sellers with inflated prices', winRate: 72 },
  { id: 'np-2', name: 'Bundle Value Creator', description: 'Combine multiple items to create savings opportunities for both parties', frequency: 22, avgSavings: 12.8, bestAgainst: 'Dealers with multiple listings', winRate: 68 },
  { id: 'np-3', name: 'Patient Walkaway', description: 'Establish a firm ceiling and demonstrate willingness to walk away', frequency: 28, avgSavings: 22.1, bestAgainst: 'Motivated sellers and auction losers', winRate: 65 },
  { id: 'np-4', name: 'Deadline Reversal', description: 'Counter urgency pressure by creating your own competing deadlines', frequency: 12, avgSavings: 15.4, bestAgainst: 'Pressure sellers using fake competing offers', winRate: 58 },
  { id: 'np-5', name: 'Condition Leverage', description: 'Use subtle condition concerns to justify lower offers on ungraded cards', frequency: 18, avgSavings: 20.3, bestAgainst: 'Sellers with raw cards or questionable grades', winRate: 71 },
];

export function getReplays(): NegotiationReplay[] { return [...MOCK_REPLAYS]; }
export function getPatterns(): NegotiationPattern[] { return [...MOCK_PATTERNS]; }
export function getAvgSavings(): number { const wins = MOCK_REPLAYS.filter(r => r.outcome === 'won'); return wins.length ? wins.reduce((s, r) => s + r.savingsVsAsk, 0) / wins.length : 0; }
export function getTotalReplays(): number { return MOCK_REPLAYS.length; }

export default { getReplays, getPatterns, getAvgSavings, getTotalReplays };
