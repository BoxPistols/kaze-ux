/**
 * UTM落下分散範囲算出パネル
 *
 * 航空局基準に基づいた落下分散範囲の自動計算
 * 参考: 国土交通省「無人航空機の飛行に関する許可・承認の審査要領」
 */

import CalculateIcon from '@mui/icons-material/Calculate'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DownloadIcon from '@mui/icons-material/Download'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import InfoIcon from '@mui/icons-material/Info'
import MapIcon from '@mui/icons-material/Map'
import RefreshIcon from '@mui/icons-material/Refresh'
import WarningIcon from '@mui/icons-material/Warning'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Alert,
  AlertTitle,
  Grid,
  InputAdornment,
  CircularProgress,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Slider,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import { useState, useCallback, useMemo } from 'react'
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/maplibre'

import 'maplibre-gl/dist/maplibre-gl.css'

import type {
  FallDispersionInput,
  FallDispersionResult,
} from '@/types/utmTypes'

import type { FillLayer, LineLayer } from 'react-map-gl/maplibre'

// 落下分散範囲計算パネルのProps
interface UTMFallDispersionPanelProps {
  // 計算結果の変更コールバック
  onResultChange?: (result: FallDispersionResult | null) => void
  // 初期値
  initialValues?: Partial<FallDispersionInput>
  // 読み取り専用モード
  readOnly?: boolean
  // マップ表示の中心座標（飛行計画の座標）
  centerCoordinate?: { lat: number; lng: number }
}

// 故障シナリオの説明
const FAILURE_SCENARIOS = {
  motor_stop: {
    label: 'モーター停止（1発停止）',
    description: '1つのモーターが停止した場合。制御は維持されるが、徐々に降下',
    coefficient: 1.0,
  },
  full_power_loss: {
    label: '完全動力喪失',
    description: 'すべてのモーターが停止した場合。自由落下に近い状態',
    coefficient: 1.2,
  },
  control_loss: {
    label: '制御喪失',
    description: 'フライトコントローラー異常。予測不能な挙動で落下',
    coefficient: 1.5,
  },
}

