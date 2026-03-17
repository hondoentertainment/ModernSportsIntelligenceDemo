import React, { useState, useMemo } from 'react';
import {
  Gavel,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Zap,
  Eye,
  Shield,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  DollarSign,
  Award,
} from 'lucide-react';
import {
  getAuctionAnalyses,
  getBidderProfiles,
  getUserBidHistory,
  getEquilibriumStats,
  getExploitabilityLabel,
  getCompetitionColor,
  type AuctionAnalysis,
} from '../lib/auctionEquilibriumService';

const PLATFORM_COLORS: Record<string, string> = {
  goldin: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  heritage: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  whatnot: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  ebay: 'text-red-400 bg-red-500/10 border-red-500/30',
  pwcc: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const AuctionEquilibrium: React.FC = () => {
  const auctions = useMemo(() => getAuctionAnalyses(), []);
  const bidders = useMemo(() => getBidderProfiles(), []);
  const history = useMemo(() => getUserBidHistory(), []);
  const stats = useMemo(() => getEquilibriumStats(), []);
  const [selectedAuction, setSelectedAuction] = useState<AuctionAnalysis | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? auctions : auctions.filter(a => a.platform === filter);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Gavel size={22} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Auction Game Theory Engine</h1>
              <p className="text-slate-400 text-sm">
                Bayesian Nash equilibrium bidding — find exploitable auctions before anyone else
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={16} className="text-amber-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Active Auctions</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.activeAuctions}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-green-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Exploitable</span>
            </div>
            <p className="text-green-400 font-bold text-3xl">{stats.exploitableAuctions}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-emerald-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Avg Savings</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.avgSavings}%</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-blue-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Win Rate</span>
            </div>
            <p className="text-white font-bold text-3xl">{history.winRate}%</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-purple-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Total Saved</span>
            </div>
            <p className="text-white font-bold text-3xl">${history.totalSaved.toLocaleString()}</p>
          </div>
        </div>

        {/* Platform filter */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'goldin', 'heritage', 'whatnot', 'ebay', 'pwcc'].map(p => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                filter === p ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {p === 'all' ? 'All Platforms' : p}
            </button>
          ))}
        </div>

        {/* Auction Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(auction => {
            const exploit = getExploitabilityLabel(auction.exploitabilityScore);
            const compColor = getCompetitionColor(auction.competitionIntensity);
            return (
              <div
                key={auction.id}
                onClick={() => setSelectedAuction(selectedAuction?.id === auction.id ? null : auction)}
                className={`bg-slate-900 rounded-xl border cursor-pointer transition-all hover:border-amber-500/50 ${
                  selectedAuction?.id === auction.id ? 'border-amber-500/70 ring-1 ring-amber-500/30' : 'border-slate-800'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${PLATFORM_COLORS[auction.platform] || 'text-slate-400 bg-slate-800 border-slate-700'}`}>
                          {auction.platform}
                        </span>
                        <span className="text-slate-500 text-xs">{auction.auctionType}</span>
                      </div>
                      <h3 className="text-white font-semibold text-sm">{auction.cardName}</h3>
                      <p className="text-slate-500 text-xs mt-0.5">{auction.auctionTitle}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-slate-400 text-xs">Time Left</p>
                      <p className="text-white font-mono text-sm">{auction.timeRemaining}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Current Bid</p>
                      <p className="text-white font-bold">${auction.currentBid.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Nash Equilibrium</p>
                      <p className="text-amber-400 font-bold">${auction.nashEquilibriumBid.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Fair Value</p>
                      <p className="text-emerald-400 font-bold">${auction.estimatedFairValue.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold bg-slate-800 ${exploit.color}`}>
                        Exploit: {auction.exploitabilityScore}
                      </span>
                      <span className={`text-xs ${compColor}`}>
                        <Users size={12} className="inline mr-1" />
                        {auction.estimatedBidders} bidders ({auction.hiddenBidders} hidden)
                      </span>
                    </div>
                    <span className="text-green-400 text-xs font-bold">
                      {auction.winProbability}% win
                    </span>
                  </div>
                </div>

                {selectedAuction?.id === auction.id && (
                  <div className="border-t border-slate-800 p-5 bg-slate-900/70">
                    <h4 className="text-amber-400 font-semibold text-xs uppercase tracking-wide mb-3">Equilibrium Analysis</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase">Optimal Entry</p>
                        <p className="text-white font-bold">${auction.optimalEntryPoint.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase">Bid Ceiling</p>
                        <p className="text-white font-bold">${auction.bidCeiling.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase">Optimal Bid Time</p>
                        <p className="text-white font-bold">{auction.optimalBidTime}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase">Expected Savings</p>
                        <p className="text-green-400 font-bold">${auction.expectedSavings.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-slate-400 text-xs flex items-center gap-2">
                        <Zap size={14} className="text-amber-400" />
                        <span className="font-semibold text-slate-300">Strategy:</span> {auction.recommendedStrategy}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bidder Archetypes */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Users size={16} className="text-amber-400" />
            Detected Bidder Archetypes in Active Auctions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {bidders.map(b => (
              <div key={b.id} className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-white font-semibold text-xs capitalize mb-1">{b.archetype.replace('-', ' ')}</p>
                <p className="text-slate-400 text-[10px]">Val: ${b.estimatedValuation.toLocaleString()}</p>
                <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${b.bidAggressiveness}%` }}
                  />
                </div>
                <p className="text-slate-500 text-[10px] mt-1">Aggression: {b.bidAggressiveness}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Win/Loss History */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-amber-400" />
            Your Bid History with Engine
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{history.totalAuctions}</p>
              <p className="text-slate-400 text-xs">Total Auctions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">{history.wins}</p>
              <p className="text-slate-400 text-xs">Wins</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-400">{history.avgSavingsVsMarket}%</p>
              <p className="text-slate-400 text-xs">Avg Savings vs Market</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{history.improvedWinRateWithEngine}%</p>
              <p className="text-slate-400 text-xs">Improved Win Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionEquilibrium;
