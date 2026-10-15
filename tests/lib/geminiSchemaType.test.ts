import { Type as SdkType } from '@google/genai';
import { describe, expect, it } from 'vitest';
import { Type } from '../../lib/geminiSchemaType';

describe('geminiSchemaType', () => {
  it('matches @google/genai Type string values', () => {
    const sdkKeys = Object.keys(SdkType).sort();
    const localKeys = Object.keys(Type).sort();
    expect(localKeys).toEqual(sdkKeys);
    for (const key of localKeys) {
      expect(Type[key as keyof typeof Type]).toBe(SdkType[key as keyof typeof SdkType]);
    }
  });
});
