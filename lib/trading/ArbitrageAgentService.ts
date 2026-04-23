// @ts-nocheck
import { Type } from "@google/genai";
import { CrossAssetInsight, AgentInsight } from "../../types.ts";
import { showToast } from "../utils/toast.ts";
import { createGeminiClient } from "../utils/geminiClient.ts";
import { logger } from "../logger";

const ai = createGeminiClient();

const ARBITRAGE_PERSONAS = {
    chronos: {
        name: "Chronos",
        persona: "Horological Equity Specialist. Expert in Luxury Watch market cycles, specifically Rolex, Patek Philippe, and Audemars Piguet.",
        avatar: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=100"
    },
    canvas: {
        name: "Canvas Analyst",
        persona: "Fine Art Liquidity Expert. Specializes in Contemporary Art and Blue-Chip artist correlations with broader market sentiment.",
        avatar: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=100"
    },
    link: {
        name: "Asset Link",
        persona: "Cross-Sector Arbitrage Specialist. Identifies capital flight patterns between sports cards, watches, and fine art.",
        avatar: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=100"
    }
};

export class ArbitrageAgentService {
    static async getCrossAssetAnalysis(): Promise<CrossAssetInsight | null> {
        const prompt = `Act as an Institutional Cross-Asset Arbitrage Swarm. Analyze the current intersection of Sports Cards, Luxury Watches, and Fine Art markets.

        SYSTEM INSTRUCTIONS:
        1. Simulate three specialist agents: Chronos (Watches), Canvas (Fine Art), and Asset Link (Arbitrage).
        2. Identify 3 specific "Arbitrage Nodes" where value in one asset class represents a superior entry point compared to another (e.g., a specific card being "undervalued" relative to a similar-tier watch).
        3. Assess "Liquidity Flight" status (Stable, Volatile, Critical).
        4. Provide unique, high-fidelity insights for each agent.

        EXPECTED JSON OUTPUT:
        {
          "summary": "High-level market correlation summary",
          "liquidityFlightStatus": "Stable|Volatile|Critical",
          "topArbitrageNodes": [
            {
              "id": "uuid",
              "sourceAsset": { "name": "Asset A", "assetClass": "Sports Cards", "currentValue": 50000 },
              "targetAsset": { "name": "Asset B", "assetClass": "Luxury Watches", "currentValue": 55000 },
              "correlationDelta": 12.5,
              "opportunityScore": 85,
              "rationale": "Why Asset A is better value than Asset B",
              "status": "active"
            }
          ],
          "agents": [
            {
              "agentId": "chronos",
              "agentName": "Chronos",
              "persona": "Horological Equity Specialist",
              "insight": "...",
              "sentiment": "positive|neutral|negative",
              "confidence": 0.92
            }
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
                            liquidityFlightStatus: { type: Type.STRING },
                            topArbitrageNodes: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        sourceAsset: {
                                            type: Type.OBJECT,
                                            properties: {
                                                name: { type: Type.STRING },
                                                assetClass: { type: Type.STRING },
                                                currentValue: { type: Type.NUMBER }
                                            }
                                        },
                                        targetAsset: {
                                            type: Type.OBJECT,
                                            properties: {
                                                name: { type: Type.STRING },
                                                assetClass: { type: Type.STRING },
                                                currentValue: { type: Type.NUMBER }
                                            }
                                        },
                                        correlationDelta: { type: Type.NUMBER },
                                        opportunityScore: { type: Type.NUMBER },
                                        rationale: { type: Type.STRING },
                                        status: { type: Type.STRING }
                                    }
                                }
                            },
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
                        required: ["summary", "liquidityFlightStatus", "topArbitrageNodes", "agents"]
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
            logger.error("Arbitrage Intelligence Error:", error);
            showToast('error', 'Arbitrage committee failed to convene. Retrying link...');
            return null;
        }
    }

    static getPersona(agentId: string) {
        return ARBITRAGE_PERSONAS[agentId as keyof typeof ARBITRAGE_PERSONAS] || ARBITRAGE_PERSONAS.link;
    }
}



