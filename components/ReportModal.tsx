import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  FileText,
  FileBarChart,
  Shield,
  TrendingUp,
  Receipt,
  Download,
  Printer,
  FileJson,
  FileCog,
  Eye,
  History,
  Settings2,
  ChevronDown,
  Check,
  AlertCircle,
  BriefcaseBusiness,
} from 'lucide-react';
import { CardInventory, Sport } from '../types';
import {
  ReportType,
  ReportConfig,
  GeneratedReport,
  generateCollectorAuditDossier,
  generatePortfolioSummary,
  generateTaxReport,
  generateInsuranceReport,
  generatePerformanceReport,
  exportToCSV,
  exportToJSON,
  renderReportHTML,
  getReportHistory,
  saveReportToHistory,
  getCachedReport,
  cacheReport,
} from '../lib/reportService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: CardInventory[];
  initialReport?: GeneratedReport | null;
}

type TabId = 'generate' | 'history' | 'preview';

const SPORTS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

const reportTypeConfig: Record<ReportType, { label: string; icon: React.ReactNode; color: string; bg: string; border: string; description: string }> = {
  portfolio_summary: {
    label: 'Portfolio Summary',
    icon: <FileBarChart size={18} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    description: 'Total valuation, cost basis, P&L, allocation breakdown, top and bottom performers',
  },
  tax: {
    label: 'Tax Report',
    icon: <Receipt size={18} />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    description: 'Capital gains/losses, short-term vs long-term, per-card cost basis and proceeds',
  },
  insurance: {
    label: 'Insurance Valuation',
    icon: <Shield size={18} />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    description: 'Itemized card list with market values, grading details, and replacement costs',
  },
  performance: {
    label: 'Performance Analysis',
    icon: <TrendingUp size={18} />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    description: 'Time-weighted return, Sharpe ratio, max drawdown, benchmark comparison',
  },
  collector_audit_dossier: {
    label: 'Collector Audit Dossier',
    icon: <BriefcaseBusiness size={18} />,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    description: 'Unified collector operating record for tax posture, insurance readiness, and exit planning',
  },
};

