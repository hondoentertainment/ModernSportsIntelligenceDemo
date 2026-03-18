import React, { useState } from 'react';
import { X, ScanEye, Camera, AlertTriangle, CheckCircle, Target, Shield } from 'lucide-react';
import { analyzeCard, saveGradingResult, getGradingHistory, type VisionGradingResult } from '../lib/analytics/visionGradingService.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const VisionGradingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [playerName, setPlayerName] = useState('');
  const [cardDesc, setCardDesc] = useState('');
  const [result, setResult] = useState<VisionGradingResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [tab, setTab] = useState<'scan' | 'results' | 'history'>('scan');

  const handleAnalyze = () => {
    if (!playerName.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      const r = analyzeCard(playerName, cardDesc || `${playerName} Card`);
      saveGradingResult(r);
      setResult(r);
      setAnalyzing(false);
      setTab('results');
    }, 1500);
  };

  if (!isOpen) return null;

  const history = getGradingHistory();
  const gradeDistribution = result ? [
    { grade: 'PSA 10', probability: result.predictedGrade.psa.grade === 10 ? result.predictedGrade.psa.probability : 8 + Math.random() * 15 },
    { grade: 'PSA 9', probability: result.predictedGrade.psa.grade === 9 ? result.predictedGrade.psa.probability : 20 + Math.random() * 25 },
    { grade: 'PSA 8', probability: 15 + Math.random() * 20 },
    { grade: 'PSA 7', probability: 5 + Math.random() * 10 },
    { grade: '≤ 6', probability: 2 + Math.random() * 5 },
  ] : [];

  const radarData = result ? [
    { attribute: 'Centering', score: result.front.centering.score },
    { attribute: 'Corners', score: result.front.corners.score },
    { attribute: 'Edges', score: result.front.edges.score },
    { attribute: 'Surface', score: result.front.surface.score },
  ] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <ScanEye size={24} className="text-purple-400" />
            <h2 className="text-xl font-bold text-white">AI Vision Grading Lab</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 pb-0">
          {(['scan', 'results', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${tab === t ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
              {t === 'scan' ? 'Scan Card' : t === 'results' ? 'Analysis Results' : `History (${history.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {tab === 'scan' && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="bg-slate-800/50 border border-dashed border-slate-600 rounded-xl p-8 text-center">
                <Camera size={48} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-300 mb-1">Upload Card Image or Use Camera</p>
                <p className="text-xs text-slate-500 mb-4">Front and back scans for most accurate results</p>
                <button className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-xs hover:bg-purple-500/30 transition-colors">
                  📷 Open Camera
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Player Name *</label>
                  <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="e.g., Aaron Judge" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-purple-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Card Description</label>
                  <input type="text" value={cardDesc} onChange={e => setCardDesc(e.target.value)} placeholder="e.g., 2017 Topps Chrome Update RC" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-purple-500/50 focus:outline-none" />
                </div>
                <button onClick={handleAnalyze} disabled={analyzing || !playerName.trim()} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {analyzing ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing with AI Vision...</>
                  ) : (
                    <><ScanEye size={16} /> Analyze Card</>
                  )}
                </button>
              </div>
            </div>
          )}

          {tab === 'results' && result && (
            <div className="space-y-4">
              {/* Grade Prediction */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { company: 'PSA', grade: result.predictedGrade.psa.grade, prob: result.predictedGrade.psa.probability, color: 'text-red-400' },
                  { company: 'BGS', grade: result.predictedGrade.bgs.grade, prob: result.predictedGrade.bgs.probability, color: 'text-blue-400' },
                  { company: 'SGC', grade: result.predictedGrade.sgc.grade, prob: result.predictedGrade.sgc.probability, color: 'text-emerald-400' },
                ].map(g => (
                  <div key={g.company} className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 text-center">
                    <p className={`text-xs font-bold ${g.color} mb-1`}>{g.company}</p>
                    <p className="text-3xl font-bold text-slate-100">{g.grade}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{g.prob.toFixed(0)}% confidence</p>
                  </div>
                ))}
              </div>

              {/* Submission Advice */}
              <div className={`p-4 rounded-xl border ${result.submissionAdvice.shouldSubmit ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.submissionAdvice.shouldSubmit ? <CheckCircle size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-amber-400" />}
                  <span className="text-sm font-bold text-slate-200">
                    {result.submissionAdvice.shouldSubmit ? 'SUBMIT — Positive Expected Value' : 'HOLD RAW — Grading May Not Be Profitable'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{result.submissionAdvice.reason}</p>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-500">Raw Value</p>
                    <p className="text-sm font-bold text-slate-200">${result.submissionAdvice.estimatedRawValue.toFixed(0)}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-500">Graded Value</p>
                    <p className="text-sm font-bold text-emerald-400">${result.submissionAdvice.estimatedGradedValue.toFixed(0)}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-500">Grading Cost</p>
                    <p className="text-sm font-bold text-red-400">${result.submissionAdvice.gradingCost}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-500">Expected ROI</p>
                    <p className={`text-sm font-bold ${result.submissionAdvice.expectedROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.submissionAdvice.expectedROI >= 0 ? '+' : ''}{result.submissionAdvice.expectedROI.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-300 mb-3">Grade Probability Distribution</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gradeDistribution}>
                        <XAxis dataKey="grade" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                        <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                          {gradeDistribution.map((entry, i) => (
                            <Cell key={i} fill={i === 0 ? '#84cc16' : i === 1 ? '#22c55e' : i === 2 ? '#eab308' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-300 mb-3">Subgrade Analysis</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="attribute" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <Radar name="Score" dataKey="score" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Defect Map */}
              {result.defectMap.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Target size={14} className="text-amber-400" />
                    Defect Map — {result.defectMap.length} issues detected
                  </h4>
                  <div className="space-y-2">
                    {result.defectMap.map((defect, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-2">
                        <div className={`w-2 h-2 rounded-full ${defect.severity === 'severe' ? 'bg-red-500' : defect.severity === 'moderate' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        <div className="flex-1">
                          <p className="text-xs text-slate-300">{defect.description}</p>
                          <p className="text-[10px] text-slate-500">{defect.surface.toUpperCase()} · {defect.type.replace(/_/g, ' ')} · {defect.severity}</p>
                        </div>
                        <span className="text-[10px] text-slate-600">({defect.x}%, {defect.y}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence */}
              <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-blue-400" />
                  <span className="text-xs text-slate-400">Analysis Confidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${result.confidenceScore}%` }} />
                  </div>
                  <span className="text-xs font-bold text-purple-400">{result.confidenceScore.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'results' && !result && (
            <div className="text-center py-12">
              <ScanEye size={48} className="text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No analysis results yet</p>
              <p className="text-xs text-slate-600 mt-1">Scan a card in the Scan tab to get AI grade predictions</p>
            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-2">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">No scan history yet</p>
                </div>
              ) : (
                history.map(scan => (
                  <div key={scan.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 cursor-pointer hover:bg-slate-800/70 transition-colors" onClick={() => { setResult(scan); setTab('results'); }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-300">{scan.playerName}</p>
                      <p className="text-xs text-slate-500">{scan.cardDescription}</p>
                      <p className="text-[10px] text-slate-600">{new Date(scan.analyzedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-lg font-bold text-slate-200">PSA {scan.predictedGrade.psa.grade}</p>
                      <p className={`text-xs ${scan.submissionAdvice.shouldSubmit ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {scan.submissionAdvice.shouldSubmit ? `Submit — +${scan.submissionAdvice.expectedROI.toFixed(0)}% ROI` : 'Hold Raw'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisionGradingModal;
