/**
 * 座標パーサーユーティリティ
 * KML、GeoJSON、CSV、DMS、度分、10進度などの形式をパース
 */

// 座標データの型定義
export interface CoordinateData {
  latitude: number
  longitude: number
  name?: string
  type?: string
  order?: number
}

export type CoordinateFormat =
  | 'kml'
  | 'geojson'
  | 'csv'
  | 'dms' // 度分秒
  | 'dm' // 度分
  | 'decimal' // 10進度
  | 'unknown'

export interface ParseResult {
  success: boolean
  coordinates: CoordinateData[]
  format: CoordinateFormat
  errors: string[]
  warnings: string[]
}

/**
 * DMS形式（度分秒）を10進度に変換
 * 例: 35°40'48"N, 139°45'03"E
 */
const parseDMS = (dmsString: string): { lat: number; lng: number } | null => {
  // パターン1: 35°40'48"N 139°45'03"E
  const pattern1 =
    /(\d+)[°]\s*(\d+)['\u2032]\s*(\d+(?:\.\d+)?)["\u2033]\s*([NS])\s*[,]?\s*(\d+)[°]\s*(\d+)['\u2032]\s*(\d+(?:\.\d+)?)["\u2033]\s*([EW])/i

  // パターン2: N35°40'48" E139°45'03"
  const pattern2 =
    /([NS])\s*(\d+)[°]\s*(\d+)['\u2032]\s*(\d+(?:\.\d+)?)["\u2033]\s*[,]?\s*([EW])\s*(\d+)[°]\s*(\d+)['\u2032]\s*(\d+(?:\.\d+)?)["\u2033]/i

  let match = dmsString.match(pattern1)
  if (match) {
    const latDeg = parseFloat(match[1])
    const latMin = parseFloat(match[2])
    const latSec = parseFloat(match[3])
    const latDir = match[4].toUpperCase()
    const lngDeg = parseFloat(match[5])
    const lngMin = parseFloat(match[6])
    const lngSec = parseFloat(match[7])
    const lngDir = match[8].toUpperCase()

    let lat = latDeg + latMin / 60 + latSec / 3600
    let lng = lngDeg + lngMin / 60 + lngSec / 3600

    if (latDir === 'S') lat = -lat
    if (lngDir === 'W') lng = -lng

    return { lat, lng }
  }

  match = dmsString.match(pattern2)
  if (match) {
    const latDir = match[1].toUpperCase()
    const latDeg = parseFloat(match[2])
    const latMin = parseFloat(match[3])
    const latSec = parseFloat(match[4])
    const lngDir = match[5].toUpperCase()
    const lngDeg = parseFloat(match[6])
    const lngMin = parseFloat(match[7])
    const lngSec = parseFloat(match[8])

    let lat = latDeg + latMin / 60 + latSec / 3600
    let lng = lngDeg + lngMin / 60 + lngSec / 3600

    if (latDir === 'S') lat = -lat
    if (lngDir === 'W') lng = -lng

    return { lat, lng }
  }

  return null
}

/**
 * 度分形式を10進度に変換
 * 例: 35°40.8'N, 139°45.05'E
 */
const parseDM = (dmString: string): { lat: number; lng: number } | null => {
  const pattern1 =
    /(\d+)[°]\s*(\d+(?:\.\d+)?)['\u2032]\s*([NS])\s*[,]?\s*(\d+)[°]\s*(\d+(?:\.\d+)?)['\u2032]\s*([EW])/i

  const pattern2 =
    /([NS])\s*(\d+)[°]\s*(\d+(?:\.\d+)?)['\u2032]\s*[,]?\s*([EW])\s*(\d+)[°]\s*(\d+(?:\.\d+)?)['\u2032]/i

  let match = dmString.match(pattern1)
  if (match) {
    const latDeg = parseFloat(match[1])
    const latMin = parseFloat(match[2])
    const latDir = match[3].toUpperCase()
    const lngDeg = parseFloat(match[4])
    const lngMin = parseFloat(match[5])
    const lngDir = match[6].toUpperCase()

    let lat = latDeg + latMin / 60
    let lng = lngDeg + lngMin / 60

    if (latDir === 'S') lat = -lat
    if (lngDir === 'W') lng = -lng

    return { lat, lng }
  }

  match = dmString.match(pattern2)
  if (match) {
    const latDir = match[1].toUpperCase()
    const latDeg = parseFloat(match[2])
    const latMin = parseFloat(match[3])
    const lngDir = match[4].toUpperCase()
    const lngDeg = parseFloat(match[5])
    const lngMin = parseFloat(match[6])

    let lat = latDeg + latMin / 60
    let lng = lngDeg + lngMin / 60

    if (latDir === 'S') lat = -lat
    if (lngDir === 'W') lng = -lng

    return { lat, lng }
  }

  return null
}

/**
 * KML形式のパース
 */
const parseKML = (text: string): ParseResult => {
  const coordinates: CoordinateData[] = []
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const coordsMatch = text.match(/<coordinates>([\s\S]*?)<\/coordinates>/gi)

    if (!coordsMatch || coordsMatch.length === 0) {
      errors.push('KML形式: <coordinates>タグが見つかりません')
      return {
        success: false,
        coordinates: [],
        format: 'kml',
        errors,
        warnings,
      }
    }

    let order = 0
    coordsMatch.forEach((coordTag) => {
      const coordData = coordTag.replace(/<\/?coordinates>/gi, '').trim()
      const lines = coordData.split(/[\n\r]+/).filter((line) => line.trim())

      lines.forEach((line, lineIndex) => {
        const parts = line.trim().split(/[\s,]+/)

        if (parts.length >= 2) {
          const lng = parseFloat(parts[0])
          const lat = parseFloat(parts[1])

          if (!isNaN(lat) && !isNaN(lng)) {
            coordinates.push({
              latitude: lat,
              longitude: lng,
              name: `KML座標 ${order + 1}`,
              type: 'vertex',
              order: order++,
            })
          } else {
            errors.push(`行 ${lineIndex + 1}: 無効な座標値`)
          }
        }
      })
    })

    if (coordinates.length === 0) {
      errors.push('有効な座標が見つかりませんでした')
      return {
        success: false,
        coordinates: [],
        format: 'kml',
        errors,
        warnings,
      }
    }

    return { success: true, coordinates, format: 'kml', errors, warnings }
  } catch (error) {
    errors.push(`KMLパースエラー: ${error}`)
    return { success: false, coordinates: [], format: 'kml', errors, warnings }
  }
}

/**
 * GeoJSON形式のパース
 */
const parseGeoJSON = (text: string): ParseResult => {
  const coordinates: CoordinateData[] = []
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const geojson = JSON.parse(text)

    if (!geojson.type) {
      errors.push('GeoJSON形式: type プロパティが見つかりません')
      return {
        success: false,
        coordinates: [],
        format: 'geojson',
        errors,
        warnings,
      }
    }

    let order = 0
    const extractCoordinates = (coords: unknown): void => {
      if (Array.isArray(coords)) {
        if (
          coords.length >= 2 &&
          typeof coords[0] === 'number' &&
          typeof coords[1] === 'number'
        ) {
          const lng = coords[0]
          const lat = coords[1]
          coordinates.push({
            latitude: lat,
            longitude: lng,
            name: `GeoJSON座標 ${order + 1}`,
            type: 'vertex',
            order: order++,
          })
        } else {
          coords.forEach((item) => extractCoordinates(item))
        }
      }
    }

    if (geojson.type === 'FeatureCollection') {
      geojson.features?.forEach(
        (feature: { geometry?: { coordinates?: unknown } }) => {
          if (feature.geometry?.coordinates) {
            extractCoordinates(feature.geometry.coordinates)
          }
        }
      )
    } else if (geojson.type === 'Feature') {
      if (geojson.geometry?.coordinates) {
        extractCoordinates(geojson.geometry.coordinates)
      }
    } else if (geojson.coordinates) {
      extractCoordinates(geojson.coordinates)
    }

    if (coordinates.length === 0) {
      errors.push('有効な座標が見つかりませんでした')
      return {
        success: false,
        coordinates: [],
        format: 'geojson',
        errors,
        warnings,
      }
    }

    return { success: true, coordinates, format: 'geojson', errors, warnings }
  } catch (error) {
    errors.push(`GeoJSONパースエラー: ${error}`)
    return {
      success: false,
      coordinates: [],
      format: 'geojson',
      errors,
      warnings,
    }
  }
}

