/**
 * アプリ間リンク
 *
 * ローカル: Vite proxy で /storybook/ → localhost:6006 等にルーティング
 * 本番: BASE_URL ベースの相対パス
 *
 * どちらの環境でも同じパスで動作する
 */

const base = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? ''

export const APP_LINKS = {
  top: () => `${base}/`,
  storybook: () => `${base}/storybook/`,
  saas: () => `${base}/saas/`,
  ubereats: () => `${base}/ubereats/`,
  github: () => 'https://github.com/BoxPistols/kaze-ux',
}
