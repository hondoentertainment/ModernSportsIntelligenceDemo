const METRICS_KEY = 'msi_metrics_samples';
const COUNTERS_KEY = 'msi_metrics_counters';
const MODEL_USAGE_KEY = 'msi_model_usage';
const MAX_SAMPLES = 500;

export interface MetricSample {
    name: string;
    value: number;
    tags?: Record<string, string>;
    timestamp: string;
}

export interface ModelUsageSample {
    provider: 'gemini' | 'other';
    model: string;
    tokens: number;
    estimatedCostUsd: number;
    context?: string;
    timestamp: string;
}

function readJson<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function writeJson<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
}

export function recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const samples = readJson<MetricSample[]>(METRICS_KEY, []);
    samples.unshift({ name, value, tags, timestamp: new Date().toISOString() });
    writeJson(METRICS_KEY, samples.slice(0, MAX_SAMPLES));
}

export function incrementCounter(name: string, amount: number = 1): void {
    const counters = readJson<Record<string, number>>(COUNTERS_KEY, {});
    counters[name] = (counters[name] || 0) + amount;
    writeJson(COUNTERS_KEY, counters);
}

export function recordModelUsage(sample: Omit<ModelUsageSample, 'timestamp'>): void {
    const usage = readJson<ModelUsageSample[]>(MODEL_USAGE_KEY, []);
    usage.unshift({ ...sample, timestamp: new Date().toISOString() });
    writeJson(MODEL_USAGE_KEY, usage.slice(0, MAX_SAMPLES));
    incrementCounter('model.calls.total', 1);
    recordMetric('model.cost.usd', sample.estimatedCostUsd, { model: sample.model, provider: sample.provider });
}

export function estimateGeminiCostUsd(tokens: number, ratePerMillion: number = 0.35): number {
    return Math.round(((tokens / 1_000_000) * ratePerMillion) * 1000000) / 1000000;
}

export function getTelemetrySnapshot() {
    return {
        metrics: readJson<MetricSample[]>(METRICS_KEY, []),
        counters: readJson<Record<string, number>>(COUNTERS_KEY, {}),
        modelUsage: readJson<ModelUsageSample[]>(MODEL_USAGE_KEY, [])
    };
}
