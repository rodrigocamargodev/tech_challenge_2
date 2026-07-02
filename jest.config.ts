import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Procura por arquivos de teste dentro da pasta tests/ ou src/
  testMatch: ['**/tests/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  // Coleta dados de cobertura de código
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/services/**/*.ts',
    'src/controllers/**/*.ts',
    'src/routes/**/*.ts'
  ],
  // Garante que o build falhe se a cobertura cair abaixo de 100%
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};

export default config;