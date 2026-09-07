import React, { useMemo } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import type { CardInventory } from '../types';
import { generateTradeProposals } from '../lib/analytics/tradeProposalService';

interface Props {
  inventory: CardInventory[];
}

const TradeProposalPanel: React.FC<Props> = ({ inventory }) => {
  const proposals = useMemo(() => generateTradeProposals(inventory), [inventory]);
  if (proposals.length === 0) return null;

  return (
    <section
      className="rounded-2xl border border-slate-800 bg-brand-charcoal/60 p-5 md:p-6"
      aria-label="Trade proposal suggestions"
    >
      <div className="mb-4 flex items-center gap-2">
        <ArrowLeftRight size={16} className="text-cyan-300" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold text-white">Portfolio delta suggestions</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
            Advisory only · local inventory · not a live marketplace
          </p>
        </div>
      </div>
      <ul className="space-y-3">
        {proposals.map((p) => (
          <li key={p.id} className="rounded-xl border border-slate-800/80 bg-brand-slate/30 px-4 py-3">
            <p className="text-sm font-medium text-white">
              {p.givePlayer} for {p.receivePlayer}{' '}
              <span className="text-cyan-300">
                {p.cashDelta >= 0 ? '+' : '−'}${Math.abs(p.cashDelta).toLocaleString()} cash
              </span>
            </p>
            <p className="mt-1 text-xs text-brand-muted">{p.rationale}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TradeProposalPanel;
