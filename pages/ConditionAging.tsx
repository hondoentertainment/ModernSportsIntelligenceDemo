import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  Thermometer,
  Archive,
  Eye,
  BadgeDollarSign,
} from 'lucide-react';
import {
  getCollectionHealthReport,
  getAllCards,
  getStorageEnvironments,
  getStorageRecommendations,
  getEnvironmentalRisks,
  getInsuranceTriggers,
  getValueAtRisk,
  getDegradationFactors,
  compareStorageMethods,
  getCaseLabel,
  type CollectionHealthReport,
  type CardAgingProfile,
  type StorageSetup,
  type StorageRecommendation,
  type EnvironmentalRisk,
  type InsuranceTrigger,
  type StorageComparison,
} from '../lib/core/conditionAgingService.ts';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

const ConditionAging: React.FC = () => {
  const [healthReport, setHealthReport] = useState<CollectionHealthReport | null>(null);
  const [cards, setCards] = useState<CardAgingProfile[]>([]);
  const [_environments, setEnvironments] = useState<StorageSetup[]>([]);
  const [recommendations, setRecommendations] = useState<StorageRecommendation[]>([]);
  const [envRisks, setEnvRisks] = useState<EnvironmentalRisk[]>([]);
  const [triggers, setTriggers] = useState<InsuranceTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardAgingProfile | null>(null);

  useEffect(() => {
    try {
      setHealthReport(getCollectionHealthReport());
      setCards(getAllCards());
      setEnvironments(getStorageEnvironments());
      setRecommendations(getStorageRecommendations());
      setEnvRisks(getEnvironmentalRisks());
      setTriggers(getInsuranceTriggers());
      setLoading(false);
    } catch {
      setError('Failed to load Condition Aging data');
      setLoading(false);
    }
  }, []);

  const valueAtRiskData = useMemo(() => getValueAtRisk(50), []);

  const storageComparison = useMemo(() => {
    if (!selectedCard && cards.length > 0) return compareStorageMethods(cards[0]);
    if (selectedCard) return compareStorageMethods(selectedCard);
    return [] as StorageComparison[];
  }, [selectedCard, cards]);

  const atRiskCards = useMemo(() =>
    cards.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical')
      .sort((a, b) => (b.riskLevel === 'critical' ? 1 : 0) - (a.riskLevel === 'critical' ? 1 : 0)),
    [cards]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Condition Aging &amp; Degradation Model...</p>
        </div>
      </div>
    );
  }

  if (error || !healthReport) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error ?? 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan-500/20">
          <ShieldCheck size={24} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Card Condition Aging &amp; Storage Degradation</h1>
          <p className="text-sm text-slate-400">Preservation scoring, degradation projection &amp; storage optimization &mdash; Phase 135</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Preservation</p>
          <p className={`text-2xl font-bold ${healthReport.overallScore >= 80 ? 'text-emerald-400' : healthReport.overallScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
            {healthReport.overallScore}
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Cards</p>
          <p className="text-2xl font-bold text-blue-400">{healthReport.totalCards}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">At Risk</p>
          <p className="text-2xl font-bold text-rose-400">{healthReport.cardsAtRisk}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">10yr Loss</p>
          <p className="text-2xl font-bold text-red-400">-${healthReport.projectedLoss10yr.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Optimal %</p>
          <p className="text-2xl font-bold text-emerald-400">{healthReport.optimalStoragePct}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Recommendations</p>
          <p className="text-2xl font-bold text-amber-400">{healthReport.recommendations}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Ins. Triggers</p>
          <p className="text-2xl font-bold text-purple-400">{healthReport.insuranceTriggers}</p>
        </div>
      </div>

      {/* Aging Projection Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingDown size={18} className="text-cyan-400" />
          Collection Value Projection by Storage Quality
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={valueAtRiskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Years', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="optimal" stroke="#10b981" strokeWidth={2} dot={false} name="Optimal Storage" />
              <Line type="monotone" dataKey="current" stroke="#f59e0b" strokeWidth={2} dot={false} name="Current Storage" />
              <Line type="monotone" dataKey="poor" stroke="#ef4444" strokeWidth={2} dot={false} name="Poor Storage" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* At-Risk Cards + Storage Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At-Risk Cards */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-400" />
            At-Risk Cards
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {atRiskCards.map(card => {
              const factors = getDegradationFactors(card);
              return (
                <div
                  key={card.id}
                  className={`bg-slate-900/50 border rounded-xl p-4 cursor-pointer transition-colors hover:bg-slate-900/80 ${
                    card.riskLevel === 'critical' ? 'border-red-500/40' : 'border-amber-500/30'
                  }`}
                  onClick={() => setSelectedCard(card)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-white truncate mr-2">{card.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                      card.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>{card.riskLevel}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-2">
                    <span>Grade: {card.currentGrade}</span>
                    <span>${card.currentValue.toLocaleString()}</span>
                    <span>{getCaseLabel(card.caseType)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {factors.map(f => (
                      <span key={f.factor} className={`text-[9px] px-1.5 py-0.5 rounded ${
                        f.severity > 60 ? 'bg-red-500/15 text-red-400' : f.severity > 40 ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-700 text-slate-400'
                      }`}>{f.label}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Storage Comparison Table */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
            <Archive size={18} className="text-blue-400" />
            Storage Method Comparison
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Comparing for: {selectedCard?.name ?? cards[0]?.name ?? 'Select a card'}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700/50">
                  <th className="text-left py-2 pr-2">Method</th>
                  <th className="text-right py-2 px-2">Protection</th>
                  <th className="text-right py-2 px-2">$/mo</th>
                  <th className="text-right py-2 px-2">10yr Grade</th>
                  <th className="text-right py-2 pl-2">Value Kept</th>
                </tr>
              </thead>
              <tbody>
                {storageComparison.map((sc, i) => (
                  <tr key={i} className="border-b border-slate-700/30">
                    <td className="py-2 pr-2 text-slate-300 font-medium">{sc.method}</td>
                    <td className="py-2 px-2 text-right">
                      <span className={`${sc.protectionMultiplier >= 85 ? 'text-emerald-400' : sc.protectionMultiplier >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {sc.protectionMultiplier}%
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right text-slate-400">${sc.costPerMonth}</td>
                    <td className="py-2 px-2 text-right text-slate-300">{sc.projectedGrade10yr}</td>
                    <td className="py-2 pl-2 text-right">
                      <span className={`font-bold ${sc.valuePreserved >= 95 ? 'text-emerald-400' : sc.valuePreserved >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                        {sc.valuePreserved}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Environmental Risks */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Thermometer size={18} className="text-amber-400" />
          Environmental Risk Assessment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {envRisks.map(risk => (
            <div key={risk.id} className={`bg-slate-900/50 border rounded-xl p-4 ${
              risk.severity === 'critical' ? 'border-red-500/40' : risk.severity === 'high' ? 'border-amber-500/30' : 'border-slate-700/50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-white">{risk.factor}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  risk.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                  risk.severity === 'high' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'
                }`}>{risk.severity}</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{risk.description}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span>{risk.affectedCards} cards affected</span>
                <span className="text-red-400">Est. impact: ${risk.estimatedImpact.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-emerald-400/70 italic">{risk.mitigation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations + Insurance Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Eye size={18} className="text-cyan-400" />
            Storage Recommendations
          </h2>
          <div className="space-y-3">
            {recommendations.map(rec => (
              <div key={rec.id} className={`bg-slate-800/50 border rounded-xl p-4 ${
                rec.urgency === 'critical' ? 'border-red-500/30' :
                rec.urgency === 'high' ? 'border-amber-500/25' : 'border-slate-700/50'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-white truncate mr-2">{rec.cardName}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                    rec.urgency === 'critical' ? 'bg-red-500/20 text-red-400' :
                    rec.urgency === 'high' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>{rec.urgency}</span>
                </div>
                <p className="text-xs text-slate-500 mb-1">Current: {rec.currentSetup}</p>
                <p className="text-xs text-emerald-400/80 mb-1">Recommended: {rec.recommendedSetup}</p>
                <p className="text-[10px] text-slate-400 italic mb-2">{rec.reason}</p>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Cost: ${rec.estimatedCost}</span>
                  <span className="text-emerald-400 font-bold">10yr savings: ${rec.valueSaved10yr.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <BadgeDollarSign size={18} className="text-purple-400" />
            Insurance Triggers
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {triggers.slice(0, 10).map(trigger => (
              <div key={trigger.id} className={`bg-slate-800/50 border rounded-xl p-4 ${
                trigger.urgency === 'critical' ? 'border-red-500/30' :
                trigger.urgency === 'high' ? 'border-amber-500/25' : 'border-slate-700/50'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    trigger.triggerType === 'grade_drop' ? 'bg-red-500/20 text-red-400' :
                    trigger.triggerType === 'value_threshold' ? 'bg-purple-500/20 text-purple-400' :
                    trigger.triggerType === 'environmental' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>{trigger.triggerType.replace('_', ' ')}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    trigger.urgency === 'critical' ? 'bg-red-500/20 text-red-400' :
                    trigger.urgency === 'high' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'
                  }`}>{trigger.urgency}</span>
                </div>
                <p className="text-xs font-bold text-white mb-1 truncate">{trigger.cardName}</p>
                <p className="text-[10px] text-slate-400 mb-1">{trigger.description}</p>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Value: ${trigger.currentValue.toLocaleString()}</span>
                  <span className="text-emerald-400/70 italic truncate ml-2">{trigger.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionAging;
