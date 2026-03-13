import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

import { MarketIndicesWidget } from '../../components/MarketIndicesWidget';

describe('MarketIndicesWidget', () => {
  const mockOnOpenModal = vi.fn();

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('renders widget header', () => {
    render(<MarketIndicesWidget onOpenModal={mockOnOpenModal} />);
    expect(screen.getByText('MSI Indices')).toBeInTheDocument();
  });

  it('renders ticker items with index tickers', () => {
    render(<MarketIndicesWidget onOpenModal={mockOnOpenModal} />);
    // MSI500 should appear in the ticker (duplicated for infinite scroll)
    const tickers = screen.getAllByText('MSI500');
    expect(tickers.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onOpenModal when clicked', () => {
    render(<MarketIndicesWidget onOpenModal={mockOnOpenModal} />);
    fireEvent.click(screen.getByText('MSI Indices'));
    expect(mockOnOpenModal).toHaveBeenCalledTimes(1);
  });

  it('renders without onOpenModal prop', () => {
    render(<MarketIndicesWidget />);
    expect(screen.getByText('MSI Indices')).toBeInTheDocument();
  });

  it('shows percentage changes', () => {
    const { container } = render(<MarketIndicesWidget onOpenModal={mockOnOpenModal} />);
    // Should have percentage values shown
    const percentages = container.querySelectorAll('[class*="text-emerald"], [class*="text-red"]');
    expect(percentages.length).toBeGreaterThan(0);
  });
});
