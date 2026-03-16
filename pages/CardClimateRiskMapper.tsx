import React, { useState, useEffect, useMemo } from 'react';
import {
  Cloud,
  Thermometer,
  Droplets,
  Flame,
  Wind,
  MapPin,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import {
  getAllZipProfiles,
  getZipCodeRisk,
  getClimateProjection,
  getAllMaterialVulnerabilities,
  getRelocationRecommendations,
  getVaultRatings,
  getSeasonalRisk,
  getDamageProjection,
  getTopRiskZones,
  getStorageOptimization,
  compareLocations,
  getRiskByRegion,
  riskLevel,
  RISK_COLORS,
  type ZipCodeProfile,
  type MaterialVulnerability,
  type ClimateProjection,
  type RelocationRecommendation,
  type VaultRating,
  type SeasonalRiskProfile,
  type DamageModel,
  type StorageOptimization as StorageOpt,
  type LocationComparison,
  type RiskLevel,
} from '../lib/climateRiskService.ts';

const TABS = [
  'Risk Dashboard',
  'Zone Map',
  'Material Analysis',
  'Storage Optimizer',
  'Projections',
  'Vault Ratings',
] as const;

type Tab = (typeof TABS)[number];

const riskColorClass = (level: RiskLevel): string => {
  switch (level) {
    case 'low': return 'text-green-400';
    case 'moderate': return 'text-yellow-400';
    case 'elevated': return 'text-orange-400';
    case 'high': return 'text-red-400';
    case 'critical': return 'text-red-500';
  }
};

const riskBgClass = (level: RiskLevel): string => {
  switch (level) {
    case 'low': return 'bg-green-500/20 border-green-500/30';
    case 'moderate': return 'bg-yellow-500/20 border-yellow-500/30';
    case 'elevated': return 'bg-orange-500/20 border-orange-500/30';
    case 'high': return 'bg-red-500/20 border-red-500/30';
    case 'critical': return 'bg-red-600/20 border-red-600/30';
  }
};

const riskBarColor = (score: number): string => {
  if (score < 20) return '#22c55e';
  if (score < 40) return '#eab308';
  if (score < 60) return '#f97316';
  if (score < 80) return '#ef4444';
  return '#dc2626';
};

const tierBadgeClass = (tier: string): string => {
  switch (tier) {
    case 'platinum': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'gold': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case 'silver': return 'bg-slate-400/20 text-slate-300 border-slate-400/30';
    case 'bronze': return 'bg-orange-600/20 text-orange-300 border-orange-600/30';
    default: return 'bg-slate-600/20 text-slate-400 border-slate-600/30';
  }
};

const FACTOR_ICONS: Record<string, React.ReactNode> = {
  humidity: <Droplets size={14} className="text-blue-400" />,
  flood: <Cloud size={14} className="text-cyan-400" />,
  wildfire: <Flame size={14} className="text-orange-400" />,
  temperature: <Thermometer size={14} className="text-red-400" />,
  tornado: <Wind size={14} className="text-purple-400" />,
  hurricane: <Cloud size={14} className="text-teal-400" />,
};

const CardClimateRiskMapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Risk Dashboard');
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ZipCodeProfile[]>([]);
  const [materials, setMaterials] = useState<MaterialVulnerability[]>([]);
  const [topRisks, setTopRisks] = useState<ZipCodeProfile[]>([]);
  const [relocations, setRelocations] = useState<RelocationRecommendation[]>([]);
  const [vaults, setVaults] = useState<VaultRating[]>([]);
  const [selectedZip, setSelectedZip] = useState('33101');
  const [compareZip1, setCompareZip1] = useState('33101');
  const [compareZip2, setCompareZip2] = useState('80202');
  const [projectionYears, setProjectionYears] = useState(10);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('vintage-cardboard');
  const [seasonalData, setSeasonalData] = useState<SeasonalRiskProfile | null>(null);
  const [projection, setProjection] = useState<ClimateProjection | null>(null);
  const [damage, setDamage] = useState<DamageModel | null>(null);
  const [optimization, setOptimization] = useState<StorageOpt | null>(null);
  const [comparison, setComparison] = useState<LocationComparison | null>(null);
  const [regionRisks, setRegionRisks] = useState<{ region: string; avgRisk: number; count: number; topRisk: string }[]>([]);

  useEffect(() => {
    try {
      setProfiles(getAllZipProfiles());
      setMaterials(getAllMaterialVulnerabilities());
      setTopRisks(getTopRiskZones());
      setRelocations(getRelocationRecommendations());
      setVaults(getVaultRatings());
      setRegionRisks(getRiskByRegion());
      setSeasonalData(getSeasonalRisk(selectedZip));
      setProjection(getClimateProjection(selectedZip, projectionYears));
      setDamage(getDamageProjection(selectedMaterial as any, selectedZip, projectionYears));
      setOptimization(getStorageOptimization(selectedZip));
      setComparison(compareLocations(compareZip1, compareZip2));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSeasonalData(getSeasonalRisk(selectedZip));
    setProjection(getClimateProjection(selectedZip, projectionYears));
    setDamage(getDamageProjection(selectedMaterial as any, selectedZip, projectionYears));
    setOptimization(getStorageOptimization(selectedZip));
  }, [selectedZip, projectionYears, selectedMaterial]);

  useEffect(() => {
    setComparison(compareLocations(compareZip1, compareZip2));
  }, [compareZip1, compareZip2]);

  const selectedProfile = useMemo(() => getZipCodeRisk(selectedZip), [selectedZip]);

  const radarData = useMemo(() => {
    if (!selectedProfile) return [];
    return [
      { factor: 'Humidity', score: selectedProfile.riskScores.humidity },
      { factor: 'Flood', score: selectedProfile.riskScores.flood },
      { factor: 'Wildfire', score: selectedProfile.riskScores.wildfire },
      { factor: 'Temperature', score: selectedProfile.riskScores.temperature },
      { factor: 'Tornado', score: selectedProfile.riskScores.tornado },
      { factor: 'Hurricane', score: selectedProfile.riskScores.hurricane },
    ];
  }, [selectedProfile]);

  const materialChartData = useMemo(() => {
    return materials.map(m => ({
      name: m.displayName.split(' ')[0],
      material: m.material,
      humidity: m.humidityTolerance,
      heat: m.heatTolerance,
      flood: m.floodSurvivability,
      fire: m.fireSurvivability,
      wind: m.windDamageTolerance,
      uv: m.uvResistance,
      durability: m.overallDurability,
    }));
  }, [materials]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Climate Risk Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan-500/20">
          <Cloud size={24} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Card Climate Risk Mapper</h1>
          <p className="text-sm text-slate-400">
            Climate-aware storage risk assessment and protection planning for your collection
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Zip Code Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-cyan-400" />
          <label className="text-sm text-slate-400">Location:</label>
          <select
            value={selectedZip}
            onChange={e => setSelectedZip(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {profiles.map(p => (
              <option key={p.zip} value={p.zip}>{p.city}, {p.state} ({p.zip})</option>
            ))}
          </select>
        </div>
        {selectedProfile && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${riskBgClass(selectedProfile.riskLevel)}`}>
            <span className={riskColorClass(selectedProfile.riskLevel)}>
              Risk: {selectedProfile.overallRisk}/100 ({selectedProfile.riskLevel.toUpperCase()})
            </span>
          </div>
        )}
      </div>

      {/* ============ TAB: Risk Dashboard ============ */}
      {activeTab === 'Risk Dashboard' && selectedProfile && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(selectedProfile.riskScores).map(([factor, score]) => (
              <div key={factor} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {FACTOR_ICONS[factor]}
                  <span className="text-xs text-slate-500 uppercase tracking-wider">{factor}</span>
                </div>
                <p className={`text-2xl font-bold ${riskColorClass(riskLevel(score))}`}>{score}</p>
                <p className="text-[10px] text-slate-600 mt-1">{riskLevel(score)}</p>
              </div>
            ))}
          </div>

          {/* Radar + Top Risk Zones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-400" />
                Risk Factor Analysis &mdash; {selectedProfile.city}
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} />
                    <Radar name="Risk Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Flame size={18} className="text-red-400" />
                Top 10 Highest-Risk Zones
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topRisks} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis dataKey="city" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Bar dataKey="overallRisk" name="Risk Score" radius={[0, 4, 4, 0]}>
                      {topRisks.map((entry, i) => (
                        <Cell key={i} fill={riskBarColor(entry.overallRisk)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Seasonal Risk Chart */}
          {seasonalData && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Thermometer size={18} className="text-orange-400" />
                Seasonal Risk Profile &mdash; {seasonalData.city}
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={seasonalData.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Area type="monotone" dataKey="overallRisk" fill="#06b6d4" fillOpacity={0.1} stroke="#06b6d4" strokeWidth={2} name="Overall Risk" />
                    <Bar dataKey="hurricaneRisk" fill="#14b8a6" name="Hurricane" opacity={0.7} />
                    <Bar dataKey="tornadoRisk" fill="#a855f7" name="Tornado" opacity={0.7} />
                    <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Humidity %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Relocation Recommendations */}
          {relocations.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-green-400" />
                Relocation Recommendations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relocations.map((r, i) => (
                  <div key={i} className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-400">{r.fromCity}</span>
                      <span className="text-slate-600">&rarr;</span>
                      <span className="text-sm font-medium text-green-400">{r.toCity}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-400">{r.overallRiskBefore}</p>
                        <p className="text-[9px] text-slate-600">BEFORE</p>
                      </div>
                      <div className="flex-1 h-1 bg-gradient-to-r from-red-500 to-green-500 rounded-full" />
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-400">{r.overallRiskAfter}</p>
                        <p className="text-[9px] text-slate-600">AFTER</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {r.riskReduction}pt reduction &middot; ~{r.costSavingsPercent}% insurance savings &middot; {r.distanceMiles} mi
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ TAB: Zone Map ============ */}
      {activeTab === 'Zone Map' && (
        <div className="space-y-6">
          {/* Region Risk Heat Grid */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-cyan-400" />
              Regional Risk Heat Map
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {regionRisks.map(r => {
                const level = riskLevel(r.avgRisk);
                return (
                  <div
                    key={r.region}
                    className={`rounded-xl p-5 border text-center ${riskBgClass(level)}`}
                  >
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{r.region.replace('-', ' ')}</p>
                    <p className={`text-3xl font-bold ${riskColorClass(level)}`}>{r.avgRisk}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{r.count} locations &middot; Top risk: {r.topRisk}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All Zones Bar Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4">All Monitored Locations by Risk Score</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...profiles].sort((a, b) => b.overallRisk - a.overallRisk)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="city" tick={{ fontSize: 8, fill: '#64748b', angle: -45 }} height={60} interval={0} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value: number) => [`${value}/100`, 'Risk Score']}
                  />
                  <Bar dataKey="overallRisk" name="Risk Score" radius={[4, 4, 0, 0]}>
                    {[...profiles].sort((a, b) => b.overallRisk - a.overallRisk).map((entry, i) => (
                      <Cell key={i} fill={riskBarColor(entry.overallRisk)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Location Comparison */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-blue-400" />
              Location Comparison
            </h2>
            <div className="flex items-center gap-4 mb-6">
              <select
                value={compareZip1}
                onChange={e => setCompareZip1(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {profiles.map(p => (
                  <option key={p.zip} value={p.zip}>{p.city}, {p.state}</option>
                ))}
              </select>
              <span className="text-slate-500 text-sm font-medium">vs</span>
              <select
                value={compareZip2}
                onChange={e => setCompareZip2(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {profiles.map(p => (
                  <option key={p.zip} value={p.zip}>{p.city}, {p.state}</option>
                ))}
              </select>
            </div>
            {comparison && (
              <div className="space-y-4">
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
                  <p className="text-sm text-slate-300">{comparison.recommendation}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {comparison.factorComparison.map(fc => (
                    <div key={fc.factor} className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {FACTOR_ICONS[fc.factor]}
                        <span className="text-[10px] text-slate-500 uppercase">{fc.factor}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={fc.zip1Score <= fc.zip2Score ? 'text-green-400 font-bold' : 'text-slate-400'}>{fc.zip1Score}</span>
                        <span className="text-slate-600 text-[10px]">vs</span>
                        <span className={fc.zip2Score <= fc.zip1Score ? 'text-green-400 font-bold' : 'text-slate-400'}>{fc.zip2Score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ TAB: Material Analysis ============ */}
      {activeTab === 'Material Analysis' && (
        <div className="space-y-6">
          {/* Material Durability Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-emerald-400" />
              Material Durability Comparison
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={materialChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="humidity" name="Humidity Tol." fill="#3b82f6" opacity={0.8} />
                  <Bar dataKey="heat" name="Heat Tol." fill="#ef4444" opacity={0.8} />
                  <Bar dataKey="flood" name="Flood Surv." fill="#06b6d4" opacity={0.8} />
                  <Bar dataKey="durability" name="Overall" fill="#22c55e" opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Material Selector + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4">Material Vulnerability Radar</h2>
              <select
                value={selectedMaterial}
                onChange={e => setSelectedMaterial(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 mb-4 focus:outline-none focus:border-cyan-500"
              >
                {materials.map(m => (
                  <option key={m.material} value={m.material}>{m.displayName}</option>
                ))}
              </select>
              {(() => {
                const mat = materials.find(m => m.material === selectedMaterial);
                if (!mat) return null;
                const data = [
                  { trait: 'Humidity', value: mat.humidityTolerance },
                  { trait: 'Heat', value: mat.heatTolerance },
                  { trait: 'Flood', value: mat.floodSurvivability },
                  { trait: 'Fire', value: mat.fireSurvivability },
                  { trait: 'Wind', value: mat.windDamageTolerance },
                  { trait: 'UV', value: mat.uvResistance },
                ];
                return (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={data}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="trait" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} />
                        <Radar name="Tolerance" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </div>

            {/* Material Detail Cards */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              <h2 className="text-lg font-bold text-slate-200 sticky top-0 bg-slate-900 py-2">Material Details</h2>
              {materials.map(m => (
                <div key={m.material} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-200">{m.displayName}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${riskBgClass(riskLevel(100 - m.overallDurability))}`}>
                      <span className={riskColorClass(riskLevel(100 - m.overallDurability))}>
                        Durability: {m.overallDurability}/100
                      </span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">{m.notes}</p>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="text-center">
                      <p className="text-slate-500">Degradation/yr</p>
                      <p className="text-amber-400 font-bold">{m.degradationRatePerYear}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500">Optimal Temp</p>
                      <p className="text-cyan-400 font-bold">{m.optimalTempRange[0]}-{m.optimalTempRange[1]}F</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500">Replacement Cost</p>
                      <p className="text-red-400 font-bold">{m.replacementCostMultiplier}x</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============ TAB: Storage Optimizer ============ */}
      {activeTab === 'Storage Optimizer' && optimization && (
        <div className="space-y-6">
          {/* Current vs Optimized */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Current Risk</p>
              <p className={`text-4xl font-bold ${riskColorClass(riskLevel(optimization.currentRisk))}`}>
                {optimization.currentRisk}
              </p>
              <p className="text-xs text-slate-600 mt-1">{riskLevel(optimization.currentRisk).toUpperCase()}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">After Optimization</p>
              <p className={`text-4xl font-bold ${riskColorClass(riskLevel(optimization.projectedRiskAfter))}`}>
                {optimization.projectedRiskAfter}
              </p>
              <p className="text-xs text-slate-600 mt-1">{riskLevel(optimization.projectedRiskAfter).toUpperCase()}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Est. Savings</p>
              <p className="text-4xl font-bold text-emerald-400">{optimization.estimatedSavingsPercent}%</p>
              <p className="text-xs text-slate-600 mt-1">risk reduction</p>
            </div>
          </div>

          {/* Risk Reduction Waterfall */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-green-400" />
              Optimization Impact by Category
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={optimization.recommendations.filter(r => r.impact > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="impact" name="Risk Reduction" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendations List */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4">Storage Recommendations</h2>
            <div className="space-y-3">
              {optimization.recommendations.map((rec, i) => {
                const priorityColor = {
                  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
                  high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
                  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                  low: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
                }[rec.priority];
                return (
                  <div key={i} className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 flex items-start gap-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border shrink-0 ${priorityColor}`}>
                      {rec.priority}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200">{rec.category}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{rec.action}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-green-400">-{rec.impact}pts</p>
                      <p className="text-[10px] text-slate-600">{rec.cost}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============ TAB: Projections ============ */}
      {activeTab === 'Projections' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">Projection Years:</label>
              <select
                value={projectionYears}
                onChange={e => setProjectionYears(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {[5, 10, 15, 20, 25, 30].map(y => (
                  <option key={y} value={y}>{y} years</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">Card Material:</label>
              <select
                value={selectedMaterial}
                onChange={e => setSelectedMaterial(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {materials.map(m => (
                  <option key={m.material} value={m.material}>{m.displayName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Climate Projection Chart */}
          {projection && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
                <Thermometer size={18} className="text-red-400" />
                Climate Projection &mdash; {projection.city}
              </h2>
              <p className="text-xs text-slate-500 mb-4">{projection.summary}</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projection.projections}>
                    <defs>
                      <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Area type="monotone" dataKey="overallRisk" stroke="#ef4444" fill="url(#riskGrad)" strokeWidth={2} name="Overall Risk" />
                    <Area type="monotone" dataKey="avgTempF" stroke="#f97316" fill="url(#tempGrad)" strokeWidth={2} name="Avg Temp (F)" />
                    <Area type="monotone" dataKey="floodRisk" stroke="#06b6d4" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Flood Risk" />
                    <Area type="monotone" dataKey="wildfireRisk" stroke="#f59e0b" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Wildfire Risk" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-slate-400">
                  <AlertTriangle size={12} className="inline mr-1 text-amber-400" />
                  <strong className="text-slate-300">Recommended Action:</strong> {projection.recommendedAction}
                </p>
              </div>
            </div>
          )}

          {/* Damage Projection */}
          {damage && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-400" />
                Cumulative Damage Projection
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 text-center">
                  <p className="text-xs text-slate-500 uppercase mb-1">Total Value at Risk</p>
                  <p className="text-2xl font-bold text-red-400">{damage.totalValueAtRisk.toFixed(1)}%</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 text-center">
                  <p className="text-xs text-slate-500 uppercase mb-1">Mitigation Savings</p>
                  <p className="text-2xl font-bold text-green-400">{damage.mitigationSavings.toFixed(1)}%</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={damage.projectedDamage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Year', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Loss %', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="cumulativeLoss" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Cumulative Loss %" />
                    <Line type="monotone" dataKey="valueLoss" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 2 }} name="Annual Value Loss %" />
                    <Line type="monotone" dataKey="conditionLoss" stroke="#06b6d4" strokeWidth={1.5} dot={{ r: 2 }} name="Annual Condition Loss %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ TAB: Vault Ratings ============ */}
      {activeTab === 'Vault Ratings' && (
        <div className="space-y-6">
          {/* Vault Comparison Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-purple-400" />
              Vault Climate Scores
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vaults} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#94a3b8' }} width={160} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="climateScore" name="Climate Score" radius={[0, 4, 4, 0]}>
                    {vaults.map((v, i) => (
                      <Cell key={i} fill={v.tier === 'platinum' ? '#a855f7' : v.tier === 'gold' ? '#eab308' : v.tier === 'silver' ? '#94a3b8' : '#f97316'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vault Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vaults.map(v => (
              <div key={v.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">{v.name}</h3>
                    <p className="text-[10px] text-slate-500">{v.location}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${tierBadgeClass(v.tier)}`}>
                    {v.tier}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-cyan-400">{v.climateScore}</p>
                    <p className="text-[9px] text-slate-600">Climate Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-300">{v.customerRating}</p>
                    <p className="text-[9px] text-slate-600">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-400">${v.monthlyCostPer100Cards}</p>
                    <p className="text-[9px] text-slate-600">/100 cards/mo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-400">{v.capacityUtilization}%</p>
                    <p className="text-[9px] text-slate-600">Capacity</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    { label: 'Humidity', ok: v.humidityControl },
                    { label: 'Temp', ok: v.temperatureControl },
                    { label: 'Flood', ok: v.floodProtection },
                    { label: 'Fire', ok: v.fireProtection },
                    { label: 'Backup Power', ok: v.backupPower },
                  ].map(f => (
                    <span
                      key={f.label}
                      className={`text-[9px] px-1.5 py-0.5 rounded border ${
                        f.ok
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {f.ok ? '\u2713' : '\u2717'} {f.label}
                    </span>
                  ))}
                </div>
                {v.certifications.length > 0 && (
                  <div className="flex gap-1.5">
                    {v.certifications.map(c => (
                      <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 border border-slate-600/30">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-slate-600 mt-2">
                  Insurance: ${(v.insuranceCoverage / 1000000).toFixed(1)}M coverage
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardClimateRiskMapper;
