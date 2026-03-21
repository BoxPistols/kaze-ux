#!/usr/bin/env node
/**
 * Vercel ビルドスクリプト
 * 全アプリを dist/ 配下にまとめて出力
 *
 * dist/
 *   index.html        ← LP（sandbox モード）
 *   storybook/         ← Storybook
 *   saas/              ← SaaS Dashboard
 *   ubereats/          ← KazeEats
 *   sky-kaze/          ← KazeLogistics
 */

import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync } from 'node:fs'

const run = (cmd) => {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

// クリーン
rmSync('dist', { recursive: true, force: true })
mkdirSync('dist', { recursive: true })

// 1. LP（sandbox モード → dist/ に出力）
run('pnpm build-sandbox')

// 2. Storybook → storybook-static/ に出力後、dist/storybook/ にコピー
run('pnpm build-storybook')
mkdirSync('dist/storybook', { recursive: true })
cpSync('storybook-static', 'dist/storybook', { recursive: true })

// 3. SaaS Dashboard → base=/saas/ で vite build のみ（tsc スキップ）
run('cd apps/saas-dashboard && VITE_BASE_PATH=/saas/ npx vite build')
mkdirSync('dist/saas', { recursive: true })
cpSync('apps/saas-dashboard/dist', 'dist/saas', { recursive: true })

// 4. UberEats Clone → base=/ubereats/ で vite build のみ
run('cd apps/ubereats-clone && VITE_BASE_PATH=/ubereats/ npx vite build')
mkdirSync('dist/ubereats', { recursive: true })
cpSync('apps/ubereats-clone/dist', 'dist/ubereats', { recursive: true })

// 5. KazeLogistics → base=/sky-kaze/ で vite build のみ
run('cd apps/sky-kaze && VITE_BASE_PATH=/sky-kaze/ npx vite build')
mkdirSync('dist/sky-kaze', { recursive: true })
cpSync('apps/sky-kaze/dist', 'dist/sky-kaze', { recursive: true })

console.log('\n✅ Vercel build complete')
console.log('  /           → LP')
console.log('  /storybook/ → Storybook')
console.log('  /saas/      → SaaS Dashboard')
console.log('  /ubereats/  → KazeEats')
console.log('  /sky-kaze/  → KazeLogistics')
