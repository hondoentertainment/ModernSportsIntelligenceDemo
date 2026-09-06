import { describe, expect, it } from 'vitest';
import type {
  AgentInsight,
  AgentRecommendationRecord,
  AutonomousAction,
  CollaborativeThesis,
} from '../../types';
import {
  DERIVED_REASONING_DISCLOSURE,
  MISSING_AGENT_REASONING,
  MISSING_COMMITTEE_REASONING,
  buildWhyFromAction,
  buildWhyFromAgent,
  buildWhyFromBriefing,
  buildWhyFromPricing,
  buildWhyFromRecommendation,
  buildWhyFromThesis,
  detectCommitteeConflicts,
} from '../../lib/utils/agentReasoning';

function agent(overrides: Partial<AgentInsight> = {}): AgentInsight {
  return {
    agentId: 'scout',
    agentName: 'Scout Prime',
    persona: 'Performance',
    insight: 'Buy the breakout.',
    sentiment: 'positive',
    confidence: 0.8,
    ...overrides,
  };
}

function thesis(overrides: Partial<CollaborativeThesis> = {}): CollaborativeThesis {
  return {
    id: 'thesis-1',
    summary: 'Balanced book',
    keyTakeaways: ['Hold core', 'Trim hype'],
    riskAssessment: 'Moderate concentration',
    recommendedAction: 'Hold and harvest',
    agents: [agent()],
    createdAt: '2026-09-06T00:00:00.000Z',
    ...overrides,
  };
}

function action(overrides: Partial<AutonomousAction> = {}): AutonomousAction {
  return {
    id: 'act-1',
    type: 'BUY',
    assetName: 'Ohtani',
    amount: 200,
    rationale: '',
    timestamp: '2026-09-06T00:00:00.000Z',
    status: 'pending',
    ...overrides,
  };
}

describe('detectCommitteeConflicts', () => {
  it('returns empty for missing or empty committees', () => {
    expect(detectCommitteeConflicts(undefined)).toEqual([]);
    expect(detectCommitteeConflicts(null)).toEqual([]);
    expect(detectCommitteeConflicts([])).toEqual([]);
  });

  it('returns logged notes and a split when bullish and bearish coexist', () => {
    const notes = detectCommitteeConflicts([
      agent({ conflictNotes: ['I dissent on timing.', 'I dissent on timing.'] }),
      agent({
        agentId: 'risk',
        agentName: 'Risk Warden',
        sentiment: 'negative',
        insight: 'Wait.',
        conflictNotes: ['  '],
      }),
    ]);
    expect(notes).toEqual([
      'I dissent on timing.',
      'Committee split: Scout Prime bullish vs Risk Warden bearish.',
    ]);
  });

  it('falls back to agentId when name is blank', () => {
    const notes = detectCommitteeConflicts([
      agent({ agentName: '  ', sentiment: 'positive' }),
      agent({ agentId: 'risk', agentName: '', sentiment: 'negative' }),
    ]);
    expect(notes[0]).toContain('scout bullish vs risk bearish');
  });
});

describe('buildWhyFromAgent', () => {
  it('reports missing reasoning when only a conclusion exists', () => {
    const view = buildWhyFromAgent(agent({ reasoningChain: ['', '   '] }));
    expect(view.provenance).toBe('missing');
    expect(view.missingReason).toBe(MISSING_AGENT_REASONING);
    expect(view.reasoningChain).toEqual([]);
    expect(view.conclusion).toBe('Buy the breakout.');
    expect(view.agentId).toBe('scout');
  });

  it('keeps a logged chain and merges committee conflicts', () => {
    const view = buildWhyFromAgent(
      agent({
        reasoningChain: ['Pop is tight', 'Breakout score 80'],
        conflictNotes: ['Timing is early'],
      }),
      [
        agent(),
        agent({ agentId: 'risk', agentName: 'Risk Warden', sentiment: 'negative', insight: 'Wait' }),
      ],
    );
    expect(view.provenance).toBe('logged');
    expect(view.missingReason).toBeNull();
    expect(view.reasoningChain).toEqual(['Pop is tight', 'Breakout score 80']);
    expect(view.conflictNotes).toEqual([
      'Timing is early',
      'Committee split: Scout Prime bullish vs Risk Warden bearish.',
    ]);
  });

  it('normalizes blank identity fields', () => {
    const view = buildWhyFromAgent(
      agent({
        agentId: '  ',
        agentName: '',
        persona: undefined as unknown as string,
        insight: undefined as unknown as string,
      }),
    );
    expect(view.agentId).toBe('unknown');
    expect(view.agentName).toBe('Unknown agent');
    expect(view.persona).toBe('');
    expect(view.conclusion).toBe('');
  });

  it('drops non-string chain items and non-string identity', () => {
    const view = buildWhyFromAgent(
      agent({
        agentId: 9 as unknown as string,
        agentName: 8 as unknown as string,
        reasoningChain: [1, 'Comps hold', null] as unknown as string[],
      }),
    );
    expect(view.agentId).toBe('unknown');
    expect(view.agentName).toBe('Unknown agent');
    expect(view.reasoningChain).toEqual(['Comps hold']);
    expect(view.provenance).toBe('logged');
  });
});

