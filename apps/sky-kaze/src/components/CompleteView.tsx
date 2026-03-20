/**
 * 配送結果フェーズ — 実績・ドライバー成績・コスト・CRUD
 * DSコンポーネント: Card, SectionTitle, CustomChip, Button, ConfirmDialog, FormDialog
 */
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DescriptionIcon from '@mui/icons-material/Description'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import ReplayIcon from '@mui/icons-material/Replay'
import StarIcon from '@mui/icons-material/Star'
import { Box, Grid, Typography, TextField, alpha } from '@mui/material'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CustomChip } from '@/components/ui/chip'
import { ConfirmDialog } from '@/components/ui/dialog'
import { FormDialog } from '@/components/ui/dialog'
import { IconButton } from '@/components/ui/icon-button'
import { SectionTitle } from '@/components/ui/text/sectionTitle'

import { SHIPMENTS, DRIVERS } from '~/data/logistics'
import {
  useSimulation,
  DRIVER_STATUS_COLOR,
  INCIDENT_LABELS,
  INCIDENT_COLORS,
} from '~/data/simulation'
import { LOGI_ORANGE } from '~/theme/colors'

// メモ用の型
interface ShipmentNote {
  shipmentId: string
  note: string
}

export const CompleteView = () => {
  const deliveryCount = useSimulation((s) => s.deliveryCount)
  const incidents = useSimulation((s) => s.incidents)
  const elapsedSeconds = useSimulation((s) => s.elapsedSeconds)
  const positions = useSimulation((s) => s.positions)
  const reset = useSimulation((s) => s.reset)

  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [noteTarget, setNoteTarget] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [notes, setNotes] = useState<ShipmentNote[]>([])
  const [invoiced, setInvoiced] = useState<Set<string>>(new Set())

  const resolvedIncidents = incidents.filter((i) => i.resolved)
  const deliveredShipments = SHIPMENTS.filter((s) => s.status === 'delivered')
  const totalRevenue = SHIPMENTS.reduce((sum, s) => sum + s.cost, 0)
  const avgDeliveryTime =
    deliveryCount > 0 ? Math.round(elapsedSeconds / deliveryCount) : 0

  const h = Math.floor(elapsedSeconds / 3600)
  const m = Math.floor((elapsedSeconds % 3600) / 60)
  const elapsed = h > 0 ? `${h}時間${m}分` : `${m}分`

  const handleAddNote = () => {
    if (!noteTarget || !noteText.trim()) return
    setNotes((prev) => [
      ...prev,
      { shipmentId: noteTarget, note: noteText.trim() },
    ])
    toast.success('メモを追加しました')
    setNoteDialogOpen(false)
    setNoteText('')
    setNoteTarget(null)
  }

  const handleInvoice = (id: string) => {
    setInvoiced((prev) => new Set([...prev, id]))
    toast.success('請求書を発行しました')
  }

  const handleExportCSV = () => {
    toast.success('CSV出力を開始しました')
  }

  return (
    <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 1040, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        {/* タイトル + エクスポート */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 4,
          }}>
          <Box>
            <Typography
              variant='xl'
              display='block'
              sx={{ fontWeight: 800, mb: 0.5 }}>
              配送結果
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              稼働時間 {elapsed} のシミュレーション結果
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant='outline' size='sm' onClick={handleExportCSV}>
              <FileDownloadIcon sx={{ fontSize: 16, mr: 0.5 }} />
              CSV出力
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setResetDialogOpen(true)}>
              <ReplayIcon sx={{ fontSize: 16, mr: 0.5 }} />
              リセット
            </Button>
          </Box>
        </Box>

        {/* ── KPIダッシュボード (2行3列) ── */}
        <Grid container spacing={2} sx={{ mb: 5 }}>
          {[
            {
              label: '配達完了',
              value: deliveryCount,
              color: DRIVER_STATUS_COLOR.delivering,
              sub: `成功率 ${deliveryCount > 0 ? '100' : '0'}%`,
            },
            {
              label: 'インシデント',
              value: `${resolvedIncidents.length}/${incidents.length}`,
              color:
                incidents.length > resolvedIncidents.length
                  ? DRIVER_STATUS_COLOR.incident
                  : DRIVER_STATUS_COLOR.delivering,
              sub: `解決率 ${incidents.length > 0 ? Math.round((resolvedIncidents.length / incidents.length) * 100) : 0}%`,
            },
            {
              label: '売上合計',
              value: `¥${totalRevenue.toLocaleString()}`,
              color: LOGI_ORANGE,
              sub: `平均 ¥${deliveredShipments.length > 0 ? Math.round(totalRevenue / SHIPMENTS.length).toLocaleString() : 0}/件`,
            },
            {
              label: '平均配送時間',
              value: `${Math.floor(avgDeliveryTime / 60)}分`,
              color: '#3B82F6',
              sub: `合計 ${elapsed}`,
            },
            {
              label: '稼働車両',
              value: positions.length,
              color: '#64748B',
              sub: `走行中 ${positions.filter((p) => p.status === 'moving').length}台`,
            },
            {
              label: '荷物取扱量',
              value: `${SHIPMENTS.reduce((s, x) => s + x.weight, 0).toLocaleString()}kg`,
              color: '#8B5CF6',
              sub: `${SHIPMENTS.length}件`,
            },
          ].map((kpi) => (
            <Grid key={kpi.label} size={{ xs: 6, md: 4 }}>
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
                      fontSize: '28px',
                      color: kpi.color,
                      lineHeight: 1,
                      mb: 0.5,
                    }}>
                    {kpi.value}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {kpi.sub}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ── ドライバー成績 ── */}
        <SectionTitle sx={{ mb: 2 }}>ドライバー成績</SectionTitle>
        <Card sx={{ mb: 5 }}>
          <CardContent className='p-0'>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 80px 80px 100px',
                gap: 2,
                px: 3,
                py: 1.5,
                bgcolor: 'action.hover',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}>
              {['ドライバー', '車両', '配達数', '評価', 'ステータス'].map(
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
            {DRIVERS.map((d) => {
              const dp = positions.find((p) => p.driverId === d.id)
              const driverIncidents = incidents.filter(
                (i) => i.driverId === d.id
              )
              return (
                <Box
                  key={d.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 100px 80px 80px 100px',
                    gap: 2,
                    px: 3,
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    alignItems: 'center',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: 'action.hover' },
                  }}>
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {d.name}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {d.licensePlate}
                      {driverIncidents.length > 0 && (
                        <Box
                          component='span'
                          sx={{ color: 'error.main', ml: 1 }}>
                          異常 {driverIncidents.length}件
                        </Box>
                      )}
                    </Typography>
                  </Box>
                  <Typography variant='body2'>{d.vehicle}</Typography>
                  <Typography
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                    }}>
                    {d.deliveriesToday}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                    <Typography
                      sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                      }}>
                      {d.rating}
                    </Typography>
                  </Box>
                  <CustomChip
                    label={
                      dp
                        ? dp.status === 'moving'
                          ? '走行中'
                          : dp.status === 'delivering'
                            ? '配達中'
                            : dp.status === 'idle'
                              ? '待機'
                              : dp.status
                        : '不明'
                    }
                    size='small'
                    color={
                      dp?.status === 'moving'
                        ? 'warning'
                        : dp?.status === 'delivering'
                          ? 'success'
                          : 'default'
                    }
                  />
                </Box>
              )
            })}
          </CardContent>
        </Card>

        {/* ── インシデント履歴 ── */}
        {incidents.length > 0 && (
          <>
            <SectionTitle sx={{ mb: 2 }}>インシデント履歴</SectionTitle>
            <Grid container spacing={2} sx={{ mb: 5 }}>
              {incidents.map((inc) => {
                const color = INCIDENT_COLORS[inc.type]
                const driver = DRIVERS.find((d) => d.id === inc.driverId)
                return (
                  <Grid key={inc.id} size={{ xs: 12, md: 6 }}>
                    <Card
                      sx={{
                        borderLeft: '4px solid',
                        borderLeftColor: color,
                        opacity: inc.resolved ? 0.75 : 1,
                      }}>
                      <CardHeader>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}>
                            {inc.resolved ? (
                              <CheckCircleIcon
                                sx={{ fontSize: 18, color: 'success.main' }}
                              />
                            ) : (
                              <ErrorOutlineIcon sx={{ fontSize: 18, color }} />
                            )}
                            <CardTitle>{INCIDENT_LABELS[inc.type]}</CardTitle>
                          </Box>
                          <CustomChip
                            label={inc.resolved ? '解決済み' : '未解決'}
                            size='small'
                            color={inc.resolved ? 'success' : 'error'}
                          />
                        </Box>
                      </CardHeader>
                      <CardContent>
                        <Typography variant='body2' sx={{ mb: 0.5 }}>
                          {inc.title}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          担当: {driver?.name} — {inc.description}
                        </Typography>
                        {inc.resolution && (
                          <Box
                            sx={{
                              mt: 1.5,
                              p: 1.5,
                              borderRadius: 1,
                              bgcolor: alpha('#22C55E', 0.06),
                            }}>
                            <Typography
                              variant='caption'
                              sx={{ fontWeight: 600 }}>
                              対応: {inc.resolution}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </>
        )}

        {/* ── 配送実績テーブル（CRUD付き） ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SectionTitle>配送実績</SectionTitle>
          <CustomChip
            label={`${SHIPMENTS.length}件`}
            size='small'
            color='primary'
          />
        </Box>
        <Card sx={{ mb: 5 }}>
          <CardContent className='p-0'>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '130px 1fr 100px 100px 120px',
                gap: 2,
                px: 3,
                py: 1.5,
                bgcolor: 'action.hover',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}>
              {[
                '追跡番号',
                '内容・顧客',
                '金額',
                'ステータス',
                'アクション',
              ].map((h) => (
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
              ))}
            </Box>
            {SHIPMENTS.map((s) => {
              const note = notes.find((n) => n.shipmentId === s.id)
              const isInvoiced = invoiced.has(s.id)
              return (
                <Box
                  key={s.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '130px 1fr 100px 100px 120px',
                    gap: 2,
                    px: 3,
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    alignItems: 'center',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: 'action.hover' },
                  }}>
                  <Typography
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      fontSize: '13px',
                      color: LOGI_ORANGE,
                    }}>
                    {s.trackingNo}
                  </Typography>
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      {s.contents}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {s.sender.company} → {s.receiver.company}
                    </Typography>
                    {note && (
                      <Typography
                        variant='caption'
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          color: '#3B82F6',
                          fontStyle: 'italic',
                        }}>
                        メモ: {note.note}
                      </Typography>
                    )}
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      fontSize: '13px',
                    }}>
                    ¥{s.cost.toLocaleString()}
                  </Typography>
                  <CustomChip
                    label={
                      s.status === 'delivered'
                        ? '完了'
                        : s.status === 'cancelled'
                          ? '取消'
                          : '進行中'
                    }
                    size='small'
                    color={
                      s.status === 'delivered'
                        ? 'success'
                        : s.status === 'cancelled'
                          ? 'error'
                          : 'warning'
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      tooltip='メモ追加'
                      size='small'
                      onClick={() => {
                        setNoteTarget(s.id)
                        setNoteDialogOpen(true)
                      }}>
                      <NoteAddIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      tooltip={isInvoiced ? '発行済み' : '請求書発行'}
                      size='small'
                      disabled={isInvoiced}
                      onClick={() => handleInvoice(s.id)}
                      sx={isInvoiced ? { color: 'success.main' } : {}}>
                      <DescriptionIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              )
            })}
          </CardContent>
        </Card>
      </Box>

      {/* ── ダイアログ ── */}
      <FormDialog
        open={noteDialogOpen}
        title='配送メモ追加'
        description={`${noteTarget ? SHIPMENTS.find((s) => s.id === noteTarget)?.trackingNo : ''} にメモを追加`}
        onSubmit={handleAddNote}
        onCancel={() => {
          setNoteDialogOpen(false)
          setNoteText('')
        }}
        submitText='追加'
        submitDisabled={!noteText.trim()}>
        <TextField
          autoFocus
          fullWidth
          multiline
          rows={3}
          placeholder='配送に関するメモを入力...'
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          sx={{ mt: 1 }}
        />
      </FormDialog>

      <ConfirmDialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={() => {
          reset()
          setResetDialogOpen(false)
        }}
        title='シミュレーションリセット'
        description='全データをリセットして最初からやり直しますか？'
        confirmText='リセット'
        severity='warning'
      />
    </Box>
  )
}
