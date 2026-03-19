import React, { useState, useMemo } from 'react';
import {
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  AlertTriangle,
  Search,
  ScanLine,
  Clock,
  Activity,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  getAllFingerprints,
  getDNAMatches,
  getAuthenticationHistory,
  getDNAStats,
  getCounterfeitAlerts,
} from '../lib/core/cardDNAService';

function confidenceColor(value: number): string {
  if (value >= 85) return '#34d399';
  if (value >= 50) return '#facc15';
  return '#f87171';
}

function confidenceLabel(value: number): string {
  if (value >= 85) return 'Authenticated';
  if (value >= 50) return 'Inconclusive';
  return 'Counterfeit Risk';
}

const CardDNA: React.FC = () => {
  const fingerprints = useMemo(() => getAllFingerprints(), []);
  const stats = useMemo(() => getDNAStats(), []);
  const history = useMemo(() => getAuthenticationHistory(), []);
  const alerts = useMemo(() => getCounterfeitAlerts(), []);

  const [selectedId, setSelectedId] = useState<string>(fingerprints[0]?.id ?? '');
  const [searchTerm, setSearchTerm] = useState('');

  const selected = useMemo(
    () => fingerprints.find((fp) => fp.id === selectedId) ?? fingerprints[0],
    [fingerprints, selectedId]
  );

  const matches = useMemo(
    () => (selected ? getDNAMatches(selected.id) : []),
    [selected]
  );

  const radarData = useMemo(() => {
    if (!selected) return [];
    return [
      { trait: 'Centering', value: selected.centeringScore },
      { trait: 'Print', value: selected.printQuality },
      { trait: 'Surface', value: selected.surfaceScore },
      { trait: 'Edges', value: selected.edgeScore },
      { trait: 'Corners', value: selected.cornerScore },
    ];
  }, [selected]);

  const filteredFingerprints = useMemo(() => {
    if (!searchTerm) return fingerprints;
    const lower = searchTerm.toLowerCase();
    return fingerprints.filter((fp) => fp.cardName.toLowerCase().includes(lower));
  }, [fingerprints, searchTerm]);

  const riskLevelColor: Record<string, string> = {
    critical: 'text-red-400 bg-red-500/10 border-red-500/20',
    high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    low: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  };

  const resultStyle: Record<string, { color: string; icon: React.ReactNode }> = {
    authenticated: { color: 'text-emerald-400', icon: <ShieldCheck size={14} className="text-emerald-400" /> },
    flagged: { color: 'text-red-400', icon: <ShieldAlert size={14} className="text-red-400" /> },
    inconclusive: { color: 'text-yellow-400', icon: <ShieldQuestion size={14} className="text-yellow-400" /> },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-brand-lime/20">
          <Fingerprint size={24} className="text-brand-lime" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Card DNA Fingerprinting</h1>
          <p className="text-sm text-slate-400">
            Authenticate cards through micro-characteristic analysis: centering, print patterns, surface texture, and more
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ScanLine size={14} className="text-brand-lime" />
            <span className="text-xs text-slate-400">Total Scanned</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalScanned}</div>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-xs text-slate-400">Authenticated</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.authenticated}</div>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={14} className="text-red-400" />
            <span className="text-xs text-slate-400">Flagged</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{stats.flagged}</div>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-yellow-400" />
            <span className="text-xs text-slate-400">Avg. Confidence</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.averageConfidence}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scan Interface + Fingerprint Viz */}
        <div className="lg:col-span-2 space-y-6">
          {/* DNA Scan Interface */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <ScanLine size={16} className="text-brand-lime" />
              DNA Scan Interface
            </h2>

            {/* Card Selector */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search cards to scan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime/50"
              />
            </div>
            <div className="flex gap-2 flex-wrap mb-6">
              {filteredFingerprints.map((fp) => (
                <button
                  key={fp.id}
                  onClick={() => setSelectedId(fp.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedId === fp.id
                      ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {fp.cardName}
                </button>
              ))}
            </div>

            {selected && (
              <>
                {/* Authentication Confidence Meter */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {selected.authenticityConfidence >= 85 ? (
                        <ShieldCheck size={24} className="text-emerald-400" />
                      ) : selected.authenticityConfidence >= 50 ? (
                        <ShieldQuestion size={24} className="text-yellow-400" />
                      ) : (
                        <ShieldAlert size={24} className="text-red-400" />
                      )}
                      <div>
                        <div className="text-sm font-semibold text-white">{selected.cardName}</div>
                        <div className="text-xs text-slate-400">
                          DNA: <span className="font-mono text-slate-300">{selected.overallDNA}</span>
                          {' '}&middot; Scanned {selected.scanDate}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-3xl font-bold"
                        style={{ color: confidenceColor(selected.authenticityConfidence) }}
                      >
                        {selected.authenticityConfidence}%
                      </div>
                      <div
                        className="text-xs font-medium"
                        style={{ color: confidenceColor(selected.authenticityConfidence) }}
                      >
                        {confidenceLabel(selected.authenticityConfidence)}
                      </div>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${selected.authenticityConfidence}%`,
                        backgroundColor: confidenceColor(selected.authenticityConfidence),
                      }}
                    />
                  </div>
                </div>

                {/* Fingerprint Visualization */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-white mb-2">Fingerprint Profile</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis
                          dataKey="trait"
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={{ fill: '#64748b', fontSize: 10 }}
                        />
                        <Radar
                          name="Score"
                          dataKey="value"
                          stroke="#84cc16"
                          fill="#84cc16"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {radarData.map((d) => (
                      <div key={d.trait} className="text-center">
                        <div className="text-xs text-slate-500">{d.trait}</div>
                        <div className="text-sm font-bold text-white">{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Match Results */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Fingerprint size={16} className="text-brand-lime" />
              Match Results
            </h2>
            {matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border ${
                      m.matchType === 'exact'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : m.matchType === 'similar'
                        ? 'bg-yellow-500/5 border-yellow-500/20'
                        : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wide ${
                          m.matchType === 'exact'
                            ? 'text-emerald-400'
                            : m.matchType === 'similar'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}
                      >
                        {m.matchType.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{m.confidence}% match</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{m.details}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                No match data available for this card. Run a full DNA scan to generate results.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: History + Alerts */}
        <div className="space-y-6">
          {/* Counterfeit Alert Feed */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" />
              Counterfeit Alerts
            </h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${riskLevelColor[alert.riskLevel]}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {alert.riskLevel}
                    </span>
                    <span className="text-xs opacity-60">{alert.detectedDate}</span>
                  </div>
                  <div className="text-xs font-semibold text-white mb-1">{alert.cardName}</div>
                  <p className="text-xs opacity-80 leading-relaxed">{alert.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Authentication History Log */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              DNA History Log
            </h2>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {history.map((event) => {
                const style = resultStyle[event.result];
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                  >
                    <div className="mt-0.5 shrink-0">{style.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-white truncate">
                        {event.cardName}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold capitalize ${style.color}`}>
                          {event.result}
                        </span>
                        <span className="text-xs text-slate-500">&middot;</span>
                        <span className="text-xs text-slate-500">{event.confidence}%</span>
                        <span className="text-xs text-slate-500">&middot;</span>
                        <span className="text-xs text-slate-500">{event.method}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{event.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDNA;
