// 座標パーサー ユニットテスト
//
// 形式の自動判別を持つため、判別の分岐と「読めなかったとき何を返すか」を
// 中心に見る。座標は緯度と経度の取り違えが起きやすいので、
// 東京 (35.68, 139.77) のように「明らかに緯度が小さい」値で確かめる。

import { describe, expect, it } from 'vitest'

import { getFormatName, parseCoordinateText } from '../coordinateParser'

describe('parseCoordinateText', () => {
  describe('入力が無い', () => {
    it('空文字は失敗として理由を返す', () => {
      const r = parseCoordinateText('')
      expect(r.success).toBe(false)
      expect(r.format).toBe('unknown')
      expect(r.errors.length).toBeGreaterThan(0)
    })

    it('空白だけでも同じ', () => {
      expect(parseCoordinateText('   \n  ').success).toBe(false)
    })
  })

  describe('10 進度', () => {
    it('緯度・経度の順で読む', () => {
      const r = parseCoordinateText('35.6812, 139.7671')
      expect(r.success).toBe(true)
      expect(r.coordinates).toHaveLength(1)
      expect(r.coordinates[0].latitude).toBeCloseTo(35.6812, 4)
      expect(r.coordinates[0].longitude).toBeCloseTo(139.7671, 4)
    })

    it('複数行を読む', () => {
      const r = parseCoordinateText('35.6812, 139.7671\n34.6937, 135.5023')
      expect(r.success).toBe(true)
      expect(r.coordinates.length).toBeGreaterThanOrEqual(2)
    })

    it('負の値（南緯・西経）を読む', () => {
      const r = parseCoordinateText('-33.8688, 151.2093')
      expect(r.success).toBe(true)
      expect(r.coordinates[0].latitude).toBeLessThan(0)
    })
  })

  describe('DMS（度分秒）', () => {
    it('N/E 表記を 10 進度に直す', () => {
      const r = parseCoordinateText(`35°40'48"N 139°45'03"E`)
      expect(r.success).toBe(true)
      // 35 + 40/60 + 48/3600 = 35.68
      expect(r.coordinates[0].latitude).toBeCloseTo(35.68, 1)
      expect(r.coordinates[0].longitude).toBeCloseTo(139.7508, 2)
    })

    it('S/W は符号を反転する', () => {
      const r = parseCoordinateText(`33°52'07"S 151°12'33"E`)
      expect(r.success).toBe(true)
      expect(r.coordinates[0].latitude).toBeLessThan(0)
      expect(r.coordinates[0].longitude).toBeGreaterThan(0)
    })
  })

  describe('GeoJSON', () => {
    it('Point を読む（GeoJSON は [経度, 緯度] の順）', () => {
      const geo = JSON.stringify({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [139.7671, 35.6812] },
        properties: { name: '東京駅' },
      })
      const r = parseCoordinateText(geo)
      expect(r.success).toBe(true)
      expect(r.format).toBe('geojson')
      // 入れ替えずに読むと緯度 139 になる。ここが最も間違えやすい
      expect(r.coordinates[0].latitude).toBeCloseTo(35.6812, 3)
      expect(r.coordinates[0].longitude).toBeCloseTo(139.7671, 3)
    })

    it('壊れた JSON は他の形式として読み直される（例外で落ちない）', () => {
      const r = parseCoordinateText('{ これは JSON ではない')
      expect(r.success).toBe(false)
      expect(Array.isArray(r.errors)).toBe(true)
    })
  })

  describe('KML', () => {
    it('coordinates 要素を読む（KML も 経度,緯度 の順）', () => {
      const kml = `<?xml version="1.0"?><kml><Placemark><Point>
        <coordinates>139.7671,35.6812,0</coordinates>
      </Point></Placemark></kml>`
      const r = parseCoordinateText(kml)
      expect(r.success).toBe(true)
      expect(r.format).toBe('kml')
      expect(r.coordinates[0].latitude).toBeCloseTo(35.6812, 3)
      expect(r.coordinates[0].longitude).toBeCloseTo(139.7671, 3)
    })
  })

  describe('認識できない入力', () => {
    it('失敗として、対応形式を warnings で案内する', () => {
      const r = parseCoordinateText('これは座標ではありません')
      expect(r.success).toBe(false)
      expect(r.format).toBe('unknown')
      // 「読めない」だけでは次の一手が分からない
      expect(r.warnings.join('')).toMatch(/KML|GeoJSON|CSV/)
    })
  })
})

describe('getFormatName', () => {
  it('形式を日本語名に直す', () => {
    expect(getFormatName('kml')).toBe('KML')
    expect(getFormatName('dms')).toBe('度分秒（DMS）')
    expect(getFormatName('unknown')).toBe('不明')
  })
})
