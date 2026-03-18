import React, { useMemo } from 'react';
import {
  Upload,
  Download,
  Clock,
  FileSpreadsheet,
  ChevronRight,
  Package,
} from 'lucide-react';
import { CardInventory } from '../types';
import { getImportHistory, ImportSource } from '../lib/core/importService';

interface ImportWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

const SOURCE_LABELS: Record<ImportSource, string> = {
  csv: 'CSV',
  ebay_history: 'eBay',
  psa_cert: 'PSA Cert',
  cardladder: 'CardLadder',
  collx: 'CollX',
  manual_json: 'JSON',
};

export const ImportWidget: React.FC<ImportWidgetProps> = ({ _cards, onClick }) => {
  const history = useMemo(() => getImportHistory(), []);

  const lastImport = useMemo(() => {
    if (history.records.length === 0) return null;
    return history.records[history.records.length - 1];
  }, [history]);

  const totalImported = useMemo(() => {
    return history.records.reduce((sum, r) => sum + r.count, 0);
  }, [history]);

  const lastImportDate = lastImport
    ? new Date(lastImport.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const lastImportSource = lastImport ? SOURCE_LABELS[lastImport.source] : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <Upload size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Import <span className="text-blue-400">Hub</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Data import & export
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-2 flex-1">
          <Package size={14} className="text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Total Imported</p>
            <p className="text-lg font-bebas tracking-wider text-white">
              {totalImported.toLocaleString()} <span className="text-xs text-slate-500 font-sans">cards</span>
            </p>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-700" />
        <div className="flex items-center gap-2 flex-1">
          <FileSpreadsheet size={14} className="text-green-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Imports</p>
            <p className="text-lg font-bebas tracking-wider text-white">
              {history.records.length}
            </p>
          </div>
        </div>
      </div>

      {/* Last Import */}
      {lastImport ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/5 border border-blue-500/15 rounded-xl">
          <Clock size={14} className="text-blue-400 flex-shrink-0" />
          <span className="text-xs text-slate-400">Last import:</span>
          <span className="text-xs text-white font-bold">{lastImportDate}</span>
          <span className="text-xs text-slate-500">via</span>
          <span className="text-xs text-blue-400 font-bold">{lastImportSource}</span>
          <span className="ml-auto text-xs font-mono text-slate-400">
            {lastImport.count} cards
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 border border-slate-700 rounded-xl">
          <Upload size={14} className="text-slate-500 flex-shrink-0" />
          <span className="text-xs text-slate-500">No imports yet — click to get started</span>
        </div>
      )}

      {/* Action Hints */}
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold rounded-lg">
          <Upload size={12} />
          Import
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-lg">
          <Download size={12} />
          Export
        </span>
        <span className="ml-auto text-slate-600 text-[10px] uppercase tracking-widest font-black">
          CSV &bull; eBay &bull; PSA &bull; JSON
        </span>
      </div>
    </button>
  );
};

export default ImportWidget;
