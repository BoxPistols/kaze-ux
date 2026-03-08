/**
 * DIDMap コンポーネント用型定義
 */

import type { MapGeoJSONFeature } from 'maplibre-gl'

// ベースマップの種類
export type BaseMapKey = 'osm' | 'gsi' | 'pale' | 'photo'

// レイヤーの状態
export interface LayerState {
  visible: boolean
  loading: boolean
  loaded: boolean
}

// 描画モード
export type DrawMode = 'none' | 'polygon' | 'circle' | 'point' | 'line'

// 座標表示形式
export type CoordinateFormat = 'decimal' | 'dms'

// クリック位置情報
export interface ClickPosition {
  x: number
  y: number
  lng: number
  lat: number
}

// 描画されたフィーチャー
export interface DrawnFeature {
  id: string
  type: 'polygon' | 'circle' | 'point' | 'line'
  geometry: GeoJSON.Geometry
  properties: Record<string, unknown>
  collisionResult?: {
    isColliding: boolean
    severity: 'DANGER' | 'WARNING' | 'SAFE'
    message: string
  }
}

// DIDMapコンポーネントのProps
export interface DIDMapProps {
  /** 初期中心座標 [経度, 緯度] */
  center?: [number, number]
  /** 初期ズームレベル */
  zoom?: number
  /** ベースマップの種類 */
  baseMap?: BaseMapKey
  /** ダークモード */
  darkMode?: boolean
  /** DIDレイヤーの初期表示状態 */
  showDID?: boolean
  /** 空港空域の初期表示状態 */
  showAirports?: boolean
  /** 飛行禁止区域の初期表示状態 */
  showNoFlyZones?: boolean
  /** 描画ツールの表示 */
  showDrawingTools?: boolean
  /** レイヤーパネルの表示 */
  showLayerPanel?: boolean
  /** 座標表示の有効化 */
  enableCoordinateDisplay?: boolean
  /** 高さ */
  height?: string | number
  /** 幅 */
  width?: string | number
  /** マップ読み込み完了時のコールバック */
  onMapLoad?: (map: maplibregl.Map) => void
  /** クリック時のコールバック */
  onClick?: (
    lngLat: { lng: number; lat: number },
    features: MapGeoJSONFeature[]
  ) => void
  /** フィーチャー描画完了時のコールバック */
  onFeatureDrawn?: (feature: DrawnFeature) => void
  /** スタイルクラス名 */
  className?: string
}

// レイヤーパネルのProps
export interface LayerPanelProps {
  layerStates: Map<string, LayerState>
  restrictionStates: Map<string, boolean>
  opacity: number
  darkMode: boolean
  onLayerToggle: (layerId: string) => void
  onRestrictionToggle: (zoneId: string) => void
  onOpacityChange: (opacity: number) => void
  onClose: () => void
}

// 座標表示のProps
export interface CoordinateDisplayProps {
  position: ClickPosition | null
  format: CoordinateFormat
  darkMode: boolean
  onFormatChange: (format: CoordinateFormat) => void
  onClose: () => void
}