/**
 * CSV形式のパース
 */
const parseCSV = (text: string): ParseResult => {
  const coordinates: CoordinateData[] = []
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const lines = text.split(/[\n\r]+/).filter((line) => line.trim())

    let startIndex = 0
    const firstLine = lines[0]?.toLowerCase() || ''
    if (
      firstLine.includes('lat') ||
      firstLine.includes('緯度') ||
      firstLine.includes('経度')
    ) {
      startIndex = 1
      warnings.push('1行目をヘッダーとして認識しました')
    }

    lines.slice(startIndex).forEach((line, index) => {
      const parts = line.split(/[,\t]/).map((p) => p.trim())

      if (parts.length >= 2) {
        let name = ''
        let lat: number
        let lng: number

        if (parts.length >= 3 && isNaN(parseFloat(parts[0]))) {
          name = parts[0]
          lat = parseFloat(parts[1])
          lng = parseFloat(parts[2])
        } else {
          lat = parseFloat(parts[0])
          lng = parseFloat(parts[1])
          name = parts[2] || `CSV座標 ${index + 1}`
        }

        if (!isNaN(lat) && !isNaN(lng)) {
          coordinates.push({
            latitude: lat,
            longitude: lng,
            name: name || `CSV座標 ${index + 1}`,
            type: 'vertex',
            order: index,
          })
        } else {
          errors.push(`行 ${startIndex + index + 1}: 無効な座標値`)
        }
      } else {
        warnings.push(`行 ${startIndex + index + 1}: 列数不足（スキップ）`)
      }
    })

    if (coordinates.length === 0) {
      errors.push('有効な座標が見つかりませんでした')
      return {
        success: false,
        coordinates: [],
        format: 'csv',
        errors,
        warnings,
      }
    }

    return { success: true, coordinates, format: 'csv', errors, warnings }
  } catch (error) {
    errors.push(`CSVパースエラー: ${error}`)
    return { success: false, coordinates: [], format: 'csv', errors, warnings }
  }
}

