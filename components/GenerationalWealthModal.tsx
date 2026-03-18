import React, { useMemo, useState } from 'react';
import {
  X,
  Shield,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  TrendingUp,
  Calendar,
  Landmark,
  ArrowRight,
} from 'lucide-react';
import {
  getEstatePlan,
  getEstateSummary,
  getTaxStrategies,
  calculateStepUpBasis,
  formatCurrency,
  type EstatePlan,
  type EstateSummary,
  type TaxStrategy,
  type StepUpBasis,
} from '../lib/utils/generationalWealthService';

interface GenerationalWealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalTab = 'summary' | 'beneficiaries' | 'strategies';

const GenerationalWealthModal: React.FC<GenerationalWealthModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('summary');

  const plan: EstatePlan = useMemo(() => getEstatePlan(), []);
  const summary: EstateSummary = useMemo(() => getEstateSummary(), []);
  const strategies: TaxStrategy[] = useMemo(() => getTaxStrategies(), []);
  const stepUp: StepUpBasis[] = useMemo(() => calculateStepUpBasis(), []);

  const totalStepUpSavings = useMemo(
    () => stepUp.reduce((sum, s) => sum + s.taxSavings, 0),
    [stepUp]
  );

  if (!isOpen) return null;

  const healthColors: Record<string, string> = {
    excellent: 'text-emerald-400',
    good: 'text-blue-400',
    needs_attention: 'text-amber-400',
    critical: 'text-red-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Shield size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Estate Summary</h2>
              <p className="text-xs text-slate-400">Quick overview of your estate plan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 border-b border-slate-700 shrink-0">
          {(
            [
              { id: 'summary' as ModalTab, label: 'Summary', icon: <Shield size={14} /> },
              { id: 'beneficiaries' as ModalTab, label: 'Beneficiaries', icon: <Users size={14} /> },
              { id: 'strategies' as ModalTab, label: 'Strategies', icon: <TrendingUp size={14} /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'summary' && (
            <>
              {/* KPI Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={14} className="text-emerald-400" />
                    <span className="text-xs text-slate-400">Estate Value</span>
                  </div>
                  <p className="text-xl font-bold text-white">{formatCurrency(summary.totalValue)}</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-amber-400" />
                    <span className="text-xs text-slate-400">Tax Exposure</span>
                  </div>
                  <p className="text-xl font-bold text-white">{formatCurrency(summary.taxExposure)}</p>
                  <p className="text-xs text-slate-500">{summary.taxExposurePercent.toFixed(1)}% effective</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={14} className="text-blue-400" />
                    <span className="text-xs text-slate-400">Step-Up Savings</span>
                  </div>
                  <p className="text-xl font-bold text-white">{formatCurrency(totalStepUpSavings)}</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} className="text-cyan-400" />
                    <span className="text-xs text-slate-400">Next Review</span>
                  </div>
                  <p className="text-xl font-bold text-white">{summary.nextReviewDate}</p>
                </div>
              </div>

              {/* Estate Health */}
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Estate Health</span>
                  <span className={`text-sm font-semibold ${healthColors[summary.estateHealth]}`}>
                    {summary.estateHealth.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      summary.estateHealth === 'excellent'
                        ? 'bg-emerald-500'
                        : summary.estateHealth === 'good'
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                    style={{
                      width: `${
                        summary.estateHealth === 'excellent'
                          ? 95
                          : summary.estateHealth === 'good'
                          ? 75
                          : 50
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Recommendations</h3>
                <div className="space-y-2">
                  {summary.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-700/30 rounded-lg p-3">
                      <ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents Overview */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Documents</h3>
                <div className="grid grid-cols-2 gap-2">
                  {plan.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 bg-slate-700/30 rounded-lg p-3">
                      <FileText size={14} className="text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-white truncate">{doc.title.split('—')[0].trim()}</p>
                        <span
                          className={`text-xs ${
                            doc.status === 'final'
                              ? 'text-emerald-400'
                              : doc.status === 'review'
                              ? 'text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'beneficiaries' && (
            <>
              {/* Allocation Bar */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Allocation</h3>
                <div className="flex rounded-full h-5 overflow-hidden bg-slate-700">
                  {plan.beneficiaries.map((b) => (
                    <div
                      key={b.id}
                      className={`h-full ${
                        b.relationship === 'spouse'
                          ? 'bg-pink-500'
                          : b.relationship === 'child'
                          ? 'bg-blue-500'
                          : b.relationship === 'charity'
                          ? 'bg-emerald-500'
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${b.allocationPercent}%` }}
                      title={`${b.name}: ${b.allocationPercent}%`}
                    />
                  ))}
                </div>
              </div>

              {/* Beneficiary List */}
              <div className="space-y-3">
                {plan.beneficiaries.map((b) => (
                  <div key={b.id} className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users size={16} className={
                          b.relationship === 'spouse'
                            ? 'text-pink-400'
                            : b.relationship === 'child'
                            ? 'text-blue-400'
                            : 'text-emerald-400'
                        } />
                        <div>
                          <p className="text-white font-medium text-sm">{b.name}</p>
                          <p className="text-xs text-slate-500 capitalize">{b.relationship}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{b.allocationPercent}%</p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency((plan.totalValue * b.allocationPercent) / 100)}
                        </p>
                      </div>
                    </div>
                    {/* Assigned assets */}
                    {plan.bequests
                      .filter((bq) => bq.beneficiaryId === b.id)
                      .map((bq) => (
                        <div
                          key={bq.id}
                          className="flex items-center justify-between text-xs bg-slate-600/30 rounded-lg px-3 py-1.5 mt-1.5"
                        >
                          <span className="text-slate-300 truncate mr-2">{bq.assetName}</span>
                          <span className="text-emerald-400 shrink-0">
                            {formatCurrency(bq.estimatedValue)}
                          </span>
                        </div>
                      ))}
                    <div className="flex gap-2 mt-2">
                      {b.contingent && (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-xs">
                          Contingent
                        </span>
                      )}
                      {b.minorProtection && (
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full text-xs">
                          Minor
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'strategies' && (
            <>
              <div className="space-y-3">
                {strategies
                  .filter((s) => s.recommended)
                  .map((strat) => (
                    <div
                      key={strat.id}
                      className="bg-slate-700/50 border border-emerald-500/20 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold text-sm">{strat.name}</h3>
                        <span className="text-emerald-400 font-semibold text-sm shrink-0 ml-2">
                          {formatCurrency(strat.potentialSavings)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{strat.description}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            strat.complexity === 'low'
                              ? 'bg-green-500/10 text-green-400'
                              : strat.complexity === 'medium'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {strat.complexity} complexity
                        </span>
                        <span className="text-slate-500">{strat.timeframe}</span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Step-Up Summary */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-400 mb-2">Step-Up Basis Savings</h3>
                <p className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(totalStepUpSavings)}
                </p>
                <p className="text-xs text-blue-300">
                  Capital gains tax your heirs avoid through stepped-up cost basis across{' '}
                  {stepUp.length} assets.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4 shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Last updated: {plan.updatedAt}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors"
            >
              View Full Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationalWealthModal;
