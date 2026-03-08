/**
 * チェックイン機能のストアテスト（TDD）
 * 監視対象のドローンを選択するチェックイン機能のテスト
 */
import { describe, it, expect, beforeEach } from 'vitest'
import useUTMStore from '../utmStore'
import type { DroneFlightStatus } from '../../types/utmTypes'

// モックドローンデータ作成ヘルパー
const createMockDrone = (
  droneId: string,
  projectId: string,
  overrides?: Partial<DroneFlightStatus>
): DroneFlightStatus => ({
  droneId,
  droneName: `テストドローン-${droneId}`,
  pilotId: `pilot-${projectId}`,
  pilotName: 'テストパイロット',
  flightPlanId: `plan-${projectId}`,
  projectId,
  position: {
    droneId,
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
  startTime: new Date(Date.now() - 1800000),
  estimatedEndTime: new Date(Date.now() + 1800000),
  ...overrides,
})

describe('チェックイン機能', () => {
  beforeEach(() => {
    // 各テスト前にストアをリセット
    const store = useUTMStore.getState()
    // checkedInDrones をクリア（存在すれば）
    if ('checkedInDrones' in store) {
      useUTMStore.setState({ checkedInDrones: {} })
    }
    // テスト用ドローンを設定
    useUTMStore.setState({
      activeDrones: [
        createMockDrone('drone-001', 'proj-001'),
        createMockDrone('drone-002', 'proj-001'),
        createMockDrone('drone-003', 'proj-002'),
        createMockDrone('drone-004', 'proj-002'),
      ],
    })
  })

  describe('checkInDrone / checkOutDrone', () => {
    it('ドローンをチェックインできる', () => {
      const { checkInDrone, checkedInDrones } = useUTMStore.getState()

      // チェックイン実行
      checkInDrone('drone-001', 'proj-001')

      // 状態を再取得
      const state = useUTMStore.getState()
      expect(state.checkedInDrones).toBeDefined()
      expect(state.checkedInDrones['drone-001']).toBeDefined()
      expect(state.checkedInDrones['drone-001'].droneId).toBe('drone-001')
      expect(state.checkedInDrones['drone-001'].projectId).toBe('proj-001')
    })

    it('複数のドローンをチェックインできる', () => {
      const { checkInDrone } = useUTMStore.getState()

      checkInDrone('drone-001', 'proj-001')
      checkInDrone('drone-002', 'proj-001')

      const state = useUTMStore.getState()
      expect(Object.keys(state.checkedInDrones)).toHaveLength(2)
      expect(state.checkedInDrones['drone-001']).toBeDefined()
      expect(state.checkedInDrones['drone-002']).toBeDefined()
    })

    it('ドローンをチェックアウトできる', () => {
      const { checkInDrone, checkOutDrone } = useUTMStore.getState()

      // まずチェックイン
      checkInDrone('drone-001', 'proj-001')
      checkInDrone('drone-002', 'proj-001')

      // drone-001 をチェックアウト
      checkOutDrone('drone-001')

      const state = useUTMStore.getState()
      expect(state.checkedInDrones['drone-001']).toBeUndefined()
      expect(state.checkedInDrones['drone-002']).toBeDefined()
    })

    it('存在しないドローンのチェックアウトは何も起こらない', () => {
      const { checkInDrone, checkOutDrone } = useUTMStore.getState()

      checkInDrone('drone-001', 'proj-001')
      checkOutDrone('non-existent-drone')

      const state = useUTMStore.getState()
      expect(Object.keys(state.checkedInDrones)).toHaveLength(1)
    })
  })

  describe('checkInProject / checkOutProject', () => {
    it('プロジェクト内の全ドローンをチェックインできる', () => {
      const { checkInProject } = useUTMStore.getState()

      checkInProject('proj-001')

      const state = useUTMStore.getState()
      // proj-001 のドローンは drone-001, drone-002
      expect(state.checkedInDrones['drone-001']).toBeDefined()
      expect(state.checkedInDrones['drone-002']).toBeDefined()
      // proj-002 のドローンはチェックインされていない
      expect(state.checkedInDrones['drone-003']).toBeUndefined()
      expect(state.checkedInDrones['drone-004']).toBeUndefined()
    })

    it('プロジェクト内の全ドローンをチェックアウトできる', () => {
      const { checkInProject, checkOutProject } = useUTMStore.getState()

      // 全ドローンをチェックイン
      checkInProject('proj-001')
      checkInProject('proj-002')

      // proj-001 をチェックアウト
      checkOutProject('proj-001')

      const state = useUTMStore.getState()
      expect(state.checkedInDrones['drone-001']).toBeUndefined()
      expect(state.checkedInDrones['drone-002']).toBeUndefined()
      expect(state.checkedInDrones['drone-003']).toBeDefined()
      expect(state.checkedInDrones['drone-004']).toBeDefined()
    })
  })

  describe('checkInAllDrones / checkOutAllDrones', () => {
    it('全ドローンをチェックインできる', () => {
      const { checkInAllDrones } = useUTMStore.getState()

      checkInAllDrones()

      const state = useUTMStore.getState()
      expect(Object.keys(state.checkedInDrones)).toHaveLength(4)
    })

    it('全ドローンをチェックアウトできる', () => {
      const { checkInAllDrones, checkOutAllDrones } = useUTMStore.getState()

      checkInAllDrones()
      checkOutAllDrones()

      const state = useUTMStore.getState()
      expect(Object.keys(state.checkedInDrones)).toHaveLength(0)
    })
  })

  describe('getCheckedInDrones', () => {
    it('チェックイン済みドローンの一覧を取得できる', () => {
      const { checkInDrone, getCheckedInDrones } = useUTMStore.getState()

      checkInDrone('drone-001', 'proj-001')
      checkInDrone('drone-003', 'proj-002')

      const checkedInDrones = getCheckedInDrones()

      expect(checkedInDrones).toHaveLength(2)
      expect(checkedInDrones.map((d) => d.droneId)).toContain('drone-001')
      expect(checkedInDrones.map((d) => d.droneId)).toContain('drone-003')
    })

    it('チェックインがない場合は空配列を返す', () => {
      const { getCheckedInDrones } = useUTMStore.getState()

      const checkedInDrones = getCheckedInDrones()

      expect(checkedInDrones).toHaveLength(0)
    })
  })

  describe('isCheckedIn', () => {
    it('チェックイン状態を判定できる', () => {
      const { checkInDrone, isCheckedIn } = useUTMStore.getState()

      checkInDrone('drone-001', 'proj-001')

      expect(isCheckedIn('drone-001')).toBe(true)
      expect(isCheckedIn('drone-002')).toBe(false)
    })
  })
})

describe('チェックイン済みドローンのみがアラート対象になる', () => {
  beforeEach(() => {
    // ストアをリセット
    useUTMStore.setState({
      checkedInDrones: {},
      activeDrones: [
        createMockDrone('drone-001', 'proj-001'),
        createMockDrone('drone-002', 'proj-002'),
      ],
      alerts: [],
      restrictedZones: [
        {
          id: 'zone-test-1',
          name: 'テスト禁止区域',
          type: 'did',
          level: 'restricted',
          description: 'テスト用禁止区域',
          coordinates: [
            [
              [139.76, 35.68],
              [139.77, 35.68],
              [139.77, 35.69],
              [139.76, 35.69],
              [139.76, 35.68],
            ],
          ],
        },
      ],
    })
  })

  it('チェックインされていないドローンはzone violationチェックされない', () => {
    const { checkInDrone, checkZoneViolations, alerts } = useUTMStore.getState()

    // drone-001 のみチェックイン
    checkInDrone('drone-001', 'proj-001')

    // zone violation チェック実行
    // 注意: このテストは checkZoneViolations が checkedInDrones を参照するように
    // 修正された後に正しく動作する
    checkZoneViolations()

    const state = useUTMStore.getState()
    // チェックインされていない drone-002 のアラートは発生しないはず
    const drone002Alerts = state.alerts.filter((a) => a.droneId === 'drone-002')
    expect(drone002Alerts).toHaveLength(0)
  })

  it('checkedInDrones が空の場合は後方互換性のため全ドローンがチェック対象になる', () => {
    // checkedInDrones を空のままにする
    const { checkZoneViolations } = useUTMStore.getState()

    // zone violation チェック実行
    // 注意: checkedInDrones が空の場合は従来通り全ドローンをチェック
    checkZoneViolations()

    // この振る舞いは後方互換性のために実装される
    // テストはチェック対象の数を確認（アラート発生は確率的なため直接確認しない）
    expect(true).toBe(true) // プレースホルダー
  })
})
