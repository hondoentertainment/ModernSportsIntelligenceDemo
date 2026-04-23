// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  X,
  Award,
  TrendingUp,
  Star,
  BarChart3,
  Target,
  Clock,
  ShoppingCart,
  ChevronDown,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  getHOFCandidates,
  getHOFProjection,
  getHistoricalImpact,
  getInvestSignals,
  getHOFStats,
  HOFCandidate,
  HOFInvestSignal,
} from '../lib/utils/hofTrackerService';

interface HOFTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'candidates' | 'projections' | 'historical' | 'signals';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'candidates', label: 'Candidates', icon: <Star size={16} /> },
  { id: 'projections', label: 'Projections', icon: <TrendingUp size={16} /> },
  { id: 'historical', label: 'Historical Impact', icon: <BarChart3 size={16} /> },
  { id: 'signals', label: 'Invest Signals', icon: <ShoppingCart size={16} /> },
];

function probColor(prob: number): string {
  if (prob >= 90) return 'text-emerald-400';
  if (prob >= 75) return 'text-amber-400';
  if (prob >= 60) return 'text-blue-400';
  return 'text-slate-400';
}

function probBarColor(prob: number): string {
  if (prob >= 90) return 'bg-emerald-500';
  if (prob >= 75) return 'bg-amber-500';
  if (prob >= 60) return 'bg-blue-500';
  return 'bg-slate-500';
}

function sportBadge(sport: HOFCandidate['sport']): string {
  const map: Record<string, string> = {
    baseball: 'bg-red-500/10 text-red-400 border-red-500/20',
    basketball: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    football: 'bg-green-500/10 text-green-400 border-green-500/20',
    hockey: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };
  return map[sport] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20';
}

