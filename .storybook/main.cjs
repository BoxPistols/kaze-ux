const path = require('path')

const { mergeConfig, loadEnv } = require('vite')

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
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
        },
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
