// MUI v7 リファレンスナレッジベース
// ユーザーの質問キーワードに基づき、関連セクションをシステムプロンプトに注入する

export interface MuiKnowledgeSection {
  id: string
  keywords: string[]
  content: string
}

// ---------------------------------------------------------------------------
// ページタイトル/名前からMUIコンポーネントキーワードへのマッピング
// 「このUI」「これ」等の指示語を解決するために使用
// ---------------------------------------------------------------------------

const PAGE_TO_MUI_KEYWORDS: Record<string, string[]> = {
  // Navigation
  パンくず: ['breadcrumb', 'パンくず'],
  breadcrumb: ['breadcrumb', 'パンくず'],
  appbar: ['appbar', 'ナビ'],
  drawer: ['drawer', 'ドロワー'],
  tab: ['tabs', 'タブ'],
  // Components
  button: ['button', 'ボタン'],
  card: ['card', 'カード'],
  chip: ['chip', 'チップ'],
  badge: ['badge', 'バッジ'],
  avatar: ['avatar', 'アバター'],
  alert: ['alert', 'アラート'],
  dialog: ['dialog', 'ダイアログ'],
  modal: ['dialog', 'モーダル'],
  accordion: ['accordion', 'アコーディオン'],
  tooltip: ['tooltip', 'ツールチップ'],
  snackbar: ['snackbar', 'トースト'],
  pagination: ['pagination', 'ページネーション'],
  stepper: ['stepper', 'ステッパー'],
  skeleton: ['skeleton', 'スケルトン'],
  progress: ['progress', 'プログレス'],
  // Form
  textfield: ['textfield', '入力'],
  select: ['select', 'セレクト'],
  autocomplete: ['autocomplete', 'オートコンプリート'],
  checkbox: ['checkbox', 'チェックボックス'],
  radio: ['radio', 'ラジオ'],
  switch: ['switch', 'スイッチ'],
  slider: ['slider', 'スライダー'],
  datepicker: ['datepicker', '日付'],
  // Layout
  grid: ['grid', 'グリッド'],
  stack: ['stack', 'スタック'],
  container: ['container', 'コンテナ'],
  // Data Display
  table: ['table', 'テーブル'],
  datagrid: ['datagrid', 'データグリッド'],
  list: ['list', 'リスト'],
  typography: ['typography', 'タイポ'],
  // Surfaces
  paper: ['paper', 'ペーパー'],
  // Other
  icon: ['icon', 'アイコン'],
  menu: ['menu', 'メニュー'],
  popover: ['popover', 'ポップオーバー'],
  divider: ['divider', 'ディバイダー'],
  fab: ['fab', 'ボタン'],
}

/**
 * ページタイトル/名前から関連MUIキーワードを抽出する
 */
const resolvePageKeywords = (
  storyTitle: string | null,
  storyName: string | null
): string[] => {
  if (!storyTitle && !storyName) return []
  const combined = `${storyTitle ?? ''} ${storyName ?? ''}`.toLowerCase()
  const keywords: string[] = []
  for (const [pattern, kws] of Object.entries(PAGE_TO_MUI_KEYWORDS)) {
    if (combined.includes(pattern.toLowerCase())) {
      keywords.push(...kws)
    }
  }
  return keywords
}

/**
 * 指示語（「このUI」「これ」「今見てる」等）が含まれるかを判定
 */
const hasDeictic = (query: string): boolean => {
  const deicticPatterns = [
    'このui',
    'これは',
    'このコンポーネント',
    'この画面',
    '今見て',
    'このページ',
    '今のui',
    '今のページ',
    'これって',
    'このパターン',
  ]
  const q = query.toLowerCase()
  return deicticPatterns.some((p) => q.includes(p))
}

// ---------------------------------------------------------------------------
// トピック検出: ユーザーの質問+ページコンテキストから関連MUIセクションを返す
// ---------------------------------------------------------------------------

