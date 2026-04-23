// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { MultiAgentService } from '../lib/utils/MultiAgentService';
import { SwarmInsight, JointAcquisitionProposal, GuildMember } from '../types';
import SwarmCard from '../components/SwarmCard';
import AcquisitionProposal from '../components/AcquisitionProposal';
import { Users, ShieldCheck, Zap, Globe, MessageSquare, Plus } from 'lucide-react';
import { showToast } from '../lib/utils/toast';
import { GuildService } from '../lib/social/guildService';

const GuildDashboard: React.FC = () => {
    const [swarms, setSwarms] = useState<SwarmInsight[]>([]);
    const [proposals, setProposals] = useState<JointAcquisitionProposal[]>([]);
    const [members, setMembers] = useState<GuildMember[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>('owner-1');
    const [isLoading, setIsLoading] = useState(true);
    const [draft, setDraft] = useState({
        title: '',
        targetAssetName: '',
        targetPrice: 5000,
        minEntry: 250,
        summary: '',
        proposalMemo: ''
    });

    const currentRole = useMemo(() => GuildService.getRoleForUser(currentUserId, members), [currentUserId, members]);
    const canPropose = GuildService.canPropose(currentRole);
    const canVote = GuildService.canVote(currentRole);
    const snapshot = useMemo(() => GuildService.getSnapshot(proposals), [proposals]);

    const loadGuildData = async () => {
        setIsLoading(true);
        try {
            const liveMembers = GuildService.getOrCreateDemoMembers();
            setMembers(liveMembers);

            const swarmData = await MultiAgentService.getSwarmIntelligence();
            setSwarms(swarmData);

            const stored = GuildService.getProposals();
            if (stored.length > 0) {
                setProposals(stored);
            } else {
                const mock: JointAcquisitionProposal = {
                    id: crypto.randomUUID(),
                    targetCardId: '123',
                    targetPrice: 25000,
                    currentFunding: 18500,
                    minEntry: 500,
                    participants: [],
                    votes: [],
                    quorumPercent: GuildService.getGovernance().quorumPercent,
                    approvalStatus: 'pending',
                    approvalDeadline: new Date(Date.now() + GuildService.getGovernance().approvalWindowHours * 60 * 60 * 1000).toISOString(),
                    ledgerEntries: [],
                    status: 'open',
                    expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(),
                    title: 'Elly De La Cruz Blue Refractor Pool',
                    targetAssetName: '2024 Topps Chrome Elly De La Cruz /150',
                    proposedBy: 'Guild Owner',
                    proposalMemo: 'Syndicate acquisition with 12-month hold and liquidity reserve.',
                    payoutWaterfall: {
                        managerCarryPercent: 10,
                        reservePercent: 5,
                        distributionModel: 'pro_rata'
                    },
                    agentEvaluation: {
                        id: 'thesis-1',
                        summary: 'High-prestige asset with strong MiLB trajectory. Group hold recommended for minimum 18 months.',
                        keyTakeaways: [],
                        riskAssessment: 'High',
                        recommendedAction: 'Acquire',
                        agents: [],
                        createdAt: new Date().toISOString()
                    }
                };
                GuildService.saveProposals([mock]);
                setProposals([mock]);
            }
        } catch {
            showToast('error', 'Failed to synchronize with Alpha Guilds.');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadGuildData();
    }, []);

    const handleCommit = (proposalId: string, amount: number) => {
        if (!canVote) {
            showToast('warning', 'Your guild role cannot commit capital.');
            return;
        }
        setProposals(prev => {
            const updated = prev.map(p => p.id === proposalId ? GuildService.addContribution(p, currentUserId, amount) : p);
            GuildService.saveProposals(updated);
            return updated;
        });
        showToast('success', `Contribution of $${amount.toLocaleString()} submitted to escrow ledger.`);
    };

    const handleVote = (proposalId: string, vote: 'approve' | 'reject') => {
        if (!canVote) {
            showToast('warning', 'Your guild role cannot vote on proposals.');
            return;
        }

        setProposals(prev => {
            const updated = prev.map(p => p.id === proposalId ? GuildService.castVote(p, currentUserId, vote) : p);
            GuildService.saveProposals(updated);
            return updated;
        });
        showToast('info', `Vote recorded: ${vote.toUpperCase()}.`);
    };

    const handleSettle = (proposalId: string, outcome: 'release' | 'return') => {
        setProposals(prev => {
            const updated = prev.map(proposal => proposal.id === proposalId ? GuildService.settleProposal(proposal, outcome) : proposal);
            GuildService.saveProposals(updated);
            return updated;
        });
        showToast('success', outcome === 'release' ? 'Escrow released and proposal completed.' : 'Funds marked for return.');
    };

    const handleCreateProposal = () => {
        if (!canPropose) {
            showToast('warning', 'Your guild role cannot create proposals.');
            return;
        }
        if (!draft.title.trim() || !draft.targetAssetName.trim() || !draft.summary.trim()) {
            showToast('warning', 'Add a title, target asset, and summary to stage a proposal.');
            return;
        }
        const proposer = members.find(member => member.userId === currentUserId)?.displayName || 'Guild Operator';
        const proposal = GuildService.createProposal({
            ...draft,
            proposedBy: proposer
        });
        const updated = GuildService.upsertProposal(proposal);
        setProposals(updated);
        setDraft({
            title: '',
            targetAssetName: '',
            targetPrice: 5000,
            minEntry: 250,
            summary: '',
            proposalMemo: ''
        });
        showToast('success', 'New guild proposal staged for voting.');
    };

    return (
        <div className="min-h-screen bg-brand-charcoal p-8 space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-lime/20 rounded-xl text-brand-lime">
                            <Users size={24} />
                        </div>
                        <h1 className="text-5xl font-bebas tracking-tighter text-white">
                            Collaborative Intelligence <span className="text-brand-lime">Guilds</span>
                        </h1>
                    </div>
                    <p className="text-sm font-medium text-slate-400 max-w-2xl">
                        Governance-enabled swarms with quorum voting and escrow contribution tracking.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    <select
                        value={currentUserId}
                        onChange={(e) => setCurrentUserId(e.target.value)}
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white"
                    >
                        {members.map(m => (
                            <option key={m.userId} value={m.userId}>{m.displayName} ({m.role})</option>
                        ))}
                    </select>
                    <button
                        onClick={() => showToast('info', `${members.length} guild members online. Open proposals: ${snapshot.openProposals}.`)}
                        className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                        <MessageSquare size={14} /> Member Lounge
                    </button>
                    <button
                        onClick={loadGuildData}
                        className="px-6 py-3 bg-brand-lime text-brand-charcoal rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Zap size={14} /> Refresh Intelligence
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Swarms', value: '12', icon: Globe, color: 'text-brand-cyan' },
                    { label: 'Escrowed Capital', value: `$${snapshot.totalEscrowed.toLocaleString()}`, icon: ShieldCheck, color: 'text-brand-lime' },
                    { label: 'Guild Members', value: members.length.toString(), icon: Users, color: 'text-brand-orange' },
                ].map((stat, i) => (
                    <div key={i} className="luminous-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{stat.label}</span>
                            <span className="text-3xl font-bebas tracking-wide text-white">{stat.value}</span>
                        </div>
                        <stat.icon size={32} className={`${stat.color} opacity-30`} />
                    </div>
                ))}
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <h2 className="text-2xl font-bebas tracking-wide text-white flex items-center gap-3">
                            <Zap className="text-brand-lime" /> Live Alpha Swarms
                        </h2>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time Syntheses</span>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-48 bg-slate-900/50 rounded-2xl border border-slate-800" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {swarms.map(swarm => (
                                <SwarmCard key={swarm.id} insight={swarm} />
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <h2 className="text-2xl font-bebas tracking-wide text-white flex items-center gap-3">
                            <Plus className="text-brand-lime" /> Joint Proposals
                        </h2>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Role: {currentRole || 'None'}</span>
                    </div>

                    <div className="space-y-6">
                        {proposals.map(proposal => (
                            <AcquisitionProposal
                                key={proposal.id}
                                proposal={proposal}
                                canCommit={canVote}
                                canVote={canVote}
                                onCommit={handleCommit}
                                onVote={handleVote}
                                onSettle={handleSettle}
                            />
                        ))}

                        <div className="p-6 border-2 border-dashed border-slate-800 rounded-2xl text-center space-y-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stage New Guild Proposal</p>
                            <input
                                value={draft.title}
                                onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Proposal title"
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500"
                            />
                            <input
                                value={draft.targetAssetName}
                                onChange={(e) => setDraft(prev => ({ ...prev, targetAssetName: e.target.value }))}
                                placeholder="Target asset"
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    value={draft.targetPrice}
                                    onChange={(e) => setDraft(prev => ({ ...prev, targetPrice: parseInt(e.target.value) }))}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white"
                                />
                                <input
                                    type="number"
                                    value={draft.minEntry}
                                    onChange={(e) => setDraft(prev => ({ ...prev, minEntry: parseInt(e.target.value) }))}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white"
                                />
                            </div>
                            <textarea
                                value={draft.summary}
                                onChange={(e) => setDraft(prev => ({ ...prev, summary: e.target.value }))}
                                placeholder="Investment summary"
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500"
                            />
                            <textarea
                                value={draft.proposalMemo}
                                onChange={(e) => setDraft(prev => ({ ...prev, proposalMemo: e.target.value }))}
                                placeholder="Memo / payout notes"
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500"
                            />
                            <button
                                disabled={!canPropose}
                                onClick={handleCreateProposal}
                                className="w-full px-4 py-3 bg-brand-lime text-brand-charcoal rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.01] transition-all disabled:bg-slate-800 disabled:text-slate-600"
                            >
                                Propose New Acquisition
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GuildDashboard;
