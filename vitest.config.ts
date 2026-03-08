/// <reference types="vitest" />
/// <reference path="./src/test/vitest-matchers.d.ts" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
      include: ['**/*.{test,spec}.{ts,tsx}'],
    },
    exclude: ['**/node_modules/**', '**/dist/**', 'apps/**'],
    css: true,
    deps: { inline: ['@mui/x-data-grid'] },
    pool: 'forks',
    logHeapUsage: false,
    silent: false,
    reporters: ['verbose'],
    onStackTrace: (_, { file }) => {
      return !file.includes('node_modules')
    },
    outputFile: {
      json: './coverage/test-results.json',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.stories.tsx',
        'src/**/*.d.ts',
        'dist/',
        'coverage/',
        '**/*.config.{js,ts}',
      ],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('test'),
  },
})
