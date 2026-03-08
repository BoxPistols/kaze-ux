/**
 * Japan Drone Map Library
 *
 * A comprehensive library for displaying drone flight restriction zones
 * and geographic data overlays in Japan.
 */

// Types
export * from './types'

// Configuration
export {
  BASE_MAPS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  NOTO_CENTER,
  NOTO_ZOOM,
  JAPAN_CENTER,
  JAPAN_ZOOM,
  REGION_VIEWS,
} from './config/baseMaps'
export {
  GEO_OVERLAYS,
  WEATHER_OVERLAYS,
  SIGNAL_OVERLAYS,
  RESTRICTION_ZONES,
  NO_FLY_ZONES,
  NFZ_ZONES,
  DID_ZONES,
  CRITICAL_FACILITY_ZONES,
  RESTRICTION_CATEGORIES,
  RESTRICTION_COLORS,
  getAllRestrictionZones,
} from './config/overlays'
export {
  FACILITY_LAYERS,
  CRITICAL_FACILITY_LAYERS,
  REFERENCE_FACILITY_LAYERS,
  getFacilityLayerById,
} from './config/facilities'
export {
  LAYER_GROUPS,
  PREFECTURE_COLORS,
  PREFECTURE_BOUNDS,
  createLayerIdToNameMap,
  getAllLayers,
  TERRAIN_2024_LAYERS,
  TERRAIN_2024_COLOR,
  TERRAIN_2020_COLOR,
  TERRAIN_2020_REFERENCE,
  getTerrain2024Layers,
  ISHIKAWA_NOTO_COMPARISON_LAYERS,
  getComparisonLayers,
  getComparisonLayerMetadata,
} from './config/layers'
export type { ComparisonLayerConfig, TerrainLayer } from './config/layers'
export {
  getPrefectureInfo,
  getAllPrefectureLayerIds,
  findLayersByPrefecture,
} from './config/searchIndexes'

// Cache
export {
  getCachedGeoJSON,
  setCachedGeoJSON,
  fetchGeoJSONWithCache,
  clearOldCaches,
} from './cache'

// kokuarea (airport airspace) helpers
export {
  KOKUAREA_STYLE,
  fillKokuareaTileUrl,
  getVisibleTileXYZs,
  classifyKokuareaSurface,
} from './kokuarea'
export type { KokuareaSurfaceKind, KokuareaFeatureProperties } from './kokuarea'

// Utilities
export {
  // Coordinate types
  type LngLat,
  type LngLatAlt,
  type CoordinateObject,
  type PolygonCoordinates,
  // Coordinate conversion
  toGeoJSONCoord,
  toGeoJSONCoordWithAltitude,
  fromGeoJSONCoord,
  toPolygonCoordinates,
  fromPolygonCoordinates,
  to3DCoordinates,
  to2DCoordinates,
  isValidCoordinate,
  isValidPolygon,
  // Geo utilities
  calculateBBox,
  calculateDistance,
  createCirclePolygon,
  pointInPolygon,
  mergeBBoxes,
  bboxesIntersect,
  formatCoordinates,
  formatCoordinatesDMS,
  convertDecimalToDMS,
  degreesToCompass,
  degreesToJapanese,
} from './utils/geo'

export {
  checkWaypointCollision,
  checkWaypointCollisionOptimized,
  checkPathCollision,
  checkPolygonCollision,
  createSpatialIndex,
  ZONE_COLORS,
  ZONE_SEVERITY,
  ZONE_PRIORITY,
} from './utils/collision'
export type {
  CollisionType,
  WaypointCollisionResult,
  PathCollisionResult,
  PolygonCollisionResult,
} from './utils/collision'

// Services
export {
  // 空港サービス
  AirportService,
  MAJOR_AIRPORTS,
  REGIONAL_AIRPORTS,
  MILITARY_BASES,
  getAllAirports,
  generateAirportGeoJSON,
  isInAirportZone,
  // 飛行禁止区域サービス
  NoFlyZoneService,
  loadNoFlyFacilities,
  generateRedZoneGeoJSON,
  generateYellowZoneGeoJSON,
  isInNoFlyZone,
  // UTMゾーンサービス
  UTMZoneService,
  EMERGENCY_AIRSPACE,
  REMOTE_ID_ZONES,
  getEmergencyAirspaceGeoJSON,
  getRemoteIdZonesGeoJSON,
  // ヘリポートサービス
  HeliportService,
  HELIPORTS,
  getHeliportsGeoJSON,
  // DIDサービス
  DIDService,
  checkDIDArea,
  preloadDIDDataForCoordinates,
} from './services'

// Hooks
export {
  useRestrictionLayers,
  useKeyboardShortcuts,
  useZoneCheck,
  useMultiDroneZoneCheck,
  LAYER_COLORS,
  LAYER_INFO,
  getLayerFromShortcut,
  generateShortcutHelp,
  getShortcutsList,
} from './hooks'
export type {
  LayerType,
  LayerVisibility,
  GeoJsonData,
  ShortcutDefinition,
  KeyboardShortcutsConfig,
  ZoneCheckResult,
  UseZoneCheckOptions,
  DroneZoneStatus,
} from './hooks'

// Library metadata
export const VERSION = '1.0.0'
export const LIBRARY_NAME = 'did-map'
