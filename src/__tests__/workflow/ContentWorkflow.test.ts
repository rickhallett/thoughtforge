import { ContentWorkflow } from '../../workflows/ContentWorkflow';
import { QueueManager } from '../../lib/queue/QueueManager';
import { StateManager } from '../../lib/state/StateManager';  

describe('ContentWorkflow', () => {
  it('should handle new content', async () => {
      const queueManager = new QueueManager();
      const stateManager = new StateManager();
      const workflow = new ContentWorkflow(queueManager, stateManager);

      const contentId = await workflow.handleNewContent('test content');
      
      expect(stateManager.get(contentId)).toBe('test content');
      // Check queue has job
      const jobs = await queueManager.getQueue('content-input').getJobs(['waiting']);
      expect(jobs.length).toBe(1);
  });
});