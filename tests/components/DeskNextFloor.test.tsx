import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import DeskNext from '../../components/DeskNext';
import { addHaggle } from '../../lib/shows/showHaggleLog';
import { makeCard } from '../helpers';

describe('DeskNext floor week', () => {
  it('counts a dated table note on the weekly recap', () => {
    render(<DeskNext inventory={[makeCard({ player: 'Aaron Judge' })]} />);
    expect(screen.getByText(/no dated floor notes this week/i)).toBeInTheDocument();
    act(() => {
      addHaggle({
        showId: 'nyc',
        dealer: 'Rivera',
        table: '4',
        askUsd: 20,
        offerUsd: 12,
        result: 'bought',
        note: '',
        savedAt: new Date().toISOString(),
      });
    });
    expect(screen.getByText(/floor notes this week: 1 bought, 0 passed, 0 open/i)).toBeInTheDocument();
    expect(screen.getByText(/typed spend/i)).toBeInTheDocument();
    expect(screen.getByText(/not a settlement/i)).toBeInTheDocument();
  });
});
