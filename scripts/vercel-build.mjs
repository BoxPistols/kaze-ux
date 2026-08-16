#!/usr/bin/env node
/**
 * Vercel ビルドスクリプト
 * 全アプリを dist/ 配下にまとめて出力
 *
 * dist/
 *   index.html        ← LP（sandbox モード）
 *   storybook/         ← Storybook
 *   saas/              ← SaaS Dashboard
 *   kaze-eats/         ← KazeEats
 *   sky-kaze/          ← KazeLogistics
 */

import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'

const run = (cmd) => {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

// 既に storybook-static/ を作った工程から呼ぶとき用。
// **存在しなければ無視して普通にビルドする。** 立てたつもりのフラグで
// 中身の無い dist を作ると、検査は「違反 0」を返して緑になる
const reuseStorybook =
  process.env.REUSE_STORYBOOK === '1' && existsSync('storybook-static')

// クリーン
rmSync('dist', { recursive: true, force: true })
mkdirSync('dist', { recursive: true })

// 1. LP（sandbox モード → dist/ に出力）
run('pnpm build-sandbox')

// 2. Storybook → storybook-static/ に出力後、dist/storybook/ にコピー
if (reuseStorybook) {
  console.log('\n> storybook-static/ を再利用（REUSE_STORYBOOK=1）')
} else {
  run('pnpm build-storybook')
}
mkdirSync('dist/storybook', { recursive: true })
cpSync('storybook-static', 'dist/storybook', { recursive: true })

// 3. SaaS Dashboard → base=/saas/ で vite build のみ（tsc スキップ）
run('cd apps/saas-dashboard && VITE_BASE_PATH=/saas/ npx vite build')
mkdirSync('dist/saas', { recursive: true })
cpSync('apps/saas-dashboard/dist', 'dist/saas', { recursive: true })

// 4. KazeEats → base=/kaze-eats/ で vite build のみ
run('cd apps/kaze-eats && VITE_BASE_PATH=/kaze-eats/ npx vite build')
mkdirSync('dist/kaze-eats', { recursive: true })
cpSync('apps/kaze-eats/dist', 'dist/kaze-eats', { recursive: true })

// 5. KazeLogistics → base=/sky-kaze/ で vite build のみ
run('cd apps/sky-kaze && VITE_BASE_PATH=/sky-kaze/ npx vite build')
mkdirSync('dist/sky-kaze', { recursive: true })
cpSync('apps/sky-kaze/dist', 'dist/sky-kaze', { recursive: true })

console.log('\n✅ Vercel build complete')
console.log('  /           → LP')
console.log('  /storybook/ → Storybook')
console.log('  /saas/      → SaaS Dashboard')
console.log('  /kaze-eats/ → KazeEats')
console.log('  /sky-kaze/  → KazeLogistics')
