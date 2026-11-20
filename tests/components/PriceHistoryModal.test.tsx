import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import PriceHistoryModal from '../../components/PriceHistoryModal';
import { clearPriceHistory, recordBatchSnapshots, recordPriceSnapshot } from '../../lib/analytics/priceHistory';
import { makeCard } from '../helpers';

vi.mock('recharts', () => {
  const Pass = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  return {
    ResponsiveContainer: Pass,
    AreaChart: Pass,
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    ReferenceLine: () => null,
    ReferenceDot: () => null,
  };
});

describe('PriceHistoryModal source disclosure', () => {
  beforeEach(() => {
    clearPriceHistory();
  });

  it('labels a generated curve as simulated for a signed-in card with no snapshots', async () => {
    render(<PriceHistoryModal isOpen onClose={() => undefined} card={makeCard({ id: 'bare-card' })} />);

    expect(await screen.findByTestId('price-history-source-label')).toHaveTextContent(
      /simulated history — not recorded sales or account snapshots/i,
    );
    expect(screen.queryByTestId('price-history-demo-label')).not.toBeInTheDocument();
  });

  it('charts recorded valuations instead of a simulation', async () => {
    const card = makeCard({ id: 'recorded-1' });
    recordPriceSnapshot(card.id, 100, { source: 'valuation' });
    recordPriceSnapshot(card.id, 120, { source: 'valuation' });

    render(<PriceHistoryModal isOpen onClose={() => undefined} card={card} />);

    expect(await screen.findByTestId('price-history-source-label')).toHaveTextContent(/recorded valuations/i);
    expect(screen.queryByText(/simulated history/i)).not.toBeInTheDocument();
  });

  it('does not present the demo tape as a signed-in collector history', async () => {
    recordBatchSnapshots([
      {
        id: '11',
        value: 800,
        timestamp: '2026-08-01T00:00:00.000Z',
        source: 'demo_synthetic',
      },
      {
        id: '11',
        value: 2000,
        timestamp: '2026-09-01T00:00:00.000Z',
        source: 'demo_synthetic',
      },
    ]);

    render(<PriceHistoryModal isOpen onClose={() => undefined} card={makeCard({ id: '11', player: 'Riley Greene' })} />);

    expect(await screen.findByTestId('price-history-source-label')).toHaveTextContent(/simulated history/i);
    expect(screen.queryByText(/seeded price history/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/recorded valuations/i)).not.toBeInTheDocument();
  });
});
