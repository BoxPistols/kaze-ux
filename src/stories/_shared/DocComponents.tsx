/**
 * Storybook ドキュメントページ用共有コンポーネント
 *
 * Tailwind CSS ファーストで設計。CSS変数ブリッジにより
 * ダークモード自動対応。useTheme() は PageHero のグラデーション計算のみ使用。
 */

import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

import { cn } from '../../utils/className'

/* ================================================================
 * PageHero - ページトップのグラデーションヒーローセクション
 * ================================================================ */

interface PageHeroProps {
  title: string
  subtitle: string
  gradient: [string, string]
}

const PageHero = ({ title, subtitle, gradient }: PageHeroProps) => {
  // グラデーション透明度の計算にのみ useTheme を使用
  const isDark = useTheme().palette.mode === 'dark'

  return (
    <div
      className='mb-16 overflow-hidden rounded-2xl border border-border px-8 py-10 sm:px-12 sm:py-12'
      style={{
        position: 'relative',
        background: isDark
          ? `linear-gradient(135deg, ${gradient[0]}14 0%, ${gradient[1]}14 100%)`
          : `linear-gradient(135deg, ${gradient[0]}08 0%, ${gradient[1]}08 100%)`,
      }}>
      {/* 装飾: ドットパターン */}
      <div
        className='pointer-events-none absolute right-0 top-0 h-[200px] w-[200px] opacity-[0.04] dark:opacity-[0.06]'
        style={{
          backgroundImage:
            'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <Typography
        variant='displayMedium'
        component='h1'
        className='mb-3 font-extrabold tracking-tight text-foreground'>
        {title}
      </Typography>
      <Typography
        variant='md'
        component='p'
        className='max-w-[600px] leading-relaxed text-muted'>
        {subtitle}
      </Typography>
    </div>
  )
}

/* ================================================================
 * SectionHeader - セクション見出し（左アクセントボーダー付き）
 * ================================================================ */

interface SectionHeaderProps {
  title: string
  subtitle?: string
}

const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => (
  <div className='mb-10 border-l-4 border-primary pl-6'>
    <Typography
      variant='xl'
      component='h2'
      className='font-extrabold tracking-tight text-foreground'>
      {title}
    </Typography>
    {subtitle && (
      <Typography
        variant='md'
        component='p'
        className='mt-2 leading-relaxed text-muted'>
        {subtitle}
      </Typography>
    )}
  </div>
)

/* ================================================================
 * SectionLabel - 大文字オーバーラインラベル（MISSION, VISION 等）
 * ================================================================ */

interface SectionLabelProps {
  children: ReactNode
}

const SectionLabel = ({ children }: SectionLabelProps) => (
  <p className='mb-3 block text-[11px] font-bold uppercase tracking-[0.1em] text-primary'>
    {children}
  </p>
)

/* ================================================================
 * SubSection - サブセクション見出し
 * ================================================================ */

interface SubSectionProps {
  title: string
  children: ReactNode
}

const SubSection = ({ title, children }: SubSectionProps) => (
  <div className='mb-14'>
    <Typography
      variant='lg'
      component='h3'
      className='mb-6 font-bold tracking-tight'>
      {title}
    </Typography>
    {children}
  </div>
)

/* ================================================================
 * InfoCallout - カラー付き左ボーダーのコールアウトボックス
 * ================================================================ */

type CalloutColor = 'info' | 'warning' | 'success' | 'error'

interface InfoCalloutProps {
  title: string
  children: ReactNode
  color?: CalloutColor
}

const calloutBorderMap: Record<CalloutColor, string> = {
  info: 'border-info',
  warning: 'border-warning',
  success: 'border-success',
  error: 'border-error',
}

const InfoCallout = ({ title, children, color = 'info' }: InfoCalloutProps) => (
  <div
    className={cn(
      'mb-10 rounded-r-lg border-l-4 py-5 pl-6 pr-7',
      calloutBorderMap[color]
    )}
    style={{
      backgroundColor: `color-mix(in srgb, var(--color-${color}) 5%, transparent)`,
    }}>
    <p className='mb-1 text-sm font-bold text-foreground'>{title}</p>
    <div className='text-sm leading-[1.85] text-muted'>{children}</div>
  </div>
)

/* ================================================================
 * DocTable - プロフェッショナルなデータテーブル
 * ================================================================ */

interface DocTableProps {
  headers: string[]
  rows: (string | ReactNode)[][]
}

const DocTable = ({ headers, rows }: DocTableProps) => (
  <TableContainer
    className='mb-10 overflow-hidden rounded-lg border border-border'
    component='div'>
    <Table size='medium'>
      <TableHead>
        <TableRow className='bg-muted/[0.08] dark:bg-white/[0.03]'>
          {headers.map((header) => (
            <TableCell
              key={header}
              sx={{
                fontWeight: 700,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                py: 1.5,
                borderBottomWidth: 2,
                borderColor: 'var(--color-border)',
                color: 'var(--color-muted)',
              }}>
              {header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody
        sx={{
          '& tr:last-child td': { borderBottom: 0 },
          '& tr:nth-of-type(even)': {
            bgcolor: 'rgba(128,128,128,0.03)',
          },
          '& td': {
            py: 2,
            fontSize: 14,
            lineHeight: 1.7,
            borderColor: 'var(--color-border)',
          },
        }}>
        {rows.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <TableCell key={cellIndex}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

/* ================================================================
 * SectionDivider - セクション間の区切り線
 * ================================================================ */

const SectionDivider = () => (
  <div className='my-16'>
    <Divider className='opacity-60' />
  </div>
)

/* ================================================================
 * DemoPanel - インタラクティブデモ用コンテナ
 * ================================================================ */

interface DemoPanelProps {
  label: string
  children: ReactNode
}

const DemoPanel = ({ label, children }: DemoPanelProps) => (
  <div className='mb-10 rounded-2xl border border-border/50 p-8 dark:border-white/[0.08]'>
    <p className='mb-6 text-[11px] font-bold uppercase tracking-[0.1em] text-primary'>
      {label}
    </p>
    {children}
  </div>
)

/* ================================================================
 * CardGrid - カード型グリッドレイアウト
 * ================================================================ */

interface CardGridItem {
  title: string
  description: string
  icon?: ReactNode
}

interface CardGridProps {
  items: CardGridItem[]
  columns?: 2 | 3 | 4
}

const columnMap = {
  2: { xs: 12, sm: 6 },
  3: { xs: 12, md: 4 },
  4: { xs: 12, sm: 6, md: 3 },
}

const CardGrid = ({ items, columns = 3 }: CardGridProps) => (
  <Grid container spacing={3} className='mb-10'>
    {items.map((item, index) => (
      <Grid key={index} size={columnMap[columns]}>
        <div className='h-full cursor-default rounded-xl border border-border p-7 transition-colors hover:border-primary/30'>
          {item.icon && <div className='mb-4 text-primary'>{item.icon}</div>}
          <p className='mb-3 font-bold text-foreground'>{item.title}</p>
          <p className='text-sm leading-relaxed text-muted'>
            {item.description}
          </p>
        </div>
      </Grid>
    ))}
  </Grid>
)

export {
  PageHero,
  SectionHeader,
  SectionLabel,
  SubSection,
  InfoCallout,
  DocTable,
  SectionDivider,
  DemoPanel,
  CardGrid,
}
