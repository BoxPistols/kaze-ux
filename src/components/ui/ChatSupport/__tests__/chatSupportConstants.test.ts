// chatSupportConstants ユニットテスト

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  normalizeShortcutKey,
  formatShortcutLabel,
  isShortcutMatch,
  normalizeChatConfig,
  loadChatConfig,
  createDefaultShortcuts,
  DEFAULT_CHAT_CONFIG,
  CONFIG_STORAGE_KEY,
  detectPersona,
  DESIGNER_PROMPT_EXTENSION,
  ENGINEER_PROMPT_EXTENSION,
} from '../chatSupportConstants'
import type { ShortcutBinding } from '../chatSupportTypes'

// ---------------------------------------------------------------------------
// normalizeShortcutKey
// ---------------------------------------------------------------------------

describe('normalizeShortcutKey', () => {
  it('Esc を Escape に変換する', () => {
    expect(normalizeShortcutKey('Esc')).toBe('Escape')
  })

  it('スペースを Space に変換する', () => {
    expect(normalizeShortcutKey(' ')).toBe('Space')
  })

  it('単一文字を小文字に変換する', () => {
    expect(normalizeShortcutKey('K')).toBe('k')
    expect(normalizeShortcutKey('a')).toBe('a')
  })

  it('特殊キーはそのまま返す', () => {
    expect(normalizeShortcutKey('Enter')).toBe('Enter')
    expect(normalizeShortcutKey('Backspace')).toBe('Backspace')
    expect(normalizeShortcutKey('Tab')).toBe('Tab')
    expect(normalizeShortcutKey('Escape')).toBe('Escape')
  })
})

// ---------------------------------------------------------------------------
// formatShortcutLabel
// ---------------------------------------------------------------------------

describe('formatShortcutLabel', () => {
  it('修飾キーなしのキーをフォーマットする', () => {
    const shortcut: ShortcutBinding = {
      key: 'Escape',
      mod: false,
      shift: false,
      alt: false,
    }
    expect(formatShortcutLabel(shortcut)).toBe('Esc')
  })

  it('Mod + キーをフォーマットする', () => {
    const shortcut: ShortcutBinding = {
      key: 'k',
      mod: true,
      shift: false,
      alt: false,
    }
    const result = formatShortcutLabel(shortcut)
    // Cmd+K or Ctrl+K
    expect(result).toMatch(/^(Cmd|Ctrl)\+K$/)
  })

  it('Mod + Shift + キーをフォーマットする', () => {
    const shortcut: ShortcutBinding = {
      key: 's',
      mod: true,
      shift: true,
      alt: false,
    }
    const result = formatShortcutLabel(shortcut)
    expect(result).toMatch(/^(Cmd|Ctrl)\+Shift\+S$/)
  })

  it('Alt修飾キーを含むフォーマット', () => {
    const shortcut: ShortcutBinding = {
      key: 'a',
      mod: false,
      shift: false,
      alt: true,
    }
    expect(formatShortcutLabel(shortcut)).toBe('Alt+A')
  })

  it('Backspaceを Delete と表示する', () => {
    const shortcut: ShortcutBinding = {
      key: 'Backspace',
      mod: true,
      shift: true,
      alt: false,
    }
    const result = formatShortcutLabel(shortcut)
    expect(result).toContain('Delete')
  })
})

// ---------------------------------------------------------------------------
// isShortcutMatch
// ---------------------------------------------------------------------------

