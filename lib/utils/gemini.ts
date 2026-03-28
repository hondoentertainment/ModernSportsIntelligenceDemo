import { Type } from '@google/genai';
import { CardInventory, PricingAnalysis, TargetWatchlist, VisualAuditResult, MacroSignal, GradingPremiumAnalysis } from '../../types.ts';
import { ebayApi } from './ebayApi.ts';
import { showToast } from './toast.ts';
import { attachValuationQuality } from '../analytics/valuationQuality.ts';
import { estimateGeminiCostUsd, recordModelUsage } from './telemetryService.ts';
import { createGeminiClient } from './geminiClient.ts';
import { logger } from '../logger';
import { preferRealCompsWhenConfigured } from '../featureFlags';

const ai = createGeminiClient();

const estimateTokens = (text: string): number => Math.max(1, Math.ceil(text.length / 4));

export interface ProspectData {
  name: string;
  team: string;
  position: string;
  league: string;
  trendScore: number;
  change24h: number;
  trendDirection: 'up' | 'down' | 'stable';
  history7d: number[];
  breakoutScore: number;
  summary: string;
  stats?: { primary: string; secondary: string; label: string };
  image: string;
}

export interface SimilarCardResult {
  id?: string;
  name: string;
  team: string;
  reason: string;
  similarityScore: number;
  estimatedValue: number;
  image: string;
  league: string;
}

const MOCK_PROSPECTS: Record<string, ProspectData[]> = {
  MiLB: [
    {
      name: "Jackson Holliday",
      team: "Baltimore Orioles",
      position: "SS",
      league: "AAA",
      trendScore: 98,
      change24h: 12.5,
      trendDirection: "up",
      history7d: [82, 85, 84, 88, 92, 95, 98],
      breakoutScore: 99,
      summary: "Elite bat-to-ball skills suggest immediate MLB impact.",
      image: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=600"
    }
  ],
  NBA: [
    {
      name: "Victor Wembanyama",
      team: "San Antonio Spurs",
      position: "Center",
      league: "NBA",
      trendScore: 99,
      change24h: 8.4,
      trendDirection: "up",
      history7d: [92, 94, 95, 96, 97, 98, 99],
      breakoutScore: 100,
      summary: "Generational defensive gravity shifting the entire market valuation of big men.",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600"
    }
  ],
  NFL: [
    {
      name: "Caleb Williams",
      team: "Chicago Bears",
      position: "QB",
      league: "NFL",
      trendScore: 96,
      change24h: 15.2,
      trendDirection: "up",
      history7d: [70, 75, 82, 88, 90, 93, 96],
      breakoutScore: 98,
      summary: "Elite creativity under pressure making him the primary target for high-end NFL investors.",
      image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&q=80&w=600"
    }
  ]
};

