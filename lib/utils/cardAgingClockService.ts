// Card Aging Clock Service — age analysis and material degradation tracking

export interface AgingAnalysis {
  id: string;
  cardName: string;
  year: number;
  currentAge: number;
  grade: string;
  materialType: string;
  degradationRate: number;
  projectedGrade5yr: string;
  projectedGrade10yr: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  storageQuality: string;
  lastInspection: string;
}

export interface MaterialReport {
  id: string;
  cardName: string;
  paperStock: string;
  coatingType: string;
  inkStability: number;
  surfaceIntegrity: number;
  cornerDurability: number;
  yellowing: number;
  brittleness: number;
  overallHealth: number;
  recommendation: string;
}

export function getAnalyses(): AgingAnalysis[] {
  return [
    { id: 'aa-1', cardName: '1952 Topps Mickey Mantle #311', year: 1952, currentAge: 74, grade: 'SGC 5', materialType: 'Vintage Cardboard', degradationRate: 0.8, projectedGrade5yr: 'SGC 4.5', projectedGrade10yr: 'SGC 4', riskLevel: 'moderate', storageQuality: 'Climate-controlled vault', lastInspection: '2026-03-01' },
    { id: 'aa-2', cardName: '1986 Fleer Michael Jordan RC #57', year: 1986, currentAge: 40, grade: 'PSA 9', materialType: 'Standard Card Stock', degradationRate: 0.3, projectedGrade5yr: 'PSA 9', projectedGrade10yr: 'PSA 8.5', riskLevel: 'low', storageQuality: 'Graded slab', lastInspection: '2026-02-15' },
    { id: 'aa-3', cardName: '2003 Topps Chrome LeBron James RC', year: 2003, currentAge: 23, grade: 'PSA 10', materialType: 'Chromium', degradationRate: 0.1, projectedGrade5yr: 'PSA 10', projectedGrade10yr: 'PSA 10', riskLevel: 'low', storageQuality: 'Graded slab', lastInspection: '2026-03-10' },
    { id: 'aa-4', cardName: '1909 T206 Honus Wagner', year: 1909, currentAge: 117, grade: 'PSA 2', materialType: 'Tobacco Card Stock', degradationRate: 1.2, projectedGrade5yr: 'PSA 1.5', projectedGrade10yr: 'PSA 1', riskLevel: 'critical', storageQuality: 'Museum-grade enclosure', lastInspection: '2026-01-20' },
    { id: 'aa-5', cardName: '1979 O-Pee-Chee Wayne Gretzky RC', year: 1979, currentAge: 47, grade: 'PSA 7', materialType: 'Canadian Card Stock', degradationRate: 0.5, projectedGrade5yr: 'PSA 6.5', projectedGrade10yr: 'PSA 6', riskLevel: 'moderate', storageQuality: 'Toploader', lastInspection: '2026-02-28' },
  ];
}

export function getMaterialReports(): MaterialReport[] {
  return [
    { id: 'mr-1', cardName: '1952 Topps Mickey Mantle #311', paperStock: 'Gray-back cardboard', coatingType: 'None', inkStability: 62, surfaceIntegrity: 58, cornerDurability: 45, yellowing: 38, brittleness: 42, overallHealth: 49, recommendation: 'Maintain current vault storage. Avoid any handling.' },
    { id: 'mr-2', cardName: '1986 Fleer Michael Jordan RC #57', paperStock: 'White card stock', coatingType: 'Light gloss', inkStability: 88, surfaceIntegrity: 85, cornerDurability: 82, yellowing: 91, brittleness: 87, overallHealth: 87, recommendation: 'Excellent condition. Slab provides adequate protection.' },
    { id: 'mr-3', cardName: '2003 Topps Chrome LeBron James RC', paperStock: 'Chromium refractor', coatingType: 'Chrome finish', inkStability: 96, surfaceIntegrity: 98, cornerDurability: 95, yellowing: 99, brittleness: 97, overallHealth: 97, recommendation: 'Chrome stock highly durable. No action needed.' },
    { id: 'mr-4', cardName: '1909 T206 Honus Wagner', paperStock: 'Tobacco-era paper', coatingType: 'None', inkStability: 31, surfaceIntegrity: 28, cornerDurability: 22, yellowing: 18, brittleness: 25, overallHealth: 25, recommendation: 'Critical: minimize all light exposure and handling.' },
    { id: 'mr-5', cardName: '1979 O-Pee-Chee Wayne Gretzky RC', paperStock: 'Canadian card stock', coatingType: 'Matte', inkStability: 72, surfaceIntegrity: 68, cornerDurability: 64, yellowing: 70, brittleness: 66, overallHealth: 68, recommendation: 'Consider upgrading to climate-controlled storage.' },
  ];
}
