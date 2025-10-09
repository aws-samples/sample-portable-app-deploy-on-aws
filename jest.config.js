/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  projects: [
    '<rootDir>/src/01-Monolith',
    '<rootDir>/src/02-Layered',
    '<rootDir>/src/03-HexagonalArchitecture',
    '<rootDir>/src/04-CleanArchitecture'
  ],
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: true
};
