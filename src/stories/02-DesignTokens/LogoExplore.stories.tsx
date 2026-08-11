import { Box, Typography, Stack } from '@mui/material'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * ロゴ案の比較用（採用後に削除する）
 *
 * バウハウス／モダニズムの造形原理で構成する:
 * - 幾何学的原形（円・正方形・三角形）だけで作る
 * - 装飾を排し、構造そのものを形にする
 * - グリッドに厳密に乗せる
 * - 非対称の均衡で動きを出す
 * - 反復とリズム
 */
const meta: Meta = {
  title: 'Design Tokens/Logo Explore',
  parameters: { layout: 'padded' },
}

export default meta

type Candidate = {
  id: string
  label: string
  note: string
  /** 32x32 グリッド上の描画 */
  render: (fg: string) => React.ReactNode
}

const CANDIDATES: Candidate[] = [
  {
    id: 'A',
    label: 'A. 同心の弧（太）',
    note: '5 を太い帯に。気流の伝播を保ちつつ 16px でも成立させる',
    render: (fg) => (
      <>
        <path
          d='M5 27 A22 22 0 0 0 27 5'
          stroke={fg}
          strokeWidth='5'
          fill='none'
        />
        <path
          d='M5 17 A12 12 0 0 0 17 5'
          stroke={fg}
          strokeWidth='5'
          fill='none'
        />
      </>
    ),
  },
  {
    id: 'B',
    label: 'B. 同心の弧・加速',
    note: '外側ほど太く。反復に加速のリズムを与える（アルバース的）',
    render: (fg) => (
      <>
        <path
          d='M5 27 A22 22 0 0 0 27 5'
          stroke={fg}
          strokeWidth='6'
          fill='none'
        />
        <path
          d='M5 17 A12 12 0 0 0 17 5'
          stroke={fg}
          strokeWidth='4'
          fill='none'
        />
        <path
          d='M5 9 A4 4 0 0 0 9 5'
          stroke={fg}
          strokeWidth='2.5'
          fill='none'
        />
      </>
    ),
  },
  {
    id: 'C',
    label: 'C. 半円の反転（帯）',
    note: '8 を整理。水平帯 + 上下の半円で波を作る',
    render: (fg) => (
      <>
        <rect x='4' y='14' width='24' height='4' fill={fg} />
        <path d='M4 14 A7 7 0 0 1 18 14 Z' fill={fg} />
        <path d='M14 18 A7 7 0 0 0 28 18 Z' fill={fg} />
      </>
    ),
  },
  {
    id: 'D',
    label: 'D. 四分円の段階回転',
    note: '1 の発展。四分円を 3 つ、段階的に回して渦を作る',
    render: (fg) => (
      <>
        <path d='M4 4 L16 4 A12 12 0 0 1 4 16 Z' fill={fg} />
        <path d='M28 12 L28 22 A10 10 0 0 1 18 12 Z' fill={fg} />
        <path d='M12 28 L20 28 A8 8 0 0 0 12 20 Z' fill={fg} />
      </>
    ),
  },
  {
    id: 'E',
    label: 'E. 四分円 + 帯',
    note: '円弧（気流）と水平帯（構造）の対比。バウハウス的な二要素構成',
    render: (fg) => (
      <>
        <path d='M4 28 A24 24 0 0 0 28 4 L28 16 L16 16 L16 28 Z' fill={fg} />
      </>
    ),
  },
  {
    id: 'F',
    label: 'F. 半円の三連',
    note: '半円を反転させながら三連。純粋な反復で流れを作る',
    render: (fg) => (
      <>
        <path d='M4 16 A4 4 0 0 1 12 16 Z' fill={fg} />
        <path d='M12 16 A4 4 0 0 0 20 16 Z' fill={fg} />
        <path d='M20 16 A4 4 0 0 1 28 16 Z' fill={fg} />
        <rect x='4' y='14.5' width='24' height='3' fill={fg} />
      </>
    ),
  },
]

/** バウハウスの色。原色 + 黒 */
const PALETTES = [
  { id: 'ink', label: '黒', surface: '#1A1A1A', fg: '#FFFFFF' },
  { id: 'blue', label: '青', surface: '#0057B8', fg: '#FFFFFF' },
  { id: 'red', label: '赤', surface: '#E4002B', fg: '#FFFFFF' },
  { id: 'yellow', label: '黄', surface: '#FFB612', fg: '#1A1A1A' },
  { id: 'teal', label: '現行ティール', surface: '#0EADB8', fg: '#0A0A0A' },
]

const Mark = ({
  c,
  size,
  surface,
  fg,
}: {
  c: Candidate
  size: number
  surface: string
  fg: string
}) => (
  <svg width={size} height={size} viewBox='0 0 32 32' aria-hidden>
    <rect width='32' height='32' fill={surface} />
    {c.render(fg)}
  </svg>
)

// --- 形の比較（黒地・白抜き） ---
const ShapesContent = () => (
  <Box sx={{ maxWidth: 1300, mx: 'auto', p: 4 }}>
    <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
      形の比較（バウハウス／モダニズム）
    </Typography>
    <Typography variant='body2' color='text.secondary' sx={{ mb: 5 }}>
      幾何学的原形（円・正方形・三角形）だけで構成しています。角丸を使わず、
      グリッドに厳密に乗せ、装飾を排しています。64 / 32 / 16px で並べています。
    </Typography>

    <Stack spacing={4}>
      {CANDIDATES.map((c) => (
        <Box
          key={c.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}>
          <Box sx={{ minWidth: 260 }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
              {c.label}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {c.note}
            </Typography>
          </Box>
          <Stack direction='row' spacing={3} sx={{ alignItems: 'center' }}>
            <Mark c={c} size={64} surface='#1A1A1A' fg='#FFFFFF' />
            <Mark c={c} size={32} surface='#1A1A1A' fg='#FFFFFF' />
            <Mark c={c} size={16} surface='#1A1A1A' fg='#FFFFFF' />
          </Stack>
          <Stack direction='row' spacing={3} sx={{ alignItems: 'center' }}>
            <Mark c={c} size={64} surface='#FFFFFF' fg='#1A1A1A' />
            <Mark c={c} size={32} surface='#FFFFFF' fg='#1A1A1A' />
          </Stack>
        </Box>
      ))}
    </Stack>
  </Box>
)

export const Shapes: StoryObj = {
  name: '形の比較',
  render: () => <ShapesContent />,
}

// --- 色の比較 ---
const ColorsContent = () => (
  <Box sx={{ maxWidth: 1300, mx: 'auto', p: 4 }}>
    <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
      色の比較
    </Typography>
    <Typography variant='body2' color='text.secondary' sx={{ mb: 5 }}>
      バウハウスの原色（赤・青・黄）と黒、および現行ティールを並べています。
    </Typography>

    <Stack spacing={4}>
      {CANDIDATES.map((c) => (
        <Box
          key={c.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            p: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}>
          <Typography
            variant='subtitle2'
            sx={{ fontWeight: 700, minWidth: 180 }}>
            {c.label}
          </Typography>
          {PALETTES.map((p) => (
            <Box key={p.id} sx={{ textAlign: 'center' }}>
              <Mark c={c} size={56} surface={p.surface} fg={p.fg} />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mt: 0.5 }}>
                {p.label}
              </Typography>
            </Box>
          ))}
        </Box>
      ))}
    </Stack>
  </Box>
)

export const Colors: StoryObj = {
  name: '色の比較',
  render: () => <ColorsContent />,
}
