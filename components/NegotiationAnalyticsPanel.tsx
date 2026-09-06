import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Gavel, Percent, TrendingUp, XCircle } from 'lucide-react';
import {
  formatDurationMs,
  formatRatePct,
  getNegotiationIntel,
  recordsFromAcquisitionSessions,
  type NegotiationIntel,
  type NegotiationIntelSource,
} from '../lib/trading/negotiationAnalytics';
import { getAllNegotiations } from '../lib/trading/autonomousAcquisitionService';

const SOURCE_COPY: Record<NegotiationIntelSource, string> = {
  empty:
    'No negotiation outcomes yet. Close a deal or walk away in the Arena to build a local history.',
  arena: 'From your local Arena history, persisted on this device via the MSI data layer.',
  simulated:
    'Simulated campaign negotiations — not live marketplace execution. Arena wins and walk-aways persist locally when you close or leave a deal.',
  mixed: 'Combines your Arena history with simulated campaign negotiations (demo, not live tape).',
};

interface NegotiationAnalyticsPanelProps {
  intel?: NegotiationIntel;
  variant?: 'dashboard' | 'embedded';
}

function loadDefaultIntel(): NegotiationIntel {
  return getNegotiationIntel(recordsFromAcquisitionSessions(getAllNegotiations()));
}

const NegotiationAnalyticsPanel: React.FC<NegotiationAnalyticsPanelProps> = ({
  intel,
  variant = 'dashboard',
}) => {
  const resolved = useMemo(() => intel ?? loadDefaultIntel(), [intel]);
  const { stats, source } = resolved;
  const isEmpty = source === 'empty' || stats.totalNegotiations === 0;
  const playbooks = Object.entries(stats.byPlaybook);

  return (
    <section
      aria-label="Negotiation analytics"
      className={
        variant === 'dashboard'
          ? 'rounded-2xl border border-slate-800 bg-brand-charcoal/50 p-5'
          : 'rounded-xl border border-slate-700/50 bg-slate-800/40 p-4'
      }
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
            Negotiation intelligence
          </p>
          <h3 className="text-lg font-bebas tracking-wide text-white">
            Win rate, discount, time-to-close
          </h3>
        </div>
        {variant === 'dashboard' && (
          <Link
            to="/autonomous-acquisition"
            className="text-[10px] font-black uppercase tracking-widest text-brand-orange hover:text-white"
          >
            Open agent desk
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <KpiTile
          label="Win rate"
          value={isEmpty ? '—' : formatRatePct(stats.winRate)}
          hint={isEmpty ? 'No closes yet' : `${stats.totalNegotiations} sessions`}
          icon={<TrendingUp size={14} />}
          accent="text-emerald-400"
        />
        <KpiTile
          label="Avg discount"
          value={isEmpty ? '—' : formatRatePct(stats.avgDiscount)}
          hint={isEmpty ? 'Accepted deals only' : `$${stats.totalSaved.toLocaleString()} saved`}
          icon={<Percent size={14} />}
          accent="text-violet-400"
        />
        <KpiTile
          label="Time to close"
          value={isEmpty ? '—' : formatDurationMs(stats.avgTimeToClose)}
          hint={isEmpty ? 'Accepted / closed' : `${stats.avgRounds} avg rounds`}
          icon={<Clock size={14} />}
          accent="text-amber-400"
        />
        <KpiTile
          label="Walk / incomplete"
          value={isEmpty ? '—' : formatRatePct(stats.walkIncompleteRate)}
          hint={
            isEmpty
              ? 'Walk-aways and open threads'
              : `${formatRatePct(stats.walkAwayRate)} walked · ${formatRatePct(stats.incompleteRate)} open`
          }
          icon={<XCircle size={14} />}
          accent="text-orange-400"
        />
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{SOURCE_COPY[source]}</p>

      {isEmpty && (
        <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <Gavel size={14} className="text-brand-orange" />
          Launch an Arena agent above, or review campaign simulations on the agent desk.
        </p>
      )}

      {variant === 'embedded' && playbooks.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">By playbook</p>
          {playbooks.map(([name, row]) => (
            <div
              key={name}
              className="flex items-center gap-2 rounded-lg border border-slate-700/40 bg-slate-900/40 px-3 py-2 text-xs"
            >
              <span className="flex-1 truncate text-slate-200">{name}</span>
              <span className="text-slate-500">{row.count}</span>
              <span className="font-mono text-emerald-400">{formatRatePct(row.winRate)} win</span>
              <span className="font-mono text-violet-400">{formatRatePct(row.avgDiscount)} off</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

function KpiTile({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
      <p className={`mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500`}>
        <span className={accent}>{icon}</span>
        {label}
      </p>
      <p className={`font-bebas text-2xl tracking-wide ${accent}`}>{value}</p>
      <p className="mt-0.5 text-[10px] text-slate-500">{hint}</p>
    </div>
  );
}

export default NegotiationAnalyticsPanel;
