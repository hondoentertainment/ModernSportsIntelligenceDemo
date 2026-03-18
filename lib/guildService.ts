import {
    GuildGovernance,
    GuildMember,
    GuildRole,
    JointAcquisitionProposal,
    ContributionLedgerEntry,
    ProposalVote
} from '../types';
import { store } from './dal/syncStore';

const GUILD_MEMBERS_KEY = 'msi_guild_members';
const GUILD_PROPOSALS_KEY = 'msi_guild_proposals';
const DEFAULT_GOVERNANCE: GuildGovernance = {
    quorumPercent: 60,
    minApprovals: 2,
    approvalWindowHours: 72,
    vetoEnabled: true
};

export interface CreateProposalInput {
    title: string;
    targetAssetName: string;
    targetCardId?: string;
    targetPrice: number;
    minEntry: number;
    summary: string;
    proposedBy: string;
    proposalMemo?: string;
}

export interface GuildSnapshot {
    totalEscrowed: number;
    fundedProposals: number;
    openProposals: number;
    approvalRate: number;
}

export class GuildService {
    static getGovernance(): GuildGovernance {
        return DEFAULT_GOVERNANCE;
    }

    static getMembers(): GuildMember[] {
        const parsed = store.get<GuildMember[]>(GUILD_MEMBERS_KEY, []);
        return Array.isArray(parsed) ? parsed : [];
    }

    static saveMembers(members: GuildMember[]): void {
        store.set(GUILD_MEMBERS_KEY, members);
    }

    static getOrCreateDemoMembers(): GuildMember[] {
        const existing = this.getMembers();
        if (existing.length > 0) return existing;

        const seeded: GuildMember[] = [
            { userId: 'owner-1', displayName: 'Guild Owner', role: 'Owner', joinedAt: new Date().toISOString() },
            { userId: 'analyst-1', displayName: 'Market Analyst', role: 'Analyst', joinedAt: new Date().toISOString() },
            { userId: 'member-1', displayName: 'Capital Member', role: 'Member', joinedAt: new Date().toISOString() }
        ];
        this.saveMembers(seeded);
        return seeded;
    }

    static getRoleForUser(userId: string, members: GuildMember[] = this.getOrCreateDemoMembers()): GuildRole | null {
        return members.find(m => m.userId === userId)?.role || null;
    }

    static canPropose(role: GuildRole | null): boolean {
        return role === 'Owner' || role === 'Analyst';
    }

    static canVote(role: GuildRole | null): boolean {
        return role === 'Owner' || role === 'Analyst' || role === 'Member';
    }

    static getProposals(): JointAcquisitionProposal[] {
        const parsed = store.get<JointAcquisitionProposal[]>(GUILD_PROPOSALS_KEY, []);
        return Array.isArray(parsed) ? parsed : [];
    }

    static saveProposals(proposals: JointAcquisitionProposal[]): void {
        store.set(GUILD_PROPOSALS_KEY, proposals);
    }

    static createProposal(input: CreateProposalInput): JointAcquisitionProposal {
        return {
            id: crypto.randomUUID(),
            title: input.title.trim(),
            targetAssetName: input.targetAssetName.trim(),
            targetCardId: input.targetCardId || crypto.randomUUID(),
            targetPrice: input.targetPrice,
            currentFunding: 0,
            minEntry: input.minEntry,
            proposedBy: input.proposedBy,
            proposalMemo: input.proposalMemo?.trim(),
            payoutWaterfall: {
                managerCarryPercent: 10,
                reservePercent: 5,
                distributionModel: 'pro_rata'
            },
            participants: [],
            votes: [],
            quorumPercent: DEFAULT_GOVERNANCE.quorumPercent,
            approvalStatus: 'pending',
            approvalDeadline: new Date(Date.now() + DEFAULT_GOVERNANCE.approvalWindowHours * 60 * 60 * 1000).toISOString(),
            ledgerEntries: [],
            status: 'open',
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            agentEvaluation: {
                id: crypto.randomUUID(),
                summary: input.summary,
                keyTakeaways: [
                    `Target asset: ${input.targetAssetName}`,
                    `Target raise: $${input.targetPrice.toLocaleString()}`,
                    `Minimum entry: $${input.minEntry.toLocaleString()}`
                ],
                riskAssessment: 'Moderate',
                recommendedAction: 'Stage diligence and vote',
                agents: [],
                createdAt: new Date().toISOString()
            }
        };
    }

    static upsertProposal(proposal: JointAcquisitionProposal): JointAcquisitionProposal[] {
        const proposals = this.getProposals();
        const idx = proposals.findIndex(p => p.id === proposal.id);
        if (idx >= 0) proposals[idx] = proposal;
        else proposals.unshift(proposal);
        this.saveProposals(proposals);
        return proposals;
    }

