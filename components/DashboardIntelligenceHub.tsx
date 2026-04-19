import React, { useState, lazy, Suspense, useCallback, useMemo, useEffect } from 'react';
import { CardInventory } from '../types';
import { ChevronDown, ChevronUp, Layers, Settings } from 'lucide-react';
import LazyErrorBoundary from './LazyErrorBoundary';
import { WidgetLoadingFallback } from './LazyLoadFallback';

// ---------------------------------------------------------------------------
// Lazy-loaded widgets (Phase 44–68)
// ---------------------------------------------------------------------------
// Phase 49 – Social
const SocialWidget = lazy(() => import('./SocialWidget'));
const SocialModal = lazy(() => import('./SocialModal'));

// Phase 50 – Wax Invest
const WaxInvestWidget = lazy(() => import('./WaxInvestWidget'));
const WaxInvestModal = lazy(() => import('./WaxInvestModal'));

// Phase 51 – Auth Intelligence (files are AuthWidget / AuthModal)
const AuthIntelWidget = lazy(() => import('./AuthWidget'));
const AuthIntelModal = lazy(() => import('./AuthModal'));

// Phase 52 – Player Index
const PlayerIndexWidget = lazy(() => import('./PlayerIndexWidget'));
const PlayerIndexModal = lazy(() => import('./PlayerIndexModal'));

// Phase 54 – Grade Premium
const GradePremiumWidget = lazy(() => import('./GradePremiumWidget'));
const GradePremiumModal = lazy(() => import('./GradePremiumModal'));

// Phase 55 – Deal Finder
const DealFinderWidget = lazy(() => import('./DealFinderWidget'));
const DealFinderModal = lazy(() => import('./DealFinderModal'));

// Phase 56 – Insurance Policy
const InsurancePolicyWidget = lazy(() => import('./InsurancePolicyWidget'));
const InsurancePolicyModal = lazy(() => import('./InsurancePolicyModal'));

// Phase 57 – Pop Growth
const PopGrowthWidget = lazy(() => import('./PopGrowthWidget'));
const PopGrowthModal = lazy(() => import('./PopGrowthModal'));

// Phase 58 – Event Planner
const EventWidget = lazy(() => import('./EventWidget'));
const EventModal = lazy(() => import('./EventModal'));

// Phase 59 – Seasonal Strategy
const SeasonalWidget = lazy(() => import('./SeasonalWidget'));
const SeasonalModal = lazy(() => import('./SeasonalModal'));

// Phase 60 – Currency
const CurrencyWidget = lazy(() => import('./CurrencyWidget'));
const CurrencyModal = lazy(() => import('./CurrencyModal'));

// Phase 61 – Prospect Pipeline
const ProspectWidget = lazy(() => import('./ProspectWidget'));
const ProspectModal = lazy(() => import('./ProspectModal'));

// Phase 62 – Goal Planner
const GoalWidget = lazy(() => import('./GoalWidget'));
const GoalModal = lazy(() => import('./GoalModal'));

// Phase 63 – Notification Center
const NotificationWidget = lazy(() => import('./NotificationWidget'));
const NotificationModal = lazy(() => import('./NotificationModal'));

// Phase 64 – Stress Test
const StressTestWidget = lazy(() => import('./StressTestWidget'));
const StressTestModal = lazy(() => import('./StressTestModal'));

// Phase 65 – Grade Predict
const GradePredictWidget = lazy(() => import('./GradePredictWidget'));
const GradePredictModal = lazy(() => import('./GradePredictModal'));

// Phase 66 – Tax Harvest
const TaxHarvestWidget = lazy(() => import('./TaxHarvestWidget'));
const TaxHarvestModal = lazy(() => import('./TaxHarvestModal'));

// Phase 67 – Correlation
const CorrelationWidget = lazy(() => import('./CorrelationWidget'));
const CorrelationModal = lazy(() => import('./CorrelationModal'));

// Phase 68 – Liquidity
const LiquidityWidget = lazy(() => import('./LiquidityWidget'));
const LiquidityModal = lazy(() => import('./LiquidityModal'));

// ---------------------------------------------------------------------------
// Widget registry – drives the grid, visibility toggles, and modal wiring
// ---------------------------------------------------------------------------

interface WidgetEntry {
  /** Unique stable identifier, used as localStorage key fragment. */
  id: string;
  /** Human label shown in the settings dropdown and aria-label. */
  label: string;
  /** Originating phase number for reference. */
  phase: number;
  /** If true the widget is visible by default on first visit. */
  defaultVisible: boolean;
}

