// Phase 37: Execution Integrations

import { store } from './dal/syncStore';
import { insertAgentOutcome, insertExecutionFill, upsertExecutionIntent } from './differentiatorData';

export type OrderIntentType = 'buy' | 'list' | 'cancel' | 'counter';
export type ExecutionState = 'submitted' | 'filled' | 'partial' | 'failed' | 'cancelled';

export interface OrderIntent {
    id: string;
    type: OrderIntentType;
    assetId: string;
    assetName: string;
    ownerUserId?: string | null;
    recommendationId?: string | null;
    counterpartyId?: string | null;
    listingId?: string | null;
    dealRoomId?: string | null;
    quantity: number;
    price: number;
    maxSlippagePct?: number;
    feePct?: number;
    rationale?: string;
    createdAt: string;
}

export interface PreTradeCheckResult {
    approved: boolean;
    reasons: string[];
    estimatedFees: number;
    estimatedTotal: number;
}

export interface ExecutionOrder {
    id: string;
    intentId: string;
    recommendationId?: string | null;
    ownerUserId?: string | null;
    venue: string;
    actionType?: OrderIntentType;
    assetId?: string;
    assetName?: string;
    state: ExecutionState;
    submittedAt: string;
    filledQuantity: number;
    requestedQuantity?: number;
    requestedPrice?: number;
    avgFillPrice?: number;
    lastError?: string;
}

export interface ExecutionAdapter {
    name: string;
    submit(intent: OrderIntent): Promise<ExecutionOrder>;
    cancel(orderId: string): Promise<boolean>;
    status(orderId: string): Promise<ExecutionState>;
}

const ORDERS_KEY = 'msi_execution_orders';
const KILL_SWITCH_KEY = 'msi_execution_kill_switch';

function readOrders(): ExecutionOrder[] {
    const parsed = store.get<ExecutionOrder[]>(ORDERS_KEY, []);
    return Array.isArray(parsed) ? parsed : [];
}

function writeOrders(orders: ExecutionOrder[]): void {
    store.set(ORDERS_KEY, orders);
}

export class ExecutionService {
    private static adapters = new Map<string, ExecutionAdapter>();

    static registerAdapter(adapter: ExecutionAdapter): void {
        this.adapters.set(adapter.name, adapter);
    }

    static getKillSwitch(): boolean {
        return store.get<boolean>(KILL_SWITCH_KEY, false);
    }

    static setKillSwitch(enabled: boolean): void {
        store.set(KILL_SWITCH_KEY, enabled);
    }

    static preTradeCheck(intent: OrderIntent, maxPositionBudget: number): PreTradeCheckResult {
        const reasons: string[] = [];
        const feePct = intent.feePct ?? 0.13;
        const slippage = intent.maxSlippagePct ?? 5;

        if (this.getKillSwitch()) reasons.push('Global execution kill-switch is active.');
        if (intent.quantity <= 0) reasons.push('Quantity must be positive.');
        if (intent.price <= 0) reasons.push('Price must be positive.');
        if (slippage > 10) reasons.push('Max slippage exceeds policy threshold (10%).');

        const estimatedFees = intent.quantity * intent.price * feePct;
        const estimatedTotal = intent.quantity * intent.price + estimatedFees;

        if (intent.type === 'buy' && estimatedTotal > maxPositionBudget) {
            reasons.push('Estimated total exceeds configured position budget.');
        }

        return {
            approved: reasons.length === 0,
            reasons,
            estimatedFees,
            estimatedTotal
        };
    }

