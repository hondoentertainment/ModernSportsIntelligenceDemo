import { CardInventory } from '../../types';

export interface EbayListing {
  title: string;               // Max 80 chars, SEO-optimized
  subtitle: string;            // Optional subtitle
  description: string;         // HTML description body
  startingPrice: number;
  buyItNowPrice: number;
  condition: string;
  category: string;
  keywords: string[];
}

// eBay category IDs for sports cards
const SPORT_CATEGORIES: Record<string, string> = {
  Baseball: '213',
  Basketball: '214',
  Football: '215',
  Hockey: '216',
  Soccer: '217'
};

/**
 * Phase 28: Generate an SEO-optimized eBay listing from card metadata.
 * Follows eBay best practices for title keyword ordering:
 * Year → Brand → Player → Set → Card# → Grade → Features
 */
export function generateEbayListing(
  card: CardInventory,
  options: { startingBid?: number; buyItNow?: number } = {}
): EbayListing {
  const title = buildTitle(card);
  const subtitle = buildSubtitle(card);
  const description = buildDescription(card);
  const fmv = card.currentValue || card.purchasePrice;

  return {
    title,
    subtitle,
    description,
    startingPrice: options.startingBid || Math.round(fmv * 0.75),
    buyItNowPrice: options.buyItNow || Math.round(fmv * 1.1),
    condition: card.isGraded ? 'Graded' : (card.condition || 'Ungraded'),
    category: SPORT_CATEGORIES[card.sport] || '213',
    keywords: extractKeywords(card)
  };
}

/**
 * Build SEO-optimized title (max 80 chars).
 * Format: Year Brand Player Set #Number Grade Features
 */
function buildTitle(card: CardInventory): string {
  const parts: string[] = [];

  parts.push(String(card.year));
  parts.push(card.manufacturer);
  parts.push(card.player);
  if (card.set && card.set !== card.manufacturer) parts.push(card.set);
  if (card.cardNumber) parts.push(`#${card.cardNumber}`);

  if (card.isGraded && card.gradingCompany && card.grade) {
    parts.push(`${card.gradingCompany} ${card.grade}`);
  }

  if (card.isAutographed) parts.push('Auto');

  // Truncate to 80 chars
  let title = parts.join(' ');
  if (title.length > 80) {
    title = title.substring(0, 77) + '...';
  }

  return title;
}

function buildSubtitle(card: CardInventory): string {
  const parts: string[] = [];
  if (card.isAutographed) parts.push('Autographed');
  if (card.isGraded) parts.push('Professionally Graded');
  if (card.popCount && card.popCount < 50) parts.push(`Low Pop: ${card.popCount}`);
  parts.push(`${card.sport} Card`);
  return parts.join(' | ');
}

function buildDescription(card: CardInventory): string {
  const fmv = card.currentValue || card.purchasePrice;

  return `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
  <h2 style="color: #1e293b; border-bottom: 2px solid #d9f99d; padding-bottom: 8px;">
    ${card.year} ${card.manufacturer} ${card.set} - ${card.player} #${card.cardNumber}
  </h2>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr>
      <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; width: 40%;">Player</td>
      <td style="padding: 8px; border: 1px solid #e2e8f0;">${card.player}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Year</td>
      <td style="padding: 8px; border: 1px solid #e2e8f0;">${card.year}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Brand / Set</td>
      <td style="padding: 8px; border: 1px solid #e2e8f0;">${card.manufacturer} ${card.set}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Card Number</td>
      <td style="padding: 8px; border: 1px solid #e2e8f0;">#${card.cardNumber}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Sport / League</td>
      <td style="padding: 8px; border: 1px solid #e2e8f0;">${card.sport} — ${card.league}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Condition</td>
      <td style="padding: 8px; border: 1px solid #e2e8f0;">${card.isGraded ? `${card.gradingCompany} ${card.grade}` : (card.condition || 'Raw/Ungraded')}</td>
    </tr>
    ${card.isAutographed ? `
    <tr>
      <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Autograph</td>
      <td style="padding: 8px; border: 1px solid #e2e8f0;">Yes - Certified Autograph</td>
    </tr>` : ''}
    ${card.popCount !== undefined ? `
    <tr>
      <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Population</td>
      <td style="padding: 8px; border: 1px solid #e2e8f0;">Pop ${card.popCount}${card.popHigher !== undefined ? ` (${card.popHigher} higher)` : ''}</td>
    </tr>` : ''}
  </table>

  ${card.notes ? `<p style="color: #475569; margin: 16px 0;"><strong>Notes:</strong> ${card.notes}</p>` : ''}

  <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 8px;">
    Listed via Modern Sports Intelligence | Comp-verified FMV: $${fmv.toLocaleString()}
  </p>
</div>`.trim();
}

function extractKeywords(card: CardInventory): string[] {
  const kw = new Set<string>();
  kw.add(card.player);
  kw.add(String(card.year));
  kw.add(card.manufacturer);
  kw.add(card.set);
  kw.add(card.sport);
  kw.add(card.league);
  if (card.isGraded && card.gradingCompany) kw.add(card.gradingCompany);
  if (card.isAutographed) kw.add('Autograph');
  if (card.isAutographed) kw.add('Auto');
  kw.add('Sports Card');
  return [...kw].filter(Boolean);
}

/**
 * Copy listing title and description to clipboard for paste into eBay.
 */
export async function copyListingToClipboard(listing: EbayListing): Promise<boolean> {
  const text = `Title: ${listing.title}\n\nSubtitle: ${listing.subtitle}\n\nStarting Price: $${listing.startingPrice}\nBuy It Now: $${listing.buyItNowPrice}\n\nKeywords: ${listing.keywords.join(', ')}`;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
