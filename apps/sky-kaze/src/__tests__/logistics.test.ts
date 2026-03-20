import { describe, it, expect } from 'vitest'

import {
  HUBS,
  findHub,
  searchHubs,
  DRIVERS,
  SHIPMENTS,
  CUSTOMERS,
  STATUS_LABELS,
} from '../data/logistics'
import type { ShipmentStatus } from '../data/logistics'

// ── 拠点（HUBS） ────────────────────────────────────

describe('HUBS', () => {
  it('12拠点全て含まれている', () => {
    expect(HUBS).toHaveLength(12)
  })

  it('全拠点に必須プロパティが存在する', () => {
    for (const hub of HUBS) {
      expect(hub.code).toBeTruthy()
      expect(hub.name).toBeTruthy()
      expect(hub.nameEn).toBeTruthy()
      expect(hub.latitude).toBeTypeOf('number')
      expect(hub.longitude).toBeTypeOf('number')
      expect(['warehouse', 'depot', 'port', 'center']).toContain(hub.type)
      expect(hub.capacity).toBeGreaterThan(0)
      expect(hub.city).toBeTruthy()
    }
  })

  it('拠点コードがユニークである', () => {
    const codes = HUBS.map((h) => h.code)
    expect(new Set(codes).size).toBe(codes.length)
  })
})

// ── findHub ──────────────────────────────────────────

describe('findHub', () => {
  it('存在するコードで正しい Hub を返す', () => {
    const hub = findHub('TKY-C')
    expect(hub).toBeDefined()
    expect(hub!.name).toBe('東京中央物流センター')
    expect(hub!.city).toBe('東京')
  })

  it('別の拠点コードでも正しく返す', () => {
    const hub = findHub('OSK-C')
    expect(hub).toBeDefined()
    expect(hub!.city).toBe('大阪')
  })

  it('存在しないコードで undefined を返す', () => {
    expect(findHub('INVALID')).toBeUndefined()
    expect(findHub('')).toBeUndefined()
  })
})

// ── searchHubs ───────────────────────────────────────

describe('searchHubs', () => {
  it('拠点コードで検索できる', () => {
    const results = searchHubs('TKY')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results.some((h) => h.code === 'TKY-C')).toBe(true)
  })

  it('拠点名（日本語）で検索できる', () => {
    const results = searchHubs('横浜')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results.some((h) => h.code === 'YKH-W')).toBe(true)
  })

  it('都市名で検索できる', () => {
    const results = searchHubs('札幌')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results.some((h) => h.code === 'SPR-W')).toBe(true)
  })

  it('英語名で検索できる', () => {
    const results = searchHubs('Nagoya')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results.some((h) => h.code === 'NGY-C')).toBe(true)
  })

  it('該当なしの場合は空配列を返す', () => {
    const results = searchHubs('存在しない拠点')
    expect(results).toHaveLength(0)
  })
})

// ── ドライバー（DRIVERS） ────────────────────────────

describe('DRIVERS', () => {
  it('6名全て含まれている', () => {
    expect(DRIVERS).toHaveLength(6)
  })

  it('ドライバーIDがユニークである', () => {
    const ids = DRIVERS.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('全ドライバーに必須プロパティが存在する', () => {
    for (const driver of DRIVERS) {
      expect(driver.id).toBeTruthy()
      expect(driver.name).toBeTruthy()
      expect(driver.phone).toBeTruthy()
      expect(driver.vehicle).toBeTruthy()
      expect(driver.licensePlate).toBeTruthy()
      expect(['available', 'on_route', 'break', 'off_duty']).toContain(
        driver.status
      )
      expect(driver.rating).toBeGreaterThanOrEqual(0)
      expect(driver.rating).toBeLessThanOrEqual(5)
    }
  })
})

// ── 配送データ（SHIPMENTS） ──────────────────────────

describe('SHIPMENTS', () => {
  it('10件含まれている', () => {
    expect(SHIPMENTS).toHaveLength(10)
  })

  it('配送IDがユニークである', () => {
    const ids = SHIPMENTS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('全配送に必須プロパティが存在する', () => {
    for (const shipment of SHIPMENTS) {
      expect(shipment.id).toBeTruthy()
      expect(shipment.trackingNo).toBeTruthy()
      expect(shipment.sender).toBeDefined()
      expect(shipment.receiver).toBeDefined()
      expect(shipment.originHub).toBeTruthy()
      expect(shipment.destinationHub).toBeTruthy()
      expect(shipment.weight).toBeGreaterThan(0)
      expect(['standard', 'express', 'same_day']).toContain(shipment.priority)
    }
  })
})

// ── 顧客（CUSTOMERS） ───────────────────────────────

describe('CUSTOMERS', () => {
  it('8件含まれている', () => {
    expect(CUSTOMERS).toHaveLength(8)
  })

  it('顧客IDがユニークである', () => {
    const ids = CUSTOMERS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('全顧客に必須プロパティが存在する', () => {
    for (const customer of CUSTOMERS) {
      expect(customer.id).toBeTruthy()
      expect(customer.name).toBeTruthy()
      expect(customer.company).toBeTruthy()
      expect(customer.email).toContain('@')
      expect(['sender', 'receiver', 'both']).toContain(customer.type)
    }
  })
})

// ── ステータスラベル（STATUS_LABELS） ────────────────

describe('STATUS_LABELS', () => {
  const allStatuses: ShipmentStatus[] = [
    'pending',
    'picked_up',
    'in_transit',
    'at_hub',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ]

  it('全ステータスのラベルが定義されている', () => {
    for (const status of allStatuses) {
      expect(STATUS_LABELS[status]).toBeTruthy()
      expect(typeof STATUS_LABELS[status]).toBe('string')
    }
  })

  it('ステータス数が7つである', () => {
    expect(Object.keys(STATUS_LABELS)).toHaveLength(7)
  })
})