    static addContribution(proposal: JointAcquisitionProposal, userId: string, amount: number): JointAcquisitionProposal {
        const currentFunding = proposal.currentFunding + amount;
        const existing = proposal.participants.find(p => p.userId === userId);
        const participants = [...proposal.participants];

        if (existing) {
            existing.amount += amount;
        } else {
            participants.push({ userId, amount, share: 0 });
        }

        const updatedParticipants = participants.map(p => ({
            ...p,
            share: currentFunding > 0 ? Math.round((p.amount / currentFunding) * 1000) / 10 : 0
        }));

        const entry: ContributionLedgerEntry = {
            id: crypto.randomUUID(),
            proposalId: proposal.id,
            userId,
            amount,
            status: 'held',
            createdAt: new Date().toISOString()
        };

        return {
            ...proposal,
            currentFunding,
            participants: updatedParticipants,
            ledgerEntries: [entry, ...(proposal.ledgerEntries || [])],
            status: currentFunding >= proposal.targetPrice ? 'funded' : proposal.status
        };
    }

    static castVote(proposal: JointAcquisitionProposal, userId: string, vote: ProposalVote['vote']): JointAcquisitionProposal {
        const votes = [...(proposal.votes || [])];
        const existingIdx = votes.findIndex(v => v.userId === userId);
        const nextVote: ProposalVote = { userId, vote, votedAt: new Date().toISOString() };
        if (existingIdx >= 0) votes[existingIdx] = nextVote;
        else votes.push(nextVote);

        const evaluation = this.evaluateQuorum(votes, this.getOrCreateDemoMembers().length, proposal.quorumPercent || DEFAULT_GOVERNANCE.quorumPercent);

        return {
            ...proposal,
            votes,
            approvalStatus: evaluation.status,
            quorumPercent: proposal.quorumPercent || DEFAULT_GOVERNANCE.quorumPercent
        };
    }

    static settleProposal(proposal: JointAcquisitionProposal, outcome: 'release' | 'return'): JointAcquisitionProposal {
        const nextLedger = (proposal.ledgerEntries || []).map(entry => ({
            ...entry,
            status: outcome === 'release' ? 'released' as const : 'returned' as const
        }));

        return {
            ...proposal,
            ledgerEntries: nextLedger,
            status: outcome === 'release' ? 'completed' : 'cancelled'
        };
    }

    static getSnapshot(proposals: JointAcquisitionProposal[] = this.getProposals()): GuildSnapshot {
        const totalEscrowed = proposals.reduce((sum, proposal) => sum + proposal.currentFunding, 0);
        const fundedProposals = proposals.filter(proposal => proposal.status === 'funded' || proposal.status === 'completed').length;
        const openProposals = proposals.filter(proposal => proposal.status === 'open').length;
        const resolved = proposals.filter(proposal => proposal.approvalStatus === 'approved' || proposal.approvalStatus === 'rejected');
        const approved = resolved.filter(proposal => proposal.approvalStatus === 'approved').length;

        return {
            totalEscrowed,
            fundedProposals,
            openProposals,
            approvalRate: resolved.length > 0 ? approved / resolved.length : 0
        };
    }

    static getProposalSummary(proposal: JointAcquisitionProposal, memberCount: number = this.getOrCreateDemoMembers().length) {
        const approvals = (proposal.votes || []).filter(v => v.vote === 'approve').length;
        const rejects = (proposal.votes || []).filter(v => v.vote === 'reject').length;
        const quorumTarget = Math.ceil((memberCount * (proposal.quorumPercent || DEFAULT_GOVERNANCE.quorumPercent)) / 100);
        const escrowHeld = (proposal.ledgerEntries || [])
            .filter(entry => entry.status === 'held')
            .reduce((sum, entry) => sum + entry.amount, 0);

        return {
            approvals,
            rejects,
            quorumTarget,
            escrowHeld,
            fundingGap: Math.max(0, proposal.targetPrice - proposal.currentFunding)
        };
    }

    static evaluateQuorum(votes: ProposalVote[], memberCount: number, quorumPercent: number): { status: 'pending' | 'approved' | 'rejected'; approvals: number; rejects: number; quorumMet: boolean } {
        const approvals = votes.filter(v => v.vote === 'approve').length;
        const rejects = votes.filter(v => v.vote === 'reject').length;
        const quorumNeeded = Math.ceil((memberCount * quorumPercent) / 100);
        const quorumMet = votes.length >= quorumNeeded;

        if (quorumMet && approvals > rejects) return { status: 'approved', approvals, rejects, quorumMet };
        if (quorumMet && rejects >= approvals) return { status: 'rejected', approvals, rejects, quorumMet };
        return { status: 'pending', approvals, rejects, quorumMet };
    }
}
