import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

import TransactionWireWidget from '../../components/TransactionWireWidget';

describe('TransactionWireWidget', () => {
  const mockOnOpenModal = vi.fn();

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('renders widget header', () => {
    render(<TransactionWireWidget onOpenModal={mockOnOpenModal} />);
    expect(screen.getByText('Transaction Wire')).toBeInTheDocument();
  });

  it('renders mini stats section', () => {
    render(<TransactionWireWidget onOpenModal={mockOnOpenModal} />);
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Deals')).toBeInTheDocument();
    expect(screen.getByText('Notable')).toBeInTheDocument();
  });

  it('renders transaction rows', () => {
    render(<TransactionWireWidget onOpenModal={mockOnOpenModal} />);
    // Should show player names from recent transactions
    expect(screen.getByText('Shohei Ohtani')).toBeInTheDocument();
  });

  it('calls onOpenModal when clicked', () => {
    render(<TransactionWireWidget onOpenModal={mockOnOpenModal} />);
    fireEvent.click(screen.getByText('Transaction Wire'));
    expect(mockOnOpenModal).toHaveBeenCalledTimes(1);
  });

  it('shows footer with platform count', () => {
    render(<TransactionWireWidget onOpenModal={mockOnOpenModal} />);
    expect(screen.getByText(/platforms tracked/i)).toBeInTheDocument();
  });

  it('shows View All link', () => {
    render(<TransactionWireWidget onOpenModal={mockOnOpenModal} />);
    expect(screen.getByText(/View All/)).toBeInTheDocument();
  });
});