describe('buildWhyFromThesis', () => {
  it('uses committee missing copy when no agent logged a chain', () => {
    const view = buildWhyFromThesis(thesis({ agents: [agent(), agent({ agentId: 'market', insight: 'Fade' })] }));
    expect(view.agentId).toBe('committee');
    expect(view.agentName).toBe('Investment Committee');
    expect(view.provenance).toBe('missing');
    expect(view.missingReason).toBe(MISSING_COMMITTEE_REASONING);
    expect(view.supportingNotes).toEqual(['Hold core', 'Trim hype', 'Risk: Moderate concentration']);
    expect(view.conclusion).toBe('Hold and harvest');
  });

  it('prefixes logged steps with agent names and falls back to summary', () => {
    const view = buildWhyFromThesis(
      thesis({
        recommendedAction: '   ',
        summary: 'Stay liquid',
        riskAssessment: '  ',
        keyTakeaways: undefined as unknown as string[],
        agents: [
          agent({ reasoningChain: ['Comps support entry'] }),
          agent({
            agentId: 'market',
            agentName: 'Market Sentinel',
            reasoningChain: ['Seasonal bid'],
          }),
        ],
      }),
    );
    expect(view.provenance).toBe('logged');
    expect(view.conclusion).toBe('Stay liquid');
    expect(view.reasoningChain).toEqual([
      'Scout Prime: Comps support entry',
      'Market Sentinel: Seasonal bid',
    ]);
    expect(view.supportingNotes).toEqual([]);
  });

  it('treats a non-array agents field as empty', () => {
    const view = buildWhyFromThesis(thesis({ agents: undefined as unknown as AgentInsight[] }));
    expect(view.provenance).toBe('missing');
    expect(view.conflictNotes).toEqual([]);
  });

  it('ignores non-string thesis copy', () => {
    const view = buildWhyFromThesis(
      thesis({
        recommendedAction: 1 as unknown as string,
        summary: 2 as unknown as string,
        riskAssessment: 3 as unknown as string,
        keyTakeaways: ['Keep dry powder'],
      }),
    );
    expect(view.conclusion).toBe('');
    expect(view.supportingNotes).toEqual(['Keep dry powder']);
  });
});

describe('buildWhyFromRecommendation', () => {
  const base: AgentRecommendationRecord = {
    id: 'rec-1',
    source: 'war-room',
    summary: 'Committee hold',
    recommendedAction: 'Hold',
    status: 'queued',
    keyTakeaways: ['Stay patient'],
    agents: [agent()],
    createdAt: '2026-09-06T00:00:00.000Z',
  };

  it('stays missing when neither chain nor action rationales exist', () => {
    const view = buildWhyFromRecommendation(base);
    expect(view.provenance).toBe('missing');
    expect(view.missingReason).toBe(MISSING_COMMITTEE_REASONING);
  });

  it('defaults optional recommendation fields when omitted', () => {
    const view = buildWhyFromRecommendation({
      ...base,
      keyTakeaways: undefined as unknown as string[],
      riskAssessment: undefined,
      agents: undefined as unknown as AgentInsight[],
      executionPlan: undefined,
    });
    expect(view.provenance).toBe('missing');
    expect(view.supportingNotes).toEqual([]);
    expect(view.conflictNotes).toEqual([]);
  });

  it('ignores a non-array execution plan and non-string action notes', () => {
    const invalidPlan = buildWhyFromRecommendation({
      ...base,
      executionPlan: 'nope' as unknown as AgentRecommendationRecord['executionPlan'],
    });
    expect(invalidPlan.provenance).toBe('missing');

    const nonStringNotes = buildWhyFromRecommendation({
      ...base,
      executionPlan: [
        action({ rationale: 1 as unknown as string, policyReason: 2 as unknown as string }),
      ],
    });
    expect(nonStringNotes.provenance).toBe('missing');
    expect(nonStringNotes.reasoningChain).toEqual([]);
  });

  it('derives a chain from execution-plan rationales when agents did not log one', () => {
    const view = buildWhyFromRecommendation({
      ...base,
      executionPlan: [
        action({ rationale: 'Edge vs ask', policyReason: 'Under collar' }),
        action({ type: 'HOLD', assetName: 'Judge', rationale: '  ', policyReason: '' }),
      ],
    });
    expect(view.provenance).toBe('derived');
    expect(view.missingReason).toBeNull();
    expect(view.reasoningChain).toEqual(['BUY Ohtani: Edge vs ask', 'Policy: Under collar']);
    expect(DERIVED_REASONING_DISCLOSURE).toMatch(/reconstructed from stored signals/i);
  });

  it('keeps logged chains and appends action notes as supporting', () => {
    const view = buildWhyFromRecommendation({
      ...base,
      agents: [agent({ reasoningChain: ['Pop 1 premium'] })],
      executionPlan: [action({ rationale: 'Fill at 180' })],
    });
    expect(view.provenance).toBe('logged');
    expect(view.reasoningChain).toEqual(['Scout Prime: Pop 1 premium']);
    expect(view.supportingNotes).toContain('BUY Ohtani: Fill at 180');
  });
});

