/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  setupFiles: ['<rootDir>/test/setup-env.ts'],
  // @neviso/* resolve via node_modules (shared packages are built first).
  // Integration tests touch a real DB/Redis; give them room.
  testTimeout: 30000,
};
