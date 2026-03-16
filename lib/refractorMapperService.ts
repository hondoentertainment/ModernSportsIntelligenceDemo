// ---- Types ----

export interface LightSignature {
  id: string;
  wavelengths: number[];
  peakIntensity: number;
  refractiveIndex: number;
  spectrumHash: string;
  capturedAt: string;
}

export interface RefractorScan {
  id: string;
  cardId: string;
  player: string;
  cardDescription: string;
  scanDate: string;
  signatureId: string;
  identifiedParallel: string;
  confidence: number;
  imageUrl: string;
  notes: string;
}

export interface AuthenticationResult {
  id: string;
  scanId: string;
  isAuthentic: boolean;
  confidence: number;
  matchedSignatureCount: number;
  knownCounterfeitMatch: boolean;
  anomalies: string[];
  verifiedAt: string;
}

export interface ParallelType {
  id: string;
  name: string;
  brand: string;
  year: number;
  baseRefractiveIndex: number;
  colorProfile: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'ultra_rare' | 'super_short_print';
  avgMultiplier: number;
  knownPrintRun: number | null;
}

export interface SurfaceIntegrity {
  id: string;
  scanId: string;
  overallScore: number; // 0-100
  microScratchCount: number;
  printLinePresent: boolean;
  chromePeeling: boolean;
  fingerPrintDetected: boolean;
  surfaceHaze: number; // 0-10
  edgeWear: number; // 0-10
  recommendations: string[];
}

// ---- Mock Data ----

const MOCK_SIGNATURES: LightSignature[] = [
  { id: 'sig-1', wavelengths: [420, 485, 530, 580, 640], peakIntensity: 0.94, refractiveIndex: 1.72, spectrumHash: 'a3f8c2e1d4b5', capturedAt: '2026-03-14T10:23:00Z' },
  { id: 'sig-2', wavelengths: [410, 475, 520, 570, 635], peakIntensity: 0.87, refractiveIndex: 1.68, spectrumHash: 'b7d2e9f0a1c3', capturedAt: '2026-03-14T10:45:00Z' },
  { id: 'sig-3', wavelengths: [430, 490, 545, 590, 650], peakIntensity: 0.91, refractiveIndex: 1.75, spectrumHash: 'c1e4f7a8b2d6', capturedAt: '2026-03-13T14:12:00Z' },
  { id: 'sig-4', wavelengths: [415, 480, 525, 575, 638], peakIntensity: 0.78, refractiveIndex: 1.65, spectrumHash: 'd9c3b5a7e0f2', capturedAt: '2026-03-13T15:30:00Z' },
  { id: 'sig-5', wavelengths: [425, 488, 535, 585, 645], peakIntensity: 0.96, refractiveIndex: 1.80, spectrumHash: 'e5f1d8c4b3a9', capturedAt: '2026-03-12T09:05:00Z' },
  { id: 'sig-6', wavelengths: [408, 472, 518, 568, 630], peakIntensity: 0.83, refractiveIndex: 1.62, spectrumHash: 'f2a0b6c8d4e7', capturedAt: '2026-03-12T11:40:00Z' },
];

