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
          targets={[]}
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
    setPlace('extra', '');
    setPlace('keeper', '');
  });
});
