import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import AlertDeliverySettings from '../../components/AlertDeliverySettings';
import {
  ALERT_PREFERENCES_DISCLOSURE,
  getAlertPreferences,
} from '../../lib/utils/alertPreferences';
import { store } from '../../lib/dal/syncStore';

describe('AlertDeliverySettings', () => {
  beforeEach(() => {
    localStorage.clear();
    store.clear();
  });

  it('renders disclosure and persists quiet hours plus channel toggles', async () => {
    const user = userEvent.setup();
    render(<AlertDeliverySettings />);

    expect(screen.getByRole('region', { name: /alert delivery preferences/i })).toBeInTheDocument();
    expect(screen.getByText(ALERT_PREFERENCES_DISCLOSURE)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/enable quiet hours/i));
    await user.click(screen.getByLabelText(/enable price-alert haptics/i));
    await user.click(screen.getByLabelText(/enable browser notifications/i));

    const prefs = getAlertPreferences();
    expect(prefs.quietHoursEnabled).toBe(true);
    expect(prefs.hapticsEnabled).toBe(false);
    expect(prefs.browserNotificationsEnabled).toBe(false);
  });
});
