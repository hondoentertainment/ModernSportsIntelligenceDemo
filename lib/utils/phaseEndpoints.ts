import {
    ExecutionAdapter,
    ExecutionOrder,
    ExecutionService,
    OrderIntent
} from './executionService';
import {
    BacktestResult,
    StrategyDefinition,
    runBacktest,
    walkForwardValidate
} from './strategyEngine';
import {
    RiskPolicy,
    RiskEvaluation,
    buildComplianceBundle,
    evaluateRiskPolicy
} from './riskOffice';
import {
    ListingVerification,
    ReputationProfile,
    addReferralEdge,
    calculateReputation,
    getReferralCount,
    verifyListing
} from '../trading/marketplaceService';
import {
    ExplainabilityCard,
    WorkflowRun,
    WorkflowTemplate,
    createExplainabilityCard,
    runWorkflowTemplate
} from './copilotService';
import {
    ApiTokenRecord,
    ExtensionManifest,
    PlatformService,
    WebhookEvent
} from './platformService';
import { AutonomousAction } from '../../types';

let mockExecutionRegistered = false;

export function ensureMockExecutionAdapter(): void {
    if (mockExecutionRegistered) return;

    const adapter: ExecutionAdapter = {
        name: 'mock',
        submit: async (intent: OrderIntent) => ({
            id: `ord-${intent.id}`,
            intentId: intent.id,
            venue: 'mock',
            state: 'submitted',
            submittedAt: new Date().toISOString(),
            filledQuantity: 0
        }),
        cancel: async () => true,
        status: async () => 'filled'
    };

    ExecutionService.registerAdapter(adapter);
    mockExecutionRegistered = true;
}

export async function postExecutionIntent(intent: OrderIntent, budget: number): Promise<ExecutionOrder> {
    ensureMockExecutionAdapter();
    return ExecutionService.submitIntent(intent, 'mock', budget);
}

export async function getExecutionOrders(): Promise<ExecutionOrder[]> {
    ensureMockExecutionAdapter();
    return ExecutionService.reconcileOpenOrders('mock');
}

export function toggleExecutionKillSwitch(enabled: boolean): boolean {
    ExecutionService.setKillSwitch(enabled);
    return ExecutionService.getKillSwitch();
}

export function postStrategyBacktest(prices: number[], strategy: StrategyDefinition): { backtest: BacktestResult; walkForward: BacktestResult[] } {
    return {
        backtest: runBacktest(prices, strategy),
        walkForward: walkForwardValidate(prices, strategy, 3)
    };
}

export function postRiskEvaluation(policy: RiskPolicy, values: number[], actions: AutonomousAction[], topHoldingPct: number) {
    const evaluation: RiskEvaluation = evaluateRiskPolicy(policy, values, actions, topHoldingPct);
    const bundle = buildComplianceBundle(policy, values, actions, evaluation);
    return { evaluation, bundle };
}

export function postMarketplaceReputation(userId: string, fillRate: number, disputeRate: number, onTimeRate: number): ReputationProfile {
    return calculateReputation(userId, fillRate, disputeRate, onTimeRate);
}

export function postListingVerification(listingId: string, authenticityConfidence: number, metadataCompleteness: number): ListingVerification {
    return verifyListing(listingId, authenticityConfidence, metadataCompleteness);
}

export function postReferral(fromUserId: string, toUserId: string): number {
    addReferralEdge(fromUserId, toUserId);
    return getReferralCount(fromUserId);
}

export function postWorkflowRun(template: WorkflowTemplate, approvedStepIds: string[]): WorkflowRun {
    return runWorkflowTemplate(template, approvedStepIds);
}

export function postExplainabilityCard(title: string, rationale: string, evidence: string[], confidence: number): ExplainabilityCard {
    return createExplainabilityCard(title, rationale, evidence, confidence);
}

export function postRegisterExtension(manifest: ExtensionManifest): ExtensionManifest[] {
    return PlatformService.registerExtension(manifest);
}

export function postIssueApiToken(tenantId: string, scopes: string[]): ApiTokenRecord {
    return PlatformService.issueApiToken(tenantId, scopes);
}

export function postWebhook(event: Omit<WebhookEvent, 'id' | 'createdAt'>): WebhookEvent {
    return PlatformService.publishWebhook(event);
}

export function getWebhooks(): WebhookEvent[] {
    return PlatformService.listWebhooks();
}
