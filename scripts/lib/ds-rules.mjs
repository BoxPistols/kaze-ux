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
    const radius = block.match(/border-?[Rr]adius\s*:\s*([^,;\n}]+)/)
    if (radius) {
      // 角丸が 0 のものは対象外（`borderRadius: 0` / `'0 0 0 0'`）
      if (/^\s*[`'"]?0(px)?[`'"]?\s*$/.test(radius[1])) continue
    } else if (!isThemeRoundedTag(enclosingJsxTag(src, m.index))) {
      // sx に borderRadius が無くても、MUI の Card / Paper 等は
      // **テーマで角丸になる**。ここを見ないと
      // `<Card sx={{ borderLeft: 4 }}>` が素通りする（実際に素通りしていた）
      continue
    }

    hits.push({
      line: src.slice(0, m.index).split('\n').length,
      text: m[0].trim(),
    })
  }
  return hits
}

/**
 * テーマで角丸が付く MUI の要素。
 *
 * `sx` に `borderRadius` を書かなくても丸くなるので、片側だけ太い
 * ボーダーを足すと AI04 の見た目になる。`Box` は角丸にならないので入れない
 */
const THEME_ROUNDED_TAGS = new Set([
  'Card',
  'Paper',
  'Dialog',
  'Menu',
  'Popover',
  'Accordion',
  'Alert',
  'Chip',
  'TableContainer',
])

const isThemeRoundedTag = (tag) => tag !== null && THEME_ROUNDED_TAGS.has(tag)

/**
 * pos より前にある一番近い JSX の開始タグ名を返す。
 *
 * `sx={{ ... }}` の中から、それが付いている要素を引くための近似。
 * 閉じタグ（`</Card>`）は数えない
 */
