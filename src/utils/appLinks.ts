/**
 * アプリ間リンク
 *
 * 本番: BASE_URL ベースの相対パス
 * ローカル: localStorage に保存されたポート設定を使用
 *   初回は各アプリのデフォルトポートを使うが、変更可能
 */

/**
 * 現在の origin を基準にリンクを生成する。
 * - 本番（Vercel 等）: window.location.origin + パス
 * - ローカル開発: ポート別に解決（カスタマイズ可能）
 */

const isDev = import.meta.env.DEV

const STORAGE_KEY = 'kaze-dev-ports'

interface DevPorts {
  top: number
  storybook: number
  saas: number
  ubereats: number
}

const DEFAULT_PORTS: DevPorts = {
  top: 5173,
  storybook: 6007,
  saas: 3001,
  ubereats: 3002,
}

const getDevPorts = (): DevPorts => {
  if (typeof window === 'undefined') return DEFAULT_PORTS
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...DEFAULT_PORTS, ...JSON.parse(saved) }
  } catch {
    // ignore
  }
  return DEFAULT_PORTS
}

export const saveDevPorts = (ports: Partial<DevPorts>): void => {
  const current = getDevPorts()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...ports }))
}

/** 現在のページの origin を取得（protocol + hostname + port） */
const getOrigin = (): string =>
  typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:5173'

const resolve = (app: keyof DevPorts, prodPath: string): string => {
  if (isDev) {
    // ローカル開発: アプリごとに異なるポートで起動
    const protocol =
      typeof window !== 'undefined' ? window.location.protocol : 'http:'
    const hostname =
      typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    const ports = getDevPorts()
    return `${protocol}//${hostname}:${ports[app]}`
  }
  // 本番: 現在の origin からの相対パスで解決
  return `${getOrigin()}${prodPath}`
}

export const APP_LINKS = {
  top: () => resolve('top', '/'),
  storybook: () => resolve('storybook', '/storybook/'),
  saas: () => resolve('saas', '/saas/'),
  ubereats: () => resolve('ubereats', '/ubereats/'),
  github: () => 'https://github.com/BoxPistols/kaze-ux',
}

export { DEFAULT_PORTS, getDevPorts }
export type { DevPorts }
