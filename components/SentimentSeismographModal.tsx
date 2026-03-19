import React, { useState, useMemo } from 'react';
import { X, Activity, TrendingUp, TrendingDown, AlertTriangle, Bell, Hash, Minus } from 'lucide-react';
import { getReadings, getAlerts } from '../lib/analytics/sentimentSeismographService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SentimentSeismographModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('live-feed');
  const readings = useMemo(() => getReadings(), []);
  const alerts = useMemo(() => getAlerts(), []);

  if (!isOpen) return null;

  const tabs = [
    { id: 'live-feed', label: 'Live Feed', count: readings.length },
    { id: 'alerts', label: 'Alerts', count: alerts.filter(a => !a.acknowledged).length },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'surging' || trend === 'rising') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (trend === 'falling' || trend === 'crashing') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'surging') return 'text-emerald-400 bg-emerald-400/10';
    if (trend === 'rising') return 'text-green-400 bg-green-400/10';
    if (trend === 'stable') return 'text-slate-400 bg-slate-400/10';
    if (trend === 'falling') return 'text-orange-400 bg-orange-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'critical') return 'text-red-400 bg-red-400/10 border-red-500/30';
    if (severity === 'high') return 'text-orange-400 bg-orange-400/10 border-orange-500/30';
    if (severity === 'medium') return 'text-amber-400 bg-amber-400/10 border-amber-500/30';
    return 'text-blue-400 bg-blue-400/10 border-blue-500/30';
  };

  const getSentimentColor = (val: number) => {
    if (val >= 75) return 'text-emerald-400';
    if (val >= 50) return 'text-amber-400';
    if (val >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-xl">
              <Activity className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sentiment Seismograph</h2>
              <p className="text-sm text-slate-400">Real-time market sentiment monitoring and alerts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-red-400 border-b-2 border-red-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-700">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'live-feed' && (
            <div className="space-y-4">
              {readings.map((r) => (
                <div key={r.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{r.topic}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                        <span>{r.source}</span>
                        <span className="text-slate-600">|</span>
                        <span>{new Date(r.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize ${getTrendColor(r.trend)}`}>
                        {getTrendIcon(r.trend)}
                        {r.trend}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Sentiment</div>
                      <div className={`text-xl font-bold ${getSentimentColor(r.sentiment)}`}>{r.sentiment}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Volume</div>
                      <div className="text-white font-bold">{r.volume.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5">
                      <div className="text-xs text-slate-500 mb-1">Keywords</div>
                      <div className="flex flex-wrap gap-1">
                        {r.keywords.map((k) => (
                          <span key={k} className="px-1.5 py-0.5 text-xs bg-red-500/10 text-red-300 rounded">#{k}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    Impacted: {r.impactedCards.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.id} className={`bg-slate-800/50 border rounded-xl p-4 ${getSeverityColor(a.severity).split(' ')[2]}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-4 h-4 ${getSeverityColor(a.severity).split(' ')[0]}`} />
                      <h3 className="text-white font-semibold">{a.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getSeverityColor(a.severity)}`}>
                        {a.severity}
                      </span>
                      {a.acknowledged && <span className="text-xs text-slate-500">Acknowledged</span>}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{a.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`font-medium ${a.sentimentShift > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      Shift: {a.sentimentShift > 0 ? '+' : ''}{a.sentimentShift}
                    </span>
                    <span className="text-slate-400">Impact: {a.priceImpact}</span>
                    <span className="text-slate-500">{a.source}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentimentSeismographModal;