const WIDGET_REGISTRY: WidgetEntry[] = [
  { id: 'social',           label: 'Social Hub',            phase: 49, defaultVisible: true },
  { id: 'wax-invest',       label: 'Wax Invest',            phase: 50, defaultVisible: true },
  { id: 'auth-intel',       label: 'Auth Intelligence',     phase: 51, defaultVisible: true },
  { id: 'player-index',     label: 'Player Index',          phase: 52, defaultVisible: true },
  { id: 'grade-premium',    label: 'Grade Premium',         phase: 54, defaultVisible: true },
  { id: 'deal-finder',      label: 'Deal Finder',           phase: 55, defaultVisible: true },
  { id: 'insurance-policy', label: 'Insurance Policy',      phase: 56, defaultVisible: true },
  { id: 'pop-growth',       label: 'Pop Growth',            phase: 57, defaultVisible: true },
  { id: 'event',            label: 'Event Planner',         phase: 58, defaultVisible: true },
  { id: 'seasonal',         label: 'Seasonal Strategy',     phase: 59, defaultVisible: true },
  { id: 'currency',         label: 'Currency Impact',       phase: 60, defaultVisible: true },
  { id: 'prospect',         label: 'Prospect Pipeline',     phase: 61, defaultVisible: true },
  { id: 'goal',             label: 'Goal Planner',          phase: 62, defaultVisible: true },
  { id: 'notification',     label: 'Notification Center',   phase: 63, defaultVisible: true },
  { id: 'stress-test',      label: 'Stress Test',           phase: 64, defaultVisible: true },
  { id: 'grade-predict',    label: 'Grade Predict',         phase: 65, defaultVisible: true },
  { id: 'tax-harvest',      label: 'Tax Harvest',           phase: 66, defaultVisible: true },
  { id: 'correlation',      label: 'Correlation',           phase: 67, defaultVisible: true },
  { id: 'liquidity',        label: 'Liquidity',             phase: 68, defaultVisible: true },
];

const STORAGE_KEY = 'msi_dashboard_widget_prefs';

// ---------------------------------------------------------------------------
// Visibility-preference persistence helpers
// ---------------------------------------------------------------------------

type VisibilityMap = Record<string, boolean>;

function loadVisibilityPrefs(): VisibilityMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as VisibilityMap;
  } catch {
    // Corrupt data – fall through to defaults.
  }
  const defaults: VisibilityMap = {};
  for (const w of WIDGET_REGISTRY) {
    defaults[w.id] = w.defaultVisible;
  }
  return defaults;
}

function saveVisibilityPrefs(prefs: VisibilityMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage full or blocked – silently ignore.
  }
}

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