export async function getEbayCardPrice(card: CardInventory, _signal?: AbortSignal): Promise<PricingAnalysis | null> {
  // Try eBay API first when USE_REAL_EBAY is on and the adapter is configured
  if (preferRealCompsWhenConfigured() && ebayApi.isAvailable()) {
    try {
      const ebayResult = await ebayApi.getMarketValue({
        playerName: card.player,
        cardYear: card.year.toString(),
        cardSet: card.set,
        cardNumber: card.cardNumber
      });

      if (ebayResult && ebayResult.totalListings > 0) {
        if (import.meta.env.DEV) logger.warn('Using eBay API pricing for:', card.player);

        const salesSummary = ebayResult.recentSales.map(s => `$${s.price} (${s.date})`).join(', ');
        const rationalePrompt = `Act as an institutional sports card analyst. Based on these 10 recent eBay sales for a ${card.year} ${card.player} ${card.set}: ${salesSummary}, provide a concise, 2-sentence rationale for an estimated value of $${ebayResult.averagePrice}. Use professional language like 'liquidity resistance', 'recent auction volatility', or 'standardized baseline'.`;

        let rationale = "Institutional valuation based on recent market clearing prices.";
        try {
          const rationaleResponse = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: rationalePrompt
          });
          rationale = rationaleResponse.text || rationale;
        } catch (e) {
          logger.warn("Failed to generate rationale, using default.");
        }

        return attachValuationQuality({
          estimatedValue: ebayResult.averagePrice,
          low: ebayResult.priceRange.min,
          high: ebayResult.priceRange.max,
          avg: ebayResult.averagePrice,
          confidence: 1.0,
          salesCount: ebayResult.totalListings,
          searchUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(`${card.year} ${card.player} ${card.set}`)}&LH_Sold=1&LH_Complete=1`,
          lastUpdated: new Date().toISOString(),
          rationale,
          salesData: ebayResult.recentSales.map(s => ({ itemId: s.itemId, title: s.title, price: s.price, condition: s.condition, soldAt: s.date })),
          valuationSource: 'ebay-api',
          valuationTimestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.warn('eBay API pricing failed, falling back to AI:', error);
      showToast('warning', `eBay unavailable for ${card.player} — using AI estimate.`, { dedupeKey: 'ebay_fallback' });
    }
  }

  // Fallback to AI pricing
  const prompt = `Analyze current eBay sold listings for the following sports card and provide an accurate market value analysis:
  Player: ${card.player}
  Year: ${card.year}
  Manufacturer: ${card.manufacturer}
  Card Number: ${card.cardNumber}
  Set: ${card.set}
  Graded: ${card.isGraded ? `${card.gradingCompany} ${card.grade}` : 'Raw'}
  Autographed: ${card.isAutographed ? 'Yes' : 'No'}
  Condition: ${card.condition}

  Provide a detailed breakdown including:
  1. estimatedValue (Number)
  2. low/high/avg ranges (Numbers)
  3. confidence (0-1)
  4. salesCount (Integer)
  5. rationale (Concise 2-sentence explanation of the valuation based on current market trends)

  Only return valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,

      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedValue: { type: Type.NUMBER },
            low: { type: Type.NUMBER },
            high: { type: Type.NUMBER },
            avg: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            salesCount: { type: Type.INTEGER },
            rationale: { type: Type.STRING }
          },
          required: ["estimatedValue", "low", "high", "avg", "confidence", "salesCount", "rationale"],
        },
      },
    });

    const responseText = response.text || "{}";
    const data = JSON.parse(responseText);
    const tokenEstimate = estimateTokens(prompt + responseText);
    recordModelUsage({
      provider: 'gemini',
      model: 'gemini-3-flash-preview',
      tokens: tokenEstimate,
      estimatedCostUsd: estimateGeminiCostUsd(tokenEstimate),
      context: 'card_valuation'
    });

    // Generate grounded eBay Search URL
    const searchQuery = encodeURIComponent(`${card.year} ${card.manufacturer} ${card.player} ${card.cardNumber} ${card.set}${card.isGraded ? ` ${card.gradingCompany} ${card.grade}` : ''} sold`);
    const searchUrl = `https://www.ebay.com/sch/i.html?_from=R40&_nkw=${searchQuery}&_sacat=0&rt=nc&LH_Sold=1&LH_Complete=1`;

    return attachValuationQuality({
      ...data,
      searchUrl,
      lastUpdated: new Date().toISOString(),
      valuationSource: 'gemini',
      valuationTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null;
    logger.error("Gemini Pricing Error:", error);
    showToast('error', `AI valuation failed for ${card.player}. Try again later.`, { dedupeKey: `gemini_price_${card.id}` });
    return null;
  }
}

/**
 * AI-powered pricing for watchlist acquisition targets.
 * Uses the target's player name and card description to estimate current market value.
 * Tries eBay API first, falls back to AI analysis.
 */
