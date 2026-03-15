import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  X, Eye, Upload, Camera, ScanLine, CheckCircle, AlertTriangle,
  Shield, TrendingUp, DollarSign, ChevronRight, Zap, BarChart3
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  analyzeCardImage,
  compareToPopulation,
  calculateGradingROI,
  type GradingVisionResult,
  type GradingComparisonResult,
  type ROIProjection,
} from '../lib/gradingVisionEngineService.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cardName?: string;
  cardId?: string;
  onNavigateToFull?: () => void;
}

type ModalStep = 'upload' | 'analyzing' | 'results';

const GradingVisionModal: React.FC<Props> = ({ isOpen, onClose, cardName, cardId, onNavigateToFull }) => {
  const [step, setStep] = useState<ModalStep>('upload');
  const [result, setResult] = useState<GradingVisionResult | null>(null);
  const [comparison, setComparison] = useState<GradingComparisonResult | null>(null);
  const [roiData, setRoiData] = useState<ROIProjection | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep('upload');
      setResult(null);
      setComparison(null);
      setRoiData(null);
      setProgress(0);
      if (progressRef.current) clearInterval(progressRef.current);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const runAnalysis = useCallback((imageData: string) => {
    setStep('analyzing');
    setProgress(0);

    let p = 0;
    progressRef.current = setInterval(() => {
      p += Math.random() * 10 + 3;
      if (p >= 95) p = 95;
      setProgress(p);
    }, 100);

    analyzeCardImage(imageData).then((res) => {
      if (progressRef.current) clearInterval(progressRef.current);
      setProgress(100);

      setTimeout(() => {
        setResult(res);
        setComparison(compareToPopulation(res));
        setRoiData(calculateGradingROI(
          String(res.predictedGrades[0]?.predictedGrade ?? 9),
          res.rawValueEstimate
        ));
        setStep('results');
      }, 300);
    });
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => runAnalysis(reader.result as string);
    reader.readAsDataURL(file);
  }, [runAnalysis]);

  const handleDemoAnalysis = useCallback(() => {
    runAnalysis('demo-modal-scan');
  }, [runAnalysis]);

  const gradeColor = (grade: number) => {
    if (grade >= 9.5) return 'text-emerald-400';
    if (grade >= 9) return 'text-cyan-400';
    if (grade >= 8) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const gradeRingColor = (grade: number) => {
    if (grade >= 9.5) return 'border-emerald-400';
    if (grade >= 9) return 'border-cyan-400';
    if (grade >= 8) return 'border-yellow-400';
    return 'border-orange-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Eye size={18} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Quick Grade Scan</h2>
              {cardName && <p className="text-xs text-slate-400">{cardName}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-5">
              <div
                onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                <Upload size={36} className={dragActive ? 'text-cyan-400 mx-auto' : 'text-slate-500 mx-auto'} />
                <p className="text-sm text-slate-300 mt-3 font-medium">
                  {dragActive ? 'Drop image here' : 'Upload Card Image'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Drag and drop or click to browse</p>
              </div>

              <div className="text-center">
                <button
                  onClick={handleDemoAnalysis}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-sm font-medium rounded-lg transition-all"
                >
                  <Zap size={16} />
                  Demo Analysis
                </button>
              </div>
            </div>
          )}

          {/* Analyzing Step */}
          {step === 'analyzing' && (
            <div className="flex flex-col items-center py-10 space-y-6">
              <div className="relative w-40 h-56 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="absolute inset-3 bg-slate-700/50 rounded flex items-center justify-center">
                  <Camera size={32} className="text-slate-600" />
                </div>
                <div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                  style={{ top: `${progress % 100}%` }}
                />
                <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
                <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
                <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
                <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-200">Analyzing...</p>
                <p className="text-xs text-slate-400 mt-1">
                  {progress < 50 ? 'Scanning card structure...' : 'Computing grade predictions...'}
                </p>
              </div>
              <div className="w-48">
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 text-right mt-1">{Math.round(progress)}%</p>
              </div>
            </div>
          )}

          {/* Results Step */}
          {step === 'results' && result && (
            <div className="space-y-5">
              {/* Card & Grade */}
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center shrink-0 ${gradeRingColor(result.overallScore)}`}>
                  <span className={`text-3xl font-black ${gradeColor(result.overallScore)}`}>
                    {result.overallScore}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-100 truncate">{result.cardName}</h3>
                  <p className="text-sm text-slate-400">{result.playerName}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <Shield size={12} />
                    <span>{result.confidence.overall}% confidence</span>
                  </div>
                </div>
              </div>

              {/* Company Predictions */}
              <div className="grid grid-cols-3 gap-3">
                {result.predictedGrades.map(pg => (
                  <div key={pg.company} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
                    <p className={`text-xs font-bold ${
                      pg.company === 'PSA' ? 'text-red-400' : pg.company === 'BGS' ? 'text-blue-400' : 'text-yellow-400'
                    }`}>{pg.company}</p>
                    <p className={`text-xl font-black mt-1 ${gradeColor(pg.predictedGrade)}`}>{pg.predictedGrade}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{pg.probability}% conf</p>
                    <p className="text-xs text-emerald-400 font-medium mt-1">${pg.estimatedValue.toFixed(0)}</p>
                  </div>
                ))}
              </div>

              {/* Radar Chart */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Subgrades</p>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={result.subgrades.map(sg => ({
                      category: sg.category.charAt(0).toUpperCase() + sg.category.slice(1),
                      score: sg.score,
                      fullMark: 10,
                    }))}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 9 }} />
                      <Radar name="Score" dataKey="score" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {result.subgrades.map(sg => (
                    <div key={sg.category} className="text-center">
                      <p className="text-[10px] text-slate-500 capitalize">{sg.category}</p>
                      <p className={`text-sm font-bold ${gradeColor(sg.score)}`}>{sg.score}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Defects Summary */}
              {result.defects.length > 0 && (
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                    Defects Detected ({result.defects.length})
                  </p>
                  <div className="space-y-1.5">
                    {result.defects.slice(0, 4).map(d => (
                      <div key={d.id} className="flex items-center gap-2 text-xs">
                        <AlertTriangle size={12} className={
                          d.severity === 'severe' ? 'text-red-400' :
                          d.severity === 'moderate' ? 'text-yellow-400' : 'text-emerald-400'
                        } />
                        <span className="text-slate-300">{d.type.replace(/_/g, ' ')}</span>
                        <span className="text-slate-500">— {d.location}</span>
                        <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${
                          d.severity === 'severe' ? 'bg-red-500/20 text-red-300' :
                          d.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}>{d.severity}</span>
                      </div>
                    ))}
                    {result.defects.length > 4 && (
                      <p className="text-[10px] text-slate-500">+{result.defects.length - 4} more defects</p>
                    )}
                  </div>
                </div>
              )}

              {/* ROI Quick View */}
              {roiData && (
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">ROI Summary</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-[10px] text-slate-500">Raw Value</p>
                      <p className="text-sm font-bold text-slate-200">${roiData.rawValue.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Best Case</p>
                      <p className="text-sm font-bold text-emerald-400">+${roiData.bestScenario.netProfit.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Expected</p>
                      <p className="text-sm font-bold text-cyan-400">${roiData.expectedValue.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 shrink-0 flex items-center justify-between">
          {step === 'results' ? (
            <>
              <button
                onClick={() => { setStep('upload'); setResult(null); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
              >
                <Camera size={14} />
                Scan Another
              </button>
              {onNavigateToFull && (
                <button
                  onClick={onNavigateToFull}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <BarChart3 size={14} />
                  Full Analysis
                  <ChevronRight size={14} />
                </button>
              )}
            </>
          ) : (
            <div className="w-full text-center">
              <p className="text-xs text-slate-500">
                {step === 'upload' ? 'Upload a card image for instant AI grade prediction' : 'Analysis in progress...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradingVisionModal;
