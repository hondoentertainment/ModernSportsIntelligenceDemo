// @ts-nocheck
// Phase 112: AI Deal Negotiation Agent — Modal (5-tab layout)
// Phase 16: negotiation playbooks (strategy templates) on Negotiations + Analytics tabs.
import React, { useState, useMemo } from 'react';
import {
  X,
  Bot,
  Target,
  Activity,
  MessageSquare,
  Shield,
  BarChart3,
  Play,
  Pause,
  Plus,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Eye,
  TrendingUp,
  Package,
  Zap,
  ArrowRight,
  ScrollText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  getActiveCampaigns,
  getAgentActivityFeed,
  getAllNegotiations,
  getAllEscrow,
  getAcquisitionAnalytics,
  getAllAcquisitionResults,
  pauseCampaign,
  resumeCampaign,
  createCampaign,
  getSmartPricingRecommendation,
  AUTONOMOUS_ACQUISITION_DATA_MODE,
  AUTONOMOUS_ACQUISITION_DISCLOSURE,
  AcquisitionCampaign,
  NegotiationStage,
  EscrowState,
  AgentActionType,
  CampaignStatus,
  MarketplacePlatform,
  UrgencyLevel,
  type AgentActivity,
  type NegotiationSession,
  type EscrowTransaction,
  type AcquisitionResult,
  type AcquisitionAnalytics,
} from '../lib/trading/autonomousAcquisitionService';
import {
  getNegotiationPlaybooks,
  getSelectedPlaybookId,
  setSelectedPlaybookId,
  getPlaybookById,
  getSelectedPlaybook,
} from '../lib/trading/negotiationPlaybooks';
import { showToast } from '../lib/utils/toast';

// ── Types ───────────────────────────────────────────────────────────────────────

interface AutonomousAcquisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'campaigns' | 'activity' | 'negotiations' | 'escrow' | 'analytics';

