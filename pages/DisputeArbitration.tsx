import React, { useState, useEffect, useMemo } from 'react';
import {
  Scale, Shield, AlertTriangle, CheckCircle2, Clock, FileText,
  Users, Star, ChevronRight, Camera, MessageSquare, Receipt,
  Truck, Award, Video, Eye, Gavel, TrendingUp, BarChart3,
  XCircle, AlertCircle, ThumbsUp, UserCheck,
} from 'lucide-react';
import {
  getDisputes,
  getArbitratorPool,
  getDisputeStats,
  getDisputeStatusColor,
  getCategoryLabel,
  getResolutionLabel,
  type Dispute,
  type Arbitrator,
  type DisputeStats,
  type DisputeStatus,
  type Evidence,
} from '../lib/utils/disputeArbitrationService';

// ---- Constants ----

const TABS = ['Active Cases', 'Resolved', 'Arbitrator Pool'] as const;
type Tab = typeof TABS[number];

const STATUS_STEPS: DisputeStatus[] = ['filed', 'evidence', 'arbitration', 'deliberation', 'resolved'];

const STATUS_LABELS: Record<DisputeStatus, string> = {
  filed: 'Filed',
  evidence: 'Evidence',
  arbitration: 'Arbitration',
  deliberation: 'Deliberation',
  resolved: 'Resolved',
  appealed: 'Appealed',
};

// ---- Helpers ----

function getStatusBgColor(status: DisputeStatus): string {
  switch (status) {
    case 'filed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'evidence': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'arbitration': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'deliberation': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'appealed': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

function getEvidenceIcon(type: Evidence['type']) {
  switch (type) {
    case 'photo': return Camera;
    case 'message': return MessageSquare;
    case 'receipt': return Receipt;
    case 'tracking': return Truck;
    case 'cert': return Award;
    case 'video': return Video;
    default: return FileText;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
}

function getStatusStepIndex(status: DisputeStatus): number {
  if (status === 'appealed') return STATUS_STEPS.length; // beyond resolved
  return STATUS_STEPS.indexOf(status);
}

// ---- Components ----

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-slate-400 text-sm font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function StatusTimeline({ status }: { status: DisputeStatus }) {
  const currentIdx = getStatusStepIndex(status);
  const isAppealed = status === 'appealed';

  return (
    <div className="flex items-center gap-1 w-full">
      {STATUS_STEPS.map((step, idx) => {
        const isComplete = idx < currentIdx;
        const isCurrent = idx === currentIdx && !isAppealed;
        const isPast = idx <= currentIdx;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  isComplete
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                    ? 'bg-transparent border-blue-400 text-blue-400'
                    : 'bg-transparent border-slate-700 text-slate-600'
                }`}
              >
                {isComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span className={`text-[10px] mt-1 truncate w-full text-center ${isPast ? 'text-slate-300' : 'text-slate-600'}`}>
                {STATUS_LABELS[step]}
              </span>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 min-w-2 mt-[-12px] ${idx < currentIdx ? 'bg-green-500' : 'bg-slate-700'}`} />
            )}
          </React.Fragment>
        );
      })}
      {isAppealed && (
        <>
          <div className="h-0.5 flex-1 min-w-2 mt-[-12px] bg-red-500/50" />
          <div className="flex flex-col items-center min-w-0">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-red-500/20 border-red-500 text-red-400">
              !
            </div>
            <span className="text-[10px] mt-1 text-red-400">Appealed</span>
          </div>
        </>
      )}
    </div>
  );
}

function EvidenceItem({ ev }: { key?: React.Key; ev: Evidence }) {
  const Icon = getEvidenceIcon(ev.type);
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
      <div className="p-1.5 bg-slate-700 rounded">
        <Icon className="w-3.5 h-3.5 text-slate-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 leading-snug">{ev.description}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs text-slate-500">by {ev.submittedBy}</span>
          <span className="text-xs text-slate-600">{new Date(ev.timestamp).toLocaleDateString()}</span>
        </div>
      </div>
      {ev.verified ? (
        <span className="flex items-center gap-1 text-xs text-green-400 whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3" /> Verified
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-yellow-500 whitespace-nowrap">
          <Clock className="w-3 h-3" /> Pending
        </span>
      )}
    </div>
  );
}

