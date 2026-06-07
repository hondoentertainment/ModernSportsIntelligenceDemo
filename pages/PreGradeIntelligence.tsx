import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import BetaFeatureBanner from '../components/BetaFeatureBanner';
import {
  ScanLine,
  Camera,
  Upload,
  Image as ImageIcon,
  BarChart3,
  DollarSign,
  TrendingUp,
  Shield,
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Building2,
  History,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  predictGrade,
  calculateGradingROI,
  getRecentPredictions,
  getPredictionAccuracy,
  getGradingServices,
  getBestGradingService,
  type GradePrediction,
  type GradingROI,
  type GradingServiceCost,
} from '../lib/core/preGradeIntelligenceService';

// ---- Color Helpers ----

function gradeColor(grade: string): string {
  if (grade.includes('10')) return 'text-emerald-400';
  if (grade.includes('9.5')) return 'text-cyan-400';
  if (grade.includes('9')) return 'text-blue-400';
  if (grade.includes('8')) return 'text-amber-400';
  return 'text-red-400';
}

function subgradeBarColor(score: number): string {
  if (score >= 9.5) return 'bg-emerald-500';
  if (score >= 9.0) return 'bg-blue-500';
  if (score >= 8.5) return 'bg-cyan-500';
  if (score >= 8.0) return 'bg-amber-500';
  return 'bg-red-500';
}

function subgradeTextColor(score: number): string {
  if (score >= 9.5) return 'text-emerald-400';
  if (score >= 9.0) return 'text-blue-400';
  if (score >= 8.5) return 'text-cyan-400';
  if (score >= 8.0) return 'text-amber-400';
  return 'text-red-400';
}

const companyColors: Record<string, { text: string; bg: string; border: string; bar: string }> = {
  PSA: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', bar: '#f87171' },
  BGS: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', bar: '#60a5fa' },
  SGC: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bar: '#fbbf24' },
  CGC: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', bar: '#c084fc' },
};

const severityConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  none: { icon: <CheckCircle2 size={14} />, color: 'text-emerald-400' },
  minor: { icon: <AlertTriangle size={14} />, color: 'text-amber-400' },
  moderate: { icon: <AlertTriangle size={14} />, color: 'text-orange-400' },
  major: { icon: <XCircle size={14} />, color: 'text-red-400' },
};

const verdictConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  GRADE: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'GRADE' },
  DONT_GRADE: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', label: "DON'T GRADE" },
  CONSIDER: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'CONSIDER' },
};

// ---- Main Page Component ----

