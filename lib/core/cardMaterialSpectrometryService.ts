// Card Material Spectrometry — Phase 232
// Spectral analysis simulation for detecting reprints and material variations

export interface SpectralScan {
  id: string;
  cardName: string;
  player: string;
  year: number;
  manufacturer: string;
  scanDate: string;
  authenticityScore: number;
  verdict: 'authentic' | 'reprint' | 'counterfeit' | 'altered-material' | 'inconclusive';
  spectralProfile: SpectralProfile;
  materialComposition: MaterialComposition;
  uvResponse: UVResponse;
  flags: SpectralFlag[];
}

export interface SpectralProfile {
  peakWavelength: number;
  reflectancePattern: number[];
  absorptionBands: { wavelength: number; intensity: number; material: string }[];
  fluorescenceSignature: string;
  inkLayerCount: number;
  paperBrightness: number;
}

export interface MaterialComposition {
  paperType: string;
  coatingType: string;
  inkType: string;
  estimatedAge: number;
  consistentWithEra: boolean;
  chemicalMarkers: { marker: string; detected: boolean; expected: boolean }[];
}

export interface UVResponse {
  shortWave: { response: string; normal: boolean };
  longWave: { response: string; normal: boolean };
  opticalBrighteners: boolean;
  inkFluorescence: string;
}

export interface SpectralFlag {
  type: 'reprint-ink' | 'modern-paper' | 'chemical-treatment' | 'uv-anomaly' | 'coating-mismatch' | 'age-inconsistency';
  confidence: number;
  description: string;
  evidence: string;
}

export interface SpectralDatabase {
  id: string;
  manufacturer: string;
  yearRange: string;
  productLine: string;
  expectedPeakWavelength: number;
  expectedInkLayers: number;
  expectedPaperBrightness: number;
  sampleCount: number;
  confidence: number;
}

const MOCK_SCANS: SpectralScan[] = [
  { id: 'ss-1', cardName: '1952 Topps Mickey Mantle #311', player: 'Mickey Mantle', year: 1952, manufacturer: 'Topps', scanDate: '2026-03-15', authenticityScore: 96, verdict: 'authentic', spectralProfile: { peakWavelength: 582, reflectancePattern: [0.12, 0.28, 0.45, 0.62, 0.78, 0.85, 0.82, 0.71, 0.55, 0.38], absorptionBands: [{ wavelength: 420, intensity: 0.72, material: 'period-correct cyan ink' }, { wavelength: 530, intensity: 0.65, material: 'period-correct magenta ink' }], fluorescenceSignature: 'TOPPS-1952-STD-AUTH', inkLayerCount: 4, paperBrightness: 42 }, materialComposition: { paperType: '1950s wood-pulp cardstock', coatingType: 'none (uncoated)', inkType: 'period letterpress ink', estimatedAge: 74, consistentWithEra: true, chemicalMarkers: [{ marker: 'lignin', detected: true, expected: true }, { marker: 'optical brightener OBA-1', detected: false, expected: false }, { marker: 'titanium dioxide', detected: true, expected: true }] }, uvResponse: { shortWave: { response: 'Dull yellow-brown fluorescence', normal: true }, longWave: { response: 'Muted warm glow', normal: true }, opticalBrighteners: false, inkFluorescence: 'Period-consistent warm tone' }, flags: [] },
  { id: 'ss-2', cardName: '1986 Fleer Michael Jordan RC #57 (Suspected Reprint)', player: 'Michael Jordan', year: 1986, manufacturer: 'Fleer', scanDate: '2026-03-14', authenticityScore: 18, verdict: 'reprint', spectralProfile: { peakWavelength: 548, reflectancePattern: [0.15, 0.32, 0.55, 0.74, 0.88, 0.92, 0.89, 0.78, 0.60, 0.42], absorptionBands: [{ wavelength: 410, intensity: 0.82, material: 'modern process cyan' }, { wavelength: 525, intensity: 0.78, material: 'modern process magenta' }], fluorescenceSignature: 'MODERN-OFFSET-GENERIC', inkLayerCount: 4, paperBrightness: 88 }, materialComposition: { paperType: 'modern coated cardstock', coatingType: 'clay-coated (post-2000)', inkType: 'modern offset lithography', estimatedAge: 2, consistentWithEra: false, chemicalMarkers: [{ marker: 'lignin', detected: false, expected: true }, { marker: 'optical brightener OBA-1', detected: true, expected: false }, { marker: 'calcium carbonate filler', detected: true, expected: false }] }, uvResponse: { shortWave: { response: 'Bright blue-white fluorescence', normal: false }, longWave: { response: 'Vivid cool white', normal: false }, opticalBrighteners: true, inkFluorescence: 'Modern UV-reactive pigments detected' }, flags: [{ type: 'reprint-ink', confidence: 96, description: 'Ink spectral signature matches modern offset printing, not 1986 Fleer production', evidence: 'Peak wavelength 548nm vs expected 578nm; absorption bands indicate modern process inks' }, { type: 'modern-paper', confidence: 98, description: 'Paper contains optical brighteners and calcium carbonate filler not used in 1986', evidence: 'OBA-1 detected, brightness 88 vs expected 55-62 for period stock' }, { type: 'uv-anomaly', confidence: 94, description: 'UV fluorescence is bright blue-white — authentic 1986 Fleer shows warm amber', evidence: 'Short-wave UV response completely inconsistent with 40-year-old wood-pulp stock' }] },
  { id: 'ss-3', cardName: '2018 Panini Prizm Luka Doncic Silver #280', player: 'Luka Doncic', year: 2018, manufacturer: 'Panini', scanDate: '2026-03-13', authenticityScore: 94, verdict: 'authentic', spectralProfile: { peakWavelength: 512, reflectancePattern: [0.18, 0.35, 0.58, 0.76, 0.91, 0.95, 0.92, 0.82, 0.65, 0.45], absorptionBands: [{ wavelength: 405, intensity: 0.85, material: 'Prizm proprietary chrome ink' }, { wavelength: 520, intensity: 0.72, material: 'silver refractor coating' }], fluorescenceSignature: 'PANINI-PRIZM-2018-SILVER', inkLayerCount: 6, paperBrightness: 91 }, materialComposition: { paperType: 'chrome card stock', coatingType: 'proprietary refractor laminate', inkType: 'modern process + metallic overlay', estimatedAge: 8, consistentWithEra: true, chemicalMarkers: [{ marker: 'metallic pigment (aluminum)', detected: true, expected: true }, { marker: 'UV-cured varnish', detected: true, expected: true }, { marker: 'prismatic diffraction layer', detected: true, expected: true }] }, uvResponse: { shortWave: { response: 'Strong prismatic rainbow pattern', normal: true }, longWave: { response: 'Metallic shimmer with blue highlights', normal: true }, opticalBrighteners: true, inkFluorescence: 'Chrome-consistent metallic response' }, flags: [] },
  { id: 'ss-4', cardName: '1993 SP Derek Jeter RC #279', player: 'Derek Jeter', year: 1993, manufacturer: 'Upper Deck', scanDate: '2026-03-12', authenticityScore: 72, verdict: 'altered-material', spectralProfile: { peakWavelength: 568, reflectancePattern: [0.14, 0.30, 0.48, 0.64, 0.80, 0.87, 0.84, 0.73, 0.57, 0.40], absorptionBands: [{ wavelength: 415, intensity: 0.70, material: 'period-correct ink base' }, { wavelength: 535, intensity: 0.61, material: 'period-correct magenta' }], fluorescenceSignature: 'UD-1993-SP-MOD', inkLayerCount: 5, paperBrightness: 68 }, materialComposition: { paperType: '1990s premium foil stock', coatingType: 'original foil + surface treatment', inkType: 'period-correct', estimatedAge: 33, consistentWithEra: true, chemicalMarkers: [{ marker: 'foil adhesive (original)', detected: true, expected: true }, { marker: 'surface sealant (non-original)', detected: true, expected: false }, { marker: 'UV protectant spray', detected: true, expected: false }] }, uvResponse: { shortWave: { response: 'Mixed — period base with modern overlay', normal: false }, longWave: { response: 'Slightly enhanced brightness vs baseline', normal: false }, opticalBrighteners: false, inkFluorescence: 'Base authentic but surface shows additional chemical layer' }, flags: [{ type: 'chemical-treatment', confidence: 82, description: 'Non-original surface sealant detected — card has been treated to enhance appearance', evidence: 'UV protectant spray and surface sealant not consistent with 1993 UD production' }, { type: 'coating-mismatch', confidence: 75, description: 'Surface coating chemistry suggests post-production treatment', evidence: 'Additional chemical layer absorbing at 380nm not present in reference samples' }] },
];

