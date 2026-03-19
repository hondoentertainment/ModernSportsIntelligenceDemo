// ---------------------------------------------------------------------------
// Shared Tailwind class utilities for responsive layouts
// ---------------------------------------------------------------------------

/**
 * Column configuration per breakpoint.
 * Each value is the number of grid columns (1-12).
 */
export interface GridColConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

// Pre-defined Tailwind grid-cols-* class map so PurgeCSS / Tailwind JIT
// can statically detect the classes we use.
const GRID_COL_MAP: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
};

const MD_GRID_COL_MAP: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  7: 'md:grid-cols-7',
  8: 'md:grid-cols-8',
  9: 'md:grid-cols-9',
  10: 'md:grid-cols-10',
  11: 'md:grid-cols-11',
  12: 'md:grid-cols-12',
};

const LG_GRID_COL_MAP: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  7: 'lg:grid-cols-7',
  8: 'lg:grid-cols-8',
  9: 'lg:grid-cols-9',
  10: 'lg:grid-cols-10',
  11: 'lg:grid-cols-11',
  12: 'lg:grid-cols-12',
};

/**
 * Returns Tailwind grid classes for responsive column layouts.
 *
 * @example
 * ```tsx
 * <div className={`grid ${gridClasses({ mobile: 1, tablet: 2, desktop: 4 })} gap-4`}>
 *   ...
 * </div>
 * ```
 */
export function gridClasses(cols: GridColConfig): string {
  const m = clampCol(cols.mobile);
  const t = clampCol(cols.tablet);
  const d = clampCol(cols.desktop);

  return [
    GRID_COL_MAP[m] ?? `grid-cols-${m}`,
    MD_GRID_COL_MAP[t] ?? `md:grid-cols-${t}`,
    LG_GRID_COL_MAP[d] ?? `lg:grid-cols-${d}`,
  ].join(' ');
}

function clampCol(n: number): number {
  return Math.max(1, Math.min(Math.round(n), 12));
}

// ---------------------------------------------------------------------------
// Tab classes
// ---------------------------------------------------------------------------

/** Default colour tokens that match the app's dark theme. */
const TAB_ACTIVE = 'bg-amber-600 text-white';
const TAB_INACTIVE = 'text-gray-400 hover:text-gray-200 hover:bg-gray-800';

export interface TabClassOptions {
  activeColor?: string;
  inactiveColor?: string;
}

/**
 * Returns the appropriate Tailwind classes for a tab button.
 *
 * On mobile the active state uses full-width styling suitable for a
 * dropdown option, while on desktop it returns pill-style classes.
 *
 * @example
 * ```tsx
 * <button className={tabClasses(isActive, isMobile)}>Tab Label</button>
 * ```
 */
export function tabClasses(
  isActive: boolean,
  isMobile: boolean,
  opts: TabClassOptions = {},
): string {
  const active = opts.activeColor ?? TAB_ACTIVE;
  const inactive = opts.inactiveColor ?? TAB_INACTIVE;

  const base = 'text-sm font-medium transition-colors';

  if (isMobile) {
    // Full-width stacked style for mobile dropdown rendering
    return [
      base,
      'w-full px-4 py-2.5 rounded-lg',
      isActive ? active : inactive,
    ].join(' ');
  }

  // Desktop pill style
  return [
    base,
    'flex-1 min-w-0 px-3 py-2 rounded whitespace-nowrap',
    isActive ? active : inactive,
  ].join(' ');
}

// ---------------------------------------------------------------------------
// Chart height
// ---------------------------------------------------------------------------

/** Default chart heights (in px) tuned for the app's Recharts usage. */
const CHART_HEIGHT_MOBILE = 200;
const CHART_HEIGHT_DESKTOP = 300;

/**
 * Returns a pixel height suitable for Recharts `<ResponsiveContainer>`.
 *
 * @example
 * ```tsx
 * <ResponsiveContainer width="100%" height={chartHeight(isMobile)}>
 *   <LineChart data={data}>...</LineChart>
 * </ResponsiveContainer>
 * ```
 */
export function chartHeight(isMobile: boolean, opts?: { mobile?: number; desktop?: number }): number {
  if (isMobile) return opts?.mobile ?? CHART_HEIGHT_MOBILE;
  return opts?.desktop ?? CHART_HEIGHT_DESKTOP;
}

// ---------------------------------------------------------------------------
// Table classes
// ---------------------------------------------------------------------------

/**
 * Returns wrapper classes for a data table. On mobile the wrapper becomes
 * horizontally scrollable; on desktop it renders normally.
 *
 * @example
 * ```tsx
 * <div className={tableClasses(isMobile)}>
 *   <table>...</table>
 * </div>
 * ```
 */
export function tableClasses(isMobile: boolean): string {
  const base = 'w-full rounded-xl border border-gray-800 bg-gray-900/50';
  if (isMobile) {
    return `${base} overflow-x-auto -mx-1 px-1`;
  }
  return base;
}

// ---------------------------------------------------------------------------
// Bonus: common responsive patterns
// ---------------------------------------------------------------------------

/**
 * Returns classes to stack children vertically on mobile and
 * side-by-side on desktop. Useful for comparison layouts.
 *
 * @example
 * ```tsx
 * <div className={stackClasses(isMobile)}>
 *   <PanelA />
 *   <PanelB />
 * </div>
 * ```
 */
export function stackClasses(isMobile: boolean): string {
  if (isMobile) {
    return 'flex flex-col gap-4';
  }
  return 'flex flex-row gap-6';
}

/**
 * Returns appropriate padding classes for page-level containers.
 */
export function pagePadding(isMobile: boolean): string {
  return isMobile ? 'px-3 py-4' : 'p-6';
}

/**
 * Returns classes for a stat card grid (e.g. 2 cols on mobile, 5 on desktop).
 */
export function statGridClasses(cols?: GridColConfig): string {
  const resolved = cols ?? { mobile: 2, tablet: 3, desktop: 5 };
  return `grid ${gridClasses(resolved)} gap-3`;
}

/**
 * Returns Tailwind classes for text sizes that scale down on mobile.
 */
export function responsiveHeading(level: 1 | 2 | 3 = 1): string {
  switch (level) {
    case 1:
      return 'text-xl md:text-3xl font-bold';
    case 2:
      return 'text-lg md:text-2xl font-bold';
    case 3:
      return 'text-base md:text-lg font-semibold';
  }
}
