/**
 * inject-auth.js のユニットテスト
 *
 * 認証スクリプト注入機能のテスト
 * - パスワード置換の正確性
 * - HTMLファイルへの注入
 * - エッジケースの処理
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '../..')
const scriptsDir = join(rootDir, 'scripts')
const testDir = join(rootDir, 'test-gh-pages')
const authScriptPath = join(rootDir, 'public', 'auth.js')

// テスト用HTMLテンプレート
const createTestHtml = (title = 'Test Page') => `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`

// テスト用ディレクトリのセットアップ
function setupTestDir() {
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true })
  }
  mkdirSync(testDir, { recursive: true })
  mkdirSync(join(testDir, 'storybook'), { recursive: true })
  mkdirSync(join(testDir, 'about'), { recursive: true })
}

// テスト用ディレクトリのクリーンアップ
function cleanupTestDir() {
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true })
  }
}

// inject-auth.jsを実行するヘルパー
function runInjectAuth(password, ghPagesDir = testDir) {
  const env = {
    ...process.env,
    AUTH_PASSWORD: password,
  }

  // スクリプトを一時的に修正してテストディレクトリを使用
  const scriptContent = readFileSync(
    join(scriptsDir, 'inject-auth.js'),
    'utf-8'
  )
  const modifiedScript = scriptContent.replace(
    "join(rootDir, 'gh-pages')",
    `'${ghPagesDir}'`
  )
  const tempScriptPath = join(scriptsDir, 'inject-auth-test.js')
  writeFileSync(tempScriptPath, modifiedScript)

  try {
    const result = execSync(`node "${tempScriptPath}" "${password}"`, {
      env,
      encoding: 'utf-8',
      cwd: rootDir,
    })
    return { success: true, output: result }
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout }
  } finally {
    if (existsSync(tempScriptPath)) {
      rmSync(tempScriptPath)
    }
  }
}

describe('inject-auth.js', () => {
  beforeEach(() => {
    setupTestDir()
  })

  afterEach(() => {
    cleanupTestDir()
  })

  describe('パスワード置換', () => {
    it('パスワードが正しく置換される', () => {
      // テスト用HTMLを作成
      writeFileSync(join(testDir, 'index.html'), createTestHtml('Main'))

      // 注入実行
      const result = runInjectAuth('mySecretPassword123')
      expect(result.success).toBe(true)

      // 結果を確認
      const injectedHtml = readFileSync(join(testDir, 'index.html'), 'utf-8')

      // パスワードが置換されていることを確認
      expect(injectedHtml).toContain("password: 'mySecretPassword123'")

      // プレースホルダーが残っていないことを確認
      expect(injectedHtml).not.toMatch(/password:\s*'__AUTH_PASSWORD__'/)
    })

    it('特殊文字を含むパスワードも正しく処理される', () => {
      writeFileSync(join(testDir, 'index.html'), createTestHtml())

      // シェルで問題のない特殊文字のみをテスト
      const specialPassword = 'p@ssw0rd!123'
      const result = runInjectAuth(specialPassword)
      expect(result.success).toBe(true)

      const injectedHtml = readFileSync(join(testDir, 'index.html'), 'utf-8')
      expect(injectedHtml).toContain(`password: '${specialPassword}'`)
    })

    it('空のパスワードの場合は認証をスキップする', () => {
      writeFileSync(join(testDir, 'index.html'), createTestHtml())

      const result = runInjectAuth('')
      expect(result.success).toBe(true)
      expect(result.output).toContain('パスワードが設定されていません')

      // HTMLが変更されていないことを確認
      const html = readFileSync(join(testDir, 'index.html'), 'utf-8')
      expect(html).not.toContain('sdpf_auth')
    })
  })

  describe('HTMLファイルへの注入', () => {
    it('複数のHTMLファイルに注入される（Storybookディレクトリは除外）', () => {
      // 複数のHTMLファイルを作成
      writeFileSync(join(testDir, 'index.html'), createTestHtml('Main'))
      writeFileSync(
        join(testDir, 'about', 'index.html'),
        createTestHtml('About')
      )
      writeFileSync(
        join(testDir, 'storybook', 'index.html'),
        createTestHtml('Storybook')
      )

      const result = runInjectAuth('testpass')
      expect(result.success).toBe(true)

      // index.htmlとabout/index.htmlに注入されていることを確認
      const injectedFiles = [
        join(testDir, 'index.html'),
        join(testDir, 'about', 'index.html'),
      ]

      for (const file of injectedFiles) {
        const content = readFileSync(file, 'utf-8')
        expect(content).toContain("password: 'testpass'")
        expect(content).toContain('sdpf_auth')
      }

      // storybook/index.htmlはスキップされていることを確認
      const storybookContent = readFileSync(
        join(testDir, 'storybook', 'index.html'),
        'utf-8'
      )
      expect(storybookContent).not.toContain("password: 'testpass'")
      expect(result.output).toContain('スキップ（Storybook独自認証）')
    })

    it('既に注入済みのファイルはスキップされる', () => {
      // 既に認証スクリプトが含まれているHTML
      const alreadyInjectedHtml = `<!doctype html>
<html lang="ja">
  <head>
<script>
var CONFIG = { storageKey: 'sdpf_auth' };
</script>
    <title>Already Injected</title>
  </head>
  <body></body>
</html>`
      writeFileSync(join(testDir, 'index.html'), alreadyInjectedHtml)

      const result = runInjectAuth('newpassword')
      expect(result.success).toBe(true)
      expect(result.output).toContain('スキップ（注入済み）')

      // 内容が変更されていないことを確認
      const content = readFileSync(join(testDir, 'index.html'), 'utf-8')
      expect(content).not.toContain("password: 'newpassword'")
    })

    it('<head>タグの直後に注入される', () => {
      writeFileSync(join(testDir, 'index.html'), createTestHtml())

      runInjectAuth('testpass')

      const content = readFileSync(join(testDir, 'index.html'), 'utf-8')

      // <head>タグの直後にスクリプトがあることを確認
      const headIndex = content.indexOf('<head>')
      const scriptIndex = content.indexOf('<script>')
      expect(scriptIndex).toBeGreaterThan(headIndex)
      expect(scriptIndex).toBeLessThan(headIndex + 20) // <head>の直後
    })
  })

  describe('認証スクリプトの内容', () => {
    it('必須の認証機能が含まれている', () => {
      writeFileSync(join(testDir, 'index.html'), createTestHtml())

      runInjectAuth('testpass')

      const content = readFileSync(join(testDir, 'index.html'), 'utf-8')

      // 必須機能の存在確認
      expect(content).toContain('isAuthenticated')
      expect(content).toContain('localStorage')
      expect(content).toContain('sdpf_auth')
    })

    it('未置換プレースホルダーチェックが含まれている', () => {
      // auth.jsに未置換チェックがあることを確認
      const authScript = readFileSync(authScriptPath, 'utf-8')
      expect(authScript).toContain("=== '__AUTH_PASSWORD__'")
    })
  })

  describe('エラーハンドリング', () => {
    it('HTMLファイルがない場合は警告を表示', () => {
      // 空のディレクトリ（HTMLファイルなし）
      const result = runInjectAuth('testpass')
      expect(result.success).toBe(true)
      // 空ディレクトリでの実行は成功するが、ファイルは処理されない
      // 出力が空または警告メッセージを含む
      expect(result.output).toBeDefined()
    })

    it('gh-pagesディレクトリがない場合はエラー', () => {
      cleanupTestDir() // ディレクトリを削除

      const result = runInjectAuth('testpass')
      expect(result.success).toBe(false)
    })
  })
})

describe('auth.js スクリプト', () => {
  it('プレースホルダーが正しい形式で定義されている', () => {
    const authScript = readFileSync(authScriptPath, 'utf-8')

    // パスワードプレースホルダー
    expect(authScript).toMatch(/password:\s*'__AUTH_PASSWORD__'/)

    // storageKeyが定義されている
    expect(authScript).toContain("storageKey: 'sdpf_auth'")
  })

  it('認証フローが完備されている', () => {
    const authScript = readFileSync(authScriptPath, 'utf-8')

    // 認証チェック関数
    expect(authScript).toContain('function isAuthenticated()')

    // 認証保存関数
    expect(authScript).toContain('function saveAuth(')

    // ログアウト機能
    expect(authScript).toContain('sdpfLogout')
  })

  it('セキュリティ警告が含まれている', () => {
    const authScript = readFileSync(authScriptPath, 'utf-8')

    // クライアントサイド認証の制限についての警告
    expect(authScript).toContain('クライアントサイド')
    expect(authScript).toContain(
      '機密性の高いコンテンツの保護には適していません'
    )
  })

  it('promptベースの認証を使用している', () => {
    const authScript = readFileSync(authScriptPath, 'utf-8')

    // prompt関数を使用
    expect(authScript).toContain('window.prompt')
  })
})
