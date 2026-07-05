import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { AuditEvent } from '../../lib/utils/auditTrailService';
import { getCategoryColor, getSeverityColor } from '../../lib/utils/auditTrailService';

/** One row in the audit-log list. Presentational — no data fetching. */
const AuditEventRow: React.FC<{ event: AuditEvent }> = ({ event: e }) => {
    const borderTone =
        e.severity === 'security' || e.severity === 'critical'
            ? 'border-red-500/30'
            : e.severity === 'warning'
              ? 'border-amber-500/30'
              : 'border-slate-800';

    return (
        <div className={`bg-slate-900 rounded-xl border p-4 ${borderTone}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    {e.result === 'success' ? (
                        <CheckCircle size={16} className="text-green-400 mt-0.5" aria-hidden />
                    ) : e.result === 'blocked' ? (
                        <XCircle size={16} className="text-red-400 mt-0.5" aria-hidden />
                    ) : (
                        <AlertTriangle size={16} className="text-amber-400 mt-0.5" aria-hidden />
                    )}
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getSeverityColor(e.severity)}`}
                            >
                                {e.severity}
                            </span>
                            <span className={`text-xs font-semibold ${getCategoryColor(e.category)}`}>
                                {e.category}
                            </span>
                            <code className="text-slate-400 text-[10px] font-mono">{e.action}</code>
                            {e.source === 'recorded' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                                    Recorded
                                </span>
                            )}
                            {e.source === 'cloud' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30">
                                    Cloud
                                </span>
                            )}
                            {e.source === 'sample' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 bg-slate-500/10 border border-slate-600">
                                    Sample
                                </span>
                            )}
                        </div>
                        <p className="text-slate-300 text-xs">{e.details}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                            <span>@{e.actor}</span>
                            <span>{e.resource}</span>
                            <span className="font-mono">{e.ipAddress}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right text-[10px]">
                    <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                            e.result === 'success'
                                ? 'bg-green-500/10 text-green-400'
                                : e.result === 'blocked'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-amber-500/10 text-amber-400'
                        }`}
                    >
                        {e.result}
                    </span>
                    <p className="text-slate-500 mt-1">{e.timestamp}</p>
                </div>
            </div>
        </div>
    );
};

export default AuditEventRow;