export async function getWatchlistItemPrice(target: TargetWatchlist, _signal?: AbortSignal): Promise<PricingAnalysis | null> {
  // Try eBay API first if configured
  if (ebayApi.isAvailable()) {
    try {
      const ebayResult = await ebayApi.getMarketValue({
        playerName: target.player,
        cardSet: target.cardDescription
      });

      if (ebayResult && ebayResult.totalListings > 0) {
        if (import.meta.env.DEV) logger.warn('Using eBay API pricing for watchlist:', target.player);

        const salesSummary = ebayResult.recentSales.map(s => `$${s.price} (${s.date})`).join(', ');
        const rationalePrompt = `Act as an institutional sports card analyst. Based on these 10 recent eBay sales for "${target.player} ${target.cardDescription}": ${salesSummary}, provide a concise, 2-sentence rationale for an estimated value of $${ebayResult.averagePrice}. Mention specific price points if relevant.`;

        let rationale = "Institutional valuation based on recent market clearing prices.";
        try {
          const rationaleResponse = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: rationalePrompt
          });
          rationale = rationaleResponse.text || rationale;
        } catch (e) {
          logger.warn("Failed to generate rationale for watchlist, using default.");
        }

        return attachValuationQuality({
          estimatedValue: ebayResult.averagePrice,
          low: ebayResult.priceRange.min,
          high: ebayResult.priceRange.max,
          avg: ebayResult.averagePrice,
          confidence: 1.0,
          salesCount: ebayResult.totalListings,
          searchUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(`${target.player} ${target.cardDescription}`)}&LH_Sold=1&LH_Complete=1`,
          lastUpdated: new Date().toISOString(),
          rationale,
          salesData: ebayResult.recentSales.map(s => ({ itemId: s.itemId, title: s.title, price: s.price, condition: s.condition, soldAt: s.date })),
          valuationSource: 'ebay-api',
          valuationTimestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.warn('eBay API pricing failed for watchlist, falling back to AI:', error);
      showToast('warning', `eBay unavailable for ${target.player} — using AI estimate.`, { dedupeKey: 'ebay_fallback' });
    }
  }

  // Fallback to AI pricing
  const prompt = `Analyze current eBay sold listings for the following sports card and provide an accurate market value analysis:
  Player: ${target.player}
  Card Description: ${target.cardDescription}
  Sport: ${target.sport}
  League: ${target.league}

  Provide a detailed breakdown including:
  1. estimatedValue (Number)
  2. low/high/avg ranges (Numbers)
  3. confidence (0-1)
  4. salesCount (Integer)
  5. rationale (Concise 2-sentence explanation of the valuation based on current market trends)

  Only return valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,

      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedValue: { type: Type.NUMBER },
            low: { type: Type.NUMBER },
            high: { type: Type.NUMBER },
            avg: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            salesCount: { type: Type.INTEGER },
            rationale: { type: Type.STRING }
          },
          required: ["estimatedValue", "low", "high", "avg", "confidence", "salesCount", "rationale"],
        },
      },
    });

    const responseText = response.text || "{}";
    const data = JSON.parse(responseText);
    const tokenEstimate = estimateTokens(prompt + responseText);
    recordModelUsage({
      provider: 'gemini',
      model: 'gemini-3-flash-preview',
      tokens: tokenEstimate,
      estimatedCostUsd: estimateGeminiCostUsd(tokenEstimate),
      context: 'watchlist_valuation'
    });

    const searchQuery = encodeURIComponent(`${target.player} ${target.cardDescription} sold`);
    const searchUrl = `https://www.ebay.com/sch/i.html?_from=R40&_nkw=${searchQuery}&_sacat=0&rt=nc&LH_Sold=1&LH_Complete=1`;

    return attachValuationQuality({
      ...data,
      searchUrl,
      lastUpdated: new Date().toISOString(),
      valuationSource: 'gemini',
      valuationTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null;
    logger.error("Gemini Watchlist Pricing Error:", error);
    showToast('error', `AI valuation failed for watchlist item "${target.player}".`, { dedupeKey: `gemini_wl_${target.id}` });
    return null;
  }
}

