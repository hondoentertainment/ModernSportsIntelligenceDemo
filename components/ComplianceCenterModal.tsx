import React, { useMemo, useState, useCallback } from 'react';
import {
  X,
  FileCheck,
  Shield,
  AlertTriangle,
  Calendar,
  Download,
  MapPin,
  CheckCircle2,
  Clock,
  Flag,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  getComplianceStats,
  getComplianceAlerts,
  getScheduleD,
  getAMLFlags,
  getStateGuidance,
  getAllStateGuidance,
  getMonthlyGainLoss,
  getWashSaleAnalysis,
  ComplianceAlert,
  AMLFlag,
  ScheduleD,
  ComplianceStats,
} from '../lib/utils/complianceCenterService';

interface ComplianceCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'dashboard' | 'schedule_d' | 'alerts' | 'state_taxes' | 'aml';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={16} /> },
  { id: 'schedule_d', label: 'Schedule D', icon: <FileCheck size={16} /> },
  { id: 'alerts', label: 'Alerts', icon: <AlertTriangle size={16} /> },
  { id: 'state_taxes', label: 'State Taxes', icon: <MapPin size={16} /> },
  { id: 'aml', label: 'AML', icon: <Shield size={16} /> },
];

function severityBadge(severity: ComplianceAlert['severity']) {
  const map = {
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  return map[severity];
}

function amlStatusBadge(status: AMLFlag['status']) {
  const map = {
    flagged: 'bg-red-500/10 text-red-400 border-red-500/20',
    reviewed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cleared: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return map[status];
}

function riskColor(score: number): string {
  if (score >= 70) return 'text-red-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-emerald-400';
}

function riskBg(score: number): string {
  if (score >= 70) return 'bg-red-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function scoreRingColor(score: number): string {
  if (score >= 80) return '#34d399';
  if (score >= 60) return '#fbbf24';
  return '#f87171';
}

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// ---- Tab Components ----

const DashboardTab: React.FC<{ stats: ComplianceStats; schedule: ScheduleD }> = ({ stats, schedule }) => {
  const monthlyData = useMemo(() => getMonthlyGainLoss(new Date().getFullYear()), []);
  const alerts = useMemo(() => getComplianceAlerts(), []);
  const deadlines = alerts.filter(a => a.deadline);

  const circumference = 2 * Math.PI * 40;
  const progress = (stats.complianceScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Top row: Score gauge + 1099 + Tax Liability */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Compliance Score Gauge */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">Compliance Score</p>
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={scoreRingColor(stats.complianceScore)}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bebas ${scoreColor(stats.complianceScore)}`}>{stats.complianceScore}</span>
            </div>
          </div>
        </div>

        {/* 1099 Threshold */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">1099-K Progress</p>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-3xl font-bebas text-white">{stats.threshold1099Progress}%</span>
            <span className="text-xs text-slate-500">of $600</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                stats.threshold1099Progress >= 90 ? 'bg-red-500' :
                stats.threshold1099Progress >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${stats.threshold1099Progress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Platforms report at $600 gross proceeds</p>
        </div>

        {/* Tax Liability */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">Est. Tax Liability</p>
          <span className="text-3xl font-bebas text-white">{fmt(stats.estimatedTaxLiability)}</span>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Short-term (28%)</span>
              <span className="text-slate-300">{fmt(schedule.shortTermGains - schedule.shortTermLosses)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Long-term (20%)</span>
              <span className="text-slate-300">{fmt(schedule.longTermGains - schedule.longTermLosses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Deadlines */}
      {deadlines.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Calendar size={14} className="text-brand-lime" /> Key Deadlines
          </h3>
          <div className="space-y-2">
            {deadlines.map(d => (
              <div key={d.id} className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{d.message.substring(0, 60)}...</span>
                <span className="text-slate-400 font-mono">{d.deadline}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Gains/Losses Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={14} className="text-brand-lime" /> Monthly Gains & Losses
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', fontSize: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="gains" name="Gains" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="losses" name="Losses" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const ScheduleDTab: React.FC<{ schedule: ScheduleD }> = ({ schedule }) => {
  const washSales = useMemo(() => getWashSaleAnalysis(), []);

  const handleExport = useCallback(() => {
    const lines = [
      `IRS Schedule D — Tax Year ${schedule.year}`,
      '',
      'PART I: Short-Term Capital Gains and Losses',
      `  Total Short-Term Gains: ${fmt(schedule.shortTermGains)}`,
      `  Total Short-Term Losses: (${fmt(schedule.shortTermLosses)})`,
      `  Net Short-Term: ${fmt(schedule.shortTermGains - schedule.shortTermLosses)}`,
      '',
      'PART II: Long-Term Capital Gains and Losses',
      `  Total Long-Term Gains: ${fmt(schedule.longTermGains)}`,
      `  Total Long-Term Losses: (${fmt(schedule.longTermLosses)})`,
      `  Net Long-Term: ${fmt(schedule.longTermGains - schedule.longTermLosses)}`,
      '',
      'PART III: Summary',
      `  Net Capital Gain/(Loss): ${fmt(schedule.netGain)}`,
      `  Wash Sale Adjustments: ${fmt(schedule.washSaleAdjustments)}`,
      `  Estimated Tax: ${fmt(schedule.estimatedTax)}`,
      '',
      'Transaction Detail:',
      'Date | Type | Card | Player | Proceeds | Cost Basis | Gain/Loss | Period',
      ...schedule.transactions.map(t =>
        `${t.date} | ${t.type} | ${t.card} | ${t.player} | ${fmt(t.proceeds)} | ${fmt(t.costBasis)} | ${fmt(t.gainLoss)} | ${t.holdingPeriod}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ScheduleD_${schedule.year}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [schedule]);

  const shortTermTx = schedule.transactions.filter(t => t.holdingPeriod === 'short_term');
  const longTermTx = schedule.transactions.filter(t => t.holdingPeriod === 'long_term');

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Schedule D (Form 1040)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Capital Gains and Losses — Tax Year {schedule.year}</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-brand-lime/10 border border-brand-lime/20 rounded-xl text-brand-lime text-xs font-bold hover:bg-brand-lime/20 transition-colors"
          >
            <Download size={14} /> Export
          </button>
        </div>

        {/* Summary boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Net Gain</p>
            <p className={`text-xl font-bebas ${schedule.netGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(schedule.netGain)}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Est. Tax</p>
            <p className="text-xl font-bebas text-white">{fmt(schedule.estimatedTax)}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Wash Sale Adj.</p>
            <p className="text-xl font-bebas text-amber-400">{fmt(schedule.washSaleAdjustments)}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Transactions</p>
            <p className="text-xl font-bebas text-white">{schedule.transactions.length}</p>
          </div>
        </div>
      </div>

      {/* Part I: Short-Term */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h4 className="text-sm font-bold text-white mb-1">Part I — Short-Term Capital Gains and Losses</h4>
        <p className="text-[10px] text-slate-500 mb-4">Assets held one year or less</p>

        <div className="flex gap-6 mb-4 text-xs">
          <div><span className="text-slate-400">Gains:</span> <span className="text-emerald-400 font-bold">{fmt(schedule.shortTermGains)}</span></div>
          <div><span className="text-slate-400">Losses:</span> <span className="text-red-400 font-bold">({fmt(schedule.shortTermLosses)})</span></div>
          <div><span className="text-slate-400">Net:</span> <span className="text-white font-bold">{fmt(schedule.shortTermGains - schedule.shortTermLosses)}</span></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-slate-400 font-medium">Date</th>
                <th className="text-left py-2 text-slate-400 font-medium">Card</th>
                <th className="text-left py-2 text-slate-400 font-medium">Player</th>
                <th className="text-right py-2 text-slate-400 font-medium">Proceeds</th>
                <th className="text-right py-2 text-slate-400 font-medium">Basis</th>
                <th className="text-right py-2 text-slate-400 font-medium">Gain/Loss</th>
                <th className="text-center py-2 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {shortTermTx.map(t => (
                <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-700/20">
                  <td className="py-2 text-slate-300 font-mono">{t.date}</td>
                  <td className="py-2 text-slate-300">{t.card}</td>
                  <td className="py-2 text-white font-medium">{t.player}</td>
                  <td className="py-2 text-right text-slate-300">{fmt(t.proceeds)}</td>
                  <td className="py-2 text-right text-slate-400">{fmt(t.costBasis)}</td>
                  <td className={`py-2 text-right font-bold ${t.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(t.gainLoss)}</td>
                  <td className="py-2 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      t.status === 'reported' ? 'bg-emerald-500/10 text-emerald-400' :
                      t.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Part II: Long-Term */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h4 className="text-sm font-bold text-white mb-1">Part II — Long-Term Capital Gains and Losses</h4>
        <p className="text-[10px] text-slate-500 mb-4">Assets held more than one year (collectibles rate: 28% max)</p>

        <div className="flex gap-6 mb-4 text-xs">
          <div><span className="text-slate-400">Gains:</span> <span className="text-emerald-400 font-bold">{fmt(schedule.longTermGains)}</span></div>
          <div><span className="text-slate-400">Losses:</span> <span className="text-red-400 font-bold">({fmt(schedule.longTermLosses)})</span></div>
          <div><span className="text-slate-400">Net:</span> <span className="text-white font-bold">{fmt(schedule.longTermGains - schedule.longTermLosses)}</span></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-slate-400 font-medium">Date</th>
                <th className="text-left py-2 text-slate-400 font-medium">Card</th>
                <th className="text-left py-2 text-slate-400 font-medium">Player</th>
                <th className="text-right py-2 text-slate-400 font-medium">Proceeds</th>
                <th className="text-right py-2 text-slate-400 font-medium">Basis</th>
                <th className="text-right py-2 text-slate-400 font-medium">Gain/Loss</th>
                <th className="text-center py-2 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {longTermTx.map(t => (
                <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-700/20">
                  <td className="py-2 text-slate-300 font-mono">{t.date}</td>
                  <td className="py-2 text-slate-300">{t.card}</td>
                  <td className="py-2 text-white font-medium">{t.player}</td>
                  <td className="py-2 text-right text-slate-300">{fmt(t.proceeds)}</td>
                  <td className="py-2 text-right text-slate-400">{fmt(t.costBasis)}</td>
                  <td className={`py-2 text-right font-bold ${t.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(t.gainLoss)}</td>
                  <td className="py-2 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      t.status === 'reported' ? 'bg-emerald-500/10 text-emerald-400' :
                      t.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wash Sale Warnings */}
      {washSales.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
          <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle size={14} /> Wash Sale Warnings
          </h4>
          {washSales.map((ws, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-red-500/10 last:border-0">
              <div>
                <span className="text-slate-300">Sold <span className="text-white font-medium">{ws.soldEvent.player}</span> at loss, repurchased within </span>
                <span className="text-red-400 font-bold">{ws.daysBetween} days</span>
              </div>
              <span className="text-red-400 font-bold">Loss disallowed: {fmt(ws.disallowedLoss)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AlertsTab: React.FC = () => {
  const alerts = useMemo(() => getComplianceAlerts(), []);

  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`border rounded-2xl p-5 ${
            alert.severity === 'critical' ? 'bg-red-500/5 border-red-500/20' :
            alert.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
            'bg-blue-500/5 border-blue-500/20'
          }`}
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${severityBadge(alert.severity)}`}>
                {alert.severity}
              </span>
              <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700`}>
                {alert.type.replace(/_/g, ' ')}
              </span>
            </div>
            {alert.deadline && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock size={12} />
                <span className="font-mono">{alert.deadline}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-white font-medium mb-2">{alert.message}</p>
          <p className="text-xs text-slate-400 leading-relaxed">{alert.action}</p>

          {alert.amount != null && (
            <div className="mt-3 pt-3 border-t border-slate-700/30">
              <span className="text-xs text-slate-500">Amount: </span>
              <span className="text-xs text-white font-bold">{fmt(alert.amount)}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const StateTaxesTab: React.FC = () => {
  const _allStates = useMemo(() => getAllStateGuidance(), []);
  const [selectedState, setSelectedState] = useState('CA');
  const guidance = useMemo(() => getStateGuidance(selectedState), [selectedState]);

  return (
    <div className="space-y-6">
      {/* State Selector */}
      <div className="flex items-center gap-3">
        <MapPin size={16} className="text-brand-lime" />
        <span className="text-sm text-slate-300 font-medium">Select State:</span>
        <div className="flex gap-2">
          {['CA', 'NY', 'TX', 'FL'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                selectedState === st
                  ? 'bg-brand-lime/10 border border-brand-lime/30 text-brand-lime'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {guidance && (
        <>
          {/* State Header */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-1">{guidance.state}</h3>
            <p className="text-xs text-slate-400">{guidance.notes}</p>
          </div>

          {/* Tax Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Sales Tax Rate</p>
              <p className="text-3xl font-bebas text-white">{guidance.salesTaxRate}%</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Collectibles Tax Rate</p>
              <p className={`text-3xl font-bebas ${guidance.collectiblesTaxRate === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {guidance.collectiblesTaxRate === 0 ? 'N/A' : `${guidance.collectiblesTaxRate}%`}
              </p>
              {guidance.collectiblesTaxRate === 0 && (
                <p className="text-[10px] text-emerald-400 mt-1">No state income tax</p>
              )}
            </div>
          </div>

          {/* Filing Requirements */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-3">Filing Requirements</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{guidance.filingRequirements}</p>
          </div>

          {/* Exemptions */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-3">Exemptions & Notes</h4>
            <ul className="space-y-2">
              {guidance.exemptions.map((ex, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{ex}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

const AMLTab: React.FC = () => {
  const flags = useMemo(() => getAMLFlags(), []);

  const reasonLabels: Record<AMLFlag['reason'], string> = {
    high_value: 'High Value Transaction',
    rapid_succession: 'Rapid Succession Trades',
    unusual_pattern: 'Unusual Trading Pattern',
    new_counterparty: 'New/Unknown Counterparty',
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-2">
        <p className="text-xs text-slate-400 leading-relaxed">
          Anti-Money Laundering (AML) monitoring tracks transactions that may require additional review under
          BSA/AML regulations. High-value collectible transactions above $10,000 may trigger CTR filing requirements.
        </p>
      </div>

      {flags.map(flag => (
        <div
          key={flag.id}
          className={`border rounded-2xl p-5 ${
            flag.status === 'flagged' ? 'bg-red-500/5 border-red-500/20' :
            flag.status === 'reviewed' ? 'bg-amber-500/5 border-amber-500/20' :
            'bg-emerald-500/5 border-emerald-500/20'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flag size={14} className={
                flag.status === 'flagged' ? 'text-red-400' :
                flag.status === 'reviewed' ? 'text-amber-400' : 'text-emerald-400'
              } />
              <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${amlStatusBadge(flag.status)}`}>
                {flag.status}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">{flag.date}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Amount</p>
              <p className="text-lg font-bebas text-white">{fmt(flag.amount)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Reason</p>
              <p className="text-xs text-slate-300 font-medium mt-1">{reasonLabels[flag.reason]}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Transaction</p>
              <p className="text-xs text-slate-300 font-mono mt-1">{flag.transactionId}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Risk Score</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-lg font-bebas ${riskColor(flag.riskScore)}`}>{flag.riskScore}</span>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${riskBg(flag.riskScore)}`} style={{ width: `${flag.riskScore}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {flags.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Shield size={32} className="mx-auto mb-3 text-emerald-400" />
          <p className="text-sm font-medium text-emerald-400">No AML flags detected</p>
          <p className="text-xs text-slate-500 mt-1">All transactions within normal parameters</p>
        </div>
      )}
    </div>
  );
};

// ---- Main Modal ----

export const ComplianceCenterModal: React.FC<ComplianceCenterModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const stats = useMemo(() => getComplianceStats(), []);
  const schedule = useMemo(() => getScheduleD(new Date().getFullYear()), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl mx-4 mt-8 mb-8 max-h-[90vh] flex flex-col bg-brand-charcoal border border-slate-800 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
              <FileCheck size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Regulatory & Compliance Center</h2>
              <p className="text-xs text-slate-400 mt-0.5">IRS-Ready Reporting — Tax, AML, and Regulatory Compliance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 pb-2 border-b border-slate-800 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-lime/10 text-brand-lime border border-brand-lime/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-4 bg-slate-900/30 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield size={14} className={scoreColor(stats.complianceScore)} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Score</p>
              <p className={`text-sm font-bold ${scoreColor(stats.complianceScore)}`}>{stats.complianceScore}/100</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck size={14} className="text-slate-400" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Est. Tax</p>
              <p className="text-sm font-bold text-white">{fmt(stats.estimatedTaxLiability)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Alerts</p>
              <p className="text-sm font-bold text-amber-400">{stats.activeAlerts}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-slate-400" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">1099-K</p>
              <p className="text-sm font-bold text-white">{stats.threshold1099Progress}%</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && <DashboardTab stats={stats} schedule={schedule} />}
          {activeTab === 'schedule_d' && <ScheduleDTab schedule={schedule} />}
          {activeTab === 'alerts' && <AlertsTab />}
          {activeTab === 'state_taxes' && <StateTaxesTab />}
          {activeTab === 'aml' && <AMLTab />}
        </div>
      </div>
    </div>
  );
};

export default ComplianceCenterModal;
