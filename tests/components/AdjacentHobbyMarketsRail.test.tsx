import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdjacentHobbyMarketsRail from '../../components/AdjacentHobbyMarketsRail';

describe('AdjacentHobbyMarketsRail', () => {
  it('discloses seeded adjacent hobby markets', () => {
    render(<AdjacentHobbyMarketsRail />);
    const rail = screen.getByRole('status', { name: /adjacent hobby markets/i });
    expect(rail).toHaveTextContent(/not live auction/i);
    expect(rail).toHaveTextContent(/Pokémon/i);
    expect(rail).toHaveTextContent(/Magic: The Gathering/i);
    expect(rail).toHaveTextContent(/memorabilia/i);
  });

  it('can show portfolio correlations when provided', () => {
    render(
      <AdjacentHobbyMarketsRail
        compact
        nested
        correlations={[{ asset: 'pokemon', label: 'Pokémon', correlation90d: 0.41 }]}
      />,
    );
    expect(screen.getByText(/r=0.41/)).toBeInTheDocument();
  });
});