export async function getRealTimeLeagueTrends(league: string, _signal?: AbortSignal): Promise<ProspectData[]> {
  const prompt = `Perform a live search for the top 50 athletes/prospects in the ${league} as of today.
  
  For each athlete, identify:
  1. Real-time news (promotions, injuries, breakout games, viral moments).
  2. Latest stats from their most recent games.
  3. Market hype trajectory (Trending Up/Down based on current search volume and social chatter).

  Provide the data in a JSON array with:
  - name
  - team
  - position
  - league (Must be ${league})
  - trendScore (0-100 based on recent news intensity)
  - change24h (percentage based on recent performance peaks)
  - trendDirection (up, down, stable)
  - history7d (simulated array reflecting recent news cycle)
  - breakoutScore (0-100)
  - summary (1-sentence intelligence summary mentioning a SPECIFIC recent event found in your search)
  - stats (Object with 'primary', 'secondary', and 'label')
  - image (high-quality Unsplash URL)

  IMPORTANT: Use real-world events from your search to justify the trend scores.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,

      config: {
        tools: [{ googleSearchRetrieval: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              team: { type: Type.STRING },
              position: { type: Type.STRING },
              league: { type: Type.STRING },
              trendScore: { type: Type.NUMBER },
              change24h: { type: Type.NUMBER },
              trendDirection: { type: Type.STRING },
              history7d: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              breakoutScore: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              stats: {
                type: Type.OBJECT,
                properties: {
                  primary: { type: Type.STRING },
                  secondary: { type: Type.STRING },
                  label: { type: Type.STRING },
                },
                required: ["primary", "secondary", "label"]
              },
              image: { type: Type.STRING },
            },
            required: ["name", "team", "position", "league", "trendScore", "change24h", "trendDirection", "history7d", "breakoutScore", "summary", "image"]
          }
        },
      },
    });

    const data: ProspectData[] = JSON.parse(response.text || "[]");
    return data.length > 0 ? data : (MOCK_PROSPECTS[league] || MOCK_PROSPECTS.MiLB);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return [];
    logger.error("Gemini Real-time Trend Error:", error);
    showToast('warning', `Live ${league} trends unavailable — showing cached data.`, { dedupeKey: `trend_${league}` });
    return MOCK_PROSPECTS[league] || MOCK_PROSPECTS.MiLB;
  }
}

export async function generatePortfolioSentiment(inventory: CardInventory[], _signal?: AbortSignal): Promise<string> {
  if (inventory.length === 0) return "Awaiting data ingestion to generate market signals.";

  const inventorySummary = inventory.map(c =>
    `${c.year} ${c.player} ${c.set} (${c.league})`
  ).join(", ");

  const prompt = `Act as a senior sports asset market maker. Analyze the following portfolio mix and provide a 1st-person, high-contrast investment sentiment summary (max 2 sentences).
  Portfolio Mix: ${inventorySummary}
  
  Focus on: Liquidity, seasonal timing, or specific league strength. Use terms like 'Overweight', 'Liquidity tightening', 'Alpha signal'.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,

    });

    return response.text || "Stable market conditions observed across all sectors.";
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return "Market analysis cancelled.";
    logger.error("Gemini Sentiment Error:", error);
    showToast('warning', 'AI sentiment analysis unavailable.', { dedupeKey: 'sentiment' });
    return "Market volatility detected. Institutional hold signals recommended.";
  }
}

/**
 * AI Vision: Parses a card image into structured data.
 * imageBase64: Base64 string of the image (no prefix)
 * mimeType: e.g. "image/jpeg"
 */
