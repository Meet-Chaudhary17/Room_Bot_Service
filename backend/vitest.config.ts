import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.integration.test.js'],
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 1,
      },
    },
  },
});
