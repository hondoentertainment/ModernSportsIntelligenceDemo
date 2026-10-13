/**
 * Persisted cost-basis method + Specific ID lot picks.
 * Demo-safe via MSI store — not IRS substantiation.
 */
import { store } from '../dal/syncStore';
import type { CostBasisMethod } from './taxLotService';
import { LOT_METHOD_DISCLAIMER } from './taxLotService';

export const TAX_LOT_PREFERENCES_KEY = 'msi_tax_lot_preferences';
/** Shared with Tax Report settings so Fiscal Intelligence and export stay aligned. */
export const TAX_REPORT_SETTINGS_KEY = 'msi_tax_report_settings';

export interface TaxLotPreferences {
  method: CostBasisMethod;
  specificLotIds: string[];
}

export const DEFAULT_TAX_LOT_PREFERENCES: TaxLotPreferences = {
  method: 'FIFO',
  specificLotIds: [],
};

const METHODS: readonly CostBasisMethod[] = ['FIFO', 'LIFO', 'SpecificID', 'AvgCost'];

export const REPORT_METHOD_TO_LOT: Record<'fifo' | 'lifo' | 'specific_id' | 'average', CostBasisMethod> = {
  fifo: 'FIFO',
  lifo: 'LIFO',
  specific_id: 'SpecificID',
  average: 'AvgCost',
};

export const LOT_METHOD_TO_REPORT: Record<CostBasisMethod, 'fifo' | 'lifo' | 'specific_id' | 'average'> = {
  FIFO: 'fifo',
  LIFO: 'lifo',
  SpecificID: 'specific_id',
  AvgCost: 'average',
};

function asMethod(value: unknown): CostBasisMethod {
  return METHODS.includes(value as CostBasisMethod) ? (value as CostBasisMethod) : 'FIFO';
}

export function normalizeTaxLotPreferences(raw: unknown): TaxLotPreferences {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_TAX_LOT_PREFERENCES };
  const o = raw as Partial<TaxLotPreferences> & { costBasisMethod?: string };
  const ids = Array.isArray(o.specificLotIds)
    ? o.specificLotIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    : [];
  return {
    method: asMethod(o.method ?? o.costBasisMethod),
    specificLotIds: [...new Set(ids)],
  };
}

function asReportMethod(value: unknown): keyof typeof REPORT_METHOD_TO_LOT | null {
  return value === 'fifo' || value === 'lifo' || value === 'specific_id' || value === 'average'
    ? value
    : null;
}

function hydrateFromReportSettings(): TaxLotPreferences | null {
  const settings = store.get<{ costBasisMethod?: unknown } | null>(TAX_REPORT_SETTINGS_KEY, null);
  const reportMethod = asReportMethod(settings?.costBasisMethod);
  if (!reportMethod) return null;
  return { method: REPORT_METHOD_TO_LOT[reportMethod], specificLotIds: [] };
}

function patchReportCostBasisMethod(method: CostBasisMethod): void {
  const current = store.get<Record<string, unknown> | null>(TAX_REPORT_SETTINGS_KEY, null);
  const next = {
    ...(current && typeof current === 'object' ? current : {}),
    costBasisMethod: LOT_METHOD_TO_REPORT[method],
  };
  store.set(TAX_REPORT_SETTINGS_KEY, next);
}

let snapshot: TaxLotPreferences = {
  method: DEFAULT_TAX_LOT_PREFERENCES.method,
  specificLotIds: [],
};

const preferenceListeners = new Set<() => void>();

function preferencesEqual(a: TaxLotPreferences, b: TaxLotPreferences): boolean {
  if (a.method !== b.method || a.specificLotIds.length !== b.specificLotIds.length) return false;
  return a.specificLotIds.every((id, index) => id === b.specificLotIds[index]);
}

function readTaxLotPreferences(): TaxLotPreferences {
  const stored = store.get<unknown>(TAX_LOT_PREFERENCES_KEY, null);
  if (stored != null) return normalizeTaxLotPreferences(stored);
  return hydrateFromReportSettings() ?? { method: 'FIFO', specificLotIds: [] };
}

/**
 * Stable snapshot for useSyncExternalStore. Same contents return the same object.
 */
export function getTaxLotPreferences(): TaxLotPreferences {
  const next = readTaxLotPreferences();
  if (preferencesEqual(snapshot, next)) return snapshot;
  snapshot = next;
  return snapshot;
}

/** Notifies subscribers after setTaxLotPreferences / setTaxLotMethod / toggleSpecificLotId. */
export function subscribeTaxLotPreferences(listener: () => void): () => void {
  preferenceListeners.add(listener);
  return () => {
    preferenceListeners.delete(listener);
  };
}

function notifyTaxLotPreferences(): void {
  for (const listener of preferenceListeners) listener();
}

export function setTaxLotPreferences(partial: Partial<TaxLotPreferences>): TaxLotPreferences {
  const next = normalizeTaxLotPreferences({ ...getTaxLotPreferences(), ...partial });
  store.set(TAX_LOT_PREFERENCES_KEY, next);
  patchReportCostBasisMethod(next.method);
  const saved = getTaxLotPreferences();
  notifyTaxLotPreferences();
  return saved;
}

export function setTaxLotMethod(method: CostBasisMethod): TaxLotPreferences {
  return setTaxLotPreferences({ method });
}

export function toggleSpecificLotId(lotId: string): TaxLotPreferences {
  const id = lotId.trim();
  if (!id) return getTaxLotPreferences();
  const current = getTaxLotPreferences();
  const has = current.specificLotIds.includes(id);
  const specificLotIds = has
    ? current.specificLotIds.filter((item) => item !== id)
    : [...current.specificLotIds, id];
  return setTaxLotPreferences({ method: 'SpecificID', specificLotIds });
}

export function taxLotMethodDisclaimer(): string {
  return LOT_METHOD_DISCLAIMER;
}