// プリセット機体データ（日本市場で使用される代表的な機体）
// 参考: 各メーカー公式スペック、JUIDA機体登録データ
const AIRCRAFT_PRESETS = [
  // --- コンシューマー機（小型） ---
  {
    name: 'DJI Mini 4 Pro',
    category: 'consumer_small',
    weight: 0.249,
    maxSpeed: 16,
    dragCoefficient: 0.45,
    frontalArea: 0.012,
    motorCount: 4,
    propellerDiameter: 15,
    description: '100g未満登録不要機（ジンバルカメラ搭載）',
  },
  {
    name: 'DJI Air 3',
    category: 'consumer_small',
    weight: 0.72,
    maxSpeed: 21,
    dragCoefficient: 0.46,
    frontalArea: 0.018,
    motorCount: 4,
    propellerDiameter: 20,
    description: 'デュアルカメラ搭載中型機',
  },
  {
    name: 'DJI Mavic 3 Pro',
    category: 'consumer_standard',
    weight: 0.958,
    maxSpeed: 21,
    dragCoefficient: 0.47,
    frontalArea: 0.022,
    motorCount: 4,
    propellerDiameter: 24,
    description: 'トリプルカメラ搭載ハイエンド機',
  },
  {
    name: 'DJI Avata 2',
    category: 'fpv',
    weight: 0.377,
    maxSpeed: 27,
    dragCoefficient: 0.42,
    frontalArea: 0.015,
    motorCount: 4,
    propellerDiameter: 12,
    description: 'FPVドローン（高速飛行対応）',
  },
  // --- 産業用機（中型） ---
  {
    name: 'DJI Mavic 3 Enterprise',
    category: 'industrial_medium',
    weight: 0.915,
    maxSpeed: 21,
    dragCoefficient: 0.48,
    frontalArea: 0.024,
    motorCount: 4,
    propellerDiameter: 24,
    description: '産業用サーマルカメラ搭載',
  },
  {
    name: 'DJI Matrice 30T',
    category: 'industrial_medium',
    weight: 3.77,
    maxSpeed: 23,
    dragCoefficient: 0.52,
    frontalArea: 0.05,
    motorCount: 4,
    propellerDiameter: 40,
    description: '折りたたみ式産業用機（サーマル）',
  },
  {
    name: 'DJI Matrice 350 RTK',
    category: 'industrial_large',
    weight: 6.47,
    maxSpeed: 23,
    dragCoefficient: 0.55,
    frontalArea: 0.08,
    motorCount: 4,
    propellerDiameter: 53,
    description: '大型産業機（RTK対応）',
  },
  {
    name: 'Autel EVO II Pro',
    category: 'industrial_medium',
    weight: 1.175,
    maxSpeed: 20,
    dragCoefficient: 0.48,
    frontalArea: 0.025,
    motorCount: 4,
    propellerDiameter: 22,
    description: '6Kカメラ搭載産業機',
  },
  // --- 国産機（日本メーカー） ---
  {
    name: 'ACSL SOTEN（蒼天）',
    category: 'industrial_domestic',
    weight: 1.72,
    maxSpeed: 15,
    dragCoefficient: 0.52,
    frontalArea: 0.035,
    motorCount: 4,
    propellerDiameter: 28,
    description: '国産セキュア小型ドローン',
  },
  {
    name: 'ACSL PF2',
    category: 'industrial_domestic',
    weight: 5.5,
    maxSpeed: 18,
    dragCoefficient: 0.54,
    frontalArea: 0.07,
    motorCount: 4,
    propellerDiameter: 45,
    description: '国産物流・点検用大型機',
  },
  {
    name: 'Prodrone PD6B-Type2',
    category: 'industrial_domestic',
    weight: 15.0,
    maxSpeed: 15,
    dragCoefficient: 0.58,
    frontalArea: 0.12,
    motorCount: 6,
    propellerDiameter: 76,
    description: '産業用ヘキサコプター',
  },
  {
    name: 'Skydio X10',
    category: 'industrial_medium',
    weight: 2.25,
    maxSpeed: 18,
    dragCoefficient: 0.5,
    frontalArea: 0.04,
    motorCount: 4,
    propellerDiameter: 30,
    description: '自律飛行AI搭載点検機',
  },
  // --- 農業用機（大型） ---
  {
    name: 'DJI Agras T40',
    category: 'agriculture',
    weight: 36.5,
    maxSpeed: 10,
    dragCoefficient: 0.6,
    frontalArea: 0.15,
    motorCount: 4,
    propellerDiameter: 91,
    description: '農薬散布用大型機（40Lタンク）',
  },
  {
    name: 'DJI Agras T25',
    category: 'agriculture',
    weight: 26.5,
    maxSpeed: 12,
    dragCoefficient: 0.58,
    frontalArea: 0.12,
    motorCount: 4,
    propellerDiameter: 76,
    description: '農薬散布用中型機（25Lタンク）',
  },
  {
    name: 'ヤマハ YMR-08',
    category: 'agriculture_domestic',
    weight: 16.5,
    maxSpeed: 6,
    dragCoefficient: 0.55,
    frontalArea: 0.1,
    motorCount: 8,
    propellerDiameter: 56,
    description: 'ヤマハ製農業用オクトコプター',
  },
  {
    name: 'クボタ T10K',
    category: 'agriculture_domestic',
    weight: 12.9,
    maxSpeed: 7,
    dragCoefficient: 0.54,
    frontalArea: 0.09,
    motorCount: 4,
    propellerDiameter: 60,
    description: 'クボタ製農薬散布機',
  },
  // --- 物流用機（配送） ---
  {
    name: 'エアロネクスト AirTruck',
    category: 'logistics',
    weight: 7.8,
    maxSpeed: 20,
    dragCoefficient: 0.52,
    frontalArea: 0.08,
    motorCount: 4,
    propellerDiameter: 55,
    description: '物流特化型4D GRAVITY搭載',
  },
  {
    name: 'ACSL 物流専用機',
    category: 'logistics_domestic',
    weight: 8.5,
    maxSpeed: 18,
    dragCoefficient: 0.54,
    frontalArea: 0.09,
    motorCount: 4,
    propellerDiameter: 50,
    description: '国産物流ドローン（5kg積載）',
  },
  // --- 固定翼・VTOL ---
  {
    name: 'Wingcopter 198',
    category: 'vtol',
    weight: 18.0,
    maxSpeed: 32,
    dragCoefficient: 0.35,
    frontalArea: 0.06,
    motorCount: 4,
    propellerDiameter: 48,
    description: 'VTOL物流機（長距離）',
  },
  {
    name: 'テラドローン Terra Dolphin',
    category: 'vtol_domestic',
    weight: 9.5,
    maxSpeed: 28,
    dragCoefficient: 0.38,
    frontalArea: 0.045,
    motorCount: 5,
    propellerDiameter: 40,
    description: '国産VTOL測量機',
  },
  // --- カスタム入力 ---
  {
    name: 'カスタム',
    category: 'custom',
    weight: 2.0,
    maxSpeed: 15,
    dragCoefficient: 0.5,
    frontalArea: 0.04,
    motorCount: 4,
    propellerDiameter: 30,
    description: '任意のスペックを入力',
  },
]

