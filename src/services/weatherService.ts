/**
 * 気象情報サービス
 * OpenWeatherMap APIを使用したリアルタイム気象データ取得
 */

import type { WeatherData, WeatherThresholds } from '@/types/utmTypes'

// デフォルトの気象警告閾値（ドローン飛行向け）
export const DEFAULT_WEATHER_THRESHOLDS: WeatherThresholds = {
  maxWindSpeed: 10, // 10m/s以上で警告
  maxGustSpeed: 15, // 15m/s以上の突風で警告
  minVisibility: 3, // 3km未満で警告
  maxPrecipitation: 2, // 2mm/h以上で警告
}

// 風向を角度から方位に変換
export const getWindDirection = (degrees: number): string => {
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

// 飛行適性を評価
export const evaluateFlightCondition = (
  weather: WeatherData['current'],
  thresholds: WeatherThresholds = DEFAULT_WEATHER_THRESHOLDS
): WeatherData['flightCondition'] => {
  const factors: string[] = []
  let status: WeatherData['flightCondition']['status'] = 'excellent'

  // 風速チェック
  if (weather.windSpeed >= thresholds.maxWindSpeed) {
    factors.push(`強風: ${weather.windSpeed.toFixed(1)}m/s`)
    status =
      weather.windSpeed >= thresholds.maxGustSpeed ? 'dangerous' : 'warning'
  } else if (weather.windSpeed >= thresholds.maxWindSpeed * 0.7) {
    factors.push(`やや強い風: ${weather.windSpeed.toFixed(1)}m/s`)
    if (status === 'excellent') status = 'caution'
  }

  // 突風チェック
  if (weather.windGust && weather.windGust >= thresholds.maxGustSpeed) {
    factors.push(`突風注意: ${weather.windGust.toFixed(1)}m/s`)
    status = 'dangerous'
  }

  // 視程チェック
  if (weather.visibility < thresholds.minVisibility) {
    factors.push(`視程不良: ${weather.visibility.toFixed(1)}km`)
    if (status !== 'dangerous') status = 'warning'
  } else if (weather.visibility < thresholds.minVisibility * 2) {
    factors.push(`視程やや不良: ${weather.visibility.toFixed(1)}km`)
    if (status === 'excellent') status = 'caution'
  }

  // 雲量チェック
  if (weather.cloudCover >= 90) {
    factors.push('全曇り')
    if (status === 'excellent') status = 'good'
  }

  // 天気状態チェック
  const badConditions = ['雨', '雪', '雷', '霧', '靄']
  if (badConditions.some((c) => weather.conditions.includes(c))) {
    factors.push(`天候: ${weather.conditions}`)
    if (status !== 'dangerous') status = 'warning'
  }

  // メッセージ生成
  let message = ''
  switch (status) {
    case 'excellent':
      message = '飛行に最適な気象条件です'
      break
    case 'good':
      message = '概ね良好な飛行条件です'
      break
    case 'caution':
      message = '注意して飛行してください'
      break
    case 'warning':
      message = '飛行には注意が必要です'
      break
    case 'dangerous':
      message = '飛行は推奨しません'
      break
  }

  return { status, message, factors: factors.length > 0 ? factors : ['良好'] }
}

// OpenWeatherMap APIレスポンスの型
interface OpenWeatherResponse {
  coord: { lon: number; lat: number }
  weather: { id: number; main: string; description: string; icon: string }[]
  main: {
    temp: number
    feels_like: number
    pressure: number
    humidity: number
  }
  visibility: number
  wind: { speed: number; deg: number; gust?: number }
  clouds: { all: number }
  dt: number
  name: string
}

interface OpenWeatherForecastResponse {
  list: {
    dt: number
    main: { temp: number }
    weather: { main: string; description: string }[]
    wind: { speed: number; deg: number }
    pop: number
    rain?: { '3h': number }
  }[]
}

// 天気状態を日本語に変換
const translateCondition = (condition: string): string => {
  const translations: Record<string, string> = {
    Clear: '晴れ',
    Clouds: '曇り',
    Rain: '雨',
    Drizzle: '霧雨',
    Thunderstorm: '雷雨',
    Snow: '雪',
    Mist: '靄',
    Fog: '霧',
    Haze: 'もや',
    Smoke: '煙',
    Dust: '砂塵',
    Sand: '砂',
    Ash: '火山灰',
    Squall: 'スコール',
    Tornado: '竜巻',
  }
  return translations[condition] || condition
}

// 座標から地域名を推定（モックデータ用）
const estimateLocationName = (lat: number, lon: number): string => {
  // 主要地域の座標範囲と名称
  const regions = [
    { name: '旭川', latMin: 43.5, latMax: 44.0, lonMin: 142.0, lonMax: 143.0 },
    { name: '札幌', latMin: 42.8, latMax: 43.5, lonMin: 141.0, lonMax: 142.0 },
    { name: '仙台', latMin: 38.0, latMax: 38.5, lonMin: 140.5, lonMax: 141.0 },
    { name: '東京', latMin: 35.5, latMax: 36.0, lonMin: 139.5, lonMax: 140.0 },
    { name: '成田', latMin: 35.7, latMax: 36.0, lonMin: 140.2, lonMax: 140.5 },
    { name: '横浜', latMin: 35.3, latMax: 35.6, lonMin: 139.5, lonMax: 139.8 },
    {
      name: '名古屋',
      latMin: 35.0,
      latMax: 35.3,
      lonMin: 136.8,
      lonMax: 137.2,
    },
    { name: '大阪', latMin: 34.5, latMax: 34.8, lonMin: 135.3, lonMax: 135.7 },
    { name: '神戸', latMin: 34.6, latMax: 34.8, lonMin: 135.0, lonMax: 135.3 },
    { name: '広島', latMin: 34.3, latMax: 34.6, lonMin: 132.3, lonMax: 132.6 },
    { name: '福岡', latMin: 33.5, latMax: 33.8, lonMin: 130.2, lonMax: 130.6 },
    { name: '那覇', latMin: 26.0, latMax: 26.5, lonMin: 127.5, lonMax: 128.0 },
  ]

  for (const region of regions) {
    if (
      lat >= region.latMin &&
      lat <= region.latMax &&
      lon >= region.lonMin &&
      lon <= region.lonMax
    ) {
      return region.name
    }
  }

  // 大まかな地域判定（フォールバック）
  if (lat > 42) return '北海道'
  if (lat > 38) return '東北'
  if (lat > 36) return '関東'
  if (lat > 34) return '近畿'
  if (lat > 32) return '中国・四国'
  if (lat > 30) return '九州'
  return '日本'
}

// モックデータ生成（API利用不可時のフォールバック）
const generateMockWeatherData = (lat: number, lon: number): WeatherData => {
  const now = new Date()
  // 緯度による気温調整（北ほど寒い）
  const latTempAdjust = (35.6 - lat) * 1.5 // 東京基準で緯度1度あたり約1.5度変化
  const baseTemp =
    15 + Math.sin((now.getHours() / 24) * Math.PI * 2) * 5 - latTempAdjust
  const windSpeed = 2 + Math.random() * 6
  const windDir = Math.floor(Math.random() * 360)

  const current = {
    temperature: Math.round(baseTemp * 10) / 10,
    humidity: 50 + Math.floor(Math.random() * 30),
    pressure: 1010 + Math.floor(Math.random() * 20),
    windSpeed: Math.round(windSpeed * 10) / 10,
    windDirection: windDir,
    windGust: windSpeed + Math.random() * 3,
    visibility: 10 + Math.random() * 5,
    cloudCover: Math.floor(Math.random() * 60),
    conditions: '晴れ',
    icon: '01d',
  }

  const shortTermForecast = Array.from({ length: 6 }, (_, i) => ({
    time: new Date(now.getTime() + (i + 1) * 10 * 60 * 1000),
    temperature: current.temperature + (Math.random() - 0.5) * 2,
    windSpeed: current.windSpeed + (Math.random() - 0.5) * 2,
    windDirection:
      (current.windDirection + Math.floor(Math.random() * 20) - 10 + 360) % 360,
    precipitation: Math.random() < 0.1 ? Math.random() * 2 : 0,
    precipitationProbability: Math.floor(Math.random() * 20),
    conditions: '晴れ',
  }))

  const flightCondition = evaluateFlightCondition(current)
  const locationName = estimateLocationName(lat, lon)

  return {
    timestamp: now,
    location: { latitude: lat, longitude: lon, name: locationName },
    current,
    shortTermForecast,
    flightCondition,
  }
}

// 気象データ取得（OpenWeatherMap API）
export const fetchWeatherData = async (
  lat: number,
  lon: number,
  apiKey?: string
): Promise<WeatherData> => {
  // APIキーがない場合はモックデータを返す
  if (!apiKey) {
    console.info('Weather API key not provided, using mock data')
    return generateMockWeatherData(lat, lon)
  }

  try {
    // 現在の天気を取得
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`
    )

    if (!currentResponse.ok) {
      throw new Error(`Weather API error: ${currentResponse.status}`)
    }

    const currentData: OpenWeatherResponse = await currentResponse.json()

    // 予報データを取得
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja&cnt=8`
    )

    let forecastData: OpenWeatherForecastResponse | null = null
    if (forecastResponse.ok) {
      forecastData = await forecastResponse.json()
    }

    const current = {
      temperature: currentData.main.temp,
      humidity: currentData.main.humidity,
      pressure: currentData.main.pressure,
      windSpeed: currentData.wind.speed,
      windDirection: currentData.wind.deg,
      windGust: currentData.wind.gust,
      visibility: currentData.visibility / 1000, // メートルからkmに変換
      cloudCover: currentData.clouds.all,
      conditions: translateCondition(currentData.weather[0]?.main || 'Clear'),
      icon: currentData.weather[0]?.icon || '01d',
    }

    // 短期予報を生成
    const shortTermForecast = forecastData?.list.slice(0, 6).map((item) => ({
      time: new Date(item.dt * 1000),
      temperature: item.main.temp,
      windSpeed: item.wind.speed,
      windDirection: item.wind.deg,
      precipitation: item.rain?.['3h'] || 0,
      precipitationProbability: Math.round(item.pop * 100),
      conditions: translateCondition(item.weather[0]?.main || 'Clear'),
    }))

    const flightCondition = evaluateFlightCondition(current)

    return {
      timestamp: new Date(),
      location: {
        latitude: lat,
        longitude: lon,
        name: currentData.name || '不明',
      },
      current,
      shortTermForecast,
      flightCondition,
    }
  } catch (error) {
    console.error('Failed to fetch weather data:', error)
    // エラー時はモックデータにフォールバック
    return generateMockWeatherData(lat, lon)
  }
}

// リアルタイム更新用のカスタムフック
export const createWeatherPoller = (
  lat: number,
  lon: number,
  apiKey?: string,
  intervalMs: number = 60000 // デフォルト1分間隔
) => {
  let intervalId: NodeJS.Timeout | null = null
  let callback: ((data: WeatherData) => void) | null = null

  const start = (onUpdate: (data: WeatherData) => void) => {
    callback = onUpdate

    // 初回取得
    fetchWeatherData(lat, lon, apiKey).then(callback)

    // 定期更新
    intervalId = setInterval(() => {
      fetchWeatherData(lat, lon, apiKey).then((data) => {
        if (callback) callback(data)
      })
    }, intervalMs)
  }

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    callback = null
  }

  const updateLocation = (newLat: number, newLon: number) => {
    lat = newLat
    lon = newLon
    // 位置変更時に即座に再取得
    if (callback) {
      fetchWeatherData(lat, lon, apiKey).then(callback)
    }
  }

  return { start, stop, updateLocation }
}
