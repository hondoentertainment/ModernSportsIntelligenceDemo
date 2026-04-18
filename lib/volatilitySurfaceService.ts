// ---- Types ----

export interface VolatilityPoint {
  id: string;
  grade: string;
  year: number;
  popularity: 'low' | 'medium' | 'high' | 'elite';
  impliedVol: number;
  historicalVol: number;
  volSpread: number;
  sampleSize: number;
}

export interface VolatilitySurface {
  grade: string;
  points: { year: number; popularity: string; vol: number }[];
}

export interface VolSkew {
  grade: string;
  year: number;
  lowPopVol: number;
  medPopVol: number;
  highPopVol: number;
  elitePopVol: number;
  skewRatio: number;
}

export interface VolHistory {
  month: string;
  avgVol: number;
  psa10Vol: number;
  psa9Vol: number;
  bgs95Vol: number;
  rawVol: number;
  vintageVol: number;
  modernVol: number;
}

// ---- Mock Data ----

const grades = ['PSA 10', 'PSA 9', 'BGS 9.5', 'BGS 10', 'SGC 10', 'Raw'];
const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
const popularities: Array<'low' | 'medium' | 'high' | 'elite'> = ['low', 'medium', 'high', 'elite'];

const baseVol: Record<string, number> = {
  'PSA 10': 18, 'PSA 9': 22, 'BGS 9.5': 20, 'BGS 10': 16, 'SGC 10': 24, 'Raw': 32,
};

const yearMult: Record<number, number> = {
  2018: 0.85, 2019: 0.90, 2020: 1.05, 2021: 1.15, 2022: 1.10, 2023: 1.20, 2024: 1.35,
};

const popMult: Record<string, number> = {
  low: 0.75, medium: 1.0, high: 1.25, elite: 1.55,
};

let pointId = 0;
const mockVolPoints: VolatilityPoint[] = [];
grades.forEach(grade => {
  years.forEach(year => {
    popularities.forEach(pop => {
      pointId++;
      const base = baseVol[grade] * yearMult[year] * popMult[pop];
      const implied = Math.round((base + (Math.random() - 0.5) * 4) * 10) / 10;
      const historical = Math.round((base * 0.92 + (Math.random() - 0.5) * 3) * 10) / 10;
      mockVolPoints.push({
        id: `vp-${pointId}`,
        grade,
        year,
        popularity: pop,
        impliedVol: implied,
        historicalVol: historical,
        volSpread: Math.round((implied - historical) * 10) / 10,
        sampleSize: Math.floor(50 + Math.random() * 450),
      });
    });
  });
});

const mockSkews: VolSkew[] = [];
grades.forEach(grade => {
  years.forEach(year => {
    const pts = mockVolPoints.filter(p => p.grade === grade && p.year === year);
    const low = pts.find(p => p.popularity === 'low')?.impliedVol || 10;
    const med = pts.find(p => p.popularity === 'medium')?.impliedVol || 15;
    const high = pts.find(p => p.popularity === 'high')?.impliedVol || 20;
    const elite = pts.find(p => p.popularity === 'elite')?.impliedVol || 28;
    mockSkews.push({
      grade,
      year,
      lowPopVol: low,
      medPopVol: med,
      highPopVol: high,
      elitePopVol: elite,
      skewRatio: Math.round((elite / low) * 100) / 100,
    });
  });
});

const mockVolHistory: VolHistory[] = [
  { month: '2025-05', avgVol: 22.4, psa10Vol: 16.8, psa9Vol: 20.2, bgs95Vol: 18.5, rawVol: 30.1, vintageVol: 12.4, modernVol: 26.8 },
  { month: '2025-06', avgVol: 28.6, psa10Vol: 22.1, psa9Vol: 26.4, bgs95Vol: 24.2, rawVol: 36.8, vintageVol: 14.2, modernVol: 32.4 },
  { month: '2025-07', avgVol: 26.2, psa10Vol: 20.4, psa9Vol: 24.1, bgs95Vol: 22.8, rawVol: 34.5, vintageVol: 13.8, modernVol: 30.1 },
  { month: '2025-08', avgVol: 21.8, psa10Vol: 16.2, psa9Vol: 19.8, bgs95Vol: 18.1, rawVol: 29.4, vintageVol: 11.9, modernVol: 25.6 },
  { month: '2025-09', avgVol: 19.4, psa10Vol: 14.8, psa9Vol: 18.2, bgs95Vol: 16.5, rawVol: 26.8, vintageVol: 10.8, modernVol: 23.2 },
  { month: '2025-10', avgVol: 18.2, psa10Vol: 13.5, psa9Vol: 17.1, bgs95Vol: 15.4, rawVol: 25.2, vintageVol: 10.2, modernVol: 21.8 },
  { month: '2025-11', avgVol: 20.1, psa10Vol: 15.2, psa9Vol: 18.8, bgs95Vol: 17.1, rawVol: 27.4, vintageVol: 11.4, modernVol: 24.2 },
  { month: '2025-12', avgVol: 23.8, psa10Vol: 18.4, psa9Vol: 22.1, bgs95Vol: 20.5, rawVol: 31.2, vintageVol: 12.8, modernVol: 28.4 },
  { month: '2026-01', avgVol: 21.4, psa10Vol: 16.1, psa9Vol: 19.8, bgs95Vol: 18.2, rawVol: 28.8, vintageVol: 11.5, modernVol: 25.2 },
  { month: '2026-02', avgVol: 19.8, psa10Vol: 14.5, psa9Vol: 18.4, bgs95Vol: 16.8, rawVol: 27.1, vintageVol: 10.8, modernVol: 23.8 },
  { month: '2026-03', avgVol: 18.6, psa10Vol: 13.8, psa9Vol: 17.2, bgs95Vol: 15.8, rawVol: 25.8, vintageVol: 10.4, modernVol: 22.4 },
  { month: '2026-04', avgVol: 20.2, psa10Vol: 15.4, psa9Vol: 18.8, bgs95Vol: 17.2, rawVol: 27.6, vintageVol: 11.2, modernVol: 24.6 },
];

// ---- Getter Functions ----

export function getVolatilityPoints(): VolatilityPoint[] {
  return mockVolPoints;
}

export function getVolatilitySurfaces(): VolatilitySurface[] {
  return grades.map(grade => ({
    grade,
    points: mockVolPoints
      .filter(p => p.grade === grade)
      .map(p => ({ year: p.year, popularity: p.popularity, vol: p.impliedVol })),
  }));
}

export function getVolSkews(): VolSkew[] {
  return mockSkews;
}

export function getVolHistory(): VolHistory[] {
  return mockVolHistory;
}

export function getPointsByGrade(grade: string): VolatilityPoint[] {
  return mockVolPoints.filter(p => p.grade === grade);
}

export function getAverageVolByGrade(): { grade: string; avgImplied: number; avgHistorical: number }[] {
  return grades.map(grade => {
    const pts = mockVolPoints.filter(p => p.grade === grade);
    return {
      grade,
      avgImplied: Math.round(pts.reduce((s, p) => s + p.impliedVol, 0) / pts.length * 10) / 10,
      avgHistorical: Math.round(pts.reduce((s, p) => s + p.historicalVol, 0) / pts.length * 10) / 10,
    };
  });
}