// 落下分散範囲計算ロジック
// 参考: 航空局「十分な離隔距離の考え方」
const calculateFallDispersion = (
  input: FallDispersionInput
): FallDispersionResult => {
  const { flightAltitude, cruiseSpeed, aircraft, weather, failureScenario } =
    input

  // 空気密度の計算（気温と気圧から）
  // ρ = P / (R × T) where R = 287.05 J/(kg·K)
  const tempKelvin = weather.temperature + 273.15
  const airDensity = (weather.pressure * 100) / (287.05 * tempKelvin)

  // 終端速度の計算
  // Vt = sqrt((2 × m × g) / (ρ × Cd × A))
  const g = 9.81 // 重力加速度
  const terminalVelocity = Math.sqrt(
    (2 * aircraft.weight * g) /
      (airDensity * aircraft.dragCoefficient * aircraft.frontalArea)
  )

  // 落下時間の計算（簡易モデル: 終端速度に達するまでの加速を考慮）
  // 正確には積分が必要だが、簡易計算として終端速度での等速落下を仮定
  const fallTime = flightAltitude / terminalVelocity

  // 水平移動距離（故障時の慣性による移動）
  // 故障シナリオに応じた係数を適用
  const scenarioCoeff = FAILURE_SCENARIOS[failureScenario].coefficient
  const horizontalDistance = cruiseSpeed * fallTime * 0.5 * scenarioCoeff

  // 風による移動距離
  const windDriftDistance = weather.windSpeed * fallTime

  // 総合分散半径（二乗和の平方根）
  const totalDispersionRadius = Math.sqrt(
    Math.pow(horizontalDistance, 2) + Math.pow(windDriftDistance, 2)
  )

  // 安全係数（通常1.2〜1.5）
  const safetyMargin = 1.3
  const requiredSafeDistance = totalDispersionRadius * safetyMargin

  // 警告メッセージの生成
  const warnings: string[] = []
  if (weather.windSpeed > 10) {
    warnings.push('風速が10m/sを超えています。飛行条件を再検討してください。')
  }
  if (flightAltitude > 150) {
    warnings.push(
      '飛行高度が150mを超えています。航空法上の制限に注意してください。'
    )
  }
  if (aircraft.weight > 25) {
    warnings.push(
      '機体重量が25kgを超えています。第二種機体認証が必要な場合があります。'
    )
  }
  if (requiredSafeDistance > 100) {
    warnings.push(
      '必要安全離隔距離が100mを超えています。飛行エリアの設定に注意してください。'
    )
  }

  // 分散楕円の計算（風向を考慮）
  // windRadiansは将来の楕円ポリゴン生成で使用予定
  const _windRadians = (weather.windDirection * Math.PI) / 180
  const semiMajorAxis = requiredSafeDistance
  const semiMinorAxis = horizontalDistance * safetyMargin

  return {
    id: `fall-${Date.now()}`,
    calculatedAt: new Date().toISOString(),
    input,
    fallTime,
    horizontalDistance,
    windDriftDistance,
    totalDispersionRadius,
    safetyMargin,
    requiredSafeDistance,
    dispersionEllipse: {
      centerLat: 0, // 実際の座標は飛行計画から取得
      centerLng: 0,
      semiMajorAxis,
      semiMinorAxis,
      rotation: weather.windDirection,
    },
    dispersionPolygon: {
      type: 'Polygon',
      coordinates: [[]], // 実際のポリゴンは別途生成
    },
    calculationBasis:
      '国土交通省「無人航空機の飛行に関する許可・承認の審査要領」に基づく計算',
    warnings,
  }
}

