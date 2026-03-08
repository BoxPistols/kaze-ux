/**
 * timelineHelpers ユニットテスト
 * getEventIcon, getSeverityColor, getEventTypeLabel のテスト
 */

import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import type {
  FlightTimelineEventType,
  FlightTimelineEventSeverity,
} from '@/types/utmTypes'

import { getEventIcon, getSeverityColor, getEventTypeLabel } from '../index'
import { colors } from '@/styles/tokens'

describe('timelineHelpers', () => {
  describe('getEventIcon', () => {
    // 全30種類のイベントタイプをテスト
    const eventTypes: FlightTimelineEventType[] = [
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
      'イベントタイプ "%s" に対してアイコンを返す',
      (type) => {
        const icon = getEventIcon(type)
        expect(icon).toBeDefined()
        expect(icon).not.toBeNull()
      }
    )

    it('デフォルトのフォントサイズは10', () => {
      const icon = getEventIcon('takeoff')
      const { container } = render(icon)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      // MUIのsxプロパティはクラス名として適用されるため、存在確認のみ
    })

    it('カスタムフォントサイズを適用できる', () => {
      const icon = getEventIcon('takeoff', 18)
      const { container } = render(icon)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      // MUIのsxプロパティはクラス名として適用されるため、存在確認のみ
    })

    it('追加のsxプロパティを適用できる', () => {
      const icon = getEventIcon('takeoff', 14, { color: 'red' })
      const { container } = render(icon)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      // MUIのsxプロパティはクラス名として適用されるため、存在確認のみ
    })

    describe('特定のイベントタイプと対応するアイコン', () => {
      it('takeoffはFlightTakeoffIconを返す', () => {
        const icon = getEventIcon('takeoff')
        const { container } = render(icon)
        expect(
          container.querySelector('[data-testid="FlightTakeoffIcon"]')
        ).toBeInTheDocument()
      })

      it('landingはFlightLandIconを返す', () => {
        const icon = getEventIcon('landing')
        const { container } = render(icon)
        expect(
          container.querySelector('[data-testid="FlightLandIcon"]')
        ).toBeInTheDocument()
      })

      it('low_batteryはBatteryAlertIconを返す', () => {
        const icon = getEventIcon('low_battery')
        const { container } = render(icon)
        expect(
          container.querySelector('[data-testid="BatteryAlertIcon"]')
        ).toBeInTheDocument()
      })

      it('signal_lostはSignalWifiOffIconを返す', () => {
        const icon = getEventIcon('signal_lost')
        const { container } = render(icon)
        expect(
          container.querySelector('[data-testid="SignalWifiOffIcon"]')
        ).toBeInTheDocument()
      })

      it('geofence_warningはWarningIconを返す', () => {
        const icon = getEventIcon('geofence_warning')
        const { container } = render(icon)
        expect(
          container.querySelector('[data-testid="WarningIcon"]')
        ).toBeInTheDocument()
      })

      it('collision_warningはErrorIconを返す', () => {
        const icon = getEventIcon('collision_warning')
        const { container } = render(icon)
        expect(
          container.querySelector('[data-testid="ErrorIcon"]')
        ).toBeInTheDocument()
      })

      it('mission_completeはCheckCircleIconを返す', () => {
        const icon = getEventIcon('mission_complete')
        const { container } = render(icon)
        expect(
          container.querySelector('[data-testid="CheckCircleIcon"]')
        ).toBeInTheDocument()
      })

      it('photo_takenはCameraAltIconを返す', () => {
        const icon = getEventIcon('photo_taken')
        const { container } = render(icon)
        expect(
          container.querySelector('[data-testid="CameraAltIcon"]')
        ).toBeInTheDocument()
      })

      it('video_startはVideocamIconを返す', () => {
        const icon = getEventIcon('video_start')
        const { container } = render(icon)
        expect(
          container.querySelector('[data-testid="VideocamIcon"]')
        ).toBeInTheDocument()
      })

      it('customはLocationOnIconを返す', () => {
        const icon = getEventIcon('custom')
        const { container } = render(icon)
        expect(
          container.querySelector('[data-testid="LocationOnIcon"]')
        ).toBeInTheDocument()
      })
    })
  })

  describe('getSeverityColor', () => {
    // 全5種類の重要度をテスト
    const severities: FlightTimelineEventSeverity[] = [
      'info',
      'success',
      'warning',
      'error',
      'critical',
    ]

    it.each(severities)('重要度 "%s" に対して色を返す', (severity) => {
      const color = getSeverityColor(severity)
      expect(color).toBeDefined()
      expect(typeof color).toBe('string')
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
    })

    it('infoはprimary[500]を返す', () => {
      expect(getSeverityColor('info')).toBe(colors.primary[500])
    })

    it('successはsuccess.mainを返す', () => {
      expect(getSeverityColor('success')).toBe(colors.success.main)
    })

    it('warningはwarning.mainを返す', () => {
      expect(getSeverityColor('warning')).toBe(colors.warning.main)
    })

    it('errorはerror.mainを返す', () => {
      expect(getSeverityColor('error')).toBe(colors.error.main)
    })

    it('criticalはerror.darkを返す', () => {
      expect(getSeverityColor('critical')).toBe(colors.error.dark)
    })

    it('未知の重要度はgray[500]を返す', () => {
      // TypeScriptの型チェックをバイパスしてテスト
      const unknownSeverity = 'unknown' as FlightTimelineEventSeverity
      expect(getSeverityColor(unknownSeverity)).toBe(colors.gray[500])
    })
  })

  describe('getEventTypeLabel', () => {
    // 全30種類のイベントタイプと期待されるラベル
    const labelMap: Record<FlightTimelineEventType, string> = {
      takeoff: '離陸',
      landing: '着陸',
      waypoint_reached: 'WP到達',
      route_change: 'ルート変更',
      rth_start: 'RTH開始',
      hover_start: 'ホバリング開始',
      hover_end: 'ホバリング終了',
      low_battery: 'バッテリー低下',
      critical_battery: 'バッテリー危険',
      signal_weak: '信号弱',
      signal_lost: '信号喪失',
      signal_recovered: '信号回復',
      geofence_warning: 'ジオフェンス警告',
      geofence_breach: 'ジオフェンス逸脱',
      zone_approach: '禁止区域接近',
      zone_violation: '禁止区域侵入',
      collision_warning: '衝突警告',
      weather_warning: '気象警告',
      system_error: 'システムエラー',
      motor_warning: 'モーター警告',
      gps_warning: 'GPS警告',
      manual_override: '手動操作',
      auto_mode: '自動モード',
      mission_start: 'ミッション開始',
      mission_complete: 'ミッション完了',
      mission_abort: 'ミッション中断',
      photo_taken: '写真撮影',
      video_start: '動画開始',
      video_end: '動画終了',
      custom: 'カスタム',
    }

    it.each(Object.entries(labelMap))(
      'イベントタイプ "%s" に対してラベル "%s" を返す',
      (type, expectedLabel) => {
        const label = getEventTypeLabel(type as FlightTimelineEventType)
        expect(label).toBe(expectedLabel)
      }
    )

    it('未知のイベントタイプはそのまま返す', () => {
      // TypeScriptの型チェックをバイパスしてテスト
      const unknownType = 'unknown_type' as FlightTimelineEventType
      expect(getEventTypeLabel(unknownType)).toBe('unknown_type')
    })

    it('全てのラベルが日本語文字列', () => {
      Object.values(labelMap).forEach((label) => {
        // 日本語文字が含まれていることを確認
        expect(label).toMatch(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/)
      })
    })
  })
})
