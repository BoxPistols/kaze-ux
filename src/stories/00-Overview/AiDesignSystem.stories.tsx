import { Box, Chip, Grid, Paper, Stack, Typography } from '@mui/material'
import { navigate } from '@storybook/addon-links'
import type { MouseEvent, ReactNode } from 'react'

import workflowYaml from '../../../.github/workflows/quality-check.yml?raw'
import prohibitedMd from '../../../foundations/prohibited.md?raw'
import serverSource from '../../../mcp/src/server.ts?raw'
import { motionOf } from '../../themes/motion'
import { APP_LINKS } from '../../utils/appLinks'
import adoption from '../00-Guide/ds-adoption.generated.json'
import {
  parseCiChecks,
  parseMcpResources,
  parseMcpTools,
  parseRuleStats,
} from '../_shared/aiOverviewData'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Storybook を開いて最初に出るページ。
 *
 * 以前の最初のページは「Storybook とは何か」の入門で、このリポジトリが
 * 何をしているのか（AI エージェントに仕様を配り、守られているかを測る）は
 * 奥のページまで辿らないと分からなかった。ここではそれを 1 画面で示す。
 *
 * 数字と一覧は実装ファイルから読む（aiOverviewData.ts）。手で書くと遅れる。
 */
const meta: Meta = {
  title: 'Overview/AI × デザインシステム',
  // 日本語のタイトルから作られる ID は URL で読めないので固定する
  id: 'overview',
  parameters: {
    layout: 'padded',
    docs: { page: null },
  },
}

export default meta

// ---------------------------------------------------------------------------
// 実データ

const TOOLS = parseMcpTools(serverSource)
const RESOURCES = parseMcpResources(serverSource)
const RULES = parseRuleStats(prohibitedMd)
const CI_CHECKS = parseCiChecks(workflowYaml)

/**
 * テスト件数だけはビルド時に安く数えられないので、実行した日付つきで書く。
 * 更新するときは `pnpm test` の結果をそのまま写す
 */
const TEST_SNAPSHOT = { tests: 816, files: 52, date: '2026-11-04' }

/** CI が呼ぶ検査の説明。説明が無い検査も一覧からは落とさない */
const CHECK_DESCRIPTIONS: Record<string, string> = {
  'lint:ci': 'ESLint（DS ファースト・named export などの独自ルールを含む）',
  'check:types': 'TypeScript strict の型検査',
  'check:types:server': 'API サーバー側の型検査',
  'check:ds-core':
    'DS のコア層が UI ライブラリに依存していないか（依存グラフ）',
  'check:rules': '禁止パターンの違反を実ソースで数える',
  'ds:coverage': 'ルールが何で止まるか・メタデータの充足率を数える',
  'check:samples': '部品メタデータの sample が実際にコンパイルできるか',
  'check:exports': 'メタデータが名乗る部品名が実際に export されているか',
  'check:quickref': 'CLAUDE.md の Quick Reference が実装の値と一致するか',
  'check:skills': 'Skill の記述が実態と合っているか',
  'check:shortcuts':
    'ガイドに書いたショートカットが Storybook の既定と一致するか',
  'check:ga': 'GA4 の測定 ID が全箇所で同じか',
  'check:mcp': 'MCP サーバーが起動し、部品情報とリソースを返すか',
  'check:mcp-package': 'npm に出す MCP の配布物がリポジトリの外で動くか',
  'check:brand': 'モックデータに実在ブランド名が混入していないか',
  'test:all': 'Vitest（ルートと 3 アプリ）+ カバレッジ',
  'build-storybook': 'Storybook のビルド',
  'check:css-vars': '配布する CSS 変数が実ブラウザで意図どおり解決するか',
  'check:tailwind-consumer': 'README の手順で組んだ別プロジェクトに色が付くか',
  'check:a11y': '描画した Storybook のコントラストと操作対象の寸法',
  'check:typo': '描画されたフォントサイズとウェイト',
}

/**
 * 2026-11-04 に kaze MCP（mcp/src/index.ts）へ stdio で送った tools/call と、
 * 返ってきた本文。「強制」行などを省略せずそのまま載せる
 */
const CALL_REQUEST = `// tools/call の params（code は JSON では 1 行の文字列）
{
  name: 'check_rule',
  arguments: {
    code: \`const Card: React.FC = () => (
  <Grid item xs={12}>
    <button style={{ outline: 'none' }}>OK</button>
  </Grid>
)\`,
  },
}`

