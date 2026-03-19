import React, { useState, useMemo } from 'react';
import {
  X,
  Crosshair,
  AlertTriangle,
  BarChart3,
  ShieldAlert,
  Eye,
  Activity,
  TrendingUp,
  Clock,
  Target,
  Fingerprint,
  AlertCircle,
  Info,
  ArrowUpRight,
} from 'lucide-react';
import {
  getSniperAlerts,
  getSniperStats,
} from '../lib/analytics/mysterySniperDetectorService';

interface MysterySniperDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'alerts' | 'patterns' | 'stats';

const tabs = [
  { id: 'alerts' as TabId, label: 'Alerts', icon: <AlertTriangle size={16} /> },
  { id: 'patterns' as TabId, label: 'Patterns', icon: <Fingerprint size={16} /> },
  { id: 'stats' as TabId, label: 'Stats', icon: <BarChart3 size={16} /> },
];

function getThreatColor(level: string): string {
  switch (level?.toLowerCase()) {
    case 'critical':
    case 'red':
    case 'high': return 'text-red-400';
    case 'warning':
    case 'amber':
    case 'medium': return 'text-amber-400';
    case 'low':
    case 'green': return 'text-green-400';
    default: return 'text-slate-400';
  }
}

function getThreatBg(level: string): string {
  switch (level?.toLowerCase()) {
    case 'critical':
    case 'red':
    case 'high': return 'bg-red-500/10';
    case 'warning':
    case 'amber':
    case 'medium': return 'bg-amber-500/10';
    case 'low':
    case 'green': return 'bg-green-500/10';
    default: return 'bg-slate-500/10';
  }
}

function getThreatBorder(level: string): string {
  switch (level?.toLowerCase()) {
    case 'critical':
    case 'red':
    case 'high': return 'border-red-500/30';
    case 'warning':
    case 'amber':
    case 'medium': return 'border-amber-500/30';
    case 'low':
    case 'green': return 'border-green-500/30';
    default: return 'border-slate-500/30';
  }
}

