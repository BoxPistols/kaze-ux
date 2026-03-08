import {
  Box,
  Chip,
  Divider,
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
  title: 'Guide/AI and Design System',
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
    <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
        {subtitle}
      </Typography>
    )}
  </Box>
)

// ---------------------------------------------------------------------------
// メインコンテンツ
// ---------------------------------------------------------------------------

const AIDesignSystemContent = () => {
  const theme = useTheme()

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3 }}>
      <Paper
        variant='outlined'
        sx={{
          px: 6,
          py: 5,
          mb: 6,
          borderRadius: 3,
          textAlign: 'center',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(156,39,176,0.08) 0%, rgba(235,129,23,0.08) 100%)'
              : 'linear-gradient(135deg, rgba(156,39,176,0.04) 0%, rgba(235,129,23,0.04) 100%)',
        }}>
        <Typography variant='h3' sx={{ fontWeight: 800, mb: 1 }}>
          AI とデザインシステム
        </Typography>
        <Typography variant='h6' color='text.secondary' sx={{ mb: 2 }}>
          AIコード生成時代にデザインシステムが果たす役割
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          AIが書くコードの品質は、デザインシステムの整備度に比例する
        </Typography>
      </Paper>

      {/* なぜ */}
      <SectionHeader
        title='デザインシステムがAIの精度を上げる'
        subtitle='トークンと命名規則が揃っていれば、AIへの指示が一意になる'
      />
      <TableContainer component={Paper} variant='outlined' sx={{ mb: 3 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>指示の質</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>プロンプト例</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>結果</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Chip label='曖昧' color='error' size='small' />
              </TableCell>
              <TableCell>「青いボタンを作って」</TableCell>
              <TableCell>AIが色・サイズ・角丸を勝手に決める</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Chip label='明確' color='success' size='small' />
              </TableCell>
              <TableCell>
                <code>
                  Button variant=&quot;contained&quot; color=&quot;primary&quot;
                </code>
              </TableCell>
              <TableCell>トークンに基づく一意なコード生成</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Paper
        variant='outlined'
        sx={{
          px: 3.5,
          py: 2.5,
          mb: 5,
          borderRadius: 2,
          borderColor: 'success.main',
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(70,171,74,0.06)'
              : 'rgba(70,171,74,0.03)',
        }}>
        <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>
          核心
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          AIの精度を左右するのは、見た目の正確さ以上に
          <strong>意味の正確さ</strong>。
          デザインシステムは「意味を構造化する仕組み」であり、AIへの最良のコンテキスト。
        </Typography>
      </Paper>

      <Divider sx={{ my: 5 }} />

      {/* AIツール */}
      <SectionHeader title='主要なAIコード生成ツール' />
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {[
          {
            name: 'Cursor',
            desc: 'AI搭載コードエディタ。コードベース全体を理解してコード生成・修正。',
            use: 'SDPFコンポーネントの開発、既存コードの修正',
          },
          {
            name: 'Claude Code',
            desc: 'Anthropic社のCLI型AIエージェント。ファイル操作・Git操作含む自律的開発。',
            use: 'SDPFの新規コンポーネント作成、ストーリー自動生成',
          },
          {
            name: 'GitHub Copilot',
            desc: 'エディタ内でリアルタイムにコード補完。既存コードのパターンを学習。',
            use: '日常的なコーディングの高速化',
          },
          {
            name: 'v0 / Bolt',
            desc: 'UIコンポーネントをプロンプトから生成。プロトタイピングに最適。',
            use: 'デザイン検討段階でのラピッドプロトタイピング',
          },
        ].map((tool) => (
          <Grid key={tool.name} size={{ xs: 12, sm: 6 }}>
            <Paper
              variant='outlined'
              sx={{ px: 3.5, py: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
                {tool.name}
              </Typography>
              <Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
                {tool.desc}
              </Typography>
              <Chip
                label={tool.use}
                size='small'
                variant='outlined'
                sx={{ fontSize: 13 }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 5 }} />

      {/* デザイナーの知識 */}
      <SectionHeader title='AI時代にデザイナーが持つべき知識' />
      <Stack spacing={3} sx={{ mb: 5 }}>
        {[
          {
            num: '1',
            title: '構造の理解',
            desc: 'コンポーネントの分割方針、props設計。AIが書くコードの「骨組み」を評価できるようになる。',
          },
          {
            num: '2',
            title: '設計言語の習得',
            desc: 'トークン名、バリアント名を正確に使える。AIへの指示精度が格段に上がる。',
          },
          {
            num: '3',
            title: '影響範囲の判断',
            desc: 'AIが生成したコードが既存システムにどう影響するか。破壊的変更かどうかを判断できる。',
          },
        ].map((item) => (
          <Stack
            key={item.num}
            direction='row'
            spacing={2}
            alignItems='flex-start'>
            <Paper
              sx={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
                borderRadius: '50%',
                flexShrink: 0,
              }}>
              <Typography variant='body2' sx={{ fontWeight: 700 }}>
                {item.num}
              </Typography>
            </Paper>
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {item.title}
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                {item.desc}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>

      <Divider sx={{ my: 5 }} />

      {/* 効果的なプロンプト */}
      <SectionHeader
        title='AIへの効果的なプロンプト'
        subtitle='デザインシステムの語彙を使った指示例'
      />

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography
            variant='body2'
            sx={{ fontWeight: 600, mb: 1, color: 'error.main' }}>
            曖昧な指示
          </Typography>
          <CodeBlock language='markdown'>
            {`「ドローンの状態を表示するカードを作って。
 青くて、角丸で、影を付けて。
 サイズは大中小の3つ。」`}
          </CodeBlock>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography
            variant='body2'
            sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
            SDPF語彙を使った指示
          </Typography>
          <CodeBlock language='markdown'>
            {`「ServiceCardコンポーネントを作成。
 - variant: outlined
 - padding: spacing(3) = 24px
 - 色: primary.main (#2642be)
 - size: compact | default | comfortable
 - 状態: Empty, Loading, Error, Ideal
 - MUI v7 Grid size={{ xs: 12, sm: 6 }}
 - React.FC 不使用、interface で型定義」`}
          </CodeBlock>
        </Grid>
      </Grid>

      {/* SDPFでの活用 */}
      <SectionHeader title='SDPFでのAI活用' />
      <TableContainer component={Paper} variant='outlined'>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>活用方法</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>ツール</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>説明</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              [
                'コンポーネント仕様の参照',
                'Storybook',
                'AIにStorybookのコンポーネント仕様を与えてコード生成',
              ],
              [
                '設計判断の相談',
                'コンシェルジュ',
                'このチャットで設計方針・トークン・原則を質問',
              ],
              [
                'コード生成',
                'Cursor / Claude Code',
                'SDPFルールに基づくコード生成',
              ],
              [
                'レビュー',
                'AI + Storybook',
                '生成コードをStorybookで視覚的に確認',
              ],
            ].map((row) => (
              <TableRow key={row[0]}>
                <TableCell>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {row[0]}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={row[1]} size='small' variant='outlined' />
                </TableCell>
                <TableCell>
                  <Typography variant='body1' color='text.secondary'>
                    {row[2]}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <AIDesignSystemContent />,
}
