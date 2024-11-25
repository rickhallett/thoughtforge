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

  describe('GET /api/health/status', () => {
    it('should return health check status', async () => {
      const response = await request(app)
        .get('/api/health/status')
        .expect(200);

      expect(response.body).toHaveProperty('results');
    });
  });
});