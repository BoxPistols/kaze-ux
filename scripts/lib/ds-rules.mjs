/**
 * DS の禁止パターン。**単一ソース。**
 *
 * 見る側が 2 つある。
 * - `scripts/check-ds-rules.mjs`: 違反の検出と、未強制ルールの明示
 * - `foundations/prohibited.md`: 人と AI が読む一覧（表はここから生成する）
 *
 * ## なぜ強制状況まで持つか
 *
 * prohibited.md は 27 ルールを列挙していたが、**どれが実際に守られている
 * のかはどこにも書いていなかった**。実測すると `export default` 禁止
 * (C03) は 33 箇所で破られており、`font-weight` の記述は実際の gate
 * （400/700 のみ）より緩かった。
 *
 * 「書いてあるが守られていない」は、AI にとっては**嘘の仕様**になる。
 * 読んだ AI は従い、コードを読んだ AI は真似る。どちらが正しいか分からない。
 *
 * だから各ルールに「何が強制しているか」を持たせ、検出器があるものは
 * 実際に数える。**強制が無いものは無いと書く。**
 */

/**
 * ソースから文字列リテラルとコメントを取り除く。
 *
 * これをしないと、ルールを説明した文章そのものを違反として数える。
 * 実際 `React.FC` を素朴に grep したら 12 件出たが、全部 FAQ や
 * チャット知識ベースの**解説文**で、実使用は 0 件だった。
 */
export const stripLiteralsAndComments = (src) => {
  let out = ''
  let i = 0
  const n = src.length
  // 落とした範囲の改行は必ず残す。行数がずれると、報告する行番号が
  // 実ファイルと食い違って調査できなくなる
  const keepNewlines = (from, to) => {
    for (let k = from; k < to && k < n; k++) if (src[k] === '\n') out += '\n'
  }
  while (i < n) {
    const c = src[i]
    const next = src[i + 1]
    if (c === '/' && next === '/') {
      while (i < n && src[i] !== '\n') i++
      continue
    }
    if (c === '/' && next === '*') {
      const start = i
      i += 2
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++
      i += 2
      keepNewlines(start, i)
      continue
    }
    if (c === "'" || c === '"' || c === '`') {
      const quote = c
      const start = i
      i++
      while (i < n) {
        if (src[i] === '\\') {
          i += 2
          continue
        }
        if (src[i] === quote) {
          i++
          break
        }
        i++
      }
      out += "''"
      keepNewlines(start, i)
      continue
    }
    out += c
    i++
  }
  return out
}

/** 行番号付きで正規表現に一致する箇所を返す */
const matchLines = (src, re) => {
  const hits = []
  const lines = src.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) hits.push({ line: i + 1, text: lines[i].trim() })
    re.lastIndex = 0
  }
  return hits
}

/** コードだけを見る検出器（文字列とコメントを落としてから当てる） */
const codeMatcher = (re) => (src) =>
  matchLines(stripLiteralsAndComments(src), re)

/**
 * `outline: none` は、フォーカスリングを別途出していれば違反ではない。
 * 近傍に focus-visible の指定があるかまで見る。素朴に数えると 5 件全部を
 * 誤検出した（実際は全部 focus-visible と併用されていた）
 */
const outlineWithoutFocusVisible = (src) => {
  const codeLines = stripLiteralsAndComments(src).split('\n')
  // focus-visible は `'&:focus-visible'` のように**文字列の中**に書かれる。
  // リテラルを落とした側で探すと必ず消えているので、原文を見る
  const rawLines = src.split('\n')
  const hits = []
  for (let i = 0; i < codeLines.length; i++) {
    if (!/outline:\s*(''|none)/.test(codeLines[i])) continue
    const around = rawLines.slice(Math.max(0, i - 8), i + 10).join('\n')
    if (/focus-?[Vv]isible/.test(around)) continue
    hits.push({ line: i + 1, text: rawLines[i]?.trim() ?? '' })
  }
  return hits
}

/**
 * 角丸と、片側だけの太いボーダーの併用。
 *
 * `rounded-r-lg border-l-4` のような組み合わせは、AI が生成した画面で
 * 頻出する。情報を足していない装飾で、しかも出自が透けて見える。
 *
 * 記法が 2 つあるので両方見る。**className だけを見ていたときは、
 * 同じ形の `sx` を 4 箇所取りこぼした**（3 つの重複した InfoCallout と
 * カード上端のカラーバー）。片方だけの検出は、検出していないのと同じ。
 */
const roundedWithThickSideBorder = (src) => [
  ...roundedSideBorderInClassName(src),
  ...roundedSideBorderInStyleObject(src),
]

