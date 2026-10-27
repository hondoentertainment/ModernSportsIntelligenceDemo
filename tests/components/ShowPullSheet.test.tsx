import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ResolvedLocalCardShow } from '../../lib/shows/localCardShowCatalog';
import { setPlace } from '../../lib/collector/deskNext';
import { makeCard } from '../helpers';
import ShowShoppingList from '../../components/ShowShoppingList';

const show: ResolvedLocalCardShow = {
  id: 'show-nyc',
  name: 'Metro Card Meetup',
  venue: 'Hall A',
  address: '1 Main',
  city: 'New York',
  state: 'NY',
  lat: 40.75,
  lng: -74,
  month: 10,
  day: 18,
  durationDays: 1,
  admissionUsd: 5,
  vendorCount: 40,
  expectedAttendance: 800,
  sports: ['Baseball'],
  focusPlayers: [],
  tableStyle: 'mixed',
  notes: 'seed',
  startDate: '2026-10-18',
  endDate: '2026-10-18',
  status: 'upcoming',
  daysUntilStart: 5,
  source: 'seeded-public-calendar',
};

describe('Show pull sheet', () => {
  it('groups the sell copy by the place saved on this browser', () => {
    setPlace('extra', 'binder');
    setPlace('keeper', 'box');
    render(
      <MemoryRouter>
        <ShowShoppingList
          show={show}
          liveTape={false}
          targets={[{
            id: 'hunt',
            player: 'Aaron Judge',
            cardDescription: '2017 Update',
            priority: 'High',
            targetPrice: 20,
            currentMarketPrice: 100,
            sport: 'Baseball',
            league: 'MLB',
            status: 'active',
            createdAt: '2026-01-01',
            salesData: [
              { title: 'a', price: 80, condition: 'raw', soldAt: '2026-09-01' },
              { title: 'b', price: 100, condition: 'raw', soldAt: '2026-09-02' },
              { title: 'c', price: 120, condition: 'raw', soldAt: '2026-09-03' },
            ],
          }]}
          inventory={[
            makeCard({ id: 'extra', player: 'Shohei Ohtani', year: 2018, set: 'Update', cardNumber: '1', currentValue: 30 }),
            makeCard({ id: 'keeper', player: 'Shohei Ohtani', year: 2018, set: 'Update', cardNumber: '1', currentValue: 80 }),
          ]}
        />
      </MemoryRouter>,
    );

    const sheet = screen.getByRole('region', { name: /pull sheet for metro card meetup/i });
    expect(sheet).toHaveTextContent(/1 card to pull: 1 from Binder/i);
    expect(sheet).toHaveTextContent(/Shohei Ohtani/);
    expect(sheet).toHaveTextContent(/not a live tape/i);
    expect(sheet).not.toHaveTextContent(/from Box/i);
    expect(screen.getByLabelText('Sale range for Aaron Judge')).toHaveTextContent(/under the low of sold comps/i);
    expect(screen.getByLabelText('Offer ladder for Aaron Judge')).toHaveTextContent(/No offer inside that range/);
    expect(screen.queryByLabelText('Ladder score for Aaron Judge')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Sell ladder for Shohei Ohtani')).toHaveTextContent(/on demo sales/);
    expect(screen.getByLabelText('Ladder score for Shohei Ohtani')).toHaveTextContent(/This offer \$[\d,.]+ is .+ on demo sales/);
    setPlace('extra', '');
    setPlace('keeper', '');
  });

  it('caps the next buy when cash left is under the low', () => {
    const sales = [
      { title: 'a', price: 80, condition: 'raw' as const, soldAt: '2026-09-01' },
      { title: 'b', price: 100, condition: 'raw' as const, soldAt: '2026-09-02' },
      { title: 'c', price: 120, condition: 'raw' as const, soldAt: '2026-09-03' },
    ];
    const row = (id: string, player: string, targetPrice: number) => ({
      id,
      player,
      cardDescription: '2017 Update',
      priority: 'High' as const,
      targetPrice,
      currentMarketPrice: 100,
      sport: 'Baseball' as const,
      league: 'MLB' as const,
      status: 'active' as const,
      createdAt: '2026-01-01',
      salesData: sales,
    });
    render(
      <MemoryRouter>
        <ShowShoppingList
          show={show}
          liveTape={false}
          cashUsd={100}
          targets={[row('tight', 'Tight Target', 90), row('wide', 'Wide Target', 200)]}
          inventory={[]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Offer ladder for Tight Target')).toHaveTextContent(
      /Open \$80, fair \$90, walk \$90 on sold comps/,
    );
    expect(screen.getByLabelText('Offer ladder for Tight Target')).toHaveTextContent(/Walk is the target you set/);
    expect(screen.getByLabelText('Offer ladder for Wide Target')).toHaveTextContent(
      /Cash left \$10 is under the low of sold comps/,
    );
    expect(screen.getByLabelText('Ladder score for Tight Target')).toHaveTextContent(
      'This buy $90 is up to the fair on sold comps (open $80, fair $90, walk $90).',
    );
    expect(screen.queryByLabelText('Ladder score for Wide Target')).not.toBeInTheDocument();
    expect(screen.getByText(/not a dealer quote/i)).toBeInTheDocument();
  });
});