const MysterySniperDetectorModal: React.FC<MysterySniperDetectorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('alerts');

  const alerts = useMemo(() => getSniperAlerts(), []);
  const stats = useMemo(() => getSniperStats(), []);

  if (!isOpen) return null;

  const highThreatCount = alerts.filter((a: any) =>
    ['critical', 'red', 'high'].includes((a.threatLevel ?? a.severity ?? '').toLowerCase())
  ).length;

  const renderAlerts = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-lime-400" />
            <span className="text-xs text-slate-400">Total Alerts</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{alerts.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={14} className="text-red-400" />
            <span className="text-xs text-slate-400">High Threat</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{highThreatCount}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Crosshair size={14} className="text-amber-400" />
            <span className="text-xs text-slate-400">Active Snipers</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.activeSnipers ?? stats.totalSnipers ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-lime-400" />
            <span className="text-xs text-slate-400">Cards Targeted</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.cardsTargeted ?? stats.totalCardsTargeted ?? 0}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Sniper Alerts
        </h3>
        {alerts.map((alert: any) => {
          const threat = alert.threatLevel ?? alert.severity ?? 'medium';
          return (
            <div
              key={alert.id}
              className={`${getThreatBg(threat)} rounded-xl p-5 border ${getThreatBorder(threat)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getThreatBg(threat)}`}>
                    {threat.toLowerCase() === 'red' || threat.toLowerCase() === 'high' || threat.toLowerCase() === 'critical'
                      ? <ShieldAlert size={16} className="text-red-400" />
                      : threat.toLowerCase() === 'amber' || threat.toLowerCase() === 'medium' || threat.toLowerCase() === 'warning'
                      ? <AlertCircle size={16} className="text-amber-400" />
                      : <Info size={16} className="text-green-400" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{alert.title ?? alert.cardName ?? alert.description}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{alert.description ?? alert.message ?? ''}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getThreatBg(threat)} ${getThreatColor(threat)}`}>
                  {threat.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Platform</p>
                  <p className="text-sm font-semibold text-slate-200">{alert.platform ?? 'Multiple'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Bid Count</p>
                  <p className="text-sm font-semibold text-slate-200">{alert.bidCount ?? alert.attempts ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Timing</p>
                  <p className="text-sm font-semibold text-slate-200">{alert.timing ?? alert.timestamp ?? 'Recent'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Confidence</p>
                  <p className="text-sm font-semibold text-slate-200">{alert.confidence ?? 0}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPatterns = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Detected Sniper Patterns
      </h3>
      {[
        { name: 'Last-Second Bidding', description: 'Bids placed within final 5 seconds of auction', frequency: 'High', icon: <Clock size={16} className="text-red-400" />, threat: 'high' },
        { name: 'Proxy Account Clusters', description: 'Multiple accounts with similar bidding patterns', frequency: 'Medium', icon: <Fingerprint size={16} className="text-amber-400" />, threat: 'medium' },
        { name: 'Price Suppression', description: 'Coordinated low bidding to suppress final prices', frequency: 'Low', icon: <TrendingUp size={16} className="text-green-400" />, threat: 'low' },
        { name: 'Card-Specific Targeting', description: 'Repeated targeting of specific card types or players', frequency: 'High', icon: <Target size={16} className="text-red-400" />, threat: 'high' },
        { name: 'Cross-Platform Sniping', description: 'Coordinated buying across multiple platforms', frequency: 'Medium', icon: <Activity size={16} className="text-amber-400" />, threat: 'medium' },
      ].map((pattern, idx) => (
        <div key={idx} className={`${getThreatBg(pattern.threat)} rounded-xl p-5 border ${getThreatBorder(pattern.threat)}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getThreatBg(pattern.threat)}`}>
                {pattern.icon}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">{pattern.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{pattern.description}</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getThreatBg(pattern.threat)} ${getThreatColor(pattern.threat)}`}>
              {pattern.frequency}
            </span>
          </div>
        </div>
      ))}

      <div className="bg-lime-500/10 rounded-xl p-5 border border-lime-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Eye size={16} className="text-lime-400" />
          <p className="text-sm font-semibold text-lime-300">Detection Tips</p>
        </div>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Watch for repeated bidders across your auctions with low starting bids
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Monitor last-second bid patterns that consistently outbid by minimal amounts
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Use BIN pricing for high-value cards to avoid sniper exposure
          </li>
        </ul>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400 mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
            <p className="text-2xl font-bold text-slate-100">
              {typeof value === 'number' ? (value % 1 !== 0 ? value.toFixed(1) : value) : String(value)}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Threat Level Distribution</h3>
        <div className="space-y-3">
          {[
            { label: 'High Threat', count: highThreatCount, color: 'bg-red-500', textColor: 'text-red-400' },
            { label: 'Medium Threat', count: alerts.filter((a: any) => ['amber', 'medium', 'warning'].includes((a.threatLevel ?? a.severity ?? '').toLowerCase())).length, color: 'bg-amber-500', textColor: 'text-amber-400' },
            { label: 'Low Threat', count: alerts.filter((a: any) => ['green', 'low'].includes((a.threatLevel ?? a.severity ?? '').toLowerCase())).length, color: 'bg-green-500', textColor: 'text-green-400' },
          ].map((tier, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className={`text-xs font-medium ${tier.textColor} w-24`}>{tier.label}</span>
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${tier.color}`}
                  style={{ width: `${alerts.length > 0 ? (tier.count / alerts.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 w-8 text-right">{tier.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20">
              <Crosshair size={24} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Mystery Sniper Detector</h2>
              <p className="text-sm text-slate-400">Detect and track auction sniping activity on your cards</p>
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
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {activeTab === 'alerts' && renderAlerts()}
          {activeTab === 'patterns' && renderPatterns()}
          {activeTab === 'stats' && renderStats()}
        </div>
      </div>
    </div>
  );
};

export default MysterySniperDetectorModal;