const reportTypeBadge: Record<ReportType, { label: string; color: string; bg: string }> = {
  portfolio_summary: { label: 'Portfolio', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  tax: { label: 'Tax', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  insurance: { label: 'Insurance', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  performance: { label: 'Performance', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  collector_audit_dossier: { label: 'Dossier', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
};

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

function formatCurrencyValue(val: string | number): string {
  if (typeof val === 'number') {
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return String(val);
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  inventory,
  initialReport,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>(initialReport ? 'preview' : 'generate');
  const [selectedType, setSelectedType] = useState<ReportType>('portfolio_summary');
  const [includeSold, setIncludeSold] = useState(true);
  const [sportFilter, setSportFilter] = useState<Sport[]>([]);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [currentReport, setCurrentReport] = useState<GeneratedReport | null>(initialReport ?? null);
  const [generating, setGenerating] = useState(false);
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false);

  const history = useMemo(() => getReportHistory(), []);

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    setTimeout(() => {
      const config: ReportConfig = {
        includeSold,
        sportFilter: sportFilter.length > 0 ? sportFilter : undefined,
        dateRange: dateStart && dateEnd ? { start: dateStart, end: dateEnd } : undefined,
        sections: [selectedType],
      };

      let report: GeneratedReport;
      switch (selectedType) {
        case 'portfolio_summary':
          report = generatePortfolioSummary(inventory, config);
          break;
        case 'tax':
          report = generateTaxReport(inventory, config);
          break;
        case 'insurance':
          report = generateInsuranceReport(inventory, config);
          break;
        case 'performance':
          report = generatePerformanceReport(inventory, config);
          break;
        case 'collector_audit_dossier':
          report = generateCollectorAuditDossier(inventory, config);
          break;
      }

      saveReportToHistory(report);
      cacheReport(report);
      setCurrentReport(report);
      setGenerating(false);
      setActiveTab('preview');
    }, 150);
  }, [selectedType, includeSold, sportFilter, dateStart, dateEnd, inventory]);

  const handleExportCSV = useCallback((report: GeneratedReport) => {
    const csv = exportToCSV(report);
    triggerDownload(csv, `${report.type}_report.csv`, 'text/csv');
  }, []);

  const handleExportJSON = useCallback((report: GeneratedReport) => {
    const json = exportToJSON(report);
    triggerDownload(json, `${report.type}_report.json`, 'application/json');
  }, []);

  const handlePrint = useCallback((report: GeneratedReport) => {
    const html = renderReportHTML(report);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 300);
    }
  }, []);

  const handleViewFromHistory = useCallback((id: string) => {
    const cached = getCachedReport(id);
    if (cached) {
      setCurrentReport(cached);
      setActiveTab('preview');
    }
  }, []);

  const toggleSport = (sport: Sport) => {
    setSportFilter(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  };

  if (!isOpen) return null;

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'generate', label: 'Generate', icon: <Settings2 size={16} /> },
    { id: 'history', label: 'History', icon: <History size={16} /> },
    { id: 'preview', label: 'Preview', icon: <Eye size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-8 pb-0 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Collection <span className="text-blue-400">Reports</span>
              </h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                Generate, view &amp; export analytics reports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-6 flex gap-1 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white border-t border-x border-slate-700'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'history' && history.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-700 text-[10px] font-mono text-slate-400">
                  {history.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto no-scrollbar border-t border-slate-700">
          {/* Generate Tab */}
          {activeTab === 'generate' && (
            <div className="p-8 space-y-6">
              {/* Report type selector */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Report Type</p>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(reportTypeConfig) as ReportType[]).map(type => {
                    const cfg = reportTypeConfig[type];
                    const isSelected = selectedType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? `${cfg.bg} ${cfg.border} ring-1 ring-opacity-50`
                            : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${cfg.bg} ${cfg.color} flex-shrink-0 mt-0.5`}>
                          {cfg.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isSelected ? cfg.color : 'text-white'}`}>
                              {cfg.label}
                            </span>
                            {isSelected && <Check size={14} className={cfg.color} />}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{cfg.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-6">
                {/* Date range */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Date Range (Optional)</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-500 w-12">From</label>
                      <input
                        type="date"
                        value={dateStart}
                        onChange={e => setDateStart(e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-500 w-12">To</label>
                      <input
                        type="date"
                        value={dateEnd}
                        onChange={e => setDateEnd(e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Sport filter + Sold toggle */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Filters</p>
                  <div className="space-y-2">
                    {/* Sport filter dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setSportDropdownOpen(!sportDropdownOpen)}
                        className="w-full flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white hover:border-slate-600 transition-colors"
                      >
                        <span className={sportFilter.length > 0 ? 'text-white' : 'text-slate-500'}>
                          {sportFilter.length > 0 ? sportFilter.join(', ') : 'All Sports'}
                        </span>
                        <ChevronDown size={14} className={`text-slate-500 transition-transform ${sportDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {sportDropdownOpen && (
                        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                          {SPORTS.map(sport => (
                            <button
                              key={sport}
                              onClick={() => toggleSport(sport)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-slate-700 transition-colors"
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                sportFilter.includes(sport) ? 'bg-blue-500 border-blue-500' : 'border-slate-600'
                              }`}>
                                {sportFilter.includes(sport) && <Check size={10} className="text-white" />}
                              </div>
                              {sport}
                            </button>
                          ))}
                          {sportFilter.length > 0 && (
                            <button
                              onClick={() => { setSportFilter([]); setSportDropdownOpen(false); }}
                              className="w-full px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border-t border-slate-700"
                            >
                              Clear filter
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Include sold toggle */}
                    <button
                      onClick={() => setIncludeSold(!includeSold)}
                      className="w-full flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs hover:border-slate-600 transition-colors"
                    >
                      <span className="text-white">Include sold cards</span>
                      <div className={`w-9 h-5 rounded-full transition-colors relative ${includeSold ? 'bg-blue-500' : 'bg-slate-600'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${includeSold ? 'left-[18px]' : 'left-0.5'}`} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl font-bebas tracking-widest text-lg transition-all
                  ${generating
                    ? 'bg-slate-800 text-slate-500 cursor-wait animate-pulse'
                    : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:border-blue-500/50'
                  }`}
              >
                <FileCog size={20} />
                {generating ? 'Generating Report...' : 'Generate Report'}
              </button>

              {/* Card count info */}
              <div className="flex items-center gap-2 justify-center text-xs text-slate-500">
                <AlertCircle size={12} />
                <span>
                  {inventory.length} card{inventory.length !== 1 ? 's' : ''} in inventory
                  {sportFilter.length > 0 && ` (filtered to ${sportFilter.join(', ')})`}
                </span>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="p-8 space-y-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
                    <History size={32} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400">No reports generated yet</p>
                  <p className="text-xs text-slate-600 mt-1">Generate your first report from the Generate tab</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                    Report History ({history.length})
                  </p>
                  <div className="space-y-2">
                    {history.map(entry => {
                      const badge = reportTypeBadge[entry.type];
                      const date = new Date(entry.generatedAt);
                      const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                      const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                      const cached = getCachedReport(entry.id);

                      return (
                        <div
                          key={entry.id}
                          className="flex items-center gap-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl"
                        >
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${badge.color} ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-white font-medium block">{dateStr} at {timeStr}</span>
                            <span className="text-[10px] text-slate-500">{entry.cardCount} cards analyzed</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {cached && (
                              <button
                                onClick={() => handleViewFromHistory(entry.id)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all"
                              >
                                <Eye size={12} />
                                View
                              </button>
                            )}
                            {cached && (
                              <button
                                onClick={() => handleExportCSV(cached)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all"
                              >
                                <Download size={12} />
                                Export
                              </button>
                            )}
                            {!cached && (
                              <span className="text-[10px] text-slate-600 italic">Cache expired</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="p-8 space-y-6">
              {!currentReport ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
                    <Eye size={32} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400">No report to preview</p>
                  <p className="text-xs text-slate-600 mt-1">Generate a report from the Generate tab or view one from History</p>
                </div>
              ) : (
                <>
                  {/* Report header + export actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bebas tracking-widest text-white">{currentReport.title}</h3>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Generated {new Date(currentReport.generatedAt).toLocaleString()} &bull; {currentReport.cardCount} cards
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePrint(currentReport)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all"
                      >
                        <Printer size={14} />
                        Print
                      </button>
                      <button
                        onClick={() => handleExportCSV(currentReport)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
                      >
                        <Download size={14} />
                        CSV
                      </button>
                      <button
                        onClick={() => handleExportJSON(currentReport)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all"
                      >
                        <FileJson size={14} />
                        JSON
                      </button>
                    </div>
                  </div>

                  {/* Rendered report sections */}
                  {currentReport.sections.map((section, idx) => (
                    <div key={idx} className="space-y-4">
                      <h4 className="text-sm font-bold text-white border-b border-slate-700 pb-2">
                        {section.title}
                      </h4>
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

                      {/* Summary metrics */}
                      {section.summary && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {Object.entries(section.summary).map(([key, value]) => {
                            const numVal = typeof value === 'number' ? value : NaN;
                            const isNeg = !isNaN(numVal) && numVal < 0;
                            const isPos = !isNaN(numVal) && numVal > 0 && (key.includes('P&L') || key.includes('Gain') || key.includes('Return'));
                            return (
                              <div key={key} className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{key}</span>
                                <span className={`text-sm font-mono font-bold ${
                                  isNeg ? 'text-red-400' : isPos ? 'text-green-400' : 'text-white'
                                }`}>
                                  {typeof value === 'number' && (key.includes('Value') || key.includes('Cost') || key.includes('P&L') || key.includes('Gain') || key.includes('Loss') || key.includes('Net') || key.includes('Liability') || key.includes('Premium') || key.includes('Gap') || key.includes('Replacement'))
                                    ? formatCurrencyValue(value)
                                    : typeof value === 'number' && (key.includes('%') || key.includes('Percent'))
                                      ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
                                      : value
                                  }
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Data table */}
                      {section.data.length > 0 && section.columns && section.columns.length > 0 && (
                        <div className="overflow-x-auto rounded-xl border border-slate-700">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-slate-800">
                                {section.columns.map(col => (
                                  <th key={col} className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                    {col.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {section.data.map((row, rowIdx) => (
                                <tr key={rowIdx} className="border-t border-slate-800 hover:bg-slate-800/50 transition-colors">
                                  {section.columns!.map(col => {
                                    const val = row[col];
                                    const numVal = typeof val === 'number' ? val : NaN;
                                    const isGainLoss = col.includes('gainLoss') || col.includes('alpha') || col === 'return' || col === 'returnPct';
                                    const isNeg = !isNaN(numVal) && numVal < 0 && isGainLoss;
                                    const isPos = !isNaN(numVal) && numVal > 0 && isGainLoss;
                                    const isCurrency = typeof val === 'number' && (
                                      col.includes('value') || col.includes('Value') ||
                                      col.includes('cost') || col.includes('Cost') ||
                                      col.includes('price') || col.includes('Price') ||
                                      col.includes('basis') || col.includes('Basis') ||
                                      col.includes('proceeds') || col.includes('Proceeds') ||
                                      col.includes('gainLoss') || col.includes('replacement') ||
                                      col.includes('Replacement') || col.includes('alpha') ||
                                      col.includes('Fees') || col.includes('liability') ||
                                      col.includes('gapAmount') || col.includes('coveredAmount') ||
                                      col.includes('expectedNet') || col.includes('breakEvenSalePrice')
                                    );
                                    const isPct = typeof val === 'number' && (
                                      col.includes('Percent') || col.includes('Pct') ||
                                      col === 'allocation' || col === 'percentage' || col === 'return' || col === 'gapPercent'
                                    );

                                    let display: string;
                                    if (val === undefined || val === null) {
                                      display = '-';
                                    } else if (isCurrency) {
                                      display = `$${Math.abs(numVal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                      if (numVal < 0) display = `-${display}`;
                                    } else if (isPct) {
                                      display = `${numVal >= 0 ? '+' : ''}${numVal.toFixed(2)}%`;
                                    } else if (typeof val === 'number') {
                                      display = val.toLocaleString();
                                    } else {
                                      display = String(val);
                                    }

                                    return (
                                      <td
                                        key={col}
                                        className={`px-3 py-2 whitespace-nowrap font-mono ${
                                          isNeg ? 'text-red-400' : isPos ? 'text-green-400' : 'text-slate-300'
                                        }`}
                                      >
                                        {display}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
