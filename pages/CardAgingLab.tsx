import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FlaskConical,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Shield,
  TrendingDown,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  Layers,
  Clock,
  CheckCircle2,
  Info,
  Loader2,
  Zap,
  Calculator,
  Package,
  Archive,
  Award,
  Target,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from 'recharts';
import {
  simulateAging,
  getPreservationScore,
  compareStorageScenarios,
  getDegradationFactors,
  getOptimalStorage,
  getMaterialAnalysis,
  getEnvironmentalRisks,
  calculateStorageROI,
  getAllMaterials,
  getAllStorageRecommendations,
  getStorageTypeLabel,
  type StorageCondition,
  type UVExposure,
  type AirQuality,
  type StorageType,
  type AgingSimulation,
  type AgingScenario,
  type PreservationScore,
  type MaterialFactor,
  type EnvironmentalRisk,
  type StorageRecommendation,
} from '../lib/utils/cardAgingSimService';

// ---- Constants ----

const GRADE_OPTIONS = [
  'PSA 10', 'BGS 9.5', 'PSA 9', 'BGS 9', 'PSA 8', 'PSA 7', 'PSA 6', 'PSA 5', 'PSA 4', 'Raw',
];

const STORAGE_OPTIONS: { value: StorageType; label: string }[] = [
  { value: 'shoebox', label: 'Shoebox / Loose' },
  { value: 'penny_sleeve', label: 'Penny Sleeve' },
  { value: 'toploader', label: 'Toploader' },
  { value: 'one_touch', label: 'One-Touch Magnetic' },
  { value: 'magnetic', label: 'Premium Magnetic' },
  { value: 'graded_case', label: 'Graded Slab' },
  { value: 'safe', label: 'Fireproof Safe' },
  { value: 'vault', label: 'Climate Vault' },
];

const UV_OPTIONS: { value: UVExposure; label: string }[] = [
  { value: 'none', label: 'None (Dark Storage)' },
  { value: 'low', label: 'Low (Indirect Light)' },
  { value: 'moderate', label: 'Moderate (Room Display)' },
  { value: 'high', label: 'High (Window/Sunlight)' },
];

const AIR_OPTIONS: { value: AirQuality; label: string }[] = [
  { value: 'clean', label: 'Clean (Filtered)' },
  { value: 'moderate', label: 'Moderate (Normal)' },
  { value: 'poor', label: 'Poor (Dusty/Smoky)' },
];

type TabId = 'simulator' | 'comparison' | 'materials' | 'roi' | 'risks';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'simulator', label: 'Aging Simulator', icon: <FlaskConical size={16} /> },
  { id: 'comparison', label: 'Scenario Compare', icon: <Layers size={16} /> },
  { id: 'materials', label: 'Material Science', icon: <Archive size={16} /> },
  { id: 'roi', label: 'Storage ROI', icon: <Calculator size={16} /> },
  { id: 'risks', label: 'Risk Assessment', icon: <AlertTriangle size={16} /> },
];

// ---- Helpers ----

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
    case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  }
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#84cc16';
  if (score >= 65) return '#3b82f6';
  if (score >= 45) return '#f59e0b';
  return '#ef4444';
}

// ---- Preservation Score Gauge ----

const PreservationGauge: React.FC<{ score: PreservationScore }> = ({ score }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score.score / 100) * circumference * 0.75;
  const color = getScoreColor(score.score);

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="140" viewBox="0 0 180 140">
        <path
          d="M 20 130 A 70 70 0 1 1 160 130"
          fill="none"
          stroke="#334155"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 20 130 A 70 70 0 1 1 160 130"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="transition-all duration-1000 ease-out"
        />
        <text x="90" y="90" textAnchor="middle" className="fill-white text-3xl font-bold" fontSize="36">
          {score.score}
        </text>
        <text x="90" y="112" textAnchor="middle" className="fill-slate-400 text-xs" fontSize="12">
          {score.grade} - {score.label}
        </text>
      </svg>
    </div>
  );
};