const MOCK_DATABASE: SpectralDatabase[] = [
  { id: 'sdb-1', manufacturer: 'Topps', yearRange: '1950-1959', productLine: 'Standard', expectedPeakWavelength: 580, expectedInkLayers: 4, expectedPaperBrightness: 42, sampleCount: 1847, confidence: 94 },
  { id: 'sdb-2', manufacturer: 'Fleer', yearRange: '1985-1990', productLine: 'Standard', expectedPeakWavelength: 578, expectedInkLayers: 4, expectedPaperBrightness: 58, sampleCount: 2341, confidence: 92 },
  { id: 'sdb-3', manufacturer: 'Panini', yearRange: '2015-2025', productLine: 'Prizm Chrome', expectedPeakWavelength: 515, expectedInkLayers: 6, expectedPaperBrightness: 90, sampleCount: 5628, confidence: 97 },
  { id: 'sdb-4', manufacturer: 'Upper Deck', yearRange: '1990-1999', productLine: 'SP/SPx Premium', expectedPeakWavelength: 570, expectedInkLayers: 5, expectedPaperBrightness: 65, sampleCount: 3124, confidence: 93 },
  { id: 'sdb-5', manufacturer: 'Topps', yearRange: '2010-2025', productLine: 'Chrome', expectedPeakWavelength: 520, expectedInkLayers: 5, expectedPaperBrightness: 88, sampleCount: 7845, confidence: 96 },
];

export function getScans(): SpectralScan[] { return [...MOCK_SCANS]; }
export function getDatabase(): SpectralDatabase[] { return [...MOCK_DATABASE]; }
export function getAuthenticCount(): number { return MOCK_SCANS.filter(s => s.verdict === 'authentic').length; }
export function getFlaggedCount(): number { return MOCK_SCANS.filter(s => s.verdict !== 'authentic').length; }

export default { getScans, getDatabase, getAuthenticCount, getFlaggedCount };
