// @ts-nocheck
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  Terminal,
  ChevronRight,
  Command,
  Zap,
  Clock,
  Hash,
  AlertTriangle,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  executeCommand,
  getAutocompleteSuggestions,
  clearCommandHistory,
  CommandResult,
} from '../lib/utils/msiTerminalService';

// ── Types ───────────────────────────────────────────────────────────────────────

interface HistoryEntry {
  input: string;
  result: CommandResult;
  timestamp: string;
}

// ── Style constants ─────────────────────────────────────────────────────────────

const MONO: React.CSSProperties = { fontFamily: "'Courier New', monospace" };
const TERM_GREEN = '#00ff41';

// ── Compact result renderer for page ────────────────────────────────────────────

const MetricBox: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    red: 'text-red-400 border-red-500/30 bg-red-500/5',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
    slate: 'text-slate-300 border-slate-600/30 bg-slate-600/5',
  };
  return (
    <div className={`rounded border p-2 ${colorMap[color] || colorMap.slate}`}>
      <div className="text-[9px] text-slate-500 uppercase" style={MONO}>{label}</div>
      <div className="text-sm font-bold" style={MONO}>{value}</div>
    </div>
  );
};

const PageResultRenderer: React.FC<{ result: CommandResult }> = ({ result }) => {
  const { data } = result;

  // Error
  if (result.resultType === 'error') {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <AlertTriangle size={14} />
        <span className="text-xs" style={MONO}>{data.message}</span>
        {data.suggestions?.length > 0 && (
          <span className="text-[10px] text-emerald-600 ml-2" style={MONO}>Try: {data.suggestions.slice(0, 3).join(', ')}</span>
        )}
      </div>
    );
  }

  // Help
  if (result.resultType === 'help') {
    return (
      <div className="space-y-3">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>MSI Terminal — {data.total} Commands</div>
        {Object.entries(data.grouped || {}).map(([cat, cmds]) => (
          <div key={cat}>
            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1" style={MONO}>{cat}</div>
            <div className="space-y-0.5 ml-2">
              {(cmds as any[]).map((cmd, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="text-emerald-400 w-32 flex-shrink-0 font-bold" style={MONO}>{cmd.usage}</span>
                  <span className="text-slate-400">{cmd.description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Player data
  if (result.resultType === 'player_data') {
    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between border-b border-emerald-500/20 pb-2">
          <div>
            <h3 className="text-lg font-bold text-white">{data.name}</h3>
            <p className="text-xs text-slate-400">{data.team} — {data.sport}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-emerald-400" style={MONO}>${data.topCardValue?.toLocaleString()}</div>
            <div className="flex gap-2 justify-end">
              <span className={`text-xs ${data.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>{data.priceChange24h >= 0 ? '+' : ''}{data.priceChange24h}% 24h</span>
              <span className={`text-xs ${data.priceChange7d >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>{data.priceChange7d >= 0 ? '+' : ''}{data.priceChange7d}% 7d</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <MetricBox label="Sentiment" value={`${data.sentiment}/100`} color={data.sentiment > 80 ? 'emerald' : 'amber'} />
          <MetricBox label="Exposure" value={`${data.portfolioExposure}%`} color="blue" />
          {Object.entries(data.keyStats || {}).slice(0, 6).map(([k, v]) => (
            <MetricBox key={k} label={k} value={String(v)} color="slate" />
          ))}
        </div>
        {data.recentSales?.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] text-emerald-600 uppercase tracking-wider" style={MONO}>Recent Sales</div>
            {data.recentSales.map((s: any, i: number) => (
              <div key={i} className="flex justify-between text-xs bg-slate-900/50 rounded px-2 py-1">
                <span className="text-slate-400 truncate flex-1">{s.card}</span>
                <span className="text-emerald-400 ml-2" style={MONO}>${s.price.toLocaleString()}</span>
                <span className="text-slate-600 ml-2 text-[10px]">{s.date}</span>
              </div>
            ))}
          </div>
        )}
        {data.priceHistory && (
          <div className="h-44 bg-slate-950/50 rounded p-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.priceHistory}>
                <defs>
                  <linearGradient id="pgGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TERM_GREEN} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={TERM_GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #00ff4140', fontSize: 11, fontFamily: "'Courier New'" }} />
                <Area type="monotone" dataKey="price" stroke={TERM_GREEN} fill="url(#pgGreen)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  // Portfolio summary
  if (result.resultType === 'portfolio_summary') {
    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between border-b border-emerald-500/20 pb-2">
          <div>
            <h3 className="text-lg font-bold text-white">Portfolio</h3>
            <p className="text-xs text-slate-400">{data.holdingsCount} cards</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400" style={MONO}>${data.totalValue?.toLocaleString()}</div>
            <span className={`text-xs ${data.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>
              {data.totalPnL >= 0 ? '+' : ''}{data.totalPnL}% P&L
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-emerald-600/80 border-b border-emerald-900/30">
                {['Player', 'Sport', 'Value', 'P&L', 'Wt'].map(h => (
                  <th key={h} className="text-left py-1 pr-2" style={MONO}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.holdings?.map((h: any, i: number) => (
                <tr key={i} className="border-b border-slate-800/30">
                  <td className="py-1 pr-2 text-white">{h.player}</td>
                  <td className="py-1 pr-2 text-slate-400">{h.sport}</td>
                  <td className="py-1 pr-2 text-emerald-400" style={MONO}>${h.currentValue.toLocaleString()}</td>
                  <td className={`py-1 pr-2 ${h.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>{h.pnl >= 0 ? '+' : ''}{h.pnl}%</td>
                  <td className="py-1 pr-2 text-slate-400" style={MONO}>{h.weight}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Market data
  if (result.resultType === 'market_data') {
    if (data.type === 'index' && data.chartData) {
      return (
        <div className="space-y-3">
          <div className="flex items-start justify-between border-b border-emerald-500/20 pb-2">
            <h3 className="text-lg font-bold text-white">MSI 500</h3>
            <div className="text-right">
              <span className="text-xl font-bold text-emerald-400" style={MONO}>{data.level?.toLocaleString()}</span>
              <span className={`text-xs ml-2 ${data.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>
                {data.change >= 0 ? '+' : ''}{data.change}%
              </span>
            </div>
          </div>
          <div className="h-44 bg-slate-950/50 rounded p-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="pgIdx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TERM_GREEN} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={TERM_GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: '#475569', fontSize: 9 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #00ff4140', fontSize: 11, fontFamily: "'Courier New'" }} />
                <Area type="monotone" dataKey="value" stroke={TERM_GREEN} fill="url(#pgIdx)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }
    if (data.type === 'movers') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['gainers', 'losers', 'mostActive'].map((key) => (
            <div key={key}>
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${key === 'gainers' ? 'text-emerald-400' : key === 'losers' ? 'text-red-400' : 'text-blue-400'}`} style={MONO}>{key}</div>
              {data[key]?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between bg-slate-900/30 rounded px-2 py-1 text-xs mb-1">
                  <span className="text-white truncate">{item.name}</span>
                  <span className={`${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'} font-bold`} style={MONO}>{item.change >= 0 ? '+' : ''}{item.change}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    // Generic market data
    return <pre className="text-emerald-400 text-xs whitespace-pre-wrap" style={MONO}>{JSON.stringify(data, null, 2)}</pre>;
  }

  // Chart
  if (result.resultType === 'chart') {
    if (data.type === 'priceHistory' && data.history) {
      return (
        <div className="space-y-2">
          <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>{data.player} — Price History</div>
          <div className="h-48 bg-slate-950/50 rounded p-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.history}>
                <defs>
                  <linearGradient id="pgPH" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TERM_GREEN} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={TERM_GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #00ff4140', fontSize: 11, fontFamily: "'Courier New'" }} />
                <Area type="monotone" dataKey="price" stroke={TERM_GREEN} fill="url(#pgPH)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }
    if (data.type === 'montecarlo' && data.scenarios) {
      return (
        <div className="space-y-2">
          <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Monte Carlo ({data.iterations?.toLocaleString()} runs)</div>
          <div className="h-48 bg-slate-950/50 rounded p-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.scenarios}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #00ff4140', fontSize: 11, fontFamily: "'Courier New'" }} />
                <Area type="monotone" dataKey="p90" stroke="#34d399" fill="#34d39920" strokeWidth={1} name="P90" />
                <Area type="monotone" dataKey="p50" stroke={TERM_GREEN} fill="#00ff4120" strokeWidth={1.5} name="P50" />
                <Area type="monotone" dataKey="p10" stroke="#f87171" fill="#f8717120" strokeWidth={1} name="P10" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }
    if (data.type === 'allocation' && data.slices) {
      const colors = ['#00ff41', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa'];
      return (
        <div className="h-52 bg-slate-950/50 rounded p-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.slices} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" label={({ name, value }) => `${name} ${value}%`}>
                {data.slices.map((_: any, i: number) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #00ff4140', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }
    if (data.type === 'heatmap' && data.sectors) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {data.sectors.map((s: any, i: number) => {
            const intensity = Math.min(Math.abs(s.change) / 6, 1);
            const bg = s.change >= 0 ? `rgba(0,255,65,${intensity * 0.3})` : `rgba(248,113,113,${intensity * 0.3})`;
            return (
              <div key={i} className="rounded-lg p-4 text-center border border-slate-800/50" style={{ background: bg }}>
                <div className="text-sm font-bold text-white">{s.name}</div>
                <div className={`text-lg font-bold ${s.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>{s.change >= 0 ? '+' : ''}{s.change}%</div>
              </div>
            );
          })}
        </div>
      );
    }
    return <pre className="text-emerald-400 text-xs whitespace-pre-wrap" style={MONO}>{JSON.stringify(data, null, 2)}</pre>;
  }

  // Table / generic
  if (result.resultType === 'table') {
    if (data.action === 'clear') return null;
    // Pretty-print any table type data as key-values or arrays
    if (data.message) return <p className="text-xs text-emerald-400" style={MONO}>{data.message}</p>;
    return <pre className="text-emerald-400 text-xs whitespace-pre-wrap" style={MONO}>{JSON.stringify(data, null, 2)}</pre>;
  }

  return <pre className="text-emerald-400 text-xs whitespace-pre-wrap" style={MONO}>{JSON.stringify(data, null, 2)}</pre>;
};

// ── Main Page ───────────────────────────────────────────────────────────────────

const MSITerminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionStart] = useState(new Date().toISOString());

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [entries]);

  useEffect(() => {
    if (input.trim().length > 0) {
      setSuggestions(getAutocompleteSuggestions(input));
      setSelectedSuggestion(-1);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  const handleExecute = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const result = executeCommand(trimmed);
    if (result.data?.action === 'clear') {
      setEntries([]);
      setInput('');
      setHistoryIndex(-1);
      return;
    }
    setEntries(prev => [...prev, { input: trimmed, result, timestamp: new Date().toISOString() }]);
    setInput('');
    setHistoryIndex(-1);
    setSuggestions([]);
  }, [input]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
        setInput(suggestions[selectedSuggestion]);
        setSuggestions([]);
        setSelectedSuggestion(-1);
      } else {
        handleExecute();
      }
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setInput(suggestions[selectedSuggestion >= 0 ? selectedSuggestion : 0]);
        setSuggestions([]);
        setSelectedSuggestion(-1);
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestion(prev => Math.max(0, prev - 1));
      } else {
        const hist = entries.map(e => e.input);
        const idx = Math.min(historyIndex + 1, hist.length - 1);
        setHistoryIndex(idx);
        if (hist[hist.length - 1 - idx]) setInput(hist[hist.length - 1 - idx]);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestion(prev => Math.min(suggestions.length - 1, prev + 1));
      } else {
        const idx = Math.max(-1, historyIndex - 1);
        setHistoryIndex(idx);
        if (idx < 0) setInput('');
        else {
          const hist = entries.map(e => e.input);
          if (hist[hist.length - 1 - idx]) setInput(hist[hist.length - 1 - idx]);
        }
      }
      return;
    }
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  }, [handleExecute, suggestions, selectedSuggestion, entries, historyIndex]);

  const sessionTime = useMemo(() => {
    const diff = Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000);
    return `${Math.floor(diff / 60)}m ${diff % 60}s`;
  }, [sessionStart]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-2">
            <Terminal size={12} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Phase 84 — Command Interface</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            MSI <span style={{ color: TERM_GREEN }}>Terminal</span>
          </h1>
          <p className="text-brand-muted max-w-2xl font-medium">
            The Bloomberg of Sports Cards — Professional Command Interface. Type commands to instantly load player data, portfolio analytics, and market intelligence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-500" style={MONO}>TERMINAL ACTIVE</span>
        </div>
      </div>

      {/* Terminal container */}
      <div className="bg-black border border-emerald-500/30 rounded-xl overflow-hidden shadow-2xl shadow-emerald-500/5" style={{ minHeight: '70vh' }}>
        {/* Command bar */}
        <div className="px-4 py-3 bg-slate-950 border-b border-emerald-500/20 relative">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-700 font-bold tracking-wider" style={MONO}>MSI&gt;</span>
            </div>
            <ChevronRight size={14} className="text-emerald-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Enter command... (HELP for all commands, MAHOMES GO, PORT, MSI500, MOVERS)"
              className="bg-transparent flex-1 outline-none text-sm placeholder-emerald-800/40"
              style={{ ...MONO, color: TERM_GREEN }}
            />
            <button
              onClick={handleExecute}
              className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors font-bold"
              style={MONO}
            >
              <Zap size={12} className="inline mr-1" />GO
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1.5 rounded transition-colors ${showHistory ? 'bg-emerald-500/20 text-emerald-400' : 'text-emerald-700 hover:text-emerald-400'}`}
            >
              {showHistory ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
            </button>
          </div>

          {/* Autocomplete */}
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 bg-slate-900 border border-emerald-500/30 border-t-0 shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className={`px-4 py-1.5 text-xs cursor-pointer transition-colors ${i === selectedSuggestion ? 'bg-emerald-500/20 text-emerald-300' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                  style={MONO}
                  onClick={() => { setInput(s); setSuggestions([]); inputRef.current?.focus(); }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex" style={{ minHeight: 'calc(70vh - 100px)' }}>
          {/* History sidebar */}
          {showHistory && (
            <div className="w-64 border-r border-emerald-500/20 bg-black/50 flex flex-col overflow-hidden flex-shrink-0">
              <div className="px-3 py-2 border-b border-emerald-900/30 flex items-center justify-between">
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider" style={MONO}>History</span>
                <button onClick={() => { clearCommandHistory(); setEntries([]); }} className="text-[9px] text-emerald-800 hover:text-red-400" style={MONO}>CLEAR</button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {entries.length === 0 ? (
                  <p className="text-[10px] text-slate-600 p-3" style={MONO}>No commands yet.</p>
                ) : (
                  [...entries].reverse().map((entry, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 border-b border-slate-800/20 cursor-pointer hover:bg-emerald-500/5"
                      onClick={() => { setInput(entry.input); inputRef.current?.focus(); }}
                    >
                      <div className="text-[10px] text-emerald-400 truncate" style={MONO}>{entry.input}</div>
                      <div className="text-[9px] text-slate-600" style={MONO}>{new Date(entry.timestamp).toLocaleTimeString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Output */}
          <div ref={outputRef} className="flex-1 overflow-y-auto p-6">
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Terminal size={64} className="text-emerald-500/15 mb-6" />
                <h2 className="text-2xl font-bold text-emerald-500/30 mb-3" style={MONO}>MSI Terminal Ready</h2>
                <p className="text-sm text-emerald-700/30 max-w-lg mb-6" style={MONO}>
                  Professional command interface for sports card analytics.
                  Type a command above or click a quick-start below.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-xl">
                  {[
                    { cmd: 'HELP', desc: 'All commands' },
                    { cmd: 'MAHOMES GO', desc: 'Player quick look' },
                    { cmd: 'PORT', desc: 'Portfolio summary' },
                    { cmd: 'MSI500', desc: 'Market index' },
                    { cmd: 'MOVERS', desc: 'Top movers' },
                    { cmd: 'SCREEN', desc: 'Card screener' },
                    { cmd: 'WEMBY DEPTH', desc: 'Deep analysis' },
                    { cmd: 'VOL', desc: 'Volatility index' },
                    { cmd: 'ARB', desc: 'Arbitrage opps' },
                  ].map(item => (
                    <button
                      key={item.cmd}
                      onClick={() => { setInput(item.cmd); inputRef.current?.focus(); }}
                      className="text-left px-3 py-2 border border-emerald-900/30 rounded-lg hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
                    >
                      <div className="text-xs text-emerald-500 font-bold group-hover:text-emerald-400" style={MONO}>{item.cmd}</div>
                      <div className="text-[10px] text-slate-600 group-hover:text-slate-400">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {entries.map((entry, i) => (
                  <div key={i} className="border border-emerald-900/20 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2 bg-black/50 border-b border-emerald-900/20">
                      <ChevronRight size={10} className="text-emerald-600" />
                      <span className="text-xs text-emerald-400 flex-1 font-bold" style={MONO}>{entry.input}</span>
                      <span className="text-[9px] text-emerald-800" style={MONO}>{Math.round(entry.result.executionTime)}ms</span>
                      <span className="text-[9px] text-slate-700" style={MONO}>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="p-4 bg-slate-950/30">
                      <PageResultRenderer result={entry.result} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-black border-t border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-emerald-600" style={MONO}>CONNECTED</span>
            </div>
            <span className="text-[9px] text-slate-600" style={MONO}>
              <Clock size={9} className="inline mr-1" />Session: {sessionTime}
            </span>
            <span className="text-[9px] text-slate-600" style={MONO}>
              <Hash size={9} className="inline mr-1" />Commands: {entries.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-slate-700" style={MONO}>
              <Command size={9} className="inline mr-1" />Enter=Execute  Tab=Complete  {'\u2191\u2193'}=History  Ctrl+L=Clear
            </span>
            <span className="text-[9px] text-emerald-800" style={MONO}>MSI Terminal v1.0.84</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MSITerminal;