// ---- Card Visual Aging ----

const AgingCardVisual: React.FC<{ yearIndex: number; maxYears: number; grade: string }> = ({
  yearIndex,
  maxYears,
  grade,
}) => {
  const agingPercent = maxYears > 0 ? yearIndex / maxYears : 0;
  const yellowTint = Math.round(agingPercent * 40);
  const blurAmount = agingPercent * 1.5;
  const saturation = 100 - agingPercent * 35;
  const cornerWear = agingPercent * 8;

  return (
    <div className="relative">
      <div
        className="w-44 h-60 rounded-xl border-2 border-slate-600 overflow-hidden mx-auto transition-all duration-500"
        style={{
          filter: `saturate(${saturation}%) blur(${blurAmount}px) sepia(${agingPercent * 30}%)`,
          borderRadius: `${12 + cornerWear}px`,
        }}
      >
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundColor: `rgba(180, 160, 80, ${agingPercent * 0.25})`,
            zIndex: 2,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 rounded-full bg-slate-500/50 mb-3 flex items-center justify-center">
            <FlaskConical size={28} className="text-slate-300" />
          </div>
          <div className="text-sm font-bold text-white text-center">Sample Card</div>
          <div className="text-xs text-slate-400 mt-1">{grade}</div>
          <div className="mt-3 px-3 py-1 rounded-full bg-brand-lime/20 text-brand-lime text-[10px] font-bold">
            Year {yearIndex}
          </div>
        </div>
        {/* Corner wear overlay */}
        {agingPercent > 0.3 && (
          <>
            <div
              className="absolute top-0 left-0 w-4 h-4 bg-yellow-900/30 rounded-br-full"
              style={{ opacity: agingPercent }}
            />
            <div
              className="absolute top-0 right-0 w-4 h-4 bg-yellow-900/30 rounded-bl-full"
              style={{ opacity: agingPercent * 0.8 }}
            />
            <div
              className="absolute bottom-0 left-0 w-3 h-3 bg-yellow-900/20 rounded-tr-full"
              style={{ opacity: agingPercent * 0.6 }}
            />
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-900/20 rounded-tl-full"
              style={{ opacity: agingPercent * 0.7 }}
            />
          </>
        )}
      </div>
      <div className="text-center mt-3 text-sm text-slate-300 font-medium">
        {yearIndex === 0 ? 'Current Condition' : `After ${yearIndex} Year${yearIndex > 1 ? 's' : ''}`}
      </div>
    </div>
  );
};

// ---- Main Page ----

const CardAgingLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('simulator');
  const [loading, setLoading] = useState(true);

  // Simulator state
  const [selectedGrade, setSelectedGrade] = useState('PSA 10');
  const [temperature, setTemperature] = useState(72);
  const [humidity, setHumidity] = useState(50);
  const [uvExposure, setUvExposure] = useState<UVExposure>('low');
  const [airQuality, setAirQuality] = useState<AirQuality>('moderate');
  const [storageType, setStorageType] = useState<StorageType>('toploader');
  const [isClimateControlled, setIsClimateControlled] = useState(false);
  const [timelineYear, setTimelineYear] = useState(0);
  const [cardValue, setCardValue] = useState(5000);

  // ROI state
  const [roiCardValue, setRoiCardValue] = useState(5000);
  const [roiUpgradeCost, setRoiUpgradeCost] = useState(25);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const conditions: StorageCondition = useMemo(
    () => ({
      temperature,
      humidity,
      uvExposure,
      airQuality,
      storageType,
      isClimateControlled,
    }),
    [temperature, humidity, uvExposure, airQuality, storageType, isClimateControlled]
  );

  const simulation = useMemo(() => simulateAging(selectedGrade, conditions), [selectedGrade, conditions]);

  const scenarios = useMemo(() => {
    const scenarioConditions: StorageCondition[] = [
      { temperature: 72, humidity: 50, uvExposure: 'low', airQuality: 'moderate', storageType: 'shoebox', isClimateControlled: false },
      { temperature: 72, humidity: 50, uvExposure: 'low', airQuality: 'moderate', storageType: 'toploader', isClimateControlled: false },
      { temperature: 68, humidity: 40, uvExposure: 'none', airQuality: 'clean', storageType: 'graded_case', isClimateControlled: true },
      { temperature: 65, humidity: 38, uvExposure: 'none', airQuality: 'clean', storageType: 'vault', isClimateControlled: true },
    ];
    return compareStorageScenarios(selectedGrade, scenarioConditions);
  }, [selectedGrade]);

  const materials = useMemo(() => getAllMaterials(), []);
  const risks = useMemo(() => getEnvironmentalRisks(), []);
  const degradationFactors = useMemo(() => getDegradationFactors(), []);
  const storageRecs = useMemo(() => getAllStorageRecommendations(), []);
  const optimalStorage = useMemo(() => getOptimalStorage(cardValue, selectedGrade), [cardValue, selectedGrade]);

  const roiResult = useMemo(
    () => calculateStorageROI(roiCardValue, roiUpgradeCost, conditions),
    [roiCardValue, roiUpgradeCost, conditions]
  );

  const curveGrade = useMemo(() => {
    const point = simulation.curve.find((c) => c.year === timelineYear);
    return point?.gradeLabel ?? selectedGrade;
  }, [simulation, timelineYear, selectedGrade]);

  // Comparison chart data
  const comparisonChartData = useMemo(() => {
    const years = [0, 5, 10, 15, 20, 25, 30, 40, 50];
    return years.map((y) => {
      const row: Record<string, number | string> = { year: y };
      scenarios.forEach((s) => {
        const sim = simulateAging(selectedGrade, s.conditions);
        const point = sim.curve.find((c) => c.year === y);
        row[s.name] = point?.gradeNumeric ?? 0;
      });
      return row;
    });
  }, [scenarios, selectedGrade]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-brand-lime animate-spin" />
          <p className="text-slate-400 text-sm">Initializing Material Science Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-lime/20 border border-brand-lime/30">
            <FlaskConical size={24} className="text-brand-lime" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Card Aging Simulation Lab</h1>
            <p className="text-sm text-slate-400">
              Material science models for condition degradation projection
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
          <Zap size={10} />
          Industry First
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ===== SIMULATOR TAB ===== */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Configuration */}
          <div className="lg:col-span-1 space-y-4">
            {/* Grade Selection */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Award size={16} className="text-brand-lime" />
                Current Grade
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {GRADE_OPTIONS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGrade(g)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      selectedGrade === g
                        ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:text-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Type */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Package size={16} className="text-brand-lime" />
                Storage Type
              </h3>
              <select
                value={storageType}
                onChange={(e) => setStorageType(e.target.value as StorageType)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-lime/50"
              >
                {STORAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isClimateControlled}
                  onChange={(e) => setIsClimateControlled(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700 text-brand-lime focus:ring-brand-lime/50"
                />
                Climate Controlled
              </label>
            </div>

            {/* Environmental Sliders */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-5">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Thermometer size={16} className="text-brand-lime" />
                Environment
              </h3>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Thermometer size={12} /> Temperature
                  </span>
                  <span className="text-xs font-bold text-slate-200">{temperature}°F</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-brand-lime"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>50°F</span>
                  <span className="text-emerald-400">Ideal: 65-70°F</span>
                  <span>100°F</span>
                </div>
              </div>

              {/* Humidity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Droplets size={12} /> Humidity
                  </span>
                  <span className="text-xs font-bold text-slate-200">{humidity}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={95}
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="w-full accent-brand-lime"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>10%</span>
                  <span className="text-emerald-400">Ideal: 35-45%</span>
                  <span>95%</span>
                </div>
              </div>

              {/* UV */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Sun size={12} /> UV Exposure
                </span>
                <select
                  value={uvExposure}
                  onChange={(e) => setUvExposure(e.target.value as UVExposure)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-lime/50"
                >
                  {UV_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Air Quality */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Wind size={12} /> Air Quality
                </span>
                <select
                  value={airQuality}
                  onChange={(e) => setAirQuality(e.target.value as AirQuality)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-lime/50"
                >
                  {AIR_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Card Value */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <DollarSign size={16} className="text-brand-lime" />
                Current Value
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  value={cardValue}
                  onChange={(e) => setCardValue(Math.max(0, Number(e.target.value)))}
                  className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-lime/50"
                />
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Top row: Gauge + Card Visual + Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Preservation Gauge */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex flex-col items-center justify-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Preservation Score
                </h3>
                <PreservationGauge score={simulation.preservationScore} />
              </div>

              {/* Aging Card Visual */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex flex-col items-center justify-center">
                <AgingCardVisual yearIndex={timelineYear} maxYears={50} grade={curveGrade} />
              </div>

              {/* Quick Stats */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Metrics</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                    <span className="text-xs text-slate-400">Deg. Rate</span>
                    <span className="text-xs font-bold text-orange-400">
                      {simulation.degradationRate.gradePointsPerYear} pts/yr
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                    <span className="text-xs text-slate-400">Dominant Factor</span>
                    <span className="text-xs font-bold text-slate-200">
                      {simulation.degradationRate.dominantFactor}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                    <span className="text-xs text-slate-400">Optimal Storage</span>
                    <span className="text-xs font-bold text-brand-lime">
                      {optimalStorage.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                    <span className="text-xs text-slate-400">Confidence</span>
                    <span className="text-xs font-bold text-blue-400">
                      {Math.round(simulation.degradationRate.confidence * 100)}%
                    </span>
                  </div>
                </div>
                {/* Suggestions */}
                {simulation.preservationScore.suggestions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Recommendations
                    </h4>
                    {simulation.preservationScore.suggestions.slice(0, 3).map((s, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-400">
                        <ChevronRight size={10} className="text-brand-lime mt-0.5 shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Slider */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Clock size={16} className="text-brand-lime" />
                  Aging Timeline
                </h3>
                <span className="text-sm font-bold text-brand-lime">
                  Year {timelineYear} — {curveGrade}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={timelineYear}
                onChange={(e) => setTimelineYear(Number(e.target.value))}
                className="w-full accent-brand-lime"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Now</span>
                <span>10 yrs</span>
                <span>25 yrs</span>
                <span>50 yrs</span>
              </div>
            </div>

            {/* Grade Decay Chart */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <BarChart3 size={16} className="text-brand-lime" />
                Grade Decay Curve (50 Years)
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simulation.curve}>
                    <defs>
                      <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="year"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      label={{ value: 'Grade', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      labelFormatter={(v) => `Year ${v}`}
                      formatter={(v: number) => [v.toFixed(2), 'Grade']}
                    />
                    <Area
                      type="monotone"
                      dataKey="gradeNumeric"
                      stroke="#84cc16"
                      strokeWidth={2}
                      fill="url(#gradeGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Value Projections Table */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <DollarSign size={16} className="text-brand-lime" />
                Value Impact Projections
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Timeline</th>
                      <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Projected Grade</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Grade (Numeric)</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Projected Value</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Change</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulation.projections.map((p) => (
                      <tr key={p.yearsFromNow} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="py-2.5 px-3 text-slate-200 font-medium">
                          {p.yearsFromNow} year{p.yearsFromNow > 1 ? 's' : ''}
                        </td>
                        <td className="py-2.5 px-3 text-slate-200">{p.projectedGrade}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{p.gradeNumeric}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                          ${p.projectedValue.toLocaleString()}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold ${p.valueChangePercent < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {p.valueChangePercent > 0 ? '+' : ''}{p.valueChangePercent}%
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {Math.round(p.confidence * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {cardValue > 0 && (
                <div className="mt-3 p-3 bg-slate-700/30 rounded-xl">
                  <p className="text-xs text-slate-400">
                    <span className="text-brand-lime font-bold">{selectedGrade}</span> worth{' '}
                    <span className="text-white font-bold">${cardValue.toLocaleString()}</span> today{' '}
                    <TrendingDown size={12} className="inline text-red-400" />{' '}
                    <span className="text-white font-bold">
                      ${simulation.projections.find((p) => p.yearsFromNow === 25)?.projectedValue.toLocaleString() ?? '—'}
                    </span>{' '}
                    in 25 years at current storage ({getStorageTypeLabel(storageType)})
                  </p>
                </div>
              )}
            </div>

            {/* Score Breakdown */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Target size={16} className="text-brand-lime" />
                Preservation Score Breakdown
              </h3>
              <div className="space-y-2">
                {simulation.preservationScore.breakdown.map((b) => (
                  <div key={b.factor} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        {b.factor} <span className="text-slate-600">({Math.round(b.weight * 100)}%)</span>
                      </span>
                      <span className="font-bold" style={{ color: getScoreColor(b.score) }}>
                        {b.score}/100
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${b.score}%`,
                          backgroundColor: getScoreColor(b.score),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== COMPARISON TAB ===== */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Comparison Chart */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers size={16} className="text-brand-lime" />
              Multi-Scenario Grade Decay — {selectedGrade}
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="year"
                    stroke="#64748b"
                    fontSize={11}
                    label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    stroke="#64748b"
                    fontSize={11}
                    label={{ value: 'Grade', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    labelFormatter={(v) => `Year ${v}`}
                  />
                  <Legend />
                  {scenarios.map((s) => (
                    <Line
                      key={s.id}
                      type="monotone"
                      dataKey={s.name}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scenario Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {scenarios.map((s) => {
              const proj25 = s.projections.find((p) => p.yearsFromNow === 25);
              return (
                <div
                  key={s.id}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <h4 className="text-sm font-bold text-slate-200 truncate">{s.name}</h4>
                  </div>
                  <div className="text-center py-3">
                    <div className="text-3xl font-bold text-slate-100">
                      {s.preservationScore}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Preservation Score
                    </div>
                  </div>
                  {proj25 && (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-400">25yr Grade</span>
                        <span className="font-bold text-slate-200">{proj25.projectedGrade}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-400">25yr Numeric</span>
                        <span className="font-bold text-slate-200">{proj25.gradeNumeric}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-400">Value Change</span>
                        <span className={`font-bold ${proj25.valueChangePercent < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {proj25.valueChangePercent > 0 ? '+' : ''}{proj25.valueChangePercent}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Storage Recommendations Table */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Shield size={16} className="text-brand-lime" />
              Storage Options Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Storage</th>
                    <th className="text-center py-2 px-3 text-slate-400 font-medium text-xs">Protection</th>
                    <th className="text-center py-2 px-3 text-slate-400 font-medium text-xs">25yr Grade</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Annual Cost</th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {storageRecs.map((r) => (
                    <tr key={r.storageType} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-2.5 px-3 text-slate-200 font-medium">{r.label}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${r.protectionLevel}%`,
                                backgroundColor: getScoreColor(r.protectionLevel),
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{r.protectionLevel}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-200">
                        {r.gradeRetention25yr}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        {r.annualCost > 0 ? `$${r.annualCost}` : 'Free'}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-400">{r.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== MATERIALS TAB ===== */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {materials.map((mat) => (
              <div key={mat.id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">{mat.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Era: {mat.era}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-500">Paper</span>
                    <p className="text-slate-300 font-medium mt-0.5">{mat.paperType}</p>
                  </div>
                  <div className="p-2 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-500">Ink</span>
                    <p className="text-slate-300 font-medium mt-0.5">{mat.inkType}</p>
                  </div>
                  <div className="p-2 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-500">Coating</span>
                    <p className="text-slate-300 font-medium mt-0.5">{mat.coatingType || 'None'}</p>
                  </div>
                  <div className="p-2 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-500">Extras</span>
                    <p className="text-slate-300 font-medium mt-0.5">
                      {[mat.hasFoil && 'Foil', mat.hasAdhesive && 'Adhesive'].filter(Boolean).join(', ') || 'None'}
                    </p>
                  </div>
                </div>

                {/* Material Factors */}
                <div className="space-y-3">
                  {mat.factors.map((f) => (
                    <div key={f.id} className="p-3 bg-slate-700/20 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{f.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            f.degradationRate > 0.4
                              ? 'bg-red-500/10 text-red-400'
                              : f.degradationRate > 0.2
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-emerald-500/10 text-emerald-400'
                          }`}
                        >
                          {(f.degradationRate * 100).toFixed(0)}% / decade
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{f.description}</p>
                      <div className="flex gap-3 text-[10px]">
                        <span className="text-slate-500">
                          Heat: <span className={f.sensitivity.heat > 6 ? 'text-red-400 font-bold' : 'text-slate-300'}>{f.sensitivity.heat}/10</span>
                        </span>
                        <span className="text-slate-500">
                          Humidity: <span className={f.sensitivity.humidity > 6 ? 'text-red-400 font-bold' : 'text-slate-300'}>{f.sensitivity.humidity}/10</span>
                        </span>
                        <span className="text-slate-500">
                          UV: <span className={f.sensitivity.uv > 6 ? 'text-red-400 font-bold' : 'text-slate-300'}>{f.sensitivity.uv}/10</span>
                        </span>
                      </div>
                      {f.mitigationTips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {f.mitigationTips.map((t, ti) => (
                            <span key={ti} className="text-[10px] px-2 py-0.5 bg-slate-600/30 text-slate-400 rounded-full">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Degradation Factors */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Info size={16} className="text-brand-lime" />
              Universal Degradation Factors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {degradationFactors.map((df) => (
                <div key={df.id} className="p-3 bg-slate-700/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{df.name}</span>
                    <span className="text-[10px] font-bold text-brand-lime">
                      {Math.round(df.weight * 100)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{df.description}</p>
                  <span className="inline-block text-[9px] px-2 py-0.5 bg-slate-600/30 text-slate-500 rounded-full capitalize">
                    {df.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== ROI TAB ===== */}
      {activeTab === 'roi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ROI Calculator Inputs */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Calculator size={16} className="text-brand-lime" />
                Storage Upgrade ROI Calculator
              </h3>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Card Value ($)</label>
                  <input
                    type="number"
                    value={roiCardValue}
                    onChange={(e) => setRoiCardValue(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-lime/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Monthly Upgrade Cost ($)</label>
                  <input
                    type="number"
                    value={roiUpgradeCost}
                    onChange={(e) => setRoiUpgradeCost(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-lime/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Current Storage</label>
                  <select
                    value={storageType}
                    onChange={(e) => setStorageType(e.target.value as StorageType)}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-lime/50"
                  >
                    {STORAGE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ROI Results */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <div className={`text-4xl font-bold ${roiResult.roi > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {roiResult.roi > 0 ? '+' : ''}{roiResult.roi}%
                </div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">25-Year ROI</div>
                <p className="text-[10px] text-slate-500 mt-2">
                  Upgrading to optimal storage vs. current setup
                </p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <div className="text-4xl font-bold text-blue-400">
                  {roiResult.breakEvenYears < 99 ? `${roiResult.breakEvenYears}yr` : 'N/A'}
                </div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Break-Even</div>
                <p className="text-[10px] text-slate-500 mt-2">
                  Years until upgrade cost pays for itself
                </p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <div className="text-4xl font-bold text-brand-lime">
                  ${roiResult.valueSaved25yr.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Value Saved (25yr)</div>
                <p className="text-[10px] text-slate-500 mt-2">
                  Additional value retained with optimal storage
                </p>
              </div>
            </div>
          </div>

          {/* Storage Upgrade Path */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-lime" />
              Storage Upgrade Path
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {storageRecs.slice(2).map((r) => {
                const roi = calculateStorageROI(roiCardValue, r.monthlyCost || 1, {
                  ...conditions,
                  storageType: r.storageType,
                });
                return (
                  <div key={r.storageType} className="p-4 bg-slate-700/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200">{r.label}</h4>
                      <Shield size={14} className="text-brand-lime" />
                    </div>
                    <div className="text-center py-2">
                      <div className="text-2xl font-bold text-slate-100">{r.protectionLevel}%</div>
                      <div className="text-[10px] text-slate-500">Protection</div>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      {r.pros.slice(0, 2).map((p, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-slate-400">
                          <CheckCircle2 size={10} className="text-emerald-400 mt-0.5 shrink-0" />
                          {p}
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-slate-600/30 text-[10px] text-slate-500">
                      {r.annualCost > 0 ? `$${r.annualCost}/yr` : r.storageType === 'graded_case' ? '$20-150 once' : 'Free'} | 25yr grade: {r.gradeRetention25yr}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== RISKS TAB ===== */}
      {activeTab === 'risks' && (
        <div className="space-y-6">
          {/* Risk Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {risks.map((r) => (
              <div
                key={r.id}
                className={`rounded-2xl p-5 space-y-3 border ${getSeverityColor(r.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold">{r.name}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/30">
                    {r.severity}
                  </span>
                </div>
                <div className="text-xs opacity-80">
                  Probability: {Math.round(r.probability * 100)}%
                </div>
                <p className="text-[11px] opacity-70 leading-relaxed">{r.impact}</p>
                <div className="pt-2 border-t border-current/10">
                  <p className="text-[10px] font-medium opacity-80">Mitigation:</p>
                  <p className="text-[10px] opacity-60 leading-relaxed mt-0.5">{r.mitigation}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Risk Radar */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <AlertTriangle size={16} className="text-brand-lime" />
              Environmental Risk Profile
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={risks.map((r) => ({
                    name: r.name,
                    risk: Math.round(r.probability * 100),
                    severity: r.severity === 'critical' ? 100 : r.severity === 'high' ? 75 : r.severity === 'medium' ? 50 : 25,
                  }))}
                >
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                  <Radar name="Probability" dataKey="risk" stroke="#84cc16" fill="#84cc16" fillOpacity={0.2} />
                  <Radar name="Severity" dataKey="severity" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Current Setup Risk Assessment */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Shield size={16} className="text-brand-lime" />
              Your Current Setup Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Conditions</h4>
                <div className="space-y-1">
                  {[
                    { label: 'Storage', value: getStorageTypeLabel(storageType), ok: STORAGE_OPTIONS.findIndex(s => s.value === storageType) >= 3 },
                    { label: 'Temperature', value: `${temperature}°F`, ok: temperature >= 62 && temperature <= 74 },
                    { label: 'Humidity', value: `${humidity}%`, ok: humidity >= 30 && humidity <= 50 },
                    { label: 'UV Exposure', value: uvExposure, ok: uvExposure === 'none' || uvExposure === 'low' },
                    { label: 'Air Quality', value: airQuality, ok: airQuality === 'clean' },
                    { label: 'Climate Control', value: isClimateControlled ? 'Yes' : 'No', ok: isClimateControlled },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg text-xs">
                      <span className="text-slate-400">{item.label}</span>
                      <span className={`font-bold flex items-center gap-1 ${item.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {item.ok ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Mitigation Actions</h4>
                <div className="space-y-1.5">
                  {simulation.preservationScore.suggestions.length > 0 ? (
                    simulation.preservationScore.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                        {s}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-xs text-emerald-400">
                      <CheckCircle2 size={14} />
                      Excellent! Your current setup is well-optimized for preservation.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardAgingLab;
