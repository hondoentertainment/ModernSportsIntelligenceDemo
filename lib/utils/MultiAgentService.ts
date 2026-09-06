import { Type } from "@google/genai";
import { AgentRecommendationOrigin, CardInventory, CollaborativeThesis, SwarmInsight } from "../../types.ts";
import { showToast } from "./toast.ts";
import { createGeminiClient } from "./geminiClient.ts";
import { upsertAgentRecommendation } from "./differentiatorData.ts";
import { logger } from "../logger";
import { safeParse, WarRoomCommitteeResponseSchema } from "../schemas.ts";
import {
    WAR_ROOM_COMMITTEE_MODEL_ID,
    WAR_ROOM_PROMPT_VERSION,
    computeWarRoomInputFingerprint,
} from "./warRoomThesisAudit.ts";
import { buildWarRoomLedgerContext } from "./warRoomLedgerContext.ts";

const ai = createGeminiClient();

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
    },
    strategist: {
        name: "Strategist Prime",
        persona: "Autonomous Execution Lead. Focuses on active portfolio rebalancing and algorithmic entry/exit.",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100"
    }
};

export class MultiAgentService {
    static async getCollaborativeThesis(
        inventory: CardInventory[],
        includeStrategist: boolean = false,
        source: AgentRecommendationOrigin = 'war-room'
    ): Promise<CollaborativeThesis | null> {
        if (inventory.length === 0) {
            showToast('warning', 'Inventory empty. Ingest assets to unlock War Room intelligence.');
            return null;
        }

        const inventorySummary = inventory.map(c =>
            `${c.year} ${c.player} ${c.set} (${c.league}) - Value: $${c.currentValue || 'N/A'} [${c.valuationSource || 'fallback'}]`
        ).join("\n");
        const ledgerContext = buildWarRoomLedgerContext(inventory);

        const prompt = `Act as an Elite Multi-Agent Investment Committee. Analyze the following portfolio and generate a collaborative investment thesis.
    
    PORTFOLIO SUMMARY:
    ${inventorySummary}

    ${ledgerContext}
    
    SYSTEM INSTRUCTIONS:
    1. Simulate the following specialist agents: ${includeStrategist ? 'Scout, Market, Risk, Negotiator, and Strategist' : 'Scout, Market, Risk, and Negotiator'}.
    2. Each agent must provide a concise (max 2 sentences) insight from their perspective.
    3. Each agent must also provide a reasoningChain: 2-4 short steps explaining how they reached the insight. If an agent dissents from likely consensus, add conflictNotes.
    4. Synthesize their collaborative output into a unified thesis.
    5. Weight ebay-api / historical-comps quotes above gemini / fallback when recommending actions. Call out coverage gaps when fresh verifiable % is below target.
    ${includeStrategist ? '6. Strategist Prime MUST provide a specific executionPlan as a list of actions.' : ''}
    
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
          "confidence": 0.9,
          "reasoningChain": ["step 1", "step 2"],
          "conflictNotes": []
        },
        ... (repeat for all 4 agents)
      ]
    }`;

        const inputHash = computeWarRoomInputFingerprint(inventory, includeStrategist);

        try {
            const response = await ai.models.generateContent({
                model: WAR_ROOM_COMMITTEE_MODEL_ID,
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
                                        confidence: { type: Type.NUMBER },
                                        reasoningChain: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        conflictNotes: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    },
                                    required: ["agentId", "agentName", "persona", "insight", "sentiment", "confidence"]
                                }
                            },
                            executionPlan: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        type: { type: Type.STRING },
                                        assetName: { type: Type.STRING },
                                        amount: { type: Type.NUMBER },
                                        rationale: { type: Type.STRING },
                                        timestamp: { type: Type.STRING },
                                        status: { type: Type.STRING }
                                    },
                                    required: ["id", "type", "assetName", "amount", "rationale", "timestamp", "status"]
                                }
                            }
                        },
                        required: ["summary", "keyTakeaways", "riskAssessment", "recommendedAction", "agents"]
                    }
                }
            });

            let parsedJson: unknown;
            try {
                parsedJson = JSON.parse(response.text || "{}");
            } catch {
                showToast('error', 'Committee response was not valid JSON. Try again.');
                return null;
            }

            const data = safeParse(WarRoomCommitteeResponseSchema, parsedJson, 'war-room-committee');
            if (!data) {
                showToast('error', 'Committee returned an unexpected format. Try Refresh again.');
                return null;
            }

            const recommendationId = crypto.randomUUID();
            const runMetadata = {
                inputHash,
                promptVersion: WAR_ROOM_PROMPT_VERSION,
                modelId: WAR_ROOM_COMMITTEE_MODEL_ID,
                includeStrategist,
            };
            const thesis: CollaborativeThesis = {
                summary: data.summary,
                keyTakeaways: data.keyTakeaways,
                riskAssessment: data.riskAssessment,
                recommendedAction: data.recommendedAction,
                agents: data.agents,
                executionPlan: data.executionPlan as CollaborativeThesis['executionPlan'],
                id: crypto.randomUUID(),
                recommendationId,
                createdAt: new Date().toISOString(),
                runMetadata,
            };

            try {
                await upsertAgentRecommendation({
                    id: recommendationId,
                    source,
                    cycleId: thesis.executionPlan?.[0]?.cycleId,
                    thesisId: thesis.id,
                    summary: thesis.summary,
                    recommendedAction: thesis.recommendedAction,
                    riskAssessment: thesis.riskAssessment,
                    status: includeStrategist ? 'pending_approval' : 'queued',
                    keyTakeaways: thesis.keyTakeaways,
                    agents: thesis.agents,
                    executionPlan: thesis.executionPlan,
                    metadata: {
                        includeStrategist,
                        inventorySize: inventory.length,
                        inputHash,
                        promptVersion: WAR_ROOM_PROMPT_VERSION,
                        modelId: WAR_ROOM_COMMITTEE_MODEL_ID,
                    },
                    createdAt: thesis.createdAt,
                });
            } catch (persistErr) {
                logger.error('War Room: failed to persist agent recommendation', persistErr);
                showToast(
                    'warning',
                    'Thesis is ready on this device, but saving to your recommendation log failed. Use Export if you need a file copy.',
                );
            }

            return thesis;
        } catch (error) {
            logger.error("Multi-Agent Intelligence Error:", error);
            showToast('error', 'Intelligence committee failed to convene. Try again later.');
            return null;
        }
    }

    static async getSwarmIntelligence(): Promise<SwarmInsight[]> {
        const prompt = `Act as a Collective Intelligence Hub. Synthesize market-wide "Alpha Swarms" based on institutional and retail liquidity shifts.
    
    EXPECTED JSON OUTPUT:
    [
      {
        "id": "uuid",
        "title": "Short title of the alpha trend",
        "description": "2-sentence breakdown of the opportunity",
        "sentiment": "bullish|bearish|neutral",
        "confidence": 0.0-1.0,
        "impactScore": 1-100,
        "tags": ["Scarcity", "Momentum", etc.],
        "participatingAgents": ["Scout", "Market", "Risk"]
      }
    ]`;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                sentiment: { type: Type.STRING },
                                confidence: { type: Type.NUMBER },
                                impactScore: { type: Type.NUMBER },
                                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                                participatingAgents: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ["id", "title", "description", "sentiment", "confidence", "impactScore", "tags", "participatingAgents"]
                        }
                    }
                }
            });

            return JSON.parse(response.text || "[]");
        } catch (error) {
            logger.error("Swarm Intelligence Error:", error);
            return [];
        }
    }

    static async getJointAcquisitionThesis(targetCard: CardInventory, groupContext: string): Promise<CollaborativeThesis | null> {
        const prompt = `Act as an Elite Multi-Agent Investment Committee for a Joint Acquisition Guild. 
    Analyze this asset for collective fractional ownership.
    
    TARGET ASSET:
    ${targetCard.year} ${targetCard.player} ${targetCard.set} - Price: $${targetCard.purchasePrice}
    
    GUILD CONTEXT:
    ${groupContext}
    
    SPECIAL INSTRUCTIONS:
    - Evaluate this specifically as a fractional hold.
    - Risk agent must focus on group liquidity and exit consensus.
    - Scout must focus on the "Grail" potential for the guild's prestige.

    EXPECTED JSON OUTPUT:
    (Standard CollaborativeThesis JSON structure)`;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });

            const data = JSON.parse(response.text || "{}");
            return {
                ...data,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString()
            };
        } catch (error) {
            logger.error("Joint Thesis Error:", error);
            return null;
        }
    }

    static getPersona(agentId: string) {
        return AGENT_PERSONAS[agentId as keyof typeof AGENT_PERSONAS] || AGENT_PERSONAS.scout;
    }
}




