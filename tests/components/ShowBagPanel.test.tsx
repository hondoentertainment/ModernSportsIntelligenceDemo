import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ShowBagPanel from '../../components/ShowBagPanel';
import { makeCard } from '../helpers';
import { SHOW_BAG_DISCLOSURE, getPackedShowBagIds, getUnpackedShowBagIds } from '../../lib/utils/showBag';
import { toggleChecklistItem } from '../../lib/utils/cardShowModeService';
import { store } from '../../lib/dal/syncStore';
import type { TargetWatchlist } from '../../types';

describe('ShowBagPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    store.clear();
  });

  it('discloses local-only packing and lists default supplies when no cards are queued', () => {
    render(<ShowBagPanel inventory={[makeCard({ id: 'held' })]} targets={[]} />);
    expect(screen.getByRole('region', { name: /show bag packing list/i })).toBeInTheDocument();
    expect(screen.getByText(SHOW_BAG_DISCLOSURE)).toBeInTheDocument();
    const emptyOrSupplies =
      screen.queryByText(/nothing queued yet/i) || screen.queryByText(/supplies & prep/i);
    expect(emptyOrSupplies).toBeTruthy();
  });

  it('lists buy targets and toggles packed state', async () => {
    const user = userEvent.setup();
    const targets: TargetWatchlist[] = [
      {
        id: 't-wemby',
        player: 'Wembanyama',
        cardDescription: 'Prizm Silver',
        priority: 'High',
        targetPrice: 250,
        sport: 'Basketball',
        league: 'NBA',
        status: 'active',
        createdAt: '2026-01-01',
      },
    ];
    render(<ShowBagPanel inventory={[makeCard({ id: 'held' })]} targets={targets} />);

    expect(screen.getByText(/buy targets/i)).toBeInTheDocument();
    expect(screen.getByText(/Wembanyama/)).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', { name: /Wembanyama/i });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(getPackedShowBagIds()).toContain('target:t-wemby');
  });

  it('unchecks a pre-checked supply from the packing list', async () => {
    const user = userEvent.setup();
    toggleChecklistItem('cl-018');
    render(<ShowBagPanel inventory={[makeCard({ id: 'held' })]} targets={[]} />);
    const checkbox = screen.getByRole('checkbox', { name: /print want list/i });
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(getUnpackedShowBagIds()).toContain('supply:cl-018');
  });

  it('offers an HTML download without pulling jsPDF', async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => 'blob:show-bag');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });

    const targets: TargetWatchlist[] = [
      {
        id: 't-1',
        player: 'Skenes',
        cardDescription: 'Chrome',
        priority: 'High',
        targetPrice: 100,
        sport: 'Baseball',
        league: 'MLB',
        status: 'active',
        createdAt: '2026-01-01',
      },
    ];
    render(<ShowBagPanel inventory={[makeCard()]} targets={targets} />);
    await user.click(screen.getByRole('button', { name: /download html/i }));
    expect(createObjectURL).toHaveBeenCalled();
  });
});
