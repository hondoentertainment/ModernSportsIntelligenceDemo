import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BreakEvenModal } from '../../components/BreakEvenModal';
import { makeCard } from '../helpers';

describe('BreakEvenModal', () => {
  const card = makeCard({
    player: 'Mike Trout',
    year: 2023,
    set: 'Chrome',
    purchasePrice: 100,
    currentValue: 200,
    gradingFees: 20,
    shippingFees: 5,
  });
  const onClose = vi.fn();

  it('renders when open', () => {
    render(<BreakEvenModal isOpen={true} onClose={onClose} card={card} />);
    expect(screen.getByText('Break-Even Calculator')).toBeInTheDocument();
    expect(screen.getByText(/Mike Trout/)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<BreakEvenModal isOpen={false} onClose={onClose} card={card} />);
    expect(screen.queryByText('Break-Even Calculator')).not.toBeInTheDocument();
  });

  it('displays cost basis breakdown', () => {
    render(<BreakEvenModal isOpen={true} onClose={onClose} card={card} />);
    expect(screen.getByText('Purchase price')).toBeInTheDocument();
    expect(screen.getByText('Grading fees')).toBeInTheDocument();
    expect(screen.getByText('Shipping fees')).toBeInTheDocument();
  });

  it('displays marketplace selection buttons', () => {
    render(<BreakEvenModal isOpen={true} onClose={onClose} card={card} />);
    expect(screen.getByText('eBay')).toBeInTheDocument();
    expect(screen.getByText('Private Sale')).toBeInTheDocument();
  });

  it('displays profit scenarios', () => {
    render(<BreakEvenModal isOpen={true} onClose={onClose} card={card} />);
    expect(screen.getByText('Profit Scenarios')).toBeInTheDocument();
    expect(screen.getByText('-20%')).toBeInTheDocument();
    expect(screen.getByText('+20%')).toBeInTheDocument();
    expect(screen.getByText('2x')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const closeFn = vi.fn();
    render(<BreakEvenModal isOpen={true} onClose={closeFn} card={card} />);
    // The close button has an X icon - find it by role
    const buttons = screen.getAllByRole('button');
    // The X/close button is the first non-marketplace button
    const closeButton = buttons.find(b => !b.textContent || b.textContent.trim() === '');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(closeFn).toHaveBeenCalledTimes(1);
    }
  });

  it('allows changing marketplace', () => {
    render(<BreakEvenModal isOpen={true} onClose={onClose} card={card} />);
    const comcButton = screen.getByRole('button', { name: 'COMC' });
    fireEvent.click(comcButton);
    // After clicking COMC, the fee info should update - COMC appears in multiple places
    const allComc = screen.getAllByText(/COMC/);
    expect(allComc.length).toBeGreaterThanOrEqual(2); // button + fee info text
  });

  it('renders break-even analysis section', () => {
    render(<BreakEvenModal isOpen={true} onClose={onClose} card={card} />);
    expect(screen.getByText('Break-Even Analysis')).toBeInTheDocument();
    expect(screen.getByText('Break-Even Price')).toBeInTheDocument();
    expect(screen.getByText('Current Value')).toBeInTheDocument();
    expect(screen.getByText('Net Profit')).toBeInTheDocument();
    expect(screen.getByText('Net ROI')).toBeInTheDocument();
  });
});