const MOCK_SCANS: RefractorScan[] = [
  { id: 'scan-1', cardId: 'card-101', player: 'Luka Doncic', cardDescription: '2018 Prizm Silver #280', scanDate: '2026-03-14', signatureId: 'sig-1', identifiedParallel: 'Silver Prizm', confidence: 98.7, imageUrl: '/scans/doncic-silver.jpg', notes: 'Clean silver refraction pattern. Signature matches known Silver Prizm database with high confidence.' },
  { id: 'scan-2', cardId: 'card-102', player: 'Victor Wembanyama', cardDescription: '2023 Prizm Mojo #1', scanDate: '2026-03-14', signatureId: 'sig-2', identifiedParallel: 'Mojo Prizm', confidence: 94.2, imageUrl: '/scans/wemby-mojo.jpg', notes: 'Mojo pattern confirmed. Circular refraction distinct from standard Silver.' },
  { id: 'scan-3', cardId: 'card-103', player: 'Shohei Ohtani', cardDescription: '2018 Topps Chrome Gold /50', scanDate: '2026-03-13', signatureId: 'sig-3', identifiedParallel: 'Gold Refractor', confidence: 99.1, imageUrl: '/scans/ohtani-gold.jpg', notes: 'Gold refractor verified. Peak intensity and refractive index consistent with /50 Topps Chrome gold run.' },
  { id: 'scan-4', cardId: 'card-104', player: 'Anthony Edwards', cardDescription: '2020 Prizm Silver #258 — Suspected Counterfeit', scanDate: '2026-03-13', signatureId: 'sig-4', identifiedParallel: 'Unknown / Non-Match', confidence: 32.1, imageUrl: '/scans/ant-suspect.jpg', notes: 'Refractive index 1.65 is below expected range (1.70-1.78) for Silver Prizm. Likely a base card with aftermarket coating.' },
  { id: 'scan-5', cardId: 'card-105', player: 'Patrick Mahomes', cardDescription: '2017 Prizm Hyper #269', scanDate: '2026-03-12', signatureId: 'sig-5', identifiedParallel: 'Hyper Prizm', confidence: 96.5, imageUrl: '/scans/mahomes-hyper.jpg', notes: 'Hyper pattern verified. Highest peak intensity in batch — consistent with retail-exclusive Hyper finish.' },
  { id: 'scan-6', cardId: 'card-106', player: 'Jayson Tatum', cardDescription: '2017 Prizm Fast Break #16', scanDate: '2026-03-12', signatureId: 'sig-6', identifiedParallel: 'Fast Break Prizm', confidence: 91.8, imageUrl: '/scans/tatum-fastbreak.jpg', notes: 'Fast Break neon green confirmed. Lower refractive index typical of this retail-exclusive parallel.' },
];

const MOCK_AUTH_RESULTS: AuthenticationResult[] = [
  { id: 'auth-1', scanId: 'scan-1', isAuthentic: true, confidence: 98.7, matchedSignatureCount: 847, knownCounterfeitMatch: false, anomalies: [], verifiedAt: '2026-03-14T10:25:00Z' },
  { id: 'auth-2', scanId: 'scan-2', isAuthentic: true, confidence: 94.2, matchedSignatureCount: 312, knownCounterfeitMatch: false, anomalies: ['Minor surface haze detected — may affect grade but not authenticity'], verifiedAt: '2026-03-14T10:47:00Z' },
  { id: 'auth-3', scanId: 'scan-3', isAuthentic: true, confidence: 99.1, matchedSignatureCount: 48, knownCounterfeitMatch: false, anomalies: [], verifiedAt: '2026-03-13T14:15:00Z' },
  { id: 'auth-4', scanId: 'scan-4', isAuthentic: false, confidence: 32.1, matchedSignatureCount: 0, knownCounterfeitMatch: true, anomalies: ['Refractive index below expected range', 'Spectrum hash matches known counterfeit batch CF-2024-089', 'Surface coating inconsistent with factory application'], verifiedAt: '2026-03-13T15:33:00Z' },
  { id: 'auth-5', scanId: 'scan-5', isAuthentic: true, confidence: 96.5, matchedSignatureCount: 523, knownCounterfeitMatch: false, anomalies: [], verifiedAt: '2026-03-12T09:08:00Z' },
  { id: 'auth-6', scanId: 'scan-6', isAuthentic: true, confidence: 91.8, matchedSignatureCount: 195, knownCounterfeitMatch: false, anomalies: ['Slight edge wear detected on chrome layer'], verifiedAt: '2026-03-12T11:43:00Z' },
];

