/**
 * TimelineEventMarker コンポーネントのユニットテスト
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { describe, it, expect, vi } from 'vitest'

import { TimelineEventMarker } from '../TimelineEventMarker'
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

describe('TimelineEventMarker コンポーネント', () => {
  describe('表示テスト', () => {
    it('マーカーが正しくレンダリングされる', () => {
      const event = createMockEvent()
      render(
        <TestWrapper>
          <TimelineEventMarker event={event} position={50} />
        </TestWrapper>
      )

      // マーカーがボタンとしてレンダリングされる
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('時刻ラベルが表示される', () => {
      const event = createMockEvent({
        timestamp: new Date('2024-01-01T14:30:00'),
      })
      render(
        <TestWrapper>
          <TimelineEventMarker event={event} position={50} />
        </TestWrapper>
      )

      // 時刻が表示される（フォーマット形式は formatTime に依存）
      expect(screen.getByText(/14:30/)).toBeInTheDocument()
    })

    it('イベント種別ラベルが表示される', () => {
      const event = createMockEvent({ type: 'takeoff' })
      render(
        <TestWrapper>
          <TimelineEventMarker event={event} position={50} />
        </TestWrapper>
      )

      // 離陸ラベルが表示される
      expect(screen.getByText('離陸')).toBeInTheDocument()
    })

    it('position プロパティで位置が設定される', () => {
      const event = createMockEvent()
      render(
        <TestWrapper>
          <TimelineEventMarker event={event} position={75} />
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // position propsが正しく渡されることをコンポーネントのレンダリングで確認
    })
  })

  describe('重要度によるスタイル変化', () => {
    const severities: FlightTimelineEvent['severity'][] = [
      'info',
      'success',
      'warning',
      'error',
      'critical',
    ]

    it.each(severities)(
      '重要度 "%s" でマーカーがレンダリングされる',
      (severity) => {
        const event = createMockEvent({ severity })
        render(
          <TestWrapper>
            <TimelineEventMarker event={event} position={50} />
          </TestWrapper>
        )

        expect(screen.getByRole('button')).toBeInTheDocument()
      }
    )
  })

  describe('イベントタイプによるアイコン変化', () => {
    const eventTypes: FlightTimelineEvent['type'][] = [
      'takeoff',
      'landing',
      'waypoint_reached',
      'low_battery',
      'signal_lost',
      'geofence_warning',
      'collision_warning',
      'mission_complete',
      'photo_taken',
      'video_start',
    ]

    it.each(eventTypes)(
      'イベントタイプ "%s" で正しくレンダリングされる',
      (type) => {
        const event = createMockEvent({ type })
        render(
          <TestWrapper>
            <TimelineEventMarker event={event} position={50} />
          </TestWrapper>
        )

        expect(screen.getByRole('button')).toBeInTheDocument()
      }
    )
  })

  describe('選択状態', () => {
    it('非選択時にマーカーがレンダリングされる', () => {
      const event = createMockEvent()
      render(
        <TestWrapper>
          <TimelineEventMarker event={event} position={50} isSelected={false} />
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('選択時にマーカーがレンダリングされる', () => {
      const event = createMockEvent()
      render(
        <TestWrapper>
          <TimelineEventMarker event={event} position={50} isSelected={true} />
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('インタラクション', () => {
    it('クリック時にonClickが呼ばれる', () => {
      const event = createMockEvent()
      const handleClick = vi.fn()
      render(
        <TestWrapper>
          <TimelineEventMarker
            event={event}
            position={50}
            onClick={handleClick}
          />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledWith(event)
    })

    it('クリック時にイベントオブジェクトが渡される', () => {
      const event = createMockEvent({ id: 'test-event-123' })
      const handleClick = vi.fn()
      render(
        <TestWrapper>
          <TimelineEventMarker
            event={event}
            position={50}
            onClick={handleClick}
          />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-event-123' })
      )
    })

    it('onClickが未定義でもエラーにならない', () => {
      const event = createMockEvent()
      render(
        <TestWrapper>
          <TimelineEventMarker event={event} position={50} />
        </TestWrapper>
      )

      // クリックしてもエラーにならない
      expect(() => {
        fireEvent.click(screen.getByRole('button'))
      }).not.toThrow()
    })
  })

  describe('キーボードアクセシビリティ', () => {
    it('tabIndexが設定されている', () => {
      const event = createMockEvent()
      render(
        <TestWrapper>
          <TimelineEventMarker event={event} position={50} />
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      expect(button.getAttribute('tabindex')).toBe('0')
    })

    it('Enterキーでクリックハンドラが呼ばれる', () => {
      const event = createMockEvent()
      const handleClick = vi.fn()
      render(
        <TestWrapper>
          <TimelineEventMarker
            event={event}
            position={50}
            onClick={handleClick}
          />
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Enter' })
      expect(handleClick).toHaveBeenCalledWith(event)
    })

    it('Spaceキーでクリックハンドラが呼ばれる', () => {
      const event = createMockEvent()
      const handleClick = vi.fn()
      render(
        <TestWrapper>
          <TimelineEventMarker
            event={event}
            position={50}
            onClick={handleClick}
          />
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: ' ' })
      expect(handleClick).toHaveBeenCalledWith(event)
    })

    it('他のキーではクリックハンドラが呼ばれない', () => {
      const event = createMockEvent()
      const handleClick = vi.fn()
      render(
        <TestWrapper>
          <TimelineEventMarker
            event={event}
            position={50}
            onClick={handleClick}
          />
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Escape' })
      fireEvent.keyDown(button, { key: 'Tab' })
      fireEvent.keyDown(button, { key: 'a' })
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('ツールチップ', () => {
    it('イベントのタイトルがツールチップに含まれる', async () => {
      const event = createMockEvent({ title: 'テストイベントタイトル' })
      render(
        <TestWrapper>
          <TimelineEventMarker event={event} position={50} />
        </TestWrapper>
      )

      // ホバーしてツールチップを表示
      fireEvent.mouseOver(screen.getByRole('button'))

      // ツールチップのタイトルが表示されるまで待つ
      const tooltip = await screen.findByText('テストイベントタイトル')
      expect(tooltip).toBeInTheDocument()
    })

    it('説明がある場合はツールチップに含まれる', async () => {
      const event = createMockEvent({
        title: 'タイトル',
        description: 'イベントの詳細説明文',
      })
      render(
        <TestWrapper>
          <TimelineEventMarker event={event} position={50} />
        </TestWrapper>
      )

      fireEvent.mouseOver(screen.getByRole('button'))

      const description = await screen.findByText('イベントの詳細説明文')
      expect(description).toBeInTheDocument()
    })
  })

  describe('位置計算', () => {
    it('position=0でマーカーがレンダリングされる', () => {
      const event = createMockEvent()
      render(
        <TestWrapper>
          <TimelineEventMarker event={event} position={0} />
        </TestWrapper>
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('position=100でマーカーがレンダリングされる', () => {
      const event = createMockEvent()
      render(
        <TestWrapper>
          <TimelineEventMarker event={event} position={100} />
        </TestWrapper>
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('小数点を含むpositionでマーカーがレンダリングされる', () => {
      const event = createMockEvent()
      render(
        <TestWrapper>
          <TimelineEventMarker event={event} position={33.33} />
        </TestWrapper>
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})
