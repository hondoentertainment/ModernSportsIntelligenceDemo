import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronRight,
  X,
  CheckCircle2,
  Circle,
  CreditCard,
  RefreshCw,
  Bell,
  BarChart3,
  Receipt,
  Users,
  Zap,
  FileDown,
  Trophy,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { store } from '../lib/dal/syncStore';

// ─── Storage ────────────────────────────────────────────────────────────────
const CHECKLIST_STATE_KEY = 'msi_onboarding_checklist';

// ─── Types ──────────────────────────────────────────────────────────────────
interface OnboardingChecklistProps {
  inventory: unknown[];
  isVisible: boolean;
  onToggle: () => void;
}

interface MilestoneItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  checkFn: (inventory: unknown[]) => boolean;
  goLabel: string;
}

interface ChecklistState {
  dismissed: boolean;
  minimized: boolean;
  completedIds: string[];
  lastCelebrated: string | null;
}

const DEFAULT_STATE: ChecklistState = {
  dismissed: false,
  minimized: false,
  completedIds: [],
  lastCelebrated: null,
};

const MILESTONES: MilestoneItem[] = [
  {
    id: 'first_card',
    label: 'Add your first card',
    icon: <CreditCard size={16} />,
    checkFn: (inv) => inv.length > 0,
    goLabel: 'Collection',
  },
  {
    id: 'sync_prices',
    label: 'Sync market prices',
    icon: <RefreshCw size={16} />,
    checkFn: () => store.has('msi_last_sync'),
    goLabel: 'Market',
  },
  {
    id: 'price_alert',
    label: 'Set a price alert',
    icon: <Bell size={16} />,
    checkFn: () => store.has('msi_alerts'),
    goLabel: 'Alerts',
  },
  {
    id: 'portfolio_analysis',
    label: 'Run portfolio analysis',
    icon: <BarChart3 size={16} />,
    checkFn: () => store.has('msi_stress_test_results'),
    goLabel: 'Analytics',
  },
  {
    id: 'tax_opportunities',
    label: 'Check tax opportunities',
    icon: <Receipt size={16} />,
    checkFn: () => store.has('msi_tax_harvest_prefs'),
    goLabel: 'Tax Center',
  },
  {
    id: 'social_features',
    label: 'Explore social features',
    icon: <Users size={16} />,
    checkFn: () => store.has('msi_social_profile'),
    goLabel: 'Social',
  },
  {
    id: 'stress_test',
    label: 'Stress test your portfolio',
    icon: <Zap size={16} />,
    checkFn: () => store.has('msi_stress_test_results'),
    goLabel: 'Stress Test',
  },
  {
    id: 'export_report',
    label: 'Export your first report',
    icon: <FileDown size={16} />,
    checkFn: () => store.has('msi_report_history'),
    goLabel: 'Reports',
  },
];

// ─── Confetti Particle ─────────────────────────────────────────────────────
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  velocity: number;
  size: number;
}

const CONFETTI_COLORS = ['#84cc16', '#22d3ee', '#f59e0b', '#ef4444', '#a855f7', '#3b82f6'];

