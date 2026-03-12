import React, { useState } from 'react';
import { X, Landmark, TrendingUp, TrendingDown, Users, DollarSign, Copy, Star, Shield, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import { getFractionalListings, getSharePositions, getTopCollectors, getCopyTradeSignals, getVaultStats, type FractionalListing, type TopCollector } from '../lib/fractionalVaultService.ts';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const FractionalVaultModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'marketplace' | 'positions' | 'copy_trading'>('marketplace');
  const [selectedListing, setSelectedListing] = useState<FractionalListing | null>(null);
  const [sportFilter, setSportFilter] = useState<string>('all');

  if (!isOpen) return null;

  const listings = getFractionalListings(sportFilter !== 'all' ? { sport: sportFilter } : undefined);
  const positions = getSharePositions();
  const topCollectors = getTopCollectors();
  const signals = getCopyTradeSignals();
  const stats = getVaultStats();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-amber-500/10 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20">
              <Landmark size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Fractional Vault & Copy-Trading</h2>
              <p className="text-xs text-slate-400">Own shares of grail cards · Copy top collectors' moves</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-3 p-4 bg-slate-800/30">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Your Vault</p>
            <p className="text-xl font-bold text-slate-200">${stats.totalVaultValue.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Positions</p>
            <p className="text-xl font-bold text-blue-400">{stats.totalPositions}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Unrealized P/L</p>
            <p className={`text-xl font-bold ${stats.totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.totalPL >= 0 ? '+' : ''}${stats.totalPL.toFixed(0)}
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Return</p>
            <p className={`text-xl font-bold ${stats.totalPLPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.totalPLPercent >= 0 ? '+' : ''}{stats.totalPLPercent.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 pb-0">
          {(['marketplace', 'positions', 'copy_trading'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${tab === t ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
              {t === 'marketplace' ? `Marketplace (${listings.length})` : t === 'positions' ? `My Positions (${positions.length})` : `Copy-Trading (${topCollectors.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[45vh]">
          {tab === 'marketplace' && (
            <div className="space-y-3">
              <div className="flex gap-2 mb-3">
                {['all', 'Baseball', 'Basketball', 'Football'].map(s => (
                  <button key={s} onClick={() => setSportFilter(s)} className={`px-3 py-1 text-xs rounded-lg transition-colors ${sportFilter === s ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
                    {s === 'all' ? 'All Sports' : s}
                  </button>
                ))}
              </div>

              {listings.map(listing => (
                <div key={listing.id} className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 hover:border-amber-500/20 transition-all cursor-pointer" onClick={() => setSelectedListing(selectedListing?.id === listing.id ? null : listing)}>
                  <div className="flex items-start gap-4">
                    <img src={listing.image} alt={listing.playerName} className="w-16 h-20 rounded-lg object-cover bg-slate-700" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-200">{listing.playerName}</p>
                          <p className="text-xs text-slate-500">{listing.cardDescription} · {listing.grade}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-200">${listing.pricePerShare.toFixed(2)}<span className="text-[10px] text-slate-500">/share</span></p>
                          <p className={`text-xs ${listing.dailyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {listing.dailyChange >= 0 ? '+' : ''}{listing.dailyChange.toFixed(1)}% today
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                        <span>Total: ${listing.totalValue.toLocaleString()}</span>
                        <span>{listing.holders} holders</span>
                        <span>{listing.availableShares.toLocaleString()} shares avail</span>
                        <span>Vol: {listing.volumeToday}</span>
                        <span className="flex items-center gap-0.5"><Shield size={8} /> {listing.insuranceStatus}</span>
                      </div>
                    </div>
                  </div>

                  {selectedListing?.id === listing.id && (
                    <div className="mt-4 border-t border-slate-700/30 pt-4">
                      <div className="h-32 w-full mb-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={listing.priceHistory.slice(-30)}>
                            <defs>
                              <linearGradient id={`grad-${listing.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={['dataMin - 1', 'dataMax + 1']} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                            <Area type="monotone" dataKey="price" stroke="#f59e0b" fill={`url(#grad-${listing.id})`} strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors">
                          Buy Shares
                        </button>
                        <button className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold transition-colors">
                          Add to Watchlist
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'positions' && (
            <div className="space-y-3">
              {positions.length === 0 ? (
                <div className="text-center py-8">
                  <Landmark size={48} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No fractional positions yet</p>
                  <p className="text-xs text-slate-600 mt-1">Browse the marketplace to buy shares of grail cards</p>
                </div>
              ) : (
                positions.map(pos => (
                  <div key={pos.id} className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{pos.playerName}</p>
                        <p className="text-xs text-slate-500">{pos.cardDescription}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-200">${pos.totalValue.toLocaleString()}</p>
                        <p className={`text-xs ${pos.unrealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pos.unrealizedPL >= 0 ? '+' : ''}${pos.unrealizedPL.toFixed(0)} ({pos.unrealizedPLPercent.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                      <span>{pos.sharesOwned} shares</span>
                      <span>Avg cost: ${pos.averageCost.toFixed(2)}</span>
                      <span>Current: ${pos.currentPrice.toFixed(2)}</span>
                      <span>Since {new Date(pos.purchaseDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'copy_trading' && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Top Collectors to Follow</h4>
              {topCollectors.map(collector => (
                <div key={collector.id} className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                        {collector.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{collector.displayName}</p>
                        <p className="text-[10px] text-slate-500">@{collector.username} · {collector.followersCount.toLocaleString()} followers</p>
                      </div>
                    </div>
                    <button className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${collector.isFollowed ? 'bg-brand-lime/20 text-brand-lime' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                      {collector.isFollowed ? '✓ Following' : 'Follow & Copy'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 mb-3">{collector.strategy}</p>

                  <div className="grid grid-cols-5 gap-2 mb-3">
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-slate-500">Alpha</p>
                      <p className="text-sm font-bold text-amber-400">{collector.alphaScore}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-slate-500">Return</p>
                      <p className="text-sm font-bold text-emerald-400">+{collector.totalReturn}%</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-slate-500">Win Rate</p>
                      <p className="text-sm font-bold text-blue-400">{collector.winRate}%</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-slate-500">Sharpe</p>
                      <p className="text-sm font-bold text-purple-400">{collector.sharpeRatio}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-slate-500">Risk</p>
                      <p className={`text-sm font-bold ${collector.riskLevel === 'conservative' ? 'text-emerald-400' : collector.riskLevel === 'moderate' ? 'text-amber-400' : 'text-red-400'}`}>
                        {collector.riskLevel.charAt(0).toUpperCase() + collector.riskLevel.slice(1)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Recent Moves</p>
                    {collector.recentMoves.slice(0, 2).map(move => (
                      <div key={move.id} className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${move.type === 'buy' || move.type === 'fractional_buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {move.type.toUpperCase().replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-300 truncate flex-1">{move.playerName}</span>
                        {move.priceAction && <span className="text-xs text-slate-400">${move.priceAction.toLocaleString()}</span>}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {collector.badges.map(badge => (
                      <span key={badge} className="px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-400 rounded-full">{badge}</span>
                    ))}
                  </div>
                </div>
              ))}

              {signals.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Copy-Trade Signals</h4>
                  {signals.map(signal => (
                    <div key={signal.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 mb-2 border border-blue-500/20">
                      <div className="flex items-center gap-2">
                        <Copy size={12} className="text-blue-400" />
                        <div>
                          <p className="text-xs text-slate-300">{signal.collectorName} — {signal.suggestedAction}</p>
                          <p className="text-[10px] text-slate-500">{new Date(signal.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-emerald-600 text-white text-[10px] rounded-lg hover:bg-emerald-500">Execute</button>
                        <button className="px-3 py-1 bg-slate-700 text-slate-300 text-[10px] rounded-lg hover:bg-slate-600">Skip</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FractionalVaultModal;
