import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import AgentConsensusView from '../../components/AgentConsensusView';
import { buildConsensusView } from '../../lib/utils/agentReasoning';
import type { AgentInsight } from '../../types';

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

describe('AgentConsensusView', () => {
  it('renders per-agent stances and a split summary', () => {
    render(
      <AgentConsensusView
        view={buildConsensusView([
          agent(),
          agent({
            agentId: 'risk',
            agentName: 'Risk Warden',
            persona: 'Risk',
            insight: 'Wait for cleaner tape.',
            sentiment: 'negative',
            confidence: 0.7,
          }),
        ], 'Stay patient')}
      />,
    );

    expect(screen.getByRole('region', { name: /consensus view/i })).toBeInTheDocument();
    expect(screen.getByText(/consensus split/i)).toBeInTheDocument();
    expect(screen.getByText('Scout Prime')).toBeInTheDocument();
    expect(screen.getByText('Risk Warden')).toBeInTheDocument();
    expect(screen.getByText('Buy')).toBeInTheDocument();
    expect(screen.getByText('Wait')).toBeInTheDocument();
    expect(screen.getByText(/disagreement/i)).toBeInTheDocument();
    expect(screen.getByText(/thesis action: stay patient/i)).toBeInTheDocument();
  });

  it('discloses a missing committee instead of inventing stances', () => {
    render(<AgentConsensusView compact view={buildConsensusView([])} />);
    expect(screen.getByRole('status')).toHaveTextContent(/cannot be assembled/i);
  });
});
