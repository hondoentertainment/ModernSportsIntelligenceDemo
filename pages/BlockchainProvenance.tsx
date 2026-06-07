import React, { useState, useEffect, useMemo } from 'react';
import { Fingerprint, AlertTriangle, Shield, Clock, Link2, FileCheck, Layers, Database, Activity, CheckCircle } from 'lucide-react';
import {
  getCardPassports,
  getProvenanceChain,
  getOwnershipHistory,
  getDigitalTwins,
  getSmartContracts,
  getRecentVerifications,
  getNetworkStats,
  getTransactionHistory,
  getNetworkConfig,
  formatCurrency,
  type CardPassport,
  type ProvenanceEvent,
  type OwnershipRecord,
  type DigitalTwin,
  type SmartContract,
  type VerificationResult,
  type TransactionRecord,
} from '../lib/core/blockchainProvenanceService';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f43f5e', '#6366f1'];

const BlockchainProvenance: React.FC = () => {
  const [passports, setPassports] = useState<CardPassport[]>([]);
  const [provenanceChain, setProvenanceChain] = useState<ProvenanceEvent[]>([]);
  const [ownershipHistory, setOwnershipHistory] = useState<OwnershipRecord[]>([]);
  const [digitalTwins, setDigitalTwins] = useState<DigitalTwin[]>([]);
  const [smartContracts, setSmartContracts] = useState<SmartContract[]>([]);
  const [verifications, setVerifications] = useState<VerificationResult[]>([]);
  const [networkStats, setNetworkStats] = useState<{ network: string; passports: number; transactions: number; verifications: number; avgCost: number }[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [selectedPassportId, setSelectedPassportId] = useState<string>('');
  const [verifyInput, setVerifyInput] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const allPassports = getCardPassports();
      setPassports(allPassports);
      setDigitalTwins(getDigitalTwins());
      setSmartContracts(getSmartContracts());
      setVerifications(getRecentVerifications());
      setNetworkStats(getNetworkStats());
      setTransactions(getTransactionHistory());
      if (allPassports.length > 0) {
        const firstId = allPassports[0].id;
        setSelectedPassportId(firstId);
        setProvenanceChain(getProvenanceChain(firstId));
        setOwnershipHistory(getOwnershipHistory(firstId));
      }
      setLoading(false);
    } catch {
      setError('Failed to load Blockchain Provenance data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedPassportId) return;
    try {
      setProvenanceChain(getProvenanceChain(selectedPassportId));
      setOwnershipHistory(getOwnershipHistory(selectedPassportId));
    } catch {
      // ignore
    }
  }, [selectedPassportId]);

  const summaryStats = useMemo(() => {
    const totalPassports = passports.length;
    const avgAuthenticity = passports.length > 0
      ? Math.round(passports.reduce((s, p) => s + p.authenticityScore, 0) / passports.length)
      : 0;
    const totalVerifications = verifications.length;
    const verified = verifications.filter(v => v.result === 'verified').length;
    const totalTwins = digitalTwins.length;
    const totalContracts = smartContracts.length;
    return { totalPassports, avgAuthenticity, totalVerifications, verified, totalTwins, totalContracts };
  }, [passports, verifications, digitalTwins, smartContracts]);

  const authenticityDistribution = useMemo(() => {
    const ranges = [
      { label: '95-100', min: 95, max: 100 },
      { label: '90-94', min: 90, max: 94 },
      { label: '80-89', min: 80, max: 89 },
      { label: '70-79', min: 70, max: 79 },
      { label: '<70', min: 0, max: 69 },
    ];
    return ranges.map(r => ({
      range: r.label,
      count: passports.filter(p => p.authenticityScore >= r.min && p.authenticityScore <= r.max).length,
    }));
  }, [passports]);

  const eventsByType = useMemo(() => {
    const typeMap: Record<string, number> = {};
    provenanceChain.forEach(evt => {
      typeMap[evt.eventType] = (typeMap[evt.eventType] || 0) + 1;
    });
    return Object.entries(typeMap).map(([name, value]) => ({ name, value }));
  }, [provenanceChain]);

  const passportsOverTime = useMemo(() => {
    const months = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026'];
    return months.map((month, i) => ({
      month,
      passports: Math.floor(passports.length * 0.4 + passports.length * 0.12 * i + Math.sin(i) * 2),
      verifications: Math.floor(verifications.length * 0.3 + verifications.length * 0.14 * i),
    }));
  }, [passports, verifications]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Blockchain Provenance &amp; Digital Card Passport...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-500/20">
          <Fingerprint size={24} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Blockchain Provenance &amp; Digital Card Passport</h1>
          <p className="text-sm text-slate-400">Immutable ownership history, authentication &amp; digital twin management &mdash; Phase 148</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Passports</p>
          <p className="text-2xl font-bold text-violet-400">{summaryStats.totalPassports}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Authenticity</p>
          <p className={`text-2xl font-bold ${summaryStats.avgAuthenticity >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{summaryStats.avgAuthenticity}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Verifications</p>
          <p className="text-2xl font-bold text-blue-400">{summaryStats.totalVerifications}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Verified</p>
          <p className="text-2xl font-bold text-emerald-400">{summaryStats.verified}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Digital Twins</p>
          <p className="text-2xl font-bold text-cyan-400">{summaryStats.totalTwins}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Contracts</p>
          <p className="text-2xl font-bold text-amber-400">{summaryStats.totalContracts}</p>
        </div>
      </div>

      {/* Passport Gallery Grid */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Fingerprint size={18} className="text-violet-400" />
          Card Passport Gallery
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {passports.map(passport => {
            const netCfg = getNetworkConfig(passport.network);
            return (
              <div
                key={passport.id}
                className={`bg-slate-900/50 border rounded-xl p-4 cursor-pointer transition-colors ${selectedPassportId === passport.id ? 'border-violet-500/50' : 'border-slate-700/30 hover:border-slate-600/50'}`}
                onClick={() => setSelectedPassportId(passport.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white truncate max-w-[160px]">{passport.cardName}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    passport.authenticityScore >= 95 ? 'bg-emerald-500/20 text-emerald-400' :
                    passport.authenticityScore >= 85 ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>{passport.authenticityScore}%</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">{passport.player} &bull; {passport.grade}</p>
                <div className="space-y-1 text-[10px] text-slate-500">
                  <div className="flex justify-between"><span>Network</span><span className={`font-bold ${netCfg.text}`}>{netCfg.label}</span></div>
                  <div className="flex justify-between"><span>Token ID</span><span className="text-slate-300 font-mono">{passport.tokenId}</span></div>
                  <div className="flex justify-between"><span>Issued</span><span className="text-slate-300">{passport.issuedDate}</span></div>
                  <div className="flex justify-between"><span>Owners</span><span className="text-slate-300">{passport.totalOwners}</span></div>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {passport.verified && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle size={8} /> Verified
                    </span>
                  )}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${netCfg.bg} ${netCfg.text}`}>{netCfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Provenance Timeline */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-blue-400" />
          Provenance Timeline {selectedPassportId ? '' : '(Select a passport)'}
        </h2>
        {provenanceChain.length > 0 ? (
          <div className="relative ml-4">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-700/50" />
            <div className="space-y-4">
              {provenanceChain.map((evt, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className={`absolute left-[-4px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                    evt.eventType === 'mint' ? 'border-violet-500 bg-violet-500/30' :
                    evt.eventType === 'transfer' ? 'border-blue-500 bg-blue-500/30' :
                    evt.eventType === 'grade' ? 'border-emerald-500 bg-emerald-500/30' :
                    evt.eventType === 'sale' ? 'border-amber-500 bg-amber-500/30' :
                    evt.eventType === 'verify' ? 'border-cyan-500 bg-cyan-500/30' :
                    'border-slate-500 bg-slate-500/30'
                  }`} />
                  <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          evt.eventType === 'mint' ? 'bg-violet-500/20 text-violet-400' :
                          evt.eventType === 'transfer' ? 'bg-blue-500/20 text-blue-400' :
                          evt.eventType === 'grade' ? 'bg-emerald-500/20 text-emerald-400' :
                          evt.eventType === 'sale' ? 'bg-amber-500/20 text-amber-400' :
                          evt.eventType === 'verify' ? 'bg-cyan-500/20 text-cyan-400' :
                          'bg-slate-700/50 text-slate-400'
                        }`}>{(evt.eventType ?? 'event').toUpperCase()}</span>
                        <span className="text-xs font-bold text-white">{evt.description}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      {evt.from && <span>From: <span className="text-slate-400 font-mono">{evt.from}</span></span>}
                      {evt.to && <span>To: <span className="text-slate-400 font-mono">{evt.to}</span></span>}
                      {evt.txHash && <span>Tx: <span className="text-slate-400 font-mono">{evt.txHash.slice(0, 12)}...</span></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">Select a passport above to view its provenance chain.</p>
        )}
      </div>

      {/* Ownership History Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-cyan-400" />
          Ownership History
        </h2>
        {ownershipHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700/50">
                  <th className="text-left py-2 pr-2">Owner</th>
                  <th className="text-left py-2 px-2">Acquired</th>
                  <th className="text-left py-2 px-2">Released</th>
                  <th className="text-right py-2 px-2">Price Paid</th>
                  <th className="text-right py-2 px-2">Duration</th>
                  <th className="text-left py-2 pl-2">Method</th>
                </tr>
              </thead>
              <tbody>
                {ownershipHistory.map((record, idx) => (
                  <tr key={idx} className="border-b border-slate-700/30">
                    <td className="py-2 pr-2 text-slate-300 font-medium font-mono">{record.owner}</td>
                    <td className="py-2 px-2 text-slate-400">{record.acquiredDate}</td>
                    <td className="py-2 px-2 text-slate-400">{record.releasedDate || 'Current'}</td>
                    <td className="py-2 px-2 text-right text-emerald-400 font-bold">{record.pricePaid ? formatCurrency(record.pricePaid) : 'N/A'}</td>
                    <td className="py-2 px-2 text-right text-slate-500">{record.daysHeld ? `${record.daysHeld}d` : '-'}</td>
                    <td className="py-2 pl-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300">{record.acquisitionMethod}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">Select a passport above to view ownership history.</p>
        )}
      </div>

      {/* BarChart: Authenticity Score Distribution + PieChart: Events by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BarChart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-emerald-400" />
            Authenticity Score Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={authenticityDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" name="Passports" radius={[4, 4, 0, 0]}>
                  {authenticityDistribution.map((entry, index) => (
                    <Cell key={index} fill={
                      entry.range === '95-100' ? '#10b981' :
                      entry.range === '90-94' ? '#3b82f6' :
                      entry.range === '80-89' ? '#f59e0b' :
                      entry.range === '70-79' ? '#f97316' :
                      '#ef4444'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PieChart: Events by Type */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-blue-400" />
            Provenance Events by Type
          </h2>
          <div className="h-64">
            {eventsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={85}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name} (${value})`}
                    labelLine={{ stroke: '#64748b' }}
                  >
                    {eventsByType.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-slate-500 italic">Select a passport to view event distribution.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Smart Contract Templates */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <FileCheck size={18} className="text-amber-400" />
          Smart Contract Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {smartContracts.map(contract => {
            const netCfg = getNetworkConfig(contract.network);
            return (
              <div key={contract.id} className={`bg-slate-900/50 border rounded-xl p-4 ${netCfg.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{contract.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${netCfg.bg} ${netCfg.text}`}>{netCfg.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">{contract.description}</p>
                <div className="space-y-1 text-[10px] text-slate-500">
                  <div className="flex justify-between"><span>Type</span><span className="text-slate-300 capitalize">{contract.contractType}</span></div>
                  <div className="flex justify-between"><span>Standard</span><span className="text-slate-300">{contract.standard}</span></div>
                  <div className="flex justify-between"><span>Gas Cost</span><span className="text-slate-300">{contract.gasCost}</span></div>
                  <div className="flex justify-between"><span>Status</span>
                    <span className={`font-bold ${contract.status === 'deployed' ? 'text-emerald-400' : contract.status === 'audited' ? 'text-blue-400' : 'text-amber-400'}`}>
                      {contract.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Digital Twin Gallery */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Link2 size={18} className="text-cyan-400" />
          Digital Twin Gallery
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {digitalTwins.map(twin => {
            const netCfg = getNetworkConfig(twin.network);
            return (
              <div key={twin.id} className={`bg-slate-900/50 border rounded-xl p-4 ${netCfg.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white truncate max-w-[160px]">{twin.cardName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${netCfg.bg} ${netCfg.text}`}>{netCfg.label}</span>
                </div>
                <div className="space-y-1 text-[10px] text-slate-500">
                  <div className="flex justify-between"><span>Token</span><span className="text-slate-300 font-mono">{twin.tokenId}</span></div>
                  <div className="flex justify-between"><span>Format</span><span className="text-slate-300">{twin.format}</span></div>
                  <div className="flex justify-between"><span>Resolution</span><span className="text-slate-300">{twin.resolution}</span></div>
                  <div className="flex justify-between"><span>File Size</span><span className="text-slate-300">{twin.fileSize}</span></div>
                  <div className="flex justify-between"><span>Minted</span><span className="text-slate-300">{twin.mintDate}</span></div>
                </div>
                <div className="mt-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${twin.linked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                    {twin.linked ? 'Linked to Physical' : 'Unlinked'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Network Stats Comparison */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Database size={18} className="text-purple-400" />
          Network Stats Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700/50">
                <th className="text-left py-2 pr-2">Network</th>
                <th className="text-right py-2 px-2">Passports</th>
                <th className="text-right py-2 px-2">Transactions</th>
                <th className="text-right py-2 px-2">Verifications</th>
                <th className="text-right py-2 pl-2">Avg Cost</th>
              </tr>
            </thead>
            <tbody>
              {networkStats.map((stat, idx) => {
                const netCfg = getNetworkConfig(stat.network);
                return (
                  <tr key={idx} className="border-b border-slate-700/30">
                    <td className={`py-2 pr-2 font-bold ${netCfg.text}`}>{netCfg.label}</td>
                    <td className="py-2 px-2 text-right text-slate-300">{stat.passports.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{stat.transactions.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{stat.verifications.toLocaleString()}</td>
                    <td className="py-2 pl-2 text-right text-emerald-400">${stat.avgCost.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Tool */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <CheckCircle size={18} className="text-emerald-400" />
          Verification Tool
        </h2>
        <div className="mb-4 flex items-center gap-3">
          <input
            type="text"
            value={verifyInput}
            onChange={e => setVerifyInput(e.target.value)}
            placeholder="Enter passport ID or token hash to verify..."
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm flex-1 focus:outline-none focus:border-violet-500"
          />
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors">
            Verify
          </button>
        </div>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {verifications.map((v, idx) => (
            <div key={idx} className={`bg-slate-900/50 border rounded-xl p-3 ${
              v.result === 'verified' ? 'border-emerald-500/20' :
              v.result === 'failed' ? 'border-red-500/20' :
              'border-amber-500/20'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">{v.cardName || v.passportId}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  v.result === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                  v.result === 'failed' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>{(v.result ?? 'pending').toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span>Score: <span className="text-slate-300 font-bold">{v.score}%</span></span>
                <span>Checks: <span className="text-slate-300">{v.checksRun}</span></span>
                <span>Date: <span className="text-slate-300">{v.date}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Log */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-blue-400" />
          Transaction History Log
        </h2>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700/50">
                <th className="text-left py-2 pr-2">Tx Hash</th>
                <th className="text-left py-2 px-2">Type</th>
                <th className="text-left py-2 px-2">Network</th>
                <th className="text-left py-2 px-2">From</th>
                <th className="text-left py-2 px-2">To</th>
                <th className="text-right py-2 px-2">Gas</th>
                <th className="text-left py-2 pl-2">Date</th>
            </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => {
                const netCfg = getNetworkConfig(tx.network);
                return (
                  <tr key={idx} className="border-b border-slate-700/30">
                    <td className="py-2 pr-2 text-slate-400 font-mono">{tx.txHash.slice(0, 14)}...</td>
                    <td className="py-2 px-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        tx.type === 'mint' ? 'bg-violet-500/20 text-violet-400' :
                        tx.type === 'transfer' ? 'bg-blue-500/20 text-blue-400' :
                        tx.type === 'verify' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-slate-700/50 text-slate-400'
                      }`}>{tx.type}</span>
                    </td>
                    <td className={`py-2 px-2 ${netCfg.text}`}>{netCfg.label}</td>
                    <td className="py-2 px-2 text-slate-500 font-mono">{tx.from.slice(0, 10)}...</td>
                    <td className="py-2 px-2 text-slate-500 font-mono">{tx.to.slice(0, 10)}...</td>
                    <td className="py-2 px-2 text-right text-slate-400">{tx.gasCost}</td>
                    <td className="py-2 pl-2 text-slate-500">{tx.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* LineChart: Passports Over Time */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-violet-400" />
          Passports &amp; Verifications Over Time
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={passportsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="passports" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Passports Minted" />
              <Line type="monotone" dataKey="verifications" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Verifications" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BlockchainProvenance;
