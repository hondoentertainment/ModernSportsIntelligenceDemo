// Acoustic Authentication Engine — Phase 225
// Sound-based micro-tap resonance analysis for detecting trimming and alterations

export interface AcousticScan {
  id: string;
  cardName: string;
  player: string;
  scanDate: string;
  resonanceProfile: ResonanceProfile;
  authenticityScore: number;
  verdict: 'authentic' | 'suspect' | 'altered' | 'inconclusive';
  flags: AcousticFlag[];
  materialSignature: string;
  thickness: number;
  densityIndex: number;
}

export interface ResonanceProfile {
  fundamentalFreq: number;
  harmonics: number[];
  dampingRatio: number;
  ringDuration: number;
  spectralPeaks: { freq: number; amplitude: number }[];
  materialClass: 'standard-card-stock' | 'premium-stock' | 'chrome-refractor' | 'acetate' | 'patch-relic' | 'unknown';
}

export interface AcousticFlag {
  type: 'trimming' | 'recoloring' | 'thickness-anomaly' | 'lamination' | 'edge-repair' | 'surface-coating';
  confidence: number;
  description: string;
  location: string;
}

export interface MaterialDatabase {
  id: string;
  manufacturer: string;
  year: number;
  productLine: string;
  expectedFreq: number;
  freqTolerance: number;
  expectedThickness: number;
  sampleCount: number;
}

const MOCK_SCANS: AcousticScan[] = [
  { id: 'as-1', cardName: '2011 Topps Update Mike Trout RC #US175', player: 'Mike Trout', scanDate: '2026-03-15', resonanceProfile: { fundamentalFreq: 2847, harmonics: [5694, 8541, 11388], dampingRatio: 0.042, ringDuration: 0.31, spectralPeaks: [{ freq: 2847, amplitude: 0.94 }, { freq: 5694, amplitude: 0.67 }, { freq: 8541, amplitude: 0.38 }], materialClass: 'standard-card-stock' }, authenticityScore: 97, verdict: 'authentic', flags: [], materialSignature: 'TOPPS-STD-2011-A', thickness: 0.305, densityIndex: 1.42 },
  { id: 'as-2', cardName: '1986 Fleer Michael Jordan RC #57', player: 'Michael Jordan', scanDate: '2026-03-14', resonanceProfile: { fundamentalFreq: 2612, harmonics: [5224, 7836], dampingRatio: 0.051, ringDuration: 0.28, spectralPeaks: [{ freq: 2612, amplitude: 0.91 }, { freq: 5224, amplitude: 0.58 }], materialClass: 'standard-card-stock' }, authenticityScore: 62, verdict: 'suspect', flags: [{ type: 'trimming', confidence: 78, description: 'Edge resonance asymmetry detected — right edge 12% shorter ring duration', location: 'right-edge' }, { type: 'thickness-anomaly', confidence: 65, description: 'Thickness 0.02mm below expected range for 1986 Fleer stock', location: 'overall' }], materialSignature: 'FLEER-STD-1986-B', thickness: 0.285, densityIndex: 1.38 },
  { id: 'as-3', cardName: '2018 Panini Prizm Luka Doncic Silver #280', player: 'Luka Doncic', scanDate: '2026-03-13', resonanceProfile: { fundamentalFreq: 3142, harmonics: [6284, 9426, 12568], dampingRatio: 0.035, ringDuration: 0.38, spectralPeaks: [{ freq: 3142, amplitude: 0.96 }, { freq: 6284, amplitude: 0.72 }, { freq: 9426, amplitude: 0.44 }], materialClass: 'chrome-refractor' }, authenticityScore: 95, verdict: 'authentic', flags: [], materialSignature: 'PANINI-PRIZM-2018-CR', thickness: 0.342, densityIndex: 1.61 },
  { id: 'as-4', cardName: '1952 Topps Mickey Mantle #311', player: 'Mickey Mantle', scanDate: '2026-03-12', resonanceProfile: { fundamentalFreq: 2198, harmonics: [4396, 6594], dampingRatio: 0.072, ringDuration: 0.19, spectralPeaks: [{ freq: 2198, amplitude: 0.82 }, { freq: 4396, amplitude: 0.41 }], materialClass: 'standard-card-stock' }, authenticityScore: 44, verdict: 'altered', flags: [{ type: 'recoloring', confidence: 88, description: 'Surface coating detected — foreign chemical layer absorbing high-frequency harmonics', location: 'front-surface' }, { type: 'surface-coating', confidence: 91, description: 'Non-original lacquer or sealant identified via damping ratio anomaly', location: 'front-surface' }], materialSignature: 'TOPPS-VTG-1952-MOD', thickness: 0.318, densityIndex: 1.55 },
  { id: 'as-5', cardName: '2020 Panini Prizm Justin Herbert RC #325', player: 'Justin Herbert', scanDate: '2026-03-11', resonanceProfile: { fundamentalFreq: 3098, harmonics: [6196, 9294, 12392], dampingRatio: 0.037, ringDuration: 0.36, spectralPeaks: [{ freq: 3098, amplitude: 0.95 }, { freq: 6196, amplitude: 0.70 }], materialClass: 'chrome-refractor' }, authenticityScore: 93, verdict: 'authentic', flags: [], materialSignature: 'PANINI-PRIZM-2020-CR', thickness: 0.338, densityIndex: 1.59 },
  { id: 'as-6', cardName: '1989 Upper Deck Ken Griffey Jr RC #1', player: 'Ken Griffey Jr', scanDate: '2026-03-10', resonanceProfile: { fundamentalFreq: 2756, harmonics: [5512, 8268], dampingRatio: 0.048, ringDuration: 0.29, spectralPeaks: [{ freq: 2756, amplitude: 0.89 }, { freq: 5512, amplitude: 0.55 }], materialClass: 'premium-stock' }, authenticityScore: 71, verdict: 'suspect', flags: [{ type: 'edge-repair', confidence: 72, description: 'Left edge shows micro-fill material with different resonance signature', location: 'left-edge' }], materialSignature: 'UD-PREM-1989-A', thickness: 0.312, densityIndex: 1.47 },
];

