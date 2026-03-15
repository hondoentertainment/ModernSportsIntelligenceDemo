import React, { useState, useEffect, useMemo } from 'react';
import {
  ScanLine,
  Box,
  History,
  Camera,
  Eye,
  EyeOff,
  Layers,
  TrendingUp,
} from 'lucide-react';
import {
  getScanHistory,
  getDisplayCases,
  getOverlayLayers,
  getAROverlay,
  getCameraConfig,
  type ScanHistory as ScanHistoryType,
  type DisplayCase3D,
  type OverlayLayerData,
  type AROverlay,
  type CameraConfig,
  type ScanResult,
} from '../lib/arScannerService.ts';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

const ArScanner: React.FC = () => {
  const [scanHistory, setScanHistory] = useState<ScanHistoryType | null>(null);
  const [displayCases, setDisplayCases] = useState<DisplayCase3D[]>([]);
  const [_overlayLayers, setOverlayLayers] = useState<OverlayLayerData[]>([]);
  const [cameraConfig, setCameraConfig] = useState<CameraConfig | null>(null);
  const [selectedCard, setSelectedCard] = useState<ScanResult | null>(null);
  const [overlay, setOverlay] = useState<AROverlay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setScanHistory(getScanHistory());
      setDisplayCases(getDisplayCases());
      setOverlayLayers(getOverlayLayers());
      setCameraConfig(getCameraConfig());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCard) {
      setOverlay(getAROverlay(selectedCard.cardId));
    } else {
      setOverlay(null);
    }
  }, [selectedCard]);

  const totalPortfolioValue = useMemo(() => {
    if (!scanHistory) return 0;
    return scanHistory.recentScans.reduce((sum, s) => sum + s.estimatedValue, 0);
  }, [scanHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading AR Scanner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <ScanLine size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">AR Scanner &amp; Display Cases</h1>
            <p className="text-sm text-slate-400">
              Scan cards for instant identification, overlay data &amp; build virtual display cases &mdash; Phase 124
            </p>
          </div>
        </div>
        {cameraConfig && (
          <div className="flex items-center gap-2">
            <Camera size={14} className="text-slate-500" />
            <span className="text-[10px] text-slate-500">{cameraConfig.resolution} &middot; {cameraConfig.scanMode} mode</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Scans</p>
          <p className="text-3xl font-bold text-cyan-400">{scanHistory?.totalScans ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">cards scanned</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Unique Cards</p>
          <p className="text-3xl font-bold text-purple-400">{scanHistory?.uniqueCards ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">identified</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Confidence</p>
          <p className="text-3xl font-bold text-emerald-400">{((scanHistory?.avgConfidence ?? 0) * 100).toFixed(1)}%</p>
          <p className="text-xs text-slate-600 mt-1">identification accuracy</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Portfolio Value</p>
          <p className="text-3xl font-bold text-amber-400">${totalPortfolioValue.toLocaleString()}</p>
          <p className="text-xs text-slate-600 mt-1">total scanned value</p>
        </div>
      </div>

      {/* Scan History & Overlay */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan History List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <History size={18} className="text-purple-400" />
            Scan History
          </h2>
          <div className="space-y-3">
            {scanHistory?.recentScans.map(scan => (
              <button
                key={scan.id}
                onClick={() => setSelectedCard(selectedCard?.id === scan.id ? null : scan)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedCard?.id === scan.id
                    ? 'bg-slate-800 border-brand-lime/50 shadow-lg shadow-brand-lime/5'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <ScanLine size={14} className="text-cyan-400" />
                    <p className="text-sm font-bold text-white">{scan.player}</p>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded">{scan.sport}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">${scan.estimatedValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{scan.year} {scan.set} &middot; {scan.variation}</span>
                  <span>Grade Est: {scan.estimatedGrade} &middot; Conf: {(scan.confidence * 100).toFixed(0)}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AR Overlay Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Layers size={18} className="text-cyan-400" />
            AR Overlay
          </h2>
          {overlay ? (
            <div className="space-y-3">
              {/* Overlay Layers Toggle */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium mb-3">Overlay Layers</p>
                {overlay.layers.map(layer => (
                  <div key={layer.layer} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
                      <span className="text-xs text-slate-300">{layer.label}</span>
                    </div>
                    {layer.enabled ? (
                      <Eye size={14} className="text-brand-lime" />
                    ) : (
                      <EyeOff size={14} className="text-slate-600" />
                    )}
                  </div>
                ))}
              </div>

              {/* Price History Chart */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium mb-3 flex items-center gap-1">
                  <TrendingUp size={12} className="text-brand-lime" /> Price History
                </p>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={overlay.priceHistory}>
                      <defs>
                        <linearGradient id="arPriceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#84cc16" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
                      />
                      <Area type="monotone" dataKey="price" stroke="#84cc16" strokeWidth={2} fill="url(#arPriceGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Grade Estimate */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium mb-3">Grade Probability</p>
                {overlay.gradeEstimate.map(ge => (
                  <div key={ge.grade} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-slate-300 w-14">{ge.grade}</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${ge.probability * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 w-10 text-right">{(ge.probability * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>

              {/* Pop Report */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium mb-3">Pop Report</p>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overlay.popReport}>
                      <XAxis dataKey="grade" tick={{ fontSize: 9, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Bar dataKey="population" fill="#f472b6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
              <ScanLine size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Select a scanned card to view AR overlay data</p>
              <p className="text-xs text-slate-600 mt-1">Includes pricing, grade estimates, pop report &amp; comps</p>
            </div>
          )}
        </div>
      </div>

      {/* Display Cases */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Box size={18} className="text-amber-400" />
          Virtual Display Cases
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayCases.map(dc => (
            <div key={dc.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-white">{dc.name}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 uppercase">{dc.layout}</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-4 h-4 rounded" style={{ backgroundColor: dc.theme.accent }} />
                <span className="text-xs text-slate-400">{dc.theme.name}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">{dc.cardCount} cards</span>
                <span className="text-slate-500">{dc.theme.lighting} lighting</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {dc.cards.slice(0, 3).map(cardId => {
                  const scan = scanHistory?.recentScans.find(s => s.cardId === cardId);
                  return scan ? (
                    <span key={cardId} className="text-[10px] px-1.5 py-0.5 bg-slate-700/50 text-slate-300 rounded truncate max-w-[120px]">
                      {scan.player}
                    </span>
                  ) : null;
                })}
                {dc.cards.length > 3 && (
                  <span className="text-[10px] text-slate-600">+{dc.cards.length - 3} more</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Scanned Players */}
      {scanHistory && scanHistory.topPlayers.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Camera size={18} className="text-slate-400" />
            Most Scanned Players
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {scanHistory.topPlayers.map((tp, i) => (
              <div key={tp.player} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">#{i + 1}</p>
                <p className="text-sm font-bold text-white truncate">{tp.player}</p>
                <p className="text-lg font-bold text-cyan-400">{tp.scanCount}</p>
                <p className="text-[10px] text-slate-600">scans</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArScanner;
