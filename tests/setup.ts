import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';
import { store } from '../lib/dal/syncStore';

// Clear syncStore cache before each test so services using store.get/set see fresh state.
beforeEach(() => {
  store.clear();
});
