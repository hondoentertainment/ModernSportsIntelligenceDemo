import React, { useMemo, useState } from 'react';
import {
  X,
  Users,
  Vote,
  Briefcase,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DollarSign,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Calendar,
} from 'lucide-react';
import {
  getSyndicates,
  getSyndicateAssets,
  getAllGovernanceVotes,
  getSyndicateStats,
  Syndicate,
  SyndicateAsset,
  GovernanceVote,
} from '../lib/utils/fractionalSyndicateService';

interface FractionalSyndicateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'syndicates' | 'governance' | 'assets' | 'create';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'syndicates', label: 'My Syndicates', icon: <Users size={16} /> },
  { id: 'governance', label: 'Governance', icon: <Vote size={16} /> },
  { id: 'assets', label: 'Assets', icon: <Briefcase size={16} /> },
  { id: 'create', label: 'Create New', icon: <PlusCircle size={16} /> },
];

const statusColors: Record<string, { text: string; bg: string; border: string }> = {
  forming: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  active: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  liquidating: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  closed: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

const voteTypeColors: Record<string, { text: string; bg: string; border: string }> = {
  acquire: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  sell: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  distribute: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  'add-member': { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  dissolve: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const voteStatusIcons: Record<string, React.ReactNode> = {
  active: <Clock size={12} className="text-indigo-400" />,
  passed: <CheckCircle2 size={12} className="text-green-400" />,
  rejected: <XCircle size={12} className="text-red-400" />,
  expired: <AlertTriangle size={12} className="text-slate-400" />,
};

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatCurrency(val: number): string {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  return `$${val.toLocaleString()}`;
}

// ---- My Syndicates Tab ----

const SyndicatesTab: React.FC<{ syndicates: Syndicate[] }> = ({ syndicates }) => {
  return (
    <div className="space-y-4">
      {syndicates.map(s => {
        const deployedPct = s.totalCapital > 0 ? Math.round((s.deployedCapital / s.totalCapital) * 100) : 0;
        const returnPct = s.deployedCapital > 0 ? Math.round((s.unrealizedGain / s.deployedCapital) * 1000) / 10 : 0;
        const colors = statusColors[s.status];

        return (
          <div
            key={s.id}
            className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-4 hover:border-slate-600 transition-colors"
          >
            {/* Top row: name + status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bebas tracking-wider text-white leading-tight truncate">
                  {s.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{s.description}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${colors.text} ${colors.bg} border ${colors.border} flex-shrink-0`}>
                {s.status}
              </span>
            </div>

            {/* Member avatars */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {s.members.slice(0, 5).map(m => (
                  <div
                    key={m.id}
                    className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-300"
                    title={`${m.name} (${m.ownershipPercent}%)`}
                  >
                    {m.name.charAt(0)}
                  </div>
                ))}
                {s.members.length > 5 && (
                  <div className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    +{s.members.length - 5}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">{s.members.length} members</span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Capital</p>
                <p className="text-sm font-bebas tracking-wider text-white">{formatCurrency(s.totalCapital)}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Deployed</p>
                <p className="text-sm font-bebas tracking-wider text-white">{deployedPct}%</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Gain</p>
                <p className={`text-sm font-bebas tracking-wider ${s.unrealizedGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {s.unrealizedGain >= 0 ? '+' : ''}{formatCurrency(s.unrealizedGain)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Return</p>
                <p className={`text-sm font-bebas tracking-wider flex items-center justify-center gap-1 ${returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {returnPct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {returnPct >= 0 ? '+' : ''}{returnPct}%
                </p>
              </div>
            </div>

            {/* Deployed capital bar */}
            <div className="space-y-1">
              <div className="flex h-2 rounded-full overflow-hidden bg-slate-700">
                <div
                  className="bg-indigo-500 transition-all duration-500 rounded-full"
                  style={{ width: `${deployedPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>{formatCurrency(s.deployedCapital)} deployed</span>
                <span>{formatCurrency(s.totalCapital - s.deployedCapital)} available</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- Governance Tab ----

const GovernanceTab: React.FC<{ votes: GovernanceVote[]; syndicates: Syndicate[] }> = ({ votes, syndicates }) => {
  const syndicateMap = useMemo(() => {
    const map: Record<string, string> = {};
    syndicates.forEach(s => { map[s.id] = s.name; });
    return map;
  }, [syndicates]);

  const activeVotes = votes.filter(v => v.status === 'active');
  const pastVotes = votes.filter(v => v.status !== 'active');

  return (
    <div className="space-y-6">
      {/* Active Votes */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Active Votes ({activeVotes.length})
        </p>
        {activeVotes.length === 0 && (
          <div className="p-5 bg-slate-800/30 border border-slate-700 rounded-2xl text-center">
            <p className="text-sm text-slate-500">No active votes at this time</p>
          </div>
        )}
        {activeVotes.map(v => {
          const totalVotes = v.forVotes + v.againstVotes;
          const forPct = totalVotes > 0 ? Math.round((v.forVotes / totalVotes) * 100) : 0;
          const againstPct = 100 - forPct;
          const daysLeft = daysUntil(v.deadline);
          const typeColors = voteTypeColors[v.proposalType];
          const meetsQuorum = forPct >= v.quorum;

          return (
            <div
              key={v.id}
              className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-4 hover:border-slate-600 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-1">{syndicateMap[v.syndicateId] ?? v.syndicateId}</p>
                  <h4 className="text-sm font-semibold text-white leading-tight">{v.proposalTitle}</h4>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${typeColors.text} ${typeColors.bg} border ${typeColors.border} flex-shrink-0`}>
                  {v.proposalType}
                </span>
              </div>

              {/* Voting progress bar */}
              <div className="space-y-2">
                <div className="flex h-3 rounded-full overflow-hidden bg-slate-700">
                  <div
                    className="bg-green-500 transition-all duration-500"
                    style={{ width: `${forPct}%` }}
                  />
                  <div
                    className="bg-red-500 transition-all duration-500"
                    style={{ width: `${againstPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-green-400 font-mono font-bold">
                    <ThumbsUp size={11} />
                    {forPct}% For
                  </span>
                  <span className="flex items-center gap-1 text-red-400 font-mono font-bold">
                    {againstPct}% Against
                    <ThumbsDown size={11} />
                  </span>
                </div>
              </div>

              {/* Quorum + Deadline */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${meetsQuorum ? 'text-green-400' : 'text-amber-400'}`}>
                    <Shield size={10} />
                    Quorum: {v.quorum}% {meetsQuorum ? '(met)' : '(not met)'}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock size={10} />
                  {daysLeft}d remaining
                </span>
              </div>

              {/* Vote buttons */}
              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-bold uppercase tracking-widest hover:bg-green-500/20 transition-colors">
                  <ThumbsUp size={14} />
                  Vote For
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors">
                  <ThumbsDown size={14} />
                  Vote Against
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Past Votes */}
      {pastVotes.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Past Votes ({pastVotes.length})
          </p>
          {pastVotes.map(v => {
            const totalVotes = v.forVotes + v.againstVotes;
            const forPct = totalVotes > 0 ? Math.round((v.forVotes / totalVotes) * 100) : 0;
            const typeColors = voteTypeColors[v.proposalType];

            return (
              <div
                key={v.id}
                className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl flex items-center gap-3"
              >
                {voteStatusIcons[v.status]}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">{v.proposalTitle}</p>
                  <p className="text-[10px] text-slate-500">{syndicateMap[v.syndicateId] ?? v.syndicateId}</p>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${typeColors.text}`}>
                  {v.proposalType}
                </span>
                <span className="text-xs font-mono text-slate-400">{forPct}% for</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${v.status === 'passed' ? 'text-green-400' : v.status === 'rejected' ? 'text-red-400' : 'text-slate-400'}`}>
                  {v.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---- Assets Tab ----

const AssetsTab: React.FC<{ assets: SyndicateAsset[]; syndicates: Syndicate[] }> = ({ assets, syndicates }) => {
  const syndicateMap = useMemo(() => {
    const map: Record<string, Syndicate> = {};
    syndicates.forEach(s => { map[s.id] = s; });
    return map;
  }, [syndicates]);

  const assetStatusColors: Record<string, { text: string; bg: string; border: string }> = {
    held: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    listed: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    sold: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  };

  const totalPurchase = assets.reduce((s, a) => s + a.purchasePrice, 0);
  const totalCurrent = assets.reduce((s, a) => s + a.currentValue, 0);
  const totalGainLoss = totalCurrent - totalPurchase;
  const totalGainPct = totalPurchase > 0 ? Math.round((totalGainLoss / totalPurchase) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      {/* Portfolio summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Assets</p>
          <p className="text-2xl font-bebas tracking-wider text-white">{assets.length}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Cost Basis</p>
          <p className="text-2xl font-bebas tracking-wider text-white">{formatCurrency(totalPurchase)}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Current Value</p>
          <p className="text-2xl font-bebas tracking-wider text-white">{formatCurrency(totalCurrent)}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Total Return</p>
          <p className={`text-2xl font-bebas tracking-wider ${totalGainPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalGainPct >= 0 ? '+' : ''}{totalGainPct}%
          </p>
        </div>
      </div>

      {/* Asset list */}
      <div className="space-y-2">
        {assets.map(a => {
          const gainLoss = a.currentValue - a.purchasePrice;
          const gainPct = a.purchasePrice > 0 ? Math.round((gainLoss / a.purchasePrice) * 1000) / 10 : 0;
          const syndicate = syndicateMap[a.syndicateId];
          const acqDate = new Date(a.acquisitionDate);
          const now = new Date();
          const holdingDays = Math.round((now.getTime() - acqDate.getTime()) / (1000 * 60 * 60 * 24));
          const holdingLabel = holdingDays > 365 ? `${Math.round(holdingDays / 365)}y` : holdingDays > 30 ? `${Math.round(holdingDays / 30)}mo` : `${holdingDays}d`;
          const aColors = assetStatusColors[a.status];

          return (
            <div
              key={a.id}
              className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl space-y-3 hover:bg-slate-800/50 transition-colors"
            >
              {/* Card name + syndicate */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-semibold truncate">{a.cardName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{syndicate?.name ?? a.syndicateId}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${aColors.text} ${aColors.bg} border ${aColors.border} flex-shrink-0`}>
                  {a.status}
                </span>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Cost: </span>
                  <span className="text-slate-300 font-mono">{formatCurrency(a.purchasePrice)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Value: </span>
                  <span className="text-white font-mono font-bold">{formatCurrency(a.currentValue)}</span>
                </div>
                <div className={`font-mono font-bold ${gainPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {gainPct >= 0 ? '+' : ''}{gainPct}%
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Calendar size={10} />
                  {holdingLabel}
                </div>
              </div>

              {/* Acquisition vote */}
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-500">Acquisition vote:</span>
                <span className="text-green-400 font-mono font-bold">{a.acquisitionVote.forPercent}% for</span>
                <span className="text-slate-600">/</span>
                <span className="text-red-400 font-mono font-bold">{a.acquisitionVote.againstPercent}% against</span>
                {syndicate && (
                  <>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-500">
                      Your share: {syndicate.members[0]?.ownershipPercent ?? 0}%
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- Create New Tab ----

const CreateNewTab: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minInvestment, setMinInvestment] = useState(5000);
  const [votingThreshold, setVotingThreshold] = useState(66);
  const [inviteEmails, setInviteEmails] = useState('');

  return (
    <div className="space-y-6">
      <div className="p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl space-y-1">
        <h4 className="text-sm font-bold text-indigo-400">Create a New Syndicate</h4>
        <p className="text-xs text-slate-400">
          Pool capital with other collectors to acquire high-value cards. Set governance rules and voting thresholds to manage shared investments democratically.
        </p>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Syndicate Name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Alpha Grail Hunters"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Description
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the investment thesis and target acquisitions..."
          rows={3}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        />
      </div>

      {/* Min Investment */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Minimum Investment
        </label>
        <div className="relative">
          <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="number"
            value={minInvestment}
            onChange={e => setMinInvestment(Number(e.target.value))}
            min={100}
            step={500}
            className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Voting Threshold Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Voting Threshold
          </label>
          <span className="text-sm font-mono font-bold text-indigo-400">{votingThreshold}%</span>
        </div>
        <input
          type="range"
          min={51}
          max={100}
          value={votingThreshold}
          onChange={e => setVotingThreshold(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-[9px] text-slate-500">
          <span>Simple majority (51%)</span>
          <span>Unanimous (100%)</span>
        </div>
      </div>

      {/* Invite Members */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Invite Members (emails, comma-separated)
        </label>
        <textarea
          value={inviteEmails}
          onChange={e => setInviteEmails(e.target.value)}
          placeholder="alice@example.com, bob@example.com"
          rows={2}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        />
      </div>

      {/* Preview */}
      {name && (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Preview</p>
          <h4 className="text-lg font-bebas tracking-wider text-white">{name}</h4>
          {description && <p className="text-xs text-slate-400">{description}</p>}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Min: {formatCurrency(minInvestment)}</span>
            <span>Threshold: {votingThreshold}%</span>
            {inviteEmails && (
              <span>{inviteEmails.split(',').filter(e => e.trim()).length} invites</span>
            )}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        disabled={!name.trim()}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
          name.trim()
            ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/25'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        <PlusCircle size={16} />
        Create Syndicate
      </button>
    </div>
  );
};

// ---- Main Modal ----

export const FractionalSyndicateModal: React.FC<FractionalSyndicateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('syndicates');

  const syndicates = useMemo(() => getSyndicates(), []);
  const allVotes = useMemo(() => getAllGovernanceVotes(), []);
  const stats = useMemo(() => getSyndicateStats(), []);

  const allAssets = useMemo(() => {
    const assets: SyndicateAsset[] = [];
    syndicates.forEach(s => {
      assets.push(...getSyndicateAssets(s.id));
    });
    return assets;
  }, [syndicates]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header with gradient */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-slate-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <Users size={10} />
                  {stats.totalMembers} members
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/30">
                  <DollarSign size={10} />
                  {formatCurrency(stats.totalCapitalManaged)}
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Fractional Syndicate <span className="text-indigo-400">Engine</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-700 bg-slate-800/30">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-indigo-400 border-indigo-400 bg-indigo-500/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'syndicates' && <SyndicatesTab syndicates={syndicates} />}
          {activeTab === 'governance' && <GovernanceTab votes={allVotes} syndicates={syndicates} />}
          {activeTab === 'assets' && <AssetsTab assets={allAssets} syndicates={syndicates} />}
          {activeTab === 'create' && <CreateNewTab />}
        </div>
      </div>
    </div>
  );
};

export default FractionalSyndicateModal;