const CALL_RESPONSE = `✗ 3 件の違反を検出

[C01] コンポーネント
  禁止: React.FC / FC / FunctionComponent
  代わりに: plain function + typed props
  強制: .husky/pre-commit
  該当箇所:
    1 行目: const Card: React.FC = () => (

[C02] コンポーネント
  禁止: <Grid item xs={12}>（MUI v6 以前の API）
  代わりに: <Grid size={{ xs: 12 }}>
  強制: check:rules（CI）/ check_rule（MCP）
  該当箇所:
    2 行目: <Grid item xs={12}>

[A03] アクセシビリティ
  禁止: outline: none でフォーカスリングを消す
  代わりに: focus-visible で出し直す
  強制: check:rules（CI）/ check_rule（MCP）
  該当箇所:
    3 行目: <button style={{ outline: 'none' }}>OK</button>

検査したルール: C01, C02, C03, C06, C07, T01, A03, A05, A06, AI03, AI04
検査していないルール（機械的に測れないもの）: C04, C05, C08, K01, K02, K03, T02, A01, A02, A04, AI01, AI02`

// ---------------------------------------------------------------------------
// 部品

const focusRing = {
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: 2,
  },
} as const

const Section = ({
  title,
  lead,
  children,
}: {
  title: string
  lead: string
  children: ReactNode
}) => (
  <Box component='section' sx={{ mb: { xs: 6, md: 8 } }}>
    <Typography
      variant='h4'
      component='h2'
      sx={{ fontWeight: 700, letterSpacing: '-0.01em', mb: 1 }}>
      {title}
    </Typography>
    <Typography
      variant='body1'
      color='text.secondary'
      sx={{ mb: 3, maxWidth: '68ch' }}>
      {lead}
    </Typography>
    {children}
  </Box>
)

const Stat = ({
  value,
  label,
  note,
}: {
  value: string
  label: string
  note: string
}) => (
  <Paper variant='outlined' sx={{ p: 2.5, height: '100%', borderRadius: 2 }}>
    <Typography
      sx={{
        fontSize: { xs: '1.75rem', md: '2rem' },
        fontWeight: 700,
        lineHeight: 1.1,
        fontVariantNumeric: 'tabular-nums',
      }}>
      {value}
    </Typography>
    <Typography sx={{ fontWeight: 700, mt: 1 }}>{label}</Typography>
    <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
      {note}
    </Typography>
  </Paper>
)

/** Storybook 内の別ページへ。iframe の中なので manager 側を遷移させる */
const StoryLink = ({
  storyId,
  children,
}: {
  storyId: string
  children: ReactNode
}) => (
  <Box
    component='a'
    href={`./?path=/story/${storyId}`}
    target='_top'
    onClick={(e: MouseEvent<HTMLAnchorElement>) => {
      // 修飾キー付きは新しいタブで開きたい操作なので、ブラウザに任せる
      if (e.metaKey || e.ctrlKey || e.shiftKey) return
      e.preventDefault()
      navigate({ storyId })
    }}
    sx={{ color: 'primary.main', fontWeight: 700, ...focusRing }}>
    {children}
  </Box>
)

const AppCard = ({
  title,
  href,
  path,
  description,
}: {
  title: string
  href: string
  /** 表示用。href はローカルだとポート違いの URL になり、パスが出ない */
  path: string
  description: string
}) => (
  <Box
    component='a'
    href={href}
    target='_top'
    sx={{
      display: 'block',
      height: '100%',
      minHeight: 44,
      p: 2.5,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      color: 'text.primary',
      textDecoration: 'none',
      bgcolor: 'background.paper',
      transition: motionOf(['border-color'], 'short'),
      '&:hover': { borderColor: 'primary.main' },
      ...focusRing,
    }}>
    <Typography sx={{ fontWeight: 700 }}>{title} →</Typography>
    <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
      {description}
    </Typography>
    <Typography
      variant='body2'
      color='text.secondary'
      sx={{ display: 'block', mt: 1, fontFamily: 'var(--kaze-font-mono)' }}>
      {path}
    </Typography>
  </Box>
)

/**
 * コード片。共有の CodeBlock は Prism の配色が背景に対して 4.5:1 に届かず、
 * このページは check:a11y の対象なので、色分けせず本文色で出す
 */
const CodeSample = ({
  caption,
  children,
}: {
  caption?: string
  children: string
}) => (
  <Box component='figure' sx={{ m: 0, mb: 2 }}>
    <Box
      component='pre'
      // 横スクロールする領域にキーボードでも入れるようにする
      tabIndex={0}
      sx={{
        m: 0,
        p: 2,
        overflowX: 'auto',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'action.hover',
        color: 'text.primary',
        fontFamily: 'var(--kaze-font-mono)',
        fontSize: '0.86rem',
        lineHeight: 1.6,
        ...focusRing,
      }}>
      {children}
    </Box>
    {caption && (
      <Typography
        component='figcaption'
        variant='body2'
        color='text.secondary'
        sx={{ mt: 0.75 }}>
        {caption}
      </Typography>
    )}
  </Box>
)

