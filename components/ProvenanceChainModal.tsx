import React, { useState } from 'react';
import { X, Link2, Shield, CheckCircle, ExternalLink, Copy, FileText, Clock, Fingerprint, QrCode, ChevronDown, ChevronUp } from 'lucide-react';
import { getDigitalTwins, getAuthenticationCertificate, getProvenanceStats, type DigitalTwin, type ProvenanceRecord } from '../lib/provenanceChainService.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ProvenanceChainModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'twins' | 'certificates' | 'stats'>('twins');
  const [selectedTwin, setSelectedTwin] = useState<string | null>(null);

  if (!isOpen) return null;

  const twins = getDigitalTwins();
  const stats = getProvenanceStats();

  const eventTypeColors: Record<string, string> = {
    mint: 'bg-emerald-500/20 text-emerald-400',
    transfer: 'bg-blue-500/20 text-blue-400',
    grade: 'bg-purple-500/20 text-purple-400',
    authenticate: 'bg-amber-500/20 text-amber-400',
    vault: 'bg-cyan-500/20 text-cyan-400',
    exhibit: 'bg-pink-500/20 text-pink-400',
    fractional_split: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Link2 size={24} className="text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Provenance Chain & Digital Twins</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-3 p-4 bg-slate-800/30">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Digital Twins</p>
            <p className="text-xl font-bold text-cyan-400">{stats.totalTwins}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Verified</p>
            <p className="text-xl font-bold text-emerald-400">{stats.totalVerified}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Auth Score</p>
            <p className="text-xl font-bold text-amber-400">{stats.averageAuthenticityScore.toFixed(1)}%</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Chain Events</p>
            <p className="text-xl font-bold text-purple-400">{stats.totalProvenanceEvents}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 pb-0">
          {(['twins', 'certificates', 'stats'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${tab === t ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
              {t === 'twins' ? `Digital Twins (${twins.length})` : t === 'certificates' ? 'Certificates' : 'Chain Stats'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[45vh]">
          {tab === 'twins' && (
            <div className="space-y-4">
              {twins.map(twin => {
                const cert = getAuthenticationCertificate(twin.id);
                return (
                  <div key={twin.id} className="bg-slate-800/50 border border-slate-700/30 rounded-xl overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <img src={twin.image} alt={twin.playerName} className="w-16 h-20 rounded-lg object-cover bg-slate-700" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-200">{twin.playerName}</p>
                              <p className="text-xs text-slate-500">{twin.cardDescription}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold ${twin.authenticityScore >= 95 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {twin.authenticityScore}% Authentic
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                            <span>Token #{twin.tokenId}</span>
                            <span>{twin.chain.charAt(0).toUpperCase() + twin.chain.slice(1)}</span>
                            <span>Status: {twin.status.replace(/_/g, ' ')}</span>
                            <span>{twin.physicalLocation}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {twin.attributes.slice(0, 4).map(attr => (
                              <span key={attr.traitType} className="px-1.5 py-0.5 text-[9px] bg-slate-700/50 text-slate-400 rounded">
                                {attr.traitType}: {attr.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button onClick={() => setSelectedTwin(selectedTwin === twin.id ? null : twin.id)} className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-3">
                        {selectedTwin === twin.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        Provenance Chain ({twin.provenanceChain.length} events)
                      </button>
                    </div>

                    {selectedTwin === twin.id && (
                      <div className="border-t border-slate-700/30 p-4 bg-slate-900/30">
                        <div className="relative">
                          {twin.provenanceChain.map((record, i) => (
                            <div key={record.id} className="flex items-start gap-3 mb-4 last:mb-0">
                              <div className="flex flex-col items-center">
                                <div className={`w-3 h-3 rounded-full ${record.verified ? 'bg-emerald-500' : 'bg-slate-600'} z-10`} />
                                {i < twin.provenanceChain.length - 1 && <div className="w-0.5 h-full bg-slate-700 mt-1" />}
                              </div>
                              <div className="flex-1 bg-slate-800/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`px-2 py-0.5 text-[10px] rounded font-semibold ${eventTypeColors[record.eventType] || 'bg-slate-600/20 text-slate-400'}`}>
                                    {record.eventType.replace(/_/g, ' ').toUpperCase()}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{record.timestamp}</span>
                                </div>
                                {record.fromName && record.toName && (
                                  <p className="text-xs text-slate-300">{record.fromName} → {record.toName}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {Object.entries(record.metadata).map(([key, value]) => (
                                    <span key={key} className="text-[10px] text-slate-500">{key}: <span className="text-slate-400">{value}</span></span>
                                  ))}
                                </div>
                                <p className="text-[9px] text-slate-600 mt-1 font-mono truncate">Block #{record.blockNumber} · {record.transactionHash.substring(0, 20)}...</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Certificate Info */}
                        <div className="mt-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Fingerprint size={14} className="text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-400">Authentication Certificate</span>
                          </div>
                          <div className="space-y-1">
                            {cert.physicalMarkers.map((marker, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <CheckCircle size={8} className="text-emerald-500 flex-shrink-0" />
                                <span className="text-[10px] text-slate-400">{marker}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-2">Tamper Score: {cert.tamperScore}/100 · Issuer: {cert.authenticator}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'certificates' && (
            <div className="space-y-3">
              {twins.map(twin => {
                const cert = getAuthenticationCertificate(twin.id);
                return (
                  <div key={twin.id} className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{twin.playerName}</p>
                        <p className="text-xs text-slate-500">{twin.cardDescription}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${cert.status === 'valid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {cert.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-slate-500">Issuer</p>
                        <p className="text-slate-300">{cert.issuer}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Authenticator</p>
                        <p className="text-slate-300">{cert.authenticator}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Issued</p>
                        <p className="text-slate-300">{cert.issuedAt}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Expires</p>
                        <p className="text-slate-300">{cert.expiresAt}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[10px]">
                      <span className="font-mono text-slate-600 truncate flex-1">{cert.certificateHash.substring(0, 30)}...</span>
                      <button className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
                        <QrCode size={10} /> View QR
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {stats.chainDistribution.map(chain => (
                  <div key={chain.chain} className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-500">{chain.chain}</p>
                    <p className="text-2xl font-bold text-cyan-400">{chain.count}</p>
                    <p className="text-[10px] text-slate-600">twins minted</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-300 mb-3">Chain Benefits</h4>
                <div className="space-y-2">
                  {[
                    { icon: Shield, label: 'Anti-Counterfeit Protection', desc: 'Every card verified against physical markers and blockchain record' },
                    { icon: Link2, label: 'Complete Ownership History', desc: 'Immutable chain of custody from manufacturer to current owner' },
                    { icon: FileText, label: 'Insurance Documentation', desc: 'Blockchain-backed certificates accepted by major insurers' },
                    { icon: CheckCircle, label: 'Instant Verification', desc: 'Scan QR code to verify authenticity in seconds at shows or sales' },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3 bg-slate-900/50 rounded-lg p-3">
                      <item.icon size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-slate-300">{item.label}</p>
                        <p className="text-[10px] text-slate-500">{item.desc}</p>
                      </div>
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

export default ProvenanceChainModal;
