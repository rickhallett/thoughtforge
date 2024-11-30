/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/packages/backend/src',
    '<rootDir>/packages/shared/src',
    '<rootDir>/tests',
  ],
  moduleNameMapper: {
    '^@thoughtforge/shared/(.*)$': '<rootDir>/packages/shared/$1',
    '^@thoughtforge/backend/(.*)$': '<rootDir>/packages/backend/$1'
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.+(ts|tsx|js)',
    '<rootDir>/tests/**/*.spec.+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.base.json'
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleDirectories: ['node_modules'],
};
