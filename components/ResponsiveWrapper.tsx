// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Breakpoint constants
// ---------------------------------------------------------------------------
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

// ---------------------------------------------------------------------------
// useBreakpoint hook
// ---------------------------------------------------------------------------
export interface BreakpointInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

/**
 * Reactive hook that returns the current viewport classification.
 * Uses `window.matchMedia` listeners for efficient updates (no resize polling).
 */
export function useBreakpoint(mobileBreakpoint: number = BREAKPOINTS.mobile): BreakpointInfo {
  const getWidth = () => (typeof window !== 'undefined' ? window.innerWidth : 1024);

  const [width, setWidth] = useState<number>(getWidth);

  useEffect(() => {
    const handleResize = () => setWidth(getWidth());

    // matchMedia is more performant than a raw resize listener
    const mqMobile = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);
    const mqTablet = window.matchMedia(
      `(min-width: ${mobileBreakpoint}px) and (max-width: ${BREAKPOINTS.tablet - 1}px)`,
    );

    const handler = () => handleResize();
    mqMobile.addEventListener('change', handler);
    mqTablet.addEventListener('change', handler);
    window.addEventListener('resize', handler);

    // Sync on mount
    handleResize();

    return () => {
      mqMobile.removeEventListener('change', handler);
      mqTablet.removeEventListener('change', handler);
      window.removeEventListener('resize', handler);
    };
  }, [mobileBreakpoint]);

  return useMemo(
    () => ({
      isMobile: width < mobileBreakpoint,
      isTablet: width >= mobileBreakpoint && width < BREAKPOINTS.tablet,
      isDesktop: width >= BREAKPOINTS.tablet,
      width,
    }),
    [width, mobileBreakpoint],
  );
}

// ---------------------------------------------------------------------------
// ResponsiveWrapper
// ---------------------------------------------------------------------------
export interface ResponsiveWrapperProps {
  children: React.ReactNode;
  /** Pixel width below which `isMobile` is true. Default 768 */
  mobileBreakpoint?: number;
}

/**
 * Convenience wrapper that provides breakpoint info via render-prop children.
 *
 * ```tsx
 * <ResponsiveWrapper>
 *   {(bp) => bp.isMobile ? <MobileLayout /> : <DesktopLayout />}
 * </ResponsiveWrapper>
 * ```
 */
export const ResponsiveWrapper: React.FC<{
  children: React.ReactNode | ((bp: BreakpointInfo) => React.ReactNode);
  mobileBreakpoint?: number;
}> = ({ children, mobileBreakpoint }) => {
  const bp = useBreakpoint(mobileBreakpoint);

  if (typeof children === 'function') {
    return <>{(children as (bp: BreakpointInfo) => React.ReactNode)(bp)}</>;
  }
  return <>{children}</>;
};

// ---------------------------------------------------------------------------
// ResponsiveGrid
// ---------------------------------------------------------------------------
export interface ResponsiveGridProps {
  children: React.ReactNode;
  /** Column counts per breakpoint */
  cols?: { mobile?: number; tablet?: number; desktop?: number };
  /** Tailwind gap class, e.g. "gap-4" */
  gap?: string;
  className?: string;
}

/**
 * Grid that automatically switches column count at breakpoints using
 * pure Tailwind classes (no JS width detection needed).
 *
 * Defaults: 1 col mobile, 2 col tablet, 3 col desktop.
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols,
  gap = 'gap-4',
  className = '',
}) => {
  const mobile = cols?.mobile ?? 1;
  const tablet = cols?.tablet ?? 2;
  const desktop = cols?.desktop ?? 3;

  // Build Tailwind grid classes — these are static strings so PurgeCSS can find them
  const colClasses = buildGridColClasses(mobile, tablet, desktop);

  return (
    <div className={`grid ${colClasses} ${gap} ${className}`.trim()}>
      {children}
    </div>
  );
};

/** Maps a column count (1-6) to its Tailwind class at the given prefix. */
function gridColClass(prefix: '' | 'md:' | 'lg:', count: number): string {
  const clamped = Math.max(1, Math.min(count, 12));
  return `${prefix}grid-cols-${clamped}`;
}

