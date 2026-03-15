/**
 * アプリ間リンクのヘルパー
 * ローカル開発時はポート番号ベース、Vercel デプロイ時は相対パスで解決
 */

const isLocalDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1')

interface AppRoute {
  /** Vercel デプロイ時の相対パス */
  path: string
  /** ローカル開発時のポート番号 */
  port: number
}

const routes: Record<string, AppRoute> = {
  top: { path: '/', port: 5173 },
  storybook: { path: '/storybook/', port: 6006 },
  saas: { path: '/saas/', port: 3001 },
  ubereats: { path: '/ubereats/', port: 3002 },
}

/**
 * アプリの URL を返す
 * ローカル: http://localhost:{port}
 * 本番: /{path}
 */
export const getAppUrl = (app: keyof typeof routes): string => {
  const route = routes[app]
  if (isLocalDev) {
    return `http://localhost:${route.port}`
  }
  return route.path
}

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
