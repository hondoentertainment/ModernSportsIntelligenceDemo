import React, { useMemo, useState } from 'react';
import {
  X,
  ScanLine,
  History,
  Box,
  Layers,
  Camera,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Award,
  BarChart3,
  Eye,
  EyeOff,
  Crosshair,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  scanCard,
  getScanHistory,
  getDisplayCases,
  getOverlayLayers,
  getAROverlay,
  getCameraConfig,
  getQuickValuation,
  ScanResult,
  OverlayLayerData,
} from '../lib/utils/arScannerService';

interface ArScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'scanner' | 'history' | 'display_cases' | 'overlays';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'scanner', label: 'Scanner', icon: <Camera size={14} /> },
  { id: 'history', label: 'History', icon: <History size={14} /> },
  { id: 'display_cases', label: 'Display Cases', icon: <Box size={14} /> },
  { id: 'overlays', label: 'Overlays', icon: <Layers size={14} /> },
];

export const ArScannerModal: React.FC<ArScannerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('scanner');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [overlayLayers, setOverlayLayers] = useState<OverlayLayerData[]>(() => getOverlayLayers());

  const history = useMemo(() => getScanHistory(), []);
  const cases = useMemo(() => getDisplayCases(), []);
  const cameraConfig = useMemo(() => getCameraConfig(), []);

  const handleScan = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      const result = scanCard();
      setScanResult(result);
      setScanning(false);
    }, 1500);
  };

  const toggleLayer = (layer: string) => {
    setOverlayLayers((prev) =>
      prev.map((l) => (l.layer === layer ? { ...l, enabled: !l.enabled } : l))
    );
  };

  if (!isOpen) return null;

  const overlay = scanResult ? getAROverlay(scanResult.cardId) : null;
  const valuation = scanResult ? getQuickValuation(scanResult.cardId) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-brand-lime/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-lime/10 text-brand-lime rounded-2xl border border-brand-lime/30">
              <ScanLine size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
                  <Camera size={10} />
                  Phase 126
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                AR Card <span className="text-brand-lime">Scanner</span> & Display
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-4 pb-0 border-b border-slate-700 shrink-0">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-brand-lime text-brand-lime bg-brand-lime/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          {activeTab === 'scanner' && (
            <div className="space-y-6">
              {/* Scanner Viewport */}
              <div className="relative bg-slate-950 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="aspect-video flex items-center justify-center relative">
                  {/* Camera Feed Simulation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                  <div className="absolute inset-8 border-2 border-dashed border-brand-lime/30 rounded-xl" />
                  <div className="absolute top-10 left-10 w-6 h-6 border-t-2 border-l-2 border-brand-lime" />
                  <div className="absolute top-10 right-10 w-6 h-6 border-t-2 border-r-2 border-brand-lime" />
                  <div className="absolute bottom-10 left-10 w-6 h-6 border-b-2 border-l-2 border-brand-lime" />
                  <div className="absolute bottom-10 right-10 w-6 h-6 border-b-2 border-r-2 border-brand-lime" />

                  {scanning ? (
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="animate-pulse">
                        <Crosshair size={48} className="text-brand-lime animate-spin" />
                      </div>
                      <p className="text-sm font-bold text-brand-lime animate-pulse">Scanning card...</p>
                    </div>
                  ) : scanResult ? (
                    <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                      <div className="p-3 bg-brand-lime/20 rounded-full">
                        <Zap size={28} className="text-brand-lime" />
                      </div>
                      <p className="text-lg font-bold text-white">{scanResult.player}</p>
                      <p className="text-sm text-slate-400">
                        {scanResult.year} {scanResult.set} &mdash; {scanResult.variation}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
                          {Math.round(scanResult.confidence * 100)}% match
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                          {scanResult.estimatedGrade}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <Camera size={48} className="text-slate-600" />
                      <p className="text-sm text-slate-500">Position card in frame to scan</p>
                    </div>
                  )}

                  {/* Camera Config Info */}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800/80 text-slate-400 border border-slate-700">
                      {cameraConfig.resolution}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800/80 text-slate-400 border border-slate-700">
                      AF {cameraConfig.autofocus ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scan Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="px-8 py-3 bg-brand-lime text-slate-900 font-bold rounded-2xl hover:bg-brand-lime/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ScanLine size={18} />
                  {scanning ? 'Scanning...' : 'Scan Card'}
                </button>
              </div>

              {/* Scan Result Details */}
              {scanResult && valuation && overlay && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Valuation */}
                  <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign size={14} className="text-brand-lime" />
                      <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Quick Valuation</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Low</p>
                        <p className="text-lg font-bebas tracking-wider text-slate-300">${valuation.low.toLocaleString()}</p>
                      </div>
                      <div className="border-x border-slate-700">
                        <p className="text-[10px] text-brand-lime uppercase font-bold mb-1">Mid</p>
                        <p className="text-lg font-bebas tracking-wider text-brand-lime">${valuation.mid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">High</p>
                        <p className="text-lg font-bebas tracking-wider text-slate-300">${valuation.high.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Grade Estimate */}
                  <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Award size={14} className="text-brand-lime" />
                      <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Grade Estimate</span>
                    </div>
                    <div className="space-y-2">
                      {overlay.gradeEstimate.map((g) => (
                        <div key={g.grade} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-300 w-14">{g.grade}</span>
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-lime rounded-full transition-all"
                              style={{ width: `${g.probability * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-10 text-right">
                            {Math.round(g.probability * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price History Chart */}
                  <div className="col-span-2 bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-brand-lime" />
                        <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Price History</span>
                      </div>
                      <span className={`text-xs font-bold flex items-center gap-1 ${overlay.trendDirection === 'up' ? 'text-emerald-400' : overlay.trendDirection === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
                        {overlay.trendDirection === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {overlay.trendPercent}%
                      </span>
                    </div>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={overlay.priceHistory}>
                          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                          <Tooltip
                            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', fontSize: 12 }}
                            labelStyle={{ color: '#94a3b8' }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
                          />
                          <Line type="monotone" dataKey="price" stroke="#a3e635" strokeWidth={2} dot={{ fill: '#a3e635', r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* History Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 text-center">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Total Scans</p>
                  <p className="text-2xl font-bebas tracking-wider text-white">{history.totalScans}</p>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 text-center">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Unique Cards</p>
                  <p className="text-2xl font-bebas tracking-wider text-brand-lime">{history.uniqueCards}</p>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 text-center">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Avg Confidence</p>
                  <p className="text-2xl font-bebas tracking-wider text-white">{Math.round(history.avgConfidence * 100)}%</p>
                </div>
              </div>

              {/* Recent Scans List */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <History size={14} className="text-brand-lime" />
                  <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Recent Scans</span>
                </div>
                <div className="space-y-2">
                  {history.recentScans.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/40 hover:border-slate-600 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-14 bg-slate-700 rounded-lg flex items-center justify-center">
                          <ScanLine size={16} className="text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{scan.player}</p>
                          <p className="text-xs text-slate-400">
                            {scan.year} {scan.set} &mdash; {scan.variation}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-brand-lime">${scan.estimatedValue.toLocaleString()}</p>
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-[10px] text-slate-500">{scan.estimatedGrade}</span>
                          <span className="text-[10px] text-slate-500">{Math.round(scan.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'display_cases' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Box size={14} className="text-brand-lime" />
                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Virtual Display Cases</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {cases.map((dc) => (
                  <div
                    key={dc.id}
                    className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 hover:border-brand-lime/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bebas tracking-widest text-white">{dc.name}</h4>
                        <p className="text-xs text-slate-400">{dc.theme.name} theme &bull; {dc.layout} layout</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
                        {dc.cardCount} cards
                      </span>
                    </div>
                    {/* 3D Case Preview */}
                    <div
                      className="h-32 rounded-xl border border-slate-700/50 flex items-center justify-center relative overflow-hidden"
                      style={{ backgroundColor: dc.theme.background }}
                    >
                      <div className="flex gap-3">
                        {dc.cards.slice(0, 4).map((_, i) => (
                          <div
                            key={i}
                            className="w-16 h-24 rounded-lg border border-slate-600/50"
                            style={{
                              background: `linear-gradient(135deg, ${dc.theme.accent}22, ${dc.theme.accent}08)`,
                              borderColor: `${dc.theme.accent}44`,
                              transform: `rotate(${(i - 1.5) * 3}deg)`,
                            }}
                          />
                        ))}
                      </div>
                      <div className="absolute bottom-2 right-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: dc.theme.accent }}>
                          {dc.lighting}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-500">
                      <span>Material: {dc.theme.shelfMaterial}</span>
                      <span>&bull;</span>
                      <span>Created: {new Date(dc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'overlays' && (
            <div className="space-y-6">
              {/* Layer Toggles */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Layers size={14} className="text-brand-lime" />
                  <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">AR Overlay Layers</span>
                </div>
                <div className="space-y-2">
                  {overlayLayers.map((layer) => (
                    <button
                      key={layer.layer}
                      onClick={() => toggleLayer(layer.layer)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        layer.enabled
                          ? 'bg-slate-800/60 border-slate-600'
                          : 'bg-slate-800/20 border-slate-700/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: layer.enabled ? layer.color : '#475569' }}
                        />
                        <span className={`text-sm font-bold ${layer.enabled ? 'text-white' : 'text-slate-500'}`}>
                          {layer.label}
                        </span>
                      </div>
                      {layer.enabled ? (
                        <Eye size={16} className="text-brand-lime" />
                      ) : (
                        <EyeOff size={16} className="text-slate-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overlay Preview */}
              <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={14} className="text-brand-lime" />
                  <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Pop Report Preview</span>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { grade: 'PSA 10', population: 1245 },
                        { grade: 'PSA 9', population: 3870 },
                        { grade: 'PSA 8', population: 2104 },
                        { grade: 'PSA 7', population: 890 },
                        { grade: 'PSA 6', population: 410 },
                      ]}
                    >
                      <XAxis dataKey="grade" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', fontSize: 12 }}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                      <Bar dataKey="population" radius={[6, 6, 0, 0]}>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Cell key={i} fill={i === 0 ? '#a3e635' : i === 1 ? '#86efac' : '#475569'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Active Layers Summary */}
              <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/40">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Active Layers</p>
                <div className="flex flex-wrap gap-2">
                  {overlayLayers
                    .filter((l) => l.enabled)
                    .map((l) => (
                      <span
                        key={l.layer}
                        className="px-3 py-1 rounded-full text-xs font-bold border"
                        style={{
                          color: l.color,
                          borderColor: `${l.color}44`,
                          backgroundColor: `${l.color}11`,
                        }}
                      >
                        {l.label}
                      </span>
                    ))}
                  {overlayLayers.filter((l) => l.enabled).length === 0 && (
                    <span className="text-xs text-slate-500">No layers active</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArScannerModal;
