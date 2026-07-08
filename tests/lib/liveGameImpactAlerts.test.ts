import { describe, it, expect } from 'vitest';
import { getLiveImpactAlerts } from '../../lib/analytics/liveGameImpactService';

/**
 * `live-impact` is intentionally demo-only pending a real sports-feed
 * adapter (see NEXT_STEPS.md Priority 1). The seeded alerts are fixed and
 * meaningful — they demonstrate the surge / crash / milestone pattern and
 * the actionable-suggestion shape the UI relies on. Snapshot the *shape*
 * (timestamps excluded — they're stamped at module-import time) so a code
 * change that silently mangles the demo alerts fails loudly.
 */

function stripTimestamps(alerts: ReturnType<typeof getLiveImpactAlerts>) {
  return alerts.map(({ timestamp: _timestamp, ...rest }) => rest);
}

describe('getLiveImpactAlerts (demo-only until a real sports feed lands)', () => {
  const alerts = getLiveImpactAlerts();

  it('returns a non-empty set of demo alerts', () => {
    expect(alerts.length).toBeGreaterThan(0);
  });

  it('classifies every alert as surge, crash, or milestone with a valid severity', () => {
    for (const a of alerts) {
      expect(['surge', 'crash', 'milestone']).toContain(a.type);
      expect(['medium', 'high', 'critical']).toContain(a.severity);
      expect(a.playerName.length).toBeGreaterThan(0);
      expect(a.message).toContain(a.playerName);
      expect(typeof a.actionable).toBe('boolean');
    }
  });

  it('matches the frozen alert shape (timestamps excluded)', () => {
    expect(stripTimestamps(alerts)).toMatchInlineSnapshot(`
      [
        {
          "actionable": true,
          "cardValueChange": 2.8,
          "id": "alert-evt-4",
          "message": "Patrick Mahomes: 45-yard TD pass to Kelce. 3rd TD of the game.",
          "playerName": "Patrick Mahomes",
          "severity": "medium",
          "suggestedAction": "Monitor closely",
          "type": "surge",
        },
        {
          "actionable": true,
          "cardValueChange": 3.1,
          "id": "alert-evt-3",
          "message": "Jayson Tatum: Triple-double watch: 28pts/10reb/9ast with 16 min remaining.",
          "playerName": "Jayson Tatum",
          "severity": "medium",
          "suggestedAction": "Monitor closely",
          "type": "surge",
        },
        {
          "actionable": true,
          "cardValueChange": -0.3,
          "id": "alert-evt-2",
          "message": "Shohei Ohtani: K looking on 97mph fastball. 3rd K of the game.",
          "playerName": "Shohei Ohtani",
          "severity": "medium",
          "suggestedAction": "Monitor closely",
          "type": "crash",
        },
        {
          "actionable": true,
          "cardValueChange": 4.2,
          "id": "alert-evt-1",
          "message": "Aaron Judge: 3-run HR to right field, 462 ft. Season HR #32.",
          "playerName": "Aaron Judge",
          "severity": "medium",
          "suggestedAction": "Monitor closely",
          "type": "surge",
        },
      ]
    `);
  });
});
