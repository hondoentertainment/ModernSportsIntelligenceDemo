// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { X, Box, Scan, AlertCircle, CheckCircle, Activity, Layers } from 'lucide-react';
import { getScans } from '../lib/utils/waxCTScannerService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const WaxCTScannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('scans');

  const scans = useMemo(() => getScans(), []);

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sealed': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };
      case 'tampered': return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' };
      case 'resealed': return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const tabs = [
    { id: 'scans', label: 'Scans', icon: <Scan size={16} />, count: scans.length },
    { id: 'hotpack', label: 'Hot Pack Detection', icon: <Activity size={16} />, count: scans.filter((s: any) => s.hotPackProbability >= 70).length },
  ];

  const sealedCount = scans.filter((s: any) => s.status === 'sealed').length;
  const tamperedCount = scans.filter((s: any) => s.status === 'tampered' || s.status === 'resealed').length;
  const avgConfidence = Math.round(scans.reduce((sum: number, s: any) => sum + (s.confidence || 0), 0) / scans.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl">
              <Box size={24} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Wax CT Scanner</h2>
              <p className="text-xs text-slate-500">Non-invasive sealed product analysis via CT imaging</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 px-6 pt-4">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Sealed Verified</p>
            <p className="text-lg font-bold text-emerald-400">{sealedCount}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Tamper Detected</p>
            <p className="text-lg font-bold text-red-400">{tamperedCount}</p>
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
                  ? 'text-amber-400 bg-slate-800/50 border-b-2 border-amber-400'
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
          {activeTab === 'scans' && (
            <div className="grid gap-4">
              {scans.map((scan: any, idx: number) => {
                const status = getStatusColor(scan.status || 'sealed');
                return (
                  <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                          {scan.status === 'sealed' ? <CheckCircle size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-red-400" />}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{scan.productName || `Product ${idx + 1}`}</h3>
                          <p className="text-xs text-slate-500">{scan.scanDate || '2024-01-15'} • {scan.scanType || 'Full CT'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border ${status.bg} ${status.border} ${status.text}`}>
                        {scan.status || 'sealed'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Confidence</p>
                        <p className={`text-sm font-bold ${getConfidenceColor(scan.confidence || 0)}`}>{scan.confidence || 0}%</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Density</p>
                        <p className="text-sm font-bold text-white">{scan.density || '1.2'}g/cm³</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Hot Pack</p>
                        <p className="text-sm font-bold text-amber-400">{scan.hotPackProbability || 0}%</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Card Count</p>
                        <p className="text-sm font-bold text-white">{scan.cardCount || 0}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'hotpack' && (
            <div className="grid gap-4">
              {scans.filter((s: any) => s.hotPackProbability >= 0).map((scan: any, idx: number) => (
                <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">{scan.productName || `Product ${idx + 1}`}</h3>
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-slate-500" />
                      <span className="text-sm text-slate-400">{scan.cardCount || 0} cards detected</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Hot Pack Probability</span>
                      <span className={getConfidenceColor(scan.hotPackProbability || 0)}>{scan.hotPackProbability || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div
                        className="bg-amber-500 rounded-full h-2 transition-all"
                        style={{ width: `${scan.hotPackProbability || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Thick Card</p>
                      <p className="text-sm font-bold text-amber-400">{scan.thickCardDetected ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Weight Anomaly</p>
                      <p className="text-sm font-bold text-blue-400">{scan.weightAnomaly || '0.0'}g</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Est. Value</p>
                      <p className="text-sm font-bold text-emerald-400">${scan.estimatedValue || 0}</p>
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

export default WaxCTScannerModal;
