/**
 * Map Services Index
 * マップサービスのエクスポート
 */

// 空港制限区域サービス
export {
  MAJOR_AIRPORTS,
  REGIONAL_AIRPORTS,
  MILITARY_BASES,
  HELIPORTS as AIRPORT_HELIPORTS,
  getAllAirports,
  getAllAirportsWithHeliports,
  getNoFlyLawAirports,
  generateAirportGeoJSON,
  generateAirportMarkersGeoJSON,
  generateHeliportGeoJSON as generateAirportHeliportGeoJSON,
  isInAirportZone,
  AirportService,
} from './airports'
export type { AirportMarkerProperties } from './airports'

// 飛行禁止区域サービス
export {
  loadNoFlyFacilities,
  getNoFlyFacilities,
  getFacilitiesByZone,
  getFacilitiesByType,
  getNuclearPlants,
  getEmbassies,
  getPrefectures,
  getPoliceFacilities,
  getPrisons,
  getJSDFFacilities,
  generateRedZoneGeoJSON,
  generateYellowZoneGeoJSON,
  generateAllNoFlyGeoJSON,
  generateCategoryGeoJSON,
  isInNoFlyZone,
  getNearbyNoFlyZones,
  NoFlyZoneService,
} from './noFlyZones'

// UTMゾーンサービス
export {
  EMERGENCY_AIRSPACE,
  REMOTE_ID_ZONES,
  MANNED_AIRCRAFT_ZONES,
  RADIO_INTERFERENCE_ZONES,
  getEmergencyAirspaceGeoJSON,
  getRemoteIdZonesGeoJSON,
  getMannedAircraftZonesGeoJSON,
  getRadioInterferenceZonesGeoJSON,
  getActiveEmergencyAirspace,
  getAgriculturalZones,
  getGliderFields,
  get5GZones,
  UTMZoneService,
} from './utmZones'

// ヘリポートサービス
export {
  HELIPORTS,
  getHeliportsGeoJSON,
  getHeliportMarkersGeoJSON,
  getHeliportsByType,
  getHospitalHeliports,
  getRegularHeliports,
  HeliportService,
} from './heliports'

// DID判定サービス
export {
  PREFECTURE_DATA,
  preloadDIDDataForCoordinates,
  checkDIDArea,
  isPositionInDIDSync,
  isDIDCacheReady,
  isAllDIDCacheReady,
  clearDIDCache,
  DIDService,
} from './didService'
export type { PrefectureData, DIDCheckResult } from './didService'

// DID互換エイリアス（後方互換性のため）
export { checkDIDArea as checkDID } from './didService'