describe('buildWhyFromAction', () => {
  it('uses derived provenance for a single rationale', () => {
    const view = buildWhyFromAction(action({ rationale: 'Collar allows the bid', confidence: 0.6 }));
    expect(view.provenance).toBe('derived');
    expect(view.agentName).toBe('Strategist Prime');
    expect(view.reasoningChain).toEqual(['Collar allows the bid']);
    expect(view.confidence).toBe(0.6);
  });

  it('reports missing when there is no rationale', () => {
    const view = buildWhyFromAction(action({ policyReason: 'Needs approval' }));
    expect(view.provenance).toBe('missing');
    expect(view.missingReason).toBe(MISSING_AGENT_REASONING);
    expect(view.supportingNotes).toEqual(['Needs approval']);
  });

  it('ignores non-string rationale and policy fields', () => {
    const view = buildWhyFromAction(
      action({
        rationale: 12 as unknown as string,
        policyReason: 4 as unknown as string,
      }),
    );
    expect(view.provenance).toBe('missing');
    expect(view.reasoningChain).toEqual([]);
    expect(view.supportingNotes).toEqual([]);
  });
});

describe('buildWhyFromPricing', () => {
  it('derives steps from playbook reasoning', () => {
    const view = buildWhyFromPricing({
      reasoning: 'Seller accepts 18% off.',
      suggestedStrategy: 'Open at 72% of ask.',
      targetPrice: 1600,
      playbookLabel: 'Fair Market Anchor',
      confidence: 72,
    });
    expect(view.provenance).toBe('derived');
    expect(view.agentName).toBe('Acquisition Agent');
    expect(view.persona).toBe('Fair Market Anchor');
    expect(view.conclusion).toBe('Target settlement $1,600');
    expect(view.reasoningChain).toHaveLength(2);
  });

  it('reports missing when pricing has no explanation', () => {
    const view = buildWhyFromPricing({ targetPrice: Number.NaN });
    expect(view.provenance).toBe('missing');
    expect(view.conclusion).toBe('');
    expect(view.persona).toBe('Deal negotiation');
  });

  it('ignores non-string pricing copy', () => {
    const view = buildWhyFromPricing({
      reasoning: 1 as unknown as string,
      suggestedStrategy: 2 as unknown as string,
      playbookLabel: 3 as unknown as string,
    });
    expect(view.provenance).toBe('missing');
    expect(view.persona).toBe('Deal negotiation');
  });
});

describe('buildWhyFromBriefing', () => {
  it('derives a chain from details and action items', () => {
    const view = buildWhyFromBriefing({
      agentId: 'risk',
      agentName: 'Sentinel',
      persona: 'Risk Agent',
      headline: 'Concentration is high',
      details: 'Top 3 names are 62% of NAV.',
      actionItems: ['Trim hype', 'Trim hype', '  '],
    });
    expect(view.provenance).toBe('derived');
    expect(view.reasoningChain).toEqual(['Top 3 names are 62% of NAV.', 'Trim hype']);
  });

  it('reports missing when briefing has no supporting text', () => {
    const view = buildWhyFromBriefing({
      agentId: 'scout',
      agentName: 'Atlas',
      persona: 'Scout Agent',
      headline: '  ',
      actionItems: undefined,
    });
    expect(view.provenance).toBe('missing');
    expect(view.conclusion).toBe('');
  });

  it('ignores non-string headline and details', () => {
    const view = buildWhyFromBriefing({
      agentId: 'market',
      agentName: 'Apex',
      persona: 'Market Agent',
      headline: 7 as unknown as string,
      details: 8 as unknown as string,
    });
    expect(view.conclusion).toBe('');
    expect(view.provenance).toBe('missing');
  });
});
