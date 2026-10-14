/**
 * Gemini responseSchema type tags.
 *
 * These strings match `@google/genai`'s `Type` enum. Client code only needs
 * the tags — importing `Type` from the SDK pulls the web bundle into the
 * trading chunk. The server generate route still imports `GoogleGenAI` from
 * `@google/genai` directly.
 */
export const Type = {
  TYPE_UNSPECIFIED: 'TYPE_UNSPECIFIED',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  INTEGER: 'INTEGER',
  BOOLEAN: 'BOOLEAN',
  ARRAY: 'ARRAY',
  OBJECT: 'OBJECT',
  NULL: 'NULL',
} as const;
