import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { store } from '../../lib/dal/syncStore';
import { SHOW_ALERT_LOG_KEY, SHOW_ALERT_PREFS_KEY } from '../../lib/shows/showAlerts';
import LocalCardShows from '../../pages/LocalCardShows';

vi.mock('../../lib/utils/useSupabaseInventory', () => ({
  useSupabaseInventory: () => ({
    inventory: [],
    targets: [],
    addCard: vi.fn(),
    updateCard: vi.fn(),
  }),
}));

beforeEach(() => {
  store.remove(SHOW_ALERT_PREFS_KEY);
  store.remove(SHOW_ALERT_LOG_KEY);
});

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

  it('arms a home radius and records an in-app alert for a nearby seeded show', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LocalCardShows />
      </MemoryRouter>,
    );
    const alerts = await screen.findByRole('region', { name: /show alerts/i });
    expect(within(alerts).getByText(/alerts are off/i)).toBeInTheDocument();
    await user.selectOptions(within(alerts).getByLabelText(/show alert home/i), 'New York, NY');
    const lead = within(alerts).getByLabelText(/days before the show/i);
    await user.clear(lead);
    await user.type(lead, '366');
    await user.click(within(alerts).getByRole('checkbox', { name: /enable show alerts/i }));
    expect(await within(alerts).findByRole('button', { name: /mark nyc monthly card meetup alert read/i })).toBeInTheDocument();
    expect(within(alerts).getAllByText(/owner-held VAPID/i).length).toBeGreaterThan(0);
    await user.click(within(alerts).getByRole('button', { name: /mark nyc monthly card meetup alert read/i }));
    expect(within(alerts).getByText('Read')).toBeInTheDocument();
  });
});
