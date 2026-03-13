import React, { useState, useMemo } from 'react';
import { X, Fingerprint, ShieldCheck, ShieldAlert, ShieldQuestion, Search } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  getAllFingerprints,
  getDNAMatches,
  CardFingerprint,
} from '../lib/cardDNAService';

interface CardDNAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function confidenceColor(value: number): string {
  if (value >= 85) return '#34d399';
  if (value >= 50) return '#facc15';
  return '#f87171';
}

function confidenceLabel(value: number): string {
  if (value >= 85) return 'Authenticated';
  if (value >= 50) return 'Inconclusive';
  return 'Counterfeit Risk';
}

function confidenceIcon(value: number) {
  if (value >= 85) return <ShieldCheck size={20} className="text-emerald-400" />;
  if (value >= 50) return <ShieldQuestion size={20} className="text-yellow-400" />;
  return <ShieldAlert size={20} className="text-red-400" />;
}

const CardDNAModal: React.FC<CardDNAModalProps> = ({ isOpen, onClose }) => {
  const fingerprints = useMemo(() => getAllFingerprints(), []);
  const [selectedId, setSelectedId] = useState<string>(fingerprints[0]?.id ?? '');
  const [searchTerm, setSearchTerm] = useState('');

  const selected = useMemo(
    () => fingerprints.find((fp) => fp.id === selectedId) ?? fingerprints[0],
    [fingerprints, selectedId]
  );

  const matches = useMemo(
    () => (selected ? getDNAMatches(selected.id) : []),
    [selected]
  );

  const radarData = useMemo(() => {
    if (!selected) return [];
    return [
      { trait: 'Centering', value: selected.centeringScore },
      { trait: 'Print', value: selected.printQuality },
      { trait: 'Surface', value: selected.surfaceScore },
      { trait: 'Edges', value: selected.edgeScore },
      { trait: 'Corners', value: selected.cornerScore },
    ];
  }, [selected]);

  const filteredFingerprints = useMemo(() => {
    if (!searchTerm) return fingerprints;
    const lower = searchTerm.toLowerCase();
    return fingerprints.filter((fp) => fp.cardName.toLowerCase().includes(lower));
  }, [fingerprints, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-lime/20">
              <Fingerprint size={20} className="text-brand-lime" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Card DNA Fingerprint</h2>
              <p className="text-xs text-slate-400">Micro-characteristic authentication analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Card Selector */}
          <div>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime/50"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filteredFingerprints.map((fp) => (
                <button
                  key={fp.id}
                  onClick={() => setSelectedId(fp.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedId === fp.id
                      ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {fp.cardName.length > 30 ? fp.cardName.slice(0, 30) + '...' : fp.cardName}
                </button>
              ))}
            </div>
          </div>

          {selected && (
            <>
              {/* Authentication Confidence Meter */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  {confidenceIcon(selected.authenticityConfidence)}
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {confidenceLabel(selected.authenticityConfidence)}
                    </div>
                    <div className="text-xs text-slate-400">
                      DNA Hash: <span className="font-mono text-slate-300">{selected.overallDNA}</span>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: confidenceColor(selected.authenticityConfidence) }}
                    >
                      {selected.authenticityConfidence}%
                    </div>
                    <div className="text-xs text-slate-500">confidence</div>
                  </div>
                </div>
                <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selected.authenticityConfidence}%`,
                      backgroundColor: confidenceColor(selected.authenticityConfidence),
                    }}
                  />
                </div>
              </div>

              {/* Fingerprint Radar */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-white mb-3">Fingerprint Profile</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis
                        dataKey="trait"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#84cc16"
                        fill="#84cc16"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {radarData.map((d) => (
                    <div key={d.trait} className="text-center">
                      <div className="text-xs text-slate-500">{d.trait}</div>
                      <div className="text-sm font-semibold text-white">{d.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DNA Matches */}
              {matches.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-white mb-3">Match Results</h3>
                  <div className="space-y-2">
                    {matches.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-lg border ${
                          m.matchType === 'exact'
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : m.matchType === 'similar'
                            ? 'bg-yellow-500/5 border-yellow-500/20'
                            : 'bg-red-500/5 border-red-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-semibold uppercase ${
                              m.matchType === 'exact'
                                ? 'text-emerald-400'
                                : m.matchType === 'similar'
                                ? 'text-yellow-400'
                                : 'text-red-400'
                            }`}
                          >
                            {m.matchType.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-400">{m.confidence}% confidence</span>
                        </div>
                        <p className="text-xs text-slate-300">{m.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scan Info */}
              <div className="text-xs text-slate-500 text-center">
                Scanned on {selected.scanDate} &middot; Card ID: {selected.cardId}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDNAModal;
