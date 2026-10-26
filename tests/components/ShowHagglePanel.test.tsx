import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShowHagglePanel from '../../components/ShowHagglePanel';
import { floorBuyId } from '../../lib/collector/showClose';
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
    expect(screen.getByLabelText('Offer ladder')).toHaveTextContent(/Open \$80, fair \$90, walk \$90 on sold comps/);
    expect(screen.getByLabelText('Offer ladder')).toHaveTextContent(/Walk is the target you set/);
    await user.click(screen.getByRole('button', { name: 'Add table note' }));
    expect(screen.getByText(/under the sold comps median/i)).toBeInTheDocument();
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
});