const MOCK_PARALLEL_TYPES: ParallelType[] = [
  { id: 'pt-1', name: 'Silver Prizm', brand: 'Panini Prizm', year: 2023, baseRefractiveIndex: 1.72, colorProfile: 'silver-holographic', rarity: 'uncommon', avgMultiplier: 4.5, knownPrintRun: null },
  { id: 'pt-2', name: 'Gold Prizm /10', brand: 'Panini Prizm', year: 2023, baseRefractiveIndex: 1.76, colorProfile: 'gold-holographic', rarity: 'ultra_rare', avgMultiplier: 45.0, knownPrintRun: 10 },
  { id: 'pt-3', name: 'Mojo Prizm', brand: 'Panini Prizm', year: 2023, baseRefractiveIndex: 1.68, colorProfile: 'circular-holographic', rarity: 'rare', avgMultiplier: 12.0, knownPrintRun: null },
  { id: 'pt-4', name: 'Hyper Prizm', brand: 'Panini Prizm', year: 2023, baseRefractiveIndex: 1.80, colorProfile: 'neon-shimmer', rarity: 'uncommon', avgMultiplier: 3.0, knownPrintRun: null },
  { id: 'pt-5', name: 'Fast Break Prizm', brand: 'Panini Prizm', year: 2023, baseRefractiveIndex: 1.62, colorProfile: 'neon-green', rarity: 'uncommon', avgMultiplier: 2.5, knownPrintRun: null },
  { id: 'pt-6', name: 'Gold Refractor', brand: 'Topps Chrome', year: 2023, baseRefractiveIndex: 1.75, colorProfile: 'gold-chrome', rarity: 'rare', avgMultiplier: 20.0, knownPrintRun: 50 },
  { id: 'pt-7', name: 'Black Refractor /75', brand: 'Topps Chrome', year: 2023, baseRefractiveIndex: 1.70, colorProfile: 'dark-chrome', rarity: 'rare', avgMultiplier: 15.0, knownPrintRun: 75 },
  { id: 'pt-8', name: 'Superfractor 1/1', brand: 'Topps Chrome', year: 2023, baseRefractiveIndex: 1.85, colorProfile: 'rainbow-chrome', rarity: 'super_short_print', avgMultiplier: 200.0, knownPrintRun: 1 },
];

const MOCK_SURFACE: SurfaceIntegrity[] = [
  { id: 'si-1', scanId: 'scan-1', overallScore: 95, microScratchCount: 1, printLinePresent: false, chromePeeling: false, fingerPrintDetected: false, surfaceHaze: 1, edgeWear: 1, recommendations: ['Minor micro-scratch on front surface — likely PSA 9-10 range.'] },
  { id: 'si-2', scanId: 'scan-2', overallScore: 82, microScratchCount: 3, printLinePresent: false, chromePeeling: false, fingerPrintDetected: true, surfaceHaze: 3, edgeWear: 2, recommendations: ['Fingerprint residue on rear surface — clean with microfiber before submission.', 'Surface haze may lower surface sub-grade to 8.5.'] },
  { id: 'si-3', scanId: 'scan-3', overallScore: 98, microScratchCount: 0, printLinePresent: false, chromePeeling: false, fingerPrintDetected: false, surfaceHaze: 0, edgeWear: 0, recommendations: ['Gem mint surface. Excellent candidate for PSA 10 or BGS 10 pristine sub-grade.'] },
  { id: 'si-4', scanId: 'scan-4', overallScore: 45, microScratchCount: 12, printLinePresent: true, chromePeeling: true, fingerPrintDetected: true, surfaceHaze: 7, edgeWear: 6, recommendations: ['Do not submit for grading.', 'Chrome peeling and excessive scratches indicate aftermarket tampering.', 'Consistent with counterfeit coating application.'] },
  { id: 'si-5', scanId: 'scan-5', overallScore: 91, microScratchCount: 2, printLinePresent: false, chromePeeling: false, fingerPrintDetected: false, surfaceHaze: 2, edgeWear: 1, recommendations: ['Strong surface. Micro-scratches are factory-level. PSA 9-10 likely.'] },
  { id: 'si-6', scanId: 'scan-6', overallScore: 78, microScratchCount: 4, printLinePresent: true, chromePeeling: false, fingerPrintDetected: false, surfaceHaze: 2, edgeWear: 4, recommendations: ['Print line visible under 10x magnification on front.', 'Edge wear on top border may limit grade to PSA 8.'] },
];

// ---- Service Functions ----

export function getScans(): RefractorScan[] {
  return [...MOCK_SCANS].sort((a, b) => new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime());
}

export function getSignatures(): LightSignature[] {
  return [...MOCK_SIGNATURES].sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
}

export function getAuthResults(): AuthenticationResult[] {
  return [...MOCK_AUTH_RESULTS].sort((a, b) => b.confidence - a.confidence);
}

export function getParallelTypes(): ParallelType[] {
  return [...MOCK_PARALLEL_TYPES].sort((a, b) => b.avgMultiplier - a.avgMultiplier);
}

export function getSurfaceReport(scanId?: string): SurfaceIntegrity[] {
  const reports = scanId ? MOCK_SURFACE.filter((s) => s.scanId === scanId) : MOCK_SURFACE;
  return [...reports].sort((a, b) => b.overallScore - a.overallScore);
}

export default {
  getScans,
  getSignatures,
  getAuthResults,
  getParallelTypes,
  getSurfaceReport,
};
