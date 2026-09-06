import type {
  AgentInsight,
  AgentRecommendationRecord,
  AutonomousAction,
  CollaborativeThesis,
} from '../../types';

/** How the why-panel obtained its steps. */
export type ReasoningProvenance = 'logged' | 'derived' | 'missing';

export interface WhyRecommendationView {
  agentId: string;
  agentName: string;
  persona: string;
  sentiment?: AgentInsight['sentiment'];
  /** 0–1 when known; values above 1 are treated as already-percent in the UI. */
  confidence?: number;
  conclusion: string;
  reasoningChain: string[];
  conflictNotes: string[];
  supportingNotes: string[];
  provenance: ReasoningProvenance;
  missingReason: string | null;
}

export const MISSING_AGENT_REASONING =
  'This agent logged a conclusion only. No step-by-step reasoning was stored for this run.';

export const MISSING_COMMITTEE_REASONING =
  'The committee recorded a recommendation, but no per-agent reasoning chain was stored for this run.';

export const DERIVED_REASONING_DISCLOSURE =
  'These steps were reconstructed from stored signals (rationale, policy notes, or takeaways) — not a logged agent reasoning chain.';

export interface PricingWhyInput {
  reasoning?: string;
  suggestedStrategy?: string;
  targetPrice?: number;
  playbookLabel?: string;
  confidence?: number;
}

export interface BriefingWhyInput {
  agentId: string;
  agentName: string;
  persona: string;
  headline: string;
  details?: string;
  actionItems?: string[];
}

function asTrimmedList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

function uniqueStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

function agentLabel(agent: Pick<AgentInsight, 'agentId' | 'agentName'>): string {
  const name = typeof agent.agentName === 'string' ? agent.agentName.trim() : '';
  if (name) return name;
  const id = typeof agent.agentId === 'string' ? agent.agentId.trim() : '';
  return id || 'Unknown agent';
}

/**
 * Surface logged dissent plus a deterministic split when bullish and bearish
 * agents appear in the same committee.
 */
export function detectCommitteeConflicts(agents: AgentInsight[] | null | undefined): string[] {
  if (!Array.isArray(agents) || agents.length === 0) return [];

  const notes = agents.flatMap((agent) => asTrimmedList(agent.conflictNotes));
  const bullish = agents
    .filter((agent) => agent.sentiment === 'positive')
    .map((agent) => agentLabel(agent));
  const bearish = agents
    .filter((agent) => agent.sentiment === 'negative')
    .map((agent) => agentLabel(agent));

  if (bullish.length > 0 && bearish.length > 0) {
    notes.push(`Committee split: ${bullish.join(', ')} bullish vs ${bearish.join(', ')} bearish.`);
  }

  return uniqueStrings(notes);
}

export function buildWhyFromAgent(
  agent: AgentInsight,
  committee: AgentInsight[] = [],
): WhyRecommendationView {
  const reasoningChain = asTrimmedList(agent.reasoningChain);
  const provenance: ReasoningProvenance = reasoningChain.length > 0 ? 'logged' : 'missing';

  return {
    agentId: typeof agent.agentId === 'string' && agent.agentId.trim() ? agent.agentId : 'unknown',
    agentName: agentLabel(agent),
    persona: typeof agent.persona === 'string' ? agent.persona : '',
    sentiment: agent.sentiment,
    confidence: agent.confidence,
    conclusion: typeof agent.insight === 'string' ? agent.insight.trim() : '',
    reasoningChain,
    conflictNotes: uniqueStrings([
      ...asTrimmedList(agent.conflictNotes),
      ...detectCommitteeConflicts(committee),
    ]),
    supportingNotes: [],
    provenance,
    missingReason: provenance === 'missing' ? MISSING_AGENT_REASONING : null,
  };
}

export function buildWhyFromThesis(thesis: CollaborativeThesis): WhyRecommendationView {
  const agents = Array.isArray(thesis.agents) ? thesis.agents : [];
  const logged = agents.flatMap((agent) =>
    asTrimmedList(agent.reasoningChain).map((step) => `${agentLabel(agent)}: ${step}`),
  );
  const risk = typeof thesis.riskAssessment === 'string' ? thesis.riskAssessment.trim() : '';
  const supportingNotes = uniqueStrings([
    ...asTrimmedList(thesis.keyTakeaways),
    risk ? `Risk: ${risk}` : '',
  ].filter((note) => note.length > 0));
  const provenance: ReasoningProvenance = logged.length > 0 ? 'logged' : 'missing';
  const action = typeof thesis.recommendedAction === 'string' ? thesis.recommendedAction.trim() : '';
  const summary = typeof thesis.summary === 'string' ? thesis.summary.trim() : '';

  return {
    agentId: 'committee',
    agentName: 'Investment Committee',
    persona: 'Multi-agent consensus',
    conclusion: action || summary,
    reasoningChain: logged,
    conflictNotes: detectCommitteeConflicts(agents),
    supportingNotes,
    provenance,
    missingReason: provenance === 'missing' ? MISSING_COMMITTEE_REASONING : null,
  };
}

