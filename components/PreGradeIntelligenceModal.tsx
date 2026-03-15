import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  X,
  ScanLine,
  Camera,
  Upload,
  Image as ImageIcon,
  BarChart3,
  DollarSign,
  History,
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Clock,
  Shield,
  ChevronDown,
  ArrowRight,
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
  type GradePrediction,
  type GradingROI,
} from '../lib/preGradeIntelligenceService';

interface PreGradeIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'scan' | 'analysis' | 'roi' | 'history' | 'services';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'scan', label: 'Scan', icon: <Camera size={16} /> },
  { id: 'analysis', label: 'Analysis', icon: <BarChart3 size={16} /> },
  { id: 'roi', label: 'ROI', icon: <DollarSign size={16} /> },
  { id: 'history', label: 'History', icon: <History size={16} /> },
  { id: 'services', label: 'Services', icon: <Building2 size={16} /> },
];

// ---- Scan Tab ----

const ScanTab: React.FC<{
  onScanComplete: (_prediction: GradePrediction) => void;
}> = ({ onScanComplete }) => {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [backPreviewUrl, setBackPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [activeUpload, setActiveUpload] = useState<'front' | 'back'>('front');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      if (activeUpload === 'front') {
        setPreviewUrl(url);
      } else {
        setBackPreviewUrl(url);
      }
    },
    [activeUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
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
    // Simulate AI processing
    setTimeout(() => {
      const prediction = predictGrade(previewUrl ?? '');
      setScanning(false);
      onScanComplete(prediction);
    }, 1500);
  }, [previewUrl, onScanComplete]);

  return (
    <div className="space-y-6">
      {/* Upload Area Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveUpload('front')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeUpload === 'front'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-slate-300'
          }`}
        >
          Front of Card
        </button>
        <button
          onClick={() => setActiveUpload('back')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeUpload === 'back'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-slate-300'
          }`}
        >
          Back of Card
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
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

        {(activeUpload === 'front' ? previewUrl : backPreviewUrl) ? (
          <div className="space-y-4">
            <img
              src={(activeUpload === 'front' ? previewUrl : backPreviewUrl) ?? ''}
              alt={`Card ${activeUpload}`}
              className="max-h-64 mx-auto rounded-lg border border-slate-700"
            />
            <p className="text-sm text-slate-400">
              Click or drag to replace {activeUpload} image
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-8">
            <div className="flex justify-center">
              <div className="p-4 bg-slate-800/80 rounded-2xl">
                {activeUpload === 'front' ? (
                  <Camera size={40} className="text-orange-400" />
                ) : (
                  <ImageIcon size={40} className="text-orange-400" />
                )}
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-200">
                Upload {activeUpload === 'front' ? 'Front' : 'Back'} of Card
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Drag and drop an image, click to browse, or use your camera
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-slate-400">
                <Upload size={12} className="inline mr-1" />
                Browse
              </span>
              <span className="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-slate-400">
                <Camera size={12} className="inline mr-1" />
                Camera
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Preview Thumbnails */}
      {(previewUrl || backPreviewUrl) && (
        <div className="flex gap-3">
          <div
            onClick={() => setActiveUpload('front')}
            className={`flex-1 p-2 rounded-xl border cursor-pointer transition-colors ${
              activeUpload === 'front' ? 'border-orange-500/50 bg-orange-500/5' : 'border-slate-700/50 bg-slate-800/30'
            }`}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Front" className="h-20 mx-auto rounded-lg object-contain" />
            ) : (
              <div className="h-20 flex items-center justify-center text-slate-600 text-xs">No front image</div>
            )}
            <p className="text-[10px] text-center text-slate-500 mt-1 uppercase tracking-wider">Front</p>
          </div>
          <div
            onClick={() => setActiveUpload('back')}
            className={`flex-1 p-2 rounded-xl border cursor-pointer transition-colors ${
              activeUpload === 'back' ? 'border-orange-500/50 bg-orange-500/5' : 'border-slate-700/50 bg-slate-800/30'
            }`}
          >
            {backPreviewUrl ? (
              <img src={backPreviewUrl} alt="Back" className="h-20 mx-auto rounded-lg object-contain" />
            ) : (
              <div className="h-20 flex items-center justify-center text-slate-600 text-xs">No back image</div>
            )}
            <p className="text-[10px] text-center text-slate-500 mt-1 uppercase tracking-wider">Back</p>
          </div>
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
  );
};

