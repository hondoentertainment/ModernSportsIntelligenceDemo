import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import {
  CENTERING_HEURISTIC_DISCLOSURE,
  estimateCenteringFromFile,
  type CenteringHeuristicResult,
} from '../lib/utils/centeringHeuristic';

interface CenteringHeuristicPanelProps {
  result?: CenteringHeuristicResult | null;
  onResult?: (result: CenteringHeuristicResult) => void;
  allowUpload?: boolean;
  compact?: boolean;
}

export const CenteringHeuristicPanel: React.FC<CenteringHeuristicPanelProps> = ({
  result,
  onResult,
  allowUpload = false,
  compact = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file || !onResult) return;
    setBusy(true);
    try {
      onResult(await estimateCenteringFromFile(file));
    } finally {
      setBusy(false);
    }
  };

  const data = result;

  return (
    <section
      aria-label="Centering heuristic"
      className={`rounded-2xl border border-amber-500/30 bg-amber-500/5 ${compact ? 'p-3' : 'p-4'} space-y-3`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">
            Geometry heuristic (not CV)
          </p>
          <p className={`text-slate-300 leading-snug mt-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {CENTERING_HEURISTIC_DISCLOSURE}
          </p>
        </div>
        {allowUpload && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-200 hover:border-amber-400/50"
          >
            <Upload size={12} />
            {busy ? 'Reading…' : 'Upload photo'}
          </button>
        )}
      </div>
      {allowUpload && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Upload card photo for centering heuristic"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      )}
      {data && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-900/50 p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-slate-500">L / R</p>
              <p className="text-sm font-bold text-white">{data.leftRightRatio}</p>
            </div>
            <div className="rounded-xl bg-slate-900/50 p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-slate-500">T / B</p>
              <p className="text-sm font-bold text-white">{data.topBottomRatio}</p>
            </div>
            <div className="rounded-xl bg-slate-900/50 p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-slate-500">Score</p>
              <p className="text-sm font-bold text-amber-300">{data.centeringScore}</p>
            </div>
          </div>
          <ul className="space-y-1">
            {data.buckets.map((bucket) => (
              <li key={bucket.grade} className="flex items-center justify-between text-[11px] text-slate-300">
                <span>{bucket.grade}</span>
                <span className="font-mono text-slate-400">{bucket.probabilityPct}%</span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-slate-500">
            Source: {data.source === 'demo_path' ? 'demo path (no image geometry)' : 'image metadata heuristic'} · confidence {data.confidencePct}% · not a PSA prediction
          </p>
        </div>
      )}
    </section>
  );
};

export default CenteringHeuristicPanel;
