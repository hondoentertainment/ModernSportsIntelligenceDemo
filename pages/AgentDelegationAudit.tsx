import React, { useMemo } from 'react';
import { FileCheck } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { delegationCsv, delegationRows, NEXT_FEATURE_DISCLOSURE } from '../lib/analytics/nextFeatureDesk';
import { getLocalAuditTrail } from '../lib/utils/auditLog';

const AgentDelegationAudit: React.FC = () => {
  const rows = useMemo(() => delegationRows(getLocalAuditTrail()), []);
  const csv = useMemo(() => delegationCsv(rows), [rows]);

  const download = () => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'agent-delegation-audit.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <FrontierDesk
      badge="v5.1 Frontier"
      title="Agent Delegation Audit"
      lede="Local audit rows whose category is autonomy, or whose action mentions an agent, autopilot, or approval. Cloud history stays on the audit trail."
      icon={<FileCheck size={12} />}
      stats={[
        { label: 'Local rows', value: String(rows.length) },
        { label: 'Export', value: 'CSV' },
        { label: 'Rewrite protection', value: 'Migration 00012' },
      ]}
      sectionTitle="Delegation log"
      rows={rows.map(row => ({
        id: row.id,
        title: row.agentAction,
        detail: `${row.humanDecision} · ${row.outcome}`,
        aside: row.ts ? new Date(row.ts).toLocaleString() : '—',
      }))}
      empty="No local agent or autopilot audit rows yet."
      disclosure={`${NEXT_FEATURE_DISCLOSURE} Append-only database policy is in supabase/migrations/00012_audit_events_append_only.sql and applies when that migration is run.`}
    >
      <button
        type="button"
        onClick={download}
        disabled={rows.length === 0}
        className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 disabled:opacity-40"
      >
        Download CSV
      </button>
    </FrontierDesk>
  );
};

export default AgentDelegationAudit;
