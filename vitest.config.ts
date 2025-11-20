import { cpus } from 'node:os';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const cpuCount = cpus().length || 1;
const maxWorkers = Math.min(4, Math.max(1, Math.floor(cpuCount / 2))); // keep CI from spawning too many jsdom workers

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    testTimeout: 20000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    logHeapUsage: true,
    maxWorkers,
    minWorkers: 1,
    reporters: process.env.CI ? ['dot', 'default'] : 'default',
  },
});

