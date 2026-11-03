import { describe, it, expect, beforeEach } from 'vitest'

import { DRIVERS } from '../data/logistics'
import { useSimulation, TICK_INTERVAL_SEC } from '../data/simulation'

// Zustand store のテストは直接 getState/setState を使う
beforeEach(() => {
  useSimulation.getState().reset()
})

describe('buildInitialPositions', () => {
  it('初期状態で6ドライバー全員が positions に含まれる', () => {
    const { positions } = useSimulation.getState()
    expect(positions).toHaveLength(DRIVERS.length)

    // 全ドライバーIDが含まれる
    const ids = positions.map((p) => p.driverId)
    for (const d of DRIVERS) {
      expect(ids).toContain(d.id)
    }
  })
})

describe('tick', () => {
  it('isPlaying=true で elapsedSeconds が増加する', () => {
    useSimulation.getState().play()
    useSimulation.getState().tick()

    const { elapsedSeconds } = useSimulation.getState()
    expect(elapsedSeconds).toBeGreaterThan(0)
  })

  it('isPlaying=false では elapsedSeconds が変化しない', () => {
    // デフォルトは isPlaying=false
    useSimulation.getState().tick()

    const { elapsedSeconds } = useSimulation.getState()
    expect(elapsedSeconds).toBe(0)
  })

  it('moving ドライバーの routeProgress が進む', () => {
    const initialPositions = useSimulation.getState().positions
    const movingDriver = initialPositions.find((p) => p.status === 'moving')
    // テストデータに moving ドライバーが存在することを確認
    expect(movingDriver).toBeDefined()

    const initialProgress = movingDriver!.routeProgress

    useSimulation.getState().play()
    useSimulation.getState().tick()

    const updatedPositions = useSimulation.getState().positions
    const updatedDriver = updatedPositions.find(
      (p) => p.driverId === movingDriver!.driverId
    )

    expect(updatedDriver!.routeProgress).toBeGreaterThan(initialProgress)
  })

  it('routeProgress >= 1 で delivering に遷移する', () => {
    // moving ドライバーを routeProgress を 1 直前まで進めてから tick
    const positions = useSimulation.getState().positions
    const movingDriver = positions.find((p) => p.status === 'moving')
    expect(movingDriver).toBeDefined()

    // routeProgress を 0.999 にセット（次の tick で 1 を超える）
    const tweakedPositions = positions.map((p) =>
      p.driverId === movingDriver!.driverId ? { ...p, routeProgress: 0.999 } : p
    )
    useSimulation.setState({ positions: tweakedPositions })

    useSimulation.getState().play()
    useSimulation.getState().tick()

    const updatedPositions = useSimulation.getState().positions
    const updatedDriver = updatedPositions.find(
      (p) => p.driverId === movingDriver!.driverId
    )

    expect(updatedDriver!.status).toBe('delivering')
    expect(updatedDriver!.routeProgress).toBe(1)
  })

  it('delivering 状態から次のジョブが割り当てられる（ジョブサイクル）', () => {
    // delivering 状態で eta=0 のドライバーを作る → tick で次のジョブへ
    const positions = useSimulation.getState().positions
    const movingDriver = positions.find((p) => p.status === 'moving')
    expect(movingDriver).toBeDefined()

    const tweakedPositions = positions.map((p) =>
      p.driverId === movingDriver!.driverId
        ? {
            ...p,
            status: 'delivering' as const,
            routeProgress: 1,
            eta: 0,
            speed: 0,
          }
        : p
    )
    useSimulation.setState({ positions: tweakedPositions })

    useSimulation.getState().play()
    useSimulation.getState().tick()

    const updatedPositions = useSimulation.getState().positions
    const updatedDriver = updatedPositions.find(
      (p) => p.driverId === movingDriver!.driverId
    )

    // 次のジョブが割り当てられて moving に戻る
    expect(updatedDriver!.status).toBe('moving')
    expect(updatedDriver!.routeProgress).toBe(0)
    expect(updatedDriver!.shipmentId).not.toBeNull()
  })

  it('インシデント発生タイミングで incidents に追加される', () => {
    // INC-001 の occurredAt = 45秒
    // speed=46 のとき dt = 46 * TICK_INTERVAL_SEC(0.5) = 23秒/tick
    // 2tick で 46秒 ≥ 45秒 → インシデント発生
    useSimulation.getState().play()
    useSimulation.setState({ speed: 46 })
    useSimulation.getState().tick()
    useSimulation.getState().tick()

    const { incidents, elapsedSeconds } = useSimulation.getState()
    expect(elapsedSeconds).toBeGreaterThanOrEqual(45)
    expect(incidents.length).toBeGreaterThanOrEqual(1)
    expect(incidents[0].id).toBe('INC-001')
  })

  it('インシデント発生でドライバーが incident ステータスになる', () => {
    // D001の初期progress=0.75 → 残り ROUTE_DURATION*(1-0.75)=30秒で到着してしまう
    // INC-001 の occurredAt=45秒より先に到着しないよう progress を 0.1 に低下
    // speed=46: dt = 46 * TICK_INTERVAL_SEC(0.5) = 23秒/tick → 2tick で 46秒
    const positions = useSimulation
      .getState()
      .positions.map((p) =>
        p.driverId === 'D001' ? { ...p, routeProgress: 0.1 } : p
      )
    useSimulation.setState({ positions })
    useSimulation.getState().play()
    useSimulation.setState({ speed: 46 })
    useSimulation.getState().tick()
    useSimulation.getState().tick()

    const result = useSimulation.getState().positions
    const d001 = result.find((p) => p.driverId === 'D001')

    expect(d001!.status).toBe('incident')
    expect(d001!.speed).toBe(0)
  })
})

