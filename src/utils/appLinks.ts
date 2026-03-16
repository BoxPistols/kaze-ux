/**
 * アプリ間リンクのヘルパー
 * ローカル開発: ポートベース（各アプリが別ポートで起動）
 * 本番（GH Pages等）: 相対パス（BASE_URL を考慮）
 */

const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1')

const base = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? ''

// ローカルポートは vite.config で定義された値
const LOCAL_PORTS = {
  top: 5173,
  storybook: 6006,
  saas: 3001,
  ubereats: 3002,
} as const

const resolveUrl = (app: keyof typeof LOCAL_PORTS, path: string): string => {
  if (isLocal) {
    return `http://localhost:${LOCAL_PORTS[app]}`
  }
  return `${base}${path}`
}

/**
 * 全アプリリンク一覧
 */
export const APP_LINKS = {
  top: () => resolveUrl('top', '/'),
  storybook: () => resolveUrl('storybook', '/storybook/'),
  saas: () => resolveUrl('saas', '/saas/'),
  ubereats: () => resolveUrl('ubereats', '/ubereats/'),
  github: () => 'https://github.com/BoxPistols/kaze-ux',
}

/**
 * 単体 URL 取得（互換用）
 */
export const getAppUrl = (app: keyof typeof LOCAL_PORTS): string => {
  const pathMap = { top: '/', storybook: '/storybook/', saas: '/saas/', ubereats: '/ubereats/' }
  return resolveUrl(app, pathMap[app])
}
