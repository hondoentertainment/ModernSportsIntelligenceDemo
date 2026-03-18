import { store } from '../dal/syncStore';
import { incrementCounter, recordMetric } from './telemetryService';

const QUEUE_KEY = 'msi_job_queue';

export interface JobRecord<T = any> {
    id: string;
    type: string;
    payload: T;
    attempts: number;
    maxAttempts: number;
    createdAt: string;
    lastError?: string;
}

export type JobProcessor = (job: JobRecord) => Promise<void>;

function getQueue(): JobRecord[] {
    const parsed = store.get<JobRecord[]>(QUEUE_KEY, []);
    return Array.isArray(parsed) ? parsed : [];
}

function setQueue(queue: JobRecord[]): void {
    store.set(QUEUE_KEY, queue);
}

export function enqueueJob<T>(type: string, payload: T, maxAttempts: number = 3): JobRecord<T> {
    const queue = getQueue();
    const job: JobRecord<T> = {
        id: crypto.randomUUID(),
        type,
        payload,
        attempts: 0,
        maxAttempts,
        createdAt: new Date().toISOString()
    };
    queue.push(job);
    setQueue(queue);
    incrementCounter('jobs.enqueued');
    recordMetric('jobs.queue.length', queue.length, { type });
    return job;
}

export async function processNextJob(processors: Record<string, JobProcessor>): Promise<boolean> {
    const queue = getQueue();
    if (queue.length === 0) return false;

    const job = queue[0];
    const processor = processors[job.type];
    if (!processor) {
        queue.shift();
        setQueue(queue);
        incrementCounter('jobs.dropped.no_processor');
        return true;
    }

    const started = performance.now();
    try {
        await processor(job);
        queue.shift();
        setQueue(queue);
        incrementCounter('jobs.processed.success');
        recordMetric('jobs.process.duration_ms', performance.now() - started, { type: job.type, status: 'success' });
        return true;
    } catch (error: any) {
        job.attempts += 1;
        job.lastError = error?.message || String(error);

        if (job.attempts >= job.maxAttempts) {
            queue.shift();
            incrementCounter('jobs.processed.failed');
        } else {
            queue[0] = job;
            incrementCounter('jobs.retried');
        }

        setQueue(queue);
        recordMetric('jobs.process.duration_ms', performance.now() - started, { type: job.type, status: 'error' });
        return true;
    }
}

export async function processAllJobs(processors: Record<string, JobProcessor>): Promise<void> {
    while (await processNextJob(processors)) {
        // drain queue
    }
}

export function getQueueDepth(): number {
    return getQueue().length;
}
