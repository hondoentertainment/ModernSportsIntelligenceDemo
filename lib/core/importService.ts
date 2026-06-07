import { CardInventory, Sport, League } from '../../types';
import { store } from '../dal/syncStore';

// ---- Types ----

export type ImportSource = 'csv' | 'ebay_history' | 'psa_cert' | 'cardladder' | 'collx' | 'manual_json';

export interface ColumnMapping {
  sourceColumn: string;
  targetField: keyof CardInventory | '';
  confidence: number;
}

export interface ImportPreview {
  headers: string[];
  rows: string[][];
  mappings: ColumnMapping[];
  totalRows: number;
}

export interface ImportRecord {
  id: string;
  source: ImportSource;
  timestamp: string;
  count: number;
  cardIds: string[];
  fileName?: string;
}

export interface ImportHistory {
  records: ImportRecord[];
}

export interface DuplicateMatch {
  newCard: Partial<CardInventory>;
  existingCard: CardInventory;
  matchScore: number;
  action: 'skip' | 'merge' | 'replace';
}

export interface ExportConfig {
  columns?: (keyof CardInventory)[];
  dateFrom?: string;
  dateTo?: string;
  format: 'csv' | 'json' | 'html';
}

// ---- Constants ----

const IMPORT_HISTORY_KEY = 'msi_import_history';

const ALL_CARD_FIELDS: (keyof CardInventory)[] = [
  'player', 'year', 'manufacturer', 'cardNumber', 'set', 'sport', 'league',
  'isAutographed', 'condition', 'isGraded', 'gradingCompany', 'grade',
  'purchasePrice', 'purchaseDate', 'currentValue', 'notes',
];

const HEADER_FIELD_MAP: Record<string, keyof CardInventory> = {
  'player': 'player',
  'player name': 'player',
  'name': 'player',
  'athlete': 'player',
  'year': 'year',
  'card year': 'year',
  'season': 'year',
  'manufacturer': 'manufacturer',
  'brand': 'manufacturer',
  'maker': 'manufacturer',
  'card number': 'cardNumber',
  'card #': 'cardNumber',
  'number': 'cardNumber',
  '#': 'cardNumber',
  'set': 'set',
  'set name': 'set',
  'card set': 'set',
  'series': 'set',
  'sport': 'sport',
  'league': 'league',
  'autographed': 'isAutographed',
  'auto': 'isAutographed',
  'autograph': 'isAutographed',
  'is autographed': 'isAutographed',
  'condition': 'condition',
  'graded': 'isGraded',
  'is graded': 'isGraded',
  'grading company': 'gradingCompany',
  'grader': 'gradingCompany',
  'grade': 'grade',
  'score': 'grade',
  'purchase price': 'purchasePrice',
  'price': 'purchasePrice',
  'cost': 'purchasePrice',
  'paid': 'purchasePrice',
  'buy price': 'purchasePrice',
  'purchase date': 'purchaseDate',
  'date': 'purchaseDate',
  'date purchased': 'purchaseDate',
  'bought': 'purchaseDate',
  'current value': 'currentValue',
  'value': 'currentValue',
  'market value': 'currentValue',
  'estimated value': 'currentValue',
  'notes': 'notes',
  'description': 'notes',
  'comments': 'notes',
};

// ---- Helpers ----

