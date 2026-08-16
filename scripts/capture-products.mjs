#!/usr/bin/env node
/**
 * LP に載せるプロダクトのキャプチャを生成する。
 *
 * 4 プロダクトを本番と同じ構成でビルドして配信し、実ブラウザで撮る。
 * 出力先は public/captures/。生成物だがコミットする（LP から静的に
 * 参照するため。CDN も外部ホスティングも増やさない）。
 *
 *   pnpm capture:products            全プロダクトを撮り直す
 *   pnpm capture:products --skip-build  既存の dist を使う（撮り直しだけ）
 *
 * 前提: dist/ が本番と同じ構成であること（scripts/vercel-build.mjs が作る）。
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const OUT = join(ROOT, 'public', 'captures')
const PORT = 4599

/**
 * ダークで撮るには、各アプリが実際に見ている保存先を先に書く。
 *
 * `colorScheme: 'dark'`（= prefers-color-scheme）だけでは切り替わらない。
 * どのアプリも自前の state と localStorage でモードを持っているため、
 * OS の設定を模しても無視される。**実際に一度それで撮って、ライトと
 * 同一の画像が 4 枚できた。**
 *
 * - 共有 ThemeProvider (CssVarsProvider) を使う: `mui-mode`
 * - KazeEats は独自管理: `kaze-eats-theme`
 * - Storybook はツールバーの globals で持つため、ここでは扱わない
 */
const DARK_STORAGE = {
  'mui-mode': 'dark',
  'kaze-eats-theme': 'dark',
}

/**
 * 撮る対象。
 *
 * `wait` は「その画面が出来上がるまで」の待ち時間。地図やアニメーションを
 * 持つ画面は描画完了が遅く、短いと空の状態が写る。
 * `dark` はダーク版も撮るか（Storybook はモードの持ち方が違うので撮らない）。
 */
const TARGETS = [
  { id: 'storybook', path: '/storybook/', wait: 4000, dark: false },
  { id: 'saas', path: '/saas/', wait: 2500, dark: true },
  { id: 'kaze-eats', path: '/kaze-eats/', wait: 2500, dark: true },
  { id: 'sky-kaze', path: '/sky-kaze/', wait: 3500, dark: true },
]

const VIEWPORT = { width: 1440, height: 900 }

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
}

const run = (cmd) => {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd: ROOT })
}

/** dist をそのまま配信する。本番と同じパス構成で撮るため */
const serve = () =>
  new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = decodeURIComponent((req.url ?? '/').split('?')[0])
      let file = join(DIST, url)
      try {
        if (existsSync(file) && statSync(file).isDirectory()) {
          file = join(file, 'index.html')
        }
        if (!existsSync(file)) {
          // SPA のフォールバック。各アプリの index.html に寄せる
          const seg = url.split('/').filter(Boolean)[0]
          file = seg ? join(DIST, seg, 'index.html') : join(DIST, 'index.html')
        }
        const body = readFileSync(file)
        res.writeHead(200, {
          'content-type': MIME[extname(file)] ?? 'application/octet-stream',
        })
        res.end(body)
      } catch {
        res.writeHead(404)
        res.end('not found')
      }
    })
    server.listen(PORT, () => resolve(server))
  })

const main = async () => {
  if (!process.argv.includes('--skip-build')) {
    run('node scripts/vercel-build.mjs')
  }
  // dist/ は build-sandbox（LP だけ）でも作られる。中身が本番構成である
  // ことを先に確かめる。確かめないと、空の画面を撮って気づけない
  const missing = TARGETS.filter(
    (t) => !existsSync(join(DIST, t.path, 'index.html'))
  ).map((t) => t.path)
  if (!existsSync(DIST) || missing.length) {
    console.error(
      `dist/ が本番構成ではありません（見つからない: ${missing.join(', ') || 'dist/'}）。`,
      '\n--skip-build を外して実行してください（scripts/vercel-build.mjs が全アプリを出力します）。'
    )
    process.exit(1)
  }
  mkdirSync(OUT, { recursive: true })

  // playwright は devDependency。ここでだけ使うので動的 import する
  const { chromium } = await import('playwright')
  const server = await serve()
  const browser = await chromium.launch()

  try {
    for (const t of TARGETS) {
      const bg = {}
      for (const scheme of t.dark ? ['light', 'dark'] : ['light']) {
        const ctx = await browser.newContext({
          viewport: VIEWPORT,
          colorScheme: scheme,
          deviceScaleFactor: 2,
        })
        if (scheme === 'dark') {
          await ctx.addInitScript((entries) => {
            for (const [k, v] of Object.entries(entries)) {
              localStorage.setItem(k, v)
            }
          }, DARK_STORAGE)
        }
        const page = await ctx.newPage()
        const url = `http://localhost:${PORT}${t.path}`
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
        // 動きが落ち着くまで待つ。networkidle だけだと描画途中が写る
        await page.waitForTimeout(t.wait)
        // 撮影中にアニメーションが動くと毎回違う絵になり、差分が無意味になる
        await page.addStyleTag({
          content:
            '*,*::before,*::after{animation:none !important;transition:none !important}',
        })
        await page.waitForTimeout(300)

        bg[scheme] = await page.evaluate(
          () => getComputedStyle(document.body).backgroundColor
        )

        const out = join(OUT, `${t.id}-${scheme}.webp`)
        await page.screenshot({ path: out, type: 'webp', quality: 82 })
        const kb = Math.round(statSync(out).size / 1024)
        console.log(`  ✅ ${t.id}-${scheme}.webp  ${kb} KB  bg=${bg[scheme]}`)
        await ctx.close()
      }

      // 切り替わっていないのに 2 枚出すと、同じ絵が dark として並ぶ。
      // 実際に一度それを作ったので、地の色で確認して落とす
      if (t.dark && bg.light === bg.dark) {
        throw new Error(
          `${t.id}: ダークに切り替わっていない (bg が light と同じ ${bg.light})。` +
            'DARK_STORAGE の保存先が実装と合っているか確認してください。'
        )
      }
    }
  } finally {
    await browser.close()
    server.close()
  }

  const shots = TARGETS.reduce((n, t) => n + (t.dark ? 2 : 1), 0)
  console.log(`\n出力: public/captures/ (${shots} 枚)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
