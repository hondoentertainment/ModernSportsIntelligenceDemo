// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
  X, Zap, TrendingUp, TrendingDown, Minus, Activity, Target,
  Clock, Eye, AlertTriangle, Radio, ChevronRight,
} from 'lucide-react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  getVelocityDashboard,
  getInflectionPoints,
  getSentimentHistory,
  getVelocityAlerts,
  getSourceBreakdown,
  type SentimentVelocity,
  type VelocityAlert,
} from '../lib/analytics/sentimentVelocityService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const velColor = (v: number) => {
  if (v >= 3) return 'text-emerald-400';
  if (v >= 1) return 'text-emerald-300';
  if (v > -1) return 'text-slate-300';
  if (v > -3) return 'text-red-300';
  return 'text-red-400';
};

const formatCountdown = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

const severityStyle: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/40',
  high: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
};

type ModalTab = 'overview' | 'player';

const SentimentVelocityModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('overview');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const velocities = useMemo(() => getVelocityDashboard(), []);
  const inflections = useMemo(() => getInflectionPoints(), []);
  const alerts = useMemo(() => getVelocityAlerts(), []);

  const selectedVelocity = useMemo(
    () => selectedPlayer ? velocities.find(v => v.playerId === selectedPlayer) : null,
    [selectedPlayer, velocities],
  );

  const selectedHistory = useMemo(
    () => selectedPlayer ? getSentimentHistory(selectedPlayer, 24) : [],
    [selectedPlayer],
  );

  const chartData = useMemo(() => {
    if (!selectedHistory.length) return [];
    return selectedHistory.filter((_, i) => i % 2 === 0).map((r, idx) => {
      const prev = idx > 0 ? selectedHistory[(idx - 1) * 2] : r;
      return {
        time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sentiment: r.sentimentScore,
        velocity: Math.round((r.sentimentScore - prev.sentimentScore) * 10) / 10,
      };
    });
  }, [selectedHistory]);

  const sources = useMemo(
    () => selectedPlayer ? getSourceBreakdown(selectedPlayer) : [],
    [selectedPlayer],
  );

  const handlePlayerSelect = (id: string) => {
    setSelectedPlayer(id);
    setActiveTab('player');
  };

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('overview');
      setSelectedPlayer(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Zap size={18} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100">Sentiment Velocity Check</h2>
              <p className="text-[10px] text-slate-500">Quick velocity analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 shrink-0">
          <button
            onClick={() => { setActiveTab('overview'); setSelectedPlayer(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          {selectedPlayer && (
            <button
              onClick={() => setActiveTab('player')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'player'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye size={12} /> {selectedVelocity?.playerName}
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'overview' && (
            <>
              {/* Top Movers */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Top Velocity Movers</h3>
                <div className="space-y-1.5">
                  {[...velocities]
                    .sort((a, b) => Math.abs(b.velocity) - Math.abs(a.velocity))
                    .slice(0, 8)
                    .map(v => (
                      <div
                        key={v.playerId}
                        onClick={() => handlePlayerSelect(v.playerId)}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:border-amber-500/30 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-xs font-bold text-slate-200">{v.playerName}</div>
                            <div className="text-[10px] text-slate-500">{v.sport} | Sent: {v.currentSentiment}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`font-mono text-xs font-bold ${velColor(v.velocity)}`}>
                            {v.velocity > 0 ? '+' : ''}{v.velocity.toFixed(1)}/hr
                          </div>
                          <div className={`text-[10px] font-mono ${v.acceleration > 0 ? 'text-amber-400' : v.acceleration < 0 ? 'text-blue-400' : 'text-slate-500'}`}>
                            acc: {v.acceleration > 0 ? '+' : ''}{v.acceleration.toFixed(1)}
                          </div>
                          <ChevronRight size={12} className="text-slate-600" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Upcoming Inflections */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Upcoming Inflections</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inflections.sort((a, b) => a.countdown - b.countdown).slice(0, 4).map(ip => (
                    <div
                      key={ip.id}
                      onClick={() => handlePlayerSelect(ip.playerId)}
                      className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:border-amber-500/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-200">{ip.playerName}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          ip.type === 'peak' ? 'bg-red-500/20 text-red-400' :
                          ip.type === 'trough' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>{ip.type}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">{ip.priorTrend} → {ip.expectedNewTrend}</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Clock size={10} /> {formatCountdown(ip.countdown)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Alerts */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Recent Alerts</h3>
                <div className="space-y-1.5">
                  {alerts.slice(0, 4).map(a => (
                    <div
                      key={a.id}
                      onClick={() => handlePlayerSelect(a.playerId)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer ${severityStyle[a.severity]}`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold">{a.playerName}</span>
                        <span className="text-[10px] opacity-70">{a.type.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="text-[10px] opacity-80">{a.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'player' && selectedVelocity && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Sentiment</div>
                  <div className={`text-xl font-black ${selectedVelocity.currentSentiment >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedVelocity.currentSentiment}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Velocity</div>
                  <div className={`text-xl font-black ${velColor(selectedVelocity.velocity)}`}>
                    {selectedVelocity.velocity > 0 ? '+' : ''}{selectedVelocity.velocity.toFixed(1)}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Accel</div>
                  <div className={`text-xl font-black ${selectedVelocity.acceleration > 0 ? 'text-amber-400' : 'text-blue-400'}`}>
                    {selectedVelocity.acceleration > 0 ? '+' : ''}{selectedVelocity.acceleration.toFixed(1)}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Price</div>
                  <div className="text-xl font-black text-slate-200">${selectedVelocity.currentPrice.toLocaleString()}</div>
                </div>
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <div className="bg-slate-800/30 rounded-xl p-3">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">24h Sentiment + Velocity</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 9 }} interval={Math.floor(chartData.length / 5)} />
                        <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 9 }} domain={[-100, 100]} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 9 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                          labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Area yAxisId="left" dataKey="sentiment" fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" strokeWidth={2} name="Sentiment" />
                        <Line yAxisId="right" dataKey="velocity" stroke="#f59e0b" strokeWidth={2} dot={false} name="Velocity" />
                        <ReferenceLine yAxisId="left" y={0} stroke="#475569" strokeDasharray="3 3" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Sources */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Source Breakdown</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sources.map(src => (
                    <div key={src.name} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                      <span className="text-xs font-bold text-slate-300 capitalize w-16">{src.name}</span>
                      <div className="flex-1 bg-slate-700/30 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${src.score >= 50 ? 'bg-emerald-400' : 'bg-slate-400'}`}
                          style={{ width: `${(src.score + 100) / 2}%` }}
                        />
                      </div>
                      <span className={`text-xs font-mono font-bold ${velColor(src.velocity)}`}>
                        {src.velocity > 0 ? '+' : ''}{src.velocity.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-800/30 rounded-lg p-2.5">
                  <div className="text-[10px] text-slate-500">Price Corr</div>
                  <div className="font-bold text-slate-200">{selectedVelocity.priceCorrelation.toFixed(2)}</div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-2.5">
                  <div className="text-[10px] text-slate-500">Dir Change Prob</div>
                  <div className="font-bold text-amber-400">{Math.round(selectedVelocity.directionChangeProbability * 100)}%</div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-2.5">
                  <div className="text-[10px] text-slate-500">Time to Inflection</div>
                  <div className="font-bold text-amber-400">
                    {selectedVelocity.timeToInflection < 48 ? formatCountdown(selectedVelocity.timeToInflection) : '--'}
                  </div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-2.5">
                  <div className="text-[10px] text-slate-500">State</div>
                  <div className={`font-bold ${selectedVelocity.isAccelerating ? 'text-amber-400' : selectedVelocity.isDecelerating ? 'text-blue-400' : 'text-slate-400'}`}>
                    {selectedVelocity.isAccelerating ? 'Accelerating' : selectedVelocity.isDecelerating ? 'Decelerating' : 'Steady'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentimentVelocityModal;
