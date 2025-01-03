import request from 'supertest';
import app from '../../src/app';

describe('Health Check Integration Tests', () => {
  describe('GET /api/health/ping', () => {
    it('should return pong message', async () => {
      const response = await request(app)
        .get('/api/health/ping')
        .expect(200);

      expect(response.body).toEqual({ message: 'pong' });
    });
  });

  describe('GET /api/health/check', () => {
    it('should return health check status', async () => {
      const response = await request(app)
        .get('/api/health/check')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('healthy');
    });
  });
});