interface DashboardIntelligenceHubProps {
  inventory: CardInventory[];
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const DashboardIntelligenceHub: React.FC<DashboardIntelligenceHubProps> = ({ inventory }) => {
  // ---- Section collapse state ----
  const [collapsed, setCollapsed] = useState(false);

  // ---- Widget visibility preferences ----
  const [visibility, setVisibility] = useState<VisibilityMap>(loadVisibilityPrefs);

  // Persist whenever prefs change.
  useEffect(() => {
    saveVisibilityPrefs(visibility);
  }, [visibility]);

  const toggleWidget = useCallback((id: string) => {
    setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const visibleCount = useMemo(
    () => WIDGET_REGISTRY.filter((w) => visibility[w.id] !== false).length,
    [visibility],
  );

  // ---- Settings dropdown ----
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ---- Modal open/close state (one boolean per widget id) ----
  const [modals, setModals] = useState<Record<string, boolean>>({});

  const openModal = useCallback((id: string) => {
    setModals((prev) => ({ ...prev, [id]: true }));
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals((prev) => ({ ...prev, [id]: false }));
  }, []);

  // ---- Visibility helpers ----
  const isVisible = useCallback(
    (id: string) => visibility[id] !== false,
    [visibility],
  );

  const isModalOpen = useCallback(
    (id: string) => !!modals[id],
    [modals],
  );

  // ---- Show-all / hide-all helpers ----
  const showAll = useCallback(() => {
    const next: VisibilityMap = {};
    for (const w of WIDGET_REGISTRY) next[w.id] = true;
    setVisibility(next);
  }, []);

  const hideAll = useCallback(() => {
    const next: VisibilityMap = {};
    for (const w of WIDGET_REGISTRY) next[w.id] = false;
    setVisibility(next);
  }, []);

  // Close settings dropdown on outside click
  const settingsRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [settingsOpen]);

  // ---- Render ----
  return (
    <section className="mt-10 reveal-section" aria-label="Intelligence Hub">
      {/* ── Section header ── */}
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-4 group select-none"
          aria-expanded={!collapsed}
        >
          <Layers className="text-brand-lime" size={32} />
          <h2 className="text-4xl font-bebas tracking-wider">Intelligence Hub</h2>
          <span className="text-xs font-black text-brand-muted uppercase tracking-widest ml-2">
            {visibleCount}/{WIDGET_REGISTRY.length} widgets
          </span>
          {collapsed ? (
            <ChevronDown size={20} className="text-brand-muted group-hover:text-white transition-colors" />
          ) : (
            <ChevronUp size={20} className="text-brand-muted group-hover:text-white transition-colors" />
          )}
        </button>

        {/* Settings gear */}
        <div className="relative" ref={settingsRef}>
          <button
            type="button"
            onClick={() => setSettingsOpen((o) => !o)}
            className="p-2 rounded-xl border border-slate-800 bg-brand-slate hover:border-brand-lime/40 transition-colors"
            aria-label="Toggle widget visibility settings"
          >
            <Settings size={18} className="text-brand-muted" />
          </button>

          {settingsOpen && (
            <div className="absolute right-0 top-12 z-50 w-72 max-h-[28rem] overflow-y-auto bg-brand-slate border border-slate-700 rounded-2xl shadow-2xl p-4 space-y-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Widget Visibility</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={showAll}
                    className="text-[10px] font-black uppercase tracking-widest text-brand-lime hover:text-white transition-colors"
                  >
                    Show All
                  </button>
                  <span className="text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={hideAll}
                    className="text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-white transition-colors"
                  >
                    Hide All
                  </button>
                </div>
              </div>

              {WIDGET_REGISTRY.map((w) => (
                <label
                  key={w.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isVisible(w.id)}
                    onClick={() => toggleWidget(w.id)}
                    className={`flex-shrink-0 w-8 h-5 rounded-full border transition-colors ${
                      isVisible(w.id)
                        ? 'bg-brand-lime/20 border-brand-lime/50'
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-3.5 h-3.5 rounded-full mt-[2px] transition-all ${
                        isVisible(w.id)
                          ? 'ml-[14px] bg-brand-lime'
                          : 'ml-[2px] bg-slate-500'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-slate-300 flex-1">{w.label}</span>
                  <span className="text-[9px] text-slate-600 tabular-nums">P{w.phase}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Collapsible widget grid ── */}
      {!collapsed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Phase 49 — Social Hub */}
          {isVisible('social') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <SocialWidget cards={inventory} onClick={() => openModal('social')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 50 — Wax Invest */}
          {isVisible('wax-invest') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <WaxInvestWidget onClick={() => openModal('wax-invest')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 51 — Auth Intelligence */}
          {isVisible('auth-intel') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <AuthIntelWidget cards={inventory} onClick={() => openModal('auth-intel')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 52 — Player Index */}
          {isVisible('player-index') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <PlayerIndexWidget cards={inventory} onClick={() => openModal('player-index')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 54 — Grade Premium */}
          {isVisible('grade-premium') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <GradePremiumWidget cards={inventory} onClick={() => openModal('grade-premium')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 55 — Deal Finder */}
          {isVisible('deal-finder') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <DealFinderWidget cards={inventory} onClick={() => openModal('deal-finder')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 56 — Insurance Policy */}
          {isVisible('insurance-policy') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <InsurancePolicyWidget cards={inventory} onClick={() => openModal('insurance-policy')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 57 — Pop Growth */}
          {isVisible('pop-growth') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <PopGrowthWidget cards={inventory} onClick={() => openModal('pop-growth')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 58 — Event Planner */}
          {isVisible('event') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <EventWidget cards={inventory} onClick={() => openModal('event')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 59 — Seasonal Strategy */}
          {isVisible('seasonal') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <SeasonalWidget cards={inventory} onClick={() => openModal('seasonal')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 60 — Currency Impact (widget uses `inventory` prop name) */}
          {isVisible('currency') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <CurrencyWidget inventory={inventory} onClick={() => openModal('currency')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 61 — Prospect Pipeline (widget uses `inventory` prop name) */}
          {isVisible('prospect') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <ProspectWidget inventory={inventory} onClick={() => openModal('prospect')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 62 — Goal Planner (widget uses `inventory` prop name) */}
          {isVisible('goal') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <GoalWidget inventory={inventory} onClick={() => openModal('goal')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 63 — Notification Center */}
          {isVisible('notification') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <NotificationWidget cards={inventory} onClick={() => openModal('notification')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 64 — Stress Test (widget uses `inventory` prop name) */}
          {isVisible('stress-test') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <StressTestWidget inventory={inventory} onClick={() => openModal('stress-test')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 65 — Grade Predict */}
          {isVisible('grade-predict') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <GradePredictWidget cards={inventory} onClick={() => openModal('grade-predict')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 66 — Tax Harvest */}
          {isVisible('tax-harvest') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <TaxHarvestWidget cards={inventory} onClick={() => openModal('tax-harvest')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 67 — Correlation (widget uses `inventory` prop name) */}
          {isVisible('correlation') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <CorrelationWidget inventory={inventory} onClick={() => openModal('correlation')} />
              </Suspense>
            </LazyErrorBoundary>
          )}

          {/* Phase 68 — Liquidity */}
          {isVisible('liquidity') && (
            <LazyErrorBoundary compact>
              <Suspense fallback={<WidgetLoadingFallback />}>
                <LiquidityWidget cards={inventory} onClick={() => openModal('liquidity')} />
              </Suspense>
            </LazyErrorBoundary>
          )}
        </div>
      )}

      {/* ── Modals — rendered outside the grid so they overlay correctly ── */}
      <Suspense fallback={null}>
        {/* Phase 49 */}
        {isModalOpen('social') && (
          <SocialModal
            isOpen
            onClose={() => closeModal('social')}
            cards={inventory}
          />
        )}

        {/* Phase 50 — WaxInvestModal does not take cards */}
        {isModalOpen('wax-invest') && (
          <WaxInvestModal
            isOpen
            onClose={() => closeModal('wax-invest')}
          />
        )}

        {/* Phase 51 */}
        {isModalOpen('auth-intel') && (
          <AuthIntelModal
            isOpen
            onClose={() => closeModal('auth-intel')}
            cards={inventory}
          />
        )}

        {/* Phase 52 */}
        {isModalOpen('player-index') && (
          <PlayerIndexModal
            isOpen
            onClose={() => closeModal('player-index')}
            cards={inventory}
          />
        )}

        {/* Phase 54 */}
        {isModalOpen('grade-premium') && (
          <GradePremiumModal
            isOpen
            onClose={() => closeModal('grade-premium')}
            cards={inventory}
          />
        )}

        {/* Phase 55 */}
        {isModalOpen('deal-finder') && (
          <DealFinderModal
            isOpen
            onClose={() => closeModal('deal-finder')}
            cards={inventory}
          />
        )}

        {/* Phase 56 */}
        {isModalOpen('insurance-policy') && (
          <InsurancePolicyModal
            isOpen
            onClose={() => closeModal('insurance-policy')}
            cards={inventory}
          />
        )}

        {/* Phase 57 */}
        {isModalOpen('pop-growth') && (
          <PopGrowthModal
            isOpen
            onClose={() => closeModal('pop-growth')}
            cards={inventory}
          />
        )}

        {/* Phase 58 */}
        {isModalOpen('event') && (
          <EventModal
            isOpen
            onClose={() => closeModal('event')}
            cards={inventory}
          />
        )}

        {/* Phase 59 */}
        {isModalOpen('seasonal') && (
          <SeasonalModal
            isOpen
            onClose={() => closeModal('seasonal')}
            cards={inventory}
          />
        )}

        {/* Phase 60 */}
        {isModalOpen('currency') && (
          <CurrencyModal
            isOpen
            onClose={() => closeModal('currency')}
            cards={inventory}
          />
        )}

        {/* Phase 61 */}
        {isModalOpen('prospect') && (
          <ProspectModal
            isOpen
            onClose={() => closeModal('prospect')}
            cards={inventory}
          />
        )}

        {/* Phase 62 */}
        {isModalOpen('goal') && (
          <GoalModal
            isOpen
            onClose={() => closeModal('goal')}
            cards={inventory}
          />
        )}

        {/* Phase 63 */}
        {isModalOpen('notification') && (
          <NotificationModal
            isOpen
            onClose={() => closeModal('notification')}
            cards={inventory}
          />
        )}

        {/* Phase 64 */}
        {isModalOpen('stress-test') && (
          <StressTestModal
            isOpen
            onClose={() => closeModal('stress-test')}
            cards={inventory}
          />
        )}

        {/* Phase 65 */}
        {isModalOpen('grade-predict') && (
          <GradePredictModal
            isOpen
            onClose={() => closeModal('grade-predict')}
            cards={inventory}
          />
        )}

        {/* Phase 66 */}
        {isModalOpen('tax-harvest') && (
          <TaxHarvestModal
            isOpen
            onClose={() => closeModal('tax-harvest')}
            cards={inventory}
          />
        )}

        {/* Phase 67 */}
        {isModalOpen('correlation') && (
          <CorrelationModal
            isOpen
            onClose={() => closeModal('correlation')}
            cards={inventory}
          />
        )}

        {/* Phase 68 */}
        {isModalOpen('liquidity') && (
          <LiquidityModal
            isOpen
            onClose={() => closeModal('liquidity')}
            cards={inventory}
          />
        )}
      </Suspense>
    </section>
  );
};

export default DashboardIntelligenceHub;
