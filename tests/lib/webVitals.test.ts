import { describe, it, expect, vi, beforeEach } from 'vitest';
import { __test__ } from '../../lib/utils/webVitals';

describe('webVitals.makeHandler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(Math, 'random').mockReturnValue(0.1); // < default sample
  });

  it('builds a payload with name, value, rating, id, page, ts, sessionSample', () => {
    const sendBeaconSpy = vi.fn().mockReturnValue(true);
    vi.stubGlobal('navigator', { sendBeacon: sendBeaconSpy });
    vi.stubGlobal('location', { pathname: '/', hash: '#/dashboard' });

    const handler = __test__.makeHandler(1);
    handler({
      name: 'LCP',
      value: 2300,
      rating: 'good',
      id: 'v3-1700000000000-1234',
      delta: 100,
      entries: [],
      navigationType: 'navigate',
    } as any);

    expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
    const [, body] = sendBeaconSpy.mock.calls[0]!;
    const payload = JSON.parse(body as string);
    expect(payload.name).toBe('LCP');
    expect(payload.value).toBe(2300);
    expect(payload.rating).toBe('good');
    expect(payload.page).toBe('/#/dashboard');
    expect(typeof payload.ts).toBe('number');
    expect(payload.sessionSample).toBe(1);
  });

  it('drops the metric when Math.random > sample rate', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const sendBeaconSpy = vi.fn().mockReturnValue(true);
    vi.stubGlobal('navigator', { sendBeacon: sendBeaconSpy });
    vi.stubGlobal('location', { pathname: '/', hash: '' });

    const handler = __test__.makeHandler(0.25);
    handler({ name: 'INP', value: 50, rating: 'good', id: 'x', delta: 50, entries: [] } as any);

    expect(sendBeaconSpy).not.toHaveBeenCalled();
  });

  it('falls back to fetch when navigator.sendBeacon is missing', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('fetch', fetchSpy);
    vi.stubGlobal('location', { pathname: '/', hash: '' });

    const handler = __test__.makeHandler(1);
    handler({ name: 'CLS', value: 0.01, rating: 'good', id: 'x', delta: 0.01, entries: [] } as any);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe('/api/telemetry/web-vitals');
    expect((init as RequestInit).method).toBe('POST');
    expect((init as RequestInit).keepalive).toBe(true);
  });

  it('handles sendBeacon returning false by falling back to fetch', () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const sendBeaconSpy = vi.fn().mockReturnValue(false);
    vi.stubGlobal('navigator', { sendBeacon: sendBeaconSpy });
    vi.stubGlobal('fetch', fetchSpy);
    vi.stubGlobal('location', { pathname: '/', hash: '' });

    const handler = __test__.makeHandler(1);
    handler({ name: 'TTFB', value: 200, rating: 'good', id: 'x', delta: 200, entries: [] } as any);

    expect(sendBeaconSpy).toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalled();
  });
});
