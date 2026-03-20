import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RemoveIcon from '@mui/icons-material/Remove'
import {
  Box,
  Chip,
  Grid,
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
  title: 'Guide/Application Guide',
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
    info: {
      border: theme.palette.info.main,
      bg: isDark ? 'rgba(33,150,243,0.06)' : 'rgba(33,150,243,0.04)',
    },
    warning: {
      border: theme.palette.warning.main,
      bg: isDark ? 'rgba(235,129,23,0.06)' : 'rgba(235,129,23,0.04)',
    },
    success: {
      border: theme.palette.success.main,
      bg: isDark ? 'rgba(70,171,74,0.06)' : 'rgba(70,171,74,0.04)',
    },
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
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
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

const CodeBlock = ({ children }: { children: string }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <Box
      component='pre'
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 2,
        bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
        border: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        overflow: 'auto',
        fontSize: 13,
        lineHeight: 1.7,
        fontFamily: '"Fira Code", "JetBrains Mono", monospace',
        color: 'text.primary',
        '& code': { fontFamily: 'inherit' },
      }}>
      <code>{children}</code>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// データ定義
// ---------------------------------------------------------------------------

// 共有コンポーネントのマトリクス（実際の import 調査に基づく）
const sharedComponents: {
  name: string
  category: string
  logistics: boolean
  eats: boolean
  saas: boolean
}[] = [
  // UI コンポーネント
  {
    name: 'Button (CVA)',
    category: 'UI',
    logistics: true,
    eats: true,
    saas: true,
  },
  {
    name: 'Card / CardContent / CardHeader / CardTitle',
    category: 'UI',
    logistics: true,
    eats: true,
    saas: true,
  },
  {
    name: 'CustomChip',
    category: 'UI',
    logistics: true,
    eats: true,
    saas: true,
  },
  {
    name: 'IconButton',
    category: 'UI',
    logistics: true,
    eats: true,
    saas: true,
  },
  {
    name: 'CustomToaster / toast',
    category: 'UI',
    logistics: true,
    eats: true,
    saas: true,
  },
  {
    name: 'NotFoundView',
    category: 'UI',
    logistics: false,
    eats: true,
    saas: true,
  },
  {
    name: 'StatusTag',
    category: 'UI',
    logistics: false,
    eats: true,
    saas: true,
  },
  {
    name: 'UserAvatar',
    category: 'UI',
    logistics: false,
    eats: true,
    saas: true,
  },
  {
    name: 'ConfirmDialog',
    category: 'UI',
    logistics: true,
    eats: false,
    saas: true,
  },
  {
    name: 'FormDialog',
    category: 'UI',
    logistics: true,
    eats: false,
    saas: true,
  },
  {
    name: 'SectionTitle',
    category: 'UI',
    logistics: true,
    eats: false,
    saas: false,
  },
  {
    name: 'PageHeader',
    category: 'UI',
    logistics: false,
    eats: false,
    saas: true,
  },
  {
    name: 'SaveButton',
    category: 'UI',
    logistics: false,
    eats: true,
    saas: true,
  },
  {
    name: 'LoadingButton',
    category: 'UI',
    logistics: false,
    eats: true,
    saas: true,
  },
  {
    name: 'CustomAccordion',
    category: 'UI',
    logistics: false,
    eats: true,
    saas: true,
  },
  {
    name: 'ActionMenu',
    category: 'UI',
    logistics: false,
    eats: true,
    saas: true,
  },
  {
    name: 'ResourceTable',
    category: 'UI',
    logistics: false,
    eats: true,
    saas: true,
  },
  {
    name: 'Fab',
    category: 'UI',
    logistics: false,
    eats: false,
    saas: true,
  },
  {
    name: 'ButtonGroup',
    category: 'UI',
    logistics: false,
    eats: false,
    saas: true,
  },
  {
    name: 'SplitButton',
    category: 'UI',
    logistics: false,
    eats: false,
    saas: true,
  },
  {
    name: 'ServiceCard',
    category: 'UI',
    logistics: false,
    eats: false,
    saas: true,
  },
  {
    name: 'ConnectionStatusChip',
    category: 'UI',
    logistics: false,
    eats: false,
    saas: true,
  },
  // フォーム
  {
    name: 'CustomTextField',
    category: 'Form',
    logistics: false,
    eats: true,
    saas: true,
  },
  {
    name: 'CustomSelect',
    category: 'Form',
    logistics: false,
    eats: true,
    saas: true,
  },
  {
    name: 'DateTimePicker',
    category: 'Form',
    logistics: false,
    eats: false,
    saas: true,
  },
  {
    name: 'MultiSelectAutocomplete',
    category: 'Form',
    logistics: false,
    eats: false,
    saas: true,
  },
  // レイアウト・テーマ
  {
    name: 'ThemeProvider',
    category: 'Theme',
    logistics: true,
    eats: false,
    saas: true,
  },
  {
    name: 'hookUseTheme',
    category: 'Theme',
    logistics: true,
    eats: false,
    saas: false,
  },
  {
    name: 'lightTheme / darkTheme (ベーステーマ)',
    category: 'Theme',
    logistics: true,
    eats: true,
    saas: true,
  },
  {
    name: 'ThemeToggle',
    category: 'Theme',
    logistics: false,
    eats: false,
    saas: true,
  },
  {
    name: 'LayoutWithSidebar / SidebarProvider',
    category: 'Layout',
    logistics: false,
    eats: false,
    saas: true,
  },
  {
    name: 'MiniCalendar / WeekStartSelector',
    category: 'UI',
    logistics: false,
    eats: false,
    saas: true,
  },
  {
    name: 'CustomTable',
    category: 'UI',
    logistics: false,
    eats: false,
    saas: true,
  },
  {
    name: 'CalendarSettingsProvider',
    category: 'Provider',
    logistics: false,
    eats: false,
    saas: true,
  },
]

