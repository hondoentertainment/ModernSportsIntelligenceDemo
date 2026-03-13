import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

// Mock SkeletonLoader components
vi.mock('../../components/SkeletonLoader', () => ({
  DashboardSkeleton: () => <div data-testid="dashboard-skeleton">DashboardSkeleton</div>,
  CardGridSkeleton: ({ count }: { count: number }) => <div data-testid="card-grid-skeleton">CardGridSkeleton {count}</div>,
  ChartSkeleton: () => <div data-testid="chart-skeleton">ChartSkeleton</div>,
}));

import {
  PageLoadingFallback,
  WidgetLoadingFallback,
  GridLoadingFallback,
  InlineLoadingFallback,
} from '../../components/LazyLoadFallback';

describe('LazyLoadFallback', () => {
  describe('PageLoadingFallback', () => {
    it('renders DashboardSkeleton', () => {
      const { getByTestId } = render(<PageLoadingFallback />);
      expect(getByTestId('dashboard-skeleton')).toBeInTheDocument();
    });
  });

  describe('WidgetLoadingFallback', () => {
    it('renders ChartSkeleton', () => {
      const { getByTestId } = render(<WidgetLoadingFallback />);
      expect(getByTestId('chart-skeleton')).toBeInTheDocument();
    });
  });

  describe('GridLoadingFallback', () => {
    it('renders CardGridSkeleton with count 6', () => {
      const { getByTestId } = render(<GridLoadingFallback />);
      expect(getByTestId('card-grid-skeleton')).toBeInTheDocument();
      expect(getByTestId('card-grid-skeleton').textContent).toContain('6');
    });
  });

  describe('InlineLoadingFallback', () => {
    it('renders spinner element', () => {
      const { container } = render(<InlineLoadingFallback />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });
});
