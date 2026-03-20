import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getServerApiBaseUrl,
  getServerApiUrl,
  ServerApiError,
  serverApiRequest,
} from '../../lib/serverApi';

describe('serverApi', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SERVER_API_BASE_URL', '');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('getServerApiBaseUrl returns string', () => {
    expect(typeof getServerApiBaseUrl()).toBe('string');
  });

  it('getServerApiBaseUrl trims trailing slashes when set', () => {
    vi.stubEnv('VITE_SERVER_API_BASE_URL', 'https://api.example.com///');
    expect(getServerApiBaseUrl()).toBe('https://api.example.com');
  });

  it('getServerApiUrl normalizes path with leading slash', () => {
    expect(getServerApiUrl('bar')).toMatch(/^\/bar$/);
  });

  it('getServerApiUrl preserves path when already has leading slash', () => {
    expect(getServerApiUrl('/foo')).toContain('/foo');
  });

  it('getServerApiUrl combines base URL when configured', () => {
    vi.stubEnv('VITE_SERVER_API_BASE_URL', 'https://api.example.com');
    expect(getServerApiUrl('/api/test')).toBe('https://api.example.com/api/test');
  });

  it('ServerApiError has name and status', () => {
    const err = new ServerApiError('Bad request', 400);
    expect(err.name).toBe('ServerApiError');
    expect(err.message).toBe('Bad request');
    expect(err.status).toBe(400);
  });

  it('ServerApiError is instance of Error', () => {
    const err = new ServerApiError('Test', 500);
    expect(err).toBeInstanceOf(Error);
  });

  describe('serverApiRequest (no retry backoff timers)', () => {
    it('returns JSON on success', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: 'success' }),
      } as Response);
      await expect(
        serverApiRequest<{ result: string }>('/test')
      ).resolves.toEqual({ result: 'success' });
    });

    it('includes Content-Type header', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);
      await serverApiRequest('/test', { headers: { 'X-Custom': '1' } });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Custom': '1',
          }),
        })
      );
    });

    it('uses error payload message when present', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({ error: 'invalid' }),
      } as Response);
      await expect(serverApiRequest('/x')).rejects.toMatchObject({
        message: 'invalid',
        status: 422,
      });
    });

    it('does not retry 4xx ServerApiError', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({}),
      } as Response);
      await expect(serverApiRequest('/x')).rejects.toThrow(ServerApiError);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('serverApiRequest (fake timers for 5xx retries)', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    it('uses generic message when error JSON parse fails (retries then fails)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('not json');
        },
      } as Response);
      const p = serverApiRequest('/x');
      const assertion = expect(p).rejects.toThrow(/Request failed with status 500/);
      await vi.runAllTimersAsync();
      await assertion;
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});
