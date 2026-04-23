// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Beaker,
  ChevronDown,
  Clock,
  Droplets,
  FlaskConical,
  Layers,
  Loader2,
  Radiation,
  Shield,
  ShieldCheck,
  Sun,
  Target,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  getAllDecayProfiles,
  getDecayProfile,
  simulateDecay,
  getPreservationPlan,
  getMaterialDecayRates,
  compareStorageScenarios,
  getCollectionDecayForecast,
  getOptimalStorageRecommendation,
  calculateHalfLife,
  type DecayProfile,
  type PreservationPlan,
  type MaterialDecayRate,
  type StorageScenarioResult,
  type CollectionDecayForecast,
  type StorageCondition,
  type StorageEnvironment,
  type LightExposure,
  type DecayPoint,
} from '../lib/core/cardDecayService';

// ---- Constants ----

type TabId =
  | 'dashboard'
  | 'simulator'
  | 'materials'
  | 'preservation'
  | 'collection'
  | 'rankings';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: 'dashboard', label: 'Decay Dashboard', icon: <Activity className="w-4 h-4" /> },
  { id: 'simulator', label: 'Storage Simulator', icon: <Beaker className="w-4 h-4" /> },
  { id: 'materials', label: 'Material Science', icon: <FlaskConical className="w-4 h-4" /> },
  { id: 'preservation', label: 'Preservation Planner', icon: <Shield className="w-4 h-4" /> },
  { id: 'collection', label: 'Collection Forecast', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'rankings', label: 'Half-Life Rankings', icon: <Radiation className="w-4 h-4" /> },
];

const GRADE_ZONE_COLORS = {
  stable: '#22c55e',
  degradation: '#eab308',
  critical: '#ef4444',
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const ENVIRONMENT_OPTIONS: { value: StorageEnvironment; label: string }[] = [
  { value: 'museum-grade', label: 'Museum Grade' },
  { value: 'climate-controlled', label: 'Climate Controlled' },
  { value: 'standard-indoor', label: 'Standard Indoor' },
  { value: 'garage', label: 'Garage / Attic' },
  { value: 'unknown', label: 'Unknown' },
];

const LIGHT_OPTIONS: { value: LightExposure; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'heavy', label: 'Heavy' },
];

// ---- Utility Components ----

function GradeZoneBadge({ grade }: { grade: number }) {
  const zone =
    grade >= 7 ? 'stable' : grade >= 4 ? 'degradation' : 'critical';
  const labels = { stable: 'Stable', degradation: 'Degrading', critical: 'Critical' };
  const colors = {
    stable: 'bg-green-500/20 text-green-400',
    degradation: 'bg-yellow-500/20 text-yellow-400',
    critical: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[zone]}`}>
      {labels[zone]}
    </span>
  );
}

function HalfLifeIndicator({ halfLife }: { halfLife: number }) {
  const isFast = halfLife < 25;
  const isSlow = halfLife > 80;
  return (
    <div className="flex items-center gap-2">
      {isFast && <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />}
      <span
        className={`text-lg font-bold ${
          isFast ? 'text-red-400' : isSlow ? 'text-green-400' : 'text-yellow-400'
        }`}
      >
        {halfLife.toFixed(1)} yr
      </span>
      {isFast && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-semibold uppercase tracking-wider">
          Rapid Decay
        </span>
      )}
    </div>
  );
}

function PreservationScoreRing({ score }: { score: number }) {
  const color =
    score >= 75 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-slate-700"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className={color}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xl font-bold ${color}`}>{score}</span>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      <span className="ml-3 text-slate-400">Loading decay analysis...</span>
    </div>
  );
}

// ---- Custom Tooltip for Decay Charts ----

function DecayCurveTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
      <p className="text-slate-300 font-medium mb-1">Year {label}</p>
      <p className="text-white">
        Grade: <span className="font-bold">{point.projectedGrade?.toFixed(2)}</span>
      </p>
      {point.confidenceLow != null && (
        <p className="text-slate-400 text-xs">
          CI: {point.confidenceLow?.toFixed(2)} - {point.confidenceHigh?.toFixed(2)}
        </p>
      )}
      {point.degradationFactors?.length > 0 && (
        <div className="mt-1 pt-1 border-t border-slate-700">
          <p className="text-slate-500 text-xs mb-0.5">Factors:</p>
          {point.degradationFactors.map((f: string, i: number) => (
            <p key={i} className="text-slate-400 text-xs">
              - {f}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Tab: Decay Dashboard ----

function DecayDashboard({
  profiles,
  selectedId,
  onSelectCard,
}: {
  profiles: DecayProfile[];
  selectedId: string;
  onSelectCard: (id: string) => void;
}) {
  const profile = useMemo(
    () => profiles.find((p) => p.cardId === selectedId) ?? profiles[0],
    [profiles, selectedId]
  );

  const chartData = useMemo(() => {
    if (!profile) return [];
    return profile.decayCurve.map((pt) => ({
      year: pt.year,
      projectedGrade: pt.projectedGrade,
      confidenceLow: pt.confidenceInterval.low,
      confidenceHigh: pt.confidenceInterval.high,
      degradationFactors: pt.degradationFactors,
    }));
  }, [profile]);

  const valueData = useMemo(() => {
    if (!profile) return [];
    return profile.valueTrajectory.map((vp) => ({
      year: vp.year,
      value: vp.projectedValue,
      inflationAdj: vp.inflationAdjusted,
    }));
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Card Selector */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <select
            value={selectedId}
            onChange={(e) => onSelectCard(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {profiles.map((p) => (
              <option key={p.cardId} value={p.cardId}>
                {p.cardName} — Grade {p.currentGrade}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <HalfLifeIndicator halfLife={profile.halfLife} />
        <PreservationScoreRing score={profile.preservationScore} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '5-Year Grade', value: profile.projectedGradeAt.years5.toFixed(2) },
          { label: '10-Year Grade', value: profile.projectedGradeAt.years10.toFixed(2) },
          { label: '25-Year Grade', value: profile.projectedGradeAt.years25.toFixed(2) },
          { label: '50-Year Grade', value: profile.projectedGradeAt.years50.toFixed(2) },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center"
          >
            <p className="text-slate-400 text-xs mb-1">{item.label}</p>
            <p className="text-white text-2xl font-bold">{item.value}</p>
            <GradeZoneBadge grade={parseFloat(item.value)} />
          </div>
        ))}
      </div>

      {/* Decay Curve Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-400" />
          Grade Degradation Curve (50-Year Projection)
        </h3>
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GRADE_ZONE_COLORS.stable} stopOpacity={0.3} />
                <stop offset="50%" stopColor={GRADE_ZONE_COLORS.degradation} stopOpacity={0.15} />
                <stop offset="100%" stopColor={GRADE_ZONE_COLORS.critical} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="year"
              stroke="#94a3b8"
              fontSize={12}
              label={{ value: 'Years', position: 'insideBottom', offset: -2, fill: '#94a3b8' }}
            />
            <YAxis
              domain={[1, 10]}
              stroke="#94a3b8"
              fontSize={12}
              label={{
                value: 'Grade',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                fill: '#94a3b8',
              }}
            />
            <Tooltip content={<DecayCurveTooltip />} />
            {/* Confidence band */}
            <Area
              type="monotone"
              dataKey="confidenceHigh"
              stroke="none"
              fill="url(#confidenceBand)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="confidenceLow"
              stroke="none"
              fill="#1e293b"
              fillOpacity={1}
            />
            {/* Zone reference lines */}
            <ReferenceLine y={7} stroke={GRADE_ZONE_COLORS.degradation} strokeDasharray="6 4" strokeOpacity={0.5} />
            <ReferenceLine y={4} stroke={GRADE_ZONE_COLORS.critical} strokeDasharray="6 4" strokeOpacity={0.5} />
            {/* Main decay curve */}
            <Line
              type="monotone"
              dataKey="projectedGrade"
              stroke="#818cf8"
              strokeWidth={3}
              dot={{ fill: '#818cf8', r: 4 }}
              activeDot={{ r: 6, fill: '#a5b4fc' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-yellow-500 inline-block" /> Grade 7 (Degradation Zone)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-red-500 inline-block" /> Grade 4 (Critical Zone)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-indigo-500/20 rounded inline-block" /> Confidence Band
          </span>
        </div>
      </div>

      {/* Value Trajectory */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          Value Trajectory
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={valueData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="inflGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickFormatter={(v: number) =>
                v >= 1000000
                  ? `$${(v / 1000000).toFixed(1)}M`
                  : v >= 1000
                    ? `$${(v / 1000).toFixed(0)}K`
                    : `$${v}`
              }
            />
            <Tooltip
              formatter={(val: number) => [`$${val.toLocaleString()}`, '']}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              name="Nominal Value"
              stroke="#22c55e"
              fill="url(#valueGrad)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="inflationAdj"
              name="Inflation-Adjusted"
              stroke="#f59e0b"
              fill="url(#inflGrad)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Card Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Material Composition
          </h4>
          <dl className="space-y-2 text-sm">
            {[
              ['Card Stock', profile.materialComposition.cardStock],
              ['Coating', profile.materialComposition.coating],
              ['Ink Type', profile.materialComposition.inkType],
              ['Thickness', `${profile.materialComposition.thickness_mm} mm`],
              ['Acid Content', profile.materialComposition.acidContent],
              ['UV Resistance', `${profile.materialComposition.uvResistance}/100`],
              ['Moisture Resistance', `${profile.materialComposition.moistureResistance}/100`],
              ['Oxidation Rate', profile.materialComposition.oxidationRate.toFixed(4)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-slate-400">{label}</dt>
                <dd className="text-white font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            Storage Conditions
          </h4>
          <dl className="space-y-2 text-sm">
            {[
              ['Environment', profile.storageCondition.environment],
              ['Temperature', `${profile.storageCondition.temperature_F}°F`],
              ['Humidity', `${profile.storageCondition.humidity_percent}%`],
              ['Light Exposure', profile.storageCondition.lightExposure],
              ['Sleeved', profile.storageCondition.sleeved ? 'Yes' : 'No'],
              ['Top-Loaded', profile.storageCondition.toploadered ? 'Yes' : 'No'],
              ['Graded Case', profile.storageCondition.casedGrade ?? 'None'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-slate-400">{label}</dt>
                <dd className="text-white font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

// ---- Tab: Storage Simulator ----

interface SimCondition {
  label: string;
  environment: StorageEnvironment;
  temperature_F: number;
  humidity_percent: number;
  lightExposure: LightExposure;
  sleeved: boolean;
  toploadered: boolean;
  casedGrade: string | null;
}

const DEFAULT_SIM_CONDITIONS: SimCondition[] = [
  {
    label: 'Current Storage',
    environment: 'standard-indoor',
    temperature_F: 72,
    humidity_percent: 50,
    lightExposure: 'minimal',
    sleeved: true,
    toploadered: true,
    casedGrade: null,
  },
  {
    label: 'Optimal (Museum)',
    environment: 'museum-grade',
    temperature_F: 65,
    humidity_percent: 42,
    lightExposure: 'none',
    sleeved: true,
    toploadered: true,
    casedGrade: 'PSA',
  },
];

function StorageSimulator({
  profiles,
  selectedId,
}: {
  profiles: DecayProfile[];
  selectedId: string;
}) {
  const profile = useMemo(
    () => profiles.find((p) => p.cardId === selectedId) ?? profiles[0],
    [profiles, selectedId]
  );

  const [conditions, setConditions] = useState<SimCondition[]>(() => {
    if (!profile) return DEFAULT_SIM_CONDITIONS;
    return [
      {
        label: 'Current Storage',
        environment: profile.storageCondition.environment,
        temperature_F: profile.storageCondition.temperature_F,
        humidity_percent: profile.storageCondition.humidity_percent,
        lightExposure: profile.storageCondition.lightExposure,
        sleeved: profile.storageCondition.sleeved,
        toploadered: profile.storageCondition.toploadered,
        casedGrade: profile.storageCondition.casedGrade,
      },
      DEFAULT_SIM_CONDITIONS[1],
    ];
  });

  const [results, setResults] = useState<StorageScenarioResult[] | null>(null);
  const [simulating, setSimulating] = useState(false);

  const runSimulation = useCallback(async () => {
    if (!profile) return;
    setSimulating(true);
    const conditionInputs = conditions.map((c) => ({
      label: c.label,
      condition: {
        environment: c.environment,
        temperature_F: c.temperature_F,
        humidity_percent: c.humidity_percent,
        lightExposure: c.lightExposure,
        sleeved: c.sleeved,
        toploadered: c.toploadered,
        casedGrade: c.casedGrade,
      } as StorageCondition,
    }));
    const res = await compareStorageScenarios(profile.cardId, conditionInputs);
    setResults(res);
    setSimulating(false);
  }, [profile, conditions]);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  const updateCondition = useCallback(
    (index: number, partial: Partial<SimCondition>) => {
      setConditions((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...partial };
        return next;
      });
    },
    []
  );

  const overlayData = useMemo(() => {
    if (!results) return [];
    const years = results[0]?.decayCurve.map((p) => p.year) ?? [];
    return years.map((y, i) => {
      const point: Record<string, number> = { year: y };
      results.forEach((r, ri) => {
        point[`scenario${ri}`] = r.decayCurve[i]?.projectedGrade ?? 0;
      });
      return point;
    });
  }, [results]);

  const scenarioColors = ['#818cf8', '#22c55e', '#f59e0b', '#ef4444'];

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {conditions.map((cond, idx) => (
          <div
            key={idx}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <input
                value={cond.label}
                onChange={(e) => updateCondition(idx, { label: e.target.value })}
                className="bg-transparent text-white font-semibold text-lg border-b border-slate-600 focus:border-indigo-400 outline-none pb-1"
              />
              {results?.[idx] && <HalfLifeIndicator halfLife={results[idx].halfLife} />}
            </div>

            <div className="space-y-3">
              {/* Environment */}
              <div>
                <label className="text-slate-400 text-xs block mb-1">Environment</label>
                <select
                  value={cond.environment}
                  onChange={(e) =>
                    updateCondition(idx, { environment: e.target.value as StorageEnvironment })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-white text-sm"
                >
                  {ENVIRONMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Temperature Slider */}
              <div>
                <label className="text-slate-400 text-xs flex justify-between mb-1">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3" /> Temperature
                  </span>
                  <span className="text-white font-medium">{cond.temperature_F}°F</span>
                </label>
                <input
                  type="range"
                  min={60}
                  max={85}
                  value={cond.temperature_F}
                  onChange={(e) =>
                    updateCondition(idx, { temperature_F: parseInt(e.target.value) })
                  }
                  className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>60°F</span>
                  <span>85°F</span>
                </div>
              </div>

              {/* Humidity Slider */}
              <div>
                <label className="text-slate-400 text-xs flex justify-between mb-1">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3 h-3" /> Humidity
                  </span>
                  <span className="text-white font-medium">{cond.humidity_percent}%</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={80}
                  value={cond.humidity_percent}
                  onChange={(e) =>
                    updateCondition(idx, { humidity_percent: parseInt(e.target.value) })
                  }
                  className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>20%</span>
                  <span>80%</span>
                </div>
              </div>

              {/* Light Exposure */}
              <div>
                <label className="text-slate-400 text-xs flex items-center gap-1 mb-1">
                  <Sun className="w-3 h-3" /> Light Exposure
                </label>
                <select
                  value={cond.lightExposure}
                  onChange={(e) =>
                    updateCondition(idx, { lightExposure: e.target.value as LightExposure })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-white text-sm"
                >
                  {LIGHT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Protection checkboxes */}
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cond.sleeved}
                    onChange={(e) => updateCondition(idx, { sleeved: e.target.checked })}
                    className="accent-indigo-500"
                  />
                  Sleeved
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cond.toploadered}
                    onChange={(e) => updateCondition(idx, { toploadered: e.target.checked })}
                    className="accent-indigo-500"
                  />
                  Top-loaded
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!cond.casedGrade}
                    onChange={(e) =>
                      updateCondition(idx, { casedGrade: e.target.checked ? 'PSA' : null })
                    }
                    className="accent-indigo-500"
                  />
                  Graded Slab
                </label>
              </div>

              {/* Preservation Score */}
              {results?.[idx] && (
                <div className="flex items-center gap-3 pt-2 border-t border-slate-700">
                  <span className="text-slate-400 text-xs">Preservation Score</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        results[idx].preservationScore >= 75
                          ? 'bg-green-500'
                          : results[idx].preservationScore >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${results[idx].preservationScore}%` }}
                    />
                  </div>
                  <span className="text-white text-sm font-bold">
                    {results[idx].preservationScore}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={runSimulation}
        disabled={simulating}
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
        Run Simulation
      </button>

      {/* Overlay Chart */}
      {results && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">
            Storage Scenario Comparison — Grade Over Time
          </h3>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={overlayData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
              <YAxis domain={[1, 10]} stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend />
              <ReferenceLine y={7} stroke={GRADE_ZONE_COLORS.degradation} strokeDasharray="6 4" strokeOpacity={0.4} />
              <ReferenceLine y={4} stroke={GRADE_ZONE_COLORS.critical} strokeDasharray="6 4" strokeOpacity={0.4} />
              {results.map((r, i) => (
                <Line
                  key={i}
                  type="monotone"
                  dataKey={`scenario${i}`}
                  name={r.label}
                  stroke={scenarioColors[i % scenarioColors.length]}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Summary comparison */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: scenarioColors[i % scenarioColors.length] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{r.label}</p>
                  <p className="text-slate-400 text-xs">
                    Grade at 25yr: {r.gradeAt25Years.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{r.halfLife.toFixed(1)} yr</p>
                  <p className="text-slate-500 text-xs">half-life</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Tab: Material Science ----

function MaterialScience({ materialRates }: { materialRates: MaterialDecayRate[] }) {
  const [selectedMaterial, setSelectedMaterial] = useState(0);

  const radarData = useMemo(() => {
    return materialRates.map((m) => {
      // Derive radar metrics from base half-life
      const longevity = Math.min(100, (m.baseHalfLifeYears / 80) * 100);
      const uvRes = longevity * 0.9 + Math.random() * 10;
      const moistureRes = longevity * 0.85 + Math.random() * 12;
      const acidRes = longevity * 0.8 + Math.random() * 15;
      const mechStr = 50 + Math.random() * 40;
      const oxidRes = longevity * 0.95 + Math.random() * 5;
      return {
        material: m.material.split('(')[0].trim(),
        longevity: Math.min(100, Math.round(longevity)),
        uvResistance: Math.min(100, Math.round(uvRes)),
        moistureResistance: Math.min(100, Math.round(moistureRes)),
        acidResistance: Math.min(100, Math.round(acidRes)),
        mechanicalStrength: Math.min(100, Math.round(mechStr)),
        oxidationResistance: Math.min(100, Math.round(oxidRes)),
      };
    });
  }, [materialRates]);

  const selectedRadar = useMemo(() => {
    const d = radarData[selectedMaterial];
    if (!d) return [];
    return [
      { axis: 'Longevity', value: d.longevity },
      { axis: 'UV Resist.', value: d.uvResistance },
      { axis: 'Moisture Resist.', value: d.moistureResistance },
      { axis: 'Acid Resist.', value: d.acidResistance },
      { axis: 'Mech. Strength', value: d.mechanicalStrength },
      { axis: 'Oxidation Resist.', value: d.oxidationResistance },
    ];
  }, [radarData, selectedMaterial]);

  const barData = useMemo(() => {
    return materialRates.map((m, i) => ({
      name: m.material.split('(')[0].trim(),
      halfLife: m.baseHalfLifeYears,
      fill:
        m.baseHalfLifeYears > 50
          ? '#22c55e'
          : m.baseHalfLifeYears > 30
            ? '#eab308'
            : '#ef4444',
    }));
  }, [materialRates]);

  return (
    <div className="space-y-6">
      {/* Half-Life Comparison Bar Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Base Half-Life by Material Type (Years)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 130, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#94a3b8" fontSize={12} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              width={120}
              tick={{ fill: '#cbd5e1' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
              formatter={(val: number) => [`${val.toFixed(1)} years`, 'Half-Life']}
            />
            <Bar dataKey="halfLife" radius={[0, 4, 4, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Material Selector + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Resistance Profile
          </h3>
          <div className="mb-4">
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              {materialRates.map((m, i) => (
                <option key={i} value={i}>
                  {m.material}
                </option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={selectedRadar} outerRadius="75%">
              <PolarGrid stroke="#475569" />
              <PolarAngleAxis dataKey="axis" stroke="#94a3b8" fontSize={11} />
              <PolarRadiusAxis
                domain={[0, 100]}
                stroke="#475569"
                fontSize={10}
                tick={{ fill: '#64748b' }}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#818cf8"
                fill="#818cf8"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Accelerators / Decelerators */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">
            {materialRates[selectedMaterial]?.material}
          </h3>
          <div className="mb-2">
            <span className="text-2xl font-bold text-white">
              {materialRates[selectedMaterial]?.baseHalfLifeYears.toFixed(1)}
            </span>
            <span className="text-slate-400 ml-1">years base half-life</span>
          </div>

          <div className="space-y-4 mt-4">
            <div>
              <h4 className="text-red-400 text-sm font-semibold mb-2 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Decay Accelerators
              </h4>
              <ul className="space-y-1">
                {materialRates[selectedMaterial]?.accelerators.map((a, i) => (
                  <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">-</span> {a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-green-400 text-sm font-semibold mb-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Decay Decelerators
              </h4>
              <ul className="space-y-1">
                {materialRates[selectedMaterial]?.decelerators.map((d, i) => (
                  <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">+</span> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Tab: Preservation Planner ----

function PreservationPlanner({
  profiles,
  selectedId,
}: {
  profiles: DecayProfile[];
  selectedId: string;
}) {
  const [plan, setPlan] = useState<PreservationPlan | null>(null);
  const [optimal, setOptimal] = useState<{
    halfLife: number;
    preservationScore: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const profile = useMemo(
    () => profiles.find((p) => p.cardId === selectedId) ?? profiles[0],
    [profiles, selectedId]
  );

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    Promise.all([
      getPreservationPlan(profile.cardId),
      getOptimalStorageRecommendation(profile.cardId),
    ]).then(([p, o]) => {
      setPlan(p);
      setOptimal(o);
      setLoading(false);
    });
  }, [profile]);

  if (loading) return <LoadingSpinner />;
  if (!plan || !profile) return null;

  const beforeHalfLife = profile.halfLife;
  const afterHalfLife = beforeHalfLife + plan.projectedHalfLifeExtension;
  const optimalHalfLife = optimal?.halfLife ?? afterHalfLife;

  const comparisonData = [
    { label: 'Current', halfLife: beforeHalfLife, fill: '#ef4444' },
    { label: 'After Plan', halfLife: afterHalfLife, fill: '#eab308' },
    { label: 'Optimal', halfLife: optimalHalfLife, fill: '#22c55e' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-slate-400 text-xs mb-1">Current Score</p>
          <p className="text-2xl font-bold text-white">{plan.currentScore}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-slate-400 text-xs mb-1">Half-Life Extension</p>
          <p className="text-2xl font-bold text-green-400">
            +{plan.projectedHalfLifeExtension.toFixed(1)} yr
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-slate-400 text-xs mb-1">Estimated Cost</p>
          <p className="text-2xl font-bold text-white">
            ${plan.estimatedCost.toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-slate-400 text-xs mb-1">ROI</p>
          <p className="text-2xl font-bold text-indigo-400">{plan.roi.toFixed(1)}x</p>
        </div>
      </div>

      {/* Half-Life Comparison Bars */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Half-Life Comparison
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={comparisonData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#94a3b8" fontSize={12} unit=" yr" />
            <YAxis
              type="category"
              dataKey="label"
              stroke="#94a3b8"
              fontSize={12}
              tick={{ fill: '#cbd5e1' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
              formatter={(val: number) => [`${val.toFixed(1)} years`, 'Half-Life']}
            />
            <Bar dataKey="halfLife" radius={[0, 6, 6, 0]}>
              {comparisonData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendations */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-400" />
          Prioritized Recommendations
        </h3>
        <div className="space-y-3">
          {plan.recommendations.map((rec, i) => (
            <div
              key={i}
              className={`border rounded-lg p-4 ${PRIORITY_COLORS[rec.priority]}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/20">
                    {rec.priority}
                  </span>
                  <h4 className="text-white font-medium">{rec.action}</h4>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-400">+{rec.impact} yr</span>
                  <span className="text-slate-300">${rec.cost.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Tab: Collection Forecast ----

function CollectionForecast({ profiles }: { profiles: DecayProfile[] }) {
  const [forecast, setForecast] = useState<CollectionDecayForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = profiles.map((p) => p.cardId);
    getCollectionDecayForecast(ids).then((f) => {
      setForecast(f);
      setLoading(false);
    });
  }, [profiles]);

  if (loading) return <LoadingSpinner />;
  if (!forecast) return null;

  const gradeData = forecast.forecast.map((f) => ({
    year: f.year,
    averageGrade: f.averageGrade,
    aboveMint: f.cardsAboveMint,
    aboveNearMint: f.cardsAboveNearMint - f.cardsAboveMint,
    belowAcceptable: f.cardsBelowAcceptable,
    middleGrade:
      forecast.cardCount - f.cardsAboveNearMint - f.cardsBelowAcceptable,
  }));

  const valueData = forecast.forecast.map((f) => ({
    year: f.year,
    totalValue: f.totalValue,
    inflationAdj: f.inflationAdjustedValue,
  }));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-slate-400 text-xs mb-1">Cards Tracked</p>
          <p className="text-2xl font-bold text-white">{forecast.cardCount}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-slate-400 text-xs mb-1">Average Half-Life</p>
          <p className="text-2xl font-bold text-indigo-400">
            {forecast.averageHalfLife.toFixed(1)} yr
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-slate-400 text-xs mb-1">Current Total Value</p>
          <p className="text-2xl font-bold text-green-400">
            ${forecast.totalCurrentValue >= 1_000_000
              ? (forecast.totalCurrentValue / 1_000_000).toFixed(2) + 'M'
              : forecast.totalCurrentValue >= 1000
                ? (forecast.totalCurrentValue / 1000).toFixed(0) + 'K'
                : forecast.totalCurrentValue.toFixed(0)}
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-slate-400 text-xs mb-1">25yr Projected Value</p>
          <p className="text-2xl font-bold text-yellow-400">
            ${forecast.projectedValueAt25Years >= 1_000_000
              ? (forecast.projectedValueAt25Years / 1_000_000).toFixed(2) + 'M'
              : forecast.projectedValueAt25Years >= 1000
                ? (forecast.projectedValueAt25Years / 1000).toFixed(0) + 'K'
                : forecast.projectedValueAt25Years.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Weakest / Strongest */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-400 text-xs font-semibold">Most Vulnerable</p>
            <p className="text-white text-sm">{forecast.weakestCard.cardName}</p>
            <p className="text-red-300 text-xs">
              Half-life: {forecast.weakestCard.halfLife.toFixed(1)} years
            </p>
          </div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-400 text-xs font-semibold">Most Resilient</p>
            <p className="text-white text-sm">{forecast.strongestCard.cardName}</p>
            <p className="text-green-300 text-xs">
              Half-life: {forecast.strongestCard.halfLife.toFixed(1)} years
            </p>
          </div>
        </div>
      </div>

      {/* Stacked Area — Grade Distribution Over Time */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">
          Collection Grade Distribution Over Time
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={gradeData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mintGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="nmGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="midGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eab308" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#eab308" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="lowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="aboveMint"
              name="Mint (9+)"
              stackId="1"
              stroke="#22c55e"
              fill="url(#mintGrad)"
            />
            <Area
              type="monotone"
              dataKey="aboveNearMint"
              name="Near-Mint (7-9)"
              stackId="1"
              stroke="#3b82f6"
              fill="url(#nmGrad)"
            />
            <Area
              type="monotone"
              dataKey="middleGrade"
              name="Mid-Grade (4-7)"
              stackId="1"
              stroke="#eab308"
              fill="url(#midGrad)"
            />
            <Area
              type="monotone"
              dataKey="belowAcceptable"
              name="Poor (<4)"
              stackId="1"
              stroke="#ef4444"
              fill="url(#lowGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Value Projection */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">
          Collection Value Projection
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={valueData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colValGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickFormatter={(v: number) =>
                v >= 1_000_000
                  ? `$${(v / 1_000_000).toFixed(1)}M`
                  : v >= 1000
                    ? `$${(v / 1000).toFixed(0)}K`
                    : `$${v}`
              }
            />
            <Tooltip
              formatter={(val: number) => [`$${val.toLocaleString()}`, '']}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="totalValue"
              name="Nominal Value"
              stroke="#818cf8"
              fill="url(#colValGrad)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="inflationAdj"
              name="Inflation-Adjusted"
              stroke="#f59e0b"
              fill="none"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---- Tab: Half-Life Rankings ----

function HalfLifeRankings({ profiles }: { profiles: DecayProfile[] }) {
  const [sortKey, setSortKey] = useState<'halfLife' | 'grade' | 'score' | 'year'>('halfLife');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    const copy = [...profiles];
    copy.sort((a, b) => {
      let av: number, bv: number;
      switch (sortKey) {
        case 'halfLife':
          av = a.halfLife;
          bv = b.halfLife;
          break;
        case 'grade':
          av = a.currentGrade;
          bv = b.currentGrade;
          break;
        case 'score':
          av = a.preservationScore;
          bv = b.preservationScore;
          break;
        case 'year':
          av = a.year;
          bv = b.year;
          break;
        default:
          av = 0;
          bv = 0;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return copy;
  }, [profiles, sortKey, sortDir]);

  const maxHalfLife = useMemo(
    () => Math.max(...profiles.map((p) => p.halfLife)),
    [profiles]
  );

  const handleSort = useCallback(
    (key: typeof sortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('desc');
      }
    },
    [sortKey]
  );

  const SortHeader = ({
    label,
    field,
    className = '',
  }: {
    label: string;
    field: typeof sortKey;
    className?: string;
  }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortKey === field && (
          <span className="text-indigo-400">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
        )}
      </span>
    </th>
  );

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-8">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Card
              </th>
              <SortHeader label="Year" field="year" />
              <SortHeader label="Grade" field="grade" />
              <SortHeader label="Half-Life" field="halfLife" />
              <SortHeader label="Preservation" field="score" />
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Storage
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                25yr Grade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {sorted.map((p, i) => {
              const isFastDecay = p.halfLife < 25;
              return (
                <tr
                  key={p.cardId}
                  className="hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-500 text-sm">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium truncate max-w-[260px]">
                      {p.cardName}
                    </p>
                    <p className="text-slate-500 text-xs">{p.manufacturer}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{p.year}</td>
                  <td className="px-4 py-3">
                    <span className="text-white font-medium text-sm">
                      {p.currentGrade.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isFastDecay && (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      )}
                      <div className="w-24 flex-shrink-0">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.halfLife > 80
                                ? 'bg-green-500'
                                : p.halfLife > 40
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (p.halfLife / maxHalfLife) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          isFastDecay ? 'text-red-400' : 'text-white'
                        }`}
                      >
                        {p.halfLife.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-medium ${
                        p.preservationScore >= 75
                          ? 'text-green-400'
                          : p.preservationScore >= 50
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }`}
                    >
                      {p.preservationScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs capitalize">
                    {p.storageCondition.environment.replace('-', ' ')}
                  </td>
                  <td className="px-4 py-3">
                    <GradeZoneBadge grade={p.projectedGradeAt.years25} />
                    <span className="text-white text-sm ml-2">
                      {p.projectedGradeAt.years25.toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Main Component ----

export default function CardDecayPredictor() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [profiles, setProfiles] = useState<DecayProfile[]>([]);
  const [materialRates, setMaterialRates] = useState<MaterialDecayRate[]>([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllDecayProfiles(), getMaterialDecayRates()]).then(
      ([p, m]) => {
        setProfiles(p);
        setMaterialRates(m);
        if (p.length > 0) setSelectedCardId(p[0].cardId);
        setLoading(false);
      }
    );
  }, []);

  const renderTab = useMemo(() => {
    if (loading) return <LoadingSpinner />;

    switch (activeTab) {
      case 'dashboard':
        return (
          <DecayDashboard
            profiles={profiles}
            selectedId={selectedCardId}
            onSelectCard={setSelectedCardId}
          />
        );
      case 'simulator':
        return <StorageSimulator profiles={profiles} selectedId={selectedCardId} />;
      case 'materials':
        return <MaterialScience materialRates={materialRates} />;
      case 'preservation':
        return (
          <PreservationPlanner profiles={profiles} selectedId={selectedCardId} />
        );
      case 'collection':
        return <CollectionForecast profiles={profiles} />;
      case 'rankings':
        return <HalfLifeRankings profiles={profiles} />;
      default:
        return null;
    }
  }, [activeTab, profiles, materialRates, selectedCardId, loading]);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/20 rounded-lg">
                <Radiation className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  Card Decay Half-Life Predictor
                </h1>
                <p className="text-xs text-slate-400">
                  Physics-based condition degradation modeling
                </p>
              </div>
            </div>
            {!loading && profiles.length > 0 && (
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
                <span>{profiles.length} cards tracked</span>
                <span className="text-slate-600">|</span>
                <span>
                  Avg half-life:{' '}
                  <span className="text-indigo-400 font-medium">
                    {(
                      profiles.reduce((s, p) => s + p.halfLife, 0) / profiles.length
                    ).toFixed(1)}{' '}
                    yr
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto py-1 -mb-px" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-indigo-400 border-b-2 border-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{renderTab}</div>
    </div>
  );
}
