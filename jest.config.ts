/* eslint @typescript-eslint/indent: ["error", 2] */
import type { InitialOptionsTsJest } from 'ts-jest/dist/types';

const jestConfig: InitialOptionsTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./setupTests.ts'],
  moduleNameMapper: {
    'css$': 'identity-obj-proxy',
    'src/(.*)': '<rootDir>/src/$1',
  },
};

export default jestConfig;
