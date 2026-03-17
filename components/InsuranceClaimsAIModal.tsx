import React, { useState, useMemo } from 'react';
import { X, Shield, FileText, Brain, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { getClaims } from '../lib/insuranceClaimsAIService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const InsuranceClaimsAIModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('claims');

  const claims = useMemo(() => getClaims(), []);

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };
      case 'denied': return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' };
      case 'pending': return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
      case 'review': return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return 'text-red-400';
    if (risk >= 50) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const tabs = [
    { id: 'claims', label: 'Claims', icon: <FileText size={16} />, count: claims.length },
    { id: 'assessment', label: 'AI Assessment', icon: <Brain size={16} />, count: claims.filter((c: any) => c.aiScore).length },
  ];

  const approvedCount = claims.filter((c: any) => c.status === 'approved').length;
  const totalValue = claims.reduce((sum: number, c: any) => sum + (c.claimAmount || 0), 0);
  const avgProcessing = Math.round(claims.reduce((sum: number, c: any) => sum + (c.processingDays || 0), 0) / claims.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <Shield size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Insurance Claims AI</h2>
              <p className="text-xs text-slate-500">AI-powered collectible insurance claims processing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 px-6 pt-4">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Approved Claims</p>
            <p className="text-lg font-bold text-emerald-400">{approvedCount}/{claims.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Total Value</p>
            <p className="text-lg font-bold text-blue-400">${(totalValue / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Avg Processing</p>
            <p className="text-lg font-bold text-white">{avgProcessing} days</p>
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
                  ? 'text-blue-400 bg-slate-800/50 border-b-2 border-blue-400'
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
          {activeTab === 'claims' && (
            <div className="grid gap-4">
              {claims.map((claim: any, idx: number) => {
                const status = getStatusColor(claim.status || 'pending');
                return (
                  <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          {claim.status === 'approved' ? <CheckCircle size={18} className="text-emerald-400" /> : <Clock size={18} className="text-amber-400" />}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{claim.itemName || `Claim #${idx + 1}`}</h3>
                          <p className="text-xs text-slate-500">{claim.claimType || 'Damage'} • Filed {claim.filedDate || '2024-01-15'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border ${status.bg} ${status.border} ${status.text}`}>
                        {claim.status || 'pending'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Claim Amount</p>
                        <p className="text-sm font-bold text-blue-400">${(claim.claimAmount || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Coverage</p>
                        <p className="text-sm font-bold text-white">{claim.coveragePercent || 90}%</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Fraud Risk</p>
                        <p className={`text-sm font-bold ${getRiskColor(claim.fraudRisk || 0)}`}>{claim.fraudRisk || 0}%</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Processing</p>
                        <p className="text-sm font-bold text-white">{claim.processingDays || 0}d</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'assessment' && (
            <div className="grid gap-4">
              {claims.map((claim: any, idx: number) => (
                <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">{claim.itemName || `Claim #${idx + 1}`}</h3>
                    <div className="flex items-center gap-2">
                      <Brain size={14} className="text-blue-400" />
                      <span className="text-sm text-blue-400">AI Score: {claim.aiScore || 85}/100</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">AI Confidence</span>
                      <span className="text-blue-400">{claim.aiScore || 85}%</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div className="bg-blue-500 rounded-full h-2 transition-all" style={{ width: `${claim.aiScore || 85}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Photo Match</p>
                      <p className="text-sm font-bold text-emerald-400">{claim.photoMatch || 94}%</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Doc Verified</p>
                      <p className="text-sm font-bold text-blue-400">{claim.docVerified ? 'Yes' : 'Pending'}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Recommendation</p>
                      <p className="text-sm font-bold text-amber-400">{claim.recommendation || 'Approve'}</p>
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

export default InsuranceClaimsAIModal;
