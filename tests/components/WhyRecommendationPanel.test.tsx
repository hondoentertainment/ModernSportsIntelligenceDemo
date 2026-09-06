import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import WhyRecommendationPanel from '../../components/WhyRecommendationPanel';
import {
  DERIVED_REASONING_DISCLOSURE,
  MISSING_AGENT_REASONING,
  type WhyRecommendationView,
} from '../../lib/utils/agentReasoning';

function view(overrides: Partial<WhyRecommendationView> = {}): WhyRecommendationView {
  return {
    agentId: 'scout',
    agentName: 'Scout Prime',
    persona: 'Performance Analytics Specialist',
    sentiment: 'positive',
    confidence: 0.84,
    conclusion: 'Buy the breakout.',
    reasoningChain: [],
    conflictNotes: [],
    supportingNotes: [],
    provenance: 'missing',
    missingReason: MISSING_AGENT_REASONING,
    ...overrides,
  };
}

describe('WhyRecommendationPanel', () => {
  it('stays collapsed until opened and shows an honest missing-reasoning state', async () => {
    const user = userEvent.setup();
    render(<WhyRecommendationPanel view={view()} />);

    const toggle = screen.getByRole('button', { name: /why this recommendation/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region', { name: /why this recommendation/i })).not.toBeInTheDocument();
    expect(screen.queryByText(MISSING_AGENT_REASONING)).not.toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const region = screen.getByRole('region', { name: /why this recommendation/i });
    expect(region).toHaveTextContent('Scout Prime');
    expect(region).toHaveTextContent('Performance Analytics Specialist');
    expect(region).toHaveTextContent('84% conf');
    expect(screen.getByRole('status')).toHaveTextContent(MISSING_AGENT_REASONING);
    expect(screen.queryByText(DERIVED_REASONING_DISCLOSURE)).not.toBeInTheDocument();
  });

  it('renders a logged chain, conflicts, and supporting notes when open', async () => {
    const user = userEvent.setup();
    render(
      <WhyRecommendationPanel
        defaultOpen
        view={view({
          provenance: 'logged',
          missingReason: null,
          confidence: 91,
          reasoningChain: ['Pop is tight', 'Comps confirm bid'],
          conflictNotes: ['Risk Warden wants to wait'],
          supportingNotes: ['Risk: Moderate concentration'],
        })}
      />,
    );

    expect(screen.getByRole('region', { name: /why this recommendation/i })).toBeInTheDocument();
    expect(screen.getByText('Pop is tight')).toBeInTheDocument();
    expect(screen.getByText('Comps confirm bid')).toBeInTheDocument();
    expect(screen.getByText('Risk Warden wants to wait')).toBeInTheDocument();
    expect(screen.getByText('Risk: Moderate concentration')).toBeInTheDocument();
    expect(screen.getByText('91% conf')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /why this recommendation/i }));
    expect(screen.queryByRole('region', { name: /why this recommendation/i })).not.toBeInTheDocument();
  });

  it('discloses derived reconstruction instead of claiming a logged chain', () => {
    render(
      <WhyRecommendationPanel
        defaultOpen
        compact
        view={view({
          provenance: 'derived',
          missingReason: null,
          sentiment: undefined,
          confidence: undefined,
          persona: '',
          conclusion: '',
          reasoningChain: ['Collar allows the bid'],
        })}
      />,
    );

    expect(screen.getByText(DERIVED_REASONING_DISCLOSURE)).toBeInTheDocument();
    expect(screen.getByText('Collar allows the bid')).toBeInTheDocument();
    expect(screen.queryByText(/conf/i)).not.toBeInTheDocument();
  });
});
