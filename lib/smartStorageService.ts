// Phase 142 – Smart Storage & Environmental IoT Dashboard Service
import { store } from './dal/syncStore';

// ---- Types ----

export type ProtectionLevel = 'standard' | 'enhanced' | 'premium' | 'vault';

export type AlertType = 'humidity_spike' | 'temp_fluctuation' | 'uv_exposure' | 'vibration' | 'power_loss' | 'door_open';

export type ZoneStatus = 'optimal' | 'warning' | 'critical';

export interface StorageZone {
  id: string;
  name: string;
  description: string;
  protectionLevel: ProtectionLevel;
  status: ZoneStatus;
  cardCount: number;
  totalValue: number;
  targetTemp: number;
  targetHumidity: number;
  maxUV: number;
  lastInspected: string;
}

export interface SensorReading {
  id: string;
  zoneId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  uvIndex: number;
  vibration: number;
}

export interface EnvironmentalAlert {
  id: string;
  zoneId: string;
  zoneName: string;
  type: AlertType;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  reading: number;
  threshold: number;
  recommendation: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface StorageUnit {
  id: string;
  name: string;
  zoneId: string;
  zoneName: string;
  type: 'slab_case' | 'raw_box' | 'binder' | 'safe' | 'display' | 'shipping_box';
  cardCount: number;
  totalValue: number;
  protectionLevel: ProtectionLevel;
  lastAccessed: string;
}

export interface ConditionScore {
  zoneId: string;
  zoneName: string;
  overall: number;
  temperature: number;
  humidity: number;
  uvProtection: number;
  vibrationControl: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface DamageRisk {
  zoneId: string;
  zoneName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  primaryFactor: string;
  estimatedLoss: number;
  timeToAction: string;
}

export interface InsuranceRequirement {
  id: string;
  zoneId: string;
  zoneName: string;
  requiredCoverage: number;
  currentCoverage: number;
  gap: number;
  monthlyPremium: number;
  recommendations: string[];
}

export interface MaintenanceTask {
  id: string;
  zoneId: string;
  zoneName: string;
  task: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  estimatedCost: number;
  completed: boolean;
}

export interface StorageAnalytics {
  totalZones: number;
  totalCards: number;
  totalValue: number;
  avgConditionScore: number;
  activeAlerts: number;
  maintenanceDue: number;
  insuranceCoverage: number;
  monthlyStorageCost: number;
}

export interface ClimateProfile {
  zoneId: string;
  zoneName: string;
  avgTemp24h: number;
  minTemp24h: number;
  maxTemp24h: number;
  avgHumidity24h: number;
  minHumidity24h: number;
  maxHumidity24h: number;
  avgUV24h: number;
  tempStability: number;
  humidityStability: number;
}

export interface StorageCost {
  zoneId: string;
  zoneName: string;
  monthlyRent: number;
  electricityCost: number;
  insuranceCost: number;
  maintenanceCost: number;
  totalMonthlyCost: number;
  costPerCard: number;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_smart_storage';

// ---- localStorage helpers ----

function loadData<T>(key: string): T | null {
  return store.has(`${STORAGE_KEY}_${key}`) ? store.get<T>(`${STORAGE_KEY}_${key}`, null as unknown as T) : null;
}

function saveData<T>(key: string, data: T): void {
  store.set(`${STORAGE_KEY}_${key}`, data);
}

// ---- Mock Data ----

const STORAGE_ZONES: StorageZone[] = [
  { id: 'zone_001', name: 'Main Vault', description: 'Climate-controlled vault for highest-value slabbed cards. HEPA filtration, 24/7 monitoring.', protectionLevel: 'vault', status: 'optimal', cardCount: 245, totalValue: 892000, targetTemp: 68, targetHumidity: 45, maxUV: 0, lastInspected: '2026-03-14' },
  { id: 'zone_002', name: 'Display Case', description: 'UV-filtered glass display for showcase pieces. Ambient room temperature with desiccant packs.', protectionLevel: 'enhanced', status: 'warning', cardCount: 32, totalValue: 185000, targetTemp: 72, targetHumidity: 50, maxUV: 2, lastInspected: '2026-03-12' },
  { id: 'zone_003', name: 'Graded Slab Shelf', description: 'Dedicated shelving with UV-blocking covers for PSA/BGS slabs awaiting sale or display rotation.', protectionLevel: 'premium', status: 'optimal', cardCount: 180, totalValue: 425000, targetTemp: 70, targetHumidity: 45, maxUV: 0.5, lastInspected: '2026-03-13' },
  { id: 'zone_004', name: 'Raw Card Cabinet', description: 'Fireproof cabinet with dehumidifier for ungraded cards in top-loaders and one-touches.', protectionLevel: 'enhanced', status: 'optimal', cardCount: 520, totalValue: 145000, targetTemp: 70, targetHumidity: 48, maxUV: 0, lastInspected: '2026-03-10' },
  { id: 'zone_005', name: 'Overflow Storage', description: 'Secondary closet storage for bulk and low-value inventory. Basic climate monitoring.', protectionLevel: 'standard', status: 'warning', cardCount: 1850, totalValue: 38000, targetTemp: 74, targetHumidity: 55, maxUV: 1, lastInspected: '2026-03-05' },
  { id: 'zone_006', name: 'Safe Deposit Box', description: 'Bank vault storage for ultra-premium cards. Access limited to banking hours.', protectionLevel: 'vault', status: 'optimal', cardCount: 18, totalValue: 620000, targetTemp: 67, targetHumidity: 40, maxUV: 0, lastInspected: '2026-03-01' },
  { id: 'zone_007', name: 'Travel Case', description: 'Padded, climate-controlled portable case for card show and meetup inventory.', protectionLevel: 'standard', status: 'optimal', cardCount: 45, totalValue: 28000, targetTemp: 72, targetHumidity: 50, maxUV: 3, lastInspected: '2026-03-11' },
  { id: 'zone_008', name: 'Incoming/Processing', description: 'Temporary staging area for newly purchased cards awaiting cataloging and permanent storage.', protectionLevel: 'standard', status: 'warning', cardCount: 65, totalValue: 42000, targetTemp: 73, targetHumidity: 52, maxUV: 2, lastInspected: '2026-03-14' },
];

function generateSensorReadings(): SensorReading[] {
  const readings: SensorReading[] = [];
  const now = new Date('2026-03-15T12:00:00');
  let id = 1;

  STORAGE_ZONES.forEach(zone => {
    for (let h = 0; h < 24; h++) {
      const ts = new Date(now.getTime() - h * 3600000);
      const hourSeed = (zone.id.charCodeAt(5) * 31 + h * 7) % 100;
      const tempBase = zone.targetTemp;
      const humBase = zone.targetHumidity;

      let tempVariance = 0;
      let humVariance = 0;
      let uvBase = 0;
      let vibBase = 0;

      if (zone.protectionLevel === 'vault') {
        tempVariance = (hourSeed % 5 - 2) * 0.3;
        humVariance = (hourSeed % 7 - 3) * 0.5;
        uvBase = 0;
        vibBase = (hourSeed % 3) * 0.1;
      } else if (zone.protectionLevel === 'premium') {
        tempVariance = (hourSeed % 7 - 3) * 0.5;
        humVariance = (hourSeed % 9 - 4) * 0.8;
        uvBase = (hourSeed % 3) * 0.2;
        vibBase = (hourSeed % 5) * 0.15;
      } else if (zone.protectionLevel === 'enhanced') {
        tempVariance = (hourSeed % 9 - 4) * 0.8;
        humVariance = (hourSeed % 11 - 5) * 1.2;
        uvBase = h >= 8 && h <= 18 ? (hourSeed % 5) * 0.5 : 0;
        vibBase = (hourSeed % 7) * 0.2;
      } else {
        tempVariance = (hourSeed % 13 - 6) * 1.2;
        humVariance = (hourSeed % 15 - 7) * 1.8;
        uvBase = h >= 7 && h <= 19 ? (hourSeed % 8) * 0.6 : 0;
        vibBase = (hourSeed % 10) * 0.3;
      }

      readings.push({
        id: `sr_${String(id++).padStart(4, '0')}`,
        zoneId: zone.id,
        timestamp: ts.toISOString(),
        temperature: Math.round((tempBase + tempVariance) * 10) / 10,
        humidity: Math.round((humBase + humVariance) * 10) / 10,
        uvIndex: Math.round(uvBase * 10) / 10,
        vibration: Math.round(vibBase * 100) / 100,
      });
    }
  });

  return readings;
}

const SENSOR_READINGS = generateSensorReadings();

const ENVIRONMENTAL_ALERTS: EnvironmentalAlert[] = [
  { id: 'ea_001', zoneId: 'zone_002', zoneName: 'Display Case', type: 'uv_exposure', severity: 'warning', message: 'UV index exceeded threshold during afternoon sun exposure', reading: 4.2, threshold: 2.0, recommendation: 'Close UV-blocking curtains or rotate cards out of direct light path', timestamp: '2026-03-15T14:30:00', acknowledged: false },
  { id: 'ea_002', zoneId: 'zone_005', zoneName: 'Overflow Storage', type: 'humidity_spike', severity: 'warning', message: 'Humidity rose to 68% following recent rainfall — exceeds 55% target', reading: 68, threshold: 55, recommendation: 'Run dehumidifier and check door seals for moisture ingress', timestamp: '2026-03-15T09:15:00', acknowledged: false },
  { id: 'ea_003', zoneId: 'zone_008', zoneName: 'Incoming/Processing', type: 'temp_fluctuation', severity: 'info', message: 'Temperature fluctuated 5 degrees in 2 hours during package processing', reading: 78, threshold: 75, recommendation: 'Limit door open time and process incoming shipments in batches', timestamp: '2026-03-15T11:00:00', acknowledged: true },
  { id: 'ea_004', zoneId: 'zone_005', zoneName: 'Overflow Storage', type: 'temp_fluctuation', severity: 'warning', message: 'Temperature reached 79F due to HVAC cycling issue in storage closet', reading: 79, threshold: 76, recommendation: 'Have HVAC technician inspect duct routing to closet area', timestamp: '2026-03-14T16:45:00', acknowledged: false },
  { id: 'ea_005', zoneId: 'zone_007', zoneName: 'Travel Case', type: 'vibration', severity: 'info', message: 'Elevated vibration detected during last transport event', reading: 2.8, threshold: 2.0, recommendation: 'Add additional padding inserts to travel case inner compartments', timestamp: '2026-03-14T10:20:00', acknowledged: true },
  { id: 'ea_006', zoneId: 'zone_002', zoneName: 'Display Case', type: 'humidity_spike', severity: 'warning', message: 'Humidity reached 62% as desiccant packs need replacement', reading: 62, threshold: 55, recommendation: 'Replace silica gel desiccant packs — schedule monthly rotation', timestamp: '2026-03-13T08:30:00', acknowledged: false },
  { id: 'ea_007', zoneId: 'zone_001', zoneName: 'Main Vault', type: 'power_loss', severity: 'critical', message: 'Brief power interruption detected — backup generator activated within 4 seconds', reading: 4, threshold: 0, recommendation: 'Verify UPS battery health and test monthly failover procedure', timestamp: '2026-03-12T03:15:00', acknowledged: true },
  { id: 'ea_008', zoneId: 'zone_008', zoneName: 'Incoming/Processing', type: 'door_open', severity: 'info', message: 'Processing area door left open for 45 minutes during inventory intake', reading: 45, threshold: 15, recommendation: 'Install auto-close mechanism or set timer alerts for door sensor', timestamp: '2026-03-11T14:00:00', acknowledged: true },
  { id: 'ea_009', zoneId: 'zone_004', zoneName: 'Raw Card Cabinet', type: 'humidity_spike', severity: 'info', message: 'Slight humidity increase to 52% after cabinet was opened for sorting session', reading: 52, threshold: 50, recommendation: 'Allow dehumidifier 30 minutes to normalize after extended open sessions', timestamp: '2026-03-10T17:30:00', acknowledged: true },
  { id: 'ea_010', zoneId: 'zone_005', zoneName: 'Overflow Storage', type: 'uv_exposure', severity: 'warning', message: 'UV light detected from uncovered overhead fluorescent fixture', reading: 3.5, threshold: 1.0, recommendation: 'Install UV-blocking sleeves on fluorescent bulbs or switch to LED', timestamp: '2026-03-09T12:00:00', acknowledged: false },
];

const STORAGE_UNITS: StorageUnit[] = [
  { id: 'su_001', name: 'PSA Slab Case A', zoneId: 'zone_001', zoneName: 'Main Vault', type: 'slab_case', cardCount: 80, totalValue: 385000, protectionLevel: 'vault', lastAccessed: '2026-03-14' },
  { id: 'su_002', name: 'PSA Slab Case B', zoneId: 'zone_001', zoneName: 'Main Vault', type: 'slab_case', cardCount: 75, totalValue: 280000, protectionLevel: 'vault', lastAccessed: '2026-03-13' },
  { id: 'su_003', name: 'BGS Slab Case', zoneId: 'zone_001', zoneName: 'Main Vault', type: 'slab_case', cardCount: 55, totalValue: 165000, protectionLevel: 'vault', lastAccessed: '2026-03-12' },
  { id: 'su_004', name: 'SGC Vintage Slabs', zoneId: 'zone_001', zoneName: 'Main Vault', type: 'slab_case', cardCount: 35, totalValue: 62000, protectionLevel: 'vault', lastAccessed: '2026-03-10' },
  { id: 'su_005', name: 'Showcase Display Row', zoneId: 'zone_002', zoneName: 'Display Case', type: 'display', cardCount: 32, totalValue: 185000, protectionLevel: 'enhanced', lastAccessed: '2026-03-14' },
  { id: 'su_006', name: 'Graded Shelf Top', zoneId: 'zone_003', zoneName: 'Graded Slab Shelf', type: 'slab_case', cardCount: 90, totalValue: 225000, protectionLevel: 'premium', lastAccessed: '2026-03-13' },
  { id: 'su_007', name: 'Graded Shelf Bottom', zoneId: 'zone_003', zoneName: 'Graded Slab Shelf', type: 'slab_case', cardCount: 90, totalValue: 200000, protectionLevel: 'premium', lastAccessed: '2026-03-12' },
  { id: 'su_008', name: 'Top Loader Box 1', zoneId: 'zone_004', zoneName: 'Raw Card Cabinet', type: 'raw_box', cardCount: 200, totalValue: 68000, protectionLevel: 'enhanced', lastAccessed: '2026-03-11' },
  { id: 'su_009', name: 'One-Touch Box', zoneId: 'zone_004', zoneName: 'Raw Card Cabinet', type: 'raw_box', cardCount: 120, totalValue: 42000, protectionLevel: 'enhanced', lastAccessed: '2026-03-10' },
  { id: 'su_010', name: 'Binder Collection', zoneId: 'zone_004', zoneName: 'Raw Card Cabinet', type: 'binder', cardCount: 200, totalValue: 35000, protectionLevel: 'enhanced', lastAccessed: '2026-03-08' },
  { id: 'su_011', name: 'Bulk Commons Box A', zoneId: 'zone_005', zoneName: 'Overflow Storage', type: 'raw_box', cardCount: 800, totalValue: 12000, protectionLevel: 'standard', lastAccessed: '2026-02-28' },
  { id: 'su_012', name: 'Bulk Commons Box B', zoneId: 'zone_005', zoneName: 'Overflow Storage', type: 'raw_box', cardCount: 650, totalValue: 9500, protectionLevel: 'standard', lastAccessed: '2026-02-25' },
  { id: 'su_013', name: 'Bulk Lot Box C', zoneId: 'zone_005', zoneName: 'Overflow Storage', type: 'shipping_box', cardCount: 400, totalValue: 16500, protectionLevel: 'standard', lastAccessed: '2026-03-01' },
  { id: 'su_014', name: 'Bank Safe Deposit', zoneId: 'zone_006', zoneName: 'Safe Deposit Box', type: 'safe', cardCount: 18, totalValue: 620000, protectionLevel: 'vault', lastAccessed: '2026-03-01' },
  { id: 'su_015', name: 'Show Travel Kit', zoneId: 'zone_007', zoneName: 'Travel Case', type: 'slab_case', cardCount: 45, totalValue: 28000, protectionLevel: 'standard', lastAccessed: '2026-03-11' },
];

const MAINTENANCE_TASKS: MaintenanceTask[] = [
  { id: 'mt_001', zoneId: 'zone_001', zoneName: 'Main Vault', task: 'Replace HEPA filter in climate control unit', priority: 'medium', dueDate: '2026-03-20', estimatedCost: 85, completed: false },
  { id: 'mt_002', zoneId: 'zone_002', zoneName: 'Display Case', task: 'Replace silica gel desiccant packs (4x)', priority: 'high', dueDate: '2026-03-16', estimatedCost: 12, completed: false },
  { id: 'mt_003', zoneId: 'zone_001', zoneName: 'Main Vault', task: 'Calibrate temperature and humidity sensors', priority: 'medium', dueDate: '2026-03-25', estimatedCost: 150, completed: false },
  { id: 'mt_004', zoneId: 'zone_005', zoneName: 'Overflow Storage', task: 'Install UV-blocking sleeves on fluorescent fixtures', priority: 'high', dueDate: '2026-03-18', estimatedCost: 35, completed: false },
  { id: 'mt_005', zoneId: 'zone_004', zoneName: 'Raw Card Cabinet', task: 'Service portable dehumidifier — clean reservoir', priority: 'low', dueDate: '2026-04-01', estimatedCost: 0, completed: false },
  { id: 'mt_006', zoneId: 'zone_005', zoneName: 'Overflow Storage', task: 'Have HVAC technician inspect ductwork routing', priority: 'high', dueDate: '2026-03-22', estimatedCost: 200, completed: false },
];

const OPTIMAL_CONDITIONS = {
  temperature: { min: 65, max: 72, ideal: 68, unit: 'F' },
  humidity: { min: 35, max: 55, ideal: 45, unit: '%' },
  uvIndex: { max: 0.5, ideal: 0, unit: 'UV Index' },
  vibration: { max: 0.5, ideal: 0, unit: 'g' },
};

// ---- Config Helpers ----

const ALERT_TYPE_CONFIG: Record<AlertType, { label: string; text: string; bg: string; border: string }> = {
  humidity_spike: { label: 'Humidity Spike', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  temp_fluctuation: { label: 'Temp Fluctuation', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  uv_exposure: { label: 'UV Exposure', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  vibration: { label: 'Vibration', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  power_loss: { label: 'Power Loss', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  door_open: { label: 'Door Open', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
};

const SEVERITY_CONFIG: Record<string, { label: string; text: string; bg: string; border: string }> = {
  info: { label: 'Info', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  warning: { label: 'Warning', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  critical: { label: 'Critical', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const PROTECTION_CONFIG: Record<ProtectionLevel, { label: string; text: string; bg: string; border: string }> = {
  standard: { label: 'Standard', text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  enhanced: { label: 'Enhanced', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  premium: { label: 'Premium', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  vault: { label: 'Vault', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
};

const STATUS_CONFIG: Record<ZoneStatus, { label: string; text: string; bg: string; border: string }> = {
  optimal: { label: 'Optimal', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  warning: { label: 'Warning', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  critical: { label: 'Critical', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

// ---- Public API ----

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function getAlertConfig(type: AlertType): { label: string; text: string; bg: string; border: string } {
  return ALERT_TYPE_CONFIG[type];
}

export function getSeverityConfig(severity: string): { label: string; text: string; bg: string; border: string } {
  return SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG['info'];
}

export function getProtectionConfig(level: ProtectionLevel): { label: string; text: string; bg: string; border: string } {
  return PROTECTION_CONFIG[level];
}

export function getStatusConfig(status: ZoneStatus): { label: string; text: string; bg: string; border: string } {
  return STATUS_CONFIG[status];
}

export function getStorageZones(): StorageZone[] {
  const cached = loadData<StorageZone[]>('zones');
  if (cached) return cached;
  saveData('zones', STORAGE_ZONES);
  return STORAGE_ZONES;
}

export function getSensorReadings(zoneId?: string, hours?: number): SensorReading[] {
  const cacheKey = `readings_${zoneId ?? 'all'}_${hours ?? 24}`;
  const cached = loadData<SensorReading[]>(cacheKey);
  if (cached) return cached;

  let results = SENSOR_READINGS;
  if (zoneId) results = results.filter(r => r.zoneId === zoneId);
  if (hours && hours < 24) {
    const cutoff = new Date(new Date('2026-03-15T12:00:00').getTime() - hours * 3600000);
    results = results.filter(r => new Date(r.timestamp) >= cutoff);
  }

  saveData(cacheKey, results);
  return results;
}

export function getEnvironmentalAlerts(): EnvironmentalAlert[] {
  const cached = loadData<EnvironmentalAlert[]>('env_alerts');
  if (cached) return cached;
  saveData('env_alerts', ENVIRONMENTAL_ALERTS);
  return ENVIRONMENTAL_ALERTS;
}

export function getStorageUnits(): StorageUnit[] {
  const cached = loadData<StorageUnit[]>('units');
  if (cached) return cached;
  saveData('units', STORAGE_UNITS);
  return STORAGE_UNITS;
}

export function getConditionScores(): ConditionScore[] {
  const cacheKey = 'condition_scores';
  const cached = loadData<ConditionScore[]>(cacheKey);
  if (cached) return cached;

  const scores: ConditionScore[] = STORAGE_ZONES.map(zone => {
    const zoneReadings = SENSOR_READINGS.filter(r => r.zoneId === zone.id);
    if (zoneReadings.length === 0) {
      return { zoneId: zone.id, zoneName: zone.name, overall: 50, temperature: 50, humidity: 50, uvProtection: 50, vibrationControl: 50, trend: 'stable' as const };
    }

    const avgTemp = zoneReadings.reduce((s, r) => s + r.temperature, 0) / zoneReadings.length;
    const avgHum = zoneReadings.reduce((s, r) => s + r.humidity, 0) / zoneReadings.length;
    const avgUV = zoneReadings.reduce((s, r) => s + r.uvIndex, 0) / zoneReadings.length;
    const avgVib = zoneReadings.reduce((s, r) => s + r.vibration, 0) / zoneReadings.length;

    const tempScore = Math.max(0, 100 - Math.abs(avgTemp - zone.targetTemp) * 8);
    const humScore = Math.max(0, 100 - Math.abs(avgHum - zone.targetHumidity) * 5);
    const uvScore = Math.max(0, 100 - avgUV * 25);
    const vibScore = Math.max(0, 100 - avgVib * 40);

    const overall = Math.round((tempScore * 0.3 + humScore * 0.3 + uvScore * 0.25 + vibScore * 0.15));
    const trend = overall >= 85 ? 'improving' as const : overall >= 65 ? 'stable' as const : 'declining' as const;

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      overall: Math.round(overall),
      temperature: Math.round(tempScore),
      humidity: Math.round(humScore),
      uvProtection: Math.round(uvScore),
      vibrationControl: Math.round(vibScore),
      trend,
    };
  });

  saveData(cacheKey, scores);
  return scores;
}

export function getDamageRiskAssessment(): DamageRisk[] {
  const cacheKey = 'damage_risk';
  const cached = loadData<DamageRisk[]>(cacheKey);
  if (cached) return cached;

  const scores = getConditionScores();
  const risks: DamageRisk[] = STORAGE_ZONES.map(zone => {
    const score = scores.find(s => s.zoneId === zone.id);
    const riskScore = score ? 100 - score.overall : 50;
    const riskLevel: DamageRisk['riskLevel'] = riskScore <= 15 ? 'low' : riskScore <= 30 ? 'medium' : riskScore <= 50 ? 'high' : 'critical';

    let primaryFactor = 'General environment';
    if (score) {
      const min = Math.min(score.temperature, score.humidity, score.uvProtection, score.vibrationControl);
      if (min === score.temperature) primaryFactor = 'Temperature instability';
      else if (min === score.humidity) primaryFactor = 'Humidity control';
      else if (min === score.uvProtection) primaryFactor = 'UV light exposure';
      else primaryFactor = 'Vibration / physical impact';
    }

    const estimatedLoss = Math.round(zone.totalValue * (riskScore / 100) * 0.05);
    const timeToAction = riskLevel === 'critical' ? 'Immediate' : riskLevel === 'high' ? '1-3 days' : riskLevel === 'medium' ? '1-2 weeks' : '30+ days';

    return { zoneId: zone.id, zoneName: zone.name, riskLevel, riskScore, primaryFactor, estimatedLoss, timeToAction };
  });

  saveData(cacheKey, risks);
  return risks;
}

export function getInsuranceRequirements(): InsuranceRequirement[] {
  const cacheKey = 'insurance';
  const cached = loadData<InsuranceRequirement[]>(cacheKey);
  if (cached) return cached;

  const requirements: InsuranceRequirement[] = STORAGE_ZONES.map(zone => {
    const required = zone.totalValue;
    const coverageRatio = zone.protectionLevel === 'vault' ? 0.95 : zone.protectionLevel === 'premium' ? 0.85 : zone.protectionLevel === 'enhanced' ? 0.7 : 0.5;
    const current = Math.round(required * coverageRatio);
    const gap = required - current;
    const monthlyPremium = Math.round(required * 0.001 / 12);
    const recs: string[] = [];
    if (gap > 0) recs.push(`Increase coverage by ${formatCurrency(gap)} to fully protect this zone`);
    if (zone.protectionLevel === 'standard') recs.push('Upgrade protection level to reduce premium rates');
    if (zone.protectionLevel !== 'vault') recs.push('Consider vault storage for cards over $5,000');

    return { id: `ins_${zone.id}`, zoneId: zone.id, zoneName: zone.name, requiredCoverage: required, currentCoverage: current, gap, monthlyPremium, recommendations: recs };
  });

  saveData(cacheKey, requirements);
  return requirements;
}

export function getMaintenanceTasks(): MaintenanceTask[] {
  const cached = loadData<MaintenanceTask[]>('maintenance');
  if (cached) return cached;
  saveData('maintenance', MAINTENANCE_TASKS);
  return MAINTENANCE_TASKS;
}

export function getStorageAnalytics(): StorageAnalytics {
  const cached = loadData<StorageAnalytics>('analytics');
  if (cached) return cached;

  const zones = STORAGE_ZONES;
  const scores = getConditionScores();
  const alerts = ENVIRONMENTAL_ALERTS.filter(a => !a.acknowledged);
  const maintenance = MAINTENANCE_TASKS.filter(t => !t.completed);
  const insurance = getInsuranceRequirements();
  const costs = getStorageCosts();

  const analytics: StorageAnalytics = {
    totalZones: zones.length,
    totalCards: zones.reduce((s, z) => s + z.cardCount, 0),
    totalValue: zones.reduce((s, z) => s + z.totalValue, 0),
    avgConditionScore: Math.round(scores.reduce((s, c) => s + c.overall, 0) / scores.length),
    activeAlerts: alerts.length,
    maintenanceDue: maintenance.length,
    insuranceCoverage: Math.round(insurance.reduce((s, i) => s + i.currentCoverage, 0) / Math.max(1, insurance.reduce((s, i) => s + i.requiredCoverage, 0)) * 100),
    monthlyStorageCost: costs.reduce((s, c) => s + c.totalMonthlyCost, 0),
  };

  saveData('analytics', analytics);
  return analytics;
}

export function getClimateProfile(zoneId: string): ClimateProfile {
  const cacheKey = `climate_${zoneId}`;
  const cached = loadData<ClimateProfile>(cacheKey);
  if (cached) return cached;

  const zone = STORAGE_ZONES.find(z => z.id === zoneId) ?? STORAGE_ZONES[0];
  const readings = SENSOR_READINGS.filter(r => r.zoneId === zoneId);

  const temps = readings.map(r => r.temperature);
  const hums = readings.map(r => r.humidity);
  const uvs = readings.map(r => r.uvIndex);

  const profile: ClimateProfile = {
    zoneId,
    zoneName: zone.name,
    avgTemp24h: Math.round(temps.reduce((s, t) => s + t, 0) / Math.max(1, temps.length) * 10) / 10,
    minTemp24h: temps.length > 0 ? Math.min(...temps) : 0,
    maxTemp24h: temps.length > 0 ? Math.max(...temps) : 0,
    avgHumidity24h: Math.round(hums.reduce((s, h) => s + h, 0) / Math.max(1, hums.length) * 10) / 10,
    minHumidity24h: hums.length > 0 ? Math.min(...hums) : 0,
    maxHumidity24h: hums.length > 0 ? Math.max(...hums) : 0,
    avgUV24h: Math.round(uvs.reduce((s, u) => s + u, 0) / Math.max(1, uvs.length) * 100) / 100,
    tempStability: temps.length > 0 ? Math.round((1 - (Math.max(...temps) - Math.min(...temps)) / 20) * 100) : 50,
    humidityStability: hums.length > 0 ? Math.round((1 - (Math.max(...hums) - Math.min(...hums)) / 40) * 100) : 50,
  };

  saveData(cacheKey, profile);
  return profile;
}

export function getStorageCosts(): StorageCost[] {
  const cacheKey = 'costs';
  const cached = loadData<StorageCost[]>(cacheKey);
  if (cached) return cached;

  const costs: StorageCost[] = STORAGE_ZONES.map(zone => {
    let monthlyRent = 0;
    let electricityCost = 0;
    const insuranceCost = Math.round(zone.totalValue * 0.001 / 12);
    let maintenanceCost = 0;

    if (zone.protectionLevel === 'vault') {
      monthlyRent = zone.id === 'zone_006' ? 45 : 185;
      electricityCost = zone.id === 'zone_006' ? 0 : 65;
      maintenanceCost = 25;
    } else if (zone.protectionLevel === 'premium') {
      monthlyRent = 0;
      electricityCost = 35;
      maintenanceCost = 15;
    } else if (zone.protectionLevel === 'enhanced') {
      monthlyRent = 0;
      electricityCost = 15;
      maintenanceCost = 10;
    } else {
      monthlyRent = 0;
      electricityCost = 5;
      maintenanceCost = 5;
    }

    const totalMonthlyCost = monthlyRent + electricityCost + insuranceCost + maintenanceCost;
    const costPerCard = zone.cardCount > 0 ? Math.round(totalMonthlyCost / zone.cardCount * 100) / 100 : 0;

    return { zoneId: zone.id, zoneName: zone.name, monthlyRent, electricityCost, insuranceCost, maintenanceCost, totalMonthlyCost, costPerCard };
  });

  saveData(cacheKey, costs);
  return costs;
}

export function getProtectionLevel(zoneId: string): ProtectionLevel {
  const zone = STORAGE_ZONES.find(z => z.id === zoneId);
  return zone?.protectionLevel ?? 'standard';
}

export function getOptimalConditions(): typeof OPTIMAL_CONDITIONS {
  return OPTIMAL_CONDITIONS;
}

export function calculateDamageRisk(temp: number, humidity: number, uv: number): { riskScore: number; riskLevel: DamageRisk['riskLevel']; factors: string[] } {
  let riskScore = 0;
  const factors: string[] = [];

  const tempDelta = Math.abs(temp - OPTIMAL_CONDITIONS.temperature.ideal);
  if (tempDelta > 15) { riskScore += 40; factors.push('Temperature far from optimal'); }
  else if (tempDelta > 8) { riskScore += 25; factors.push('Temperature outside ideal range'); }
  else if (tempDelta > 4) { riskScore += 10; factors.push('Temperature slightly elevated'); }

  const humDelta = Math.abs(humidity - OPTIMAL_CONDITIONS.humidity.ideal);
  if (humDelta > 25) { riskScore += 40; factors.push('Humidity dangerously out of range'); }
  else if (humDelta > 15) { riskScore += 25; factors.push('Humidity outside safe range'); }
  else if (humDelta > 8) { riskScore += 10; factors.push('Humidity slightly off target'); }

  if (uv > 5) { riskScore += 30; factors.push('Severe UV exposure'); }
  else if (uv > 2) { riskScore += 20; factors.push('Moderate UV exposure'); }
  else if (uv > 0.5) { riskScore += 8; factors.push('Minor UV exposure'); }

  const riskLevel: DamageRisk['riskLevel'] = riskScore <= 15 ? 'low' : riskScore <= 35 ? 'medium' : riskScore <= 60 ? 'high' : 'critical';

  return { riskScore: Math.min(100, riskScore), riskLevel, factors };
}