function buildGridColClasses(mobile: number, tablet: number, desktop: number): string {
  return [
    gridColClass('', mobile),
    gridColClass('md:', tablet),
    gridColClass('lg:', desktop),
  ].join(' ');
}

// ---------------------------------------------------------------------------
// ResponsiveTabs
// ---------------------------------------------------------------------------
export interface TabItem<T extends string = string> {
  key: T;
  label: string;
  icon?: React.ReactNode;
}

export interface ResponsiveTabsProps<T extends string = string> {
  tabs: readonly T[] | TabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  /** Override mobile breakpoint (default 768) */
  mobileBreakpoint?: number;
  /** Active tab accent colour class, e.g. "bg-amber-600" */
  activeColor?: string;
  /** Inactive text colour class */
  inactiveColor?: string;
  className?: string;
}

/**
 * Renders horizontal pill-tabs on tablet/desktop, and a <select> dropdown
 * on mobile (below 768 px by default).
 */
export function ResponsiveTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  mobileBreakpoint,
  activeColor = 'bg-amber-600 text-white',
  inactiveColor = 'text-gray-400 hover:text-gray-200 hover:bg-gray-800',
  className = '',
}: ResponsiveTabsProps<T>) {
  const { isMobile } = useBreakpoint(mobileBreakpoint);

  const normalised: TabItem<T>[] = useMemo(
    () =>
      tabs.map((t) =>
        typeof t === 'string' ? { key: t as T, label: t as string } : (t as TabItem<T>),
      ),
    [tabs],
  );

  if (isMobile) {
    return (
      <div className={`relative ${className}`}>
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value as T)}
          className="w-full appearance-none bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
          aria-label="Select tab"
        >
          {normalised.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    );
  }

  return (
    <div className={`flex gap-1 bg-gray-900 rounded-lg p-1 overflow-x-auto ${className}`}>
      {normalised.map((t) => (
        <button
          key={t.key}
          onClick={() => onTabChange(t.key)}
          className={`flex-1 min-w-0 px-3 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === t.key ? activeColor : inactiveColor
          }`}
        >
          {t.icon && <span className="mr-1.5 inline-flex align-middle">{t.icon}</span>}
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScrollableTable
// ---------------------------------------------------------------------------
export interface ScrollableTableProps {
  children: React.ReactNode;
  className?: string;
  /** Minimum table width before scroll activates (default "640px") */
  minWidth?: string;
}

/**
 * Wraps a <table> (or any wide content) so it scrolls horizontally on
 * narrow viewports, with a subtle gradient fade hint.
 */
export const ScrollableTable: React.FC<ScrollableTableProps> = ({
  children,
  className = '',
  minWidth = '640px',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowRightFade(el.scrollWidth > el.clientWidth && el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        className="overflow-x-auto -mx-1 px-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        <div style={{ minWidth }}>{children}</div>
      </div>
      {/* Right fade indicator */}
      {showRightFade && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none" />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// CollapsibleSection
// ---------------------------------------------------------------------------
export interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  /** Default open state. On mobile this defaults to false, on desktop to true. */
  defaultOpen?: boolean;
  /** Override mobile breakpoint */
  mobileBreakpoint?: number;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Section that automatically starts collapsed on mobile and expanded on desktop.
 * Users can toggle in either mode.
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen,
  mobileBreakpoint,
  icon,
  className = '',
}) => {
  const { isMobile } = useBreakpoint(mobileBreakpoint);

  const resolvedDefault = defaultOpen ?? !isMobile;
  const [isOpen, setIsOpen] = useState(resolvedDefault);
  const prevIsMobile = useRef(isMobile);

  // Auto-collapse/expand when crossing the breakpoint
  useEffect(() => {
    if (prevIsMobile.current !== isMobile && defaultOpen === undefined) {
      setIsOpen(!isMobile);
    }
    prevIsMobile.current = isMobile;
  }, [isMobile, defaultOpen]);

  return (
    <div className={`rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800/40 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-200">
          {icon}
          {title}
        </span>
        {isOpen ? (
          <ChevronDown size={16} className="text-gray-500 transition-transform" />
        ) : (
          <ChevronRight size={16} className="text-gray-500 transition-transform" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Convenience re-exports
// ---------------------------------------------------------------------------
export default ResponsiveWrapper;
