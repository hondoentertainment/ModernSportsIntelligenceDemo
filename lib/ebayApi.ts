/**
 * eBay API Client
 * Integrates with eBay Browse API for real-time sold listings data
 */

import { showToast } from './toast.ts';

export interface EbaySoldListing {
    itemId: string;
    title: string;
    price: {
        value: number;
        currency: string;
    };
    condition: string;
    image: {
        imageUrl: string;
    };
    itemWebUrl: string;
    itemEndDate: string;
}

export interface EbaySearchResult {
    itemSummaries: EbaySoldListing[];
    total: number;
    next: string | null;
}

export interface EbayPricingAnalysis {
    estimatedValue: number;
    low: number;
    high: number;
    avg: number;
    confidence: number;
    salesCount: number;
    searchUrl: string;
    lastUpdated: string;
}

// eBay API Configuration
const EBAY_API_BASE = 'https://api.ebay.com/buy/browse/v1';
const EBAY_MARKETPLACE_ID = 'EBAY_US'; // US marketplace

// Get eBay API credentials from environment
const getEbayCredentials = () => {
    const clientId = import.meta.env.VITE_EBAY_CLIENT_ID || '';
    const clientSecret = import.meta.env.VITE_EBAY_CLIENT_SECRET || '';
    const refreshToken = import.meta.env.VITE_EBAY_REFRESH_TOKEN || '';

    return { clientId, clientSecret, refreshToken };
};

/**
 * Get OAuth access token using refresh token
 */
async function getAccessToken(): Promise<string | null> {
    const { clientId, clientSecret, refreshToken } = getEbayCredentials();

    if (!clientId || !clientSecret || !refreshToken) {
        console.warn('eBay API credentials not configured');
        return null;
    }

    try {
        const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                scope: 'https://api.ebay.com/oauth/api_scope',
            }),
        });

        const data = await response.json();
        return data.access_token || null;
    } catch (error) {
        console.error('Failed to get eBay access token:', error);
        showToast('error', 'eBay authentication failed. Using AI pricing.', { dedupeKey: 'ebay_auth' });
        return null;
    }
}

/**
 * Search for sold listings on eBay
 */
