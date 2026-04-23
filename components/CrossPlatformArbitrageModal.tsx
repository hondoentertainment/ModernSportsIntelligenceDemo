// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  X,
  ArrowRightLeft,
  DollarSign,
  BarChart3,
  TrendingUp,
  Activity,
  Target,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Globe,
} from 'lucide-react';
import {
  getArbitrageOpportunities,
  getArbitrageStats,
  getPlatformPricing,
  getFeeComparison,
  getArbitrageAlerts,
  formatCurrency,
  formatPercent,
  getPlatformLabel,
  getRiskColor,
} from '../lib/trading/crossPlatformArbitrageService';
import type {
  ArbitrageOpportunity,
  ArbitrageStats,
  PlatformPricing,
  FeeComparison,
  ArbitrageAlert,
  RiskLevel,
} from '../lib/trading/crossPlatformArbitrageService';

interface CrossPlatformArbitrageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'opportunities' | 'platforms' | 'stats';

const tabs = [
  { id: 'opportunities' as TabId, label: 'Opportunities', icon: <Zap size={16} /> },
  { id: 'platforms' as TabId, label: 'Platforms', icon: <Globe size={16} /> },
  { id: 'stats' as TabId, label: 'Stats', icon: <BarChart3 size={16} /> },
];

const riskStyles: Record<RiskLevel, { bg: string; text: string }> = {
  low: { bg: 'bg-green-500/20', text: 'text-green-400' },
  medium: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  high: { bg: 'bg-red-500/20', text: 'text-red-400' },
};

