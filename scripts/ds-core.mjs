/**
 * DS のコア層 — **MUI があってもなくても使える範囲**。**単一ソース。**
 *
 * ここを見る側が 2 つある。
 * - `eslint.config.js`: コアからの UI ライブラリ import を error で止める
 * - `src/themes/__tests__/coreDependencies.test.ts`: 依存グラフを辿って実証する
 *
 * ## なぜ分けるか
 *
 * kaze-ux を「MUI 前提のデザインシステム」から「MUI があってもなくても
 * 使えるデザインシステム」にしたい。ただし部品は 71 件中 64 件が MUI 製で
 * 10,321 行ある。ここを一度に剥がすのは現実的ではない。
 *
 * 一方で、**外から使いたい層はもともと MUI をほとんど使っていない**。
 * トークン・色の計算・タイポグラフィ・ブレイクポイントの 8 ファイル
 * 1,964 行が、実質そのまま他フレームワークへ持っていける。
 *
 * だから先に「ここから先は UI ライブラリに触れない」という線を引いて、
 * 破れないように固定する。物理的なパッケージ分割はその後でよい
 * （分割は重い作業だが、契約は今日引ける）。
 *
 * ## 線の引き方
 *
 * コアに入れる条件は 2 つ。
 * 1. UI ライブラリ（@mui / @emotion）を import しない
 * 2. 実行時の外部依存を持たない（型だけの import は可）
 *
 * `theme.ts` と `elevation.ts` は MUI の theme を組み立てるのが仕事なので
 * コアには入らない。これらは「MUI 向けアダプタ」に相当する。
 */

/** コアに属するモジュール（リポジトリルートからの相対パス） */
export const DS_CORE_MODULES = [
  'src/themes/breakpoints.ts',
  'src/themes/colorToken.ts',
  'src/themes/contrast.ts',
  'src/themes/focus.ts',
  'src/themes/kazeMixins.ts',
  'src/themes/kazeTokens.ts',
  'src/themes/motion.ts',
  'src/themes/typography.ts',
]

/**
 * コアが import してよい外部パッケージ。
 *
 * `react` は `import type { CSSProperties }` のように**型としてだけ**
 * 使っている。型は実行時に消えるので、バンドルに react は入らない。
 * ここに値として使うものを足すときは、コアの意味が変わるので注意する。
 */
export const DS_CORE_ALLOWED_PACKAGES = ['react']

/**
 * コアが import してはいけないパッケージのパターン。
 *
 * UI ライブラリだけでなく、フレームワーク固有のものも将来ここに足す。
 */
export const DS_CORE_FORBIDDEN_PATTERNS = [
  '@mui',
  '@mui/*',
  '@mui/**',
  '@emotion',
  '@emotion/*',
  '@emotion/**',
]

/** eslint / テストの双方で使うエラーメッセージ */
export const DS_CORE_VIOLATION_MESSAGE =
  'DS コア層は UI ライブラリに依存しません（MUI があってもなくても使える範囲）。' +
  'MUI が要る処理は src/themes/theme.ts 側（MUI アダプタ）に置いてください。' +
  '線の定義は scripts/ds-core.mjs にあります。'
