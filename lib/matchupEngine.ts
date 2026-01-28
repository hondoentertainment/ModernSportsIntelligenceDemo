
import { MOCK_TEAMS } from '../constants';

export interface GameMatchup {
    id: string;
    homeTeam: typeof MOCK_TEAMS[0];
    awayTeam: typeof MOCK_TEAMS[0];
    time: string;
    status: 'scheduled' | 'live' | 'final';
    league: string;
    narrative: {
        headline: string;
        preview: string;
        keyMatchup: string;
        advantage: string;
        confidence: number;
    };
    odds: {
        spread: string;
        total: string;
    };
}

const NARRATIVE_TEMPLATES = {
    NBA: [
        { headline: "Tempo Clash", preview: "Elite transition offense meets disciplined half-court defense.", key: "Pace Control" },
        { headline: "Star Power", preview: "Two MVP candidates go head-to-head in a primetime showcase.", key: "Superstar Efficiency" },
        { headline: "Grudge Match", preview: "Post-season intensity expected in this conference rivalry.", key: "Physicality" },
        { headline: "Youth vs Exp", preview: "Veteran savvy aims to slow down explosive young athleticism.", key: "Turnover Margin" },
    ],
    MLB: [
        { headline: "Ace Duel", preview: "Cy Young contenders lock horns in a pitcher's duel.", key: "Bullpen Depth" },
        { headline: "Slugfest", preview: "High-powered offenses face struggling rotations.", key: "Home Run Power" },
        { headline: "Division Battle", preview: "Critical series opener with playoff implications.", key: "Clutch Hitting" },
        { headline: "Speed Game", preview: "Aggressive baserunning could be the deciding factor.", key: "Stolen Bases" }
    ]
};

export function generateDailySchedule(date: Date = new Date()): GameMatchup[] {
    // Seed random based on date to keep it consistent for the day
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    let rng = seed;
    const random = () => {
        rng = (rng * 9301 + 49297) % 233280;
        return rng / 233280;
    };

    const games: GameMatchup[] = [];
    const leagues = ['NBA', 'MLB'];

    // Generate 4-6 games per day
    const numGames = 4 + Math.floor(random() * 3);

    const availableTeams = [...MOCK_TEAMS];

    // Shuffle teams
    for (let i = availableTeams.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [availableTeams[i], availableTeams[j]] = [availableTeams[j], availableTeams[i]];
    }

    for (let i = 0; i < numGames; i++) {
        if (availableTeams.length < 2) break;

        const home = availableTeams.pop()!;
        // Find an away team of same league preferably
        let awayIdx = availableTeams.findIndex(t => t.league === home.league);
        if (awayIdx === -1) awayIdx = 0; // Fallback

        const away = availableTeams.splice(awayIdx, 1)[0];

        // Generate time (Evening games)
        const hour = 18 + Math.floor(random() * 4); // 6pm - 9pm
        const min = Math.floor(random() * 4) * 15; // 00, 15, 30, 45
        const timeStr = `${hour > 12 ? hour - 12 : hour}:${min === 0 ? '00' : min} PM EST`;

        // Generate narrative
        const templates = NARRATIVE_TEMPLATES[home.league as keyof typeof NARRATIVE_TEMPLATES] || NARRATIVE_TEMPLATES.NBA;
        const template = templates[Math.floor(random() * templates.length)];

        // Determine Simulated Status
        const now = new Date();
        const gameTime = new Date(date);
        gameTime.setHours(hour, min);

        let status: 'scheduled' | 'live' | 'final' = 'scheduled';
        // Simple logic: if looking at "today", check time. 
        // For demo purposes, let's make 1 game live if it's evening, otherwise scheduled.
        // Actually, let's just use the 'scheduled' status mostly unless forced.

        const spread = (random() * 10 - 5).toFixed(1);

        games.push({
            id: `game-${seed}-${i}`,
            homeTeam: home,
            awayTeam: away,
            time: timeStr,
            status,
            league: home.league,
            narrative: {
                headline: template.headline,
                preview: template.preview,
                keyMatchup: template.key,
                advantage: home.score > away.score ? home.name : away.name,
                confidence: 70 + Math.floor(random() * 25)
            },
            odds: {
                spread: Number(spread) > 0 ? `+${spread}` : spread,
                total: (210 + Math.floor(random() * 30)).toString()
            }
        });
    }

    return games.sort((a, b) => parseInt(a.time) - parseInt(b.time));
}
