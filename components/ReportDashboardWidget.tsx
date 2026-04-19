import React, { useMemo, useState } from 'react';
import {
  FileText,
  ChevronRight,
  FileDown,
  Receipt,
  Table,
  HardDrive,
  Check,
  Loader2,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  generatePortfolioSummary,
  generateTaxReport,
  exportToCSV,
  exportToPDF,
  exportAllData,
  saveReportToHistory,
  getReportHistory,
  formatCurrency,
} from '../lib/portfolioReportService';

interface Props {
  cards: CardInventory[];
  onClick?: () => void;
}

type ActionId = 'pdf' | 'tax' | 'csv' | 'backup';

const ReportDashboardWidget: React.FC<Props> = ({ cards, onClick }) => {
  const [activeAction, setActiveAction] = useState<ActionId | null>(null);
  const [doneAction, setDoneAction] = useState<ActionId | null>(null);

  const totalValue = useMemo(
    () => cards.reduce((sum, c) => sum + (c.currentValue ?? c.purchasePrice), 0),
    [cards],
  );

  const lastExport = useMemo(() => {
    const history = getReportHistory();
    return history.length > 0 ? history[0].generatedAt : null;
  }, []);

  const handleAction = async (action: ActionId) => {
    setActiveAction(action);
    try {
      switch (action) {
        case 'pdf': {
          const report = generatePortfolioSummary(cards);
          const config = { title: 'Portfolio Summary', type: 'portfolio' as const, format: 'pdf' as const, includeSold: false };
          await exportToPDF(report, config);
          saveReportToHistory(config);
          break;
        }
        case 'tax': {
          const tax = generateTaxReport(cards);
          exportToCSV(
            tax.cardDetails.map(c => ({
              Player: c.player,
              'Purchase Price': c.purchasePrice,
              'Current Value': c.currentValue,
              'Gain/Loss': c.gainLoss,
              'Holding Period': c.holdingPeriod,
            })),
            'tax-report-' + new Date().toISOString().slice(0, 10),
          );
          saveReportToHistory({ title: 'Tax Report', type: 'tax', format: 'csv', includeSold: false });
          break;
        }
        case 'csv': {
          exportToCSV(
            cards.map(c => ({
              Player: c.player,
              Year: c.year,
              Set: c.set,
              Sport: c.sport,
              Graded: c.isGraded ? 'Yes' : 'No',
              Grade: c.grade || 'N/A',
              'Purchase Price': c.purchasePrice,
              'Current Value': c.currentValue ?? c.purchasePrice,
            })),
            'collection-export-' + new Date().toISOString().slice(0, 10),
          );
          saveReportToHistory({ title: 'Collection CSV', type: 'portfolio', format: 'csv', includeSold: true });
          break;
        }
        case 'backup':
          exportAllData();
          saveReportToHistory({ title: 'Full Backup', type: 'portfolio', format: 'json', includeSold: true });
          break;
      }
      setDoneAction(action);
      setTimeout(() => setDoneAction(null), 2000);
    } finally {
      setActiveAction(null);
    }
  };

  const actions: { id: ActionId; label: string; icon: React.ReactNode }[] = [
    { id: 'pdf', label: 'Portfolio PDF', icon: <FileDown size={16} /> },
    { id: 'tax', label: 'Tax Report', icon: <Receipt size={16} /> },
    { id: 'csv', label: 'Export CSV', icon: <Table size={16} /> },
    { id: 'backup', label: 'Full Backup', icon: <HardDrive size={16} /> },
  ];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <FileText className="text-indigo-400" size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bebas tracking-widest text-white">Report Center</h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
              Export &amp; Analytics
            </p>
          </div>
        </div>
        <ChevronRight className="text-brand-muted group-hover:text-brand-lime transition-colors" size={20} />
      </div>

      <div className="bg-slate-800/50 rounded-2xl px-5 py-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
          Portfolio Value
        </p>
        <p className="text-lg font-mono font-black text-white">{formatCurrency(totalValue)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ id, label, icon }) => (
          <div
            key={id}
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              if (!activeAction) handleAction(id);
            }}
            className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300">
              {activeAction === id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : doneAction === id ? (
                <Check size={16} className="text-brand-lime" />
              ) : (
                icon
              )}
            </div>
            <span className="text-xs font-bold text-slate-300">{label}</span>
          </div>
        ))}
      </div>

      {lastExport && (
        <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest text-center">
          Last export: {new Date(lastExport).toLocaleDateString()}
        </p>
      )}

      <div className="text-center">
        <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">
          Open Report Builder
        </span>
      </div>
    </button>
  );
};

export default ReportDashboardWidget;
