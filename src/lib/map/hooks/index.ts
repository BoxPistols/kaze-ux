/**
 * Map Hooks Index
 * マップフックのエクスポート
 */

// レイヤー管理フック
export {
  useRestrictionLayers,
  getLayerFromShortcut,
  DIDService,
  LAYER_COLORS,
  LAYER_INFO,
} from './useRestrictionLayers'
export type {
  LayerType,
  LayerVisibility,
  GeoJsonData,
} from './useRestrictionLayers'

// キーボードショートカットフック
export {
  useKeyboardShortcuts,
  generateShortcutHelp,
  getShortcutsList,
} from './useKeyboardShortcuts'
export type {
  ShortcutDefinition,
  KeyboardShortcutsConfig,
  UseKeyboardShortcutsReturn,
} from './useKeyboardShortcuts'

// ゾーン判定フック
export { useZoneCheck, useMultiDroneZoneCheck } from './useZoneCheck'
export type {
  ZoneCheckResult,
  UseZoneCheckOptions,
  DroneZoneStatus,
} from './useZoneCheck'
