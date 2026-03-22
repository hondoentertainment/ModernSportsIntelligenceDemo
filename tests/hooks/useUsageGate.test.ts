import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUsageGate } from '../../hooks/useUsageGate';
import { store } from '../../lib/dal/syncStore';
import { setupLocalStorageMock } from '../helpers';

// Mock useAuth from AuthContext
const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
}));

// Mock logger
vi.mock('../../lib/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

describe('useUsageGate', () => {
  let lsMock: ReturnType<typeof setupLocalStorageMock>;

  beforeEach(() => {
    store.clear();
    lsMock = setupLocalStorageMock();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper to set up useAuth return value
  function setAuth(tier: string, isDemoMode = false) {
    mockUseAuth.mockReturnValue({
      userTier: tier,
      isDemoMode,
      user: { id: 'test-user' },
      session: {},
      loading: false,
    });
  }

  // ── Free tier limits ────────────────────────────────────────────────

  describe('free tier', () => {
    beforeEach(() => setAuth('free'));

    it('canAddCard(49) is allowed (under 50 limit)', () => {
      const { result } = renderHook(() => useUsageGate());
      const gate = result.current.canAddCard(49);
      expect(gate.allowed).toBe(true);
      expect(gate.limit).toBe(50);
    });

    it('canAddCard(50) is NOT allowed (at 50 limit)', () => {
      const { result } = renderHook(() => useUsageGate());
      const gate = result.current.canAddCard(50);
      expect(gate.allowed).toBe(false);
      expect(gate.limit).toBe(50);
      expect(gate.message).toBeDefined();
    });

    it('canAddCard(51) is NOT allowed (over limit)', () => {
      const { result } = renderHook(() => useUsageGate());
      const gate = result.current.canAddCard(51);
      expect(gate.allowed).toBe(false);
    });

    it('tier is reported as free', () => {
      const { result } = renderHook(() => useUsageGate());
      expect(result.current.tier).toBe('free');
    });
  });

  // ── Basic tier limits ───────────────────────────────────────────────

  describe('basic tier', () => {
    beforeEach(() => setAuth('basic'));

    it('canAddCard(199) is allowed', () => {
      const { result } = renderHook(() => useUsageGate());
      expect(result.current.canAddCard(199).allowed).toBe(true);
    });

    it('canAddCard(200) is NOT allowed (at 200 limit)', () => {
      const { result } = renderHook(() => useUsageGate());
      const gate = result.current.canAddCard(200);
      expect(gate.allowed).toBe(false);
      expect(gate.limit).toBe(200);
      expect(gate.message).toContain('200');
    });
  });

  // ── Pro tier (unlimited) ────────────────────────────────────────────

  describe('pro tier', () => {
    beforeEach(() => setAuth('pro'));

    it('canAddCard with any number is allowed (unlimited)', () => {
      const { result } = renderHook(() => useUsageGate());
      expect(result.current.canAddCard(0).allowed).toBe(true);
      expect(result.current.canAddCard(999999).allowed).toBe(true);
      expect(result.current.canAddCard(999999).limit).toBe(-1);
    });

    it('canUseAiValuation is always allowed', () => {
      const { result } = renderHook(() => useUsageGate());
      expect(result.current.canUseAiValuation().allowed).toBe(true);
      expect(result.current.canUseAiValuation().limit).toBe(-1);
    });
  });

  // ── Demo mode ───────────────────────────────────────────────────────

  describe('demo mode', () => {
    beforeEach(() => setAuth('free', true));

    it('canAddCard is always allowed regardless of count', () => {
      const { result } = renderHook(() => useUsageGate());
      expect(result.current.canAddCard(0).allowed).toBe(true);
      expect(result.current.canAddCard(999).allowed).toBe(true);
      expect(result.current.canAddCard(999).limit).toBe(-1);
    });

    it('canUseAiValuation is always allowed', () => {
      const { result } = renderHook(() => useUsageGate());
      expect(result.current.canUseAiValuation().allowed).toBe(true);
      expect(result.current.canUseAiValuation().limit).toBe(-1);
    });
  });

  // ── canUseAiValuation respects localStorage profile cache ──────────

  describe('canUseAiValuation with localStorage profile cache', () => {
    beforeEach(() => setAuth('free'));

    it('allowed when usage is under limit', () => {
      lsMock.setItem(
        'msi_user_profile',
        JSON.stringify({ ai_valuations_used: 5 })
      );
      const { result } = renderHook(() => useUsageGate());
      expect(result.current.canUseAiValuation().allowed).toBe(true);
    });

    it('NOT allowed when usage is at limit (10 for free)', () => {
      lsMock.setItem(
        'msi_user_profile',
        JSON.stringify({ ai_valuations_used: 10 })
      );
      const { result } = renderHook(() => useUsageGate());
      const gate = result.current.canUseAiValuation();
      expect(gate.allowed).toBe(false);
      expect(gate.limit).toBe(10);
      expect(gate.message).toBeDefined();
    });

    it('NOT allowed when usage exceeds limit', () => {
      lsMock.setItem(
        'msi_user_profile',
        JSON.stringify({ ai_valuations_used: 15 })
      );
      const { result } = renderHook(() => useUsageGate());
      expect(result.current.canUseAiValuation().allowed).toBe(false);
    });

    it('allowed when no profile is cached (defaults to 0 used)', () => {
      // No msi_user_profile in localStorage
      const { result } = renderHook(() => useUsageGate());
      expect(result.current.canUseAiValuation().allowed).toBe(true);
    });

    it('allowed when profile has invalid JSON (defaults to 0 used)', () => {
      lsMock.setItem('msi_user_profile', '{bad json!!!');
      const { result } = renderHook(() => useUsageGate());
      expect(result.current.canUseAiValuation().allowed).toBe(true);
    });

    it('treats missing ai_valuations_used as zero when profile JSON is valid', () => {
      lsMock.setItem('msi_user_profile', JSON.stringify({ other: 1 }));
      const { result } = renderHook(() => useUsageGate());
      expect(result.current.canUseAiValuation().allowed).toBe(true);
    });

    it('basic tier: not allowed when at 100 valuations', () => {
      setAuth('basic');
      lsMock.setItem(
        'msi_user_profile',
        JSON.stringify({ ai_valuations_used: 100 })
      );
      const { result } = renderHook(() => useUsageGate());
      const gate = result.current.canUseAiValuation();
      expect(gate.allowed).toBe(false);
      expect(gate.limit).toBe(100);
    });
  });
});
