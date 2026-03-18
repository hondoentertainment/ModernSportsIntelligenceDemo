import React, { useState, useMemo } from 'react';
import { X, AlertTriangle, Shield, Eye, TrendingDown, Clock, FileWarning } from 'lucide-react';
import { getAlerts } from '../lib/analytics/manipulationDetectorService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ManipulationDetectorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('alerts');

  const alerts = useMemo(() => getAlerts(), []);

  if (!isOpen) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' };
      case 'high': return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' };
      case 'medium': return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
      case 'low': return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return 'text-red-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-blue-400';
  };

  const tabs = [
    { id: 'alerts', label: 'Alerts', icon: <AlertTriangle size={16} />, count: alerts.length },
    { id: 'patterns', label: 'Patterns', icon: <Eye size={16} />, count: alerts.filter((a: any) => a.patternType).length },
  ];

  const criticalCount = alerts.filter((a: any) => a.severity === 'critical').length;
  const highCount = alerts.filter((a: any) => a.severity === 'high').length;
  const avgConfidence = Math.round(alerts.reduce((sum: number, a: any) => sum + (a.confidence || 0), 0) / alerts.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 rounded-xl">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Manipulation Detector</h2>
              <p className="text-xs text-slate-500">Market manipulation and wash trading detection engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 px-6 pt-4">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-red-500/20">
            <p className="text-xs text-slate-500">Critical Alerts</p>
            <p className="text-lg font-bold text-red-400">{criticalCount}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-orange-500/20">
            <p className="text-xs text-slate-500">High Priority</p>
            <p className="text-lg font-bold text-orange-400">{highCount}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Avg Confidence</p>
            <p className="text-lg font-bold text-white">{avgConfidence}%</p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-red-400 bg-slate-800/50 border-b-2 border-red-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-slate-700/50">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'alerts' && (
            <div className="grid gap-4">
              {alerts.map((alert: any, idx: number) => {
                const severity = getSeverityColor(alert.severity || 'medium');
                return (
                  <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                          <FileWarning size={18} className="text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{alert.title || `Alert ${idx + 1}`}</h3>
                          <p className="text-xs text-slate-500">{alert.detectedAt || '2024-01-15'} • {alert.market || 'eBay'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border ${severity.bg} ${severity.border} ${severity.text}`}>
                        {alert.severity || 'medium'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{alert.description || 'Suspicious trading activity detected in this market segment.'}</p>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Confidence</p>
                        <p className={`text-sm font-bold ${getConfidenceColor(alert.confidence || 0)}`}>{alert.confidence || 0}%</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Accounts</p>
                        <p className="text-sm font-bold text-white">{alert.accountsInvolved || 0}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Volume</p>
                        <p className="text-sm font-bold text-amber-400">${((alert.suspiciousVolume || 0) / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Duration</p>
                        <p className="text-sm font-bold text-white">{alert.duration || '3d'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'patterns' && (
            <div className="grid gap-4">
              {alerts.filter((a: any) => true).map((alert: any, idx: number) => (
                <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">{alert.patternType || 'Wash Trading'}</h3>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-500" />
                      <span className="text-sm text-slate-400">Detected {alert.detectedAt || '2h ago'}</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Pattern Confidence</span>
                      <span className={getConfidenceColor(alert.confidence || 0)}>{alert.confidence || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div className="bg-red-500 rounded-full h-2 transition-all" style={{ width: `${alert.confidence || 0}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Occurrences</p>
                      <p className="text-sm font-bold text-red-400">{alert.occurrences || 12}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Linked Accounts</p>
                      <p className="text-sm font-bold text-amber-400">{alert.accountsInvolved || 3}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Est. Impact</p>
                      <p className="text-sm font-bold text-white">${((alert.suspiciousVolume || 5000) / 1000).toFixed(1)}K</p>
                    </div>
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

export default ManipulationDetectorModal;
