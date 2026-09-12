import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'build', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/*/src/**/*.ts', 'services/*/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/index.ts'],
    },
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@blacksentinel/shared': path.resolve(__dirname, 'packages/shared/src'),
      '@blacksentinel/workflow-engine': path.resolve(__dirname, 'services/workflow-engine/src'),
      '@blacksentinel/event-bus': path.resolve(__dirname, 'services/event-bus/src'),
      '@blacksentinel/connector-service': path.resolve(__dirname, 'services/connector-service/src'),
    },
  },
});
