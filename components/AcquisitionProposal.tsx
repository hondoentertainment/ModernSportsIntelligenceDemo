import React from 'react';
import { JointAcquisitionProposal } from '../types';
import { Users, DollarSign, Clock, CheckCircle2, ThumbsUp, ThumbsDown, Gavel } from 'lucide-react';

interface AcquisitionProposalProps {
    proposal: JointAcquisitionProposal;
    canCommit?: boolean;
    canVote?: boolean;
    onCommit?: (proposalId: string, amount: number) => void;
    onVote?: (proposalId: string, vote: 'approve' | 'reject') => void;
    onSettle?: (proposalId: string, outcome: 'release' | 'return') => void;
}

const AcquisitionProposal: React.FC<AcquisitionProposalProps> = ({
    proposal,
    canCommit = false,
    canVote = false,
    onCommit,
    onVote,
    onSettle
}) => {
    const fundingPercentage = (proposal.currentFunding / proposal.targetPrice) * 100;
    const daysLeft = Math.ceil((new Date(proposal.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const approvals = (proposal.votes || []).filter(v => v.vote === 'approve').length;
    const rejects = (proposal.votes || []).filter(v => v.vote === 'reject').length;

    return (
        <div className="luminous-card rounded-2xl p-6 border border-slate-800 bg-slate-900/40 relative group overflow-hidden shadow-xl">
            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border border-slate-700 ${proposal.status === 'open' ? 'bg-brand-lime/10 text-brand-lime' : 'bg-slate-800 text-slate-500'}`}>
                            <Gavel size={18} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bebas tracking-wide text-white uppercase">{proposal.title || `Joint Acquisition #${proposal.id.slice(0, 5)}`}</h4>
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-brand-muted tracking-widest">
                                <Users size={10} /> {proposal.participants.length} Backers
                            </div>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full border border-slate-800 text-[10px] font-black uppercase tracking-widest ${proposal.status === 'open' ? 'text-brand-lime bg-brand-lime/5' : 'text-slate-400 bg-slate-800'}`}>
                        {proposal.status}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                        <span>Target Liquidity</span>
                        <span className="text-white">${proposal.targetPrice.toLocaleString()}</span>
                    </div>

                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                        <div
                            className="h-full bg-gradient-to-r from-brand-lime to-brand-cyan transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(100, fundingPercentage)}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-black text-brand-muted uppercase tracking-widest">
                        <span>{fundingPercentage.toFixed(1)}% Funded</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {Math.max(0, daysLeft)}d Remaining</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Min Contribution</span>
                        <span className="text-sm font-bold text-white">${proposal.minEntry}</span>
                    </div>
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Quorum</span>
                        <span className="text-sm font-bold text-brand-lime">{proposal.quorumPercent || 60}%</span>
                    </div>
                </div>

                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-brand-muted">Governance</span>
                        <span className={` ${proposal.approvalStatus === 'approved' ? 'text-brand-lime' : proposal.approvalStatus === 'rejected' ? 'text-brand-red' : 'text-slate-400'}`}>
                            {proposal.approvalStatus || 'pending'}
                        </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Approve: {approvals}</span>
                        <span>Reject: {rejects}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h5 className="text-[9px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={10} className="text-brand-lime" /> Specialist Consensus
                    </h5>
                    <p className="text-[11px] font-medium text-slate-300 leading-relaxed italic line-clamp-2">
                        "{proposal.agentEvaluation.summary}"
                    </p>
                    {proposal.proposalMemo && (
                        <p className="text-[10px] text-slate-400 leading-relaxed">{proposal.proposalMemo}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                        disabled={!canCommit || proposal.status !== 'open'}
                        onClick={() => onCommit?.(proposal.id, proposal.minEntry)}
                        className="py-3 bg-brand-lime hover:bg-brand-lime/90 disabled:bg-slate-800 disabled:text-slate-500 text-brand-charcoal font-black text-[10px] uppercase tracking-[0.15em] rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        Commit <DollarSign size={14} />
                    </button>
                    <button
                        disabled={!canVote || proposal.status !== 'open'}
                        onClick={() => onVote?.(proposal.id, 'approve')}
                        className="py-3 bg-slate-800 hover:bg-slate-700 disabled:text-slate-500 text-brand-lime font-black text-[10px] uppercase tracking-[0.15em] rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        Approve <ThumbsUp size={12} />
                    </button>
                    <button
                        disabled={!canVote || proposal.status !== 'open'}
                        onClick={() => onVote?.(proposal.id, 'reject')}
                        className="py-3 bg-slate-800 hover:bg-slate-700 disabled:text-slate-500 text-brand-red font-black text-[10px] uppercase tracking-[0.15em] rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        Reject <ThumbsDown size={12} />
                    </button>
                </div>

                {(proposal.status === 'funded' || proposal.approvalStatus === 'approved') && (
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => onSettle?.(proposal.id, 'release')}
                            className="py-3 bg-brand-lime/15 hover:bg-brand-lime/25 text-brand-lime font-black text-[10px] uppercase tracking-[0.15em] rounded-xl transition-all"
                        >
                            Release Escrow
                        </button>
                        <button
                            onClick={() => onSettle?.(proposal.id, 'return')}
                            className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-[10px] uppercase tracking-[0.15em] rounded-xl transition-all"
                        >
                            Return Funds
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcquisitionProposal;
