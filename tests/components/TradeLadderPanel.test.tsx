import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DeskNext from '../../components/DeskNext';
import { makeCard } from '../helpers';
import type { MarketComp } from '../../types';

const sales: MarketComp[] = [
  { title: 'Low', price: 80, condition: 'Near Mint', soldAt: '2026-09-01' },
  { title: 'Mid', price: 100, condition: 'Near Mint', soldAt: '2026-09-02' },
  { title: 'High', price: 120, condition: 'Near Mint', soldAt: '2026-09-03' },
];

describe('Trade ladder on the balancer', () => {
  it('places each side on that card ladder and leaves cash off the rungs', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DeskNext inventory={[
          makeCard({ id: 'judge', player: 'Aaron Judge', currentValue: 50, salesData: sales }),
          makeCard({ id: 'tatum', player: 'Jayson Tatum', currentValue: 130, salesData: sales }),
          makeCard({ id: 'zero', player: 'Zero Mark', currentValue: 0, purchasePrice: 0 }),
        ]} />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Trade ladder')).toHaveTextContent(/no card is on this trade yet/i);
    expect(screen.getByText(/not a dealer fill and not a live tape/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Trade card'), 'judge');
    await user.click(screen.getByRole('button', { name: 'Add to give' }));
    await user.selectOptions(screen.getByLabelText('Trade card'), 'tatum');
    await user.click(screen.getByRole('button', { name: 'Add to receive' }));

    expect(screen.getByRole('list', { name: 'Give ladder' })).toHaveTextContent(
      /Aaron Judge \$50 is under the pass on sold comps/,
    );
    expect(screen.getByRole('list', { name: 'Receive ladder' })).toHaveTextContent(
      /Jayson Tatum \$130 is over the walk on sold comps/,
    );
    const summary = screen.getByLabelText('Trade ladder').textContent;
    expect(summary).toMatch(/a card you give is under the pass, and a card you receive is over the walk/i);
    expect(summary).toMatch(/cash is not a rung/i);
    expect(screen.getByLabelText('Trade call')).toHaveTextContent(/you ahead/);

    await user.clear(screen.getByLabelText('Trade cash'));
    await user.type(screen.getByLabelText('Trade cash'), '500');
    expect(screen.getByLabelText('Trade ladder').textContent).toBe(summary);
    expect(screen.getByLabelText('Trade call')).toHaveTextContent(/you short/);

    await user.selectOptions(screen.getByLabelText('Trade card'), 'zero');
    await user.click(screen.getByRole('button', { name: 'Add to give' }));
    expect(screen.getByRole('list', { name: 'Give ladder' })).toHaveTextContent(/Zero Mark stays off the ladder/);
    expect(screen.getByLabelText('Trade ladder')).toHaveTextContent(/1 give card stays off the ladder/);

    await user.selectOptions(screen.getByLabelText('Trade card'), 'judge');
    await user.click(screen.getByRole('button', { name: 'Add to receive' }));
    expect(screen.queryByRole('list', { name: 'Give ladder' })).toHaveTextContent(/Zero Mark stays off the ladder/);
    expect(screen.getByRole('list', { name: 'Receive ladder' })).toHaveTextContent(/Aaron Judge \$50 is at or under the open/);
    expect(screen.getByRole('list', { name: 'Receive ladder' })).not.toHaveTextContent(/under the pass/);
  });
});
