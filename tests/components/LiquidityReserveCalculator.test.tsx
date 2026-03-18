import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LiquidityReserveCalculator from '../../pages/LiquidityReserveCalculator';

function renderLiquidityReserve() {
  return render(
    <MemoryRouter initialEntries={['/liquidity-reserve-calculator']}>
      <Routes>
        <Route path="/liquidity-reserve-calculator" element={<LiquidityReserveCalculator />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('LiquidityReserveCalculator', () => {
  it('renders v5.2 Frontier badge and title', () => {
    renderLiquidityReserve();
    expect(screen.getByText(/v5.2 Frontier/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Liquidity Reserve Calculator/i })).toBeInTheDocument();
  });

  it('shows recommended and current reserve stats', () => {
    renderLiquidityReserve();
    expect(screen.getByText(/15%/)).toBeInTheDocument();
    expect(screen.getByText(/8%/)).toBeInTheDocument();
  });

  it('shows guidance section', () => {
    renderLiquidityReserve();
    expect(screen.getByText(/Guidance/)).toBeInTheDocument();
    expect(screen.getByText(/15–20%/)).toBeInTheDocument();
  });
});