/**
 * 名前と説明の一覧。表にすると 375px で説明の列が画面外に押し出されるので、
 * 狭い幅では名前の下に説明を積む
 */
const DefinitionList = ({
  label,
  items,
}: {
  label: string
  items: { term: string; kind?: string; description: string }[]
}) => (
  <Paper variant='outlined' sx={{ borderRadius: 2, mb: 3 }}>
    <Typography
      component='h3'
      variant='body2'
      sx={{ fontWeight: 700, px: 2, py: 1.5, color: 'text.secondary' }}>
      {label}
    </Typography>
    <Box component='dl' sx={{ m: 0 }}>
      {items.map((item) => (
        <Box
          key={item.term}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'minmax(200px, 32%) 1fr' },
            columnGap: 2,
            rowGap: 0.5,
            px: 2,
            py: 1.25,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}>
          <Box
            component='dt'
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 1,
              flexWrap: 'wrap',
            }}>
            <Box
              component='code'
              sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
              {item.term}
            </Box>
            {item.kind && (
              <Typography
                component='span'
                variant='caption'
                color='text.secondary'>
                {item.kind}
              </Typography>
            )}
          </Box>
          <Box component='dd' sx={{ m: 0 }}>
            <Typography variant='body2'>{item.description}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  </Paper>
)

// ---------------------------------------------------------------------------

