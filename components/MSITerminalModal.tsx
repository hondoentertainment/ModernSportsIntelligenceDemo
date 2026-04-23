// @ts-nocheck
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  X,
  Terminal,
  ChevronRight,
  Command,
  Clock,
  Hash,
  AlertTriangle,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  executeCommand,
  getAutocompleteSuggestions,
  clearCommandHistory,
  CommandResult,
} from '../lib/utils/msiTerminalService';

// ── Types ───────────────────────────────────────────────────────────────────────

interface MSITerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HistoryEntry {
  input: string;
  result: CommandResult;
  timestamp: string;
}

// ── Monospace style constant ────────────────────────────────────────────────────

const MONO: React.CSSProperties = { fontFamily: "'Courier New', monospace" };
const TERM_GREEN = '#00ff41';
const _TERM_GREEN_DIM = '#00cc33';
const _TERM_GREEN_DARK = '#004d00';

// ── Sub-components for result rendering ─────────────────────────────────────────

const PlayerDataView: React.FC<{ data: any }> = ({ data }) => {
  if (data.type === 'quicklook' || data.type === 'depth') {
    return (
      <div className="space-y-3">
        {/* Player header */}
        <div className="flex items-start justify-between border-b border-emerald-500/20 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white">{data.name}</h3>
            <p className="text-xs text-slate-400">{data.team} — {data.sport}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-emerald-400" style={MONO}>
              ${data.topCardValue?.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className={`text-xs ${data.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>
                {data.priceChange24h >= 0 ? '+' : ''}{data.priceChange24h}% 24h
              </span>
              <span className={`text-xs ${data.priceChange7d >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>
                {data.priceChange7d >= 0 ? '+' : ''}{data.priceChange7d}% 7d
              </span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <MetricBox label="Sentiment" value={`${data.sentiment}/100`} color={data.sentiment > 80 ? 'emerald' : data.sentiment > 60 ? 'amber' : 'red'} />
          <MetricBox label="Exposure" value={`${data.portfolioExposure}%`} color="blue" />
          {Object.entries(data.keyStats || {}).slice(0, 6).map(([k, v]) => (
            <MetricBox key={k} label={k} value={String(v)} color="slate" />
          ))}
        </div>

        {/* Recent sales */}
        {data.recentSales?.length > 0 && (
          <div>
            <div className="text-[10px] text-emerald-600 uppercase tracking-wider mb-1" style={MONO}>Recent Sales</div>
            <div className="space-y-1">
              {data.recentSales.map((sale: any, i: number) => (
                <div key={i} className="flex justify-between text-xs bg-slate-900/50 rounded px-2 py-1">
                  <span className="text-slate-400 truncate flex-1">{sale.card}</span>
                  <span className="text-emerald-400 ml-2" style={MONO}>${sale.price.toLocaleString()}</span>
                  <span className="text-slate-600 ml-2 text-[10px]">{sale.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price history chart for depth view */}
        {data.priceHistory && (
          <div>
            <div className="text-[10px] text-emerald-600 uppercase tracking-wider mb-1" style={MONO}>Price History (90d)</div>
            <div className="h-40 bg-slate-950/50 rounded p-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.priceHistory}>
                  <defs>
                    <linearGradient id="termGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={TERM_GREEN} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={TERM_GREEN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #00ff4140', fontFamily: "'Courier New', monospace", fontSize: 11 }}
                    labelStyle={{ color: '#00ff41' }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, 'Price']}
                  />
                  <Area type="monotone" dataKey="price" stroke={TERM_GREEN} fill="url(#termGreen)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Comparables for depth view */}
        {data.comparables && (
          <div>
            <div className="text-[10px] text-emerald-600 uppercase tracking-wider mb-1" style={MONO}>Comparables</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-emerald-600/80 border-b border-emerald-900/30">
                    <th className="text-left py-1 pr-3" style={MONO}>Name</th>
                    <th className="text-left py-1 pr-3" style={MONO}>Sport</th>
                    <th className="text-right py-1 pr-3" style={MONO}>Value</th>
                    <th className="text-right py-1 pr-3" style={MONO}>7d Chg</th>
                    <th className="text-right py-1" style={MONO}>Match</th>
                  </tr>
                </thead>
                <tbody>
                  {data.comparables.map((c: any, i: number) => (
                    <tr key={i} className="border-b border-slate-800/30">
                      <td className="py-1 pr-3 text-white">{c.name}</td>
                      <td className="py-1 pr-3 text-slate-400">{c.sport}</td>
                      <td className="py-1 pr-3 text-right text-emerald-400" style={MONO}>${c.value.toLocaleString()}</td>
                      <td className={`py-1 pr-3 text-right ${c.change7d >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>{c.change7d >= 0 ? '+' : ''}{c.change7d}%</td>
                      <td className="py-1 text-right text-amber-400" style={MONO}>{c.similarity}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
  return <pre className="text-emerald-400 text-xs whitespace-pre-wrap" style={MONO}>{JSON.stringify(data, null, 2)}</pre>;
};

const MarketDataView: React.FC<{ data: any }> = ({ data }) => {
  if (data.type === 'index') {
    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between border-b border-emerald-500/20 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white">MSI 500 Index</h3>
            <p className="text-xs text-slate-400">Sports Card Market Composite</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400" style={MONO}>{data.level?.toLocaleString()}</div>
            <span className={`text-xs ${data.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>
              {data.change >= 0 ? '+' : ''}{data.change}%
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <MetricBox label="52w High" value={data.high52w?.toLocaleString()} color="emerald" />
          <MetricBox label="52w Low" value={data.low52w?.toLocaleString()} color="red" />
          <MetricBox label="A/D" value={`${data.advancers}/${data.decliners}`} color="slate" />
          <MetricBox label="Volume" value={data.volume} color="blue" />
        </div>
        {data.chartData && (
          <div className="h-44 bg-slate-950/50 rounded p-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="idxGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TERM_GREEN} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={TERM_GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: '#475569', fontSize: 9 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #00ff4140', fontFamily: "'Courier New', monospace", fontSize: 11 }}
                  labelStyle={{ color: '#00ff41' }}
                />
                <Area type="monotone" dataKey="value" stroke={TERM_GREEN} fill="url(#idxGreen)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        {data.sectors && (
          <div>
            <div className="text-[10px] text-emerald-600 uppercase tracking-wider mb-1" style={MONO}>Sectors</div>
            <div className="space-y-1">
              {data.sectors.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-slate-900/50 rounded px-2 py-1 text-xs">
                  <span className="text-white">{s.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500" style={MONO}>{s.weight}%</span>
                    <span className={`${s.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>
                      {s.change >= 0 ? '+' : ''}{s.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (data.type === 'movers') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white border-b border-emerald-500/20 pb-2">Top Movers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <MoverList title="GAINERS" items={data.gainers} color="emerald" />
          <MoverList title="LOSERS" items={data.losers} color="red" />
          <MoverList title="MOST ACTIVE" items={data.mostActive} color="blue" />
        </div>
      </div>
    );
  }

  if (data.type === 'volatility') {
    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between border-b border-emerald-500/20 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white">MSI Volatility Index</h3>
            <p className="text-xs text-slate-400">{data.label}</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${data.currentVix > 35 ? 'text-red-400' : data.currentVix > 20 ? 'text-amber-400' : 'text-emerald-400'}`} style={MONO}>
              {data.currentVix}
            </div>
            <span className={`text-xs ${data.change >= 0 ? 'text-red-400' : 'text-emerald-400'}`} style={MONO}>
              {data.change >= 0 ? '+' : ''}{data.change}
            </span>
          </div>
        </div>
        {data.chartData && (
          <div className="h-36 bg-slate-950/50 rounded p-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: '#475569', fontSize: 9 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #00ff4140', fontFamily: "'Courier New', monospace", fontSize: 11 }} />
                <Line type="monotone" dataKey="vix" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {data.sectorVol && (
          <div className="grid grid-cols-2 gap-2">
            {data.sectorVol.map((s: any, i: number) => (
              <MetricBox key={i} label={s.sector} value={`${s.vol}%`} color={s.vol > 25 ? 'red' : s.vol > 15 ? 'amber' : 'emerald'} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (data.type === 'arbitrage') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white border-b border-emerald-500/20 pb-2">Arbitrage Opportunities</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-emerald-600/80 border-b border-emerald-900/30">
                {['Player', 'Card', 'Buy @', 'Sell @', 'Spread', 'Conf'].map(h => (
                  <th key={h} className="text-left py-1 pr-2" style={MONO}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.opportunities?.map((o: any, i: number) => (
                <tr key={i} className="border-b border-slate-800/30">
                  <td className="py-1 pr-2 text-white">{o.player}</td>
                  <td className="py-1 pr-2 text-slate-400 truncate max-w-[120px]">{o.card}</td>
                  <td className="py-1 pr-2 text-emerald-400" style={MONO}>${o.priceA} <span className="text-slate-600">({o.platformA})</span></td>
                  <td className="py-1 pr-2 text-amber-400" style={MONO}>${o.priceB} <span className="text-slate-600">({o.platformB})</span></td>
                  <td className="py-1 pr-2 text-emerald-300 font-bold" style={MONO}>+{o.spread}%</td>
                  <td className="py-1 text-slate-400" style={MONO}>{o.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return <pre className="text-emerald-400 text-xs whitespace-pre-wrap" style={MONO}>{JSON.stringify(data, null, 2)}</pre>;
};

const ChartView: React.FC<{ data: any }> = ({ data }) => {
  const CHART_COLORS = ['#00ff41', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#34d399'];

  if (data.type === 'priceHistory') {
    return (
      <div className="space-y-2">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>{data.player} — Price History (90d)</div>
        <div className="h-52 bg-slate-950/50 rounded p-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.history}>
              <defs>
                <linearGradient id="chartGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={TERM_GREEN} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={TERM_GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #00ff4140', fontFamily: "'Courier New', monospace", fontSize: 11 }}
                labelStyle={{ color: '#00ff41' }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, 'Price']}
              />
              <Area type="monotone" dataKey="price" stroke={TERM_GREEN} fill="url(#chartGreen)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (data.type === 'allocation') {
    return (
      <div className="space-y-2">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Portfolio Allocation</div>
        <div className="h-52 bg-slate-950/50 rounded p-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.slices}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={80}
                dataKey="value" nameKey="name"
                label={({ name, value }) => `${name} ${value}%`}
              >
                {data.slices?.map((_: any, i: number) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #00ff4140', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (data.type === 'montecarlo') {
    return (
      <div className="space-y-2">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Monte Carlo Simulation ({data.iterations?.toLocaleString()} iterations)</div>
        <div className="h-52 bg-slate-950/50 rounded p-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.scenarios}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9 }} />
              <YAxis tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #00ff4140', fontFamily: "'Courier New', monospace", fontSize: 11 }} />
              <Area type="monotone" dataKey="p90" stroke="#34d399" fill="#34d39920" strokeWidth={1} name="P90 (Best)" />
              <Area type="monotone" dataKey="p50" stroke={TERM_GREEN} fill="#00ff4120" strokeWidth={1.5} name="P50 (Median)" />
              <Area type="monotone" dataKey="p10" stroke="#f87171" fill="#f8717120" strokeWidth={1} name="P10 (Worst)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (data.type === 'heatmap') {
    return (
      <div className="space-y-2">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Market Heatmap</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {data.sectors?.map((s: any, i: number) => {
            const intensity = Math.min(Math.abs(s.change) / 6, 1);
            const bg = s.change >= 0
              ? `rgba(0, 255, 65, ${intensity * 0.3})`
              : `rgba(248, 113, 113, ${intensity * 0.3})`;
            return (
              <div key={i} className="rounded-lg p-4 text-center border border-slate-800/50" style={{ background: bg }}>
                <div className="text-sm font-bold text-white">{s.name}</div>
                <div className={`text-lg font-bold ${s.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>
                  {s.change >= 0 ? '+' : ''}{s.change}%
                </div>
                <div className="text-[10px] text-slate-400">{s.weight}% weight</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <pre className="text-emerald-400 text-xs whitespace-pre-wrap" style={MONO}>{JSON.stringify(data, null, 2)}</pre>;
};

const TableView: React.FC<{ data: any }> = ({ data }) => {
  // Handle clear action
  if (data.action === 'clear') return null;

  // History
  if (data.history) {
    return (
      <div className="space-y-1">
        <div className="text-xs text-emerald-600 uppercase tracking-wider mb-2" style={MONO}>Command History</div>
        {data.history.length === 0 ? (
          <p className="text-xs text-slate-500" style={MONO}>No commands in history.</p>
        ) : (
          data.history.slice(0, 20).map((h: any, i: number) => (
            <div key={i} className="flex items-center gap-3 text-xs bg-slate-900/30 rounded px-2 py-1">
              <span className="text-slate-600 w-16 flex-shrink-0" style={MONO}>{new Date(h.timestamp).toLocaleTimeString()}</span>
              <span className="text-emerald-400 flex-1" style={MONO}>{h.input}</span>
              <span className="text-slate-600 text-[10px]" style={MONO}>{h.resultType}</span>
            </div>
          ))
        )}
      </div>
    );
  }

  // Status
  if (data.status) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-emerald-600 uppercase tracking-wider mb-2" style={MONO}>System Status</div>
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="flex justify-between bg-slate-900/30 rounded px-3 py-1.5">
            <span className="text-xs text-slate-400 uppercase" style={MONO}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="text-xs text-emerald-400 font-bold" style={MONO}>{String(v)}</span>
          </div>
        ))}
      </div>
    );
  }

  // Workspaces list
  if (data.workspaces !== undefined) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-emerald-600 uppercase tracking-wider mb-2" style={MONO}>Saved Workspaces</div>
        {data.workspaces.length === 0 ? (
          <p className="text-xs text-slate-500" style={MONO}>No saved workspaces. Use WS SAVE &lt;name&gt; to create one.</p>
        ) : (
          data.workspaces.map((ws: any, i: number) => (
            <div key={i} className="flex justify-between bg-slate-900/30 rounded px-3 py-1.5">
              <span className="text-xs text-white" style={MONO}>{ws.name}</span>
              <span className="text-xs text-slate-500" style={MONO}>{new Date(ws.createdAt).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    );
  }

  // Message
  if (data.message) {
    return <p className="text-xs text-emerald-400" style={MONO}>{data.message}</p>;
  }

  // Performance
  if (data.type === 'performance') {
    return (
      <div className="space-y-3">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Portfolio Performance</div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {data.periods?.map((p: any) => (
            <MetricBox key={p.label} label={p.label} value={`${p.return >= 0 ? '+' : ''}${p.return}%`} color={p.return >= 0 ? 'emerald' : 'red'} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <MetricBox label="Alpha" value={`${data.alpha >= 0 ? '+' : ''}${data.alpha}%`} color={data.alpha >= 0 ? 'emerald' : 'red'} />
          <MetricBox label="Best Month" value={data.bestMonth} color="emerald" />
          <MetricBox label="Worst Month" value={data.worstMonth} color="red" />
        </div>
      </div>
    );
  }

  // Risk
  if (data.type === 'risk') {
    return (
      <div className="space-y-3">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Portfolio Risk Metrics</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <MetricBox label="VaR 95%" value={`$${data.var95?.toLocaleString()}`} color="amber" />
          <MetricBox label="VaR 99%" value={`$${data.var99?.toLocaleString()}`} color="red" />
          <MetricBox label="Volatility" value={`${data.volatility}%`} color="amber" />
          <MetricBox label="Max Drawdown" value={`${data.maxDrawdown}%`} color="red" />
          <MetricBox label="Beta" value={data.beta} color="blue" />
          <MetricBox label="Sharpe" value={data.sharpeRatio} color="emerald" />
          <MetricBox label="Sortino" value={data.sortinoRatio} color="emerald" />
          <MetricBox label="Concentration" value={`${data.concentrationRisk}%`} color="amber" />
          <MetricBox label="Mkt Correlation" value={data.correlationToMarket} color="blue" />
        </div>
      </div>
    );
  }

  // Attribution
  if (data.type === 'attribution') {
    return (
      <div className="space-y-3">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Portfolio Attribution</div>
        <div className="space-y-1">
          {data.bySport?.map((s: any, i: number) => (
            <div key={i} className="flex items-center justify-between bg-slate-900/30 rounded px-3 py-2">
              <span className="text-xs text-white">{s.sport}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500" style={MONO}>{s.weight}% wt</span>
                <span className={`text-xs font-bold ${s.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>
                  {s.pnl >= 0 ? '+' : ''}${s.pnl.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Optimization
  if (data.type === 'optimization') {
    const actionColors: Record<string, string> = { REDUCE: 'text-amber-400 bg-amber-500/10 border-amber-500/30', ADD: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', HEDGE: 'text-red-400 bg-red-500/10 border-red-500/30', HOLD: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    return (
      <div className="space-y-3">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Portfolio Optimization</div>
        {data.suggestions?.map((s: any, i: number) => (
          <div key={i} className="bg-slate-900/30 rounded px-3 py-2 flex items-start gap-3">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${actionColors[s.action] || 'text-slate-400'}`} style={MONO}>{s.action}</span>
            <div className="flex-1">
              <span className="text-xs text-white font-bold">{s.player}</span>
              <p className="text-[10px] text-slate-400">{s.reason}</p>
            </div>
            <span className="text-[10px] text-emerald-500" style={MONO}>{s.impact}</span>
          </div>
        ))}
      </div>
    );
  }

  // Screener
  if (data.type === 'screener') {
    const signalColor: Record<string, string> = { 'STRONG BUY': 'text-emerald-400', 'BUY': 'text-green-400', 'HOLD': 'text-amber-400', 'SELL': 'text-red-400' };
    return (
      <div className="space-y-2">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Card Screener — {data.filters}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-emerald-600/80 border-b border-emerald-900/30">
                {['Player', 'Sport', 'Value', '7d', 'Vol', 'Sent', 'Signal'].map(h => (
                  <th key={h} className="text-left py-1 pr-2" style={MONO}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.results?.map((r: any, i: number) => (
                <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                  <td className="py-1 pr-2 text-white">{r.name}</td>
                  <td className="py-1 pr-2 text-slate-400">{r.sport}</td>
                  <td className="py-1 pr-2 text-emerald-400" style={MONO}>${r.value.toLocaleString()}</td>
                  <td className={`py-1 pr-2 ${r.change7d >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>{r.change7d >= 0 ? '+' : ''}{r.change7d}%</td>
                  <td className="py-1 pr-2 text-slate-400" style={MONO}>{r.volume}</td>
                  <td className="py-1 pr-2 text-amber-400" style={MONO}>{r.sentiment}</td>
                  <td className={`py-1 pr-2 font-bold ${signalColor[r.signal] || 'text-slate-400'}`} style={MONO}>{r.signal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Comparables
  if (data.type === 'comparables') {
    return (
      <div className="space-y-2">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>{data.player} — Comparables</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-emerald-600/80 border-b border-emerald-900/30">
                {['Name', 'Sport', 'Value', '7d Chg', 'Match'].map(h => (
                  <th key={h} className="text-left py-1 pr-2" style={MONO}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.comparables?.map((c: any, i: number) => (
                <tr key={i} className="border-b border-slate-800/30">
                  <td className="py-1 pr-2 text-white">{c.name}</td>
                  <td className="py-1 pr-2 text-slate-400">{c.sport}</td>
                  <td className="py-1 pr-2 text-emerald-400" style={MONO}>${c.value.toLocaleString()}</td>
                  <td className={`py-1 pr-2 ${c.change7d >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>{c.change7d >= 0 ? '+' : ''}{c.change7d}%</td>
                  <td className="py-1 pr-2 text-amber-400" style={MONO}>{c.similarity}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // News
  if (data.type === 'news') {
    const impactColor: Record<string, string> = { positive: 'text-emerald-400', negative: 'text-red-400', neutral: 'text-slate-400' };
    return (
      <div className="space-y-2">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>{data.player} — News Feed</div>
        {data.articles?.map((a: any, i: number) => (
          <div key={i} className="bg-slate-900/30 rounded px-3 py-2 flex items-start gap-2">
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${a.impact === 'positive' ? 'bg-emerald-500' : a.impact === 'negative' ? 'bg-red-500' : 'bg-slate-500'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white leading-tight">{a.headline}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-500">{a.source}</span>
                <span className="text-[10px] text-slate-600">{a.time}</span>
                <span className={`text-[10px] font-bold uppercase ${impactColor[a.impact]}`}>{a.impact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Correlation
  if (data.type === 'correlation') {
    return (
      <div className="space-y-2">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Cross-Sport Correlation Matrix</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <tbody>
              {data.matrix?.map((m: any, i: number) => (
                <tr key={i} className="border-b border-slate-800/30">
                  <td className="py-1 pr-3 text-white">{m.sport1}</td>
                  <td className="py-1 pr-3 text-slate-400">vs</td>
                  <td className="py-1 pr-3 text-white">{m.sport2}</td>
                  <td className={`py-1 font-bold ${m.correlation > 0.5 ? 'text-emerald-400' : m.correlation > 0 ? 'text-amber-400' : 'text-red-400'}`} style={MONO}>{m.correlation.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-slate-500" style={MONO}>{data.note}</p>
      </div>
    );
  }

  // Sharpe
  if (data.type === 'sharpe') {
    return (
      <div className="space-y-3">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Sharpe Ratio Analysis</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <MetricBox label="Portfolio Sharpe" value={data.portfolioSharpe} color="emerald" />
          <MetricBox label="Benchmark Sharpe" value={data.benchmarkSharpe} color="blue" />
          <MetricBox label="Rating" value={data.rating} color={data.portfolioSharpe > 1 ? 'emerald' : 'amber'} />
          <MetricBox label="Return" value={`${data.portfolioReturn}%`} color="emerald" />
          <MetricBox label="Volatility" value={`${data.portfolioVol}%`} color="amber" />
          <MetricBox label="Risk-Free Rate" value={`${data.riskFreeRate}%`} color="slate" />
        </div>
      </div>
    );
  }

  // Beta
  if (data.type === 'beta') {
    return (
      <div className="space-y-3">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Portfolio Beta Analysis</div>
        <MetricBox label="Portfolio Beta" value={data.portfolioBeta} color={data.portfolioBeta > 1 ? 'red' : 'emerald'} />
        <p className="text-[10px] text-slate-400" style={MONO}>{data.interpretation}</p>
        <div className="grid grid-cols-2 gap-2">
          {data.sectorBetas?.map((s: any, i: number) => (
            <MetricBox key={i} label={s.sector} value={s.beta} color={s.beta > 1 ? 'red' : 'emerald'} />
          ))}
        </div>
      </div>
    );
  }

  // Trend
  if (data.type === 'trend') {
    const _signalColor = (v: string) => v === 'BULLISH' || v === 'BUY' || v === 'INCREASING' ? 'text-emerald-400' : 'text-red-400';
    return (
      <div className="space-y-3">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>{data.player} — Trend Signals</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(data.signals || {}).map(([k, v]) => (
            <div key={k} className="bg-slate-900/50 border border-slate-800/50 rounded p-2">
              <div className="text-[9px] text-slate-500 uppercase" style={MONO}>{k}</div>
              <div className={`text-xs font-bold ${typeof v === 'string' && ['BULLISH', 'BUY', 'INCREASING'].includes(v) ? 'text-emerald-400' : typeof v === 'string' && ['BEARISH', 'SELL', 'DECLINING'].includes(v) ? 'text-red-400' : 'text-white'}`} style={MONO}>
                {typeof v === 'number' ? `$${v.toLocaleString()}` : String(v)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grade distribution
  if (data.type === 'grade') {
    return (
      <div className="space-y-2">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>{data.player} — Grade Distribution</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-emerald-600/80 border-b border-emerald-900/30">
                {['Grade', 'Population', 'Avg Price'].map(h => (
                  <th key={h} className="text-left py-1 pr-3" style={MONO}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.distribution?.map((d: any, i: number) => (
                <tr key={i} className="border-b border-slate-800/30">
                  <td className="py-1 pr-3 text-white font-bold">{d.grade}</td>
                  <td className="py-1 pr-3 text-slate-400" style={MONO}>{d.count.toLocaleString()}</td>
                  <td className="py-1 pr-3 text-emerald-400" style={MONO}>${d.avgPrice.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Backtest
  if (data.type === 'backtest') {
    return (
      <div className="space-y-3">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Backtest: {data.strategy}</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <MetricBox label="Total Return" value={`+${data.totalReturn}%`} color="emerald" />
          <MetricBox label="Annualized" value={`+${data.annualized}%`} color="emerald" />
          <MetricBox label="Max Drawdown" value={`-${data.maxDrawdown}%`} color="red" />
          <MetricBox label="Win Rate" value={`${data.winRate}%`} color="amber" />
          <MetricBox label="Trades" value={data.trades} color="blue" />
          <MetricBox label="Sharpe" value={data.sharpe} color="emerald" />
        </div>
      </div>
    );
  }

  // Sectors
  if (data.type === 'sectors') {
    return (
      <div className="space-y-2">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Sector Performance</div>
        {data.sectors?.map((s: any, i: number) => (
          <div key={i} className="flex items-center justify-between bg-slate-900/30 rounded px-3 py-2">
            <span className="text-xs text-white">{s.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500" style={MONO}>{s.weight}%</span>
              <span className={`text-xs font-bold ${s.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>
                {s.change >= 0 ? '+' : ''}{s.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Flow
  if (data.type === 'flow') {
    return (
      <div className="space-y-2">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Market Flow Data</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-emerald-600/80 border-b border-emerald-900/30">
                {['Sector', 'Buy', 'Sell', 'Net Flow'].map(h => (
                  <th key={h} className="text-left py-1 pr-3" style={MONO}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.flows?.map((f: any, i: number) => (
                <tr key={i} className="border-b border-slate-800/30">
                  <td className="py-1 pr-3 text-white">{f.sector}</td>
                  <td className="py-1 pr-3 text-emerald-400" style={MONO}>{f.buyPressure}</td>
                  <td className="py-1 pr-3 text-red-400" style={MONO}>{f.sellPressure}</td>
                  <td className={`py-1 pr-3 font-bold ${f.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>
                    {f.net >= 0 ? '+' : ''}{f.net}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // VaR
  if (data.type === 'var') {
    return (
      <div className="space-y-3">
        <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>Value at Risk</div>
        <div className="grid grid-cols-2 gap-2">
          <MetricBox label="VaR 95%" value={`$${data.var95?.toLocaleString()}`} color="amber" />
          <MetricBox label="VaR 99%" value={`$${data.var99?.toLocaleString()}`} color="red" />
        </div>
        <p className="text-[10px] text-slate-400" style={MONO}>{data.note}</p>
      </div>
    );
  }

  // Fallback
  return <pre className="text-emerald-400 text-xs whitespace-pre-wrap" style={MONO}>{JSON.stringify(data, null, 2)}</pre>;
};

const PortfolioSummaryView: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-3">
    <div className="flex items-start justify-between border-b border-emerald-500/20 pb-3">
      <div>
        <h3 className="text-lg font-bold text-white">Portfolio Summary</h3>
        <p className="text-xs text-slate-400">{data.holdingsCount} cards held</p>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-emerald-400" style={MONO}>${data.totalValue?.toLocaleString()}</div>
        <div className="flex items-center gap-2 justify-end">
          <span className={`text-xs ${data.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>
            {data.totalPnL >= 0 ? '+' : ''}{data.totalPnL}% P&L
          </span>
          <span className={`text-xs ${data.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>
            {data.dayChange >= 0 ? '+' : ''}{data.dayChange}% today
          </span>
        </div>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-emerald-600/80 border-b border-emerald-900/30">
            {['Player', 'Sport', 'Cards', 'Value', 'Cost', 'P&L', 'Weight'].map(h => (
              <th key={h} className="text-left py-1 pr-2" style={MONO}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.holdings?.map((h: any, i: number) => (
            <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20">
              <td className="py-1 pr-2 text-white">{h.player}</td>
              <td className="py-1 pr-2 text-slate-400">{h.sport}</td>
              <td className="py-1 pr-2 text-slate-300" style={MONO}>{h.cards}</td>
              <td className="py-1 pr-2 text-emerald-400" style={MONO}>${h.currentValue.toLocaleString()}</td>
              <td className="py-1 pr-2 text-slate-500" style={MONO}>${h.costBasis.toLocaleString()}</td>
              <td className={`py-1 pr-2 font-bold ${h.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={MONO}>{h.pnl >= 0 ? '+' : ''}{h.pnl}%</td>
              <td className="py-1 pr-2 text-slate-400" style={MONO}>{h.weight}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const HelpView: React.FC<{ data: any }> = ({ data }) => {
  const categoryColors: Record<string, string> = {
    player: 'border-blue-500/40 bg-blue-500/10',
    portfolio: 'border-emerald-500/40 bg-emerald-500/10',
    market: 'border-amber-500/40 bg-amber-500/10',
    analytics: 'border-purple-500/40 bg-purple-500/10',
    system: 'border-slate-500/40 bg-slate-500/10',
  };
  const categoryTitle: Record<string, string> = {
    player: 'PLAYER',
    portfolio: 'PORTFOLIO',
    market: 'MARKET',
    analytics: 'ANALYTICS',
    system: 'SYSTEM',
  };
  return (
    <div className="space-y-4">
      <div className="text-xs text-emerald-600 uppercase tracking-wider" style={MONO}>MSI Terminal — {data.total} Commands Available</div>
      {Object.entries(data.grouped || {}).map(([category, cmds]) => (
        <div key={category}>
          <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border mb-2 inline-block ${categoryColors[category] || ''}`} style={MONO}>
            {categoryTitle[category] || category}
          </div>
          <div className="space-y-1 ml-1">
            {(cmds as any[]).map((cmd, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <span className="text-emerald-400 w-28 flex-shrink-0 font-bold" style={MONO}>{cmd.usage}</span>
                <span className="text-slate-400">{cmd.description}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ErrorView: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-red-400">
      <AlertTriangle size={14} />
      <span className="text-xs font-bold" style={MONO}>{data.message}</span>
    </div>
    {data.suggestions && data.suggestions.length > 0 && (
      <div className="ml-5">
        <p className="text-[10px] text-slate-500 mb-1" style={MONO}>Suggestions:</p>
        {data.suggestions.map((s: string, i: number) => (
          <p key={i} className="text-xs text-emerald-500" style={MONO}>  {s}</p>
        ))}
      </div>
    )}
  </div>
);

const MetricBox: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    red: 'text-red-400 border-red-500/30 bg-red-500/5',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
    slate: 'text-slate-300 border-slate-600/30 bg-slate-600/5',
    purple: 'text-purple-400 border-purple-500/30 bg-purple-500/5',
  };
  return (
    <div className={`rounded border p-2 ${colorMap[color] || colorMap.slate}`}>
      <div className="text-[9px] text-slate-500 uppercase" style={MONO}>{label}</div>
      <div className="text-sm font-bold" style={MONO}>{value}</div>
    </div>
  );
};

const MoverList: React.FC<{ title: string; items: any[]; color: string }> = ({ title, items, color }) => {
  const titleColor = color === 'emerald' ? 'text-emerald-400' : color === 'red' ? 'text-red-400' : 'text-blue-400';
  return (
    <div>
      <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${titleColor}`} style={MONO}>{title}</div>
      <div className="space-y-1">
        {items?.map((item: any, i: number) => (
          <div key={i} className="flex justify-between bg-slate-900/30 rounded px-2 py-1 text-xs">
            <span className="text-white truncate">{item.name}</span>
            <span className={`${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'} font-bold`} style={MONO}>
              {item.change >= 0 ? '+' : ''}{item.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Result Renderer ─────────────────────────────────────────────────────────────

const ResultRenderer: React.FC<{ result: CommandResult }> = ({ result }) => {
  switch (result.resultType) {
    case 'player_data':
      return <PlayerDataView data={result.data} />;
    case 'market_data':
      return <MarketDataView data={result.data} />;
    case 'chart':
      return <ChartView data={result.data} />;
    case 'table':
      return <TableView data={result.data} />;
    case 'portfolio_summary':
      return <PortfolioSummaryView data={result.data} />;
    case 'help':
      return <HelpView data={result.data} />;
    case 'error':
      return <ErrorView data={result.data} />;
    default:
      return <pre className="text-emerald-400 text-xs whitespace-pre-wrap" style={MONO}>{JSON.stringify(result.data, null, 2)}</pre>;
  }
};

// ── Main Modal Component ────────────────────────────────────────────────────────

const MSITerminalModal: React.FC<MSITerminalModalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionStart] = useState(new Date().toISOString());
  const [splitMode, setSplitMode] = useState<1 | 2 | 4>(1);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [entries]);

  // Autocomplete suggestions
  useEffect(() => {
    if (input.trim().length > 0) {
      const sugg = getAutocompleteSuggestions(input);
      setSuggestions(sugg);
      setSelectedSuggestion(-1);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  const handleExecute = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const result = executeCommand(trimmed);

    // Handle clear
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
    // Enter to execute or select suggestion
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

    // Tab for autocomplete
    if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        const idx = selectedSuggestion >= 0 ? selectedSuggestion : 0;
        setInput(suggestions[idx]);
        setSuggestions([]);
        setSelectedSuggestion(-1);
      }
      return;
    }

    // Up/Down for history and suggestions
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestion(prev => Math.max(0, prev - 1));
      } else {
        const inputHistory = entries.map(e => e.input);
        const newIdx = Math.min(historyIndex + 1, inputHistory.length - 1);
        setHistoryIndex(newIdx);
        if (inputHistory[inputHistory.length - 1 - newIdx]) {
          setInput(inputHistory[inputHistory.length - 1 - newIdx]);
        }
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestion(prev => Math.min(suggestions.length - 1, prev + 1));
      } else {
        const inputHistory = entries.map(e => e.input);
        const newIdx = Math.max(-1, historyIndex - 1);
        setHistoryIndex(newIdx);
        if (newIdx < 0) {
          setInput('');
        } else if (inputHistory[inputHistory.length - 1 - newIdx]) {
          setInput(inputHistory[inputHistory.length - 1 - newIdx]);
        }
      }
      return;
    }

    // Ctrl+L to clear
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
      return;
    }
  }, [handleExecute, suggestions, selectedSuggestion, entries, historyIndex]);

  const sessionTime = useMemo(() => {
    const start = new Date(sessionStart).getTime();
    const now = Date.now();
    const diff = Math.floor((now - start) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}m ${s}s`;
  }, [sessionStart]); // recalc on new entries

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full h-full max-w-[98vw] max-h-[98vh] mx-auto flex flex-col bg-slate-950 border border-emerald-500/30 rounded-lg overflow-hidden shadow-2xl shadow-emerald-500/10">

        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-black border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:bg-red-400" onClick={onClose} />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 tracking-wider" style={MONO}>MSI TERMINAL</span>
              <span className="text-[9px] text-emerald-700 tracking-wide" style={MONO}>v1.0.84</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Split mode toggles */}
            <div className="flex items-center gap-1 border border-emerald-900/30 rounded overflow-hidden">
              {([1, 2, 4] as const).map(n => (
                <button
                  key={n}
                  onClick={() => setSplitMode(n)}
                  className={`px-2 py-1 text-[9px] transition-colors ${splitMode === n ? 'bg-emerald-500/20 text-emerald-400' : 'text-emerald-700 hover:text-emerald-500'}`}
                  style={MONO}
                >
                  {n === 1 ? '1x1' : n === 2 ? '1x2' : '2x2'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1 rounded transition-colors ${showHistory ? 'bg-emerald-500/20 text-emerald-400' : 'text-emerald-700 hover:text-emerald-400'}`}
              title="Toggle history sidebar"
            >
              {showHistory ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
            </button>
            <button onClick={onClose} className="text-emerald-700 hover:text-red-400 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Command input bar */}
        <div className="px-4 py-2 bg-slate-950 border-b border-emerald-500/20 relative">
          <div className="flex items-center gap-2">
            <ChevronRight size={14} className="text-emerald-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Enter command... (e.g., MAHOMES GO, PORT, MSI500, HELP)"
              className="bg-transparent flex-1 outline-none text-sm placeholder-emerald-800/50"
              style={{ ...MONO, color: TERM_GREEN }}
            />
            <button
              onClick={handleExecute}
              className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors"
              style={MONO}
            >
              GO
            </button>
          </div>

          {/* Autocomplete dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-4 right-4 top-full z-10 bg-slate-900 border border-emerald-500/30 rounded-b shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className={`px-3 py-1.5 text-xs cursor-pointer transition-colors ${i === selectedSuggestion ? 'bg-emerald-500/20 text-emerald-300' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                  style={MONO}
                  onClick={() => { setInput(s); setSuggestions([]); inputRef.current?.focus(); }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* History sidebar */}
          {showHistory && (
            <div className="w-64 border-r border-emerald-500/20 bg-black/50 flex flex-col overflow-hidden flex-shrink-0">
              <div className="px-3 py-2 border-b border-emerald-900/30 flex items-center justify-between">
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider" style={MONO}>History</span>
                <button
                  onClick={() => { clearCommandHistory(); setEntries([]); }}
                  className="text-[9px] text-emerald-800 hover:text-red-400 transition-colors"
                  style={MONO}
                >
                  CLEAR
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {entries.length === 0 ? (
                  <p className="text-[10px] text-slate-600 p-3" style={MONO}>No commands yet.</p>
                ) : (
                  [...entries].reverse().map((entry, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 border-b border-slate-800/20 cursor-pointer hover:bg-emerald-500/5 transition-colors"
                      onClick={() => { setInput(entry.input); inputRef.current?.focus(); }}
                    >
                      <div className="text-[10px] text-emerald-400 truncate" style={MONO}>{entry.input}</div>
                      <div className="text-[9px] text-slate-600" style={MONO}>
                        {new Date(entry.timestamp).toLocaleTimeString()} — {Math.round(entry.result.executionTime)}ms
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Output area */}
          <div
            ref={outputRef}
            className={`flex-1 overflow-y-auto p-4 ${splitMode > 1 ? 'grid gap-3' : ''}`}
            style={splitMode === 2 ? { gridTemplateColumns: '1fr 1fr' } : splitMode === 4 ? { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' } : {}}
          >
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Terminal size={48} className="text-emerald-500/20 mb-4" />
                <h2 className="text-lg font-bold text-emerald-500/40 mb-2" style={MONO}>MSI Terminal Ready</h2>
                <p className="text-xs text-emerald-700/40 max-w-md" style={MONO}>
                  Type a command above to get started. Try HELP for all commands,
                  or type a player name followed by GO for instant data.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  {['MAHOMES GO', 'PORT', 'MSI500', 'MOVERS', 'SCREEN', 'HELP'].map(cmd => (
                    <button
                      key={cmd}
                      onClick={() => { setInput(cmd); inputRef.current?.focus(); }}
                      className="text-[10px] text-emerald-600 px-2 py-1 border border-emerald-900/40 rounded hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
                      style={MONO}
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            ) : splitMode === 1 ? (
              // Single panel — show all entries
              <div className="space-y-4">
                {entries.map((entry, i) => (
                  <div key={i} className="border border-emerald-900/20 rounded-lg overflow-hidden">
                    {/* Command echo */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border-b border-emerald-900/20">
                      <ChevronRight size={10} className="text-emerald-600" />
                      <span className="text-xs text-emerald-400 flex-1" style={MONO}>{entry.input}</span>
                      <span className="text-[9px] text-emerald-800" style={MONO}>{Math.round(entry.result.executionTime)}ms</span>
                      <span className="text-[9px] text-slate-700" style={MONO}>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </div>
                    {/* Result */}
                    <div className="p-3 bg-slate-950/50">
                      <ResultRenderer result={entry.result} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Multi-panel — show last N entries in separate panels
              entries.slice(-splitMode).map((entry, i) => (
                <div key={i} className="border border-emerald-900/20 rounded-lg overflow-hidden flex flex-col min-h-0">
                  <div className="flex items-center gap-2 px-2 py-1 bg-black/50 border-b border-emerald-900/20 flex-shrink-0">
                    <ChevronRight size={10} className="text-emerald-600" />
                    <span className="text-[10px] text-emerald-400 flex-1 truncate" style={MONO}>{entry.input}</span>
                  </div>
                  <div className="p-2 overflow-y-auto flex-1 bg-slate-950/50">
                    <ResultRenderer result={entry.result} />
                  </div>
                </div>
              ))
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
              <Clock size={9} className="inline mr-1" />
              Session: {sessionTime}
            </span>
            <span className="text-[9px] text-slate-600" style={MONO}>
              <Hash size={9} className="inline mr-1" />
              Commands: {entries.length}
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

export default MSITerminalModal;
