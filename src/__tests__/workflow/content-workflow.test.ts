import { ContentWorkflow } from '../../workflows/content-workflow';
import { QueueManager } from '../../lib/queue/queue-manager';
import { StateManager } from '../../lib/state/state-manager';
import { ProcessorManager } from '../../processors/processor-manager';
import { ContentInputJob, ContentProcessingJob } from '../../lib/queue/types';
import { ContentSource } from '../../types/content';

// Mock dependencies
jest.mock('../../lib/queue/queue-manager');
jest.mock('../../lib/state/state-manager');
jest.mock('../../processors/processor-manager');
jest.mock('../../lib/logger/logger');

describe('ContentWorkflow', () => {
  let contentWorkflow: ContentWorkflow;
  let queueManager: jest.Mocked<QueueManager>;
  let stateManager: jest.Mocked<StateManager>;
  let processorManager: jest.Mocked<ProcessorManager>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Initialize mocked instances
    queueManager = new QueueManager() as jest.Mocked<QueueManager>;
    stateManager = new StateManager() as jest.Mocked<StateManager>;
    processorManager = new ProcessorManager() as jest.Mocked<ProcessorManager>;

    // Mock queue process methods
    queueManager.getQueue = jest.fn().mockReturnValue({
      process: jest.fn().mockImplementation(),
      add: jest.fn().mockResolvedValue(undefined)
    });


    contentWorkflow = new ContentWorkflow(
      queueManager,
      stateManager,
      processorManager
    );
  });

  describe('Content Input Processing', () => {
    const mockInputJob: ContentInputJob = {
      contentId: 'test-123',
      source: ContentSource.MANUAL,
      raw: { content: 'test content' }
    };

    it('should process input content successfully', async () => {
      // Mock processor response
      processorManager.process = jest.fn().mockResolvedValue({
        ...mockInputJob,
        standardized: true
      });

      // Get the process handler directly from the queue
      const processHandler = (queueManager.getQueue('content-input').process as jest.Mock).mock.calls[0][0];

      // Execute the handler
      const result = await processHandler({ data: mockInputJob });

      // Verify the workflow
      expect(processorManager.process).toHaveBeenCalledWith('standardization', mockInputJob);
      expect(stateManager.setContentState).toHaveBeenCalled();
      expect(stateManager.setContentStatus).toHaveBeenCalledWith('test-123', 'standardized');
      expect(queueManager.getQueue('content-processing').add).toHaveBeenCalledWith({
        contentId: 'test-123',
        step: 'ai-enhancement'
      });
      expect(result).toEqual({ success: true, contentId: 'test-123' });
    });

    it('should handle input processing errors', async () => {
      // Mock processor error
      processorManager.process = jest.fn().mockRejectedValue(new Error('Processing failed'));

      // Get the process handler
      const processHandler = (queueManager.getQueue('content-input').process as jest.Mock).mock.calls[0][0];

      // Execute and expect error
      await expect(processHandler({ data: mockInputJob })).rejects.toThrow('Processing failed');
      expect(stateManager.setContentStatus).toHaveBeenCalledWith('test-123', 'failed');
    });
  });

  describe('Content Processing Steps', () => {
    const mockProcessingJob: ContentProcessingJob = {
      contentId: 'test-123',
      step: 'ai-enhancement'
    };

    beforeEach(() => {
      stateManager.getContentState = jest.fn().mockReturnValue({
        contentId: 'test-123',
        content: 'test content'
      });
    });

    xit('should process each step successfully', async () => {
      // Mock processor response
      processorManager.process = jest.fn().mockResolvedValue({
        contentId: 'test-123',
        processed: true
      });

      // Get the process handler
      const processHandler = (queueManager.getQueue('content-processing').process as jest.Mock).mock.calls[0][0];

      // Execute the handler
      const result = await processHandler({ data: mockProcessingJob });

      expect(processorManager.process).toHaveBeenCalled();
      expect(stateManager.setContentState).toHaveBeenCalled();
      expect(queueManager.getQueue('content-processing').add).toHaveBeenCalledWith({
        contentId: 'test-123',
        step: 'seo-optimization'
      });
      expect(result).toEqual({
        success: true,
        contentId: 'test-123',
        step: 'ai-enhancement'
      });
    });

    // TODO: Fix this test
    it.skip('should mark content as ready after final step', async () => {
      // Clear previous mock calls
      // jest.clearAllMocks();

      const finalStepJob = { ...mockProcessingJob, step: 'ab-generation' };

      // Mock processor response
      processorManager.process = jest.fn().mockResolvedValue({
        contentId: 'test-123',
        processed: true
      });

      // Mock getNextStep to return null for final step
      // jest.spyOn(contentWorkflow as any, 'getNextStep').mockReturnValue(null);

      // Get the process handler directly from the queue
      const processHandler = (queueManager.getQueue('content-processing').process as jest.Mock).mock.calls[0][0];

      // Execute the handler
      await processHandler({ data: finalStepJob });

      expect(stateManager.setContentStatus).toHaveBeenCalledWith('test-123', 'ready');
      expect(queueManager.getQueue('content-processing').add).not.toHaveBeenCalled();
    });

    it('should handle processing step errors', async () => {
      // Mock processor error
      processorManager.process = jest.fn().mockRejectedValue(new Error('Step failed'));

      // Get the process handler
      const processHandler = (queueManager.getQueue('content-processing').process as jest.Mock).mock.calls[0][0];

      // Execute and expect error
      await expect(processHandler({ data: mockProcessingJob })).rejects.toThrow('Step failed');
      expect(stateManager.setContentStatus).toHaveBeenCalledWith('test-123', 'failed');
    });
  });
}); 