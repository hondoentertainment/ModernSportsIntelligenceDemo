/**
 * GitHub rejects issue and comment bodies longer than 65,536 characters.
 * The Code Health report crosses that once the duplicate-filename listing grows.
 * This keeps the posted body valid and retains the health score plus the largest files.
 * The workflow still uploads the full report as an artifact.
 */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export const GITHUB_ISSUE_BODY_LIMIT = 65536;

const LARGE_FILE_CAP = 20;
const DUPLICATE_GROUP_CAP = 8;
const SIGNATURE_LINE_CAP = 15;

/**
 * @param {string} report
 * @param {{ limit?: number, runUrl?: string }} [options]
 * @returns {string}
 */
export function fitIssueBody(report, options = {}) {
  if (typeof report !== 'string') {
    throw new TypeError('report must be a string');
  }
  const limit = options.limit ?? GITHUB_ISSUE_BODY_LIMIT;
  if (!Number.isInteger(limit) || limit < 1) {
    throw new TypeError('limit must be a positive integer');
  }
  if (report.length <= limit) return report;

  const runUrl = typeof options.runUrl === 'string' ? options.runUrl : '';
  const footer = buildFooter(report.length, runUrl);
  const sections = splitMarkdownSections(report);
  const condensed = sections.map((section) => condenseSection(section)).join('');
  let body = appendFooter(condensed, footer);

  if (body.length > limit) {
    const kept = sections
      .filter((section) => !isBulkSection(section))
      .map((section) => section.raw)
      .join('');
    body = appendFooter(kept, footer);
  }

  if (body.length > limit) {
    body = truncatePreservingFooter(body, footer, limit);
  }

  return body.length <= limit ? body : sliceCodeUnits(body, limit);
}

function buildFooter(fullLength, runUrl) {
  const link = runUrl
    ? ` Download the \`code-health-report\` artifact: ${runUrl}`
    : ' Download the `code-health-report` artifact from the workflow run.';
  return (
    `\n---\n` +
    `_Issue body shortened to fit GitHub's ${GITHUB_ISSUE_BODY_LIMIT.toLocaleString()}-character limit ` +
    `(full report is ${fullLength.toLocaleString()} characters).${link}_\n`
  );
}

function appendFooter(text, footer) {
  const base = text.endsWith('\n') || text.length === 0 ? text : `${text}\n`;
  return `${base}${footer}`;
}

function splitMarkdownSections(report) {
  const matches = [...report.matchAll(/^### .+$/gm)];
  if (matches.length === 0) {
    return [{ title: '', raw: report }];
  }
  const sections = [];
  const firstIndex = matches[0].index ?? 0;
  if (firstIndex > 0) {
    sections.push({ title: '', raw: report.slice(0, firstIndex) });
  }
  for (let i = 0; i < matches.length; i += 1) {
    const start = matches[i].index ?? 0;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? report.length) : report.length;
    sections.push({
      title: matches[i][0],
      raw: report.slice(start, end),
    });
  }
  return sections;
}

function isBulkSection(section) {
  return (
    section.title.startsWith('### Large Files') ||
    section.title.startsWith('### Duplicate Code Patterns')
  );
}

function condenseSection(section) {
  if (section.title.startsWith('### Large Files')) return condenseLargeFiles(section.raw);
  if (section.title.startsWith('### Duplicate Code Patterns')) return condenseDuplicates(section.raw);
  return section.raw;
}

function condenseLargeFiles(raw) {
  const heading = raw.split('\n')[0] || '### Large Files (> 500 lines) — Consider Refactoring';
  const rows = [];
  for (const line of raw.split('\n')) {
    const match = line.match(/^\| `([^`]+)` \| (\d+) \|$/);
    if (match) rows.push({ file: match[1], lines: Number(match[2]) });
  }
  if (rows.length === 0) return raw;

  const sorted = [...rows].sort((a, b) => b.lines - a.lines || a.file.localeCompare(b.file));
  const shown = sorted.slice(0, LARGE_FILE_CAP);
  const lines = [
    heading,
    '',
    `${rows.length} files exceed 500 lines. Largest ${shown.length}:`,
    '',
    '| File | Lines |',
    '|------|-------|',
    ...shown.map((row) => `| \`${row.file}\` | ${row.lines} |`),
    '',
  ];
  if (rows.length > shown.length) {
    lines.push(
      `_${rows.length - shown.length} additional files are listed in the workflow artifact._`,
      '',
    );
  }
  return `${lines.join('\n')}\n`;
}

