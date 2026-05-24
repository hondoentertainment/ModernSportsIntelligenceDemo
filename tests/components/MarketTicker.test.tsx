import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import MarketTicker from '../../components/MarketTicker';
import { makeCard } from '../helpers';
import { CardInventory } from '../../types';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const marketTickerSource = readFileSync(
  path.resolve(moduleDir, '../../components/MarketTicker.tsx'),
  'utf8',
);

describe('MarketTicker', () => {
  it('renders the computed percent delta for a card with currentValue and purchasePrice', () => {
    const card = makeCard({ id: 'c1', currentValue: 110, purchasePrice: 100, player: 'Mike Trout' });
    render(<MarketTicker inventory={[card]} />);
    const matches = screen.getAllByText(/\+10\.00%/);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('renders a negative delta with a TrendingDown arrow', () => {
    const card = makeCard({ id: 'c2', currentValue: 80, purchasePrice: 100 });
    const { container } = render(<MarketTicker inventory={[card]} />);
    const matches = screen.getAllByText(/-20\.00%/);
    expect(matches.length).toBeGreaterThan(0);
    expect(container.querySelectorAll('.text-brand-red').length).toBeGreaterThan(0);
  });

  it('renders an em-dash and no trend arrow when purchasePrice is zero and previous value is missing', () => {
    const card: CardInventory = makeCard({
      id: 'c3',
      currentValue: 500,
      purchasePrice: 0,
    });
    const { container } = render(<MarketTicker inventory={[card]} />);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('.lucide-trending-up').length).toBe(0);
    expect(container.querySelectorAll('.lucide-trending-down').length).toBe(0);
  });

  it('shows a Sample badge next to Live Market Pulse when inventory is empty', () => {
    render(<MarketTicker inventory={[]} />);
    expect(screen.getByText('Live Market Pulse')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Sample' })).toBeInTheDocument();
  });

  it('shows the Sample badge when every row falls back to the em-dash', () => {
    const card = makeCard({ id: 'c4', currentValue: 100, purchasePrice: 0 });
    render(<MarketTicker inventory={[card]} />);
    expect(screen.getByRole('status', { name: 'Sample' })).toBeInTheDocument();
  });

  it('hides the Sample badge when at least one row has a real delta', () => {
    const card = makeCard({ id: 'c5', currentValue: 120, purchasePrice: 100 });
    render(<MarketTicker inventory={[card]} />);
    expect(screen.queryByRole('status', { name: 'Sample' })).not.toBeInTheDocument();
  });

  it('does not use Math.random anywhere in the component source', () => {
    expect(marketTickerSource).not.toContain('Math.random');
  });

  it('does not embed an inline <style> tag in the component source', () => {
    expect(marketTickerSource).not.toContain('dangerouslySetInnerHTML');
    expect(marketTickerSource).not.toContain('@keyframes marquee');
  });
});
