// src/pages/FlightPlanCreatePage.tsx
/**
 * 飛行計画作成ページ
 *
 * プロジェクトに紐づく新しい飛行計画を作成するページ。
 * map-auto-waypointツールを使用してウェイポイント・エリアを設定し、
 * 飛行計画として保存する。
 */

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import {
  Box,
  Button,
  IconButton,
  Typography,
  AppBar,
  Toolbar,
} from '@mui/material'
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// map-auto-waypointからクローンしたアプリケーション
// @ts-expect-error - map-auto-waypointはJSXファイルのため型定義なし
import MapApp from '@/features/map/App'
import useUTMStore from '@/store/utmStore'

const FlightPlanCreatePage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { projects } = useUTMStore()

  const project = projects.find((p) => p.id === projectId)
  const [isSaving, setIsSaving] = useState(false)

  const handleBack = () => {
    navigate(`/project/${projectId}?tab=flight-plans`)
  }

  const handleSave = async () => {
    setIsSaving(true)

    // TODO: map-auto-waypointから設定を取得
    // TODO: 飛行計画として保存

    // 一時的なモック保存処理
    await new Promise((resolve) => setTimeout(resolve, 500))

    setIsSaving(false)

    // 保存後にプロジェクト詳細に戻る
    handleBack()
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        zIndex: 1300, // サイドバーより上に表示
      }}>
      {/* ヘッダー */}
      <AppBar
        position='static'
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}>
        <Toolbar>
          <IconButton
            edge='start'
            onClick={handleBack}
            sx={{ mr: 2 }}
            aria-label='戻る'>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant='h6' component='div'>
              飛行計画作成
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              プロジェクト: {project?.name ?? projectId}
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving}>
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </Toolbar>
      </AppBar>

      {/* マップツール（フルスクリーン） */}
      <Box
        className='map-auto-waypoint-wrapper'
        sx={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          // map-auto-waypointのスタイルを確実に適用
          '& .app': {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'visible !important',
          },
          '& .app .app-main': {
            overflow: 'visible !important',
          },
          '& .app .map-section': {
            overflow: 'visible !important',
          },
          // map-auto-waypointのサイドバー透明度修正
          '& .app .sidebar': {
            backgroundColor: 'var(--color-bg-elevated, #1a1f2e) !important',
            backdropFilter: 'none !important',
            WebkitBackdropFilter: 'none !important',
            opacity: '1 !important',
          },
          '& .app .sidebar.collapsed': {
            backgroundColor: 'var(--color-bg-elevated, #1a1f2e) !important',
          },
          '& .app .app-header': {
            backgroundColor: 'var(--color-bg, #0f1419) !important',
            backdropFilter: 'none !important',
            WebkitBackdropFilter: 'none !important',
          },
          '& .app .search-section': {
            backgroundColor: 'transparent !important',
          },
          '& .app .panel-content': {
            backgroundColor: 'transparent !important',
          },
          '& .app .sidebar-collapsed-content': {
            backgroundColor: 'var(--color-bg-elevated, #1a1f2e) !important',
          },
          // MapLibreキャンバスのz-index調整
          '& .maplibregl-canvas-container': {
            zIndex: 0,
          },
          '& .maplibregl-canvas': {
            zIndex: 0,
          },
          // レイヤーコントロール（右上）を表示
          '& .app [class*="mapControls"]': {
            display: 'flex !important',
            visibility: 'visible !important',
            opacity: '1 !important',
            zIndex: 9000,
            pointerEvents: 'auto !important',
            position: 'fixed !important',
            top: '76px !important', // AppBarの下
            right: '16px !important',
            left: 'auto !important',
            backdropFilter: 'none !important',
            WebkitBackdropFilter: 'none !important',
          },
        }}>
        <MapApp />
      </Box>
    </Box>
  )
}

export default FlightPlanCreatePage
