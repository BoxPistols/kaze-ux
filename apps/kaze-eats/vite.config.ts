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
    base: isGitHubPages ? '/kaze-ux/kaze-eats/' : (process.env.VITE_BASE_PATH || '/'),
    build: {
      // esbuild の destructuring 降格エラーを回避
      target: 'esnext',
      outDir: isGitHubPages ? '../../gh-pages/kaze-eats' : 'dist',
      emptyOutDir: true,
      sourcemap: !isGitHubPages,
    },
    // build.target は本番ビルドにしか効かない。dev サーバーの依存事前バンドルは
    // optimizeDeps 側の esbuild が担うため、同じ手当てをこちらにも入れる。
    // これが無いと依存の destructuring が降格対象になり `vite` が起動に失敗する
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
        supported: { destructuring: true },
      },
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
