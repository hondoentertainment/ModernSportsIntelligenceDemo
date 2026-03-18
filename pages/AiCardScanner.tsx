import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Camera,
  ScanLine,
  Target,
  DollarSign,
  Award,
  BarChart3,
  Search,
  Zap,
  CheckCircle,
  AlertTriangle,
  Upload,
  Image,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  getScanResults,
  getScanHistory,
  getScannerStats,
  getSetDatabase,
  getDetectionModels,
  simulateScan,
  getGradingROIAnalysis,
  searchSets,
  getConditionLabel,
  getConfidenceColor,
  formatCurrency,
  type ScanResult,
  type ScanHistory as ScanHistoryType,
  type ScannerStats,
  type SetDatabase,
  type DetectionModel,
} from '../lib/utils/aiCardScannerService';

// ---- Condition Bar Component ----

const ConditionBar: React.FC<{ label: string; score: number; description: string }> = ({
  label,
  score,
  description,
}) => {
  const barColor =
    score >= 90 ? 'bg-emerald-500' : score >= 80 ? 'bg-yellow-500' : score >= 70 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-mono text-slate-300">{score}/100</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-[10px] text-slate-500">{description}</p>
    </div>
  );
};

// ---- Stat Card Component ----

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub?: string }> = ({
  icon,
  label,
  value,
  sub,
}) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
    <div className="flex justify-center mb-2">{icon}</div>
    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-2xl font-bold text-slate-100">{value}</p>
    {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
  </div>
);

// ---- Main Component ----

