import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getPlayerRiskProfile,
  getAllPlayers,
  getLeagueRiskHeatMap,
  getHighRiskPlayers,
  simulateInjuryScenario,
  getRiskCorrelations,
  getInjuryTimeline,
  getPortfolioRiskExposure,
  getCardValueImpact,
  type InjuryRiskProfile,
  type LeagueRiskHeatMap,
  type InjuryCorrelation,
  type TimelineEvent,
  type PortfolioExposure,
  type CardValueImpact,
  type RiskCategory,
} from '../lib/injuryOracleService';
import type { Sport } from '../types';

// ---- Constants ----

type TabId = 'dashboard' | 'deep-dive' | 'value-impact' | 'portfolio' | 'correlations' | 'warnings';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Risk Dashboard' },
  { id: 'deep-dive', label: 'Player Deep Dive' },
  { id: 'value-impact', label: 'Value Impact Simulator' },
  { id: 'portfolio', label: 'Portfolio Exposure' },
  { id: 'correlations', label: 'Risk Correlations' },
  { id: 'warnings', label: 'Early Warnings' },
];

const SPORTS: (Sport | 'all')[] = ['all', 'Football', 'Basketball', 'Hockey', 'Soccer'];

const INJURY_TYPES_BY_SPORT: Record<string, string[]> = {
  Football: ['Hamstring Strain', 'Ankle Sprain', 'Knee MCL Sprain', 'ACL Tear', 'Achilles Rupture', 'Concussion', 'Shoulder Separation'],
  Basketball: ['Ankle Sprain', 'Knee Tendinitis', 'Hamstring Tear', 'Meniscus Tear', 'ACL Tear', 'Achilles Tear', 'Stress Fracture (Foot)'],
  Hockey: ['Upper Body Contusion', 'Groin Strain', 'Concussion', 'Shoulder Surgery', 'Knee MCL Tear', 'Spinal Injury'],
  Soccer: ['Muscle Fatigue', 'Hamstring Strain', 'Groin Strain', 'Ankle Ligament Tear', 'ACL Tear', 'Achilles Rupture', 'Stress Fracture (Metatarsal)'],
};

// ---- Helpers ----

function riskColor(score: number): string {
  if (score < 30) return '#22c55e';
  if (score < 60) return '#eab308';
  if (score < 80) return '#f97316';
  return '#ef4444';
}

function riskBg(score: number): string {
  if (score < 30) return 'bg-green-500/20 text-green-400 border-green-500/30';
  if (score < 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  if (score < 80) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

function riskLabel(score: number): string {
  if (score < 30) return 'Low';
  if (score < 60) return 'Moderate';
  if (score < 80) return 'High';
  return 'Critical';
}

function trendArrow(trend: string): string {
  if (trend === 'rising') return '\u2191';
  if (trend === 'falling') return '\u2193';
  return '\u2192';
}

function formatCurrency(value: number): string {
  return '$' + value.toLocaleString();
}

// ---- Loading Skeleton ----

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-700 rounded w-1/3" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-700 rounded" />
        ))}
      </div>
      <div className="h-64 bg-gray-700 rounded" />
    </div>
  );
}

// ---- Gauge Component ----

function GaugeChart({ value, label, size = 120 }: { value: number; label: string; size?: number }) {
  const angle = (value / 100) * 180;
  const radius = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const endX = cx + radius * Math.cos(Math.PI - (angle * Math.PI) / 180);
  const endY = cy - radius * Math.sin(Math.PI - (angle * Math.PI) / 180);
  const largeArc = angle > 90 ? 1 : 0;
  const color = riskColor(value);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 25} viewBox={`0 0 ${size} ${size / 2 + 25}`}>
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#374151"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {value > 0 && (
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
          />
        )}
        <text x={cx} y={cy - 8} textAnchor="middle" fill={color} fontSize="18" fontWeight="bold">
          {value}
        </text>
      </svg>
      <span className="text-xs text-gray-400 mt-1">{label}</span>
    </div>
  );
}

// ---- Tab: Risk Dashboard ----

