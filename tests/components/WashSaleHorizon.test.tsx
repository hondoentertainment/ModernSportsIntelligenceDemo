import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import WashSaleHorizon from '../../pages/WashSaleHorizon';
import { store } from '../../lib/dal/syncStore';
import { makeCard } from '../helpers';

const DAY_MS = 86_400_000;

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function renderWashSaleHorizon() {
  return render(
    <MemoryRouter initialEntries={['/wash-sale-horizon']}>
      <Routes>
        <Route path="/wash-sale-horizon" element={<WashSaleHorizon />} />
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

describe('WashSaleHorizon', () => {
  beforeEach(() => {
    cleanup();
    store.remove('cardx_inventory');
  });

  afterEach(() => {
    cleanup();
    store.remove('cardx_inventory');
  });

  it('renders v5.2 Frontier badge and title', () => {
    renderWashSaleHorizon();
    expect(screen.getByText(/v5.2 Frontier/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Wash-Sale Horizon Calendar/i })).toBeInTheDocument();
  });

  it('shows wash-sale windows from recorded sales', () => {
    const recentSold = isoDaysAgo(5);
    const elapsedSold = isoDaysAgo(45);
    store.set('cardx_inventory', [
      makeCard({
        id: 'recent-sale',
        player: 'Justin Herbert',
        year: 2020,
        manufacturer: 'Prizm',
        set: 'Prizm',
        cardNumber: '325',
        isGraded: true,
        gradingCompany: 'PSA',
        grade: '10',
        status: 'sold',
        saleDate: recentSold,
        salePrice: 1200,
      }),
      makeCard({
        id: 'elapsed-sale',
        player: 'Luka Doncic',
        status: 'sold',
        saleDate: elapsedSold,
        salePrice: 900,
      }),
    ]);

    renderWashSaleHorizon();

    expect(screen.getByRole('heading', { name: /^Windows$/ })).toBeInTheDocument();
    expect(within(statCard('Recorded sales')).getByText('2')).toBeInTheDocument();
    expect(within(statCard('Inside 30 days')).getByText('1')).toBeInTheDocument();
    expect(within(statCard('Window elapsed')).getByText('1')).toBeInTheDocument();

    const herbert = screen.getByText(/2020 Prizm Justin Herbert Prizm #325 PSA 10/).closest('li');
    if (!herbert) throw new Error('missing Herbert window row');
    expect(within(herbert).getByText(new RegExp(`Sold ${recentSold.slice(0, 10)}`))).toBeInTheDocument();
    expect(within(herbert).getByText('Inside 30 days')).toBeInTheDocument();

    const luka = screen.getByText(/Luka Doncic/).closest('li');
    if (!luka) throw new Error('missing Luka window row');
    expect(within(luka).getByText('Elapsed')).toBeInTheDocument();

    // The open-window count and the row status both say "Inside 30 days".
    expect(screen.getAllByText('Inside 30 days')).toHaveLength(2);
    expect(screen.getByText(/Calculated from this collection/)).toBeInTheDocument();
  });

  it('shows an empty windows list when the book has no sale dates', () => {
    renderWashSaleHorizon();
    expect(screen.getByRole('heading', { name: /^Windows$/ })).toBeInTheDocument();
    expect(screen.getByText(/No recorded sale dates on this book/)).toBeInTheDocument();
    expect(within(statCard('Recorded sales')).getByText('0')).toBeInTheDocument();
    expect(within(statCard('Inside 30 days')).getByText('0')).toBeInTheDocument();
    expect(within(statCard('Window elapsed')).getByText('0')).toBeInTheDocument();
  });
});
