import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Camera, Upload, ScanLine, Eye, Shield, DollarSign, BarChart3, History,
  ChevronRight, AlertTriangle, CheckCircle, XCircle, Zap, Target,
  ArrowRight, TrendingUp, Clock, Award, Info, RefreshCw, Crosshair,
  Sun, Square, Aperture, X
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Cell
} from 'recharts';
import {
  analyzeCardImage,
  compareToPopulation,
  getGradingHistory,
  getCameraCalibrationGuide,
  calculateGradingROI,
  getSubmissionTiers,
  type GradingVisionResult,
  type GradingComparisonResult,
  type VisionHistoryEntry,
  type ROIProjection,
  type SubmissionTier,
  type CameraCalibration,
} from '../lib/core/gradingVisionEngineService.ts';

type WorkflowStep = 'upload' | 'analyzing' | 'results' | 'recommendations';
type ResultTab = 'subgrades' | 'defects' | 'comparison' | 'roi' | 'costs';

const COLORS = ['#22d3ee', '#a78bfa', '#34d399', '#f97316', '#f43f5e', '#facc15', '#818cf8', '#fb923c'];

const GradingVisionEngine: React.FC = () => {
  const [step, setStep] = useState<WorkflowStep>('upload');
  const [result, setResult] = useState<GradingVisionResult | null>(null);
  const [comparison, setComparison] = useState<GradingComparisonResult | null>(null);
  const [roiData, setRoiData] = useState<ROIProjection | null>(null);
  const [history, setHistory] = useState<VisionHistoryEntry[]>([]);
  const [calibration, setCalibration] = useState<CameraCalibration | null>(null);
  const [tiers, setTiers] = useState<SubmissionTier[]>([]);
  const [activeTab, setActiveTab] = useState<ResultTab>('subgrades');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setHistory(getGradingHistory());
    setCalibration(getCameraCalibrationGuide());
    setTiers(getSubmissionTiers());
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;

    setStep('analyzing');
    setAnalysisProgress(0);

    // Animate progress bar
    let progress = 0;
    progressIntervalRef.current = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress >= 95) progress = 95;
      setAnalysisProgress(progress);
    }, 100);

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      analyzeCardImage(imageData).then((analysisResult) => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setAnalysisProgress(100);

        setTimeout(() => {
          setResult(analysisResult);
          setComparison(compareToPopulation(analysisResult));
          setRoiData(calculateGradingROI(
            String(analysisResult.predictedGrades[0]?.predictedGrade ?? 9),
            analysisResult.rawValueEstimate
          ));
          setStep('results');
        }, 400);
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragActive(false), []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDemoAnalysis = useCallback(() => {
    setStep('analyzing');
    setAnalysisProgress(0);

    let progress = 0;
    progressIntervalRef.current = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress >= 95) progress = 95;
      setAnalysisProgress(progress);
    }, 100);

    analyzeCardImage('demo-card-image-placeholder').then((analysisResult) => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setAnalysisProgress(100);

      setTimeout(() => {
        setResult(analysisResult);
        setComparison(compareToPopulation(analysisResult));
        setRoiData(calculateGradingROI(
          String(analysisResult.predictedGrades[0]?.predictedGrade ?? 9),
          analysisResult.rawValueEstimate
        ));
        setStep('results');
      }, 400);
    });
  }, []);

  const resetWorkflow = useCallback(() => {
    setStep('upload');
    setResult(null);
    setComparison(null);
    setRoiData(null);
    setAnalysisProgress(0);
    setActiveTab('subgrades');
  }, []);

  const severityColor = (severity: string) => {
    if (severity === 'severe') return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (severity === 'moderate') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  const gradeColor = (grade: number) => {
    if (grade >= 9.5) return 'text-emerald-400';
    if (grade >= 9) return 'text-cyan-400';
    if (grade >= 8) return 'text-yellow-400';
    if (grade >= 7) return 'text-orange-400';
    return 'text-red-400';
  };

  const gradeRingColor = (grade: number) => {
    if (grade >= 9.5) return 'border-emerald-400 shadow-emerald-500/30';
    if (grade >= 9) return 'border-cyan-400 shadow-cyan-500/30';
    if (grade >= 8) return 'border-yellow-400 shadow-yellow-500/30';
    return 'border-orange-400 shadow-orange-500/30';
  };

  // ─── Upload Step ────────────────────────────────────────────────────────
  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Drag/Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
          ${dragActive
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02]'
            : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800/80'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-2xl transition-colors ${dragActive ? 'bg-cyan-500/20' : 'bg-slate-700/50'}`}>
            <Upload size={40} className={dragActive ? 'text-cyan-400' : 'text-slate-400'} />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-200">
              {dragActive ? 'Drop card image here' : 'Upload Card Image'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Drag and drop or click to browse. Supports JPG, PNG, WebP.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Camera size={14} />
            <span>Minimum 12MP recommended for best accuracy</span>
          </div>
        </div>

        {/* Animated scan line overlay when dragging */}
        {dragActive && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse top-1/2" />
          </div>
        )}
      </div>

      {/* Demo Button */}
      <div className="text-center">
        <button
          onClick={handleDemoAnalysis}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
        >
          <Zap size={18} />
          Run Demo Analysis
        </button>
        <p className="text-xs text-slate-500 mt-2">Analyze a sample card to see the full workflow</p>
      </div>

      {/* Calibration Guide Toggle */}
      <div className="border border-slate-700 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowCalibration(!showCalibration)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Target size={18} className="text-purple-400" />
            <span className="font-medium text-slate-200">Camera Calibration Guide</span>
          </div>
          <ChevronRight size={16} className={`text-slate-500 transition-transform ${showCalibration ? 'rotate-90' : ''}`} />
        </button>
        {showCalibration && calibration && (
          <div className="p-4 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {calibration.steps.map((s) => (
                <div key={s.step} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">
                      {s.step}
                    </div>
                    {s.icon === 'sun' && <Sun size={14} className="text-yellow-400" />}
                    {s.icon === 'square' && <Square size={14} className="text-slate-400" />}
                    {s.icon === 'camera' && <Camera size={14} className="text-cyan-400" />}
                    {s.icon === 'crosshair' && <Crosshair size={14} className="text-emerald-400" />}
                    {s.icon === 'aperture' && <Aperture size={14} className="text-purple-400" />}
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-1">{s.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
              <h4 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Recommended Settings</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(calibration.recommendedSettings).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-slate-500 capitalize min-w-[80px]">{key}:</span>
                    <span className="text-slate-300">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workflow Steps Preview */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        {['Upload', 'Analyzing', 'Results', 'Recommendations'].map((label, i) => (
          <React.Fragment key={label}>
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${i === 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800'}`}>
              {i === 0 && <Upload size={12} />}
              {i === 1 && <ScanLine size={12} />}
              {i === 2 && <BarChart3 size={12} />}
              {i === 3 && <Award size={12} />}
              <span>{label}</span>
            </div>
            {i < 3 && <ArrowRight size={12} className="text-slate-600" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // ─── Analyzing Step ─────────────────────────────────────────────────────
  const renderAnalyzingStep = () => (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      {/* Scanning Animation */}
      <div className="relative w-64 h-80 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {/* Simulated card placeholder */}
        <div className="absolute inset-4 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center">
          <Camera size={48} className="text-slate-600" />
        </div>
        {/* Scan line animation */}
        <div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/50"
          style={{
            top: `${(analysisProgress % 100)}%`,
            transition: 'top 0.1s linear',
          }}
        />
        {/* Corner markers */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br" />
      </div>

      <div className="text-center space-y-3">
        <h3 className="text-xl font-bold text-slate-100">Analyzing Card...</h3>
        <p className="text-sm text-slate-400">
          {analysisProgress < 25 && 'Detecting card boundaries and orientation...'}
          {analysisProgress >= 25 && analysisProgress < 50 && 'Analyzing centering and edges...'}
          {analysisProgress >= 50 && analysisProgress < 75 && 'Scanning corners and surface for defects...'}
          {analysisProgress >= 75 && analysisProgress < 95 && 'Computing grade predictions across companies...'}
          {analysisProgress >= 95 && 'Finalizing analysis...'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-80 space-y-2">
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-200"
            style={{ width: `${analysisProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>AI Vision Engine</span>
          <span>{Math.round(analysisProgress)}%</span>
        </div>
      </div>

      {/* Analysis Stages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
        {[
          { label: 'Centering', threshold: 25, icon: <Crosshair size={14} /> },
          { label: 'Corners', threshold: 50, icon: <Square size={14} /> },
          { label: 'Edges', threshold: 62, icon: <ScanLine size={14} /> },
          { label: 'Surface', threshold: 75, icon: <Eye size={14} /> },
        ].map((stage) => (
          <div
            key={stage.label}
            className={`flex items-center gap-2 p-3 rounded-xl border text-xs transition-all duration-500 ${
              analysisProgress >= stage.threshold
                ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                : 'border-slate-700 bg-slate-800/50 text-slate-500'
            }`}
          >
            {analysisProgress >= stage.threshold ? <CheckCircle size={14} /> : stage.icon}
            <span>{stage.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Results Step ───────────────────────────────────────────────────────
  const renderResultsStep = () => {
    if (!result) return null;

    const radarData = result.subgrades.map(sg => ({
      category: sg.category.charAt(0).toUpperCase() + sg.category.slice(1),
      score: sg.score,
      fullMark: 10,
    }));

    const bestCompany = result.predictedGrades.reduce((a, b) =>
      a.estimatedValue - a.cost > b.estimatedValue - b.cost ? a : b
    );

    return (
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100">{result.cardName}</h2>
            <p className="text-sm text-slate-400">{result.playerName} | Analyzed {new Date(result.analyzedAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('recommendations')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Award size={16} />
              View Recommendations
            </button>
            <button
              onClick={resetWorkflow}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
              Scan Another
            </button>
          </div>
        </div>

        {/* Grade Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Predicted Grade Circle */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Predicted Grade</p>
            <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center shadow-lg ${gradeRingColor(result.overallScore)}`}>
              <span className={`text-4xl font-black ${gradeColor(result.overallScore)}`}>
                {result.overallScore}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-300">
              {result.predictedGrades[0]?.gradeLabel}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
              <Shield size={12} />
              <span>Confidence: {result.confidence.overall}%</span>
            </div>
          </div>

          {/* Multi-Company Comparison */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">Company Predictions</p>
            <div className="space-y-3">
              {result.predictedGrades.map(pg => (
                <div key={pg.company} className={`flex items-center justify-between p-3 rounded-xl border ${
                  pg.company === bestCompany.company
                    ? 'border-cyan-500/40 bg-cyan-500/5'
                    : 'border-slate-700/50 bg-slate-800/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`text-sm font-bold ${pg.company === 'PSA' ? 'text-red-400' : pg.company === 'BGS' ? 'text-blue-400' : 'text-yellow-400'}`}>
                      {pg.company}
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${gradeColor(pg.predictedGrade)}`}>{pg.predictedGrade}</p>
                      <p className="text-[10px] text-slate-500">{pg.gradeLabel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-400">${pg.estimatedValue.toFixed(0)}</p>
                    <p className="text-[10px] text-slate-500">{pg.probability}% confidence</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Distribution Bar */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">Grade Probability</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.gradeDistribution} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="grade" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                    itemStyle={{ color: '#22d3ee' }}
                    formatter={(value: number) => [`${value}%`, 'Probability']}
                  />
                  <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                    {result.gradeDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Result Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-slate-700 pb-px">
          {([
            { key: 'subgrades' as ResultTab, label: 'Subgrades', icon: <BarChart3 size={14} /> },
            { key: 'defects' as ResultTab, label: `Defects (${result.defects.length})`, icon: <AlertTriangle size={14} /> },
            { key: 'comparison' as ResultTab, label: 'Population', icon: <Target size={14} /> },
            { key: 'roi' as ResultTab, label: 'ROI Calculator', icon: <DollarSign size={14} /> },
            { key: 'costs' as ResultTab, label: 'Costs & Tiers', icon: <Clock size={14} /> },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === 'subgrades' && renderSubgradesTab()}
          {activeTab === 'defects' && renderDefectsTab()}
          {activeTab === 'comparison' && renderComparisonTab()}
          {activeTab === 'roi' && renderROITab()}
          {activeTab === 'costs' && renderCostsTab()}
        </div>
      </div>
    );
  };

  // ─── Subgrades Tab ──────────────────────────────────────────────────────
  const renderSubgradesTab = () => {
    if (!result) return null;

    const radarData = result.subgrades.map(sg => ({
      category: sg.category.charAt(0).toUpperCase() + sg.category.slice(1),
      score: sg.score,
      fullMark: 10,
    }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Subgrade Radar</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subgrade Details */}
        <div className="space-y-3">
          {result.subgrades.map(sg => (
            <div key={sg.category} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-200 capitalize">{sg.category}</h4>
                  <span className="text-[10px] text-slate-500">Weight: {(sg.weight * 100).toFixed(0)}%</span>
                </div>
                <span className={`text-lg font-bold ${gradeColor(sg.score)}`}>{sg.score}</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full mb-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${(sg.score / 10) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">{sg.details}</p>
              {sg.issues.length > 0 && (
                <div className="mt-2 space-y-1">
                  {sg.issues.map((issue, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-yellow-400">
                      <AlertTriangle size={10} />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── Defects Tab ────────────────────────────────────────────────────────
  const renderDefectsTab = () => {
    if (!result) return null;

    const frontDefects = result.defects.filter(d => d.surface === 'front');
    const backDefects = result.defects.filter(d => d.surface === 'back');

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Defect Overlay Map */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Defect Map — Front</h3>
          <div className="relative w-full aspect-[2.5/3.5] bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
            {/* Card outline */}
            <div className="absolute inset-4 border border-slate-600 rounded opacity-30" />
            {/* Defect markers */}
            {frontDefects.map((defect) => (
              <div
                key={defect.id}
                className={`absolute w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-transform hover:scale-150 ${
                  defect.severity === 'severe' ? 'border-red-400 bg-red-500/30 text-red-300' :
                  defect.severity === 'moderate' ? 'border-yellow-400 bg-yellow-500/30 text-yellow-300' :
                  'border-emerald-400 bg-emerald-500/30 text-emerald-300'
                }`}
                style={{
                  left: `${defect.x}%`,
                  top: `${defect.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={defect.description}
              >
                !
              </div>
            ))}
            {frontDefects.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-emerald-400/50">
                <div className="text-center">
                  <CheckCircle size={32} className="mx-auto mb-2" />
                  <p className="text-xs">No major defects detected</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Defect List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">Detected Issues ({result.defects.length})</h3>
          {result.defects.length === 0 ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
              <CheckCircle size={24} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-emerald-300">No significant defects detected</p>
            </div>
          ) : (
            <>
              {result.defects.map(defect => (
                <div key={defect.id} className={`border rounded-xl p-4 ${severityColor(defect.severity)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase">{defect.type.replace(/_/g, ' ')}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        defect.severity === 'severe' ? 'bg-red-500/20 text-red-300' :
                        defect.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {defect.severity}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">{defect.surface} | {defect.location}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{defect.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Grade impact: -{defect.gradeImpact} points</p>
                </div>
              ))}
              {backDefects.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Back Surface</p>
                  {backDefects.map(defect => (
                    <div key={defect.id} className="border border-slate-700/50 bg-slate-800/30 rounded-xl p-3 text-xs text-slate-400">
                      <span className="font-medium text-slate-300">{defect.type.replace(/_/g, ' ')}</span> — {defect.description}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // ─── Comparison Tab ─────────────────────────────────────────────────────
  const renderComparisonTab = () => {
    if (!comparison) return null;

    const percentileData = [
      { category: 'Centering', percentile: comparison.percentileCentering },
      { category: 'Corners', percentile: comparison.percentileCorners },
      { category: 'Edges', percentile: comparison.percentileEdges },
      { category: 'Surface', percentile: comparison.percentileSurface },
      { category: 'Overall', percentile: comparison.percentileOverall },
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Population Percentile</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={percentileData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                  <YAxis type="category" dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={70} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value: number) => [`${value}th percentile`, '']}
                  />
                  <Bar dataKey="percentile" radius={[0, 4, 4, 0]}>
                    {percentileData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-400">Out of <span className="text-cyan-400 font-bold">{comparison.populationCount.toLocaleString()}</span> graded copies</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              Better than {comparison.betterThanPercent}%
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Population Distribution</h3>
            <div className="space-y-2">
              {comparison.gradeDistributionPop.map(item => (
                <div key={item.grade} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-16">{item.grade}</span>
                  <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-300 w-16 text-right">{item.count.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 w-8">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Similar Graded Sales</h3>
            <div className="space-y-2">
              {comparison.similarCards.map((card, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-300">{card.name}</span>
                  <span className="text-emerald-400 font-semibold">${card.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── ROI Tab ────────────────────────────────────────────────────────────
  const renderROITab = () => {
    if (!roiData || !result) return null;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-slate-800 to-slate-800/60 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">ROI Projections by Grade Outcome</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-700">
                  <th className="pb-2 pr-4">Grade</th>
                  <th className="pb-2 pr-4">Graded Value</th>
                  <th className="pb-2 pr-4">Total Cost</th>
                  <th className="pb-2 pr-4">Net Profit</th>
                  <th className="pb-2 pr-4">ROI</th>
                  <th className="pb-2">Probability</th>
                </tr>
              </thead>
              <tbody>
                {roiData.projections.map(proj => (
                  <tr key={proj.grade} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                    <td className="py-2.5 pr-4 font-bold text-slate-200">{proj.grade}</td>
                    <td className="py-2.5 pr-4 text-emerald-400">${proj.gradedValue.toFixed(2)}</td>
                    <td className="py-2.5 pr-4 text-slate-400">${(proj.gradingCost + proj.shippingCost).toFixed(2)}</td>
                    <td className={`py-2.5 pr-4 font-semibold ${proj.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {proj.netProfit >= 0 ? '+' : ''}${proj.netProfit.toFixed(2)}
                    </td>
                    <td className={`py-2.5 pr-4 ${proj.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {proj.roi >= 0 ? '+' : ''}{proj.roi.toFixed(1)}%
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${proj.probability}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{proj.probability}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
            <p className="text-xs text-emerald-300 mb-1">Best Case (Grade {roiData.bestScenario.grade})</p>
            <p className="text-2xl font-black text-emerald-400">+${roiData.bestScenario.netProfit.toFixed(2)}</p>
            <p className="text-xs text-emerald-400/70">{roiData.bestScenario.roi.toFixed(1)}% ROI</p>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-center">
            <p className="text-xs text-cyan-300 mb-1">Expected Value</p>
            <p className="text-2xl font-black text-cyan-400">${roiData.expectedValue.toFixed(2)}</p>
            <p className="text-xs text-cyan-400/70">Raw: ${roiData.rawValue.toFixed(2)}</p>
          </div>
          <div className={`${roiData.worstScenario.netProfit >= 0 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'} border rounded-xl p-4 text-center`}>
            <p className={`text-xs ${roiData.worstScenario.netProfit >= 0 ? 'text-yellow-300' : 'text-red-300'} mb-1`}>
              Worst Case (Grade {roiData.worstScenario.grade})
            </p>
            <p className={`text-2xl font-black ${roiData.worstScenario.netProfit >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
              {roiData.worstScenario.netProfit >= 0 ? '+' : ''}${roiData.worstScenario.netProfit.toFixed(2)}
            </p>
            <p className={`text-xs ${roiData.worstScenario.netProfit >= 0 ? 'text-yellow-400/70' : 'text-red-400/70'}`}>
              {roiData.worstScenario.roi.toFixed(1)}% ROI
            </p>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-cyan-400 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-300">{roiData.recommendation}</p>
          </div>
        </div>
      </div>
    );
  };

  // ─── Costs Tab ──────────────────────────────────────────────────────────
  const renderCostsTab = () => {
    const companies = ['PSA', 'BGS', 'SGC'];

    return (
      <div className="space-y-6">
        {companies.map(company => {
          const companyTiers = tiers.filter(t => t.company === company);
          return (
            <div key={company} className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className={`px-4 py-3 border-b border-slate-700/50 ${
                company === 'PSA' ? 'bg-red-500/10' : company === 'BGS' ? 'bg-blue-500/10' : 'bg-yellow-500/10'
              }`}>
                <h3 className={`text-sm font-bold ${
                  company === 'PSA' ? 'text-red-400' : company === 'BGS' ? 'text-blue-400' : 'text-yellow-400'
                }`}>{company}</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-700/50">
                    <th className="px-4 py-2">Tier</th>
                    <th className="px-4 py-2">Cost</th>
                    <th className="px-4 py-2">Turnaround</th>
                    <th className="px-4 py-2">Insurance</th>
                  </tr>
                </thead>
                <tbody>
                  {companyTiers.map(tier => (
                    <tr key={`${tier.company}-${tier.tier}`} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-2.5 text-slate-200 font-medium">{tier.tier}</td>
                      <td className="px-4 py-2.5 text-emerald-400">${tier.cost}</td>
                      <td className="px-4 py-2.5 text-slate-300">{tier.turnaroundDays} days</td>
                      <td className="px-4 py-2.5 text-slate-400">{tier.insurance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Recommendations Step ───────────────────────────────────────────────
  const renderRecommendationsStep = () => {
    if (!result || !roiData) return null;

    const bestCompany = result.predictedGrades.reduce((a, b) =>
      (a.estimatedValue - a.cost) > (b.estimatedValue - b.cost) ? a : b
    );

    const shouldSubmit = bestCompany.estimatedValue - bestCompany.cost - result.rawValueEstimate > 20;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">Submission Recommendations</h2>
          <button
            onClick={() => setStep('results')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronRight size={16} className="rotate-180" />
            Back to Results
          </button>
        </div>

        {/* Primary Recommendation */}
        <div className={`border rounded-2xl p-6 ${
          shouldSubmit
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : 'border-yellow-500/40 bg-yellow-500/5'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${
              shouldSubmit ? 'bg-emerald-500/20' : 'bg-yellow-500/20'
            }`}>
              {shouldSubmit
                ? <CheckCircle size={28} className="text-emerald-400" />
                : <AlertTriangle size={28} className="text-yellow-400" />
              }
            </div>
            <div>
              <h3 className={`text-lg font-bold ${shouldSubmit ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {shouldSubmit ? 'Recommended: Submit for Grading' : 'Caution: Marginal ROI'}
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                {shouldSubmit
                  ? `Submit to ${bestCompany.company} for best value. Predicted ${bestCompany.gradeLabel} with ${bestCompany.probability}% confidence.`
                  : 'The grading cost may not justify the value increase at the predicted grade. Consider holding or bulk submission.'}
              </p>
            </div>
          </div>
        </div>

        {/* Company Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.predictedGrades.map(pg => {
            const profit = pg.estimatedValue - pg.cost - result.rawValueEstimate;
            const isRecommended = pg.company === bestCompany.company;
            return (
              <div
                key={pg.company}
                className={`border rounded-xl p-5 relative ${
                  isRecommended
                    ? 'border-cyan-500/50 bg-cyan-500/5'
                    : 'border-slate-700 bg-slate-800/40'
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-cyan-500 text-[10px] font-bold text-slate-900 rounded-full uppercase tracking-wider">
                    Best Value
                  </div>
                )}
                <div className={`text-lg font-bold mb-3 ${
                  pg.company === 'PSA' ? 'text-red-400' : pg.company === 'BGS' ? 'text-blue-400' : 'text-yellow-400'
                }`}>{pg.company}</div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Predicted Grade</span>
                    <span className={`font-bold ${gradeColor(pg.predictedGrade)}`}>{pg.predictedGrade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence</span>
                    <span className="text-slate-200">{pg.probability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Grading Cost</span>
                    <span className="text-slate-200">${pg.cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Graded Value</span>
                    <span className="text-emerald-400">${pg.estimatedValue.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Turnaround</span>
                    <span className="text-slate-200">{pg.turnaroundDays} days</span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 mt-2 flex justify-between">
                    <span className="text-slate-300 font-medium">Net Profit</span>
                    <span className={`font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick ROI Summary */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Quick ROI Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-400">Raw Value</p>
              <p className="text-lg font-bold text-slate-200">${result.rawValueEstimate.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">If PSA {Math.min(result.predictedGrades[0]?.predictedGrade + 1, 10)}</p>
              <p className="text-lg font-bold text-emerald-400">
                +${((result.rawValueEstimate * (result.overallScore >= 9 ? 8 : 3.5)) - result.rawValueEstimate - 30).toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">If PSA {result.predictedGrades[0]?.predictedGrade}</p>
              <p className="text-lg font-bold text-cyan-400">
                +${(result.predictedGrades[0]?.estimatedValue - result.rawValueEstimate - 30).toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Grading Cost</p>
              <p className="text-lg font-bold text-orange-400">-$30</p>
            </div>
          </div>
        </div>

        {/* Confidence Breakdown */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Confidence Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {result.confidence.factors.map(factor => (
              <div key={factor.factor} className="bg-slate-800/60 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 mb-1">{factor.factor}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-300 font-medium">{factor.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={resetWorkflow}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all"
          >
            <Camera size={18} />
            Scan Another Card
          </button>
        </div>
      </div>
    );
  };

  // ─── History Sidebar ────────────────────────────────────────────────────
  const renderHistoryPanel = () => (
    <div className={`fixed inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-700 z-50 transform transition-transform duration-300 ${
      showHistory ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="font-semibold text-slate-200">Scan History</h3>
        <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
          <X size={18} className="text-slate-400" />
        </button>
      </div>
      <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-60px)]">
        {history.map(entry => (
          <div key={entry.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-slate-200 truncate max-w-[180px]">{entry.cardName}</p>
              <span className={`text-sm font-bold ${gradeColor(entry.predictedGrade)}`}>{entry.predictedGrade}</span>
            </div>
            <p className="text-xs text-slate-400">{entry.playerName}</p>
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
              <span>{entry.company} | {entry.confidence}% conf</span>
              <span>${entry.gradedValue.toFixed(0)}</span>
            </div>
            <p className="text-[10px] text-slate-600 mt-1">{new Date(entry.analyzedAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Main Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-xl">
                <Eye size={24} className="text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100">AI Grading Vision Engine</h1>
                <p className="text-sm text-slate-400">Camera-to-grade workflow powered by AI analysis</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 text-sm rounded-lg transition-colors"
            >
              <History size={16} />
              History ({history.length})
            </button>
          </div>
        </div>

        {/* Workflow Step Indicator */}
        <div className="flex items-center gap-2 text-xs">
          {(['upload', 'analyzing', 'results', 'recommendations'] as WorkflowStep[]).map((ws, i) => (
            <React.Fragment key={ws}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-colors ${
                step === ws
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : (['upload', 'analyzing', 'results', 'recommendations'].indexOf(step) > i)
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
              }`}>
                {(['upload', 'analyzing', 'results', 'recommendations'].indexOf(step) > i) && <CheckCircle size={12} />}
                <span className="capitalize">{ws}</span>
              </div>
              {i < 3 && <ArrowRight size={12} className="text-slate-600" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        {step === 'upload' && renderUploadStep()}
        {step === 'analyzing' && renderAnalyzingStep()}
        {step === 'results' && renderResultsStep()}
        {step === 'recommendations' && renderRecommendationsStep()}

        {/* History Sidebar */}
        {renderHistoryPanel()}
        {showHistory && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowHistory(false)}
          />
        )}
      </div>
    </div>
  );
};

export default GradingVisionEngine;
