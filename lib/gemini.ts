
import { GoogleGenAI, Type } from "@google/genai";
import { CardInventory, PricingAnalysis } from "../types.ts";

const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : "";
const ai = new GoogleGenAI({ apiKey });

export async function getEbayCardPrice(card: CardInventory): Promise<PricingAnalysis | null> {
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
    return {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Gemini Pricing Error:", error);
    return null;
  }
}

export async function simulateMiLBTrends(): Promise<any[]> {
  const prompt = `Generate a realistic daily trend simulation for 50 top Minor League Baseball (MiLB) prospects.
  For each prospect, provide:
  - Name
  - Team (Current MLB Affiliate)
  - Position
  - League (AAA, AA, High-A, Low-A)
  - Trend Score (0-100 based on search interest simulation)
  - 24h Change percentage (-60 to +150)
  - Trend Direction (up, down, stable)
  - 7-day historical trend data (array of 7 numbers)

  Make the data diverse and realistic based on current (simulated) prospect hype levels.`;

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
            },
            required: ["name", "team", "position", "league", "trendScore", "change24h", "trendDirection", "history7d"]
          }
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Trend Error:", error);
    return [];
  }
}
