import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ValuationProvenanceChips from '../../components/ValuationProvenanceChips';

describe('ValuationProvenanceChips', () => {
  it('surfaces source, freshness, and thin-market labels', () => {
    render(
      <ValuationProvenanceChips
        sourceChip={{ label: 'Historical comps', className: 'text-cyan-300' }}
        badgeVariant="stale"
        staleLabel="9d"
        thinMarket
        title="priced 2026-08-20 · 62% conf · Thin book of three comps"
      />,
    );
    expect(screen.getByText('Historical comps')).toBeInTheDocument();
    expect(screen.getByText('9d')).toBeInTheDocument();
    expect(screen.getByText('Thin market')).toBeInTheDocument();
    expect(screen.getByTitle(/62% conf/)).toBeInTheDocument();
  });

  it('prefers disclosed low-liquidity / comps-count labels over the thin-market fallback', () => {
    render(
      <ValuationProvenanceChips
        sourceChip={{ label: 'Sold comps', className: 'text-cyan-300' }}
        staleLabel="Stale · 12d"
        thinMarket
        lowLiquidityLabel="Thin tape"
        compsCount={2}
        title="Sold comps · conf unknown · 2 comps"
      />,
    );
    expect(screen.getByText('Sold comps')).toBeInTheDocument();
    expect(screen.getByText('Stale · 12d')).toBeInTheDocument();
    expect(screen.getByText('Thin tape')).toBeInTheDocument();
    expect(screen.getByText('2 comps')).toBeInTheDocument();
    expect(screen.queryByText('Thin market')).not.toBeInTheDocument();
    expect(screen.getByTitle(/conf unknown/)).toBeInTheDocument();
  });
});