// プロダクト固有の実装
const productExtensions = [
  {
    name: 'KazeLogistics',
    color: '#E87A1E',
    description: '物流シミュレーション',
    items: [
      {
        label: 'シミュレーションエンジン',
        detail: 'Zustand ベースの状態管理で配送シミュレーションを実行',
      },
      {
        label: 'LiveMap (MapLibre GL JS)',
        detail: 'リアルタイム地図上にハブ・ドライバー・配送ルートを表示',
      },
      {
        label: 'フローティングパネル UI',
        detail:
          'DriverPanel / EventLog / TimelineBar を地図上にオーバーレイ表示',
      },
      {
        label: '独自テーマカラー',
        detail: 'LOGI_ORANGE / LOGI_NAVY を基調としたブランドカラー',
      },
      {
        label: 'WelcomeOverlay',
        detail: '初回起動時のオンボーディング画面',
      },
      {
        label: 'IncidentPanel',
        detail: '配送中のインシデント表示・管理パネル',
      },
    ],
  },
  {
    name: 'KazeEats',
    color: '#06C167',
    description: 'フードデリバリー',
    items: [
      {
        label: '独自テーマ (UE Green)',
        detail:
          'UE_GREEN (#06C167) を基調にベーステーマを拡張した ueLightTheme / ueDarkTheme',
      },
      {
        label: 'BottomNavigation',
        detail: 'MUI BottomNavigation によるモバイルファーストのナビゲーション',
      },
      {
        label: 'カート状態管理 (Zustand)',
        detail: 'useCartStore でカートの追加・削除・合計計算を管理',
      },
      {
        label: 'レストラン・メニューデータ',
        detail: 'restaurants / categories / orders のモックデータ群',
      },
      {
        label: '注文追跡ページ',
        detail: 'OrderTrackingPage でステータスベースの配達進捗を表示',
      },
      {
        label: '価格フォーマッタ',
        detail: 'formatPrice ユーティリティで通貨表示を統一',
      },
    ],
  },
  {
    name: 'SaaS Dashboard',
    color: '#0EADB8',
    description: '業務管理ダッシュボード',
    items: [
      {
        label: 'サイドバーレイアウト',
        detail:
          'LayoutWithSidebar + SidebarProvider で全ページ共通のナビゲーション',
      },
      {
        label: 'カレンダー (MiniCalendar / CalendarPage)',
        detail: 'CalendarSettingsProvider で週始まり設定を含むスケジュール管理',
      },
      {
        label: 'データテーブル (ResourceTable / CustomTable)',
        detail: 'Projects / Contacts / Invoices 等のCRUD操作付きテーブル',
      },
      {
        label: 'レポート・分析ページ',
        detail:
          'ReportsPage で Recharts を用いたグラフ表示と SplitButton によるエクスポート',
      },
      {
        label: 'インテグレーション管理',
        detail: 'ServiceCard + ConnectionStatusChip で外部サービス接続を管理',
      },
      {
        label: '10 ページ構成の SPA',
        detail:
          'Dashboard / Projects / Contacts / Calendar / Reports / Invoices / Team / Map / Integrations / Settings',
      },
    ],
  },
]

