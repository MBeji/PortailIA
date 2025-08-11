import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.spec.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
      enabled: false
    }
  }
});
