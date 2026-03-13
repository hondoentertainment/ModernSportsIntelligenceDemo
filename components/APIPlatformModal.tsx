import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  Key,
  BookOpen,
  Webhook,
  Download,
  BarChart3,
  Plus,
  Copy,
  Trash2,
  Play,
  Pause,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  FileJson,
  FileSpreadsheet,
  FileText,
  File,
  Plug,
  Activity,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  APIKey,
  APIEndpoint,
  WebhookConfig,
  ExportJob,
  APIUsage,
  getAPIKeys,
  createAPIKey,
  revokeAPIKey,
  getEndpointDocs,
  getWebhooks,
  createWebhook,
  updateWebhookStatus,
  deleteWebhook,
  testWebhook,
  getAPIUsage,
  createExportJob,
  getExportHistory,
  getAPIPlatformStats,
  WEBHOOK_EVENTS,
} from '../lib/apiPlatformService';

interface APIPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'keys' | 'docs' | 'webhooks' | 'exports' | 'usage';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'keys', label: 'API Keys', icon: <Key size={16} /> },
  { id: 'docs', label: 'Documentation', icon: <BookOpen size={16} /> },
  { id: 'webhooks', label: 'Webhooks', icon: <Webhook size={16} /> },
  { id: 'exports', label: 'Exports', icon: <Download size={16} /> },
  { id: 'usage', label: 'Usage', icon: <BarChart3 size={16} /> },
];

const TIER_COLORS: Record<string, string> = {
  free: 'bg-slate-600 text-slate-200',
  pro: 'bg-cyan-900/60 text-cyan-300',
  enterprise: 'bg-lime-900/60 text-lime-300',
};

const STATUS_DOT: Record<string, string> = {
  active: 'bg-green-400',
  suspended: 'bg-amber-400',
  revoked: 'bg-red-400',
  paused: 'bg-amber-400',
  failed: 'bg-red-400',
};

// ---- Syntax-highlighted JSON ----

