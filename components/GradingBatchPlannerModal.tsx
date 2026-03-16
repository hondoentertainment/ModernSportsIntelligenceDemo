import React, { useState, useMemo } from 'react';
import {
  X,
  ClipboardList,
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  Award,
  ArrowUpDown,
  Percent,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  MinusCircle,
  XCircle,
  Package,
  Truck,
  Eye,
  ChevronDown,
  ChevronUp,
  Star,
  Filter,
  Info,
} from 'lucide-react';
import {
  getBatchCards,
  getServiceOptions,
  getBatchSummary,
  getGradeDistribution,
  getSubmissionHistory,
} from '../lib/gradingBatchPlannerService';
import type {
  BatchCard,
  ServiceOption,
  BatchSummary,
  GradeDistribution,
  SubmissionHistory,
  GradingCompany,
} from '../lib/gradingBatchPlannerService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const priorityConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  'must-grade': { color: 'text-green-400 bg-green-500/20', icon: <CheckCircle2 size={12} />, label: 'MUST GRADE' },
  'strong-candidate': { color: 'text-blue-400 bg-blue-500/20', icon: <Star size={12} />, label: 'STRONG' },
  'borderline': { color: 'text-amber-400 bg-amber-500/20', icon: <AlertCircle size={12} />, label: 'BORDERLINE' },
  'skip': { color: 'text-red-400 bg-red-500/20', icon: <XCircle size={12} />, label: 'SKIP' },
};

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  'submitted': { color: 'text-blue-400 bg-blue-500/20', icon: <Package size={12} /> },
  'in-transit': { color: 'text-amber-400 bg-amber-500/20', icon: <Truck size={12} /> },
  'grading': { color: 'text-indigo-400 bg-indigo-500/20', icon: <Eye size={12} /> },
  'shipped-back': { color: 'text-green-400 bg-green-500/20', icon: <Truck size={12} /> },
  'received': { color: 'text-slate-400 bg-slate-500/20', icon: <CheckCircle2 size={12} /> },
};

type Tab = 'batch' | 'services' | 'history' | 'distribution';

const GradingBatchPlannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('batch');
  const [selectedCompany, setSelectedCompany] = useState<GradingCompany | 'all'>('all');
  const [sortBy, setSortBy] = useState<'roi' | 'priority' | 'value'>('priority');

  const cards = useMemo(() => {
    const allCards = getBatchCards();
    return [...allCards].sort((a, b) => {
      if (sortBy === 'roi') return b.projectedRoi - a.projectedRoi;
      if (sortBy === 'value') return b.gradedValue - a.gradedValue;
      const order = { 'must-grade': 0, 'strong-candidate': 1, 'borderline': 2, 'skip': 3 };
      return (order[a.priority] || 3) - (order[b.priority] || 3);
    });
  }, [sortBy]);

  const services = useMemo(() => {
    return selectedCompany === 'all' ? getServiceOptions() : getServiceOptions(selectedCompany as GradingCompany);
  }, [selectedCompany]);

  const summary = useMemo(() => getBatchSummary(), []);
  const distribution = useMemo(() => getGradeDistribution(), []);
  const history = useMemo(() => getSubmissionHistory(), []);

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'batch', label: 'Batch Cards', icon: <ClipboardList size={16} /> },
    { id: 'services', label: 'Service Tiers', icon: <Award size={16} /> },
    { id: 'distribution', label: 'Grade Dist.', icon: <BarChart3 size={16} /> },
    { id: 'history', label: 'History', icon: <Clock size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-brand-charcoal border border-slate-700 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <ClipboardList size={22} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Grading Batch Planner</h2>
              <p className="text-xs text-slate-400">Optimize submissions for maximum ROI across grading companies</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-5 gap-3 p-4 border-b border-slate-700/50 bg-slate-800/30">
          {[
            { label: 'Cards', value: summary.totalCards.toString(), icon: <ClipboardList size={14} />, color: 'text-emerald-400' },
            { label: 'Total Cost', value: `$${summary.totalCost}`, icon: <DollarSign size={14} />, color: 'text-slate-400' },
            { label: 'Proj. ROI', value: `$${summary.projectedTotalRoi.toLocaleString()}`, icon: <TrendingUp size={14} />, color: 'text-green-400' },
            { label: 'Break-Even', value: `${(summary.breakEvenRate * 100).toFixed(0)}%`, icon: <Target size={14} />, color: 'text-amber-400' },
            { label: 'Turnaround', value: summary.estimatedTurnaround, icon: <Clock size={14} />, color: 'text-blue-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className={`flex items-center justify-center gap-1 text-xs mb-1 ${stat.color}`}>
                {stat.icon} {stat.label}
              </div>
              <div className="text-base font-bold text-slate-100">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-700/50 text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'batch' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">{cards.length} cards in batch queue</span>
                <div className="flex gap-2">
                  {(['priority', 'roi', 'value'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        sortBy === s ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s === 'roi' ? 'ROI' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {cards.map(card => {
                const pc = priorityConfig[card.priority];
                return (
                  <div key={card.id} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 ${pc.color}`}>
                          {pc.icon} {pc.label}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-200">{card.cardName}</h4>
                      </div>
                      <span className="text-sm font-bold text-green-400">+${card.projectedRoi}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-3 text-xs">
                      <div><span className="text-slate-500">Raw Value</span><div className="text-slate-300 font-medium">${card.rawValue}</div></div>
                      <div><span className="text-slate-500">Est. Grade</span><div className="text-slate-300 font-medium">{card.estimatedGrade}</div></div>
                      <div><span className="text-slate-500">Probability</span><div className="text-slate-300 font-medium">{(card.gradeProbability * 100).toFixed(0)}%</div></div>
                      <div><span className="text-slate-500">Graded Value</span><div className="text-emerald-400 font-medium">${card.gradedValue}</div></div>
                      <div><span className="text-slate-500">ROI</span><div className="text-green-400 font-medium">+{((card.projectedRoi / card.rawValue) * 100).toFixed(0)}%</div></div>
                    </div>
                    {card.notes && <p className="mt-2 text-[11px] text-slate-500 italic">{card.notes}</p>}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Filter size={14} className="text-slate-400" />
                <span className="text-sm text-slate-400">Filter:</span>
                {(['all', 'PSA', 'BGS', 'SGC', 'CGC'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCompany(c)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      selectedCompany === c ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {c === 'all' ? 'All' : c}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3">
                {services.map((s, i) => (
                  <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center w-16">
                        <div className="text-sm font-bold text-slate-200">{s.company}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{s.tier}</div>
                      </div>
                      <div className="grid grid-cols-4 gap-6 text-xs">
                        <div><span className="text-slate-500">Cost/Card</span><div className="text-slate-200 font-medium">${s.costPerCard}</div></div>
                        <div><span className="text-slate-500">Turnaround</span><div className="text-slate-200 font-medium">{s.turnaroundDays}d</div></div>
                        <div><span className="text-slate-500">Insurance</span><div className="text-slate-200 font-medium">${s.insuranceIncluded.toLocaleString()}</div></div>
                        <div><span className="text-slate-500">Bulk Discount</span><div className="text-green-400 font-medium">{s.bulkDiscount > 0 ? `${(s.bulkDiscount * 100).toFixed(0)}%` : '—'}</div></div>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-lg text-xs font-medium transition-colors">
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'distribution' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={14} className="text-slate-400" />
                <span className="text-sm text-slate-400">Estimated grade distribution for current batch</span>
              </div>
              {distribution.filter(d => d.count > 0).map((d, i) => (
                <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-slate-100">{d.grade}</span>
                      <span className="text-sm text-slate-400">{d.count} cards</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-400">+${d.avgRoi} avg ROI</div>
                      <div className="text-xs text-slate-400">${d.totalProjectedValue.toLocaleString()} total value</div>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${(d.count / 10) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {history.map(h => {
                const sc = statusConfig[h.status];
                return (
                  <div key={h.id} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-200">{h.company} — {h.tier}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 ${sc.color}`}>
                          {sc.icon} {h.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{h.date}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-xs">
                      <div><span className="text-slate-500">Cards</span><div className="text-slate-300 font-medium">{h.cardCount}</div></div>
                      <div><span className="text-slate-500">Total Cost</span><div className="text-slate-300 font-medium">${h.totalCost}</div></div>
                      <div><span className="text-slate-500">Avg Grade</span><div className="text-emerald-400 font-medium">{h.avgGrade}</div></div>
                      <div><span className="text-slate-500">Return Rate</span><div className="text-slate-300 font-medium">{(h.returnRate * 100).toFixed(0)}%</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700/50 bg-slate-800/30">
          <span className="text-xs text-slate-500">Grade predictions are estimates — actual results may vary</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors">
              Export Batch
            </button>
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white font-semibold transition-colors">
              Submit Batch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingBatchPlannerModal;
