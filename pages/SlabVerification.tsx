// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, AlertTriangle, Search, History, Bell, BookOpen, BarChart3, CheckCircle, XCircle, HelpCircle, Flag, Hash, Layers } from 'lucide-react';
import {
  getVerificationHistory,
  verifyCertAsync,
  getCounterfeitAlerts,
  reportCounterfeit,
  getVerificationStats,
  getRegistryEntry,
  checkPopulation,
  getFlaggedItems,
  getRecentVerifications,
  getBatchVerification,
  formatCertNumber,
  getStatusColor,
  getStatusLabel,
  getSeverityColor,
  getCompanyColor,
  getFlagIcon,
  type VerificationResult,
  type CounterfeitAlert,
  type VerificationStats,
  type RegistryEntry,
  type GradingCompany,
  type VerificationStatus,
} from '../lib/core/slabVerificationService';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

type TabId = 'verify' | 'history' | 'alerts' | 'registry';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'verify', label: 'Verify', icon: <Search className="w-4 h-4" /> },
  { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
  { id: 'alerts', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
  { id: 'registry', label: 'Registry', icon: <BookOpen className="w-4 h-4" /> },
];

const COMPANIES: GradingCompany[] = ['PSA', 'BGS', 'SGC', 'CGC'];

const PIE_COLORS = ['#4ade80', '#facc15', '#f87171', '#94a3b8'];

const SlabVerification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('verify');
  const [certInput, setCertInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<GradingCompany>('PSA');
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [verifyNotFound, setVerifyNotFound] = useState(false);
  const [history, setHistory] = useState<VerificationResult[]>([]);
  const [alerts, setAlerts] = useState<CounterfeitAlert[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [registryLookup, setRegistryLookup] = useState<RegistryEntry | null>(null);
  const [registryCert, setRegistryCert] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState<(VerificationResult | null)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setHistory(getVerificationHistory());
      setAlerts(getCounterfeitAlerts());
      setStats(getVerificationStats());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const flaggedItems = useMemo(() => getFlaggedItems(), [history]);

  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Authentic', value: stats.authenticCount },
      { name: 'Suspect', value: stats.suspectCount },
      { name: 'Counterfeit', value: stats.counterfeitCount },
      { name: 'Not Found', value: Math.max(0, stats.totalScans - stats.authenticCount - stats.suspectCount - stats.counterfeitCount) },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const handleVerify = async () => {
    if (!certInput.trim()) return;
    const result = await verifyCertAsync(certInput.trim(), selectedCompany);
    if (result) {
      setVerifyResult(result);
      setVerifyNotFound(false);
    } else {
      setVerifyResult(null);
      setVerifyNotFound(true);
    }
    setHistory(getVerificationHistory());
    setStats(getVerificationStats());
  };

  const handleBatchVerify = () => {
    const certs = batchInput.split('\n').map((c) => c.trim()).filter(Boolean);
    if (certs.length === 0) return;
    const results = getBatchVerification(certs);
    setBatchResults(results);
  };

  const handleRegistryLookup = () => {
    if (!registryCert.trim()) return;
    const entry = getRegistryEntry(registryCert.trim());
    setRegistryLookup(entry);
  };

  const statusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'authentic': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'suspect': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'counterfeit': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'not_found': return <HelpCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-lg">Loading Slab Verification Scanner...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">Slab Verification Scanner</h1>
            <p className="text-slate-400 text-sm">Verify graded card authenticity and detect counterfeits</p>
          </div>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-xs uppercase">Total Scans</div>
              <div className="text-2xl font-bold">{stats.totalScans}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-xs uppercase">Authentic</div>
              <div className="text-2xl font-bold text-green-400">{stats.authenticCount}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-xs uppercase">Suspect</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.suspectCount}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-xs uppercase">Counterfeit</div>
              <div className="text-2xl font-bold text-red-400">{stats.counterfeitCount}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-xs uppercase">Accuracy Rate</div>
              <div className="text-2xl font-bold text-blue-400">{stats.accuracyRate}%</div>
            </div>
          </div>
        )}

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2">Verification Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Verify Tab */}
        {activeTab === 'verify' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold">
                  {batchMode ? 'Batch Verification' : 'Single Verification'}
                </h2>
                <button
                  onClick={() => setBatchMode(!batchMode)}
                  className="ml-auto text-sm text-blue-400 hover:text-blue-300"
                >
                  {batchMode ? 'Switch to Single' : 'Switch to Batch'}
                </button>
              </div>

              {!batchMode ? (
                <div className="flex gap-3">
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value as GradingCompany)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
                  >
                    {COMPANIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="Enter cert number..."
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  />
                  <button
                    onClick={handleVerify}
                    className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-sm font-medium"
                  >
                    Verify
                  </button>
                </div>
              ) : (
                <div>
                  <textarea
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    placeholder="Enter cert numbers, one per line..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm h-32 mb-3"
                  />
                  <button
                    onClick={handleBatchVerify}
                    className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-sm font-medium"
                  >
                    Verify Batch
                  </button>
                </div>
              )}
            </div>

            {/* Single verification result */}
            {verifyResult && !batchMode && (
              <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  {statusIcon(verifyResult.verificationStatus)}
                  <h3 className="text-lg font-semibold">{verifyResult.cardName}</h3>
                  <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                    verifyResult.verificationStatus === 'authentic' ? 'bg-green-900 text-green-300' :
                    verifyResult.verificationStatus === 'suspect' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-red-900 text-red-300'
                  }`}>
                    {getStatusLabel(verifyResult.verificationStatus)}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-slate-400 text-xs">Cert #</div>
                    <div className="font-mono">{verifyResult.certNumber}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Company</div>
                    <div className={getCompanyColor(verifyResult.company)}>{verifyResult.company}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Grade</div>
                    <div className="font-semibold">{verifyResult.grade}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Population</div>
                    <div>{verifyResult.populationCount.toLocaleString()}</div>
                  </div>
                </div>
                {verifyResult.subgrades && (
                  <div className="grid grid-cols-4 gap-3 mb-4 bg-slate-700 rounded-lg p-3">
                    <div className="text-center">
                      <div className="text-slate-400 text-xs">Centering</div>
                      <div className="font-semibold">{verifyResult.subgrades.centering}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400 text-xs">Corners</div>
                      <div className="font-semibold">{verifyResult.subgrades.corners}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400 text-xs">Edges</div>
                      <div className="font-semibold">{verifyResult.subgrades.edges}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400 text-xs">Surface</div>
                      <div className="font-semibold">{verifyResult.subgrades.surface}</div>
                    </div>
                  </div>
                )}
                {verifyResult.lastSalePrice && (
                  <div className="mb-4">
                    <span className="text-slate-400 text-xs">Last Sale: </span>
                    <span className="text-green-400 font-semibold">${verifyResult.lastSalePrice.toLocaleString()}</span>
                  </div>
                )}
                {verifyResult.flags.length > 0 && (
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Flag className="w-4 h-4 text-red-400" />
                      Flags ({verifyResult.flags.length})
                    </div>
                    <div className="space-y-1">
                      {verifyResult.flags.map((flag, i) => (
                        <div key={i} className="text-sm text-yellow-300 flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" />
                          {flag.replace(/_/g, ' ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {verifyNotFound && !batchMode && (
              <div className="bg-slate-800 rounded-lg p-6 text-center">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No verification result found for this cert number and company.</p>
              </div>
            )}

            {/* Batch results */}
            {batchMode && batchResults.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Batch Results ({batchResults.length})</h3>
                <div className="space-y-3">
                  {batchResults.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-700 rounded-lg p-3">
                      {r ? (
                        <>
                          {statusIcon(r.verificationStatus)}
                          <div className="flex-1">
                            <div className="font-medium">{r.cardName}</div>
                            <div className="text-sm text-slate-400">{r.certNumber} - {r.company} {r.grade}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(r.verificationStatus)}`}>
                            {getStatusLabel(r.verificationStatus)}
                          </span>
                        </>
                      ) : (
                        <>
                          <HelpCircle className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-400">Not found</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" />
              Verification History ({history.length})
            </h2>
            {history.map((r) => (
              <div key={r.id} className="bg-slate-800 rounded-lg p-4 flex items-center gap-4">
                {statusIcon(r.verificationStatus)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.cardName}</div>
                  <div className="text-sm text-slate-400">
                    {r.company} | Cert #{r.certNumber} | {r.grade} | Pop: {r.populationCount.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${getStatusColor(r.verificationStatus)}`}>
                    {getStatusLabel(r.verificationStatus)}
                  </span>
                  <div className="text-xs text-slate-500">{r.scanDate}</div>
                </div>
                {r.flags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Flag className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400">{r.flags.length}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-400" />
              Counterfeit Alerts ({alerts.length})
            </h2>
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className={`w-5 h-5 ${getSeverityColor(alert.severity)}`} />
                  <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                    alert.severity === 'high' ? 'bg-red-900 text-red-300' :
                    alert.severity === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-blue-900 text-blue-300'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-sm text-slate-400 capitalize">{alert.alertType.replace(/_/g, ' ')}</span>
                  <span className="ml-auto text-xs text-slate-500">{alert.reportedDate}</span>
                </div>
                <p className="text-sm text-slate-300 mb-2">{alert.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Cert: {alert.certNumber}</span>
                  <span>Reports: {alert.reportCount}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Registry Tab */}
        {activeTab === 'registry' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-purple-400" />
                Registry Lookup
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={registryCert}
                  onChange={(e) => setRegistryCert(e.target.value)}
                  placeholder="Enter cert number..."
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleRegistryLookup()}
                />
                <button
                  onClick={handleRegistryLookup}
                  className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg text-sm font-medium"
                >
                  Lookup
                </button>
              </div>
              {registryLookup && (
                <div className="mt-4 bg-slate-700 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-slate-400 text-xs">Card</div>
                      <div className="font-medium">{registryLookup.cardName}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs">Company</div>
                      <div className={getCompanyColor(registryLookup.company)}>{registryLookup.company}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs">Grade</div>
                      <div>{registryLookup.grade}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs">Owner</div>
                      <div>{registryLookup.owner || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs">Registered</div>
                      <div className={registryLookup.registered ? 'text-green-400' : 'text-gray-400'}>
                        {registryLookup.registered ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlabVerification;
