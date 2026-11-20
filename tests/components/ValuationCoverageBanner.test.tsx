import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ValuationCoverageBanner from '../../components/ValuationCoverageBanner';

describe('ValuationCoverageBanner', () => {
  it('renders watchlist SLA copy when coverage is below target', () => {
    render(
      <ValuationCoverageBanner scope="watchlist" coveragePct={60} covered={6} total={10} />,
    );

    expect(screen.getByText(/watchlist pricing coverage below SLA/i)).toBeInTheDocument();
    expect(screen.getByText(/60% \(6\/10\)/)).toBeInTheDocument();
  });

  it('renders inventory SLA copy with actions', () => {
    render(
      <ValuationCoverageBanner
        scope="inventory"
        coveragePct={70}
        covered={7}
        total={10}
        actions={<button type="button">Refresh</button>}
      />,
    );

    expect(screen.getByText(/pricing truth coverage is below SLA/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('uses a calm demo label instead of an SLA breach', () => {
    render(
      <ValuationCoverageBanner
        scope="inventory"
        tone="demo"
        coveragePct={0}
        covered={0}
        total={12}
        actions={<button type="button">Refresh</button>}
      />,
    );

    expect(screen.getByTestId('demo-pricing-notice')).toHaveTextContent(/demo data/i);
    expect(screen.getByTestId('demo-pricing-notice')).toHaveTextContent(/seeded demo price history/i);
    expect(screen.queryByText(/below SLA/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/degraded/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
  });

  it('returns null when coverage meets target', () => {
    const { container } = render(
      <ValuationCoverageBanner scope="inventory" coveragePct={96} covered={96} total={100} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
