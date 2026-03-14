import { GoogleGenAI } from "@google/genai";
import { showToast } from "./toast";

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
let missingKeyWarned = false;

export const hasGeminiApiKey = geminiApiKey.length > 0;

export function createGeminiClient(): GoogleGenAI {
    if (!hasGeminiApiKey && !missingKeyWarned) {
        missingKeyWarned = true;
        console.warn("VITE_GEMINI_API_KEY is missing. Gemini features will be unavailable.");
        showToast('warning', 'AI features unavailable: missing Gemini API key.', { dedupeKey: 'gemini_key_missing' });
    }
    return new GoogleGenAI({ apiKey: geminiApiKey });
}