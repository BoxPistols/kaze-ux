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
  kazeEats: number
  skyKaze: number
}

const DEFAULT_PORTS: DevPorts = {
  top: 5173,
  storybook: 6007,
  saas: 3001,
  kazeEats: 3002,
  skyKaze: 3003,
}

/**
 * 保存済みの設定を現在のキーに寄せる。
 *
 * KazeEats のポート設定は、以前は別のキー名で保存されていた。改名だけで
 * 済ませると、ポートを変えていた人の設定が無言で既定値に戻る（保存値は
 * 残っているのに参照されないので、原因にも辿り着けない）。
 *
 * 新しいキーが既にあるならそちらが新しい。旧キーで上書きすると、
 * 新旧の版を行き来した人の設定を古い値に巻き戻してしまう。
 */
/** 改名前のキー名。ここ 1 箇所だけに置く */
const LEGACY_KAZE_EATS_PORT_KEY = 'ubereats' // brand-check-allow: ubereats — 旧キー名

const migrate = (saved: Record<string, unknown>): Partial<DevPorts> => {
  const { [LEGACY_KAZE_EATS_PORT_KEY]: legacy, ...rest } = saved
  const ports = rest as Partial<DevPorts>
  if (typeof legacy !== 'number') return ports
  return { ...ports, kazeEats: ports.kazeEats ?? legacy }
}

const getDevPorts = (): DevPorts => {
  if (typeof window === 'undefined') return DEFAULT_PORTS
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...DEFAULT_PORTS, ...migrate(JSON.parse(saved)) }
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
  kazeEats: () => resolve('kazeEats', '/kaze-eats/'),
  skyKaze: () => resolve('skyKaze', '/sky-kaze/'),
  /**
   * ソースの公開先。**既定は未設定（＝リンクを出さない）。**
   *
   * この成果物は第三者へ URL で共有することがあり、その際に運営者個人へ
   * 辿れる導線を残さない。URL をコードに直接書くと、共有用ビルドにも
   * 必ず載る（実際に dist と storybook-static の両方に混入していた）。
   *
   * 出したい場合だけ `VITE_PUBLIC_REPO_URL` を与える。未設定なら
   * `null` を返し、呼び出し側はリンク自体を描画しない。
   */
  repository: (): string | null => import.meta.env.VITE_PUBLIC_REPO_URL || null,
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
// 近隣ポートスキャン
// ---------------------------------------------------------------------------

/**
 * デフォルトポートが応答しない場合、+1〜+5の範囲でスキャンする
 * 例: 3003 が応答しなければ 3004, 3005... を試す
 */
export const findActualPort = async (defaultPort: number): Promise<number> => {
  // まずデフォルトを試す
  if (await checkPortAlive(defaultPort)) return defaultPort
  // +1〜+5をスキャン
  for (let offset = 1; offset <= 5; offset++) {
    if (await checkPortAlive(defaultPort + offset)) return defaultPort + offset
  }
  return defaultPort // 見つからなければデフォルトを返す
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
 * デフォルトポートが応答しない場合、近隣ポートを自動スキャンする
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
    entries.map(async ([key, port]) => {
      const alive = await checkPortAlive(port)
      if (alive) return { key, port, alive: true }
      // デフォルトポートが死んでいる → 近隣スキャン
      const actual = await findActualPort(port)
      const actualAlive = actual !== port
      return { key, port: actual, alive: actualAlive }
    })
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
