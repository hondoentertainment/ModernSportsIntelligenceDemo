import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  Code,
  Play,
  Search,
  TrendingUp,
  Plus,
  Trash2,
  Copy,
  Save,
  BookOpen,
  BarChart3,
  Clock,
  Filter,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  QuantStrategy,
  StrategyResult,
  BacktestResult,
  ScreenerFilter,
  ScreenerResult,
  runStrategy,
  runBacktest,
  runScreener,
  getTemplates,
  getSavedStrategies,
  saveStrategy,
  SCREENER_FIELDS,
  SCREENER_OPERATORS,
} from '../lib/quantWorkbenchService';

// ── Props ───────────────────────────────────────────────────────────────────────

interface QuantWorkbenchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Tab Config ──────────────────────────────────────────────────────────────────

type TabId = 'editor' | 'screener' | 'backtest' | 'templates';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'editor', label: 'Editor', icon: <Code size={16} /> },
  { id: 'screener', label: 'Screener', icon: <Filter size={16} /> },
  { id: 'backtest', label: 'Backtest', icon: <BarChart3 size={16} /> },
  { id: 'templates', label: 'Templates', icon: <BookOpen size={16} /> },
];

// ── Helpers ─────────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function formatPct(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

function _syntaxHighlight(code: string): string {
  // Basic keyword highlighting via CSS class spans
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  html = html.replace(/(\/\/.*$)/gm, '<span class="qw-comment">$1</span>');

  // Strings
  html = html.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="qw-string">$1</span>');

  // Keywords
  const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'new', 'true', 'false', 'null', 'undefined'];
  keywords.forEach(kw => {
    html = html.replace(new RegExp(`\\b(${kw})\\b`, 'g'), '<span class="qw-keyword">$1</span>');
  });

  // Numbers
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="qw-number">$1</span>');

  return html;
}

// ── Custom Tooltip ──────────────────────────────────────────────────────────────

const EquityTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[10px] text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-mono font-bold text-brand-lime">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
};

// ── Modal Component ─────────────────────────────────────────────────────────────

