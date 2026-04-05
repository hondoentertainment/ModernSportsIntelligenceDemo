import { showToast } from './toast';
import { serverApiRequestAuthenticated } from '../serverApi';
import { GeminiResponseSchema, safeParse } from '../schemas';
import { geminiCircuit } from '../apiResilience';

interface GeminiGenerateConfig {
    responseMimeType?: string;
    responseSchema?: unknown;
    tools?: unknown;
}

interface GeminiGenerateRequest {
    model: string;
    contents: unknown;
    config?: GeminiGenerateConfig;
}

interface GeminiGenerateResponse {
    text: string;
}

interface GeminiClientLike {
    models: {
        generateContent(_request: GeminiGenerateRequest): Promise<GeminiGenerateResponse>;
    };
}

let missingProxyWarned = false;

export const hasGeminiApiKey = true;

export function createGeminiClient(): GeminiClientLike {
    return {
        models: {
            async generateContent(request: GeminiGenerateRequest): Promise<GeminiGenerateResponse> {
                try {
                    const raw = await geminiCircuit.execute(() =>
                        serverApiRequestAuthenticated<unknown>('/api/ai/generate', {
                            method: 'POST',
                            body: JSON.stringify(request),
                        })
                    );

                    // Validate the response shape
                    const validated = safeParse(GeminiResponseSchema, raw, 'gemini');
                    if (!validated) {
                        throw new Error('Invalid response from Gemini API');
                    }
                    return { text: validated.text ?? '' };
                } catch (error) {
                    if (!missingProxyWarned) {
                        missingProxyWarned = true;
                        showToast('warning', 'AI features are unavailable until the server API is configured.', {
                            dedupeKey: 'gemini_proxy_missing',
                        });
                    }
                    throw error;
                }
            },
        },
    };
}
