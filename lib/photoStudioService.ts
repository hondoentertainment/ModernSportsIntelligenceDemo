export interface PhotoSession {
  id: string;
  cardName: string;
  template: string;
  lightingPreset: string;
  backgroundColor: string;
  enhancementsApplied: string[];
  qualityScore: number;
  listingReady: boolean;
}

const mockSessions: PhotoSession[] = [
  { id: "ps-001", cardName: "2023 Topps Chrome Elly De La Cruz RC Auto", template: "Premium Showcase", lightingPreset: "Studio Soft", backgroundColor: "#1a1a2e", enhancementsApplied: ["color-correction", "edge-sharpening", "glare-removal"], qualityScore: 94, listingReady: true },
  { id: "ps-002", cardName: "1993 Upper Deck Derek Jeter SP Foil RC", template: "Vintage Spotlight", lightingPreset: "Warm Tungsten", backgroundColor: "#2d1810", enhancementsApplied: ["surface-detail-enhance", "scratch-minimization", "vintage-tone"], qualityScore: 88, listingReady: true },
  { id: "ps-003", cardName: "2024 Panini Prizm Caitlin Clark Silver", template: "Modern Clean", lightingPreset: "Daylight Balanced", backgroundColor: "#ffffff", enhancementsApplied: ["refractor-highlight", "color-correction"], qualityScore: 91, listingReady: true },
  { id: "ps-004", cardName: "1986 Fleer Michael Jordan RC Raw", template: "Centering Grid", lightingPreset: "Even Flat", backgroundColor: "#f0f0f0", enhancementsApplied: ["centering-overlay", "corner-zoom-insets", "surface-scan"], qualityScore: 72, listingReady: false },
  { id: "ps-005", cardName: "2020 Panini National Treasures Justin Herbert RPA /99", template: "Patch Focus", lightingPreset: "Angled Drama", backgroundColor: "#0a0a1a", enhancementsApplied: ["patch-color-pop", "auto-clarity", "serial-number-zoom"], qualityScore: 96, listingReady: true },
];

export function getSessions(): PhotoSession[] {
  return mockSessions;
}

export function getTemplates(): { name: string; description: string }[] {
  return [
    { name: "Premium Showcase", description: "High-end presentation for valuable modern cards" },
    { name: "Vintage Spotlight", description: "Warm tones highlighting patina and character" },
    { name: "Modern Clean", description: "Bright, minimal background for modern retail listings" },
    { name: "Centering Grid", description: "Technical overlay showing centering measurements" },
    { name: "Patch Focus", description: "Dramatic lighting emphasizing memorabilia patches" },
  ];
}

const photoStudioService = { getSessions, getTemplates };
export default photoStudioService;
