import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PricingTruthHealthPanel from '../../components/PricingTruthHealthPanel';
import { DEMO_SESSION_KEY } from '../../lib/demoSession';
import { store } from '../../lib/dal/syncStore';
import { DEMO_SYNTHETIC_SOURCE, clearPriceHistory, recordBatchSnapshots } from '../../lib/analytics/priceHistory';
import type { CardInventory } from '../../types';

function card(id: string): CardInventory {
  return {
    id,
    player: id === '11' ? 'Riley Greene' : 'Unseeded',
    year: 2019,
    manufacturer: 'Bowman',
    cardNumber: '1',
    set: 'Chrome',
    sport: 'Baseball',
    league: 'MLB',
    status: 'active',
    purchasePrice: 10,
    currentValue: 20,
    purchaseDate: '2024-01-01',
    isGraded: false,
    isAutographed: false,
    condition: 'Raw',
  } as CardInventory;
}

describe('PricingTruthHealthPanel demo tape', () => {
  beforeEach(() => {
    clearPriceHistory();
    store.remove(DEMO_SESSION_KEY);
    vi.stubEnv('VITE_PUBLIC_DEMO', 'false');
  });

  it('labels seeded price history as demo data instead of degraded', () => {
    vi.stubEnv('VITE_PUBLIC_DEMO', 'true');
    store.set(DEMO_SESSION_KEY, true);
    recordBatchSnapshots([
      {
        id: '11',
        value: 2000,
        timestamp: '2026-09-01T00:00:00.000Z',
        source: DEMO_SYNTHETIC_SOURCE,
      },
    ]);

    render(<PricingTruthHealthPanel inventory={[card('11'), card('missing')]} />);

    const panel = screen.getByTestId('demo-pricing-health');
    expect(panel).toHaveTextContent(/demo data/i);
    expect(panel).toHaveTextContent('1 of 2 held cards carry the synthetic demo tape');
    expect(screen.queryByText('Degraded')).not.toBeInTheDocument();
  });

  it('still shows degraded coverage for a signed-in book', () => {
    render(<PricingTruthHealthPanel inventory={[card('11')]} />);
    expect(screen.getByText('Degraded')).toBeInTheDocument();
    expect(screen.queryByTestId('demo-pricing-health')).not.toBeInTheDocument();
  });
});
