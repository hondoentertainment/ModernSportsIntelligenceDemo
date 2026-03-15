import React, { useState } from 'react';
import {
  X,
  Tv,
  Users,
  Flame,
  Timer,
  Star,
  Crosshair,
  AlertTriangle,
} from 'lucide-react';
import {
  getLiveBreakRooms,
  getLiveAuctions,
  getBreakRoomStats,
  getAuctionStats,
  getSnipeBots,
} from '../lib/liveBreakRoomService.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LiveBreakRoomModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'breaks' | 'auctions' | 'sniper' | 'stats'>('breaks');
  const [_selectedBreak, _setSelectedBreak] = useState<string | null>(null);
  const [_selectedAuction, _setSelectedAuction] = useState<string | null>(null);

  if (!isOpen) return null;

  const breakRooms = getLiveBreakRooms();
  const auctions = getLiveAuctions();
  const breakStats = getBreakRoomStats();
  const auctionStats = getAuctionStats();
  const snipeBots = getSnipeBots();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Tv size={24} className="text-rose-400" />
            <h2 className="text-xl font-bold text-white">Live Break Room & Auction Intelligence</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-4 gap-3 p-4 bg-slate-800/30">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Break ROI</p>
            <p className="text-xl font-bold text-emerald-400">+{breakStats.roi.toFixed(1)}%</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Auction Win Rate</p>
            <p className="text-xl font-bold text-blue-400">{auctionStats.winRate.toFixed(1)}%</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Avg Savings</p>
            <p className="text-xl font-bold text-amber-400">{auctionStats.averageSavingsVsFMV.toFixed(1)}%</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Snipe Success</p>
            <p className="text-xl font-bold text-rose-400">{auctionStats.snipeBotSuccessRate}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 pb-0">
          {(['breaks', 'auctions', 'sniper', 'stats'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${tab === t ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
              {t === 'breaks' ? `Live Breaks (${breakRooms.length})` : t === 'auctions' ? `Auctions (${auctions.length})` : t === 'sniper' ? `Snipe Bots (${snipeBots.length})` : 'My Stats'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[45vh]">
          {tab === 'breaks' && (
            <div className="space-y-3">
              {breakRooms.map(brk => (
                <div key={brk.id} className={`bg-slate-800/50 border rounded-xl overflow-hidden transition-all ${brk.status === 'live' ? 'border-rose-500/30' : 'border-slate-700/30'}`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {brk.status === 'live' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${brk.status === 'live' ? 'bg-red-500/20 text-red-300' : brk.status === 'upcoming' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-600/20 text-slate-400'}`}>
                          {brk.status.toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] bg-slate-700/50 text-slate-400 rounded">{brk.sport}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="flex items-center gap-0.5"><Users size={10} /> {brk.viewers}</span>
                        <span className="flex items-center gap-0.5"><Star size={10} /> {brk.host.rating}</span>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-slate-200 mb-1">{brk.title}</p>
                    <p className="text-xs text-slate-500 mb-2">{brk.product} · by {brk.host.name} ({brk.host.totalBreaks} breaks)</p>

                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-500">Spots</p>
                        <p className="text-xs font-bold text-slate-300">{brk.filledSpots}/{brk.totalSpots}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-500">Price</p>
                        <p className="text-xs font-bold text-slate-300">${brk.pricePerSpot}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-500">Est. Value</p>
                        <p className="text-xs font-bold text-emerald-400">${brk.estimatedValue}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-500">EV Rating</p>
                        <p className={`text-xs font-bold ${brk.evRating >= 75 ? 'text-emerald-400' : brk.evRating >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{brk.evRating}/100</p>
                      </div>
                    </div>

                    {brk.hits.length > 0 && (
                      <div className="space-y-1 mb-3">
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1"><Flame size={10} className="text-orange-400" /> Recent Hits</p>
                        {brk.hits.slice(0, 3).map(hit => (
                          <div key={hit.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold ${hit.hitType === 'auto' ? 'bg-purple-500/20 text-purple-400' : hit.hitType === 'numbered' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-600/20 text-slate-400'}`}>
                                {hit.hitType.toUpperCase()}
                              </span>
                              <span className="text-xs text-slate-300 truncate">{hit.cardDescription}</span>
                            </div>
                            <div className="text-right ml-2">
                              <span className="text-xs font-bold text-emerald-400">${hit.estimatedValue}</span>
                              <span className="text-[10px] text-slate-500 ml-1">→ {hit.spotHolder}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {brk.availableTeams && brk.availableTeams.filter(t => t.status === 'available').length > 0 && (
                      <div className="space-y-1 mb-3">
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Available Teams</p>
                        {brk.availableTeams.filter(t => t.status === 'available').slice(0, 3).map(team => (
                          <div key={team.team} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-2">
                            <div>
                              <span className="text-xs text-slate-300">{team.team}</span>
                              <span className="text-[10px] text-slate-500 ml-2">({team.keyPlayers.join(', ')})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500">EV: {team.evScore}</span>
                              <span className="text-xs font-bold text-slate-200">${team.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {brk.chatMessages.length > 0 && (
                      <div className="bg-slate-900/50 rounded-lg p-2 max-h-24 overflow-y-auto">
                        {brk.chatMessages.slice(-3).map(msg => (
                          <div key={msg.id} className={`text-[10px] py-0.5 ${msg.type === 'system' ? 'text-amber-400' : msg.type === 'hit_alert' ? 'text-orange-400 font-bold' : 'text-slate-400'}`}>
                            {msg.type !== 'system' && msg.type !== 'hit_alert' && <span className="text-slate-500">{msg.sender}: </span>}
                            {msg.content}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                        <Tv size={12} /> {brk.status === 'live' ? 'Watch Break' : 'Join Break'}
                      </button>
                      {brk.filledSpots < brk.totalSpots && (
                        <button className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold transition-colors">
                          Buy Spot (${brk.pricePerSpot})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'auctions' && (
            <div className="space-y-3">
              {auctions.map(auction => (
                <div key={auction.id} className={`bg-slate-800/50 border rounded-xl p-4 transition-all ${auction.status === 'ending_soon' ? 'border-amber-500/30' : 'border-slate-700/30'}`}>
                  <div className="flex items-start gap-4">
                    <img src={auction.image} alt={auction.playerName} className="w-14 h-18 rounded-lg object-cover bg-slate-700" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-[10px] bg-slate-700/50 text-slate-400 rounded">{auction.platform}</span>
                        {auction.status === 'ending_soon' && <span className="px-2 py-0.5 text-[10px] bg-red-500/20 text-red-300 rounded animate-pulse">ENDING SOON</span>}
                        {auction.sniperAlert && <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded flex items-center gap-0.5"><Crosshair size={8} /> SNIPER</span>}
                      </div>
                      <p className="text-sm font-semibold text-slate-200">{auction.title}</p>

                      <div className="grid grid-cols-4 gap-2 mt-2">
                        <div>
                          <p className="text-[10px] text-slate-500">Current Bid</p>
                          <p className="text-sm font-bold text-slate-200">${auction.currentBid.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">FMV</p>
                          <p className="text-sm font-bold text-emerald-400">${auction.estimatedValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">vs FMV</p>
                          <p className={`text-sm font-bold ${auction.intelligence.priceVsFMV < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {auction.intelligence.priceVsFMV.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Deal Score</p>
                          <p className={`text-sm font-bold ${auction.dealScore >= 80 ? 'text-emerald-400' : auction.dealScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                            {auction.dealScore}/100
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                        <span className="flex items-center gap-0.5"><Timer size={8} /> {auction.timeRemaining}</span>
                        <span>{auction.bidCount} bids</span>
                        <span>{auction.watcherCount} watchers</span>
                        <span>Pattern: {auction.intelligence.bidPattern.replace(/_/g, ' ')}</span>
                      </div>

                      {/* AI Intelligence */}
                      <div className="mt-3 bg-blue-500/5 border border-blue-500/20 rounded-lg p-2">
                        <p className="text-[10px] text-blue-400 font-semibold mb-1">AI Intelligence</p>
                        <p className="text-[10px] text-slate-400">Recommended max bid: <span className="text-slate-200 font-bold">${auction.intelligence.recommendedMaxBid.toLocaleString()}</span></p>
                        <p className="text-[10px] text-slate-400">Win probability: <span className="text-slate-200">{auction.intelligence.winProbability}%</span> · Snipe window: <span className="text-slate-200">{auction.intelligence.snipeWindow}</span></p>
                        {auction.intelligence.riskFactors.length > 0 && (
                          <div className="flex items-start gap-1 mt-1">
                            <AlertTriangle size={8} className="text-amber-400 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-amber-400">{auction.intelligence.riskFactors[0]}</p>
                          </div>
                        )}
                      </div>

                      {/* Recent Comps */}
                      <div className="mt-2">
                        <p className="text-[10px] text-slate-500 font-semibold">Recent Comps</p>
                        {auction.intelligence.recentComps.slice(0, 2).map((comp, i) => (
                          <div key={i} className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                            <span>{comp.description}</span>
                            <span className="text-slate-400">${comp.price.toLocaleString()} · {comp.date}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors">
                          Place Bid
                        </button>
                        <button className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                          <Crosshair size={12} /> Set Snipe Bot
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'sniper' && (
            <div className="space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crosshair size={16} className="text-amber-400" />
                  <h4 className="text-sm font-semibold text-amber-300">Snipe Bot Intelligence</h4>
                </div>
                <p className="text-xs text-slate-400">Automatically places bids in the final seconds of auctions at your maximum price. AI analyzes bid patterns to optimize timing and win probability.</p>
              </div>

              {snipeBots.map(bot => {
                const auction = auctions.find(a => a.id === bot.auctionId);
                return (
                  <div key={bot.id} className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Crosshair size={14} className="text-amber-400" />
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${bot.status === 'armed' ? 'bg-amber-500/20 text-amber-300 animate-pulse' : 'bg-slate-600/20 text-slate-400'}`}>
                          {bot.status.toUpperCase()}
                        </span>
                      </div>
                      <button className="text-xs text-red-400 hover:text-red-300">Cancel</button>
                    </div>
                    {auction && (
                      <div>
                        <p className="text-sm font-medium text-slate-200">{auction.title}</p>
                        <p className="text-xs text-slate-500">{auction.platform} · Ends in {auction.timeRemaining}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className="text-slate-400">Max bid: <span className="text-slate-200 font-bold">${bot.maxBid.toLocaleString()}</span></span>
                          <span className="text-slate-400">Snipe at: <span className="text-slate-200">{bot.snipeTime}s before end</span></span>
                          <span className="text-slate-400">Current: <span className="text-slate-200">${auction.currentBid.toLocaleString()}</span></span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {snipeBots.length === 0 && (
                <div className="text-center py-8">
                  <Crosshair size={48} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No active snipe bots</p>
                  <p className="text-xs text-slate-600 mt-1">Set up snipe bots from the Auctions tab</p>
                </div>
              )}
            </div>
          )}

          {tab === 'stats' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3">Break Stats</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Breaks Watched', value: breakStats.totalBreaksWatched.toString() },
                    { label: 'Hits Received', value: breakStats.totalHitsReceived.toString() },
                    { label: 'Total Spent', value: `$${breakStats.totalSpent.toLocaleString()}` },
                    { label: 'Total Hit Value', value: `$${breakStats.totalHitValue.toLocaleString()}` },
                    { label: 'ROI', value: `+${breakStats.roi.toFixed(1)}%`, color: 'text-emerald-400' },
                    { label: 'Best Hit', value: breakStats.bestHit.card },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{stat.label}</span>
                      <span className={`text-xs font-medium ${stat.color || 'text-slate-300'}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Auction Stats</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Auctions Tracked', value: auctionStats.totalAuctionsTracked.toString() },
                    { label: 'Bids Placed', value: auctionStats.totalBidsPlaced.toString() },
                    { label: 'Wins', value: `${auctionStats.totalWins} (${auctionStats.winRate.toFixed(1)}%)` },
                    { label: 'Total Spent', value: `$${auctionStats.totalSpent.toLocaleString()}` },
                    { label: 'Est. Value Won', value: `$${auctionStats.totalEstimatedValue.toLocaleString()}`, color: 'text-emerald-400' },
                    { label: 'Snipe Success', value: `${auctionStats.snipeBotSuccessRate}%` },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{stat.label}</span>
                      <span className={`text-xs font-medium ${stat.color || 'text-slate-300'}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveBreakRoomModal;
