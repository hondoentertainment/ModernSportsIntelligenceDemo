import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PortfolioSetGapPanel from '../../components/PortfolioSetGapPanel';
import { makeCard } from '../helpers';

describe('PortfolioSetGapPanel', () => {
  it('adds a missing checklist card to the watchlist once', async () => {
    const user = userEvent.setup();
    const onWatch = vi.fn();
    const inventory = [makeCard({
      year: 2024,
      manufacturer: 'Topps',
      set: 'Series 1',
      sport: 'Baseball',
      cardNumber: '1',
      player: 'Aaron Judge',
    })];
    const { rerender } = render(<PortfolioSetGapPanel inventory={inventory} onWatch={onWatch} />);
    await user.click(screen.getByRole('button', { name: 'Watch Juan Soto #15' }));
    expect(onWatch).toHaveBeenCalledWith(expect.objectContaining({
      player: 'Juan Soto',
      cardDescription: '2024 Topps Series 1 #15',
      targetPrice: 4,
      notes: 'Demo checklist hole. Not a live listing.',
    }));
    rerender(
      <PortfolioSetGapPanel
        inventory={inventory}
        onWatch={onWatch}
        targets={[{ status: 'active', player: 'Juan Soto', cardDescription: '2024 Topps Series 1 #15' }]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Juan Soto #15 is on the watchlist' })).toBeDisabled();
  });
});