// ---- Analysis Tab ----

const AnalysisTab: React.FC<{
  prediction: GradePrediction | null;
}> = ({ prediction }) => {
  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ScanLine size={48} className="text-slate-700 mb-4" />
        <p className="text-slate-400 text-lg">No card scanned yet</p>
        <p className="text-slate-600 text-sm mt-1">Scan a card in the Scan tab to see analysis</p>
      </div>
    );
  }

  const distributionData = [
    { grade: 'PSA 10', probability: prediction.distribution.PSA10, fill: '#34d399' },
    { grade: 'PSA 9', probability: prediction.distribution.PSA9, fill: '#60a5fa' },
    { grade: 'PSA 8', probability: prediction.distribution.PSA8, fill: '#fbbf24' },
    { grade: 'PSA 7-', probability: prediction.distribution.PSA7orLower, fill: '#f87171' },
  ];

  const subgradeColor = (score: number): string => {
    if (score >= 9.5) return 'bg-emerald-500';
    if (score >= 9.0) return 'bg-blue-500';
    if (score >= 8.5) return 'bg-cyan-500';
    if (score >= 8.0) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const subgradeTextColor = (score: number): string => {
    if (score >= 9.5) return 'text-emerald-400';
    if (score >= 9.0) return 'text-blue-400';
    if (score >= 8.5) return 'text-cyan-400';
    if (score >= 8.0) return 'text-amber-400';
    return 'text-red-400';
  };

  const severityConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    none: { icon: <CheckCircle2 size={14} />, color: 'text-emerald-400' },
    minor: { icon: <AlertTriangle size={14} />, color: 'text-amber-400' },
    moderate: { icon: <AlertTriangle size={14} />, color: 'text-orange-400' },
    major: { icon: <XCircle size={14} />, color: 'text-red-400' },
  };

  return (
    <div className="space-y-6">
      {/* Predicted Grade */}
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

      {/* Grade Distribution Chart */}
      <div>
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 px-1">
          Grade Probability Distribution
        </p>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="grade" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
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
      </div>

      {/* Subgrade Breakdown */}
      <div>
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 px-1">
          Subgrade Breakdown (BGS-style)
        </p>
        <div className="space-y-3">
          {(['centering', 'corners', 'edges', 'surface'] as const).map((key) => {
            const sg = prediction.subgrades[key];
            return (
              <div key={key} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold text-slate-200 capitalize">{key}</span>
                    <span className="text-xs text-slate-500 ml-2">{sg.label}</span>
                  </div>
                  <span className={`text-xl font-bold ${subgradeTextColor(sg.score)}`}>
                    {sg.score.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${subgradeColor(sg.score)}`}
                    style={{ width: `${(sg.score / 10) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">{sg.details}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Condition Factors */}
      {prediction.conditionFactors.length > 0 && (
        <div>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 px-1">
            Detected Issues
          </p>
          <div className="space-y-2">
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
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 capitalize">{factor.area}</span>
                      {factor.location && (
                        <>
                          <span className="text-slate-700">|</span>
                          <span className="text-xs text-slate-500">{factor.location}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{factor.impact}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ---- ROI Tab ----

const ROITab: React.FC<{
  prediction: GradePrediction | null;
}> = ({ prediction }) => {
  const roi = useMemo<GradingROI | null>(() => {
    if (!prediction) return null;
    return calculateGradingROI(
      prediction.cardName,
      prediction.year,
      prediction.set,
      prediction.distribution
    );
  }, [prediction]);

  if (!prediction || !roi) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <DollarSign size={48} className="text-slate-700 mb-4" />
        <p className="text-slate-400 text-lg">No card analyzed yet</p>
        <p className="text-slate-600 text-sm mt-1">Scan a card first to calculate ROI</p>
      </div>
    );
  }

  const verdictConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
    GRADE: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'GRADE' },
    DONT_GRADE: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', label: "DON'T GRADE" },
    CONSIDER: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'CONSIDER' },
  };

  const verdict = verdictConfig[roi.recommendation.verdict] || verdictConfig.CONSIDER;

  return (
    <div className="space-y-6">
      {/* Verdict */}
      <div className={`${verdict.bg} border ${verdict.border} rounded-2xl p-6 text-center`}>
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">
          Recommendation
        </p>
        <p className={`text-4xl font-bebas tracking-wider ${verdict.text}`}>
          {verdict.label}
        </p>
        <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">{roi.recommendation.reasoning}</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="text-center">
            <p className={`text-lg font-bold ${roi.recommendation.expectedProfit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${roi.recommendation.expectedProfit > 0 ? '+' : ''}{roi.recommendation.expectedProfit.toFixed(0)}
            </p>
            <p className="text-[10px] text-slate-500 uppercase">Expected Profit</p>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div className="text-center">
            <p className="text-lg font-bold text-orange-400">{roi.bestService}</p>
            <p className="text-[10px] text-slate-500 uppercase">Best Service</p>
          </div>
        </div>
      </div>

      {/* Grade-by-Grade Value Table */}
      <div>
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 px-1">
          Grade-by-Grade Value Analysis
        </p>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-3 text-slate-500 font-medium">Grade</th>
                <th className="text-right p-3 text-slate-500 font-medium">Probability</th>
                <th className="text-right p-3 text-slate-500 font-medium">Market Value</th>
                <th className="text-right p-3 text-slate-500 font-medium">Weighted</th>
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
                <td className="p-3 font-bold text-white" colSpan={3}>
                  Expected Graded Value
                </td>
                <td className="p-3 text-right font-bold text-emerald-400">
                  ${roi.expectedValue.toFixed(0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 mt-2 px-1">
          <span className="text-xs text-slate-500">Raw value:</span>
          <span className="text-xs font-bold text-white">${roi.rawValue.toLocaleString()}</span>
          <ArrowRight size={12} className="text-slate-600" />
          <span className="text-xs text-slate-500">Expected graded:</span>
          <span className="text-xs font-bold text-emerald-400">${roi.expectedValue.toFixed(0)}</span>
        </div>
      </div>

      {/* Grading Cost Comparison */}
      <div>
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 px-1">
          Grading Cost Comparison
        </p>
        <div className="space-y-2">
          {roi.gradingCosts.slice(0, 6).map((gc, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                gc.service.company === roi.bestService
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-slate-800/30 border-slate-700/50'
              }`}
            >
              <div>
                <span className="text-sm font-bold text-slate-200">{gc.service.company}</span>
                <span className="text-xs text-slate-500 ml-2">{gc.tier.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-400">${gc.totalCost}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">{gc.turnaroundDays}d</span>
                <span className="text-slate-600">|</span>
                <span className={`font-bold ${gc.expectedROI > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {gc.expectedROI > 0 ? '+' : ''}{gc.expectedROI.toFixed(0)}% ROI
                </span>
                {gc.service.company === roi.bestService && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                    BEST
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alternative Actions */}
      {roi.recommendation.alternativeActions.length > 0 && (
        <div>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 px-1">
            Alternative Actions
          </p>
          <div className="space-y-1.5">
            {roi.recommendation.alternativeActions.map((action, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-sm text-slate-400"
              >
                <ChevronDown size={14} className="text-slate-600 rotate-[-90deg]" />
                {action}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---- History Tab ----

const HistoryTab: React.FC = () => {
  const predictions = useMemo(() => getRecentPredictions(), []);
  const accuracy = useMemo(() => getPredictionAccuracy(), []);

  const gradeColor = (grade: string): string => {
    if (grade.includes('10')) return 'text-emerald-400';
    if (grade.includes('9.5')) return 'text-cyan-400';
    if (grade.includes('9')) return 'text-blue-400';
    if (grade.includes('8')) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Accuracy Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">{accuracy.totalPredictions.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Predictions</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{accuracy.halfGradeAccuracy}%</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Within 0.5 Grade</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{accuracy.oneGradeAccuracy}%</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Within 1 Grade</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{accuracy.exactAccuracy}%</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Exact Match</p>
        </div>
      </div>

      {/* Accuracy by Grade */}
      <div>
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 px-1">
          Accuracy by Grade
        </p>
        <div className="space-y-2">
          {accuracy.byGrade.map((bg) => (
            <div key={bg.grade} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <span className={`text-sm font-bold w-16 ${gradeColor(bg.grade)}`}>{bg.grade}</span>
              <div className="flex-1">
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${bg.accuracy}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold text-white w-12 text-right">{bg.accuracy}%</span>
              <span className="text-xs text-slate-500 w-20 text-right">{bg.predictions} cards</span>
            </div>
          ))}
        </div>
      </div>

      {/* Prediction History */}
      <div>
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 px-1">
          Prediction History
        </p>
        <div className="space-y-2">
          {predictions.map((pred) => (
            <div
              key={pred.id}
              className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-200 truncate flex-1 mr-4">{pred.cardName}</p>
                <span className="text-xs text-slate-500">
                  {new Date(pred.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
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
                        <CheckCircle2 size={12} /> Exact match
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400">
                        <AlertTriangle size={12} /> Off by {Math.abs(
                          parseFloat(pred.predictedGrade.match(/[\d.]+/)?.[0] ?? '0') -
                          parseFloat(pred.actualGrade.match(/[\d.]+/)?.[0] ?? '0')
                        ).toFixed(1)}
                      </span>
                    )}
                  </>
                )}
                {!pred.verified && (
                  <>
                    <span className="text-slate-700">|</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock size={12} /> Awaiting verification
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---- Services Comparison Tab ----

const ServicesTab: React.FC = () => {
  const services = useMemo(() => getGradingServices(), []);

  const companyColors: Record<string, { text: string; bg: string; border: string }> = {
    PSA: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    BGS: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    SGC: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    CGC: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  };

  return (
    <div className="space-y-6">
      {/* Service Cards */}
      {services.map((service) => {
        const colors = companyColors[service.company] || companyColors.PSA;
        return (
          <div key={service.id} className={`${colors.bg} border ${colors.border} rounded-2xl p-5 space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-2xl font-bebas tracking-wider ${colors.text}`}>{service.company}</h4>
                <p className="text-xs text-slate-500">{service.name}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Shield size={14} className={colors.text} />
                  <span className="text-sm font-bold text-white">{service.reputationScore}/100</span>
                </div>
                <p className="text-[10px] text-slate-500">Reputation</p>
              </div>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1.5">
              {service.specialties.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-800/50 border border-slate-700/50 rounded-full text-[10px] text-slate-400"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Tiers Table */}
            <div className="bg-slate-900/30 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700/30">
                    <th className="text-left p-2.5 text-slate-500">Tier</th>
                    <th className="text-right p-2.5 text-slate-500">Cost</th>
                    <th className="text-right p-2.5 text-slate-500">Turnaround</th>
                    <th className="text-right p-2.5 text-slate-500">Max Value</th>
                  </tr>
                </thead>
                <tbody>
                  {service.tiers.map((tier) => (
                    <tr key={tier.name} className="border-b border-slate-800/30">
                      <td className="p-2.5 text-slate-200 font-medium">{tier.name}</td>
                      <td className={`p-2.5 text-right font-bold ${colors.text}`}>${tier.cost}</td>
                      <td className="p-2.5 text-right text-slate-400">{tier.turnaroundDays} days</td>
                      <td className="p-2.5 text-right text-slate-400">${tier.maxDeclaredValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Market Premium */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <TrendingUp size={12} className={colors.text} />
              <span>Market premium: <strong className="text-white">{((service.marketPremium - 1) * 100).toFixed(0)}%</strong> above raw value</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- Main Modal ----

const PreGradeIntelligenceModal: React.FC<PreGradeIntelligenceModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('scan');
  const [currentPrediction, setCurrentPrediction] = useState<GradePrediction | null>(null);

  const handleScanComplete = useCallback((prediction: GradePrediction) => {
    setCurrentPrediction(prediction);
    setActiveTab('analysis');
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-brand-dark border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-400">
              <ScanLine size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-widest text-white">
                Pre-Grade <span className="text-orange-400">Intelligence</span>
              </h2>
              <p className="text-xs text-slate-500">AI-powered grade prediction & ROI calculator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'scan' && <ScanTab onScanComplete={handleScanComplete} />}
          {activeTab === 'analysis' && <AnalysisTab prediction={currentPrediction} />}
          {activeTab === 'roi' && <ROITab prediction={currentPrediction} />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'services' && <ServicesTab />}
        </div>
      </div>
    </div>
  );
};

export default PreGradeIntelligenceModal;