const QuantWorkbenchModal: React.FC<QuantWorkbenchModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('editor');

  // Editor state
  const [code, setCode] = useState<string>(
`// Welcome to Quant Workbench
// Write your card analysis strategy here

const filters = {
  grade: "PSA 10",
  maxPrice: 200,
  minVolume: 5,
};

function screen(cards) {
  return cards
    .filter(c => c.grade === filters.grade)
    .filter(c => c.price <= filters.maxPrice)
    .sort((a, b) => b.volume - a.volume);
}

return screen(universe);`
  );
  const [strategyName, setStrategyName] = useState('Untitled Strategy');
  const [editorResult, setEditorResult] = useState<StrategyResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Screener state
  const [screenerFilters, setScreenerFilters] = useState<ScreenerFilter[]>([
    { field: 'price', operator: '<', value: 200, label: 'Price under $200' },
  ]);
  const [screenerResult, setScreenerResult] = useState<ScreenerResult | null>(null);
  const [isScreening, setIsScreening] = useState(false);

  // Backtest state
  const [btStrategyId, setBtStrategyId] = useState('');
  const [btStart, setBtStart] = useState('2024-01-01');
  const [btEnd, setBtEnd] = useState('2025-12-31');
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);

  // Data
  const templates = useMemo(() => getTemplates(), []);
  const savedStrategies = useMemo(() => getSavedStrategies(), []);
  const allStrategies = useMemo(() => [...templates, ...savedStrategies], [templates, savedStrategies]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const bestReturn = backtestResult?.totalReturn ?? null;
    const screenerMatches = screenerResult?.totalMatches ?? 0;
    return {
      savedCount: savedStrategies.length,
      bestReturn,
      screenerMatches,
    };
  }, [savedStrategies, backtestResult, screenerResult]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleRunStrategy = useCallback(() => {
    setIsRunning(true);
    // Simulate async execution
    setTimeout(() => {
      const result = runStrategy(code);
      setEditorResult(result);
      setIsRunning(false);
    }, 300);
  }, [code]);

  const handleSaveStrategy = useCallback(() => {
    saveStrategy({
      name: strategyName,
      description: '',
      code,
      type: 'analysis',
      lastRun: editorResult ? editorResult.timestamp : null,
      lastResult: editorResult,
      author: 'User',
    });
  }, [strategyName, code, editorResult]);

  const handleRunScreener = useCallback(() => {
    setIsScreening(true);
    setTimeout(() => {
      const result = runScreener(screenerFilters);
      setScreenerResult(result);
      setIsScreening(false);
    }, 250);
  }, [screenerFilters]);

  const handleAddFilter = useCallback(() => {
    setScreenerFilters(prev => [
      ...prev,
      { field: 'price', operator: '>', value: 0, label: '' },
    ]);
  }, []);

  const handleRemoveFilter = useCallback((idx: number) => {
    setScreenerFilters(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const handleUpdateFilter = useCallback((idx: number, updates: Partial<ScreenerFilter>) => {
    setScreenerFilters(prev => prev.map((f, i) => i === idx ? { ...f, ...updates } : f));
  }, []);

  const handleRunBacktest = useCallback(() => {
    if (!btStrategyId) return;
    setIsBacktesting(true);
    setTimeout(() => {
      const result = runBacktest(btStrategyId, btStart, btEnd);
      setBacktestResult(result);
      setIsBacktesting(false);
    }, 400);
  }, [btStrategyId, btStart, btEnd]);

  const handleLoadTemplate = useCallback((template: QuantStrategy) => {
    setCode(template.code);
    setStrategyName(template.name);
    setActiveTab('editor');
  }, []);

  const handleRunTemplate = useCallback((template: QuantStrategy) => {
    setCode(template.code);
    setStrategyName(template.name);
    setActiveTab('editor');
    setTimeout(() => {
      const result = runStrategy(template.code);
      setEditorResult(result);
    }, 300);
  }, []);

  if (!isOpen) return null;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-7xl h-[95vh] bg-slate-950 border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Code size={20} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Quantitative Workbench</h2>
              <p className="text-[11px] text-slate-500">BQuant for Cards — Programmatic Analysis & Strategy Backtesting</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Summary badges */}
            <div className="hidden md:flex items-center gap-2">
              <span className="px-2.5 py-1 bg-slate-800/60 border border-slate-700/40 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {summaryStats.savedCount} Saved
              </span>
              {summaryStats.bestReturn !== null && (
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                  summaryStats.bestReturn >= 0
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  Best: {formatPct(summaryStats.bestReturn)}
                </span>
              )}
              {summaryStats.screenerMatches > 0 && (
                <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  {summaryStats.screenerMatches} Matches
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 px-6 py-2 border-b border-slate-800/60 bg-slate-950/80">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content ────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'editor' && (
            <EditorTab
              code={code}
              setCode={setCode}
              strategyName={strategyName}
              setStrategyName={setStrategyName}
              result={editorResult}
              isRunning={isRunning}
              onRun={handleRunStrategy}
              onSave={handleSaveStrategy}
            />
          )}
          {activeTab === 'screener' && (
            <ScreenerTab
              filters={screenerFilters}
              result={screenerResult}
              isScreening={isScreening}
              onAddFilter={handleAddFilter}
              onRemoveFilter={handleRemoveFilter}
              onUpdateFilter={handleUpdateFilter}
              onRun={handleRunScreener}
            />
          )}
          {activeTab === 'backtest' && (
            <BacktestTab
              strategies={allStrategies}
              selectedId={btStrategyId}
              onSelectStrategy={setBtStrategyId}
              startDate={btStart}
              endDate={btEnd}
              onStartDateChange={setBtStart}
              onEndDateChange={setBtEnd}
              result={backtestResult}
              isRunning={isBacktesting}
              onRun={handleRunBacktest}
            />
          )}
          {activeTab === 'templates' && (
            <TemplatesTab
              templates={templates}
              onLoad={handleLoadTemplate}
              onRun={handleRunTemplate}
            />
          )}
        </div>

        {/* ── Status Bar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-2 border-t border-slate-800/60 bg-slate-950/90 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-4">
            {editorResult && (
              <>
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {editorResult.executionTime}ms
                </span>
                <span>{editorResult.rowCount} rows</span>
                <span>Last run: {new Date(editorResult.timestamp).toLocaleTimeString()}</span>
              </>
            )}
            {!editorResult && <span>Ready — write or load a strategy to begin</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cyan-400/60">Quant Workbench v1.0</span>
          </div>
        </div>
      </div>

      {/* Syntax highlight styles */}
      <style>{`
        .qw-comment { color: #6b7280; font-style: italic; }
        .qw-string { color: #34d399; }
        .qw-keyword { color: #22d3ee; font-weight: 600; }
        .qw-number { color: #fbbf24; }
        .qw-code-area {
          font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', monospace;
          font-size: 13px;
          line-height: 1.6;
          tab-size: 2;
        }
        .qw-code-area::selection { background: rgba(34, 211, 238, 0.2); }
      `}</style>
    </div>
  );
};

