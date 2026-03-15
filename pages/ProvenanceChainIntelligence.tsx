import React, { useState, useMemo } from 'react';
import {
  Fingerprint,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  MapPin,
  Hash,
  Calendar,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Upload,
  Scan,
  ChevronDown,
  ChevronUp,
  FileWarning,
} from 'lucide-react';
import {
  getMyRegisteredCards,
  getRegistryStats,
  getFraudAlerts,
  getAuthenticityScore,
  getCrossPlatformSightings,
  verifyBeforePurchase,
  registerCard,
  type VerificationResult,
} from '../lib/provenanceChainService.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function fmtFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function scoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-red-400';
}

function scoreBg(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

function severityStyle(sev: string): string {
  switch (sev) {
    case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

function eventIcon(eventType: string): string {
  const icons: Record<string, string> = {
    registered: '📋', sold: '💰', listed: '🏷️', graded: '🏅',
    authenticated: '✅', transferred: '🔄', vaulted: '🔒',
    exhibited: '🖼️', flagged: '🚩',
  };
  return icons[eventType] ?? '📌';
}

const fraudTypeLabels: Record<string, string> = {
  duplicate_listing: 'Duplicate Listing',
  cert_mismatch: 'Cert # Mismatch',
  grade_appearance_mismatch: 'Grade/Appearance Mismatch',
  counterfeit_slab: 'Counterfeit Slab',
  trimmed_card: 'Trimmed Card',
  resubmission_fraud: 'Resubmission Fraud',
  stolen_card: 'Stolen Card',
};

type Section = 'dashboard' | 'verify' | 'timeline' | 'fraud' | 'register';

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

const ProvenanceChainIntelligence: React.FC = () => {
  const [section, setSection] = useState<Section>('dashboard');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [verifyQuery, setVerifyQuery] = useState('');
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [regSubmitted, setRegSubmitted] = useState(false);
  const [regForm, setRegForm] = useState({
    playerName: '', cardDescription: '', year: '', manufacturer: '',
    setName: '', cardNumber: '', grade: '', gradingCompany: '', certNumber: '', currentValue: '',
  });

  const cards = useMemo(() => getMyRegisteredCards(), []);
  const stats = useMemo(() => getRegistryStats(), []);
  const fraudAlerts = useMemo(() => getFraudAlerts(), []);

  const selectedCard = useMemo(
    () => selectedCardId ? cards.find(c => c.cardId === selectedCardId) : cards[0],
    [cards, selectedCardId]
  );

  const selectedSightings = useMemo(
    () => selectedCard ? getCrossPlatformSightings(selectedCard.certNumber ?? '') : [],
    [selectedCard]
  );

  const selectedAuth = useMemo(
    () => selectedCard ? getAuthenticityScore(selectedCard.cardId) : null,
    [selectedCard]
  );

  // Handlers
  const handleVerify = () => {
    if (!verifyQuery.trim()) return;
    setVerifyLoading(true);
    setTimeout(() => {
      setVerifyResult(verifyBeforePurchase(verifyQuery));
      setVerifyLoading(false);
    }, 800);
  };

  const handleRegister = () => {
    if (!regForm.playerName || !regForm.cardDescription) return;
    registerCard({
      playerName: regForm.playerName,
      cardDescription: regForm.cardDescription,
      year: parseInt(regForm.year) || new Date().getFullYear(),
      manufacturer: regForm.manufacturer,
      setName: regForm.setName,
      cardNumber: regForm.cardNumber,
      grade: regForm.grade || undefined,
      gradingCompany: regForm.gradingCompany || undefined,
      certNumber: regForm.certNumber || undefined,
      currentValue: parseFloat(regForm.currentValue) || undefined,
    }, []);
    setRegSubmitted(true);
  };

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Registry Dashboard', icon: <Shield size={16} /> },
    { id: 'verify', label: 'Verification Tool', icon: <Search size={16} /> },
    { id: 'timeline', label: 'Provenance Timeline', icon: <Clock size={16} /> },
    { id: 'fraud', label: 'Fraud Detection', icon: <ShieldAlert size={16} /> },
    { id: 'register', label: 'Register Card', icon: <Fingerprint size={16} /> },
  ];

  const totalPortfolioValue = cards.reduce((s, c) => s + c.currentValue, 0);

  // Recommendation styles for verify
  const recStyle: Record<string, { bg: string; text: string; label: string }> = {
    safe_to_buy: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: 'Safe to Buy' },
    proceed_with_caution: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: 'Proceed with Caution' },
    do_not_buy: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', label: 'Do NOT Buy' },
    needs_investigation: { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400', label: 'Needs Investigation' },
  };

  return (
    <div className="min-h-screen bg-brand-charcoal">
      {/* Header */}
      <div className="px-8 pt-10 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/30">
            <Fingerprint size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-bebas tracking-widest text-white leading-tight">
              Card DNA &amp; Provenance Chain
            </h1>
            <p className="text-sm text-brand-muted">
              Carfax for Sports Cards — Cross-platform tracking &amp; fraud detection
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-8 pb-4">
        <div className="flex gap-2 overflow-x-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${
                section === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-8 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Cards Registered', value: stats.totalCardsRegistered.toLocaleString(), color: 'text-cyan-400', icon: <Fingerprint size={14} className="text-cyan-400" /> },
            { label: 'Fraud Prevented', value: stats.fraudPrevented.toString(), color: 'text-emerald-400', icon: <Shield size={14} className="text-emerald-400" /> },
            { label: 'Value Protected', value: fmtCurrency(stats.valueProtected), color: 'text-amber-400', icon: <DollarSign size={14} className="text-amber-400" /> },
            { label: 'Active Alerts', value: stats.activeFraudAlerts.toString(), color: 'text-red-400', icon: <AlertTriangle size={14} className="text-red-400" /> },
            { label: 'Verifications / Mo', value: stats.verificationsThisMonth.toString(), color: 'text-purple-400', icon: <CheckCircle2 size={14} className="text-purple-400" /> },
            { label: 'Avg Auth Score', value: `${stats.averageAuthenticityScore}%`, color: 'text-blue-400', icon: <ShieldCheck size={14} className="text-blue-400" /> },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                {s.icon}
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
              <div className={`text-2xl font-bebas tracking-wider ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-8 pb-10">

        {/* ============================================================= */}
        {/* DASHBOARD */}
        {/* ============================================================= */}
        {section === 'dashboard' && (
          <div className="space-y-6">
            {/* My registered cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Your Registered Cards</h2>
                <span className="text-xs text-slate-400">
                  Portfolio: <span className="text-emerald-400 font-mono font-bold">{fmtCurrency(totalPortfolioValue)}</span>
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {cards.map(card => {
                  const auth = getAuthenticityScore(card.cardId);
                  return (
                    <button
                      key={card.id}
                      onClick={() => { setSelectedCardId(card.cardId); setSection('timeline'); }}
                      className="text-left bg-slate-900 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Fingerprint size={16} className="text-cyan-400" />
                          <span className="text-sm font-semibold text-white truncate">{card.playerName}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          card.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                          card.status === 'flagged' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {card.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{card.cardDescription}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1"><Hash size={10} />{card.certNumber}</span>
                        <span className="text-slate-500">{card.ownershipHistory.length} owners</span>
                      </div>
                      {/* Auth score bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500">Authenticity</span>
                          <span className={`font-mono font-bold ${scoreColor(auth.overall)}`}>{auth.overall}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${scoreBg(auth.overall)}`} style={{ width: `${auth.overall}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-emerald-400">{fmtCurrency(card.currentValue)}</span>
                        <span className="text-[10px] text-slate-600">Last verified: {fmtDate(card.lastVerified)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Top protected players */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp size={14} className="text-cyan-400" />
                Top Protected Players (Registry-Wide)
              </h3>
              <div className="grid gap-2">
                {stats.topProtectedPlayers.map((p, i) => (
                  <div key={p.player} className="flex items-center gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                    <span className="text-slate-300 flex-1">{p.player}</span>
                    <span className="text-slate-500">{p.cardCount} cards</span>
                    <span className="text-emerald-400 font-mono">{fmtCurrency(p.totalValue)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active fraud alerts preview */}
            {fraudAlerts.filter(a => a.status === 'active').length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-400" />
                  <h2 className="text-lg font-bold text-white">Active Fraud Alerts</h2>
                  <button
                    onClick={() => setSection('fraud')}
                    className="ml-auto text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    View All
                  </button>
                </div>
                {fraudAlerts.filter(a => a.status === 'active').slice(0, 2).map(alert => (
                  <div key={alert.id} className={`p-4 rounded-xl border ${severityStyle(alert.severity)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldAlert size={16} />
                      <span className="text-sm font-semibold text-white">{alert.cardName}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${severityStyle(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{alert.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* VERIFICATION TOOL */}
        {/* ============================================================= */}
        {section === 'verify' && (
          <div className="max-w-3xl space-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white">Verify Before You Buy</h2>
              <p className="text-sm text-slate-400">
                Enter a cert number or listing URL to check the card against the provenance registry and fraud database.
              </p>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Enter cert number or listing URL..."
                    value={verifyQuery}
                    onChange={e => setVerifyQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleVerify()}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <button
                  onClick={handleVerify}
                  disabled={verifyLoading || !verifyQuery.trim()}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  {verifyLoading ? 'Scanning...' : 'Verify'}
                </button>
              </div>
              <p className="text-[10px] text-slate-600">
                Try: &quot;78452310&quot; (fraud example) or &quot;45892341&quot; (clean example)
              </p>
            </div>

            {verifyResult && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Recommendation */}
                <div className={`p-5 rounded-xl border ${recStyle[verifyResult.recommendation].bg}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {verifyResult.verified ? <ShieldCheck size={28} className="text-emerald-400" /> : <ShieldAlert size={28} className="text-red-400" />}
                    <div>
                      <p className={`text-xl font-bold ${recStyle[verifyResult.recommendation].text}`}>
                        {recStyle[verifyResult.recommendation].label}
                      </p>
                      <p className="text-sm text-slate-400">
                        Authenticity Score: <span className={`font-mono font-bold ${scoreColor(verifyResult.authenticityScore)}`}>{verifyResult.authenticityScore}%</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300">{verifyResult.summary}</p>
                </div>

                {/* Fraud flags */}
                {verifyResult.fraudFlags.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Fraud Flags
                    </h3>
                    {verifyResult.fraudFlags.map(flag => (
                      <div key={flag.id} className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-2">
                        <p className="text-sm font-semibold text-white">{flag.cardName}</p>
                        <p className="text-xs text-slate-400">{flag.description}</p>
                        <div className="space-y-1">
                          {flag.evidence.map((ev, i) => (
                            <p key={i} className="text-[11px] text-red-400/70 flex items-start gap-1.5">
                              <span className="mt-0.5">•</span> {ev}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cross-platform sightings */}
                {verifyResult.crossPlatformSightings.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Cross-Platform Sightings</h3>
                    {verifyResult.crossPlatformSightings.map(sight => (
                      <div key={sight.id} className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                        sight.flagged ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-900 border-slate-700'
                      }`}>
                        <MapPin size={16} className={sight.flagged ? 'text-red-400' : 'text-slate-400'} />
                        <div className="flex-1">
                          <p className="text-white font-medium">{sight.platform}</p>
                          <p className="text-xs text-slate-500">Seller: {sight.sellerName} ({sight.sellerRating}%)</p>
                        </div>
                        <span className="font-mono">{fmtCurrency(sight.price)}</span>
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                          sight.flagged ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {sight.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Provenance snippet */}
                {verifyResult.provenanceTimeline.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Provenance History</h3>
                    {verifyResult.provenanceTimeline.map(ev => (
                      <div key={ev.id} className="flex items-center gap-3 p-2 text-sm">
                        <span className="text-base">{eventIcon(ev.eventType)}</span>
                        <span className="text-slate-300 capitalize">{ev.eventType}</span>
                        <span className="text-slate-600">on</span>
                        <span className="text-slate-400">{ev.platform}</span>
                        {ev.price != null && <span className="text-emerald-400 font-mono">{fmtCurrency(ev.price)}</span>}
                        <span className="text-xs text-slate-500 ml-auto">{fmtDate(ev.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* PROVENANCE TIMELINE */}
        {/* ============================================================= */}
        {section === 'timeline' && (
          <div className="space-y-6">
            {/* Card selector */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {cards.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCardId(c.cardId)}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                    (selectedCardId ?? cards[0]?.cardId) === c.cardId
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  {c.playerName}
                </button>
              ))}
            </div>

            {selectedCard && (
              <>
                {/* Card header */}
                <div className="flex items-center gap-4 p-5 bg-slate-900 border border-slate-700 rounded-xl">
                  <div className="p-3 bg-cyan-500/10 rounded-xl">
                    <Fingerprint size={28} className="text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-white">{selectedCard.cardDescription}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Hash size={10} /> Cert #{selectedCard.certNumber}</span>
                      <span>{selectedCard.ownershipHistory.length} owners</span>
                      <span>Current: {fmtCurrency(selectedCard.currentValue)}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className={`text-2xl font-mono font-bold ${scoreColor(selectedCard.authenticityScore)}`}>
                      {selectedCard.authenticityScore}%
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      selectedCard.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {selectedCard.status}
                    </span>
                  </div>
                </div>

                {/* Authenticity breakdown */}
                {selectedAuth && (
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck size={14} className="text-cyan-400" />
                      Authenticity Score Breakdown
                    </h3>
                    <div className="space-y-3">
                      {selectedAuth.breakdown.map(b => (
                        <div key={b.category} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300">{b.category} <span className="text-slate-600">({(b.weight * 100).toFixed(0)}%)</span></span>
                            <span className={`font-mono font-bold ${scoreColor(b.score)}`}>{b.score}</span>
                          </div>
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreBg(b.score)}`} style={{ width: `${b.score}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-500">{b.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visual timeline */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock size={14} className="text-cyan-400" />
                    Provenance Timeline
                  </h3>
                  <div className="relative pl-8">
                    <div className="absolute left-[15px] top-3 bottom-3 w-px bg-slate-700" />
                    {selectedCard.provenanceTimeline.map((event, idx) => (
                      <div key={event.id} className="relative flex items-start gap-4 py-3">
                        <div className={`absolute left-[-17px] w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                          idx === selectedCard.provenanceTimeline.length - 1
                            ? 'bg-cyan-500/20 border-cyan-500'
                            : 'bg-slate-800 border-slate-600'
                        }`}>
                          <span>{eventIcon(event.eventType)}</span>
                        </div>
                        <div className="flex-1 ml-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white capitalize">{event.eventType}</span>
                            <span className="text-xs text-slate-500">on {event.platform}</span>
                            {event.verified && <CheckCircle2 size={12} className="text-emerald-400" />}
                            {event.transactionRef && (
                              <span className="text-[10px] text-slate-600 font-mono">{event.transactionRef}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Calendar size={10} /> {fmtFullDate(event.timestamp)}</span>
                            {event.price != null && (
                              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                                <DollarSign size={10} /> {fmtCurrency(event.price)}
                              </span>
                            )}
                          </div>
                          {event.fromOwner && event.toOwner && (
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              {event.fromOwner} <ArrowRight size={10} /> {event.toOwner}
                            </p>
                          )}
                          {event.notes && <p className="text-[10px] text-slate-600 italic mt-0.5">{event.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ownership chain */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">Ownership Chain</h3>
                  <div className="space-y-2">
                    {selectedCard.ownershipHistory.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-sm">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          entry.owner === 'You' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{entry.owner}</p>
                          <p className="text-xs text-slate-500">
                            {fmtFullDate(entry.acquiredDate)}
                            {entry.soldDate ? ` — ${fmtFullDate(entry.soldDate)}` : ' — Present'}
                            <span className="text-slate-600 ml-1">({entry.holdingPeriodDays}d)</span>
                          </p>
                        </div>
                        <div className="text-right text-xs space-y-0.5">
                          {entry.acquiredPrice != null && <p className="text-slate-300 font-mono">Buy: {fmtCurrency(entry.acquiredPrice)}</p>}
                          {entry.soldPrice != null && (
                            <p className={`font-mono ${entry.soldPrice > (entry.acquiredPrice ?? 0) ? 'text-emerald-400' : 'text-red-400'}`}>
                              Sell: {fmtCurrency(entry.soldPrice)}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-slate-600">{entry.platform}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cross-platform sightings */}
                {selectedSightings.length > 0 && (
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Eye size={14} className="text-cyan-400" />
                      Cross-Platform Sightings ({selectedSightings.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedSightings.map(sight => (
                        <div key={sight.id} className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                          sight.flagged ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-800/30 border-slate-700/50'
                        }`}>
                          {sight.flagged ? <AlertTriangle size={14} className="text-red-400" /> : <MapPin size={14} className="text-slate-400" />}
                          <div className="flex-1">
                            <p className="text-white font-medium">{sight.platform}</p>
                            <p className="text-xs text-slate-500">{sight.sellerName} ({sight.sellerRating}%)</p>
                          </div>
                          <span className="font-mono text-slate-300">{fmtCurrency(sight.price)}</span>
                          <span className="text-xs text-slate-500">{fmtDate(sight.listingDate)}</span>
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                            sight.status === 'sold' ? 'bg-slate-500/20 text-slate-400' :
                            sight.flagged ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {sight.status}
                          </span>
                          {sight.flagged && sight.flagReason && (
                            <span className="text-[10px] text-red-400/70 max-w-[200px] truncate">{sight.flagReason}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* FRAUD DETECTION */}
        {/* ============================================================= */}
        {section === 'fraud' && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
                <p className="text-[10px] text-red-400/70 uppercase font-bold mb-1">Active Alerts</p>
                <p className="text-3xl font-bebas text-red-400 tracking-wider">{fraudAlerts.filter(a => a.status === 'active').length}</p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-center">
                <p className="text-[10px] text-amber-400/70 uppercase font-bold mb-1">Investigating</p>
                <p className="text-3xl font-bebas text-amber-400 tracking-wider">{fraudAlerts.filter(a => a.status === 'investigating').length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Alerts</p>
                <p className="text-3xl font-bebas text-white tracking-wider">{fraudAlerts.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Value at Risk</p>
                <p className="text-3xl font-bebas text-red-400 tracking-wider">
                  {fmtCurrency(fraudAlerts.reduce((s, a) => s + a.estimatedValueAtRisk, 0))}
                </p>
              </div>
            </div>

            {/* All alerts */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white">All Fraud Alerts</h2>
              {fraudAlerts.map(alert => {
                const expanded = expandedAlertId === alert.id;
                return (
                  <div key={alert.id} className={`rounded-xl border overflow-hidden ${severityStyle(alert.severity)}`}>
                    <button
                      onClick={() => setExpandedAlertId(expanded ? null : alert.id)}
                      className="w-full text-left flex items-start gap-3 p-4"
                    >
                      {alert.severity === 'critical' ? (
                        <FileWarning size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <ShieldAlert size={20} className="flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-white">{alert.cardName}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${severityStyle(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{fraudTypeLabels[alert.fraudType] ?? alert.fraudType}</p>
                        <p className="text-sm text-slate-400 mt-1">{alert.description}</p>
                      </div>
                      <div className="flex-shrink-0 text-right space-y-1">
                        <p className="text-xs text-slate-400">{fmtFullDate(alert.detectedAt)}</p>
                        <p className="text-sm font-mono text-red-400">{fmtCurrency(alert.estimatedValueAtRisk)}</p>
                        {expanded ? <ChevronUp size={14} className="text-slate-500 ml-auto" /> : <ChevronDown size={14} className="text-slate-500 ml-auto" />}
                      </div>
                    </button>
                    {expanded && (
                      <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <MapPin size={12} /> Platforms: {alert.platforms.join(', ')}
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Evidence</p>
                          {alert.evidence.map((ev, i) => (
                            <p key={i} className="text-[11px] text-slate-400 flex items-start gap-2">
                              <span className="text-red-400/70 mt-0.5">•</span> {ev}
                            </p>
                          ))}
                        </div>
                        <span className={`inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                          alert.status === 'active' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                          alert.status === 'investigating' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}>
                          Status: {alert.status}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Known patterns */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">Known Counterfeit Patterns</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { pattern: 'Fake PSA slabs with wrong font weight on label', frequency: 'Common', era: '2020+' },
                  { pattern: 'BGS hologram rotation angle off by >5 degrees', frequency: 'Moderate', era: '2018+' },
                  { pattern: 'Trimmed Prizm base cards narrower by 0.1-0.3mm', frequency: 'Increasing', era: '2019+' },
                  { pattern: 'Re-holdered lower grades in counterfeit PSA 10 slabs', frequency: 'Common', era: 'All' },
                  { pattern: 'Duplicate cert numbers on eBay from new accounts', frequency: 'Very Common', era: 'All' },
                  { pattern: 'Color-shifted reprints sold as "error cards"', frequency: 'Moderate', era: '2015+' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs">
                    <FileWarning size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-300">{item.pattern}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Frequency: <span className="text-amber-400">{item.frequency}</span> | Era: {item.era}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* REGISTER */}
        {/* ============================================================= */}
        {section === 'register' && (
          <div className="max-w-2xl space-y-6">
            {regSubmitted ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center animate-in fade-in duration-300">
                <div className="p-5 bg-emerald-500/10 rounded-2xl">
                  <CheckCircle2 size={48} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Card Registered Successfully</h2>
                <p className="text-sm text-slate-400 max-w-md">
                  Your Digital Twin has been created. Fingerprint analysis is processing and your card
                  is now protected by the MSI Provenance Chain registry.
                </p>
                <button
                  onClick={() => {
                    setRegSubmitted(false);
                    setRegForm({ playerName: '', cardDescription: '', year: '', manufacturer: '', setName: '', cardNumber: '', grade: '', gradingCompany: '', certNumber: '', currentValue: '' });
                  }}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors"
                >
                  Register Another
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                  <Scan size={24} className="text-cyan-400" />
                  <div>
                    <p className="text-lg font-bold text-white">Create Digital Twin</p>
                    <p className="text-sm text-slate-400">
                      Upload images and enter card details to generate a unique fingerprint and register on the provenance chain.
                    </p>
                  </div>
                </div>

                {/* Image upload */}
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-cyan-500/50 transition-colors cursor-pointer">
                  <Upload size={32} className="text-slate-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Drag &amp; drop card images or click to browse</p>
                  <p className="text-xs text-slate-600 mt-1">High-res front &amp; back recommended for best fingerprint accuracy</p>
                </div>

                {/* Form */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'playerName', label: 'Player Name', placeholder: 'e.g., Aaron Judge', required: true, span: 1 },
                    { key: 'cardDescription', label: 'Card Description', placeholder: 'e.g., 2017 Topps Chrome Update #HMT40 RC PSA 10', required: true, span: 2 },
                    { key: 'year', label: 'Year', placeholder: '2017', required: false, span: 1 },
                    { key: 'manufacturer', label: 'Manufacturer', placeholder: 'e.g., Topps', required: false, span: 1 },
                    { key: 'setName', label: 'Set Name', placeholder: 'e.g., Chrome Update', required: false, span: 1 },
                    { key: 'cardNumber', label: 'Card Number', placeholder: 'e.g., HMT40', required: false, span: 1 },
                    { key: 'grade', label: 'Grade', placeholder: 'e.g., PSA 10', required: false, span: 1 },
                    { key: 'gradingCompany', label: 'Grading Company', placeholder: 'PSA, BGS, SGC...', required: false, span: 1 },
                    { key: 'certNumber', label: 'Cert Number', placeholder: 'e.g., 45892341', required: false, span: 1 },
                    { key: 'currentValue', label: 'Estimated Value ($)', placeholder: 'e.g., 3500', required: false, span: 1 },
                  ].map(f => (
                    <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                      <label className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1.5">
                        {f.label} {f.required && <span className="text-red-400">*</span>}
                      </label>
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={(regForm as Record<string, string>)[f.key]}
                        onChange={e => setRegForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleRegister}
                  disabled={!regForm.playerName || !regForm.cardDescription}
                  className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
                >
                  <Fingerprint size={18} />
                  Register &amp; Create Digital Twin
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProvenanceChainIntelligence;
