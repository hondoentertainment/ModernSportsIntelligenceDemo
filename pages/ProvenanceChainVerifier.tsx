// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Link, Shield, Camera, Clock, CheckCircle, AlertTriangle, Fingerprint } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import {
  getCards, getProvenanceChain, getProvenanceScore, verifyChainIntegrity,
  getChainOfCustody, getProvenanceReport, getPhotoEvidence, flagSuspiciousTransfers,
  getProvenanceComparison, getHighProvenanceCards, calculateProvenancePremium, formatCurrency,
  type ProvenanceCard, type ChainEvent, type ProvenanceScore as PScore,
  type ChainOfCustody as CoC, type ProvenanceReport as PReport, type PhotoEvidence as PPhoto,
  type ProvenanceFlag, type ProvenanceComparison as PComparison,
} from '../lib/core/provenanceChainService';

const TABS = [
  { id: 'chain', label: 'Chain Explorer', icon: Link },
  { id: 'score', label: 'Provenance Score', icon: Shield },
  { id: 'verification', label: 'Verification', icon: CheckCircle },
  { id: 'photos', label: 'Photo Evidence', icon: Camera },
  { id: 'custody', label: 'Custody Timeline', icon: Clock },
  { id: 'premium', label: 'Premium Analysis', icon: Fingerprint },
] as const;

type TabId = typeof TABS[number]['id'];

const EVENT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  mint:                  { bg: 'bg-violet-500/20', text: 'text-violet-400', dot: 'border-violet-500 bg-violet-500/30' },
  sale:                  { bg: 'bg-amber-500/20',  text: 'text-amber-400',  dot: 'border-amber-500 bg-amber-500/30' },
  grade:                 { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'border-emerald-500 bg-emerald-500/30' },
  transfer:              { bg: 'bg-blue-500/20',   text: 'text-blue-400',   dot: 'border-blue-500 bg-blue-500/30' },
  auction:               { bg: 'bg-pink-500/20',   text: 'text-pink-400',   dot: 'border-pink-500 bg-pink-500/30' },
  'insurance-appraisal': { bg: 'bg-cyan-500/20',   text: 'text-cyan-400',   dot: 'border-cyan-500 bg-cyan-500/30' },
  exhibition:            { bg: 'bg-orange-500/20',  text: 'text-orange-400', dot: 'border-orange-500 bg-orange-500/30' },
};

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];