export async function parseCardImage(imageBase64: string, mimeType: string = "image/jpeg", _signal?: AbortSignal): Promise<Partial<CardInventory> | null> {
  const prompt = `Act as a professional card grader and cataloger. Analyze this image of a sports card and extract the following details in JSON format. 
  
  SPECIAL FOCUS: If this is a baseball card, look for Minor League (MiLB) indicators such as "1st Bowman", "Pro Debut", "Heritage Minor League", or "Draft".
  
  Fields to extract:
  - player (Full name)
  - year (YYYY)
  - manufacturer (e.g. Topps, Panini, Upper Deck)
  - set (e.g. Chrome, Prizm, Series 1)
  - cardNumber (e.g. #123)
  - sport (Baseline: Baseball, Basketball, Football, Hockey, Soccer)
  - league (Baseline: MLB, MiLB, NBA, NFL, Other. Strictly use MiLB if the card features a minor league team or Prospect logo)
  - team (Current team shown on card)
  - parentTeam (For MiLB players, the MLB affiliate if identifiable)
  - isGraded (Boolean)
  - gradingCompany (if graded: PSA, BGS, SGC, etc.)
  - grade (if graded: e.g. 10, 9.5)
  - isAutographed (Boolean)
  - isProspectCard (Boolean - True if it's a 1st Bowman, Pro Debut, or clearly a prospect-focused card)
  
  Only return valid JSON. If you are unsure, provide your best estimate based on the visual evidence.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",

      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { data: imageBase64, mimeType } }
        ]
      }]
    });

    const text = response.text || "";
    // Clean JSON if it has markdown blocks
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null;
    logger.error("Gemini Vision Error:", error);
    showToast('error', 'Card scan failed. Check your connection and try again.', { dedupeKey: 'vision' });
    return null;
  }
}

/**
 * Deep Search: Finds cards or players similar to the input using AI reasoning.
 */
export async function findSimilarCards(query: string, _inventory: CardInventory[] = [], _signal?: AbortSignal): Promise<SimilarCardResult[]> {
  const trimmed = query?.trim() ?? '';
  if (trimmed.length === 0) {
    showToast('warning', 'Please enter a search query.', { dedupeKey: 'deepsearch_empty' });
    return [];
  }
  if (trimmed.length > 500) {
    showToast('warning', 'Search query is too long (max 500 characters).', { dedupeKey: 'deepsearch_long' });
    return [];
  }
  // Escape the query before embedding in the prompt to prevent prompt injection
  const safeQuery = trimmed.replace(/["\\]/g, function(c) { return '\\' + c; });

  const prompt = `Act as an expert sports card scout and market analyst.
  Perform a deep similarity search for: "${safeQuery}"
  
  CONTEXT:
  - If a player is mentioned, find other players with similar career trajectories, playing styles, or market hype.
  - If a specific card is mentioned, find cards that share aesthetic, rarity, or era similarities.
  - If a "Vibe" is mentioned (e.g. 'Flashy guards from the 90s'), find matching assets.
  
  Provide a list of 5-6 similar assets. For each, include:
  - name (Asset/Player Name)
  - team
  - reason (The AI logic for why this is similar)
  - similarityScore (0-100)
  - estimatedValue (Current market estimate)
  - image (A high-quality Unsplash URL related to the sport)
  - league (MLB, NBA, NFL, etc.)
  
  Return valid JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,

      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              team: { type: Type.STRING },
              reason: { type: Type.STRING },
              similarityScore: { type: Type.NUMBER },
              estimatedValue: { type: Type.NUMBER },
              image: { type: Type.STRING },
              league: { type: Type.STRING },
            },
            required: ["name", "team", "reason", "similarityScore", "estimatedValue", "image", "league"]
          }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text) as SimilarCardResult[];
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return [];
    logger.error("Gemini Deep Search Error:", error);
    showToast('error', 'Deep search failed. Check your connection.', { dedupeKey: 'deepsearch' });
    return [];
  }
}

/**
 * Gemini-powered negotiation: Analyzes user offer and returns seller response.
 * Phase 16: Sentiment analysis + counter-proposal engine.
 */
export interface NegotiationSellerResponse {
  action: 'accept' | 'counter' | 'reject';
  sentiment: 'positive' | 'neutral' | 'negative' | 'aggressive';
  message: string;
  counterAmount?: number;
}

