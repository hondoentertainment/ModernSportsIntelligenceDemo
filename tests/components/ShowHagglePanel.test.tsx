import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShowHagglePanel from '../../components/ShowHagglePanel';
import { floorBuyId } from '../../lib/collector/showClose';
import { lotCardId } from '../../lib/collector/tableLot';
import { readHaggle } from '../../lib/shows/showHaggleLog';
import { makeCard } from '../helpers';

describe('ShowHagglePanel', () => {
  it('compares a typed ask with sold comps for the card you pick', async () => {
    const user = userEvent.setup();
    render(
      <ShowHagglePanel
        showId="nyc"
        showName="Metro Meetup"
        targets={[{
          id: 'judge-target',
          player: 'Aaron Judge',
          cardDescription: '2017 Update',
          priority: 'High',
          targetPrice: 90,
          currentMarketPrice: 100,
          sport: 'Baseball',
          league: 'MLB',
          status: 'active',
          createdAt: '2026-01-01',
        }]}
        inventory={[makeCard({
          id: 'judge',
          player: 'Aaron Judge',
          currentValue: 100,
          salesData: [
            { title: 'sold 80', price: 80, condition: 'raw', soldAt: '2026-09-01' },
            { title: 'sold 100', price: 100, condition: 'raw', soldAt: '2026-09-02' },
            { title: 'sold 120', price: 120, condition: 'raw', soldAt: '2026-09-03' },
          ],
        })]}
      />,
    );
    await user.type(screen.getByLabelText('Dealer at Metro Meetup'), 'Rivera');
    await user.type(screen.getByLabelText('Table at Metro Meetup'), '4');
    await user.type(screen.getByLabelText('Ask at Metro Meetup'), '80');
    await user.selectOptions(screen.getByLabelText('Card for the ask at Metro Meetup'), 'judge');
    expect(screen.getByLabelText('Ask versus median')).toHaveTextContent(/under the sold comps median/i);
    expect(screen.getByLabelText('Ask versus median')).toHaveTextContent(/not a live tape/i);
    expect(screen.getByLabelText('Ask versus sale range')).toHaveTextContent(/inside the range of sold comps/i);
    expect(screen.getByLabelText('Ask versus sale range')).toHaveTextContent(/\$80–\$120/);
    expect(screen.getByLabelText('Offer ladder')).toHaveTextContent(/Open \$80, fair \$100, walk \$120 on sold comps/);
    expect(screen.getByLabelText('Offer ladder')).not.toHaveTextContent(/Walk is the target/);
    expect(screen.getByLabelText('Ladder score')).toHaveTextContent(
      'This ask $80 is at or under the open on sold comps (open $80, fair $100, walk $120). Still open, at or under the walk.',
    );
    await user.click(screen.getByRole('button', { name: 'Add table note' }));
    expect(screen.getByText(/under the sold comps median/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Ladder score for Rivera table 4')).toHaveTextContent(/Still open, at or under the walk/);
  });

  it('names the cheaper table, watches a cheap pass, and files the paid price', async () => {
    const user = userEvent.setup();
    const onFileBuy = vi.fn(async () => undefined);
    const onWatch = vi.fn();
    const targets = [{
      id: 't1',
      player: 'Showclose Player',
      cardDescription: '2024 Topps #77',
      priority: 'Medium' as const,
      targetPrice: 100,
      currentMarketPrice: 80,
      sport: 'Baseball' as const,
      league: 'MLB' as const,
      status: 'active' as const,
      createdAt: '2026-01-01',
    }];
    const view = render(
      <ShowHagglePanel
        showId="nyc"
        showName="Metro Meetup"
        targets={targets}
        purchaseDate="2026-10-18"
        onFileBuy={onFileBuy}
        onWatch={onWatch}
      />,
    );
    await user.type(screen.getByLabelText('Player at Metro Meetup'), 'Showclose Player');
    await user.type(screen.getByLabelText('Ask at Metro Meetup'), '40');
    expect(screen.getByLabelText('Ask versus median')).toHaveTextContent(/under the shopping-list mark/i);

    await user.type(screen.getByLabelText('Dealer at Metro Meetup'), 'Ace');
    await user.type(screen.getByLabelText('Table at Metro Meetup'), '2');
    await user.selectOptions(screen.getByLabelText('Result at Metro Meetup'), 'passed');
    await user.click(screen.getByRole('button', { name: 'Add table note' }));
    await user.type(screen.getByLabelText('Dealer at Metro Meetup'), 'Rivera');
    await user.type(screen.getByLabelText('Table at Metro Meetup'), '12');
    await user.type(screen.getByLabelText('Player at Metro Meetup'), 'Showclose Player');
    await user.type(screen.getByLabelText('Ask at Metro Meetup'), '30');
    await user.type(screen.getByLabelText('Offer at Metro Meetup'), '25');
    await user.selectOptions(screen.getByLabelText('Result at Metro Meetup'), 'bought');
    await user.click(screen.getByRole('button', { name: 'Add table note' }));

    expect(screen.getByLabelText('Cheapest asks')).toHaveTextContent(/Lowest \$30\.00 at Rivera table 12/);
    expect(screen.getByLabelText('Cheapest asks')).toHaveTextContent(/Not a dealer quote/);
    await user.click(screen.getByRole('button', { name: 'Watch Showclose Player' }));
    expect(onWatch).toHaveBeenCalledWith(expect.objectContaining({ player: 'Showclose Player', targetPrice: 40 }));
    await user.click(screen.getByRole('button', { name: 'Add Showclose Player to collection' }));
    expect(onFileBuy).toHaveBeenCalledWith(expect.objectContaining({ purchasePrice: 25, taxBasis: 25, player: 'Showclose Player' }));

    const bought = readHaggle('nyc').find(row => row.result === 'bought');
    view.rerender(
      <ShowHagglePanel
        showId="nyc"
        showName="Metro Meetup"
        inventory={[makeCard({ id: floorBuyId(bought?.id ?? ''), player: 'Showclose Player', purchasePrice: 25 })]}
        targets={targets}
        purchaseDate="2026-10-18"
        onFileBuy={async () => { throw new Error('no'); }}
        onWatch={onWatch}
      />,
    );
    expect(screen.getByText(/in the collection · cost basis \$25\.00/i)).toBeInTheDocument();
  });

  it('saves a multi-card lot on one note and files each card from its ask', async () => {
    const user = userEvent.setup();
    const onFileBuy = vi.fn(async () => undefined);
    const sales = [
      { title: 'raw', price: 40, condition: 'raw', soldAt: '2026-09-01' },
      { title: 'raw 2', price: 60, condition: 'raw', soldAt: '2026-09-02' },
      { title: 'psa', price: 200, condition: 'PSA 10', soldAt: '2026-09-03' },
      { title: 'psa 2', price: 240, condition: 'PSA 10', soldAt: '2026-09-04' },
    ];
    const view = render(
      <ShowHagglePanel
        showId="lot-show"
        showName="Lot Show"
        purchaseDate="2026-10-20"
        onFileBuy={onFileBuy}
        inventory={[
          makeCard({ id: 'judge', player: 'Aaron Judge', isGraded: false, currentValue: 50, salesData: sales }),
          makeCard({
            id: 'tatum',
            player: 'Jayson Tatum',
            isGraded: true,
            gradingCompany: 'PSA',
            grade: '10',
            currentValue: 220,
            salesData: sales,
          }),
        ]}
      />,
    );
    await user.type(screen.getByLabelText('Dealer at Lot Show'), 'Rivera');
    await user.type(screen.getByLabelText('Table at Lot Show'), '4');
    await user.type(screen.getByLabelText('Ask at Lot Show'), '100');
    await user.type(screen.getByLabelText('Offer at Lot Show'), '80');
    await user.click(screen.getByRole('button', { name: 'Add a card to this lot' }));
    await user.selectOptions(screen.getByLabelText('Card for the ask at Lot Show'), 'judge');
    await user.type(screen.getByLabelText('Card ask for lot card 1 at Lot Show'), '40');
    await user.type(screen.getByLabelText('Player for lot card 2 at Lot Show'), 'Jayson Tatum');
    await user.type(screen.getByLabelText('Card ask for lot card 2 at Lot Show'), '60');
    await user.selectOptions(screen.getByLabelText('Card for lot card 2 at Lot Show'), 'tatum');
    expect(screen.getByLabelText('Table lot')).toHaveTextContent('2 cards in this lot for $100.00');
    expect(screen.getByLabelText('Table lot')).toHaveTextContent(/not one card's sale/i);
    expect(screen.getByLabelText('Lot cards')).toHaveTextContent(/raw sold comps/i);
    expect(screen.getByLabelText('Lot cards')).toHaveTextContent(/PSA 10 sold comps/i);
    expect(screen.getByLabelText('Lot cards')).toHaveTextContent(/The ladder uses the raw sales/);
    expect(screen.getByLabelText('Lot cards')).toHaveTextContent(/The ladder uses the PSA 10 sales/);
    await user.selectOptions(screen.getByLabelText('Result at Lot Show'), 'bought');
    await user.click(screen.getByRole('button', { name: 'Add table note' }));
    expect(screen.getByLabelText('Table lot for Rivera table 4')).toHaveTextContent(/2 cards in this lot for \$100\.00/);
    expect(screen.getByLabelText('Lot cards for Rivera table 4')).toHaveTextContent(/Paid \$32/);
    expect(screen.getByLabelText('Lot cards for Rivera table 4')).toHaveTextContent(/Paid \$48/);
    expect(screen.getByLabelText('Lot cards for Rivera table 4')).not.toHaveTextContent(/Paid \$40/);
    await user.click(screen.getByRole('button', { name: 'Add this lot to the collection' }));
    expect(onFileBuy).toHaveBeenCalledTimes(2);
    expect(onFileBuy).toHaveBeenCalledWith(expect.objectContaining({ player: 'Aaron Judge', purchasePrice: 32, taxBasis: 32 }));
    expect(onFileBuy).toHaveBeenCalledWith(expect.objectContaining({ player: 'Jayson Tatum', purchasePrice: 48, taxBasis: 48 }));
    const saved = readHaggle('lot-show')[0];
    view.rerender(
      <ShowHagglePanel
        showId="lot-show"
        showName="Lot Show"
        purchaseDate="2026-10-20"
        onFileBuy={onFileBuy}
        inventory={[
          makeCard({ id: lotCardId(saved.id, 0), player: 'Aaron Judge', purchasePrice: 32 }),
          makeCard({ id: 'judge', player: 'Aaron Judge', isGraded: false, currentValue: 50, salesData: sales }),
          makeCard({
            id: 'tatum',
            player: 'Jayson Tatum',
            isGraded: true,
            gradingCompany: 'PSA',
            grade: '10',
            currentValue: 220,
            salesData: sales,
          }),
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Add this lot to the collection' }));
    expect(onFileBuy).toHaveBeenCalledTimes(3);
    expect(onFileBuy.mock.calls[2][0]).toMatchObject({ id: lotCardId(saved.id, 1), player: 'Jayson Tatum' });
  });

  it('scores a sale on the sell ladder and refuses a sale with no card', async () => {
    const user = userEvent.setup();
    render(
      <ShowHagglePanel
        showId="exit-show"
        showName="Exit Show"
        inventory={[makeCard({
          id: 'judge',
          player: 'Aaron Judge',
          purchasePrice: 40,
          currentValue: 100,
          salesData: [
            { title: 'sold 80', price: 80, condition: 'raw', soldAt: '2026-09-01' },
            { title: 'sold 100', price: 100, condition: 'raw', soldAt: '2026-09-02' },
            { title: 'sold 120', price: 120, condition: 'raw', soldAt: '2026-09-03' },
          ],
        })]}
      />,
    );
    await user.type(screen.getByLabelText('Dealer at Exit Show'), 'Rivera');
    await user.type(screen.getByLabelText('Table at Exit Show'), '4');
    await user.type(screen.getByLabelText('Offer at Exit Show'), '100');
    await user.selectOptions(screen.getByLabelText('Card for the ask at Exit Show'), 'judge');
    await user.selectOptions(screen.getByLabelText('Result at Exit Show'), 'sold');
    expect(screen.getByLabelText('Sell ladder')).toHaveTextContent(/Ask \$120, take \$100, pass under \$80 on sold comps/);
    expect(screen.getByLabelText('Ladder score')).toHaveTextContent(/Taken \$100 is down to the take/);
    await user.click(screen.getByRole('button', { name: 'Add table note' }));
    expect(screen.getByLabelText('Sell ladder for Aaron Judge')).toHaveTextContent(/pass under \$80/);
    expect(screen.getByLabelText('Ladder score for Rivera table 4')).toHaveTextContent(/down to the take/);

    await user.type(screen.getByLabelText('Dealer at Exit Show'), 'Ace');
    await user.type(screen.getByLabelText('Table at Exit Show'), '2');
    await user.type(screen.getByLabelText('Offer at Exit Show'), '40');
    await user.selectOptions(screen.getByLabelText('Result at Exit Show'), 'sold');
    await user.click(screen.getByRole('button', { name: 'Add table note' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/card you hold/i);
  });
});
