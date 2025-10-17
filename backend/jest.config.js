/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',

  // Use babel-jest to handle ES modules
  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  // Patterns for finding test files
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.spec.js',
    '**/?(*.)+(spec|test).js',
  ],

  // Coverage collection
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    '!src/controllers/**/*.test.js',
    '!src/__tests__/**/*.js',
    '!src/scripts/**/*.js',
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageDirectory: 'coverage',

  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],

  testTimeout: 30000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  clearMocks: true,
  restoreMocks: true,

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  transformIgnorePatterns: ['node_modules/(?!(some-esm-package)/)'],
};