const MOCK_MATERIAL_DB: MaterialDatabase[] = [
  { id: 'mat-1', manufacturer: 'Topps', year: 2011, productLine: 'Update Series', expectedFreq: 2850, freqTolerance: 45, expectedThickness: 0.305, sampleCount: 1247 },
  { id: 'mat-2', manufacturer: 'Fleer', year: 1986, productLine: 'Standard', expectedFreq: 2620, freqTolerance: 55, expectedThickness: 0.295, sampleCount: 892 },
  { id: 'mat-3', manufacturer: 'Panini', year: 2018, productLine: 'Prizm Silver', expectedFreq: 3140, freqTolerance: 40, expectedThickness: 0.340, sampleCount: 2156 },
  { id: 'mat-4', manufacturer: 'Topps', year: 1952, productLine: 'Standard', expectedFreq: 2200, freqTolerance: 80, expectedThickness: 0.310, sampleCount: 342 },
  { id: 'mat-5', manufacturer: 'Upper Deck', year: 1989, productLine: 'Premium', expectedFreq: 2760, freqTolerance: 50, expectedThickness: 0.310, sampleCount: 1578 },
];

export function getScans(): AcousticScan[] { return [...MOCK_SCANS]; }
export function getMaterialDatabase(): MaterialDatabase[] { return [...MOCK_MATERIAL_DB]; }
export function getAuthenticCount(): number { return MOCK_SCANS.filter(s => s.verdict === 'authentic').length; }
export function getSuspectCount(): number { return MOCK_SCANS.filter(s => s.verdict === 'suspect' || s.verdict === 'altered').length; }

export default { getScans, getMaterialDatabase, getAuthenticCount, getSuspectCount };
