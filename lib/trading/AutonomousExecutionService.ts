// @ts-nocheck
import { AgentRecommendationOrigin, AutoPilotConfig, AutonomousAction, CardInventory, CollaborativeThesis, RiskCollar } from "../types";
import { MultiAgentService } from "../utils/MultiAgentService";
import { showToast } from "../utils/toast";
import { logAuditEvent } from "../utils/auditLog";
import { insertAgentOutcome, insertExecutionApproval, upsertAgentRecommendation, upsertExecutionIntent } from "../utils/differentiatorData";
import { ExecutionService, OrderIntent } from "../utils/executionService";
import { ensureMockExecutionAdapter } from "../utils/phaseEndpoints";
import { logger } from "../logger";
import { store } from "../dal/syncStore";

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

function mapActionToIntentType(action: AutonomousAction): 'buy' | 'list' | 'counter' {
    switch (action.type) {
        case 'BUY':
            return 'buy';
        case 'SELL':
            return 'list';
        default:
            return 'counter';
    }
}

function mapActionToRecommendationStatus(action: AutonomousAction): 'approved' | 'pending_approval' | 'rejected' | 'submitted' | 'filled' | 'failed' | 'cancelled' {
    if (action.status === 'submitted') return 'submitted';
    if (action.status === 'executed') return 'filled';
    if (action.status === 'rejected') return 'rejected';
    if (action.status === 'cancelled') return 'cancelled';
    if (action.status === 'failed' || action.policyDecision === 'blocked') return 'failed';
    if (action.policyDecision === 'needs_approval') return 'pending_approval';
    return 'approved';
}

export class AutonomousExecutionService {
    static getConfig(): AutoPilotConfig {
        return store.get<AutoPilotConfig>(STORAGE_KEY, DEFAULT_CONFIG);
    }

    static saveConfig(config: AutoPilotConfig) {
        store.set(STORAGE_KEY, config);
    }