function condenseDuplicates(raw) {
  const heading = raw.split('\n')[0] || '### Duplicate Code Patterns';
  const signatureAt = raw.indexOf('Services with similar function signatures');
  const beforeSignatures = signatureAt === -1 ? raw : raw.slice(0, signatureAt);
  const signatureBlock = signatureAt === -1 ? '' : capSignatureBlock(raw.slice(signatureAt));

  const groups = [];
  let current = null;
  for (const line of beforeSignatures.split('\n')) {
    if (line.startsWith('Duplicate filename:')) {
      if (current) groups.push(current);
      current = [line];
    } else if (current && /^\s+\S/.test(line)) {
      current.push(line);
    } else if (current && line.trim() === '') {
      groups.push(current);
      current = null;
    }
  }
  if (current) groups.push(current);

  if (groups.length === 0 && !signatureBlock) return raw;

  const shown = groups.slice(0, DUPLICATE_GROUP_CAP);
  const lines = [
    heading,
    '',
    'Files with similar names that may contain duplicate logic:',
    '',
    `${groups.length} duplicate filenames. First ${shown.length}:`,
    '',
    '```',
    ...shown.flat(),
    '```',
    '',
  ];
  if (groups.length > shown.length) {
    lines.push(
      `_${groups.length - shown.length} additional duplicate filenames are listed in the workflow artifact._`,
      '',
    );
  }
  if (signatureBlock) {
    lines.push(signatureBlock, '');
  }
  return `${lines.join('\n')}\n`;
}

function capSignatureBlock(block) {
  const lines = block.split('\n').filter((line) => line.trim() !== '```');
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();
  if (lines.length <= SIGNATURE_LINE_CAP) return lines.join('\n');
  const omitted = lines.length - SIGNATURE_LINE_CAP;
  return `${lines.slice(0, SIGNATURE_LINE_CAP).join('\n')}\n… ${omitted} more signature lines omitted.`;
}

function truncatePreservingFooter(text, footer, limit) {
  if (footer.length >= limit) return sliceCodeUnits(footer, limit);
  const withoutFooter = text.endsWith(footer) ? text.slice(0, -footer.length) : text;
  const healthAt = withoutFooter.lastIndexOf('### Health Score');
  if (healthAt !== -1) {
    const health = withoutFooter.slice(healthAt);
    const tail = appendFooter(health, footer);
    if (tail.length <= limit) {
      const budget = limit - tail.length;
      let head = sliceCodeUnits(withoutFooter.slice(0, healthAt), budget);
      const lastNl = head.lastIndexOf('\n');
      if (lastNl > Math.floor(budget * 0.5)) head = head.slice(0, lastNl + 1);
      const combined = head + tail;
      if (combined.length <= limit) return combined;
    }
  }
  const budget = limit - footer.length;
  let head = sliceCodeUnits(withoutFooter, budget);
  const lastNl = head.lastIndexOf('\n');
  if (lastNl > Math.floor(budget * 0.5)) head = head.slice(0, lastNl + 1);
  const combined = head + footer;
  return combined.length <= limit ? combined : sliceCodeUnits(combined, limit);
}

function sliceCodeUnits(text, max) {
  if (text.length <= max) return text;
  let end = max;
  const code = text.charCodeAt(end - 1);
  if (code >= 0xd800 && code <= 0xdbff) end -= 1;
  return text.slice(0, Math.max(0, end));
}

function main() {
  const [input, output, runUrl] = process.argv.slice(2);
  if (!input || !output) {
    console.error(
      'Usage: node scripts/fit-issue-body.mjs <report.md> <issue-body.md> [runUrl]',
    );
    process.exit(1);
  }
  const report = fs.readFileSync(input, 'utf8');
  const body = fitIssueBody(report, { runUrl });
  if (body.length > GITHUB_ISSUE_BODY_LIMIT) {
    console.error(`fitted issue body is ${body.length} characters (limit ${GITHUB_ISSUE_BODY_LIMIT})`);
    process.exit(1);
  }
  fs.writeFileSync(output, body);
  if (body.length === report.length) {
    console.log(`Issue body is ${body.length} characters (within GitHub's limit).`);
  } else {
    console.log(
      `Fitted issue body to ${body.length} characters (report was ${report.length}).`,
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