// ── Editor Tab ──────────────────────────────────────────────────────────────────

interface EditorTabProps {
  code: string;
  setCode: (_code: string) => void;
  strategyName: string;
  setStrategyName: (_name: string) => void;
  result: StrategyResult | null;
  isRunning: boolean;
  onRun: () => void;
  onSave: () => void;
}

const EditorTab: React.FC<EditorTabProps> = ({
  code, setCode, strategyName, setStrategyName, result, isRunning, onRun, onSave,
}) => {
  return (
    <div className="flex h-full">
      {/* Left: Code Editor */}
      <div className="flex-1 flex flex-col border-r border-slate-800/60">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800/40 bg-slate-900/40">
          <input
            type="text"
            value={strategyName}
            onChange={e => setStrategyName(e.target.value)}
            className="flex-1 bg-transparent text-sm font-bold text-white placeholder-slate-600 outline-none"
            placeholder="Strategy name..."
          />
          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
          >
            <Play size={12} />
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 border border-slate-700/40 rounded-lg text-slate-400 text-xs font-bold uppercase tracking-wider hover:bg-slate-700/60 hover:text-white transition-colors"
          >
            <Save size={12} />
            Save
          </button>
        </div>

        {/* Code Editor */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 overflow-auto p-4 bg-slate-950">
            {/* Line numbers */}
            <div className="flex">
              <div className="select-none pr-4 text-right text-slate-600 font-mono text-[13px] leading-[1.6] min-w-[3rem]">
                {code.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                className="qw-code-area flex-1 bg-transparent text-slate-200 outline-none resize-none w-full min-h-full"
                spellCheck={false}
                placeholder="// Write your strategy here..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Results Panel */}
      <div className="w-[45%] flex flex-col bg-slate-900/30">
        <div className="px-4 py-2 border-b border-slate-800/40 flex items-center gap-2">
          <BarChart3 size={14} className="text-slate-500" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Output</span>
          {result && (
            <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              result.resultType === 'error'
                ? 'bg-red-500/10 text-red-400'
                : 'bg-cyan-500/10 text-cyan-400'
            }`}>
              {result.resultType}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4">
          {!result && !isRunning && (
            <div className="flex flex-col items-center justify-center h-full text-slate-600">
              <Code size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Run a strategy to see results</p>
              <p className="text-xs mt-1">Press Run or Ctrl+Enter</p>
            </div>
          )}

          {isRunning && (
            <div className="flex flex-col items-center justify-center h-full text-cyan-400">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-3" />
              <p className="text-sm font-bold">Executing strategy...</p>
            </div>
          )}

          {result && !isRunning && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-3 bg-slate-800/40 border border-slate-700/30 rounded-lg">
                <p className="text-xs text-slate-300">{result.summary}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                  <span>{result.executionTime}ms</span>
                  <span>{result.rowCount} rows</span>
                  <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Table output */}
              {result.resultType === 'table' && Array.isArray(result.output) && (
                <div className="overflow-auto rounded-lg border border-slate-800/60">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-800/60">
                        <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">#</th>
                        <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">Player</th>
                        <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">Card</th>
                        <th className="px-3 py-2 text-right text-slate-400 font-bold uppercase tracking-wider">Price</th>
                        <th className="px-3 py-2 text-right text-slate-400 font-bold uppercase tracking-wider">Change</th>
                        <th className="px-3 py-2 text-right text-slate-400 font-bold uppercase tracking-wider">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.output.slice(0, 20).map((row: any, i: number) => (
                        <tr key={i} className="border-t border-slate-800/40 hover:bg-slate-800/30">
                          <td className="px-3 py-2 text-slate-500 font-mono">{row.rank}</td>
                          <td className="px-3 py-2 text-white font-medium">{row.player}</td>
                          <td className="px-3 py-2 text-slate-400 truncate max-w-[160px]">{row.card}</td>
                          <td className="px-3 py-2 text-right font-mono text-white">${row.price}</td>
                          <td className={`px-3 py-2 text-right font-mono ${row.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {row.change >= 0 ? '+' : ''}{row.change}%
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-cyan-400">{row.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Chart output */}
              {result.resultType === 'chart' && Array.isArray(result.output) && (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.output}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<EquityTooltip />} />
                      <ReferenceLine y={10000} stroke="#475569" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Number output */}
              {result.resultType === 'number' && (
                <div className="text-center py-8">
                  <p className="text-5xl font-mono font-bold text-brand-lime">{result.output.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 mt-2">Total Matches</p>
                </div>
              )}

              {/* List output */}
              {result.resultType === 'list' && Array.isArray(result.output) && (
                <div className="space-y-2">
                  {result.output.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/30 rounded-lg">
                      <div>
                        <span className="text-sm font-bold text-white">{item.player}</span>
                        <span className="text-xs text-slate-500 ml-2">{item.note}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.signal === 'STRONG BUY' ? 'bg-emerald-500/20 text-emerald-400' :
                          item.signal === 'BUY' ? 'bg-green-500/20 text-green-400' :
                          item.signal === 'SELL' ? 'bg-red-500/20 text-red-400' :
                          item.signal === 'OVERSOLD' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {item.signal}
                        </span>
                        <span className="text-xs font-mono text-cyan-400">{item.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Screener Tab ────────────────────────────────────────────────────────────────

interface ScreenerTabProps {
  filters: ScreenerFilter[];
  result: ScreenerResult | null;
  isScreening: boolean;
  onAddFilter: () => void;
  onRemoveFilter: (_idx: number) => void;
  onUpdateFilter: (_idx: number, _updates: Partial<ScreenerFilter>) => void;
  onRun: () => void;
}

const ScreenerTab: React.FC<ScreenerTabProps> = ({
  filters, result, isScreening, onAddFilter, onRemoveFilter, onUpdateFilter, onRun,
}) => {
  return (
    <div className="flex h-full">
      {/* Left: Filter Builder */}
      <div className="w-[40%] flex flex-col border-r border-slate-800/60">
        <div className="px-4 py-3 border-b border-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Filter Builder</span>
          </div>
          <button
            onClick={onAddFilter}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800/60 border border-slate-700/40 rounded text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
          >
            <Plus size={10} />
            Add Filter
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {filters.map((filter, idx) => (
            <div key={idx} className="p-3 bg-slate-800/40 border border-slate-700/30 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Filter {idx + 1}</span>
                <button onClick={() => onRemoveFilter(idx)} className="text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>

              <select
                value={filter.field}
                onChange={e => onUpdateFilter(idx, { field: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/50 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50"
              >
                {SCREENER_FIELDS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>

              <select
                value={filter.operator}
                onChange={e => onUpdateFilter(idx, { operator: e.target.value as ScreenerFilter['operator'] })}
                className="w-full bg-slate-900 border border-slate-700/50 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50"
              >
                {SCREENER_OPERATORS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <input
                type="text"
                value={filter.value}
                onChange={e => onUpdateFilter(idx, { value: e.target.value, label: `${filter.field} ${filter.operator} ${e.target.value}` })}
                placeholder="Value..."
                className="w-full bg-slate-900 border border-slate-700/50 rounded px-2 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 font-mono"
              />
            </div>
          ))}

          {filters.length === 0 && (
            <div className="text-center py-8 text-slate-600">
              <Filter size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">Add filters to screen cards</p>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-slate-800/40">
          <button
            onClick={onRun}
            disabled={isScreening || filters.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/15 border border-cyan-500/30 rounded-lg text-cyan-400 text-xs font-bold uppercase tracking-wider hover:bg-cyan-500/25 transition-colors disabled:opacity-50"
          >
            <Search size={14} />
            {isScreening ? 'Screening...' : 'Run Screener'}
          </button>
        </div>
      </div>

      {/* Right: Results */}
      <div className="flex-1 flex flex-col bg-slate-900/30">
        <div className="px-4 py-3 border-b border-slate-800/40 flex items-center gap-2">
          <BarChart3 size={14} className="text-slate-500" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Results</span>
          {result && (
            <span className="ml-auto px-2 py-0.5 bg-cyan-500/10 rounded text-[10px] font-bold text-cyan-400">
              {result.totalMatches} matches
            </span>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {!result && !isScreening && (
            <div className="flex flex-col items-center justify-center h-full text-slate-600">
              <Search size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Configure filters and run screener</p>
            </div>
          )}

          {isScreening && (
            <div className="flex flex-col items-center justify-center h-full text-cyan-400">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-3" />
              <p className="text-sm font-bold">Scanning universe...</p>
            </div>
          )}

          {result && !isScreening && (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-800/60 sticky top-0">
                  <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">Player</th>
                  <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">Card</th>
                  <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">Sport</th>
                  <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">Grade</th>
                  <th className="px-3 py-2 text-right text-slate-400 font-bold uppercase tracking-wider">Price</th>
                  <th className="px-3 py-2 text-right text-slate-400 font-bold uppercase tracking-wider">Change</th>
                  <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">Matched</th>
                </tr>
              </thead>
              <tbody>
                {result.matches.map((m, i) => (
                  <tr key={i} className="border-t border-slate-800/40 hover:bg-slate-800/30">
                    <td className="px-3 py-2 text-white font-medium">{m.player}</td>
                    <td className="px-3 py-2 text-slate-400 truncate max-w-[150px]">{m.card}</td>
                    <td className="px-3 py-2 text-slate-400">{m.sport}</td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 bg-slate-700/50 rounded text-[10px] font-mono text-white">{m.grade}</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-white">${m.price}</td>
                    <td className={`px-3 py-2 text-right font-mono ${m.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.change >= 0 ? '+' : ''}{m.change}%
                    </td>
                    <td className="px-3 py-2 text-slate-500 text-[10px]">{m.matchedOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Backtest Tab ────────────────────────────────────────────────────────────────

interface BacktestTabProps {
  strategies: QuantStrategy[];
  selectedId: string;
  onSelectStrategy: (_id: string) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (_d: string) => void;
  onEndDateChange: (_d: string) => void;
  result: BacktestResult | null;
  isRunning: boolean;
  onRun: () => void;
}

const BacktestTab: React.FC<BacktestTabProps> = ({
  strategies, selectedId, onSelectStrategy, startDate, endDate,
  onStartDateChange, onEndDateChange, result, isRunning, onRun,
}) => {
  const [showTrades, setShowTrades] = useState(false);

  return (
    <div className="flex h-full">
      {/* Left: Config */}
      <div className="w-[35%] flex flex-col border-r border-slate-800/60">
        <div className="px-4 py-3 border-b border-slate-800/40">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Backtest Config</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Strategy</label>
              <select
                value={selectedId}
                onChange={e => onSelectStrategy(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
              >
                <option value="">Select a strategy...</option>
                {strategies.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => onStartDateChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/50 rounded-lg px-2 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => onEndDateChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/50 rounded-lg px-2 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <button
              onClick={onRun}
              disabled={isRunning || !selectedId}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
            >
              <Play size={14} />
              {isRunning ? 'Running Backtest...' : 'Run Backtest'}
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        {result && (
          <div className="flex-1 overflow-auto p-4 space-y-3">
            <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Key Metrics</h3>

            <div className="grid grid-cols-2 gap-2">
              <MetricCard
                label="Total Return"
                value={formatPct(result.totalReturn)}
                color={result.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}
              />
              <MetricCard
                label="Annualized"
                value={formatPct(result.annualizedReturn)}
                color={result.annualizedReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}
              />
              <MetricCard
                label="Sharpe Ratio"
                value={result.sharpeRatio.toFixed(2)}
                color={result.sharpeRatio >= 1 ? 'text-cyan-400' : result.sharpeRatio >= 0 ? 'text-amber-400' : 'text-red-400'}
              />
              <MetricCard
                label="Max Drawdown"
                value={`-${result.maxDrawdown.toFixed(2)}%`}
                color={result.maxDrawdown < 10 ? 'text-emerald-400' : result.maxDrawdown < 25 ? 'text-amber-400' : 'text-red-400'}
              />
              <MetricCard
                label="Win Rate"
                value={`${result.winRate.toFixed(1)}%`}
                color={result.winRate >= 55 ? 'text-emerald-400' : result.winRate >= 45 ? 'text-amber-400' : 'text-red-400'}
              />
              <MetricCard
                label="Trades"
                value={result.trades.length.toString()}
                color="text-slate-300"
              />
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-slate-500">{result.period} &middot; {result.startDate} to {result.endDate}</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Chart & Trade Log */}
      <div className="flex-1 flex flex-col bg-slate-900/30">
        {!result && !isRunning && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
            <TrendingUp size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Select a strategy and run backtest</p>
          </div>
        )}

        {isRunning && (
          <div className="flex-1 flex flex-col items-center justify-center text-cyan-400">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-3" />
            <p className="text-sm font-bold">Computing backtest...</p>
          </div>
        )}

        {result && !isRunning && (
          <>
            {/* Equity Curve */}
            <div className="p-4 border-b border-slate-800/40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Equity Curve</span>
                <span className={`text-sm font-mono font-bold ${result.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatPct(result.totalReturn)}
                </span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.equityCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickFormatter={d => d.slice(5, 7) + '/' + d.slice(2, 4)}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<EquityTooltip />} />
                    <ReferenceLine y={10000} stroke="#475569" strokeDasharray="3 3" label={{ value: 'Initial', fill: '#475569', fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={result.totalReturn >= 0 ? '#34d399' : '#f87171'}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trade Log */}
            <div className="flex-1 overflow-auto">
              <div className="px-4 py-2 border-b border-slate-800/40 flex items-center justify-between sticky top-0 bg-slate-900/80 backdrop-blur-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trade Log</span>
                <button
                  onClick={() => setShowTrades(!showTrades)}
                  className="text-[10px] text-slate-500 hover:text-white transition-colors"
                >
                  {showTrades ? 'Collapse' : 'Expand'} ({result.trades.length})
                </button>
              </div>

              {showTrades && (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-800/60 sticky top-[33px]">
                      <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">Date</th>
                      <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">Action</th>
                      <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">Player</th>
                      <th className="px-3 py-2 text-right text-slate-400 font-bold uppercase tracking-wider">Price</th>
                      <th className="px-3 py-2 text-right text-slate-400 font-bold uppercase tracking-wider">Qty</th>
                      <th className="px-3 py-2 text-right text-slate-400 font-bold uppercase tracking-wider">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.trades.slice(0, 50).map((trade, i) => (
                      <tr key={i} className="border-t border-slate-800/40 hover:bg-slate-800/30">
                        <td className="px-3 py-1.5 text-slate-400 font-mono">{trade.date.slice(5)}</td>
                        <td className="px-3 py-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            trade.action === 'buy'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {trade.action}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-white">{trade.player}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-slate-300">${trade.price}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-slate-400">{trade.quantity}</td>
                        <td className={`px-3 py-1.5 text-right font-mono ${
                          trade.pnl > 0 ? 'text-emerald-400' : trade.pnl < 0 ? 'text-red-400' : 'text-slate-500'
                        }`}>
                          {trade.pnl !== 0 ? `${trade.pnl > 0 ? '+' : ''}$${trade.pnl.toFixed(0)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {!showTrades && result.trades.length > 0 && (
                <div className="p-4 text-center text-slate-600 text-xs">
                  {result.trades.length} trades recorded. Click Expand to view.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Metric Card ─────────────────────────────────────────────────────────────────

const MetricCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="p-2.5 bg-slate-800/40 border border-slate-700/30 rounded-lg">
    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-lg font-mono font-bold ${color}`}>{value}</p>
  </div>
);

// ── Templates Tab ───────────────────────────────────────────────────────────────

interface TemplatesTabProps {
  templates: QuantStrategy[];
  onLoad: (_t: QuantStrategy) => void;
  onRun: (_t: QuantStrategy) => void;
}

const TYPE_BADGE: Record<string, { color: string; bg: string; border: string }> = {
  screener: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  backtest: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  analysis: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  alert: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};

const TemplatesTab: React.FC<TemplatesTabProps> = ({ templates, onLoad, onRun }) => {
  return (
    <div className="h-full overflow-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {templates.map(t => {
          const badge = TYPE_BADGE[t.type] || TYPE_BADGE.analysis;
          return (
            <div key={t.id} className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-5 hover:border-cyan-500/30 transition-all duration-300 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badge.bg} ${badge.color} ${badge.border}`}>
                  {t.type}
                </span>
                <span className="text-[10px] text-slate-600">{t.author}</span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2">{t.name}</h3>
              <p className="text-xs text-slate-400 mb-4 flex-1 leading-relaxed">{t.description}</p>

              {/* Code preview */}
              <div className="bg-slate-950 border border-slate-800/60 rounded-lg p-3 mb-4 max-h-20 overflow-hidden">
                <pre className="text-[10px] font-mono text-slate-500 leading-relaxed whitespace-pre-wrap">
                  {t.code.split('\n').slice(0, 4).join('\n')}
                </pre>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onLoad(t)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800/60 border border-slate-700/40 rounded-lg text-slate-300 text-[11px] font-bold uppercase tracking-wider hover:bg-slate-700/60 hover:text-white transition-colors"
                >
                  <Copy size={12} />
                  Load
                </button>
                <button
                  onClick={() => onRun(t)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-400 text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-500/25 transition-colors"
                >
                  <Play size={12} />
                  Run
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuantWorkbenchModal;
