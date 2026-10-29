import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShowHaulPanel from '../../components/ShowHaulPanel';
import { store } from '../../lib/dal/syncStore';
import { HAGGLE_KEY } from '../../lib/shows/showHaggleLog';
import { makeCard } from '../helpers';

const sales = [
  { title: 'sold 80', price: 80, condition: 'raw', soldAt: '2026-09-01' },
  { title: 'sold 100', price: 100, condition: 'raw', soldAt: '2026-09-02' },
  { title: 'sold 120', price: 120, condition: 'raw', soldAt: '2026-09-03' },
];

describe('Show haul panel', () => {
  it('follows a filed buy into a binder and leaves the ninth card off the list', async () => {
    const user = userEvent.setup();
    const notes = [
      {
        id: 'judge-buy',
        showId: 'nyc',
        dealer: 'Rivera',
        table: '12',
        askUsd: 200,
        offerUsd: 200,
        result: 'bought',
        note: '',
        player: 'Aaron Judge',
        cardId: 'judge',
        savedAt: '2026-10-29T00:00:00.000Z',
      },
      ...Array.from({ length: 8 }, (_, index) => ({
        id: `extra-${index}`,
        showId: 'nyc',
        dealer: 'Ace',
        table: String(index),
        askUsd: 5,
        offerUsd: 4,
        result: 'bought' as const,
        note: '',
        player: `Extra ${index}`,
        savedAt: '2026-10-29T00:00:00.000Z',
      })),
      {
        id: 'other-show',
        showId: 'dallas',
        dealer: 'Lane',
        table: '1',
        askUsd: 9,
        offerUsd: 9,
        result: 'bought' as const,
        note: '',
        player: 'Not This Show',
        savedAt: '2026-10-29T00:00:00.000Z',
      },
    ];
    store.set(HAGGLE_KEY, notes);
    render(
      <ShowHaulPanel
        showId="nyc"
        inventory={[
          makeCard({ id: 'judge', player: 'Aaron Judge', currentValue: 100, isGraded: false, salesData: sales }),
          makeCard({
            id: 'floor:judge-buy',
            player: 'Aaron Judge',
            year: 2023,
            manufacturer: 'Topps',
            set: 'Chrome',
            cardNumber: '1',
            purchasePrice: 200,
            currentValue: 100,
          }),
        ]}
      />,
    );
    const haul = screen.getByRole('region', { name: 'Show haul' });
    expect(haul).toHaveTextContent(/Not a settlement and not a live tape/);
    expect(haul).toHaveTextContent(/over the walk/);
    expect(haul).toHaveTextContent(/second copy/);
    expect(haul).toHaveTextContent(/1 more card stays off this list/);
    expect(haul).not.toHaveTextContent('Not This Show');
    expect(screen.getByRole('button', { name: 'Put unplaced haul cards in the binder' })).toBeEnabled();
    await user.selectOptions(screen.getByLabelText('Haul place'), 'slab');
    await user.click(screen.getByRole('button', { name: 'Put unplaced haul cards in the slab case' }));
    expect(haul).toHaveTextContent(/slab case/);
    expect(screen.getByRole('button', { name: 'Put unplaced haul cards in the slab case' })).toBeDisabled();
  });
});
