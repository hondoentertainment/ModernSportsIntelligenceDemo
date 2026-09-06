import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ShareAlphaModal from '../../components/ShareAlphaModal';
import type { CardInventory, UserProfile } from '../../types';

const profile: UserProfile = {
  id: 'u1',
  username: 'ada',
  displayName: 'Ada Lovelace',
  isPublic: true,
  joinedAt: '2026-01-01',
  alphaScore: 88,
  portfolioValue: 12000,
  roi: 14,
  tier: 'All-Star',
};

const inventory: CardInventory[] = [
  {
    id: 'c1',
    player: 'Jackie Robinson',
    year: 1948,
    manufacturer: 'Leaf',
    cardNumber: '79',
    set: 'Leaf',
    sport: 'Baseball',
    league: 'MLB',
    isAutographed: false,
    condition: 'EX',
    isGraded: false,
    purchasePrice: 400,
    purchaseDate: '2020-01-01',
    currentValue: 900,
    status: 'active',
  },
];

describe('ShareAlphaModal embed', () => {
  it('shows an iframe snippet, disclosure, and widget preview', async () => {
    const user = userEvent.setup();
    render(
      <ShareAlphaModal
        isOpen
        onClose={() => undefined}
        profile={profile}
        inventory={inventory}
        onToggleVisibility={() => undefined}
      />
    );

    expect(screen.getByText(/embed widget/i)).toBeInTheDocument();
    expect(screen.getAllByText(/demo-honest/i).length).toBeGreaterThan(0);
    expect(screen.getByTitle('Collection widget preview')).toBeInTheDocument();
    expect(screen.getByText(/#\/p\/ada\?embed=1/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /copy iframe snippet/i }));
    expect(screen.getByRole('button', { name: /copied iframe/i })).toBeInTheDocument();
  });
});
