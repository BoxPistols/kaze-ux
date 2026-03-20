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
  skyKaze: number
}

const DEFAULT_PORTS: DevPorts = {
  top: 5173,
  storybook: 6007,
  saas: 3001,
  ubereats: 3002,
  skyKaze: 3003,
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

/** localhost / 127.0.0.1 かどうか */
const isLocalhost = (): boolean => {
  if (typeof window === 'undefined') return true
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1'
}

const resolve = (app: keyof DevPorts, prodPath: string): string => {
  if (isDev && isLocalhost()) {
    // ローカル開発 & localhost: アプリごとに異なるポートで起動
    const ports = getDevPorts()
    return `http://${window.location.hostname}:${ports[app]}`
  }
  // Vercel・本番・非localhost: 現在の origin からの相対パスで解決
  return `${getOrigin()}${prodPath}`
}

export const APP_LINKS = {
  top: () => resolve('top', '/'),
  storybook: () => resolve('storybook', '/storybook/'),
  saas: () => resolve('saas', '/saas/'),
  ubereats: () => resolve('ubereats', '/ubereats/'),
  skyKaze: () => resolve('skyKaze', '/sky-kaze/'),
  github: () => 'https://github.com/BoxPistols/kaze-ux',
}

// ---------------------------------------------------------------------------
// ポート生存チェック
// ---------------------------------------------------------------------------

/**
 * 指定ポートでdev serverが起動しているか確認
 * fetch で HEAD リクエストを送り、応答があれば true
 */
export const checkPortAlive = async (port: number): Promise<boolean> => {
  if (typeof window === 'undefined') return false
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1500)
    await fetch(
      `${window.location.protocol}//${window.location.hostname}:${port}/`,
      { method: 'HEAD', mode: 'no-cors', signal: controller.signal }
    )
    clearTimeout(timeout)
    // no-cors では opaque response が返るが、接続できれば true
    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// 全ポート一括チェック + キャッシュ
// ---------------------------------------------------------------------------

export interface PortStatus {
  port: number
  alive: boolean
}

let cachedStatus: Record<string, PortStatus> | null = null
let cacheTimestamp = 0
const CACHE_TTL = 30_000 // 30秒キャッシュ

/**
 * 全アプリのポート生存状態を一括チェック
 * 本番環境では全て alive 扱い
 */
export const checkAllPorts = async (): Promise<Record<string, PortStatus>> => {
  // 本番環境では全て alive
  if (!isDev) {
    const ports = getDevPorts()
    return Object.fromEntries(
      (Object.entries(ports) as [string, number][]).map(([key, port]) => [
        key,
        { port, alive: true },
      ])
    )
  }

  // キャッシュが有効ならそのまま返す
  if (cachedStatus && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedStatus
  }

  const ports = getDevPorts()
  const entries = Object.entries(ports) as [string, number][]
  const results = await Promise.all(
    entries.map(async ([key, port]) => ({
      key,
      port,
      alive: await checkPortAlive(port),
    }))
  )

  cachedStatus = Object.fromEntries(
    results.map((r) => [r.key, { port: r.port, alive: r.alive }])
  )
  cacheTimestamp = Date.now()
  return cachedStatus
}

/** キャッシュを手動クリアして再チェックさせる */
export const invalidatePortCache = (): void => {
  cachedStatus = null
  cacheTimestamp = 0
}

export { DEFAULT_PORTS, getDevPorts }
export type { DevPorts }
