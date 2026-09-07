import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import CompsUsedPanel from '../../components/CompsUsedPanel';
import { COMPS_USED_AI_ONLY, COMPS_USED_CONSENSUS } from '../../lib/pricing/compConsensus';

describe('CompsUsedPanel', () => {
  it('stays collapsed until opened and lists comps', async () => {
    const user = userEvent.setup();
    render(
      <CompsUsedPanel
        view={{
          method: 'sold-comp-consensus',
          rows: [
            { title: '2023 Chrome RC', price: 210, soldAt: '2026-08-15', fresh: true, condition: 'PSA 10' },
          ],
          median: 210,
          disclosure: COMPS_USED_CONSENSUS,
          emptyReason: null,
        }}
      />,
    );

    expect(screen.getByRole('button', { name: /comps used/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region', { name: /comps used/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /comps used/i }));
    expect(screen.getByRole('region', { name: /comps used/i })).toHaveTextContent('2023 Chrome RC');
    expect(screen.getByText('$210')).toBeInTheDocument();
    expect(screen.getByText(/median/i)).toBeInTheDocument();
  });

  it('discloses an AI-only path when no comps exist', () => {
    render(
      <CompsUsedPanel
        defaultOpen
        compact
        view={{
          method: 'ai-estimate',
          rows: [],
          median: null,
          disclosure: COMPS_USED_AI_ONLY,
          emptyReason: COMPS_USED_AI_ONLY,
        }}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(/AI estimate/i);
  });
});