describe('resolveIncident', () => {
  it('resolved=true になり、ドライバーが moving に戻る', () => {
    // D001のprogressを低くしてインシデント前に到着しないようにする
    const positions = useSimulation
      .getState()
      .positions.map((p) =>
        p.driverId === 'D001' ? { ...p, routeProgress: 0.1 } : p
      )
    useSimulation.setState({ positions })
    useSimulation.getState().play()
    useSimulation.setState({ speed: 46 })
    useSimulation.getState().tick()
    useSimulation.getState().tick()

    const { incidents } = useSimulation.getState()
    expect(incidents.length).toBeGreaterThanOrEqual(1)

    // インシデントを解決
    useSimulation.getState().resolveIncident('INC-001', '迂回ルートに変更')

    const resolved = useSimulation.getState()
    const incident = resolved.incidents.find((i) => i.id === 'INC-001')
    expect(incident!.resolved).toBe(true)
    expect(incident!.resolution).toBe('迂回ルートに変更')

    const d001 = resolved.positions.find((p) => p.driverId === 'D001')
    expect(d001!.status).toBe('moving')
    expect(d001!.speed).toBeGreaterThan(0)
  })
})

describe('reset', () => {
  it('全状態が初期値に戻る', () => {
    // 状態を変更
    useSimulation.getState().play()
    useSimulation.setState({ speed: 50 })
    useSimulation.getState().tick()
    useSimulation.getState().tick()

    // いくつかの状態が変化していることを確認
    const before = useSimulation.getState()
    expect(before.elapsedSeconds).toBeGreaterThan(0)

    // reset 実行
    useSimulation.getState().reset()

    const after = useSimulation.getState()
    expect(after.elapsedSeconds).toBe(0)
    expect(after.isPlaying).toBe(false)
    expect(after.speed).toBe(10)
    expect(after.incidents).toHaveLength(0)
    expect(after.logs).toHaveLength(0)
    expect(after.deliveryCount).toBe(0)
    expect(after.activeIncidentId).toBeNull()
    expect(after.selectedDriverId).toBeNull()
    expect(after.positions).toHaveLength(DRIVERS.length)
  })
})

describe('speed', () => {
  it('speed=10 で tick すると dt = speed * TICK_INTERVAL_SEC 秒進む', () => {
    useSimulation.getState().play()
    useSimulation.getState().setSpeed(10)
    useSimulation.getState().tick()

    const { elapsedSeconds } = useSimulation.getState()
    // dt = 10 * TICK_INTERVAL_SEC(0.5) = 5秒/tick
    expect(elapsedSeconds).toBe(10 * TICK_INTERVAL_SEC)
  })

  it('speed=10 で routeProgress が speed=1 の10倍進む', () => {
    // speed=1 で1回 tick: dt = 1 * TICK_INTERVAL_SEC(0.5) = 0.5秒
    useSimulation.getState().play()
    useSimulation.getState().setSpeed(1)
    useSimulation.getState().tick()
    const slow = useSimulation
      .getState()
      .positions.find((p) => p.status === 'moving')
    const slowProgress = slow!.routeProgress

    // リセットして speed=10 で1回 tick
    useSimulation.getState().reset()
    const initialProgress = useSimulation
      .getState()
      .positions.find((p) => p.status === 'moving')!.routeProgress

    useSimulation.getState().play()
    useSimulation.getState().setSpeed(10)
    useSimulation.getState().tick()

    const fast = useSimulation
      .getState()
      .positions.find((p) => p.status === 'moving' || p.status === 'delivering')
    const fastDelta = fast!.routeProgress - initialProgress
    const slowDelta = slowProgress - initialProgress

    // speed=10 は speed=1 の約10倍進む（delivering遷移の場合は1で打ち止め）
    if (fast!.routeProgress < 1) {
      expect(fastDelta / slowDelta).toBeCloseTo(10, 0)
    } else {
      // delivering に遷移した場合は routeProgress=1
      expect(fast!.routeProgress).toBe(1)
    }
  })
})

