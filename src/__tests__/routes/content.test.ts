

import request from 'supertest';
import app from '../../app';
import { ContentSource } from '../../types/content';

describe('Content Routes', () => {
  describe('POST /content/submit?source=manual', () => {
    it('should process valid content successfully', async () => {
      const response = await request(app)
        .post('/content/submit?source=manual')
        .send({
          body: 'Test content',
          source: ContentSource.MANUAL
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Content processed successfully',
        content: {
          body: 'Test content',
          source: ContentSource.MANUAL,
          status: 'processed'
        }
      });
    });

    it('should return 400 when body is missing', async () => {
      const response = await request(app)
        .post('/content/submit?source=manual')
        .send({
          source: ContentSource.MANUAL
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Invalid request',
        details: 'Body is required'
      });
    });

    it('should handle invalid source type', async () => {
      const response = await request(app)
        .post('/content/submit?source=manual')
        .send({
          body: 'Test content',
          source: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Invalid request',
        details: 'Invalid source'
      });
    });
  });

  describe('POST /content/submit?source=markdown', () => {
    it('should process valid markdown content successfully', async () => {
      const response = await request(app)
        .post('/content/submit?source=markdown')
        .send({
          body: '# Test content',
          source: ContentSource.MARKDOWN
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Content processed successfully',
        content: {
          body: '# Test content',
          source: ContentSource.MARKDOWN,
          status: 'processed'
        }
      });
    });
  });
});