/**
 * 地理計算ユーティリティ
 * 距離計算や座標変換など、UTMで使用する地理計算関数群
 */

/** 地球の半径（メートル） */
export const EARTH_RADIUS_METERS = 6_371_000

/** 度数からラジアンへの変換係数 */
export const DEG_TO_RAD = Math.PI / 180

/** ラジアンから度数への変換係数 */
export const RAD_TO_DEG = 180 / Math.PI

/**
 * 度数をラジアンに変換
 * @param degrees - 度数
 * @returns ラジアン
 */
export const toRadians = (degrees: number): number => {
  return degrees * DEG_TO_RAD
}

/**
 * ラジアンを度数に変換
 * @param radians - ラジアン
 * @returns 度数
 */
export const toDegrees = (radians: number): number => {
  return radians * RAD_TO_DEG
}

/**
 * 2点間の距離をハーバーサイン公式で計算
 * @param lat1 - 始点の緯度
 * @param lon1 - 始点の経度
 * @param lat2 - 終点の緯度
 * @param lon2 - 終点の経度
 * @returns 距離（メートル）
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_METERS * c
}

/**
 * 距離を適切な単位でフォーマット
 * @param meters - 距離（メートル）
 * @returns フォーマット済みの距離文字列
 */
export const formatDistance = (meters: number | null | undefined): string => {
  if (meters === null || meters === undefined) {
    return '-'
  }

  if (meters < 1) {
    return '0m'
  }

  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }

  return `${(meters / 1000).toFixed(1)}km`
}

/**
 * 複数のウェイポイント間の総距離を計算
 * @param waypoints - 座標を持つウェイポイントの配列
 * @returns 総距離（メートル）
 */
export const calculateTotalDistance = (
  waypoints: Array<{ latitude: number; longitude: number }>
): number => {
  if (waypoints.length < 2) return 0

  let totalDistance = 0
  for (let i = 1; i < waypoints.length; i++) {
    totalDistance += calculateDistance(
      waypoints[i - 1].latitude,
      waypoints[i - 1].longitude,
      waypoints[i].latitude,
      waypoints[i].longitude
    )
  }

  return totalDistance
}

/**
 * 飛行予定時間を計算
 * @param waypoints - ウェイポイントの配列
 * @param defaultSpeed - デフォルトの飛行速度（m/s）
 * @returns 予定時間（秒）
 */
export const calculateEstimatedDuration = (
  waypoints: Array<{
    latitude: number
    longitude: number
    speed?: number
    hoverDuration?: number
  }>,
  defaultSpeed: number
): number => {
  if (waypoints.length < 2) return 0

  let totalDuration = 0
  for (let i = 1; i < waypoints.length; i++) {
    const distance = calculateDistance(
      waypoints[i - 1].latitude,
      waypoints[i - 1].longitude,
      waypoints[i].latitude,
      waypoints[i].longitude
    )
    const speed = waypoints[i].speed || defaultSpeed
    totalDuration += distance / speed

    // ホバリング時間を加算
    const hoverDuration = waypoints[i].hoverDuration
    if (hoverDuration) {
      totalDuration += hoverDuration
    }
  }

  return Math.ceil(totalDuration)
}

/**
 * 2点間の方位角を計算
 * @param lat1 - 始点の緯度
 * @param lon1 - 始点の経度
 * @param lat2 - 終点の緯度
 * @param lon2 - 終点の経度
 * @returns 方位角（度、北を0度として時計回り）
 */
export const calculateBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLon = toRadians(lon2 - lon1)
  const lat1Rad = toRadians(lat1)
  const lat2Rad = toRadians(lat2)

  const y = Math.sin(dLon) * Math.cos(lat2Rad)
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon)

  let bearing = toDegrees(Math.atan2(y, x))
  bearing = (bearing + 360) % 360

  return bearing
}

/**
 * 方位角を8方位でフォーマット
 * @param bearing - 方位角（度）
 * @returns 8方位の文字列
 */
export const formatBearing = (bearing: number): string => {
  const directions = ['北', '北東', '東', '南東', '南', '南西', '西', '北西']
  const index = Math.round(bearing / 45) % 8
  return directions[index]
}

/**
 * 座標が指定された範囲内にあるかチェック
 * @param lat - チェック対象の緯度
 * @param lon - チェック対象の経度
 * @param centerLat - 中心の緯度
 * @param centerLon - 中心の経度
 * @param radiusMeters - 半径（メートル）
 * @returns 範囲内であればtrue
 */
export const isWithinRadius = (
  lat: number,
  lon: number,
  centerLat: number,
  centerLon: number,
  radiusMeters: number
): boolean => {
  const distance = calculateDistance(lat, lon, centerLat, centerLon)
  return distance <= radiusMeters
}
