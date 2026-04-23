// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Download,
  FileJson,
  Printer,
  ShieldCheck,
  Scale,
  Landmark,
  ChevronRight,
} from 'lucide-react';
import { useSupabaseInventory } from '../lib/utils/useSupabaseInventory';
import {
  cacheReport,
  exportToCSV,
  exportToJSON,
  generateCollectorAuditDossier,
  renderReportHTML,
  saveReportToHistory,
} from '../lib/utils/reportService';

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatMetric(value: unknown): string {
  if (typeof value !== 'number') return String(value);
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatCell(column: string, value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value !== 'number') return String(value);
  const currencyColumns = ['value', 'cost', 'price', 'proceeds', 'gainloss', 'liability', 'premium', 'gapamount', 'coveredamount', 'expectednet', 'breakevensaleprice'];
  const percentColumns = ['percent', 'gappercent'];
  const normalized = column.toLowerCase();
  if (currencyColumns.some(token => normalized.includes(token))) {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
  if (percentColumns.some(token => normalized.includes(token))) {
    return `${value.toFixed(2)}%`;
  }
  return value.toLocaleString();
}

const CollectorAuditDossier: React.FC = () => {
  const { inventory, initializeFullInventory } = useSupabaseInventory();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCardId = searchParams.get('cardId') ?? '';
  const [scope, setScope] = useState<'portfolio' | 'card'>(requestedCardId ? 'card' : 'portfolio');
  const [includeSold, setIncludeSold] = useState(true);

  useEffect(() => {
    initializeFullInventory();
  }, [initializeFullInventory]);

  const selectedCard = useMemo(
    () => inventory.find(card => card.id === requestedCardId) ?? null,
    [inventory, requestedCardId]
  );

  useEffect(() => {
    if (scope === 'card' && !selectedCard && inventory.length > 0) {
      setScope('portfolio');
      setSearchParams({});
    }
  }, [scope, selectedCard, inventory.length, setSearchParams]);

  const config = useMemo(
    () => ({
      includeSold,
      sections: ['collector_audit_dossier' as const],
    }),
    [includeSold]
  );

  const report = useMemo(
    () =>
      generateCollectorAuditDossier(inventory, config, {
        cardId: scope === 'card' ? selectedCard?.id : undefined,
      }),
    [inventory, config, scope, selectedCard]
  );

  const archiveReport = () => {
    saveReportToHistory(report);
    cacheReport(report);
  };

  const handlePrint = () => {
    archiveReport();
    const html = renderReportHTML(report);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  const summaryCards = [
    {
      label: 'Trust',
      value: report.metadata.scope,
      icon: <ShieldCheck size={16} className="text-cyan-300" />,
    },
    {
      label: 'Tax',
      value: formatMetric(report.sections.find(section => section.title === 'Tax Posture')?.summary?.['Estimated Tax Liability'] ?? 0),
      icon: <Scale size={16} className="text-amber-300" />,
    },
    {
      label: 'Insurance',
      value: formatMetric(report.sections.find(section => section.title === 'Insurance Readiness')?.summary?.['Coverage Gap'] ?? 0),
      icon: <Landmark size={16} className="text-emerald-300" />,
    },
  ];

  if (inventory.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-300">
          <BriefcaseBusiness size={28} />
        </div>
        <h1 className="text-3xl font-bebas tracking-widest text-white">Collector Audit Dossier</h1>
        <p className="text-sm text-slate-400 max-w-lg">
          Add cards to your collection first, then generate a dossier that combines tax posture, insurance readiness, and exit planning.
        </p>
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-lime text-brand-charcoal font-black uppercase tracking-widest text-xs"
        >
          Open Collection <ChevronRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              <BriefcaseBusiness size={22} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bebas tracking-widest text-white">
                Collector Audit <span className="text-cyan-300">Dossier</span>
              </h1>
              <p className="text-sm text-slate-400">
                One operating record for tax posture, insurance readiness, and exit planning.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setScope('portfolio');
                setSearchParams({});
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                scope === 'portfolio'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              Portfolio Scope
            </button>
            <button
              onClick={() => {
                const firstCard = selectedCard ?? inventory[0];
                if (!firstCard) return;
                setScope('card');
                setSearchParams({ cardId: firstCard.id });
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                scope === 'card'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              Single Asset Scope
            </button>
            <button
              onClick={() => setIncludeSold(prev => !prev)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                includeSold
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              {includeSold ? 'Including Sold Cards' : 'Active Holdings Only'}
            </button>
          </div>
          {scope === 'card' && (
            <div className="flex flex-wrap gap-2">
              {inventory.map(card => (
                <button
                  key={card.id}
                  onClick={() => setSearchParams({ cardId: card.id })}
                  className={`px-3 py-2 rounded-xl border text-left text-xs ${
                    selectedCard?.id === card.id
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {card.player}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              archiveReport();
              triggerDownload(exportToCSV(report), `${report.type}.csv`, 'text/csv');
            }}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-emerald-300 text-xs font-black uppercase tracking-widest"
          >
            <Download size={14} /> CSV
          </button>
          <button
            onClick={() => {
              archiveReport();
              triggerDownload(exportToJSON(report), `${report.type}.json`, 'application/json');
            }}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-purple-300 text-xs font-black uppercase tracking-widest"
          >
            <FileJson size={14} /> JSON
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs font-black uppercase tracking-widest"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map(card => (
          <div key={card.label} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{card.label}</span>
              {card.icon}
            </div>
            <div className="text-lg font-mono font-bold text-white break-words">{card.value}</div>
          </div>
        ))}
      </section>

      <div className="space-y-6">
        {report.sections.map((section, index) => (
          <section key={`${section.title}-${index}`} className="bg-slate-900/70 border border-slate-800 rounded-[2rem] p-6 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bebas tracking-wide text-white">{section.title}</h2>
              {(section.sourceType || section.sourceNote) && (
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                  {section.sourceType && (
                    <span className="px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-black uppercase tracking-widest">
                      {section.sourceType.replace(/-/g, ' ')}
                    </span>
                  )}
                  {section.sourceNote && <span>{section.sourceNote}</span>}
                </div>
              )}
            </div>

            {section.summary && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(section.summary).map(([label, value]) => (
                  <div key={label} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</div>
                    <div className="text-sm font-mono font-bold text-white">{String(value)}</div>
                  </div>
                ))}
              </div>
            )}

            {section.columns && section.columns.length > 0 && section.data.length > 0 && (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-xs">
                  <thead className="bg-slate-950">
                    <tr>
                      {section.columns.map(column => (
                        <th key={column} className="px-3 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                          {column.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase()).trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t border-slate-800">
                        {section.columns!.map(column => (
                          <td key={column} className="px-3 py-3 text-slate-300 whitespace-nowrap">
                            {formatCell(column, row[column])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default CollectorAuditDossier;
