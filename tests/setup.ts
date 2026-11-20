import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';
import { store } from '../lib/dal/syncStore';
import { DEMO_SESSION_KEY } from '../lib/demoSession';

// Clear syncStore cache before each test so services using store.get/set see fresh state.
beforeEach(() => {
  store.clear();
  try {
    localStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // Some store tests remove localStorage to simulate SSR.
  }
});
