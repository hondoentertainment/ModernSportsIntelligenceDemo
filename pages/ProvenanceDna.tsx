import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Fingerprint,
  Upload,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Database,
  GitCompareArrows,
  BarChart3,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Zap,
  Target,
  Scan,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from 'recharts';
import {
  scanCardFingerprint,
  searchForMatches,
  getOwnershipChain,
  getProvenanceScore,
  getFingerprintDatabase,
  compareFingerprints,
  registerFingerprint,
  detectCounterfeit,
  getDatabaseStats,
  type CardFingerprint,
  type FingerprintMatch,
  type FingerprintScanResult,
  type OwnershipChainEntry,
  type ProvenanceScore,
  type FingerprintComparison,
  type CounterfeitResult,
} from '../lib/core/provenanceDnaService.ts';

type TabId = 'scan' | 'database' | 'compare' | 'stats';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'scan', label: 'Scan & Analyze', icon: <Scan size={14} /> },
  { id: 'database', label: 'Database', icon: <Database size={14} /> },
  { id: 'compare', label: 'Compare', icon: <GitCompareArrows size={14} /> },
  { id: 'stats', label: 'Statistics', icon: <BarChart3 size={14} /> },
];

const VENUE_LABELS: Record<string, string> = {
  ebay: 'eBay',
  card_show: 'Card Show',
  private_sale: 'Private Sale',
  auction_house: 'Auction House',
  lcs: 'Local Card Shop',
};

const VENUE_COLORS: Record<string, string> = {
  ebay: 'text-blue-400',
  card_show: 'text-purple-400',
  private_sale: 'text-amber-400',
  auction_house: 'text-emerald-400',
  lcs: 'text-rose-400',
};