const CrossPlatformArbitrageModal: React.FC<CrossPlatformArbitrageModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('opportunities');

  const opportunities = useMemo(() => getArbitrageOpportunities(), []);
  const arbStats = useMemo(() => getArbitrageStats(), []);
  const platformPricing = useMemo(() => getPlatformPricing(), []);
  const feeComparison = useMemo(() => getFeeComparison(), []);
  const alerts = useMemo(() => getArbitrageAlerts(), []);

  if (!isOpen) return null;

  const activeOpps = opportunities.filter((o) => o.status === 'active');

  const renderOpportunities = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-lime-400" />
            <span className="text-xs text-slate-400">Active Opps</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{arbStats.activeOpportunities}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-green-400" />
            <span className="text-xs text-slate-400">Total Potential</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(arbStats.totalPotentialProfit)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-lime-400" />
            <span className="text-xs text-slate-400">Avg Margin</span>
          </div>
          <p className="text-2xl font-bold text-lime-400">{formatPercent(arbStats.avgProfitMargin)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-green-400" />
            <span className="text-xs text-slate-400">Win Rate</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{formatPercent(arbStats.winRate)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Active Arbitrage Opportunities
        </h3>
        {activeOpps.map((opp: ArbitrageOpportunity) => {
          const risk = riskStyles[opp.riskLevel];
          return (
            <div key={opp.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{opp.cardName}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{opp.player} | {opp.grade}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${risk.bg} ${risk.text}`}>
                      {opp.riskLevel} risk
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-400">{formatCurrency(opp.netProfit)}</p>
                  <p className="text-xs text-slate-500">{formatPercent(opp.profitMargin)} margin</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4 p-3 bg-slate-900/50 rounded-lg">
                <div className="text-center flex-1">
                  <p className="text-xs text-slate-500 mb-1">Buy On</p>
                  <p className="text-sm font-semibold text-blue-400">{getPlatformLabel(opp.buyPlatform)}</p>
                  <p className="text-xs text-slate-300">{formatCurrency(opp.buyPrice)}</p>
                </div>
                <ArrowRightLeft size={20} className="text-lime-400" />
                <div className="text-center flex-1">
                  <p className="text-xs text-slate-500 mb-1">Sell On</p>
                  <p className="text-sm font-semibold text-green-400">{getPlatformLabel(opp.sellPlatform)}</p>
                  <p className="text-xs text-slate-300">{formatCurrency(opp.sellPrice)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Fees</span>
                  <p className="text-slate-200 font-medium">{formatCurrency(opp.buyFees + opp.sellFees)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Confidence</span>
                  <p className="text-slate-200 font-medium">{opp.confidence}%</p>
                </div>
                <div>
                  <span className="text-slate-500">Time Left</span>
                  <p className="text-slate-200 font-medium flex items-center gap-1"><Clock size={10} /> {opp.timeRemaining}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPlatforms = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Platform Pricing Overview
      </h3>
      <div className="space-y-3">
        {platformPricing.map((p: PlatformPricing) => (
          <div key={p.platform} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-200">{getPlatformLabel(p.platform)}</h4>
              <span className="text-xs text-slate-400">{p.activeListings} listings</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500">Lowest</p>
                <p className="text-sm font-semibold text-green-400">{formatCurrency(p.lowestPrice)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Average</p>
                <p className="text-sm font-semibold text-slate-200">{formatCurrency(p.avgPrice)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Highest</p>
                <p className="text-sm font-semibold text-red-400">{formatCurrency(p.highestPrice)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Seller Fee</p>
                <p className="text-sm font-semibold text-slate-200">{p.sellerFeePercent}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Fee Comparison
      </h3>
      <div className="space-y-2">
        {feeComparison.map((fee: FeeComparison) => (
          <div key={fee.platform} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-200">{getPlatformLabel(fee.platform)}</span>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-400">Seller: {fee.sellerFee}%</span>
              <span className="text-slate-400">Buyer: {fee.buyerPremium}%</span>
              <span className="text-amber-400 font-medium">Total: {fee.totalCost}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <p className="text-xs text-slate-400 mb-2">Total Opportunities</p>
          <p className="text-2xl font-bold text-slate-100">{arbStats.totalOpportunities}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <p className="text-xs text-slate-400 mb-2">Executed Trades</p>
          <p className="text-2xl font-bold text-green-400">{arbStats.executedTrades}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <p className="text-xs text-slate-400 mb-2">Executed Profit</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(arbStats.executedProfit)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <p className="text-xs text-slate-400 mb-2">Best Spread</p>
          <p className="text-2xl font-bold text-lime-400">{formatPercent(arbStats.bestSpread)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <p className="text-xs text-slate-400 mb-2">Avg Hold Time</p>
          <p className="text-2xl font-bold text-slate-100">{arbStats.avgHoldTime}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <p className="text-xs text-slate-400 mb-2">Top Pair</p>
          <p className="text-sm font-bold text-lime-400">
            {getPlatformLabel(arbStats.topPlatformPair.buy)} &rarr; {getPlatformLabel(arbStats.topPlatformPair.sell)}
          </p>
          <p className="text-xs text-slate-500">{formatPercent(arbStats.topPlatformPair.avgSpread)} avg spread</p>
        </div>
      </div>

      {alerts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Recent Alerts
          </h3>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert: ArbitrageAlert) => (
              <div key={alert.id} className={`rounded-xl p-4 border ${
                alert.priority === 'high' ? 'bg-red-500/5 border-red-500/20' :
                alert.priority === 'medium' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-800/50 border-slate-700/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {alert.priority === 'high' ? <AlertTriangle size={14} className="text-red-400" /> : <Activity size={14} className="text-amber-400" />}
                    <span className="text-sm text-slate-200">{alert.message}</span>
                  </div>
                  <span className="text-xs text-green-400 font-medium">{formatCurrency(alert.profit)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-lime-500/10 rounded-xl p-5 border border-lime-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-lime-400" />
          <p className="text-sm font-semibold text-lime-300">Arbitrage Tips</p>
        </div>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Always factor in platform fees, shipping, and payment processing before executing
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Low-risk opportunities with 10%+ margins after fees are the safest plays
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Speed matters - most opportunities close within hours of discovery
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <ArrowRightLeft size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Cross-Platform Arbitrage</h2>
              <p className="text-sm text-slate-400">Find price spreads across marketplaces for risk-adjusted profit</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex gap-1 p-4 border-b border-slate-700/50">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-lime-500/20 text-lime-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {activeTab === 'opportunities' && renderOpportunities()}
          {activeTab === 'platforms' && renderPlatforms()}
          {activeTab === 'stats' && renderStats()}
        </div>
      </div>
    </div>
  );
};

export default CrossPlatformArbitrageModal;
