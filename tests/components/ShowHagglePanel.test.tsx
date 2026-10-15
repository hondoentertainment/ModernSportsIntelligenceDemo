import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShowHagglePanel from '../../components/ShowHagglePanel';
import { makeCard } from '../helpers';

describe('ShowHagglePanel', () => {
  it('compares a typed ask with sold comps for the card you pick', async () => {
    const user = userEvent.setup();
    render(
      <ShowHagglePanel
        showId="nyc"
        showName="Metro Meetup"
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
    await user.click(screen.getByRole('button', { name: 'Add table note' }));
    expect(screen.getByText(/under the sold comps median/i)).toBeInTheDocument();
  });
});
