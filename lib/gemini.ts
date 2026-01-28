
import { GoogleGenAI, Type } from "@google/genai";
import { CardInventory, PricingAnalysis } from "../types.ts";

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
    return MOCK_PROSPECTS[league] || MOCK_PROSPECTS.MiLB;
  }
}
