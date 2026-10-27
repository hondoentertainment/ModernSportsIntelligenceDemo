import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import DeskNext from '../../components/DeskNext';
import { addHaggle } from '../../lib/shows/showHaggleLog';
import { makeCard } from '../helpers';

describe('DeskNext floor week', () => {
  it('counts a dated table note on the weekly recap', () => {
    render(
      <MemoryRouter>
        <DeskNext inventory={[makeCard({ player: 'Aaron Judge' })]} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/no dated floor notes this week/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Ladder this week')).toHaveTextContent(/no dated table note sits on a sale range this week/i);
    expect(screen.getByLabelText('Sell ladder')).toHaveTextContent(/Ask \$[\d,.]+, take \$[\d,.]+, pass under \$[\d,.]+ on demo sales/);
    expect(screen.getByLabelText('Ladder score')).toHaveTextContent(/Local mark \$100 is .+ on demo sales/);
    expect(screen.getByText(/not a dealer bid/i)).toBeInTheDocument();
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
    expect(screen.getByText(/no bought table note is waiting/i)).toBeInTheDocument();
    act(() => {
      addHaggle({
        showId: 'nyc',
        dealer: 'Ace',
        table: '2',
        askUsd: 40,
        offerUsd: 25,
        result: 'bought',
        note: '',
        player: 'Showclose Player',
        savedAt: new Date().toISOString(),
      });
    });
    expect(screen.getByText(/1 bought note not in the book: Showclose Player/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Ladder this week')).toHaveTextContent(/no card in the book/i);
    act(() => {
      addHaggle({
        showId: 'nyc',
        dealer: 'Rivera',
        table: '9',
        askUsd: 20,
        offerUsd: 1,
        result: 'bought',
        note: '',
        cardId: '1',
        savedAt: new Date().toISOString(),
      });
    });
    expect(screen.getByLabelText('Ladder this week')).toHaveTextContent(/1 bought inside the walk/i);
    expect(screen.getByLabelText('Ladder this week')).toHaveTextContent(/not a settlement and not a live tape/i);
  });
});
