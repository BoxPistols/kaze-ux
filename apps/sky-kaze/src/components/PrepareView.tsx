/**
 * 出荷準備フェーズ
 * DSコンポーネント活用: PageTitle, SectionTitle, Card, Button, StatusTag, CustomChip
 */
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { Box, Grid, Typography, alpha } from '@mui/material'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/Card'
import { CustomChip } from '@/components/ui/chip'
import { SectionTitle } from '@/components/ui/text/sectionTitle'

import {
  SHIPMENTS,
  DRIVERS,
  DRIVER_STATUS_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  type Shipment,
} from '~/data/logistics'
import { useSimulation } from '~/data/simulation'
import { LOGI_ORANGE } from '~/theme/colors'

interface CheckItem {
  id: string
  label: string
  category: string
}

const CHECKLIST: CheckItem[] = [
  { id: 'c1', label: '全荷物のバーコードスキャン完了', category: '荷物' },
  { id: 'c2', label: '冷蔵・冷凍品の温度確認', category: '荷物' },
  { id: 'c3', label: '割れ物注意ラベル貼付', category: '荷物' },
  { id: 'c4', label: '送り状・納品書の印刷', category: '伝票' },
  { id: 'c5', label: '配送ルート表の確認', category: '伝票' },
  { id: 'c6', label: '車両燃料チェック', category: '車両' },
  { id: 'c7', label: 'タイヤ・ブレーキ点検', category: '車両' },
  { id: 'c8', label: 'ドライバーのアルコール検査', category: '車両' },
]

const PriorityChip = ({ priority }: { priority: Shipment['priority'] }) => {
  const map = {
    same_day: { label: '当日', color: 'error' as const },
    express: { label: '速達', color: 'warning' as const },
    standard: { label: '標準', color: 'default' as const },
  }
  const { label, color } = map[priority]
  return <CustomChip label={label} color={color} size='small' />
}