const enclosingJsxTag = (src, pos) => {
  const before = src.slice(0, pos)
  let found = null
  for (const m of before.matchAll(/<\s*([A-Z][A-Za-z0-9_]*)/g)) found = m[1]
  return found
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
 * 12px 未満のフォントサイズ（T01）。
 *
 * `check:typo` は実描画を測る本命の検査だが、**リポジトリの中でしか動かない**。
 * MCP はコード片を受け取るだけなので、書かれた値から判る分だけを見る。
 * ルート font-size は 16px 前提（`0.75rem` = 12px が下限）
 */
const fontSizeUnder12px = (src) => {
  const hits = []
  const push = (index, text) =>
    hits.push({ line: src.slice(0, index).split('\n').length, text })

  // sx / style: fontSize: 11 / '11px' / '0.7rem'
  for (const m of src.matchAll(
    /font-?[Ss]ize\s*:\s*[`'"]?\s*(\d*\.?\d+)\s*(px|rem|em)?[`'"]?/g
  )) {
    const value = Number(m[1])
    const unit = m[2] ?? 'px'
    const px = unit === 'px' ? value : value * 16
    if (px < 12) push(m.index, m[0].trim())
  }
  // Tailwind の任意値: text-[11px]
  for (const m of src.matchAll(/text-\[(\d*\.?\d+)(px|rem)\]/g)) {
    const px = m[2] === 'px' ? Number(m[1]) : Number(m[1]) * 16
    if (px < 12) push(m.index, m[0])
  }
  return hits
}

/** カードに `rounded-full`（AI03）。角丸トークンを使わず全周を丸めるもの */
const roundedFullOnCard = (src) => {
  const hits = []
  const lines = src.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (!/\brounded-full\b/.test(lines[i])) continue
    // className は複数行に分かれるため、前後 3 行をまとめて見る
    const around = lines.slice(Math.max(0, i - 3), i + 4).join(' ')
    if (!/[Cc]ard/.test(around)) continue
    hits.push({ line: i + 1, text: lines[i].trim() })
  }
  return hits
}

/**
 * JSX の開始タグ本文を取り出す。`<` の位置から、対応する `>` まで。
 *
 * 素朴に `>` を探すと `sx={{ ... }}` の中の比較演算子や、属性値の
 * 文字列に入った `>` で切れる。波括弧の深さと引用符を見る
 */
const jsxOpeningTag = (src, start) => {
  let depth = 0
  let quote = null
  for (let i = start; i < src.length; i++) {
    const c = src[i]
    if (quote) {
      if (c === '\\') i++
      else if (c === quote) quote = null
      continue
    }
    if (c === "'" || c === '"' || c === '`') quote = c
    else if (c === '{') depth++
    else if (c === '}') depth--
    else if (c === '>' && depth === 0) return src.slice(start, i + 1)
  }
  return null
}

/**
 * 指定タグの開始タグを走査し、判定関数が真を返したものを違反にする。
 *
 * **コメントを落としてから当てる。** JSDoc の `@example` に書いた
 * 使用例を違反として数えたため（`iconButton.tsx` の 1 件）。
 * 文字列リテラルも落ちるが、属性名は残るので判定には影響しない
 * （`aria-label='X'` → `aria-label=''`）
 */
const scanJsxTag = (tagRe, isViolation) => (raw) => {
  const src = stripLiteralsAndComments(raw)
  const hits = []
  for (const m of src.matchAll(tagRe)) {
    const tag = jsxOpeningTag(src, m.index)
    if (tag === null || !isViolation(tag, src, m.index)) continue
    hits.push({
      line: src.slice(0, m.index).split('\n').length,
      // 表示は原文から。リテラルを落とした側だと '' だらけで読めない
      text: (jsxOpeningTag(raw, m.index) ?? tag)
        .replace(/\s+/g, ' ')
        .slice(0, 80),
    })
  }
  return hits
}

/**
 * 直前が `<Tooltip title='文字列'>` かどうか。
 *
 * **MUI の Tooltip は、title が文字列なら子に `aria-label` を付ける**
 * （`Tooltip.js` の `nameOrDescProps['aria-label'] = titleIsString ? title : null`、
 * describeChild が false のとき = 既定）。つまり Tooltip で包んだ
 * IconButton には読み上げ名がある。
 *
 * ここを見ないと 17 箇所を誤検出した。**検出器は既知の違反と既知の正解の
 * 両方で確かめてから信じる。**
 *
 * `title={<ReactNode>}` は aria-label にならない（open 時の
 * aria-labelledby だけ）ので、文字列リテラルのときに限る
 */
const wrappedInLabelingTooltip = (src, pos) => {
  // 直前の数行だけ見る。JSX の入れ子を厳密に追わないぶん、
  // 遠くの Tooltip を拾わないよう窓を狭くする
  const before = src.slice(0, pos)
  const window = before.split('\n').slice(-6).join('\n')
  const idx = window.lastIndexOf('<Tooltip')
  if (idx < 0) return false
  const tag = jsxOpeningTag(window, idx)
  if (tag === null) return false
  // title の値は問わない。MUI は title が文字列のとき aria-label にする
  // （実行時にしか分からない値もあるので、静的には区別しない）。
  // 取りこぼす方向の判断で、理由は docs/known-gaps.md に書いた
  return /\btitle\s*=/.test(tag)
}

/**
 * アイコンだけのボタンに読み上げ名が無い（A05）。
 *
 * 見た目はアイコンなので、名前を持たないと読み上げでは
 * 「ボタン」としか言われない。何のボタンか分からない。
 *
 * `aria-label` / `aria-labelledby` / `title` のどれかがあれば足りる。
 * **展開が動的な場合（`{...props}`）は判定できないので見逃す。**
 * 誤検出で信用を落とすより、取りこぼしを known-gaps に書くほうを選ぶ
 */
const iconButtonWithoutLabel = scanJsxTag(
  /<IconButton\b/g,
  (tag, src, pos) =>
    !/aria-label\b/.test(tag) &&
    !/aria-labelledby\b/.test(tag) &&
    !/\btitle\s*=/.test(tag) &&
    // DS の IconButton は tooltip を aria-label に流す
    // （iconButton.tsx: `const accessibleLabel = ariaLabel || tooltip`）
    !/\btooltip\s*=/.test(tag) &&
    !/\{\s*\.\.\./.test(tag) &&
    !wrappedInLabelingTooltip(src, pos)
)

/**
 * img に alt が無い（A06）。
 *
 * `alt=""` は装飾画像の正しい書き方なので違反にしない。
 * **属性の有無だけを見る**
 */
const imgWithoutAlt = scanJsxTag(
  /<img\b/g,
  (tag) => !/\balt\s*=/.test(tag) && !/\{\s*\.\.\./.test(tag)
)

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
    enforcedBy: 'check:rules（CI）/ check_rule（MCP）',
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
    enforcedBy: 'check:rules（CI）/ check_rule（MCP）',
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
    enforcedBy: 'check:typo（実描画の測定） / check_rule（書かれた値）',
    detect: fontSizeUnder12px,
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
    enforcedBy: 'check:rules（CI）/ check_rule（MCP）',
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
  {
    id: 'A05',
    category: 'アクセシビリティ',
    forbidden: 'アイコンだけのボタンに読み上げ名が無い',
    instead: 'aria-label / aria-labelledby / title のいずれかを付ける',
    enforcedBy: 'check:rules（CI）/ check_rule（MCP）',
    detect: iconButtonWithoutLabel,
  },
  {
    id: 'A06',
    category: 'アクセシビリティ',
    forbidden: '`<img>` に alt が無い',
    instead: '内容を説明する alt。装飾なら `alt=""`',
    enforcedBy: 'check:rules（CI）/ check_rule（MCP）',
    detect: imgWithoutAlt,
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
    enforcedBy: 'check_rule',
    detect: roundedFullOnCard,
  },
  {
    id: 'AI04',
    category: 'AI 生成',
    forbidden: '角丸と、片側だけの太い（2px 以上）ボーダーの併用',
    instead: '全周を細い線で囲むか、面の色で区別する',
    enforcedBy: 'check:rules（CI）/ check_rule（MCP）',
    detect: roundedWithThickSideBorder,
  },
]

/** 検出器を持つルールだけ */
export const DETECTABLE_RULES = DS_RULES.filter((r) => r.detect)

/** 止めるものが無いルール */
export const UNENFORCED_RULES = DS_RULES.filter((r) => !r.enforcedBy)
