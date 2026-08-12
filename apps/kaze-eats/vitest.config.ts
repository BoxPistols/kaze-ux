import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts', '../../src/test/setup.ts'],
    css: true,
    deps: { inline: ['@mui/x-data-grid'] },
    pool: 'forks',
    reporters: ['verbose'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../src'),
      '~': path.resolve(__dirname, 'src'),
    },
  },
})
