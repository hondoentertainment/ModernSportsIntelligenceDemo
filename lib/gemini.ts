
import { GoogleGenAI, Type } from "@google/genai";
import { CardInventory, PricingAnalysis, TargetWatchlist } from "../types.ts";
import { getEbayCardPricing as getEbayApiPricing, getEbayWatchlistPricing, isEbayConfigured } from "./ebayApi.ts";
import { showToast } from "./toast.ts";

const apiKey = (typeof process !== 'undefined' && process.env && process.env.VITE_GEMINI_API_KEY) ? process.env.VITE_GEMINI_API_KEY : "";
const ai = new GoogleGenAI({ apiKey });

const MOCK_PROSPECTS: Record<string, any[]> = {
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

export async function getEbayCardPrice(card: CardInventory): Promise<PricingAnalysis | null> {
  // Try eBay API first if configured
  if (isEbayConfigured()) {
    try {
      const ebayResult = await getEbayApiPricing(
        card.player,
        card.year,
        card.manufacturer,
        card.cardNumber,
        card.set,
        card.isGraded,
        card.gradingCompany,
        card.grade
      );

      if (ebayResult) {
        console.log('Using eBay API pricing for:', card.player);
        return ebayResult;
      }
    } catch (error) {
      console.warn('eBay API pricing failed, falling back to AI:', error);
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

  Provide a detailed breakdown including the estimated current market value, low/high/average ranges from recent sales, a confidence score (0-1), and the number of recent sales used for the calculation.`;

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
          },
          required: ["estimatedValue", "low", "high", "avg", "confidence", "salesCount"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");

    // Generate grounded eBay Search URL
    const searchQuery = encodeURIComponent(`${card.year} ${card.manufacturer} ${card.player} ${card.cardNumber} ${card.set}${card.isGraded ? ` ${card.gradingCompany} ${card.grade}` : ''} sold`);
    const searchUrl = `https://www.ebay.com/sch/i.html?_from=R40&_nkw=${searchQuery}&_sacat=0&rt=nc&LH_Sold=1&LH_Complete=1`;

    return {
      ...data,
      searchUrl,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Gemini Pricing Error:", error);
    showToast('error', `AI valuation failed for ${card.player}. Try again later.`, { dedupeKey: `gemini_price_${card.id}` });
    return null;
  }
}

/**
 * AI-powered pricing for watchlist acquisition targets.
 * Uses the target's player name and card description to estimate current market value.
 * Tries eBay API first, falls back to AI analysis.
 */
export async function getWatchlistItemPrice(target: TargetWatchlist): Promise<PricingAnalysis | null> {
  // Try eBay API first if configured
  if (isEbayConfigured()) {
    try {
      const ebayResult = await getEbayWatchlistPricing(
        target.player,
        target.cardDescription
      );

      if (ebayResult) {
        console.log('Using eBay API pricing for watchlist:', target.player);
        return ebayResult;
      }
    } catch (error) {
      console.warn('eBay API pricing failed for watchlist, falling back to AI:', error);
      showToast('warning', `eBay unavailable for ${target.player} — using AI estimate.`, { dedupeKey: 'ebay_fallback' });
    }
  }

  // Fallback to AI pricing
  const prompt = `Analyze current eBay sold listings for the following sports card and provide an accurate market value analysis:
  Player: ${target.player}
  Card Description: ${target.cardDescription}
  Sport: ${target.sport}
  League: ${target.league}

  Provide a detailed breakdown including the estimated current market value, low/high/average ranges from recent sales, a confidence score (0-1), and the number of recent sales used for the calculation.`;

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
          },
          required: ["estimatedValue", "low", "high", "avg", "confidence", "salesCount"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");

    const searchQuery = encodeURIComponent(`${target.player} ${target.cardDescription} sold`);
    const searchUrl = `https://www.ebay.com/sch/i.html?_from=R40&_nkw=${searchQuery}&_sacat=0&rt=nc&LH_Sold=1&LH_Complete=1`;

    return {
      ...data,
      searchUrl,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Gemini Watchlist Pricing Error:", error);
    showToast('error', `AI valuation failed for watchlist item "${target.player}".`, { dedupeKey: `gemini_wl_${target.id}` });
    return null;
  }
}

export async function simulateLeagueTrends(league: string): Promise<any[]> {
  const prompt = `Generate a realistic daily trend simulation for 50 top ${league} athletes/prospects.
  For each athlete, provide:
  - Name
  - Team
  - Position
  - League (Must be ${league})
  - Trend Score (0-100 based on search interest simulation)
  - 24h Change percentage (-60 to +150)
  - Trend Direction (up, down, stable)
  - 7-day historical trend data (array of 7 numbers)
  - Breakout Score (0-100 indicating likelihood of a mass-market breakout or promotion)
  - Summary (1-sentence intelligence summary)
  - Stats (Object with 'primary', 'secondary', and 'label' e.g. {primary: '0.980 OPS', secondary: '.290 AVG', label: 'Hitting'})
  - Image (A high-quality Unsplash URL related to ${league} or sports)

  Make the data diverse and realistic based on current (simulated)hype levels.`;

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

    const data = JSON.parse(response.text || "[]");
    return data.length > 0 ? data : (MOCK_PROSPECTS[league] || MOCK_PROSPECTS.MiLB);
  } catch (error) {
    console.error("Gemini Trend Error:", error);
    showToast('warning', `Live ${league} trends unavailable — showing cached data.`, { dedupeKey: `trend_${league}` });
    return MOCK_PROSPECTS[league] || MOCK_PROSPECTS.MiLB;
  }
}

export async function generatePortfolioSentiment(inventory: CardInventory[]): Promise<string> {
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
      contents: prompt
    });

    return response.text || "Stable market conditions observed across all sectors.";
  } catch (error) {
    console.error("Gemini Sentiment Error:", error);
    showToast('warning', 'AI sentiment analysis unavailable.', { dedupeKey: 'sentiment' });
    return "Market volatility detected. Institutional hold signals recommended.";
  }
}

/**
 * AI Vision: Parses a card image into structured data.
 * imageBase64: Base64 string of the image (no prefix)
 * mimeType: e.g. "image/jpeg"
 */
export async function parseCardImage(imageBase64: string, mimeType: string = "image/jpeg"): Promise<Partial<CardInventory> | null> {
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
    console.error("Gemini Vision Error:", error);
    showToast('error', 'Card scan failed. Check your connection and try again.', { dedupeKey: 'vision' });
    return null;
  }
}

/**
 * Deep Search: Finds cards or players similar to the input using AI reasoning.
 */
export async function findSimilarCards(query: string, inventory: CardInventory[] = []): Promise<any[]> {
  const prompt = `Act as an expert sports card scout and market analyst. 
  Perform a deep similarity search for: "${query}"
  
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
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Deep Search Error:", error);
    showToast('error', 'Deep search failed. Check your connection.', { dedupeKey: 'deepsearch' });
    return [];
  }
}
