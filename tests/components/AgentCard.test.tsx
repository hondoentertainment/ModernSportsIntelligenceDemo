import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import AgentCard from '../../components/AgentCard';
import { MISSING_AGENT_REASONING } from '../../lib/utils/agentReasoning';
import type { AgentInsight } from '../../types';

const scout: AgentInsight = {
  agentId: 'scout',
  agentName: 'Scout Prime',
  persona: 'Performance Analytics Specialist',
  insight: 'Prospect bid looks early but supported.',
  sentiment: 'positive',
  confidence: 0.81,
};

describe('AgentCard', () => {
  it('renders the insight and an expandable why panel with missing-reasoning copy', async () => {
    const user = userEvent.setup();
    render(<AgentCard agent={scout} />);

    expect(screen.getByText('Scout Prime')).toBeInTheDocument();
    expect(screen.getByText(/prospect bid looks early/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /why this recommendation/i }));
    expect(screen.getByRole('status')).toHaveTextContent(MISSING_AGENT_REASONING);
  });

  it('surfaces a logged chain and committee conflict notes', async () => {
    const user = userEvent.setup();
    const risk: AgentInsight = {
      agentId: 'risk',
      agentName: 'Risk Warden',
      persona: 'Stability',
      insight: 'Wait for a cleaner entry.',
      sentiment: 'negative',
      confidence: 0.7,
    };

    render(
      <AgentCard
        agent={{
          ...scout,
          reasoningChain: ['Breakout score 78', 'Comps beat ask'],
        }}
        committee={[scout, risk]}
      />,
    );

    await user.click(screen.getByRole('button', { name: /why this recommendation/i }));
    expect(screen.getByText('Breakout score 78')).toBeInTheDocument();
    expect(screen.getByText(/committee split/i)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('does not render the why panel while loading', () => {
    render(<AgentCard agent={scout} isLoading />);
    expect(screen.queryByRole('button', { name: /why this recommendation/i })).not.toBeInTheDocument();
  });
});