function generateId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateImportId(): string {
  return `imp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash; // Convert to 32-bit
  }
  return Math.abs(hash);
}

function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function levenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= an; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bn; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[an][bn];
}

function stringSimilarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.length === 0 || nb.length === 0) return 0;
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return Math.max(0, 1 - dist / maxLen);
}

// ---- CSV Parsing ----

export function parseCSV(text: string, delimiter: string = ','): ImportPreview {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    return { headers: [], rows: [], mappings: [], totalRows: 0 };
  }

  function parseLine(line: string, delim: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === delim) {
          fields.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
    }
    fields.push(current.trim());
    return fields;
  }

  // Auto-detect delimiter if comma yields only 1 column
  const testParse = parseLine(lines[0], delimiter);
  if (testParse.length <= 1 && delimiter === ',') {
    // Try tab
    const tabParse = parseLine(lines[0], '\t');
    if (tabParse.length > 1) {
      delimiter = '\t';
    } else {
      // Try semicolon
      const semiParse = parseLine(lines[0], ';');
      if (semiParse.length > 1) {
        delimiter = ';';
      }
    }
  }

  const headers = parseLine(lines[0], delimiter);
  const rows: string[][] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseLine(lines[i], delimiter);
    if (row.length > 0 && row.some(cell => cell.length > 0)) {
      rows.push(row);
    }
  }

  const mappings = autoDetectColumns(headers);

  return {
    headers,
    rows,
    mappings,
    totalRows: rows.length,
  };
}

// ---- Column Auto-Detection ----

export function autoDetectColumns(headers: string[]): ColumnMapping[] {
  return headers.map(header => {
    const normalizedHeader = header.toLowerCase().trim();

    // Exact match first
    if (HEADER_FIELD_MAP[normalizedHeader]) {
      return {
        sourceColumn: header,
        targetField: HEADER_FIELD_MAP[normalizedHeader],
        confidence: 1.0,
      };
    }

    // Fuzzy match
    let bestMatch: keyof CardInventory | '' = '';
    let bestScore = 0;
    for (const [pattern, field] of Object.entries(HEADER_FIELD_MAP)) {
      const sim = stringSimilarity(normalizedHeader, pattern);
      if (sim > bestScore && sim > 0.6) {
        bestScore = sim;
        bestMatch = field;
      }
    }

    // Also check if the header contains the field name
    if (!bestMatch) {
      for (const field of ALL_CARD_FIELDS) {
        const fieldLower = field.toLowerCase();
        if (normalizedHeader.includes(fieldLower) || fieldLower.includes(normalizedHeader)) {
          bestMatch = field;
          bestScore = 0.7;
          break;
        }
      }
    }

    return {
      sourceColumn: header,
      targetField: bestMatch,
      confidence: bestScore,
    };
  });
}

// ---- Apply Column Mapping ----

export function applyColumnMapping(
  rows: string[][],
  mapping: ColumnMapping[]
): Partial<CardInventory>[] {
  return rows.map(row => {
    const card: Partial<CardInventory> = {};

    mapping.forEach((col, idx) => {
      if (!col.targetField || idx >= row.length) return;
      const val = row[idx];
      if (!val || val.trim() === '') return;

      switch (col.targetField) {
        case 'player':
          card.player = val.trim();
          break;
        case 'year': {
          const y = parseInt(val, 10);
          if (!isNaN(y) && y >= 1900 && y <= 2100) card.year = y;
          break;
        }
        case 'manufacturer':
          card.manufacturer = val.trim();
          break;
        case 'cardNumber':
          card.cardNumber = val.trim();
          break;
        case 'set':
          card.set = val.trim();
          break;
        case 'sport': {
          const sportMap: Record<string, Sport> = {
            baseball: 'Baseball', basketball: 'Basketball',
            football: 'Football', hockey: 'Hockey', soccer: 'Soccer',
          };
          card.sport = sportMap[val.toLowerCase().trim()] || 'Baseball';
          break;
        }
        case 'league': {
          const leagueMap: Record<string, League> = {
            mlb: 'MLB', milb: 'MiLB', nba: 'NBA', nfl: 'NFL', other: 'Other',
          };
          card.league = leagueMap[val.toLowerCase().trim()] || 'Other';
          break;
        }
        case 'isAutographed':
          card.isAutographed = ['yes', 'true', '1', 'y'].includes(val.toLowerCase().trim());
          break;
        case 'condition':
          card.condition = val.trim();
          break;
        case 'isGraded':
          card.isGraded = ['yes', 'true', '1', 'y'].includes(val.toLowerCase().trim());
          break;
        case 'gradingCompany': {
          const comp = val.trim().toUpperCase();
          if (['PSA', 'BGS', 'SGC', 'CSG', 'HGA'].includes(comp)) {
            card.gradingCompany = comp as CardInventory['gradingCompany'];
          } else {
            card.gradingCompany = 'Other';
          }
          break;
        }
        case 'grade':
          card.grade = val.trim();
          if (card.grade) card.isGraded = true;
          break;
        case 'purchasePrice': {
          const price = parseFloat(val.replace(/[$,]/g, ''));
          if (!isNaN(price)) card.purchasePrice = price;
          break;
        }
        case 'purchaseDate':
          card.purchaseDate = val.trim();
          break;
        case 'currentValue': {
          const cv = parseFloat(val.replace(/[$,]/g, ''));
          if (!isNaN(cv)) card.currentValue = cv;
          break;
        }
        case 'notes':
          card.notes = val.trim();
          break;
        default:
          break;
      }
    });

    return card;
  });
}

// ---- eBay History Parser ----

export function parseEbayHistory(text: string): Partial<CardInventory>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const cards: Partial<CardInventory>[] = [];

  // Known player names for title extraction (simulated)
  const knownPlayers = [
    'Mike Trout', 'Shohei Ohtani', 'Aaron Judge', 'Bryce Harper',
    'Ronald Acuna Jr', 'Mookie Betts', 'Juan Soto', 'Fernando Tatis Jr',
    'LeBron James', 'Luka Doncic', 'Stephen Curry', 'Giannis Antetokounmpo',
    'Patrick Mahomes', 'Josh Allen', 'Justin Herbert', 'Lamar Jackson',
    'Connor McDavid', 'Auston Matthews', 'Sidney Crosby', 'Leon Draisaitl',
    'Lionel Messi', 'Kylian Mbappe', 'Erling Haaland', 'Jude Bellingham',
  ];

  const knownSets = [
    'Topps Chrome', 'Bowman Chrome', 'Prizm', 'Select', 'Mosaic',
    'Donruss Optic', 'Topps Heritage', 'Panini Flawless', 'National Treasures',
    'Topps Update', 'Bowman 1st', 'Upper Deck',
  ];

  for (const line of lines) {
    // Try to parse eBay purchase format: "Item Title | $Price | Date"
    // Also handle tab-separated
    const parts = line.includes('|') ? line.split('|') : line.split('\t');
    if (parts.length < 2) continue;

    const title = parts[0].trim();
    const priceStr = parts.length >= 2 ? parts[1].trim() : '';
    const dateStr = parts.length >= 3 ? parts[2].trim() : new Date().toISOString().slice(0, 10);

    // Extract price
    const priceMatch = priceStr.match(/\$?([\d,]+\.?\d*)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;

    // Extract year from title
    const yearMatch = title.match(/\b(19[5-9]\d|20[0-2]\d)\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

    // Extract player from title
    let player = 'Unknown Player';
    for (const p of knownPlayers) {
      if (title.toLowerCase().includes(p.toLowerCase())) {
        player = p;
        break;
      }
    }
    // If not found in known list, try extracting capitalized name pattern
    if (player === 'Unknown Player') {
      const nameMatch = title.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
      if (nameMatch) {
        player = nameMatch[1];
      }
    }

    // Extract set
    let cardSet = 'Unknown Set';
    for (const s of knownSets) {
      if (title.toLowerCase().includes(s.toLowerCase())) {
        cardSet = s;
        break;
      }
    }

    // Detect sport from keywords
    let sport: Sport = 'Baseball';
    if (/basketball|nba|hoops/i.test(title)) sport = 'Basketball';
    else if (/football|nfl|gridiron/i.test(title)) sport = 'Football';
    else if (/hockey|nhl|ice/i.test(title)) sport = 'Hockey';
    else if (/soccer|football|premier|fifa|mls/i.test(title)) sport = 'Soccer';

    // Detect grading
    const gradeMatch = title.match(/\b(PSA|BGS|SGC|CSG|HGA)\s*(\d+\.?\d*)\b/i);
    const isGraded = !!gradeMatch;
    const gradingCompany = gradeMatch
      ? (gradeMatch[1].toUpperCase() as CardInventory['gradingCompany'])
      : undefined;
    const grade = gradeMatch ? gradeMatch[2] : undefined;

    // Extract card number
    const cardNumMatch = title.match(/#(\w+)/);
    const cardNumber = cardNumMatch ? cardNumMatch[1] : '';

    const leagueMap: Record<Sport, League> = {
      Baseball: 'MLB', Basketball: 'NBA', Football: 'NFL', Hockey: 'Other', Soccer: 'Other',
    };

    cards.push({
      player,
      year,
      manufacturer: cardSet.split(' ')[0] || 'Unknown',
      cardNumber,
      set: cardSet,
      sport,
      league: leagueMap[sport],
      isAutographed: /auto|autograph|signed/i.test(title),
      condition: isGraded ? 'Graded' : 'Near Mint',
      isGraded,
      gradingCompany,
      grade,
      purchasePrice: price,
      purchaseDate: dateStr,
      notes: `Imported from eBay: ${title.slice(0, 100)}`,
    });
  }

  return cards;
}

// ---- PSA Cert Lookup (simulated) ----

export function parsePSACert(certNumber: string): Partial<CardInventory> {
  const hash = simpleHash(certNumber);

  const players = [
    'Mike Trout', 'Shohei Ohtani', 'Aaron Judge', 'Bryce Harper',
    'LeBron James', 'Luka Doncic', 'Stephen Curry', 'Patrick Mahomes',
    'Josh Allen', 'Connor McDavid', 'Ronald Acuna Jr', 'Juan Soto',
  ];

  const sets = [
    'Topps Chrome', 'Bowman Chrome', 'Prizm', 'Select',
    'Mosaic', 'Donruss Optic', 'National Treasures', 'Topps Heritage',
  ];

  const sports: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey'];
  const grades = ['10', '9.5', '9', '8.5', '8', '7.5', '7'];

  const playerIdx = hash % players.length;
  const setIdx = (hash >> 4) % sets.length;
  const sportIdx = (hash >> 8) % sports.length;
  const gradeIdx = (hash >> 12) % grades.length;
  const year = 2015 + (hash % 10);
  const cardNum = ((hash >> 3) % 300) + 1;

  const sport = sports[sportIdx];
  const leagueMap: Record<Sport, League> = {
    Baseball: 'MLB', Basketball: 'NBA', Football: 'NFL', Hockey: 'Other', Soccer: 'Other',
  };

  // Simulate a value based on grade + player
  const gradeVal = parseFloat(grades[gradeIdx]);
  const baseValue = 50 + (hash % 500);
  const gradeMultiplier = gradeVal >= 10 ? 5 : gradeVal >= 9 ? 2.5 : gradeVal >= 8 ? 1.5 : 1;
  const estimatedValue = Math.round(baseValue * gradeMultiplier * 100) / 100;

  return {
    player: players[playerIdx],
    year,
    manufacturer: sets[setIdx].split(' ')[0],
    cardNumber: String(cardNum),
    set: sets[setIdx],
    sport,
    league: leagueMap[sport],
    isAutographed: (hash % 5) === 0,
    condition: 'Graded',
    isGraded: true,
    gradingCompany: 'PSA',
    grade: grades[gradeIdx],
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().slice(0, 10),
    currentValue: estimatedValue,
    notes: `PSA Cert #${certNumber}`,
  };
}

