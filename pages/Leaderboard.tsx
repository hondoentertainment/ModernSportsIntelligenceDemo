// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { fetchLeaderboard } from '../lib/social/socialService';
import { LeaderboardEntry } from '../types';
import { Trophy, TrendingUp, Medal, ArrowUpRight, ArrowDownRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Leaderboard: React.FC = () => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await fetchLeaderboard();
            setEntries(data);
            setLoading(false);
        }
        load();
    }, []);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="text-amber-400" size={24} fill="currentColor" />;
            case 2: return <Medal className="text-slate-300" size={24} fill="currentColor" />;
            case 3: return <Medal className="text-amber-700" size={24} fill="currentColor" />;
            default: return <span className="text-xl font-black text-slate-600 font-mono">#{rank}</span>;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2 flex items-center gap-3">
                        <Trophy className="text-brand-lime" size={32} />
                        Alpha Leaderboard
                    </h1>
                    <p className="text-slate-400">Top collectors ranked by Portfolio Alpha Score & ROI.</p>
                </div>
                <div className="px-4 py-2 bg-brand-lime/10 text-brand-lime text-xs font-black uppercase tracking-widest rounded-xl border border-brand-lime/20">
                    Global Ranking
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-brand-charcoal border-b border-slate-800">
                            <th className="p-6 text-[10px] font-black text-brand-muted uppercase tracking-widest">Rank</th>
                            <th className="p-6 text-[10px] font-black text-brand-muted uppercase tracking-widest">Collector</th>
                            <th className="p-6 text-[10px] font-black text-brand-muted uppercase tracking-widest text-right">Alpha Score</th>
                            <th className="p-6 text-[10px] font-black text-brand-muted uppercase tracking-widest text-right">Portfolio Value</th>
                            <th className="p-6 text-[10px] font-black text-brand-muted uppercase tracking-widest text-right">24h Shift</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-500 animate-pulse">Calculating Global Alpha...</td>
                            </tr>
                        ) : entries.map(entry => (
                            <tr key={entry.user.id} className="group hover:bg-slate-800/30 transition-colors">
                                <td className="p-6 w-24 text-center">{getRankIcon(entry.rank)}</td>
                                <td className="p-6">
                                    <Link to={`/p/${entry.user.username}`} className="flex items-center gap-4">
                                        <img
                                            src={entry.user.avatarUrl}
                                            alt={entry.user.username}
                                            className="w-12 h-12 rounded-full border-2 border-slate-700 group-hover:border-brand-lime transition-colors object-cover"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-white text-lg group-hover:text-brand-lime transition-colors">{entry.user.displayName}</p>
                                                {entry.user.tier && (
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${entry.user.tier === 'Whale' ? 'bg-amber-500/10 border-amber-500 text-amber-500' :
                                                            entry.user.tier === 'Shark' ? 'bg-brand-blue/10 border-brand-blue text-brand-blue' :
                                                                'bg-brand-teal/10 border-brand-teal text-brand-teal'
                                                        }`}>
                                                        {entry.user.tier}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 font-mono">@{entry.user.username}</p>
                                        </div>
                                    </Link>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="inline-block px-4 py-1 bg-brand-charcoal rounded-lg border border-slate-700">
                                        <span className="text-xl font-black text-white">{entry.alphaScore}</span>
                                    </div>
                                </td>
                                <td className="p-6 text-right">
                                    <p className="text-lg font-mono font-bold text-slate-300">${entry.user.portfolioValue.toLocaleString()}</p>
                                </td>
                                <td className="p-6 text-right">
                                    <div className={`flex items-center justify-end gap-1 font-mono font-bold ${entry.change24h >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                                        {entry.change24h >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                        {Math.abs(entry.change24h).toFixed(1)}%
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-brand-charcoal border border-slate-800 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-brand-lime/10 text-brand-lime rounded-xl">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Verified Identity</h3>
                        <p className="text-xs text-slate-400">Connect wallet to verify your assets.</p>
                    </div>
                </div>
                <div className="p-6 bg-brand-charcoal border border-slate-800 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Daily Rewards</h3>
                        <p className="text-xs text-slate-400">Earn XP for maintaining high Alpha.</p>
                    </div>
                </div>
                <div className="p-6 bg-brand-charcoal border border-slate-800 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Seasonal Prizes</h3>
                        <p className="text-xs text-slate-400">Top 3 collectors win exclusive slabs.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
