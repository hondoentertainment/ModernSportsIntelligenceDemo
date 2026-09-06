/**
 * Card-show floor loop: classify a scanned or typed PSA cert / UPC and
 * resolve it to inventory-ready metadata. Demo-safe — never flips
 * `VITE_FF_REAL_PSA`; live PSA only runs when that existing flag is already on.
 */
import { psaAdapter, type CertLookupResult } from '../integrations/psaAdapter';
import type { CardInventory, League, Sport } from '../../types';

export type ScanIdentifierKind = 'psa_cert' | 'upc' | 'unknown';

export interface ClassifiedScanIdentifier {
  raw: string;
  normalized: string;
  kind: ScanIdentifierKind;
}

export type ScanResolveSource = 'demo_catalog' | 'psa_adapter' | 'unresolved';

export interface ResolvedScanCard {
  identifier: string;
  kind: ScanIdentifierKind;
  source: ScanResolveSource;
  honestyLabel: string;
  card: Partial<CardInventory> | null;
  error: string | null;
}

const PSA_URL = /psacard\.com\/(?:cert|certification)\/(\d{7,12})/i;
const CERT_QUERY = /[?&](?:cert(?:Number)?)=(\d{7,12})/i;

const DEMO_CERTS: Record<string, Partial<CardInventory>> = {
  '12345678': {
    player: 'Shohei Ohtani',
    year: 2018,
    manufacturer: 'Topps',
    set: 'Update',
    cardNumber: '150',
    sport: 'Baseball',
    league: 'MLB',
    isGraded: true,
    gradingCompany: 'PSA',
    grade: '10',
    certNumber: '12345678',
    isAutographed: false,
    condition: 'Gem Mint',
    currentValue: 1850,
    notes: 'Demo catalog — 2018 Topps Update Ohtani RC PSA 10.',
  },
  '85012345': {
    player: 'Elly De La Cruz',
    year: 2024,
    manufacturer: 'Topps',
    set: 'Chrome',
    cardNumber: '15',
    sport: 'Baseball',
    league: 'MLB',
    isGraded: true,
    gradingCompany: 'PSA',
    grade: '10',
    certNumber: '85012345',
    isAutographed: false,
    condition: 'Gem Mint',
    currentValue: 450,
    notes: 'Demo catalog — 2024 Topps Chrome Elly PSA 10.',
  },
  '45892341': {
    player: 'Mike Trout',
    year: 2011,
    manufacturer: 'Topps',
    set: 'Update',
    cardNumber: 'US175',
    sport: 'Baseball',
    league: 'MLB',
    isGraded: true,
    gradingCompany: 'PSA',
    grade: '9',
    certNumber: '45892341',
    isAutographed: false,
    condition: 'Mint',
    currentValue: 920,
    notes: 'Demo catalog — 2011 Topps Update Trout RC PSA 9.',
  },
};

const DEMO_UPCS: Record<string, Partial<CardInventory>> = {
  '887521123456': {
    player: 'Bowman Chrome Hobby',
    year: 2024,
    manufacturer: 'Bowman',
    set: 'Chrome Hobby Box',
    cardNumber: 'HOBBY',
    sport: 'Baseball',
    league: 'MLB',
    isGraded: false,
    isAutographed: false,
    condition: 'Sealed',
    currentValue: 280,
    notes: 'Demo UPC — sealed hobby box identifier, not a live product feed.',
  },
  '041409087654': {
    player: 'Prizm Basketball Blaster',
    year: 2023,
    manufacturer: 'Panini',
    set: 'Prizm Blaster',
    cardNumber: 'BLAST',
    sport: 'Basketball',
    league: 'NBA',
    isGraded: false,
    isAutographed: false,
    condition: 'Sealed',
    currentValue: 65,
    notes: 'Demo UPC — sealed retail identifier, not a live product feed.',
  },
};

export function extractIdentifier(raw: string): string {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return '';
  const urlMatch = trimmed.match(PSA_URL) || trimmed.match(CERT_QUERY);
  if (urlMatch?.[1]) return urlMatch[1];
  return trimmed.replace(/[\s-]/g, '');
}

export function classifyScanIdentifier(raw: string): ClassifiedScanIdentifier {
  const normalized = extractIdentifier(raw);
  if (!normalized) {
    return { raw: String(raw ?? ''), normalized: '', kind: 'unknown' };
  }
  if (/^\d{7,10}$/.test(normalized)) {
    return { raw, normalized, kind: 'psa_cert' };
  }
  if (/^\d{11,14}$/.test(normalized)) {
    return { raw, normalized, kind: 'upc' };
  }
  if (/^[A-Za-z0-9]{8,20}$/.test(normalized) && /\d/.test(normalized)) {
    return { raw, normalized, kind: normalized.length <= 10 ? 'psa_cert' : 'upc' };
  }
  return { raw, normalized, kind: 'unknown' };
}

