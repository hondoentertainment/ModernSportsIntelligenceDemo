import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import AgentPrioritiesPanel from '../../components/AgentPrioritiesPanel';
import { getAgentPreferences } from '../../lib/utils/agentPreferences';

describe('AgentPrioritiesPanel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists slider and league changes through the MSI store', async () => {
    const user = userEvent.setup();
    render(<AgentPrioritiesPanel />);

    await user.click(screen.getByRole('button', { name: 'Long' }));
    await user.click(screen.getByRole('button', { name: 'MLB tilt' }));

    const prefs = getAgentPreferences();
    expect(prefs.timeHorizon).toBe('long');
    expect(prefs.leagueStyle).toBe('mlb-first');
  });
});
