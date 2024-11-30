// Global logger mock
jest.mock('@thoughtforge/shared/src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  requestLogger: jest.fn((req, res, next) => next()),
})); // TODO: move this to shared