const PreGradeIntelligence: React.FC = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [backPreviewUrl, setBackPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [prediction, setPrediction] = useState<GradePrediction | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ROI calculator adjustable parameters
  const [customRawValue, setCustomRawValue] = useState<number>(0);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');

  const predictions = useMemo(() => getRecentPredictions(), []);
  const accuracy = useMemo(() => getPredictionAccuracy(), []);
  const services = useMemo(() => getGradingServices(), []);

  const roi = useMemo<GradingROI | null>(() => {
    if (!prediction) return null;
    return calculateGradingROI(prediction.cardName, prediction.year, prediction.set, prediction.distribution);
  }, [prediction]);

  const bestService = useMemo<GradingServiceCost | null>(() => {
    if (!roi) return null;
    return getBestGradingService(customRawValue || roi.rawValue, urgency);
  }, [roi, customRawValue, urgency]);

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPrediction(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleScan = useCallback(() => {
    setScanning(true);
    setTimeout(() => {
      const pred = predictGrade(previewUrl ?? '');
      setPrediction(pred);
      setScanning(false);
    }, 1800);
  }, [previewUrl]);

  const distributionData = prediction
    ? [
        { grade: 'PSA 10', probability: prediction.distribution.PSA10, fill: '#34d399' },
        { grade: 'PSA 9', probability: prediction.distribution.PSA9, fill: '#60a5fa' },
        { grade: 'PSA 8', probability: prediction.distribution.PSA8, fill: '#fbbf24' },
        { grade: 'PSA 7-', probability: prediction.distribution.PSA7orLower, fill: '#f87171' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <BetaFeatureBanner
        featureName="Visual Audit Simulation"
        dataSourceLabel="Simulated pre-grade scoring and ROI overlays"
        disclaimer="Grade probabilities are estimates — not an official grader report."
      />
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-orange-500/10">
          <ScanLine size={24} className="text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Pre-Grade Intelligence</h1>
          <p className="text-sm text-slate-400">
            AI-powered grade prediction & ROI calculator
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">{accuracy.totalPredictions.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Predictions</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{accuracy.halfGradeAccuracy}%</p>
          <p className="text-xs text-slate-500">Accuracy (0.5)</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{accuracy.oneGradeAccuracy}%</p>
          <p className="text-xs text-slate-500">Accuracy (1.0)</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{accuracy.verifiedPredictions.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Verified</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center col-span-2 md:col-span-1">
          <p className="text-2xl font-bold text-amber-400">{accuracy.averageDeviation.toFixed(2)}</p>
          <p className="text-xs text-slate-500">Avg Deviation</p>
        </div>
      </div>

      {/* Main Content: Scan + Analysis Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Scan / Upload Area */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Camera size={18} className="text-orange-400" />
            Scan Card
          </h2>

          {/* Upload Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all min-h-[300px] flex flex-col items-center justify-center ${
              dragOver
                ? 'border-orange-400 bg-orange-500/10'
                : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInput}
              className="hidden"
            />

            {previewUrl ? (
              <div className="space-y-3">
                <img
                  src={previewUrl}
                  alt="Card front"
                  className="max-h-60 mx-auto rounded-lg border border-slate-700"
                />
                <p className="text-sm text-slate-400">Click or drag to replace image</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/80 rounded-2xl inline-block">
                  <Camera size={40} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-200">Upload Card Image</p>
                  <p className="text-sm text-slate-500 mt-1">Drag and drop, click to browse, or use camera</p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-slate-400">
                    <Upload size={12} className="inline mr-1" /> Browse Files
                  </span>
                  <span className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-slate-400">
                    <Camera size={12} className="inline mr-1" /> Camera
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Back Image Upload */}
          {previewUrl && (
            <div
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) setBackPreviewUrl(URL.createObjectURL(file));
                };
                input.click();
              }}
              className="border border-dashed border-slate-700 rounded-xl p-3 text-center cursor-pointer hover:border-slate-600 transition-colors"
            >
              {backPreviewUrl ? (
                <img src={backPreviewUrl} alt="Card back" className="max-h-24 mx-auto rounded-lg" />
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <ImageIcon size={16} />
                  Add back of card (optional)
                </div>
              )}
            </div>
          )}

          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={!previewUrl || scanning}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
              previewUrl && !scanning
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            {scanning ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing Card...
              </>
            ) : (
              <>
                <ScanLine size={20} />
                Analyze & Predict Grade
              </>
            )}
          </button>
        </div>

        {/* Right: Analysis Results */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <BarChart3 size={18} className="text-orange-400" />
            Analysis Results
          </h2>

          {prediction ? (
            <div className="space-y-4">
              {/* Predicted Grade Card */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-center">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">
                  Predicted Grade
                </p>
                <p className={`text-5xl font-bebas tracking-wider ${subgradeTextColor(prediction.subgrades.overall)}`}>
                  {prediction.predictedGrade}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {Math.round(prediction.confidence * 100)}% confidence
                </p>
              </div>

              {/* Distribution Chart */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4" style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="grade" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
                    />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                      labelStyle={{ color: '#e2e8f0' }}
                      formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Probability']}
                    />
                    <Bar dataKey="probability" radius={[6, 6, 0, 0]}>
                      {distributionData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Subgrade Breakdown */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
                  Subgrade Breakdown
                </p>
                {(['centering', 'corners', 'edges', 'surface'] as const).map((key) => {
                  const sg = prediction.subgrades[key];
                  return (
                    <div key={key} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-slate-200 capitalize">{key}</span>
                        <span className={`text-lg font-bold ${subgradeTextColor(sg.score)}`}>{sg.score.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${subgradeBarColor(sg.score)}`}
                          style={{ width: `${(sg.score / 10) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5">{sg.details}</p>
                    </div>
                  );
                })}
              </div>

              {/* Condition Factors */}
              {prediction.conditionFactors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
                    Detected Issues
                  </p>
                  {prediction.conditionFactors.map((factor, idx) => {
                    const config = severityConfig[factor.severity] || severityConfig.minor;
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl"
                      >
                        <span className={`mt-0.5 ${config.color}`}>{config.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200">{factor.description}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{factor.impact}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-800/20 border border-slate-700/30 rounded-2xl">
              <ScanLine size={48} className="text-slate-700 mb-4" />
              <p className="text-slate-400 text-lg">No card analyzed yet</p>
              <p className="text-slate-600 text-sm mt-1">Upload and scan a card to see results</p>
            </div>
          )}
        </div>
      </div>

      {/* ROI Calculator */}
      {prediction && roi && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <DollarSign size={18} className="text-orange-400" />
            ROI Calculator
          </h2>

          {/* Adjustable Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block mb-2">
                Raw Card Value ($)
              </label>
              <input
                type="number"
                value={customRawValue || roi.rawValue}
                onChange={(e) => setCustomRawValue(Number(e.target.value))}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block mb-2">
                Turnaround Urgency
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUrgency(u)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${
                      urgency === u
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-slate-900/50 text-slate-400 border border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block mb-2">
                Best Service Recommendation
              </label>
              {bestService && (
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${companyColors[bestService.service.company]?.text ?? 'text-white'}`}>
                    {bestService.service.company}
                  </span>
                  <span className="text-xs text-slate-500">{bestService.tier.name}</span>
                  <span className="text-xs text-slate-500">| {bestService.turnaroundDays}d</span>
                </div>
              )}
            </div>
          </div>

          {/* Verdict */}
          {(() => {
            const v = verdictConfig[roi.recommendation.verdict] || verdictConfig.CONSIDER;
            return (
              <div className={`${v.bg} border ${v.border} rounded-2xl p-6`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
                      Recommendation
                    </p>
                    <p className={`text-4xl font-bebas tracking-wider ${v.text}`}>{v.label}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${roi.recommendation.expectedProfit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${roi.recommendation.expectedProfit > 0 ? '+' : ''}{roi.recommendation.expectedProfit.toFixed(0)}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">Expected Profit</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{roi.recommendation.reasoning}</p>
              </div>
            );
          })()}

          {/* Grade-by-Grade Table */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left p-3 text-slate-500 font-medium">Grade</th>
                  <th className="text-right p-3 text-slate-500 font-medium">Probability</th>
                  <th className="text-right p-3 text-slate-500 font-medium">Market Value</th>
                  <th className="text-right p-3 text-slate-500 font-medium">Weighted Value</th>
                </tr>
              </thead>
              <tbody>
                {roi.gradeValues.map((gv) => (
                  <tr key={gv.grade} className="border-b border-slate-800/50">
                    <td className="p-3 font-semibold text-slate-200">{gv.grade}</td>
                    <td className="p-3 text-right text-slate-400">{(gv.probability * 100).toFixed(1)}%</td>
                    <td className="p-3 text-right text-slate-300">${gv.marketValue.toLocaleString()}</td>
                    <td className="p-3 text-right text-emerald-400 font-medium">${gv.weightedValue.toFixed(0)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-800/50">
                  <td className="p-3 font-bold text-white" colSpan={3}>Expected Graded Value</td>
                  <td className="p-3 text-right font-bold text-emerald-400">${roi.expectedValue.toFixed(0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cost Comparison */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
              Grading Cost Comparison
            </p>
            {roi.gradingCosts.slice(0, 8).map((gc, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  gc.service.company === roi.bestService
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-800/30 border-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${companyColors[gc.service.company]?.text ?? 'text-white'}`}>
                    {gc.service.company}
                  </span>
                  <span className="text-xs text-slate-500">{gc.tier.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-400">${gc.totalCost} cost</span>
                  <span className="text-slate-400">{gc.turnaroundDays}d</span>
                  <span className={`font-bold ${gc.expectedROI > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {gc.expectedROI > 0 ? '+' : ''}{gc.expectedROI.toFixed(0)}% ROI
                  </span>
                  {gc.service.company === roi.bestService && idx === 0 && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                      BEST
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grading Service Comparison Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Building2 size={18} className="text-orange-400" />
          Grading Service Comparison
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => {
            const colors = companyColors[service.company] || companyColors.PSA;
            return (
              <div key={service.id} className={`${colors.bg} border ${colors.border} rounded-2xl p-5 space-y-3`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-2xl font-bebas tracking-wider ${colors.text}`}>{service.company}</h4>
                    <p className="text-[10px] text-slate-500">{service.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Shield size={14} className={colors.text} />
                      <span className="text-sm font-bold text-white">{service.reputationScore}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Score</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {service.specialties.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-800/50 border border-slate-700/50 rounded-full text-[10px] text-slate-400">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="bg-slate-900/30 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-700/30">
                        <th className="text-left p-2 text-slate-500">Tier</th>
                        <th className="text-right p-2 text-slate-500">Cost</th>
                        <th className="text-right p-2 text-slate-500">Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {service.tiers.map((tier) => (
                        <tr key={tier.name} className="border-b border-slate-800/30">
                          <td className="p-2 text-slate-200">{tier.name}</td>
                          <td className={`p-2 text-right font-bold ${colors.text}`}>${tier.cost}</td>
                          <td className="p-2 text-right text-slate-400">{tier.turnaroundDays}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-slate-400">
                  <TrendingUp size={12} className={`inline mr-1 ${colors.text}`} />
                  Market premium: <strong className="text-white">{((service.marketPremium - 1) * 100).toFixed(0)}%</strong> above raw
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prediction History & Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* History */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <History size={18} className="text-orange-400" />
            Prediction History
          </h2>
          <div className="space-y-2">
            {predictions.map((pred) => (
              <div key={pred.id} className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-200 truncate flex-1 mr-3">{pred.cardName}</p>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {new Date(pred.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <div>
                    <span className="text-slate-500">Predicted: </span>
                    <span className={`font-bold ${gradeColor(pred.predictedGrade)}`}>{pred.predictedGrade}</span>
                  </div>
                  {pred.verified && pred.actualGrade && (
                    <>
                      <span className="text-slate-700">|</span>
                      <div>
                        <span className="text-slate-500">Actual: </span>
                        <span className={`font-bold ${gradeColor(pred.actualGrade)}`}>{pred.actualGrade}</span>
                      </div>
                      <span className="text-slate-700">|</span>
                      {pred.predictedGrade === pred.actualGrade ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 size={12} /> Match
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-400">
                          <AlertTriangle size={12} /> Off
                        </span>
                      )}
                    </>
                  )}
                  {!pred.verified && (
                    <>
                      <span className="text-slate-700">|</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock size={12} /> Pending
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accuracy Dashboard */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Target size={18} className="text-orange-400" />
            Accuracy Dashboard
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">{accuracy.halfGradeAccuracy}%</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Within 0.5 Grade</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-cyan-400">{accuracy.oneGradeAccuracy}%</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Within 1 Grade</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">{accuracy.exactAccuracy}%</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Exact Match</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-orange-400">{accuracy.verifiedPredictions.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Verified</p>
            </div>
          </div>

          {/* Accuracy by Grade */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
              Accuracy by Grade Level
            </p>
            {accuracy.byGrade.map((bg) => (
              <div key={bg.grade} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <span className={`text-sm font-bold w-14 ${gradeColor(bg.grade)}`}>{bg.grade}</span>
                <div className="flex-1">
                  <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${bg.accuracy}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-white w-10 text-right">{bg.accuracy}%</span>
                <span className="text-xs text-slate-500 w-16 text-right">{bg.predictions} cards</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreGradeIntelligence;