function actionSupportingNotes(plan: AutonomousAction[] | undefined): string[] {
  if (!Array.isArray(plan)) return [];
  return uniqueStrings(
    plan.flatMap((action) => {
      const notes: string[] = [];
      const rationale = typeof action.rationale === 'string' ? action.rationale.trim() : '';
      const policy = typeof action.policyReason === 'string' ? action.policyReason.trim() : '';
      const label = `${action.type} ${action.assetName}`.trim();
      if (rationale) notes.push(`${label}: ${rationale}`);
      if (policy) notes.push(`Policy: ${policy}`);
      return notes;
    }),
  );
}

export function buildWhyFromRecommendation(rec: AgentRecommendationRecord): WhyRecommendationView {
  const thesisLike = buildWhyFromThesis({
    id: rec.id,
    summary: rec.summary,
    keyTakeaways: rec.keyTakeaways ?? [],
    riskAssessment: rec.riskAssessment ?? '',
    recommendedAction: rec.recommendedAction,
    agents: rec.agents ?? [],
    executionPlan: rec.executionPlan,
    createdAt: rec.createdAt,
  });
  const derived = actionSupportingNotes(rec.executionPlan);

  if (thesisLike.provenance === 'logged') {
    return {
      ...thesisLike,
      supportingNotes: uniqueStrings([...thesisLike.supportingNotes, ...derived]),
    };
  }

  if (derived.length > 0) {
    return {
      ...thesisLike,
      reasoningChain: derived,
      provenance: 'derived',
      missingReason: null,
    };
  }

  return thesisLike;
}

export function buildWhyFromAction(action: AutonomousAction): WhyRecommendationView {
  const rationale = typeof action.rationale === 'string' ? action.rationale.trim() : '';
  const policy = typeof action.policyReason === 'string' ? action.policyReason.trim() : '';
  const hasRationale = rationale.length > 0;

  return {
    agentId: 'strategist',
    agentName: 'Strategist Prime',
    persona: 'Autonomous execution',
    confidence: action.confidence,
    conclusion: `${action.type} ${action.assetName}`.trim(),
    reasoningChain: hasRationale ? [rationale] : [],
    conflictNotes: [],
    supportingNotes: policy ? [policy] : [],
    provenance: hasRationale ? 'derived' : 'missing',
    missingReason: hasRationale ? null : MISSING_AGENT_REASONING,
  };
}

export function buildWhyFromPricing(input: PricingWhyInput): WhyRecommendationView {
  const reasoning = typeof input.reasoning === 'string' ? input.reasoning.trim() : '';
  const strategy = typeof input.suggestedStrategy === 'string' ? input.suggestedStrategy.trim() : '';
  const chain = [reasoning, strategy].filter((step) => step.length > 0);
  const target =
    typeof input.targetPrice === 'number' && Number.isFinite(input.targetPrice)
      ? `Target settlement $${input.targetPrice.toLocaleString()}`
      : '';

  return {
    agentId: 'negotiator',
    agentName: 'Acquisition Agent',
    persona: typeof input.playbookLabel === 'string' ? input.playbookLabel : 'Deal negotiation',
    confidence: input.confidence,
    conclusion: target,
    reasoningChain: chain,
    conflictNotes: [],
    supportingNotes: [],
    provenance: chain.length > 0 ? 'derived' : 'missing',
    missingReason: chain.length > 0 ? null : MISSING_AGENT_REASONING,
  };
}

export function buildWhyFromBriefing(input: BriefingWhyInput): WhyRecommendationView {
  const details = typeof input.details === 'string' ? input.details.trim() : '';
  const actions = asTrimmedList(input.actionItems);
  const chain = uniqueStrings([details, ...actions].filter((step) => step.length > 0));

  return {
    agentId: input.agentId,
    agentName: input.agentName,
    persona: input.persona,
    conclusion: typeof input.headline === 'string' ? input.headline.trim() : '',
    reasoningChain: chain,
    conflictNotes: [],
    supportingNotes: [],
    provenance: chain.length > 0 ? 'derived' : 'missing',
    missingReason: chain.length > 0 ? null : MISSING_AGENT_REASONING,
  };
}