export async function getNegotiationResponse(
  itemName: string,
  listingPrice: number,
  userOffer: number,
  maxWillingToPay: number,
  sellerCurrentAsk: number,
  recentMessages: string[],
  _signal?: AbortSignal
): Promise<NegotiationSellerResponse | null> {
  const prompt = `You are simulating a sports card seller in a negotiation. 
  
ITEM: ${itemName}
LISTING PRICE: $${listingPrice}
SELLER CURRENT ASK: $${sellerCurrentAsk}
BUYER'S LATEST OFFER: $${userOffer}
BUYER'S MAX BUDGET: $${maxWillingToPay} (seller does NOT know this)

Recent exchange:
${recentMessages.slice(-4).join('\n')}

Decide the seller's response based on:
- If user offer is within 8% of seller ask → likely ACCEPT
- If user offer is 40%+ below ask → COUNTER firmly or REJECT
- Otherwise → COUNTER with a price between user offer and seller ask
- Counter amount should be influenced by how reasonable the offer seems (never exceed listing price)
- Generate a short, natural seller message (1-2 sentences)

Return JSON with: action (accept|counter|reject), sentiment (positive|neutral|negative|aggressive), message, counterAmount (only if action is counter, number between userOffer and sellerAsk).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,

      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            message: { type: Type.STRING },
            counterAmount: { type: Type.NUMBER },
          },
          required: ["action", "sentiment", "message"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    return {
      action: data.action || "counter",
      sentiment: data.sentiment || "neutral",
      message: data.message || "Let me think about it.",
      counterAmount: data.counterAmount,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null;
    logger.error("Gemini Negotiation Error:", error);
    return null;
  }
}

/**
 * Agentic Negotiation: Gemini acts as the user's agent to make a smart offer.
 */
export interface AgenticOfferResponse {
  offerAmount: number;
  message: string;
  reasoning: string;
}

export async function getAgenticOffer(
  itemName: string,
  listingPrice: number,
  sellerCurrentAsk: number,
  userMaxBudget: number,
  userCurrentOffer: number,
  recentMessages: string[],
  _signal?: AbortSignal
): Promise<AgenticOfferResponse | null> {
  const prompt = `You are an expert sports card investment agent negotiating ON BEHALF of your client (the user).
  
ITEM: ${itemName}
LISTING PRICE: $${listingPrice}
SELLER'S CURRENT ASK: $${sellerCurrentAsk}
CLIENT'S MAX BUDGET: $${userMaxBudget}
YOUR LAST OFFER: $${userCurrentOffer}

Recent exchange:
${recentMessages.slice(-4).join('\n')}

GOAL: Secure the item for as low as possible without offending the seller or exceeding the budget.

DIRECTIONS:
1. If seller ask is already below budget, you can move closer to close the deal.
2. If seller is aggressive, be firm but polite.
3. If seller is flexible, use incremental increases (e.g., 5-10% of the gap).
4. Never exceed $${userMaxBudget}.
5. If the gap is too large and the seller isn't budging, warn the user in the reasoning.

Return JSON with: offerAmount (number), message (string for the seller), reasoning (short summary for the user).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,

      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            offerAmount: { type: Type.NUMBER },
            message: { type: Type.STRING },
            reasoning: { type: Type.STRING },
          },
          required: ["offerAmount", "message", "reasoning"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    return {
      offerAmount: Math.min(data.offerAmount || userCurrentOffer, userMaxBudget),
      message: data.message || "I'd like to make another offer.",
      reasoning: data.reasoning || "Incremental step to reach a deal.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null;
    logger.error("Gemini Agentic Offer Error:", error);
    return null;
  }
}

/**
 * Phase 23: Visual Audit Simulation
 * Analyzes a card image for grading defects and predicts a grade.
 */
