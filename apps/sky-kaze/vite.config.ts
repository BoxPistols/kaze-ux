import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  const isGitHubPages = mode === 'gh-pages'

  return {
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),
    ],
    base: isGitHubPages
      ? '/kaze-ux/sky-kaze/'
      : process.env.VITE_BASE_PATH || '/',
    build: {
      // esbuild の destructuring 降格エラーを回避
      target: 'esnext',
      outDir: isGitHubPages ? '../../gh-pages/sky-kaze' : 'dist',
      emptyOutDir: true,
      sourcemap: !isGitHubPages,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../../src'),
        '~': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3003,
    },
    css: {
      postcss: './postcss.config.cjs',
    },
  }
})