    static async submitIntent(intent: OrderIntent, venue: string, maxPositionBudget: number): Promise<ExecutionOrder> {
        const adapter = this.adapters.get(venue);
        if (!adapter) {
            throw new Error(`No execution adapter registered for venue '${venue}'.`);
        }

        const checks = this.preTradeCheck(intent, maxPositionBudget);
        if (!checks.approved) {
            const failedOrder = {
                id: crypto.randomUUID(),
                intentId: intent.id,
                recommendationId: intent.recommendationId,
                ownerUserId: intent.ownerUserId,
                venue,
                actionType: intent.type,
                assetId: intent.assetId,
                assetName: intent.assetName,
                state: 'failed',
                submittedAt: new Date().toISOString(),
                filledQuantity: 0,
                requestedQuantity: intent.quantity,
                requestedPrice: intent.price,
                lastError: checks.reasons.join(' ')
            };
            await upsertExecutionIntent({
                id: intent.id,
                ownerUserId: intent.ownerUserId,
                recommendationId: intent.recommendationId,
                counterpartyId: intent.counterpartyId,
                listingId: intent.listingId,
                dealRoomId: intent.dealRoomId,
                actionType: intent.type,
                venue: venue as any,
                assetId: intent.assetId,
                assetName: intent.assetName,
                quantity: intent.quantity,
                limitPrice: intent.price,
                maxSlippagePct: intent.maxSlippagePct,
                status: 'failed',
                rationale: intent.rationale || failedOrder.lastError,
                createdAt: intent.createdAt,
                updatedAt: new Date().toISOString(),
            });
            if (intent.recommendationId) {
                await insertAgentOutcome({
                    id: crypto.randomUUID(),
                    ownerUserId: intent.ownerUserId,
                    recommendationId: intent.recommendationId,
                    intentId: intent.id,
                    outcomeType: 'failed',
                    amount: checks.estimatedTotal,
                    quantity: intent.quantity,
                    price: intent.price,
                    venue: venue as any,
                    rationale: failedOrder.lastError,
                    recordedAt: new Date().toISOString(),
                });
            }
            return failedOrder;
        }

        const order = await adapter.submit(intent);
        await upsertExecutionIntent({
            id: intent.id,
            ownerUserId: intent.ownerUserId,
            recommendationId: intent.recommendationId,
            counterpartyId: intent.counterpartyId,
            listingId: intent.listingId,
            dealRoomId: intent.dealRoomId,
            actionType: intent.type,
            venue: venue as any,
            assetId: intent.assetId,
            assetName: intent.assetName,
            quantity: intent.quantity,
            limitPrice: intent.price,
            maxSlippagePct: intent.maxSlippagePct,
            status: order.state === 'submitted' ? 'submitted' : 'filled',
            rationale: intent.rationale || `Execution submitted via ${venue}.`,
            createdAt: intent.createdAt,
            updatedAt: new Date().toISOString(),
        });
        if (intent.recommendationId) {
            await insertAgentOutcome({
                id: crypto.randomUUID(),
                ownerUserId: intent.ownerUserId,
                recommendationId: intent.recommendationId,
                intentId: intent.id,
                outcomeType: order.state === 'submitted' ? 'submitted' : 'filled',
                amount: intent.quantity * intent.price,
                quantity: intent.quantity,
                price: intent.price,
                venue: venue as any,
                rationale: intent.rationale || `Execution ${order.state} via ${venue}.`,
                recordedAt: new Date().toISOString(),
            });
        }
        const orders = [{
            ...order,
            recommendationId: intent.recommendationId,
            ownerUserId: intent.ownerUserId,
            actionType: intent.type,
            assetId: intent.assetId,
            assetName: intent.assetName,
            requestedQuantity: intent.quantity,
            requestedPrice: intent.price,
        }, ...readOrders()].slice(0, 500);
        writeOrders(orders);
        return order;
    }

    static async reconcileOpenOrders(venue: string): Promise<ExecutionOrder[]> {
        const adapter = this.adapters.get(venue);
        if (!adapter) return readOrders();

        const orders = readOrders();
        const reconciled = await Promise.all(orders.map(async (o) => {
            if (o.venue !== venue || ['filled', 'failed', 'cancelled'].includes(o.state)) {
                return o;
            }
            const nextState = await adapter.status(o.id);
            if (nextState === 'filled') {
                await insertExecutionFill({
                    id: crypto.randomUUID(),
                    intentId: o.intentId,
                    venue: venue as any,
                    fillQuantity: o.filledQuantity || 1,
                    fillPrice: o.avgFillPrice || 0,
                    state: 'filled',
                    externalOrderId: o.id,
                    createdAt: new Date().toISOString(),
                });
                await upsertExecutionIntent({
                    id: o.intentId,
                    ownerUserId: o.ownerUserId,
                    recommendationId: o.recommendationId,
                    actionType: o.actionType || 'buy',
                    venue: venue as any,
                    assetId: o.assetId,
                    assetName: o.assetName || o.intentId,
                    quantity: o.requestedQuantity || o.filledQuantity || 1,
                    limitPrice: o.requestedPrice || o.avgFillPrice || 0,
                    status: 'filled',
                    rationale: `Execution filled via ${venue}.`,
                    createdAt: o.submittedAt,
                    updatedAt: new Date().toISOString(),
                });
                if (o.recommendationId) {
                    await insertAgentOutcome({
                        id: crypto.randomUUID(),
                        recommendationId: o.recommendationId,
                        ownerUserId: o.ownerUserId,
                        intentId: o.intentId,
                        outcomeType: 'filled',
                        amount: (o.filledQuantity || 1) * (o.avgFillPrice || 0),
                        quantity: o.filledQuantity || 1,
                        price: o.avgFillPrice || 0,
                        venue: venue as any,
                        rationale: `Execution fill confirmed via ${venue}.`,
                        fillId: undefined,
                        recordedAt: new Date().toISOString(),
                    });
                }
            }
            return { ...o, state: nextState };
        }));

        writeOrders(reconciled);
        return reconciled;
    }

    static getOrders(): ExecutionOrder[] {
        return readOrders();
    }
}