export const PrepareView = () => {
  const setViewMode = useSimulation((s) => s.setViewMode)
  const play = useSimulation((s) => s.play)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const pendingShipments = SHIPMENTS.filter((s) =>
    ['pending', 'picked_up'].includes(s.status)
  )
  const activeShipments = SHIPMENTS.filter((s) =>
    ['in_transit', 'out_for_delivery', 'at_hub'].includes(s.status)
  )
  const availableDrivers = DRIVERS.filter((d) => d.status === 'available')
  const allChecked = checked.size === CHECKLIST.length
  const categories = [...new Set(CHECKLIST.map((c) => c.category))]

  return (
    <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 1040, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        {/* ページタイトル */}
        <Typography
          variant='xl'
          display='block'
          sx={{ fontWeight: 800, mb: 0.5 }}>
          出荷準備
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
          荷物の確認・伝票発行・車両点検を完了してから配送を開始してください
        </Typography>

        {/* ── KPIサマリー ── */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            {
              label: '出荷待ち',
              value: pendingShipments.length,
              color: '#F59E0B',
            },
            {
              label: '配送中',
              value: activeShipments.length,
              color: LOGI_ORANGE,
            },
            {
              label: '待機ドライバー',
              value: availableDrivers.length,
              color: '#22C55E',
            },
            {
              label: '点検進捗',
              value: `${checked.size}/${CHECKLIST.length}`,
              color: allChecked ? '#22C55E' : '#3B82F6',
            },
          ].map((kpi) => (
            <Grid key={kpi.label} size={{ xs: 6, md: 3 }}>
              <Card>
                <CardContent className='p-5'>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 1 }}>
                    {kpi.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 800,
                      fontSize: '32px',
                      color: kpi.color,
                      lineHeight: 1,
                    }}>
                    {kpi.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ── 出発前チェックリスト ── */}
        <SectionTitle sx={{ mb: 2 }}>出発前チェックリスト</SectionTitle>
        <Card sx={{ mb: 4 }}>
          <CardContent className='p-0'>
            {categories.map((cat, catIdx) => (
              <Box key={cat}>
                <Box
                  sx={{
                    px: 3,
                    py: 1.5,
                    bgcolor: 'action.hover',
                    borderTop: catIdx > 0 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}>
                  <Typography
                    variant='caption'
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'text.secondary',
                    }}>
                    {cat}
                  </Typography>
                </Box>
                {CHECKLIST.filter((c) => c.category === cat).map((item) => {
                  const done = checked.has(item.id)
                  return (
                    <Box
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      role='checkbox'
                      aria-checked={done}
                      tabIndex={0}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ')
                          toggleCheck(item.id)
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        px: 3,
                        py: 1.5,
                        cursor: 'pointer',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        transition: 'background 0.1s',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}>
                      {done ? (
                        <CheckCircleIcon
                          sx={{ fontSize: 22, color: 'success.main' }}
                        />
                      ) : (
                        <RadioButtonUncheckedIcon
                          sx={{ fontSize: 22, color: 'text.disabled' }}
                        />
                      )}
                      <Typography
                        variant='body1'
                        sx={{
                          textDecoration: done ? 'line-through' : 'none',
                          color: done ? 'text.secondary' : 'text.primary',
                        }}>
                        {item.label}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* ── 出荷予定の荷物 ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SectionTitle>出荷予定の荷物</SectionTitle>
            <CustomChip
              label={pendingShipments.length + activeShipments.length}
              size='small'
              color='primary'
            />
          </Box>
          <Button
            variant='outline'
            size='sm'
            onClick={() => toast.info('新規配送追加（デモ）')}>
            + 新規追加
          </Button>
        </Box>
        <Card sx={{ mb: 4 }}>
          <CardContent className='p-0'>
            {/* ヘッダー行 */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr 120px 80px 100px',
                gap: 2,
                px: 3,
                py: 1.5,
                bgcolor: 'action.hover',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}>
              {['追跡番号', '内容・送受先', 'ルート', '重量', 'ステータス'].map(
                (h) => (
                  <Typography
                    key={h}
                    variant='caption'
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'text.secondary',
                    }}>
                    {h}
                  </Typography>
                )
              )}
            </Box>
            {/* データ行 */}
            {[...pendingShipments, ...activeShipments].map((s) => (
              <Box
                key={s.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr 120px 80px 100px',
                  gap: 2,
                  px: 3,
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  alignItems: 'center',
                  '&:hover': { bgcolor: 'action.hover' },
                  '&:last-child': { borderBottom: 'none' },
                }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      fontSize: '13px',
                      color: LOGI_ORANGE,
                    }}>
                    {s.trackingNo}
                  </Typography>
                  <PriorityChip priority={s.priority} />
                </Box>
                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {s.contents}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {s.sender.company} → {s.receiver.company}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '13px',
                  }}>
                  {s.originHub} → {s.destinationHub}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '13px',
                  }}>
                  {s.weight}kg
                </Typography>
                <CustomChip
                  label={STATUS_LABELS[s.status]}
                  size='small'
                  sx={{
                    bgcolor: alpha(STATUS_COLORS[s.status], 0.12),
                    color: STATUS_COLORS[s.status],
                    fontWeight: 600,
                    justifySelf: 'start',
                  }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* ── ドライバー割当 ── */}
        <SectionTitle sx={{ mb: 2 }}>ドライバー割当</SectionTitle>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {DRIVERS.map((d) => (
            <Grid key={d.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardHeader>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}>
                    <CardTitle>{d.name}</CardTitle>
                    <CustomChip
                      label={DRIVER_STATUS_LABELS[d.status]}
                      size='small'
                      color={
                        d.status === 'available'
                          ? 'success'
                          : d.status === 'on_route'
                            ? 'warning'
                            : 'default'
                      }
                    />
                  </Box>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {d.vehicle} — {d.licensePlate}
                  </CardDescription>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ mt: 0.5, display: 'block' }}>
                    {d.phone}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ── 配送開始ボタン ── */}
        <Box sx={{ mb: 6 }}>
          <Button
            onClick={() => {
              if (!allChecked) return
              play()
              setViewMode('monitor')
            }}
            variant={allChecked ? 'default' : 'outline'}
            size='lg'
            disabled={!allChecked}
            className='w-full gap-2 text-base'>
            <PlayArrowIcon sx={{ fontSize: 22 }} />
            {allChecked
              ? '全チェック完了 — 配送開始'
              : `チェック未完了（${checked.size}/${CHECKLIST.length}）`}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
