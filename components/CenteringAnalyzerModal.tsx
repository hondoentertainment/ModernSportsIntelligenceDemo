// @ts-nocheck
import React, { useMemo, useState } from 'react';
import {
  X,
  Crosshair,
  Ruler,
  BarChart3,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Grid3X3,
  Scan,
  DollarSign,
  ArrowUpRight,
  ChevronRight,
  Activity,
  History,
} from 'lucide-react';
import {
  getMeasurements,
  getSubGradeImpact,
  getGradeEstimates,
  getHistory,
  getCenteringStats,
  CenteringMeasurement,
  SubGradeImpact,
  GradeEstimate,
  CenteringHistory,
} from '../lib/analytics/centeringAnalyzerService';

interface CenteringAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'measurements' | 'subgrade' | 'estimates' | 'history';

const CenteringAnalyzerModal: React.FC<CenteringAnalyzerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('measurements');

  const measurements = useMemo(() => getMeasurements(), []);
  const subGrades = useMemo(() => getSubGradeImpact(), []);
  const estimates = useMemo(() => getGradeEstimates(), []);
  const history = useMemo(() => getHistory(), []);
  const stats = useMemo(() => getCenteringStats(), []);

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'measurements', label: 'Measurements', icon: <Ruler size={14} />, count: measurements.length },
    { id: 'subgrade', label: 'Sub-Grade Impact', icon: <BarChart3 size={14} />, count: subGrades.length },
    { id: 'estimates', label: 'Grade Estimates', icon: <Award size={14} />, count: estimates.length },
    { id: 'history', label: 'History', icon: <History size={14} />, count: history.length },
  ];

  if (!isOpen) return null;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-sky-400';
    if (score >= 75) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-sky-400';
    if (score >= 75) return 'bg-emerald-400';
    if (score >= 60) return 'bg-amber-400';
    return 'bg-red-400';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'none': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'minor': return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
      case 'moderate': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'severe': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp size={12} className="text-emerald-400" />;
      case 'declining': return <TrendingDown size={12} className="text-red-400" />;
      default: return <Minus size={12} className="text-sky-400" />;
    }
  };

  const renderCenteringGrid = (lr: { left: number; right: number }, tb: { top: number; bottom: number }) => {
    const offsetX = ((lr.left - 50) / 50) * 40;
    const offsetY = ((tb.top - 50) / 50) * 40;
    return (
      <div className="relative w-24 h-32 bg-slate-800 border border-slate-600 rounded-md overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-px h-full bg-slate-600/50 absolute" />
          <div className="h-px w-full bg-slate-600/50 absolute" />
        </div>
        <div
          className="absolute bg-sky-400/20 border border-sky-400/50 rounded-sm"
          style={{
            width: '60%',
            height: '70%',
            left: `${20 + offsetX}%`,
            top: `${15 + offsetY}%`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Crosshair size={12} className="text-sky-400" />
          </div>
        </div>
        <div className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[7px] text-slate-500">{tb.top.toFixed(1)}</div>
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] text-slate-500">{tb.bottom.toFixed(1)}</div>
        <div className="absolute left-0.5 top-1/2 -translate-y-1/2 text-[7px] text-slate-500">{lr.left.toFixed(1)}</div>
        <div className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[7px] text-slate-500">{lr.right.toFixed(1)}</div>
      </div>
    );
  };

  const renderMeasurements = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-sky-400">{stats.totalScanned}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Cards Scanned</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className={`text-2xl font-bold ${getScoreColor(stats.avgScore)}`}>{stats.avgScore}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Avg Score</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.psa10Eligible}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">PSA 10 Eligible</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.severeCount}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Severe Issues</div>
        </div>
      </div>

      <div className="space-y-3">
        {measurements.map((m: CenteringMeasurement) => (
          <div key={m.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-sky-500/30 transition-all">
            <div className="flex items-start gap-4">
              {renderCenteringGrid(m.leftRight, m.topBottom)}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{m.player}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{m.cardDescription}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(m.overallCenteringScore)}`}>{m.overallCenteringScore}</div>
                    <div className="text-[10px] text-slate-500">centering</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-900/50 rounded-lg p-2">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">Left / Right</div>
                    <div className="text-xs font-bold text-white">{m.leftRight.ratio}</div>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className={`h-full rounded-full ${getScoreBg(100 - Math.abs(m.leftRight.left - 50) * 4)}`} style={{ width: `${100 - Math.abs(m.leftRight.left - 50) * 4}%` }} />
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">Top / Bottom</div>
                    <div className="text-xs font-bold text-white">{m.topBottom.ratio}</div>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className={`h-full rounded-full ${getScoreBg(100 - Math.abs(m.topBottom.top - 50) * 4)}`} style={{ width: `${100 - Math.abs(m.topBottom.top - 50) * 4}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(m.meetsThreshold).map(([key, passes]) => (
                    <span key={key} className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                      passes ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' : 'text-red-400 bg-red-400/10 border-red-400/30'
                    }`}>
                      {passes ? <CheckCircle2 size={8} /> : <XCircle size={8} />}
                      {key.toUpperCase().replace('PSA', 'PSA ').replace('BGS', 'BGS ').replace('SGC', 'SGC ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-[10px] text-slate-500 border-t border-slate-700/30 pt-2">
              <Scan size={10} />
              <span>Measured {formatDate(m.measuredAt)} at {formatTime(m.measuredAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSubGradeImpact = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {subGrades.filter((s: SubGradeImpact) => s.centeringImpactOnFinal === 'none').length}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">No Impact</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">
            {subGrades.filter((s: SubGradeImpact) => s.centeringImpactOnFinal === 'moderate').length}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Moderate</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-400">
            ${subGrades.reduce((s: number, sg: SubGradeImpact) => s + sg.potentialValueLoss, 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total Value Loss</div>
        </div>
      </div>

      <div className="space-y-3">
        {subGrades.map((sg: SubGradeImpact) => (
          <div key={sg.id} className={`bg-slate-800/40 border rounded-xl p-4 transition-all ${
            sg.centeringImpactOnFinal === 'severe' ? 'border-red-500/30 hover:border-red-500/50' :
            sg.centeringImpactOnFinal === 'moderate' ? 'border-amber-500/30 hover:border-amber-500/50' :
            'border-slate-700/50 hover:border-sky-500/30'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold text-sm">{sg.player}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold ${getImpactColor(sg.centeringImpactOnFinal)}`}>
                    {sg.centeringImpactOnFinal} impact
                  </span>
                  {sg.potentialValueLoss > 0 && (
                    <span className="text-xs text-red-400 font-semibold">-${sg.potentialValueLoss}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${sg.currentCenteringSubGrade >= 9 ? 'text-sky-400' : sg.currentCenteringSubGrade >= 8 ? 'text-emerald-400' : sg.currentCenteringSubGrade >= 7 ? 'text-amber-400' : 'text-red-400'}`}>
                  {sg.currentCenteringSubGrade.toFixed(1)}
                </div>
                <div className="text-[10px] text-slate-500">centering sub</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <div className="text-[10px] text-slate-500 uppercase mb-1">PSA</div>
                <div className="text-sm font-bold text-white">{sg.predictedPSAGrade}</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <div className="text-[10px] text-slate-500 uppercase mb-1">BGS Center</div>
                <div className="text-sm font-bold text-white">{sg.predictedBGSCentering.toFixed(1)}</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <div className="text-[10px] text-slate-500 uppercase mb-1">SGC</div>
                <div className="text-sm font-bold text-white">{sg.predictedSGCGrade}</div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400 leading-relaxed">{sg.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGradeEstimates = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-sky-400">{estimates.length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Estimates</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {Math.round(estimates.reduce((s: number, e: GradeEstimate) => s + e.confidence, 0) / estimates.length)}%
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Avg Confidence</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">
            ${estimates.reduce((s: number, e: GradeEstimate) => s + e.valueAtEstimatedGrade, 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total Est Value</div>
        </div>
      </div>

      <div className="space-y-3">
        {estimates.map((est: GradeEstimate) => (
          <div key={est.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-sky-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold text-sm">{est.player}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{est.cardDescription}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-lg font-bold text-sky-400">{est.confidence}%</div>
                  <div className="text-[10px] text-slate-500">confidence</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-sky-500/5 border border-sky-500/20 rounded-lg p-3 text-center">
                <div className="text-[10px] text-sky-400 font-semibold uppercase mb-1">PSA</div>
                <div className="text-xl font-bold text-white">{est.estimatedPSA}</div>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-center">
                <div className="text-[10px] text-blue-400 font-semibold uppercase mb-1">BGS</div>
                <div className="text-xl font-bold text-white">{est.estimatedBGS.toFixed(1)}</div>
              </div>
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3 text-center">
                <div className="text-[10px] text-indigo-400 font-semibold uppercase mb-1">SGC</div>
                <div className="text-xl font-bold text-white">{est.estimatedSGC}</div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
              <div className="text-[10px] text-slate-500 uppercase mb-2">BGS Sub-Grades Prediction</div>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(est.estimatedBGSSubgrades).map(([key, val]) => (
                  <div key={key} className="text-center">
                    <div className={`text-sm font-bold ${val >= 9.5 ? 'text-sky-400' : val >= 9 ? 'text-emerald-400' : val >= 8 ? 'text-amber-400' : 'text-red-400'}`}>
                      {val.toFixed(1)}
                    </div>
                    <div className="text-[8px] text-slate-500 uppercase capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-[10px] text-slate-500">At Grade</div>
                  <div className="text-sm font-bold text-white">${est.valueAtEstimatedGrade.toLocaleString()}</div>
                </div>
                {est.gradePremium > 0 && (
                  <>
                    <ChevronRight size={14} className="text-slate-600" />
                    <div>
                      <div className="text-[10px] text-slate-500">Next Grade Up</div>
                      <div className="text-sm font-bold text-emerald-400">${est.valueAtNextGradeUp.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                      <ArrowUpRight size={12} />
                      +{est.gradePremium}%
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={14} className="text-sky-400" />
          <h3 className="text-sm font-bold text-white">Centering Measurement History</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Track how centering measurements change over multiple scans. Consistency across measurements
          increases confidence in grade predictions.
        </p>
      </div>

      <div className="space-y-4">
        {history.map((h: CenteringHistory) => (
          <div key={h.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-sky-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold text-sm">{h.player}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{h.cardDescription}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-800 border border-slate-700">
                  {getTrendIcon(h.trend)}
                  <span className={`text-[10px] font-semibold capitalize ${
                    h.trend === 'improving' ? 'text-emerald-400' : h.trend === 'declining' ? 'text-red-400' : 'text-sky-400'
                  }`}>
                    {h.trend}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getScoreColor(h.avgScore)}`}>{h.avgScore.toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500">avg score</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 uppercase mb-3">Measurement Timeline</div>
              <div className="space-y-2">
                {h.measurements.map((meas, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-20 text-[10px] text-slate-500">{formatDate(meas.date)}</div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="text-xs text-slate-300 w-14">LR: {meas.lrRatio}</div>
                      <div className="text-xs text-slate-300 w-14">TB: {meas.tbRatio}</div>
                      <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getScoreBg(meas.score)}`}
                          style={{ width: `${meas.score}%` }}
                        />
                      </div>
                      <div className={`text-xs font-bold w-8 text-right ${getScoreColor(meas.score)}`}>{meas.score}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/40">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{h.measurements.length} scans</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500">Variance:</span>
                    <span className={`text-[10px] font-bold ${
                      Math.max(...h.measurements.map(m => m.score)) - Math.min(...h.measurements.map(m => m.score)) <= 3
                        ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {(Math.max(...h.measurements.map(m => m.score)) - Math.min(...h.measurements.map(m => m.score))).toFixed(1)} pts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/30">
              <Crosshair size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  <Target size={10} />
                  Precision Tool
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-wide text-white">
                Centering <span className="text-sky-400">Analyzer</span>
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-4 border-b border-slate-700/50">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-sky-400 border-sky-400 bg-sky-400/5'
                    : 'text-slate-400 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? 'bg-sky-400/20 text-sky-400' : 'bg-slate-700 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {activeTab === 'measurements' && renderMeasurements()}
          {activeTab === 'subgrade' && renderSubGradeImpact()}
          {activeTab === 'estimates' && renderGradeEstimates()}
          {activeTab === 'history' && renderHistory()}
        </div>
      </div>
    </div>
  );
};

export default CenteringAnalyzerModal;
