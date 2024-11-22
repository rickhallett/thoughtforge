import Bull, { Queue } from "bull";
import { logger } from "../logger/logger";
import { LoggerUtils } from "../logger/utils";

export class QueueManager {
  private queues: Map<string, Queue>;
  private redisOptions: Bull.QueueOptions['redis'];
  private logger: ReturnType<typeof logger.child>;

  constructor(redisOptions?: Bull.QueueOptions['redis']) {
    this.queues = new Map();
    this.redisOptions = redisOptions;
    this.logger = logger.child({ module: 'QueueManager' });

    this.createQueue('content-input');
    this.createQueue('content-processing');

  }

  private createQueue(name: string): Queue {
    const queue = new Bull(name, {
      redis: this.redisOptions,
      // Optional: default job options
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: false
      }
    });

    queue.on('error', (error) => {
      LoggerUtils.logError(error, `Queue ${name}`, { queueName: name });
    });

    queue.on('failed', (job, result) => {
      LoggerUtils.logError(result, `Queue ${name} failed job ${job.id}`, { queueName: name, jobId: job.id, attemptsMade: job.attemptsMade });
    });

    this.queues.set(name, queue);
    // this.logger.info(`Queue ${name} created`);
    return queue;
  }

  getQueue(name: string): Queue {
    const queue = this.queues.get(name);
    if (!queue) throw new Error(`Queue ${name} not found`);
    return queue;
  }
}