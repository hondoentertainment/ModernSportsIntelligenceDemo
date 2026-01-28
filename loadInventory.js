
import XLSX from 'xlsx';
import fs from 'fs';

const workbook = XLSX.readFile('CardX_Inventory.xlsx');
const sheet = workbook.Sheets['INVENTORY'];
const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Header is at row 3 (0-indexed)
const rows = rawData.slice(4);

const sports = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

const excelDateToISO = (serial) => {
    if (!serial || isNaN(serial)) return new Date().toISOString().split('T')[0];
    const date = new Date((serial - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
};

const placeholderImages = [
    'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=100'
];

let totalCost = 0;
let marketValue = 0;

const playerMap = new Map();

const mappedCards = rows
    .filter(row => row[1]) // Must have a player name
    .map((row, index) => {
        const playerName = String(row[1]).trim();
        const sport = sports.includes(row[2]) ? row[2] : 'Baseball';
        const manufacturer = String(row[4] || 'Unknown');
        const set = String(row[7] || 'Base');

        let league = 'Other';
        if (sport === 'Baseball') {
            league = (manufacturer.includes('Bowman') || set.includes('Prospect')) ? 'MiLB' : 'MLB';
        } else if (sport === 'Basketball') {
            league = 'NBA';
        } else if (sport === 'Football') {
            league = 'NFL';
        }

        const purchasePrice = parseFloat(row[14]) || parseFloat(row[13]) || 0;
        const currentValue = parseFloat(row[15]) || purchasePrice;

        totalCost += purchasePrice;
        marketValue += currentValue;

        // Track unique players and their teams
        if (!playerMap.has(playerName)) {
            playerMap.set(playerName, {
                id: `p-${playerName.toLowerCase().replace(/\s+/g, '-')}`,
                name: playerName,
                team: String(row[11] || 'Unknown'), // Contributor/Team column
                position: 'Player', // Position not in sheet, using default
                league: league,
                image: placeholderImages[index % placeholderImages.length],
                breakoutScore: 70 + Math.floor(Math.random() * 25), // Simulation
                trend: Math.floor(Math.random() * 15) - 5,
                intelligenceScore: 85 + Math.floor(Math.random() * 10),
                stats: [
                    { label: 'Market Value', value: 'N/A', change: '0%' },
                    { label: 'Volume', value: 'N/A', change: '0%' },
                    { label: 'Volatility', value: 'Low', change: '0%' }
                ],
                summary: `${playerName} is a key asset in your current inventory with multiple card positions.`,
                marketContext: 'Market is currently pricing this asset based on historical stability.'
            });
        }

        return {
            id: String(row[0] || index),
            player: playerName,
            year: parseInt(row[3]) || 2024,
            manufacturer: manufacturer,
            cardNumber: String(row[5] || 'N/A'),
            set: set,
            sport: sport,
            league: league,
            isAutographed: row[6] === 'Yes',
            condition: 'Near Mint',
            isGraded: row[8] === 'Yes',
            gradingCompany: row[8] === 'Yes' ? 'PSA' : undefined,
            grade: row[8] === 'Yes' ? '9' : undefined,
            purchasePrice: purchasePrice,
            purchaseDate: excelDateToISO(row[9]),
            currentValue: currentValue,
            lastValuationDate: new Date().toISOString().split('T')[0],
            image: placeholderImages[index % placeholderImages.length]
        };
    });

const totalGain = marketValue - totalCost;
const roi = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

const summary = {
    totalCost,
    marketValue,
    roi: parseFloat(roi.toFixed(1)),
    totalGain,
    realizedProfit: 1250.00,
    realizedSold: 3500.00,
    realizedCogs: 2250.00
};

const uniquePlayers = Array.from(playerMap.values());

const content = `import { CardInventory } from './types.ts';

export const PREPOPULATED_CARDS: CardInventory[] = ${JSON.stringify(mappedCards, null, 2)};

export const PREPOPULATED_SUMMARY = ${JSON.stringify(summary, null, 2)};

export const INVENTORY_PLAYERS = ${JSON.stringify(uniquePlayers, null, 2)};
`;

fs.writeFileSync('prepopulatedCards.ts', content);
console.log(`Generated prepopulatedCards.ts with ${mappedCards.length} cards and ${uniquePlayers.length} unique players.`);