export async function auditCardVisuals(imageBase64: string, mimeType: string = "image/jpeg"): Promise<VisualAuditResult | null> {
  const prompt = `Act as an expert sports card grader (like PSA, BGS, or SGC). Perform a strict, high-fidelity visual audit of this card image.
  
  Examine the following four subgrades critically:
  1. Centering (Measure left/right and top/bottom borders)
  2. Corners (Look for any soft touches, whitening, or fraying)
  3. Edges (Check for chipping, roughness, or indentations)
  4. Surface (Identify scratches, print lines, dimples, or gloss issues)
  
  Identify any specific defects. If you find defects, list them with their type, location, severity, and a short description.
  Based on the subgrades and defects, provide a 'predictedGrade' in the format of "PSA X" or "BGS X" (where X is 1-10, can include half-points for BGS).
  Include a 'confidenceScore' (0-1) representing how clear the image is for grading.
  Provide a short overall 'summary' of the card's condition.
  
  Return the result in valid JSON matching this schema:
  - predictedGrade (String)
  - confidenceScore (Number)
  - subgrades (Object with numeric properties: centering, corners, edges, surface, each 1-10)
  - defects (Array of objects, each with strings: type ('Centering' | 'Corners' | 'Edges' | 'Surface'), location, severity ('Minor' | 'Moderate' | 'Severe'), description)
  - summary (String)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { data: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64, mimeType } }
        ]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedGrade: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            subgrades: {
              type: Type.OBJECT,
              properties: {
                centering: { type: Type.NUMBER },
                corners: { type: Type.NUMBER },
                edges: { type: Type.NUMBER },
                surface: { type: Type.NUMBER }
              },
              required: ["centering", "corners", "edges", "surface"]
            },
            defects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  location: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["type", "location", "severity", "description"]
              }
            },
            summary: { type: Type.STRING }
          },
          required: ["predictedGrade", "confidenceScore", "subgrades", "defects", "summary"]
        }
      }
    });

    const text = response.text || "";
    // Clean JSON if it has markdown blocks
    const cleanJson = text.replace(/\`\`\`json|\`\`\`/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    logger.error("Gemini Visual Audit Error:", error);
    showToast('error', 'Visual audit analysis failed. Please try a clearer image.', { dedupeKey: 'visual_audit' });
    return null;
  }
}

/**
 * Phase 13: Grading Premium Analysis
 * Uses Gemini to estimate the price spread between Raw and Graded versions.
 */
export async function getGradingPremiumAnalysis(card: CardInventory): Promise<GradingPremiumAnalysis | null> {
  const prompt = `Act as an expert sports card investment consultant. Analyze the grading premium for:
  Item: ${card.year} ${card.player} ${card.set} #${card.cardNumber}
  Current Estimated Raw Value: $${card.currentValue || card.purchasePrice}
  Grading Company: PSA/BGS
  
  TASK:
  1. Perform a live search or use your knowledge to find the current market prices for this card in:
     - Raw condition
     - PSA 10 (Gem Mint)
     - PSA 9 (Mint)
     - BGS 9.5 (Gem Mint)
  2. Factor in a standard grading fee of $25 per card.
  3. Calculate the potential net gain (PSA 10 Price - Raw Price - Fees).
  4. Provide a recommendation: 'Submit' (if net gain > $50), 'Hold Raw' (if spread is thin), or 'Sell Now' (if market is peaking).
  5. Provide a concise, professional rationale.
  
  Return the result in valid JSON matching the GradingPremiumAnalysis schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        tools: [{ google_search_retrieval: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rawPrice: { type: Type.NUMBER },
            psa10Price: { type: Type.NUMBER },
            psa9Price: { type: Type.NUMBER },
            bgs95Price: { type: Type.NUMBER },
            gradingFees: { type: Type.NUMBER },
            potentialNetGain: { type: Type.NUMBER },
            recommendation: { type: Type.STRING },
            rationale: { type: Type.STRING }
          },
          required: ["rawPrice", "psa10Price", "psa9Price", "bgs95Price", "gradingFees", "potentialNetGain", "recommendation", "rationale"]
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    return {
      ...data,
      cardId: card.id,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    logger.error("Gemini Grading Premium Error:", error);
    return null;
  }
}

/**
 * Phase 24: Macro-Sentinel Intelligence
 * Fetches real-time macroeconomic signals using Google Search grounding.
 */
export async function getLiveMacroSignals(): Promise<MacroSignal[]> {
  const prompt = `Perform a live search for the most critical macroeconomic indicators affecting discretionary high-end markets (like sports cards) as of today.
  
  Identify:
  1. Current Fed Funds Rate and latest FOMC sentiment.
  2. Crypto Market Liquidity (Bitcoin price and overall market cap).
  3. Inflation data (latest CPI).
  4. S&P 500 performance.
  5. Any major sports card industry news (e.g., M&A, Fanatics/PSA news, major record-breaking sales).

  Return a JSON array of MacroSignal objects:
  - id (unique string)
  - indicator (e.g., 'Fed Funds Rate')
  - value (current value/range)
  - trend ('bullish' | 'bearish' | 'neutral')
  - impact ('High' | 'Medium' | 'Low')
  - description (2-sentence strategic summary of HOW this affects sports card investors)
  - updatedAt (ISO timestamp)
  `;

  try {
    const response = await (ai as any).models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        tools: [{ google_search_retrieval: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              indicator: { type: Type.STRING },
              value: { type: Type.STRING },
              trend: { type: Type.STRING },
              impact: { type: Type.STRING },
              description: { type: Type.STRING },
              updatedAt: { type: Type.STRING },
            },
            required: ["id", "indicator", "value", "trend", "impact", "description", "updatedAt"]
          }
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    return data;
  } catch (error) {
    logger.error("Gemini Macro Signal Error:", error);
    return [];
  }
}











