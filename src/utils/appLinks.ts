/**
 * アプリ間リンク
 *
 * ローカル: 各アプリが別ポートで動くため、ブラウザの hostname + ポートで解決
 * 本番: BASE_URL ベースの相対パス
 *
 * hostname を動的に取得するので、localhost 以外（IP, Docker等）でも動作する
 */

const isDev = import.meta.env.DEV
const base = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? ''

// ブラウザの現在のホスト（protocol + hostname）を動的に取得
const origin =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}`
    : 'http://localhost'

const resolve = (devPort: number, prodPath: string): string =>
  isDev ? `${origin}:${devPort}` : `${base}${prodPath}`

export const APP_LINKS = {
  top: () => resolve(5173, '/'),
  storybook: () => resolve(6006, '/storybook/'),
  saas: () => resolve(3001, '/saas/'),
  ubereats: () => resolve(3002, '/ubereats/'),
  github: () => 'https://github.com/BoxPistols/kaze-ux',
}
