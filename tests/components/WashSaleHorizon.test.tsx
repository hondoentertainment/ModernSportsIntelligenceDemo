import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import WashSaleHorizon from '../../pages/WashSaleHorizon';

function renderWashSaleHorizon() {
  return render(
    <MemoryRouter initialEntries={['/wash-sale-horizon']}>
      <Routes>
        <Route path="/wash-sale-horizon" element={<WashSaleHorizon />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('WashSaleHorizon', () => {
  it('renders v5.2 Frontier badge and title', () => {
    renderWashSaleHorizon();
    expect(screen.getByText(/v5.2 Frontier/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Wash-Sale Horizon Calendar/i })).toBeInTheDocument();
  });

  it('shows wash-sale windows list', () => {
    renderWashSaleHorizon();
    expect(screen.getByText(/Wash-sale windows \(mock\)/)).toBeInTheDocument();
    expect(screen.getByText(/Herbert Prizm PSA 10/)).toBeInTheDocument();
    expect(screen.getAllByText(/Clear/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/In window/).length).toBeGreaterThan(0);
  });
});
