
import { Request, Response } from 'express';
import { HealthcheckController } from '../../src/controllers/healthcheckController';
import HealthcheckService from '../../src/services/healthcheckService';

// Mock the HealthcheckService
jest.mock('../../src/services/healthcheckService');

describe('HealthcheckController', () => {
  let healthcheckController: HealthcheckController;
  let mockHealthcheckService: jest.Mocked<HealthcheckService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock response with spy
    jsonSpy = jest.fn();
    mockResponse = {
      json: jsonSpy,
    };

    // Create mock request
    mockRequest = {};

    // Setup mock HealthcheckService
    mockHealthcheckService = {
      ping: jest.fn(),
      checkHealth: jest.fn(),
    } as unknown as jest.Mocked<HealthcheckService>;

    // Replace the mock implementation
    (HealthcheckService as jest.MockedClass<typeof HealthcheckService>).mockImplementation(() => mockHealthcheckService);

    // Create controller instance
    healthcheckController = new HealthcheckController();
  });

  describe('ping', () => {
    it('should return pong message', async () => {
      // Arrange
      mockHealthcheckService.ping.mockResolvedValue();

      // Act
      await healthcheckController.ping(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockHealthcheckService.ping).toHaveBeenCalledTimes(1);
      expect(jsonSpy).toHaveBeenCalledWith({ message: 'pong' });
    });
  });
});