const ProvenanceChainVerifier: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('chain');
  const [allCards, setAllCards] = useState<ProvenanceCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [chain, setChain] = useState<ChainEvent[]>([]);
  const [score, setScore] = useState<PScore | null>(null);
  const [custody, setCustody] = useState<CoC | null>(null);
  const [report, setReport] = useState<PReport | null>(null);
  const [photos, setPhotos] = useState<PPhoto[]>([]);
  const [suspiciousFlags, setSuspiciousFlags] = useState<ProvenanceFlag[]>([]);
  const [comparison, setComparison] = useState<PComparison | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    try {
      const c = getCards();
      setAllCards(c);
      setSuspiciousFlags(flagSuspiciousTransfers());
      if (c.length > 0) {
        setSelectedCardId(c[0].id);
      }
      const topIds = c.slice(0, 8).map(card => card.id);
      setComparison(getProvenanceComparison(topIds));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  // Card selection change
  useEffect(() => {
    if (!selectedCardId) return;
    setChain(getProvenanceChain(selectedCardId));
    setScore(getProvenanceScore(selectedCardId));
    setCustody(getChainOfCustody(selectedCardId));
    setReport(getProvenanceReport(selectedCardId));
    setPhotos(getPhotoEvidence(selectedCardId));
  }, [selectedCardId]);

  const integrity = useMemo(() => {
    if (!selectedCardId) return null;
    return verifyChainIntegrity(selectedCardId);
  }, [selectedCardId]);

  const premium = useMemo(() => {
    if (!selectedCardId) return null;
    return calculateProvenancePremium(selectedCardId);
  }, [selectedCardId]);

  const highProvenanceCards = useMemo(() => getHighProvenanceCards(), []);

  const selectedCard = useMemo(() => allCards.find(c => c.id === selectedCardId), [allCards, selectedCardId]);

  // Chart data derivations
  const scoreBreakdownData = useMemo(() => {
    if (!score) return [];
    return [
      { name: 'Chain Completeness', value: score.chainCompleteness, fill: '#8b5cf6' },
      { name: 'Verification Depth', value: score.verificationDepth, fill: '#3b82f6' },
      { name: 'Ownership Continuity', value: score.ownershipContinuity, fill: '#10b981' },
      { name: 'Documentation', value: score.documentationQuality, fill: '#f59e0b' },
      { name: 'Photo Evidence', value: score.photoEvidenceScore, fill: '#ec4899' },
      { name: 'Historical Significance', value: score.historicalSignificance, fill: '#06b6d4' },
    ];
  }, [score]);

  const valueOverTimeData = useMemo(() => {
    if (!chain.length) return [];
    return chain
      .filter(e => e.value)
      .map(e => ({ date: e.timestamp.slice(0, 10), value: e.value!, type: e.type }));
  }, [chain]);

  const comparisonData = useMemo(() => {
    if (!comparison) return [];
    return comparison.cards.map(c => ({
      name: c.cardName.length > 25 ? c.cardName.slice(0, 22) + '...' : c.cardName,
      score: c.score,
      events: c.eventCount,
      flags: c.flagCount,
      premium: c.premium,
    }));
  }, [comparison]);

  const premiumScatterData = useMemo(() => {
    return allCards.map(c => {
      const s = getProvenanceScore(c.id);
      const p = calculateProvenancePremium(c.id);
      return { name: c.name.slice(0, 20), score: s.overall, premium: p.premiumPercent, value: c.currentValue };
    });
  }, [allCards]);

  const ownerDurationData = useMemo(() => {
    if (!custody) return [];
    return custody.links.map(l => ({
      owner: l.owner.length > 18 ? l.owner.slice(0, 15) + '...' : l.owner,
      days: l.durationDays,
      status: l.verificationStatus,
    }));
  }, [custody]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-violet-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Provenance Chain Verifier...</p>
        </div>
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
          <h1 className="text-2xl font-bold text-slate-100">Provenance Chain Verifier</h1>
          <p className="text-sm text-slate-400">Full chain-of-custody verification, scoring &amp; premium analysis</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cards Tracked</p>
          <p className="text-2xl font-bold text-violet-400">{allCards.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">High Provenance</p>
          <p className="text-2xl font-bold text-emerald-400">{highProvenanceCards.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Suspicious Flags</p>
          <p className="text-2xl font-bold text-red-400">{suspiciousFlags.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Score</p>
          <p className="text-2xl font-bold text-blue-400">{comparison?.averageScore ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Selected Score</p>
          <p className={`text-2xl font-bold ${(score?.overall ?? 0) >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{score?.overall ?? '-'}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Premium</p>
          <p className={`text-2xl font-bold ${(premium?.premiumPercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {premium ? `${premium.premiumPercent > 0 ? '+' : ''}${premium.premiumPercent}%` : '-'}
          </p>
        </div>
      </div>

      {/* Card Selector */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Select Card</label>
        <select
          value={selectedCardId}
          onChange={e => setSelectedCardId(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
        >
          {allCards.map(c => (
            <option key={c.id} value={c.id}>{c.name} — {c.grade} — {formatCurrency(c.currentValue)}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* ═══ CHAIN EXPLORER ═══ */}
        {activeTab === 'chain' && (
          <>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Link size={18} className="text-violet-400" />
                Provenance Chain — {selectedCard?.name}
              </h2>
              {chain.length > 0 ? (
                <div className="relative ml-4">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-700/50" />
                  <div className="space-y-4">
                    {chain.map(evt => {
                      const ec = EVENT_COLORS[evt.type] || EVENT_COLORS.transfer;
                      return (
                        <div key={evt.id} className="relative pl-6">
                          <div className={`absolute left-[-4px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${ec.dot}`} />
                          <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${ec.bg} ${ec.text}`}>{evt.type}</span>
                                {evt.verificationStatus === 'verified' && <CheckCircle size={12} className="text-emerald-400" />}
                                {evt.verificationStatus === 'disputed' && <AlertTriangle size={12} className="text-red-400" />}
                                {evt.verificationStatus === 'pending' && <Clock size={12} className="text-amber-400" />}
                                {evt.verificationStatus === 'unverified' && <AlertTriangle size={12} className="text-slate-500" />}
                              </div>
                              <span className="text-[10px] text-slate-500">{evt.timestamp.slice(0, 10)}</span>
                            </div>
                            <p className="text-sm text-slate-200 mb-1">{evt.description}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-slate-500">
                              <span>Actor: {evt.actor}</span>
                              <span>Location: {evt.location}</span>
                              {evt.value && <span className="text-emerald-400 font-bold">${evt.value.toLocaleString()}</span>}
                              {evt.photoEvidenceIds.length > 0 && (
                                <span className="flex items-center gap-0.5"><Camera size={9} /> {evt.photoEvidenceIds.length} photo(s)</span>
                              )}
                            </div>
                            <div className="mt-1 text-[9px] text-slate-600 font-mono truncate">
                              {evt.hash.algorithm}: {evt.hash.value.slice(0, 32)}...
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No provenance events found.</p>
              )}
            </div>

            {/* Value over time chart */}
            {valueOverTimeData.length > 1 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-md font-bold text-slate-200 mb-4">Value Progression Over Time</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={valueOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => formatCurrency(v)} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#94a3b8' }}
                      formatter={(v: number) => [`$${v.toLocaleString()}`, 'Value']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* ═══ PROVENANCE SCORE ═══ */}
        {activeTab === 'score' && score && (
          <>
            {/* Overall score */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Shield size={18} className="text-emerald-400" />
                Provenance Score — {selectedCard?.name}
              </h2>
              <div className="flex items-center gap-6 mb-6">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${
                  score.overall >= 80 ? 'border-emerald-500 text-emerald-400' :
                  score.overall >= 60 ? 'border-amber-500 text-amber-400' :
                  'border-red-500 text-red-400'
                }`}>
                  <span className="text-3xl font-bold">{score.overall}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-200 font-medium">
                    {score.overall >= 80 ? 'Excellent Provenance' : score.overall >= 60 ? 'Good Provenance' : 'Needs Improvement'}
                  </p>
                  <p className="text-slate-500">{score.flags.length} flag(s) detected</p>
                  <p className="text-slate-500">Calculated: {score.calculatedAt.slice(0, 10)}</p>
                </div>
              </div>

              {/* Breakdown bars */}
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={scoreBreakdownData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`${v}/100`, 'Score']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {scoreBreakdownData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Flags */}
            {score.flags.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-md font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  Provenance Flags
                </h3>
                <div className="space-y-2">
                  {score.flags.map(flag => (
                    <div key={flag.id} className={`border rounded-lg p-3 ${
                      flag.severity === 'critical' || flag.severity === 'high'
                        ? 'border-red-500/30 bg-red-500/5'
                        : flag.severity === 'medium' ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-slate-700/30 bg-slate-900/30'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            flag.severity === 'critical' || flag.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                            flag.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>{flag.severity}</span>
                          <span className="text-xs text-slate-300 font-medium">{flag.type.replace(/-/g, ' ')}</span>
                        </div>
                        {flag.resolved ? (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5"><CheckCircle size={10} /> Resolved</span>
                        ) : (
                          <span className="text-[10px] text-red-400 flex items-center gap-0.5"><AlertTriangle size={10} /> Open</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{flag.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Score comparison across top cards */}
            {comparisonData.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-md font-bold text-slate-200 mb-3">Score Comparison (Top 8 Cards)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="score" fill="#8b5cf6" name="Score" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="events" stroke="#10b981" name="Events" strokeWidth={2} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* ═══ VERIFICATION ═══ */}
        {activeTab === 'verification' && integrity && (
          <>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <CheckCircle size={18} className={integrity.valid ? 'text-emerald-400' : 'text-red-400'} />
                Chain Integrity — {selectedCard?.name}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Integrity Score</p>
                  <p className={`text-2xl font-bold ${integrity.integrityScore >= 80 ? 'text-emerald-400' : integrity.integrityScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {integrity.integrityScore}
                  </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <p className={`text-lg font-bold ${integrity.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {integrity.valid ? 'VALID' : 'ISSUES'}
                  </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Verified Events</p>
                  <p className="text-2xl font-bold text-blue-400">{integrity.verifiedEvents}/{integrity.totalEvents}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Issues Found</p>
                  <p className={`text-2xl font-bold ${integrity.issues.length === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {integrity.issues.length}
                  </p>
                </div>
              </div>

              {integrity.issues.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h3 className="text-sm font-bold text-slate-300">Issues Detected:</h3>
                  {integrity.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg p-2">
                      <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-red-300">{issue}</span>
                    </div>
                  ))}
                </div>
              )}

              {integrity.issues.length === 0 && (
                <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span className="text-sm text-emerald-300">All chain integrity checks passed. No issues detected.</span>
                </div>
              )}
            </div>

            {/* Verification rate by event type */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-md font-bold text-slate-200 mb-3">Verification Rate by Event Type</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={(() => {
                  const types = ['mint', 'sale', 'grade', 'transfer', 'auction', 'insurance-appraisal', 'exhibition'];
                  return types.map(t => {
                    const evts = chain.filter(e => e.type === t);
                    const verified = evts.filter(e => e.verificationStatus === 'verified').length;
                    return { type: t, total: evts.length, verified, rate: evts.length > 0 ? Math.round((verified / evts.length) * 100) : 0 };
                  }).filter(d => d.total > 0);
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="rate" fill="#10b981" name="Verified %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Global suspicious flags */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-md font-bold text-slate-200 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                Global Suspicious Transfer Flags ({suspiciousFlags.length})
              </h3>
              {suspiciousFlags.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {suspiciousFlags.map(flag => (
                    <div key={flag.id} className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg p-2">
                      <AlertTriangle size={12} className="text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-300">{flag.description}</p>
                        <p className="text-[10px] text-slate-500">{flag.type.replace(/-/g, ' ')} &bull; {flag.cardId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-emerald-400 flex items-center gap-1"><CheckCircle size={14} /> No suspicious transfers detected across all cards.</p>
              )}
            </div>
          </>
        )}

        {/* ═══ PHOTO EVIDENCE ═══ */}
        {activeTab === 'photos' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Camera size={18} className="text-pink-400" />
              Photo Evidence — {selectedCard?.name} ({photos.length} items)
            </h2>
            {photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map(photo => (
                  <div key={photo.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
                    {/* Placeholder image */}
                    <div className="w-full h-32 rounded-lg mb-2 flex items-center justify-center" style={{ backgroundColor: selectedCard?.imageColor || '#334155', opacity: 0.3 }}>
                      <Camera size={32} className="text-white/50" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300 font-medium">{photo.id}</span>
                        <span className="text-[10px] text-slate-500">{photo.resolution}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Captured: {photo.capturedAt.slice(0, 10)}</p>
                      <p className="text-[10px] text-slate-500">By: {photo.capturedBy}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {photo.tags.map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400">{tag}</span>
                        ))}
                      </div>
                      <div className="mt-1 text-[9px] text-slate-600 font-mono truncate">
                        {photo.hash.algorithm}: {photo.hash.value.slice(0, 24)}...
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Fingerprint size={10} className="text-emerald-400" />
                        <span className="text-[9px] text-emerald-400">Tamper-proof hash verified</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No photo evidence available for this card.</p>
            )}
          </div>
        )}

        {/* ═══ CUSTODY TIMELINE ═══ */}
        {activeTab === 'custody' && custody && (
          <>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-400" />
                Chain of Custody — {custody.cardName}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-slate-500 mb-1">Total Owners</p>
                  <p className="text-xl font-bold text-violet-400">{custody.totalOwners}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-slate-500 mb-1">Total Events</p>
                  <p className="text-xl font-bold text-blue-400">{custody.totalEvents}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-slate-500 mb-1">First Record</p>
                  <p className="text-sm font-bold text-slate-300">{custody.firstRecordedDate.slice(0, 10)}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-slate-500 mb-1">Current Owner</p>
                  <p className="text-xs font-bold text-emerald-400 truncate">{custody.currentOwner}</p>
                </div>
              </div>

              {/* Visual connected timeline */}
              <div className="relative">
                <div className="flex overflow-x-auto gap-0 pb-4">
                  {custody.links.map((link, i) => (
                    <div key={link.id} className="flex items-center shrink-0">
                      <div className={`relative w-36 border rounded-xl p-3 ${
                        link.verificationStatus === 'verified' ? 'border-emerald-500/30 bg-emerald-500/5' :
                        link.verificationStatus === 'pending' ? 'border-amber-500/30 bg-amber-500/5' :
                        'border-slate-700/30 bg-slate-900/30'
                      }`}>
                        <div className="flex items-center gap-1 mb-1">
                          {link.verificationStatus === 'verified' && <CheckCircle size={10} className="text-emerald-400" />}
                          {link.verificationStatus === 'pending' && <Clock size={10} className="text-amber-400" />}
                          {link.verificationStatus === 'unverified' && <AlertTriangle size={10} className="text-slate-500" />}
                          <span className="text-[10px] text-slate-300 font-medium truncate">{link.owner}</span>
                        </div>
                        <p className="text-[9px] text-slate-500">{link.acquiredDate.slice(0, 10)}</p>
                        {link.acquisitionPrice !== null && (
                          <p className="text-[9px] text-emerald-400 font-bold">${link.acquisitionPrice.toLocaleString()}</p>
                        )}
                        <p className="text-[9px] text-slate-600">{link.durationDays}d held</p>
                        <span className={`text-[8px] px-1 py-0.5 rounded-full ${
                          link.acquisitionMethod === 'auction' ? 'bg-pink-500/20 text-pink-400' :
                          link.acquisitionMethod === 'sale' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>{link.acquisitionMethod}</span>
                      </div>
                      {i < custody.links.length - 1 && (
                        <div className="w-8 h-0.5 bg-slate-700 shrink-0 mx-0.5 relative">
                          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-slate-600 border-y-[3px] border-y-transparent" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ownership duration chart */}
            {ownerDurationData.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-md font-bold text-slate-200 mb-3">Ownership Duration (Days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={ownerDurationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="owner" tick={{ fontSize: 9, fill: '#94a3b8' }} angle={-15} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="days" name="Days Held" radius={[4, 4, 0, 0]}>
                      {ownerDurationData.map((entry, i) => (
                        <Cell key={i} fill={entry.status === 'verified' ? '#10b981' : entry.status === 'pending' ? '#f59e0b' : '#64748b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* ═══ PREMIUM ANALYSIS ═══ */}
        {activeTab === 'premium' && premium && report && (
          <>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Fingerprint size={18} className="text-cyan-400" />
                Provenance Premium — {selectedCard?.name}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Base Value</p>
                  <p className="text-xl font-bold text-slate-200">{formatCurrency(premium.baseValue)}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Premium</p>
                  <p className={`text-xl font-bold ${premium.premiumPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {premium.premiumPercent > 0 ? '+' : ''}{premium.premiumPercent}%
                  </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Adjusted Value</p>
                  <p className="text-xl font-bold text-violet-400">{formatCurrency(premium.adjustedValue)}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Dollar Impact</p>
                  <p className={`text-xl font-bold ${premium.adjustedValue - premium.baseValue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {premium.adjustedValue - premium.baseValue >= 0 ? '+' : ''}{formatCurrency(premium.adjustedValue - premium.baseValue)}
                  </p>
                </div>
              </div>

              {/* Factor breakdown */}
              <h3 className="text-sm font-bold text-slate-300 mb-2">Premium Factors</h3>
              <div className="space-y-2 mb-6">
                {premium.factors.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-900/50 border border-slate-700/30 rounded-lg p-2">
                    <span className="text-xs text-slate-300">{f.factor}</span>
                    <span className={`text-xs font-bold ${f.impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {f.impact > 0 ? '+' : ''}{f.impact}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              <div className={`border rounded-lg p-3 ${
                report.score.overall >= 80 ? 'border-emerald-500/30 bg-emerald-500/5' :
                report.score.overall >= 60 ? 'border-amber-500/30 bg-amber-500/5' :
                'border-red-500/30 bg-red-500/5'
              }`}>
                <p className="text-sm text-slate-200 font-medium mb-1">Recommendation</p>
                <p className="text-xs text-slate-400">{report.recommendation}</p>
              </div>
            </div>

            {/* Score vs Premium scatter */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-md font-bold text-slate-200 mb-3">Provenance Score vs Premium (All Cards)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="score" name="Score" tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Provenance Score', position: 'bottom', fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis dataKey="premium" name="Premium %" tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Premium %', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number, name: string) => [name === 'premium' ? `${v}%` : v, name === 'premium' ? 'Premium' : 'Score']}
                    labelFormatter={() => ''}
                  />
                  <Scatter data={premiumScatterData} fill="#8b5cf6">
                    {premiumScatterData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Premium LineChart for high-provenance cards */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-md font-bold text-slate-200 mb-3">Premium Distribution (High Provenance Cards)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={highProvenanceCards.slice(0, 12).map(c => {
                  const p = calculateProvenancePremium(c.id);
                  const s = getProvenanceScore(c.id);
                  return {
                    name: c.name.length > 18 ? c.name.slice(0, 15) + '...' : c.name,
                    premium: p.premiumPercent,
                    score: s.overall,
                  };
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="premium" stroke="#10b981" name="Premium %" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" name="Score" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProvenanceChainVerifier;
