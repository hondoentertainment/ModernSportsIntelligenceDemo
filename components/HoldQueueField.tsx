import React, { useId, useState } from 'react';
import { store } from '../lib/dal/syncStore';
import {
  HOLD_QUEUE_CASH_KEY,
  HOLD_QUEUE_NOTE,
  cashNeedDraft,
  holdQueueCopy,
  holdQueueRows,
  parseCashNeed,
  readHoldQueueNeed,
  type HoldQueueSource,
} from '../lib/collector/holdQueue';

interface Props {
  unsold: readonly HoldQueueSource[];
  now?: number;
}

function persistNeed(draft: string): void {
  if (draft.trim() === '') {
    if (readHoldQueueNeed() != null) store.remove(HOLD_QUEUE_CASH_KEY);
    return;
  }
  const parsed = parseCashNeed(draft);
  if (parsed == null || readHoldQueueNeed() === parsed) return;
  store.set(HOLD_QUEUE_CASH_KEY, parsed);
}

const HoldQueueField: React.FC<Props> = ({ unsold, now }) => {
  const inputId = useId();
  const noteId = useId();
  const [draft, setDraft] = useState(() => cashNeedDraft(readHoldQueueNeed()));
  if (holdQueueRows(unsold, now).length === 0) return null;
  const copy = holdQueueCopy(unsold, parseCashNeed(draft), now);
  return (
    <div className="mt-3">
      <label htmlFor={inputId} className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
        Cash the table needs
      </label>
      <input
        id={inputId}
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        maxLength={12}
        value={draft}
        aria-describedby={noteId}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          persistNeed(next);
        }}
        className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-base text-white"
      />
      <p id={noteId} className="mt-1 text-[11px] leading-relaxed text-slate-500">{HOLD_QUEUE_NOTE}</p>
      {copy ? <p className="mt-2 text-xs text-slate-200" aria-label="Hold queue">{copy}</p> : null}
    </div>
  );
};

export default HoldQueueField;
