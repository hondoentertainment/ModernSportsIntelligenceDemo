/*global navigator*/
'use strict';

const {
  REGEX_BACKSLASH,
  REGEX_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_GLOBAL
} = require('./constants');

// Keep a bracket group through its first non-escaped "]", and otherwise drop
// a backslash that escapes the next character. A backslash before a line
// terminator stays. One forward scan, so a long run of "[" cannot backtrack.
const isLineTerminator = ch => ch === '\n' || ch === '\r' || ch === '\u2028' || ch === '\u2029';

const scanBracketGroup = (str, open) => {
  let j = open + 1;
  const end = str.length;

  while (j < end - 1) {
    const ch = str[j];
    if (ch !== '\\' && str[j + 1] === ']') {
      return { end: j + 2 };
    }
    if (isLineTerminator(ch)) {
      return { blindUntil: j };
    }
    j++;
  }

  return { blindUntil: end };
};

exports.isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
exports.hasRegexChars = str => REGEX_SPECIAL_CHARS.test(str);
exports.isRegexChar = str => str.length === 1 && exports.hasRegexChars(str);
exports.escapeRegex = str => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1');
exports.toPosixSlashes = str => str.replace(REGEX_BACKSLASH, '/');

exports.isWindows = () => {
  if (typeof navigator !== 'undefined' && navigator.platform) {
    const platform = navigator.platform.toLowerCase();
    return platform === 'win32' || platform === 'windows';
  }

  if (typeof process !== 'undefined' && process.platform) {
    return process.platform === 'win32';
  }

  return false;
};

exports.removeBackslashes = str => {
  const parts = [];
  let i = 0;
  let blindUntil = -1;
  const end = str.length;

  while (i < end) {
    if (i >= blindUntil && str[i] === '[') {
      const scan = scanBracketGroup(str, i);
      if (scan.end !== undefined) {
        parts.push(str.slice(i, scan.end));
        i = scan.end;
        continue;
      }
      blindUntil = scan.blindUntil;
    }

    if (str[i] === '\\' && i + 1 < end && !isLineTerminator(str[i + 1])) {
      i++;
      continue;
    }

    parts.push(str[i]);
    i++;
  }

  return parts.join('');
};

exports.escapeLast = (input, char, lastIdx) => {
  const idx = input.lastIndexOf(char, lastIdx);
  if (idx === -1) return input;
  if (input[idx - 1] === '\\') return exports.escapeLast(input, char, idx - 1);
  return `${input.slice(0, idx)}\\${input.slice(idx)}`;
};

exports.removePrefix = (input, state = {}) => {
  let output = input;
  if (output.startsWith('./')) {
    output = output.slice(2);
    state.prefix = './';
  }
  return output;
};

exports.wrapOutput = (input, state = {}, options = {}) => {
  const prepend = options.contains ? '' : '^';
  const append = options.contains ? '' : '$';

  let output = `${prepend}(?:${input})${append}`;
  if (state.negated === true) {
    output = `(?:^(?!${output}).*$)`;
  }
  return output;
};

exports.basename = (path, { windows } = {}) => {
  const segs = path.split(windows ? /[\\/]/ : '/');
  const last = segs[segs.length - 1];

  if (last === '') {
    return segs[segs.length - 2];
  }

  return last;
};
