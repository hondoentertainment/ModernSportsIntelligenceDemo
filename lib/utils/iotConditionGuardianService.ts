// @ts-nocheck
// Environmental IoT Condition Guardian Service
// Smart sensor monitoring for card storage condition protection

import { store } from '../dal/syncStore';

// ---- Types ----

export type SensorType = 'temperature' | 'humidity' | 'uv' | 'vibration' | 'combo';
export type SensorStatus = 'online' | 'offline' | 'warning';
export type RiskLevel = 'safe' | 'caution' | 'danger';
export type AlertType = 'temp-high' | 'temp-low' | 'humidity-high' | 'humidity-low' | 'uv-exposure' | 'vibration' | 'device-offline';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface SensorDevice {
  id: string;
  name: string;
  location: string;
  type: SensorType;
  status: SensorStatus;
  batteryLevel: number;
  lastReading: string;
  firmwareVersion: string;
}

export interface SensorReading {
  id: string;
  deviceId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  uvIndex: number;
  vibrationLevel: number;
}

export interface EnvironmentZone {
  id: string;
  name: string;
  description: string;
  sensors: string[];
  cardCount: number;
  totalValue: number;
  healthScore: number;
  riskLevel: RiskLevel;
}

export interface ConditionAlert {
  id: string;
  deviceId: string;
  zoneName: string;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface GuardianStats {
  totalSensors: number;
  onlineSensors: number;
  totalZones: number;
  activeAlerts: number;
  avgHealthScore: number;
  cardsProtected: number;
}

// ---- Constants ----

export const OPTIMAL_TEMP_MIN = 65;
export const OPTIMAL_TEMP_MAX = 72;
export const OPTIMAL_HUMIDITY_MIN = 45;
export const OPTIMAL_HUMIDITY_MAX = 55;
export const MAX_UV_INDEX = 2.0;
export const MAX_VIBRATION = 0.5;

const STORAGE_KEY = 'msi_iot_guardian';

// ---- localStorage helpers ----

function loadData<T>(key: string): T | null {
  return store.has(`${STORAGE_KEY}_${key}`) ? store.get<T>(`${STORAGE_KEY}_${key}`, null as unknown as T) : null;
}

function saveData<T>(key: string, data: T): void {
  store.set(`${STORAGE_KEY}_${key}`, data);
}

// ---- Mock Data ----

const SENSOR_DEVICES: SensorDevice[] = [
  {
    id: 'sen_001',
    name: 'Vault Primary TH',
    location: 'Main Vault - Center',
    type: 'combo',
    status: 'online',
    batteryLevel: 94,
    lastReading: '2026-03-16T14:32:00Z',
    firmwareVersion: '3.2.1',
  },
  {
    id: 'sen_002',
    name: 'Vault UV Monitor',
    location: 'Main Vault - Ceiling',
    type: 'uv',
    status: 'online',
    batteryLevel: 87,
    lastReading: '2026-03-16T14:31:00Z',
    firmwareVersion: '3.2.1',
  },
  {
    id: 'sen_003',
    name: 'Display Temp Sensor',
    location: 'Display Case - Left',
    type: 'temperature',
    status: 'warning',
    batteryLevel: 23,
    lastReading: '2026-03-16T14:28:00Z',
    firmwareVersion: '3.1.0',
  },
  {
    id: 'sen_004',
    name: 'Display Humidity',
    location: 'Display Case - Right',
    type: 'humidity',
    status: 'online',
    batteryLevel: 78,
    lastReading: '2026-03-16T14:30:00Z',
    firmwareVersion: '3.2.1',
  },
  {
    id: 'sen_005',
    name: 'Shipping Vibration',
    location: 'Shipping Area - Staging',
    type: 'vibration',
    status: 'online',
    batteryLevel: 65,
    lastReading: '2026-03-16T14:33:00Z',
    firmwareVersion: '3.2.0',
  },
  {
    id: 'sen_006',
    name: 'Shipping Combo',
    location: 'Shipping Area - Dock',
    type: 'combo',
    status: 'offline',
    batteryLevel: 0,
    lastReading: '2026-03-16T08:15:00Z',
    firmwareVersion: '2.9.4',
  },
  {
    id: 'sen_007',
    name: 'Climate Room Primary',
    location: 'Climate Room - North',
    type: 'combo',
    status: 'online',
    batteryLevel: 99,
    lastReading: '2026-03-16T14:33:00Z',
    firmwareVersion: '3.2.1',
  },
  {
    id: 'sen_008',
    name: 'Climate Room UV',
    location: 'Climate Room - South',
    type: 'uv',
    status: 'online',
    batteryLevel: 91,
    lastReading: '2026-03-16T14:32:00Z',
    firmwareVersion: '3.2.1',
  },
];

const ENVIRONMENT_ZONES: EnvironmentZone[] = [
  {
    id: 'zone_001',
    name: 'Main Vault',
    description: 'Primary secured storage for high-value graded cards and sealed products',
    sensors: ['sen_001', 'sen_002'],
    cardCount: 1247,
    totalValue: 892450,
    healthScore: 96,
    riskLevel: 'safe',
  },
  {
    id: 'zone_002',
    name: 'Display Case',
    description: 'Glass-front display for premium showcase cards with visitor access',
    sensors: ['sen_003', 'sen_004'],
    cardCount: 84,
    totalValue: 156200,
    healthScore: 72,
    riskLevel: 'caution',
  },
  {
    id: 'zone_003',
    name: 'Shipping Area',
    description: 'Staging area for outbound shipments and incoming acquisitions',
    sensors: ['sen_005', 'sen_006'],
    cardCount: 35,
    totalValue: 28750,
    healthScore: 48,
    riskLevel: 'danger',
  },
  {
    id: 'zone_004',
    name: 'Climate Room',
    description: 'Temperature-controlled archive for vintage and ultra-rare cards',
    sensors: ['sen_007', 'sen_008'],
    cardCount: 312,
    totalValue: 1245800,
    healthScore: 99,
    riskLevel: 'safe',
  },
];

function generateReadings(): SensorReading[] {
  const readings: SensorReading[] = [];
  const baseTime = new Date('2026-03-16T14:00:00Z');
  const deviceIds = SENSOR_DEVICES.map(d => d.id);
  let readingId = 1;

  for (let hour = 0; hour < 6; hour++) {
    for (const deviceId of deviceIds) {
      const ts = new Date(baseTime.getTime() - hour * 3600000);
      const isShipping = deviceId === 'sen_005' || deviceId === 'sen_006';
      const isDisplay = deviceId === 'sen_003' || deviceId === 'sen_004';
      const isClimate = deviceId === 'sen_007' || deviceId === 'sen_008';

      let temp = 68 + Math.sin(hour * 0.5) * 1.5;
      let hum = 50 + Math.cos(hour * 0.3) * 2;
      let uv = 0.3 + Math.sin(hour * 0.8) * 0.2;
      let vib = 0.05 + Math.random() * 0.05;

      if (isShipping) {
        temp = 74 + Math.sin(hour * 0.7) * 4;
        hum = 58 + Math.sin(hour * 0.4) * 8;
        vib = 0.8 + Math.random() * 0.6;
        uv = 1.5 + Math.sin(hour * 0.5) * 1.2;
      } else if (isDisplay) {
        temp = 71 + Math.sin(hour * 0.6) * 3;
        hum = 42 + Math.cos(hour * 0.5) * 5;
        uv = 2.8 + Math.sin(hour * 0.9) * 0.5;
      } else if (isClimate) {
        temp = 68 + Math.sin(hour * 0.3) * 0.5;
        hum = 50 + Math.cos(hour * 0.2) * 1;
        uv = 0.1;
        vib = 0.01;
      }

      readings.push({
        id: `reading_${String(readingId++).padStart(3, '0')}`,
        deviceId,
        timestamp: ts.toISOString(),
        temperature: Math.round(temp * 10) / 10,
        humidity: Math.round(hum * 10) / 10,
        uvIndex: Math.round(uv * 100) / 100,
        vibrationLevel: Math.round(vib * 100) / 100,
      });
    }
  }

  return readings;
}

const SENSOR_READINGS: SensorReading[] = generateReadings();

const CONDITION_ALERTS: ConditionAlert[] = [
  {
    id: 'alert_001',
    deviceId: 'sen_003',
    zoneName: 'Display Case',
    alertType: 'temp-high',
    severity: 'warning',
    message: 'Temperature reached 74.2\u00b0F, exceeding optimal range (65-72\u00b0F). Afternoon sunlight through east window suspected.',
    timestamp: '2026-03-16T13:45:00Z',
    acknowledged: false,
  },
  {
    id: 'alert_002',
    deviceId: 'sen_006',
    zoneName: 'Shipping Area',
    alertType: 'device-offline',
    severity: 'critical',
    message: 'Sensor "Shipping Combo" has been offline for 6+ hours. Battery depleted or hardware failure. Zone monitoring degraded.',
    timestamp: '2026-03-16T08:15:00Z',
    acknowledged: false,
  },
  {
    id: 'alert_003',
    deviceId: 'sen_005',
    zoneName: 'Shipping Area',
    alertType: 'vibration',
    severity: 'critical',
    message: 'Vibration level at 1.4g exceeds safe threshold (0.5g). Active package handling detected near card staging area.',
    timestamp: '2026-03-16T14:10:00Z',
    acknowledged: false,
  },
  {
    id: 'alert_004',
    deviceId: 'sen_003',
    zoneName: 'Display Case',
    alertType: 'uv-exposure',
    severity: 'warning',
    message: 'UV index at 3.1, exceeding maximum safe level (2.0). Prolonged exposure will cause card fading and degradation.',
    timestamp: '2026-03-16T12:30:00Z',
    acknowledged: true,
  },
  {
    id: 'alert_005',
    deviceId: 'sen_004',
    zoneName: 'Display Case',
    alertType: 'humidity-low',
    severity: 'info',
    message: 'Humidity dropped to 39% briefly. Below optimal range (45-55%) may cause card brittleness over time.',
    timestamp: '2026-03-16T10:00:00Z',
    acknowledged: true,
  },
  {
    id: 'alert_006',
    deviceId: 'sen_005',
    zoneName: 'Shipping Area',
    alertType: 'humidity-high',
    severity: 'warning',
    message: 'Humidity at 66% in shipping staging area. Loading dock door may have been left open. Risk of moisture damage.',
    timestamp: '2026-03-16T11:20:00Z',
    acknowledged: false,
  },
];

// ---- Public API ----

export function getSensorDevices(): SensorDevice[] {
  const cached = loadData<SensorDevice[]>('devices');
  if (cached && cached.length > 0) return cached;
  saveData('devices', SENSOR_DEVICES);
  return SENSOR_DEVICES;
}

export function getSensorReadings(deviceId?: string): SensorReading[] {
  const cached = loadData<SensorReading[]>('readings');
  const readings = cached && cached.length > 0 ? cached : SENSOR_READINGS;
  if (!cached || cached.length === 0) saveData('readings', SENSOR_READINGS);
  if (deviceId) return readings.filter(r => r.deviceId === deviceId);
  return readings;
}

export function getEnvironmentZones(): EnvironmentZone[] {
  const cached = loadData<EnvironmentZone[]>('zones');
  if (cached && cached.length > 0) return cached;
  saveData('zones', ENVIRONMENT_ZONES);
  return ENVIRONMENT_ZONES;
}

export function getConditionAlerts(): ConditionAlert[] {
  const cached = loadData<ConditionAlert[]>('alerts');
  if (cached && cached.length > 0) return cached;
  saveData('alerts', CONDITION_ALERTS);
  return CONDITION_ALERTS;
}

export function getGuardianStats(): GuardianStats {
  const devices = getSensorDevices();
  const zones = getEnvironmentZones();
  const alerts = getConditionAlerts();

  const onlineSensors = devices.filter(d => d.status === 'online').length;
  const activeAlerts = alerts.filter(a => !a.acknowledged).length;
  const avgHealthScore = zones.length > 0
    ? Math.round(zones.reduce((sum, z) => sum + z.healthScore, 0) / zones.length)
    : 0;
  const cardsProtected = zones.reduce((sum, z) => sum + z.cardCount, 0);

  return {
    totalSensors: devices.length,
    onlineSensors,
    totalZones: zones.length,
    activeAlerts,
    avgHealthScore,
    cardsProtected,
  };
}

export function getZoneHealth(zoneId: string): {
  zone: EnvironmentZone | null;
  sensors: SensorDevice[];
  latestReadings: SensorReading[];
  alerts: ConditionAlert[];
} {
  const zones = getEnvironmentZones();
  const zone = zones.find(z => z.id === zoneId) || null;
  if (!zone) return { zone: null, sensors: [], latestReadings: [], alerts: [] };

  const allDevices = getSensorDevices();
  const sensors = allDevices.filter(d => zone.sensors.includes(d.id));

  const allReadings = getSensorReadings();
  const latestReadings = zone.sensors.map(sensorId => {
    const deviceReadings = allReadings
      .filter(r => r.deviceId === sensorId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return deviceReadings[0];
  }).filter(Boolean);

  const allAlerts = getConditionAlerts();
  const alerts = allAlerts.filter(a => a.zoneName === zone.name);

  return { zone, sensors, latestReadings, alerts };
}

export function getOptimalConditions(): {
  temperature: { min: number; max: number; unit: string };
  humidity: { min: number; max: number; unit: string };
  uvIndex: { max: number; unit: string };
  vibration: { max: number; unit: string };
} {
  return {
    temperature: { min: OPTIMAL_TEMP_MIN, max: OPTIMAL_TEMP_MAX, unit: '\u00b0F' },
    humidity: { min: OPTIMAL_HUMIDITY_MIN, max: OPTIMAL_HUMIDITY_MAX, unit: '%' },
    uvIndex: { max: MAX_UV_INDEX, unit: 'UV Index' },
    vibration: { max: MAX_VIBRATION, unit: 'g' },
  };
}

// ---- Helper functions ----

export function getRiskColor(level: RiskLevel): { text: string; bg: string; border: string } {
  const colors: Record<RiskLevel, { text: string; bg: string; border: string }> = {
    safe: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    caution: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    danger: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };
  return colors[level];
}

export function getSeverityColor(severity: AlertSeverity): { text: string; bg: string; border: string } {
  const colors: Record<AlertSeverity, { text: string; bg: string; border: string }> = {
    info: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    warning: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    critical: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };
  return colors[severity];
}

export function getStatusIndicatorColor(status: SensorStatus): { text: string; bg: string; border: string } {
  const colors: Record<SensorStatus, { text: string; bg: string; border: string }> = {
    online: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    offline: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    warning: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  };
  return colors[status];
}

export function formatAlertType(type: AlertType): string {
  const labels: Record<AlertType, string> = {
    'temp-high': 'High Temperature',
    'temp-low': 'Low Temperature',
    'humidity-high': 'High Humidity',
    'humidity-low': 'Low Humidity',
    'uv-exposure': 'UV Exposure',
    'vibration': 'Vibration',
    'device-offline': 'Device Offline',
  };
  return labels[type];
}
