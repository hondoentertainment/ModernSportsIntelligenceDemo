import { GoogleGenAI, Type } from "@google/genai";
import { CardInventory, CollaborativeThesis } from "../types.ts";
import { showToast } from "./toast.ts";

const apiKey = (typeof process !== 'undefined' && process.env && process.env.VITE_GEMINI_API_KEY) ? process.env.VITE_GEMINI_API_KEY : "";
const ai = new GoogleGenAI({ apiKey });

const AGENT_PERSONAS = {
    scout: {
        name: "Scout Prime",
        persona: "Performance Analytics Specialist. Focuses on on-field stats vs market price correlation.",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100"
    },
    market: {
        name: "Market Sentinel",
        persona: "Macro Trend Expert. Focuses on liquidity, seasonal timing, and market hype cycle.",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100"
    },
    risk: {
        name: "Risk Warden",
        persona: "Portfolio Stability Analyst. Focuses on asset concentration, volatility, and downside protection.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
    },
    negotiator: {
        name: "The Closer",
        persona: "Acquisition Strategy Specialist. Focuses on entry points, negotiation leverage, and deal flow.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
    }
};

export class MultiAgentService {
    static async getCollaborativeThesis(inventory: CardInventory[]): Promise<CollaborativeThesis | null> {
        if (inventory.length === 0) {
            showToast('warning', 'Inventory empty. Ingest assets to unlock War Room intelligence.');
            return null;
        }

        const inventorySummary = inventory.map(c =>
            `${c.year} ${c.player} ${c.set} (${c.league}) - Value: $${c.currentValue || 'N/A'}`
        ).join("\n");

        const prompt = `Act as an Elite Multi-Agent Investment Committee. Analyze the following portfolio and generate a collaborative investment thesis.
    
    PORTFOLIO SUMMARY:
    ${inventorySummary}
    
    SYSTEM INSTRUCTIONS:
    1. Simulate four distinct specialist agents (Scout, Market, Risk, Negotiator).
    2. Each agent must provide a concise (max 2 sentences) insight from their perspective.
    3. Synthesize their collaborative output into a unified thesis.
    
    EXPECTED JSON OUTPUT:
    {
      "summary": "Overall portfolio state",
      "keyTakeaways": ["list of 3 key insights"],
      "riskAssessment": "Concise risk outlook",
      "recommendedAction": "Primary strategic move",
      "agents": [
        {
          "agentId": "scout",
          "agentName": "Scout Prime",
          "persona": "Performance Analytics Specialist",
          "insight": "...",
          "sentiment": "positive|neutral|negative",
          "confidence": 0.9
        },
        ... (repeat for all 4 agents)
      ]
    }`;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
                            riskAssessment: { type: Type.STRING },
                            recommendedAction: { type: Type.STRING },
                            agents: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        agentId: { type: Type.STRING },
                                        agentName: { type: Type.STRING },
                                        persona: { type: Type.STRING },
                                        insight: { type: Type.STRING },
                                        sentiment: { type: Type.STRING },
                                        confidence: { type: Type.NUMBER }
                                    },
                                    required: ["agentId", "agentName", "persona", "insight", "sentiment", "confidence"]
                                }
                            }
                        },
                        required: ["summary", "keyTakeaways", "riskAssessment", "recommendedAction", "agents"]
                    }
                }
            });

            const data = JSON.parse(response.text || "{}");
            return {
                ...data,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString()
            };
        } catch (error) {
            console.error("Multi-Agent Intelligence Error:", error);
            showToast('error', 'Intelligence committee failed to convene. Try again later.');
            return null;
        }
    }

    static getPersona(agentId: string) {
        return AGENT_PERSONAS[agentId as keyof typeof AGENT_PERSONAS] || AGENT_PERSONAS.scout;
    }
}