const ConfettiBurst: React.FC<{ active: boolean; originY: number }> = ({ active, originY }) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!active) { setParticles([]); return; }
    const newParticles: ConfettiParticle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 12,
      y: originY,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      angle: (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.5,
      velocity: 40 + Math.random() * 60,
      size: 3 + Math.random() * 4,
    }));
    setParticles(newParticles);
    const t = setTimeout(() => setParticles([]), 900);
    return () => clearTimeout(t);
  }, [active, originY]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confetti-burst 0.8s ease-out forwards`,
            '--confetti-tx': `${Math.cos(p.angle) * p.velocity}px`,
            '--confetti-ty': `${Math.sin(p.angle) * p.velocity - 30}px`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes confetti-burst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--confetti-tx), var(--confetti-ty)) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// ─── Component ──────────────────────────────────────────────────────────────
const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  inventory,
  isVisible,
  onToggle,
}) => {
  const [state, setState] = useState<ChecklistState>(() =>
    store.get<ChecklistState>(CHECKLIST_STATE_KEY, DEFAULT_STATE)
  );
  const [celebrateId, setCelebrateId] = useState<string | null>(null);
  const [celebrateY, setCelebrateY] = useState(0);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Persist state
  useEffect(() => {
    store.set(CHECKLIST_STATE_KEY, state);
  }, [state]);

  // Evaluate milestones periodically
  useEffect(() => {
    const check = () => {
      const nowComplete: string[] = [];
      MILESTONES.forEach((m) => {
        if (m.checkFn(inventory)) nowComplete.push(m.id);
      });

      setState((prev) => {
        // Find newly completed milestones
        const newlyComplete = nowComplete.filter((id) => !prev.completedIds.includes(id));
        if (newlyComplete.length === 0 && nowComplete.length === prev.completedIds.length) return prev;

        // Trigger celebration for first new milestone
        if (newlyComplete.length > 0) {
          const firstNew = newlyComplete[0];
          const el = itemRefs.current[firstNew];
          const yOffset = el ? el.offsetTop + 12 : 100;
          setCelebrateId(firstNew);
          setCelebrateY(yOffset);
          setTimeout(() => setCelebrateId(null), 1000);
        }

        return {
          ...prev,
          completedIds: nowComplete,
          lastCelebrated: newlyComplete[0] ?? prev.lastCelebrated,
        };
      });
    };

    check();
    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, [inventory]);

  const handleDismiss = useCallback(() => {
    setState((prev) => ({ ...prev, dismissed: true }));
    onToggle();
  }, [onToggle]);

  const handleToggleMinimize = useCallback(() => {
    setState((prev) => ({ ...prev, minimized: !prev.minimized }));
  }, []);

  const completedCount = state.completedIds.length;
  const totalCount = MILESTONES.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  // Minimized floating badge
  if (isVisible && state.minimized && !state.dismissed) {
    return (
      <div className="fixed bottom-6 right-6 z-[200]">
        <button
          onClick={handleToggleMinimize}
          className="relative w-14 h-14 rounded-full bg-brand-slate border border-slate-700 shadow-xl flex items-center justify-center hover:border-brand-lime/40 transition-all group"
          aria-label="Expand onboarding checklist"
        >
          {/* Progress ring */}
          <svg className="absolute inset-0 w-14 h-14 -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="#1e293b" strokeWidth="3" />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke="#84cc16"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(completedCount / totalCount) * 150.8} 150.8`}
            />
          </svg>
          <span className="text-xs font-black text-brand-lime">
            {completedCount}/{totalCount}
          </span>
        </button>
      </div>
    );
  }

  if (!isVisible || state.dismissed) return null;

  return (
    <div
      className="fixed top-0 right-0 h-full w-80 z-[200] flex flex-col bg-slate-900/98 backdrop-blur-xl border-l border-slate-700/60 shadow-2xl"
      style={{ animation: 'slideInRight 0.3s ease-out' }}
    >
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-brand-lime" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-lime">
            Getting Started
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleMinimize}
            className="p-1.5 text-slate-600 hover:text-white transition-colors"
            aria-label="Minimize checklist"
          >
            <Minimize2 size={14} />
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 text-slate-600 hover:text-white transition-colors"
            aria-label="Close checklist"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">
            <span className="font-bold text-white">{completedCount}</span> of {totalCount} complete
          </span>
          <span className="text-xs font-bold text-brand-lime">{progressPct}%</span>
        </div>
        <div className="h-2 bg-brand-charcoal rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-lime to-green-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Milestone list */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-1.5 relative">
        <ConfettiBurst active={celebrateId !== null} originY={celebrateY} />

        {MILESTONES.map((milestone) => {
          const isComplete = state.completedIds.includes(milestone.id);
          const isCelebrating = celebrateId === milestone.id;

          return (
            <div
              key={milestone.id}
              ref={(el) => { itemRefs.current[milestone.id] = el; }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                isComplete
                  ? 'bg-brand-lime/5 border border-brand-lime/10'
                  : 'bg-brand-charcoal/50 border border-slate-800 hover:border-slate-700'
              } ${isCelebrating ? 'ring-2 ring-brand-lime/40 scale-[1.02]' : ''}`}
            >
              {/* Checkbox */}
              <div className="flex-shrink-0">
                {isComplete ? (
                  <CheckCircle2
                    size={20}
                    className={`text-brand-lime ${isCelebrating ? 'animate-bounce' : ''}`}
                  />
                ) : (
                  <Circle size={20} className="text-slate-700" />
                )}
              </div>

              {/* Icon */}
              <div className={`flex-shrink-0 ${isComplete ? 'text-brand-lime/60' : 'text-slate-600'}`}>
                {milestone.icon}
              </div>

              {/* Label */}
              <span
                className={`flex-1 text-xs ${
                  isComplete ? 'text-slate-400 line-through' : 'text-slate-300'
                }`}
              >
                {milestone.label}
              </span>

              {/* Go link */}
              {!isComplete && (
                <button className="flex items-center gap-0.5 text-[10px] font-bold text-brand-lime/60 hover:text-brand-lime transition-colors whitespace-nowrap">
                  Go
                  <ChevronRight size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Dismiss option */}
      <div className="px-5 py-3 border-t border-slate-800">
        <button
          onClick={handleDismiss}
          className="text-[10px] text-slate-600 hover:text-slate-400 uppercase tracking-widest font-bold transition-colors"
        >
          Dismiss checklist
        </button>
      </div>
    </div>
  );
};

export default OnboardingChecklist;
