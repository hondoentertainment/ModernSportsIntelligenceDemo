import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/serverApi', () => ({
  serverApiRequest: vi.fn(),
}));

vi.mock('../../lib/utils/toast', () => ({
  showToast: vi.fn(),
}));

describe('geminiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports hasGeminiApiKey as true', async () => {
    const { hasGeminiApiKey } = await import('../../lib/geminiClient');
    expect(hasGeminiApiKey).toBe(true);
  });

  it('createGeminiClient returns client with models.generateContent', async () => {
    const { createGeminiClient } = await import('../../lib/geminiClient');
    const client = createGeminiClient();
    expect(client).toBeDefined();
    expect(client.models).toBeDefined();
    expect(typeof client.models.generateContent).toBe('function');
  });

  it('generateContent calls serverApiRequest', async () => {
    const { createGeminiClient } = await import('../../lib/geminiClient');
    const { serverApiRequest } = await import('../../lib/serverApi');
    const mockResponse = { text: 'Generated text' };
    vi.mocked(serverApiRequest).mockResolvedValue(mockResponse);

    const client = createGeminiClient();
    const result = await client.models.generateContent({
      model: 'gemini-pro',
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
    });

    expect(result).toEqual(mockResponse);
    expect(serverApiRequest).toHaveBeenCalledWith('/api/ai/generate', {
      method: 'POST',
      body: expect.stringContaining('gemini-pro'),
    });
  });

  it('generateContent shows toast on error', async () => {
    const { createGeminiClient } = await import('../../lib/geminiClient');
    const { serverApiRequest } = await import('../../lib/serverApi');
    const { showToast } = await import('../../lib/toast');
    const error = new Error('API error');
    vi.mocked(serverApiRequest).mockRejectedValue(error);

    const client = createGeminiClient();
    
    await expect(
      client.models.generateContent({ model: 'gemini-pro', contents: [] })
    ).rejects.toThrow('API error');

    // Toast should be called with warning message
    expect(showToast).toHaveBeenCalled();
    const callArgs = vi.mocked(showToast).mock.calls[0];
    expect(callArgs[0]).toBe('warning');
    expect(callArgs[1]).toContain('AI features are unavailable');
  });

  it('generateContent only shows toast once on repeated errors', async () => {
    // Reset modules to clear missingProxyWarned flag
    vi.resetModules();
    const { createGeminiClient } = await import('../../lib/geminiClient');
    const { serverApiRequest } = await import('../../lib/serverApi');
    const { showToast } = await import('../../lib/toast');
    const error = new Error('API error');
    vi.mocked(serverApiRequest).mockRejectedValue(error);

    const client = createGeminiClient();
    
    // First call
    await expect(
      client.models.generateContent({ model: 'gemini-pro', contents: [] })
    ).rejects.toThrow();
    
    // Second call
    await expect(
      client.models.generateContent({ model: 'gemini-pro', contents: [] })
    ).rejects.toThrow();

    // Toast should only be called once
    expect(showToast).toHaveBeenCalledTimes(1);
  });

  it('generateContent includes config in request', async () => {
    const { createGeminiClient } = await import('../../lib/geminiClient');
    const { serverApiRequest } = await import('../../lib/serverApi');
    const mockResponse = { text: 'Response' };
    vi.mocked(serverApiRequest).mockResolvedValue(mockResponse);

    const client = createGeminiClient();
    await client.models.generateContent({
      model: 'gemini-pro',
      contents: [],
      config: {
        responseMimeType: 'application/json',
        responseSchema: { type: 'object' },
      },
    });

    expect(serverApiRequest).toHaveBeenCalledWith(
      '/api/ai/generate',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('gemini-pro'),
      })
    );
  });
});
