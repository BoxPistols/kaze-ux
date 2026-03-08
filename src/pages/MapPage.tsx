// src/pages/MapPage.tsx
/**
 * マップページ - ドローンウェイポイント計画ツール
 *
 * map-auto-waypoint機能を統合:
 * - DID (人口集中地区) 検出
 * - 空港制限区域
 * - 禁止区域 (110施設)
 * - GSI地図
 * - ウェイポイント自動生成
 * - ポリゴン描画
 * - NOTAMエクスポート
 * - 天気予報
 * - AI飛行アシスタント
 */

import { Box } from '@mui/material'

// map-auto-waypointからクローンしたアプリケーション
import MapApp from '@/features/map/App'

const MapPage = () => {
  return (
    <Box
      className='map-auto-waypoint-wrapper'
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        // map-auto-waypointのスタイルを確実に適用
        '& .app': {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'visible !important', // レイヤーコントロールを表示するため
        },
        '& .app .app-main': {
          overflow: 'visible !important', // レイヤーコントロールを表示するため
        },
        '& .app .map-section': {
          overflow: 'visible !important', // レイヤーコントロールを表示するため
        },
        // map-auto-waypointのサイドバー透明度修正（SDPFテーマのglassmorphism上書き防止）
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
        // FlightRequirements位置調整 (SDPF sidebar 240px を考慮)
        '& .flight-requirements-panel': {
          left: '580px !important', // 240px (SDPF) + 340px (map sidebar)
        },
        '& .flight-requirements-minimized-icon': {
          left: '584px !important', // 240px (SDPF) + 344px (map sidebar)
        },
        // MapLibreキャンバスのz-index調整
        '& .maplibregl-canvas-container': {
          zIndex: 0,
        },
        '& .maplibregl-canvas': {
          zIndex: 0,
        },
        // レイヤーコントロール（右上の飛行制限レイヤー選択）を確実に表示
        // position: fixed でマップのスタッキングコンテキストから独立させる
        '& .app [class*="mapControls"]': {
          display: 'flex !important',
          visibility: 'visible !important',
          opacity: '1 !important',
          zIndex: 9000,
          pointerEvents: 'auto !important',
          position: 'fixed !important',
          top: '60px !important', // ヘッダー下
          right: '16px !important',
          left: 'auto !important',
          // ガラスモーフィズムを無効化、元のdarkテーマ配色
          backdropFilter: 'none !important',
          WebkitBackdropFilter: 'none !important',
        },
        '& .app [class*="controlsGroup"]': {
          display: 'grid !important',
          visibility: 'visible !important',
          opacity: '1 !important',
          zIndex: 9000,
          // 元のdarkテーマ配色を適用
          backdropFilter: 'none !important',
          WebkitBackdropFilter: 'none !important',
        },
        // ControlGroup内のボタン・パネルの配色を元に戻す
        '& .app [class*="mapControls"] [class*="toggleButton"]': {
          zIndex: 9000,
          pointerEvents: 'auto !important',
          backdropFilter: 'none !important',
          WebkitBackdropFilter: 'none !important',
        },
        '& .app [class*="mapControls"] [class*="controlGroup"]': {
          backgroundColor:
            'var(--color-bg-elevated, rgba(30, 41, 59, 0.95)) !important',
          backdropFilter: 'none !important',
          WebkitBackdropFilter: 'none !important',
        },
        // フライトアシスタント（チャット）をレイヤーコントロールより前面に
        // 背景色を元のdarkテーマ配色に修正（ガラスモーフィズム無効化）
        '& .flight-assistant': {
          zIndex: '10000 !important',
          position: 'fixed !important',
          backgroundColor:
            'var(--color-bg-elevated, rgba(15, 23, 42, 0.98)) !important',
          backdropFilter: 'blur(12px) !important',
          WebkitBackdropFilter: 'blur(12px) !important',
          border:
            '1px solid var(--color-border, rgba(255, 255, 255, 0.1)) !important',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4) !important',
        },
        '& .flight-assistant-fab': {
          zIndex: '10000 !important',
        },
        // フライトアシスタント内部の背景色も修正
        '& .flight-assistant-messages': {
          backgroundColor: 'var(--color-bg, rgba(15, 23, 42, 0.95)) !important',
        },
        '& .flight-assistant .message.assistant': {
          backgroundColor:
            'var(--color-bg-secondary, rgba(30, 41, 59, 0.95)) !important',
        },
      }}>
      <MapApp />
    </Box>
  )
}

export default MapPage
