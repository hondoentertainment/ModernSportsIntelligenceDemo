import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO_SESSION_KEY } from '../../lib/demoSession';
import { store } from '../../lib/dal/syncStore';
import { showToast } from '../../lib/utils/toast';
import { MultiAgentService } from '../../lib/utils/MultiAgentService';
import { ArbitrageAgentService } from '../../lib/trading/ArbitrageAgentService';
import { generatePortfolioSentiment } from '../../lib/utils/gemini';
import { makeCard } from '../helpers';

const generateContent = vi.hoisted(() => vi.fn());

vi.mock('../../lib/utils/geminiClient', () => ({
  createGeminiClient: () => ({
    models: { generateContent },
  }),
  hasGeminiApiKey: true,
}));

vi.mock('../../lib/utils/toast', () => ({
  showToast: vi.fn(),
}));

function enterDemo(): void {
  vi.stubEnv('VITE_PUBLIC_DEMO', 'true');
  store.set(DEMO_SESSION_KEY, true);
}

function leaveDemo(): void {
  vi.stubEnv('VITE_PUBLIC_DEMO', 'false');
  store.remove(DEMO_SESSION_KEY);
}

describe('demo AI committees and sentiment', () => {
  beforeEach(() => {
    generateContent.mockReset();
    vi.mocked(showToast).mockClear();
    leaveDemo();
  });

  it('serves a labeled committee note in a demo session', async () => {
    enterDemo();
    const thesis = await MultiAgentService.getCollaborativeThesis([
      makeCard({ player: 'Riley Greene' }),
    ]);

    expect(thesis?.summary).toMatch(/demo data/i);
    expect(thesis?.summary).toMatch(/committee is offline/i);
    expect(thesis?.summary).toMatch(/Riley Greene/);
    expect(generateContent).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });

  it('still toasts when a signed-in committee fails', async () => {
    generateContent.mockRejectedValue(new Error('model down'));
    const thesis = await MultiAgentService.getCollaborativeThesis([makeCard()]);

    expect(thesis).toBeNull();
    expect(showToast).toHaveBeenCalledWith(
      'error',
      'Intelligence committee failed to convene. Try again later.',
    );
  });

  it('serves a labeled arbitrage note in a demo session', async () => {
    enterDemo();
    const insight = await ArbitrageAgentService.getCrossAssetAnalysis();

    expect(insight?.summary).toMatch(/demo data/i);
    expect(insight?.liquidityFlightStatus).toBe('Stable');
    expect(insight?.agents[0]?.insight).toMatch(/demo data/i);
    expect(generateContent).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });

  it('still toasts when a signed-in arbitrage committee fails', async () => {
    generateContent.mockRejectedValue(new Error('model down'));
    await expect(ArbitrageAgentService.getCrossAssetAnalysis()).resolves.toBeNull();
    expect(showToast).toHaveBeenCalledWith(
      'error',
      'Arbitrage committee failed to convene. Retrying link...',
    );
  });

  it('serves labeled sentiment in a demo session', async () => {
    enterDemo();
    const text = await generatePortfolioSentiment([makeCard()]);

    expect(text).toMatch(/^Demo data:/);
    expect(generateContent).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });

  it('still toasts when signed-in sentiment fails', async () => {
    generateContent.mockRejectedValue(new Error('model down'));
    const text = await generatePortfolioSentiment([makeCard()]);

    expect(showToast).toHaveBeenCalledWith(
      'warning',
      'AI sentiment analysis unavailable.',
      { dedupeKey: 'sentiment' },
    );
    expect(text).toMatch(/volatility/i);
  });
});
