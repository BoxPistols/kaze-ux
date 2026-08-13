/**
 * 資格情報の検出パターン。**ここが単一ソース。**
 *
 * ローカル成果物を見る check-anonymity.mjs と、本番 URL を見る
 * check-live-secrets.mjs の両方がこれを読む。片方だけパターンを足すと、
 * 「片方の検査では緑」という最悪の状態が作れてしまうため。
 *
 * 実際にそうなった。本番の Storybook バンドルに OpenAI の実キーが平文で
 * 配信されている間、ローカルを見る検査は緑を返し続けた。ローカルビルドは
 * 同じ位置が空文字になるからで、ソース走査・git 履歴走査・ローカル成果物
 * 走査はすべて偽陰性になる。git に入っていないので Gitleaks も通る。
 */

import { createHash } from 'node:crypto'

/**
 * 検出パターン。
 *
 * 素の `sk-` + 20 文字では、minify 済みバンドルの base64 断片に当たる。
 * 接頭辞が明確なもの（sk-proj- 等）と、十分に長いもの（40 文字以上）に
 * 分けて誤検出を抑える。
 */
export const SECRET_PATTERN = [
  // OpenAI / Anthropic（プロジェクト・サービスアカウント鍵を含む）
  'sk-(?:proj|ant|svcacct|live|test)-[A-Za-z0-9_-]{20,}',
  'sk-[A-Za-z0-9]{40,}',
  // Google (Gemini / Maps)
  'AIza[A-Za-z0-9_-]{30,}',
  // Mapbox（pk も課金アカウントに紐づくので対象にする）
  '(?:pk|sk)\\.eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}',
  // GitHub
  'gh[pousr]_[A-Za-z0-9]{30,}',
  // Slack
  'xox[baprs]-[A-Za-z0-9-]{10,}',
  // AWS
  'AKIA[0-9A-Z]{16}',
].join('|')

/** 毎回新しい RegExp を返す。g フラグ付きの使い回しは lastIndex で事故る */
export const secretRegExp = () => new RegExp(`\\b(?:${SECRET_PATTERN})\\b`, 'g')

/**
 * 資格情報を、特定はできるが再利用はできない形に落とす。
 *
 * 検出結果は CI のログにもターミナルにも残る。値をそのまま出すと、
 * 漏洩を検出する仕組み自体が二次的な漏洩経路になる。
 */
export const redactSecret = (secret) =>
  `${secret.slice(0, 8)}… (${secret.length} 文字 / sha256:${createHash('sha256')
    .update(secret)
    .digest('hex')
    .slice(0, 12)})`

/** テキストから資格情報を検出し、マスク済みの一覧を返す（重複は 1 件に畳む） */
export const findSecrets = (text) => {
  const seen = new Map()
  for (const m of text.matchAll(secretRegExp())) {
    if (!seen.has(m[0])) seen.set(m[0], redactSecret(m[0]))
  }
  return [...seen.values()]
}
