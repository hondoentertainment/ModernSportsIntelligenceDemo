import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LocalCardShows from '../../pages/LocalCardShows';

vi.mock('../../lib/utils/useSupabaseInventory', () => ({
  useSupabaseInventory: () => ({
    inventory: [],
    targets: [],
  }),
}));

describe('LocalCardShows page', () => {
  it('shows the seeded calendar and an honest empty location state', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LocalCardShows />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /local card shows/i })).toBeInTheDocument();
    expect(screen.getByText(/not a live promoter feed/i)).toBeInTheDocument();
    expect(screen.getAllByText(/distance unknown/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/NYC Monthly Card Meetup/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Javits Center North Hall/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /trip budget/i })).toBeInTheDocument();
    expect(screen.getByText(/filing a buy or a sale writes what you typed/i)).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /floor calls/i }));
    expect(screen.getByText(/no buy or sell calls on this show yet/i)).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /recap/i }));
    expect(screen.getByText(/no floor calls logged/i)).toBeInTheDocument();
  });

  it('clears the list when the city filter matches nothing', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LocalCardShows />
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText(/city or venue/i), 'zzzz-no-city');
    expect(screen.getByText(/no seeded shows match/i)).toBeInTheDocument();
  });
});
