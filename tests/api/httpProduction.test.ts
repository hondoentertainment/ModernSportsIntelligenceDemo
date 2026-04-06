import { describe, it, expect, vi, afterEach } from 'vitest';
import { respondInternalError, setApiCorsHeaders } from '../../api/lib/httpProduction';

vi.mock('../../api/lib/logger', () => ({
  apiLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

function mockRes(): {
  headers: Record<string, string>;
  setHeader: (n: string, v: string) => void;
  status: (c: number) => { json: (b: object) => void };
} {
  const headers: Record<string, string> = {};
  return {
    headers,
    setHeader(name: string, value: string) {
      headers[name] = value;
    },
    status() {
      return {
        json: () => {},
      };
    },
  };
}

describe('httpProduction', () => {
  const envSnapshot = { ...process.env };

  afterEach(() => {
    process.env = { ...envSnapshot };
    vi.clearAllMocks();
  });

  it('setApiCorsHeaders uses wildcard in non-production when no origin env', () => {
    delete process.env.ALLOWED_ORIGIN;
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_ENV;
    process.env.NODE_ENV = 'development';
    delete process.env.VERCEL;

    const res = mockRes();
    setApiCorsHeaders(res);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(res.headers['Access-Control-Allow-Headers']).toContain('Authorization');
  });

  it('setApiCorsHeaders prefers ALLOWED_ORIGIN', () => {
    process.env.ALLOWED_ORIGIN = 'https://app.example.com';
    process.env.VERCEL_URL = 'wrong.vercel.app';

    const res = mockRes();
    setApiCorsHeaders(res);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('https://app.example.com');
  });

  it('setApiCorsHeaders builds origin from VERCEL_URL', () => {
    delete process.env.ALLOWED_ORIGIN;
    process.env.VERCEL_URL = 'my-app.vercel.app';

    const res = mockRes();
    setApiCorsHeaders(res);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('https://my-app.vercel.app');
  });

  it('setApiCorsHeaders omits Allow-Origin in production when unresolved', async () => {
    process.env.VERCEL_ENV = 'production';
    delete process.env.ALLOWED_ORIGIN;
    delete process.env.VERCEL_URL;

    const res = mockRes();
    setApiCorsHeaders(res);
    expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
    const { apiLogger } = await import('../../api/lib/logger');
    expect(vi.mocked(apiLogger.warn)).toHaveBeenCalled();
  });

  it('respondInternalError returns generic JSON and logs', async () => {
    const res = mockRes();
    const jsonSpy = vi.fn();
    res.status = () => ({ json: jsonSpy });

    respondInternalError(res, new Error('secret'), 'op failed', 'test_code');
    expect(jsonSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'test_code',
        error: expect.stringMatching(/try again/i),
      }),
    );
    const { apiLogger } = await import('../../api/lib/logger');
    expect(vi.mocked(apiLogger.error)).toHaveBeenCalled();
  });
});
