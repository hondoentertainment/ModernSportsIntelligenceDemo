// Phase 39: Risk Office and Compliance Layer

import { AutonomousAction } from '../types';

export interface RiskPolicy {
    id: string;
    name: string;
    maxPositionPct: number;
    maxDrawdownPct: number;
    maxDailyActions: number;
}

export interface RiskEvaluation {
    passed: boolean;
    violations: string[];
}

export interface ComplianceBundle {
    generatedAt: string;
    policy: RiskPolicy;
    summary: {
        portfolioValue: number;
        actionCount: number;
        violations: number;
    };
    events: Array<{ type: string; detail: string; timestamp: string }>;
}

function percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.floor((sorted.length - 1) * p);
    return sorted[idx];
}

export function calculatePortfolioVaR(values: number[], confidence: number = 0.95): number {
    if (values.length < 2) return 0;
    const returns: number[] = [];
    for (let i = 1; i < values.length; i++) {
        const prev = values[i - 1];
        const next = values[i];
        returns.push(prev === 0 ? 0 : (next - prev) / prev);
    }

    const varQuantile = percentile(returns, 1 - confidence);
    return Math.abs(varQuantile * 100);
}

export function evaluateRiskPolicy(
    policy: RiskPolicy,
    portfolioValues: number[],
    actionsToday: AutonomousAction[],
    topHoldingPct: number
): RiskEvaluation {
    const violations: string[] = [];
    const var95 = calculatePortfolioVaR(portfolioValues, 0.95);

    if (topHoldingPct > policy.maxPositionPct) {
        violations.push(`Top holding concentration ${topHoldingPct.toFixed(1)}% exceeds ${policy.maxPositionPct}%.`);
    }
    if (var95 > policy.maxDrawdownPct) {
        violations.push(`Estimated VaR ${var95.toFixed(2)}% exceeds max drawdown ${policy.maxDrawdownPct}%.`);
    }
    if (actionsToday.length > policy.maxDailyActions) {
        violations.push(`Daily actions ${actionsToday.length} exceed ${policy.maxDailyActions}.`);
    }

    return { passed: violations.length === 0, violations };
}

export function buildComplianceBundle(
    policy: RiskPolicy,
    portfolioValues: number[],
    actionsToday: AutonomousAction[],
    evaluation: RiskEvaluation
): ComplianceBundle {
    const events = [
        ...actionsToday.map(a => ({ type: 'action', detail: `${a.type} ${a.assetName} (${a.amount})`, timestamp: a.timestamp })),
        ...evaluation.violations.map(v => ({ type: 'violation', detail: v, timestamp: new Date().toISOString() }))
    ];

    return {
        generatedAt: new Date().toISOString(),
        policy,
        summary: {
            portfolioValue: portfolioValues[portfolioValues.length - 1] || 0,
            actionCount: actionsToday.length,
            violations: evaluation.violations.length
        },
        events
    };
}