function GradeBadge({ grade }: { grade: string }) {
  const color =
    grade.startsWith('A') ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
    grade.startsWith('B') ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
    grade === 'C' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
    'bg-red-500/20 text-red-400 border-red-500/30';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-sm font-bold border ${color}`}>
      {grade}
    </span>
  );
}

const ProvenanceDna: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('scan');
  const [loading, setLoading] = useState(true);
  const [database, setDatabase] = useState<CardFingerprint[]>([]);
  const [dbSearch, setDbSearch] = useState('');

  // Scan state
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<FingerprintScanResult | null>(null);
  const [matches, setMatches] = useState<FingerprintMatch[]>([]);
  const [searchingMatches, setSearchingMatches] = useState(false);
  const [selectedFingerprintId, setSelectedFingerprintId] = useState<string | null>(null);
  const [ownershipChain, setOwnershipChain] = useState<OwnershipChainEntry[]>([]);
  const [provenanceScore, setProvenanceScore] = useState<ProvenanceScore | null>(null);
  const [counterfeitResult, setCounterfeitResult] = useState<CounterfeitResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Compare state
  const [compareA, setCompareA] = useState<string>('');
  const [compareB, setCompareB] = useState<string>('');
  const [comparison, setComparison] = useState<FingerprintComparison | null>(null);

  useEffect(() => {
    try {
      setDatabase(getFingerprintDatabase());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const stats = useMemo(() => getDatabaseStats(), []);

  const filteredDb = useMemo(() => {
    if (!dbSearch.trim()) return database;
    const q = dbSearch.toLowerCase();
    return database.filter(
      (fp) =>
        fp.cardName.toLowerCase().includes(q) ||
        fp.player.toLowerCase().includes(q) ||
        fp.fingerprintHash.includes(q)
    );
  }, [database, dbSearch]);

  const handleScan = useCallback(async () => {
    setScanning(true);
    setScanProgress(0);
    setScanResult(null);
    setMatches([]);
    setSelectedFingerprintId(null);
    setOwnershipChain([]);
    setProvenanceScore(null);
    setCounterfeitResult(null);

    // Animate progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) { clearInterval(interval); return 95; }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const result = await scanCardFingerprint('mock-image-data');
      clearInterval(interval);
      setScanProgress(100);
      setScanResult(result);
      registerFingerprint(result.fingerprint);
      setDatabase(getFingerprintDatabase());

      // Auto-detect counterfeit
      setCounterfeitResult(detectCounterfeit(result.fingerprint));

      // Auto-search matches
      setSearchingMatches(true);
      const foundMatches = await searchForMatches(result.fingerprint);
      setMatches(foundMatches);
      setSearchingMatches(false);
    } catch {
      clearInterval(interval);
    } finally {
      setScanning(false);
    }
  }, []);

  const handleSelectFingerprint = useCallback((fpId: string) => {
    setSelectedFingerprintId(fpId);
    setOwnershipChain(getOwnershipChain(fpId));
    setProvenanceScore(getProvenanceScore(fpId));

    const fp = getFingerprintDatabase().find((f) => f.id === fpId);
    if (fp) setCounterfeitResult(detectCounterfeit(fp));
  }, []);

  const handleCompare = useCallback(() => {
    if (!compareA || !compareB) return;
    setComparison(compareFingerprints(compareA, compareB));
  }, [compareA, compareB]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleScan();
    },
    [handleScan]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Provenance DNA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-lime/10 rounded-xl text-brand-lime">
            <Fingerprint size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-bebas tracking-widest text-white">
              Provenance <span className="text-brand-lime">DNA</span> Fingerprinting
            </h1>
            <p className="text-sm text-slate-400">
              AI-powered micro-surface analysis &mdash; recognize any card, anywhere, years later
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Database size={14} />
          <span>{database.length} cards fingerprinted</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 rounded-2xl p-1 border border-slate-700/50">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-brand-lime/10 text-brand-lime'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========== SCAN TAB ========== */}
      {activeTab === 'scan' && (
        <div className="space-y-6">
          {/* Scan Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-brand-lime bg-brand-lime/5'
                : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'
            }`}
            onClick={!scanning ? handleScan : undefined}
          >
            {scanning ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto relative">
                  <Scan size={40} className="text-brand-lime animate-pulse mx-auto" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Analyzing micro-surface patterns...</p>
                  <p className="text-xs text-slate-400">Mapping print dots, centering offsets, edge wear profiles</p>
                </div>
                <div className="max-w-md mx-auto">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-brand-lime h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(scanProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{Math.round(scanProgress)}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload size={40} className="mx-auto text-slate-500" />
                <div>
                  <p className="text-white font-semibold">Drop a card image or click to scan</p>
                  <p className="text-xs text-slate-400 mt-1">
                    High-res scan recommended (600+ DPI) for best fingerprint extraction
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Scan Result */}
          {scanResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Fingerprint Details */}
              <div className="space-y-4">
                {/* Fingerprint Header */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Fingerprint size={18} className="text-brand-lime" />
                      Fingerprint Extracted
                    </h3>
                    <span className="text-xs text-slate-500">
                      {scanResult.scanDuration}ms &middot; Q{scanResult.qualityScore}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-400 bg-slate-900/50 p-3 rounded-xl break-all mb-3 border border-slate-700/30">
                    {scanResult.fingerprint.fingerprintHash}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bebas tracking-wider text-brand-lime">
                        {scanResult.featuresDetected}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Features</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bebas tracking-wider text-white">
                        {scanResult.fingerprint.uniquenessScore}%
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Unique</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bebas tracking-wider text-white">
                        {(scanResult.fingerprint.printDotDensity * 100).toFixed(0)}%
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Dot Density</p>
                    </div>
                  </div>
                  {scanResult.warnings.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {scanResult.warnings.map((w, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-amber-400">
                          <AlertTriangle size={12} />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Micro-Feature Heatmap */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Target size={14} className="text-brand-lime" />
                    Micro-Feature Map
                  </h3>
                  <div className="relative bg-slate-900 rounded-xl aspect-[3/4] border border-slate-700/30 overflow-hidden">
                    {/* Card outline */}
                    <div className="absolute inset-3 border border-slate-600/40 rounded-lg" />
                    {/* Feature dots */}
                    {scanResult.fingerprint.features.map((f, i) => {
                      const colors: Record<string, string> = {
                        print_dot_cluster: 'bg-brand-lime',
                        surface_anomaly: 'bg-red-400',
                        edge_pattern: 'bg-blue-400',
                        centering_offset: 'bg-amber-400',
                        color_shift: 'bg-purple-400',
                      };
                      const size = Math.max(4, f.magnitude * 12);
                      return (
                        <div
                          key={i}
                          className={`absolute rounded-full ${colors[f.type]} opacity-70`}
                          style={{
                            left: `${f.location.x * 100}%`,
                            top: `${f.location.y * 100}%`,
                            width: `${size}px`,
                            height: `${size}px`,
                            transform: 'translate(-50%, -50%)',
                          }}
                          title={`${f.type} (${(f.magnitude * 100).toFixed(0)}%)`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3 text-[10px]">
                    {[
                      { label: 'Print Dots', color: 'bg-brand-lime' },
                      { label: 'Anomaly', color: 'bg-red-400' },
                      { label: 'Edge', color: 'bg-blue-400' },
                      { label: 'Centering', color: 'bg-amber-400' },
                      { label: 'Color Shift', color: 'bg-purple-400' },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-1 text-slate-400">
                        <div className={`w-2 h-2 rounded-full ${l.color}`} />
                        {l.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Centering & Edge Profile */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                  <h3 className="text-sm font-bold text-white mb-3">Centering & Edge Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Centering Signature</p>
                      {['Top', 'Right', 'Bottom', 'Left'].map((dir, i) => (
                        <div key={dir} className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs text-slate-400 w-12">{dir}</span>
                          <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                            <div
                              className="bg-brand-lime h-1.5 rounded-full"
                              style={{
                                width: `${scanResult.fingerprint.centeringSignature[i] * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-10 text-right">
                            {(scanResult.fingerprint.centeringSignature[i] * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Edge Wear</p>
                      {['Top', 'Right', 'Bottom', 'Left'].map((dir, i) => (
                        <div key={dir} className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs text-slate-400 w-12">{dir}</span>
                          <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                scanResult.fingerprint.edgeProfile[i] > 0.9
                                  ? 'bg-emerald-400'
                                  : scanResult.fingerprint.edgeProfile[i] > 0.75
                                    ? 'bg-amber-400'
                                    : 'bg-red-400'
                              }`}
                              style={{
                                width: `${scanResult.fingerprint.edgeProfile[i] * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-10 text-right">
                            {(scanResult.fingerprint.edgeProfile[i] * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Matches, Ownership, Counterfeit */}
              <div className="space-y-4">
                {/* Counterfeit Detection */}
                {counterfeitResult && (
                  <div
                    className={`rounded-2xl p-5 border ${
                      counterfeitResult.isAuthentic
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : 'bg-red-500/5 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {counterfeitResult.isAuthentic ? (
                        <ShieldCheck size={24} className="text-emerald-400" />
                      ) : (
                        <ShieldAlert size={24} className="text-red-400" />
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {counterfeitResult.isAuthentic ? 'Authentic Card' : 'Potential Counterfeit'}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {(counterfeitResult.confidence * 100).toFixed(1)}% confidence
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {counterfeitResult.flags.map((flag, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {counterfeitResult.isAuthentic ? (
                            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle size={12} className="text-red-400 shrink-0" />
                          )}
                          <span className="text-slate-300">{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Match Results */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Search size={14} className="text-brand-lime" />
                    Database Matches
                    {searchingMatches && (
                      <Loader2 size={14} className="animate-spin text-slate-400" />
                    )}
                  </h3>
                  {matches.length === 0 && !searchingMatches ? (
                    <p className="text-xs text-slate-500">No matches found in database</p>
                  ) : (
                    <div className="space-y-2">
                      {matches.map((match) => (
                        <button
                          key={match.id}
                          onClick={() => handleSelectFingerprint(match.fingerprint.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-all hover:bg-slate-700/30 ${
                            selectedFingerprintId === match.fingerprint.id
                              ? 'border-brand-lime/50 bg-brand-lime/5'
                              : 'border-slate-700/30 bg-slate-900/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-white truncate mr-2">
                              {match.fingerprint.cardName}
                            </span>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                match.matchType === 'exact'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : match.matchType === 'high'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : match.matchType === 'partial'
                                      ? 'bg-amber-500/20 text-amber-400'
                                      : 'bg-slate-500/20 text-slate-400'
                              }`}
                            >
                              {match.matchConfidence.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500">
                            <span>
                              {match.matchedFeatures}/{match.totalFeatures} features
                            </span>
                            <span className={VENUE_COLORS[match.lastSeenVenue]}>
                              {VENUE_LABELS[match.lastSeenVenue]}
                            </span>
                            <span>{match.lastSeenDate}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Provenance Score */}
                {provenanceScore && selectedFingerprintId && (
                  <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Shield size={14} className="text-brand-lime" />
                        Provenance Score
                      </h3>
                      <GradeBadge grade={provenanceScore.grade} />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            className="text-slate-700"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${(provenanceScore.overall / 100) * 213.6} 213.6`}
                            className="text-brand-lime"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bebas tracking-wider text-white">
                            {provenanceScore.overall}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[
                          { label: 'Chain Completeness', value: provenanceScore.chainCompleteness },
                          { label: 'Verification', value: provenanceScore.verificationStrength },
                          { label: 'Consistency', value: provenanceScore.ownershipConsistency },
                          { label: 'Time Coverage', value: provenanceScore.timeCoverage },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 w-24">{item.label}</span>
                            <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                              <div
                                className="bg-brand-lime/70 h-1.5 rounded-full"
                                style={{ width: `${item.value}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 w-8 text-right">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {provenanceScore.flags.length > 0 && (
                      <div className="space-y-1">
                        {provenanceScore.flags.map((flag, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-amber-400/80">
                            <AlertTriangle size={10} />
                            <span>{flag}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Ownership Chain Timeline */}
                {ownershipChain.length > 0 && selectedFingerprintId && (
                  <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Clock size={14} className="text-brand-lime" />
                      Ownership Chain
                    </h3>
                    <div className="relative">
                      {/* Vertical line */}
                      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-700" />
                      <div className="space-y-4">
                        {ownershipChain.map((entry, i) => (
                          <div key={entry.id} className="relative pl-9">
                            {/* Dot */}
                            <div
                              className={`absolute left-1.5 top-1 w-3 h-3 rounded-full border-2 ${
                                i === ownershipChain.length - 1
                                  ? 'bg-brand-lime border-brand-lime'
                                  : 'bg-slate-800 border-slate-500'
                              }`}
                            />
                            <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/30">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-white">{entry.ownerAlias}</span>
                                <span className="text-xs text-slate-500">{entry.transactionDate}</span>
                              </div>
                              <div className="flex items-center gap-3 text-[10px]">
                                <span className={VENUE_COLORS[entry.venue]}>
                                  {VENUE_LABELS[entry.venue]}
                                </span>
                                <span className="text-emerald-400 font-semibold">
                                  ${entry.price.toLocaleString()}
                                </span>
                                <span className="text-slate-500">
                                  {entry.verificationMethod === 'fingerprint_match' && (
                                    <span className="text-brand-lime flex items-center gap-0.5">
                                      <Fingerprint size={10} /> Verified
                                    </span>
                                  )}
                                  {entry.verificationMethod === 'platform_api' && 'API Verified'}
                                  {entry.verificationMethod === 'receipt_upload' && 'Receipt'}
                                  {entry.verificationMethod === 'manual_entry' && 'Manual'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== DATABASE TAB ========== */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, player, or hash..."
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime/50"
              />
            </div>
            <span className="text-xs text-slate-500">{filteredDb.length} cards</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDb.map((fp) => {
              const score = getProvenanceScore(fp.id);
              return (
                <button
                  key={fp.id}
                  onClick={() => {
                    handleSelectFingerprint(fp.id);
                    setActiveTab('scan');
                  }}
                  className="text-left bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{fp.cardName}</p>
                      <p className="text-[10px] text-slate-500">
                        {fp.year} {fp.set}
                      </p>
                    </div>
                    <GradeBadge grade={score.grade} />
                  </div>
                  <div className="font-mono text-[10px] text-slate-600 truncate mb-3">
                    {fp.fingerprintHash}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>{fp.features.length} features</span>
                      <span>&middot;</span>
                      <span>{fp.uniquenessScore}% unique</span>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-slate-600 group-hover:text-brand-lime transition-colors"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========== COMPARE TAB ========== */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                Fingerprint A
              </label>
              <select
                value={compareA}
                onChange={(e) => { setCompareA(e.target.value); setComparison(null); }}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-brand-lime/50"
              >
                <option value="">Select a card...</option>
                {database.map((fp) => (
                  <option key={fp.id} value={fp.id}>
                    {fp.cardName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                Fingerprint B
              </label>
              <select
                value={compareB}
                onChange={(e) => { setCompareB(e.target.value); setComparison(null); }}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-brand-lime/50"
              >
                <option value="">Select a card...</option>
                {database.map((fp) => (
                  <option key={fp.id} value={fp.id}>
                    {fp.cardName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleCompare}
            disabled={!compareA || !compareB}
            className="px-6 py-2.5 bg-brand-lime text-slate-900 font-bold text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-lime/90 transition-all"
          >
            <span className="flex items-center gap-2">
              <GitCompareArrows size={16} />
              Compare Fingerprints
            </span>
          </button>

          {comparison && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overall Similarity */}
              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                <h3 className="text-sm font-bold text-white mb-4">Comparison Result</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-700" />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${(comparison.overallSimilarity / 100) * 251.3} 251.3`}
                        className={
                          comparison.overallSimilarity >= 90
                            ? 'text-emerald-400'
                            : comparison.overallSimilarity >= 60
                              ? 'text-amber-400'
                              : 'text-red-400'
                        }
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bebas tracking-wider text-white">
                        {comparison.overallSimilarity.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p
                      className={`text-lg font-bold ${
                        comparison.verdict === 'same_card'
                          ? 'text-emerald-400'
                          : comparison.verdict === 'likely_same'
                            ? 'text-blue-400'
                            : comparison.verdict === 'uncertain'
                              ? 'text-amber-400'
                              : 'text-red-400'
                      }`}
                    >
                      {comparison.verdict === 'same_card' && 'Same Physical Card'}
                      {comparison.verdict === 'likely_same' && 'Likely Same Card'}
                      {comparison.verdict === 'uncertain' && 'Uncertain'}
                      {comparison.verdict === 'different' && 'Different Cards'}
                    </p>
                    <div className="space-y-1 mt-2 text-xs text-slate-400">
                      <p>Centering: {comparison.centeringSimilarity.toFixed(1)}%</p>
                      <p>Edge: {comparison.edgeSimilarity.toFixed(1)}%</p>
                      <p>Surface: {comparison.surfaceSimilarity.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Comparison Radar */}
              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                <h3 className="text-sm font-bold text-white mb-4">Feature Similarity</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart
                    data={comparison.featureMatches.map((fm) => ({
                      feature: fm.featureType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                      similarity: fm.similarity,
                    }))}
                  >
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis
                      dataKey="feature"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 9 }}
                    />
                    <Radar
                      dataKey="similarity"
                      stroke="#84cc16"
                      fill="#84cc16"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== STATS TAB ========== */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Scanned', value: stats.totalScanned, icon: <Fingerprint size={16} /> },
              { label: 'Matches Found', value: stats.matchesFound, icon: <Search size={16} /> },
              { label: 'Avg Provenance', value: `${stats.avgProvenance}%`, icon: <Shield size={16} /> },
              { label: 'Database Size', value: database.length, icon: <Database size={16} /> },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 text-center"
              >
                <div className="flex items-center justify-center gap-1.5 mb-1 text-brand-lime">
                  {s.icon}
                </div>
                <p className="text-2xl font-bebas tracking-wider text-white">{s.value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Scans Over Time */}
          <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
            <h3 className="text-sm font-bold text-white mb-4">Scans Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stats.recentScans}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#84cc16"
                  fill="#84cc16"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Uniqueness Distribution */}
          <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
            <h3 className="text-sm font-bold text-white mb-4">Uniqueness Score Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={database.map((fp) => ({
                  name: fp.player.split(' ').pop(),
                  score: fp.uniquenessScore,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="score" fill="#84cc16" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Feature Type Breakdown */}
          <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
            <h3 className="text-sm font-bold text-white mb-4">Feature Type Breakdown (All Scans)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={(() => {
                  const counts: Record<string, number> = {};
                  database.forEach((fp) =>
                    fp.features.forEach((f) => {
                      const label = f.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                      counts[label] = (counts[label] || 0) + 1;
                    })
                  );
                  return Object.entries(counts).map(([name, value]) => ({ name, value }));
                })()}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#84cc16" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProvenanceDna;