describe('複数ドライバー独立走行', () => {
  it('tick で複数の moving ドライバーの eta が独立して減少する', () => {
    const movingBefore = useSimulation
      .getState()
      .positions.filter((p) => p.status === 'moving' && p.eta !== null)
    expect(movingBefore.length).toBeGreaterThanOrEqual(2)

    const etaBefore = new Map(movingBefore.map((p) => [p.driverId, p.eta!]))

    useSimulation.getState().play()
    useSimulation.getState().tick()

    const after = useSimulation.getState().positions
    let changedCount = 0
    for (const [driverId, oldEta] of etaBefore) {
      const updated = after.find((p) => p.driverId === driverId)!
      // eta が減少しているか、ステータスが変わっている（独立して動作した証拠）
      if (
        (updated.eta !== null && updated.eta !== oldEta) ||
        updated.status !== 'moving'
      ) {
        changedCount++
      }
    }
    // 少なくとも2人以上のドライバーが独立して変化
    expect(changedCount).toBeGreaterThanOrEqual(2)
  })
})

describe('delivering → 次ジョブ割当で routeProgress リセット', () => {
  it('delivering 完了後に routeProgress が0にリセットされる', () => {
    // delivering 状態で eta=0 のドライバーを作る
    const positions = useSimulation.getState().positions
    const movingDriver = positions.find((p) => p.status === 'moving')
    expect(movingDriver).toBeDefined()

    const tweaked = positions.map((p) =>
      p.driverId === movingDriver!.driverId
        ? {
            ...p,
            status: 'delivering' as const,
            routeProgress: 1,
            eta: 0,
            speed: 0,
          }
        : p
    )
    useSimulation.setState({ positions: tweaked })

    useSimulation.getState().play()
    useSimulation.getState().tick()

    const updated = useSimulation
      .getState()
      .positions.find((p) => p.driverId === movingDriver!.driverId)
    expect(updated!.status).toBe('moving')
    expect(updated!.routeProgress).toBe(0)
  })
})

describe('非走行ステータスの不動', () => {
  it('idle ドライバーは tick で位置が変わらない', () => {
    const idleDriver = useSimulation
      .getState()
      .positions.find((p) => p.status === 'idle')
    expect(idleDriver).toBeDefined()

    const posBefore = { ...idleDriver!.position }
    const progressBefore = idleDriver!.routeProgress

    useSimulation.getState().play()
    useSimulation.getState().tick()
    useSimulation.getState().tick()

    const updated = useSimulation
      .getState()
      .positions.find((p) => p.driverId === idleDriver!.driverId)
    expect(updated!.position.lat).toBe(posBefore.lat)
    expect(updated!.position.lng).toBe(posBefore.lng)
    expect(updated!.routeProgress).toBe(progressBefore)
  })

  it('break ドライバーは tick で位置が変わらない', () => {
    const breakDriver = useSimulation
      .getState()
      .positions.find((p) => p.status === 'break')
    expect(breakDriver).toBeDefined()

    const posBefore = { ...breakDriver!.position }

    useSimulation.getState().play()
    useSimulation.getState().tick()

    const updated = useSimulation
      .getState()
      .positions.find((p) => p.driverId === breakDriver!.driverId)
    expect(updated!.position.lat).toBe(posBefore.lat)
    expect(updated!.position.lng).toBe(posBefore.lng)
  })

  it('off_duty ドライバーは tick で位置が変わらない', () => {
    const offDutyDriver = useSimulation
      .getState()
      .positions.find((p) => p.status === 'off_duty')
    expect(offDutyDriver).toBeDefined()

    const posBefore = { ...offDutyDriver!.position }

    useSimulation.getState().play()
    useSimulation.getState().tick()

    const updated = useSimulation
      .getState()
      .positions.find((p) => p.driverId === offDutyDriver!.driverId)
    expect(updated!.position.lat).toBe(posBefore.lat)
    expect(updated!.position.lng).toBe(posBefore.lng)
  })
})

describe('toggleLog', () => {
  it('toggleLog が showLog を切り替える', () => {
    expect(useSimulation.getState().showLog).toBe(false)

    useSimulation.getState().toggleLog()
    expect(useSimulation.getState().showLog).toBe(true)

    useSimulation.getState().toggleLog()
    expect(useSimulation.getState().showLog).toBe(false)
  })
})

describe('ETA', () => {
  it('moving ドライバーの eta が null でない', () => {
    // ルート付き（shipment 割当済み）の moving ドライバーで検証
    const { positions } = useSimulation.getState()
    const movingWithRoute = positions.filter(
      (p) => p.status === 'moving' && p.route.length >= 2
    )

    expect(movingWithRoute.length).toBeGreaterThan(0)
    for (const d of movingWithRoute) {
      expect(d.eta).not.toBeNull()
      expect(d.eta).toBeGreaterThan(0)
    }
  })

  it('tick 後も moving ドライバーの eta が更新される', () => {
    useSimulation.getState().play()
    useSimulation.getState().tick()

    const { positions } = useSimulation.getState()
    const movingWithRoute = positions.filter(
      (p) => p.status === 'moving' && p.route.length >= 2
    )

    for (const d of movingWithRoute) {
      expect(d.eta).not.toBeNull()
      expect(typeof d.eta).toBe('number')
    }
  })
})
