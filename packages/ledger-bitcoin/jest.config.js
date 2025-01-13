import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  testEnvironment: "node",
  rootDir: __dirname,
  coveragePathIgnorePatterns: [],
};

export default config