import { ContentStandardizer } from '../../processors/content-standardizer';
import { ContentInputJob } from '../../lib/queue/types';
import { ContentSource } from '../../types/content';

jest.mock('../../lib/logger/Logger');

describe('ContentStandardizer', () => {
  let standardizer: ContentStandardizer;

  beforeEach(() => {
    standardizer = new ContentStandardizer();
  });

  describe('process', () => {
    it('should successfully process email content', async () => {
      const job: ContentInputJob = {
        contentId: 'test-123',
        source: 'email' as ContentSource,
        raw: {
          content: 'Email body content',
          metadata: {
            emailSubject: 'Test Email',
            from: 'sender@test.com',
            date: '2024-03-20T12:00:00Z'
          }
        }
      };

      const result = await standardizer.process(job);

      expect(result).toMatchObject({
        id: 'test-123',
        title: 'Test Email',
        body: 'Email body content',
        source: 'email',
        status: 'processing',
        metadata: {
          originalSource: 'email',
          processingSteps: ['standardization'],
          emailFrom: 'sender@test.com',
          emailSubject: 'Test Email',
          emailDate: '2024-03-20T12:00:00Z'
        }
      });
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should successfully process web content', async () => {
      const job: ContentInputJob = {
        contentId: 'web-123',
        source: 'web' as ContentSource,
        raw: {
          content: 'Web page content',
          metadata: {
            pageTitle: 'Test Web Page',
            url: 'https://test.com',
            html: '<html>content</html>'
          }
        }
      };

      const result = await standardizer.process(job);

      expect(result).toMatchObject({
        id: 'web-123',
        title: 'Test Web Page',
        body: 'Web page content',
        source: 'web',
        metadata: {
          originalSource: 'web',
          processingSteps: ['standardization'],
          sourceUrl: 'https://test.com',
          originalHtml: '<html>content</html>'
        }
      });
    });

    it('should successfully process voice content', async () => {
      const job: ContentInputJob = {
        contentId: 'voice-123',
        source: 'voice' as ContentSource,
        raw: {
          content: 'Transcribed voice content',
          metadata: {
            title: 'Voice Recording',
            duration: 120,
            format: 'mp3',
            confidence: 0.95
          }
        }
      };

      const result = await standardizer.process(job);

      expect(result).toMatchObject({
        id: 'voice-123',
        title: 'Voice Recording',
        body: 'Transcribed voice content',
        source: 'voice',
        metadata: {
          originalSource: 'voice',
          processingSteps: ['standardization'],
          audioLength: 120,
          audioFormat: 'mp3',
          transcriptionConfidence: 0.95
        }
      });
    });

    it('should handle missing metadata gracefully', async () => {
      const job: ContentInputJob = {
        contentId: 'manual-123',
        source: 'manual' as ContentSource,
        raw: {
          content: 'Manual content'
        }
      };

      const result = await standardizer.process(job);

      expect(result).toMatchObject({
        id: 'manual-123',
        title: 'Manual Entry',
        body: 'Manual content',
        source: 'manual',
        metadata: {
          originalSource: 'manual',
          processingSteps: ['standardization']
        }
      });
    });

    it('should throw error for unsupported content source', async () => {
      const job: ContentInputJob = {
        contentId: 'invalid-123',
        source: 'invalid' as ContentSource,
        raw: {
          content: 'Content'
        }
      };

      await expect(standardizer.process(job)).rejects.toThrow(
        'Unsupported content source: invalid'
      );
    });

    it('should preserve existing metadata when standardizing', async () => {
      const job: ContentInputJob = {
        contentId: 'test-123',
        source: 'manual' as ContentSource,
        raw: {
          content: 'Content',
          metadata: {
            existingField: 'should remain',
            author: 'Test Author'
          }
        }
      };

      const result = await standardizer.process(job);

      expect(result.metadata).toMatchObject({
        existingField: 'should remain',
        author: 'Test Author',
        originalSource: 'manual',
        processingSteps: ['standardization']
      });
    });
  });
}); 