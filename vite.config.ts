// vite.config.ts
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import type { PluginOption } from 'vite' // 型をインポート

export default defineConfig(({ mode }) => {
  // Storybookビルド時はライブラリモードを無効化
  const isStorybook = process.argv.some((arg) => arg.includes('storybook'))
  const isSandbox = mode === 'sandbox' || isStorybook
  // GitHub Pages用ビルド時はベースパスを設定
  const isGitHubPages = mode === 'gh-pages'
  // Webアプリケーションモード（サンドボックスまたはGitHub Pages）
  const isWebApp = isSandbox || isGitHubPages

  // ビルドモードを明確に判定してログ出力
  const buildMode = isGitHubPages ? 'GITHUB PAGES' : (isSandbox ? 'SANDBOX' : 'LIBRARY')
  console.log(`Building in ${buildMode} mode`)

  // プラグインを条件に応じて設定
  const plugins: PluginOption[] = [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ]

  // ライブラリモードの場合のみdtsプラグインを追加（Webアプリモードでは不要）
  if (!isWebApp) {
    plugins.push(
      dts({
        insertTypesEntry: true,
        include: ['src'],
      })
    )
  }

  return {
    plugins,
    // GitHub Pages用のベースパス設定
    // 環境変数 VITE_BASE_PATH が設定されていればそれを使用、なければリポジトリ名
    base: isGitHubPages ? (process.env.VITE_BASE_PATH || '/kaze-ux/') : '/',
    build: {
      // Webアプリモードとライブラリモードで異なる設定
      ...(isWebApp
        ? {
            // Webアプリモード（サンドボックス/GitHub Pages）: 通常のウェブアプリとしてビルド
            outDir: isGitHubPages ? 'gh-pages' : 'dist',
            emptyOutDir: true,
            sourcemap: !isGitHubPages, // GitHub Pagesではsourcemapを無効化
          }
        : {
            // ライブラリモード: ライブラリとしてビルド
            lib: {
              entry: path.resolve(__dirname, 'src/index.ts'),
              name: 'KazeUX',
              formats: ['es', 'cjs'],
              fileName: (format) => `index.${format === 'es' ? 'es.js' : 'js'}`,
            },
            rollupOptions: {
              external: [
                'react',
                'react-dom',
                '@mui/material',
                '@mui/icons-material',
                '@emotion/react',
                '@emotion/styled',
                '@mui/system',
              ],
              output: {
                globals: {
                  react: 'React',
                  'react-dom': 'ReactDOM',
                  '@mui/material': 'MuiMaterial',
                  '@emotion/react': 'emotionReact',
                  '@emotion/styled': 'emotionStyled',
                },
                // CSS を別ファイルとして出力
                assetFileNames: (assetInfo) => {
                  if (assetInfo.name === 'style.css') return 'index.css'
                  return assetInfo.name as string
                },
              },
            },
            outDir: 'dist',
            emptyOutDir: true,
            sourcemap: true,
          }),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      open: false,
    },
    css: {
      postcss: './postcss.config.cjs',
    },
  }
})