/**
 * DMS/度分形式のパース
 */
const parseDMSFormat = (text: string): ParseResult => {
  const coordinates: CoordinateData[] = []
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const lines = text.split(/[\n\r]+/).filter((line) => line.trim())

    lines.forEach((line, index) => {
      let result = parseDMS(line)
      let formatType: 'dms' | 'dm' = 'dms'

      if (!result) {
        result = parseDM(line)
        formatType = 'dm'
      }

      if (result) {
        coordinates.push({
          latitude: result.lat,
          longitude: result.lng,
          name: `${formatType === 'dms' ? '度分秒' : '度分'}座標 ${index + 1}`,
          type: 'vertex',
          order: index,
        })
      } else {
        errors.push(`行 ${index + 1}: 座標形式を認識できません`)
      }
    })

    if (coordinates.length === 0) {
      errors.push('有効な座標が見つかりませんでした')
      return {
        success: false,
        coordinates: [],
        format: 'dms',
        errors,
        warnings,
      }
    }

    return {
      success: true,
      coordinates,
      format: coordinates.length > 0 ? 'dms' : 'unknown',
      errors,
      warnings,
    }
  } catch (error) {
    errors.push(`DMS/度分パースエラー: ${error}`)
    return { success: false, coordinates: [], format: 'dms', errors, warnings }
  }
}

/**
 * 10進度形式のパース
 */
const parseDecimal = (text: string): ParseResult => {
  const coordinates: CoordinateData[] = []
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const lines = text.split(/[\n\r]+/).filter((line) => line.trim())

    lines.forEach((line, index) => {
      const parts = line.split(/[,\s\t]+/).filter((p) => p.trim())

      if (parts.length >= 2) {
        const lat = parseFloat(parts[0])
        const lng = parseFloat(parts[1])
        const name = parts[2] || `10進度座標 ${index + 1}`

        if (!isNaN(lat) && !isNaN(lng)) {
          // 有効な座標範囲チェック（-90〜90, -180〜180）
          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            coordinates.push({
              latitude: lat,
              longitude: lng,
              name,
              type: 'vertex',
              order: index,
            })
          } else {
            warnings.push(
              `行 ${index + 1}: 座標が有効範囲外です（lat: ${lat}, lng: ${lng}）`
            )
          }
        } else {
          errors.push(`行 ${index + 1}: 無効な数値`)
        }
      } else {
        warnings.push(`行 ${index + 1}: 列数不足（スキップ）`)
      }
    })

    if (coordinates.length === 0) {
      errors.push('有効な座標が見つかりませんでした')
      return {
        success: false,
        coordinates: [],
        format: 'decimal',
        errors,
        warnings,
      }
    }

    return { success: true, coordinates, format: 'decimal', errors, warnings }
  } catch (error) {
    errors.push(`10進度パースエラー: ${error}`)
    return {
      success: false,
      coordinates: [],
      format: 'decimal',
      errors,
      warnings,
    }
  }
}

/**
 * テキスト形式を自動検出してパース
 */
export const parseCoordinateText = (text: string): ParseResult => {
  if (!text.trim()) {
    return {
      success: false,
      coordinates: [],
      format: 'unknown',
      errors: ['テキストが空です'],
      warnings: [],
    }
  }

  // KML形式の検出
  if (text.includes('<coordinates>') || text.includes('<?xml')) {
    return parseKML(text)
  }

  // GeoJSON形式の検出
  if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
    const result = parseGeoJSON(text)
    if (result.success) return result
  }

  // DMS/度分形式の検出（°記号を含む）
  if (
    text.includes('°') ||
    text.includes('\u2032') ||
    text.includes('\u2033')
  ) {
    const result = parseDMSFormat(text)
    if (result.success) return result
  }

  // CSV形式の検出（カンマ区切り）
  if (text.includes(',')) {
    const result = parseCSV(text)
    if (result.success) return result
  }

  // 10進度形式（最後の手段）
  const result = parseDecimal(text)
  if (result.success) return result

  return {
    success: false,
    coordinates: [],
    format: 'unknown',
    errors: ['座標形式を認識できませんでした'],
    warnings: [
      '対応形式: KML, GeoJSON, CSV, DMS, 度分, 10進度',
      '例: 35.6812, 139.7671',
    ],
  }
}

/**
 * フォーマット名を日本語で取得
 */
export const getFormatName = (format: CoordinateFormat): string => {
  const formatNames: Record<CoordinateFormat, string> = {
    kml: 'KML',
    geojson: 'GeoJSON',
    csv: 'CSV',
    dms: '度分秒（DMS）',
    dm: '度分',
    decimal: '10進度',
    unknown: '不明',
  }
  return formatNames[format]
}
