import { describe, it, expect } from 'vitest';
import { getDemoFlows } from '../../lib/utils/demoFlowService';

/** Routes that still mount. Labs entries here are the five flag-gated keeps. */
const LIVE_ROUTES = new Set([
  '/',
  '/collection',
  '/deep-search',
  '/audit',
  '/mlb-stats',
  '/prospects',
  '/favorites',
  '/settings',
  '/players',
  '/teams',
  '/games',
  '/trends',
  '/builder',
  '/billing',
  '/compare',
  '/alerts',
  '/war-room',
  '/guilds',
  '/leaderboard',
  '/features',
  '/liquidity-twin',
  '/counterparty-trust-graph',
  '/portfolio-scenario-theater',
  '/private-deal-room-agent',
  '/catalyst-market',
  '/collection-narrative',
  '/frontier-lab',
  '/audit-dossier',
  '/audit-trail',
  '/provenance',
  '/grading-vision-engine',
  '/api-licensing',
  '/card-show-mode',
  '/local-card-shows',
  '/demo-flow',
  '/set-completion',
  '/slab-verification',
  '/fractional-vault',
  '/copy-trading',
  '/live-breaks',
]);

describe('demoFlowService routes', () => {
  it('only launches routes that still exist', () => {
    const flows = getDemoFlows();
    expect(flows.length).toBeGreaterThan(0);
    for (const flow of flows) {
      expect(flow.steps.length).toBeGreaterThan(0);
      for (const step of flow.steps) {
        expect(LIVE_ROUTES.has(step.route), `${flow.id} ${step.id} -> ${step.route}`).toBe(true);
      }
    }
  });
});
