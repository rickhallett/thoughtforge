jest.mock('../../lib/logger/Logger', () => ({
  logger: {
    child: jest.fn().mockReturnValue({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    }),
    debug: jest.fn()
  }
}));

import { ContentWorkflow } from '../../workflows/ContentWorkflow';
import { QueueManager } from '../../lib/queue/QueueManager';
import { StateManager } from '../../lib/state/StateManager';

describe('ContentWorkflow', () => {
  let queueManager: QueueManager;
  let stateManager: StateManager;
  let workflow: ContentWorkflow;

  beforeEach(async () => {
    queueManager = new QueueManager();
    stateManager = new StateManager();
    workflow = new ContentWorkflow(queueManager, stateManager);

    // Clean up any existing jobs before test
    const queue = queueManager.getQueue('content-input');
    await queue.clean(0, 'wait');
  });

  afterEach(async () => {
    // Clean up after test
    const queue = queueManager.getQueue('content-input');
    await queue.clean(0, 'wait');
    await queue.close();
  });

  it('should handle new content', async () => {
    const contentId = await workflow.handleNewContent('test content');

    expect(stateManager.get(contentId)).toBe('test content');

    // Check queue has job
    const jobs = await queueManager.getQueue('content-input').getJobs(['waiting']);
    expect(jobs.length).toBe(1);

    // Clean up specific test data
    stateManager.remove(contentId);
  });
});