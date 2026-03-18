import { createGeminiClient } from '../utils/geminiClient.ts';
import { logger } from '../logger';
import { CardInventory } from '../../types';

const ai = createGeminiClient();

export async function generateCompareAnalysis(card1: CardInventory, card2: CardInventory): Promise<string> {
    const prompt = `You are a senior sports card analyst. Compare these two assets and provide a concise investment recommendation:

**Asset A**: ${card1.year} ${card1.manufacturer} ${card1.player} (${card1.set})
- Purchase Price: $${card1.purchasePrice}
- Current Value: $${card1.currentValue || 'Unknown'}
- Graded: ${card1.isGraded ? `${card1.gradingCompany} ${card1.grade}` : 'Raw'}

**Asset B**: ${card2.year} ${card2.manufacturer} ${card2.player} (${card2.set})
- Purchase Price: $${card2.purchasePrice}
- Current Value: $${card2.currentValue || 'Unknown'}
- Graded: ${card2.isGraded ? `${card2.gradingCompany} ${card2.grade}` : 'Raw'}

Provide a 2-3 sentence analysis covering:
1. Which asset has stronger long-term upside and why.
2. Key risk factors for each.
3. A clear "Hold", "Sell", or "Accumulate" recommendation for each.

Be direct and analytical. Do not use bullet points.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt
        });
        return response.text || 'Unable to generate analysis. Please try again.';
    } catch (error) {
        logger.error('Compare Analysis Error:', error);
        return 'Analysis unavailable. Ensure your API key is configured correctly.';
    }
}