    static getActions(): AutonomousAction[] {
        return store.get<AutonomousAction[]>(ACTIONS_KEY, []);
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

    static async persistActionRecommendations(
        actions: AutonomousAction[],
        source: AgentRecommendationOrigin,
        thesis?: CollaborativeThesis
    ): Promise<AutonomousAction[]> {
        return Promise.all(actions.map(async action => {
            const recommendationId = action.recommendationId || crypto.randomUUID();
            const nextAction = { ...action, recommendationId };
            await upsertAgentRecommendation({
                id: recommendationId,
                source,
                cycleId: nextAction.cycleId,
                thesisId: thesis?.id,
                summary: thesis?.summary || nextAction.rationale,
                recommendedAction: `${nextAction.type} ${nextAction.assetName}`,
                riskAssessment: thesis?.riskAssessment,
                status: mapActionToRecommendationStatus(nextAction),
                keyTakeaways: thesis?.keyTakeaways || [nextAction.rationale],
                agents: thesis?.agents || [],
                executionPlan: [nextAction],
                linkedIntentId: nextAction.linkedIntentId,
                linkedOutcomeId: nextAction.linkedOutcomeId,
                metadata: {
                    amount: nextAction.amount,
                    confidence: nextAction.confidence,
                    estimatedEdgePct: nextAction.estimatedEdgePct,
                    policyDecision: nextAction.policyDecision,
                    policyReason: nextAction.policyReason,
                    scenarioTag: nextAction.scenarioTag,
                    thesisRecommendationId: thesis?.recommendationId,
                },
                createdAt: nextAction.timestamp,
                updatedAt: new Date().toISOString(),
            });
            return nextAction;
        }));
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
        store.set(ACTIONS_KEY, updated);

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
        const config = this.getConfig();
        const approvalTimestamp = new Date().toISOString();
        const intentId = crypto.randomUUID();
        let updatedAction: AutonomousAction | undefined;

        let actions = this.getActions().map(action => {
            if (action.id !== actionId) return action;
            updatedAction = {
                ...action,
                linkedIntentId: decision === 'approve' ? (action.linkedIntentId || intentId) : action.linkedIntentId,
                policyDecision: decision === 'approve' ? 'approved' as const : 'blocked' as const,
                policyReason: decision === 'approve'
                    ? 'Approved by operator checkpoint.'
                    : 'Rejected by operator checkpoint.',
                status: decision === 'approve' ? 'approved' as const : 'rejected' as const,
                approvalActor: actor,
                approvalNote: note,
                approvalUpdatedAt: approvalTimestamp
            };
            return updatedAction;
        });

        if (!updatedAction) {
            return actions;
        }

        if (decision === 'approve') {
            const executionIntent = {
                id: updatedAction.linkedIntentId || intentId,
                recommendationId: updatedAction.recommendationId,
                actionType: mapActionToIntentType(updatedAction),
                venue: 'mock' as const,
                assetId: updatedAction.id,
                assetName: updatedAction.assetName,
                quantity: 1,
                limitPrice: updatedAction.amount,
                maxSlippagePct: config.collar.riskTolerance === 'Conservative' ? 3 : config.collar.riskTolerance === 'Aggressive' ? 8 : 5,
                status: 'pending_approval' as const,
                rationale: updatedAction.rationale,
                metadata: {
                    actionId: updatedAction.id,
                    cycleId: updatedAction.cycleId,
                    scenarioTag: updatedAction.scenarioTag,
                },
                createdAt: updatedAction.timestamp,
                updatedAt: approvalTimestamp,
            };

            await upsertExecutionIntent(executionIntent);
            await insertExecutionApproval({
                id: crypto.randomUUID(),
                intentId: executionIntent.id,
                actorUserId: undefined,
                actorLabel: actor,
                decision,
                note,
                createdAt: approvalTimestamp,
            });

            if (updatedAction.recommendationId) {
                await insertAgentOutcome({
                    id: crypto.randomUUID(),
                    recommendationId: updatedAction.recommendationId,
                    intentId: executionIntent.id,
                    outcomeType: 'approved',
                    amount: updatedAction.amount,
                    quantity: 1,
                    price: updatedAction.amount,
                    venue: executionIntent.venue,
                    rationale: updatedAction.policyReason,
                    metadata: {
                        actor,
                        note,
                    },
                    recordedAt: approvalTimestamp,
                });
            }

            ensureMockExecutionAdapter();
            const orderIntent: OrderIntent = {
                id: executionIntent.id,
                recommendationId: updatedAction.recommendationId,
                assetId: executionIntent.assetId || updatedAction.id,
                assetName: executionIntent.assetName,
                type: executionIntent.actionType,
                quantity: executionIntent.quantity,
                price: executionIntent.limitPrice,
                maxSlippagePct: executionIntent.maxSlippagePct,
                rationale: executionIntent.rationale,
                createdAt: approvalTimestamp,
            };
            const order = await ExecutionService.submitIntent(orderIntent, executionIntent.venue, config.collar.maxBudget);
            updatedAction = {
                ...updatedAction,
                linkedIntentId: executionIntent.id,
                status: order.state === 'failed' ? 'failed' : 'submitted'
            };
        } else if (updatedAction.recommendationId) {
            await insertAgentOutcome({
                id: crypto.randomUUID(),
                recommendationId: updatedAction.recommendationId,
                outcomeType: 'rejected',
                amount: updatedAction.amount,
                quantity: 1,
                price: updatedAction.amount,
                rationale: updatedAction.policyReason,
                metadata: {
                    actor,
                    note,
                },
                recordedAt: approvalTimestamp,
            });
        }

        actions = actions.map(action => action.id === updatedAction?.id ? updatedAction! : action);
        store.set(ACTIONS_KEY, actions);

        if (updatedAction?.recommendationId) {
            await upsertAgentRecommendation({
                id: updatedAction.recommendationId,
                source: 'autopilot-cycle',
                cycleId: updatedAction.cycleId,
                summary: updatedAction.rationale,
                recommendedAction: `${updatedAction.type} ${updatedAction.assetName}`,
                status: mapActionToRecommendationStatus(updatedAction),
                keyTakeaways: [updatedAction.rationale],
                agents: [],
                executionPlan: [updatedAction],
                linkedIntentId: updatedAction.linkedIntentId,
                linkedOutcomeId: updatedAction.linkedOutcomeId,
                metadata: {
                    actor,
                    note,
                    policyDecision: updatedAction.policyDecision,
                    policyReason: updatedAction.policyReason,
                },
                createdAt: updatedAction.timestamp,
                updatedAt: approvalTimestamp,
            });
        }

        await logAuditEvent({
            category: 'autonomy',
            action: `autopilot.action.${decision}`,
            entityType: 'autonomous_action',
            entityId: updatedAction.id,
            metadata: {
                actor,
                note,
                assetName: updatedAction.assetName,
                amount: updatedAction.amount,
                recommendationId: updatedAction.recommendationId,
                intentId: updatedAction.linkedIntentId,
                status: updatedAction.status,
            }
        });

        return actions;
    }

    static createFallbackThesis(inventory: CardInventory[]) {
        const top = inventory[0];
        return {
            id: crypto.randomUUID(),
            recommendationId: crypto.randomUUID(),
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
        let thesis = await MultiAgentService.getCollaborativeThesis(inventory, config.isActive, 'autopilot-preview');
        if (!thesis) {
            thesis = this.createFallbackThesis(inventory);
        }

        const candidates = this.buildActionCandidates(inventory, config, thesis);
        const actions = await this.persistActionRecommendations(
            this.enforceRiskCollars(candidates, config, this.getActions()),
            'autopilot-preview',
            thesis
        );
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

        let thesis = await MultiAgentService.getCollaborativeThesis(inventory, true, 'autopilot-cycle');
        if (!thesis) {
            thesis = this.createFallbackThesis(inventory);
        }

        const candidates = this.buildActionCandidates(inventory, config, thesis);
        const actions = await this.persistActionRecommendations(
            this.enforceRiskCollars(candidates, config, this.getActions()),
            'autopilot-cycle',
            thesis
        );
        await Promise.all(actions.map(action => this.addAction(action)));
        for (const action of actions.filter(candidate => candidate.policyDecision === 'approved')) {
            await this.decideAction(action.id, 'approve', 'policy-engine');
        }

        const approved = actions.filter(a => a.policyDecision === 'approved').length;
        const needsApproval = actions.filter(a => a.policyDecision === 'needs_approval').length;
        const blocked = actions.filter(a => a.policyDecision === 'blocked').length;

        if (actions.length > 0) {
            showToast('info', `Auto-Pilot cycle complete: ${approved} approved, ${needsApproval} pending approval, ${blocked} blocked.`);
        }

        return actions;
    }
}
