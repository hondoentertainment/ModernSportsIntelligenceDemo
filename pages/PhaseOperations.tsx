// @ts-nocheck
import React, { useMemo, useState } from 'react';
import {
    Shield,
    Activity,
    FlaskConical,
    Scale,
    Store,
    Bot,
    Plug,
    RefreshCw,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';
import {
    getExecutionOrders,
    postExecutionIntent,
    postExplainabilityCard,
    postIssueApiToken,
    postListingVerification,
    postMarketplaceReputation,
    postReferral,
    postRegisterExtension,
    postRiskEvaluation,
    postStrategyBacktest,
    postWebhook,
    postWorkflowRun,
    toggleExecutionKillSwitch
} from '../lib/utils/phaseEndpoints';
import { StrategyDefinition } from '../lib/utils/strategyEngine';
import { getDefaultWorkflowTemplates } from '../lib/utils/copilotService';

const strategy: StrategyDefinition = {
    id: 'phase-ops-momentum',
    name: 'Phase Ops Momentum',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    entryRules: [{ metric: 'momentum', operator: 'gt', threshold: 0 }],
    exitRules: [{ metric: 'momentum', operator: 'lt', threshold: 0 }]
};

const PhaseOperations: React.FC = () => {
    const [killSwitch, setKillSwitch] = useState(false);
    const [executionSummary, setExecutionSummary] = useState<string>('No executions yet.');
    const [strategySummary, setStrategySummary] = useState<string>('No backtests yet.');
    const [riskSummary, setRiskSummary] = useState<string>('No risk evaluations yet.');
    const [marketSummary, setMarketSummary] = useState<string>('No marketplace checks yet.');
    const [copilotSummary, setCopilotSummary] = useState<string>('No workflow runs yet.');
    const [platformSummary, setPlatformSummary] = useState<string>('No platform events yet.');
    const [isBusy, setIsBusy] = useState(false);

    const workflowTemplate = useMemo(() => getDefaultWorkflowTemplates()[1], []);

    const runExecutionDemo = async () => {
        setIsBusy(true);
        const intent = {
            id: crypto.randomUUID(),
            type: 'buy' as const,
            assetId: 'asset-001',
            assetName: '2023 Corbin Carroll Bowman Chrome',
            quantity: 1,
            price: 140,
            maxSlippagePct: 3,
            feePct: 0.12,
            createdAt: new Date().toISOString()
        };

        await postExecutionIntent(intent, 500);
        const orders = await getExecutionOrders();
        setExecutionSummary(`Orders reconciled: ${orders.length}. Latest state: ${orders[0]?.state ?? 'n/a'}`);
        setIsBusy(false);
    };

    const runStrategyDemo = () => {
        const prices = [100, 102, 104, 101, 99, 103, 108, 106, 109];
        const { backtest, walkForward } = postStrategyBacktest(prices, strategy);
        setStrategySummary(`Return: ${backtest.totalReturnPct}% | Trades: ${backtest.trades} | WF windows: ${walkForward.length}`);
    };

    const runRiskDemo = () => {
        const result = postRiskEvaluation(
            {
                id: 'default',
                name: 'Default Risk Policy',
                maxPositionPct: 40,
                maxDrawdownPct: 15,
                maxDailyActions: 4
            },
            [1000, 980, 970, 965, 990],
            [
                {
                    id: 'a1',
                    type: 'BUY',
                    assetName: 'Asset A',
                    amount: 100,
                    rationale: 'Signal',
                    timestamp: new Date().toISOString(),
                    status: 'pending'
                }
            ],
            35
        );

        setRiskSummary(`Policy passed: ${result.evaluation.passed ? 'YES' : 'NO'} | Violations: ${result.evaluation.violations.length}`);
    };

    const runMarketplaceDemo = () => {
        const rep = postMarketplaceReputation('user-001', 0.92, 0.04, 0.95);
        const listing = postListingVerification('listing-001', 0.91, 0.85);
        const referrals = postReferral('user-001', `ref-${Math.floor(Math.random() * 1000)}`);
        setMarketSummary(`Reputation: ${rep.score} (${rep.tier}) | Listing verified: ${listing.verified ? 'YES' : 'NO'} | Referrals: ${referrals}`);
    };

    const runCopilotDemo = () => {
        const run = postWorkflowRun(workflowTemplate, ['draft-actions']);
        const card = postExplainabilityCard('Rebalance', 'Reduce concentration risk.', ['Top holding > 40%'], 0.84);
        setCopilotSummary(`Workflow: ${run.status} | Explainability confidence: ${(card.confidence * 100).toFixed(0)}%`);
    };

    const runPlatformDemo = () => {
        postRegisterExtension({
            id: 'partner-extension-1',
            name: 'Partner Extension',
            version: '1.0.0',
            permissions: ['portfolio.read', 'valuation.read'],
            enabled: true
        });
        const token = postIssueApiToken('tenant-demo', ['portfolio.read']);
        const hook = postWebhook({ type: 'valuation.updated', payload: { cardId: 'card-1', value: 1234 } });
        setPlatformSummary(`Issued token: ${token.id.slice(0, 8)}... | Webhook: ${hook.type}`);
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8">
            <header className="space-y-2">
                <h1 className="text-4xl font-bebas tracking-wide text-white">Phase Operations Console (37-42)</h1>
                <p className="text-sm text-slate-400">Run integrated service demos for execution, strategy, risk/compliance, marketplace, copilot, and platform layers.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <section className="luminous-card p-6 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bebas text-white flex items-center gap-2"><Activity size={18} /> Phase 37</h2>
                        <button
                            onClick={() => {
                                const next = !killSwitch;
                                setKillSwitch(toggleExecutionKillSwitch(next));
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${killSwitch ? 'bg-red-500/20 text-red-400' : 'bg-brand-lime/20 text-brand-lime'}`}
                        >
                            Kill-Switch {killSwitch ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    <button onClick={runExecutionDemo} disabled={isBusy || killSwitch} className="w-full py-2 rounded-xl bg-brand-lime text-brand-charcoal font-black text-xs uppercase tracking-widest disabled:bg-slate-700 disabled:text-slate-400">
                        {isBusy ? 'Running...' : 'Run Execution Demo'}
                    </button>
                    <p className="text-xs text-slate-400">{executionSummary}</p>
                </section>

                <section className="luminous-card p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h2 className="text-xl font-bebas text-white flex items-center gap-2"><FlaskConical size={18} /> Phase 38</h2>
                    <button onClick={runStrategyDemo} className="w-full py-2 rounded-xl bg-brand-cyan text-brand-charcoal font-black text-xs uppercase tracking-widest">Run Backtest</button>
                    <p className="text-xs text-slate-400">{strategySummary}</p>
                </section>

                <section className="luminous-card p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h2 className="text-xl font-bebas text-white flex items-center gap-2"><Scale size={18} /> Phase 39</h2>
                    <button onClick={runRiskDemo} className="w-full py-2 rounded-xl bg-brand-orange text-brand-charcoal font-black text-xs uppercase tracking-widest">Evaluate Policy</button>
                    <p className="text-xs text-slate-400">{riskSummary}</p>
                </section>

                <section className="luminous-card p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h2 className="text-xl font-bebas text-white flex items-center gap-2"><Store size={18} /> Phase 40</h2>
                    <button onClick={runMarketplaceDemo} className="w-full py-2 rounded-xl bg-brand-green text-brand-charcoal font-black text-xs uppercase tracking-widest">Run Market Trust</button>
                    <p className="text-xs text-slate-400">{marketSummary}</p>
                </section>

                <section className="luminous-card p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h2 className="text-xl font-bebas text-white flex items-center gap-2"><Bot size={18} /> Phase 41</h2>
                    <button onClick={runCopilotDemo} className="w-full py-2 rounded-xl bg-violet-400 text-brand-charcoal font-black text-xs uppercase tracking-widest">Run Copilot Flow</button>
                    <p className="text-xs text-slate-400">{copilotSummary}</p>
                </section>

                <section className="luminous-card p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h2 className="text-xl font-bebas text-white flex items-center gap-2"><Plug size={18} /> Phase 42</h2>
                    <button onClick={runPlatformDemo} className="w-full py-2 rounded-xl bg-brand-lime text-brand-charcoal font-black text-xs uppercase tracking-widest">Run Platform Ops</button>
                    <p className="text-xs text-slate-400">{platformSummary}</p>
                </section>
            </div>

            <div className="luminous-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
                {killSwitch ? <AlertTriangle size={14} className="text-red-400" /> : <CheckCircle2 size={14} className="text-brand-lime" />}
                <span>
                    {killSwitch
                        ? 'Execution kill-switch is active. Submission endpoint is policy-blocked.'
                        : 'Execution path active. Use the controls above to trigger endpoint-backed demos.'}
                </span>
                <RefreshCw size={14} className="ml-auto text-slate-500" />
            </div>
        </div>
    );
};

export default PhaseOperations;
