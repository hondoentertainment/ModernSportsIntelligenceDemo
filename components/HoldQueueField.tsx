import React, { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { store } from '../lib/dal/syncStore';
import {
  HOLD_QUEUE_CASH_KEY,
  HOLD_QUEUE_NOTE,
  HOLD_SLIP_NOTE,
  HOLD_WAIT_NOTE,
  cashNeedDraft,
  downloadHoldSlip,
  holdQueueCopy,
  holdSlip,
  holdWait,
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
  const need = parseCashNeed(draft);
  const slip = holdSlip(unsold, need, now);
  const wait = holdWait(unsold, need, now);
  if (!slip || !wait) return null;
  const copy = holdQueueCopy(unsold, need, now);
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
      <p className="mt-2 text-xs text-slate-200" aria-label="Hold slip">{slip.copy}</p>
      <p className="mt-1 text-xs text-slate-300" aria-label="Hold slip book">{slip.bookCopy}</p>
      {slip.alert ? <p className="mt-1 text-xs text-amber-100" aria-label="Hold slip alert">{slip.alert.copy}</p> : null}
      {slip.alert?.href && slip.alert.player ? (
        <Link to={slip.alert.href} className="inline-flex min-h-[44px] items-center text-xs text-brand-lime">
          Open the hold slip for {slip.alert.player}
        </Link>
      ) : null}
      <p className="mt-2 text-xs text-slate-200" aria-label="Hold wait">{wait.copy}</p>
      {wait.alert ? <p className="mt-1 text-xs text-amber-100" aria-label="Hold wait alert">{wait.alert.copy}</p> : null}
      {wait.alert?.href && wait.alert.player ? (
        <Link to={wait.alert.href} className="inline-flex min-h-[44px] items-center text-xs text-brand-lime">
          Open the hold wait for {wait.alert.player}
        </Link>
      ) : null}
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{HOLD_WAIT_NOTE}</p>
      <div className="mt-2">
        <button
          type="button"
          className="min-h-[44px] rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-100"
          onClick={() => downloadHoldSlip(slip)}
        >
          Download the hold slip
        </button>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{HOLD_SLIP_NOTE}</p>
      </div>
      {copy ? <p className="mt-2 text-xs text-slate-200" aria-label="Hold queue">{copy}</p> : null}
    </div>
  );
};

export default HoldQueueField;
