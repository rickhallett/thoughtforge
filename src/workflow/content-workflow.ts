import { ProcessorManager } from "../processors/processor-manager";
import { QueueManager } from "../lib/queue/queue-manager";
import { StateManager } from "../lib/state/state-manager";
import { logger } from "../logger/logger";
import { ContentInputJob, ContentProcessingJob } from "src/lib/queue/types";

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
        private stateManager: StateManager,
        private processorManager: ProcessorManager
    ) {
        this.initializeProcessors();
    }

    private initializeProcessors() {
        // Set up input queue processor
        this.queueManager
            .getQueue('content-input')
            .process(async (job) => {
                return this.handleContentInput(job.data);
            });

        // Set up processing queue processor
        this.queueManager
            .getQueue('content-processing')
            .process(async (job) => {
                return this.handleProcessingStep(job.data);
            });
    }

    private async handleContentInput(job: ContentInputJob) {
        logger.info('Processing input content', {
            contentId: job.contentId,
            source: job.source
        });

        try {
            // Standardize the content
            const standardizedContent = await this.processorManager.process('standardization', job);

            // Update state
            this.stateManager.setContentState(job.contentId, standardizedContent);
            this.stateManager.setContentStatus(job.contentId, 'standardized');

            // Queue next processing step
            await this.queueManager
                .getQueue('content-processing')
                .add({
                    contentId: job.contentId,
                    step: 'ai-enhancement'
                });

            return { success: true, contentId: job.contentId };
        } catch (error) {
            logger.error('Content input processing failed', {
                contentId: job.contentId,
                error
            });
            this.stateManager.setContentStatus(job.contentId, 'failed');
            throw error;
        }
    }

    private async handleProcessingStep(job: ContentProcessingJob) {
        const { contentId, step } = job;
        logger.info('Processing content step', { contentId, step });

        try {
            const content = this.stateManager.getContentState(contentId);
            if (!content) {
                throw new Error(`Content not found: ${contentId}`);
            }

            // Process using the processor manager
            const BaseContent = await this.processorManager.process(step, content);
            this.stateManager.setContentState(contentId, BaseContent);

            // Queue next step or finish
            const nextStep = this.getNextStep(step);
            if (nextStep) {
                await this.queueManager
                    .getQueue('content-processing')
                    .add({
                        contentId,
                        step: nextStep
                    });
            } else {
                this.stateManager.setContentStatus(contentId, 'ready');
            }

            return { success: true, contentId, step };
        } catch (error) {
            logger.error('Processing step failed', {
                contentId,
                step,
                error
            });
            this.stateManager.setContentStatus(contentId, 'failed');
            throw error;
        }
    }

    private getNextStep(currentStep: string): string | null {
        const steps = [
            'standardization',
            'ai-enhancement',
            'seo-optimization',
            'ab-generation'
        ];

        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex === -1 || currentIndex === steps.length - 1) {
            return null;
        }

        return steps[currentIndex + 1];
    }
}