describe('isShortcutMatch', () => {
  const createKeyboardEvent = (
    overrides: Partial<KeyboardEvent>
  ): KeyboardEvent => {
    return {
      key: '',
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      ...overrides,
    } as KeyboardEvent
  }

  it('完全一致でtrueを返す', () => {
    const shortcut: ShortcutBinding = {
      key: 'k',
      mod: true,
      shift: true,
      alt: false,
    }
    const event = createKeyboardEvent({
      key: 'k',
      metaKey: true,
      shiftKey: true,
    })
    expect(isShortcutMatch(event, shortcut)).toBe(true)
  })

  it('Ctrl でもmod=trueにマッチする', () => {
    const shortcut: ShortcutBinding = {
      key: 'k',
      mod: true,
      shift: false,
      alt: false,
    }
    const event = createKeyboardEvent({ key: 'k', ctrlKey: true })
    expect(isShortcutMatch(event, shortcut)).toBe(true)
  })

  it('mod=falseでmetaKey押下時はfalseを返す', () => {
    const shortcut: ShortcutBinding = {
      key: 'Escape',
      mod: false,
      shift: false,
      alt: false,
    }
    const event = createKeyboardEvent({ key: 'Escape', metaKey: true })
    expect(isShortcutMatch(event, shortcut)).toBe(false)
  })

  it('shiftが不一致でfalseを返す', () => {
    const shortcut: ShortcutBinding = {
      key: 'k',
      mod: true,
      shift: true,
      alt: false,
    }
    const event = createKeyboardEvent({
      key: 'k',
      metaKey: true,
      shiftKey: false,
    })
    expect(isShortcutMatch(event, shortcut)).toBe(false)
  })

  it('Escapeキーがmod/shift/altなしでマッチする', () => {
    const shortcut: ShortcutBinding = {
      key: 'Escape',
      mod: false,
      shift: false,
      alt: false,
    }
    const event = createKeyboardEvent({ key: 'Escape' })
    expect(isShortcutMatch(event, shortcut)).toBe(true)
  })

  it('大文字キー入力を正規化してマッチする', () => {
    const shortcut: ShortcutBinding = {
      key: 'k',
      mod: true,
      shift: false,
      alt: false,
    }
    // Shift未押下でも大文字Kが来る場合
    const event = createKeyboardEvent({ key: 'K', metaKey: true })
    expect(isShortcutMatch(event, shortcut)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// normalizeChatConfig
// ---------------------------------------------------------------------------

describe('normalizeChatConfig', () => {
  it('有効な入力をそのまま返す', () => {
    const input = {
      apiKey: 'sk-test',
      model: 'gpt-4.1-nano',
      uiMode: 'sidebar',
      sidebarWidth: 500,
      shortcuts: createDefaultShortcuts(),
    }
    const result = normalizeChatConfig(input)
    expect(result.apiKey).toBe('sk-test')
    expect(result.model).toBe('gpt-4.1-nano')
    expect(result.uiMode).toBe('sidebar')
    expect(result.sidebarWidth).toBe(500)
  })

  it('無効な入力でデフォルト値を返す', () => {
    const result = normalizeChatConfig(null)
    expect(result.uiMode).toBe('widget')
    expect(result.sidebarWidth).toBe(400)
  })

  it('文字列入力でデフォルト値を返す', () => {
    const result = normalizeChatConfig('invalid')
    expect(result.model).toBe(DEFAULT_CHAT_CONFIG.model)
  })

  it('sidebarWidthを320-800にクランプする', () => {
    const tooSmall = normalizeChatConfig({ sidebarWidth: 100 })
    expect(tooSmall.sidebarWidth).toBe(320)

    const tooLarge = normalizeChatConfig({ sidebarWidth: 2000 })
    expect(tooLarge.sidebarWidth).toBe(800)
  })

  it('不正なuiModeはwidgetにフォールバックする', () => {
    const result = normalizeChatConfig({ uiMode: 'invalid' })
    expect(result.uiMode).toBe('widget')
  })

  it('数値apiKeyでデフォルトに戻す', () => {
    const result = normalizeChatConfig({ apiKey: 12345 })
    expect(result.apiKey).toBe(DEFAULT_CHAT_CONFIG.apiKey)
  })

  it('shortcutsが不正でもデフォルトショートカットを返す', () => {
    const result = normalizeChatConfig({ shortcuts: 'bad' })
    expect(result.shortcuts.sendMessage).toBeDefined()
    expect(result.shortcuts.sendMessage.key).toBe('Enter')
  })
})

// ---------------------------------------------------------------------------
// loadChatConfig
// ---------------------------------------------------------------------------

describe('loadChatConfig', () => {
  let getItemSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    getItemSpy = vi.fn()
    vi.stubGlobal('localStorage', {
      getItem: getItemSpy,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('localStorageに値がなければデフォルトを返す', () => {
    getItemSpy.mockReturnValue(null)
    const config = loadChatConfig()
    expect(config.uiMode).toBe('widget')
    expect(config.model).toBe(DEFAULT_CHAT_CONFIG.model)
  })

  it('有効なJSONを解析して返す', () => {
    getItemSpy.mockReturnValue(
      JSON.stringify({
        apiKey: 'stored-key',
        model: 'gpt-5-mini',
        uiMode: 'sidebar',
        sidebarWidth: 600,
      })
    )
    const config = loadChatConfig()
    expect(config.apiKey).toBe('stored-key')
    expect(config.model).toBe('gpt-5-mini')
    expect(config.uiMode).toBe('sidebar')
  })

  it('不正なJSONでデフォルトを返す', () => {
    getItemSpy.mockReturnValue('{invalid json}')
    const config = loadChatConfig()
    expect(config.model).toBe(DEFAULT_CHAT_CONFIG.model)
  })

  it('デフォルトAPIキー使用時はモデルをデフォルトにリセットする', () => {
    // apiKeyが空（デフォルト）なのにモデルが非デフォルト → リセットされる
    getItemSpy.mockReturnValue(
      JSON.stringify({
        apiKey: '',
        model: 'gpt-4.1-mini',
        uiMode: 'widget',
      })
    )
    const config = loadChatConfig()
    expect(config.model).toBe(DEFAULT_CHAT_CONFIG.model)
  })

  it('カスタムAPIキー使用時はモデルをそのまま保持する', () => {
    getItemSpy.mockReturnValue(
      JSON.stringify({
        apiKey: 'sk-custom-key',
        model: 'gpt-5-mini',
        uiMode: 'sidebar',
      })
    )
    const config = loadChatConfig()
    expect(config.model).toBe('gpt-5-mini')
  })
})

// ---------------------------------------------------------------------------
// createDefaultShortcuts
// ---------------------------------------------------------------------------

describe('createDefaultShortcuts', () => {
  it('全ショートカットアクションが定義されている', () => {
    const shortcuts = createDefaultShortcuts()
    const expectedActions = [
      'sendMessage',
      'focusInput',
      'toggleChat',
      'toggleSettings',
      'downloadHistory',
      'toggleUiMode',
      'clearHistory',
      'closeChat',
    ]
    for (const action of expectedActions) {
      expect(shortcuts[action as keyof typeof shortcuts]).toBeDefined()
    }
  })

  it('各ショートカットにkey, mod, shift, altがある', () => {
    const shortcuts = createDefaultShortcuts()
    for (const binding of Object.values(shortcuts)) {
      expect(typeof binding.key).toBe('string')
      expect(typeof binding.mod).toBe('boolean')
      expect(typeof binding.shift).toBe('boolean')
      expect(typeof binding.alt).toBe('boolean')
    }
  })

  it('呼び出しごとに独立したオブジェクトを返す', () => {
    const a = createDefaultShortcuts()
    const b = createDefaultShortcuts()
    expect(a).not.toBe(b)
    expect(a.sendMessage).not.toBe(b.sendMessage)
  })
})

// ---------------------------------------------------------------------------
// detectPersona
// ---------------------------------------------------------------------------

describe('detectPersona', () => {
  describe('ページカテゴリによる検出', () => {
    it('Guide/ ページでデザイナーを検出する', () => {
      expect(detectPersona('Guide/Introduction', '')).toBe('designer')
    })

    it('Design Tokens/ ページでデザイナーを検出する', () => {
      expect(detectPersona('Design Tokens/Color Palette', '')).toBe('designer')
    })

    it('Components/ ページでエンジニアを検出する', () => {
      expect(detectPersona('Components/Button', '')).toBe('engineer')
    })

    it('Layout/ ページでエンジニアを検出する', () => {
      expect(detectPersona('Layout/Grid System', '')).toBe('engineer')
    })
  })

  describe('質問語彙による検出', () => {
    it('デザイナー語彙でデザイナーを検出する', () => {
      expect(
        detectPersona(undefined, 'Figmaでデザインした色のトークン名は?')
      ).toBe('designer')
    })

    it('エンジニア語彙でエンジニアを検出する', () => {
      expect(detectPersona(undefined, 'コードの実装でsxとimportの使い方')).toBe(
        'engineer'
      )
    })

    it('語彙不足でunknownを返す', () => {
      expect(detectPersona(undefined, 'こんにちは')).toBe('unknown')
    })
  })

  describe('複合シグナル', () => {
    it('ページとクエリ両方のシグナルを組み合わせる', () => {
      // Design Tokens(デザイナー) + エンジニア語彙 → エンジニアの語彙が多ければエンジニア
      const result = detectPersona(
        'Design Tokens/Color Palette',
        '実装でsxとimportとtestとTypeScriptの型定義'
      )
      expect(result).toBe('engineer')
    })
  })
})

// ---------------------------------------------------------------------------
// プロンプト拡張定数
// ---------------------------------------------------------------------------

describe('プロンプト拡張定数', () => {
  it('DESIGNER_PROMPT_EXTENSIONが非空', () => {
    expect(DESIGNER_PROMPT_EXTENSION.length).toBeGreaterThan(0)
    expect(DESIGNER_PROMPT_EXTENSION).toContain('デザイナー')
  })

  it('ENGINEER_PROMPT_EXTENSIONが非空', () => {
    expect(ENGINEER_PROMPT_EXTENSION.length).toBeGreaterThan(0)
    expect(ENGINEER_PROMPT_EXTENSION).toContain('エンジニア')
  })
})
