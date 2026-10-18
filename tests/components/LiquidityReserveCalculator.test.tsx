import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LiquidityReserveCalculator from '../../pages/LiquidityReserveCalculator';
import { store } from '../../lib/dal/syncStore';
import { makeCard } from '../helpers';

function renderLiquidityReserve() {
  return render(
    <MemoryRouter initialEntries={['/liquidity-reserve-calculator']}>
      <Routes>
        <Route path="/liquidity-reserve-calculator" element={<LiquidityReserveCalculator />} />
      </Routes>
    </MemoryRouter>
  );
}

function statCard(label: string): HTMLElement {
  // Stats render above the rows, so the first match is the stat label when a row repeats it.
  const [labelNode] = screen.getAllByText(label);
  const card = labelNode?.parentElement;
  if (!card) throw new Error(`missing stat card for ${label}`);
  return card;
}

function seedMixedBook() {
  store.set('cardx_inventory', [
    makeCard({
      id: 'liquid',
      player: 'Shohei Ohtani',
      year: 2024,
      manufacturer: 'Topps',
      set: 'Chrome',
      cardNumber: '1',
      currentValue: 800,
      liquidityScore: 80,
    }),
    makeCard({
      id: 'illiquid',
      player: 'Raw Prospect',
      currentValue: 200,
      liquidityScore: 20,
    }),
  ]);
}

describe('LiquidityReserveCalculator', () => {
  beforeEach(() => {
    cleanup();
    store.remove('cardx_inventory');
  });

  afterEach(() => {
    cleanup();
    store.remove('cardx_inventory');
  });

  it('renders v5.2 Frontier badge and title', () => {
    renderLiquidityReserve();
    expect(screen.getByText(/v5.2 Frontier/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Liquidity Reserve Calculator/i })).toBeInTheDocument();
  });

  it('shows recommended and current reserve stats', () => {
    seedMixedBook();
    renderLiquidityReserve();

    // "15%" is in the lede and in the recommended stat.
    expect(screen.getAllByText(/15%/)).toHaveLength(2);
    expect(within(statCard('Recommended')).getByText('15%')).toBeInTheDocument();
    expect(within(statCard('Current')).getByText('80%')).toBeInTheDocument();
    expect(within(statCard('Gap')).getByText('65 pts above')).toBeInTheDocument();
  });

  it('shows the planning-reserve explanation and liquid cards', () => {
    seedMixedBook();
    renderLiquidityReserve();

    expect(screen.getByText(/compared with a 15% planning reserve/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Cards counted as liquid/i })).toBeInTheDocument();

    const ohtani = screen.getByText(/2024 Topps Shohei Ohtani Chrome #1/).closest('li');
    if (!ohtani) throw new Error('missing liquid holding row');
    expect(within(ohtani).getByText('Score ≥ 60')).toBeInTheDocument();
    expect(screen.queryByText(/Raw Prospect/)).not.toBeInTheDocument();
    expect(screen.getByText(/Calculated from this collection/)).toBeInTheDocument();
  });

  it('shows a shortfall when no holding clears the liquidity threshold', () => {
    renderLiquidityReserve();
    expect(within(statCard('Recommended')).getByText('15%')).toBeInTheDocument();
    expect(within(statCard('Current')).getByText('0%')).toBeInTheDocument();
    expect(within(statCard('Gap')).getByText('15 pts short')).toBeInTheDocument();
    expect(screen.getByText(/No holding currently clears the liquidity threshold/)).toBeInTheDocument();
  });
});
