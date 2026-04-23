// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Users,
  Heart,
  TrendingUp,
  Calendar,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  getCohortProfiles,
  getNostalgiaScores,
  getDemandForecast,
  getNostalgiaWaves,
  getUpcomingTriggers,
  getCohortSpendingPower,
  getPlayerCohortMapping,
  getPriceWaveProjections,
  getHistoricalWaves,
  getTopNostalgiaPlays,
  type CohortProfile,
  type PlayerNostalgiaScore,
  type DemandForecast,
  type NostalgiaWave,
  type CulturalMoment,
  type CohortSpendingPower,
  type PriceWaveProjection,
  type TopNostalgiaPlay,
  type DemographicCohort,
} from '../lib/analytics/nostalgiaPredictorService.ts';

// ---- Constants ----

const TABS = [
  { id: 'dashboard', label: 'Nostalgia Dashboard', icon: Heart },
  { id: 'cohort', label: 'Cohort Analysis', icon: Users },
  { id: 'forecast', label: 'Demand Forecast', icon: TrendingUp },
  { id: 'timeline', label: 'Wave Timeline', icon: Clock },
  { id: 'triggers', label: 'Trigger Calendar', icon: Calendar },
  { id: 'plays', label: 'Top Plays', icon: Sparkles },
] as const;

type TabId = (typeof TABS)[number]['id'];

const COHORT_COLORS: Record<DemographicCohort, string> = {
  silent: '#94a3b8',
  boomer: '#f59e0b',
  'gen-x': '#ef4444',
  millennial: '#8b5cf6',
  'gen-z': '#06b6d4',
  'gen-alpha': '#10b981',
};

const COHORT_LABELS: Record<DemographicCohort, string> = {
  silent: 'Silent',
  boomer: 'Boomer',
  'gen-x': 'Gen X',
  millennial: 'Millennial',
  'gen-z': 'Gen Z',
  'gen-alpha': 'Gen Alpha',
};

const IMPACT_STYLES: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-slate-700/50', text: 'text-slate-300' },
  medium: { bg: 'bg-amber-900/40', text: 'text-amber-400' },
  high: { bg: 'bg-orange-900/40', text: 'text-orange-400' },
  extreme: { bg: 'bg-red-900/40', text: 'text-red-400' },
};

const TRIGGER_LABELS: Record<string, string> = {
  anniversary: 'Anniversary',
  documentary: 'Documentary',
  'HOF-induction': 'HOF Induction',
  retirement: 'Retirement',
  comeback: 'Comeback',
  death: 'Memorial',
  'record-broken': 'Record Broken',
  'jersey-retirement': 'Jersey Retirement',
  'reunion-event': 'Reunion',
};

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${value < 0 ? '-' : ''}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${value < 0 ? '-' : ''}$${(abs / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// ---- Main Component ----

const NostalgiaPredictor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [loading, setLoading] = useState(true);
  const [cohortProfiles, setCohortProfiles] = useState<CohortProfile[]>([]);
  const [nostalgiaScores, setNostalgiaScores] = useState<PlayerNostalgiaScore[]>([]);
  const [demandForecasts, setDemandForecasts] = useState<DemandForecast[]>([]);
  const [waves, setWaves] = useState<NostalgiaWave[]>([]);
  const [triggers, setTriggers] = useState<CulturalMoment[]>([]);
  const [spendingData, setSpendingData] = useState<CohortSpendingPower[]>([]);
  const [waveProjections, setWaveProjections] = useState<PriceWaveProjection[]>([]);
  const [topPlays, setTopPlays] = useState<TopNostalgiaPlay[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setCohortProfiles(getCohortProfiles());
      setNostalgiaScores(getNostalgiaScores());
      setDemandForecasts(getDemandForecast(5));
      setWaves(getNostalgiaWaves());
      setTriggers(getUpcomingTriggers());
      setSpendingData(getCohortSpendingPower());
      setWaveProjections(getPriceWaveProjections());
      setTopPlays(getTopNostalgiaPlays());
      setLoading(false);
    } catch {
      setError('Failed to load Nostalgia Predictor data');
      setLoading(false);
    }
  }, []);

  const playerCohortMap = useMemo(() => getPlayerCohortMapping(), []);
  const historicalWaves = useMemo(() => getHistoricalWaves(), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Nostalgia Predictor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 pb-3 pt-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20">
                <Heart size={24} className="text-rose-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Cross-Generational Nostalgia Predictor</h1>
                <p className="text-sm text-slate-400">Forecasting card demand surges from generational nostalgia cycles &amp; cultural moments</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300">
                {triggers.length} UPCOMING TRIGGERS
              </span>
              <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-violet-500/20 text-violet-300">
                {nostalgiaScores.length} PLAYERS TRACKED
              </span>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            scores={nostalgiaScores}
            waves={historicalWaves}
            triggers={triggers}
            cohortProfiles={cohortProfiles}
            spendingData={spendingData}
          />
        )}
        {activeTab === 'cohort' && (
          <CohortAnalysisTab
            cohortProfiles={cohortProfiles}
            spendingData={spendingData}
            scores={nostalgiaScores}
          />
        )}
        {activeTab === 'forecast' && (
          <DemandForecastTab
            forecasts={demandForecasts}
            cohortProfiles={cohortProfiles}
          />
        )}
        {activeTab === 'timeline' && (
          <WaveTimelineTab
            waves={waves}
            projections={waveProjections}
          />
        )}
        {activeTab === 'triggers' && (
          <TriggerCalendarTab triggers={triggers} />
        )}
        {activeTab === 'plays' && (
          <TopPlaysTab plays={topPlays} />
        )}
      </div>
    </div>
  );
};