// 分散範囲地図プレビューコンポーネント
interface DispersionMapPreviewProps {
  radiusMeters: number
  windDirection?: number
  centerLat?: number
  centerLng?: number
}

const DispersionMapPreview = ({
  radiusMeters,
  windDirection = 0,
  centerLat = 35.6812,
  centerLng = 139.7671,
}: DispersionMapPreviewProps) => {
  const theme = useTheme()

  // 円形のGeoJSONを生成（64点の多角形で近似）
  const circleGeoJSON = useMemo(() => {
    const points: [number, number][] = []
    const numPoints = 64

    // 緯度1度あたりの距離（約111km）
    const metersPerDegreeLat = 111320
    // 経度1度あたりの距離（緯度により変化）
    const metersPerDegreeLng =
      metersPerDegreeLat * Math.cos((centerLat * Math.PI) / 180)

    // 度単位での半径
    const latRadius = radiusMeters / metersPerDegreeLat
    const lngRadius = radiusMeters / metersPerDegreeLng

    for (let i = 0; i <= numPoints; i++) {
      const angle = (i * 2 * Math.PI) / numPoints
      points.push([
        centerLng + lngRadius * Math.cos(angle),
        centerLat + latRadius * Math.sin(angle),
      ])
    }

    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'Polygon' as const,
        coordinates: [points],
      },
    }
  }, [radiusMeters, centerLat, centerLng])

  // 風向を示す矢印ラインのGeoJSON
  const windArrowGeoJSON = useMemo(() => {
    // 風向から終点を計算（風向は北を0度として時計回り）
    const windRad = ((270 - windDirection) * Math.PI) / 180
    const metersPerDegreeLat = 111320
    const metersPerDegreeLng =
      metersPerDegreeLat * Math.cos((centerLat * Math.PI) / 180)

    const arrowLength = radiusMeters * 0.8
    const endLat =
      centerLat + (arrowLength / metersPerDegreeLat) * Math.sin(windRad)
    const endLng =
      centerLng + (arrowLength / metersPerDegreeLng) * Math.cos(windRad)

    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [centerLng, centerLat],
          [endLng, endLat],
        ],
      },
    }
  }, [radiusMeters, windDirection, centerLat, centerLng])

  const fillLayerStyle: FillLayer = {
    id: 'dispersion-fill',
    type: 'fill',
    source: 'dispersion-circle',
    paint: {
      'fill-color': theme.palette.error.main,
      'fill-opacity': 0.15,
    },
  }

  const lineLayerStyle: LineLayer = {
    id: 'dispersion-line',
    type: 'line',
    source: 'dispersion-circle',
    paint: {
      'line-color': theme.palette.error.main,
      'line-width': 2,
      'line-dasharray': [4, 2],
    },
  }

  const windLineLayerStyle: LineLayer = {
    id: 'wind-arrow',
    type: 'line',
    source: 'wind-arrow',
    paint: {
      'line-color': theme.palette.info.main,
      'line-width': 3,
    },
  }

  // ズームレベルを半径に基づいて計算
  const zoom = useMemo(() => {
    if (radiusMeters > 500) return 12
    if (radiusMeters > 200) return 13
    if (radiusMeters > 100) return 14
    return 15
  }, [radiusMeters])

  return (
    <Map
      initialViewState={{
        latitude: centerLat,
        longitude: centerLng,
        zoom: zoom,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle='https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
      attributionControl={false}>
      <NavigationControl position='top-right' showCompass={false} />

      {/* 分散範囲円 */}
      <Source id='dispersion-circle' type='geojson' data={circleGeoJSON}>
        <Layer {...fillLayerStyle} />
        <Layer {...lineLayerStyle} />
      </Source>

      {/* 風向矢印 */}
      <Source id='wind-arrow' type='geojson' data={windArrowGeoJSON}>
        <Layer {...windLineLayerStyle} />
      </Source>
    </Map>
  )
}

const UTMFallDispersionPanel = ({
  onResultChange,
  initialValues,
  readOnly = false,
  centerCoordinate,
}: UTMFallDispersionPanelProps) => {
  const theme = useTheme()

  // 入力値の状態
  const [flightAltitude, setFlightAltitude] = useState(
    initialValues?.flightAltitude ?? 100
  )
  const [cruiseSpeed, setCruiseSpeed] = useState(
    initialValues?.cruiseSpeed ?? 10
  )
  const [selectedPreset, setSelectedPreset] = useState(AIRCRAFT_PRESETS[0].name)

  // 機体スペック
  const [weight, setWeight] = useState(initialValues?.aircraft?.weight ?? 2.0)
  const [maxSpeed, setMaxSpeed] = useState(
    initialValues?.aircraft?.maxSpeed ?? 15
  )
  const [dragCoefficient, setDragCoefficient] = useState(
    initialValues?.aircraft?.dragCoefficient ?? 0.5
  )
  const [frontalArea, setFrontalArea] = useState(
    initialValues?.aircraft?.frontalArea ?? 0.04
  )

  // 気象条件
  const [windSpeed, setWindSpeed] = useState(
    initialValues?.weather?.windSpeed ?? 5
  )
  const [windDirection, setWindDirection] = useState(
    initialValues?.weather?.windDirection ?? 0
  )
  const [temperature, setTemperature] = useState(
    initialValues?.weather?.temperature ?? 20
  )
  const [pressure, setPressure] = useState(
    initialValues?.weather?.pressure ?? 1013
  )

  // 故障シナリオ
  const [failureScenario, setFailureScenario] = useState<
    FallDispersionInput['failureScenario']
  >(initialValues?.failureScenario ?? 'motor_stop')

  // 計算結果
  const [result, setResult] = useState<FallDispersionResult | null>(null)
  const [calculating, setCalculating] = useState(false)

  // プリセット変更時
  const handlePresetChange = useCallback((presetName: string) => {
    setSelectedPreset(presetName)
    const preset = AIRCRAFT_PRESETS.find((p) => p.name === presetName)
    if (preset) {
      setWeight(preset.weight)
      setMaxSpeed(preset.maxSpeed)
      setDragCoefficient(preset.dragCoefficient)
      setFrontalArea(preset.frontalArea)
    }
  }, [])

  // 計算実行
  const handleCalculate = useCallback(() => {
    setCalculating(true)

    // 入力値を構築
    const input: FallDispersionInput = {
      flightAltitude,
      cruiseSpeed,
      aircraft: {
        weight,
        maxSpeed,
        dragCoefficient,
        frontalArea,
        motorCount: 4,
        propellerDiameter: 30,
      },
      weather: {
        windSpeed,
        windDirection,
        temperature,
        pressure,
        altitude: 0,
      },
      failureScenario,
    }

    // 計算実行（UIレスポンス用に非同期化）
    setTimeout(() => {
      const calcResult = calculateFallDispersion(input)
      setResult(calcResult)
      onResultChange?.(calcResult)
      setCalculating(false)
    }, 500)
  }, [
    flightAltitude,
    cruiseSpeed,
    weight,
    maxSpeed,
    dragCoefficient,
    frontalArea,
    windSpeed,
    windDirection,
    temperature,
    pressure,
    failureScenario,
    onResultChange,
  ])

  // 結果のコピー
  const handleCopyResult = useCallback(() => {
    if (!result) return

    const text = `【落下分散範囲計算結果】
計算日時: ${new Date(result.calculatedAt).toLocaleString('ja-JP')}

■ 入力条件
・飛行高度: ${result.input.flightAltitude}m
・巡航速度: ${result.input.cruiseSpeed}m/s
・機体重量: ${result.input.aircraft.weight}kg
・風速: ${result.input.weather.windSpeed}m/s
・風向: ${result.input.weather.windDirection}°
・故障シナリオ: ${FAILURE_SCENARIOS[result.input.failureScenario].label}

■ 計算結果
・落下時間: ${result.fallTime.toFixed(1)}秒
・水平移動距離: ${result.horizontalDistance.toFixed(1)}m
・風による移動距離: ${result.windDriftDistance.toFixed(1)}m
・総合分散半径: ${result.totalDispersionRadius.toFixed(1)}m
・必要安全離隔距離: ${result.requiredSafeDistance.toFixed(1)}m（安全係数${result.safetyMargin}）

■ 計算根拠
${result.calculationBasis}`

    navigator.clipboard.writeText(text)
  }, [result])

  // 風向の表示
  const windDirectionLabel = useMemo(() => {
    const directions = ['北', '北東', '東', '南東', '南', '南西', '西', '北西']
    const index = Math.round(windDirection / 45) % 8
    return directions[index]
  }, [windDirection])

  return (
    <Box>
      {/* ヘッダー */}
      <Card sx={{ mb: 2 }}>
        <CardHeader
          avatar={<CalculateIcon color='primary' />}
          title='落下分散範囲算出'
          subheader='航空局基準に基づいた安全離隔距離の自動計算'
          action={
            <Tooltip title='計算方法について'>
              <IconButton>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          }
        />
      </Card>

      <Grid container spacing={2}>
        {/* 入力パラメータ */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant='subtitle1' fontWeight={600} gutterBottom>
              飛行条件
            </Typography>

            <Stack spacing={2}>
              <TextField
                label='飛行高度'
                type='number'
                value={flightAltitude}
                onChange={(e) => setFlightAltitude(Number(e.target.value))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>m</InputAdornment>
                  ),
                }}
                disabled={readOnly}
                fullWidth
                helperText='対地高度（AGL）'
              />

              <TextField
                label='巡航速度'
                type='number'
                value={cruiseSpeed}
                onChange={(e) => setCruiseSpeed(Number(e.target.value))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>m/s</InputAdornment>
                  ),
                }}
                disabled={readOnly}
                fullWidth
                helperText='通常飛行時の速度'
              />

              <FormControl fullWidth>
                <InputLabel>故障シナリオ</InputLabel>
                <Select
                  value={failureScenario}
                  label='故障シナリオ'
                  onChange={(e) =>
                    setFailureScenario(
                      e.target.value as FallDispersionInput['failureScenario']
                    )
                  }
                  disabled={readOnly}>
                  {Object.entries(FAILURE_SCENARIOS).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {FAILURE_SCENARIOS[failureScenario].description}
                </FormHelperText>
              </FormControl>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant='subtitle1' fontWeight={600} gutterBottom>
              機体スペック
            </Typography>

            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>機体プリセット</InputLabel>
                <Select
                  value={selectedPreset}
                  label='機体プリセット'
                  onChange={(e) => handlePresetChange(e.target.value)}
                  disabled={readOnly}
                  MenuProps={{
                    PaperProps: {
                      sx: { maxHeight: 400 },
                    },
                  }}>
                  {/* コンシューマー機 */}
                  <MenuItem
                    disabled
                    sx={{ opacity: 0.7, fontSize: '0.75rem', fontWeight: 600 }}>
                    コンシューマー機
                  </MenuItem>
                  {AIRCRAFT_PRESETS.filter((p) =>
                    ['consumer_small', 'consumer_standard', 'fpv'].includes(
                      p.category
                    )
                  ).map((preset) => (
                    <MenuItem key={preset.name} value={preset.name}>
                      <Stack>
                        <Typography variant='body2'>{preset.name}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {preset.weight}kg / {preset.description}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                  {/* 産業用機 */}
                  <MenuItem
                    disabled
                    sx={{
                      opacity: 0.7,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      mt: 1,
                    }}>
                    産業用機
                  </MenuItem>
                  {AIRCRAFT_PRESETS.filter((p) =>
                    [
                      'industrial_medium',
                      'industrial_large',
                      'industrial_domestic',
                    ].includes(p.category)
                  ).map((preset) => (
                    <MenuItem key={preset.name} value={preset.name}>
                      <Stack>
                        <Typography variant='body2'>{preset.name}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {preset.weight}kg / {preset.description}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                  {/* 農業用機 */}
                  <MenuItem
                    disabled
                    sx={{
                      opacity: 0.7,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      mt: 1,
                    }}>
                    農業用機
                  </MenuItem>
                  {AIRCRAFT_PRESETS.filter((p) =>
                    ['agriculture', 'agriculture_domestic'].includes(p.category)
                  ).map((preset) => (
                    <MenuItem key={preset.name} value={preset.name}>
                      <Stack>
                        <Typography variant='body2'>{preset.name}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {preset.weight}kg / {preset.description}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                  {/* 物流・VTOL */}
                  <MenuItem
                    disabled
                    sx={{
                      opacity: 0.7,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      mt: 1,
                    }}>
                    物流・VTOL
                  </MenuItem>
                  {AIRCRAFT_PRESETS.filter((p) =>
                    [
                      'logistics',
                      'logistics_domestic',
                      'vtol',
                      'vtol_domestic',
                    ].includes(p.category)
                  ).map((preset) => (
                    <MenuItem key={preset.name} value={preset.name}>
                      <Stack>
                        <Typography variant='body2'>{preset.name}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {preset.weight}kg / {preset.description}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                  {/* カスタム */}
                  <MenuItem
                    disabled
                    sx={{
                      opacity: 0.7,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      mt: 1,
                    }}>
                    カスタム入力
                  </MenuItem>
                  {AIRCRAFT_PRESETS.filter((p) => p.category === 'custom').map(
                    (preset) => (
                      <MenuItem key={preset.name} value={preset.name}>
                        <Stack>
                          <Typography variant='body2'>{preset.name}</Typography>
                          <Typography variant='caption' color='text.secondary'>
                            任意の機体スペックを入力
                          </Typography>
                        </Stack>
                      </MenuItem>
                    )
                  )}
                </Select>
                <FormHelperText>
                  {AIRCRAFT_PRESETS.find((p) => p.name === selectedPreset)
                    ?.description || ''}
                </FormHelperText>
              </FormControl>

              <TextField
                label='機体重量'
                type='number'
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>kg</InputAdornment>
                  ),
                }}
                disabled={readOnly || selectedPreset !== 'カスタム'}
                fullWidth
              />

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='body2'>詳細パラメータ</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <TextField
                      label='抗力係数'
                      type='number'
                      value={dragCoefficient}
                      onChange={(e) =>
                        setDragCoefficient(Number(e.target.value))
                      }
                      inputProps={{ step: 0.01 }}
                      disabled={readOnly}
                      fullWidth
                      helperText='通常0.4〜0.6'
                    />
                    <TextField
                      label='前面投影面積'
                      type='number'
                      value={frontalArea}
                      onChange={(e) => setFrontalArea(Number(e.target.value))}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>m²</InputAdornment>
                        ),
                      }}
                      inputProps={{ step: 0.01 }}
                      disabled={readOnly}
                      fullWidth
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant='subtitle1' fontWeight={600} gutterBottom>
              気象条件
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  風速: {windSpeed} m/s
                </Typography>
                <Slider
                  value={windSpeed}
                  onChange={(_, v) => setWindSpeed(v as number)}
                  min={0}
                  max={20}
                  step={0.5}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 5, label: '5' },
                    { value: 10, label: '10' },
                    { value: 15, label: '15' },
                    { value: 20, label: '20' },
                  ]}
                  disabled={readOnly}
                />
              </Box>

              <Box>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  風向: {windDirection}° ({windDirectionLabel})
                </Typography>
                <Slider
                  value={windDirection}
                  onChange={(_, v) => setWindDirection(v as number)}
                  min={0}
                  max={360}
                  step={15}
                  disabled={readOnly}
                />
              </Box>

              <Stack direction='row' spacing={2}>
                <TextField
                  label='気温'
                  type='number'
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>°C</InputAdornment>
                    ),
                  }}
                  disabled={readOnly}
                  fullWidth
                />
                <TextField
                  label='気圧'
                  type='number'
                  value={pressure}
                  onChange={(e) => setPressure(Number(e.target.value))}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>hPa</InputAdornment>
                    ),
                  }}
                  disabled={readOnly}
                  fullWidth
                />
              </Stack>
            </Stack>

            <Button
              variant='contained'
              fullWidth
              size='large'
              onClick={handleCalculate}
              disabled={calculating || readOnly}
              startIcon={
                calculating ? <CircularProgress size={20} /> : <CalculateIcon />
              }
              sx={{ mt: 3 }}>
              {calculating ? '計算中...' : '落下分散範囲を計算'}
            </Button>
          </Paper>
        </Grid>

        {/* 計算結果 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{ mb: 2 }}>
              <Typography variant='subtitle1' fontWeight={600}>
                計算結果
              </Typography>
              {result && (
                <Stack direction='row' spacing={1}>
                  <Tooltip title='結果をコピー'>
                    <IconButton size='small' onClick={handleCopyResult}>
                      <ContentCopyIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='再計算'>
                    <IconButton size='small' onClick={handleCalculate}>
                      <RefreshIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
            </Stack>

            {result ? (
              <Box>
                {/* 警告表示 */}
                {result.warnings.length > 0 && (
                  <Alert
                    severity='warning'
                    sx={{ mb: 2 }}
                    icon={<WarningIcon />}>
                    <AlertTitle>注意事項</AlertTitle>
                    {result.warnings.map((warning, i) => (
                      <Typography key={i} variant='body2'>
                        {warning}
                      </Typography>
                    ))}
                  </Alert>
                )}

                {/* メイン結果 */}
                <Card
                  variant='outlined'
                  sx={{
                    mb: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderColor: theme.palette.primary.main,
                  }}>
                  <CardContent>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      gutterBottom>
                      必要安全離隔距離
                    </Typography>
                    <Typography
                      variant='h3'
                      color='primary'
                      fontWeight={700}
                      sx={{ mb: 1 }}>
                      {result.requiredSafeDistance.toFixed(1)}
                      <Typography
                        component='span'
                        variant='h5'
                        color='text.secondary'>
                        {' '}
                        m
                      </Typography>
                    </Typography>
                    <Chip
                      size='small'
                      label={`安全係数 ${result.safetyMargin} 適用`}
                      color='primary'
                      variant='outlined'
                    />
                  </CardContent>
                </Card>

                {/* 詳細結果テーブル */}
                <TableContainer sx={{ maxWidth: '100%' }}>
                  <Table
                    size='small'
                    sx={{
                      minWidth: '0 !important',
                      width: '100%',
                      tableLayout: 'fixed',
                    }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>項目</TableCell>
                        <TableCell align='right'>値</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>落下時間</TableCell>
                        <TableCell align='right'>
                          {result.fallTime.toFixed(1)} 秒
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>水平移動距離（慣性）</TableCell>
                        <TableCell align='right'>
                          {result.horizontalDistance.toFixed(1)} m
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>風による移動距離</TableCell>
                        <TableCell align='right'>
                          {result.windDriftDistance.toFixed(1)} m
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>総合分散半径</TableCell>
                        <TableCell align='right'>
                          {result.totalDispersionRadius.toFixed(1)} m
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        }}>
                        <TableCell>
                          <strong>必要安全離隔距離</strong>
                        </TableCell>
                        <TableCell align='right'>
                          <strong>
                            {result.requiredSafeDistance.toFixed(1)} m
                          </strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* 地図プレビュー（インタラクティブ） */}
                <Paper
                  variant='outlined'
                  sx={{
                    mt: 2,
                    height: 250,
                    overflow: 'hidden',
                    borderRadius: 2,
                    position: 'relative',
                  }}>
                  <DispersionMapPreview
                    radiusMeters={result.requiredSafeDistance}
                    windDirection={result.input.weather.windDirection}
                    centerLat={centerCoordinate?.lat}
                    centerLng={centerCoordinate?.lng}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                      backdropFilter: 'blur(8px)',
                      borderRadius: 1,
                      px: 1.5,
                      py: 0.5,
                    }}>
                    <Typography variant='caption' color='text.secondary'>
                      半径: {result.requiredSafeDistance.toFixed(0)}m
                    </Typography>
                  </Box>
                </Paper>

                {/* 計算根拠 */}
                <Alert severity='info' sx={{ mt: 2 }} icon={<InfoIcon />}>
                  <Typography variant='caption'>
                    {result.calculationBasis}
                  </Typography>
                </Alert>

                {/* 出力ボタン */}
                <Stack direction='row' spacing={1} sx={{ mt: 2 }}>
                  <Button
                    variant='outlined'
                    startIcon={<DownloadIcon />}
                    fullWidth>
                    計算書をダウンロード
                  </Button>
                  <Button variant='outlined' startIcon={<MapIcon />} fullWidth>
                    KMLをエクスポート
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box
                sx={{
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 2,
                }}>
                <ErrorOutlineIcon
                  sx={{ fontSize: 64, color: 'text.disabled' }}
                />
                <Typography color='text.secondary'>
                  左のフォームに条件を入力し、「計算」ボタンを押してください
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 参考リンク */}
      <Alert severity='info' sx={{ mt: 2 }}>
        <AlertTitle>参考情報</AlertTitle>
        <Typography variant='body2'>
          本計算は国土交通省「無人航空機の飛行に関する許可・承認の審査要領」に記載された
          「第三者の立入りを制限する区域（緩衝区域）の確保」の考え方に基づいています。
          実際の許可申請には、機体性能や飛行条件に応じた個別の評価が必要です。
        </Typography>
      </Alert>
    </Box>
  )
}

export default UTMFallDispersionPanel
