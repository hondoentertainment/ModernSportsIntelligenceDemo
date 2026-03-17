import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart, TrendingUp, DollarSign, Users, Package,
  Clock, CheckCircle, Truck, ArrowRight, BarChart3,
  Percent, Award, Calendar, ChevronRight, Box,
} from 'lucide-react';
import {
  getGroupBuys,
  getBuyHistory,
  getGroupBuyStats,
  getBuyStatusColor,
  getBuyStatusBgColor,
  getProductTypeLabel,
  formatCurrency,
  type GroupBuy,
  type BuyHistory,
  type GroupBuyStats,
  type BuyStatus,
} from '../lib/groupBuyService';

const TABS = ['Active Buys', 'History'] as const;
type Tab = (typeof TABS)[number];

function statusLabel(status: BuyStatus): string {
  switch (status) {
    case 'forming': return 'Forming Group';
    case 'funding': return 'Collecting Funds';
    case 'funded': return 'Fully Funded';
    case 'ordered': return 'Order Placed';
    case 'received': return 'Product Received';
    case 'distributed': return 'Distributing';
    case 'completed': return 'Completed';
    default: return status;
  }
}

function statusIcon(status: BuyStatus) {
  switch (status) {
    case 'forming': return <Users className="w-3.5 h-3.5" />;
    case 'funding': return <DollarSign className="w-3.5 h-3.5" />;
    case 'funded': return <CheckCircle className="w-3.5 h-3.5" />;
    case 'ordered': return <Truck className="w-3.5 h-3.5" />;
    case 'received': return <Package className="w-3.5 h-3.5" />;
    case 'distributed': return <Box className="w-3.5 h-3.5" />;
    case 'completed': return <CheckCircle className="w-3.5 h-3.5" />;
    default: return <Clock className="w-3.5 h-3.5" />;
  }
}

