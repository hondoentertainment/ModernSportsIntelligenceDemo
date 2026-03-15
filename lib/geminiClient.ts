import { showToast } from './toast';
import { serverApiRequest } from './serverApi';

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
        generateContent(request: GeminiGenerateRequest): Promise<GeminiGenerateResponse>;
    };
}

let missingProxyWarned = false;

export const hasGeminiApiKey = true;

export function createGeminiClient(): GeminiClientLike {
    return {
        models: {
            async generateContent(request: GeminiGenerateRequest): Promise<GeminiGenerateResponse> {
                try {
                    return await serverApiRequest<GeminiGenerateResponse>('/api/ai/generate', {
                        method: 'POST',
                        body: JSON.stringify(request),
                    });
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