// ---- Duplicate Detection ----

export function detectDuplicates(
  newCards: Partial<CardInventory>[],
  existingCards: CardInventory[]
): DuplicateMatch[] {
  const duplicates: DuplicateMatch[] = [];

  for (const newCard of newCards) {
    for (const existing of existingCards) {
      let score = 0;
      let factors = 0;

      // Player name similarity
      if (newCard.player && existing.player) {
        const sim = stringSimilarity(newCard.player, existing.player);
        score += sim * 40;
        factors += 40;
      }

      // Year match
      if (newCard.year && existing.year) {
        score += (newCard.year === existing.year ? 20 : 0);
        factors += 20;
      }

      // Set similarity
      if (newCard.set && existing.set) {
        const sim = stringSimilarity(newCard.set, existing.set);
        score += sim * 25;
        factors += 25;
      }

      // Card number match
      if (newCard.cardNumber && existing.cardNumber) {
        score += (normalize(newCard.cardNumber) === normalize(existing.cardNumber) ? 15 : 0);
        factors += 15;
      }

      const matchScore = factors > 0 ? Math.round((score / factors) * 100) : 0;

      if (matchScore >= 70) {
        let action: DuplicateMatch['action'];
        if (matchScore >= 90) {
          action = 'skip';
        } else if (matchScore >= 80) {
          action = 'merge';
        } else {
          action = 'replace';
        }

        duplicates.push({
          newCard,
          existingCard: existing,
          matchScore,
          action,
        });
        break; // Only match against the best existing card
      }
    }
  }

  return duplicates;
}

