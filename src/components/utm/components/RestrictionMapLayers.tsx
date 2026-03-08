/**
 * RestrictionMapLayers - 制限区域レイヤーコンポーネント
 *
 * MapLibre GL / react-map-gl 用の制限区域レイヤーを提供
 * UTMTrackingMapや他のマップコンポーネント内で使用
 */

import { useMemo } from 'react'
import { Source, Layer } from 'react-map-gl/maplibre'

import type { LayerVisibility } from '@/lib/map/hooks'
import { LAYER_COLORS } from '@/lib/map/hooks'

// DIDタイルURL（令和2年国勢調査データ）
const DID_TILE_URL =
  'https://cyberjapandata.gsi.go.jp/xyz/did2020/{z}/{x}/{y}.png'

// 空のGeoJSON FeatureCollection
const EMPTY_FEATURE_COLLECTION: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
}

export interface RestrictionMapLayersProps {
  /** レイヤー表示状態 */
  visibility: LayerVisibility
  /** GeoJSONデータ */
  geoJsonData: {
    noFlyZonesRed: GeoJSON.FeatureCollection | null
    noFlyZonesYellow: GeoJSON.FeatureCollection | null
    airports: GeoJSON.FeatureCollection | null
    airportMarkers: GeoJSON.FeatureCollection | null
    emergency: GeoJSON.FeatureCollection | null
    remoteId: GeoJSON.FeatureCollection | null
    mannedAircraft: GeoJSON.FeatureCollection | null
    heliports: GeoJSON.FeatureCollection | null
    heliportMarkers: GeoJSON.FeatureCollection | null
    radioInterference: GeoJSON.FeatureCollection | null
  }
  /** レイヤーIDプレフィックス（複数マップで使用時の衝突回避） */
  idPrefix?: string
}

/**
 * RestrictionMapLayers - 制限区域レイヤー
 *
 * Source/Layerを安定化するため、データがない場合も空のFeatureCollectionを使用
 */
