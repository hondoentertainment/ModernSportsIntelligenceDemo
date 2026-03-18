import React, { useMemo, useState } from 'react';
import {
  X,
  Scan,
  Fingerprint,
  ShieldCheck,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Palette,
  Activity,
  Zap,
  Star,
  BarChart3,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  getScans,
  getSignatures,
  getAuthResults,
  getSurfaceReport,
  RefractorScan,
  LightSignature,
  AuthenticationResult,
  SurfaceIntegrity,
} from '../lib/utils/refractorMapperService';

interface RefractorMapperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'scan' | 'signatures' | 'auth' | 'surface';

const RefractorMapperModal: React.FC<RefractorMapperModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('scan');

  const scannedCards = useMemo(() => getScans(), []);
  const signatures = useMemo(() => getSignatures(), []);
  const authResults = useMemo(() => getAuthResults(), []);
  const surfaceReports = useMemo(() => getSurfaceReport(), []);

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'scan', label: 'Scan Results', icon: <Scan size={14} />, count: scannedCards.length },
    { id: 'signatures', label: 'Light Signatures', icon: <Fingerprint size={14} />, count: signatures.length },
    { id: 'auth', label: 'Authentication', icon: <ShieldCheck size={14} />, count: authResults.length },
    { id: 'surface', label: 'Surface Report', icon: <Layers size={14} />, count: surfaceReports.length },
  ];

  if (!isOpen) return null;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const getPrismaticColor = (score: number) => {
    if (score >= 95) return 'text-violet-400 bg-violet-400/10 border-violet-400/30';
    if (score >= 90) return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
    if (score >= 80) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'authentic': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'likely_authentic': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
      case 'inconclusive': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'suspect': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'pristine': return 'text-violet-400 bg-violet-400/10 border-violet-400/30';
      case 'excellent': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'good': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
      case 'fair': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'poor': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  const spectrumBar = (wavelengths: number[], intensities: number[]) => {
    const colors = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    return (
      <div className="flex items-end gap-0.5 h-12">
        {intensities.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
            <div
              className="w-full rounded-t-sm"
              style={{ height: `${val * 0.48}px`, backgroundColor: colors[i] || '#666' }}
            />
            <span className="text-[7px] text-slate-500">{wavelengths[i]}nm</span>
          </div>
        ))}
      </div>
    );
  };

  const renderScanResults = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-violet-400">{scannedCards.length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Cards Scanned</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-cyan-400">
            {(scannedCards.reduce((s: number, c: RefractorScan) => s + c.confidence, 0) / scannedCards.length).toFixed(1)}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Avg Confidence</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {scannedCards.filter((c: RefractorScan) => c.confidence >= 90).length}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">High Confidence</div>
        </div>
      </div>

      <div className="space-y-3">
        {scannedCards.map((card: RefractorScan) => (
          <div key={card.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-violet-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold text-sm">{card.player}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{card.cardDescription}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-emerald-400">{card.confidence}%</div>
                <div className="text-[10px] text-slate-500">confidence</div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getPrismaticColor(card.confidence)}`}>
                <Sparkles size={10} className="inline mr-1" />
                Confidence: {card.confidence}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border text-indigo-400 bg-indigo-400/10 border-indigo-400/30">
                {card.identifiedParallel}
              </span>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 uppercase mb-2">Notes</div>
              <p className="text-xs text-slate-400 leading-relaxed">{card.notes}</p>
            </div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
              <Scan size={10} />
              <span>Scanned {formatDate(card.scanDate)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLightSignatures = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-violet-500/5 via-cyan-500/5 to-emerald-500/5 border border-slate-700/50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Fingerprint size={16} className="text-violet-400" />
          <h3 className="text-sm font-bold text-white">Light Signature Fingerprinting</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Each refractor card produces a unique light signature based on its holographic layer.
          These signatures act as fingerprints for authentication and identification.
        </p>
      </div>

      <div className="space-y-3">
        {signatures.map((sig: LightSignature) => {
          const scan = scannedCards.find((c: RefractorScan) => c.signatureId === sig.id);
          return (
            <div key={sig.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold text-sm">{scan?.player || 'Unknown'}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{scan?.cardDescription}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                    sig.peakIntensity >= 0.95 ? 'text-violet-400 bg-violet-400/10 border-violet-400/30' :
                    sig.peakIntensity >= 0.85 ? 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30' :
                    'text-amber-400 bg-amber-400/10 border-amber-400/30'
                  }`}>
                    Peak: {(sig.peakIntensity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 uppercase mb-2">Wavelength Spectrum</div>
                  {spectrumBar(sig.wavelengths, sig.wavelengths.map(() => sig.peakIntensity * 48))}
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 uppercase mb-2">Signature Details</div>
                  <div className="text-xs text-slate-400 mb-1">
                    Refractive Index: <span className="text-cyan-400 font-semibold">{sig.refractiveIndex.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-1">
                    Spectrum Hash: <span className="text-violet-400 font-mono text-[10px]">{sig.spectrumHash}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Captured: <span className="text-slate-300">{formatDate(sig.capturedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAuthentication = () => {
    const getScanPlayer = (scanId: string) => {
      const scan = scannedCards.find((c: RefractorScan) => c.id === scanId);
      return scan?.player || 'Unknown';
    };

    const getAuthVerdict = (auth: AuthenticationResult) => {
      if (auth.isAuthentic && auth.confidence >= 95) return 'authentic';
      if (auth.isAuthentic) return 'likely_authentic';
      if (auth.confidence >= 50) return 'inconclusive';
      return 'suspect';
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {authResults.filter((a: AuthenticationResult) => a.isAuthentic && a.confidence >= 95).length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Authentic</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {authResults.filter((a: AuthenticationResult) => a.isAuthentic && a.confidence < 95).length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Likely Auth</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">
              {authResults.filter((a: AuthenticationResult) => !a.isAuthentic && a.confidence >= 50).length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Inconclusive</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-400">
              {authResults.filter((a: AuthenticationResult) => !a.isAuthentic && a.confidence < 50).length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Suspect</div>
          </div>
        </div>

        <div className="space-y-3">
          {authResults.map((auth: AuthenticationResult) => {
            const verdict = getAuthVerdict(auth);
            return (
              <div key={auth.id} className={`bg-slate-800/40 border rounded-xl p-4 transition-all ${
                verdict === 'authentic' ? 'border-emerald-500/20 hover:border-emerald-500/40' :
                verdict === 'likely_authentic' ? 'border-cyan-500/20 hover:border-cyan-500/40' :
                verdict === 'inconclusive' ? 'border-amber-500/20 hover:border-amber-500/40' :
                'border-red-500/20 hover:border-red-500/40'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{getScanPlayer(auth.scanId)}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold ${getVerdictColor(verdict)}`}>
                        {verdict.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">Verified {formatDate(auth.verifiedAt)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      auth.confidence >= 95 ? 'text-emerald-400' :
                      auth.confidence >= 85 ? 'text-cyan-400' :
                      auth.confidence >= 75 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {auth.confidence}%
                    </div>
                    <div className="text-[10px] text-slate-500">confidence</div>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg px-3 py-2">
                    <div className={`p-1 rounded-full ${auth.isAuthentic ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                      {auth.isAuthentic ? <CheckCircle2 size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-red-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white font-medium">Authentication</span>
                        <span className={`text-[10px] font-bold ${auth.isAuthentic ? 'text-emerald-400' : 'text-red-400'}`}>
                          {auth.isAuthentic ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Matched {auth.matchedSignatureCount} known signatures</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg px-3 py-2">
                    <div className={`p-1 rounded-full ${!auth.knownCounterfeitMatch ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                      {!auth.knownCounterfeitMatch ? <CheckCircle2 size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-red-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white font-medium">Counterfeit Database</span>
                        <span className={`text-[10px] font-bold ${!auth.knownCounterfeitMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                          {!auth.knownCounterfeitMatch ? 'CLEAR' : 'MATCH'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{auth.knownCounterfeitMatch ? 'Matches known counterfeit pattern' : 'No counterfeit matches found'}</p>
                    </div>
                  </div>
                </div>

                {auth.anomalies.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle size={11} className="text-amber-400" />
                      <span className="text-[10px] text-amber-400 font-semibold uppercase">Anomalies</span>
                    </div>
                    {auth.anomalies.map((anomaly: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 mt-1">
                        <div className="w-1 h-1 rounded-full bg-amber-400" />
                        <span className="text-[10px] text-amber-300">{anomaly}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSurfaceReport = () => {
    const getConditionFromScore = (score: number): string => {
      if (score >= 95) return 'pristine';
      if (score >= 85) return 'excellent';
      if (score >= 70) return 'good';
      if (score >= 50) return 'fair';
      return 'poor';
    };

    const getScanPlayer = (scanId: string) => {
      const scan = scannedCards.find((c: RefractorScan) => c.id === scanId);
      return scan?.player || 'Unknown';
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-violet-400">
              {surfaceReports.filter((s: SurfaceIntegrity) => s.overallScore >= 95).length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Pristine</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {(surfaceReports.reduce((s: number, r: SurfaceIntegrity) => s + r.overallScore, 0) / surfaceReports.length).toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Avg Score</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {surfaceReports.filter((s: SurfaceIntegrity) => !s.chromePeeling).length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">No Peeling</div>
          </div>
        </div>

        <div className="space-y-3">
          {surfaceReports.map((report: SurfaceIntegrity) => {
            const condition = getConditionFromScore(report.overallScore);
            return (
              <div key={report.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-violet-500/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{getScanPlayer(report.scanId)}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold mt-1 inline-block ${getConditionColor(condition)}`}>
                      {condition}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      report.overallScore >= 95 ? 'text-violet-400' :
                      report.overallScore >= 85 ? 'text-emerald-400' :
                      report.overallScore >= 70 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {report.overallScore}
                    </div>
                    <div className="text-[10px] text-slate-500">overall score</div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-3">
                  {[
                    { label: 'Scratches', value: report.microScratchCount, max: 20, invert: true },
                    { label: 'Haze', value: report.surfaceHaze, max: 10, invert: true },
                    { label: 'Edge Wear', value: report.edgeWear, max: 10, invert: true },
                    { label: 'Print Line', value: report.printLinePresent ? 1 : 0, max: 1, invert: true },
                    { label: 'Peeling', value: report.chromePeeling ? 1 : 0, max: 1, invert: true },
                  ].map((metric) => {
                    const pct = metric.invert ? 100 - (metric.value / metric.max) * 100 : (metric.value / metric.max) * 100;
                    const color = pct >= 90 ? 'bg-violet-400' : pct >= 75 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';
                    const textColor = pct >= 90 ? 'text-violet-400' : pct >= 75 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400';
                    return (
                      <div key={metric.label} className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <div className={`text-sm font-bold ${textColor}`}>
                          {metric.value}
                        </div>
                        <div className="text-[8px] text-slate-500 uppercase">{metric.label}</div>
                        <div className="w-full bg-slate-700/50 rounded-full h-1 mt-1 overflow-hidden">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-900/50 rounded-lg px-3 py-2">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">Recommendations</div>
                  {report.recommendations.map((rec: string, i: number) => (
                    <p key={i} className="text-xs text-slate-400 leading-relaxed">{rec}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/30">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-emerald-500/10 text-cyan-400 border border-cyan-500/30">
                  <Scan size={10} />
                  Prismatic Analysis
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-wide text-white">
                Refractor <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Mapper</span>
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-4 border-b border-slate-700/50">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-violet-400 border-violet-400 bg-violet-400/5'
                    : 'text-slate-400 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? 'bg-violet-400/20 text-violet-400' : 'bg-slate-700 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {activeTab === 'scan' && renderScanResults()}
          {activeTab === 'signatures' && renderLightSignatures()}
          {activeTab === 'auth' && renderAuthentication()}
          {activeTab === 'surface' && renderSurfaceReport()}
        </div>
      </div>
    </div>
  );
};

export default RefractorMapperModal;
