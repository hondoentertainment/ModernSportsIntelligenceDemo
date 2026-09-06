import React, { useId, useState } from 'react';
import { ChevronRight, HelpCircle, AlertTriangle } from 'lucide-react';
import {
  DERIVED_REASONING_DISCLOSURE,
  type WhyRecommendationView,
} from '../lib/utils/agentReasoning';

interface WhyRecommendationPanelProps {
  view: WhyRecommendationView;
  defaultOpen?: boolean;
  compact?: boolean;
}

function formatConfidence(confidence?: number): string | null {
  if (typeof confidence !== 'number' || Number.isNaN(confidence)) return null;
  const pct = confidence <= 1 ? confidence * 100 : confidence;
  return `${Math.round(pct)}% conf`;
}

const WhyRecommendationPanel: React.FC<WhyRecommendationPanelProps> = ({
  view,
  defaultOpen = false,
  compact = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const confidenceLabel = formatConfidence(view.confidence);

  return (
    <div className={compact ? 'mt-3' : 'mt-4'}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-left transition-colors hover:border-slate-700 hover:bg-slate-900"
      >
        <HelpCircle size={14} className="shrink-0 text-brand-lime" aria-hidden />
        <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
          Why this recommendation?
        </span>
        <ChevronRight
          size={14}
          aria-hidden
          className={`shrink-0 text-brand-muted transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Why this recommendation"
          className="mt-2 space-y-3 rounded-xl border border-slate-800 bg-brand-charcoal/60 p-3"
        >
          <div>
            <p className="text-xs font-bold text-white">{view.agentName}</p>
            {view.persona ? (
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                {view.persona}
              </p>
            ) : null}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500">
              {view.sentiment ? <span>{view.sentiment}</span> : null}
              {confidenceLabel ? <span>{confidenceLabel}</span> : null}
            </div>
          </div>

          {view.conclusion ? (
            <p className="text-sm leading-relaxed text-slate-300">{view.conclusion}</p>
          ) : null}

          {view.provenance === 'derived' ? (
            <p className="text-[10px] italic leading-relaxed text-slate-500">
              {DERIVED_REASONING_DISCLOSURE}
            </p>
          ) : null}

          {view.missingReason ? (
            <p role="status" className="text-xs leading-relaxed text-slate-400">
              {view.missingReason}
            </p>
          ) : (
            <ol className="list-decimal space-y-1.5 pl-4">
              {view.reasoningChain.map((step, index) => (
                <li key={`${index}-${step.slice(0, 24)}`} className="text-xs leading-relaxed text-slate-300">
                  {step}
                </li>
              ))}
            </ol>
          )}

          {view.conflictNotes.length > 0 ? (
            <div className="space-y-1.5 rounded-lg border border-brand-orange/20 bg-brand-orange/5 p-2">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-orange">
                <AlertTriangle size={12} aria-hidden />
                Conflict notes
              </p>
              <ul className="space-y-1">
                {view.conflictNotes.map((note) => (
                  <li key={note} className="text-[11px] leading-relaxed text-brand-orange/90">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {view.supportingNotes.length > 0 ? (
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                Supporting signals
              </p>
              <ul className="space-y-1">
                {view.supportingNotes.map((note) => (
                  <li key={note} className="text-[11px] leading-relaxed text-slate-400">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default WhyRecommendationPanel;
