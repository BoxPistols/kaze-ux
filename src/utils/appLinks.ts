/**
 * アプリ間リンクのヘルパー
 * 常に相対パスで解決（Vercel / GitHub Pages デプロイ想定）
 * ローカル開発時は各アプリを個別に起動してブラウザで直接アクセスする
 */

const routes = {
  top: '/',
  storybook: '/storybook/',
  saas: '/saas/',
  ubereats: '/ubereats/',
} as const

/**
 * アプリの相対パス URL を返す
 */
export const getAppUrl = (app: keyof typeof routes): string => routes[app]

/**
 * 全アプリリンク一覧
 */
export const APP_LINKS = {
  top: () => getAppUrl('top'),
  storybook: () => getAppUrl('storybook'),
  saas: () => getAppUrl('saas'),
  ubereats: () => getAppUrl('ubereats'),
  github: () => 'https://github.com/BoxPistols/kaze-ux',
}
