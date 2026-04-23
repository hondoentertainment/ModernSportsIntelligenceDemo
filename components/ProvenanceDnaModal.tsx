// @ts-nocheck
import React, { useState, useCallback } from 'react';
import {
  X,
  Fingerprint,
  Upload,
  Scan,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  Clock,
  Loader2,
  Target,
} from 'lucide-react';
import {
  scanCardFingerprint,
  searchForMatches,
  getOwnershipChain,
  getProvenanceScore,
  registerFingerprint,
  detectCounterfeit,
  type FingerprintScanResult,
  type FingerprintMatch,
  type OwnershipChainEntry,
  type ProvenanceScore,
  type CounterfeitResult,
} from '../lib/core/provenanceDnaService';

interface ProvenanceDnaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardName?: string;
}

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

type ModalTab = 'scan' | 'results';

export const ProvenanceDnaModal: React.FC<ProvenanceDnaModalProps> = ({
  isOpen,
  onClose,
  cardName,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('scan');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<FingerprintScanResult | null>(null);
  const [matches, setMatches] = useState<FingerprintMatch[]>([]);
  const [searchingMatches, setSearchingMatches] = useState(false);
  const [counterfeitResult, setCounterfeitResult] = useState<CounterfeitResult | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [ownershipChain, setOwnershipChain] = useState<OwnershipChainEntry[]>([]);
  const [provenanceScore, setProvenanceScore] = useState<ProvenanceScore | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleScan = useCallback(async () => {
    setScanning(true);
    setScanProgress(0);
    setScanResult(null);
    setMatches([]);
    setCounterfeitResult(null);
    setSelectedMatchId(null);
    setOwnershipChain([]);
    setProvenanceScore(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) { clearInterval(interval); return 95; }
        return prev + Math.random() * 18;
      });
    }, 180);

    try {
      const result = await scanCardFingerprint('mock-image-data');
      clearInterval(interval);
      setScanProgress(100);
      setScanResult(result);
      registerFingerprint(result.fingerprint);
      setCounterfeitResult(detectCounterfeit(result.fingerprint));
      setActiveTab('results');

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

  const handleSelectMatch = useCallback((fpId: string) => {
    setSelectedMatchId(fpId);
    setOwnershipChain(getOwnershipChain(fpId));
    setProvenanceScore(getProvenanceScore(fpId));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleScan();
    },
    [handleScan]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-lime/10 rounded-xl text-brand-lime">
              <Fingerprint size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Provenance DNA Scan</h2>
              {cardName && <p className="text-xs text-slate-400">{cardName}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3">
          {(['scan', 'results'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={tab === 'results' && !scanResult}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-brand-lime/10 text-brand-lime'
                  : 'text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
              }`}
            >
              {tab === 'scan' ? 'Scan' : 'Results'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* ===== SCAN TAB ===== */}
          {activeTab === 'scan' && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={!scanning ? handleScan : undefined}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-brand-lime bg-brand-lime/5'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'
                }`}
              >
                {scanning ? (
                  <div className="space-y-3">
                    <Scan size={36} className="text-brand-lime animate-pulse mx-auto" />
                    <p className="text-white font-semibold text-sm">Scanning card surface...</p>
                    <div className="max-w-xs mx-auto">
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-brand-lime h-1.5 rounded-full transition-all duration-200"
                          style={{ width: `${Math.min(scanProgress, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{Math.round(scanProgress)}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={32} className="mx-auto text-slate-500" />
                    <p className="text-sm text-white font-semibold">Drop image or click to scan</p>
                    <p className="text-[10px] text-slate-500">Creates a unique DNA fingerprint from micro-surface patterns</p>
                  </div>
                )}
              </div>

              {scanResult && (
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Scan Complete</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bebas tracking-wider text-brand-lime">
                        {scanResult.featuresDetected}
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase">Features</p>
                    </div>
                    <div>
                      <p className="text-lg font-bebas tracking-wider text-white">
                        {scanResult.fingerprint.uniquenessScore}%
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase">Unique</p>
                    </div>
                    <div>
                      <p className="text-lg font-bebas tracking-wider text-white">
                        Q{scanResult.qualityScore}
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase">Quality</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== RESULTS TAB ===== */}
          {activeTab === 'results' && scanResult && (
            <>
              {/* Counterfeit Detection */}
              {counterfeitResult && (
                <div
                  className={`rounded-2xl p-4 border ${
                    counterfeitResult.isAuthentic
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-red-500/5 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {counterfeitResult.isAuthentic ? (
                      <ShieldCheck size={18} className="text-emerald-400" />
                    ) : (
                      <ShieldAlert size={18} className="text-red-400" />
                    )}
                    <span className="text-sm font-bold text-white">
                      {counterfeitResult.isAuthentic ? 'Authentic' : 'Potential Counterfeit'}
                    </span>
                    <span className="text-xs text-slate-400 ml-auto">
                      {(counterfeitResult.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    {counterfeitResult.flags.map((flag, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        {counterfeitResult.isAuthentic ? (
                          <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle size={10} className="text-red-400 shrink-0" />
                        )}
                        {flag}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fingerprint Hash */}
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">DNA Fingerprint Hash</p>
                <p className="font-mono text-[10px] text-slate-400 break-all">
                  {scanResult.fingerprint.fingerprintHash}
                </p>
              </div>

              {/* Micro-Feature Map (compact) */}
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Target size={12} className="text-brand-lime" />
                  Feature Map
                </h3>
                <div className="relative bg-slate-900 rounded-xl aspect-[4/3] border border-slate-700/30 overflow-hidden">
                  <div className="absolute inset-2 border border-slate-600/30 rounded-lg" />
                  {scanResult.fingerprint.features.slice(0, 20).map((f, i) => {
                    const colors: Record<string, string> = {
                      print_dot_cluster: 'bg-brand-lime',
                      surface_anomaly: 'bg-red-400',
                      edge_pattern: 'bg-blue-400',
                      centering_offset: 'bg-amber-400',
                      color_shift: 'bg-purple-400',
                    };
                    return (
                      <div
                        key={i}
                        className={`absolute rounded-full ${colors[f.type]} opacity-60`}
                        style={{
                          left: `${f.location.x * 100}%`,
                          top: `${f.location.y * 100}%`,
                          width: `${Math.max(3, f.magnitude * 8)}px`,
                          height: `${Math.max(3, f.magnitude * 8)}px`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Matches */}
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Search size={12} className="text-brand-lime" />
                  Database Matches
                  {searchingMatches && <Loader2 size={12} className="animate-spin text-slate-400" />}
                </h3>
                {matches.length === 0 && !searchingMatches ? (
                  <p className="text-xs text-slate-500">No matches found</p>
                ) : (
                  <div className="space-y-2">
                    {matches.map((match) => (
                      <button
                        key={match.id}
                        onClick={() => handleSelectMatch(match.fingerprint.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          selectedMatchId === match.fingerprint.id
                            ? 'border-brand-lime/50 bg-brand-lime/5'
                            : 'border-slate-700/30 bg-slate-900/30 hover:bg-slate-700/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white truncate mr-2">
                            {match.fingerprint.cardName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              match.matchConfidence >= 90
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : match.matchConfidence >= 70
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {match.matchConfidence.toFixed(1)}%
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ownership Chain */}
              {ownershipChain.length > 0 && (
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                  <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                    <Clock size={12} className="text-brand-lime" />
                    Ownership Chain
                  </h3>
                  <div className="relative">
                    <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-slate-700" />
                    <div className="space-y-3">
                      {ownershipChain.map((entry, i) => (
                        <div key={entry.id} className="relative pl-7">
                          <div
                            className={`absolute left-1 top-1 w-3 h-3 rounded-full border-2 ${
                              i === ownershipChain.length - 1
                                ? 'bg-brand-lime border-brand-lime'
                                : 'bg-slate-800 border-slate-500'
                            }`}
                          />
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold text-white">{entry.ownerAlias}</p>
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className={VENUE_COLORS[entry.venue]}>
                                  {VENUE_LABELS[entry.venue]}
                                </span>
                                <span className="text-emerald-400">${entry.price.toLocaleString()}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500">{entry.transactionDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Provenance Score */}
              {provenanceScore && (
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-white">Provenance Score</h3>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        provenanceScore.grade.startsWith('A')
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : provenanceScore.grade.startsWith('B')
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {provenanceScore.grade}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="23" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-700" />
                        <circle
                          cx="28"
                          cy="28"
                          r="23"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${(provenanceScore.overall / 100) * 144.5} 144.5`}
                          className="text-brand-lime"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bebas tracking-wider text-white">
                          {provenanceScore.overall}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      {[
                        { label: 'Chain', value: provenanceScore.chainCompleteness },
                        { label: 'Verified', value: provenanceScore.verificationStrength },
                        { label: 'Consistency', value: provenanceScore.ownershipConsistency },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-500 w-16">{item.label}</span>
                          <div className="flex-1 bg-slate-700 rounded-full h-1">
                            <div className="bg-brand-lime/70 h-1 rounded-full" style={{ width: `${item.value}%` }} />
                          </div>
                          <span className="text-[9px] text-slate-500 w-6 text-right">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProvenanceDnaModal;
