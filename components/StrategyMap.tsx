// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { CardInventory } from '../types';
import { Network, ArrowUpRight, Shield, Beaker, PlayCircle, XCircle } from 'lucide-react';
import {
    PaperTradeLedger,
    StrategyRegistry,
    getDefaultStrategies,
    runBacktest,
    summarizeBacktest,
    walkForwardValidate
} from '../lib/utils/strategyEngine';
import { showToast } from '../lib/utils/toast';

interface StrategyMapProps {
    inventory: CardInventory[];
}

const StrategyMap: React.FC<StrategyMapProps> = ({ inventory }) => {
    const [selectedStrategyId, setSelectedStrategyId] = useState<string>(() => StrategyRegistry.getAll()[0]?.id || getDefaultStrategies()[0].id);
    const [paperTrades, setPaperTrades] = useState(() => PaperTradeLedger.getAll());

    // Generate some "nodes" based on sports/leagues
    const nodes = useMemo(() => {
        const sports = Array.from(new Set(inventory.map(c => c.sport)));
        return sports.map((sport, i) => ({
            id: sport,
            label: sport,
            value: inventory.filter(c => c.sport === sport).length,
            // Random-ish positions for a "map" effect
            x: 20 + (i * 25) % 60,
            y: 20 + (i * 30) % 60,
            color: sport === 'Baseball' ? 'from-brand-lime to-brand-teal' :
                sport === 'Basketball' ? 'from-brand-blue to-brand-teal' :
                    'from-brand-orange to-brand-red'
        }));
    }, [inventory]);

    const strategies = useMemo(() => StrategyRegistry.getAll(), []);
    const selectedStrategy = strategies.find(strategy => strategy.id === selectedStrategyId) || strategies[0];
    const prices = useMemo(() => {
        const seed = inventory
            .slice(0, 8)
            .map(card => card.currentValue || card.purchasePrice || 0)
            .filter(value => value > 0);
        return seed.length >= 4 ? seed : [100, 104, 103, 108, 106, 112, 110, 116];
    }, [inventory]);
    const backtest = useMemo(() => runBacktest(prices, selectedStrategy), [prices, selectedStrategy]);
    const walkForward = useMemo(() => walkForwardValidate(prices, selectedStrategy, 3), [prices, selectedStrategy]);
    const snapshot = useMemo(() => summarizeBacktest(backtest, walkForward), [backtest, walkForward]);

    const handlePaperTrade = () => {
        const anchorCard = inventory[0];
        const assetName = anchorCard ? `${anchorCard.year} ${anchorCard.player}` : 'MSI Paper Position';
        const entryPrice = anchorCard?.currentValue || prices[prices.length - 1];
        const positions = PaperTradeLedger.openPosition(selectedStrategy.id, assetName, entryPrice);
        setPaperTrades(positions);
        showToast('success', `Paper trade opened for ${assetName}.`);
    };

    const handleClosePaperTrade = (positionId: string, currentPrice: number) => {
        const positions = PaperTradeLedger.closePosition(positionId, currentPrice);
        setPaperTrades(positions);
        showToast('info', 'Paper trade closed and logged.');
    };

    const activePaperTrades = paperTrades.filter(position => position.status === 'open').slice(0, 2);

    return (
        <div className="luminous-card rounded-[2.5rem] p-8 relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-lime/10 transition-colors"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-teal/10 rounded-xl text-brand-teal">
                        <Network size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bebas tracking-wide text-white">Strategy Lab</h3>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Backtest + Paper Trade Control</p>
                    </div>
                </div>
                <select
                    value={selectedStrategy.id}
                    onChange={(event) => setSelectedStrategyId(event.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white"
                >
                    {strategies.map(strategy => (
                        <option key={strategy.id} value={strategy.id}>{strategy.name}</option>
                    ))}
                </select>
            </div>

            <div className="relative h-[300px] w-full bg-brand-charcoal/30 rounded-3xl border border-slate-800/50 overflow-hidden">
                {/* SVG Connections (Simulated for Demo) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                    {nodes.map((node, i) => (
                        nodes.slice(i + 1).map((target, j) => (
                            <line
                                key={`${i}-${j}`}
                                x1={`${node.x}%`}
                                y1={`${node.y}%`}
                                x2={`${target.x}%`}
                                y2={`${target.y}%`}
                                stroke="white"
                                strokeWidth="0.5"
                                strokeDasharray="4 4"
                            />
                        ))
                    ))}
                </svg>

                {/* Nodes */}
                {nodes.map(node => (
                    <div
                        key={node.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group/node cursor-pointer"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${node.color} p-0.5 shadow-lg group-hover/node:scale-110 transition-transform duration-500`}>
                            <div className="w-full h-full bg-brand-charcoal rounded-full flex items-center justify-center text-xs font-black text-white">
                                {node.value}
                            </div>
                        </div>
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest group-hover/node:text-white transition-colors">
                                {node.label}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Floating Signals */}
                <div className="absolute bottom-4 left-4 p-3 bg-brand-charcoal/80 backdrop-blur-md border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield size={12} className="text-brand-lime" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Walk-Forward Risk</span>
                    </div>
                    <p className="text-[8px] text-brand-muted uppercase font-bold tracking-tighter">Overfit risk: {snapshot.overfitRisk}. Score {snapshot.score.toFixed(1)}.</p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="px-4 py-3 bg-slate-800 rounded-2xl">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Backtest Return</p>
                        <p className="text-xl font-mono font-bold text-white mt-1">{backtest.totalReturnPct.toFixed(1)}%</p>
                    </div>
                    <div className="px-4 py-3 bg-slate-800 rounded-2xl">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Win Rate</p>
                        <p className="text-xl font-mono font-bold text-white mt-1">{(snapshot.winRate * 100).toFixed(0)}%</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                    <button
                        onClick={handlePaperTrade}
                        className="px-4 py-3 bg-brand-lime text-brand-charcoal rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2"
                    >
                        <PlayCircle size={14} /> Open Paper Trade
                    </button>
                    <div className="text-[9px] font-black text-brand-teal uppercase tracking-widest flex items-center gap-1">
                        Expectancy {snapshot.expectancy.toFixed(1)} <ArrowUpRight size={12} />
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {activePaperTrades.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        No active paper trades. Launch one to test the current playbook.
                    </div>
                ) : (
                    activePaperTrades.map(position => (
                        <div key={position.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white">{position.assetName}</p>
                                <p className="text-[9px] text-slate-400 mt-1">Entry ${position.entryPrice.toFixed(0)} | Mark ${position.currentPrice.toFixed(0)}</p>
                            </div>
                            <button
                                onClick={() => handleClosePaperTrade(position.id, (position.currentPrice || position.entryPrice) * 1.04)}
                                className="px-3 py-2 rounded-xl bg-slate-800 text-red-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                            >
                                <XCircle size={12} /> Close
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StrategyMap;
