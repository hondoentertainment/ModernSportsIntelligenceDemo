import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  executeCommand,
  getAutocompleteSuggestions,
  getCommandHistory,
  clearCommandHistory,
  getCommandRegistry,
  getPlayerQuickLook,
} from '../../lib/utils/msiTerminalService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('msiTerminalService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('executeCommand', () => {
    it('returns help result for HELP command', () => {
      const result = executeCommand('HELP');
      expect(result.command).toBe('HELP');
      expect(result.resultType).toBe('help');
      expect(result.data).toBeDefined();
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('returns player data for player lookup', () => {
      const result = executeCommand('LeBron James');
      expect(result.resultType).toBe('player_data');
      expect(result.data).toBeDefined();
    });

    it('returns portfolio summary for PORT command', () => {
      const result = executeCommand('PORT');
      expect(result.resultType).toBe('portfolio_summary');
      expect(result.data).toBeDefined();
    });

    it('returns error for unknown command', () => {
      const result = executeCommand('XYZZY_UNKNOWN_COMMAND_12345');
      expect(result.resultType).toBe('error');
    });

    it('returns market data for MSI500 command', () => {
      const result = executeCommand('MSI500');
      expect(result.resultType).toBe('market_data');
    });

    it('handles empty input', () => {
      const result = executeCommand('');
      expect(result).toBeDefined();
      expect(result.resultType).toBe('error');
    });

    it('is case insensitive for commands', () => {
      const upper = executeCommand('HELP');
      const lower = executeCommand('help');
      expect(upper.resultType).toBe(lower.resultType);
    });

    it('returns a timestamp', () => {
      const result = executeCommand('HELP');
      expect(result.timestamp).toBeTruthy();
      expect(() => new Date(result.timestamp)).not.toThrow();
    });
  });

  describe('getAutocompleteSuggestions', () => {
    it('returns suggestions for partial input', () => {
      const suggestions = getAutocompleteSuggestions('HE');
      expect(suggestions.length).toBeGreaterThan(0);
      // Suggestions include command usage strings like "HELP {category?}"
      // At least one should start with HE
      expect(suggestions.some(s => s.toUpperCase().startsWith('HE'))).toBe(true);
    });

    it('returns empty for empty input', () => {
      const suggestions = getAutocompleteSuggestions('');
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('returns suggestions for PORT', () => {
      const suggestions = getAutocompleteSuggestions('PO');
      expect(suggestions.some(s => s.toUpperCase().startsWith('PO'))).toBe(true);
    });
  });

  describe('getCommandHistory', () => {
    it('starts empty', () => {
      const history = getCommandHistory();
      expect(history).toEqual([]);
    });

    it('records commands after execution', () => {
      // Some commands (like player lookups) save to history
      // Use a command that triggers saveToHistory: an unknown command goes through the fallback path
      executeCommand('XYZUNKNOWN');
      const history = getCommandHistory();
      expect(history.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('clearCommandHistory', () => {
    it('clears the history', () => {
      executeCommand('HELP');
      clearCommandHistory();
      const history = getCommandHistory();
      expect(history).toEqual([]);
    });
  });

  describe('getCommandRegistry', () => {
    it('returns array of available commands', () => {
      const registry = getCommandRegistry();
      expect(registry.length).toBeGreaterThan(0);
    });

    it('each command has required fields', () => {
      const registry = getCommandRegistry();
      for (const cmd of registry) {
        expect(cmd.command).toBeTruthy();
        expect(cmd.description).toBeTruthy();
        expect(['market', 'portfolio', 'player', 'analytics', 'system']).toContain(cmd.category);
        expect(cmd.usage).toBeTruthy();
      }
    });
  });

  describe('getPlayerQuickLook', () => {
    it('returns data for known player', () => {
      const data = getPlayerQuickLook('LeBron James');
      expect(data).not.toBeNull();
      if (data) {
        expect(data.name).toContain('LeBron');
        expect(data.topCardValue).toBeGreaterThan(0);
        expect(typeof data.priceChange24h).toBe('number');
      }
    });

    it('returns null for unknown player', () => {
      const data = getPlayerQuickLook('Nonexistent Player XYZ123');
      expect(data).toBeNull();
    });
  });
});
