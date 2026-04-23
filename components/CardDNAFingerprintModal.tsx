// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  X,
  Fingerprint,
  GitCompare,
  BarChart3,
  Shield,
  Dna,
  CheckCircle2,
  AlertCircle,
  Search,
  Layers,
  Eye,
} from 'lucide-react';
import {
  getCardFingerprints,
  getFingerprintMatches,
  getFingerprintStats,
} from '../lib/core/cardDNAFingerprintService';

interface CardDNAFingerprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'fingerprints' | 'matches' | 'stats';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'fingerprints', label: 'Fingerprints', icon: <Fingerprint size={16} /> },
  { id: 'matches', label: 'Matches', icon: <GitCompare size={16} /> },
  { id: 'stats', label: 'Stats', icon: <BarChart3 size={16} /> },
];

const CardDNAFingerprintModal: React.FC<CardDNAFingerprintModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('fingerprints');

  const fingerprints = useMemo(() => getCardFingerprints(), []);
  const matches = useMemo(() => getFingerprintMatches(), []);
  const stats = useMemo(() => getFingerprintStats(), []);

  if (!isOpen) return null;

  const renderFingerprints = () => (
    <div className="space-y-4">
      {fingerprints.map((fp: any) => (
        <div key={fp.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-lime-500/20">
                <Dna size={18} className="text-lime-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">{fp.cardName || fp.card || fp.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hash: <span className="font-mono text-lime-400">{fp.hash || fp.fingerprint || fp.id}</span>
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              (fp.verified || fp.status === 'verified') ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {fp.verified || fp.status === 'verified' ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center p-2 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500">Uniqueness</p>
              <p className="text-sm font-bold text-slate-200">{fp.uniqueness ?? fp.uniquenessScore ?? 95}%</p>
            </div>
            <div className="text-center p-2 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500">Surface Points</p>
              <p className="text-sm font-bold text-slate-200">{fp.surfacePoints ?? fp.dataPoints ?? 1240}</p>
            </div>
            <div className="text-center p-2 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500">Scan Quality</p>
              <p className="text-sm font-bold text-slate-200">{fp.quality ?? fp.scanQuality ?? 98}%</p>
            </div>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-lime-500"
              style={{ width: `${fp.uniqueness ?? fp.uniquenessScore ?? 95}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderMatches = () => (
    <div className="space-y-4">
      {matches.map((match: any, idx: number) => {
        const confidence = match.confidence ?? match.matchScore ?? 0;
        const confColor = confidence >= 90 ? 'text-green-400' : confidence >= 70 ? 'text-amber-400' : 'text-red-400';
        const confBg = confidence >= 90 ? 'bg-green-500' : confidence >= 70 ? 'bg-amber-500' : 'bg-red-500';
        return (
          <div key={match.id || idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">{match.cardName || match.card || match.sourceCard}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Matched with: <span className="text-slate-200">{match.matchedWith || match.targetCard || 'Unknown'}</span>
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${confColor}`}>{confidence}%</p>
                <p className="text-xs text-slate-500">confidence</p>
              </div>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
              <div className={`h-full rounded-full ${confBg}`} style={{ width: `${confidence}%` }} />
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Layers size={12} /> {match.matchType || match.type || 'Surface Analysis'}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={12} /> {match.date || match.matchDate || 'Recent'}
              </span>
            </div>
          </div>
        );
      })}
      {matches.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Search size={32} className="mx-auto mb-3" />
          <p className="text-sm">No fingerprint matches found</p>
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Fingerprint size={16} className="text-lime-400" />
            <span className="text-sm font-semibold text-slate-200">Total Fingerprints</span>
          </div>
          <p className="text-3xl font-bold text-slate-100">{stats?.totalFingerprints ?? fingerprints.length}</p>
          <p className="text-xs text-slate-400 mt-1">Cards in DNA database</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <GitCompare size={16} className="text-lime-400" />
            <span className="text-sm font-semibold text-slate-200">Match Rate</span>
          </div>
          <p className="text-3xl font-bold text-lime-400">{stats?.matchRate ?? 94}%</p>
          <p className="text-xs text-slate-400 mt-1">Successful identifications</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-lime-400" />
            <span className="text-sm font-semibold text-slate-200">Verified Cards</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{stats?.verifiedCount ?? fingerprints.filter((f: any) => f.verified).length}</p>
          <p className="text-xs text-slate-400 mt-1">Authenticity confirmed</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-lime-400" />
            <span className="text-sm font-semibold text-slate-200">Duplicates Found</span>
          </div>
          <p className="text-3xl font-bold text-amber-400">{stats?.duplicatesFound ?? 3}</p>
          <p className="text-xs text-slate-400 mt-1">Potential counterfeits</p>
        </div>
      </div>
      <div className="bg-lime-500/10 rounded-xl p-5 border border-lime-500/30">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={16} className="text-lime-400" />
          <p className="text-sm font-semibold text-lime-300">DNA Database Health</p>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your card DNA database is comprehensive with high-quality scans. Regular rescanning recommended for cards in active trading rotation.
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-800/50 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <Dna size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Card DNA Fingerprint</h2>
              <p className="text-sm text-slate-400">Unique surface-level card identification and matching</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700/50">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Fingerprints</p>
            <p className="text-xl font-bold text-slate-100">{stats?.totalFingerprints ?? fingerprints.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Matches</p>
            <p className="text-xl font-bold text-lime-400">{stats?.totalMatches ?? matches.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Match Rate</p>
            <p className="text-xl font-bold text-green-400">{stats?.matchRate ?? 94}%</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Avg Quality</p>
            <p className="text-xl font-bold text-slate-100">{stats?.avgQuality ?? 96}%</p>
          </div>
        </div>

        <div className="flex gap-1 p-4 border-b border-slate-700/50">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-lime-500/20 text-lime-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'fingerprints' && renderFingerprints()}
          {activeTab === 'matches' && renderMatches()}
          {activeTab === 'stats' && renderStats()}
        </div>
      </div>
    </div>
  );
};

export default CardDNAFingerprintModal;
