import React, { useEffect, useMemo, useState } from 'react';
import { Download, Factory, Filter, Radar, ShieldCheck, Sparkles, Target, Workflow } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  buildFrontierRoadmapExport,
  getMergedFrontierFeatures,
  saveFrontierFeatureState,
} from '../lib/utils/frontierFeatureService';
import { FrontierFeatureCategory, FrontierFeatureStage, FrontierFeatureView } from '../types';

const stageTone: Record<FrontierFeatureStage, string> = {
  recommended: 'border-slate-600 bg-slate-800/70 text-slate-200',
  designing: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  'production-ready': 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
};

const stageLabel: Record<FrontierFeatureStage, string> = {
  recommended: 'Recommended',
  designing: 'Designing',
  'production-ready': 'Production Ready',
};

const categoryAccent: Record<FrontierFeatureCategory, string> = {
  Risk: 'text-red-300',
  Trust: 'text-cyan-300',
  Finance: 'text-emerald-300',
  Operations: 'text-violet-300',
  'Market Structure': 'text-brand-lime',
  Strategy: 'text-amber-300',
};

function downloadRoadmap() {
  const payload = buildFrontierRoadmapExport();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'frontier-roadmap.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const FrontierLab: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [features, setFeatures] = useState<FrontierFeatureView[]>(() => getMergedFrontierFeatures());
  const [categoryFilter, setCategoryFilter] = useState<'all' | FrontierFeatureCategory>('all');
  const [stageFilter, setStageFilter] = useState<'all' | FrontierFeatureStage>('all');
  const [query, setQuery] = useState('');
  const requestedFeatureId = searchParams.get('feature');
  const [selectedId, setSelectedId] = useState<string>(requestedFeatureId || features[0]?.id || '');
  const [draftNote, setDraftNote] = useState('');

  useEffect(() => {
    if (!requestedFeatureId) return;
    setSelectedId(requestedFeatureId);
  }, [requestedFeatureId]);

  useEffect(() => {
    if (!selectedId && features[0]) {
      setSelectedId(features[0].id);
    }
  }, [features, selectedId]);

  const categories = useMemo(
    () => Array.from(new Set(features.map(feature => feature.category))),
    [features]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return features.filter(feature => {
      if (categoryFilter !== 'all' && feature.category !== categoryFilter) return false;
      if (stageFilter !== 'all' && feature.stage !== stageFilter) return false;
      if (!normalizedQuery) return true;
      return [
        feature.name,
        feature.tagline,
        feature.competitionGap,
        feature.whyDifferent,
        feature.category,
      ].some(value => value.toLowerCase().includes(normalizedQuery));
    });
  }, [categoryFilter, features, query, stageFilter]);

  const selectedFeature = useMemo(
    () => features.find(feature => feature.id === selectedId) || filtered[0] || null,
    [features, filtered, selectedId]
  );

  useEffect(() => {
    if (!selectedFeature) return;
    setDraftNote(selectedFeature.note);
    if (selectedFeature.id !== requestedFeatureId) {
      setSearchParams({ feature: selectedFeature.id });
    }
  }, [requestedFeatureId, selectedFeature, setSearchParams]);

  const summary = useMemo(() => {
    const total = features.length;
    const avgMoat = total > 0 ? Math.round(features.reduce((sum, feature) => sum + feature.moatScore, 0) / total) : 0;
    const avgLaunch = total > 0 ? Math.round(features.reduce((sum, feature) => sum + feature.launchReadiness, 0) / total) : 0;
    const productionReady = features.filter(feature => feature.stage === 'production-ready').length;
    return { total, avgMoat, avgLaunch, productionReady };
  }, [features]);

  const refreshFeatures = () => {
    setFeatures(getMergedFrontierFeatures());
  };

  const handleStageChange = (stage: FrontierFeatureStage) => {
    if (!selectedFeature) return;
    saveFrontierFeatureState(selectedFeature.id, { stage, note: draftNote });
    refreshFeatures();
  };

  const handleSaveNote = () => {
    if (!selectedFeature) return;
    saveFrontierFeatureState(selectedFeature.id, { note: draftNote });
    refreshFeatures();
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-lime/30 bg-brand-lime/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-lime">
            <Sparkles size={12} />
            Frontier Lab
          </div>
          <div>
            <h1 className="text-4xl font-bebas tracking-wide text-white">10 New Features The Market Does Not Have</h1>
            <p className="max-w-4xl text-sm text-slate-400">
              A production-grade roadmap surface for differentiated features that extend MSI beyond analytics into trust, recovery, market structure, and operator workflows.
            </p>
          </div>
        </div>

        <button
          onClick={downloadRoadmap}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-200 transition hover:border-brand-lime/40 hover:text-white"
        >
          <Download size={14} />
          Download Roadmap
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Factory size={12} className="text-brand-lime" />
            New Moat Features
          </div>
          <div className="text-2xl font-bold text-white">{summary.total}</div>
        </div>
        <div className="rounded-3xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <ShieldCheck size={12} className="text-cyan-300" />
            Avg Moat Score
          </div>
          <div className="text-2xl font-bold text-cyan-200">{summary.avgMoat}/100</div>
        </div>
        <div className="rounded-3xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Target size={12} className="text-amber-300" />
            Avg Launch Readiness
          </div>
          <div className="text-2xl font-bold text-amber-200">{summary.avgLaunch}%</div>
        </div>
        <div className="rounded-3xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Workflow size={12} className="text-emerald-300" />
            Production Ready
          </div>
          <div className="text-2xl font-bold text-emerald-200">{summary.productionReady}</div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-[2rem] border border-slate-700/50 bg-slate-900/50 p-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Filter size={12} />
            Filters
          </div>

          <div className="space-y-3">
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search by moat thesis or feature name"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-brand-lime/40"
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-1">
              <select
                value={categoryFilter}
                onChange={event => setCategoryFilter(event.target.value as 'all' | FrontierFeatureCategory)}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none"
              >
                <option value="all">All categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={stageFilter}
                onChange={event => setStageFilter(event.target.value as 'all' | FrontierFeatureStage)}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none"
              >
                <option value="all">All stages</option>
                <option value="recommended">Recommended</option>
                <option value="designing">Designing</option>
                <option value="production-ready">Production Ready</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500">{filtered.length} frontier concepts surfaced</div>

          <div className="space-y-3">
            {filtered.map(feature => (
              <button
                key={feature.id}
                onClick={() => setSelectedId(feature.id)}
                className={`w-full rounded-3xl border p-4 text-left transition ${
                  selectedFeature?.id === feature.id
                    ? 'border-brand-lime/40 bg-brand-lime/5'
                    : 'border-slate-700/60 bg-slate-950/40 hover:border-slate-500/70'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${categoryAccent[feature.category]}`}>
                      {feature.category}
                    </div>
                    <div className="mt-2 text-base font-semibold text-white">{feature.name}</div>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">{feature.tagline}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-widest ${stageTone[feature.stage]}`}>
                    {stageLabel[feature.stage]}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-slate-900/80 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">Moat</div>
                    <div className="font-bold text-cyan-200">{feature.moatScore}/100</div>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">Launch</div>
                    <div className="font-bold text-amber-200">{feature.launchReadiness}%</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedFeature ? (
          <div className="space-y-6 rounded-[2rem] border border-slate-700/50 bg-slate-900/50 p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-widest ${categoryAccent[selectedFeature.category]}`}>
                    {selectedFeature.category}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
                    {selectedFeature.tier}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
                    {selectedFeature.complexity} complexity
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-bebas tracking-wide text-white">{selectedFeature.name}</h2>
                  <p className="mt-2 max-w-4xl text-sm text-slate-300">{selectedFeature.tagline}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 xl:min-w-[260px]">
                <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 text-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Moat Score</div>
                  <div className="mt-2 text-2xl font-bold text-cyan-200">{selectedFeature.moatScore}</div>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 text-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Launch Score</div>
                  <div className="mt-2 text-2xl font-bold text-amber-200">{selectedFeature.launchReadiness}%</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-700 bg-slate-950/50 p-5">
                <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Competition Gap</div>
                <p className="text-sm leading-relaxed text-slate-300">{selectedFeature.competitionGap}</p>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-slate-950/50 p-5">
                <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Why It Wins</div>
                <p className="text-sm leading-relaxed text-slate-300">{selectedFeature.whyDifferent}</p>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-slate-950/50 p-5">
                <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Collector Outcome</div>
                <p className="text-sm leading-relaxed text-slate-300">{selectedFeature.userOutcome}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-6">
                <section className="rounded-3xl border border-slate-700 bg-slate-950/50 p-5">
                  <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <Radar size={12} className="text-brand-lime" />
                    Production Checklist
                  </div>
                  <div className="space-y-3">
                    {selectedFeature.productionChecklist.map(item => (
                      <div key={item.label} className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-semibold text-white">{item.label}</div>
                          <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-widest ${
                            item.status === 'ready'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                              : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                          }`}>
                            {item.status === 'ready' ? 'Ready' : 'Needs Build'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl border border-slate-700 bg-slate-950/50 p-5">
                    <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Operator Workflow</div>
                    <div className="space-y-3">
                      {selectedFeature.operatorWorkflow.map((step, index) => (
                        <div key={step} className="rounded-2xl bg-slate-900/80 p-4 text-sm text-slate-300">
                          <span className="mr-2 text-brand-lime">{index + 1}.</span>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-700 bg-slate-950/50 p-5">
                    <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Data Sources</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedFeature.dataSources.map(source => (
                        <span key={source} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-3xl border border-slate-700 bg-slate-950/50 p-5">
                  <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Delivery Stage</div>
                  <div className="grid grid-cols-1 gap-2">
                    {(['recommended', 'designing', 'production-ready'] as FrontierFeatureStage[]).map(stage => (
                      <button
                        key={stage}
                        onClick={() => handleStageChange(stage)}
                        className={`rounded-2xl border px-4 py-3 text-left text-xs font-black uppercase tracking-widest transition ${
                          selectedFeature.stage === stage
                            ? stageTone[stage]
                            : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {stageLabel[stage]}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-700 bg-slate-950/50 p-5">
                  <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Implementation Notes</div>
                  <textarea
                    value={draftNote}
                    onChange={event => setDraftNote(event.target.value)}
                    rows={6}
                    placeholder="Add launch blockers, staffing notes, or execution decisions."
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand-lime/40"
                  />
                  <button
                    onClick={handleSaveNote}
                    className="mt-3 w-full rounded-2xl border border-brand-lime/30 bg-brand-lime/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-brand-lime"
                  >
                    Save Note
                  </button>
                </section>

                <section className="rounded-3xl border border-slate-700 bg-slate-950/50 p-5">
                  <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Success Metrics</div>
                  <div className="space-y-2">
                    {selectedFeature.successMetrics.map(metric => (
                      <div key={metric} className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">{metric}</div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-700 bg-slate-950/50 p-5">
                  <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Compliance Notes</div>
                  <div className="space-y-2">
                    {selectedFeature.complianceNotes.map(note => (
                      <div key={note} className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">{note}</div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-700 bg-slate-900/30 p-8 text-sm text-slate-400">
            No frontier features match the current filters.
          </div>
        )}
      </section>
    </div>
  );
};

export default FrontierLab;
