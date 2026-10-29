import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LotPastePanel from '../../components/LotPastePanel';
import ShowDayRecap from '../../components/ShowDayRecap';
import ShowHagglePanel from '../../components/ShowHagglePanel';
import { store } from '../../lib/dal/syncStore';
import { HAGGLE_KEY } from '../../lib/shows/showHaggleLog';
import { SHOW_TRIP_DECISIONS_KEY, saveFloorDecision } from '../../lib/shows/showTripLoop';
import { makeCard } from '../helpers';

const sales = [
  { title: 'sold 80', price: 80, condition: 'raw', soldAt: '2026-09-01' },
  { title: 'sold 100', price: 100, condition: 'raw', soldAt: '2026-09-02' },
  { title: 'sold 120', price: 120, condition: 'raw', soldAt: '2026-09-03' },
];

describe('show floor wave', () => {
  it('prices a pasted lot from the book', async () => {
    const user = userEvent.setup();
    render(
      <LotPastePanel
        inventory={[makeCard({
          id: 'judge',
          player: 'Aaron Judge',
          currentValue: 100,
          isGraded: false,
          salesData: sales,
        })]}
      />,
    );
    expect(screen.getByLabelText('Lot total')).toHaveTextContent(/paste one card per line/i);
    await user.type(screen.getByLabelText('Lot list'), 'Aaron Judge, $90{enter}Nobody $10');
    expect(screen.getByLabelText('Lot total')).toHaveTextContent(/Total offer \$100/);
    expect(screen.getByLabelText('Lot ladders')).toHaveTextContent(/Nobody stays off the ladder/);
  });

  it('recaps a bought note and leaves the other shopping line', () => {
    store.remove(HAGGLE_KEY);
    store.remove(SHOW_TRIP_DECISIONS_KEY);
    store.remove('msi_show_day_v1');
    saveFloorDecision({
      opportunityId: 'sell-1',
      showId: 'nyc',
      player: 'Pad',
      call: 'sell',
      tablePriceUsd: 15,
      markUsd: 10,
      cardId: null,
      sport: 'Baseball',
      year: 2024,
      setName: 'Show',
      costBasisUsd: 8,
      versusMark: 'over',
      decidedAt: '2026-10-18T00:00:00.000Z',
    });
    render(
      <ShowDayRecap
        showId="nyc"
        inventory={[makeCard({ id: 'judge', player: 'Aaron Judge', salesData: sales, isGraded: false })]}
        lines={[
          { id: 'left', side: 'buy', player: 'Jayson Tatum', usd: 20 },
          { id: 'sold', side: 'sell', player: 'Pad', usd: 15 },
        ]}
      />,
    );
    const recap = screen.getByRole('region', { name: 'Show-day recap' });
    expect(recap).toHaveTextContent(/Bought 0 for \$0/);
    expect(recap).toHaveTextContent(/Sold 1 for \$15 \(Pad\)/);
    expect(recap).toHaveTextContent(/Left on the list: Jayson Tatum buy/);
    expect(recap).toHaveTextContent(/Not a settlement and not a live tape/);
  });

  it('suggests a split and keeps the dealer on the history', async () => {
    store.remove(HAGGLE_KEY);
    const user = userEvent.setup();
    render(
      <ShowHagglePanel
        showId="counter-show"
        showName="Counter Show"
        inventory={[
          makeCard({ id: 'judge', player: 'Aaron Judge', currentValue: 100, isGraded: false, salesData: sales }),
          makeCard({ id: 'pad', player: 'Pad Card', currentValue: 40 }),
        ]}
      />,
    );
    expect(screen.getByLabelText('Dealer history')).toHaveTextContent(/No dealer notes on this browser yet/);
    await user.type(screen.getByLabelText('Dealer at Counter Show'), 'Rivera');
    await user.type(screen.getByLabelText('Table at Counter Show'), '12');
    await user.type(screen.getByLabelText('Ask at Counter Show'), '200');
    await user.selectOptions(screen.getByLabelText('Card for the ask at Counter Show'), 'judge');
    expect(screen.getByLabelText('Counter offer')).toHaveTextContent(/Split the difference at \$160/);
    expect(screen.getByLabelText('Counter offer')).toHaveTextContent(/Pad Card/);
    expect(screen.getByLabelText('Counter offer')).toHaveTextContent(/you short/);
    await user.click(screen.getByRole('button', { name: 'Add table note' }));
    expect(screen.getByLabelText('Dealer history')).toHaveTextContent(/Rivera · table 12/);
    expect(screen.getByLabelText('Dealer history')).toHaveTextContent(/Steep on this book/);
    expect(screen.getByLabelText('Counter offer for Rivera table 12')).toHaveTextContent(/Split the difference at \$160/);
  });
});