export const detectMuiTopics = (
  query: string,
  storyTitle?: string | null,
  storyName?: string | null
): MuiKnowledgeSection[] => {
  const q = query.toLowerCase()

  // 指示語が含まれる場合、ページコンテキストからキーワードを補完する
  const pageKeywords = resolvePageKeywords(
    storyTitle ?? null,
    storyName ?? null
  )
  const effectiveQuery =
    hasDeictic(query) && pageKeywords.length > 0
      ? `${q} ${pageKeywords.join(' ')}`
      : q

  // MUI関連キーワードが含まれない場合はスキップ
  const muiSignals = [
    'mui',
    'material',
    'マテリアル',
    'コンポーネント',
    'component',
    'sx',
    'theme',
    'テーマ',
    'grid',
    'グリッド',
    'button',
    'ボタン',
    'card',
    'カード',
    'textfield',
    'テキストフィールド',
    'dialog',
    'ダイアログ',
    'drawer',
    'ドロワー',
    'appbar',
    'table',
    'テーブル',
    'datagrid',
    'データグリッド',
    'datepicker',
    'autocomplete',
    'select',
    'セレクト',
    'chip',
    'チップ',
    'badge',
    'バッジ',
    'alert',
    'アラート',
    'snackbar',
    'tooltip',
    'ツールチップ',
    'tab',
    'タブ',
    'accordion',
    'アコーディオン',
    'breadcrumb',
    'パンくず',
    'pagination',
    'ページネーション',
    'skeleton',
    'スケルトン',
    'avatar',
    'アバター',
    'stack',
    'スタック',
    'paper',
    'ペーパー',
    'typography',
    'タイポ',
    'breakpoint',
    'ブレークポイント',
    'palette',
    'パレット',
    'tailwind',
    'styled',
    'css-in-js',
    'createtheme',
    'themeprovider',
    'スタイル',
    'レイアウト',
    'layout',
    'icon',
    'アイコン',
    '標準',
    '公式',
    'v7',
    'v6',
    'migration',
    'マイグレーション',
    '移行',
    'useMediaQuery',
    'responsive',
    'レスポンシブ',
    'container',
    'コンテナ',
    'box',
    'switch',
    'スイッチ',
    'checkbox',
    'チェックボックス',
    'radio',
    'ラジオ',
    'slider',
    'スライダー',
    'progress',
    'プログレス',
    'fab',
    'list',
    'リスト',
    'menu',
    'メニュー',
    'modal',
    'モーダル',
    'popover',
    'ポップオーバー',
    'stepper',
    'ステッパー',
    'divider',
    'ディバイダー',
    'chart',
    'チャート',
    'tree',
    'ツリー',
  ]
  if (!muiSignals.some((kw) => effectiveQuery.includes(kw))) return []

  const scored: { section: MuiKnowledgeSection; score: number }[] = []
  for (const section of MUI_KNOWLEDGE_SECTIONS) {
    let score = 0
    for (const kw of section.keywords) {
      if (effectiveQuery.includes(kw.toLowerCase())) score += 1
    }
    if (score > 0) scored.push({ section, score })
  }

  // スコア降順でソートし、上位3セクションを返す
  scored.sort((a, b) => b.score - a.score)

  // 一般的なMUIの質問でどのセクションにもマッチしない場合はoverviewを返す
  if (scored.length === 0) {
    const overview = MUI_KNOWLEDGE_SECTIONS.find((s) => s.id === 'overview')
    return overview ? [overview] : []
  }

  return scored.slice(0, 3).map((s) => s.section)
}

// ---------------------------------------------------------------------------
// 検出結果をプロンプト用テキストに変換
// ---------------------------------------------------------------------------

export const buildMuiContext = (
  query: string,
  storyTitle?: string | null,
  storyName?: string | null
): string => {
  const sections = detectMuiTopics(query, storyTitle, storyName)
  if (sections.length === 0) return ''
  const body = sections.map((s) => s.content).join('\n\n')
  return `\n## MUI公式リファレンス（以下の情報を基に正確に回答すること。ユーザーが「このUI」「これ」と言った場合、現在のページのコンポーネントについて回答する）\n${body}`
}

// ---------------------------------------------------------------------------
// MUIナレッジセクション定義
// ---------------------------------------------------------------------------

