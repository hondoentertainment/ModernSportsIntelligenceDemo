import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_AGENT_PREFERENCES,
  formatAgentPreferencesForPrompt,
  formatAgentPreferencesSummary,
  getAgentPreferences,
  leagueMatchesPreference,
  normalizeAgentPreferences,
  riskToleranceLabel,
  setAgentPreferences,
  timeHorizonSellMultiplier,
} from '../../lib/utils/agentPreferences';

describe('agentPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when nothing is stored', () => {
    expect(getAgentPreferences()).toEqual(DEFAULT_AGENT_PREFERENCES);
  });

  it('persists via syncStore and clamps sliders', () => {
    const saved = setAgentPreferences({
      riskTolerance: 140,
      timeHorizon: 'long',
      leagueStyle: 'mlb-first',
      maxPositionPct: 2,
    });
    expect(saved.riskTolerance).toBe(100);
    expect(saved.maxPositionPct).toBe(5);
    expect(getAgentPreferences().timeHorizon).toBe('long');
  });

  it('normalizes garbage payloads', () => {
    const n = normalizeAgentPreferences({ riskTolerance: 'nope', leagueStyle: 'nhl-first' });
    expect(n.riskTolerance).toBe(0);
    expect(n.leagueStyle).toBe('balanced');
  });

  it('labels risk bands and formats prompt copy', () => {
    expect(riskToleranceLabel(10)).toBe('conservative');
    expect(riskToleranceLabel(50)).toBe('moderate');
    expect(riskToleranceLabel(80)).toBe('aggressive');
    const prompt = formatAgentPreferencesForPrompt(DEFAULT_AGENT_PREFERENCES);
    expect(prompt).toMatch(/USER AGENT PRIORITIES/);
    expect(prompt).toMatch(/human still approves/i);
    expect(formatAgentPreferencesSummary(DEFAULT_AGENT_PREFERENCES)).toMatch(/moderate risk/);
  });

  it('matches league tilt and scales sell threshold by horizon', () => {
    expect(leagueMatchesPreference('MLB', 'mlb-first')).toBe(true);
    expect(leagueMatchesPreference('NBA', 'mlb-first')).toBe(false);
    expect(leagueMatchesPreference('NBA', 'balanced')).toBe(true);
    expect(timeHorizonSellMultiplier('short')).toBeLessThan(1);
    expect(timeHorizonSellMultiplier('long')).toBeGreaterThan(1);
  });
});
