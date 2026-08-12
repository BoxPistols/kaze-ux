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
      // json-summary があると coverage/coverage-summary.json から
      // 数値をそのまま読める（自動化・報告用）
      reporter: ['text', 'json', 'json-summary', 'html'],
      // 除外するのは「生成物」だけにする。ソースを都合よく外すと
      // 数字は上がるが実態を表さなくなる。
      //
      // storybook-static を外していなかったため、minify 済みの
      // ベンダーバンドルだけで 114,000 statements (全体の 69%) が
      // 0% として計上され、実態 27.5% が 8.5% と表示されていた。
      // 末尾スラッシュだけの 'dist/' はルート直下しか外せず、
      // apps/*/dist が残るので ** で書く。
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        'coverage/**',
        'storybook-static/**',
        'gh-pages/**',
        'figma-plugin/code.js',
        'src/test/',
        'src/**/*.stories.tsx',
        'src/**/*.d.ts',
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
