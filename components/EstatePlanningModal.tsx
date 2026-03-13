import React, { useMemo } from 'react';
import {
  X,
  Shield,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CircleDot,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import {
  getBeneficiaries,
  getDocumentChecklist,
  getEstatePlan,
  getEstatePerformanceContext,
  DocumentStatus,
  EstatePerformanceContext,
} from '../lib/estatePlanningService';

interface EstatePlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_CONFIG: Record<DocumentStatus, { icon: React.ReactNode; color: string; label: string }> = {
  complete: {
    icon: <CheckCircle2 size={14} />,
    color: 'text-emerald-400',
    label: 'Complete',
  },
  pending: {
    icon: <Clock size={14} />,
    color: 'text-yellow-400',
    label: 'Pending',
  },
  expired: {
    icon: <AlertTriangle size={14} />,
    color: 'text-red-400',
    label: 'Expired',
  },
  not_started: {
    icon: <CircleDot size={14} />,
    color: 'text-slate-500',
    label: 'Not Started',
  },
};

const EstatePlanningModal: React.FC<EstatePlanningModalProps> = ({ isOpen, onClose }) => {
  const plan = useMemo(() => getEstatePlan(), []);
  const beneficiaries = useMemo(() => getBeneficiaries(), []);
  const checklist = useMemo(() => getDocumentChecklist(), []);
  const perfContext = useMemo(() => getEstatePerformanceContext(), []);

  const completedDocs = checklist.filter((d) => d.status === 'complete').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <Shield size={20} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{plan.name}</h2>
              <p className="text-xs text-slate-400">
                Last updated {new Date(plan.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Beneficiary Allocations */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-lime-400" />
              <h3 className="text-sm font-semibold text-white">Beneficiary Allocations</h3>
            </div>

            <div className="space-y-3">
              {beneficiaries.map((ben) => {
                const benValue = ben.assignedCards.reduce((s, c) => s + c.estimatedValue, 0);
                return (
                  <div
                    key={ben.id}
                    className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-white">{ben.name}</p>
                        <p className="text-xs text-slate-400">{ben.relationship}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-lime-400">
                          {ben.allocationPercent}%
                        </p>
                        <p className="text-xs text-slate-400">
                          ${benValue.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Allocation bar */}
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-lime-500 rounded-full transition-all"
                        style={{ width: `${ben.allocationPercent}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      {ben.assignedCards.length} card{ben.assignedCards.length !== 1 ? 's' : ''} assigned
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Document Checklist */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-lime-400" />
                <h3 className="text-sm font-semibold text-white">Document Checklist</h3>
              </div>
              <span className="text-xs text-slate-400">
                {completedDocs} / {checklist.length} complete
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(completedDocs / checklist.length) * 100}%` }}
              />
            </div>

            <div className="space-y-2">
              {checklist.map((item) => {
                const cfg = STATUS_CONFIG[item.status];
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-lg"
                  >
                    <span className={`mt-0.5 ${cfg.color}`}>{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstatePlanningModal;
