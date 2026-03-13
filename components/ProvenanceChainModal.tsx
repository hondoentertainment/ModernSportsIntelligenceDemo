import React, { useState, useMemo } from 'react';
import {
  X,
  Fingerprint,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Upload,
  Eye,
  TrendingUp,
  TrendingDown,
  MapPin,
  Hash,
  Calendar,
  DollarSign,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileWarning,
  Scan,
} from 'lucide-react';
import {
  getMyRegisteredCards,
  getRegistryStats,
  getFraudAlerts,
  getAuthenticityScore,
  getCrossPlatformSightings,
  verifyBeforePurchase,
  registerCard,
  type DigitalTwin,
  type ProvenanceRecord,
  type FraudAlert,
  type CrossPlatformSighting,
  type AuthenticityScore,
  type VerificationResult,
} from '../lib/provenanceChainService.ts';

type TabId = 'registry' | 'verify' | 'timeline' | 'fraud' | 'register';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function fmtFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function scoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-red-400';
}

function scoreBgColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500/20 text-emerald-400';
  if (score >= 70) return 'bg-amber-500/20 text-amber-400';
  return 'bg-red-500/20 text-red-400';
}

function severityColor(sev: string): string {
  switch (sev) {
    case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

function eventIcon(eventType: string): string {
  switch (eventType) {
    case 'registered': return '📋';
    case 'sold': return '💰';
    case 'listed': return '🏷️';
    case 'graded': return '🏅';
    case 'authenticated': return '✅';
    case 'transferred': return '🔄';
    case 'vaulted': return '🔒';
    case 'exhibited': return '🖼️';
    case 'flagged': return '🚩';
    default: return '📌';
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const ScoreBar: React.FC<{ label: string; score: number; weight: number; notes: string }> = ({ label, score, weight, notes }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-300">{label} <span className="text-slate-600">({(weight * 100).toFixed(0)}%)</span></span>
      <span className={`font-mono font-bold ${scoreColor(score)}`}>{score}</span>
    </div>
    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${score >= 90 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
        style={{ width: `${score}%` }}
      />
    </div>
    <p className="text-[10px] text-slate-500">{notes}</p>
  </div>
);

// ---------------------------------------------------------------------------
// Registry Tab
// ---------------------------------------------------------------------------

const RegistryTab: React.FC<{ cards: DigitalTwin[]; onSelectCard: (id: string) => void }> = ({ cards, onSelectCard }) => {
  const stats = getRegistryStats();
  const totalValue = cards.reduce((s, c) => s + c.currentValue, 0);

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'My Cards', value: cards.length.toString(), color: 'text-cyan-400' },
          { label: 'Value Protected', value: fmtCurrency(totalValue), color: 'text-emerald-400' },
          { label: 'Avg Auth Score', value: `${stats.averageAuthenticityScore}%`, color: 'text-amber-400' },
          { label: 'Verifications', value: stats.verificationsThisMonth.toString(), color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">{s.label}</p>
            <p className={`text-lg font-bebas tracking-wider ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Card list */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Your Registered Cards</p>
        {cards.map(card => {
          const auth = getAuthenticityScore(card.cardId);
          return (
            <button
              key={card.id}
              onClick={() => onSelectCard(card.cardId)}
              className="w-full text-left flex items-center gap-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-colors"
            >
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Fingerprint size={18} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{card.playerName}</p>
                <p className="text-xs text-slate-400 truncate">{card.cardDescription}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Hash size={9} /> {card.certNumber}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={9} /> {card.ownershipHistory.length} owners
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 space-y-1">
                <p className={`text-sm font-mono font-bold ${scoreColor(auth.overall)}`}>{auth.overall}%</p>
                <p className="text-xs text-slate-400">{fmtCurrency(card.currentValue)}</p>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  card.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                  card.status === 'flagged' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {card.status}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Verify Tab
// ---------------------------------------------------------------------------

const VerifyTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [searching, setSearching] = useState(false);

  const handleVerify = () => {
    if (!query.trim()) return;
    setSearching(true);
    // Simulate async lookup
    setTimeout(() => {
      setResult(verifyBeforePurchase(query));
      setSearching(false);
    }, 800);
  };

  const recommendationStyle: Record<string, { bg: string; text: string; label: string }> = {
    safe_to_buy: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: 'Safe to Buy' },
    proceed_with_caution: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: 'Proceed with Caution' },
    do_not_buy: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', label: 'Do NOT Buy' },
    needs_investigation: { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400', label: 'Needs Investigation' },
  };

  return (
    <div className="space-y-4">
      {/* Search box */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Verify Before You Buy</p>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Enter cert number or listing URL..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={searching || !query.trim()}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-bold rounded-xl transition-colors"
          >
            {searching ? 'Scanning...' : 'Verify'}
          </button>
        </div>
        <p className="text-[10px] text-slate-600">
          Try: &quot;78452310&quot; (fraud example) or &quot;45892341&quot; (clean example)
        </p>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Recommendation banner */}
          <div className={`p-4 rounded-xl border ${recommendationStyle[result.recommendation].bg}`}>
            <div className="flex items-center gap-3 mb-2">
              {result.verified ? (
                <ShieldCheck size={24} className="text-emerald-400" />
              ) : (
                <ShieldAlert size={24} className="text-red-400" />
              )}
              <div>
                <p className={`text-lg font-bold ${recommendationStyle[result.recommendation].text}`}>
                  {recommendationStyle[result.recommendation].label}
                </p>
                <p className="text-xs text-slate-400">
                  Authenticity Score: <span className={`font-mono font-bold ${scoreColor(result.authenticityScore)}`}>{result.authenticityScore}%</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-300">{result.summary}</p>
          </div>

          {/* Fraud flags */}
          {result.fraudFlags.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1">
                <AlertTriangle size={10} /> Fraud Flags
              </p>
              {result.fraudFlags.map(flag => (
                <div key={flag.id} className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-red-400" />
                    <span className="text-white font-medium">{flag.cardName}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${severityColor(flag.severity)}`}>
                      {flag.severity}
                    </span>
                  </div>
                  <p className="text-slate-400">{flag.description}</p>
                  <div className="space-y-1">
                    {flag.evidence.map((ev, i) => (
                      <p key={i} className="text-[10px] text-red-400/70 flex items-start gap-1.5">
                        <span className="mt-0.5">•</span> {ev}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cross-platform sightings */}
          {result.crossPlatformSightings.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Cross-Platform Sightings</p>
              {result.crossPlatformSightings.map(sight => (
                <div key={sight.id} className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${
                  sight.flagged ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-800/30 border-slate-700/50'
                }`}>
                  <MapPin size={14} className={sight.flagged ? 'text-red-400' : 'text-slate-400'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{sight.platform}</p>
                    <p className="text-[10px] text-slate-500">Seller: {sight.sellerName}</p>
                  </div>
                  <span className={`font-mono ${sight.flagged ? 'text-red-400' : 'text-emerald-400'}`}>
                    {fmtCurrency(sight.price)}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    sight.status === 'sold' ? 'bg-slate-500/20 text-slate-400' :
                    sight.flagged ? 'bg-red-500/20 text-red-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {sight.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Provenance timeline snippet */}
          {result.provenanceTimeline.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Provenance History</p>
              {result.provenanceTimeline.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 p-2 text-xs">
                  <span className="text-base">{eventIcon(ev.eventType)}</span>
                  <div className="flex-1">
                    <span className="text-slate-300 capitalize">{ev.eventType}</span>
                    <span className="text-slate-600 mx-1">on</span>
                    <span className="text-slate-400">{ev.platform}</span>
                    {ev.price != null && <span className="text-emerald-400 ml-2">{fmtCurrency(ev.price)}</span>}
                  </div>
                  <span className="text-[10px] text-slate-500">{fmtDate(ev.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Timeline Tab
// ---------------------------------------------------------------------------

const TimelineTab: React.FC<{ selectedCardId: string | null; cards: DigitalTwin[] }> = ({ selectedCardId, cards }) => {
  const [activeCardId, setActiveCardId] = useState(selectedCardId ?? cards[0]?.cardId ?? '');
  const card = cards.find(c => c.cardId === activeCardId);

  if (!card) {
    return <p className="text-sm text-slate-400 text-center py-8">No cards registered. Register a card first.</p>;
  }

  const sightings = getCrossPlatformSightings(card.certNumber ?? '');

  return (
    <div className="space-y-4">
      {/* Card selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {cards.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCardId(c.cardId)}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeCardId === c.cardId ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            {c.playerName}
          </button>
        ))}
      </div>

      {/* Card header */}
      <div className="flex items-center gap-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
        <div className="p-3 bg-cyan-500/10 rounded-xl">
          <Fingerprint size={24} className="text-cyan-400" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">{card.cardDescription}</p>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
            <span>Cert #{card.certNumber}</span>
            <span>|</span>
            <span>{card.ownershipHistory.length} owners</span>
            <span>|</span>
            <span>Current value: {fmtCurrency(card.currentValue)}</span>
          </div>
        </div>
        <div className={`text-xl font-mono font-bold ${scoreColor(card.authenticityScore)}`}>
          {card.authenticityScore}%
        </div>
      </div>

      {/* Visual timeline */}
      <div className="space-y-1">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Provenance Timeline</p>
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-700" />
          {card.provenanceTimeline.map((event, idx) => (
            <div key={event.id} className="relative flex items-start gap-3 py-3">
              <div className={`absolute left-[-13px] w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${
                idx === card.provenanceTimeline.length - 1
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                  : 'bg-slate-800 border-slate-600 text-slate-400'
              }`}>
                <span>{eventIcon(event.eventType)}</span>
              </div>
              <div className="flex-1 ml-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white capitalize">{event.eventType}</span>
                  <span className="text-xs text-slate-500">on {event.platform}</span>
                  {event.verified && <CheckCircle2 size={12} className="text-emerald-400" />}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <Calendar size={10} /> {fmtFullDate(event.timestamp)}
                  {event.price != null && (
                    <>
                      <DollarSign size={10} className="ml-2" />
                      <span className="text-emerald-400 font-mono">{fmtCurrency(event.price)}</span>
                    </>
                  )}
                </div>
                {event.fromOwner && event.toOwner && (
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    {event.fromOwner} <ArrowRight size={8} /> {event.toOwner}
                  </p>
                )}
                {event.notes && (
                  <p className="text-[10px] text-slate-600 italic mt-0.5">{event.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ownership chain */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Ownership Chain</p>
        {card.ownershipHistory.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              entry.owner === 'You' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400'
            }`}>
              {idx + 1}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{entry.owner}</p>
              <p className="text-[10px] text-slate-500">
                {fmtFullDate(entry.acquiredDate)}
                {entry.soldDate ? ` — ${fmtFullDate(entry.soldDate)}` : ' — Present'}
                <span className="text-slate-600 ml-1">({entry.holdingPeriodDays}d)</span>
              </p>
            </div>
            <div className="text-right">
              {entry.acquiredPrice != null && (
                <p className="text-slate-300 font-mono">Bought: {fmtCurrency(entry.acquiredPrice)}</p>
              )}
              {entry.soldPrice != null && (
                <p className={`font-mono ${entry.soldPrice > (entry.acquiredPrice ?? 0) ? 'text-emerald-400' : 'text-red-400'}`}>
                  Sold: {fmtCurrency(entry.soldPrice)}
                </p>
              )}
            </div>
            <span className="text-[10px] text-slate-600">{entry.platform}</span>
          </div>
        ))}
      </div>

      {/* Cross-platform sightings */}
      {sightings.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Cross-Platform Sightings ({sightings.length})
          </p>
          {sightings.map(sight => (
            <div key={sight.id} className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${
              sight.flagged ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-800/30 border-slate-700/50'
            }`}>
              {sight.flagged ? (
                <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
              ) : (
                <Eye size={14} className="text-slate-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{sight.platform}</p>
                <p className="text-[10px] text-slate-500">{sight.sellerName} ({sight.sellerRating}%)</p>
              </div>
              <span className="font-mono text-slate-300">{fmtCurrency(sight.price)}</span>
              <span className="text-[10px] text-slate-500">{fmtDate(sight.listingDate)}</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                sight.status === 'sold' ? 'bg-slate-500/20 text-slate-400' :
                sight.flagged ? 'bg-red-500/20 text-red-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {sight.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Fraud Detection Tab
// ---------------------------------------------------------------------------

const FraudTab: React.FC = () => {
  const alerts = getFraudAlerts();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fraudTypeLabels: Record<string, string> = {
    duplicate_listing: 'Duplicate Listing',
    cert_mismatch: 'Cert # Mismatch',
    grade_appearance_mismatch: 'Grade/Appearance Mismatch',
    counterfeit_slab: 'Counterfeit Slab',
    trimmed_card: 'Trimmed Card',
    resubmission_fraud: 'Resubmission Fraud',
    stolen_card: 'Stolen Card',
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-center">
          <p className="text-[10px] text-red-400/70 uppercase font-bold mb-1">Active Alerts</p>
          <p className="text-2xl font-bebas text-red-400 tracking-wider">{alerts.filter(a => a.status === 'active').length}</p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-center">
          <p className="text-[10px] text-amber-400/70 uppercase font-bold mb-1">Investigating</p>
          <p className="text-2xl font-bebas text-amber-400 tracking-wider">{alerts.filter(a => a.status === 'investigating').length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Value at Risk</p>
          <p className="text-2xl font-bebas text-white tracking-wider">
            {fmtCurrency(alerts.reduce((s, a) => s + a.estimatedValueAtRisk, 0))}
          </p>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">All Fraud Alerts</p>
        {alerts.map(alert => {
          const expanded = expandedId === alert.id;
          return (
            <div key={alert.id} className={`rounded-xl border overflow-hidden ${severityColor(alert.severity)}`}>
              <button
                onClick={() => setExpandedId(expanded ? null : alert.id)}
                className="w-full text-left flex items-start gap-3 p-4"
              >
                {alert.severity === 'critical' ? (
                  <FileWarning size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white truncate">{alert.cardName}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${severityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{fraudTypeLabels[alert.fraudType] ?? alert.fraudType}</p>
                  <p className="text-xs text-slate-500 mt-1">{alert.description}</p>
                </div>
                <div className="flex-shrink-0 text-right space-y-1">
                  <p className="text-xs text-slate-400">{fmtFullDate(alert.detectedAt)}</p>
                  <p className="text-xs font-mono text-red-400">{fmtCurrency(alert.estimatedValueAtRisk)}</p>
                  {expanded ? <ChevronUp size={14} className="text-slate-500 ml-auto" /> : <ChevronDown size={14} className="text-slate-500 ml-auto" />}
                </div>
              </button>
              {expanded && (
                <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin size={12} />
                    Platforms: {alert.platforms.join(', ')}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Evidence</p>
                    {alert.evidence.map((ev, i) => (
                      <p key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                        <span className="text-red-400/70 mt-0.5">•</span> {ev}
                      </p>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                      alert.status === 'active' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                      alert.status === 'investigating' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/30'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Register Tab
// ---------------------------------------------------------------------------

const RegisterTab: React.FC = () => {
  const [form, setForm] = useState({
    playerName: '',
    cardDescription: '',
    year: '',
    manufacturer: '',
    setName: '',
    cardNumber: '',
    grade: '',
    gradingCompany: '',
    certNumber: '',
    currentValue: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleRegister = () => {
    if (!form.playerName || !form.cardDescription) return;
    registerCard(
      {
        playerName: form.playerName,
        cardDescription: form.cardDescription,
        year: parseInt(form.year) || new Date().getFullYear(),
        manufacturer: form.manufacturer,
        setName: form.setName,
        cardNumber: form.cardNumber,
        grade: form.grade || undefined,
        gradingCompany: form.gradingCompany || undefined,
        certNumber: form.certNumber || undefined,
        currentValue: parseFloat(form.currentValue) || undefined,
      },
      []
    );
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center animate-in fade-in duration-300">
        <div className="p-4 bg-emerald-500/10 rounded-2xl">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Card Registered Successfully</h3>
        <p className="text-sm text-slate-400 max-w-md">
          Your Digital Twin has been created. The fingerprint analysis is processing and your card
          is now protected by the MSI Provenance Chain registry.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ playerName: '', cardDescription: '', year: '', manufacturer: '', setName: '', cardNumber: '', grade: '', gradingCompany: '', certNumber: '', currentValue: '' }); }}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-xl transition-colors"
        >
          Register Another
        </button>
      </div>
    );
  }

  const fields = [
    { key: 'playerName', label: 'Player Name', placeholder: 'e.g., Aaron Judge', required: true },
    { key: 'cardDescription', label: 'Card Description', placeholder: 'e.g., 2017 Topps Chrome Update #HMT40 RC PSA 10', required: true },
    { key: 'year', label: 'Year', placeholder: '2017', required: false },
    { key: 'manufacturer', label: 'Manufacturer', placeholder: 'e.g., Topps', required: false },
    { key: 'setName', label: 'Set Name', placeholder: 'e.g., Chrome Update', required: false },
    { key: 'cardNumber', label: 'Card Number', placeholder: 'e.g., HMT40', required: false },
    { key: 'grade', label: 'Grade', placeholder: 'e.g., PSA 10', required: false },
    { key: 'gradingCompany', label: 'Grading Company', placeholder: 'PSA, BGS, SGC...', required: false },
    { key: 'certNumber', label: 'Cert Number', placeholder: 'e.g., 45892341', required: false },
    { key: 'currentValue', label: 'Estimated Value ($)', placeholder: 'e.g., 3500', required: false },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
        <Scan size={20} className="text-cyan-400" />
        <div>
          <p className="text-sm font-semibold text-white">Create Digital Twin</p>
          <p className="text-xs text-slate-400">
            Upload images and enter card details to generate a unique fingerprint and register on the provenance chain.
          </p>
        </div>
      </div>

      {/* Image upload placeholder */}
      <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-colors cursor-pointer">
        <Upload size={28} className="text-slate-500 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Drag &amp; drop card images or click to browse</p>
        <p className="text-[10px] text-slate-600 mt-1">High-res front &amp; back for best fingerprint accuracy</p>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-2 gap-3">
        {fields.map(f => (
          <div key={f.key} className={f.key === 'cardDescription' ? 'col-span-2' : ''}>
            <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
              {f.label} {f.required && <span className="text-red-400">*</span>}
            </label>
            <input
              type="text"
              placeholder={f.placeholder}
              value={(form as Record<string, string>)[f.key]}
              onChange={e => update(f.key, e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleRegister}
        disabled={!form.playerName || !form.cardDescription}
        className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Fingerprint size={16} />
        Register &amp; Create Digital Twin
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Modal
// ---------------------------------------------------------------------------

const ProvenanceChainModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<TabId>('registry');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  if (!isOpen) return null;

  const cards = getMyRegisteredCards();
  const stats = getRegistryStats();

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'registry', label: 'Registry', icon: <Shield size={14} /> },
    { id: 'verify', label: 'Verify', icon: <Search size={14} /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock size={14} /> },
    { id: 'fraud', label: 'Fraud Detection', icon: <ShieldAlert size={14} /> },
    { id: 'register', label: 'Register', icon: <Fingerprint size={14} /> },
  ];

  const handleSelectCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setTab('timeline');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Separated Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl">
              <Fingerprint size={22} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Card DNA &amp; Provenance Chain</h2>
              <p className="text-xs text-slate-400">Carfax for Sports Cards — Cross-platform tracking &amp; fraud detection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-5 gap-3 p-4 bg-slate-800/30">
          {[
            { label: 'Registered', value: stats.totalCardsRegistered.toLocaleString(), color: 'text-cyan-400' },
            { label: 'Fraud Stopped', value: stats.fraudPrevented.toString(), color: 'text-emerald-400' },
            { label: 'Value Protected', value: fmtCurrency(stats.valueProtected), color: 'text-amber-400' },
            { label: 'Active Alerts', value: stats.activeFraudAlerts.toString(), color: 'text-red-400' },
            { label: 'Avg Auth Score', value: `${stats.averageAuthenticityScore}%`, color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/50 rounded-lg p-2.5 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">{s.label}</p>
              <p className={`text-lg font-bebas tracking-wider ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-0 border-b border-slate-800">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
                tab === t.id
                  ? 'bg-slate-800/50 text-cyan-300 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {tab === 'registry' && <RegistryTab cards={cards} onSelectCard={handleSelectCard} />}
          {tab === 'verify' && <VerifyTab />}
          {tab === 'timeline' && <TimelineTab selectedCardId={selectedCardId} cards={cards} />}
          {tab === 'fraud' && <FraudTab />}
          {tab === 'register' && <RegisterTab />}
        </div>
      </div>
    </div>
  );
};

export default ProvenanceChainModal;
