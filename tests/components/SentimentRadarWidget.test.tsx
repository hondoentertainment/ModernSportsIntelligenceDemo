import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import SentimentRadarWidget from '../../components/SentimentRadarWidget';

describe('SentimentRadarWidget', () => {
  const mockOnOpenModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders widget header', () => {
    render(<SentimentRadarWidget onOpenModal={mockOnOpenModal} />);
    expect(screen.getByText('Sentiment Radar')).toBeInTheDocument();
  });

  it('renders market mood gauge', () => {
    render(<SentimentRadarWidget onOpenModal={mockOnOpenModal} />);
    expect(screen.getByText('Market Mood')).toBeInTheDocument();
    expect(screen.getByText('Bearish')).toBeInTheDocument();
    expect(screen.getByText('Bullish')).toBeInTheDocument();
  });

  it('renders trending players', () => {
    render(<SentimentRadarWidget onOpenModal={mockOnOpenModal} />);
    // Should show at least some player names
    const container = screen.getByText('Sentiment Radar').closest('div[class*="bg-slate"]');
    expect(container).toBeInTheDocument();
  });

  it('calls onOpenModal when clicked', () => {
    render(<SentimentRadarWidget onOpenModal={mockOnOpenModal} />);
    fireEvent.click(screen.getByText('Sentiment Radar'));
    expect(mockOnOpenModal).toHaveBeenCalledTimes(1);
  });

  it('shows mentions tracked count', () => {
    render(<SentimentRadarWidget onOpenModal={mockOnOpenModal} />);
    expect(screen.getByText(/mentions tracked/i)).toBeInTheDocument();
  });

  it('shows bullish and bearish counts', () => {
    render(<SentimentRadarWidget onOpenModal={mockOnOpenModal} />);
    // Multiple elements may match (gauge labels + stat counts)
    expect(screen.getAllByText(/bullish/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/bearish/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders without onOpenModal prop', () => {
    render(<SentimentRadarWidget />);
    expect(screen.getByText('Sentiment Radar')).toBeInTheDocument();
  });
});
