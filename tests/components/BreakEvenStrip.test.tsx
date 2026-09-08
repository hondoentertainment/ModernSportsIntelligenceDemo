import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import BreakEvenStrip from '../../components/BreakEvenStrip';
import { BREAK_EVEN_STRIP_DISCLOSURE } from '../../lib/analytics/breakEvenService';
import { makeCard } from '../helpers';

describe('BreakEvenStrip', () => {
  it('shows fee presets and a custom rate field', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <BreakEvenStrip
        card={makeCard({ purchasePrice: 100, gradingFees: 20, shippingFees: 10, currentValue: 200 })}
        onOpenFull={onOpen}
      />,
    );
    expect(screen.getByRole('region', { name: /fee-aware break-even/i })).toBeInTheDocument();
    expect(screen.getByText(BREAK_EVEN_STRIP_DISCLOSURE)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /custom/i }));
    expect(screen.getByLabelText(/custom marketplace fee percent/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /full calculator/i }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
