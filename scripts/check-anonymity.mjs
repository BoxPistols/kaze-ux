#!/usr/bin/env node
/**
 * 共有するビルド成果物に、運営者個人へ辿れる情報が混入していないか検査する。
 *
 * この成果物は URL で第三者に共有する。**共有されるのはビルド済みの
 * dist / storybook-static** なので、ソースを直しただけでは意味がない。
 * 実際、コードに 1 箇所書いた公開先 URL が、両方のバンドルに文字列として
 * 載っていた。
 *
 *   pnpm check:anon        既定の出力先を検査
 *   pnpm check:anon <dir>  ディレクトリを指定
 *
 * **探す文字列はこのファイルに書かない。** git の設定（remote / user /
 * 過去のコミット作者）から実行時に導出する。ここにアカウント名を列挙すると、
 * 匿名化のための検査ファイルが身元の一覧になってしまう。
 * 導出できない環境（git 情報が無い CI 等）では、その分の検査は静かに飛ばす。
 */

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { SECRET_PATTERN, redactSecret } from './lib/secret-patterns.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_TARGETS = ['dist', 'storybook-static']

/** テキストとして中身を見る拡張子。画像・フォントは対象外 */
const TEXT_EXT = /\.(html|js|mjs|cjs|css|json|map|txt|svg|xml|webmanifest)$/i