// 判断基準
const decisionCriteria = [
  {
    condition: '2つ以上のプロダクトで使われている',
    result: 'Design System に含める',
    example: 'Button, Card, IconButton, CustomToaster',
  },
  {
    condition: '見た目のカスタマイズが必要',
    result: 'テーマ変数で対応する',
    example: 'primary.main をプロダクトごとに変更（Teal / Orange / Green）',
  },
  {
    condition: 'ビジネスロジックを含む',
    result: 'プロダクト固有の実装にする',
    example: 'シミュレーションエンジン、カート管理、スケジュール管理',
  },
  {
    condition: '1つのプロダクトでしか使わない UI',
    result: 'プロダクト側に配置する',
    example: 'LiveMap, BottomNavigation, FloatingPanel',
  },
  {
    condition: '将来的に汎用化できそう',
    result: 'DS 候補としてマークする',
    example: 'ResourceTable（現在2アプリで使用 → DS に昇格済み）',
  },
]

// ---------------------------------------------------------------------------
// 使用マーク
// ---------------------------------------------------------------------------

const UsedMark = ({ used }: { used: boolean }) =>
  used ? (
    <CheckCircleOutlineIcon
      sx={{ fontSize: 18, color: 'success.main' }}
      aria-label='使用中'
    />
  ) : (
    <RemoveIcon
      sx={{ fontSize: 18, color: 'text.disabled' }}
      aria-label='未使用'
    />
  )

// ---------------------------------------------------------------------------
// メインコンテンツ
// ---------------------------------------------------------------------------

