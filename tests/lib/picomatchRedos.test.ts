import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const picomatch = require('picomatch') as (glob: string) => (input: string) => boolean;
const { removeBackslashes } = require('../../vendor/picomatch/lib/utils') as {
  removeBackslashes: (input: string) => string;
};
const picomatchDir = resolve(process.cwd(), 'vendor/picomatch');

function matchWithDeadline(pattern: string, input: string, timeoutMs = 1500) {
  return spawnSync(
    process.execPath,
    [
      '-e',
      'const pm = require(process.argv[1]); process.stdout.write(pm(process.argv[2])(process.argv[3]) ? "1" : "0");',
      picomatchDir,
      pattern,
      input,
    ],
    { encoding: 'utf8', timeout: timeoutMs }
  );
}

describe('picomatch GHSA-fc5q-39xc-vjpf pin', () => {
  it('keeps ordinary globs and safe extglobs', () => {
    expect(picomatch('**/*.ts')('src/a.ts')).toBe(true);
    expect(picomatch('*.js')('a.ts')).toBe(false);
    expect(picomatch('+(src|lib)')('srcsrc')).toBe(true);
    expect(picomatch('+(*(a)|*(b))')('ab')).toBe(true);
    expect(picomatch('+(*(a)|*(b))')('c')).toBe(false);
    expect(picomatch('src/\\[id\\]/*.js')('src/[id]/a.js')).toBe(true);
  });

  it('removes escapes in linear time and keeps bracket groups', () => {
    expect(removeBackslashes('foo\\bar')).toBe('foobar');
    expect(removeBackslashes('foo\\\\bar')).toBe('foobar');
    expect(removeBackslashes('foo\\')).toBe('foo\\');
    expect(removeBackslashes('[a\\b]')).toBe('[a\\b]');
    expect(removeBackslashes('\\[abc]')).toBe('[abc]');
    expect(removeBackslashes('[abc\\]def]')).toBe('[abc\\]def]');
    expect(removeBackslashes('[\\]')).toBe('[]');
    expect(removeBackslashes('[[[\\\\a')).toBe('[[[a');
    expect(removeBackslashes('pre\\[a]\\mid\\x[y\\z]tail\\')).toBe('pre[a]midx[y\\z]tail\\');
    expect(removeBackslashes('line1\\a\nline2\\b')).toBe('line1a\nline2b');
    expect(removeBackslashes('foo\\\rbar')).toBe('foo\\\rbar');
    expect(removeBackslashes('foo\\\u2028bar')).toBe('foo\\\u2028bar');
    expect(removeBackslashes('[\n]')).toBe('[\n]');

    const attack = '['.repeat(100_000);
    const result = spawnSync(
      process.execPath,
      [
        '-e',
        'const { removeBackslashes } = require(process.argv[1]); const input = "[".repeat(100000); const out = removeBackslashes(input); if (out !== input) process.exit(2);',
        resolve(picomatchDir, 'lib/utils.js'),
      ],
      { encoding: 'utf8', timeout: 500 }
    );
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
    expect(result.error, output).toBeUndefined();
    expect(result.status, output).toBe(0);
    expect(removeBackslashes(attack)).toBe(attack);
  });

  it('returns immediately for single-branch and multi-branch wildcard extglobs', () => {
    const cases: Array<[string, string]> = [
      ['+(*a)', `${'a'.repeat(32)}!`],
      ['+(*)', `${'a'.repeat(32)}!`],
      ['*(*a)', `${'a'.repeat(32)}!`],
      ['+(*a|b)', `${'a'.repeat(32)}!`],
      ['+(*.js|*.ts)', `${'a'.repeat(32)}!`],
      ['+(**/a)b', `${'a/'.repeat(40)}a`],
    ];

    for (const [pattern, input] of cases) {
      const result = matchWithDeadline(pattern, input);
      const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
      expect(result.error, output).toBeUndefined();
      expect(result.status, output).toBe(0);
      expect(result.stdout, output).toBe('0');
    }
  });
});