// ---- Tab: Nostalgia Dashboard ----

const DashboardTab: React.FC<{
  scores: PlayerNostalgiaScore[];
  waves: NostalgiaWave[];
  triggers: CulturalMoment[];
  cohortProfiles: CohortProfile[];
  spendingData: CohortSpendingPower[];
}> = ({ scores, waves, triggers, cohortProfiles, spendingData }) => {
  const topScores = useMemo(() =>
    [...scores].sort((a, b) => b.overallNostalgiaIndex - a.overallNostalgiaIndex).slice(0, 10),
    [scores]
  );

  const avgMultiplier = useMemo(() => {
    const sum = waves.reduce((s, w) => s + w.peakPriceMultiplier, 0);
    return (sum / waves.length).toFixed(1);
  }, [waves]);

  const extremeTriggers = useMemo(() =>
    triggers.filter(t => t.estimatedImpact === 'extreme' || t.estimatedImpact === 'high'),
    [triggers]
  );

  // Radar data for top player
  const topPlayer = topScores[0];
  const radarData = topPlayer ? (Object.entries(topPlayer.cohortScores) as [DemographicCohort, number][]).map(
    ([cohort, score]) => ({ cohort: COHORT_LABELS[cohort], score, fullMark: 100 })
  ) : [];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Players Tracked</p>
          <p className="text-3xl font-bold text-rose-400">{scores.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cohorts Analyzed</p>
          <p className="text-3xl font-bold text-violet-400">{cohortProfiles.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Historical Waves</p>
          <p className="text-3xl font-bold text-amber-400">{waves.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Wave Multiplier</p>
          <p className="text-3xl font-bold text-emerald-400">{avgMultiplier}x</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Upcoming Triggers</p>
          <p className="text-3xl font-bold text-cyan-400">{triggers.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">High-Impact Events</p>
          <p className="text-3xl font-bold text-red-400">{extremeTriggers.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Nostalgia Index Rankings */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Heart size={18} className="text-rose-400" />
            Top Nostalgia Index Rankings
          </h3>
          <div className="space-y-3">
            {topScores.map((player, i) => {
              const primaryCohort = (Object.entries(player.cohortScores) as [DemographicCohort, number][])
                .sort((a, b) => b[1] - a[1])[0][0];
              return (
                <div key={player.playerId} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500 w-6 text-right">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-200">{player.playerName}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: `${COHORT_COLORS[primaryCohort]}22`, color: COHORT_COLORS[primaryCohort] }}
                        >
                          {COHORT_LABELS[primaryCohort]}
                        </span>
                        <span className="text-sm font-bold text-rose-400">{player.overallNostalgiaIndex}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500"
                        style={{ width: `${player.overallNostalgiaIndex}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Player Cohort Radar */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Users size={18} className="text-violet-400" />
            {topPlayer?.playerName} — Cohort Appeal Radar
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="cohort" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="Nostalgia Score" dataKey="score" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cohort Spending Power Stacked Area */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          Cohort Spending Power Over Decades
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={spendingData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="decade" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }}
            />
            <Legend />
            <Area type="monotone" dataKey="silent" stackId="1" stroke={COHORT_COLORS.silent} fill={COHORT_COLORS.silent} fillOpacity={0.6} name="Silent" />
            <Area type="monotone" dataKey="boomer" stackId="1" stroke={COHORT_COLORS.boomer} fill={COHORT_COLORS.boomer} fillOpacity={0.6} name="Boomer" />
            <Area type="monotone" dataKey="gen-x" stackId="1" stroke={COHORT_COLORS['gen-x']} fill={COHORT_COLORS['gen-x']} fillOpacity={0.6} name="Gen X" />
            <Area type="monotone" dataKey="millennial" stackId="1" stroke={COHORT_COLORS.millennial} fill={COHORT_COLORS.millennial} fillOpacity={0.6} name="Millennial" />
            <Area type="monotone" dataKey="gen-z" stackId="1" stroke={COHORT_COLORS['gen-z']} fill={COHORT_COLORS['gen-z']} fillOpacity={0.6} name="Gen Z" />
            <Area type="monotone" dataKey="gen-alpha" stackId="1" stroke={COHORT_COLORS['gen-alpha']} fill={COHORT_COLORS['gen-alpha']} fillOpacity={0.6} name="Gen Alpha" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ---- Tab: Cohort Analysis ----

const CohortAnalysisTab: React.FC<{
  cohortProfiles: CohortProfile[];
  spendingData: CohortSpendingPower[];
  scores: PlayerNostalgiaScore[];
}> = ({ cohortProfiles, spendingData, scores }) => {
  const [selectedCohort, setSelectedCohort] = useState<DemographicCohort>('gen-x');

  const selectedProfile = useMemo(() =>
    cohortProfiles.find(p => p.cohort === selectedCohort)!,
    [cohortProfiles, selectedCohort]
  );

  const cohortTopPlayers = useMemo(() =>
    [...scores]
      .sort((a, b) => (b.cohortScores[selectedCohort] || 0) - (a.cohortScores[selectedCohort] || 0))
      .slice(0, 8),
    [scores, selectedCohort]
  );

  const cohortPlayerBarData = useMemo(() =>
    cohortTopPlayers.map(p => ({
      name: p.playerName.split(' ').pop(),
      score: p.cohortScores[selectedCohort] || 0,
      fullName: p.playerName,
    })),
    [cohortTopPlayers, selectedCohort]
  );

  // Individual cohort spending line
  const singleCohortSpending = useMemo(() =>
    spendingData.map(d => ({
      decade: d.decade,
      power: d[selectedCohort] || 0,
    })),
    [spendingData, selectedCohort]
  );

  return (
    <div className="space-y-6">
      {/* Cohort Selector */}
      <div className="flex gap-2 flex-wrap">
        {cohortProfiles.map(profile => (
          <button
            key={profile.cohort}
            onClick={() => setSelectedCohort(profile.cohort)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              selectedCohort === profile.cohort
                ? 'border-transparent text-white'
                : 'border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            style={selectedCohort === profile.cohort ? { backgroundColor: COHORT_COLORS[profile.cohort] } : undefined}
          >
            {profile.label}
          </button>
        ))}
      </div>

      {/* Cohort Profile Card */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-100">{selectedProfile.label}</h3>
            <p className="text-sm text-slate-400">
              Born {selectedProfile.birthYearStart}–{selectedProfile.birthYearEnd} | Peak earning ages {selectedProfile.peakEarningAgeStart}–{selectedProfile.peakEarningAgeEnd}
            </p>
          </div>
          <div
            className="px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: `${COHORT_COLORS[selectedCohort]}22`, color: COHORT_COLORS[selectedCohort] }}
          >
            {selectedProfile.collectingPeakDecade} COLLECTORS
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 uppercase mb-1">Avg Disposable Income</p>
            <p className="text-lg font-bold text-slate-100">{formatCurrency(selectedProfile.avgDisposableIncome)}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 uppercase mb-1">Digital Adoption</p>
            <p className="text-lg font-bold text-cyan-400">{selectedProfile.digitalAdoption}%</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 uppercase mb-1">Peak Earning Start</p>
            <p className="text-lg font-bold text-amber-400">{selectedProfile.peakEarningYearStart}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 uppercase mb-1">Peak Earning End</p>
            <p className="text-lg font-bold text-amber-400">{selectedProfile.peakEarningYearEnd}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Cultural Touchstones</p>
          <div className="flex flex-wrap gap-2">
            {selectedProfile.culturalTouchstones.map(t => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${COHORT_COLORS[selectedCohort]}15`, color: COHORT_COLORS[selectedCohort] }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cohort Spending Power Over Time */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Spending Power Curve</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={singleCohortSpending}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="decade" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Area
                type="monotone"
                dataKey="power"
                stroke={COHORT_COLORS[selectedCohort]}
                fill={COHORT_COLORS[selectedCohort]}
                fillOpacity={0.3}
                name="Spending Power"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Players for Cohort */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Top Players for {selectedProfile.label}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={cohortPlayerBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }}
                formatter={(value: number, _name: string, props: { payload: { fullName: string } }) => [value, props.payload.fullName]}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} name="Nostalgia Score">
                {cohortPlayerBarData.map((_, idx) => (
                  <Cell key={idx} fill={COHORT_COLORS[selectedCohort]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Demand Forecast ----

const DemandForecastTab: React.FC<{
  forecasts: DemandForecast[];
  cohortProfiles: CohortProfile[];
}> = ({ forecasts, cohortProfiles }) => {
  const [forecastYears, setForecastYears] = useState(5);

  // Aggregate forecasts by year for the stacked bar
  const yearlyData = useMemo(() => {
    const grouped: Record<number, Record<string, number>> = {};
    for (const f of forecasts) {
      if (!grouped[f.year]) grouped[f.year] = {};
      grouped[f.year][f.cohort] = (grouped[f.year][f.cohort] || 0) + f.demandIndex;
    }
    return Object.entries(grouped).map(([year, cohorts]) => ({
      year: Number(year),
      ...cohorts,
    }));
  }, [forecasts]);

  // Spending power vs nostalgia for current year
  const currentYearForecasts = useMemo(() =>
    forecasts.filter(f => f.year === 2025 && f.quarter === 'Q1'),
    [forecasts]
  );

  const composedData = useMemo(() =>
    currentYearForecasts.map(f => ({
      cohort: COHORT_LABELS[f.cohort],
      spendingPower: f.spendingPower,
      nostalgiaIntensity: f.nostalgiaIntensity,
      demandIndex: f.demandIndex,
    })),
    [currentYearForecasts]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Multi-Year Demand Forecast</h3>
        <div className="flex gap-2">
          {[3, 5, 8, 10].map(y => (
            <button
              key={y}
              onClick={() => setForecastYears(y)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                forecastYears === y ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {y}Y
            </button>
          ))}
        </div>
      </div>

      {/* Stacked Bar by Year */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-base font-semibold text-slate-200 mb-4">Aggregate Demand by Cohort &amp; Year</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={yearlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
            <Legend />
            <Bar dataKey="silent" stackId="a" fill={COHORT_COLORS.silent} name="Silent" />
            <Bar dataKey="boomer" stackId="a" fill={COHORT_COLORS.boomer} name="Boomer" />
            <Bar dataKey="gen-x" stackId="a" fill={COHORT_COLORS['gen-x']} name="Gen X" />
            <Bar dataKey="millennial" stackId="a" fill={COHORT_COLORS.millennial} name="Millennial" />
            <Bar dataKey="gen-z" stackId="a" fill={COHORT_COLORS['gen-z']} name="Gen Z" />
            <Bar dataKey="gen-alpha" stackId="a" fill={COHORT_COLORS['gen-alpha']} name="Gen Alpha" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Composed: Spending Power vs Nostalgia */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-base font-semibold text-slate-200 mb-4">Spending Power vs. Nostalgia Intensity (2025 Q1)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={composedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="cohort" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
            <Legend />
            <Bar dataKey="spendingPower" fill="#8b5cf6" fillOpacity={0.6} name="Spending Power" />
            <Bar dataKey="nostalgiaIntensity" fill="#f59e0b" fillOpacity={0.6} name="Nostalgia Intensity" />
            <Line type="monotone" dataKey="demandIndex" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e' }} name="Demand Index" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Confidence Breakdown */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-base font-semibold text-slate-200 mb-4">Forecast Confidence by Cohort</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {currentYearForecasts.map(f => (
            <div key={f.cohort} className="bg-slate-900/50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500 uppercase mb-1">{COHORT_LABELS[f.cohort]}</p>
              <p className="text-2xl font-bold" style={{ color: COHORT_COLORS[f.cohort] }}>{f.demandIndex}</p>
              <p className="text-xs text-slate-500 mt-1">Confidence: {f.confidence}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Wave Timeline ----

const WaveTimelineTab: React.FC<{
  waves: NostalgiaWave[];
  projections: PriceWaveProjection[];
}> = ({ waves, projections }) => {
  const [selectedWaveId, setSelectedWaveId] = useState<string | null>(waves[0]?.id ?? null);

  const selectedWave = useMemo(() =>
    waves.find(w => w.id === selectedWaveId) ?? null,
    [waves, selectedWaveId]
  );

  const waveChartData = useMemo(() =>
    waves.map(w => ({
      name: w.name.length > 20 ? w.name.slice(0, 18) + '...' : w.name,
      fullName: w.name,
      multiplier: w.peakPriceMultiplier,
      duration: w.durationMonths,
      year: w.year,
    })),
    [waves]
  );

  const projectionData = useMemo(() => {
    if (!selectedWave) return projections;
    return projections.map(p => ({
      ...p,
      projectedPrice: Math.round(selectedWave.priceBeforeWave * p.priceMultiplier),
    }));
  }, [projections, selectedWave]);

  return (
    <div className="space-y-6">
      {/* Wave Multiplier Bar Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-amber-400" />
          Historical Nostalgia Waves — Peak Price Multiplier
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={waveChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-30} textAnchor="end" height={80} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }}
              formatter={(value: number, name: string) => [name === 'multiplier' ? `${value}x` : `${value} months`, name === 'multiplier' ? 'Peak Multiplier' : 'Duration']}
            />
            <Bar dataKey="multiplier" name="Peak Multiplier" radius={[4, 4, 0, 0]}>
              {waveChartData.map((_, idx) => (
                <Cell key={idx} fill={`hsl(${idx * 20}, 70%, 55%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wave Selector */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-base font-semibold text-slate-100 mb-3">Select Wave</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {waves.map(w => (
              <button
                key={w.id}
                onClick={() => setSelectedWaveId(w.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedWaveId === w.id
                    ? 'bg-rose-600/20 border border-rose-500/40'
                    : 'bg-slate-900/50 border border-slate-700/30 hover:bg-slate-700/50'
                }`}
              >
                <p className="text-sm font-medium text-slate-200">{w.name}</p>
                <p className="text-xs text-slate-500">{w.playerName} &middot; {w.year} &middot; {w.peakPriceMultiplier}x</p>
              </button>
            ))}
          </div>
        </div>

        {/* Price Wave Projection */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-base font-semibold text-slate-100 mb-3">
            Price Wave Anatomy {selectedWave ? `— ${selectedWave.name}` : ''}
          </h3>
          {selectedWave && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <p className="text-xs text-slate-500">Before</p>
                <p className="text-sm font-bold text-slate-300">{formatCurrency(selectedWave.priceBeforeWave)}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <p className="text-xs text-slate-500">Peak</p>
                <p className="text-sm font-bold text-emerald-400">{formatCurrency(selectedWave.priceAtPeak)}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <p className="text-xs text-slate-500">After</p>
                <p className="text-sm font-bold text-amber-400">{formatCurrency(selectedWave.priceAfterWave)}</p>
              </div>
            </div>
          )}
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="monthsFromTrigger"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Months from Trigger', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <ReferenceLine x={0} stroke="#f43f5e" strokeDasharray="5 5" label={{ value: 'Trigger', fill: '#f43f5e', fontSize: 11 }} />
              <Line type="monotone" dataKey="priceMultiplier" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e' }} name="Price Multiplier" />
              <Line type="monotone" dataKey="buyerSentiment" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="Buyer Sentiment" />
              <Line type="monotone" dataKey="volumeIndex" stroke="#06b6d4" strokeWidth={1.5} dot={false} name="Volume Index" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Trigger Calendar ----

const TriggerCalendarTab: React.FC<{ triggers: CulturalMoment[] }> = ({ triggers }) => {
  const triggersByYear = useMemo(() => {
    const grouped: Record<number, CulturalMoment[]> = {};
    for (const t of triggers) {
      const year = new Date(t.date).getFullYear();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(t);
    }
    return grouped;
  }, [triggers]);

  const impactChartData = useMemo(() =>
    triggers.map(t => ({
      name: t.title.length > 22 ? t.title.slice(0, 20) + '...' : t.title,
      fullTitle: t.title,
      impact: t.priceImpactPercent,
      date: t.date,
    })),
    [triggers]
  );

  return (
    <div className="space-y-6">
      {/* Impact Bar Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-cyan-400" />
          Upcoming Trigger Impact Forecast
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={impactChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
            <YAxis dataKey="name" type="category" width={160} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }}
              formatter={(value: number) => [`${value}%`, 'Projected Impact']}
            />
            <Bar dataKey="impact" radius={[0, 4, 4, 0]} name="Price Impact %">
              {impactChartData.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.impact >= 50 ? '#ef4444' : entry.impact >= 30 ? '#f59e0b' : '#06b6d4'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Calendar View */}
      {Object.entries(triggersByYear)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([year, yearTriggers]) => (
          <div key={year}>
            <h3 className="text-lg font-bold text-slate-200 mb-3">{year}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {yearTriggers.map(t => {
                const style = IMPACT_STYLES[t.estimatedImpact] || IMPACT_STYLES.low;
                return (
                  <div key={t.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100">{t.title}</h4>
                        <p className="text-xs text-slate-500">
                          {new Date(t.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
                          {t.estimatedImpact.toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-700/50 text-slate-300">
                          {TRIGGER_LABELS[t.trigger] || t.trigger}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{t.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5 flex-wrap">
                        {t.affectedPlayers.map(p => (
                          <span key={p} className="px-2 py-0.5 rounded bg-slate-700/40 text-xs text-slate-300">{p}</span>
                        ))}
                      </div>
                      <span className="text-sm font-bold text-emerald-400">{formatPercent(t.priceImpactPercent)}</span>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {t.affectedCohorts.map(c => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: `${COHORT_COLORS[c]}22`, color: COHORT_COLORS[c] }}
                        >
                          {COHORT_LABELS[c]}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
};

// ---- Tab: Top Plays ----

const TopPlaysTab: React.FC<{ plays: TopNostalgiaPlay[] }> = ({ plays }) => {
  const returnsChartData = useMemo(() =>
    plays.map(p => ({
      name: p.playerName.split(' ').pop(),
      fullName: p.playerName,
      expectedReturn: p.expectedReturn,
      confidence: p.confidence,
      currentPrice: p.currentPrice,
      targetPrice: p.targetPrice,
    })),
    [plays]
  );

  return (
    <div className="space-y-6">
      {/* Returns vs Confidence Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-amber-400" />
          Expected Return vs. Confidence
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={returnsChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} unit="%" domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
            <Legend />
            <Bar yAxisId="left" dataKey="expectedReturn" fill="#10b981" fillOpacity={0.7} name="Expected Return %" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="confidence" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} name="Confidence %" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Play Cards */}
      <div className="space-y-4">
        {plays.map(play => (
          <div key={play.rank} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-300">#{play.rank}</span>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-100">{play.playerName}</h4>
                  <p className="text-xs text-slate-400">{play.cardName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: `${COHORT_COLORS[play.primaryCohort]}22`, color: COHORT_COLORS[play.primaryCohort] }}
                >
                  {COHORT_LABELS[play.primaryCohort]}
                </span>
                <span className="px-2.5 py-1 rounded text-xs font-medium bg-slate-700/50 text-slate-300">
                  {TRIGGER_LABELS[play.triggerType] || play.triggerType}
                </span>
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-900/40 text-emerald-400">
                  {formatPercent(play.expectedReturn)}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-3">{play.thesis}</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <p className="text-xs text-slate-500">Sport</p>
                <p className="text-sm font-medium text-slate-300">{play.sport}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <p className="text-xs text-slate-500">Current Price</p>
                <p className="text-sm font-bold text-slate-200">{formatCurrency(play.currentPrice)}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <p className="text-xs text-slate-500">Target Price</p>
                <p className="text-sm font-bold text-emerald-400">{formatCurrency(play.targetPrice)}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <p className="text-xs text-slate-500">Trigger Date</p>
                <p className="text-sm font-medium text-amber-400">
                  {new Date(play.triggerDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <p className="text-xs text-slate-500">Confidence</p>
                <p className="text-sm font-bold" style={{ color: play.confidence >= 85 ? '#10b981' : play.confidence >= 70 ? '#f59e0b' : '#ef4444' }}>
                  {play.confidence}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NostalgiaPredictor;