const TABS: { id: TabId; label: string; icon: React.FC<{ size?: number }> }[] = [
  { id: 'campaigns', label: 'Campaigns', icon: Target },
  { id: 'activity', label: 'Activity Feed', icon: Activity },
  { id: 'negotiations', label: 'Negotiations', icon: MessageSquare },
  { id: 'escrow', label: 'Escrow', icon: Shield },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

// ── Helpers ─────────────────────────────────────────────────────────────────────

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; bg: string; border: string }> = {
  active: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  paused: { label: 'Paused', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  completed: { label: 'Completed', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  failed: { label: 'Failed', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  pending_review: { label: 'Review', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
};

const STAGE_CONFIG: Record<NegotiationStage, { label: string; color: string; bg: string }> = {
  opening: { label: 'Opening', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  counter: { label: 'Counter', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  final_offer: { label: 'Final Offer', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  accepted: { label: 'Accepted', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/20' },
  expired: { label: 'Expired', color: 'text-slate-400', bg: 'bg-slate-500/20' },
};

const ESCROW_CONFIG: Record<EscrowState, { label: string; color: string }> = {
  pending_payment: { label: 'Pending Payment', color: 'text-amber-400' },
  payment_held: { label: 'Payment Held', color: 'text-blue-400' },
  item_shipped: { label: 'Shipped', color: 'text-cyan-400' },
  authentication_in_progress: { label: 'Authenticating', color: 'text-purple-400' },
  authentication_passed: { label: 'Auth Passed', color: 'text-emerald-400' },
  authentication_failed: { label: 'Auth Failed', color: 'text-red-400' },
  funds_released: { label: 'Complete', color: 'text-emerald-400' },
  refunded: { label: 'Refunded', color: 'text-red-400' },
};

const ACTION_ICON_CLS: Record<AgentActionType, string> = {
  scan: 'text-blue-400',
  found: 'text-emerald-400',
  analyze: 'text-purple-400',
  offer: 'text-amber-400',
  counter_received: 'text-orange-400',
  counter_sent: 'text-lime-400',
  accepted: 'text-emerald-400',
  rejected: 'text-red-400',
  escrow: 'text-cyan-400',
  completed: 'text-emerald-400',
  alert: 'text-red-400',
};

const PIE_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

// ── Tab: Campaigns ──────────────────────────────────────────────────────────────

const CampaignsTab: React.FC = () => {
  const [campaigns, setCampaigns] = useState<AcquisitionCampaign[]>(() => getActiveCampaigns());
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Create campaign form state
  const [newPlayer, setNewPlayer] = useState('');
  const [newSet, setNewSet] = useState('');
  const [newGrade, setNewGrade] = useState('PSA 10');
  const [newMax, setNewMax] = useState('');
  const [newROI, setNewROI] = useState('20');
  const [newUrgency, setNewUrgency] = useState<UrgencyLevel>('medium');

  const handleCreate = () => {
    if (!newPlayer || !newMax) return;
    createCampaign({
      player: newPlayer,
      set: newSet || undefined,
      grade: newGrade,
      maxPrice: parseFloat(newMax),
      targetROI: parseFloat(newROI),
      urgency: newUrgency,
      platforms: ['eBay', 'COMC', 'MySlabs'] as MarketplacePlatform[],
    });
    setCampaigns(getActiveCampaigns());
    setShowCreate(false);
    setNewPlayer('');
    setNewSet('');
    setNewMax('');
  };

  const handlePause = (id: string) => {
    pauseCampaign(id);
    setCampaigns(getActiveCampaigns());
  };

  const handleResume = (id: string) => {
    resumeCampaign(id);
    setCampaigns(getActiveCampaigns());
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-200">
        {AUTONOMOUS_ACQUISITION_DISCLOSURE}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{campaigns.length} campaigns total</p>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          <Plus size={12} />
          New Campaign
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-slate-800/70 border border-violet-500/30 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-violet-400">Create New Campaign</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 uppercase block mb-1">Player *</label>
              <input value={newPlayer} onChange={e => setNewPlayer(e.target.value)} placeholder="e.g. Mike Trout" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase block mb-1">Set</label>
              <input value={newSet} onChange={e => setNewSet(e.target.value)} placeholder="e.g. Topps Chrome" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase block mb-1">Grade</label>
              <input value={newGrade} onChange={e => setNewGrade(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase block mb-1">Max Price *</label>
              <input value={newMax} onChange={e => setNewMax(e.target.value)} type="number" placeholder="$" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase block mb-1">Target ROI %</label>
              <input value={newROI} onChange={e => setNewROI(e.target.value)} type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase block mb-1">Urgency</label>
              <select value={newUrgency} onChange={e => setNewUrgency(e.target.value as UrgencyLevel)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleCreate} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold transition-colors">Launch Campaign</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-semibold transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Campaign list */}
      <div className="space-y-2">
        {campaigns.map(c => {
          const statusCfg = STATUS_CONFIG[c.status];
          const isExpanded = expanded === c.id;
          return (
            <div key={c.id} className="bg-slate-800/70 border border-slate-700/50 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : c.id)}
                className="w-full text-left p-4 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-white truncate">{c.name}</span>
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                        {statusCfg.label.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span>{c.listingsFound} found</span>
                      <span>&middot;</span>
                      <span>{c.negotiationsActive} negotiating</span>
                      <span>&middot;</span>
                      <span>{c.acquisitions} acquired</span>
                      {c.totalSaved > 0 && (
                        <>
                          <span>&middot;</span>
                          <span className="text-emerald-400">${c.totalSaved} saved</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-violet-500" style={{ width: `${c.progressPct}%` }} />
                      </div>
                      <span className="text-[9px] text-slate-500">{c.progressPct}%</span>
                    </div>
                    {isExpanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-700/50 pt-3 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <p className="text-[9px] text-slate-500 uppercase">Max Price</p>
                      <p className="text-sm font-bold text-white">${c.criteria.maxPrice.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <p className="text-[9px] text-slate-500 uppercase">Target ROI</p>
                      <p className="text-sm font-bold text-violet-400">{c.criteria.targetROI}%</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <p className="text-[9px] text-slate-500 uppercase">Total Spent</p>
                      <p className="text-sm font-bold text-white">${c.totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <p className="text-[9px] text-slate-500 uppercase">Est. FMV</p>
                      <p className="text-sm font-bold text-emerald-400">${c.estimatedFMV.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Platforms: {c.criteria.platforms.join(', ')}</span>
                    <span>&middot;</span>
                    <span>Grade: {c.criteria.grade || 'Any'}</span>
                    <span>&middot;</span>
                    <span>Urgency: {c.criteria.urgency}</span>
                  </div>
                  <div className="flex gap-2">
                    {c.status === 'active' && (
                      <button onClick={() => handlePause(c.id)} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold hover:bg-amber-500/30 transition-colors">
                        <Pause size={10} /> Pause
                      </button>
                    )}
                    {c.status === 'paused' && (
                      <button onClick={() => handleResume(c.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition-colors">
                        <Play size={10} /> Resume
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Tab: Activity Feed ──────────────────────────────────────────────────────────

const ActivityFeedTab: React.FC = () => {
  const feed = useMemo((): AgentActivity[] => {
    try {
      return getAgentActivityFeed();
    } catch {
      showToast('error', 'Could not load the activity feed. If this persists, refresh the page.', {
        dedupeKey: 'aacq-activity-feed',
      });
      return [];
    }
  }, []);

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-2 text-[10px] text-amber-200/90 mb-2">
        {AUTONOMOUS_ACQUISITION_DISCLOSURE}
      </div>
      <p className="text-xs text-slate-500 mb-3">{feed.length} agent actions tracked</p>
      <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
        {feed.map(a => (
          <div key={a.id} className="flex items-start gap-3 p-3 bg-slate-800/70 border border-slate-700/50 rounded-xl group hover:border-slate-600 transition-colors">
            <div className={`mt-0.5 ${ACTION_ICON_CLS[a.actionType]}`}>
              <Bot size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 leading-relaxed">{a.message}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600">
                <span>{a.campaignName}</span>
                {a.platform && (
                  <>
                    <span>&middot;</span>
                    <span>{a.platform}</span>
                  </>
                )}
                <span>&middot;</span>
                <span>{timeAgo(a.timestamp)}</span>
              </div>
            </div>
            {a.amount && (
              <span className="text-xs font-mono text-slate-300 flex-shrink-0">${a.amount.toLocaleString()}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Tab: Negotiations ───────────────────────────────────────────────────────────

const NegotiationsTab: React.FC = () => {
  const negotiations = useMemo((): NegotiationSession[] => {
    try {
      return getAllNegotiations();
    } catch {
      showToast('error', 'Could not load negotiations. If this persists, refresh the page.', {
        dedupeKey: 'aacq-negotiations',
      });
      return [];
    }
  }, []);
  const [selectedId, setSelectedId] = useState<string>(() => negotiations[0]?.id ?? '');
  const [playbookId, setPlaybookId] = useState(() => getSelectedPlaybookId());
  const selected = negotiations.find(n => n.id === selectedId);
  const playbooks = useMemo(() => getNegotiationPlaybooks(), []);
  const activePlaybook = getPlaybookById(playbookId) ?? getSelectedPlaybook();

  const pricingPreview = useMemo(() => {
    if (!selected) return null;
    return getSmartPricingRecommendation({
      price: selected.listingPrice,
      player: selected.listingTitle.slice(0, 80),
      grade: 'Graded',
      platform: selected.platform,
      sellerId: selected.sellerId,
    });
  }, [selected, playbookId]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-2 text-[10px] text-amber-200/90">
        {AUTONOMOUS_ACQUISITION_DISCLOSURE}
      </div>
      {/* Phase 16 — negotiation playbook */}
      <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-violet-300 flex items-center gap-2">
          <ScrollText size={14} />
          Negotiation playbook
        </p>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Templates shape opening offers, target discounts, and agent tone for new and ongoing negotiations (persisted for this device / account).
        </p>
        <div>
          <label className="text-[10px] text-slate-500 uppercase block mb-1">Active strategy</label>
          <select
            value={playbookId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedPlaybookId(id);
              setPlaybookId(id);
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
          >
            {playbooks.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">{activePlaybook.description}</p>
        <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
            Open ~{Math.round(activePlaybook.openingPctOfAsk * 100)}% of ask
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
            ~{activePlaybook.maxRoundsHint} rounds (planning hint)
          </span>
        </div>
      </div>

      {negotiations.length === 0 ? (
        <p className="text-sm text-slate-400 rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
          No negotiation sessions to display. Refresh the page if data failed to load.
        </p>
      ) : (
        <>
      {/* Negotiation selector */}
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Select negotiation</label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
        >
          {negotiations.map(n => {
            const stageCfg = STAGE_CONFIG[n.stage];
            return (
              <option key={n.id} value={n.id}>
                {n.listingTitle} — {stageCfg.label} — ${n.currentOffer}
              </option>
            );
          })}
        </select>
      </div>

      {selected && (
        <>
          {/* Negotiation summary */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
              <p className="text-[9px] text-slate-500 uppercase">Stage</p>
              <p className={`text-sm font-bold ${STAGE_CONFIG[selected.stage].color}`}>{STAGE_CONFIG[selected.stage].label}</p>
            </div>
            <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
              <p className="text-[9px] text-slate-500 uppercase">Ask Price</p>
              <p className="text-sm font-bold text-white">${selected.listingPrice.toLocaleString()}</p>
            </div>
            <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
              <p className="text-[9px] text-slate-500 uppercase">Current Offer</p>
              <p className="text-sm font-bold text-violet-400">${selected.currentOffer.toLocaleString()}</p>
            </div>
            <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
              <p className="text-[9px] text-slate-500 uppercase">Rounds</p>
              <p className="text-sm font-bold text-slate-200">{selected.rounds}</p>
            </div>
            <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
              <p className="text-[9px] text-slate-500 uppercase">Savings</p>
              <p className={`text-sm font-bold ${selected.savings ? 'text-emerald-400' : 'text-slate-400'}`}>
                {selected.savings ? `$${selected.savings}` : '—'}
              </p>
            </div>
          </div>

          {/* Negotiation transcript */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 flex-wrap">
              <MessageSquare size={12} />
              Negotiation Transcript — {selected.sellerName} ({selected.platform})
              <span className="text-[10px] font-normal text-violet-400/90 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20">
                Playbook: {activePlaybook.label}
              </span>
            </p>
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {selected.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-xl p-3 ${
                    msg.sender === 'agent'
                      ? 'bg-violet-500/10 border border-violet-500/20'
                      : 'bg-slate-800 border border-slate-700'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {msg.sender === 'agent' ? (
                        <Bot size={12} className="text-violet-400" />
                      ) : (
                        <Eye size={12} className="text-slate-400" />
                      )}
                      <span className={`text-[10px] font-bold ${msg.sender === 'agent' ? 'text-violet-400' : 'text-slate-400'}`}>
                        {msg.sender === 'agent' ? 'AI Agent' : selected.sellerName}
                      </span>
                      <span className="text-[9px] text-slate-600">{formatDate(msg.timestamp)}</span>
                      {msg.amount && (
                        <span className="text-[10px] font-mono font-bold text-amber-400">${msg.amount.toLocaleString()}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{msg.message}</p>
                    {msg.strategyAnnotation && (
                      <div className="mt-2 p-2 bg-violet-500/5 border border-violet-500/10 rounded-lg">
                        <p className="text-[10px] text-violet-400 font-semibold flex items-center gap-1 mb-0.5">
                          <Zap size={9} /> Strategy
                        </p>
                        <p className="text-[11px] text-violet-300/80 leading-relaxed">{msg.strategyAnnotation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {pricingPreview && (
            <div className="bg-slate-800/70 border border-violet-500/20 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
                <Zap size={12} />
                Playbook-adjusted pricing (preview)
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">{pricingPreview.reasoning}</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-700/50">
                  <p className="text-[9px] text-slate-500 uppercase">Suggested open</p>
                  <p className="text-sm font-mono font-bold text-blue-400">${pricingPreview.openingOffer.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-700/50">
                  <p className="text-[9px] text-slate-500 uppercase">Target settle</p>
                  <p className="text-sm font-mono font-bold text-emerald-400">${pricingPreview.targetPrice.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-[10px] text-violet-300/90 leading-relaxed line-clamp-4">{pricingPreview.suggestedStrategy}</p>
            </div>
          )}

          {/* Price negotiation visual */}
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 mb-3">Price Progression</p>
            <div className="flex items-center gap-2">
              <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase">List</p>
                <p className="text-sm font-bold text-red-400">${selected.listingPrice.toLocaleString()}</p>
              </div>
              <ArrowRight size={14} className="text-slate-600" />
              <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase">Open</p>
                <p className="text-sm font-bold text-blue-400">${selected.openingOffer.toLocaleString()}</p>
              </div>
              <div className="flex-1 h-1 bg-slate-700 rounded-full mx-2 relative">
                <div
                  className="absolute h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                  style={{ width: `${Math.min(100, ((selected.currentOffer - selected.openingOffer) / (selected.listingPrice - selected.openingOffer)) * 100)}%` }}
                />
              </div>
              <ArrowRight size={14} className="text-slate-600" />
              <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase">Current</p>
                <p className="text-sm font-bold text-violet-400">${selected.currentOffer.toLocaleString()}</p>
              </div>
              {selected.finalPrice && (
                <>
                  <ArrowRight size={14} className="text-slate-600" />
                  <div className="text-center">
                    <p className="text-[9px] text-emerald-500 uppercase">Final</p>
                    <p className="text-sm font-bold text-emerald-400">${selected.finalPrice.toLocaleString()}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
        </>
      )}
    </div>
  );
};

// ── Tab: Escrow ─────────────────────────────────────────────────────────────────

const EscrowTab: React.FC = () => {
  const transactions = useMemo((): EscrowTransaction[] => {
    try {
      return getAllEscrow();
    } catch {
      showToast('error', 'Could not load escrow data. If this persists, refresh the page.', {
        dedupeKey: 'aacq-escrow',
      });
      return [];
    }
  }, []);

  const ESCROW_STEPS: EscrowState[] = ['pending_payment', 'payment_held', 'item_shipped', 'authentication_in_progress', 'authentication_passed', 'funds_released'];

  function stepIndex(state: EscrowState): number {
    const idx = ESCROW_STEPS.indexOf(state);
    return idx >= 0 ? idx : 0;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-2 text-[10px] text-amber-200/90">
        {AUTONOMOUS_ACQUISITION_DISCLOSURE}
      </div>
      <p className="text-xs text-slate-500">{transactions.length} escrow transactions</p>

      {transactions.length === 0 && (
        <p className="text-sm text-slate-400 rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
          No escrow rows to display. Refresh the page if data failed to load.
        </p>
      )}

      {transactions.map(tx => {
        const cfg = ESCROW_CONFIG[tx.state];
        const currentStep = stepIndex(tx.state);
        return (
          <div key={tx.id} className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{tx.cardDescription}</p>
                <p className="text-[10px] text-slate-500">{tx.sellerName} &middot; {tx.platform} &middot; {formatDate(tx.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</p>
                <p className="text-xs font-mono text-slate-300">${tx.amount.toLocaleString()}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-1">
              {ESCROW_STEPS.map((step, i) => (
                <React.Fragment key={step}>
                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                    i <= currentStep
                      ? 'border-violet-400 bg-violet-500/30'
                      : 'border-slate-600 bg-slate-800'
                  }`}>
                    {i < currentStep && <CheckCircle2 size={8} className="text-violet-400" />}
                  </div>
                  {i < ESCROW_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 ${i < currentStep ? 'bg-violet-500/50' : 'bg-slate-700'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Event timeline */}
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {tx.events.map((evt, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-[10px] text-slate-600 w-28 flex-shrink-0">{formatDate(evt.timestamp)}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-300 font-medium">{evt.event}</span>
                    <span className="text-slate-500 ml-1">— {evt.detail}</span>
                  </div>
                </div>
              ))}
            </div>

            {tx.trackingNumber && (
              <p className="text-[10px] text-slate-500">
                <Package size={10} className="inline mr-1" />
                Tracking: {tx.trackingNumber}
              </p>
            )}
            {tx.estimatedCompletion && tx.state !== 'funds_released' && (
              <p className="text-[10px] text-violet-400">
                <Clock size={10} className="inline mr-1" />
                Est. completion: {formatDate(tx.estimatedCompletion)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Tab: Analytics ──────────────────────────────────────────────────────────────

const AnalyticsTab: React.FC = () => {
  const { analytics, results, loadError } = useMemo(() => {
    try {
      return {
        analytics: getAcquisitionAnalytics(),
        results: getAllAcquisitionResults(),
        loadError: null as string | null,
      };
    } catch {
      showToast('error', 'Could not load acquisition analytics. If this persists, refresh the page.', {
        dedupeKey: 'aacq-analytics',
      });
      return {
        analytics: null as AcquisitionAnalytics | null,
        results: [] as AcquisitionResult[],
        loadError: 'Analytics could not be loaded.',
      };
    }
  }, []);
  const playbook = getSelectedPlaybook();

  const pieData =
    analytics?.platformBreakdown.map(p => ({
      name: p.platform,
      value: p.acquisitions,
    })) ?? [];

  if (!analytics || loadError) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-2 text-[10px] text-amber-200/90">
          {AUTONOMOUS_ACQUISITION_DISCLOSURE}
        </div>
        <p className="text-sm text-slate-400 rounded-lg border border-red-500/20 bg-red-500/5 p-4">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-2 text-[10px] text-amber-200/90">
        {AUTONOMOUS_ACQUISITION_DISCLOSURE}
      </div>
      <div className="flex items-start gap-2 p-3 rounded-xl bg-violet-500/5 border border-violet-500/15">
        <ScrollText size={16} className="text-violet-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Active negotiation playbook</p>
          <p className="text-sm font-semibold text-white">{playbook.label}</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{playbook.description}</p>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
          <p className="text-[9px] text-slate-500 uppercase">Total Saved</p>
          <p className="text-lg font-bold text-emerald-400">${analytics.totalSaved.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
          <p className="text-[9px] text-slate-500 uppercase">Avg Discount</p>
          <p className="text-lg font-bold text-violet-400">{analytics.avgDiscountPct}%</p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
          <p className="text-[9px] text-slate-500 uppercase">Success Rate</p>
          <p className="text-lg font-bold text-amber-400">{analytics.successRate}%</p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
          <p className="text-[9px] text-slate-500 uppercase">Acquisitions</p>
          <p className="text-lg font-bold text-white">{analytics.successfulAcquisitions}</p>
        </div>
      </div>

      {/* Additional KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
          <p className="text-[9px] text-slate-500 uppercase">Total Spent</p>
          <p className="text-sm font-bold text-white">${analytics.totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
          <p className="text-[9px] text-slate-500 uppercase">Avg Rounds</p>
          <p className="text-sm font-bold text-slate-200">{analytics.avgNegotiationRounds}</p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
          <p className="text-[9px] text-slate-500 uppercase">Avg Time</p>
          <p className="text-sm font-bold text-slate-200">{analytics.avgTimeToAcquire}h</p>
        </div>
      </div>

      {/* Best Deal */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
          <TrendingUp size={10} /> Best Deal
        </p>
        <p className="text-sm text-white font-semibold">{analytics.bestDeal.card}</p>
        <p className="text-xs text-emerald-400">
          Saved ${analytics.bestDeal.savings} ({analytics.bestDeal.savingsPct}% below listing)
        </p>
      </div>

      {/* Monthly savings chart */}
      <div className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-400 mb-3">Monthly Savings vs Spend</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={analytics.monthlySavings}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={v => `$${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            <Bar dataKey="spent" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Spent" />
            <Bar dataKey="saved" fill="#10b981" radius={[4, 4, 0, 0]} name="Saved" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Platform breakdown */}
      <div className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-400 mb-3">Platform Breakdown</p>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={25} outerRadius={50} paddingAngle={2}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {analytics.platformBreakdown.map((p, i) => (
              <div key={p.platform} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-slate-300 flex-1">{p.platform}</span>
                <span className="text-slate-400">{p.acquisitions} cards</span>
                <span className="text-emerald-400 font-mono">{p.avgDiscount}% avg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent acquisitions */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400">Recent Acquisitions</p>
        <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
          {results.slice(0, 8).map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{r.cardDescription}</p>
                <p className="text-[10px] text-slate-500">{r.platform} &middot; {r.sellerName} &middot; {r.negotiationRounds} rounds</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-mono text-white">${r.acquiredPrice.toLocaleString()}</p>
                <p className="text-emerald-400 text-[10px] font-bold">-{r.savingsPct}% (${r.savings})</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Modal ──────────────────────────────────────────────────────────────────

const AutonomousAcquisitionModal: React.FC<AutonomousAcquisitionModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('campaigns');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-5 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/20">
                <Bot size={20} className="text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AI Acquisition Agent</h2>
                <p className="text-xs text-slate-400">
                  Autonomous deal negotiation &amp; card acquisition
                  <span className="ml-2 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-amber-300">
                    {AUTONOMOUS_ACQUISITION_DATA_MODE}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'campaigns' && <CampaignsTab />}
          {activeTab === 'activity' && <ActivityFeedTab />}
          {activeTab === 'negotiations' && <NegotiationsTab />}
          {activeTab === 'escrow' && <EscrowTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </div>
      </div>
    </div>
  );
};

export default AutonomousAcquisitionModal;
