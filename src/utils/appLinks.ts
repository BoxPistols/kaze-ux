/**
 * アプリ間リンク
 *
 * 本番: BASE_URL ベースの相対パス
 * ローカル: localStorage に保存されたポート設定を使用
 *   初回は各アプリのデフォルトポートを使うが、変更可能
 */

const isDev = import.meta.env.DEV
const base = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? ''

const STORAGE_KEY = 'kaze-dev-ports'

interface DevPorts {
  top: number
  storybook: number
  saas: number
  ubereats: number
}

const DEFAULT_PORTS: DevPorts = {
  top: 5173,
  storybook: 6006,
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

const origin =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}`
    : 'http://localhost'

const resolve = (app: keyof DevPorts, prodPath: string): string => {
  if (isDev) {
    const ports = getDevPorts()
    return `${origin}:${ports[app]}`
  }
  return `${base}${prodPath}`
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
