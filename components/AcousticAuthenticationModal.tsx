import React, { useState, useMemo } from 'react';
import { X, Volume2, ShieldCheck, AlertTriangle, Activity, Database, Radio, Waves } from 'lucide-react';
import { getScans, getMaterialDatabase } from '../lib/acousticAuthenticationService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AcousticAuthenticationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('scans');

  const scans = useMemo(() => getScans(), []);
  const materials = useMemo(() => getMaterialDatabase(), []);

  if (!isOpen) return null;

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'authentic': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };
      case 'suspect': return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
      case 'altered': return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getFlagColor = (type: string) => {
    switch (type) {
      case 'trimming': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'recoloring': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'thickness-anomaly': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'surface-coating': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'edge-repair': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const tabs = [
    { id: 'scans', label: 'Scan Results', icon: <ShieldCheck size={16} /> },
    { id: 'materials', label: 'Material Database', icon: <Database size={16} /> },
    { id: 'resonance', label: 'Resonance Profiles', icon: <Radio size={16} /> },
  ];

  const authenticCount = scans.filter(s => s.verdict === 'authentic').length;
  const suspectCount = scans.filter(s => s.verdict === 'suspect' || s.verdict === 'altered').length;
  const avgScore = Math.round(scans.reduce((sum, s) => sum + s.authenticityScore, 0) / scans.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl">
              <Volume2 size={24} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Acoustic Authentication Engine</h2>
              <p className="text-xs text-slate-500">Sound-based micro-tap resonance analysis for card authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-800/60 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Scan Results Tab */}
          {activeTab === 'scans' && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Scans</p>
                  <p className="text-2xl font-bold text-white">{scans.length}</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authentic</p>
                  <p className="text-2xl font-bold text-emerald-400">{authenticCount}</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Flagged</p>
                  <p className="text-2xl font-bold text-red-400">{suspectCount}</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}</p>
                </div>
              </div>

              {/* Scan Cards */}
              {scans.map(scan => {
                const verdictStyle = getVerdictColor(scan.verdict);
                return (
                  <div key={scan.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-white">{scan.cardName}</h3>
                        <p className="text-xs text-slate-500 mt-1">Scanned: {scan.scanDate} | Material: {scan.materialSignature}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-black ${getScoreColor(scan.authenticityScore)}`}>
                          {scan.authenticityScore}
                        </span>
                        <span className={`px-3 py-1 ${verdictStyle.bg} border ${verdictStyle.border} rounded-full text-[10px] font-black ${verdictStyle.text} uppercase tracking-widest`}>
                          {scan.verdict}
                        </span>
                      </div>
                    </div>

                    {/* Scan Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Thickness</p>
                        <p className="text-sm font-bold text-white">{scan.thickness}mm</p>
                      </div>
                      <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Density</p>
                        <p className="text-sm font-bold text-white">{scan.densityIndex}</p>
                      </div>
                      <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Material</p>
                        <p className="text-sm font-bold text-cyan-400">{scan.resonanceProfile.materialClass}</p>
                      </div>
                    </div>

                    {/* Flags */}
                    {scan.flags.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                          <AlertTriangle size={12} />
                          Detected Flags ({scan.flags.length})
                        </p>
                        {scan.flags.map((flag, idx) => (
                          <div key={idx} className={`p-3 border rounded-xl ${getFlagColor(flag.type)}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold uppercase">{flag.type.replace('-', ' ')}</span>
                              <span className="text-xs font-bold">{flag.confidence}% confidence</span>
                            </div>
                            <p className="text-xs text-slate-400">{flag.description}</p>
                            <p className="text-[10px] text-slate-500 mt-1">Location: {flag.location}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Authenticity Bar */}
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          scan.authenticityScore >= 90 ? 'bg-emerald-400' : scan.authenticityScore >= 70 ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${scan.authenticityScore}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Material Database Tab */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-4">
                <p className="text-xs text-cyan-400 font-semibold flex items-center gap-2">
                  <Database size={14} />
                  Reference database of {materials.length} known card stock profiles used for acoustic matching.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {materials.map(mat => (
                  <div key={mat.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">{mat.manufacturer} - {mat.productLine}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Year: {mat.year} | Samples: {mat.sampleCount.toLocaleString()}</p>
                      </div>
                      <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                        {mat.sampleCount > 1000 ? 'High Confidence' : 'Moderate'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Expected Freq</p>
                        <p className="text-lg font-bold text-cyan-400">{mat.expectedFreq} Hz</p>
                      </div>
                      <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tolerance</p>
                        <p className="text-lg font-bold text-amber-400">&plusmn;{mat.freqTolerance} Hz</p>
                      </div>
                      <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Thickness</p>
                        <p className="text-lg font-bold text-white">{mat.expectedThickness}mm</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resonance Profiles Tab */}
          {activeTab === 'resonance' && (
            <div className="space-y-6">
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-4">
                <p className="text-xs text-cyan-400 font-semibold flex items-center gap-2">
                  <Waves size={14} />
                  Spectral resonance analysis showing harmonic fingerprints of scanned cards.
                </p>
              </div>

              {scans.map(scan => (
                <div key={scan.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{scan.player}</h3>
                      <p className="text-xs text-slate-500">{scan.cardName}</p>
                    </div>
                    <div className={`flex items-center gap-2 ${getScoreColor(scan.authenticityScore)}`}>
                      <Activity size={14} />
                      <span className="text-sm font-bold">{scan.authenticityScore}%</span>
                    </div>
                  </div>

                  {/* Resonance Details Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Fundamental</p>
                      <p className="text-sm font-bold text-cyan-400">{scan.resonanceProfile.fundamentalFreq} Hz</p>
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Damping</p>
                      <p className="text-sm font-bold text-white">{scan.resonanceProfile.dampingRatio}</p>
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ring Duration</p>
                      <p className="text-sm font-bold text-white">{scan.resonanceProfile.ringDuration}s</p>
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Harmonics</p>
                      <p className="text-sm font-bold text-violet-400">{scan.resonanceProfile.harmonics.length}</p>
                    </div>
                  </div>

                  {/* Spectral Peaks */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Spectral Peaks</p>
                    <div className="flex gap-2 flex-wrap">
                      {scan.resonanceProfile.spectralPeaks.map((peak, idx) => (
                        <div key={idx} className="bg-slate-800/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-center">
                          <p className="text-xs font-bold text-cyan-400">{peak.freq} Hz</p>
                          <p className="text-[10px] text-slate-500">amp: {peak.amplitude}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Harmonic Series */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Harmonic Series</p>
                    <div className="flex items-center gap-2">
                      {scan.resonanceProfile.harmonics.map((h, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <span className="text-slate-600">&rarr;</span>}
                          <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-xs font-bold text-cyan-400">
                            {h} Hz
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
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

export default AcousticAuthenticationModal;
