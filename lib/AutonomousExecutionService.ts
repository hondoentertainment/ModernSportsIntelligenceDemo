import { AutoPilotConfig, AutonomousAction, CardInventory, RiskCollar } from "../types";
import { MultiAgentService } from "./MultiAgentService";
import { showToast } from "./toast";
import { logAuditEvent } from "./auditLog";

const STORAGE_KEY = 'msi_autopilot_config';
const ACTIONS_KEY = 'msi_autonomous_actions';

const DEFAULT_COLLAR: RiskCollar = {
    maxBudget: 1000,
    maxSpendPerAsset: 200,
    riskTolerance: 'Balanced',
    autoSellThreshold: 15,
    minActionConfidence: 0.6,
    requireApprovalAbove: 500,
    maxDailyActions: 5
};

const DEFAULT_CONFIG: AutoPilotConfig = {
    isActive: false,
    collar: DEFAULT_COLLAR
};

function startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export class AutonomousExecutionService {
    static getConfig(): AutoPilotConfig {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse autopilot config", e);
            }
        }
        return DEFAULT_CONFIG;
    }

    static saveConfig(config: AutoPilotConfig) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }

    static getActions(): AutonomousAction[] {
        const saved = localStorage.getItem(ACTIONS_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse autonomous actions", e);
            }
        }
        return [];
    }

    static getTodayActionCount(actions: AutonomousAction[] = this.getActions()): number {
        const today = startOfDay(new Date());
        return actions.filter(a => {
            const ts = new Date(a.timestamp);
            return !Number.isNaN(ts.getTime()) && ts >= today;
        }).length;
    }

    static enforceRiskCollars(
        candidates: AutonomousAction[],
        config: AutoPilotConfig,
        existingActions: AutonomousAction[] = this.getActions()
    ): AutonomousAction[] {
        const gated: AutonomousAction[] = [];
        const todayActionCount = this.getTodayActionCount(existingActions);
        let approvedBuySpend = 0;

        for (let i = 0; i < candidates.length; i++) {
            const action = { ...candidates[i] };
            action.idempotencyKey = action.idempotencyKey || `${action.type}:${action.assetName}:${action.timestamp}`;

            if ((config.collar.maxDailyActions || 0) > 0 && (todayActionCount + i) >= (config.collar.maxDailyActions || 0)) {
                action.policyDecision = 'blocked';
                action.policyReason = 'Daily action limit reached.';
                action.status = 'failed';
                gated.push(action);
                continue;
            }

            if (action.amount > config.collar.maxSpendPerAsset) {
                action.policyDecision = 'blocked';
                action.policyReason = 'Action amount exceeds max spend per asset.';
                action.status = 'failed';
                gated.push(action);
                continue;
            }

            const blockedPlayers = config.collar.blockedPlayers || [];
            if (blockedPlayers.some(player => action.assetName.toLowerCase().includes(player.toLowerCase()))) {
                action.policyDecision = 'blocked';
                action.policyReason = 'Player is on the blocked list.';
                action.status = 'failed';
                gated.push(action);
                continue;
            }

            const minConfidence = config.collar.minActionConfidence ?? 0;
            if ((action.confidence ?? 1) < minConfidence) {
                action.policyDecision = 'blocked';
                action.policyReason = 'Action confidence below configured threshold.';
                action.status = 'failed';
                gated.push(action);
                continue;
            }

            if (action.type === 'BUY') {
                if ((approvedBuySpend + action.amount) > config.collar.maxBudget) {
                    action.policyDecision = 'blocked';
                    action.policyReason = 'Action exceeds cycle budget.';
                    action.status = 'failed';
                    gated.push(action);
                    continue;
                }
                approvedBuySpend += action.amount;
            }

            if ((config.collar.requireApprovalAbove || 0) > 0 && action.amount >= (config.collar.requireApprovalAbove || 0)) {
                action.policyDecision = 'needs_approval';
                action.policyReason = 'Amount exceeds auto-approval threshold.';
                action.status = 'pending';
            } else {
                action.policyDecision = 'approved';
                action.policyReason = 'Passed risk collar checks.';
                action.status = 'pending';
            }

            gated.push(action);
        }

        return gated;
    }

    static simulateCycleImpact(inventory: CardInventory[], actions: AutonomousAction[]) {
        const startingValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
        const buySpend = actions
            .filter(a => a.type === 'BUY' && a.policyDecision !== 'blocked')
            .reduce((sum, a) => sum + a.amount, 0);
        const sellValue = actions
            .filter(a => a.type === 'SELL' && a.policyDecision !== 'blocked')
            .reduce((sum, a) => sum + a.amount, 0);

        return {
            startingValue,
            projectedBuySpend: buySpend,
            projectedSellValue: sellValue,
            projectedNetCashDelta: sellValue - buySpend,
            projectedPostCycleValue: startingValue + (sellValue - buySpend)
        };
    }

    static async addAction(action: AutonomousAction): Promise<boolean> {
        const actions = this.getActions();
        const duplicate = actions.some(existing =>
            existing.id === action.id ||
            (!!action.idempotencyKey && existing.idempotencyKey === action.idempotencyKey)
        );

        if (duplicate) {
            return false;
        }

        const updated = [action, ...actions].slice(0, 50);
        localStorage.setItem(ACTIONS_KEY, JSON.stringify(updated));

        await logAuditEvent({
            category: 'autonomy',
            action: 'autopilot.action.created',
            entityType: 'autonomous_action',
            entityId: action.id,
            metadata: {
                type: action.type,
                assetName: action.assetName,
                amount: action.amount,
                status: action.status,
                policyDecision: action.policyDecision,
                policyReason: action.policyReason
            }
        });

        return true;
    }

    static getPendingApprovals(actions: AutonomousAction[] = this.getActions()): AutonomousAction[] {
        return actions.filter(action => action.policyDecision === 'needs_approval' && action.status === 'pending');
    }

    static async decideAction(actionId: string, decision: 'approve' | 'reject', actor: string = 'operator', note?: string): Promise<AutonomousAction[]> {
        const actions = this.getActions().map(action => {
            if (action.id !== actionId) return action;
            return {
                ...action,
                policyDecision: decision === 'approve' ? 'approved' : 'blocked',
                policyReason: decision === 'approve'
                    ? 'Approved by operator checkpoint.'
                    : 'Rejected by operator checkpoint.',
                status: decision === 'approve' ? 'executed' : 'failed',
                approvalActor: actor,
                approvalNote: note,
                approvalUpdatedAt: new Date().toISOString()
            };
        });

        localStorage.setItem(ACTIONS_KEY, JSON.stringify(actions));

        const updated = actions.find(action => action.id === actionId);
        if (updated) {
            await logAuditEvent({
                category: 'autonomy',
                action: `autopilot.action.${decision}`,
                entityType: 'autonomous_action',
                entityId: updated.id,
                metadata: {
                    actor,
                    note,
                    assetName: updated.assetName,
                    amount: updated.amount
                }
            });
        }

        return actions;
    }

    static createFallbackThesis(inventory: CardInventory[]) {
        const top = inventory[0];
        return {
            id: crypto.randomUUID(),
            summary: 'Fallback autonomous cycle generated from portfolio heuristics while agent synthesis is unavailable.',
            keyTakeaways: top ? [`Monitoring top exposure in ${top.player}.`] : ['Portfolio currently light on active signals.'],
            riskAssessment: inventory.length > 5 ? 'Diversified enough for a small advisory cycle.' : 'Sparse inventory; favor conservative sizing.',
            recommendedAction: inventory.length > 0 ? 'Stage one low-risk action' : 'Wait for more data',
            agents: [
                { agentId: 'risk', agentName: 'Risk Warden', persona: 'Risk manager', insight: 'Maintain conservative action sizing.', sentiment: 'neutral' as const, confidence: 0.7 },
                { agentId: 'scout', agentName: 'Scout Prime', persona: 'Opportunity scout', insight: 'Look for liquid names with pricing support.', sentiment: 'positive' as const, confidence: 0.68 }
            ],
            createdAt: new Date().toISOString()
        };
    }

    static buildActionCandidates(inventory: CardInventory[], config: AutoPilotConfig, thesis: Awaited<ReturnType<typeof MultiAgentService.getCollaborativeThesis>> | ReturnType<typeof AutonomousExecutionService.createFallbackThesis>): AutonomousAction[] {
        const cycleId = crypto.randomUUID();
        const candidates: AutonomousAction[] = [];

        const riskWarden = thesis.agents.find(a => a.agentId === 'risk');
        const scout = thesis.agents.find(a => a.agentId === 'scout');
        const topAsset = inventory
            .slice()
            .sort((a, b) => ((b.currentValue || 0) - (a.currentValue || 0)))[0];
        const candidateBuy = inventory
            .slice()
            .sort((a, b) => ((b.opportunityScore || 0) - (a.opportunityScore || 0)))[0];

        if (riskWarden && riskWarden.sentiment === 'negative' && topAsset) {
            candidates.push({
                id: crypto.randomUUID(),
                cycleId,
                type: 'REBALANCE',
                assetName: `${topAsset.year} ${topAsset.player}`,
                amount: topAsset.currentValue || 0,
                confidence: riskWarden.confidence,
                rationale: `Risk Warden flagged concentration risk: ${riskWarden.insight}`,
                timestamp: new Date().toISOString(),
                status: 'pending',
                scenarioTag: 'concentration',
                estimatedEdgePct: -3
            });
        }

        if (scout && scout.sentiment === 'positive' && config.collar.maxBudget > 0) {
            const amount = Math.min(candidateBuy?.currentValue || 150, config.collar.maxSpendPerAsset);
            candidates.push({
                id: crypto.randomUUID(),
                cycleId,
                type: 'BUY',
                assetName: candidateBuy ? `${candidateBuy.year} ${candidateBuy.player}` : "2023 Corbin Carroll Bowman Chrome",
                amount,
                confidence: scout.confidence,
                rationale: `Scout Prime identified lagging alpha: ${scout.insight}`,
                timestamp: new Date().toISOString(),
                status: 'pending',
                scenarioTag: 'lagging-alpha',
                estimatedEdgePct: candidateBuy?.opportunityScore ? Math.round(((candidateBuy.opportunityScore - 50) / 3) * 10) / 10 : 5
            });
        }

        if (topAsset && ((topAsset.currentValue || 0) > (topAsset.purchasePrice || 0) * (1 + ((config.collar.autoSellThreshold || 15) / 100)))) {
            candidates.push({
                id: crypto.randomUUID(),
                cycleId,
                type: 'SELL',
                assetName: `${topAsset.year} ${topAsset.player}`,
                amount: topAsset.currentValue || 0,
                confidence: Math.max(riskWarden?.confidence || 0.72, 0.72),
                rationale: 'Profit lock threshold met. Consider de-risking the top performer.',
                timestamp: new Date().toISOString(),
                status: 'pending',
                scenarioTag: 'take-profit',
                estimatedEdgePct: config.collar.autoSellThreshold || 15
            });
        }

        return candidates;
    }

    static async previewAutonomousCycle(inventory: CardInventory[]) {
        const config = this.getConfig();
        let thesis = await MultiAgentService.getCollaborativeThesis(inventory, config.isActive);
        if (!thesis) {
            thesis = this.createFallbackThesis(inventory);
        }

        const candidates = this.buildActionCandidates(inventory, config, thesis);
        const actions = this.enforceRiskCollars(candidates, config, this.getActions());
        const impact = this.simulateCycleImpact(inventory, actions);

        return {
            thesis,
            actions,
            impact
        };
    }

    static async runAutonomousCycle(inventory: CardInventory[]): Promise<AutonomousAction[]> {
        const config = this.getConfig();
        if (!config.isActive) return [];

        let thesis = await MultiAgentService.getCollaborativeThesis(inventory, true);
        if (!thesis) {
            thesis = this.createFallbackThesis(inventory);
        }

        const candidates = this.buildActionCandidates(inventory, config, thesis);
        const actions = this.enforceRiskCollars(candidates, config, this.getActions());
        await Promise.all(actions.map(action => this.addAction(action)));

        const approved = actions.filter(a => a.policyDecision === 'approved').length;
        const needsApproval = actions.filter(a => a.policyDecision === 'needs_approval').length;
        const blocked = actions.filter(a => a.policyDecision === 'blocked').length;

        if (actions.length > 0) {
            showToast('info', `Auto-Pilot cycle complete: ${approved} approved, ${needsApproval} pending approval, ${blocked} blocked.`);
        }

        return actions;
    }
}