const git = (cmd) => {
  try {
    return execSync(`git ${cmd}`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

/**
 * 検査すべき文字列を git から導出する。
 *
 * - remote URL: そのままと、owner / owner-repo の組み合わせ
 * - user.name / user.email
 * - 過去のコミット作者（複数人なら全員）
 */
const deriveIdentity = () => {
  const values = new Set()
  const add = (v) => {
    const t = (v ?? '').trim()
    // 2 文字以下は普通の単語に当たるので採らない
    if (t.length > 2) values.add(t)
  }

  /**
   * プロジェクトとして公開している名義。**ここは伏せる対象ではない。**
   *
   * リポジトリを公開して配る以上、導線には必ずリポジトリのパスが出る。
   * Plugin の導入は `/plugin marketplace add <owner>/<repo>`、MCP Registry の
   * 名前空間は `io.github.<owner>/...` で、どちらも owner を含む形しか無い。
   * つまり**配布と owner の秘匿は両立しない**。
   *
   * そこで守る範囲を分ける。伏せるのは個人に届く情報（メールアドレス・実名・
   * noreply の数字 ID）で、リポジトリの owner とパスは公開名義として通す。
   * public なリポジトリでは owner はすでに誰でも見られるので、成果物に載っても
   * 情報は増えない。一方メールと実名は、載せなければ載らない。
   */
  const publicIdentity = new Set()
  const addPublic = (v) => {
    const t = (v ?? '').trim()
    if (t.length > 2) publicIdentity.add(t.toLowerCase())
  }

  const remote = git('remote get-url origin')
  if (remote) {
    addPublic(remote.replace(/\.git$/, ''))
    // git@host:owner/repo / https://host/owner/repo の両方から owner を取る
    const m = remote.match(/[:/]([^/:]+)\/([^/]+?)(\.git)?$/)
    if (m) {
      addPublic(m[1])
      addPublic(`${m[1]}/${m[2]}`)
    }
  }
  /**
   * 人ではない作者かどうか。**bot と AI は伏せる対象ではない。**
   *
   * 名前まで伏せると、**その名前を説明した本文が身元の混入として弾かれる**。
   * 実際 `user.name = Claude` の環境でビルドした瞬間、「Claude Code に
   * 対応している」と書いたページが一斉に落ちた。伏せても個人には辿れない
   * 一方、デザインシステムの説明としては書かないわけにいかない語だった。
   *
   * 判定は名前ではなくメールで行う。GitHub の users.noreply.github.com は
   * 実在の人物を隠したものなので対象に残す（数字 ID が本人に紐づく）。
   * それ以外の noreply は自動化とみなす。
   */
  const isMachine = (name, email) =>
    /\[bot\]$/.test(name ?? '') ||
    (/^noreply@/i.test(email ?? '') &&
      !/users\.noreply\.github\.com$/i.test(email ?? ''))

  /**
   * 作者を 1 人ぶん取り込む。
   *
   * ローカルの git 設定とコミット履歴の両方を通す。**片方だけに判定を
   * 掛けても意味が無い**（履歴側だけ除外していたとき、CI の
   * `user.name` が素通りして同じ誤検出が残った）。
   */
  const addAuthor = (name, email) => {
    if (isMachine(name, email)) return
    add(name)
    add(email)
  }

  addAuthor(git('config user.name'), git('config user.email'))
  for (const line of git('log --format=%an%x09%ae -200').split('\n')) {
    const [name, email] = line.split('\t')
    addAuthor(name, email)
  }
  // noreply の数字 ID も本人に紐づく
  for (const v of [...values]) {
    const m = v.match(/^(\d+)\+/)
    if (m) add(m[1])
  }

  // git の user.name やコミット作者が owner と同じ文字列のことがある。
  // 公開名義と一致するものはここで落とす（大文字小文字は無視。GitHub は
  // 表記を変えても同じアカウントに解決するため、片方だけ残すと意味が無い）
  for (const v of [...values]) {
    if (publicIdentity.has(v.toLowerCase())) values.delete(v)
  }

  const escape = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return [...values].map((value) => ({
    value,
    // URL とメールはそれ自体が十分に固有なので素の部分一致でよい。
    // 素の名前は単語の一部に埋もれるので境界を要求する。
    //
    // どちらも大文字小文字を無視する。GitHub のアカウント名は表記を変えても
    // 同じアカウントに解決するため、小文字で書かれた 1 箇所が
    // 検査を素通りすれば匿名化は破れる（区別する実装で実際に素通りした）
    re: /@|:\/\//.test(value)
      ? new RegExp(escape(value), 'i')
      : new RegExp(`(?<![A-Za-z0-9])${escape(value)}(?![A-Za-z0-9])`, 'i'),
  }))
}

/** 身元に依らず、そこに有ってはいけないもの */
const GENERIC_RULES = [
  {
    id: 'local-path',
    re: /\/(Users|home)\/[A-Za-z0-9._-]+\//g,
    why: 'ビルドしたマシンのユーザー名を含む絶対パス',
  },
  {
    id: 'social-link',
    re: /https?:\/\/(www\.)?(twitter\.com|x\.com|linkedin\.com\/in|facebook\.com|instagram\.com|note\.com|qiita\.com|zenn\.dev)\/[A-Za-z0-9_./-]+/gi,
    why: '個人のソーシャルへの導線',
  },
  // 資格情報。身元の問題ではなく事故そのものなので、匿名化と一緒に必ず見る。
  //
  // これが無かったために、本番の Storybook バンドルに OpenAI の実キーが
  // 平文で配信されていながら、この検査は緑を返し続けた。ローカルの成果物は
  // 同じ位置が空文字になるため、ソース走査・git 履歴走査・ローカル成果物走査は
  // すべて偽陰性になる（本番 URL に当てて初めて出る）。
  {
    id: 'secret',
    redact: true,
    // パターンの単一ソースは scripts/lib/secret-patterns.mjs。
    // 本番 URL を見る check-live-secrets.mjs と同じものを使う。
    // 片方だけに足すと「片方の検査では緑」を作れてしまう
    re: new RegExp(`\\b(?:${SECRET_PATTERN})\\b`, 'g'),
    why: 'API キー・アクセストークンがバンドルに焼き込まれている',
  },
]

const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (TEXT_EXT.test(extname(p))) out.push(p)
  }
  return out
}

const args = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const targets = (args.length ? args : DEFAULT_TARGETS).map((t) => join(ROOT, t))
const present = targets.filter((t) => existsSync(t))

if (!present.length) {
  console.error(
    `検査対象がありません: ${targets.map((t) => t.replace(ROOT + '/', '')).join(', ')}\n` +
      'ビルドしてから実行してください（node scripts/vercel-build.mjs / pnpm build-storybook）。'
  )
  process.exit(1)
}

const identity = deriveIdentity()
const findings = []
let scanned = 0
/** 読めなかったファイル。検査が成立していない範囲として報告する */
const unreadable = []

for (const target of present) {
  for (const file of walk(target)) {
    let content
    try {
      content = readFileSync(file, 'utf8')
    } catch {
      // 読めなかったものを「検査した」に数えない。
      // 以前は scanned++ の後に continue していたので、識別子を含む
      // 読めないファイルが「221 ファイル走査、身元情報なし」の中に
      // 混ざっていた（実測で確認）。**未検査は検査済みではない。**
      unreadable.push(file.replace(ROOT + '/', ''))
      continue
    }
    scanned++
    const rel = file.replace(ROOT + '/', '')

    for (const { re } of identity) {
      // URL / メールは素の部分一致、素の名前は単語境界で見る。
      // 境界を見ないと、架空の人名 "Daichi Saito" の中の "aito" のような
      // 部分一致を拾って誤検出になる（実際に一度そうなった）
      if (re.test(content)) findings.push({ file: rel, rule: 'identity' })
    }
    for (const rule of GENERIC_RULES) {
      rule.re.lastIndex = 0
      for (const m of content.matchAll(rule.re)) {
        findings.push({
          file: rel,
          rule: rule.id,
          // 資格情報は値そのものを出さない。どのキーかを特定できるだけの
          // 情報（接頭・長さ・ハッシュ先頭）に落とす。検査ログが二次的な
          // 漏洩経路になっては本末転倒なので
          hit: rule.redact ? redactSecret(m[0]) : m[0].slice(0, 80),
          why: rule.why,
        })
      }
    }
  }
}

const unique = [
  ...new Map(findings.map((f) => [`${f.file}:${f.rule}:${f.hit}`, f])).values(),
]

const scope = present.map((p) => p.replace(ROOT + '/', '')).join(', ')

if (unreadable.length > 0) {
  console.error(
    `\n❌ ${unreadable.length} 件のファイルを読めませんでした（未検査）\n`
  )
  for (const f of unreadable.slice(0, 20)) console.error(`  ${f}`)
  console.error(
    '\n  読めない範囲が残ったまま「身元情報なし」とは言えません。' +
      '\n  権限を直すか、対象から外す理由を決めてください。'
  )
  process.exit(1)
}

if (!unique.length) {
  console.log(
    `✅ 共有物に身元へ辿れる情報なし (${scanned} ファイル / ${scope})` +
      (identity.length
        ? `\n   git から導出した ${identity.length} 種の識別子で照合`
        : '\n   ⚠ git 情報を取得できず、識別子の照合は行っていません')
  )
  process.exit(0)
}

console.error(`❌ 共有物に ${unique.length} 件の混入があります\n`)
for (const f of unique) {
  // 見つかった値そのものは出さない。どこを直すかだけ示す
  console.error(`  [${f.rule}] ${f.file}`)
  if (f.why) console.error(`    ${f.hit}  → ${f.why}`)
}
console.error(
  [
    '',
    'ソースを直したうえで、**ビルドし直してから**再検査してください。',
    '作業ツリーだけ直しても、共有されるのはビルド済みの成果物です。',
  ].join('\n')
)
process.exit(1)
