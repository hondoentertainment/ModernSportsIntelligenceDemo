/**
 * Show-floor partner API client stubs + typed contracts.
 * Local show bag remains the source of truth.
 */
import { z } from 'zod';
import type { ShowBagDocument, ShowBagItem } from '../utils/showBag';

export const SHOW_FLOOR_PARTNER_DISCLOSURE =
  'Partner show-bag API stubs only. The local packing list remains the source of truth — partner payloads never overwrite packed state.';

export const SHOW_FLOOR_PARTNER_SCOPES = ['showbag.read', 'showbag.suggest'] as const;
export type ShowFloorPartnerScope = (typeof SHOW_FLOOR_PARTNER_SCOPES)[number];

export const ShowBagPartnerItemSchema = z.object({
  id: z.string().min(1),
  section: z.enum(['review', 'consign', 'targets', 'supplies']),
  label: z.string().min(1),
  detail: z.string(),
  packed: z.boolean(),
});

export const ShowBagPartnerRequestSchema = z.object({
  generatedAt: z.string(),
  items: z.array(ShowBagPartnerItemSchema).max(200),
  sourceOfTruth: z.literal('local-show-bag'),
});

export const ShowBagPartnerResponseSchema = z.object({
  ok: z.boolean(),
  accepted: z.boolean(),
  partner: z.string(),
  suggestedAdds: z.array(ShowBagPartnerItemSchema).max(40).default([]),
  disclosure: z.string(),
});

export type ShowBagPartnerRequest = z.infer<typeof ShowBagPartnerRequestSchema>;
export type ShowBagPartnerResponse = z.infer<typeof ShowBagPartnerResponseSchema>;

export type ShowFloorPartnerClient = (payload: ShowBagPartnerRequest) => Promise<ShowBagPartnerResponse>;

export function buildShowBagPartnerPayload(doc: ShowBagDocument): ShowBagPartnerRequest {
  return ShowBagPartnerRequestSchema.parse({
    generatedAt: doc.generatedAt,
    items: doc.items,
    sourceOfTruth: 'local-show-bag',
  });
}

export function mergePartnerSuggestions(
  local: ShowBagItem[],
  suggested: ShowBagItem[],
): ShowBagItem[] {
  const seen = new Set(local.map((item) => item.id));
  const extras = suggested.filter((item) => !seen.has(item.id)).map((item) => ({ ...item, packed: false }));
  return [...local, ...extras];
}

export async function stubShowFloorPartnerClient(
  payload: ShowBagPartnerRequest,
): Promise<ShowBagPartnerResponse> {
  const parsed = ShowBagPartnerRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      accepted: false,
      partner: 'msi-stub',
      suggestedAdds: [],
      disclosure: SHOW_FLOOR_PARTNER_DISCLOSURE,
    };
  }
  return {
    ok: true,
    accepted: true,
    partner: 'msi-stub',
    suggestedAdds: [],
    disclosure: SHOW_FLOOR_PARTNER_DISCLOSURE,
  };
}

export async function syncShowBagWithPartner(
  doc: ShowBagDocument,
  client: ShowFloorPartnerClient = stubShowFloorPartnerClient,
): Promise<{ local: ShowBagDocument; partner: ShowBagPartnerResponse; sourceOfTruth: 'local-show-bag' }> {
  const payload = buildShowBagPartnerPayload(doc);
  let partner: ShowBagPartnerResponse;
  try {
    partner = ShowBagPartnerResponseSchema.parse(await client(payload));
  } catch {
    partner = {
      ok: false,
      accepted: false,
      partner: 'msi-stub',
      suggestedAdds: [],
      disclosure: SHOW_FLOOR_PARTNER_DISCLOSURE,
    };
  }
  return {
    local: doc,
    partner,
    sourceOfTruth: 'local-show-bag',
  };
}
