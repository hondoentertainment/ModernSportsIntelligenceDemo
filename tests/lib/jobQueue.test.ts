import { beforeEach, describe, expect, it } from 'vitest';
import { enqueueJob, getQueueDepth, processAllJobs } from '../../lib/jobQueue';

describe('jobQueue', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('enqueues and processes jobs', async () => {
        let processed = 0;
        enqueueJob('cloud_sync', { ok: true });
        expect(getQueueDepth()).toBe(1);

        await processAllJobs({
            cloud_sync: async () => {
                processed += 1;
            }
        });

        expect(processed).toBe(1);
        expect(getQueueDepth()).toBe(0);
    });

    it('retries failed jobs and eventually drops them', async () => {
        enqueueJob('cloud_sync', { ok: false }, 2);

        await processAllJobs({
            cloud_sync: async () => {
                throw new Error('fail');
            }
        });

        expect(getQueueDepth()).toBe(0);
    });
});
