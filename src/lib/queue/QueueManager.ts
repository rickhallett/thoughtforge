import Bull, { Queue } from "bull";

export class QueueManager {
  private queues: Map<string, Queue>;
  private redisOptions: Bull.QueueOptions['redis'];

  constructor(redisOptions?: Bull.QueueOptions['redis']) {
      this.queues = new Map();
      this.redisOptions = redisOptions;
      
      // Start with just one queue
      this.createQueue('content-input');
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

      this.queues.set(name, queue);
      return queue;
  }

  getQueue(name: string): Queue {
      const queue = this.queues.get(name);
      if (!queue) throw new Error(`Queue ${name} not found`);
      return queue;
  }
}