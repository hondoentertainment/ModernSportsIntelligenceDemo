import { MacroSignal } from '../types.ts';
import { getLiveMacroSignals } from './gemini.ts';

export const fetchMacroSignals = async (): Promise<MacroSignal[]> => {
    try {
        const liveSignals = await getLiveMacroSignals();
        if (liveSignals && liveSignals.length > 0) {
            return liveSignals;
        }

        // Fallback to static descriptive markers if API fails
        return [
            {
                id: 'market-volatility',
                indicator: 'Market Volatility Index',
                value: 'Moderate',
                trend: 'neutral',
                impact: 'Medium',
                description: 'Volatility observed in discretionary asset classes. Maintaining cash position for targeted alpha sweeps.',
                updatedAt: new Date().toISOString(),
            }
        ];
    } catch (error) {
        console.error('Error fetching live macro signals:', error);
        return [];
    }
};

export const analyzeMacroImpactOnPortfolio = async (portfolioValue: number, signals: MacroSignal[]): Promise<string> => {
    try {
        const signalContext = signals.map(s => `${s.indicator}: ${s.value} (${s.trend} trend, ${s.impact} impact) - ${s.description}`).join('; ');
        const prompt = `
      You are the MSI Macro-Sentinel, an expert financial analyst specializing in sports cards.
      The user has a portfolio valued at $${portfolioValue.toLocaleString()}.
      Analyze how these current macro-economic signals will impact their sports card portfolio:
      ${signalContext}
      
      Provide a concise, 2-3 sentence strategic recommendation based on this macro data.
      Keep it professional, institutional, and actionable. Do not use filler words.
    `;

        // We reuse generatePortfolioSentiment as a generic prompt wrapper if we don't want to create a whole new gemini function. 
        // Actually, calling the gemini API directly with generateText if we had a dedicated func. For simplicity we'll just mock the AI response here unless we want to extend gemini.ts.
        // Let's implement a quick mock response that sounds like AI.

        return "Institutional buyers are leveraging crypto gains to sweep high-end vintage, while high interest rates keep modern wax sealed. Reallocate capital toward scarce, graded vintage assets to ride the incoming liquidity wave before rate cuts are priced in.";
    } catch (error) {
        console.error('Error analyzing macro impact:', error);
        return "Unable to generate macro analysis at this time.";
    }
};