const AiCardScanner: React.FC = () => {
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanHistoryType[]>([]);
  const [stats, setStats] = useState<ScannerStats | null>(null);
  const [setDatabase, setSetDatabase] = useState<SetDatabase[]>([]);
  const [detectionModels, setDetectionModels] = useState<DetectionModel[]>([]);
  const [activeScan, setActiveScan] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [setSearchQuery, setSetSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setScanResults(getScanResults());
      setScanHistory(getScanHistory());
      setStats(getScannerStats());
      setSetDatabase(getSetDatabase());
      setDetectionModels(getDetectionModels());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const gradingROI = useMemo(() => getGradingROIAnalysis(), []);

  const filteredSets = useMemo(() => searchSets(setSearchQuery), [setSearchQuery]);

  const conditionRadarData = useMemo(() => {
    if (!activeScan?.conditionAssessment) return [];
    const ca = activeScan.conditionAssessment;
    return [
      { attribute: 'Centering', score: ca.centering.score },
      { attribute: 'Corners', score: ca.corners.score },
      { attribute: 'Edges', score: ca.edges.score },
      { attribute: 'Surface', score: ca.surface.score },
    ];
  }, [activeScan]);

  const handleScan = useCallback(() => {
    setIsScanning(true);
    setActiveScan(null);

    // Simulate scanning delay
    setTimeout(() => {
      const result = simulateScan();
      setActiveScan(result);
      setScanResults((prev) => [result, ...prev]);
      if (result.identifiedCard && result.valuation) {
        setScanHistory((prev) => [
          {
            id: result.id,
            imageUrl: result.imageUrl,
            player: result.identifiedCard!.player,
            set: `${result.identifiedCard!.year} ${result.identifiedCard!.manufacturer} ${result.identifiedCard!.set}`,
            grade: result.conditionAssessment?.predictedGrade.psa ?? 'N/A',
            value: result.valuation!.fairMarketValue,
            timestamp: result.timestamp,
            matchScore: result.matchScore,
          },
          ...prev,
        ]);
      }
      setIsScanning(false);
    }, 2000);
  }, []);

  const handleHistoryClick = useCallback(
    (historyItem: ScanHistoryType) => {
      const result = scanResults.find((s) => s.id === historyItem.id);
      if (result) setActiveScan(result);
    },
    [scanResults],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading AI Card Scanner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20">
            <ScanLine size={24} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">AI Card Scanner &amp; Instant Valuation</h1>
            <p className="text-sm text-slate-400">
              Scan cards for AI-powered identification, condition grading &amp; real-time valuation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-brand-lime" />
          <span className="text-[10px] text-slate-500">
            {detectionModels.length} AI models active
          </span>
        </div>
      </div>

      {/* Scanner Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Camera size={18} className="text-violet-400" />}
          label="Total Scans"
          value={String(stats?.totalScans ?? 0)}
          sub="cards analyzed"
        />
        <StatCard
          icon={<Target size={18} className="text-emerald-400" />}
          label="Accuracy Rate"
          value={`${stats?.accuracyRate ?? 0}%`}
          sub="identification accuracy"
        />
        <StatCard
          icon={<Zap size={18} className="text-amber-400" />}
          label="Avg Scan Time"
          value={`${stats?.avgScanTime ?? 0}s`}
          sub="per card analysis"
        />
        <StatCard
          icon={<DollarSign size={18} className="text-brand-lime" />}
          label="Estimated Savings"
          value={formatCurrency(stats?.estimatedSavings ?? 0)}
          sub="avoided bad grading submissions"
        />
      </div>

      {/* Scan Upload Zone + Active Scan Result */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Upload size={18} className="text-violet-400" />
            Scan Card
          </h2>
          <button
            onClick={handleScan}
            disabled={isScanning}
            className={`w-full aspect-[3/4] rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 ${
              isScanning
                ? 'border-violet-500/50 bg-violet-500/10 cursor-wait'
                : 'border-slate-600 bg-slate-800/50 hover:border-brand-lime/50 hover:bg-slate-800 cursor-pointer'
            }`}
          >
            {isScanning ? (
              <>
                <div className="w-16 h-16 border-2 border-slate-600 border-t-violet-400 rounded-full animate-spin" />
                <p className="text-sm text-violet-400 font-medium">Scanning...</p>
                <p className="text-[10px] text-slate-500">AI analyzing card image</p>
              </>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-slate-700/50">
                  <Camera size={32} className="text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-300">Click to Scan a Card</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Drag &amp; drop or click to simulate AI scan
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-lime/10">
                  <Image size={12} className="text-brand-lime" />
                  <span className="text-[10px] text-brand-lime font-medium">JPG, PNG, HEIC supported</span>
                </div>
              </>
            )}
          </button>
        </div>

        {/* Active Scan Result */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Target size={18} className="text-emerald-400" />
            Scan Result
          </h2>

          {activeScan && activeScan.identifiedCard ? (
            <div className="space-y-4">
              {/* Identified Card Header */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">
                      {activeScan.identifiedCard.player}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {activeScan.identifiedCard.year} {activeScan.identifiedCard.manufacturer}{' '}
                      {activeScan.identifiedCard.set} #{activeScan.identifiedCard.cardNumber}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {activeScan.identifiedCard.parallel && (
                        <span className="text-[10px] px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-full">
                          {activeScan.identifiedCard.parallel}
                        </span>
                      )}
                      {activeScan.identifiedCard.isAutographed && (
                        <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full">
                          Autographed
                        </span>
                      )}
                      {activeScan.identifiedCard.isNumbered && (
                        <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full">
                          /{activeScan.identifiedCard.printRun}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getConfidenceColor(activeScan.confidence) }}
                      />
                      <span className="text-xs text-slate-400">
                        Match: {activeScan.matchScore}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alternatives */}
                {activeScan.alternatives.length > 0 && (
                  <div className="border-t border-slate-700/50 pt-3 mt-3">
                    <p className="text-[10px] text-slate-500 mb-2">Possible alternatives:</p>
                    <div className="flex flex-wrap gap-2">
                      {activeScan.alternatives.map((alt, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-1 bg-slate-700/50 text-slate-400 rounded"
                        >
                          {alt.player} - {alt.set} ({alt.similarity}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Condition Assessment + Radar */}
              {activeScan.conditionAssessment && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <Award size={14} className="text-amber-400" />
                        Condition Assessment
                      </h4>
                      <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full">
                        {getConditionLabel(activeScan.conditionAssessment.overall)}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <ConditionBar
                        label="Centering"
                        score={activeScan.conditionAssessment.centering.score}
                        description={`L/R: ${activeScan.conditionAssessment.centering.leftRight} | T/B: ${activeScan.conditionAssessment.centering.topBottom}`}
                      />
                      <ConditionBar
                        label="Corners"
                        score={activeScan.conditionAssessment.corners.score}
                        description={activeScan.conditionAssessment.corners.description}
                      />
                      <ConditionBar
                        label="Edges"
                        score={activeScan.conditionAssessment.edges.score}
                        description={activeScan.conditionAssessment.edges.description}
                      />
                      <ConditionBar
                        label="Surface"
                        score={activeScan.conditionAssessment.surface.score}
                        description={activeScan.conditionAssessment.surface.description}
                      />
                    </div>
                    {/* Predicted Grades */}
                    <div className="border-t border-slate-700/50 pt-3 mt-4">
                      <p className="text-[10px] text-slate-500 mb-2">Predicted Grades</p>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-brand-lime">
                            {activeScan.conditionAssessment.predictedGrade.psa}
                          </p>
                          <p className="text-[10px] text-slate-500">PSA</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-cyan-400">
                            {activeScan.conditionAssessment.predictedGrade.bgs}
                          </p>
                          <p className="text-[10px] text-slate-500">BGS</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-400">
                            {activeScan.conditionAssessment.predictedGrade.sgc}
                          </p>
                          <p className="text-[10px] text-slate-500">SGC</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-xs text-slate-400">
                            Confidence: {activeScan.conditionAssessment.gradeConfidence}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Radar Chart */}
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                      <BarChart3 size={14} className="text-cyan-400" />
                      Condition Radar
                    </h4>
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart data={conditionRadarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="attribute" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={{ fill: '#64748b', fontSize: 9 }}
                        />
                        <Radar
                          name="Condition"
                          dataKey="score"
                          stroke="#a3e635"
                          fill="#a3e635"
                          fillOpacity={0.2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Valuation */}
              {activeScan.valuation && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-400" />
                    Valuation &amp; Grading ROI
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Raw Value</p>
                      <p className="text-xl font-bold text-slate-100">
                        {formatCurrency(activeScan.valuation.rawValue)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Fair Market</p>
                      <p className="text-xl font-bold text-emerald-400">
                        {formatCurrency(activeScan.valuation.fairMarketValue)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Range</p>
                      <p className="text-sm font-bold text-slate-300">
                        {formatCurrency(activeScan.valuation.low)} &ndash;{' '}
                        {formatCurrency(activeScan.valuation.high)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Recent Comps</p>
                      <p className="text-xl font-bold text-cyan-400">
                        {activeScan.valuation.recentComps}
                      </p>
                    </div>
                  </div>

                  {/* Graded Values */}
                  <div className="border-t border-slate-700/50 pt-3 mb-4">
                    <p className="text-xs text-slate-400 mb-2">Graded Value Estimates</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {activeScan.valuation.gradedValues.map((gv) => (
                        <div key={gv.grade} className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                          <p className="text-[10px] text-slate-500">{gv.grade}</p>
                          <p className="text-sm font-bold text-slate-100">{formatCurrency(gv.value)}</p>
                          <p
                            className={`text-[10px] font-medium ${
                              gv.roi >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {gv.roi >= 0 ? '+' : ''}
                            {gv.roi.toFixed(1)}% ROI
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grading Recommendation */}
                  <div
                    className={`rounded-lg p-4 border ${
                      activeScan.valuation.gradingRecommendation.recommended
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {activeScan.valuation.gradingRecommendation.recommended ? (
                        <CheckCircle size={16} className="text-emerald-400" />
                      ) : (
                        <AlertTriangle size={16} className="text-red-400" />
                      )}
                      <p
                        className={`text-sm font-bold ${
                          activeScan.valuation.gradingRecommendation.recommended
                            ? 'text-emerald-300'
                            : 'text-red-300'
                        }`}
                      >
                        {activeScan.valuation.gradingRecommendation.recommended
                          ? 'Grading Recommended'
                          : 'Grading Not Recommended'}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      {activeScan.valuation.gradingRecommendation.reasoning}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                      <span>
                        Est. Grade: {activeScan.valuation.gradingRecommendation.estimatedGrade}
                      </span>
                      <span>
                        Graded Value:{' '}
                        {formatCurrency(activeScan.valuation.gradingRecommendation.gradedValue)}
                      </span>
                      <span>
                        Cost: {formatCurrency(activeScan.valuation.gradingRecommendation.gradingCost)}
                      </span>
                      <span>
                        ROI: {activeScan.valuation.gradingRecommendation.expectedROI.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
              <ScanLine size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">
                {isScanning ? 'Analyzing card...' : 'Scan a card to see AI-powered analysis'}
              </p>
              <p className="text-slate-600 text-[10px] mt-1">
                Identification, condition assessment &amp; instant valuation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scan History */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <ScanLine size={18} className="text-violet-400" />
          Scan History
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scanHistory.slice(0, 12).map((item) => (
            <button
              key={item.id}
              onClick={() => handleHistoryClick(item)}
              className={`text-left p-4 rounded-xl border transition-all ${
                activeScan?.id === item.id
                  ? 'bg-slate-800 border-brand-lime/50 shadow-lg shadow-brand-lime/5'
                  : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-white truncate">{item.player}</p>
                <span className="text-sm font-bold text-emerald-400">{formatCurrency(item.value)}</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">{item.set}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-slate-500">PSA {item.grade}</span>
                <span
                  className={`text-[10px] font-medium ${
                    item.matchScore >= 90
                      ? 'text-emerald-400'
                      : item.matchScore >= 75
                        ? 'text-amber-400'
                        : 'text-red-400'
                  }`}
                >
                  {item.matchScore}% match
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Grading ROI Table + Scans by Sport Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grading ROI Analysis */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-brand-lime" />
            Grading ROI Analysis
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-2 text-slate-500 font-medium">Grade</th>
                  <th className="text-right py-2 text-slate-500 font-medium">Avg ROI</th>
                  <th className="text-right py-2 text-slate-500 font-medium">Break-Even Rate</th>
                  <th className="text-right py-2 text-slate-500 font-medium">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {gradingROI.map((row) => (
                  <tr key={row.grade} className="border-b border-slate-700/30">
                    <td className="py-2 text-slate-300 font-medium">{row.grade}</td>
                    <td
                      className={`py-2 text-right font-mono ${
                        row.avgROI >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {row.avgROI >= 0 ? '+' : ''}
                      {row.avgROI.toFixed(1)}%
                    </td>
                    <td className="py-2 text-right text-slate-400">{row.breakEvenRate}%</td>
                    <td className="py-2 text-right">
                      {row.avgROI >= 100 ? (
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                          Strong
                        </span>
                      ) : row.avgROI >= 0 ? (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded">
                          Moderate
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-300 rounded">
                          Avoid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scans by Sport Bar Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-cyan-400" />
            Scans by Sport
          </h3>
          {stats && stats.scansByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.scansByCategory}>
                <XAxis dataKey="sport" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="count" fill="#a3e635" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No scan data available</p>
          )}
        </div>
      </div>

      {/* Set Database Search */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Search size={14} className="text-violet-400" />
            Set Database
          </h3>
          <span className="text-[10px] text-slate-500">{filteredSets.length} sets</span>
        </div>
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search sets, manufacturers, players..."
            value={setSearchQuery}
            onChange={(e) => setSetSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-lime/50"
          />
        </div>
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-800">
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-2 text-slate-500 font-medium">Year</th>
                <th className="text-left py-2 text-slate-500 font-medium">Manufacturer</th>
                <th className="text-left py-2 text-slate-500 font-medium">Set Name</th>
                <th className="text-left py-2 text-slate-500 font-medium">Sport</th>
                <th className="text-right py-2 text-slate-500 font-medium">Cards</th>
                <th className="text-left py-2 text-slate-500 font-medium">Notable Cards</th>
              </tr>
            </thead>
            <tbody>
              {filteredSets.slice(0, 25).map((s, i) => (
                <tr key={`${s.manufacturer}-${s.year}-${s.setName}-${i}`} className="border-b border-slate-700/30">
                  <td className="py-2 text-slate-400">{s.year}</td>
                  <td className="py-2 text-slate-300">{s.manufacturer}</td>
                  <td className="py-2 text-slate-200 font-medium">{s.setName}</td>
                  <td className="py-2">
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded">
                      {s.sport}
                    </span>
                  </td>
                  <td className="py-2 text-right text-slate-400">{s.totalCards}</td>
                  <td className="py-2 text-slate-500 truncate max-w-[200px]">
                    {s.notableCards.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detection Models */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <Zap size={18} className="text-amber-400" />
          AI Detection Models
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {detectionModels.map((model) => (
            <div
              key={model.name}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-slate-200">{model.name}</p>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded font-mono">
                  v{model.version}
                </span>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>Accuracy</span>
                  <span className="font-mono text-emerald-400">{model.accuracy}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${model.accuracy}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {model.supported.map((s) => (
                  <span
                    key={s}
                    className="text-[9px] px-1.5 py-0.5 bg-slate-900/50 text-slate-500 rounded"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-[9px] text-slate-600 mt-2">Updated: {model.lastUpdated}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AiCardScanner;
