import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import AcquisitionProposal from '../../components/AcquisitionProposal';
import { MISSING_COMMITTEE_REASONING } from '../../lib/utils/agentReasoning';
import type { JointAcquisitionProposal } from '../../types';

const proposal: JointAcquisitionProposal = {
  id: 'proposal-1',
  title: 'Ohtani pool',
  targetCardId: 'card-1',
  targetPrice: 2500,
  currentFunding: 250,
  minEntry: 250,
  participants: [],
  votes: [],
  quorumPercent: 60,
  approvalStatus: 'pending',
  status: 'open',
  expiryDate: new Date(Date.now() + 86400000).toISOString(),
  agentEvaluation: {
    id: 't1',
    summary: 'Stage diligence and vote',
    keyTakeaways: ['Target raise: $2,500'],
    riskAssessment: 'Moderate',
    recommendedAction: 'Stage diligence and vote',
    agents: [],
    createdAt: new Date().toISOString(),
  },
};

describe('AcquisitionProposal', () => {
  it('exposes an honest missing-reasoning why panel on specialist consensus', async () => {
    const user = userEvent.setup();
    render(<AcquisitionProposal proposal={proposal} />);

    expect(screen.getByText(/specialist consensus/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /why this recommendation/i }));
    expect(screen.getByRole('status')).toHaveTextContent(MISSING_COMMITTEE_REASONING);
    expect(screen.getByText('Target raise: $2,500')).toBeInTheDocument();
  });
});
