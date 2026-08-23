import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { CodeBlock } from '../_shared/CodeBlock'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Guide/MCP Server',
  parameters: {
    layout: 'padded',
    docs: { page: null },
  },
}

export default meta

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant='h4' sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
        {subtitle}
      </Typography>
    )}
  </Box>
)

// ツール・リソースの一覧（紹介用の静的データ。仕様の正は MCP サーバー側）
const TOOLS = [
  {
    name: 'get_token',
    args: 'path',
    desc: 'デザイントークンをドットパスで取得。例: color.light.primary.main',
  },
  {
    name: 'get_component',
    args: 'name',
    desc: 'コンポーネント仕様（props / a11y / import / story）を取得',
  },
  {
    name: 'check_rule',
    args: 'code',
    desc: 'コード片を禁止パターンに照合し、違反 ID と理由を返す',
  },
  {
    name: 'search',
    args: 'query, scope?',
    desc: 'トークン・コンポーネントを横断検索',
  },
]

const RESOURCES = [
  { uri: 'kaze://tokens', desc: 'W3C DTCG デザイントークン全体' },
  { uri: 'kaze://components', desc: '全コンポーネントのメタデータ' },
  { uri: 'kaze://rules', desc: '禁止パターン一覧（ID・代替・強制手段）' },
]

const TIERS = [
  {
    tier: 'Tier 1',
    what: '.mcp.json に kaze を登録',
    got: 'エージェントが正しいトークン・部品仕様を引ける',
  },
  {
    tier: 'Tier 2',
    what: '+ Plugin をインストール',
    got: 'Skills / レビュー SubAgent / 禁止パターン Hook まで自動で入る',
  },
  {
    tier: 'Tier 3',
    what: '+ CLAUDE.md に「UI は kaze MCP を参照」と 1 行',
    got: '参照が習慣ではなく既定になる',
  },
]

const McpServerContent = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3 }}>
      {/* Hero */}
      <Paper
        variant='outlined'
        sx={{
          px: 6,
          py: 5,
          mb: 6,
          borderRadius: 3,
          textAlign: 'center',
          background: isDark
            ? 'linear-gradient(135deg, rgba(0,87,184,0.12) 0%, rgba(14,173,184,0.10) 100%)'
            : 'linear-gradient(135deg, rgba(0,87,184,0.05) 0%, rgba(14,173,184,0.05) 100%)',
        }}>
        <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
          Kaze MCP Server
        </Typography>
        <Typography variant='h6' color='text.secondary' sx={{ mb: 2 }}>
          AI エージェントに Kaze の設計知識を供給する
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          トークン・コンポーネント仕様・禁止ルールを MCP (Model Context
          Protocol) で配布。 別のリポジトリでも、AI が Kaze
          に準拠したコードを書けるようになる
        </Typography>
        <Stack direction='row' spacing={1} justifyContent='center' mt={3}>
          <Chip label='ネットワーク不要 (stdio)' size='small' />
          <Chip label='4 tools + 3 resources' size='small' />
          <Chip label='Claude Code / Cursor 対応' size='small' />
        </Stack>
      </Paper>

      {/* Quick Start */}
      <SectionHeader
        title='Quick Start'
        subtitle='消費側リポジトリの .mcp.json に 3 行足すだけで動く'
      />
      <CodeBlock language='json' caption='.mcp.json（消費側リポジトリ）'>
        {`{
  "mcpServers": {
    "kaze": {
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/kaze-ux/mcp/src/index.ts"]
    }
  }
}`}
      </CodeBlock>
      <CodeBlock
        language='bash'
        caption='Claude Code Plugin なら 2 コマンドで全部入り（MCP + Skills + SubAgent + Hook）'>
        {`/plugin marketplace add boxpistols/kaze-ux
/plugin install kaze-design@kaze-ux`}
      </CodeBlock>

      {/* Tools */}
      <Box sx={{ mt: 6 }}>
        <SectionHeader
          title='Tools'
          subtitle='エージェントが呼び出せる 4 つのツール'
        />
        <TableContainer component={Paper} variant='outlined' sx={{ mb: 4 }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>ツール</TableCell>
                <TableCell>引数</TableCell>
                <TableCell>説明</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {TOOLS.map((t) => (
                <TableRow key={t.name}>
                  <TableCell>
                    <Chip label={t.name} size='small' variant='outlined' />
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary'>
                      {t.args}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>{t.desc}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TableContainer component={Paper} variant='outlined'>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>リソース</TableCell>
                <TableCell>内容</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {RESOURCES.map((r) => (
                <TableRow key={r.uri}>
                  <TableCell>
                    <Chip label={r.uri} size='small' variant='outlined' />
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>{r.desc}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 使用イメージ */}
      <Box sx={{ mt: 6 }}>
        <SectionHeader
          title='エージェントはこう使う'
          subtitle='書く前に引き、書いたら照合する'
        />
        <CodeBlock language='markdown' caption='AI エージェントの動き（例）'>
          {`1. search("日付入力")        → customDatePicker が見つかる
2. get_component("customDatePicker") → props と import 元を確認
3. コードを書く              → トークンは get_token で引いた値だけを使う
4. check_rule(生成コード)    → 違反 ID が返れば理由に従い自己修正`}
        </CodeBlock>
      </Box>

      {/* 導入 3 段階 */}
      <Box sx={{ mt: 6 }}>
        <SectionHeader
          title='導入の 3 段階'
          subtitle='MCP だけでも使える。Plugin まで入れると仕組みで完結する'
        />
        <Grid container spacing={2}>
          {TIERS.map((t) => (
            <Grid key={t.tier} size={{ xs: 12, md: 4 }}>
              <Paper
                variant='outlined'
                sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Chip label={t.tier} size='small' sx={{ mb: 1.5 }} />
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                  {t.what}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mt: 1 }}>
                  {t.got}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 仕組み */}
      <Box sx={{ mt: 6, mb: 8 }}>
        <SectionHeader
          title='仕組み'
          subtitle='知識はデータに、強制は仕組みに、コードは最低限に'
        />
        <CodeBlock
          language='markdown'
          caption='レイヤ構成（詳細はリポジトリの DESIGN.md）'>
          {`消費側リポジトリ（Claude Code / Cursor）
  └ Plugin: Skills + SubAgent + Hook + MCP 起動設定
      └ MCP サーバー mcp/（thin server: データを読むだけ）
          └ データ層 = 単一ソース（すべて生成物）
              design-tokens/tokens.json   ← pnpm export-tokens
              metadata/components.json    ← pnpm export-metadata
              foundations/prohibited.md   ← pnpm export-rules`}
        </CodeBlock>
        <Typography variant='body2' color='text.secondary'>
          ルールを 1 つ追加すると、再生成 → MCP → Plugin
          を通じて消費側リポジトリまで自動で届く。 同じ知識を 2
          箇所に書いた時点で設計違反、が運用原則。
        </Typography>
      </Box>
    </Box>
  )
}

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <McpServerContent />,
}