function honestyForAdapter(result: CertLookupResult): string {
  if (result.source === 'live') {
    return 'Live PSA adapter result. Confirm the slab before you buy.';
  }
  if (result.degradedReason) {
    return `Simulated PSA fallback — live lookup failed (${result.degradedReason}). Not a real cert check.`;
  }
  return 'Simulated PSA adapter (demo). Real PSA stays behind the existing demo flag — not a live cert check.';
}

function sportFromPlayer(player: string): { sport: Sport; league: League } {
  const name = player.toLowerCase();
  if (/lebron|luka|curry|edwards|wembanyama|jokic/.test(name)) {
    return { sport: 'Basketball', league: 'NBA' };
  }
  if (/mahomes|allen|burrow|herbert/.test(name)) {
    return { sport: 'Football', league: 'NFL' };
  }
  if (/mcdavid/.test(name)) {
    return { sport: 'Hockey', league: 'Other' };
  }
  return { sport: 'Baseball', league: 'MLB' };
}

export function certLookupToCard(
  result: CertLookupResult,
  kind: ScanIdentifierKind,
): Partial<CardInventory> {
  const { sport, league } = sportFromPlayer(result.player || '');
  const year = result.year ? parseInt(result.year, 10) : new Date().getFullYear();
  return {
    player: result.player || 'Unknown player',
    year: Number.isFinite(year) ? year : new Date().getFullYear(),
    manufacturer: result.brand || 'Topps',
    set: result.set || 'Unknown set',
    cardNumber: result.cardNumber || 'N/A',
    sport,
    league,
    isGraded: true,
    gradingCompany: 'PSA',
    grade: result.grade || '10',
    certNumber: result.certNumber,
    isAutographed: false,
    condition: result.labelType || 'Graded',
    image: result.imageUrl,
    notes: `${kind === 'upc' ? 'UPC' : 'PSA cert'} ${result.certNumber} via ${result.source} adapter.`,
  };
}

export function toAddAssetPrefill(resolved: ResolvedScanCard): Partial<CardInventory> | null {
  if (!resolved.card) return null;
  const card = { ...resolved.card };
  if (resolved.kind === 'psa_cert' && !card.certNumber) {
    card.certNumber = resolved.identifier;
    card.isGraded = true;
    card.gradingCompany = card.gradingCompany || 'PSA';
  }
  return card;
}

export async function resolveScanIdentifier(raw: string): Promise<ResolvedScanCard> {
  const classified = classifyScanIdentifier(raw);
  if (!classified.normalized || classified.kind === 'unknown') {
    return {
      identifier: classified.normalized,
      kind: 'unknown',
      source: 'unresolved',
      honestyLabel: 'Enter a PSA cert (7–10 digits) or a UPC / barcode-like id.',
      card: null,
      error: 'Could not recognize that identifier. Type a PSA cert or UPC, or scan the slab barcode.',
    };
  }

  const catalog = classified.kind === 'upc' ? DEMO_UPCS : DEMO_CERTS;
  const demoHit = catalog[classified.normalized];
  if (demoHit) {
    return {
      identifier: classified.normalized,
      kind: classified.kind,
      source: 'demo_catalog',
      honestyLabel:
        classified.kind === 'upc'
          ? 'Demo UPC catalog — not a live product or retailer feed.'
          : 'Demo cert catalog — not a live PSA verification.',
      card: {
        ...demoHit,
        certNumber: demoHit.certNumber || (classified.kind === 'psa_cert' ? classified.normalized : demoHit.certNumber),
      },
      error: null,
    };
  }

  if (classified.kind === 'psa_cert') {
    try {
      const lookup = await psaAdapter.verifyCert(classified.normalized);
      return {
        identifier: classified.normalized,
        kind: 'psa_cert',
        source: 'psa_adapter',
        honestyLabel: honestyForAdapter(lookup),
        card: certLookupToCard(lookup, 'psa_cert'),
        error: null,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        identifier: classified.normalized,
        kind: 'psa_cert',
        source: 'unresolved',
        honestyLabel: 'Lookup failed. Demo catalog and adapters are offline for this id.',
        card: null,
        error: `Could not resolve cert ${classified.normalized}: ${message}`,
      };
    }
  }

  return {
    identifier: classified.normalized,
    kind: 'upc',
    source: 'unresolved',
    honestyLabel: 'No demo UPC match. Live product feeds are not enabled in this build.',
    card: null,
    error: `No catalog match for UPC ${classified.normalized}. Try a demo UPC (887521123456) or a PSA cert.`,
  };
}