function ArbitratorBadge({ arb }: { key?: React.Key; arb: Arbitrator }) {
  const roleColors: Record<string, string> = {
    lead: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    panel: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    observer: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-white">{arb.handle}</span>
        </div>
        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${roleColors[arb.role]}`}>
          {arb.role}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>{arb.casesResolved} cases</span>
        <span className="flex items-center gap-0.5">
          <Star className="w-3 h-3 text-yellow-500" /> {arb.rating}
        </span>
      </div>
      {arb.vote && (
        <div className="mt-2 p-2 bg-slate-900/60 rounded border border-slate-700/30">
          <div className="text-xs font-medium text-slate-300 mb-1">
            Vote: <span className="text-blue-400">{getResolutionLabel(arb.vote)}</span>
          </div>
          {arb.reasoning && (
            <p className="text-xs text-slate-500 leading-relaxed">{arb.reasoning}</p>
          )}
        </div>
      )}
    </div>
  );
}

function DisputeCard({ dispute }: { key?: React.Key; dispute: Dispute }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        className="w-full p-5 text-left hover:bg-slate-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBgColor(dispute.status)}`}>
                {STATUS_LABELS[dispute.status] ?? dispute.status}
              </span>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                {getCategoryLabel(dispute.category)}
              </span>
              <span className="text-xs text-slate-600">{dispute.id}</span>
            </div>
            <h3 className="text-sm font-semibold text-white leading-snug mb-2">{dispute.title}</h3>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>Filed by <span className="text-slate-300">{dispute.filedBy}</span></span>
              <span>vs <span className="text-slate-300">{dispute.respondent}</span></span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {dispute.daysOpen}d open</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold text-white">{formatCurrency(dispute.tradeValue)}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Trade Value</div>
            <div className="text-xs text-amber-400 mt-1 flex items-center gap-1 justify-end">
              <Shield className="w-3 h-3" /> {dispute.reputationStake} rep staked
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="mt-4 px-2">
          <StatusTimeline status={dispute.status} />
        </div>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-800 p-5 space-y-5">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
            <p className="text-sm text-slate-300 leading-relaxed">{dispute.description}</p>
          </div>

          {/* Evidence */}
          {dispute.evidence.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Evidence ({dispute.evidence.length})
              </h4>
              <div className="space-y-2">
                {dispute.evidence.map(ev => (
                  <EvidenceItem key={ev.id} ev={ev} />
                ))}
              </div>
            </div>
          )}

          {/* Arbitrators */}
          {dispute.arbitrators.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Arbitration Panel ({dispute.arbitrators.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {dispute.arbitrators.map(arb => (
                  <ArbitratorBadge key={arb.userId} arb={arb} />
                ))}
              </div>
            </div>
          )}

          {/* Resolution */}
          {dispute.resolution && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gavel className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">
                  Resolution: {getResolutionLabel(dispute.resolution)}
                </span>
                {dispute.resolutionDate && (
                  <span className="text-xs text-slate-500 ml-auto">{dispute.resolutionDate}</span>
                )}
              </div>
              {dispute.resolutionDetails && (
                <p className="text-sm text-slate-300 leading-relaxed">{dispute.resolutionDetails}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ArbitratorLeaderboard({ arbitrators }: { arbitrators: Arbitrator[] }) {
  const sorted = useMemo(
    () => [...arbitrators].sort((a, b) => b.casesResolved - a.casesResolved),
    [arbitrators],
  );

  return (
    <div className="space-y-3">
      {sorted.map((arb, idx) => (
        <div key={arb.userId} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
            idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/40'
              : idx === 1 ? 'bg-slate-400/20 text-slate-300 border-2 border-slate-400/40'
              : idx === 2 ? 'bg-amber-600/20 text-amber-500 border-2 border-amber-600/40'
              : 'bg-slate-800 text-slate-500 border-2 border-slate-700'
          }`}>
            #{idx + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">{arb.handle}</h3>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                arb.role === 'lead' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : arb.role === 'panel' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }`}>
                {arb.role}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {arb.specialties.map(s => (
                <span key={s} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold text-white">{arb.casesResolved}</div>
            <div className="text-[10px] text-slate-500">cases resolved</div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-sm font-semibold text-yellow-400">
              <Star className="w-4 h-4" /> {arb.rating}
            </div>
            <div className="text-[10px] text-slate-500">rating</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Main Page ----

const DisputeArbitration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Active Cases');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [arbitrators, setArbitrators] = useState<Arbitrator[]>([]);
  const [stats, setStats] = useState<DisputeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setDisputes(getDisputes());
      setArbitrators(getArbitratorPool());
      setStats(getDisputeStats());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const activeCases = useMemo(
    () => disputes.filter(d => d.status !== 'resolved'),
    [disputes],
  );

  const resolvedCases = useMemo(
    () => disputes.filter(d => d.status === 'resolved'),
    [disputes],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 rounded-xl">
            <Scale className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Community Dispute Arbitration</h1>
            <p className="text-slate-400 text-sm mt-0.5">Peer-driven resolution for trade disputes with evidence review and binding arbitration</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={BarChart3}
              label="Total Disputes"
              value={stats.totalDisputes}
              sub={`${stats.activeDisputes} currently active`}
              color="bg-blue-500/20 text-blue-400"
            />
            <StatCard
              icon={CheckCircle2}
              label="Resolved"
              value={stats.resolvedDisputes}
              sub={`${stats.satisfactionRate}% satisfaction`}
              color="bg-green-500/20 text-green-400"
            />
            <StatCard
              icon={Clock}
              label="Avg Resolution"
              value={`${stats.avgResolutionDays} days`}
              sub={`${stats.dismissalRate}% dismissal rate`}
              color="bg-amber-500/20 text-amber-400"
            />
            <StatCard
              icon={Users}
              label="Arbitrator Pool"
              value={stats.arbitratorPool}
              sub={`${stats.repeatOffenders} repeat offenders flagged`}
              color="bg-purple-500/20 text-purple-400"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab}
              {tab === 'Active Cases' && activeCases.length > 0 && (
                <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
                  {activeCases.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'Active Cases' && (
          <div className="space-y-4">
            {activeCases.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-400">No active disputes at this time.</p>
              </div>
            ) : (
              activeCases.map(d => <DisputeCard key={d.id} dispute={d} />)
            )}
          </div>
        )}

        {activeTab === 'Resolved' && (
          <div className="space-y-4">
            {resolvedCases.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No resolved disputes to display.</p>
              </div>
            ) : (
              resolvedCases.map(d => <DisputeCard key={d.id} dispute={d} />)
            )}
          </div>
        )}

        {activeTab === 'Arbitrator Pool' && (
          <div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Arbitrator Leaderboard</h3>
              </div>
              <p className="text-xs text-slate-500">
                Community members who have earned the right to arbitrate disputes through consistent, fair participation and high satisfaction ratings.
              </p>
            </div>
            <ArbitratorLeaderboard arbitrators={arbitrators} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeArbitration;
