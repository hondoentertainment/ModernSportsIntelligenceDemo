import React, { useState, useMemo } from 'react';
import {
  X,
  Microscope,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Layers,
  Database,
  ChevronRight,
  Sun,
} from 'lucide-react';
import { getScans, getDatabase } from '../lib/core/cardMaterialSpectrometryService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CardMaterialSpectrometryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('scans');
  const [expandedScan, setExpandedScan] = useState<string | null>(null);

  const scans = useMemo(() => getScans(), []);
  const database = useMemo(() => getDatabase(), []);

  if (!isOpen) return null;

  const getVerdictInfo = (verdict: string) => {
    const map: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
      'authentic': { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: <ShieldCheck size={14} />, label: 'Authentic' },
      'reprint': { color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30', icon: <XCircle size={14} />, label: 'Reprint' },
      'counterfeit': { color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30', icon: <ShieldAlert size={14} />, label: 'Counterfeit' },
      'altered-material': { color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', icon: <AlertTriangle size={14} />, label: 'Altered Material' },
      'inconclusive': { color: 'text-slate-400', bg: 'bg-slate-500/15 border-slate-500/30', icon: <Eye size={14} />, label: 'Inconclusive' },
    };
    return map[verdict] || map['inconclusive'];
  };

  const getAuthScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getAuthScoreBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-500/20 border-emerald-500/30';
    if (score >= 70) return 'bg-amber-500/20 border-amber-500/30';
    if (score >= 50) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getFlagTypeColor = (type: string) => {
    const map: Record<string, string> = {
      'reprint-ink': 'text-red-400 bg-red-500/15 border-red-500/30',
      'modern-paper': 'text-red-400 bg-red-500/15 border-red-500/30',
      'chemical-treatment': 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      'uv-anomaly': 'text-purple-400 bg-purple-500/15 border-purple-500/30',
      'coating-mismatch': 'text-orange-400 bg-orange-500/15 border-orange-500/30',
      'age-inconsistency': 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    };
    return map[type] || 'text-slate-400 bg-slate-500/15 border-slate-500/30';
  };

  const authenticCount = useMemo(() => scans.filter(s => s.verdict === 'authentic').length, [scans]);
  const flaggedCount = useMemo(() => scans.filter(s => s.verdict !== 'authentic').length, [scans]);

  const tabs = [
    { id: 'scans', label: 'Spectral Scans', icon: <Microscope size={16} /> },
    { id: 'database', label: 'Material Database', icon: <Database size={16} /> },
    { id: 'uv', label: 'UV Analysis', icon: <Sun size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-slate-900 px-6 py-5 border-b border-slate-700/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Microscope size={22} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Card Material Spectrometry</h2>
                <p className="text-slate-400 text-xs">Spectral analysis for detecting reprints and material variations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Spectral Scans Tab */}
          {activeTab === 'scans' && (
            <div className="space-y-5">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
                  <p className="text-white font-bold text-2xl">{scans.length}</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Total Scans</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
                  <p className="text-emerald-400 font-bold text-2xl">{authenticCount}</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Authentic</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
                  <p className="text-red-400 font-bold text-2xl">{flaggedCount}</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Flagged</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
                  <p className="text-indigo-400 font-bold text-2xl">{database.length}</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">DB Profiles</p>
                </div>
              </div>

              {/* Scan Cards */}
              {scans.map((scan) => {
                const verdictInfo = getVerdictInfo(scan.verdict);
                return (
                  <div
                    key={scan.id}
                    className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40 hover:border-slate-600/60 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${getAuthScoreBg(scan.authenticityScore)}`}>
                          <span className={`font-bold text-lg ${getAuthScoreColor(scan.authenticityScore)}`}>{scan.authenticityScore}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm">{scan.cardName}</h3>
                          <p className="text-slate-500 text-xs">{scan.manufacturer} ({scan.year}) | Scanned: {scan.scanDate}</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${verdictInfo.bg} ${verdictInfo.color}`}>
                        {verdictInfo.icon}
                        {verdictInfo.label}
                      </span>
                    </div>

                    {/* Spectral Metrics */}
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                        <p className="text-indigo-400 font-bold text-sm">{scan.spectralProfile.peakWavelength}nm</p>
                        <p className="text-slate-500 text-[10px]">Peak WL</p>
                      </div>
                      <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                        <p className="text-white font-bold text-sm">{scan.spectralProfile.inkLayerCount}</p>
                        <p className="text-slate-500 text-[10px]">Ink Layers</p>
                      </div>
                      <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                        <p className="text-white font-bold text-sm">{scan.spectralProfile.paperBrightness}</p>
                        <p className="text-slate-500 text-[10px]">Brightness</p>
                      </div>
                      <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                        <p className={`font-bold text-sm ${scan.materialComposition.consistentWithEra ? 'text-emerald-400' : 'text-red-400'}`}>
                          {scan.materialComposition.consistentWithEra ? 'Yes' : 'No'}
                        </p>
                        <p className="text-slate-500 text-[10px]">Era Match</p>
                      </div>
                      <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                        <p className="text-white font-bold text-sm">{scan.materialComposition.estimatedAge}yr</p>
                        <p className="text-slate-500 text-[10px]">Est. Age</p>
                      </div>
                    </div>

                    {/* Material Info */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-slate-700/30 rounded-lg p-2.5">
                        <p className="text-slate-500 text-[10px] uppercase tracking-wide mb-0.5">Paper</p>
                        <p className="text-slate-200 text-xs">{scan.materialComposition.paperType}</p>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-2.5">
                        <p className="text-slate-500 text-[10px] uppercase tracking-wide mb-0.5">Coating</p>
                        <p className="text-slate-200 text-xs">{scan.materialComposition.coatingType}</p>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-2.5">
                        <p className="text-slate-500 text-[10px] uppercase tracking-wide mb-0.5">Ink</p>
                        <p className="text-slate-200 text-xs">{scan.materialComposition.inkType}</p>
                      </div>
                    </div>

                    {/* Chemical Markers */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {scan.materialComposition.chemicalMarkers.map((marker, i) => (
                        <span
                          key={i}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                            marker.detected === marker.expected
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}
                        >
                          {marker.detected === marker.expected ? <CheckCircle size={10} /> : <XCircle size={10} />}
                          {marker.marker}
                          {marker.detected ? ' (found)' : ' (absent)'}
                        </span>
                      ))}
                    </div>

                    {/* Flags */}
                    {scan.flags.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-700/40 space-y-2">
                        <h4 className="text-red-400 text-[10px] font-bold uppercase tracking-wide">Flags Detected</h4>
                        {scan.flags.map((flag, i) => (
                          <div key={i} className="bg-slate-700/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${getFlagTypeColor(flag.type)}`}>
                                {flag.type.replace('-', ' ')}
                              </span>
                              <span className="text-red-400 text-[10px] font-mono">{flag.confidence}% confidence</span>
                            </div>
                            <p className="text-slate-200 text-xs mb-1">{flag.description}</p>
                            <p className="text-slate-500 text-[10px]">{flag.evidence}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Clean card indicator */}
                    {scan.flags.length === 0 && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/40">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-medium">No anomalies detected -- all spectral markers within expected parameters</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Material Database Tab */}
          {activeTab === 'database' && (
            <div className="space-y-5">
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wide">Reference Database</p>
                  <p className="text-white font-bold text-2xl">{database.reduce((sum, d) => sum + d.sampleCount, 0).toLocaleString()} Samples</p>
                </div>
                <Database size={28} className="text-indigo-400" />
              </div>

              {database.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40 hover:border-slate-600/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-sm">{entry.manufacturer} - {entry.productLine}</h3>
                      <p className="text-slate-500 text-xs">{entry.yearRange}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-semibold border border-indigo-500/30">
                      {entry.confidence}% confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-indigo-400 font-bold text-sm">{entry.expectedPeakWavelength}nm</p>
                      <p className="text-slate-500 text-[10px]">Peak WL</p>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-white font-bold text-sm">{entry.expectedInkLayers}</p>
                      <p className="text-slate-500 text-[10px]">Ink Layers</p>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-white font-bold text-sm">{entry.expectedPaperBrightness}</p>
                      <p className="text-slate-500 text-[10px]">Brightness</p>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-teal-400 font-bold text-sm">{entry.sampleCount.toLocaleString()}</p>
                      <p className="text-slate-500 text-[10px]">Samples</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* UV Analysis Tab */}
          {activeTab === 'uv' && (
            <div className="space-y-5">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide">UV Light Analysis</p>
                  <p className="text-white font-bold text-2xl">Short-wave & Long-wave Fluorescence</p>
                </div>
                <Sun size={28} className="text-purple-400" />
              </div>

              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-sm">{scan.cardName}</h3>
                    <span className={`text-[10px] font-semibold ${getAuthScoreColor(scan.authenticityScore)}`}>
                      Score: {scan.authenticityScore}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className={`rounded-lg p-3 border ${scan.uvResponse.shortWave.normal ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Short-wave UV</span>
                        {scan.uvResponse.shortWave.normal ? (
                          <CheckCircle size={12} className="text-emerald-400" />
                        ) : (
                          <XCircle size={12} className="text-red-400" />
                        )}
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed">{scan.uvResponse.shortWave.response}</p>
                    </div>
                    <div className={`rounded-lg p-3 border ${scan.uvResponse.longWave.normal ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Long-wave UV</span>
                        {scan.uvResponse.longWave.normal ? (
                          <CheckCircle size={12} className="text-emerald-400" />
                        ) : (
                          <XCircle size={12} className="text-red-400" />
                        )}
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed">{scan.uvResponse.longWave.response}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-slate-500 text-[10px] uppercase tracking-wide mb-1">Optical Brighteners</p>
                      <div className="flex items-center gap-1.5">
                        {scan.uvResponse.opticalBrighteners ? (
                          <>
                            <AlertTriangle size={12} className="text-amber-400" />
                            <span className="text-amber-400 text-xs font-semibold">Detected</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={12} className="text-emerald-400" />
                            <span className="text-emerald-400 text-xs font-semibold">None Detected</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-slate-500 text-[10px] uppercase tracking-wide mb-1">Ink Fluorescence</p>
                      <p className="text-slate-200 text-xs">{scan.uvResponse.inkFluorescence}</p>
                    </div>
                  </div>

                  {/* Fluorescence Signature */}
                  <div className="mt-3 pt-3 border-t border-slate-700/40 flex items-center gap-2">
                    <Layers size={12} className="text-indigo-400" />
                    <span className="text-slate-400 text-[10px]">Signature:</span>
                    <span className="text-indigo-400 text-xs font-mono">{scan.spectralProfile.fluorescenceSignature}</span>
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

export default CardMaterialSpectrometryModal;
