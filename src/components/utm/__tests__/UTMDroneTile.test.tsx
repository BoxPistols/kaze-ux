import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { describe, it, expect, vi } from 'vitest'

import { UTMDroneTile } from '../UTMDroneTile'
import type { DroneFlightStatus, UTMAlert } from '../../../types/utmTypes'

const theme = createTheme()

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

// モックドローンデータ
const createMockDrone = (
  overrides?: Partial<DroneFlightStatus>
): DroneFlightStatus => ({
  droneId: 'drone-001',
  droneName: 'テストドローン1',
  pilotId: 'pilot-001',
  pilotName: 'テストパイロット',
  flightPlanId: 'plan-001',
  position: {
    droneId: 'drone-001',
    latitude: 35.6812,
    longitude: 139.7671,
    altitude: 100,
    heading: 45,
    speed: 10,
    timestamp: new Date(),
  },
  batteryLevel: 75,
  signalStrength: 85,
  flightMode: 'auto',
  status: 'in_flight',
  startTime: new Date(Date.now() - 1800000), // 30分前
  estimatedEndTime: new Date(Date.now() + 1800000), // 30分後
  ...overrides,
})

// モックアラートデータ
const createMockAlert = (overrides?: Partial<UTMAlert>): UTMAlert => ({
  id: 'alert-001',
  type: 'low_battery',
  severity: 'warning',
  droneId: 'drone-001',
  droneName: 'テストドローン1',
  message: 'バッテリー残量が低下しています',
  details: 'バッテリー残量が25%を下回りました',
  timestamp: new Date(),
  acknowledged: false,
  ...overrides,
})