/** Tailwind: `rounded-*` と `border-{t,r,b,l}-{2以上}` が同居する */
const roundedSideBorderInClassName = (src) => {
  const hits = []
  const lines = src.split('\n')
  for (let i = 0; i < lines.length; i++) {
    // className は複数行に分かれるため、前後 3 行をまとめて見る
    const around = lines.slice(Math.max(0, i - 3), i + 4).join(' ')
    if (!/\brounded(-[a-z]+)?(-[a-z0-9]+)?\b/.test(around)) continue
    if (!/\bborder-(t|r|b|l)-([2-9]|\d{2,})\b/.test(around)) continue
    if (!/\bborder-(t|r|b|l)-([2-9]|\d{2,})\b/.test(lines[i])) continue
    hits.push({ line: i + 1, text: lines[i].trim() })
  }
  return hits
}

/**
 * sx / style / CSS: 片側だけ 2px 以上のボーダーを持つ宣言を見つけ、
 * **それを囲む一番内側のブロック**に角丸があるかを見る。
 *
 * 行の窓ではなくブロックで判定するのが要点。窓で見ると
 * `'& blockquote': { borderLeft: '3px solid' }` が、親の sx が持つ
 * `borderRadius` を拾って誤検出になる（blockquote の左罫は別物）。
 */
const roundedSideBorderInStyleObject = (src) => {
  const sideBorder =
    /border-?(Left|Right|Top|Bottom)(-?Width)?\s*:\s*[`'"]?\s*(\d+)(px)?/gi
  const hits = []

  for (const m of src.matchAll(sideBorder)) {
    const width = Number(m[3])
    if (width < 2) continue

    const block = innermostBlock(src, m.index)
    if (!block) continue
    // 角丸が 0 のものは対象外（`borderRadius: 0` / `'0 0 0 0'`）
    const radius = block.match(/border-?[Rr]adius\s*:\s*([^,;\n}]+)/)
    if (!radius || /^\s*[`'"]?0(px)?[`'"]?\s*$/.test(radius[1])) continue

    hits.push({
      line: src.slice(0, m.index).split('\n').length,
      text: m[0].trim(),
    })
  }
  return hits
}

/** pos を含む一番内側の `{ ... }` を返す。見つからなければ null */
const innermostBlock = (src, pos) => {
  let depth = 0
  let start = -1
  for (let i = pos; i >= 0; i--) {
    if (src[i] === '}') depth++
    else if (src[i] === '{') {
      if (depth === 0) {
        start = i
        break
      }
      depth--
    }
  }
  if (start < 0) return null

  depth = 0
  for (let i = start; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}') {
      depth--
      if (depth === 0) return src.slice(start, i + 1)
    }
  }
  return null
}

/**
 * ルール一覧。
 *
 * - `enforcedBy`: 何が破綻を止めるか。`null` は**止めるものが無い**
 * - `detect`: ソースから数える関数。無いものは機械的に測れない
 */