const OverviewContent = () => {
  const repo = APP_LINKS.repository()
  const docLink = (path: string) =>
    repo ? (
      <Box
        component='a'
        href={`${repo}/blob/main/${path}`}
        target='_blank'
        rel='noopener noreferrer'
        sx={{ color: 'primary.main', fontWeight: 700, ...focusRing }}>
        {path}
      </Box>
    ) : (
      // 公開ビルドではリポジトリへの導線を既定で出さない（appLinks.ts）
      <Box component='code'>{path}</Box>
    )

  const apps = adoption.apps.filter((a) => a.rate !== null)

  return (
    <Box sx={{ maxWidth: 1040, mx: 'auto', px: { xs: 0, sm: 2 }, py: 2 }}>
      {/* 何か */}
      <Box component='header' sx={{ mb: { xs: 6, md: 8 } }}>
        <Typography
          variant='overline'
          color='primary.main'
          sx={{ fontWeight: 700, letterSpacing: '0.12em' }}>
          Kaze UX Overview
        </Typography>
        <Typography
          variant='h3'
          component='h1'
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            fontSize: { xs: '1.9rem', md: '2.6rem' },
            mt: 1,
            mb: 2,
          }}>
          AI × デザインシステム
        </Typography>
        <Typography
          sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.8 }}>
          部品・トークン・禁止パターンを機械可読な 1 か所に持ち、MCP サーバーで
          Claude Code や Cursor などの AI
          エージェントへ配るデザインシステムです。
        </Typography>
        <Typography
          color='text.secondary'
          sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.8 }}>
          {
            '配った規約が守られているかは CI が実際に描画・起動して測り、止められないルールは止められないと数えて出しています。'
          }
        </Typography>
        <Stack direction='row' useFlexGap flexWrap='wrap' gap={1} mt={3}>
          <Chip label={`MCP ツール ${TOOLS.length}`} variant='outlined' />
          <Chip label={`MCP リソース ${RESOURCES.length}`} variant='outlined' />
          <Chip label={`禁止パターン ${RULES.total} 件`} variant='outlined' />
          <Chip
            label={`CI で毎回走る検査 ${CI_CHECKS.length} 種`}
            variant='outlined'
          />
        </Stack>
      </Box>

      {/* どう渡すか */}
      <Section
        title='エージェントは仕様をどう受け取るか'
        lead='MCP サーバー（mcp/src/server.ts）が stdio で次のツールとリソースを公開します。ネットワークにはつながず、リポジトリ内の生成物を読むだけです。'>
        <DefinitionList
          label='MCP のツールとリソース'
          items={[
            ...TOOLS.map((t) => ({
              term: t.name,
              kind: 'ツール',
              description: t.description,
            })),
            ...RESOURCES.map((r) => ({
              term: r.uri,
              kind: 'リソース',
              description: r.description,
            })),
          ]}
        />

        <Typography sx={{ fontWeight: 700, mb: 1 }}>
          Claude Code への導入（Skills・レビュー用 SubAgent・Hook も入る）
        </Typography>
        <CodeSample>
          {`/plugin marketplace add BoxPistols/kaze-ux
/plugin install kaze-design@kaze-ux`}
        </CodeSample>

        <Typography sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
          実際の呼び出し例: 書いたコードを check_rule に渡す
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <CodeSample caption='エージェントが送る tools/call'>
              {CALL_REQUEST}
            </CodeSample>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <CodeSample caption='kaze MCP の応答（2026-11-04 に実行した本文そのまま）'>
              {CALL_RESPONSE}
            </CodeSample>
          </Grid>
        </Grid>
        <Typography variant='body2' color='text.secondary'>
          詳しい導入手順は{' '}
          <StoryLink storyId='guide-mcp-server--overview'>MCP Server</StoryLink>{' '}
          のページにあります。
        </Typography>
      </Section>

      {/* 何を測るか */}
      <Section
        title='何を機械的に検査しているか'
        lead='数字はこのページのビルド時に、生成物と CI の設定ファイルから読み出しています（テスト件数のみ実行日の値）。'>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stat
              value={`${RULES.total}`}
              label='禁止パターン'
              note='foundations/prohibited.md（生成物）'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stat
              value={`${RULES.detectable} / ${RULES.total}`}
              label='ソースから機械検出'
              note={`check:rules と check_rule が同じ定義で数える。止めるものが無いルールは ${RULES.unenforced} 件`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stat
              value={
                adoption.totals.rate === null ? '—' : `${adoption.totals.rate}%`
              }
              label='アプリの DS 部品利用率'
              note={`${apps.length} アプリで DS 部品 ${adoption.totals.dsUse} 箇所、MUI 直 import ${adoption.totals.bypass} 箇所（pnpm ds:adoption）`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stat
              value={`${TEST_SNAPSHOT.tests}`}
              label='Vitest のテスト'
              note={`${TEST_SNAPSHOT.files} ファイル、全件成功（${TEST_SNAPSHOT.date} 実行）`}
            />
          </Grid>
        </Grid>

        <DefinitionList
          label='CI が毎回実行する検査（.github/workflows/quality-check.yml）'
          items={CI_CHECKS.map((c) => ({
            term: `pnpm ${c}`,
            description: CHECK_DESCRIPTIONS[c] ?? '（説明未記載）',
          }))}
        />
        <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
          止められていないルールと、過去に壊れていた検査は{' '}
          {docLink('docs/known-gaps.md')} と {docLink('docs/coverage.md')}{' '}
          に並べています。
        </Typography>
      </Section>

      {/* どこで使われているか */}
      <Section
        title='同じ部品で作ったプロダクト'
        lead='業種の違う 3 つのアプリが、このリポジトリのトークンと部品を workspace 参照で直接使っています。'>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <AppCard
              title='SaaS Dashboard'
              href={APP_LINKS.saas()}
              path='/saas/'
              description='CRUD・データテーブル・カレンダー・マップ'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AppCard
              title='KazeEats'
              href={APP_LINKS.kazeEats()}
              path='/kaze-eats/'
              description='レストラン検索・カート・注文フロー'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AppCard
              title='KazeLogistics'
              href={APP_LINKS.skyKaze()}
              path='/sky-kaze/'
              description='配送監視・地図・ダッシュボード'
            />
          </Grid>
        </Grid>
      </Section>

      {/* 人の側 */}
      <Section
        title='チームで回すための取り決め'
        lead='ツールを配るだけでは、AI が最も速く動く方向に設計が流れます。誰が何を決め、AI に何をさせないかを先に決めています。'>
        <Stack spacing={1.5} component='ul' sx={{ pl: 2.5, m: 0 }}>
          <Typography component='li'>
            役割と権限（デザイナー・エンジニア・PdM・AI
            エージェント）、変えたいときにどこを触るか:{' '}
            {docLink('docs/operating-model.md')}
          </Typography>
          <Typography component='li'>
            規約から外れたコードが進まない 3 つの層と、実際に破ったときの出力:{' '}
            <StoryLink storyId='guide-governance--overview'>
              Governance
            </StoryLink>
          </Typography>
          <Typography component='li'>
            Storybook の画面の見方から知りたい方へ:{' '}
            <StoryLink storyId='guide-getting-started--overview'>
              はじめての Storybook
            </StoryLink>
          </Typography>
        </Stack>
      </Section>
    </Box>
  )
}

export const AiDesignSystem: StoryObj = {
  name: 'AI × デザインシステム',
  render: () => <OverviewContent />,
}
