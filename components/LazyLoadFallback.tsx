import React from 'react';
import { DashboardSkeleton, CardGridSkeleton, ChartSkeleton } from './SkeletonLoader';

/** Full-page loading fallback for lazily loaded route components */
export const PageLoadingFallback: React.FC = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <DashboardSkeleton />
  </div>
);

/** Compact loading fallback for lazily loaded widgets/sections */
export const WidgetLoadingFallback: React.FC = () => (
  <div className="animate-in fade-in duration-300">
    <ChartSkeleton />
  </div>
);

/** Grid loading fallback for collection-style pages */
export const GridLoadingFallback: React.FC = () => (
  <div className="animate-in fade-in duration-500">
    <CardGridSkeleton count={6} />
  </div>
);

/** Minimal inline spinner for small lazy-loaded components */
export const InlineLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-6 h-6 border-2 border-brand-lime/30 border-t-brand-lime rounded-full animate-spin" />
  </div>
);

export default PageLoadingFallback;
