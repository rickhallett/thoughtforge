import { QueueManager } from "../../lib/queue/queue-manager";

jest.mock('../../lib/logger/Logger');

describe('QueueManager', () => {
    let queueManager: QueueManager;

    beforeEach(() => {
        queueManager = new QueueManager();
    });

    afterEach(async () => {
        // Clean up queues after each test
        const queue = queueManager.getQueue('content-input');
        await queue.empty();
        await queue.close();
    });

    it('should connect to Redis successfully', async () => {
        const queue = queueManager.getQueue('content-input');

        // Test connection by pinging Redis
        const client = await queue.client;
        const ping = await client.ping();
        expect(ping).toBe('PONG');
    });

    it('should fail gracefully with invalid Redis connection', async () => {
        // Create a queue manager with invalid Redis config
        const invalidQueueManager = new QueueManager({
            host: 'invalid-host',
            connectTimeout: 1000,
            maxRetriesPerRequest: 1,
        });

        const queue = invalidQueueManager.getQueue('content-input');

        // Try to perform an operation that requires Redis connection
        await expect(async () => {
            await queue.add({ test: true });
        }).rejects.toThrow();
    }, 10000);

    it('should be able to add and process jobs', async () => {
        const queue = queueManager.getQueue('content-input');

        // Add a test processor
        queue.process(async (job) => {
            return { processed: true, data: job.data };
        });

        // Add a job
        const job = await queue.add({ test: true });

        // Wait for job completion
        const result = await job.finished();

        expect(result).toEqual({
            processed: true,
            data: { test: true }
        });
    });
});