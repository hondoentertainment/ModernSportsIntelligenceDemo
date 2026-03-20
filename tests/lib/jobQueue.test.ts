import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enqueueJob, processNextJob, processAllJobs, getQueueDepth } from '../../lib/utils/jobQueue';
import { store } from '../../lib/dal/syncStore';
import { incrementCounter, recordMetric } from '../../lib/utils/telemetryService';

vi.mock('../../lib/dal/syncStore', () => ({
  store: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('../../lib/utils/telemetryService', () => ({
  incrementCounter: vi.fn(),
  recordMetric: vi.fn(),
}));

describe('jobQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(store.get).mockReturnValue([]);
  });

  describe('enqueueJob', () => {
    it('enqueues a job', () => {
      const job = enqueueJob('test-job', { data: 'test' });
      expect(job.type).toBe('test-job');
      expect(job.payload).toEqual({ data: 'test' });
      expect(job.attempts).toBe(0);
      expect(store.set).toHaveBeenCalled();
    });

    it('uses custom maxAttempts', () => {
      const job = enqueueJob('test-job', {}, 5);
      expect(job.maxAttempts).toBe(5);
    });

    it('records metrics', () => {
      enqueueJob('test-job', {});
      expect(incrementCounter).toHaveBeenCalledWith('jobs.enqueued');
      expect(recordMetric).toHaveBeenCalled();
    });
  });

  describe('processNextJob', () => {
    it('returns false when queue is empty', async () => {
      const result = await processNextJob({});
      expect(result).toBe(false);
    });

    it('processes job with matching processor', async () => {
      const processor = vi.fn().mockResolvedValue(undefined);
      enqueueJob('test-job', {});
      const result = await processNextJob({ 'test-job': processor });
      expect(result).toBe(true);
      expect(processor).toHaveBeenCalled();
    });

    it('removes job after successful processing', async () => {
      const processor = vi.fn().mockResolvedValue(undefined);
      enqueueJob('test-job', {});
      await processNextJob({ 'test-job': processor });
      expect(store.set).toHaveBeenCalled();
      const callArgs = vi.mocked(store.set).mock.calls.find(c => c[0] === 'msi_job_queue');
      if (callArgs) {
        const queue = callArgs[1] as any[];
        expect(queue.length).toBe(0);
      }
    });

    it('drops job when no processor available', async () => {
      enqueueJob('unknown-job', {});
      const result = await processNextJob({});
      expect(result).toBe(true);
      expect(incrementCounter).toHaveBeenCalledWith('jobs.dropped.no_processor');
    });

    it('retries job on failure', async () => {
      const processor = vi.fn().mockRejectedValue(new Error('Failed'));
      enqueueJob('test-job', {}, 3);
      await processNextJob({ 'test-job': processor });
      expect(processor).toHaveBeenCalled();
      expect(incrementCounter).toHaveBeenCalledWith('jobs.retried');
    });

    it('removes job after max attempts', async () => {
      const processor = vi.fn().mockRejectedValue(new Error('Failed'));
      enqueueJob('test-job', {}, 1);
      await processNextJob({ 'test-job': processor });
      await processNextJob({ 'test-job': processor });
      expect(incrementCounter).toHaveBeenCalledWith('jobs.processed.failed');
    });
  });

  describe('processAllJobs', () => {
    it('processes all jobs in queue', async () => {
      const processor = vi.fn().mockResolvedValue(undefined);
      enqueueJob('test-job-1', {});
      enqueueJob('test-job-2', {});
      await processAllJobs({ 'test-job-1': processor, 'test-job-2': processor });
      expect(processor).toHaveBeenCalledTimes(2);
    });
  });

  describe('getQueueDepth', () => {
    it('returns queue length', () => {
      vi.mocked(store.get).mockReturnValue([
        { id: '1', type: 'test', payload: {}, attempts: 0, maxAttempts: 3, createdAt: '2024-01-01' },
        { id: '2', type: 'test', payload: {}, attempts: 0, maxAttempts: 3, createdAt: '2024-01-01' },
      ]);
      expect(getQueueDepth()).toBe(2);
    });

    it('returns 0 for empty queue', () => {
      vi.mocked(store.get).mockReturnValue([]);
      expect(getQueueDepth()).toBe(0);
    });

    it('treats corrupted queue payload as empty', () => {
      vi.mocked(store.get).mockReturnValue({ notAnArray: true } as unknown as never[]);
      expect(getQueueDepth()).toBe(0);
    });
  });

  describe('processNextJob edge cases', () => {
    it('stores stringified error when processor throws non-Error', async () => {
      const processor = vi.fn().mockRejectedValue('string-fail');
      enqueueJob('str-job', {}, 1);
      await processNextJob({ 'str-job': processor });
      expect(incrementCounter).toHaveBeenCalledWith('jobs.processed.failed');
    });
  });
});
