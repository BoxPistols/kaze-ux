/**
 * Geographic Utility Functions
 */

// ============================================
// Coordinate Types
// ============================================

/** GeoJSON形式の座標 [lng, lat] */
export type LngLat = [number, number]

/** 高度付きGeoJSON形式の座標 [lng, lat, altitude] */
export type LngLatAlt = [number, number, number]

/** オブジェクト形式の座標 */
export interface CoordinateObject {
  latitude: number
  longitude: number
  altitude?: number
}

/** GeoJSONポリゴン座標（外部リング + オプショナルな穴） */
export type PolygonCoordinates = LngLat[][] | LngLatAlt[][]

// ============================================
// Coordinate Conversion Functions
// ============================================

/**
 * オブジェクト形式からGeoJSON形式に変換
 */
export function toGeoJSONCoord(coord: CoordinateObject): LngLat {
  return [coord.longitude, coord.latitude]
}

/**
 * オブジェクト形式からGeoJSON形式（高度付き）に変換
 */
export function toGeoJSONCoordWithAltitude(coord: CoordinateObject): LngLatAlt {
  return [coord.longitude, coord.latitude, coord.altitude ?? 0]
}

/**
 * GeoJSON形式からオブジェクト形式に変換
 */
export function fromGeoJSONCoord(coord: LngLat | LngLatAlt): CoordinateObject {
  return {
    longitude: coord[0],
    latitude: coord[1],
    altitude: coord.length > 2 ? (coord as LngLatAlt)[2] : undefined,
  }
}

/**
 * 座標配列をGeoJSONポリゴン形式に変換（閉じたリングを保証）
 */
export function toPolygonCoordinates(
  coords: CoordinateObject[]
): PolygonCoordinates {
  if (coords.length === 0) return [[]]

  const ring: LngLat[] = coords.map((c) => toGeoJSONCoord(c))

  // 最初と最後が同じでなければ閉じる
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([first[0], first[1]])
  }

  return [ring]
}

/**
 * GeoJSONポリゴン座標からオブジェクト配列に変換（閉包を除外）
 */
export function fromPolygonCoordinates(
  coordinates: PolygonCoordinates
): CoordinateObject[] {
  if (!coordinates || coordinates.length === 0 || coordinates[0].length === 0) {
    return []
  }

  const ring = coordinates[0] as (LngLat | LngLatAlt)[]
  let coords = ring.map((c) => fromGeoJSONCoord(c))

  // 閉じたリングの場合、最後の頂点を除外
  if (coords.length > 1) {
    const first = coords[0]
    const last = coords[coords.length - 1]
    if (
      first.longitude === last.longitude &&
      first.latitude === last.latitude
    ) {
      coords = coords.slice(0, -1)
    }
  }

  return coords
}

/**
 * 2D座標配列を3D座標配列に変換（デフォルト高度を追加）
 */
export function to3DCoordinates(
  coords: LngLat[],
  defaultAltitude: number = 0
): LngLatAlt[] {
  return coords.map((c) => [c[0], c[1], defaultAltitude])
}

/**
 * 3D座標配列を2D座標配列に変換（高度を除外）
 */
export function to2DCoordinates(coords: LngLatAlt[]): LngLat[] {
  return coords.map((c) => [c[0], c[1]])
}

/**
 * 座標が有効かどうかをチェック
 */
export function isValidCoordinate(coord: CoordinateObject): boolean {
  return (
    typeof coord.latitude === 'number' &&
    typeof coord.longitude === 'number' &&
    !isNaN(coord.latitude) &&
    !isNaN(coord.longitude) &&
    coord.latitude >= -90 &&
    coord.latitude <= 90 &&
    coord.longitude >= -180 &&
    coord.longitude <= 180
  )
}

/**
 * ポリゴン座標が有効かどうかをチェック（最低3頂点）
 */
export function isValidPolygon(coordinates: PolygonCoordinates): boolean {
  if (!coordinates || coordinates.length === 0) return false
  const ring = coordinates[0]
  if (!ring || ring.length < 4) return false // 閉じたポリゴンは最低4点（3頂点+閉包）

  return ring.every(
    (coord) =>
      Array.isArray(coord) &&
      coord.length >= 2 &&
      typeof coord[0] === 'number' &&
      typeof coord[1] === 'number'
  )
}

/**
 * Calculate bounding box from GeoJSON geometry
 */
export function calculateBBox(
  geometry: GeoJSON.Geometry
): [number, number, number, number] {
  let minLng = 180
  let minLat = 90
  let maxLng = -180
  let maxLat = -90

  const processCoord = (coord: readonly unknown[]) => {
    const lng = coord[0]
    const lat = coord[1]
    if (typeof lng !== 'number' || typeof lat !== 'number') return
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }

  const traverse = (coords: unknown): void => {
    if (!Array.isArray(coords) || coords.length === 0) return
    const first = coords[0]
    if (typeof first === 'number') {
      processCoord(coords)
      return
    }
    for (const child of coords) traverse(child)
  }

  if ('coordinates' in geometry) {
    traverse(geometry.coordinates)
  }

  return [minLng, minLat, maxLng, maxLat]
}

