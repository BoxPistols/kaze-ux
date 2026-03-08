#!/usr/bin/env node
/**
 * GitHub Pages ビルド後に認証スクリプトを注入するスクリプト
 *
 * 使用方法:
 *   node scripts/inject-auth.js [password]
 *
 * 環境変数:
 *   AUTH_PASSWORD - 認証パスワード（引数より優先）
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

// 設定
const config = {
  ghPagesDir: join(rootDir, 'gh-pages'),
  authScriptPath: join(rootDir, 'public', 'auth.js'),
  password: process.env.AUTH_PASSWORD || process.argv[2] || '',
}

// HTMLファイルを検索
function findHtmlFiles(dir, files = []) {
  if (!existsSync(dir)) return files

  const items = readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = join(dir, item.name)
    if (item.isDirectory()) {
      findHtmlFiles(fullPath, files)
    } else if (item.name.endsWith('.html')) {
      files.push(fullPath)
    }
  }

  return files
}

// 認証スクリプトを注入
function injectAuth() {
  if (!config.password) {
    // パスワードが未設定の場合は認証をスキップ（環境変数またはコマンドライン引数のいずれも未指定）
    console.log(
      'パスワードが設定されていません（AUTH_PASSWORD環境変数またはコマンドライン引数）。認証をスキップします。'
    )
    return
  }

  if (!existsSync(config.ghPagesDir)) {
    console.error(
      'gh-pages ディレクトリが見つかりません。先にビルドを実行してください。'
    )
    process.exit(1)
  }

  // 認証スクリプトを読み込んでパスワードを置換
  if (!existsSync(config.authScriptPath)) {
    console.error(`認証スクリプトが見つかりません: ${config.authScriptPath}`)
    process.exit(1)
  }
  let authScript = readFileSync(config.authScriptPath, 'utf-8')
  // password: '__AUTH_PASSWORD__' の形式を正確に置換（コメント内は除外）
  authScript = authScript.replace(
    /password:\s*'__AUTH_PASSWORD__'/g,
    `password: '${config.password}'`
  )

  // インラインスクリプトとして埋め込むためのタグ
  const scriptTag = `<script>\n${authScript}\n</script>`

  // 全てのHTMLファイルに注入
  const htmlFiles = findHtmlFiles(config.ghPagesDir)

  // HTMLファイルが見つからない場合は警告を表示して処理を終了
  if (htmlFiles.length === 0) {
    console.warn('警告: HTMLファイルが見つかりませんでした。')
    return
  }
  for (const htmlFile of htmlFiles) {
    // Storybookディレクトリはmanager-head.htmlで独自の認証を持つためスキップ
    if (htmlFile.includes('/storybook/')) {
      console.log(`スキップ（Storybook独自認証）: ${htmlFile}`)
      continue
    }

    // Dev環境のルートindex.htmlはPasswordGateコンポーネントで認証を実装しているためスキップ
    // PasswordGateコンポーネントは環境変数VITE_APP_PASSWORDから自動的にパスワードを読み込む
    // gh-pages直下のindex.htmlをチェック（サブディレクトリのhtmlは除外）
    const isDevRootIndex =
      htmlFile.match(/[/\\]gh-pages[/\\]index\.html$/) &&
      !htmlFile.includes('/storybook/') &&
      !htmlFile.includes('\\storybook\\')
    if (isDevRootIndex) {
      console.log(`スキップ（PasswordGateコンポーネント使用）: ${htmlFile}`)
      continue
    }

    let content = readFileSync(htmlFile, 'utf-8')

    // 既に注入済みの場合はスキップ
    if (content.includes('sdpf_auth')) {
      console.log(`スキップ（注入済み）: ${htmlFile}`)
      continue
    }

    // <head>タグの直後に認証スクリプトを挿入
    if (content.includes('<head>')) {
      content = content.replace('<head>', `<head>\n${scriptTag}`)
    } else if (content.includes('<HEAD>')) {
      content = content.replace('<HEAD>', `<HEAD>\n${scriptTag}`)
    } else {
      // headタグがない場合はhtmlタグの直後に挿入
      console.warn(
        '警告: <head>タグが見つかりません。<html>タグの直後に挿入します。'
      )
      content = content.replace(/<html[^>]*>/i, `$&\n<head>${scriptTag}</head>`)
    }

    writeFileSync(htmlFile, content)
    console.log(`認証スクリプトを注入: ${htmlFile}`)
  }

  console.log(`\n認証設定完了: ${htmlFiles.length} ファイルに注入しました。`)
}

injectAuth()
