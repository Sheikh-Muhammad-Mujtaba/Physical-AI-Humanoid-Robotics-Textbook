/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/css/(.*)$': '<rootDir>/src/css/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.docusaurus/',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.docusaurus/',
    '/build/',
  ],
};

module.exports = config;