const GroupBuyCoop: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Active Buys');
  const [buys, setBuys] = useState<GroupBuy[]>([]);
  const [history, setHistory] = useState<BuyHistory[]>([]);
  const [stats, setStats] = useState<GroupBuyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setBuys(getGroupBuys());
      setHistory(getBuyHistory());
      setStats(getGroupBuyStats());
    } finally {
      setLoading(false);
    }
  }, []);

  const activeBuys = useMemo(() => buys.filter(b => b.status !== 'completed'), [buys]);
  const completedBuys = useMemo(() => buys.filter(b => b.status === 'completed'), [buys]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-bold">Group Buy &amp; Wholesale Co-op</h1>
              <p className="text-slate-400 text-sm">
                Pool capital for case &amp; lot purchases at wholesale pricing with proportional ownership
              </p>
            </div>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm">
            <ShoppingCart className="w-4 h-4" /> Start a Group Buy
          </button>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <ShoppingCart className="w-3 h-3" /> Buys Joined
            </div>
            <div className="text-xl font-bold">{stats.totalBuysJoined}</div>
            <div className="text-xs text-slate-500 mt-1">{stats.activeBuys} active now</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <DollarSign className="w-3 h-3" /> Total Saved
            </div>
            <div className="text-xl font-bold text-emerald-400">{formatCurrency(stats.totalSaved)}</div>
            <div className="text-xs text-slate-500 mt-1">vs. retail pricing</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Percent className="w-3 h-3" /> Avg Savings
            </div>
            <div className="text-xl font-bold text-emerald-400">{stats.avgSavingsPercent}%</div>
            <div className="text-xs text-slate-500 mt-1">Best deal: {formatCurrency(stats.bestDealSavings)}</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Package className="w-3 h-3" /> Products Received
            </div>
            <div className="text-xl font-bold">{stats.productsReceived}</div>
            <div className="text-xs text-slate-500 mt-1">{formatCurrency(stats.totalSpent)} invested</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6 border-b border-slate-800">
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
              {tab === 'Active Buys' && activeBuys.length > 0 && (
                <span className="ml-2 bg-emerald-500/20 text-emerald-400 text-xs px-1.5 py-0.5 rounded-full">
                  {activeBuys.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Active Buys Tab */}
        {activeTab === 'Active Buys' && (
          <div className="space-y-6">
            {[...activeBuys, ...completedBuys].map(buy => (
              <BuyCard key={buy.id} buy={buy} />
            ))}
            {activeBuys.length === 0 && completedBuys.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">No group buys yet</p>
                <p className="text-sm mt-1">Start or join a group buy to save on wholesale purchases.</p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'History' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Purchase History</h2>
              <div className="text-sm text-slate-400">
                {history.length} completed buy{history.length !== 1 ? 's' : ''}
              </div>
            </div>
            {history.map(entry => (
              <HistoryRow key={entry.buyId} entry={entry} />
            ))}
            {history.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">Total Savings from Group Buys</div>
                  <div className="text-xl font-bold text-emerald-400">
                    {formatCurrency(history.reduce((sum, h) => sum + h.savings, 0))}
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (history.reduce((sum, h) => sum + h.savings, 0) /
                          history.reduce((sum, h) => sum + h.retailEquivalent, 0)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>
                    {formatCurrency(history.reduce((sum, h) => sum + h.yourCost, 0))} paid
                  </span>
                  <span>
                    {formatCurrency(history.reduce((sum, h) => sum + h.retailEquivalent, 0))} retail value
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ---- Sub-components ----

const BuyCard: React.FC<{ buy: GroupBuy }> = ({ buy }) => {
  const fundingPercent = Math.round((buy.claimedShares / buy.totalShares) * 100);
  const totalPaid = buy.participants.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalPledged = buy.participants.reduce((sum, p) => sum + p.amountPledged, 0);
  const yourParticipation = buy.participants.find(p => p.userId === 'u-001');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${getBuyStatusBgColor(buy.status)} ${getBuyStatusColor(buy.status)}`}>
              {statusIcon(buy.status)}
              {statusLabel(buy.status)}
            </span>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
              {getProductTypeLabel(buy.productType)}
            </span>
          </div>
          <h3 className="text-lg font-bold truncate">{buy.name}</h3>
          <p className="text-sm text-slate-400 mt-0.5">
            Organized by <span className="text-slate-300">{buy.organizerHandle}</span>
            {' '}&middot;{' '}
            Supplier: <span className="text-slate-300">{buy.supplier}</span>
          </p>
        </div>
      </div>

      {/* Pricing Comparison */}
      <div className="px-5 py-4 border-b border-slate-800">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">Retail Price</div>
            <div className="text-lg font-semibold text-slate-400 line-through">{formatCurrency(buy.retailPrice)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Wholesale Price</div>
            <div className="text-lg font-semibold text-white">{formatCurrency(buy.wholesalePrice)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">You Save</div>
            <div className="text-lg font-bold text-emerald-400">
              {formatCurrency(buy.totalSavings)}
              <span className="text-sm font-normal ml-1">({buy.savingsPercent}%)</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">{buy.productDescription}</p>
      </div>

      {/* Funding Progress */}
      <div className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Funding Progress</div>
          <div className="text-sm">
            <span className="text-emerald-400 font-semibold">{buy.claimedShares}</span>
            <span className="text-slate-500"> / {buy.totalShares} shares claimed</span>
          </div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              fundingPercent === 100
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                : 'bg-gradient-to-r from-emerald-700 to-emerald-500'
            }`}
            style={{ width: `${fundingPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1.5">
          <span>{formatCurrency(totalPaid)} paid of {formatCurrency(buy.wholesalePrice + buy.shippingCost)}</span>
          <span>{fundingPercent}% filled</span>
        </div>
        {buy.status === 'forming' && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-2">
            <Clock className="w-3 h-3" />
            <span>Deadline: {new Date(buy.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        )}
      </div>

      {/* Participants */}
      <div className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium">Participants ({buy.participants.length})</div>
          <div className="text-xs text-slate-500">Split: {buy.splitMethod}</div>
        </div>
        <div className="space-y-2">
          {buy.participants.map(p => (
            <div key={p.userId} className={`flex items-center justify-between py-2 px-3 rounded-lg ${p.userId === 'u-001' ? 'bg-emerald-400/5 border border-emerald-500/20' : 'bg-slate-800/50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                  {p.handle.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    {p.handle}
                    {p.userId === buy.participants[0].userId && (
                      <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">Organizer</span>
                    )}
                    {p.userId === 'u-001' && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">You</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{p.productAllocation}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{p.shares} share{p.shares !== 1 ? 's' : ''}</div>
                <div className={`text-xs ${p.status === 'paid' || p.status === 'received' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {p.status === 'paid' ? 'Paid' : p.status === 'received' ? 'Received' : 'Pledged'}
                  {' '}&middot;{' '}{formatCurrency(p.amountPledged)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Participation / Actions */}
      <div className="px-5 py-4 flex items-center justify-between">
        {yourParticipation ? (
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-sm font-medium">You own {yourParticipation.shares} share{yourParticipation.shares !== 1 ? 's' : ''}</div>
              <div className="text-xs text-slate-500">{yourParticipation.productAllocation}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400">
            {buy.totalShares - buy.claimedShares} shares available at{' '}
            {formatCurrency(buy.wholesalePrice / buy.totalShares)}/share
          </div>
        )}
        {buy.status === 'forming' && !yourParticipation && (
          <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            Join Buy <ArrowRight className="w-4 h-4" />
          </button>
        )}
        {buy.status === 'ordered' && (
          <div className="flex items-center gap-1.5 text-sm text-indigo-400">
            <Truck className="w-4 h-4" />
            <span>
              Est. delivery:{' '}
              {new Date(buy.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
        {buy.status === 'completed' && (
          <div className="flex items-center gap-1.5 text-sm text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>All products distributed</span>
          </div>
        )}
      </div>
    </div>
  );
};

const HistoryRow: React.FC<{ entry: BuyHistory }> = ({ entry }) => {
  const savingsPercent = Math.round((entry.savings / entry.retailEquivalent) * 100);
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
          {entry.productReceived ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <Clock className="w-5 h-5 text-amber-400" />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{entry.product}</div>
          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
            <Calendar className="w-3 h-3" />
            {new Date(entry.completedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            <span>&middot;</span>
            {entry.yourShares}/{entry.totalShares} shares
          </div>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-semibold">{formatCurrency(entry.yourCost)}</div>
        <div className="text-xs text-emerald-400 flex items-center gap-1 justify-end">
          <TrendingUp className="w-3 h-3" />
          Saved {formatCurrency(entry.savings)} ({savingsPercent}%)
        </div>
      </div>
    </div>
  );
};

export default GroupBuyCoop;
