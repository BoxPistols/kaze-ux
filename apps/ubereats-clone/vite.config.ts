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
    base: isGitHubPages ? '/kaze-ux/demo/ubereats-clone/' : '/',
    build: {
      outDir: isGitHubPages ? '../../gh-pages/demo/ubereats-clone' : 'dist',
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
      port: 3002,
    },
    css: {
      postcss: './postcss.config.cjs',
    },
  }
})
