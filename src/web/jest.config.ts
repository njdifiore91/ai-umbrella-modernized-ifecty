import type { Config } from '@jest/types';
import { compilerOptions } from './tsconfig.json';

// Convert tsconfig paths to moduleNameMapper format
const pathsToModuleNameMapper = (paths: Record<string, string[]>, rootDir: string): Record<string, string> => {
  const moduleNameMapper: Record<string, string> = {};
  Object.entries(paths).forEach(([alias, [path]]) => {
    // Remove wildcard and convert to Jest format
    const key = `^${alias.replace('/*', '/(.*)$')}`;
    const value = `${rootDir}/${path.replace('/*', '/$1')}`;
    moduleNameMapper[key] = value;
  });
  return moduleNameMapper;
};

// Jest configuration
const config: Config.InitialOptions = {
  // Use ts-jest for TypeScript support
  preset: 'ts-jest',

  // Use jsdom for browser environment simulation
  testEnvironment: 'jsdom',

  // Root directory for tests
  roots: ['<rootDir>/src'],

  // Module name mapping for path aliases and assets
  moduleNameMapper: {
    // Convert TypeScript path aliases
    ...pathsToModuleNameMapper(compilerOptions.paths, '<rootDir>/src'),
    
    // Handle static assets and styles
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/utils/test.utils.ts'
  },

  // Setup files to run after Jest is initialized
  setupFilesAfterEnv: ['@testing-library/jest-dom'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],

  // Transform files with ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },

  // File extensions to consider
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Coverage configuration
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts'
  ],

  // Coverage report directory
  coverageDirectory: 'coverage',

  // Enable verbose output
  verbose: true,

  // Test timeout in milliseconds
  testTimeout: 10000
};

export default config;