function statusBadge(status: HOFCandidate['status']): { css: string; label: string } {
  const map: Record<string, { css: string; label: string }> = {
    active: { css: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Active' },
    eligible: { css: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Eligible' },
    ballot: { css: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'On Ballot' },
    inducted: { css: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Inducted' },
    not_eligible: { css: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Not Eligible' },
  };
  return map[status] ?? map.active;
}

function signalBadge(signal: HOFInvestSignal['signal']): { css: string; label: string } {
  const map: Record<string, { css: string; label: string }> = {
    strong_buy: { css: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', label: 'STRONG BUY' },
    buy: { css: 'bg-green-500/15 text-green-400 border-green-500/30', label: 'BUY' },
    accumulate: { css: 'bg-blue-500/15 text-blue-400 border-blue-500/30', label: 'ACCUMULATE' },
    hold: { css: 'bg-amber-500/15 text-amber-400 border-amber-500/30', label: 'HOLD' },
    wait: { css: 'bg-slate-500/15 text-slate-400 border-slate-500/30', label: 'WAIT' },
  };
  return map[signal] ?? map.hold;
}

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// ---- Tab Components ----

const CandidatesTab: React.FC = () => {
  const candidates = useMemo(() => getHOFCandidates(), []);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {candidates.map((c) => {
        const isExpanded = expanded === c.id;
        const sb = statusBadge(c.status);
        return (
          <div
            key={c.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setExpanded(isExpanded ? null : c.id)}
              className="w-full p-4 flex items-center gap-4 hover:bg-slate-700/20 transition-colors text-left"
            >
              {/* Probability Circle */}
              <div className="relative w-12 h-12 shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#334155" strokeWidth="4" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke={c.hofProbability >= 90 ? '#34d399' : c.hofProbability >= 75 ? '#fbbf24' : '#60a5fa'}
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={2 * Math.PI * 20 * (1 - c.hofProbability / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${probColor(c.hofProbability)}`}>
                    {c.hofProbability}%
                  </span>
                </div>
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white truncate">{c.player}</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${sportBadge(c.sport)}`}>
                    {c.sport}
                  </span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${sb.css}`}>
                    {sb.label}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {c.team} &middot; {c.position} &middot; WAR: {c.war}
                </div>
              </div>

              {/* Multiplier */}
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-brand-lime">{c.cardValueImpact.multiplier}x</div>
                <div className="text-[10px] text-slate-500">projected</div>
              </div>

              <ChevronDown
                size={16}
                className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-700/30 pt-3">
                {/* Career Stats */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">Career Stats</p>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {Object.entries(c.careerStats).map(([k, v]) => (
                      <div key={k} className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <div className="text-xs font-bold text-white">{v}</div>
                        <div className="text-[9px] text-slate-500">{k}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accolades */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">Accolades</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.accolades.map((a, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-400"
                      >
                        <Trophy size={8} />
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Comparables */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">HOF Comparables</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.hofComparables.map((comp, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-700/50 rounded-full text-[10px] text-slate-300"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Value Impact */}
                <div className="bg-slate-900/50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">Card Value Impact</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-slate-400">Current Avg</div>
                      <div className="text-sm font-bold text-white">{fmt(c.cardValueImpact.currentAvg)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Post-HOF</div>
                      <div className="text-sm font-bold text-emerald-400">{fmt(c.cardValueImpact.projectedPostHOF)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Multiplier</div>
                      <div className="text-sm font-bold text-brand-lime">{c.cardValueImpact.multiplier}x</div>
                    </div>
                  </div>
                  {/* Probability bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-500">HOF Probability</span>
                      <span className={probColor(c.hofProbability)}>{c.hofProbability}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${probBarColor(c.hofProbability)}`}
                        style={{ width: `${c.hofProbability}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ProjectionsTab: React.FC = () => {
  const candidates = useMemo(() => getHOFCandidates(), []);
  const [selectedId, setSelectedId] = useState(candidates[0]?.id ?? '');
  const projection = useMemo(() => getHOFProjection(selectedId), [selectedId]);

  if (!projection) return <div className="text-slate-400 text-sm">Select a player to view projections.</div>;

  return (
    <div className="space-y-5">
      {/* Player Selector */}
      <div className="relative">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-amber-500/50"
        >
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.player} — {c.hofProbability}% ({c.sport})
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
      </div>

      {/* Year-by-Year Probability Curve */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <TrendingUp size={14} className="text-amber-400" /> Year-by-Year HOF Probability
        </h3>
        <p className="text-[10px] text-slate-500 mb-4">
          Tipping point ({">"} 50%): <span className="text-amber-400 font-bold">{projection.tippingPoint}</span>
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projection.yearByYear}>
              <defs>
                <linearGradient id="hofProbGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="year"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#475569' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#475569' }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#f8fafc' }}
                formatter={(value: number, _name: string) => [`${value}%`, 'Probability']}
                labelFormatter={(label: number) => `Year ${label}`}
              />
              <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '50% Tipping Point', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine y={75} stroke="#34d399" strokeDasharray="5 5" label={{ value: '75% Vote Threshold', fill: '#34d399', fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="probability"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#hofProbGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Milestones */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Target size={14} className="text-amber-400" /> Key Milestones
        </h3>
        <div className="space-y-2">
          {projection.keyMilestones.map((m, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Zap size={14} className="text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-medium text-white">{m.milestone}</div>
                  <div className="text-[10px] text-slate-500">{m.yearsAway} year{m.yearsAway !== 1 ? 's' : ''} away</div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400">+{m.impact}% impact</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HistoricalImpactTab: React.FC = () => {
  const history = useMemo(() => getHistoricalImpact(), []);

  const chartData = history.map((h) => ({
    name: h.player.length > 14 ? h.player.substring(0, 12) + '…' : h.player,
    fullName: h.player,
    multiplier: h.multiplier,
    preValue: h.preInductionValue,
    postValue: h.postInductionValue,
    year: h.inductionYear,
  }));

  return (
    <div className="space-y-5">
      {/* Multiplier Bar Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <BarChart3 size={14} className="text-amber-400" /> Post-Induction Card Value Multipliers
        </h3>
        <p className="text-[10px] text-slate-500 mb-4">Average card value change within 6 months of HOF induction</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis
                type="number"
                domain={[1, 3.5]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#475569' }}
                tickFormatter={(v: number) => `${v}x`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#475569' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: 12,
                }}
                formatter={(value: number, _name: string, props: { payload: { fullName: string; year: number } }) => [
                  `${value}x`,
                  `${props.payload.fullName} (${props.payload.year})`,
                ]}
              />
              <Bar dataKey="multiplier" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {chartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.multiplier >= 2 ? '#34d399' : entry.multiplier >= 1.6 ? '#fbbf24' : '#60a5fa'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {history.map((h) => (
          <div key={h.player} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-white">{h.player}</div>
                <div className="text-[10px] text-slate-500">Inducted {h.inductionYear}</div>
              </div>
              <span className="text-lg font-bebas text-emerald-400">{h.multiplier}x</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Pre-Induction</span>
                <div className="text-slate-300 font-medium">{fmt(h.preInductionValue)}</div>
              </div>
              <div>
                <span className="text-slate-500">Post-Induction</span>
                <div className="text-emerald-400 font-medium">{fmt(h.postInductionValue)}</div>
              </div>
              <div>
                <span className="text-slate-500">Peak Value</span>
                <div className="text-amber-400 font-medium">{fmt(h.peakValue)}</div>
              </div>
              <div>
                <span className="text-slate-500">Recovery Time</span>
                <div className="text-slate-300 font-medium">
                  {h.timeToRecover === 0 ? 'Never dropped' : `${h.timeToRecover} months`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InvestSignalsTab: React.FC = () => {
  const signals = useMemo(() => getInvestSignals(), []);

  return (
    <div className="space-y-3">
      <div className="bg-slate-800/30 border border-amber-500/20 rounded-xl p-3 mb-4">
        <p className="text-[11px] text-amber-400 flex items-center gap-2">
          <Zap size={12} />
          <span className="font-bold">HOF induction is the #1 long-term card value catalyst.</span> Buy signals are based on probability thresholds, timing windows, and historical induction data.
        </p>
      </div>

      {signals.map((s) => {
        const badge = signalBadge(s.signal);
        return (
          <div
            key={s.player}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{s.player}</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase border ${badge.css}`}>
                  {badge.label}
                </span>
              </div>
              <span className="text-xs text-slate-400">{s.probabilityThreshold}% HOF</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">{s.reasoning}</p>

            <div className="flex items-center gap-4 text-[10px]">
              <div className="flex items-center gap-1 text-slate-400">
                <Clock size={10} />
                <span>{s.timing}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Target size={10} />
                <span>{s.yearsToInduction} yr{s.yearsToInduction !== 1 ? 's' : ''} to induction</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- Main Modal ----

export const HOFTrackerModal: React.FC<HOFTrackerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('candidates');
  const stats = useMemo(() => getHOFStats(), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 md:pt-16">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20">
              <Award size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bebas tracking-wide text-white">Hall of Fame Tracker</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                {stats.trackedCandidates} Candidates &middot; {stats.highProbability} High Probability &middot; {stats.avgProjectedMultiplier}x Avg Multiplier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50 px-5 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'candidates' && <CandidatesTab />}
          {activeTab === 'projections' && <ProjectionsTab />}
          {activeTab === 'historical' && <HistoricalImpactTab />}
          {activeTab === 'signals' && <InvestSignalsTab />}
        </div>
      </div>
    </div>
  );
};

export default HOFTrackerModal;
