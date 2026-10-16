import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import LocalCardShowRail from '../../components/LocalCardShowRail';
import { SHOW_BUYING_DESK_DISCLOSURE } from '../../lib/shows/showBuyingDesk';
import { addHaggle } from '../../lib/shows/showHaggleLog';

describe('LocalCardShowRail', () => {
  it('lists seeded shows and degrades when location is unavailable', () => {
    render(
      <MemoryRouter>
        <LocalCardShowRail inventory={[]} targets={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('region', { name: /local card shows/i })).toBeInTheDocument();
    expect(screen.getByText(SHOW_BUYING_DESK_DISCLOSURE)).toBeInTheDocument();
    expect(screen.getByText(/local \/ demo tape/i)).toBeInTheDocument();
    expect(screen.getAllByText(/distance unknown/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /show desk/i })).toHaveAttribute('href', '/local-card-shows');
    expect(screen.queryByText(/live market movers parity/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/open table/i)).not.toBeInTheDocument();
    act(() => {
      addHaggle({
        showId: 'nyc-monthly', dealer: 'Ace', table: '2', askUsd: 10, offerUsd: 0, result: 'open', note: '',
      });
    });
    expect(screen.getByText(/1 open table note on this browser/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /floor follow-ups/i })).toHaveAttribute('href', '/alerts');
  });
});
