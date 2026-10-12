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
  it('shows the seeded calendar and an honest empty location state', () => {
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