// ---- Execute Import ----

export function executeImport(
  cards: Partial<CardInventory>[],
  _existingCards: CardInventory[]
): { importRecord: ImportRecord; newCards: CardInventory[] } {
  const importId = generateImportId();
  const now = new Date().toISOString();
  const cardIds: string[] = [];
  const newCards: CardInventory[] = [];

  for (const partial of cards) {
    const id = generateId();
    cardIds.push(id);

    const card: CardInventory = {
      id,
      player: partial.player || 'Unknown Player',
      year: partial.year || new Date().getFullYear(),
      manufacturer: partial.manufacturer || 'Unknown',
      cardNumber: partial.cardNumber || '',
      set: partial.set || 'Unknown Set',
      sport: partial.sport || 'Baseball',
      league: partial.league || 'Other',
      isAutographed: partial.isAutographed || false,
      condition: partial.condition || 'Near Mint',
      isGraded: partial.isGraded || false,
      gradingCompany: partial.gradingCompany,
      grade: partial.grade,
      purchasePrice: partial.purchasePrice || 0,
      purchaseDate: partial.purchaseDate || now.slice(0, 10),
      currentValue: partial.currentValue,
      notes: partial.notes,
      status: 'active',
    };

    newCards.push(card);
  }

  const importRecord: ImportRecord = {
    id: importId,
    source: 'csv',
    timestamp: now,
    count: newCards.length,
    cardIds,
  };

  // Save to import history
  const history = getImportHistory();
  history.records.push(importRecord);
  saveImportHistory(history);

  return { importRecord, newCards };
}

