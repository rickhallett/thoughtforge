import { QueueManager } from "../lib/queue/QueueManager";
import { StateManager } from "../lib/state/StateManager";

export class ContentWorkflow {
  constructor(
      private queueManager: QueueManager,
      private stateManager: StateManager
  ) {}

  async handleNewContent(content: string): Promise<string> {
      const contentId = `content_${Date.now()}`;
      
      // Store content
      this.stateManager.set(contentId, content);
      
      // Add to queue
      await this.queueManager
          .getQueue('content-input')
          .add({ contentId });

      return contentId;
  }
}