/**
 * Persisted cost-basis method + Specific ID lot picks.
 * Demo-safe via MSI store — not IRS substantiation.
 */
import { store } from '../dal/syncStore';
import type { CostBasisMethod } from './taxLotService';
import { LOT_METHOD_DISCLAIMER } from './taxLotService';

export const TAX_LOT_PREFERENCES_KEY = 'msi_tax_lot_preferences';

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

export function getTaxLotPreferences(): TaxLotPreferences {
  return normalizeTaxLotPreferences(store.get<unknown>(TAX_LOT_PREFERENCES_KEY, DEFAULT_TAX_LOT_PREFERENCES));
}

export function setTaxLotPreferences(partial: Partial<TaxLotPreferences>): TaxLotPreferences {
  const next = normalizeTaxLotPreferences({ ...getTaxLotPreferences(), ...partial });
  store.set(TAX_LOT_PREFERENCES_KEY, next);
  return next;
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
