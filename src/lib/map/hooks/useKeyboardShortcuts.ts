/**
 * Keyboard Shortcuts Hook
 * キーボードショートカット管理フック
 *
 * マップレイヤー操作用のキーボードショートカットを提供
 */

import { useEffect, useCallback, useRef } from 'react'

import { getLayerFromShortcut, LAYER_INFO } from './useRestrictionLayers'

import type { LayerType } from './useRestrictionLayers'

// ============================================
// 型定義
// ============================================

/** ショートカット定義 */
export interface ShortcutDefinition {
  /** キー（大文字） */
  key: string
  /** 説明 */
  description: string
  /** 対象レイヤー（レイヤー操作の場合） */
  layerType?: LayerType
  /** カスタムアクション */
  action?: () => void
}

/** キーボードショートカット設定 */
export interface KeyboardShortcutsConfig {
  /** レイヤー切り替えコールバック */
  onToggleLayer?: (layer: LayerType) => void
  /** 全レイヤー切り替えコールバック */
  onToggleAllLayers?: () => void
  /** カスタムショートカット */
  customShortcuts?: ShortcutDefinition[]
  /** ショートカット有効/無効 */
  enabled?: boolean
  /** 入力フィールドでの無効化 */
  disableInInputs?: boolean
}

/** キーボードショートカットリターン型 */
export interface UseKeyboardShortcutsReturn {
  /** 登録済みショートカット一覧 */
  shortcuts: ShortcutDefinition[]
  /** ショートカット有効状態 */
  enabled: boolean
  /** ショートカットを有効化 */
  enable: () => void
  /** ショートカットを無効化 */
  disable: () => void
}

// ============================================
// デフォルトショートカット
// ============================================

const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  // レイヤー操作
  { key: 'R', description: '飛行禁止区域 トグル', layerType: 'noFlyZones' },
  { key: 'A', description: '空港制限区域 トグル', layerType: 'airports' },
  { key: 'D', description: 'DID トグル', layerType: 'did' },
  { key: 'E', description: '緊急用務空域 トグル', layerType: 'emergency' },
  { key: 'I', description: 'リモートID区域 トグル', layerType: 'remoteId' },
  { key: 'M', description: '有人機発着 トグル', layerType: 'mannedAircraft' },
  { key: 'H', description: 'ヘリポート トグル', layerType: 'heliports' },
  {
    key: 'F',
    description: '電波干渉区域 トグル',
    layerType: 'radioInterference',
  },
  // 全レイヤー
  { key: 'L', description: '全レイヤー トグル' },
]

// ============================================
// フック実装
// ============================================

export function useKeyboardShortcuts(
  config: KeyboardShortcutsConfig = {}
): UseKeyboardShortcutsReturn {
  const {
    onToggleLayer,
    onToggleAllLayers,
    customShortcuts = [],
    enabled: initialEnabled = true,
    disableInInputs = true,
  } = config

  const enabledRef = useRef(initialEnabled)

  // ショートカット一覧をマージ
  const shortcuts: ShortcutDefinition[] = [
    ...DEFAULT_SHORTCUTS,
    ...customShortcuts,
  ]

  // キー押下ハンドラ
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // 無効化時は何もしない
      if (!enabledRef.current) return

      // 入力フィールドでは無効化（オプション）
      if (disableInInputs) {
        const target = event.target as HTMLElement
        const tagName = target.tagName.toLowerCase()
        if (
          tagName === 'input' ||
          tagName === 'textarea' ||
          tagName === 'select' ||
          target.isContentEditable
        ) {
          return
        }
      }

      // 修飾キーが押されている場合は無効
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return
      }

      const key = event.key.toUpperCase()

      // 全レイヤートグル（L）
      if (key === 'L' && onToggleAllLayers) {
        event.preventDefault()
        onToggleAllLayers()
        return
      }

      // レイヤー個別トグル
      const layerType = getLayerFromShortcut(key)
      if (layerType && onToggleLayer) {
        event.preventDefault()
        onToggleLayer(layerType)
        return
      }

      // カスタムショートカット
      const customShortcut = customShortcuts.find((s) => s.key === key)
      if (customShortcut?.action) {
        event.preventDefault()
        customShortcut.action()
      }
    },
    [onToggleLayer, onToggleAllLayers, customShortcuts, disableInInputs]
  )

  // イベントリスナー登録
  useEffect(() => {
    if (!initialEnabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, initialEnabled])

  // 有効化
  const enable = useCallback(() => {
    enabledRef.current = true
  }, [])

  // 無効化
  const disable = useCallback(() => {
    enabledRef.current = false
  }, [])

  return {
    shortcuts,
    enabled: enabledRef.current,
    enable,
    disable,
  }
}

// ============================================
// ユーティリティ
// ============================================

/**
 * ショートカットキーのヘルプテキストを生成
 */
export function generateShortcutHelp(): string {
  const lines = ['キーボードショートカット:', '', 'レイヤー操作:']

  for (const [_layerType, info] of Object.entries(LAYER_INFO)) {
    lines.push(`  ${info.shortcut} - ${info.label}`)
  }

  lines.push('')
  lines.push('その他:')
  lines.push('  L - 全レイヤー トグル')

  return lines.join('\n')
}

/**
 * ショートカットをReactコンポーネント用にフォーマット
 */
interface ShortcutItem {
  key: string
  label: string
  labelEn: string
  layerType?: LayerType
}

export function getShortcutsList(): ShortcutItem[] {
  const list: ShortcutItem[] = Object.entries(LAYER_INFO).map(
    ([layerType, info]) => ({
      key: info.shortcut,
      label: info.label,
      labelEn: info.labelEn,
      layerType: layerType as LayerType,
    })
  )

  // 全レイヤートグルを追加
  list.push({
    key: 'L',
    label: '全レイヤー',
    labelEn: 'All Layers',
  })

  return list
}
