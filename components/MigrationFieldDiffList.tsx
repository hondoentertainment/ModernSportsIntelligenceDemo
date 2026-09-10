import React from 'react';
import type { DuplicateOutcome } from '../lib/utils/migrationMerge';
import { formatFieldConflictLine } from '../lib/utils/migrationFieldDiff';

interface Props {
  outcomes: DuplicateOutcome[];
  limit?: number;
}

const MigrationFieldDiffList: React.FC<Props> = ({ outcomes, limit = 6 }) => {
  const rows = outcomes.slice(0, limit);
  const extra = Math.max(0, outcomes.length - rows.length);
  if (rows.length === 0) return null;

  return (
    <ul className="mt-1.5 space-y-1 max-h-36 overflow-y-auto text-[10px] text-slate-500 normal-case tracking-normal">
      {rows.map((row) => (
        <li key={`${row.kind}-${row.identityKey}`}>
          <p>
            {row.outcome === 'merge' ? 'Merge' : 'Skip'} · {row.kind} · {row.label}
          </p>
          {row.fieldConflicts && row.fieldConflicts.length > 0 ? (
            <ul className="mt-0.5 pl-2 space-y-0.5 text-slate-400">
              {row.fieldConflicts.slice(0, 4).map((conflict) => (
                <li key={`${row.identityKey}-${conflict.field}`}>{formatFieldConflictLine(conflict)}</li>
              ))}
              {row.fieldConflicts.length > 4 && (
                <li>+{row.fieldConflicts.length - 4} more field conflicts</li>
              )}
            </ul>
          ) : (
            <p className="pl-2 text-slate-600">No field-level differences on key columns.</p>
          )}
        </li>
      ))}
      {extra > 0 && <li>+{extra} more duplicate keys</li>}
    </ul>
  );
};

export default MigrationFieldDiffList;
