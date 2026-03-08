import React from 'react';

/** Animated skeleton pulse block */
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-800/50 rounded-2xl animate-pulse ${className}`} />
);

/** Skeleton for a card grid item */
export const CardSkeleton: React.FC = () => (
  <div className="bg-brand-slate border border-slate-800/50 rounded-[2.5rem] overflow-hidden">
    <Skeleton className="aspect-[4/5] rounded-none" />
    <div className="p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="h-12" />
      <Skeleton className="h-10" />
    </div>
  </div>
);

/** Skeleton for a stat card on the dashboard */
export const StatSkeleton: React.FC = () => (
  <div className="p-6 bg-brand-slate border border-slate-800/50 rounded-3xl space-y-3">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-3 w-16" />
  </div>
);

/** Skeleton for a chart section */
export const ChartSkeleton: React.FC = () => (
  <div className="p-6 bg-brand-slate border border-slate-800/50 rounded-3xl space-y-4">
    <Skeleton className="h-4 w-40" />
    <Skeleton className="h-48" />
  </div>
);

/** Skeleton for a table row */
export const TableRowSkeleton: React.FC = () => (
  <tr>
    <td className="px-8 py-4"><Skeleton className="h-4 w-24" /></td>
    <td className="px-8 py-4"><Skeleton className="h-4 w-32" /></td>
    <td className="px-8 py-4"><Skeleton className="h-4 w-16" /></td>
    <td className="px-8 py-4"><Skeleton className="h-4 w-20" /></td>
  </tr>
);

/** Grid of card skeletons */
export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

/** Dashboard stat row skeleton */
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  </div>
);

export default Skeleton;
