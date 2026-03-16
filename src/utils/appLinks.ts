/**
 * アプリ間リンクのヘルパー
 * Vite の BASE_URL を考慮して相対パスを解決
 * ローカル: / → /storybook/, /saas/, /ubereats/
 * GH Pages: /kaze-ux/ → /kaze-ux/storybook/, /kaze-ux/saas/, /kaze-ux/ubereats/
 */

const base = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? ''

const routes = {
  top: `${base}/`,
  storybook: `${base}/storybook/`,
  saas: `${base}/saas/`,
  ubereats: `${base}/ubereats/`,
} as const

/**
 * アプリの URL を返す
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
