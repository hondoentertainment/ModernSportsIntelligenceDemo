import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdjacentHobbyMarketsRail from '../../components/AdjacentHobbyMarketsRail';

describe('AdjacentHobbyMarketsRail', () => {
  it('discloses seeded adjacent hobby markets', () => {
    render(<AdjacentHobbyMarketsRail />);
    expect(screen.getByRole('status', { name: /adjacent hobby markets/i })).toBeInTheDocument();
    expect(screen.getByText(/not live auction/i)).toBeInTheDocument();
    expect(screen.getByText(/Pokémon/i)).toBeInTheDocument();
    expect(screen.getByText(/Magic: The Gathering/i)).toBeInTheDocument();
    expect(screen.getByText(/memorabilia/i)).toBeInTheDocument();
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