export const DS_RULES = [
  // --- コンポーネント ---
  {
    id: 'C01',
    category: 'コンポーネント',
    forbidden: '`React.FC` / `FC` / `FunctionComponent`',
    instead: 'plain function + typed props',
    enforcedBy: '.husky/pre-commit',
    detect: codeMatcher(/\bReact\.FC\b|\bFunctionComponent\b|:\s*FC</),
  },
  {
    id: 'C02',
    category: 'コンポーネント',
    forbidden: '`<Grid item xs={12}>`（MUI v6 以前の API）',
    instead: '`<Grid size={{ xs: 12 }}>`',
    enforcedBy: null,
    detect: codeMatcher(/<Grid\s+item\b/),
  },
  {
    id: 'C03',
    category: 'コンポーネント',
    forbidden: '`export default`',
    instead: '`export const` で named export',
    enforcedBy: 'ESLint `kaze/named-exports-only`（error）',
    detect: codeMatcher(/^export default\b/),
  },
  {
    id: 'C04',
    category: 'コンポーネント',
    forbidden: 'セミコロン',
    instead: 'Prettier 設定で省略',
    enforcedBy: 'prettier（pre-commit / CI）',
    detect: null,
  },
  {
    id: 'C05',
    category: 'コンポーネント',
    forbidden: 'ダブルクォート（文字列）',
    instead: 'シングルクォート',
    enforcedBy: 'prettier（pre-commit / CI）',
    detect: null,
  },
  {
    id: 'C06',
    category: 'コンポーネント',
    forbidden: '`any` 型',
    instead: '具体的な型（strict mode）',
    enforcedBy: 'CI（quality-check.yml の grep）',
    detect: codeMatcher(/:\s*any\b/),
  },
  {
    id: 'C07',
    category: 'コンポーネント',
    forbidden: '`window.confirm()` / `window.alert()`',
    instead: '`ConfirmDialog`',
    enforcedBy: null,
    detect: codeMatcher(/window\.(confirm|alert)\s*\(/),
  },
  {
    id: 'C08',
    category: 'コンポーネント',
    forbidden: 'アプリから MUI の UI 部品を直 import（DS に同等品があるもの）',
    instead: 'DS の同等品（対応表は `scripts/ds-equivalents.mjs`）',
    enforcedBy: 'ESLint `kaze/ds-first`（error）',
    detect: null,
  },

  // --- カラー ---
  {
    id: 'K01',
    category: 'カラー',
    forbidden: 'ハードコードした色値',
    instead: '`primary.main` 等のトークン参照 / `--color-*`',
    enforcedBy: null,
    detect: null,
  },
  {
    id: 'K02',
    category: 'カラー',
    forbidden: '面の色を文字色に流用する（`primary.main` を文字に使う等）',
    instead: '前景用の `primary.textContrast` / `--color-primary-ink`',
    enforcedBy: 'check:a11y（実描画のコントラスト測定）',
    detect: null,
  },
  {
    id: 'K03',
    category: 'カラー',
    forbidden: '`--color-*` を index.css に手打ちする',
    instead: 'テーマから生成（`createCssVars`）',
    enforcedBy: 'app-themes.test.ts',
    detect: null,
  },

  // --- タイポグラフィ ---
  {
    id: 'T01',
    category: 'タイポグラフィ',
    forbidden: '12px 未満のフォントサイズ',
    instead: '最小 12px',
    enforcedBy: 'check:typo（実描画の測定）',
    detect: null,
  },
  {
    id: 'T02',
    category: 'タイポグラフィ',
    forbidden: '400 / 700 以外のフォントウェイト',
    instead: '400 か 700。中間のウェイトは使わない',
    enforcedBy: 'check:typo（実描画の測定）',
    detect: null,
  },

  // --- アクセシビリティ ---
  {
    id: 'A01',
    category: 'アクセシビリティ',
    forbidden: '24x24 未満の操作対象',
    instead: 'WCAG 2.2 SC 2.5.8。inline-flex + minHeight で確保',
    enforcedBy: 'check:a11y（実描画の寸法測定）',
    detect: null,
  },
  {
    id: 'A02',
    category: 'アクセシビリティ',
    forbidden: '本文で 4.5:1 未満のコントラスト',
    instead: '淡い面に置くなら `textContrast` 系',
    enforcedBy: 'check:a11y（3 テーマで測定）',
    detect: null,
  },
  {
    id: 'A03',
    category: 'アクセシビリティ',
    forbidden: '`outline: none` でフォーカスリングを消す',
    instead: '`focus-visible` で出し直す',
    enforcedBy: null,
    detect: outlineWithoutFocusVisible,
  },
  {
    id: 'A04',
    category: 'アクセシビリティ',
    forbidden: '色だけで状態を伝える',
    instead: 'アイコン・テキストを併用',
    enforcedBy: null,
    detect: null,
  },

  // --- AI 生成で出やすいもの ---
  {
    id: 'AI01',
    category: 'AI 生成',
    forbidden: 'カード上部の意味の無いカラーバー装飾',
    instead: '置かない',
    enforcedBy: null,
    detect: null,
  },
  {
    id: 'AI02',
    category: 'AI 生成',
    forbidden: '過度なグラデーション背景 / 紫・ピンク系',
    instead: 'ブランドはブルー系',
    enforcedBy: null,
    detect: null,
  },
  {
    id: 'AI03',
    category: 'AI 生成',
    forbidden: 'カードに `rounded-full`',
    instead: 'テーマの borderRadius トークン',
    enforcedBy: null,
    detect: null,
  },
  {
    id: 'AI04',
    category: 'AI 生成',
    forbidden: '角丸と、片側だけの太い（2px 以上）ボーダーの併用',
    instead: '全周を細い線で囲むか、面の色で区別する',
    enforcedBy: null,
    detect: roundedWithThickSideBorder,
  },
]

/** 検出器を持つルールだけ */
export const DETECTABLE_RULES = DS_RULES.filter((r) => r.detect)

/** 止めるものが無いルール */
export const UNENFORCED_RULES = DS_RULES.filter((r) => !r.enforcedBy)
