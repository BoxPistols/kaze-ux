/**
 * KazeLogistics — 配送管理システム
 *
 * 3フェーズ:
 * - 準備: 荷物管理・伝票・車両点検（通常ページ）
 * - 監視: フルスクリーンマップ（フローティングUI）
 * - 結果: 配送サマリー（通常ページ）
 */
import { Box } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { ThemeProvider } from '@/components/ThemeProvider'
import { CustomToaster } from '@/components/ui/toast'

import { CompleteView } from '~/components/CompleteView'
import { DriverPanel } from '~/components/DriverPanel'
import { EventLog } from '~/components/EventLog'
import { HeaderBar } from '~/components/HeaderBar'
import { IncidentPanel } from '~/components/IncidentPanel'
import { LiveMap } from '~/components/LiveMap'
import { PrepareView } from '~/components/PrepareView'
import { TimelineBar } from '~/components/TimelineBar'
import { WelcomeOverlay } from '~/components/WelcomeOverlay'
import { useSimulation, type LogEvent } from '~/data/simulation'

const SimulationRunner = () => {
  const tick = useSimulation((s) => s.tick)
  const isPlaying = useSimulation((s) => s.isPlaying)
  const logs = useSimulation((s) => s.logs)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastLogIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(tick, 500)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, tick])

  useEffect(() => {
    if (logs.length === 0) return
    const latest: LogEvent = logs[logs.length - 1]
    if (latest.id === lastLogIdRef.current) return
    lastLogIdRef.current = latest.id
    if (latest.type === 'delivery_complete') {
      toast.success(latest.message)
    }
  }, [logs])

  return null
}

/** 監視フェーズ: フルスクリーンマップ + フローティングUI */
const MonitorView = () => (
  <Box sx={{ position: 'relative', flex: 1 }}>
    <LiveMap />
    <DriverPanel />
    <IncidentPanel />
    <EventLog />
    <TimelineBar />
    <WelcomeOverlay />
  </Box>
)

const App = () => {
  const viewMode = useSimulation((s) => s.viewMode)

  return (
    <ThemeProvider>
      <CssBaseline />
      <CustomToaster position='top-right' duration={3000} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}>
        <SimulationRunner />

        {/* 共通ヘッダー（通常フロー） */}
        <HeaderBar />

        {/* フェーズ別コンテンツ */}
        {viewMode === 'prepare' && <PrepareView />}
        {viewMode === 'monitor' && <MonitorView />}
        {viewMode === 'complete' && <CompleteView />}
      </Box>
    </ThemeProvider>
  )
}

export { App }