export function RestrictionMapLayers({
  visibility,
  geoJsonData,
  idPrefix = 'restriction',
}: RestrictionMapLayersProps) {
  // 飛行禁止区域（レッド）
  const noFlyRedData = useMemo(
    () => geoJsonData.noFlyZonesRed ?? EMPTY_FEATURE_COLLECTION,
    [geoJsonData.noFlyZonesRed]
  )

  // 飛行禁止区域（イエロー）
  const noFlyYellowData = useMemo(
    () => geoJsonData.noFlyZonesYellow ?? EMPTY_FEATURE_COLLECTION,
    [geoJsonData.noFlyZonesYellow]
  )

  // 空港制限区域
  const airportsData = useMemo(
    () => geoJsonData.airports ?? EMPTY_FEATURE_COLLECTION,
    [geoJsonData.airports]
  )

  // 緊急用務空域
  const emergencyData = useMemo(
    () => geoJsonData.emergency ?? EMPTY_FEATURE_COLLECTION,
    [geoJsonData.emergency]
  )

  // リモートID区域
  const remoteIdData = useMemo(
    () => geoJsonData.remoteId ?? EMPTY_FEATURE_COLLECTION,
    [geoJsonData.remoteId]
  )

  // 有人機発着エリア
  const mannedAircraftData = useMemo(
    () => geoJsonData.mannedAircraft ?? EMPTY_FEATURE_COLLECTION,
    [geoJsonData.mannedAircraft]
  )

  // ヘリポート
  const heliportsData = useMemo(
    () => geoJsonData.heliports ?? EMPTY_FEATURE_COLLECTION,
    [geoJsonData.heliports]
  )

  // 電波干渉区域
  const radioInterferenceData = useMemo(
    () => geoJsonData.radioInterference ?? EMPTY_FEATURE_COLLECTION,
    [geoJsonData.radioInterference]
  )

  return (
    <>
      {/* DID（人口集中地区）ラスタータイル - 最下層 */}
      <Source
        id={`${idPrefix}-did-tiles`}
        type='raster'
        tiles={[DID_TILE_URL]}
        tileSize={256}
        minzoom={8}
        maxzoom={14}
        attribution='国土地理院'>
        <Layer
          id={`${idPrefix}-did-layer`}
          type='raster'
          paint={{
            'raster-opacity': visibility.did ? 0.6 : 0,
          }}
        />
      </Source>

      {/* 飛行禁止区域（レッド） */}
      <Source id={`${idPrefix}-nofly-red`} type='geojson' data={noFlyRedData}>
        <Layer
          id={`${idPrefix}-nofly-red-fill`}
          type='fill'
          paint={{
            'fill-color': LAYER_COLORS.noFlyZones.red,
            'fill-opacity': visibility.noFlyZones
              ? LAYER_COLORS.noFlyZones.redOpacity
              : 0,
          }}
        />
        <Layer
          id={`${idPrefix}-nofly-red-outline`}
          type='line'
          paint={{
            'line-color': LAYER_COLORS.noFlyZones.red,
            'line-width': 2,
            'line-opacity': visibility.noFlyZones ? 0.8 : 0,
          }}
        />
      </Source>

      {/* 飛行禁止区域（イエロー） */}
      <Source
        id={`${idPrefix}-nofly-yellow`}
        type='geojson'
        data={noFlyYellowData}>
        <Layer
          id={`${idPrefix}-nofly-yellow-fill`}
          type='fill'
          paint={{
            'fill-color': LAYER_COLORS.noFlyZones.yellow,
            'fill-opacity': visibility.noFlyZones
              ? LAYER_COLORS.noFlyZones.yellowOpacity
              : 0,
          }}
        />
        <Layer
          id={`${idPrefix}-nofly-yellow-outline`}
          type='line'
          paint={{
            'line-color': LAYER_COLORS.noFlyZones.yellow,
            'line-width': 1.5,
            'line-opacity': visibility.noFlyZones ? 0.7 : 0,
          }}
        />
      </Source>

      {/* 空港制限区域 */}
      <Source id={`${idPrefix}-airports`} type='geojson' data={airportsData}>
        <Layer
          id={`${idPrefix}-airports-fill`}
          type='fill'
          paint={{
            'fill-color': LAYER_COLORS.airports.fill,
            'fill-opacity': visibility.airports
              ? LAYER_COLORS.airports.opacity
              : 0,
          }}
        />
        <Layer
          id={`${idPrefix}-airports-outline`}
          type='line'
          paint={{
            'line-color': LAYER_COLORS.airports.stroke,
            'line-width': 1.5,
            'line-opacity': visibility.airports ? 0.6 : 0,
          }}
        />
      </Source>

      {/* 緊急用務空域 */}
      <Source id={`${idPrefix}-emergency`} type='geojson' data={emergencyData}>
        <Layer
          id={`${idPrefix}-emergency-fill`}
          type='fill'
          paint={{
            'fill-color': LAYER_COLORS.emergency.fill,
            'fill-opacity': visibility.emergency
              ? LAYER_COLORS.emergency.opacity
              : 0,
          }}
        />
        <Layer
          id={`${idPrefix}-emergency-outline`}
          type='line'
          paint={{
            'line-color': LAYER_COLORS.emergency.stroke,
            'line-width': 2,
            'line-opacity': visibility.emergency ? 0.8 : 0,
            'line-dasharray': [4, 2],
          }}
        />
      </Source>

      {/* リモートID区域 */}
      <Source id={`${idPrefix}-remoteid`} type='geojson' data={remoteIdData}>
        <Layer
          id={`${idPrefix}-remoteid-fill`}
          type='fill'
          paint={{
            'fill-color': LAYER_COLORS.remoteId.fill,
            'fill-opacity': visibility.remoteId
              ? LAYER_COLORS.remoteId.opacity
              : 0,
          }}
        />
        <Layer
          id={`${idPrefix}-remoteid-outline`}
          type='line'
          paint={{
            'line-color': LAYER_COLORS.remoteId.stroke,
            'line-width': 1,
            'line-opacity': visibility.remoteId ? 0.5 : 0,
          }}
        />
      </Source>

      {/* 有人機発着エリア */}
      <Source
        id={`${idPrefix}-manned`}
        type='geojson'
        data={mannedAircraftData}>
        <Layer
          id={`${idPrefix}-manned-fill`}
          type='fill'
          paint={{
            'fill-color': LAYER_COLORS.mannedAircraft.fill,
            'fill-opacity': visibility.mannedAircraft
              ? LAYER_COLORS.mannedAircraft.opacity
              : 0,
          }}
        />
        <Layer
          id={`${idPrefix}-manned-outline`}
          type='line'
          paint={{
            'line-color': LAYER_COLORS.mannedAircraft.stroke,
            'line-width': 1.5,
            'line-opacity': visibility.mannedAircraft ? 0.6 : 0,
          }}
        />
      </Source>

      {/* ヘリポート */}
      <Source id={`${idPrefix}-heliports`} type='geojson' data={heliportsData}>
        <Layer
          id={`${idPrefix}-heliports-fill`}
          type='fill'
          paint={{
            'fill-color': LAYER_COLORS.heliports.fill,
            'fill-opacity': visibility.heliports
              ? LAYER_COLORS.heliports.opacity
              : 0,
          }}
        />
        <Layer
          id={`${idPrefix}-heliports-outline`}
          type='line'
          paint={{
            'line-color': LAYER_COLORS.heliports.stroke,
            'line-width': 2,
            'line-opacity': visibility.heliports ? 0.8 : 0,
          }}
        />
      </Source>

      {/* 電波干渉区域 - 最上層 */}
      <Source
        id={`${idPrefix}-radio`}
        type='geojson'
        data={radioInterferenceData}>
        <Layer
          id={`${idPrefix}-radio-fill`}
          type='fill'
          paint={{
            'fill-color': LAYER_COLORS.radioInterference.fill,
            'fill-opacity': visibility.radioInterference
              ? LAYER_COLORS.radioInterference.opacity
              : 0,
          }}
        />
        <Layer
          id={`${idPrefix}-radio-outline`}
          type='line'
          paint={{
            'line-color': LAYER_COLORS.radioInterference.stroke,
            'line-width': 1,
            'line-opacity': visibility.radioInterference ? 0.5 : 0,
            'line-dasharray': [2, 2],
          }}
        />
      </Source>
    </>
  )
}

export default RestrictionMapLayers
