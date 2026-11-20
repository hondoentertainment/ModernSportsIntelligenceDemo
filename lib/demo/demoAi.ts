/**
 * Canned committee, arbitrage, and sentiment copy for a public demo session.
 * Loaded only when a demo session asks for AI. Clearly not a model reply.
 */
import type { CardInventory, CollaborativeThesis, CrossAssetInsight } from '../../types';

const DEMO_STAMP = '2026-09-01T00:00:00.000Z';

export const DEMO_PORTFOLIO_SENTIMENT =
  'Demo data: the seeded book holds a trim on Riley Greene and a fill on the favorites desk. This is a canned note, not a live model read.';

function bookLabel(inventory: CardInventory[]): string {
  const names = inventory
    .map((card) => card.player)
    .filter((name): name is string => typeof name === 'string' && name.length > 0)
    .slice(0, 3);
  return names.length > 0 ? names.join(', ') : 'the seeded book';
}

export function buildDemoCollaborativeThesis(
  inventory: CardInventory[],
  includeStrategist: boolean,
): CollaborativeThesis {
  const book = bookLabel(inventory);
  const lead = inventory[0]?.player || 'the seeded book';
  return {
    id: 'demo-intelligence-committee',
    summary: `Demo data: the committee is offline. A canned note on ${book} stands in for a live convening.`,
    keyTakeaways: [
      'Demo data only — not a model reply.',
      'The seeded tape names a trim on the full book and a fill on favorites.',
      'Sign up to run the live intelligence committee.',
    ],
    riskAssessment: 'Demo data: risk is illustrative. No live liquidity check ran.',
    recommendedAction: 'Demo data: read the seeded tape, then sign up for a live thesis.',
    agents: [
      {
        agentId: 'scout',
        agentName: 'Scout Prime',
        persona: 'Performance Analytics Specialist',
        insight: `Demo data: ${lead} is scored from the seeded tape, not a live stat feed.`,
        sentiment: 'neutral',
        confidence: 0.5,
        reasoningChain: ['Read the on-device demo tape', 'Skipped live performance data'],
      },
      {
        agentId: 'market',
        agentName: 'Market Sentinel',
        persona: 'Macro Trend Expert',
        insight: 'Demo data: liquidity here is the synthetic tape, not a live market.',
        sentiment: 'neutral',
        confidence: 0.5,
        reasoningChain: ['Use seeded price history', 'Do not call the model'],
      },
      {
        agentId: 'risk',
        agentName: 'Risk Warden',
        persona: 'Portfolio Stability Analyst',
        insight: 'Demo data: concentration is shown from the seeded book only.',
        sentiment: 'neutral',
        confidence: 0.5,
        reasoningChain: ['Count seeded holdings', 'No live downside feed'],
      },
      {
        agentId: 'negotiator',
        agentName: 'The Closer',
        persona: 'Acquisition Strategy Specialist',
        insight: 'Demo data: no live bid is staged from this session.',
        sentiment: 'neutral',
        confidence: 0.5,
        reasoningChain: ['Demo mode is read-only', 'Sign up to negotiate'],
      },
      ...(includeStrategist
        ? [
            {
              agentId: 'strategist',
              agentName: 'Strategist Prime',
              persona: 'Autonomous Execution Lead',
              insight: 'Demo data: auto-pilot stays a hold. Nothing is sent to a venue.',
              sentiment: 'neutral' as const,
              confidence: 0.5,
              reasoningChain: ['Demo session blocks live orders', 'Hold the seeded book'],
            },
          ]
        : []),
    ],
    executionPlan: includeStrategist
      ? [
          {
            id: 'demo-hold',
            type: 'HOLD',
            assetName: lead,
            amount: 0,
            rationale: 'Demo data: no live order is staged.',
            timestamp: DEMO_STAMP,
            status: 'pending',
          },
        ]
      : undefined,
    recommendationId: 'demo-intelligence-committee',
    createdAt: DEMO_STAMP,
    runMetadata: {
      inputHash: 'demo-seeded-book',
      promptVersion: 'demo-canned',
      modelId: 'demo-canned',
      includeStrategist,
    },
  };
}

export function buildDemoCrossAssetInsight(): CrossAssetInsight {
  return {
    id: 'demo-arbitrage-committee',
    summary:
      'Demo data: the arbitrage committee is offline. These nodes are canned illustrations, not a live cross-asset scan.',
    liquidityFlightStatus: 'Stable',
    topArbitrageNodes: [
      {
        id: 'demo-node-greene',
        sourceAsset: { name: '2019 Riley Greene Silver /499', assetClass: 'Sports Cards', currentValue: 2000 },
        targetAsset: { name: 'Entry sports watch (illustration)', assetClass: 'Luxury Watches', currentValue: 2200 },
        correlationDelta: 4,
        opportunityScore: 55,
        rationale: 'Demo data: a seeded card versus a canned watch, not a live quote.',
        status: 'active',
        createdAt: DEMO_STAMP,
      },
      {
        id: 'demo-node-julio',
        sourceAsset: { name: '2019 Julio Rodriguez Paper', assetClass: 'Sports Cards', currentValue: 280 },
        targetAsset: { name: 'Print edition (illustration)', assetClass: 'Fine Art', currentValue: 320 },
        correlationDelta: 2,
        opportunityScore: 40,
        rationale: 'Demo data: favorites-desk fill, not a live art comp.',
        status: 'active',
        createdAt: DEMO_STAMP,
      },
      {
        id: 'demo-node-abrams',
        sourceAsset: { name: '2019 CJ Abrams Silver /499', assetClass: 'Sports Cards', currentValue: 100 },
        targetAsset: { name: 'Stable hold (illustration)', assetClass: 'Sports Cards', currentValue: 100 },
        correlationDelta: 0,
        opportunityScore: 20,
        rationale: 'Demo data: flat seeded tape. No live capital-flight signal.',
        status: 'active',
        createdAt: DEMO_STAMP,
      },
    ],
    agents: [
      {
        agentId: 'chronos',
        agentName: 'Chronos',
        persona: 'Horological Equity Specialist',
        insight: 'Demo data: watch prices in this panel are illustrations.',
        sentiment: 'neutral',
        confidence: 0.5,
      },
      {
        agentId: 'canvas',
        agentName: 'Canvas Analyst',
        persona: 'Fine Art Liquidity Expert',
        insight: 'Demo data: no live art tape was queried.',
        sentiment: 'neutral',
        confidence: 0.5,
      },
      {
        agentId: 'link',
        agentName: 'Asset Link',
        persona: 'Cross-Sector Arbitrage Specialist',
        insight: 'Demo data: the link between cards and other assets is canned.',
        sentiment: 'neutral',
        confidence: 0.5,
      },
    ],
    createdAt: DEMO_STAMP,
  };
}
