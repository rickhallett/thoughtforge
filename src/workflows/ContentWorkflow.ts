import { QueueManager } from "../lib/queue/QueueManager";
import { StateManager } from "../lib/state/StateManager";

/**
 * ContentWorkflow is responsible for handling new content, processing it, and publishing it.
 *  
 * It does this by:
 * - Storing the content in the state manager
 * - Adding the content to the content-input queue
 * - Processing the content
 * - Publishing the content
 */
export class ContentWorkflow {
    constructor(
        private queueManager: QueueManager,
        private stateManager: StateManager
    ) { }

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