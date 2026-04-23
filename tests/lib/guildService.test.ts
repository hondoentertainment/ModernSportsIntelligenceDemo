// @ts-nocheck
import { describe, expect, it, beforeEach } from 'vitest';
import { GuildService } from '../../lib/social/guildService';
import { JointAcquisitionProposal } from '../../types';

describe('GuildService', () => {
    const baseProposal: JointAcquisitionProposal = {
        id: 'proposal-1',
        targetCardId: 'card-1',
        targetPrice: 1000,
        currentFunding: 200,
        minEntry: 100,
        participants: [],
        votes: [],
        quorumPercent: 60,
        approvalStatus: 'pending',
        approvalDeadline: new Date(Date.now() + 86400000).toISOString(),
        ledgerEntries: [],
        status: 'open',
        expiryDate: new Date(Date.now() + 86400000).toISOString(),
        agentEvaluation: {
            id: 't1',
            summary: 'test',
            keyTakeaways: [],
            riskAssessment: 'Low',
            recommendedAction: 'Acquire',
            agents: [],
            createdAt: new Date().toISOString()
        }
    };

    beforeEach(() => {
        localStorage.clear();
    });

    it('adds contribution and updates escrow ledger', () => {
        const updated = GuildService.addContribution(baseProposal, 'member-1', 150);
        expect(updated.currentFunding).toBe(350);
        expect(updated.ledgerEntries?.length).toBe(1);
        expect(updated.ledgerEntries?.[0].status).toBe('held');
    });

    it('casts votes and resolves quorum', () => {
        GuildService.getOrCreateDemoMembers();
        let proposal = GuildService.castVote(baseProposal, 'owner-1', 'approve');
        expect(proposal.approvalStatus).toBe('pending');

        proposal = GuildService.castVote(proposal, 'analyst-1', 'approve');
        expect(proposal.approvalStatus).toBe('approved');
    });

    it('creates and settles a proposal lifecycle', () => {
        const proposal = GuildService.createProposal({
            title: 'Test Pool',
            targetAssetName: '2024 Bowman Chrome Prospect',
            targetPrice: 2500,
            minEntry: 250,
            summary: 'Structured guild pool.',
            proposedBy: 'Guild Owner'
        });

        expect(proposal.title).toBe('Test Pool');

        const funded = GuildService.addContribution(proposal, 'member-1', 2500);
        const settled = GuildService.settleProposal(funded, 'release');

        expect(settled.status).toBe('completed');
        expect(settled.ledgerEntries?.every(entry => entry.status === 'released')).toBe(true);
    });
});
