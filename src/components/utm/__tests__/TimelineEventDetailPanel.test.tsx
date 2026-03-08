/**
 * TimelineEventDetailPanel コンポーネントのユニットテスト
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { describe, it, expect, vi } from 'vitest'

import { TimelineEventDetailPanel } from '../TimelineEventDetailPanel'
import type { FlightTimelineEvent } from '@/types/utmTypes'

const theme = createTheme()

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

// モックイベントデータ生成
const createMockEvent = (
  overrides?: Partial<FlightTimelineEvent>
): FlightTimelineEvent => ({
  id: 'event-001',
  droneId: 'drone-001',
  type: 'takeoff',
  severity: 'info',
  timestamp: new Date('2024-01-01T10:00:00'),
  title: '離陸開始',
  description: 'ドローンが離陸を開始しました',
  ...overrides,
})

describe('TimelineEventDetailPanel コンポーネント', () => {
  describe('基本表示テスト', () => {
    it('eventがnullの場合は何も表示しない', () => {
      const { container } = render(
        <TestWrapper>
          <TimelineEventDetailPanel event={null} />
        </TestWrapper>
      )

      expect(container.firstChild).toBeNull()
    })

    it('イベントがある場合はパネルを表示する', () => {
      const event = createMockEvent()
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText('離陸開始')).toBeInTheDocument()
    })

    it('イベントタイトルが表示される', () => {
      const event = createMockEvent({ title: 'テストイベント' })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText('テストイベント')).toBeInTheDocument()
    })

    it('イベント種別が表示される', () => {
      const event = createMockEvent({ type: 'landing' })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText('着陸')).toBeInTheDocument()
    })

    it('説明がある場合は表示される', () => {
      const event = createMockEvent({ description: '詳細な説明文です' })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText('詳細な説明文です')).toBeInTheDocument()
    })

    it('説明がない場合は説明セクションが表示されない', () => {
      const event = createMockEvent({ description: undefined })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.queryByText('詳細')).toBeNull()
    })
  })

  describe('重要度表示テスト', () => {
    const severities: FlightTimelineEvent['severity'][] = [
      'info',
      'success',
      'warning',
      'error',
      'critical',
    ]

    const severityLabels: Record<FlightTimelineEvent['severity'], string> = {
      info: '情報',
      success: '成功',
      warning: '警告',
      error: 'エラー',
      critical: '緊急',
    }

    it.each(severities)('重要度 "%s" のラベルが表示される', (severity) => {
      const event = createMockEvent({ severity })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText(severityLabels[severity])).toBeInTheDocument()
    })
  })

  describe('データ表示テスト', () => {
    it('バッテリーレベルが表示される', () => {
      const event = createMockEvent({
        data: { batteryLevel: 75 },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('信号強度が表示される', () => {
      const event = createMockEvent({
        data: { signalStrength: 85 },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText('85%')).toBeInTheDocument()
    })

    it('位置情報（高度）が表示される', () => {
      const event = createMockEvent({
        data: {
          position: { latitude: 35.6812, longitude: 139.7671, altitude: 150 },
        },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText('150.0m')).toBeInTheDocument()
    })

    it('ウェイポイント名が表示される', () => {
      const event = createMockEvent({
        data: { waypointName: 'WP-01' },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText('WP-01')).toBeInTheDocument()
    })

    it('禁止区域名と距離が表示される', () => {
      const event = createMockEvent({
        data: { zoneName: '空港周辺', distance: 500 },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText(/空港周辺/)).toBeInTheDocument()
      expect(screen.getByText(/500m/)).toBeInTheDocument()
    })

    it('関連ドローン名が表示される', () => {
      const event = createMockEvent({
        data: { relatedDroneName: 'ドローンB' },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText(/ドローンB/)).toBeInTheDocument()
    })

    it('データがない場合はデータセクションが表示されない', () => {
      const event = createMockEvent({ data: undefined })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      // BatteryFullIconなどが存在しないことを確認
      expect(screen.queryByTestId('BatteryFullIcon')).toBeNull()
    })

    it('空のデータオブジェクトの場合はデータセクションが表示されない', () => {
      const event = createMockEvent({ data: {} })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      // データセクションのDividerが存在しないことを確認
      const container = screen.getByText('離陸開始').closest('div')
      expect(container).toBeInTheDocument()
    })
  })

  describe('リンクボタン表示条件テスト', () => {
    it('マップリンクがある場合はマップボタンが表示される', () => {
      const event = createMockEvent({
        links: { mapPosition: true },
        data: {
          position: { latitude: 35.6812, longitude: 139.7671, altitude: 100 },
        },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} onMapClick={vi.fn()} />
        </TestWrapper>
      )

      expect(screen.getByText('マップで確認')).toBeInTheDocument()
    })

    it('位置情報がない場合はマップボタンが表示されない', () => {
      const event = createMockEvent({
        links: { mapPosition: true },
        data: undefined,
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} onMapClick={vi.fn()} />
        </TestWrapper>
      )

      expect(screen.queryByText('マップで確認')).toBeNull()
    })

    it('フライトログリンクがある場合はフライトログボタンが表示される', () => {
      const event = createMockEvent({
        links: { flightLog: 'log-001' },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} onFlightLogClick={vi.fn()} />
        </TestWrapper>
      )

      expect(screen.getByText('フライトログ')).toBeInTheDocument()
    })

    it('アラートリンクがある場合はアラートボタンが表示される', () => {
      const event = createMockEvent({
        links: { alert: 'alert-001' },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} onAlertClick={vi.fn()} />
        </TestWrapper>
      )

      expect(screen.getByText('アラート詳細')).toBeInTheDocument()
    })

    it('インシデントリンクがある場合はインシデントボタンが表示される', () => {
      const event = createMockEvent({
        links: { incident: 'incident-001' },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} onIncidentClick={vi.fn()} />
        </TestWrapper>
      )

      expect(screen.getByText('インシデント')).toBeInTheDocument()
    })

    it('コールバックがない場合はリンクボタンが表示されない', () => {
      const event = createMockEvent({
        links: { flightLog: 'log-001', alert: 'alert-001' },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.queryByText('フライトログ')).toBeNull()
      expect(screen.queryByText('アラート詳細')).toBeNull()
    })

    it('リンクがない場合はリンクセクションが表示されない', () => {
      const event = createMockEvent({ links: undefined })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.queryByText('マップで確認')).toBeNull()
      expect(screen.queryByText('フライトログ')).toBeNull()
    })
  })

  describe('対応状況表示テスト', () => {
    it('acknowledgedがtrueの場合は確認済みが表示される', () => {
      const event = createMockEvent({
        acknowledged: true,
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText(/確認済み/)).toBeInTheDocument()
    })

    it('確認者名が表示される', () => {
      const event = createMockEvent({
        acknowledged: true,
        acknowledgedBy: '山田太郎',
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText(/山田太郎/)).toBeInTheDocument()
    })

    it('確認日時が表示される', () => {
      const event = createMockEvent({
        acknowledged: true,
        acknowledgedAt: new Date('2024-01-01T15:30:00'),
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText(/15:30/)).toBeInTheDocument()
    })

    it('acknowledgedがfalseの場合は確認済みが表示されない', () => {
      const event = createMockEvent({
        acknowledged: false,
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.queryByText(/確認済み/)).toBeNull()
    })
  })

  describe('コールバックテスト', () => {
    it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
      const event = createMockEvent()
      const handleClose = vi.fn()
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} onClose={handleClose} />
        </TestWrapper>
      )

      // CloseIconボタンを探してクリック
      const closeButton = screen.getByRole('button', { name: '' })
      fireEvent.click(closeButton)
      expect(handleClose).toHaveBeenCalled()
    })

    it('マップボタンをクリックするとonMapClickが呼ばれる', () => {
      const event = createMockEvent({
        links: { mapPosition: true },
        data: {
          position: { latitude: 35.6812, longitude: 139.7671, altitude: 100 },
        },
      })
      const handleMapClick = vi.fn()
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} onMapClick={handleMapClick} />
        </TestWrapper>
      )

      fireEvent.click(screen.getByText('マップで確認'))
      expect(handleMapClick).toHaveBeenCalledWith(event)
    })

    it('フライトログボタンをクリックするとonFlightLogClickが呼ばれる', () => {
      const event = createMockEvent({
        links: { flightLog: 'log-123' },
      })
      const handleFlightLogClick = vi.fn()
      render(
        <TestWrapper>
          <TimelineEventDetailPanel
            event={event}
            onFlightLogClick={handleFlightLogClick}
          />
        </TestWrapper>
      )

      fireEvent.click(screen.getByText('フライトログ'))
      expect(handleFlightLogClick).toHaveBeenCalledWith('log-123')
    })

    it('アラートボタンをクリックするとonAlertClickが呼ばれる', () => {
      const event = createMockEvent({
        links: { alert: 'alert-456' },
      })
      const handleAlertClick = vi.fn()
      render(
        <TestWrapper>
          <TimelineEventDetailPanel
            event={event}
            onAlertClick={handleAlertClick}
          />
        </TestWrapper>
      )

      fireEvent.click(screen.getByText('アラート詳細'))
      expect(handleAlertClick).toHaveBeenCalledWith('alert-456')
    })

    it('インシデントボタンをクリックするとonIncidentClickが呼ばれる', () => {
      const event = createMockEvent({
        links: { incident: 'incident-789' },
      })
      const handleIncidentClick = vi.fn()
      render(
        <TestWrapper>
          <TimelineEventDetailPanel
            event={event}
            onIncidentClick={handleIncidentClick}
          />
        </TestWrapper>
      )

      fireEvent.click(screen.getByText('インシデント'))
      expect(handleIncidentClick).toHaveBeenCalledWith('incident-789')
    })
  })

  describe('パネル開閉制御テスト', () => {
    it('イベント選択時にonOpenChangeが呼ばれる', async () => {
      const event = createMockEvent()
      const handleOpenChange = vi.fn()
      render(
        <TestWrapper>
          <TimelineEventDetailPanel
            event={event}
            isOpen={false}
            onOpenChange={handleOpenChange}
          />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true)
      })
    })

    it('すでに開いている場合はonOpenChangeが呼ばれない', () => {
      const event = createMockEvent()
      const handleOpenChange = vi.fn()
      render(
        <TestWrapper>
          <TimelineEventDetailPanel
            event={event}
            isOpen={true}
            onOpenChange={handleOpenChange}
          />
        </TestWrapper>
      )

      expect(handleOpenChange).not.toHaveBeenCalled()
    })
  })

  describe('バッテリー・信号強度の色分け', () => {
    it('バッテリー残量が20%未満の場合は赤色アイコン', () => {
      const event = createMockEvent({
        data: { batteryLevel: 15 },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      // BatteryFullIconが存在することを確認
      expect(screen.getByText('15%')).toBeInTheDocument()
    })

    it('バッテリー残量が20-40%の場合は警告色アイコン', () => {
      const event = createMockEvent({
        data: { batteryLevel: 35 },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText('35%')).toBeInTheDocument()
    })

    it('バッテリー残量が40%以上の場合は緑色アイコン', () => {
      const event = createMockEvent({
        data: { batteryLevel: 80 },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText('80%')).toBeInTheDocument()
    })

    it('信号強度が30%未満の場合は赤色アイコン', () => {
      const event = createMockEvent({
        data: { signalStrength: 25 },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText('25%')).toBeInTheDocument()
    })

    it('信号強度が30-60%の場合は警告色アイコン', () => {
      const event = createMockEvent({
        data: { signalStrength: 45 },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText('45%')).toBeInTheDocument()
    })

    it('信号強度が60%以上の場合は緑色アイコン', () => {
      const event = createMockEvent({
        data: { signalStrength: 90 },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText('90%')).toBeInTheDocument()
    })
  })

  describe('30種類のイベントタイプ対応テスト', () => {
    const eventTypes: FlightTimelineEvent['type'][] = [
      'takeoff',
      'landing',
      'waypoint_reached',
      'route_change',
      'rth_start',
      'hover_start',
      'hover_end',
      'low_battery',
      'critical_battery',
      'signal_weak',
      'signal_lost',
      'signal_recovered',
      'geofence_warning',
      'geofence_breach',
      'zone_approach',
      'zone_violation',
      'collision_warning',
      'weather_warning',
      'system_error',
      'motor_warning',
      'gps_warning',
      'manual_override',
      'auto_mode',
      'mission_start',
      'mission_complete',
      'mission_abort',
      'photo_taken',
      'video_start',
      'video_end',
      'custom',
    ]

    it.each(eventTypes)(
      'イベントタイプ "%s" が正しくレンダリングされる',
      (type) => {
        const event = createMockEvent({ type })
        render(
          <TestWrapper>
            <TimelineEventDetailPanel event={event} />
          </TestWrapper>
        )

        // パネルがレンダリングされることを確認
        expect(screen.getByText('離陸開始')).toBeInTheDocument()
      }
    )
  })

  describe('複合データ表示テスト', () => {
    it('複数のデータフィールドが同時に表示される', () => {
      const event = createMockEvent({
        data: {
          batteryLevel: 65,
          signalStrength: 80,
          position: { latitude: 35.6812, longitude: 139.7671, altitude: 120 },
          waypointName: 'WP-03',
        },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel event={event} />
        </TestWrapper>
      )

      expect(screen.getByText('65%')).toBeInTheDocument()
      expect(screen.getByText('80%')).toBeInTheDocument()
      expect(screen.getByText('120.0m')).toBeInTheDocument()
      expect(screen.getByText('WP-03')).toBeInTheDocument()
    })

    it('複数のリンクボタンが同時に表示される', () => {
      const event = createMockEvent({
        links: {
          mapPosition: true,
          flightLog: 'log-001',
          alert: 'alert-001',
          incident: 'incident-001',
        },
        data: {
          position: { latitude: 35.6812, longitude: 139.7671, altitude: 100 },
        },
      })
      render(
        <TestWrapper>
          <TimelineEventDetailPanel
            event={event}
            onMapClick={vi.fn()}
            onFlightLogClick={vi.fn()}
            onAlertClick={vi.fn()}
            onIncidentClick={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('マップで確認')).toBeInTheDocument()
      expect(screen.getByText('フライトログ')).toBeInTheDocument()
      expect(screen.getByText('アラート詳細')).toBeInTheDocument()
      expect(screen.getByText('インシデント')).toBeInTheDocument()
    })
  })
})