function SyntaxJSON({ code }: { code: string }) {
  const highlighted = code.replace(
    /("(?:[^"\\]|\\.)*")\s*:/g,
    '<span class="text-cyan-400">$1</span>:'
  ).replace(
    /:\s*("(?:[^"\\]|\\.)*")/g,
    ': <span class="text-green-400">$1</span>'
  ).replace(
    /:\s*(-?\d+\.?\d*)/g,
    ': <span class="text-amber-400">$1</span>'
  ).replace(
    /:\s*(true|false|null)/g,
    ': <span class="text-purple-400">$1</span>'
  );

  return (
    <pre
      className="text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-x-auto text-slate-300 whitespace-pre"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ==================== API Keys Tab ====================

const APIKeysTab: React.FC<{
  keys: APIKey[];
  onRefresh: () => void;
}> = ({ keys, onRefresh }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTier, setNewTier] = useState<APIKey['tier']>('free');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createAPIKey(newName.trim(), newTier);
    setNewName('');
    setShowCreate(false);
    onRefresh();
  };

  const handleRevoke = (id: string) => {
    revokeAPIKey(id);
    onRefresh();
  };

  const handleCopy = (key: string, id: string) => {
    navigator.clipboard?.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Manage your API keys for programmatic access.</p>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-lime-600 hover:bg-lime-500 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus size={14} /> New Key
        </button>
      </div>

      {showCreate && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Key Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Production App"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-lime-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tier</label>
            <div className="flex gap-2">
              {(['free', 'pro', 'enterprise'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setNewTier(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    newTier === t ? 'bg-lime-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
            <button onClick={handleCreate} className="px-4 py-1.5 bg-lime-600 hover:bg-lime-500 text-white text-xs font-semibold rounded-lg transition-colors">
              Generate Key
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {keys.map(k => (
          <div
            key={k.id}
            className={`bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 ${k.status === 'revoked' ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${STATUS_DOT[k.status]}`} />
                <span className="text-sm font-semibold text-white">{k.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${TIER_COLORS[k.tier]}`}>
                  {k.tier}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(k.key, k.id)}
                  className="p-1.5 text-slate-500 hover:text-white transition-colors"
                  title="Copy key"
                >
                  {copiedId === k.id ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
                {k.status !== 'revoked' && (
                  <button
                    onClick={() => handleRevoke(k.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Revoke key"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <code className="text-xs font-mono text-slate-500 block mb-2">{k.key}</code>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span>Created {formatDate(k.createdAt)}</span>
              <span>Last used {formatDateTime(k.lastUsed)}</span>
              <span>{k.requestsToday.toLocaleString()} / {k.requestsLimit.toLocaleString()} today</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== Documentation Tab ====================

const DocsTab: React.FC<{ endpoints: APIEndpoint[] }> = ({ endpoints }) => {
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [tryItResult, setTryItResult] = useState<Record<string, string>>({});

  const handleTryIt = (endpoint: APIEndpoint) => {
    setTryItResult(prev => ({
      ...prev,
      [endpoint.path]: endpoint.responseExample,
    }));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400 mb-2">Interactive API reference. Base URL: <code className="text-lime-400 font-mono text-xs">https://api.msisports.io</code></p>
      {endpoints.map(ep => {
        const isExpanded = expandedPath === ep.path;
        const methodColor = ep.method === 'GET' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300';
        return (
          <div key={ep.path} className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedPath(isExpanded ? null : ep.path)}
              className="w-full flex items-center gap-3 p-3 hover:bg-slate-800/60 transition-colors text-left"
            >
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${methodColor}`}>
                {ep.method}
              </span>
              <code className="text-sm font-mono text-white flex-1">{ep.path}</code>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${TIER_COLORS[ep.tier]}`}>
                {ep.tier}
              </span>
              {isExpanded ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
            </button>

            {isExpanded && (
              <div className="border-t border-slate-700/50 p-4 space-y-4">
                <p className="text-sm text-slate-300">{ep.description}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Rate limit: <span className="text-slate-300">{ep.rateLimit} req/min</span></span>
                  <span>Tier: <span className="text-slate-300 capitalize">{ep.tier}</span></span>
                </div>

                {ep.parameters.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Parameters</h4>
                    <div className="bg-slate-900/60 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-800">
                            <th className="text-left p-2 text-slate-500 font-medium">Name</th>
                            <th className="text-left p-2 text-slate-500 font-medium">Type</th>
                            <th className="text-left p-2 text-slate-500 font-medium">Required</th>
                            <th className="text-left p-2 text-slate-500 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ep.parameters.map(param => (
                            <tr key={param.name} className="border-b border-slate-800/50">
                              <td className="p-2 font-mono text-cyan-400">{param.name}</td>
                              <td className="p-2 text-slate-400">{param.type}</td>
                              <td className="p-2">
                                {param.required
                                  ? <span className="text-amber-400">required</span>
                                  : <span className="text-slate-600">optional</span>}
                              </td>
                              <td className="p-2 text-slate-400">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Response Example</h4>
                    <button
                      onClick={() => handleTryIt(ep)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-lime-600/20 text-lime-400 hover:bg-lime-600/30 text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Play size={12} /> Try It
                    </button>
                  </div>
                  <SyntaxJSON code={ep.responseExample} />
                </div>

                {tryItResult[ep.path] && (
                  <div>
                    <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">
                      <CheckCircle2 size={12} className="inline mr-1" />
                      200 OK — Simulated Response
                    </h4>
                    <SyntaxJSON code={tryItResult[ep.path]} />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ==================== Webhooks Tab ====================

const WebhooksTab: React.FC<{
  webhooks: WebhookConfig[];
  onRefresh: () => void;
}> = ({ webhooks, onRefresh }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; statusCode: number; latency: number } | null>>({});

  const handleCreate = () => {
    if (!newName.trim() || !newUrl.trim() || selectedEvents.length === 0) return;
    createWebhook({ name: newName.trim(), url: newUrl.trim(), events: selectedEvents });
    setNewName('');
    setNewUrl('');
    setSelectedEvents([]);
    setShowCreate(false);
    onRefresh();
  };

  const toggleEvent = (evt: string) => {
    setSelectedEvents(prev =>
      prev.includes(evt) ? prev.filter(e => e !== evt) : [...prev, evt]
    );
  };

  const handleTest = (id: string) => {
    const result = testWebhook(id);
    setTestResults(prev => ({ ...prev, [id]: result }));
    setTimeout(() => setTestResults(prev => ({ ...prev, [id]: null })), 4000);
  };

  const handleToggleStatus = (id: string, current: WebhookConfig['status']) => {
    const newStatus = current === 'active' ? 'paused' : 'active';
    updateWebhookStatus(id, newStatus);
    onRefresh();
  };

  const handleDelete = (id: string) => {
    deleteWebhook(id);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Configure webhooks for real-time event notifications.</p>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-lime-600 hover:bg-lime-500 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus size={14} /> New Webhook
        </button>
      </div>

      {showCreate && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Webhook Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Price Alert Relay"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-lime-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Endpoint URL</label>
            <input
              type="text"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://your-app.com/webhook"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-lime-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Events</label>
            <div className="flex flex-wrap gap-1.5">
              {WEBHOOK_EVENTS.map(evt => (
                <button
                  key={evt}
                  onClick={() => toggleEvent(evt)}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                    selectedEvents.includes(evt)
                      ? 'bg-lime-600 text-white'
                      : 'bg-slate-800 text-slate-500 hover:text-white'
                  }`}
                >
                  {evt}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
            <button onClick={handleCreate} className="px-4 py-1.5 bg-lime-600 hover:bg-lime-500 text-white text-xs font-semibold rounded-lg transition-colors">
              Create Webhook
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {webhooks.map(wh => {
          const tr = testResults[wh.id];
          return (
            <div key={wh.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${STATUS_DOT[wh.status]}`} />
                  <span className="text-sm font-semibold text-white">{wh.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{wh.status}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTest(wh.id)}
                    className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
                    title="Test webhook"
                  >
                    <Send size={14} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(wh.id, wh.status)}
                    className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors"
                    title={wh.status === 'active' ? 'Pause' : 'Resume'}
                  >
                    {wh.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    onClick={() => handleDelete(wh.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <code className="text-xs font-mono text-slate-500 block mb-2">{wh.url}</code>
              <div className="flex flex-wrap gap-1 mb-2">
                {wh.events.map(evt => (
                  <span key={evt} className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px]">{evt}</span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500">
                {wh.lastTriggered && <span>Last triggered: {formatDateTime(wh.lastTriggered)}</span>}
                {wh.failureCount > 0 && (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertTriangle size={10} /> {wh.failureCount} failures
                  </span>
                )}
              </div>
              {tr && (
                <div className={`mt-2 text-xs px-3 py-1.5 rounded-lg ${tr.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                  {tr.success ? <CheckCircle2 size={12} className="inline mr-1" /> : <XCircle size={12} className="inline mr-1" />}
                  {tr.statusCode} — {tr.latency}ms
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== Exports Tab ====================

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  json: <FileJson size={16} className="text-amber-400" />,
  csv: <FileSpreadsheet size={16} className="text-green-400" />,
  xlsx: <FileSpreadsheet size={16} className="text-emerald-400" />,
  pdf: <FileText size={16} className="text-red-400" />,
};

const ExportsTab: React.FC<{
  exports: ExportJob[];
  onRefresh: () => void;
}> = ({ exports: exportList, onRefresh }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportJob['format']>('csv');
  const [selectedDataType, setSelectedDataType] = useState<ExportJob['dataType']>('portfolio');

  const handleExport = () => {
    createExportJob(selectedFormat, selectedDataType);
    onRefresh();
    // Poll for completion
    setTimeout(() => onRefresh(), 3000);
    setTimeout(() => onRefresh(), 6000);
  };

  return (
    <div className="space-y-4">
      {/* Create Export */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3">New Export</h4>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Data Type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['portfolio', 'transactions', 'analytics', 'tax_report'] as const).map(dt => (
                <button
                  key={dt}
                  onClick={() => setSelectedDataType(dt)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    selectedDataType === dt ? 'bg-lime-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {dt.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Format</label>
            <div className="flex gap-1.5">
              {(['csv', 'json', 'pdf', 'xlsx'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors ${
                    selectedFormat === fmt ? 'bg-lime-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {FORMAT_ICONS[fmt]} {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-4 py-2 bg-lime-600 hover:bg-lime-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Download size={14} /> Generate Export
        </button>
      </div>

      {/* Export History */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Export History</h4>
        <div className="space-y-2">
          {exportList.map(exp => (
            <div key={exp.id} className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
              <div className="flex-shrink-0">
                {FORMAT_ICONS[exp.format] || <File size={16} className="text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white capitalize">{exp.dataType.replace('_', ' ')}</span>
                  <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] uppercase">{exp.format}</span>
                  {exp.status === 'complete' && (
                    <span className="text-[10px] text-green-400 flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> Complete
                    </span>
                  )}
                  {exp.status === 'processing' && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                      <RefreshCw size={10} className="animate-spin" /> Processing
                    </span>
                  )}
                  {exp.status === 'queued' && (
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                      <Clock size={10} /> Queued
                    </span>
                  )}
                  {exp.status === 'failed' && (
                    <span className="text-[10px] text-red-400 flex items-center gap-0.5">
                      <XCircle size={10} /> Failed
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {formatDateTime(exp.createdAt)}
                  {exp.fileSize && <> &middot; {formatBytes(exp.fileSize)}</>}
                </div>
              </div>
              {exp.status === 'complete' && exp.downloadUrl && (
                <button className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors flex items-center gap-1">
                  <Download size={12} /> Download
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== Usage Tab ====================

const UsageTab: React.FC<{ usage: APIUsage[] }> = ({ usage }) => {
  const chartData = useMemo(
    () => usage.map(d => ({
      date: d.date.slice(5), // MM-DD
      requests: d.requests,
      errors: d.errors,
      latency: d.avgLatency,
    })),
    [usage]
  );

  const topEndpointsAgg = useMemo(() => {
    const counts: Record<string, number> = {};
    usage.forEach(d => d.topEndpoints.forEach(ep => {
      counts[ep.path] = (counts[ep.path] || 0) + ep.count;
    }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, count]) => ({ path: path.replace('/api/v1/', ''), count }));
  }, [usage]);

  const totalRequests = usage.reduce((s, d) => s + d.requests, 0);
  const totalErrors = usage.reduce((s, d) => s + d.errors, 0);
  const errorRate = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : '0';
  const avgLatency = usage.length > 0
    ? Math.round(usage.reduce((s, d) => s + d.avgLatency, 0) / usage.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-white">{totalRequests.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 uppercase">Total Requests</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-white">{totalErrors.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 uppercase">Total Errors</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-red-400">{errorRate}%</p>
          <p className="text-[10px] text-slate-500 uppercase">Error Rate</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-cyan-400">{avgLatency}ms</p>
          <p className="text-[10px] text-slate-500 uppercase">Avg Latency</p>
        </div>
      </div>

      {/* Requests Line Chart */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Daily API Requests (30d)</h4>
        <div className="bg-slate-800/30 rounded-xl p-3" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} interval={4} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line type="monotone" dataKey="requests" stroke="#84cc16" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Endpoints Bar Chart */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Top Endpoints (30d)</h4>
        <div className="bg-slate-800/30 rounded-xl p-3" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topEndpointsAgg} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis
                dataKey="path"
                type="category"
                width={140}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="count" fill="#22d3ee" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ==================== Main Modal ====================

const APIPlatformModal: React.FC<APIPlatformModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('keys');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const keys = useMemo(() => getAPIKeys(), [refreshKey]);
  const endpoints = useMemo(() => getEndpointDocs(), []);
  const webhooks = useMemo(() => getWebhooks(), [refreshKey]);
  const exports = useMemo(() => getExportHistory(), [refreshKey]);
  const usage = useMemo(() => getAPIUsage(30), []);
  const stats = useMemo(() => getAPIPlatformStats(), [refreshKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lime-500/10 rounded-xl text-lime-400">
              <Plug size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">MSI API Platform</h2>
              <p className="text-xs text-slate-500">Programmatic Access — Build on the Bloomberg of Sports Cards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="flex items-center gap-6 px-5 py-3 border-b border-slate-800 bg-slate-800/30">
          <div className="flex items-center gap-1.5 text-xs">
            <Key size={12} className="text-lime-400" />
            <span className="text-slate-400">Active Keys:</span>
            <span className="text-white font-semibold">{stats.totalKeys}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Activity size={12} className="text-cyan-400" />
            <span className="text-slate-400">Requests Today:</span>
            <span className="text-white font-semibold">{keys.reduce((s, k) => s + k.requestsToday, 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Webhook size={12} className="text-amber-400" />
            <span className="text-slate-400">Webhooks Active:</span>
            <span className="text-white font-semibold">{stats.webhooksConfigured}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Download size={12} className="text-emerald-400" />
            <span className="text-slate-400">Exports Available:</span>
            <span className="text-white font-semibold">{stats.exportsGenerated}</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 font-semibold">{stats.uptime}% uptime</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 border-b border-slate-800">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white border-t border-x border-slate-700'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'keys' && <APIKeysTab keys={keys} onRefresh={refresh} />}
          {activeTab === 'docs' && <DocsTab endpoints={endpoints} />}
          {activeTab === 'webhooks' && <WebhooksTab webhooks={webhooks} onRefresh={refresh} />}
          {activeTab === 'exports' && <ExportsTab exports={exports} onRefresh={refresh} />}
          {activeTab === 'usage' && <UsageTab usage={usage} />}
        </div>
      </div>
    </div>
  );
};

export default APIPlatformModal;