async function searchSoldListings(
    query: string,
    accessToken: string,
    limit: number = 20
): Promise<EbaySearchResult | null> {
    try {
        const params = new URLSearchParams({
            q: query,
            limit: limit.toString(),
        });

        // Add filters separately to avoid duplicate keys
        const filters = [
            'conditionIds:{1000,1500,2000,2500,3000,4000,5000,6000,7000}', // All conditions
            'deliveryCountry:US',
            'price:[0..10000]', // Price range filter
        ];

        filters.forEach(filter => params.append('filter', filter));
        params.append('aspect_filter', 'priceTransaction:{"transactionId":"SOLD"}'); // Sold items only

        const response = await fetch(
            `${EBAY_API_BASE}/item_summary/search?${params.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-EBAY-C-MARKETPLACE-ID': EBAY_MARKETPLACE_ID,
                },
            }
        );

        if (!response.ok) {
            console.error('eBay API error:', response.status, response.statusText);
            showToast('warning', `eBay search returned ${response.status}. Falling back to AI.`, { dedupeKey: 'ebay_search_err' });
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to search eBay listings:', error);
        showToast('warning', 'eBay search failed. Using AI pricing.', { dedupeKey: 'ebay_search_err' });
        return null;
    }
}

/**
 * Analyze eBay sold listings to determine market value
 */
function analyzeListings(listings: EbaySoldListing[], query: string): EbayPricingAnalysis {
    if (listings.length === 0) {
        return {
            estimatedValue: 0,
            low: 0,
            high: 0,
            avg: 0,
            confidence: 0,
            salesCount: 0,
            searchUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1`,
            lastUpdated: new Date().toISOString(),
        };
    }

    const prices = listings.map(l => l.price.value);
    const sortedPrices = [...prices].sort((a, b) => a - b);

    // Remove outliers (top and bottom 10%)
    const trimCount = Math.max(1, Math.floor(prices.length * 0.1));
    const trimmedPrices = sortedPrices.slice(trimCount, prices.length - trimCount);

    const low = trimmedPrices[0];
    const high = trimmedPrices[trimmedPrices.length - 1];
    const avg = trimmedPrices.reduce((sum, p) => sum + p, 0) / trimmedPrices.length;

    // Weighted average favoring recent sales (assuming listings are returned newest first)
    const weightedSum = listings.reduce((sum, l, i) => {
        const recencyWeight = 1 - (i / listings.length) * 0.4; // Newer = 1.0, Older = 0.6
        return sum + l.price.value * recencyWeight;
    }, 0);

    let totalWeight = 0;
    for (let i = 0; i < listings.length; i++) {
        totalWeight += (1 - (i / listings.length) * 0.4);
    }

    const estimatedValue = weightedSum / totalWeight;

    // Institutional Confidence Scoring
    // Factors: Volume, Volatility (Spread), and Data Recency
    const volumeFactor = Math.min(1, listings.length / 15);
    const spread = high - low;
    const volatilityFactor = spread > 0 ? Math.max(0, 1 - (spread / avg)) : 1;

    const confidence = (volumeFactor * 0.6) + (volatilityFactor * 0.4);

    return {
        estimatedValue: Math.round(estimatedValue * 100) / 100,
        low: Math.round(low * 100) / 100,
        high: Math.round(high * 100) / 100,
        avg: Math.round(avg * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        salesCount: listings.length,
        searchUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1`,
        lastUpdated: new Date().toISOString(),
    };
}

/**
 * Get pricing analysis for a sports card from eBay
 */
export async function getEbayCardPricing(
    player: string,
    year?: number,
    manufacturer?: string,
    cardNumber?: string,
    set?: string,
    isGraded?: boolean,
    gradingCompany?: string,
    grade?: string
): Promise<EbayPricingAnalysis | null> {
    const accessToken = await getAccessToken();

    if (!accessToken) {
        console.warn('eBay API not available, falling back to AI pricing');
        return null;
    }

    // Build search query
    const queryParts = [
        year?.toString(),
        manufacturer,
        player,
        cardNumber,
        set,
    ].filter(Boolean);

    const query = queryParts.join(' ');

    const result = await searchSoldListings(query, accessToken, 50);

    if (!result || result.itemSummaries.length === 0) {
        return null;
    }

    // Filter by grading if specified
    let filteredListings = result.itemSummaries;
    if (isGraded && gradingCompany && grade) {
        filteredListings = filteredListings.filter(l =>
            l.title.toLowerCase().includes(gradingCompany.toLowerCase()) &&
            l.title.toLowerCase().includes(grade)
        );
    }

    const analysis = analyzeListings(filteredListings, query);

    return {
        ...analysis,
        searchUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1`,
    };
}

/**
 * Get pricing analysis for a watchlist target
 */
export async function getEbayWatchlistPricing(
    player: string,
    cardDescription: string
): Promise<EbayPricingAnalysis | null> {
    const accessToken = await getAccessToken();

    if (!accessToken) {
        console.warn('eBay API not available, falling back to AI pricing');
        return null;
    }

    const query = `${player} ${cardDescription}`;
    const result = await searchSoldListings(query, accessToken, 50);

    if (!result || result.itemSummaries.length === 0) {
        return null;
    }

    const analysis = analyzeListings(result.itemSummaries, query);

    return {
        ...analysis,
        searchUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1`,
    };
}

/**
 * Check if eBay API is configured
 */
export function isEbayConfigured(): boolean {
    const { clientId, clientSecret, refreshToken } = getEbayCredentials();
    return !!(clientId && clientSecret && refreshToken);
}

/**
 * Get eBay API status
 */
export function getEbayStatus(): {
    configured: boolean;
    message: string;
} {
    if (isEbayConfigured()) {
        return {
            configured: true,
            message: 'eBay API connected',
        };
    }

    return {
        configured: false,
        message: 'eBay API not configured. Using AI pricing fallback.',
    };
}
