import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

import MSITerminalWidget from '../../components/MSITerminalWidget';

describe('MSITerminalWidget', () => {
  const mockOnOpenModal = vi.fn();

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('renders terminal header', () => {
    render(<MSITerminalWidget onOpenModal={mockOnOpenModal} />);
    expect(screen.getByText('MSI Terminal')).toBeInTheDocument();
  });

  it('renders command input', () => {
    render(<MSITerminalWidget onOpenModal={mockOnOpenModal} />);
    expect(screen.getByPlaceholderText('Type command...')).toBeInTheDocument();
  });

  it('shows quick command hints', () => {
    render(<MSITerminalWidget onOpenModal={mockOnOpenModal} />);
    expect(screen.getByText('HELP')).toBeInTheDocument();
    expect(screen.getByText('PORT')).toBeInTheDocument();
    expect(screen.getByText('MSI500')).toBeInTheDocument();
  });

  it('executes command on Enter', () => {
    render(<MSITerminalWidget onOpenModal={mockOnOpenModal} />);
    const input = screen.getByPlaceholderText('Type command...');
    fireEvent.click(input); // stop propagation handler
    fireEvent.change(input, { target: { value: 'HELP' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    // Should show result preview and hide quick commands
    expect(screen.getByText(/commands available/i)).toBeInTheDocument();
  });

  it('converts input to uppercase', () => {
    render(<MSITerminalWidget onOpenModal={mockOnOpenModal} />);
    const input = screen.getByPlaceholderText('Type command...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'help' } });
    expect(input.value).toBe('HELP');
  });

  it('clears input after execution', () => {
    render(<MSITerminalWidget onOpenModal={mockOnOpenModal} />);
    const input = screen.getByPlaceholderText('Type command...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'HELP' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input.value).toBe('');
  });

  it('calls onOpenModal when widget is clicked', () => {
    render(<MSITerminalWidget onOpenModal={mockOnOpenModal} />);
    // Click on the header, not the input
    fireEvent.click(screen.getByText('MSI Terminal'));
    expect(mockOnOpenModal).toHaveBeenCalled();
  });

  it('shows Bloomberg-Style Commands subtitle', () => {
    render(<MSITerminalWidget onOpenModal={mockOnOpenModal} />);
    expect(screen.getByText('Bloomberg-Style Commands')).toBeInTheDocument();
  });

  it('does not execute empty command', () => {
    render(<MSITerminalWidget onOpenModal={mockOnOpenModal} />);
    const input = screen.getByPlaceholderText('Type command...');
    fireEvent.keyDown(input, { key: 'Enter' });
    // Quick command hints should still be shown
    expect(screen.getByText('HELP')).toBeInTheDocument();
    expect(screen.getByText(/click to expand/i)).toBeInTheDocument();
  });
});