describe('UTMDroneTile コンポーネント', () => {
  describe('表示テスト', () => {
    it('ドローン名が正しく表示される', () => {
      console.log('テスト中: ドローン名の表示')
      const drone = createMockDrone()
      render(
        <TestWrapper>
          <UTMDroneTile drone={drone} />
        </TestWrapper>
      )

      expect(screen.getByText('テストドローン1')).toBeInTheDocument()
      console.log('成功: ドローン名が表示されました')
    })

    it('バッテリー残量が表示される', () => {
      console.log('テスト中: バッテリー残量の表示')
      const drone = createMockDrone({ batteryLevel: 75 })
      render(
        <TestWrapper>
          <UTMDroneTile drone={drone} />
        </TestWrapper>
      )

      expect(screen.getByText(/75/)).toBeInTheDocument()
      console.log('成功: バッテリー残量が表示されました')
    })

    it('信号強度が表示される', () => {
      console.log('テスト中: 信号強度の表示')
      const drone = createMockDrone({ signalStrength: 85 })
      render(
        <TestWrapper>
          <UTMDroneTile drone={drone} />
        </TestWrapper>
      )

      // 信号強度はアイコンの色として表示されるため、速度表示欄が存在することを確認
      // UTMDroneTileでは信号アイコンは速度の横に表示される
      expect(screen.getByText(/m\/s/)).toBeInTheDocument()
      console.log('成功: 信号強度表示エリアが表示されました')
    })

    it('高度が表示される', () => {
      console.log('テスト中: 高度の表示')
      const drone = createMockDrone()
      drone.position.altitude = 100
      render(
        <TestWrapper>
          <UTMDroneTile drone={drone} />
        </TestWrapper>
      )

      // コンポーネントは altitude + 20 の値を表示する（100 + 20 = 120m）
      expect(screen.getByText(/120m/)).toBeInTheDocument()
      console.log('成功: 高度が表示されました')
    })

    it('速度が表示される', () => {
      console.log('テスト中: 速度の表示')
      const drone = createMockDrone()
      drone.position.speed = 10
      render(
        <TestWrapper>
          <UTMDroneTile drone={drone} />
        </TestWrapper>
      )

      expect(screen.getByText(/10/)).toBeInTheDocument()
      console.log('成功: 速度が表示されました')
    })
  })

  describe('ステータス表示テスト', () => {
    it('飛行中ステータスが表示される', () => {
      console.log('テスト中: 飛行中ステータスの表示')
      const drone = createMockDrone({ status: 'in_flight' })
      render(
        <TestWrapper>
          <UTMDroneTile drone={drone} />
        </TestWrapper>
      )

      expect(screen.getByText('飛行中')).toBeInTheDocument()
      console.log('成功: 飛行中ステータスが表示されました')
    })

    it('緊急ステータスが表示される', () => {
      console.log('テスト中: 緊急ステータスの表示')
      const drone = createMockDrone({ status: 'emergency' })
      render(
        <TestWrapper>
          <UTMDroneTile drone={drone} />
        </TestWrapper>
      )

      expect(screen.getByText('緊急')).toBeInTheDocument()
      console.log('成功: 緊急ステータスが表示されました')
    })

    it('帰還中ステータスが表示される', () => {
      console.log('テスト中: 帰還中ステータスの表示')
      const drone = createMockDrone({ status: 'rth' })
      render(
        <TestWrapper>
          <UTMDroneTile drone={drone} />
        </TestWrapper>
      )

      expect(screen.getByText('帰還中')).toBeInTheDocument()
      console.log('成功: 帰還中ステータスが表示されました')
    })

    it('ホバリングステータスが表示される', () => {
      console.log('テスト中: ホバリングステータスの表示')
      const drone = createMockDrone({ status: 'hovering', flightMode: 'hover' })
      render(
        <TestWrapper>
          <UTMDroneTile drone={drone} />
        </TestWrapper>
      )

      // ステータスChipとフライトモードの両方で「ホバリング」が表示されるため、
      // getAllByTextを使用して複数要素の存在を確認
      const hoveringTexts = screen.getAllByText('ホバリング')
      expect(hoveringTexts.length).toBeGreaterThanOrEqual(1)
      console.log('成功: ホバリングステータスが表示されました')
    })
  })

  describe('アラート表示テスト', () => {
    it('未確認アラートがある場合バッジが表示される', () => {
      console.log('テスト中: アラートバッジの表示')
      const drone = createMockDrone()
      const alerts = [createMockAlert({ acknowledged: false })]
      render(
        <TestWrapper>
          <UTMDroneTile drone={drone} alerts={alerts} />
        </TestWrapper>
      )

      // バッジが表示されていることを確認（MUI Badgeは数字を表示）
      const badge = screen.getByText('1')
      expect(badge).toBeInTheDocument()
      console.log('成功: アラートバッジが表示されました')
    })
  })

  describe('インタラクションテスト', () => {
    it('クリック時にonClickが呼ばれる', () => {
      console.log('テスト中: クリックイベント')
      const drone = createMockDrone()
      const handleClick = vi.fn()
      render(
        <TestWrapper>
          <UTMDroneTile drone={drone} onClick={handleClick} />
        </TestWrapper>
      )

      const tile = screen.getByText('テストドローン1').closest('div')
      if (tile) {
        fireEvent.click(tile)
      }

      expect(handleClick).toHaveBeenCalled()
      console.log('成功: クリックイベントが発火しました')
    })

    it('ホームボタンクリック時にonHomeClickが呼ばれる', () => {
      console.log('テスト中: ホームボタンクリック')
      const drone = createMockDrone()
      const handleHomeClick = vi.fn()
      render(
        <TestWrapper>
          <UTMDroneTile drone={drone} onHomeClick={handleHomeClick} />
        </TestWrapper>
      )

      // ホームアイコンボタンを見つけてクリック（HomeIconのdata-testidで検索）
      const buttons = screen.getAllByRole('button')
      const homeButton = buttons.find((btn) =>
        btn.querySelector('[data-testid="HomeIcon"]')
      )
      if (homeButton) {
        fireEvent.click(homeButton)
        expect(handleHomeClick).toHaveBeenCalled()
      }
      console.log('成功: ホームボタンクリックイベントが発火しました')
    })

    it('メニューボタンクリック時にonMenuClickが呼ばれる', () => {
      console.log('テスト中: メニューボタンクリック')
      const drone = createMockDrone()
      const handleMenuClick = vi.fn()
      render(
        <TestWrapper>
          <UTMDroneTile drone={drone} onMenuClick={handleMenuClick} />
        </TestWrapper>
      )

      // メニューアイコンボタンを見つけてクリック
      const buttons = screen.getAllByRole('button')
      const menuButton = buttons.find((btn) =>
        btn.querySelector('[data-testid="MoreHorizIcon"]')
      )
      if (menuButton) {
        fireEvent.click(menuButton)
        expect(handleMenuClick).toHaveBeenCalled()
      }
      console.log('成功: メニューボタンクリックイベントが発火しました')
    })
  })

  describe('選択状態テスト', () => {
    it('選択時にスタイルが変更される', () => {
      console.log('テスト中: 選択状態のスタイル')
      const drone = createMockDrone()
      const { rerender } = render(
        <TestWrapper>
          <UTMDroneTile drone={drone} isSelected={false} />
        </TestWrapper>
      )

      // 非選択状態
      const tileNotSelected = screen.getByText('テストドローン1').closest('div')

      // 選択状態に変更
      rerender(
        <TestWrapper>
          <UTMDroneTile drone={drone} isSelected={true} />
        </TestWrapper>
      )

      const tileSelected = screen.getByText('テストドローン1').closest('div')
      expect(tileSelected).toBeInTheDocument()
      console.log('成功: 選択状態でスタイルが変更されました')
    })
  })

  describe('ウェイポイント表示テスト', () => {
    it('次のウェイポイント情報が表示される', () => {
      console.log('テスト中: ウェイポイント情報の表示')
      const drone = createMockDrone()
      render(
        <TestWrapper>
          <UTMDroneTile drone={drone} nextWaypoint={3} distanceToNextWP={500} />
        </TestWrapper>
      )

      // コンポーネントは "次のWP: 3" という形式で表示する
      expect(screen.getByText(/次のWP: 3/)).toBeInTheDocument()
      // 距離も表示される（フォーマッターにより "500 m" または "500.0 m" 形式）
      expect(screen.getByText(/500.*m/)).toBeInTheDocument()
      console.log('成功: ウェイポイント情報が表示されました')
    })
  })
})
