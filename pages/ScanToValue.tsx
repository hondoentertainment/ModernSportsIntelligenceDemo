import React, { useState, useCallback, useMemo } from 'react';
import {
  Camera,
  Upload,
  History,
  Layers,
  BarChart3,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  Package,
  Plus,
  ScanLine,
  Image as ImageIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  ScanResult,
  QuickValuation,
  BatchScan,
  getRecentScans,
  scanCard,
  getScanById,
  getQuickValuation,
  getBatchScans,
  createBatchScan,
  addToBatch,
  addToCollection,
  getScanStats,
  getScanHistory,
  getTopScannedCards,
  formatCurrency,
  getConfidenceColor,
  getConfidenceLabel,
  getGradeColor,
} from '../lib/scanToValueService';

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------
const TABS = [
  { id: 'scan', label: 'Scan', icon: Camera },
  { id: 'recent', label: 'Recent Scans', icon: History },
  { id: 'batch', label: 'Batch Mode', icon: Layers },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
] as const;

type TabId = (typeof TABS)[number]['id'];

const PIE_COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb923c'];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ScanToValue() {
  const [activeTab, setActiveTab] = useState<TabId>('scan');

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ScanLine className="w-8 h-8 text-blue-400" />
          Scan-to-Value
        </h1>
        <p className="text-slate-400 mt-1">
          Scan your cards, get instant identification and market valuation
        </p>
      </header>

      {/* Tab bar */}
      <nav className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Tab panels */}
      {activeTab === 'scan' && <ScanTab />}
      {activeTab === 'recent' && <RecentScansTab />}
      {activeTab === 'batch' && <BatchModeTab />}
      {activeTab === 'stats' && <StatsTab />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scan Tab
// ---------------------------------------------------------------------------
function ScanTab() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [valuation, setValuation] = useState<QuickValuation | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleScan = useCallback(() => {
    setScanning(true);
    setTimeout(() => {
      const scanResult = scanCard('simulated-image-data');
      setResult(scanResult);
      setValuation(getQuickValuation(scanResult.id));
      setScanning(false);
    }, 1500);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleScan();
    },
    [handleScan],
  );

  const handleAddToCollection = useCallback(() => {
    if (!result) return;
    const updated = addToCollection(result.id);
    if (updated) setResult(updated);
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Upload / camera zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={handleScan}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-blue-400 bg-blue-900/20' : 'border-slate-600 bg-slate-800 hover:border-slate-500'
        }`}
      >
        {scanning ? (
          <div className="flex flex-col items-center gap-3 animate-pulse">
            <ScanLine className="w-16 h-16 text-blue-400" />
            <p className="text-lg font-medium">Scanning card...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-4">
              <Camera className="w-12 h-12 text-slate-400" />
              <Upload className="w-12 h-12 text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-300">
              Click to scan or drag &amp; drop an image
            </p>
            <p className="text-sm text-slate-500">Supports JPG, PNG, HEIC up to 20 MB</p>
          </div>
        )}
      </div>

      {/* Scan result card */}
      {result && (
        <div className="bg-slate-800 rounded-xl p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold">{result.cardName}</h2>
              <p className="text-slate-400 text-sm">
                {result.sport} &middot; {result.year} &middot; {result.set}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(result.estimatedValue)}
              </p>
              <p className="text-slate-400 text-sm">Estimated Value</p>
            </div>
          </div>

          {/* Confidence meter */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Scan Confidence</span>
              <span className={getConfidenceColor(result.scanConfidence)}>
                {result.scanConfidence}% &mdash; {getConfidenceLabel(result.scanConfidence)}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${result.scanConfidence}%` }}
              />
            </div>
          </div>

          {/* Estimated grade */}
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-slate-400">Estimated Grade:</span>
            <span className={`font-bold ${getGradeColor(String(result.estimatedGrade))}`}>
              {result.estimatedGrade}
            </span>
          </div>

          {/* Matched cards */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Matched Cards
            </h3>
            <div className="space-y-2">
              {result.matchedCards.map((mc, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-slate-700/50 rounded-lg p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{mc.cardName}</p>
                    {mc.grade && <p className="text-xs text-slate-400">{mc.grade}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(mc.marketValue)}</p>
                    <p className="text-xs text-slate-400">{mc.confidence}% match</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add to collection button */}
          <button
            onClick={handleAddToCollection}
            disabled={result.addedToCollection}
            className={`w-full py-2 rounded-lg font-medium transition-colors ${
              result.addedToCollection
                ? 'bg-green-600/20 text-green-400 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {result.addedToCollection ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Added to Collection
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add to Collection
              </span>
            )}
          </button>
        </div>
      )}

      {/* Quick valuation panel */}
      {valuation && (
        <div className="bg-slate-800 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Quick Valuation
          </h3>

          {/* Raw vs graded */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Raw</p>
              <p className="font-bold">{formatCurrency(valuation.rawValue)}</p>
            </div>
            {valuation.gradedValues.slice(0, 3).map((gv) => (
              <div key={gv.grade} className="bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">{gv.grade}</p>
                <p className="font-bold">{formatCurrency(gv.value)}</p>
              </div>
            ))}
          </div>

          {/* Price range */}
          <div>
            <p className="text-sm text-slate-400 mb-2">Price Range</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-red-400">{formatCurrency(valuation.priceRange.low)}</span>
              <div className="flex-1 h-2 bg-slate-700 rounded-full relative">
                <div
                  className="absolute h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                  style={{ width: '100%' }}
                />
              </div>
              <span className="text-green-400">{formatCurrency(valuation.priceRange.high)}</span>
            </div>
          </div>

          {/* Recent sales table */}
          <div>
            <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Recent Sales
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-left border-b border-slate-700">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Platform</th>
                    <th className="pb-2">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {valuation.recentSales.map((sale, idx) => (
                    <tr key={idx} className="border-b border-slate-700/50">
                      <td className="py-2">{sale.date}</td>
                      <td className="py-2 font-medium">{formatCurrency(sale.price)}</td>
                      <td className="py-2">{sale.platform}</td>
                      <td className="py-2 text-slate-400">{sale.grade ?? 'Raw'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recent Scans Tab
// ---------------------------------------------------------------------------
function RecentScansTab() {
  const scans = useMemo(() => getRecentScans(), []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Scan History Timeline</h2>
      {scans.map((scan) => (
        <div key={scan.id} className="bg-slate-800 rounded-xl p-4 flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <ImageIcon className="w-10 h-10 text-slate-500" />
            <div>
              <p className="font-medium">{scan.cardName}</p>
              <p className="text-sm text-slate-400">
                {scan.sport} &middot; {new Date(scan.scanTimestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${getConfidenceColor(scan.scanConfidence)}`}>
              {scan.scanConfidence}%
            </span>
            <span className="font-bold text-green-400">{formatCurrency(scan.estimatedValue)}</span>
            {scan.addedToCollection ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-slate-600" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Batch Mode Tab
// ---------------------------------------------------------------------------
function BatchModeTab() {
  const [batches, setBatches] = useState<BatchScan[]>(() => getBatchScans());
  const [newName, setNewName] = useState('');

  const handleCreate = useCallback(() => {
    if (!newName.trim()) return;
    const batch = createBatchScan(newName.trim());
    setBatches((prev) => [...prev, batch]);
    setNewName('');
  }, [newName]);

  return (
    <div className="space-y-6">
      {/* Create batch */}
      <div className="bg-slate-800 rounded-xl p-4 flex gap-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New batch name..."
          className="flex-1 bg-slate-700 rounded-lg px-4 py-2 text-sm outline-none placeholder-slate-500"
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>

      {/* Batch list */}
      {batches.map((batch) => (
        <div key={batch.id} className="bg-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold">{batch.name}</h3>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-400">{formatCurrency(batch.totalValue)}</p>
              <p className="text-xs text-slate-400">{batch.items.length} cards</p>
            </div>
          </div>
          {batch.items.length > 0 && (
            <div className="space-y-2">
              {batch.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-700/50 rounded-lg p-3 flex justify-between items-center text-sm"
                >
                  <span>{item.cardName}</span>
                  <span className="font-medium">{formatCurrency(item.estimatedValue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats Tab
// ---------------------------------------------------------------------------
function StatsTab() {
  const stats = useMemo(() => getScanStats(), []);
  const history = useMemo(() => getScanHistory(), []);
  const topCards = useMemo(() => getTopScannedCards(), []);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Scans', value: stats.totalScans },
          { label: 'Avg Confidence', value: `${stats.avgConfidence}%` },
          { label: 'Total Value', value: formatCurrency(stats.totalValue) },
          { label: 'Added to Collection', value: stats.addedCount },
        ].map((item) => (
          <div key={item.label} className="bg-slate-800 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">{item.label}</p>
            <p className="text-xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Scans per day chart */}
      <div className="bg-slate-800 rounded-xl p-5">
        <h3 className="font-bold mb-4">Scans Per Day</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={history.scansByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis stroke="#94a3b8" allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sport breakdown pie */}
      <div className="bg-slate-800 rounded-xl p-5">
        <h3 className="font-bold mb-4">Scans by Sport</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={stats.sportBreakdown}
              dataKey="count"
              nameKey="sport"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ sport, count }) => `${sport}: ${count}`}
            >
              {stats.sportBreakdown.map((_, idx) => (
                <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top scanned cards */}
      <div className="bg-slate-800 rounded-xl p-5">
        <h3 className="font-bold mb-4">Top Scanned Cards by Value</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={topCards.map((c) => ({ name: c.player, value: c.estimatedValue }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
            <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
