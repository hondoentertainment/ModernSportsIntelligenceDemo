import { describe, expect, it } from 'vitest';
import {
  ADJACENT_HOBBY_ASSET_IDS,
  CROSS_ASSET_DATA_SOURCE,
  DEFAULT_ASSET_IDS,
  getAdjacentHobbyAssets,
  getAssetById,
  getCorrelationMatrix,
} from '../../lib/utils/crossAssetService';

describe('crossAssetService adjacent hobby markets', () => {
  it('exposes disclosed seeded Pokémon, MTG, and memorabilia assets', () => {
    expect([...ADJACENT_HOBBY_ASSET_IDS]).toEqual(['pokemon', 'mtg', 'memorabilia']);
    for (const id of ADJACENT_HOBBY_ASSET_IDS) {
      const asset = getAssetById(id);
      expect(asset?.category).toBe('collectible');
      expect(asset?.name).toMatch(/seeded/i);
    }
    expect(getAdjacentHobbyAssets()).toHaveLength(3);
    expect(DEFAULT_ASSET_IDS).toEqual(expect.arrayContaining(['pokemon', 'memorabilia']));
  });

  it('seeds non-zero hobby correlations and discloses they are not live feeds', () => {
    expect(CROSS_ASSET_DATA_SOURCE).toMatch(/not live/i);
    expect(CROSS_ASSET_DATA_SOURCE).toMatch(/Pokémon|Pokemon|memorabilia/i);
    const matrix = getCorrelationMatrix(['cards_all', 'sp500', 'pokemon', 'mtg', 'memorabilia'], 12);
    const pokemonIdx = matrix.assets.indexOf('pokemon');
    const cardsIdx = matrix.assets.indexOf('cards_all');
    expect(pokemonIdx).toBeGreaterThan(-1);
    expect(matrix.matrix[pokemonIdx][cardsIdx]).not.toBe(0);
  });
});