function RiskDashboard({ sport, threshold }: { sport: Sport | 'all'; threshold: number }) {
  const heatMaps = useMemo<LeagueRiskHeatMap[]>(() => {
    if (sport === 'all') {
      return (['Football', 'Basketball', 'Hockey', 'Soccer'] as Sport[]).map(getLeagueRiskHeatMap);
    }
    return [getLeagueRiskHeatMap(sport)];
  }, [sport]);

  const highRiskPlayers = useMemo(() => getHighRiskPlayers(sport, threshold), [sport, threshold]);

  const barData = useMemo(() => {
    return heatMaps.flatMap((hm) =>
      hm.teams.map((t) => ({
        team: t.team,
        avgRisk: t.averageRisk,
        highRisk: t.highRiskPlayerCount,
        sport: hm.sport,
      }))
    );
  }, [heatMaps]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {heatMaps.map((hm) => (
          <div key={hm.sport} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-1">{hm.sport}</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold" style={{ color: riskColor(hm.averageRisk) }}>
                {hm.averageRisk}
              </span>
              <span className="text-xs text-gray-500">avg risk</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{hm.highRiskCount} high-risk player{hm.highRiskCount !== 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Team Risk Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="team" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-35} textAnchor="end" height={80} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#e5e7eb' }} />
            <Bar dataKey="avgRisk" name="Avg Risk Score" radius={[4, 4, 0, 0]}>
              {barData.map((entry, idx) => (
                <Cell key={idx} fill={riskColor(entry.avgRisk)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">
          High-Risk Players (score {'\u2265'} {threshold})
        </h3>
        {highRiskPlayers.length === 0 ? (
          <p className="text-gray-500 text-sm">No players above threshold.</p>
        ) : (
          <div className="space-y-2">
            {highRiskPlayers.map((p) => (
              <div key={p.playerId} className="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: riskColor(p.currentRiskScore) + '33', color: riskColor(p.currentRiskScore) }}
                  >
                    {p.currentRiskScore}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      {p.sport} &middot; {p.position}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${riskBg(p.currentRiskScore)}`}>
                    {riskLabel(p.currentRiskScore)}
                  </span>
                  <span className="text-xs text-gray-400">{trendArrow(p.riskTrend)} {p.riskTrend}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Tab: Player Deep Dive ----

function PlayerDeepDive({ playerId }: { playerId: string | null }) {
  const profile = useMemo<InjuryRiskProfile | null>(() => {
    if (!playerId) return null;
    return getPlayerRiskProfile(playerId);
  }, [playerId]);

  if (!playerId) {
    return <p className="text-gray-500 text-sm">Select a player from the dropdown above to analyze their injury risk profile.</p>;
  }
  if (!profile) return <LoadingSkeleton />;

  const categories: RiskCategory[] = ['workload', 'biomechanical', 'historical', 'age', 'surface', 'schedule'];
  const categoryAvgs = categories.map((cat) => {
    const factors = profile.riskFactors.filter((f) => f.category === cat);
    const avg = factors.length ? Math.round(factors.reduce((s, f) => s + f.currentValue, 0) / factors.length) : 0;
    return { category: cat, avg };
  });

  const radarData = categoryAvgs.map((c) => ({
    subject: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    value: c.avg,
    fullMark: 100,
  }));

  const severityData = [
    { name: 'Minor', count: profile.projectedInjuryWindows.filter((w) => w.severity === 'minor').length, color: '#22c55e' },
    { name: 'Moderate', count: profile.projectedInjuryWindows.filter((w) => w.severity === 'moderate').length, color: '#eab308' },
    { name: 'Major', count: profile.projectedInjuryWindows.filter((w) => w.severity === 'major').length, color: '#f97316' },
    { name: 'Career-threatening', count: profile.projectedInjuryWindows.filter((w) => w.severity === 'career-threatening').length, color: '#ef4444' },
  ].filter((s) => s.count > 0);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-100">{profile.name}</h3>
            <p className="text-sm text-gray-400">
              {profile.sport} &middot; {profile.position} &middot; Age {profile.age}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <GaugeChart value={profile.currentRiskScore} label="Overall Risk" size={130} />
            <div className="text-center">
              <span className="text-xs text-gray-400">Trend</span>
              <p className="text-lg font-semibold" style={{ color: riskColor(profile.currentRiskScore) }}>
                {trendArrow(profile.riskTrend)} {profile.riskTrend}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Risk Factor Radar</h4>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Radar name="Risk Level" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Projected Injury Severity</h4>
          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={severityData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, count }) => `${name}: ${count}`}>
                  {severityData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No injury projections for this player.</p>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Detailed Risk Factors</h4>
        <div className="space-y-2">
          {profile.riskFactors.map((factor, idx) => {
            const pct = Math.min(100, factor.currentValue);
            const overThreshold = factor.currentValue >= factor.threshold;
            return (
              <div key={idx} className="bg-gray-900 rounded p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400 uppercase tracking-wider">
                      {factor.category}
                    </span>
                    <span className="text-sm text-gray-200">{factor.name}</span>
                  </div>
                  <span className={`text-sm font-mono font-semibold ${overThreshold ? 'text-red-400' : 'text-gray-300'}`}>
                    {factor.currentValue} / {factor.threshold}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: overThreshold ? '#ef4444' : riskColor(factor.currentValue),
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{factor.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {profile.projectedInjuryWindows.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Injury Projections</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.projectedInjuryWindows.map((proj, idx) => (
              <div key={idx} className={`rounded-lg p-4 border ${riskBg(proj.probability * 100)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{proj.type}</span>
                  <span className="text-xs font-mono">{Math.round(proj.probability * 100)}% likely</span>
                </div>
                <p className="text-xs opacity-80">
                  {proj.timeframe} &middot; {proj.severity} &middot; ~{proj.expectedRecoveryDays}d recovery
                </p>
                <p className="text-xs opacity-70 mt-1">Card value impact: -{proj.cardValueDropPercent}%</p>
                <p className="text-xs opacity-60 mt-1 italic">{proj.historicalComparison}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Tab: Value Impact Simulator ----

function ValueImpactSimulator({ playerId }: { playerId: string | null }) {
  const [selectedInjury, setSelectedInjury] = useState<string>('');
  const profile = useMemo(() => (playerId ? getPlayerRiskProfile(playerId) : null), [playerId]);

  const availableInjuries = useMemo(() => {
    if (!profile) return [];
    return INJURY_TYPES_BY_SPORT[profile.sport] || [];
  }, [profile]);

  const injuryToSimulate = selectedInjury || (availableInjuries.length > 0 ? availableInjuries[0] : '');

  const simulation = useMemo(() => {
    if (!playerId || !injuryToSimulate) return null;
    return simulateInjuryScenario(playerId, injuryToSimulate);
  }, [playerId, injuryToSimulate]);

  const impact = useMemo<CardValueImpact | null>(() => {
    if (!playerId) return null;
    return getCardValueImpact(playerId);
  }, [playerId]);

  if (!playerId || !profile) {
    return <p className="text-gray-500 text-sm">Select a player to simulate injury value impact scenarios.</p>;
  }

  const projectionData = impact
    ? [
        { period: 'Now', optimistic: impact.currentValue, baseline: impact.currentValue, pessimistic: impact.currentValue },
        { period: '30d', optimistic: impact.projected30.optimistic, baseline: impact.projected30.baseline, pessimistic: impact.projected30.pessimistic },
        { period: '60d', optimistic: impact.projected60.optimistic, baseline: impact.projected60.baseline, pessimistic: impact.projected60.pessimistic },
        { period: '90d', optimistic: impact.projected90.optimistic, baseline: impact.projected90.baseline, pessimistic: impact.projected90.pessimistic },
      ]
    : [];

  return (
    <div className="space-y-6">
      {impact && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-xs text-gray-400">Current Value</p>
            <p className="text-xl font-bold text-gray-100">{formatCurrency(impact.currentValue)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-xs text-gray-400">90d Optimistic</p>
            <p className="text-xl font-bold text-green-400">{formatCurrency(impact.projected90.optimistic)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-xs text-gray-400">90d Pessimistic</p>
            <p className="text-xl font-bold text-red-400">{formatCurrency(impact.projected90.pessimistic)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-xs text-gray-400">Recommendation</p>
            <p className="text-lg font-bold text-purple-400 capitalize">{impact.hedgeRecommendation.replace('-', ' ')}</p>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Projected Card Value (3 Scenarios)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={projectionData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="period" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#e5e7eb' }} formatter={(v: number) => formatCurrency(v)} />
            <Legend />
            <Area type="monotone" dataKey="optimistic" name="Optimistic" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} />
            <Area type="monotone" dataKey="baseline" name="Baseline" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
            <Area type="monotone" dataKey="pessimistic" name="Pessimistic" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">What-If Injury Simulation</h4>
        <div className="mb-4">
          <label className="text-xs text-gray-400 block mb-1">Injury Type</label>
          <select
            value={injuryToSimulate}
            onChange={(e) => setSelectedInjury(e.target.value)}
            className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {availableInjuries.map((inj) => (
              <option key={inj} value={inj}>{inj}</option>
            ))}
          </select>
        </div>

        {simulation && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-900 rounded p-3 text-center">
                <p className="text-xs text-gray-500">Pre-Injury Value</p>
                <p className="text-lg font-bold text-gray-200">{formatCurrency(simulation.before.currentValue)}</p>
              </div>
              <div className="bg-gray-900 rounded p-3 text-center">
                <p className="text-xs text-gray-500">Post-Injury (Immediate)</p>
                <p className="text-lg font-bold text-red-400">{formatCurrency(simulation.after.currentValue)}</p>
              </div>
              <div className="bg-gray-900 rounded p-3 text-center">
                <p className="text-xs text-gray-500">90d Recovery Estimate</p>
                <p className="text-lg font-bold text-yellow-400">{formatCurrency(simulation.after.projected90.baseline)}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={simulation.timeline} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Days Post-Injury', position: 'insideBottom', offset: -3, fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#e5e7eb' }} formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="value" name="Card Value" stroke="#a78bfa" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}

// ---- Tab: Portfolio Exposure ----

function PortfolioExposureTab() {
  const allPlayers = useMemo(() => getAllPlayers(), []);

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>(() =>
    allPlayers.slice(0, 6).map((p) => p.id + '-card')
  );

  const exposure = useMemo<PortfolioExposure>(() => getPortfolioRiskExposure(selectedCardIds), [selectedCardIds]);

  const cardDetails = useMemo(() => {
    return selectedCardIds
      .map((cid) => {
        const pid = cid.replace('-card', '');
        const profile = getPlayerRiskProfile(pid);
        return profile ? { profile, impact: profile.cardValueImpact } : null;
      })
      .filter((c): c is { profile: InjuryRiskProfile; impact: CardValueImpact } => c !== null);
  }, [selectedCardIds]);

  const pieData = useMemo(() => {
    return cardDetails.map((c) => ({
      name: c.profile.name,
      value: c.impact.currentValue,
      risk: c.profile.currentRiskScore,
    }));
  }, [cardDetails]);

  const toggleCard = useCallback(
    (playerId: string) => {
      const cardId = playerId + '-card';
      setSelectedCardIds((prev) =>
        prev.includes(cardId) ? prev.filter((c) => c !== cardId) : [...prev, cardId]
      );
    },
    []
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400">Cards</p>
          <p className="text-xl font-bold text-gray-100">{exposure.totalCards}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400">Total Value</p>
          <p className="text-xl font-bold text-gray-100">{formatCurrency(exposure.totalValue)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400">Weighted Risk</p>
          <p className="text-xl font-bold" style={{ color: riskColor(exposure.weightedRiskScore) }}>
            {exposure.weightedRiskScore}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400">High-Risk Cards</p>
          <p className="text-xl font-bold text-orange-400">{exposure.highRiskCards}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400">Value at Risk</p>
          <p className="text-xl font-bold text-red-400">{formatCurrency(exposure.projectedValueAtRisk)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400">Worst Case Loss</p>
          <p className="text-xl font-bold text-red-500">{formatCurrency(exposure.worstCaseLoss)}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Select Portfolio Cards</h4>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {allPlayers.map((p) => {
            const isSelected = selectedCardIds.includes(p.id + '-card');
            return (
              <button
                key={p.id}
                onClick={() => toggleCard(p.id)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  isSelected
                    ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                    : 'bg-gray-900 border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Value Distribution</h4>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name }) => name}>
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={riskColor(entry.risk)} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#e5e7eb' }} formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Risk vs Value</h4>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" dataKey="risk" name="Risk Score" tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 100]} label={{ value: 'Risk Score', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 11 }} />
              <YAxis type="number" dataKey="value" name="Value" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#e5e7eb' }} formatter={(v: number, name: string) => [name === 'Value' ? formatCurrency(v) : v, name]} />
              <Scatter name="Cards" data={pieData} fill="#8b5cf6">
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={riskColor(entry.risk)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Recommendations</h4>
        <ul className="space-y-2">
          {exposure.recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---- Tab: Risk Correlations ----

function RiskCorrelationsTab({ sport }: { sport: Sport | 'all' }) {
  const activeSport: Sport = sport === 'all' ? 'Basketball' : sport;

  const correlations = useMemo<InjuryCorrelation[]>(() => getRiskCorrelations(activeSport), [activeSport]);

  const topCorrelations = useMemo(() => correlations.slice(0, 15), [correlations]);

  const scatterData = useMemo(() => {
    return topCorrelations.map((c) => ({
      pair: `${c.factor1} / ${c.factor2}`,
      coefficient: c.correlationCoefficient,
      sampleSize: c.sampleSize,
      absCoeff: Math.abs(c.correlationCoefficient),
    }));
  }, [topCorrelations]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-1">
          Injury Risk Factor Correlations &mdash; {activeSport}
        </h4>
        <p className="text-xs text-gray-500 mb-4">
          Showing the strongest correlations between risk factors. Positive values indicate co-occurrence; negative values indicate inverse relationships.
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" dataKey="coefficient" name="Correlation" domain={[-1, 1]} tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Correlation Coefficient', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 11 }} />
            <YAxis type="number" dataKey="sampleSize" name="Sample Size" tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Sample Size', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#e5e7eb' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs">
                    <p className="text-gray-200 font-semibold mb-1">{d.pair}</p>
                    <p className="text-gray-400">Correlation: <span className="text-purple-400">{d.coefficient.toFixed(3)}</span></p>
                    <p className="text-gray-400">Sample size: {d.sampleSize.toLocaleString()}</p>
                  </div>
                );
              }}
            />
            <Scatter name="Correlations" data={scatterData}>
              {scatterData.map((entry, idx) => (
                <Cell key={idx} fill={entry.coefficient > 0 ? '#f97316' : '#3b82f6'} opacity={0.4 + entry.absCoeff * 0.6} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Top Correlation Pairs</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs border-b border-gray-700">
                <th className="text-left py-2 pr-4">Factor 1</th>
                <th className="text-left py-2 pr-4">Factor 2</th>
                <th className="text-right py-2 pr-4">Coefficient</th>
                <th className="text-right py-2">Sample Size</th>
              </tr>
            </thead>
            <tbody>
              {topCorrelations.map((c, idx) => (
                <tr key={idx} className="border-b border-gray-800 text-gray-300">
                  <td className="py-2 pr-4">{c.factor1}</td>
                  <td className="py-2 pr-4">{c.factor2}</td>
                  <td className="py-2 pr-4 text-right font-mono">
                    <span className={c.correlationCoefficient > 0 ? 'text-orange-400' : 'text-blue-400'}>
                      {c.correlationCoefficient > 0 ? '+' : ''}{c.correlationCoefficient.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-2 text-right text-gray-400">{c.sampleSize.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---- Tab: Early Warnings ----

function EarlyWarningsTab({ sport }: { sport: Sport | 'all' }) {
  const allPlayers = useMemo(() => getAllPlayers(), []);
  const filteredPlayers = useMemo(
    () => (sport === 'all' ? allPlayers : allPlayers.filter((p) => p.sport === sport)),
    [allPlayers, sport]
  );

  const allEvents = useMemo<TimelineEvent[]>(() => {
    const events: TimelineEvent[] = [];
    for (const player of filteredPlayers) {
      events.push(...getInjuryTimeline(player.id));
    }
    return events.sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredPlayers]);

  const actionRequired = useMemo(() => allEvents.filter((e) => e.actionRequired), [allEvents]);

  const timelineChartData = useMemo(() => {
    const byDate = new Map<string, { date: string; count: number; avgRisk: number; total: number }>();
    for (const ev of allEvents) {
      const existing = byDate.get(ev.date) || { date: ev.date, count: 0, avgRisk: 0, total: 0 };
      existing.count += 1;
      existing.total += ev.riskLevel;
      existing.avgRisk = Math.round(existing.total / existing.count);
      byDate.set(ev.date, existing);
    }
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [allEvents]);

  return (
    <div className="space-y-6">
      {actionRequired.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-red-400 mb-2">
            Action Required ({actionRequired.length} alert{actionRequired.length !== 1 ? 's' : ''})
          </h4>
          <div className="space-y-2">
            {actionRequired.slice(0, 5).map((ev, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-red-900/10 rounded p-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: riskColor(ev.riskLevel) + '33', color: riskColor(ev.riskLevel) }}
                >
                  {ev.riskLevel}
                </div>
                <div>
                  <p className="text-sm text-gray-200">
                    <span className="font-semibold">{ev.playerName}</span> &mdash; {ev.eventDescription}
                  </p>
                  <p className="text-xs text-gray-400">{ev.date} &middot; {ev.sport}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Risk Events Timeline</h4>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={timelineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#e5e7eb' }} />
            <Bar dataKey="avgRisk" name="Avg Risk Level" radius={[4, 4, 0, 0]}>
              {timelineChartData.map((entry, idx) => (
                <Cell key={idx} fill={riskColor(entry.avgRisk)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">All Upcoming Risk Windows</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {allEvents.map((ev, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-8 rounded-full"
                  style={{ backgroundColor: riskColor(ev.riskLevel) }}
                />
                <div>
                  <p className="text-sm text-gray-200">{ev.playerName}</p>
                  <p className="text-xs text-gray-500">{ev.eventDescription}</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-mono" style={{ color: riskColor(ev.riskLevel) }}>
                  {ev.riskLevel}
                </p>
                <p className="text-xs text-gray-500">{ev.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Main Page Component ----

export default function InjuryOracle() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedSport, setSelectedSport] = useState<Sport | 'all'>('all');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [riskThreshold, setRiskThreshold] = useState(60);

  const allPlayers = useMemo(() => getAllPlayers(), []);
  const filteredPlayers = useMemo(
    () => (selectedSport === 'all' ? allPlayers : allPlayers.filter((p) => p.sport === selectedSport)),
    [allPlayers, selectedSport]
  );

  const handlePlayerChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlayerId(e.target.value || null);
  }, []);

  const handleSportChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSport(e.target.value as Sport | 'all');
    setSelectedPlayerId(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Predictive Injury Oracle</h1>
          <p className="text-sm text-gray-400 mt-1">
            AI-powered injury risk forecasting and card value impact modeling. Get early warnings to protect your portfolio.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Sport</label>
            <select
              value={selectedSport}
              onChange={handleSportChange}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {SPORTS.map((s) => (
                <option key={s} value={s}>{s === 'all' ? 'All Sports' : s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Player</label>
            <select
              value={selectedPlayerId || ''}
              onChange={handlePlayerChange}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[200px]"
            >
              <option value="">Select a player...</option>
              {filteredPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sport} - {p.position})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 max-w-xs">
            <label className="text-xs text-gray-400 block mb-1">
              Risk Threshold: <span className="font-mono" style={{ color: riskColor(riskThreshold) }}>{riskThreshold}</span>
            </label>
            <input
              type="range"
              min={10}
              max={95}
              value={riskThreshold}
              onChange={(e) => setRiskThreshold(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
              <span>10</span>
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
              <span>95</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800">
          <nav className="flex gap-1 overflow-x-auto pb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && <RiskDashboard sport={selectedSport} threshold={riskThreshold} />}
          {activeTab === 'deep-dive' && <PlayerDeepDive playerId={selectedPlayerId} />}
          {activeTab === 'value-impact' && <ValueImpactSimulator playerId={selectedPlayerId} />}
          {activeTab === 'portfolio' && <PortfolioExposureTab />}
          {activeTab === 'correlations' && <RiskCorrelationsTab sport={selectedSport} />}
          {activeTab === 'warnings' && <EarlyWarningsTab sport={selectedSport} />}
        </div>
      </div>
    </div>
  );
}