const MUI_KNOWLEDGE_SECTIONS: MuiKnowledgeSection[] = [
  // ----- 概要 -----
  {
    id: 'overview',
    keywords: [
      'mui',
      'material',
      'マテリアル',
      '標準',
      '公式',
      'v7',
      'v6',
      '移行',
      'マイグレーション',
    ],
    content: `### MUI (Material UI) v7 概要
MUIはReact用UIコンポーネントライブラリ。GoogleのMaterial Designを実装し、60以上のコンポーネントを提供する。
Kaze UXではMUI v7を使用。v7の主な変更点:
- Grid: \`item\`/\`container\` prop廃止 → \`size={{ xs: 12, sm: 6 }}\` に統一
- pigment-css対応（ゼロランタイムCSS）
- パフォーマンス改善（バンドルサイズ削減）

\`\`\`tsx
// MUI v7 Grid（Kaze UXルール）
import Grid from '@mui/material/Grid'
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}><Card>左</Card></Grid>
  <Grid size={{ xs: 12, md: 6 }}><Card>右</Card></Grid>
</Grid>

// v6以前（禁止）: <Grid item xs={12} md={6}>
\`\`\`

公式: https://mui.com/material-ui/getting-started/`,
  },

  // ----- sx prop -----
  {
    id: 'sx-prop',
    keywords: ['sx', 'スタイル', 'styled', 'css-in-js', 'css'],
    content: `### sx prop
MUIコンポーネント専用のスタイルprop。テーマトークンへのショートカットアクセスを提供する。

\`\`\`tsx
<Box sx={{
  color: 'primary.main',        // theme.palette.primary.main
  bgcolor: 'background.paper',  // theme.palette.background.paper
  p: 2,                         // theme.spacing(2) = 16px
  mt: 1,                        // marginTop: 8px
  borderRadius: 1,              // theme.shape.borderRadius * 1 = 4px
  boxShadow: 2,                 // theme.shadows[2]
  typography: 'body1',          // theme.typography.body1のスタイル全適用
  display: { xs: 'none', md: 'block' },  // レスポンシブ
  '&:hover': { bgcolor: 'action.hover' },
}}>
\`\`\`

**sxで使えるショートカット一覧:**
| 短縮 | CSSプロパティ | 例 |
|------|-------------|-----|
| m, mt, mr, mb, ml, mx, my | margin系 | m: 2 → margin: 16px |
| p, pt, pr, pb, pl, px, py | padding系 | px: 3 → paddingInline: 24px |
| bgcolor | backgroundColor | bgcolor: 'grey.100' |
| zIndex | zIndex | zIndex: 'drawer' → 1200 |
| gap | gap | gap: 2 → 16px |

**Kaze UXルール**: テーマトークン参照にはsx、レイアウト・余白にはTailwindのclassNameを使う。1要素にsxとclassNameを混在させない。
公式: https://mui.com/system/getting-started/the-sx-prop/`,
  },

  // ----- テーマ -----
  {
    id: 'theme',
    keywords: [
      'theme',
      'テーマ',
      'palette',
      'パレット',
      'createtheme',
      'themeprovider',
      'カスタマイズ',
      'ダークモード',
      'dark',
    ],
    content: `### テーマ (createTheme / ThemeProvider)
MUIのテーマシステムはpalette, typography, spacing, breakpoints, components等を一元管理する。

\`\`\`tsx
import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#2642be', light: '#4d68d4', dark: '#1a2c80' },
    secondary: { main: '#696881' },
    error: { main: '#da3737' },
    background: { default: '#f8fafc', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Noto Sans JP", sans-serif',
    fontSize: 14, // 1rem = 14px
    h4: { fontSize: '1.43rem', fontWeight: 700 }, // 20px
    body1: { fontSize: '1rem', lineHeight: 1.6 },  // 14px
  },
  spacing: 8, // theme.spacing(1) = 8px
  shape: { borderRadius: 4 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6, minWidth: 80, textTransform: 'none' },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { borderRadius: 12 } },
    },
  },
})

<ThemeProvider theme={theme}><App /></ThemeProvider>
\`\`\`

**Kaze UXテーマファイル**: \`src/themes/theme.ts\` (メイン), \`src/themes/colorToken.ts\` (色), \`src/themes/typography.ts\` (フォント)
公式: https://mui.com/material-ui/customization/theming/`,
  },

  // ----- Grid -----
  {
    id: 'grid',
    keywords: ['grid', 'グリッド', 'レイアウト', 'layout', '列', 'カラム'],
    content: `### Grid (MUI v7)
v7でAPIが刷新。item/container propは廃止され、sizeに統一。

\`\`\`tsx
import Grid from '@mui/material/Grid'

// 基本: 12列レスポンシブグリッド
<Grid container spacing={2}>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>カード1</Grid>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>カード2</Grid>
  <Grid size={{ xs: 12, sm: 12, md: 4 }}>カード3</Grid>
</Grid>

// offset（列のオフセット）
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 8 }} offset={{ md: 2 }}>中央寄せ</Grid>
</Grid>

// autoレイアウト（残りを自動分配）
<Grid container spacing={2}>
  <Grid size="auto">自動幅</Grid>
  <Grid size="grow">残り全部</Grid>
</Grid>
\`\`\`

**禁止パターン（v6以前）:**
\`\`\`tsx
// NG: v6以前の書き方
<Grid item xs={12} md={6}>  // item prop禁止
<Grid container item>       // container+item禁止
\`\`\`

公式: https://mui.com/material-ui/react-grid/`,
  },

  // ----- Button -----
  {
    id: 'button',
    keywords: ['button', 'ボタン', 'fab', 'iconbutton'],
    content: `### Button
\`\`\`tsx
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Fab from '@mui/material/Fab'
import { Plus, Edit, Delete } from 'lucide-react'

// variant: text | outlined | contained
<Button variant="contained" color="primary" size="medium">保存</Button>
<Button variant="outlined" color="error" startIcon={<Delete size={18} />}>削除</Button>
<Button variant="text" disabled>無効</Button>

// loading状態（MUI v7）
<Button variant="contained" loading loadingPosition="start" startIcon={<Save />}>
  保存中...
</Button>

// IconButton
<IconButton color="primary" aria-label="編集"><Edit size={20} /></IconButton>

// FAB（Floating Action Button）
<Fab color="primary" aria-label="追加"><Plus /></Fab>
<Fab variant="extended"><Plus className="mr-1" />新規作成</Fab>
\`\`\`

**Kaze UXルール**: 角丸6px, 最小幅80px, textTransform: none（大文字変換なし）。アイコンはlucide-react。
公式: https://mui.com/material-ui/react-button/`,
  },

  // ----- Card -----
  {
    id: 'card',
    keywords: ['card', 'カード', 'paper', 'ペーパー', 'surface', 'サーフェス'],
    content: `### Card / Paper
\`\`\`tsx
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'
import Paper from '@mui/material/Paper'

// 基本Card
<Card>
  <CardHeader title="タイトル" subheader="サブテキスト" />
  <CardContent>
    <Typography variant="body1">カード内容</Typography>
  </CardContent>
  <CardActions>
    <Button size="small">詳細</Button>
  </CardActions>
</Card>

// メディア付きCard
<Card>
  <CardMedia component="img" height={140} image="/photo.jpg" alt="写真" />
  <CardContent>...</CardContent>
</Card>

// Paper（Cardの下位コンポーネント。影だけ欲しい時に使う）
<Paper elevation={0} sx={{ p: 2, borderRadius: 3 }}>内容</Paper>
\`\`\`

**Kaze UXルール**: Card elevation=0（フラット）, 角丸12px。影が必要な場合はsx={{ boxShadow: 1 }}。
公式: https://mui.com/material-ui/react-card/`,
  },

  // ----- TextField / Input -----
  {
    id: 'textfield',
    keywords: [
      'textfield',
      'テキストフィールド',
      'input',
      '入力',
      'フォーム',
      'form',
      'select',
      'セレクト',
    ],
    content: `### TextField / Select
\`\`\`tsx
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'

// 基本（variant: outlined | filled | standard）
<TextField label="名前" variant="outlined" size="small" fullWidth />

// バリデーション
<TextField
  label="メール"
  type="email"
  error={!!errors.email}
  helperText={errors.email ?? 'メールアドレスを入力'}
  required
/>

// multiline
<TextField label="備考" multiline rows={4} />

// Select（TextFieldのselect prop）
<TextField select label="カテゴリ" value={category} onChange={handleChange} size="small">
  <MenuItem value="a">カテゴリA</MenuItem>
  <MenuItem value="b">カテゴリB</MenuItem>
</TextField>

// InputAdornment（前後の装飾）
import InputAdornment from '@mui/material/InputAdornment'
<TextField
  label="価格"
  type="number"
  slotProps={{
    input: {
      startAdornment: <InputAdornment position="start">¥</InputAdornment>,
    },
  }}
/>
\`\`\`

**Kaze UXルール**: size="small"がデフォルト。Kaze UXカスタム: CustomTextField, CustomSelect（src/components/ui/Form/）。
**v7変更点**: InputProps → slotProps.input に移行。
公式: https://mui.com/material-ui/react-text-field/`,
  },

  // ----- Dialog -----
  {
    id: 'dialog',
    keywords: ['dialog', 'ダイアログ', 'modal', 'モーダル', '確認'],
    content: `### Dialog / Modal
\`\`\`tsx
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'

// 確認ダイアログ
<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
  <DialogTitle>削除の確認</DialogTitle>
  <DialogContent>
    <DialogContentText>
      この操作は取り消せません。本当に削除してよろしいですか？
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>キャンセル</Button>
    <Button onClick={handleDelete} color="error" variant="contained">削除</Button>
  </DialogActions>
</Dialog>

// フルスクリーン（モバイル対応）
import useMediaQuery from '@mui/material/useMediaQuery'
const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
<Dialog fullScreen={fullScreen} open={open} onClose={handleClose}>...</Dialog>
\`\`\`

**maxWidth**: xs(444px), sm(600px), md(900px), lg(1200px), xl(1536px), false(制限なし)
公式: https://mui.com/material-ui/react-dialog/`,
  },

  // ----- AppBar / Drawer / Navigation -----
  {
    id: 'navigation',
    keywords: [
      'appbar',
      'drawer',
      'ドロワー',
      'ナビ',
      'navigation',
      'tabs',
      'タブ',
      'breadcrumb',
      'パンくず',
      'menu',
      'メニュー',
    ],
    content: `### Navigation (AppBar / Drawer / Tabs / Breadcrumbs)
\`\`\`tsx
// AppBar
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
<AppBar position="fixed" color="default" elevation={1}>
  <Toolbar>
    <Typography variant="h6" sx={{ flexGrow: 1 }}>Kaze UX</Typography>
    <Button color="inherit">ログイン</Button>
  </Toolbar>
</AppBar>

// Drawer
import Drawer from '@mui/material/Drawer'
<Drawer anchor="left" open={open} onClose={toggle} variant="temporary">
  <Box sx={{ width: 280 }}><List>...</List></Box>
</Drawer>
// variant: temporary(オーバーレイ) | permanent(常時表示) | persistent(トグル)

// Tabs
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
<Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
  <Tab label="概要" />
  <Tab label="詳細" />
  <Tab label="設定" />
</Tabs>

// Breadcrumbs
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
<Breadcrumbs aria-label="パンくずリスト">
  <Link href="/">ホーム</Link>
  <Link href="/settings">設定</Link>
  <Typography color="text.primary">プロフィール</Typography>
</Breadcrumbs>
\`\`\`

公式: https://mui.com/material-ui/react-app-bar/`,
  },

  // ----- Table / DataGrid -----
  {
    id: 'table',
    keywords: [
      'table',
      'テーブル',
      'datagrid',
      'データグリッド',
      '表',
      'ソート',
      'フィルタ',
      'ページネーション',
      'pagination',
    ],
    content: `### Table / DataGrid
**MUI Table（軽量）** — 静的・小規模データ向け:
\`\`\`tsx
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

<Table size="small">
  <TableHead>
    <TableRow>
      <TableCell>名前</TableCell>
      <TableCell align="right">数量</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {rows.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell align="right">{row.count}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
\`\`\`

**MUI X DataGrid（高機能）** — 大規模データ・ソート・フィルタ・仮想化が必要な場合:
\`\`\`tsx
import { DataGrid } from '@mui/x-data-grid'
const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: '名前', flex: 1 },
  { field: 'status', headerName: '状態', width: 120 },
]
<DataGrid rows={rows} columns={columns} pageSizeOptions={[10, 25, 50]}
  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
  disableRowSelectionOnClick
/>
\`\`\`

**使い分け**: 行数100未満・ソート不要→Table、それ以上→DataGrid。
Kaze UXカスタム: CustomTable（src/components/ui/Table/）
公式: https://mui.com/material-ui/react-table/ / https://mui.com/x/react-data-grid/`,
  },

  // ----- Chip / Badge / Avatar -----
  {
    id: 'chip-badge',
    keywords: [
      'chip',
      'チップ',
      'badge',
      'バッジ',
      'avatar',
      'アバター',
      'tag',
      'タグ',
    ],
    content: `### Chip / Badge / Avatar
\`\`\`tsx
import Chip from '@mui/material/Chip'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'

// Chip（タグ・ステータス表示）
<Chip label="完了" color="success" size="small" />
<Chip label="React" variant="outlined" onDelete={handleDelete} />
<Chip label="新着" color="primary" icon={<Star size={16} />} />

// Badge（通知カウント）
<Badge badgeContent={4} color="error">
  <Mail size={24} />
</Badge>
<Badge variant="dot" color="success"><Avatar>U</Avatar></Badge>

// Avatar
<Avatar alt="田中太郎" src="/avatar.jpg" sx={{ width: 40, height: 40 }} />
<Avatar sx={{ bgcolor: 'primary.main' }}>KZ</Avatar>
\`\`\`

公式: https://mui.com/material-ui/react-chip/`,
  },

  // ----- Alert / Snackbar / Feedback -----
  {
    id: 'feedback',
    keywords: [
      'alert',
      'アラート',
      'snackbar',
      'toast',
      'トースト',
      'progress',
      'プログレス',
      'skeleton',
      'スケルトン',
      '通知',
      'loading',
      'ローディング',
    ],
    content: `### Alert / Snackbar / Progress / Skeleton
\`\`\`tsx
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Snackbar from '@mui/material/Snackbar'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'

// Alert（severity: error | warning | info | success）
<Alert severity="error">
  <AlertTitle>エラー</AlertTitle>
  データの保存に失敗しました。再試行してください。
</Alert>
<Alert severity="info" variant="outlined" onClose={handleClose}>情報メッセージ</Alert>

// Snackbar（一時通知）
<Snackbar open={open} autoHideDuration={3000} onClose={handleClose}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
  <Alert severity="success" variant="filled">保存しました</Alert>
</Snackbar>

// Progress
<CircularProgress size={24} />                   // 不確定
<CircularProgress variant="determinate" value={75} /> // 確定
<LinearProgress />
<LinearProgress variant="determinate" value={50} />

// Skeleton（読み込みプレースホルダー）
<Skeleton variant="rectangular" width="100%" height={200} />
<Skeleton variant="text" sx={{ fontSize: '1rem' }} />
<Skeleton variant="circular" width={40} height={40} />
\`\`\`

Kaze UXカスタム: CustomToaster（src/components/ui/UI/）
公式: https://mui.com/material-ui/react-alert/`,
  },

  // ----- Autocomplete -----
  {
    id: 'autocomplete',
    keywords: [
      'autocomplete',
      'オートコンプリート',
      '検索',
      'サジェスト',
      'combobox',
    ],
    content: `### Autocomplete
\`\`\`tsx
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

// 基本
<Autocomplete
  options={options}
  getOptionLabel={(option) => option.label}
  renderInput={(params) => <TextField {...params} label="都道府県" size="small" />}
  onChange={(_, value) => setValue(value)}
/>

// 複数選択
<Autocomplete
  multiple
  options={tags}
  value={selectedTags}
  onChange={(_, newValue) => setSelectedTags(newValue)}
  renderInput={(params) => <TextField {...params} label="タグ" placeholder="選択..." />}
  filterSelectedOptions
/>

// フリー入力許可
<Autocomplete freeSolo options={suggestions}
  renderInput={(params) => <TextField {...params} label="検索" />}
/>
\`\`\`

Kaze UXカスタム: MultiSelectAutocomplete（src/components/ui/Form/）
公式: https://mui.com/material-ui/react-autocomplete/`,
  },

  // ----- Tooltip / Popover -----
  {
    id: 'tooltip',
    keywords: [
      'tooltip',
      'ツールチップ',
      'popover',
      'ポップオーバー',
      'hover',
      'ホバー',
    ],
    content: `### Tooltip / Popover
\`\`\`tsx
import Tooltip from '@mui/material/Tooltip'
import Popover from '@mui/material/Popover'

// Tooltip（ホバー情報）
<Tooltip title="この操作は取り消せません" placement="top" arrow>
  <Button color="error">削除</Button>
</Tooltip>

// placement: top | bottom | left | right | top-start | top-end | ...

// Popover（クリックで開く詳細パネル）
<Popover open={open} anchorEl={anchorEl} onClose={handleClose}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
  <Box sx={{ p: 2, maxWidth: 300 }}>
    <Typography variant="subtitle2">詳細情報</Typography>
    <Typography variant="body2">ここに詳細を表示</Typography>
  </Box>
</Popover>
\`\`\`

公式: https://mui.com/material-ui/react-tooltip/`,
  },

  // ----- Accordion -----
  {
    id: 'accordion',
    keywords: [
      'accordion',
      'アコーディオン',
      '折りたたみ',
      'expand',
      'collapse',
    ],
    content: `### Accordion
\`\`\`tsx
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import { ChevronDown } from 'lucide-react'

<Accordion defaultExpanded>
  <AccordionSummary expandIcon={<ChevronDown size={20} />}>
    <Typography variant="subtitle1">基本設定</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <TextField label="名前" fullWidth size="small" />
  </AccordionDetails>
</Accordion>

// 制御モード（1つだけ開く）
const [expanded, setExpanded] = useState<string | false>(false)
const handleChange = (panel: string) => (_: unknown, isExpanded: boolean) => {
  setExpanded(isExpanded ? panel : false)
}
<Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
  ...
</Accordion>
\`\`\`

公式: https://mui.com/material-ui/react-accordion/`,
  },

  // ----- Typography -----
  {
    id: 'typography',
    keywords: [
      'typography',
      'タイポ',
      'フォント',
      '文字',
      'テキスト',
      '見出し',
    ],
    content: `### Typography
\`\`\`tsx
import Typography from '@mui/material/Typography'

<Typography variant="h4" gutterBottom>見出し (20px, bold)</Typography>
<Typography variant="h5">小見出し (18px)</Typography>
<Typography variant="body1">本文 (14px, lineHeight 1.6)</Typography>
<Typography variant="body2" color="text.secondary">補助テキスト (12px)</Typography>
<Typography variant="caption" color="text.disabled">キャプション (10px)</Typography>

// component propでHTML要素を変える
<Typography variant="h4" component="h1">SEO用にh1だがh4スタイル</Typography>

// sx でインラインオーバーライド
<Typography sx={{ fontWeight: 700, letterSpacing: '0.02em' }}>強調</Typography>
\`\`\`

**Kaze UXタイポグラフィ**: Inter + Noto Sans JP, 1rem=14px
| variant | サイズ | 用途 |
|---------|--------|------|
| h3 | 32px | ページタイトル |
| h4 | 20px | セクション見出し |
| h5 | 18px | 小見出し |
| body1 | 14px | 本文 |
| body2 | 12px | 補助テキスト |
| caption | 10px | 特殊用途 |

公式: https://mui.com/material-ui/react-typography/`,
  },

  // ----- Stack / Box / Container -----
  {
    id: 'layout-box',
    keywords: [
      'stack',
      'スタック',
      'box',
      'container',
      'コンテナ',
      'flexbox',
      'flex',
    ],
    content: `### Stack / Box / Container
\`\`\`tsx
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'

// Stack（1次元レイアウト。Flexboxのラッパー）
<Stack direction="row" spacing={2} alignItems="center">
  <Avatar>K</Avatar>
  <Typography>Kaze UX Design System</Typography>
</Stack>
<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>...</Stack>
// divider
<Stack divider={<Divider orientation="vertical" flexItem />} spacing={2} direction="row">
  <Item>A</Item><Item>B</Item><Item>C</Item>
</Stack>

// Box（汎用コンテナ。div+sx）
<Box sx={{ display: 'flex', gap: 2, p: 2 }}>...</Box>
<Box component="section" sx={{ mt: 4 }}>...</Box>

// Container（最大幅制約）
<Container maxWidth="lg">...</Container>  // lg=1200px
\`\`\`

**Kaze UXコンテナ幅**: 1280px(標準), 960px(フォーム), 1600px(ダッシュボード), 100%(全幅)
公式: https://mui.com/material-ui/react-stack/`,
  },

  // ----- List -----
  {
    id: 'list',
    keywords: ['list', 'リスト', 'listitem'],
    content: `### List
\`\`\`tsx
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import { Settings, User, Bell } from 'lucide-react'

<List subheader={<ListSubheader>設定</ListSubheader>}>
  <ListItem disablePadding>
    <ListItemButton selected={selectedIndex === 0} onClick={() => setSelectedIndex(0)}>
      <ListItemIcon><User size={20} /></ListItemIcon>
      <ListItemText primary="プロフィール" secondary="名前・メール設定" />
    </ListItemButton>
  </ListItem>
  <ListItem disablePadding>
    <ListItemButton>
      <ListItemIcon><Bell size={20} /></ListItemIcon>
      <ListItemText primary="通知" />
    </ListItemButton>
  </ListItem>
</List>
\`\`\`

公式: https://mui.com/material-ui/react-list/`,
  },

  // ----- Switch / Checkbox / Radio -----
  {
    id: 'toggle-inputs',
    keywords: [
      'switch',
      'スイッチ',
      'checkbox',
      'チェックボックス',
      'radio',
      'ラジオ',
      'toggle',
      'トグル',
    ],
    content: `### Switch / Checkbox / Radio
\`\`\`tsx
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'

// Switch
<FormControlLabel control={<Switch checked={enabled} onChange={toggle} />} label="通知を有効にする" />

// Checkbox
<FormControlLabel control={<Checkbox checked={agreed} onChange={handleChange} />} label="利用規約に同意" />
// indeterminate（部分選択）
<Checkbox indeterminate={indeterminate} checked={allChecked} onChange={handleParent} />

// Radio
<RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
  <FormControlLabel value="a" control={<Radio />} label="オプションA" />
  <FormControlLabel value="b" control={<Radio />} label="オプションB" />
</RadioGroup>
\`\`\`

公式: https://mui.com/material-ui/react-switch/`,
  },

  // ----- DatePicker (MUI X) -----
  {
    id: 'datepicker',
    keywords: [
      'datepicker',
      'date',
      '日付',
      'カレンダー',
      'datetime',
      '日時',
      'timepicker',
      '時刻',
    ],
    content: `### DatePicker (MUI X)
\`\`\`tsx
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs from 'dayjs'
import 'dayjs/locale/ja'

// プロバイダーでアプリをラップ
<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
  <DatePicker
    label="開始日"
    value={date}
    onChange={(newValue) => setDate(newValue)}
    slotProps={{ textField: { size: 'small', fullWidth: true } }}
  />

  <DateTimePicker
    label="開始日時"
    value={dateTime}
    onChange={setDateTime}
    minDateTime={dayjs()}
    format="YYYY/MM/DD HH:mm"
  />
</LocalizationProvider>
\`\`\`

Kaze UXカスタム: DateTimePicker（src/components/ui/Form/）
公式: https://mui.com/x/react-date-pickers/`,
  },

  // ----- MUI + Tailwind 統合 -----
  {
    id: 'tailwind-integration',
    keywords: [
      'tailwind',
      'className',
      'クラス',
      '使い分け',
      '統合',
      '併用',
      'css',
    ],
    content: `### MUI + Tailwind CSS 使い分け
**原則**: テーマトークン参照→sx、レイアウト・ユーティリティ→Tailwind className。

| 場面 | sx | Tailwind className |
|------|-----|-------------------|
| MUIテーマの色 (primary, error等) | sx={{ color: 'primary.main' }} | - |
| hover/focus等の状態変化 | sx={{ '&:hover': {...} }} | - |
| MUIコンポーネントのスロット微調整 | sx={{ borderRadius: 3 }} | - |
| Flexレイアウト | - | className="flex items-center gap-4" |
| 余白・パディング | - | className="mt-4 px-6" |
| レスポンシブ表示切替 | - | className="hidden md:block" |
| 純HTML要素 (div, span等) | - | className="..." |

\`\`\`tsx
// OK: 役割で分離
<Card sx={{ bgcolor: 'background.paper', boxShadow: 2 }}>
  <CardContent className="flex flex-col gap-4 p-6">
    <Typography variant="h5" sx={{ color: 'primary.main' }}>タイトル</Typography>
    <div className="grid grid-cols-2 gap-4">
      <TextField size="small" label="名前" fullWidth />
      <TextField size="small" label="メール" fullWidth />
    </div>
  </CardContent>
</Card>

// NG: 同一要素にsxとclassNameを混在
<Button sx={{ color: 'red' }} className="mt-4">混在はNG</Button>
// OK: 分離する
<div className="mt-4">
  <Button sx={{ color: 'error.main' }}>分離してOK</Button>
</div>
\`\`\`

**Tailwindでテーマカラーを使いたい場合**: tailwind.config.jsでMUIテーマ色をTailwind変数に登録する。
公式sx: https://mui.com/system/getting-started/the-sx-prop/`,
  },

  // ----- Breakpoints / Responsive -----
  {
    id: 'responsive',
    keywords: [
      'breakpoint',
      'ブレークポイント',
      'responsive',
      'レスポンシブ',
      'useMediaQuery',
      'モバイル',
      'タブレット',
    ],
    content: `### ブレークポイント / レスポンシブ
\`\`\`tsx
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

// useMediaQueryでブレークポイント判定
const theme = useTheme()
const isMobile = useMediaQuery(theme.breakpoints.down('sm'))   // < 768px
const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')) // 768-1366px
const isDesktop = useMediaQuery(theme.breakpoints.up('md'))    // >= 1366px

// sxでレスポンシブスタイル
<Box sx={{
  display: { xs: 'none', md: 'flex' },          // md以上で表示
  flexDirection: { xs: 'column', sm: 'row' },   // smで横並び
  p: { xs: 1, sm: 2, md: 3 },                   // 段階的padding
}}>

// Gridでレスポンシブレイアウト
<Grid container spacing={{ xs: 1, md: 2 }}>
  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>...</Grid>
</Grid>
\`\`\`

**Kaze UXブレークポイント**: xs=0, sm=768px, md=1366px, lg=1920px
**タッチターゲット**: 最小44x44px (WCAG 2.5.5)
公式: https://mui.com/material-ui/customization/breakpoints/`,
  },

  // ----- Stepper -----
  {
    id: 'stepper',
    keywords: ['stepper', 'ステッパー', 'ウィザード', 'step', 'ステップ'],
    content: `### Stepper
\`\`\`tsx
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'

const steps = ['基本情報', '詳細設定', '確認']

<Stepper activeStep={activeStep} alternativeLabel>
  {steps.map((label) => (
    <Step key={label}>
      <StepLabel>{label}</StepLabel>
    </Step>
  ))}
</Stepper>

// 縦型
<Stepper activeStep={activeStep} orientation="vertical">
  {steps.map((label, index) => (
    <Step key={label}>
      <StepLabel>{label}</StepLabel>
      <StepContent>{getStepContent(index)}</StepContent>
    </Step>
  ))}
</Stepper>
\`\`\`

公式: https://mui.com/material-ui/react-stepper/`,
  },

  // ----- Icons -----
  {
    id: 'icons',
    keywords: ['icon', 'アイコン', 'lucide', 'muiicon'],
    content: `### アイコン
Kaze UXではlucide-reactを標準使用（MUI Iconsは非推奨）。

\`\`\`tsx
import { Search, Settings, ChevronDown, Plus, X, Check } from 'lucide-react'

// ボタン内
<Button startIcon={<Plus size={18} />}>追加</Button>

// IconButton
<IconButton aria-label="検索"><Search size={20} /></IconButton>

// サイズ目安: 16px(小), 20px(標準), 24px(大)
// MUIコンポーネントのアイコンslot
<TextField slotProps={{
  input: { endAdornment: <InputAdornment position="end"><Search size={18} /></InputAdornment> }
}} />
\`\`\`

lucide一覧: https://lucide.dev/icons/
公式(MUI Icons): https://mui.com/material-ui/material-icons/`,
  },
]
