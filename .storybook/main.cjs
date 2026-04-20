const path = require('path')
const { fileURLToPath } = require('node:url')

const { mergeConfig, loadEnv } = require('vite')

/**
 * preventive: pnpm + Storybook 10 + MDX で addon-docs の MDX loader が
 * `file:///...@storybook/addon-docs/dist/mdx-react-shim.js` のような
 * file:// 絶対 URL で import を emit することがあり、Vite の
 * `vite:import-analysis` がこれを解決できず dev server でクラッシュする
 * (「Failed to fetch dynamically imported module」/「Failed to resolve import」)。
 * build は Rollup 経由で通るので CI 緑のまま dev だけ死ぬ latent bug。
 *
 * 対処: resolveId フックで file:// prefix を fileURLToPath で通常パスに変換。
 * 参考: Matlens (aeros-design-system) 並走診断 2026-04-20。
 */
const fileUrlResolvePlugin = {
  name: 'kaze:resolve-file-url',
  enforce: 'pre',
  resolveId(source) {
    if (typeof source === 'string' && source.startsWith('file://')) {
      return fileURLToPath(source)
    }
    return null
  },
}

// 環境変数を読み込む（.envファイルとprocess.envの両方から）
const envFromFile = loadEnv(
  'development',
  path.resolve(__dirname, '..'),
  'VITE_'
)
// CI環境では環境変数が直接設定されるため、process.envも確認
const env = {
  ...envFromFile,
  VITE_APP_PASSWORD:
    process.env.VITE_APP_PASSWORD || envFromFile.VITE_APP_PASSWORD || '',
}

const config = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: false,
    check: false,
  },
  // Manager（サイドバー・ツールバー）に認証スクリプトを注入
  managerHead: (head) => {
    const password = env.VITE_APP_PASSWORD || ''
    // パスワード未設定の場合は認証スクリプトを注入しない
    if (!password) {
      return head
    }
    return `
    <script>
      window.__STORYBOOK_AUTH_PASSWORD__ = ${JSON.stringify(password)};
    </script>
    ${head}
  `
  },
  async viteFinal(config, { configType }) {
    // 環境変数を明示的に読み込む（.envファイルから）
    const freshEnv = loadEnv(configType, path.resolve(__dirname, '..'), 'VITE_')

    return mergeConfig(config, {
      plugins: [fileUrlResolvePlugin],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
        },
      },
      // esbuild の target を esnext に上げて、
      // Storybook が注入する supported overrides (destructuring 強制降格) を回避
      build: {
        target: 'esnext',
      },
      // 環境変数をdefineに追加
      define: {
        'import.meta.env.VITE_APP_PASSWORD': JSON.stringify(
          freshEnv.VITE_APP_PASSWORD || ''
        ),
        'import.meta.env.VITE_MAPBOX_ACCESS_TOKEN': JSON.stringify(
          freshEnv.VITE_MAPBOX_ACCESS_TOKEN || ''
        ),
        'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(
          freshEnv.VITE_OPENAI_API_KEY || ''
        ),
        'import.meta.env.VITE_OPENAI_MODEL': JSON.stringify(
          freshEnv.VITE_OPENAI_MODEL || 'gpt-5.4-nano'
        ),
      },
    })
  },
}

module.exports = config