/**
 * Check if two bounding boxes intersect
 */
export function bboxesIntersect(
  bbox1: [[number, number], [number, number]],
  bbox2: [[number, number], [number, number]]
): boolean {
  const [min1, max1] = bbox1
  const [min2, max2] = bbox2
  const [minLng1, minLat1] = min1
  const [maxLng1, maxLat1] = max1
  const [minLng2, minLat2] = min2
  const [maxLng2, maxLat2] = max2

  if (
    maxLng1 < minLng2 ||
    maxLng2 < minLng1 ||
    maxLat1 < minLat2 ||
    maxLat2 < minLat1
  ) {
    return false
  }

  return true
}

/**
 * Calculate distance between two points (Haversine formula)
 * @returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Create a circle polygon around a point
 */
export function createCirclePolygon(
  center: [number, number],
  radiusKm: number,
  points: number = 32
): GeoJSON.Polygon {
  const coords: [number, number][] = []
  const [lng, lat] = center

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 360
    const point = destinationPoint(lat, lng, radiusKm, angle)
    coords.push([point[1], point[0]])
  }

  return {
    type: 'Polygon',
    coordinates: [coords],
  }
}

function destinationPoint(
  lat: number,
  lng: number,
  distanceKm: number,
  bearing: number
): [number, number] {
  const R = 6371
  const d = distanceKm / R
  const brng = toRad(bearing)
  const lat1 = toRad(lat)
  const lng1 = toRad(lng)

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  )

  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    )

  return [toDeg(lat2), toDeg(lng2)]
}

function toDeg(rad: number): number {
  return rad * (180 / Math.PI)
}

/**
 * Check if a point is inside a polygon
 */
export function pointInPolygon(
  point: [number, number],
  polygon: [number, number][]
): boolean {
  const [x, y] = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }

  return inside
}

/**
 * Merge multiple bounding boxes into one
 */
export function mergeBBoxes(
  bboxes: [number, number, number, number][]
): [number, number, number, number] {
  if (bboxes.length === 0) {
    return [0, 0, 0, 0]
  }

  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity

  for (const [bMinLng, bMinLat, bMaxLng, bMaxLat] of bboxes) {
    if (bMinLng < minLng) minLng = bMinLng
    if (bMinLat < minLat) minLat = bMinLat
    if (bMaxLng > maxLng) maxLng = bMaxLng
    if (bMaxLat > maxLat) maxLat = bMaxLat
  }

  return [minLng, minLat, maxLng, maxLat]
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lng: number, lat: number): string {
  const lngDir = lng >= 0 ? 'E' : 'W'
  const latDir = lat >= 0 ? 'N' : 'S'
  return `${Math.abs(lat).toFixed(6)}${latDir}, ${Math.abs(lng).toFixed(6)}${lngDir}`
}

/**
 * Convert decimal degrees to degrees, minutes, seconds format (DMS)
 */
export const convertDecimalToDMS = (
  decimal: number,
  isLat: boolean,
  locale: 'en' | 'ja' = 'en'
): string => {
  const abs = Math.abs(decimal)
  let degrees = Math.floor(abs)
  let minutes = Math.floor((abs - degrees) * 60)
  let seconds = ((abs - degrees) * 60 - minutes) * 60

  if (parseFloat(seconds.toFixed(2)) >= 60) {
    seconds = 0
    minutes++
    if (minutes >= 60) {
      minutes = 0
      degrees++
    }
  }

  if (locale === 'ja') {
    const direction = isLat
      ? decimal >= 0
        ? '北緯'
        : '南緯'
      : decimal >= 0
        ? '東経'
        : '西経'
    return `${direction}${degrees}${minutes}'${seconds.toFixed(2)}"`
  }

  const direction = isLat
    ? decimal >= 0
      ? 'N'
      : 'S'
    : decimal >= 0
      ? 'E'
      : 'W'
  return `${degrees}${minutes}'${seconds.toFixed(2)}"${direction}`
}

/**
 * Format coordinates in DMS format
 */
export function formatCoordinatesDMS(
  lng: number,
  lat: number,
  options: { locale?: 'en' | 'ja'; separator?: string } = {}
): string {
  const { locale = 'en', separator = ', ' } = options
  const latDMS = convertDecimalToDMS(lat, true, locale)
  const lngDMS = convertDecimalToDMS(lng, false, locale)

  return `${latDMS}${separator}${lngDMS}`
}

/**
 * Convert wind direction in degrees to compass direction
 */
export function degreesToCompass(degrees: number): string {
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ]
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

/**
 * Convert wind direction to Japanese
 */
export function degreesToJapanese(degrees: number): string {
  const directions = [
    '北',
    '北北東',
    '北東',
    '東北東',
    '東',
    '東南東',
    '南東',
    '南南東',
    '南',
    '南南西',
    '南西',
    '西南西',
    '西',
    '西北西',
    '北西',
    '北北西',
  ]
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}