const ApplicationGuideContent = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // カテゴリ別にグループ化
  const categories = [...new Set(sharedComponents.map((c) => c.category))]

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
            ? 'linear-gradient(160deg, #1a2a2e 0%, #0f1a1c 40%, #131f22 100%)'
            : 'linear-gradient(160deg, #edf8f9 0%, #e0f4f5 40%, #f0fafb 100%)',
          border: 1,
          borderColor: isDark
            ? 'rgba(14,173,184,0.15)'
            : 'rgba(14,173,184,0.1)',
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
          KAZE UX DESIGN SYSTEM
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
          プロダクト応用ガイド
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: 14, sm: 16 },
            lineHeight: 1.85,
            color: 'text.secondary',
            maxWidth: 620,
          }}>
          Kaze Design System
          は共通のUI基盤を提供し、各プロダクトはそれを拡張して独自のアプリケーションを構築しています。このガイドでは、DSの範囲とプロダクト固有拡張の切り分けを解説します。
        </Typography>
      </Box>

      {/* セクション1: 概要 */}
      <Box sx={{ mb: 10, px: { xs: 1, sm: 2 } }}>
        <SectionLabel>OVERVIEW</SectionLabel>
        <SectionTitle subtitle='1つの Design System から3つのプロダクトを構築'>
          アーキテクチャ概要
        </SectionTitle>

        <Grid container spacing={2.5} sx={{ mb: 5 }}>
          {[
            {
              name: 'KazeLogistics',
              color: '#E87A1E',
              desc: '物流シミュレーション',
              path: 'apps/sky-kaze/',
            },
            {
              name: 'KazeEats',
              color: '#06C167',
              desc: 'フードデリバリー',
              path: 'apps/ubereats-clone/',
            },
            {
              name: 'SaaS Dashboard',
              color: '#0EADB8',
              desc: '業務管理ダッシュボード',
              path: 'apps/saas-dashboard/',
            },
          ].map((app) => (
            <Grid key={app.name} size={{ xs: 12, sm: 4 }}>
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
                  borderTop: `3px solid ${app.color}`,
                }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 16,
                    mb: 1,
                    color: app.color,
                  }}>
                  {app.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.8,
                    color: 'text.secondary',
                    mb: 1.5,
                  }}>
                  {app.desc}
                </Typography>
                <Chip
                  label={app.path}
                  size='small'
                  variant='outlined'
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: 11,
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        <InfoCallout title='共有の仕組み' color='info'>
          各プロダクトは{' '}
          <Box component='code' sx={{ fontWeight: 600 }}>
            @/
          </Box>{' '}
          パスエイリアスで Design System の{' '}
          <Box component='code' sx={{ fontWeight: 600 }}>
            src/
          </Box>{' '}
          ディレクトリからコンポーネントを直接 import
          しています。プロダクト固有のコードは{' '}
          <Box component='code' sx={{ fontWeight: 600 }}>
            ~/
          </Box>{' '}
          パスで各アプリの{' '}
          <Box component='code' sx={{ fontWeight: 600 }}>
            src/
          </Box>{' '}
          から読み込みます。
        </InfoCallout>

        <CodeBlock>
          {`// Design System のコンポーネントを使用（@/ = src/）
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ThemeProvider } from '@/components/ThemeProvider'

// プロダクト固有のコード（~/ = apps/xxx/src/）
import { useSimulation } from '~/data/simulation'
import { LOGI_ORANGE } from '~/theme/colors'`}
        </CodeBlock>
      </Box>

      {/* セクション2: 共有コンポーネントマトリクス */}
      <Box sx={{ mb: 10, px: { xs: 1, sm: 2 } }}>
        <SectionLabel>SHARED LAYER</SectionLabel>
        <SectionTitle subtitle='各プロダクトが DS からどのコンポーネントを使用しているか'>
          共有コンポーネント一覧
        </SectionTitle>

        {categories.map((cat) => {
          const items = sharedComponents.filter((c) => c.category === cat)
          return (
            <Box key={cat} sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  mb: 1.5,
                }}>
                {cat}
              </Typography>
              <StyledTable
                headers={[
                  'コンポーネント',
                  'KazeLogistics',
                  'KazeEats',
                  'SaaS Dashboard',
                ]}>
                {items.map((comp) => (
                  <TableRow key={comp.name}>
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: 13,
                          fontFamily: 'monospace',
                        }}>
                        {comp.name}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <UsedMark used={comp.logistics} />
                    </TableCell>
                    <TableCell align='center'>
                      <UsedMark used={comp.eats} />
                    </TableCell>
                    <TableCell align='center'>
                      <UsedMark used={comp.saas} />
                    </TableCell>
                  </TableRow>
                ))}
              </StyledTable>
            </Box>
          )
        })}

        <InfoCallout title='使用率' color='success'>
          {(() => {
            const total = sharedComponents.length
            const usedBy3 = sharedComponents.filter(
              (c) => [c.logistics, c.eats, c.saas].filter(Boolean).length === 3
            ).length
            const usedBy2 = sharedComponents.filter(
              (c) => [c.logistics, c.eats, c.saas].filter(Boolean).length === 2
            ).length
            return `全 ${total} コンポーネント中、3プロダクト共通: ${usedBy3}個、2プロダクト共通: ${usedBy2}個。特に Button / Card / IconButton / CustomToaster は全プロダクトの基盤となっています。`
          })()}
        </InfoCallout>
      </Box>

      {/* セクション3: プロダクト固有の拡張 */}
      <Box sx={{ mb: 10, px: { xs: 1, sm: 2 } }}>
        <SectionLabel>PRODUCT EXTENSIONS</SectionLabel>
        <SectionTitle subtitle='各プロダクトが独自に実装している機能'>
          プロダクト固有の拡張
        </SectionTitle>

        <Stack spacing={5}>
          {productExtensions.map((product) => (
            <Box
              key={product.name}
              sx={{
                borderRadius: 3,
                border: 1,
                borderColor: isDark
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.08)',
                overflow: 'hidden',
              }}>
              {/* ヘッダー */}
              <Box
                sx={{
                  px: 3,
                  py: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderBottom: 1,
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.06)',
                  bgcolor: isDark
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(0,0,0,0.01)',
                }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: product.color,
                    flexShrink: 0,
                  }}
                />
                <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                  {product.name}
                </Typography>
                <Chip
                  label={product.description}
                  size='small'
                  sx={{ fontSize: 12 }}
                />
              </Box>
              {/* アイテムリスト */}
              <Box sx={{ px: 3, py: 1 }}>
                {product.items.map((item, index) => (
                  <Box
                    key={item.label}
                    sx={{
                      py: 2,
                      borderBottom: index < product.items.length - 1 ? 1 : 0,
                      borderColor: isDark
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(0,0,0,0.04)',
                    }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 14,
                        mb: 0.5,
                        color: isDark ? 'grey.100' : 'grey.900',
                      }}>
                      {item.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        lineHeight: 1.7,
                        color: 'text.secondary',
                      }}>
                      {item.detail}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* セクション4: テーマの拡張パターン */}
      <Box sx={{ mb: 10, px: { xs: 1, sm: 2 } }}>
        <SectionLabel>THEME EXTENSION</SectionLabel>
        <SectionTitle subtitle='ベーステーマを拡張してプロダクト固有のブランドカラーを適用する方法'>
          テーマの拡張パターン
        </SectionTitle>

        <CodeBlock>
          {`// ベーステーマを import して拡張するパターン
// apps/sky-kaze/src/theme/skyTheme.ts
import { darkTheme, lightTheme } from '@/themes/theme'

// apps/ubereats-clone/src/theme/ueTheme.ts
import { darkTheme, lightTheme } from '@/themes/theme'

// 各プロダクトのブランドカラー:
// KazeLogistics: LOGI_ORANGE (#E87A1E) + LOGI_NAVY
// KazeEats:      UE_GREEN   (#06C167)
// SaaS Dashboard: primary.main (#0EADB8) をそのまま使用`}
        </CodeBlock>

        <Grid container spacing={2.5}>
          {[
            {
              name: 'KazeLogistics',
              color: '#E87A1E',
              method: 'ベーステーマ + 独自パレット拡張',
            },
            {
              name: 'KazeEats',
              color: '#06C167',
              method: 'ベーステーマ + 独自 ThemeProvider（localStorage 分離）',
            },
            {
              name: 'SaaS Dashboard',
              color: '#0EADB8',
              method: '共通 ThemeProvider をそのまま使用',
            },
          ].map((t) => (
            <Grid key={t.name} size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{
                  px: 3,
                  py: 3,
                  borderRadius: 2.5,
                  border: 1,
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.08)',
                  height: '100%',
                }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2,
                  }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1.5,
                      bgcolor: t.color,
                    }}
                  />
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                    {t.name}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: 'text.secondary',
                  }}>
                  {t.method}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* セクション5: 設計判断基準 */}
      <Box sx={{ mb: 10, px: { xs: 1, sm: 2 } }}>
        <SectionLabel>DESIGN DECISIONS</SectionLabel>
        <SectionTitle subtitle='何が DS に含まれ、何がプロダクト固有かを判断する基準'>
          設計判断基準
        </SectionTitle>

        <StyledTable headers={['条件', '判断', '例']}>
          {decisionCriteria.map((c) => (
            <TableRow key={c.condition}>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                  {c.condition}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={c.result}
                  size='small'
                  color={
                    c.result.includes('Design System')
                      ? 'primary'
                      : c.result.includes('テーマ')
                        ? 'info'
                        : c.result.includes('候補')
                          ? 'warning'
                          : 'default'
                  }
                  sx={{ fontWeight: 600, fontSize: 12 }}
                />
              </TableCell>
              <TableCell>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: 'text.secondary',
                    fontFamily: 'monospace',
                  }}>
                  {c.example}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </StyledTable>

        <InfoCallout title='判断に迷ったら' color='warning'>
          まずプロダクト側で実装し、2つ目のプロダクトで同じパターンが必要になった時点で
          DS に昇格させる「Rule of
          Two」を推奨します。早すぎる抽象化よりも、実績に基づく共通化が健全です。
        </InfoCallout>
      </Box>

      {/* セクション6: ディレクトリ構成 */}
      <Box sx={{ mb: 10, px: { xs: 1, sm: 2 } }}>
        <SectionLabel>DIRECTORY STRUCTURE</SectionLabel>
        <SectionTitle subtitle='モノレポ内のファイル配置'>
          ディレクトリ構成
        </SectionTitle>

        <CodeBlock>
          {`kaze-ux/
  src/                          # Design System（共通基盤）
    components/                 #   共通 UI コンポーネント
      ui/                      #     Button, Card, IconButton ...
      Form/                    #     TextField, Select, DatePicker ...
      Table/                   #     CustomTable
      ThemeProvider.tsx         #     テーマプロバイダ
    themes/                    #   ベーステーマ定義
    layouts/                   #   サイドバーレイアウト等
    hooks/                     #   hookUseTheme 等
    providers/                 #   CalendarSettingsProvider 等
    stories/                   #   Storybook ストーリー

  apps/
    sky-kaze/src/              # KazeLogistics
      components/              #   LiveMap, DriverPanel, EventLog ...
      data/                    #   simulation.ts, logistics.ts
      theme/                   #   skyTheme.ts, colors.ts
      utils/                   #   panelStyles.ts, format.ts

    ubereats-clone/src/        # KazeEats
      pages/                   #   HomePage, CartPage, RestaurantPage ...
      data/                    #   cart.ts, restaurants.ts, orders.ts
      theme/                   #   ueTheme.ts, colors.ts
      utils/                   #   format.ts

    saas-dashboard/src/        # SaaS Dashboard
      pages/                   #   DashboardPage, ProjectsPage ...
      data/                    #   projects.ts, contacts.ts ...`}
        </CodeBlock>
      </Box>

      {/* フッター */}
      <Box
        sx={{
          mx: { xs: 1, sm: 2 },
          px: 3,
          py: 3,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
        }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 13,
            mb: 1.5,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
          関連ガイド
        </Typography>
        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
          {[
            'Guide/Introduction',
            'Guide/Component Development',
            'Design Philosophy/Philosophy',
          ].map((link) => (
            <Chip
              key={link}
              label={link}
              size='small'
              variant='outlined'
              sx={{ fontSize: 12 }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <ApplicationGuideContent />,
}
