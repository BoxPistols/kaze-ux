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
  // ブラウザのタブに出る名前。未設定だと Storybook は設定ディレクトリ名を
  // 使うので `storybook - Storybook` になる（実際そうなっていた）。
  // 末尾の ` - Storybook` は Storybook 側が付けるので、ここには書かない
  title: 'Kaze UX',
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

    // Vercel の計測。**manager（外枠）にだけ入れる。**
    // ストーリーは iframe の中で描画されるので、preview 側に入れると
    // 1 ストーリー開くたびに iframe の遷移まで数えてしまう。
    // 配信元が Vercel でないとき（ローカル等）は 404 になるだけで無害
    const analytics = [
      `<script defer src="/_vercel/insights/script.js"></script>`,
      `<script defer src="/_vercel/speed-insights/script.js"></script>`,
    ].join('')

    const auth = password
      ? `<script>window.__STORYBOOK_AUTH_PASSWORD__ = ${JSON.stringify(password)};</script>`
      : ''

    return `${auth}${analytics}${head}`
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
      // build.target は本番ビルドにしか効かない。dev サーバーの依存事前バンドルは
      // optimizeDeps 側の esbuild が担うため、同じ手当てをこちらにも入れる。
      // これが無いと @ai-sdk/gateway 等の destructuring が降格対象になり、
      // `storybook dev` が数千件のエラーで起動に失敗する。
      // @ai-sdk/gateway は addon-mcp ではなく本体依存の ai から来る
      // （`pnpm why @ai-sdk/gateway` で ai 6.x → @ai-sdk/gateway の 1 経路のみ）
      optimizeDeps: {
        esbuildOptions: {
          target: 'esnext',
          supported: { destructuring: true },
        },
      },
      // 環境変数をdefineに追加
      //
      // 資格情報は build（configType === 'PRODUCTION'）では常に空にする。
      // define した値はバンドルに平文で焼き込まれ、配信された時点で
      // 無認証の GET で誰でも取得できるため、共有ビルドに載せてはいけない。
      // 環境変数の設定漏れに頼らず、ビルド種別で機械的に落とす。
      // 公開ビルドで AI を動かす場合は VITE_API_BASE のバックエンド経由か、
      // 利用者が自分のキーを入力する運用（設定パネル）を使う。
      define: {
        'import.meta.env.VITE_APP_PASSWORD': JSON.stringify(
          freshEnv.VITE_APP_PASSWORD || ''
        ),
        'import.meta.env.VITE_MAPBOX_ACCESS_TOKEN': JSON.stringify(
          configType === 'PRODUCTION'
            ? ''
            : freshEnv.VITE_MAPBOX_ACCESS_TOKEN || ''
        ),
        'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(
          configType === 'PRODUCTION' ? '' : freshEnv.VITE_OPENAI_API_KEY || ''
        ),
        'import.meta.env.VITE_OPENAI_MODEL': JSON.stringify(
          freshEnv.VITE_OPENAI_MODEL || 'gpt-5.6-luna'
        ),
      },
    })
  },
}

module.exports = config
