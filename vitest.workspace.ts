import { defineWorkspace } from 'vitest/config'

/**
 * ルートと各アプリのテストを 1 回で走らせる。
 *
 * ルートの vitest.config.ts は `exclude: ['apps/**']` でアプリを走らせない
 * 一方、カバレッジは全ファイルを計測していた。そのため **アプリはテストが
 * あって通っているのに、カバレッジ上は 2.7% と表示されていた**。
 * 数字を見る人には「アプリは無検査」と読めてしまう。
 *
 * 各エントリは self-contained にする（ルート設定を extends で参照すると
 * 循環する）。エイリアス `~` はアプリごとに指す先が違うため、
 * 各アプリの vitest.config.ts をそのまま使う。
 */
export default defineWorkspace([
  './vitest.config.ts',
  './apps/saas-dashboard/vitest.config.ts',
  './apps/kaze-eats/vitest.config.ts',
  './apps/sky-kaze/vitest.config.ts',
])
