import React, { useMemo } from 'react';
import { Library } from 'lucide-react';
import type { CardInventory } from '../types';
import {
  PORTFOLIO_INSIGHTS_DISCLOSURE,
  buildPortfolioInsights,
  type DuplicateStack,
  type MixSlice,
  type PerformerRow,
  type PortfolioInsight,
} from '../lib/analytics/portfolioInsights';

interface Props {
  inventory: CardInventory[];
}

function dollars(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(Math.round(value)).toLocaleString('en-US')}`;
}

function signedDollars(value: number): string {
  if (value > 0) return `+${dollars(value)}`;
  if (value < 0) return dollars(value);
  return dollars(0);
}

function signedPct(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const body = Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
  return value > 0 ? `+${body}` : body;
}

const TONE_CLASS: Record<PortfolioInsight['tone'], string> = {
  positive: 'text-emerald-300',
  watch: 'text-amber-200',
  info: 'text-slate-200',
};

function MixList({ title, rows }: { title: string; rows: MixSlice[] }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-brand-muted">{title}</p>
      {rows.length === 0 ? (
        <p className="text-[11px] text-slate-500">Nothing to mix.</p>
      ) : (
        <ul className="space-y-2">
          {rows.slice(0, 4).map((row) => (
            <li key={row.key} className="flex min-w-0 items-center justify-between gap-3 text-sm">
              <span className="min-w-0 break-words text-white">
                {row.label}
                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {row.count}
                </span>
              </span>
              <span className="font-mono text-xs text-slate-300">{row.sharePct.toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function scrollToPlanner(): void {
  const node = document.getElementById('sell-trade-planner');
  if (!node) return;
  const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  node.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  node.focus({ preventScroll: true });
}

function PerformerList({ title, rows, empty }: { title: string; rows: PerformerRow[]; empty: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-brand-muted">{title}</p>
      {rows.length === 0 ? (
        <p className="text-[11px] text-slate-500">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.cardId} className="min-w-0 rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                <p className="break-words text-sm text-white">{row.player}</p>
                <p className={`font-mono text-xs ${row.gain >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {signedDollars(row.gain)} ({signedPct(row.gainPct)})
                </p>
              </div>
              <p className="mt-1 break-words text-[11px] text-slate-500">
                {row.label} · cost {dollars(row.cost)} · mark {dollars(row.mark)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DuplicateList({ rows, stackCount }: { rows: DuplicateStack[]; stackCount: number }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-brand-muted">
        Duplicate stacks · {stackCount}
      </p>
      {rows.length === 0 ? (
        <p className="text-[11px] text-slate-500">No duplicate stacks in the active book.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.key} className="min-w-0 rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                <p className="break-words text-sm text-white">{row.player}</p>
                <p className="font-mono text-xs text-slate-300">
                  {row.copies} copies · extras {dollars(row.extraMark)}
                </p>
              </div>
              <p className="mt-1 break-words text-[11px] text-slate-500">
                {row.label} · {row.grades.join(', ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const PortfolioInsightsPanel: React.FC<Props> = ({ inventory }) => {
  const report = useMemo(() => buildPortfolioInsights(inventory), [inventory]);
  if (inventory.length === 0) return null;

  const { totals } = report;
  const unrealizedClass =
    totals.unrealized > 0 ? 'text-emerald-300' : totals.unrealized < 0 ? 'text-rose-300' : 'text-white';

  return (
    <section
      className="rounded-2xl border border-slate-800 bg-brand-charcoal/60 p-4 sm:p-5 md:p-6"
      aria-label="Portfolio book insights"
    >
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Library size={16} className="shrink-0 text-sky-300" aria-hidden />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white">Portfolio book insights</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
              All-in cost · preferred marks · duplicate stacks
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={scrollToPlanner}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 text-xs font-bold text-sky-100"
        >
          Plan sells and trade-ins
        </button>
      </div>
      <p className="mb-4 text-[11px] leading-relaxed text-slate-400">{PORTFOLIO_INSIGHTS_DISCLOSURE}</p>

      <dl className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
            <div className="min-w-0 rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-3">
              <dt className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Preferred mark</dt>
              <dd className="mt-1 font-mono text-sm text-white">{dollars(totals.mark)}</dd>
            </div>
            <div className="min-w-0 rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-3">
              <dt className="text-[10px] font-black uppercase tracking-widest text-brand-muted">All-in cost</dt>
              <dd className="mt-1 font-mono text-sm text-white">{dollars(totals.allInCost)}</dd>
              {totals.feeDrag > 0 ? (
                <p className="mt-1 text-[10px] text-slate-500">Includes {dollars(totals.feeDrag)} in fees</p>
              ) : null}
            </div>
            <div className="min-w-0 rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-3">
              <dt className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Unrealized</dt>
              <dd className={`mt-1 font-mono text-sm ${unrealizedClass}`}>
                {signedDollars(totals.unrealized)} ({signedPct(totals.unrealizedPct)})
              </dd>
            </div>
            <div className="min-w-0 rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-3">
              <dt className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Realized</dt>
              <dd className="mt-1 font-mono text-sm text-white">{signedDollars(totals.realized)}</dd>
              <p className="mt-1 text-[10px] text-slate-500">
                {totals.soldCount === 0 ? 'No sold cards' : `${totals.soldCount} sold`}
              </p>
            </div>
          </dl>

          {totals.compBackedCount > 0 ? (
            <p className="mt-3 text-[11px] text-slate-400">
              {totals.compBackedCount === 1
                ? '1 holding uses a sold-comp median (fresh or stale tape). The rest use the stored mark.'
                : `${totals.compBackedCount} holdings use a sold-comp median (fresh or stale tape). The rest use the stored mark.`}
            </p>
          ) : null}

          {report.insights.length > 0 ? (
            <ul className="mt-4 space-y-3" aria-label="Book insight notes">
              {report.insights.map((insight) => (
                <li key={insight.id} className="min-w-0 rounded-xl border border-slate-800/80 bg-brand-slate/20 px-4 py-3">
                  <p className={`break-words text-sm font-medium ${TONE_CLASS[insight.tone]}`}>{insight.title}</p>
                  <p className="mt-1 break-words text-[11px] leading-relaxed text-slate-400">{insight.detail}</p>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <PerformerList title="Above cost" rows={report.gainers} empty="No holdings are above all-in cost." />
            <PerformerList title="Below cost" rows={report.losers} empty="No holdings are below all-in cost." />
          </div>

          <div className="mt-4">
            <DuplicateList rows={report.duplicates} stackCount={report.duplicateStackCount} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <MixList title="Slab mix" rows={report.slabMix} />
            <MixList title="Era mix" rows={report.eraMix} />
            <MixList title="Print-run mix" rows={report.printRunMix} />
          </div>
    </section>
  );
};

export default PortfolioInsightsPanel;
