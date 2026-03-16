/**
 * アプリ間リンクのヘルパー
 *
 * 本番: BASE_URL ベースの相対パス（GH Pages / Vercel）
 * ローカル: 環境変数 VITE_*_URL で設定。未設定なら相対パス
 *
 * .env.local に以下を設定するとローカルでも回遊可能:
 *   VITE_STORYBOOK_URL=http://localhost:6006
 *   VITE_SAAS_URL=http://localhost:3001
 *   VITE_UBEREATS_URL=http://localhost:3002
 *   VITE_TOP_URL=http://localhost:5173
 */

const base = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? ''

/**
 * 環境変数があればそれを使い、なければ相対パスにフォールバック
 */
const resolve = (envKey: string, relativePath: string): string => {
  const envValue = import.meta.env[envKey] as string | undefined
  if (envValue) return envValue
  return `${base}${relativePath}`
}

export const APP_LINKS = {
  top: () => resolve('VITE_TOP_URL', '/'),
  storybook: () => resolve('VITE_STORYBOOK_URL', '/storybook/'),
  saas: () => resolve('VITE_SAAS_URL', '/saas/'),
  ubereats: () => resolve('VITE_UBEREATS_URL', '/ubereats/'),
  github: () => 'https://github.com/BoxPistols/kaze-ux',
}

export const getAppUrl = APP_LINKS