// ---- Import History ----

export function getImportHistory(): ImportHistory {
  return store.get<ImportHistory>(IMPORT_HISTORY_KEY, { records: [] });
}

export function saveImportHistory(history: ImportHistory): void {
  const trimmed: ImportHistory = {
    records: history.records.slice(-100),
  };
  store.set(IMPORT_HISTORY_KEY, trimmed);
}

// ---- Export Collection ----

export function exportCollection(
  cards: CardInventory[],
  format: ExportConfig['format'],
  config?: Partial<ExportConfig>
): string {
  let filtered = [...cards];

  // Apply date range filter
  if (config?.dateFrom) {
    filtered = filtered.filter(c => c.purchaseDate >= config.dateFrom!);
  }
  if (config?.dateTo) {
    filtered = filtered.filter(c => c.purchaseDate <= config.dateTo!);
  }

  const columns: (keyof CardInventory)[] = config?.columns && config.columns.length > 0
    ? config.columns
    : ['player', 'year', 'manufacturer', 'cardNumber', 'set', 'sport', 'league',
       'isGraded', 'gradingCompany', 'grade', 'purchasePrice', 'purchaseDate',
       'currentValue', 'condition', 'notes'];

  if (format === 'csv') {
    const header = columns.join(',');
    const rows = filtered.map(card => {
      return columns.map(col => {
        const val = card[col];
        if (val === undefined || val === null) return '';
        const str = String(val);
        // Escape CSV fields with commas or quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',');
    });
    return [header, ...rows].join('\n');
  }

  if (format === 'json') {
    const data = filtered.map(card => {
      const obj: Record<string, unknown> = {};
      columns.forEach(col => {
        obj[col] = card[col];
      });
      return obj;
    });
    return JSON.stringify(data, null, 2);
  }

  // HTML format
  const htmlRows = filtered.map(card => {
    const cells = columns.map(col => {
      const val = card[col];
      if (val === undefined || val === null) return '<td></td>';
      if (col === 'purchasePrice' || col === 'currentValue') {
        return `<td style="text-align:right">$${Number(val).toFixed(2)}</td>`;
      }
      return `<td>${String(val)}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('\n');

  const headerCells = columns.map(col => `<th>${col}</th>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<title>Card Collection Export</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0a0f1c; color: #e2e8f0; padding: 2rem; }
  h1 { color: #3b82f6; font-size: 1.5rem; margin-bottom: 1rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th { background: #1e293b; color: #94a3b8; padding: 0.75rem; text-align: left; border-bottom: 2px solid #334155; font-weight: 600; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; }
  td { padding: 0.6rem 0.75rem; border-bottom: 1px solid #1e293b; }
  tr:hover td { background: #111827; }
  .footer { margin-top: 1.5rem; color: #64748b; font-size: 0.75rem; }
</style>
</head>
<body>
<h1>Card Collection Export</h1>
<p style="color:#64748b;font-size:0.8rem;margin-bottom:1rem">${filtered.length} cards &bull; Exported ${new Date().toLocaleDateString()}</p>
<table>
<thead><tr>${headerCells}</tr></thead>
<tbody>
${htmlRows}
</tbody>
</table>
<p class="footer">Generated by Modern Sports Intelligence</p>
</body>
</html>`;
}

// ---- Undo Import ----

export function undoImport(
  importId: string,
  allCards: CardInventory[]
): { remainingCards: CardInventory[]; removedCount: number } {
  const history = getImportHistory();
  const record = history.records.find(r => r.id === importId);

  if (!record) {
    return { remainingCards: allCards, removedCount: 0 };
  }

  const idsToRemove = new Set(record.cardIds);
  const remaining = allCards.filter(c => !idsToRemove.has(c.id));
  const removedCount = allCards.length - remaining.length;

  // Remove the record from history
  history.records = history.records.filter(r => r.id !== importId);
  saveImportHistory(history);

  return { remainingCards: remaining, removedCount };
}

// ---- Utility exports ----

export { ALL_CARD_FIELDS };
