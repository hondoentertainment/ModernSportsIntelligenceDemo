import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import LocalCardShowRail from '../../components/LocalCardShowRail';
import { SHOW_BUYING_DESK_DISCLOSURE } from '../../lib/shows/showBuyingDesk';

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
  });
});
