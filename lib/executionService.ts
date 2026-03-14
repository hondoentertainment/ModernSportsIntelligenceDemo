// Phase 37: Execution Integrations

import { insertExecutionFill, upsertExecutionIntent } from './differentiatorData';

export type OrderIntentType = 'buy' | 'list' | 'cancel' | 'counter';
export type ExecutionState = 'submitted' | 'filled' | 'partial' | 'failed' | 'cancelled';

export interface OrderIntent {
    id: string;
    type: OrderIntentType;
    assetId: string;
    assetName: string;
    quantity: number;
    price: number;
    maxSlippagePct?: number;
    feePct?: number;
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
    venue: string;
    state: ExecutionState;
    submittedAt: string;
    filledQuantity: number;
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
    try {
        const raw = localStorage.getItem(ORDERS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeOrders(orders: ExecutionOrder[]): void {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export class ExecutionService {
    private static adapters = new Map<string, ExecutionAdapter>();

    static registerAdapter(adapter: ExecutionAdapter): void {
        this.adapters.set(adapter.name, adapter);
    }

    static getKillSwitch(): boolean {
        return localStorage.getItem(KILL_SWITCH_KEY) === 'true';
    }

    static setKillSwitch(enabled: boolean): void {
        localStorage.setItem(KILL_SWITCH_KEY, String(enabled));
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
                venue,
                state: 'failed',
                submittedAt: new Date().toISOString(),
                filledQuantity: 0,
                lastError: checks.reasons.join(' ')
            };
            await upsertExecutionIntent({
                id: intent.id,
                actionType: intent.type,
                venue: venue as any,
                assetId: intent.assetId,
                assetName: intent.assetName,
                quantity: intent.quantity,
                limitPrice: intent.price,
                maxSlippagePct: intent.maxSlippagePct,
                status: 'failed',
                rationale: failedOrder.lastError,
                createdAt: intent.createdAt,
            });
            return failedOrder;
        }

        const order = await adapter.submit(intent);
        await upsertExecutionIntent({
            id: intent.id,
            actionType: intent.type,
            venue: venue as any,
            assetId: intent.assetId,
            assetName: intent.assetName,
            quantity: intent.quantity,
            limitPrice: intent.price,
            maxSlippagePct: intent.maxSlippagePct,
            status: order.state === 'submitted' ? 'submitted' : 'filled',
            rationale: `Execution submitted via ${venue}.`,
            createdAt: intent.createdAt,
        });
        const orders = [order, ...readOrders()].slice(0, 500);
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
