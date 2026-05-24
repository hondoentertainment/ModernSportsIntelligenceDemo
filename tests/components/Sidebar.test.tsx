import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

const mockUseSupabaseInventory = vi.fn();
const mockCalculateAlphaScore = vi.fn();
const mockUseAlerts = vi.fn();

vi.mock('../../lib/utils/useSupabaseInventory', () => ({
  useSupabaseInventory: () => mockUseSupabaseInventory(),
}));

vi.mock('../../lib/analytics/analytics.ts', () => ({
  calculateAlphaScore: (...args: unknown[]) => mockCalculateAlphaScore(...args),
}));

vi.mock('../../lib/utils/useAlerts.ts', () => ({
  useAlerts: () => mockUseAlerts(),
}));

import Sidebar from '../../components/Sidebar';
import { makeCard } from '../helpers';

function renderSidebar() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Sidebar isOpen={true} toggle={() => {}} />
    </MemoryRouter>
  );
}

describe('Sidebar Portfolio Health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAlerts.mockReturnValue({ unreadCount: 0 });
    mockUseSupabaseInventory.mockReturnValue({ inventory: [makeCard()] });
    mockCalculateAlphaScore.mockReturnValue(0);
  });

  it('renders "Good" label and lime bar when score is 78', () => {
    mockCalculateAlphaScore.mockReturnValue(78);
    const { container } = renderSidebar();

    expect(screen.getByText('Portfolio Health')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();

    const bar = container.querySelector('.bg-brand-lime[style*="width"]') as HTMLElement | null;
    expect(bar).not.toBeNull();
    expect(bar?.getAttribute('style') ?? '').toContain('width: 78%');
  });

  it('renders "Strong" label when score is >= 80', () => {
    mockCalculateAlphaScore.mockReturnValue(92);
    renderSidebar();
    expect(screen.getByText('Strong')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('renders "Watch" label and amber bar when score is between 40 and 59', () => {
    mockCalculateAlphaScore.mockReturnValue(50);
    const { container } = renderSidebar();
    expect(screen.getByText('Watch')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    const bar = container.querySelector('.bg-amber-400[style*="width"]') as HTMLElement | null;
    expect(bar).not.toBeNull();
    expect(bar?.getAttribute('style') ?? '').toContain('width: 50%');
  });

  it('renders "At Risk" label and red bar when score is below 40', () => {
    mockCalculateAlphaScore.mockReturnValue(30);
    const { container } = renderSidebar();
    expect(screen.getByText('At Risk')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    const bar = container.querySelector('.bg-brand-red[style*="width"]') as HTMLElement | null;
    expect(bar).not.toBeNull();
    expect(bar?.getAttribute('style') ?? '').toContain('width: 30%');
  });

  it('hides the Portfolio Health panel entirely when inventory is empty', () => {
    mockUseSupabaseInventory.mockReturnValue({ inventory: [] });
    mockCalculateAlphaScore.mockReturnValue(0);
    renderSidebar();
    expect(screen.queryByText('Portfolio Health')).not.toBeInTheDocument();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });
});
