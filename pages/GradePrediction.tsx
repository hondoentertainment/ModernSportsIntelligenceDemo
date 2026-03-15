import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Award, Target, DollarSign, BarChart3, CheckCircle, AlertTriangle, Clock, Upload, Eye, TrendingUp, Shield, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import {
  getGradePredictions,
  getGradingCosts,
  getPopulationData,
  getGradingROI,
  getSubmissionTracker,
  getPredictionStats,
  predictGrade,
  getCompanyColor,
  getGradeColor,
  getStatusLabel,
  formatCurrency,
  getSubgradeLabel,
  getRecommendationColor,
  getStatusProgress,
  type GradePrediction as GradePredictionType,
  type GradingCostComparison,
  type GradePopulationData,
  type GradingROI,
  type SubmissionTracker,
  type PredictionStats,
  type GradingCompany,
} from '../lib/gradePredictionService';

const COMPANY_COLORS: Record<GradingCompany, string> = { PSA: '#ef4444', BGS: '#3b82f6', SGC: '#f59e0b', CGC: '#10b981' };

const GradePredictionPage: React.FC = () => {
  const [predictions, setPredictions] = useState<GradePredictionType[]>([]);
  const [costs, setCosts] = useState<GradingCostComparison[]>([]);
  const [popData, setPopData] = useState<GradePopulationData[]>([]);
  const [roiData, setRoiData] = useState<GradingROI[]>([]);
  const [tracker, setTracker] = useState<SubmissionTracker[]>([]);
  const [stats, setStats] = useState<PredictionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'predictions' | 'costs' | 'population' | 'roi' | 'tracker'>('predictions');
  const [selectedPrediction, setSelectedPrediction] = useState<GradePredictionType | null>(null);
  const [roiCardValue, setRoiCardValue] = useState(200);
  const [uploadForm, setUploadForm] = useState({ cardName: '', player: '', year: '2024', set: '', sport: 'Basketball' });
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    try {
      setPredictions(getGradePredictions());
      setCosts(getGradingCosts());
      setPopData(getPopulationData());
      setRoiData(getGradingROI(roiCardValue));
      setTracker(getSubmissionTracker());
      setStats(getPredictionStats());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setRoiData(getGradingROI(roiCardValue));
  }, [roiCardValue]);

  const handlePredict = useCallback(() => {
    if (!uploadForm.cardName || !uploadForm.player) return;
    const result = predictGrade(uploadForm.cardName, uploadForm.player, parseInt(uploadForm.year, 10), uploadForm.set, uploadForm.sport);
    setPredictions((prev) => [result, ...prev]);
    setSelectedPrediction(result);
    setShowUpload(false);
    setUploadForm({ cardName: '', player: '', year: '2024', set: '', sport: 'Basketball' });
  }, [uploadForm]);

  const radarData = useMemo(() => {
    if (!selectedPrediction) return [];
    const pred = selectedPrediction.predictions[0]; // PSA
    return pred.subgrades.map((sg) => ({
      category: getSubgradeLabel(sg.category),
      score: sg.score,
      fullMark: 10,
    }));
  }, [selectedPrediction]);

  const distributionData = useMemo(() => {
    if (!selectedPrediction) return [];
    return selectedPrediction.predictions.map((p) => ({
      company: p.company,
      grade: p.predictedGrade,
      confidence: p.confidence,
      color: getCompanyColor(p.company),
    }));
  }, [selectedPrediction]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-lime" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-7 h-7 text-brand-lime" />
            Grade Prediction
          </h1>
          <p className="text-slate-400 mt-1">AI-powered grade predictions with confidence scoring across PSA, BGS, SGC, and CGC</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-lime text-slate-900 rounded-lg font-medium hover:bg-brand-lime/90 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Predict New Card
        </button>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Target className="w-4 h-4" />
              Total Predictions
            </div>
            <div className="text-2xl font-bold text-slate-100">{stats.totalPredictions}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Accuracy Rate
            </div>
            <div className="text-2xl font-bold text-green-400">{stats.accuracyRate}%</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              Exact Match
            </div>
            <div className="text-2xl font-bold text-yellow-400">{stats.exactMatchRate}%</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <TrendingUp className="w-4 h-4 text-brand-lime" />
              Avg ROI
            </div>
            <div className="text-2xl font-bold text-brand-lime">{stats.averageROI}%</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Total Savings
            </div>
            <div className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.totalSavings)}</div>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      {showUpload && (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-lime" />
            Simulate Grade Prediction
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Card Name (e.g., 2023 Prizm #1)"
              value={uploadForm.cardName}
              onChange={(e) => setUploadForm((f) => ({ ...f, cardName: e.target.value }))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-lime/50"
            />
            <input
              type="text"
              placeholder="Player Name"
              value={uploadForm.player}
              onChange={(e) => setUploadForm((f) => ({ ...f, player: e.target.value }))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-lime/50"
            />
            <input
              type="text"
              placeholder="Set Name"
              value={uploadForm.set}
              onChange={(e) => setUploadForm((f) => ({ ...f, set: e.target.value }))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-lime/50"
            />
            <input
              type="number"
              placeholder="Year"
              value={uploadForm.year}
              onChange={(e) => setUploadForm((f) => ({ ...f, year: e.target.value }))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-lime/50"
            />
            <select
              value={uploadForm.sport}
              onChange={(e) => setUploadForm((f) => ({ ...f, sport: e.target.value }))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-lime/50"
            >
              <option value="Basketball">Basketball</option>
              <option value="Baseball">Baseball</option>
              <option value="Football">Football</option>
              <option value="Hockey">Hockey</option>
              <option value="Soccer">Soccer</option>
            </select>
            <button
              onClick={handlePredict}
              disabled={!uploadForm.cardName || !uploadForm.player}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-lime text-slate-900 rounded-lg font-medium hover:bg-brand-lime/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
              Run Prediction
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {([
          { key: 'predictions', label: 'Predictions', icon: Target },
          { key: 'costs', label: 'Grading Costs', icon: DollarSign },
          { key: 'population', label: 'Population Report', icon: BarChart3 },
          { key: 'roi', label: 'ROI Calculator', icon: TrendingUp },
          { key: 'tracker', label: 'Submission Tracker', icon: Clock },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === key ? 'bg-brand-lime text-slate-900' : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-slate-700/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prediction Cards List */}
          <div className="lg:col-span-1 space-y-4 max-h-[700px] overflow-y-auto pr-2">
            {predictions.map((pred) => (
              <div
                key={pred.id}
                onClick={() => setSelectedPrediction(pred)}
                className={`bg-slate-800/50 border rounded-xl p-4 cursor-pointer transition-all hover:border-brand-lime/50 ${
                  selectedPrediction?.id === pred.id ? 'border-brand-lime' : 'border-slate-700/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 truncate">{pred.player}</h3>
                    <p className="text-xs text-slate-400">{pred.cardName}</p>
                  </div>
                  <span
                    className="text-lg font-bold px-2 py-0.5 rounded"
                    style={{ color: getGradeColor(pred.predictions[0].predictedGrade) }}
                  >
                    {pred.predictions[0].predictedGrade}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {pred.overallConfidence}% confidence
                  </span>
                  <span className="text-green-400">+{pred.valueDelta.percentIncrease}% value</span>
                </div>
                {/* Subgrade mini bars */}
                <div className="mt-2 space-y-1">
                  {pred.predictions[0].subgrades.map((sg) => (
                    <div key={sg.category} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-16 truncate">{getSubgradeLabel(sg.category)}</span>
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${(sg.score / 10) * 100}%`, backgroundColor: getGradeColor(sg.score) }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 w-6 text-right">{sg.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2">
            {selectedPrediction ? (
              <div className="space-y-6">
                {/* Card Header */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-100">{selectedPrediction.player}</h2>
                      <p className="text-slate-400">{selectedPrediction.cardName} &middot; {selectedPrediction.year} {selectedPrediction.set}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">{selectedPrediction.sport}</span>
                        <span className="px-2 py-0.5 bg-green-900/50 text-green-400 rounded text-xs">
                          {selectedPrediction.overallConfidence}% confidence
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Value Increase</div>
                      <div className="text-2xl font-bold text-green-400">+{selectedPrediction.valueDelta.percentIncrease}%</div>
                      <div className="text-xs text-slate-500">
                        {formatCurrency(selectedPrediction.valueDelta.rawValue)} → {formatCurrency(selectedPrediction.valueDelta.predictedGradedValue)}
                      </div>
                    </div>
                  </div>
                  {/* Condition Notes */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedPrediction.conditionNotes.map((note, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Multi-company comparison */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-slate-100 mb-4">Grade Prediction by Company</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={distributionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="company" stroke="#94a3b8" fontSize={12} />
                        <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={12} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                          labelStyle={{ color: '#e2e8f0' }}
                          itemStyle={{ color: '#94a3b8' }}
                        />
                        <Bar dataKey="grade" name="Predicted Grade" radius={[4, 4, 0, 0]}>
                          {distributionData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Bar>
                        <Bar dataKey="confidence" name="Confidence %" yAxisId={0} hide />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {selectedPrediction.predictions.map((p) => (
                      <div key={p.company} className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <div className="text-xs font-medium mb-1" style={{ color: getCompanyColor(p.company) }}>{p.company}</div>
                        <div className="text-xl font-bold text-slate-100">{p.predictedGrade}</div>
                        <div className="text-xs text-slate-400">{p.confidence}% conf.</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radar Chart for Subgrades */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-slate-100 mb-4">Subgrade Analysis</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="category" stroke="#94a3b8" fontSize={12} />
                        <PolarRadiusAxis domain={[0, 10]} stroke="#475569" fontSize={10} />
                        <Radar name="Score" dataKey="score" stroke="#84cc16" fill="#84cc16" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Grade Distribution */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-slate-100 mb-4">Grade Probability Distribution (PSA)</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedPrediction.predictions[0].gradeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="grade" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                          labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Bar dataKey="probability" name="Probability" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Submission Recommendation */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-slate-100 mb-3">Submission Recommendation</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-slate-400">Company</div>
                      <div className="text-sm font-semibold" style={{ color: getCompanyColor(selectedPrediction.submissionRecommendation.recommendedCompany) }}>
                        {selectedPrediction.submissionRecommendation.recommendedCompany}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Tier</div>
                      <div className="text-sm font-semibold text-slate-100">{selectedPrediction.submissionRecommendation.recommendedTier.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Est. Turnaround</div>
                      <div className="text-sm font-semibold text-slate-100">{selectedPrediction.submissionRecommendation.estimatedTurnaround} days</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Est. Cost</div>
                      <div className="text-sm font-semibold text-slate-100">{formatCurrency(selectedPrediction.submissionRecommendation.estimatedCost)}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-400 italic">{selectedPrediction.submissionRecommendation.reason}</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                <Eye className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-400">Select a Prediction</h3>
                <p className="text-sm text-slate-500 mt-1">Click on a card from the list to view detailed grade analysis</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Costs Tab */}
      {activeTab === 'costs' && (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-brand-lime" />
            Grading Cost Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Tier</th>
                  {costs.map((c) => (
                    <th key={c.company} className="text-center py-3 px-4 font-medium" style={{ color: getCompanyColor(c.company) }}>
                      {c.company}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['value', 'regular', 'express', 'super_express', 'walk_through'].map((tierKey) => (
                  <tr key={tierKey} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-slate-300 font-medium capitalize">{tierKey.replace('_', ' ')}</td>
                    {costs.map((c) => {
                      const tier = c.tiers.find((t) => t.tier === tierKey);
                      return (
                        <td key={c.company} className="text-center py-3 px-4">
                          {tier && (
                            <div>
                              <div className="text-slate-100 font-semibold">{formatCurrency(tier.cost)}</div>
                              <div className="text-xs text-slate-500">{tier.turnaroundDays} days</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="border-b border-slate-700/50">
                  <td className="py-3 px-4 text-slate-300 font-medium">Shipping</td>
                  {costs.map((c) => (
                    <td key={c.company} className="text-center py-3 px-4 text-slate-100">{formatCurrency(c.shippingCost)}</td>
                  ))}
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-3 px-4 text-slate-300 font-medium">Insurance Rate</td>
                  {costs.map((c) => (
                    <td key={c.company} className="text-center py-3 px-4 text-slate-100">{c.insuranceRate}%</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-medium">Membership</td>
                  {costs.map((c) => (
                    <td key={c.company} className="text-center py-3 px-4 text-slate-100">
                      {c.membershipRequired ? `${formatCurrency(c.membershipCost)}/yr` : 'Free'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Population Tab */}
      {activeTab === 'population' && (
        <div className="space-y-6">
          {popData.slice(0, 6).map((pop) => (
            <div key={pop.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{pop.player}</h3>
                  <p className="text-xs text-slate-400">{pop.cardName} &middot; {pop.year} {pop.set}</p>
                </div>
                <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">{pop.sport}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pop.populations.map((p) => (
                  <div key={p.company} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: getCompanyColor(p.company) }}>{p.company}</span>
                      <span className="text-xs text-slate-400">{p.totalGraded.toLocaleString()} total</span>
                    </div>
                    {/* Visual bars for top grades */}
                    {p.gradeBreakdown.filter((gb) => gb.grade >= 8).map((gb) => (
                      <div key={gb.grade} className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-6">{gb.grade}</span>
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.min(gb.percentage * 3, 100)}%`, backgroundColor: getCompanyColor(p.company) }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 w-10 text-right">{gb.percentage}%</span>
                      </div>
                    ))}
                    <div className="text-xs text-green-400">Gem Rate: {p.gemRate}%</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ROI Tab */}
      {activeTab === 'roi' && (
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-lime" />
              Grading ROI Calculator
            </h3>
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm text-slate-400">Raw Card Value:</label>
              <input
                type="range"
                min={25}
                max={5000}
                step={25}
                value={roiCardValue}
                onChange={(e) => setRoiCardValue(Number(e.target.value))}
                className="flex-1 accent-brand-lime"
              />
              <span className="text-lg font-bold text-brand-lime w-24 text-right">{formatCurrency(roiCardValue)}</span>
            </div>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="grade" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="netROI" name="Net ROI" radius={[4, 4, 0, 0]}>
                    {roiData.map((entry, idx) => (
                      <Cell key={idx} fill={getRecommendationColor(entry.recommendation)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400">Grade</th>
                    <th className="text-right py-2 px-3 text-slate-400">Graded Value</th>
                    <th className="text-right py-2 px-3 text-slate-400">Grading Cost</th>
                    <th className="text-right py-2 px-3 text-slate-400">Net ROI</th>
                    <th className="text-right py-2 px-3 text-slate-400">ROI %</th>
                    <th className="text-center py-2 px-3 text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {roiData.map((row) => (
                    <tr key={row.grade} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-slate-100 font-medium">{row.grade}</td>
                      <td className="text-right py-2 px-3 text-slate-100">{formatCurrency(row.gradedValue)}</td>
                      <td className="text-right py-2 px-3 text-slate-400">{formatCurrency(row.gradingCost)}</td>
                      <td className="text-right py-2 px-3" style={{ color: row.netROI >= 0 ? '#22c55e' : '#ef4444' }}>
                        {formatCurrency(row.netROI)}
                      </td>
                      <td className="text-right py-2 px-3" style={{ color: row.roiPercent >= 0 ? '#22c55e' : '#ef4444' }}>
                        {row.roiPercent}%
                      </td>
                      <td className="text-center py-2 px-3">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: getRecommendationColor(row.recommendation) + '20', color: getRecommendationColor(row.recommendation) }}
                        >
                          {row.recommendation.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tracker Tab */}
      {activeTab === 'tracker' && (
        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-lime" />
              Submission Tracker Pipeline
            </h3>
            <div className="space-y-4">
              {tracker.map((sub) => {
                const progress = getStatusProgress(sub.status);
                return (
                  <div key={sub.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100">{sub.player}</h4>
                        <p className="text-xs text-slate-400">{sub.cardName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ color: getCompanyColor(sub.company), backgroundColor: getCompanyColor(sub.company) + '20' }}>
                          {sub.company}
                        </span>
                        <span className="text-xs text-slate-400 capitalize">{sub.tier.replace('_', ' ')}</span>
                        {sub.actualGrade !== null && (
                          <span className="text-sm font-bold" style={{ color: getGradeColor(sub.actualGrade) }}>
                            {sub.actualGrade}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all bg-brand-lime"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{getStatusLabel(sub.status)}</span>
                      <div className="flex items-center gap-4 text-slate-500">
                        <span>Est. Grade: {sub.estimatedGrade}</span>
                        <span>Value: {formatCurrency(sub.declaredValue)}</span>
                        <span>Cost: {formatCurrency(sub.cost)}</span>
                      </div>
                    </div>
                    {sub.notes && <p className="text-xs text-slate-500 mt-1 italic">{sub.notes}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Accuracy Chart */}
          {stats && (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-100 mb-4">Prediction Accuracy Trend</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyAccuracy}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[60, 100]} stroke="#94a3b8" fontSize={11} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Bar dataKey="accuracy" name="Accuracy" fill="#84cc16" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GradePredictionPage;
