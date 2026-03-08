import {
  Box,
  Chip,
  Grid,
  Link,
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

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Guide/Introduction',
  parameters: {
    layout: 'padded',
    docs: { page: null },
  },
}

export default meta

// ---------------------------------------------------------------------------
// 共通コンポーネント
// ---------------------------------------------------------------------------

const SectionLabel = ({ children }: { children: string }) => (
  <Typography
    variant='overline'
    sx={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.1em',
      color: 'primary.main',
      mb: 1.5,
      display: 'block',
    }}>
    {children}
  </Typography>
)

const SectionTitle = ({
  children,
  subtitle,
}: {
  children: string
  subtitle?: string
}) => (
  <Box sx={{ mb: 5 }}>
    <Typography
      sx={{
        fontSize: { xs: 22, sm: 26 },
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1.3,
      }}>
      {children}
    </Typography>
    {subtitle && (
      <Typography
        sx={{ mt: 1, fontSize: 14, lineHeight: 1.8, color: 'text.secondary' }}>
        {subtitle}
      </Typography>
    )}
  </Box>
)

const InfoCallout = ({
  title,
  children,
  color = 'info',
}: {
  title: string
  children: React.ReactNode
  color?: 'info' | 'warning' | 'success'
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const palette = {
    info: { border: theme.palette.info.main, bg: isDark ? 'rgba(33,150,243,0.06)' : 'rgba(33,150,243,0.04)' },
    warning: { border: theme.palette.warning.main, bg: isDark ? 'rgba(235,129,23,0.06)' : 'rgba(235,129,23,0.04)' },
    success: { border: theme.palette.success.main, bg: isDark ? 'rgba(70,171,74,0.06)' : 'rgba(70,171,74,0.04)' },
  }
  const c = palette[color]
  return (
    <Box
      sx={{
        pl: 3,
        pr: 3.5,
        py: 2.5,
        mb: 5,
        borderRadius: '0 8px 8px 0',
        borderLeft: `4px solid ${c.border}`,
        bgcolor: c.bg,
      }}>
      <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography
        component='div'
        sx={{ fontSize: 14, lineHeight: 1.85, color: 'text.secondary' }}>
        {children}
      </Typography>
    </Box>
  )
}

const StyledTable = ({
  headers,
  children,
}: {
  headers: string[]
  children: React.ReactNode
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <TableContainer
      sx={{
        mb: 5,
        borderRadius: 2,
        border: 1,
        borderColor: isDark ? 'grey.800' : 'grey.200',
        overflow: 'hidden',
      }}>
      <Table size='medium'>
        <TableHead>
          <TableRow
            sx={{
              bgcolor: isDark
                ? 'rgba(255,255,255,0.03)'
                : 'rgba(0,0,0,0.02)',
            }}>
            {headers.map((h) => (
              <TableCell
                key={h}
                sx={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  py: 1.5,
                  borderBottomWidth: 2,
                  borderColor: isDark ? 'grey.800' : 'grey.200',
                }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody
          sx={{
            '& tr:last-child td': { borderBottom: 0 },
            '& td': { py: 1.75, fontSize: 14 },
          }}>
          {children}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

// ---------------------------------------------------------------------------
// メインコンテンツ
// ---------------------------------------------------------------------------

const IntroductionContent = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const benefits = [
    {
      title: 'コンポーネント一覧',
      description: 'プロジェクトで使えるUI部品が一目でわかる',
    },
    {
      title: '動作確認',
      description: 'propsをリアルタイムに変更して見た目や挙動を確認',
    },
    {
      title: 'Dark Mode 対応',
      description: 'ワンクリックでライト/ダークテーマを切り替え',
    },
    {
      title: 'デザインの統一',
      description: '既存コンポーネントの再利用で一貫したUI',
    },
    {
      title: 'ドキュメント自動生成',
      description: 'コンポーネントの使い方が自動でドキュメント化',
    },
  ]

  const categories = [
    {
      name: 'Guide',
      color: 'primary' as const,
      description:
        'Storybook の使い方ガイド。初めて使う方はまずここから。',
    },
    {
      name: 'Design Philosophy',
      color: 'secondary' as const,
      description: 'KDDI Smart Drone Platform のデザイン理念と技術スタック。',
    },
    {
      name: 'Design Tokens',
      color: 'info' as const,
      description:
        'カラーパレット、タイポグラフィ、スペーシング、シャドウなどのデザイン基盤。',
    },
    {
      name: 'Components',
      color: 'success' as const,
      description:
        'UI / Form / UTM の各カテゴリに整理された実際のコンポーネント群。',
    },
    {
      name: 'Patterns',
      color: 'warning' as const,
      description:
        '複数のコンポーネントを組み合わせた実践的なレイアウトパターン。',
    },
  ]

  const techStack = [
    { name: 'React', version: '19', purpose: 'UIライブラリ' },
    { name: 'MUI (Material UI)', version: 'v7', purpose: 'コンポーネントライブラリ' },
    { name: 'TypeScript', version: '5.x', purpose: '型安全' },
    { name: 'Tailwind CSS', version: 'v3', purpose: 'ユーティリティCSS' },
    { name: 'Storybook', version: '10.x', purpose: 'コンポーネントカタログ' },
  ]

  return (
    <Box sx={{ maxWidth: 1040, mx: 'auto' }}>
      {/* ヒーロー */}
      <Box
        sx={{
          px: { xs: 4, sm: 7 },
          py: { xs: 7, sm: 9 },
          mb: 10,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          background: isDark
            ? 'linear-gradient(160deg, #1a1f3e 0%, #0f1628 40%, #131926 100%)'
            : 'linear-gradient(160deg, #f0f4ff 0%, #e8eeff 40%, #f5f0ff 100%)',
          border: 1,
          borderColor: isDark
            ? 'rgba(100,130,255,0.12)'
            : 'rgba(38,66,190,0.08)',
        }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 200,
            height: 200,
            opacity: isDark ? 0.06 : 0.04,
            backgroundImage:
              'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <Typography
          variant='overline'
          sx={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: isDark ? 'primary.light' : 'primary.main',
            mb: 2,
            display: 'block',
          }}>
          KDDI SMART DRONE PLATFORM
        </Typography>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: 28, sm: 40 },
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            mb: 3,
            color: isDark ? 'grey.50' : 'grey.900',
          }}>
          Storybook ガイド
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: 14, sm: 16 },
            lineHeight: 1.85,
            color: 'text.secondary',
            maxWidth: 560,
          }}>
          UIコンポーネントのカタログです。アプリ本体を起動せず、個々のコンポーネントを単独で確認・操作できます。
        </Typography>
      </Box>

      {/* メリット */}
      <Box sx={{ mb: 10, px: { xs: 1, sm: 2 } }}>
        <SectionLabel>BENEFITS</SectionLabel>
        <SectionTitle subtitle='なぜ Storybook を使うのか'>
          Storybook を使うメリット
        </SectionTitle>
        <Grid container spacing={2.5}>
          {benefits.map((b) => (
            <Grid key={b.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                sx={{
                  px: 3,
                  py: 3,
                  height: '100%',
                  borderRadius: 2.5,
                  border: 1,
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.08)',
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: isDark
                      ? 'rgba(255,255,255,0.16)'
                      : 'rgba(0,0,0,0.16)',
                  },
                }}>
                <Typography
                  sx={{ fontWeight: 700, fontSize: 15, mb: 1.5, color: isDark ? 'grey.100' : 'grey.900' }}>
                  {b.title}
                </Typography>
                <Typography
                  sx={{ fontSize: 14, lineHeight: 1.8, color: 'text.secondary' }}>
                  {b.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* サイドバー構成 */}
      <Box sx={{ mb: 10, px: { xs: 1, sm: 2 } }}>
        <SectionLabel>NAVIGATION</SectionLabel>
        <SectionTitle subtitle='各カテゴリの概要'>
          サイドバーの構成
        </SectionTitle>
        <Stack spacing={0}>
          {categories.map((c, index) => (
            <Box
              key={c.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                py: 3,
                borderBottom: index < categories.length - 1 ? 1 : 0,
                borderColor: isDark
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.06)',
              }}>
              <Chip
                label={c.name}
                color={c.color}
                size='small'
                sx={{ fontWeight: 600, minWidth: 130 }}
              />
              <Typography
                sx={{ fontSize: 14, lineHeight: 1.8, color: 'text.secondary' }}>
                {c.description}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* クイックスタート */}
      <Box sx={{ mb: 10, px: { xs: 1, sm: 2 } }}>
        <SectionLabel>QUICK START</SectionLabel>
        <SectionTitle>クイックスタート</SectionTitle>
        <Stack spacing={4}>
          {[
            {
              step: '1',
              title: 'Storybook を起動する',
              description: 'ターミナルで pnpm storybook を実行',
            },
            {
              step: '2',
              title: 'サイドバーからコンポーネントを選ぶ',
              description:
                '左側のサイドバーでカテゴリを展開し、見たいコンポーネントをクリック',
            },
            {
              step: '3',
              title: 'Controls パネルで設定を変更する',
              description:
                '画面下部の「Controls」タブで props をリアルタイムに変更',
            },
            {
              step: '4',
              title: 'テーマを切り替える',
              description:
                '上部ツールバーのアイコン（Theme）で Light / Dark を切り替え',
            },
          ].map((item) => (
            <Box
              key={item.step}
              sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isDark
                    ? 'rgba(38,66,190,0.15)'
                    : 'rgba(38,66,190,0.08)',
                  color: 'primary.main',
                  borderRadius: 2,
                  flexShrink: 0,
                  fontWeight: 700,
                  fontSize: 16,
                }}>
                {item.step}
              </Box>
              <Box sx={{ pt: 0.5 }}>
                <Typography
                  sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: isDark ? 'grey.100' : 'grey.900' }}>
                  {item.title}
                </Typography>
                <Typography
                  sx={{ fontSize: 14, lineHeight: 1.8, color: 'text.secondary' }}>
                  {item.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* キーボードショートカット */}
      <Box sx={{ mb: 10, px: { xs: 1, sm: 2 } }}>
        <SectionLabel>KEYBOARD SHORTCUTS</SectionLabel>
        <SectionTitle subtitle='Storybook の操作を効率化するショートカットキー'>
          キーボードショートカット
        </SectionTitle>
        <StyledTable headers={['操作', 'ショートカット']}>
          {[
            { action: 'コンポーネントを検索', key: 'K' },
            { action: 'フルスクリーン', key: 'F' },
            { action: 'サイドバーの表示/非表示', key: 'S' },
            { action: 'アドオンパネルの表示/非表示', key: 'A' },
            { action: 'アドオンパネルの向きを切替', key: 'D' },
            { action: 'ツールバーの表示/非表示', key: 'T' },
            { action: '前のコンポーネント', key: 'Alt + \u2191' },
            { action: '次のコンポーネント', key: 'Alt + \u2193' },
            { action: '前のストーリー', key: 'Alt + \u2190' },
            { action: '次のストーリー', key: 'Alt + \u2192' },
          ].map((s) => (
            <TableRow key={s.action}>
              <TableCell>{s.action}</TableCell>
              <TableCell>
                <Chip
                  label={s.key}
                  size='small'
                  variant='outlined'
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </StyledTable>
        <InfoCallout title='ショートカットのカスタマイズ'>
          <Box component='span' sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
            Cmd + Shift + ,
          </Box>{' '}
          （Windows: Ctrl + Shift + ,）で設定画面を開き、「Keyboard shortcuts」タブからすべてのショートカットを変更できます。
        </InfoCallout>

        {/* SDPF Concierge ショートカット */}
        <Typography
          sx={{
            fontSize: { xs: 18, sm: 20 },
            fontWeight: 700,
            mb: 1.5,
            mt: 6,
            letterSpacing: '-0.01em',
          }}>
          SDPF Concierge ショートカット
        </Typography>
        <Typography
          sx={{ fontSize: 14, lineHeight: 1.85, color: 'text.secondary', mb: 4 }}>
          SDPF独自のチャットウィジェット用ショートカットです。右下のConciergeチャットが対象です。
        </Typography>
        <StyledTable headers={['操作', 'Mac', 'Windows']}>
          {[
            { action: 'チャット開閉', mac: 'Cmd+Shift+K', win: 'Ctrl+Shift+K' },
            { action: '入力欄にフォーカス', mac: 'Cmd+/', win: 'Ctrl+/' },
            { action: 'メッセージ送信', mac: 'Cmd+Enter', win: 'Ctrl+Enter' },
            { action: '設定パネル切替', mac: 'Cmd+Shift+S', win: 'Ctrl+Shift+S' },
            { action: '履歴ダウンロード', mac: 'Cmd+Shift+D', win: 'Ctrl+Shift+D' },
            { action: 'サイドバー/ウィジェット切替', mac: 'Cmd+Shift+L', win: 'Ctrl+Shift+L' },
            { action: '履歴クリア', mac: 'Cmd+Shift+Delete', win: 'Ctrl+Shift+Delete' },
            { action: 'チャットを閉じる', mac: 'Esc', win: 'Esc' },
          ].map((s) => (
            <TableRow key={s.action}>
              <TableCell>{s.action}</TableCell>
              <TableCell>
                <Chip
                  label={s.mac}
                  size='small'
                  variant='outlined'
                  sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={s.win}
                  size='small'
                  variant='outlined'
                  sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}
                />
              </TableCell>
            </TableRow>
          ))}
        </StyledTable>
        <InfoCallout title='Storybook標準との違い' color='warning'>
          上記のConciergeショートカットはSDPFが独自に実装したものです。
          Storybookの設定画面（Keyboard shortcuts）からは変更できません。
        </InfoCallout>
      </Box>

      {/* 対象者別 */}
      <Box sx={{ mb: 10, px: { xs: 1, sm: 2 } }}>
        <SectionLabel>TARGET AUDIENCE</SectionLabel>
        <SectionTitle subtitle='各ページの詳細ガイドを参照してください'>
          対象者別ガイド
        </SectionTitle>
        <StyledTable headers={['役割', '読むべきページ']}>
          <TableRow>
            <TableCell>全員</TableCell>
            <TableCell>このページ + How to Use</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>デザイナー</TableCell>
            <TableCell>For Designers</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>開発者</TableCell>
            <TableCell>Component Development</TableCell>
          </TableRow>
        </StyledTable>
      </Box>

      {/* 技術スタック */}
      <Box sx={{ mb: 6, px: { xs: 1, sm: 2 } }}>
        <SectionLabel>TECH STACK</SectionLabel>
        <SectionTitle>技術スタック</SectionTitle>
        <StyledTable headers={['技術', 'バージョン', '用途']}>
          {techStack.map((t) => (
            <TableRow key={t.name}>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                  {t.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label={t.version} size='small' variant='outlined' />
              </TableCell>
              <TableCell>{t.purpose}</TableCell>
            </TableRow>
          ))}
        </StyledTable>
      </Box>

      {/* 参考リンク */}
      <Box
        sx={{
          mx: { xs: 1, sm: 2 },
          px: 3,
          py: 3,
          borderRadius: 2,
          bgcolor: isDark
            ? 'rgba(255,255,255,0.02)'
            : 'rgba(0,0,0,0.015)',
        }}>
        <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          参考リンク
        </Typography>
        <Stack spacing={1}>
          <Link href='https://storybook.js.org/docs' target='_blank' rel='noopener noreferrer' sx={{ fontSize: 14 }}>
            Storybook Documentation
          </Link>
          <Link href='https://mui.com/material-ui/' target='_blank' rel='noopener noreferrer' sx={{ fontSize: 14 }}>
            MUI Documentation
          </Link>
        </Stack>
      </Box>
    </Box>
  )
}

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <IntroductionContent />,
}
