import React, { useState, useMemo } from 'react';
import { X, Shield, AlertTriangle, MapPin, FileCheck, Scale, ChevronRight, TrendingUp, Globe } from 'lucide-react';
import { getAlerts, getTaxNexus, getComplianceScore, getAMLFlags } from '../lib/utils/regulatoryComplianceRadarService';

interface Props { isOpen: boolean; onClose: () => void; }

const RegulatoryComplianceRadarModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('alerts');
  const alerts = useMemo(() => getAlerts(), []);
  const nexus = useMemo(() => getTaxNexus(), []);
  const score = useMemo(() => getComplianceScore(), []);
  const amlFlags = useMemo(() => getAMLFlags(), []);

  if (!isOpen) return null;

  const sevColor = (s: string) => s === 'critical' ? 'text-red-400' : s === 'high' ? 'text-orange-400' : s === 'medium' ? 'text-amber-400' : 'text-slate-400';
  const sevBg = (s: string) => s === 'critical' ? 'bg-red-500/10 border-red-500/30' : s === 'high' ? 'bg-orange-500/10 border-orange-500/30' : s === 'medium' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-500/10 border-slate-500/30';
  const riskColor = (r: string) => r === 'critical' ? 'text-red-400' : r === 'warning' ? 'text-orange-400' : r === 'caution' ? 'text-amber-400' : 'text-emerald-400';

  const tabs = [
    { id: 'alerts', label: 'Regulatory Alerts', icon: <AlertTriangle size={14} />, count: alerts.length },
    { id: 'nexus', label: 'Tax Nexus Map', icon: <MapPin size={14} />, count: nexus.length },
    { id: 'compliance', label: 'Compliance Score', icon: <FileCheck size={14} /> },
    { id: 'aml', label: 'AML Monitor', icon: <Scale size={14} />, count: amlFlags.filter(f => !f.resolved).length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20"><Shield size={20} className="text-red-400" /></div>
            <div>
              <h2 className="text-lg font-bold text-white">Regulatory Compliance Radar</h2>
              <p className="text-xs text-slate-400">Legislation, tax nexus, AML monitoring, and compliance scoring</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><X size={18} className="text-slate-400" /></button>
        </div>

        <div className="flex gap-1 px-5 pt-3 border-b border-slate-700/50 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${activeTab === t.id ? 'border-red-400 text-red-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {t.icon} {t.label} {'count' in t && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-800 text-[9px]">{t.count}</span>}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'alerts' && alerts.map(a => (
            <div key={a.id} className={`p-4 rounded-xl border ${sevBg(a.severity)}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${sevBg(a.severity)} ${sevColor(a.severity)}`}>{a.severity}</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">{a.category.replace('-', ' ')}</span>
                </div>
                <span className="text-[9px] text-slate-500">{a.jurisdiction} · {a.status}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{a.title}</h3>
              <p className="text-xs text-slate-400 mb-3">{a.summary}</p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-slate-900/50 rounded-lg p-2 text-center"><p className="text-[9px] text-slate-500">Impact Score</p><p className={`text-sm font-bold ${a.impactScore >= 85 ? 'text-red-400' : a.impactScore >= 70 ? 'text-orange-400' : 'text-amber-400'}`}>{a.impactScore}</p></div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center"><p className="text-[9px] text-slate-500">Portfolio Exposure</p><p className="text-sm font-bold text-white">{a.portfolioExposure}%</p></div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center"><p className="text-[9px] text-slate-500">Effective Date</p><p className="text-sm font-bold text-white">{a.effectiveDate}</p></div>
              </div>
              <div className="flex items-start gap-2 bg-slate-900/50 rounded-lg p-2">
                <ChevronRight size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-300">{a.actionRequired}</p>
              </div>
            </div>
          ))}

          {activeTab === 'nexus' && (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {['safe', 'caution', 'warning', 'critical'].map(level => {
                  const count = nexus.filter(n => n.riskLevel === level).length;
                  return (
                    <div key={level} className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50">
                      <p className={`text-lg font-bold ${riskColor(level)}`}>{count}</p>
                      <p className="text-[9px] font-bold uppercase text-slate-500">{level}</p>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {nexus.map(n => (
                  <div key={n.code} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-white">{n.state} ({n.code})</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${riskColor(n.riskLevel)} ${n.riskLevel === 'safe' ? 'bg-emerald-500/10 border-emerald-500/30' : n.riskLevel === 'caution' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>{n.riskLevel}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div><span className="text-slate-500">Sales Tax:</span> <span className="text-white">{n.hasSalesTax ? `${n.rate}%` : 'None'}</span></div>
                      <div><span className="text-slate-500">Exempt:</span> <span className={n.collectibleExempt ? 'text-emerald-400' : 'text-red-400'}>{n.collectibleExempt ? 'Yes' : 'No'}</span></div>
                      <div><span className="text-slate-500">Threshold:</span> <span className="text-white">{n.threshold ? `$${n.threshold.toLocaleString()}` : 'N/A'}</span></div>
                      <div><span className="text-slate-500">Facilitator:</span> <span className="text-white">{n.marketplaceFacilitator ? 'Yes' : 'No'}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Overall Compliance Score</p>
                <p className={`text-5xl font-black ${score.overall >= 80 ? 'text-emerald-400' : score.overall >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{score.overall}</p>
                <p className="text-xs text-slate-400 mt-1">{score.overall >= 80 ? 'Good Standing' : score.overall >= 60 ? 'Needs Attention' : 'At Risk'}</p>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(score).filter(([k]) => k !== 'overall').map(([key, val]) => (
                  <div key={key} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
                    <p className={`text-2xl font-bold ${val >= 80 ? 'text-emerald-400' : val >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{val}</p>
                    <p className="text-[9px] font-bold uppercase text-slate-500 mt-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${val >= 80 ? 'bg-emerald-400' : val >= 60 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'aml' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50"><p className="text-lg font-bold text-red-400">{amlFlags.filter(f => !f.resolved).length}</p><p className="text-[9px] text-slate-500">Open Flags</p></div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50"><p className="text-lg font-bold text-emerald-400">{amlFlags.filter(f => f.resolved).length}</p><p className="text-[9px] text-slate-500">Resolved</p></div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50"><p className="text-lg font-bold text-white">${amlFlags.reduce((s, f) => s + f.amount, 0).toLocaleString()}</p><p className="text-[9px] text-slate-500">Total Flagged</p></div>
              </div>
              {amlFlags.map(f => (
                <div key={f.id} className={`p-4 rounded-xl border ${f.resolved ? 'bg-slate-800/30 border-slate-700/30' : 'bg-red-500/5 border-red-500/20'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${f.resolved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>{f.resolved ? 'Resolved' : 'Open'}</span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">{f.type}</span>
                    </div>
                    <span className="text-[9px] text-slate-500">{f.transactionId} · {f.date}</span>
                  </div>
                  <p className="text-sm text-white mb-1">{f.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-[10px]">
                    <span className="text-slate-400">Amount: <span className="text-white font-bold">${f.amount.toLocaleString()}</span></span>
                    <span className="text-slate-400">Risk Score: <span className={`font-bold ${f.riskScore >= 80 ? 'text-red-400' : f.riskScore >= 60 ? 'text-amber-400' : 'text-slate-300'}`}>{f.riskScore}</span></span>
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

export default RegulatoryComplianceRadarModal;
