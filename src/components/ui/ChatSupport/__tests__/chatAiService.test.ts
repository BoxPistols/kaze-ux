// chatAiService ユニットテスト（AI SDK v6 ベース）
// - AI SDK の generateText をモックして public interface を検証
// - 実装詳細（fetch/URL/headers/body）ではなく、入出力契約と境界条件をテスト

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ChatSupportConfig } from '../chatSupportTypes'

// `ai` モジュールの generateText をモック
// ※ vi.mock はホイストされるため最上位宣言
const generateTextMock = vi.fn()

vi.mock('ai', async () => {
  const actual = await vi.importActual<typeof import('ai')>('ai')
  return {
    ...actual,
    generateText: (...args: unknown[]) => generateTextMock(...args),
  }
})

// プロバイダーはデフォルト実装を使用（APIキーで構築されるだけ）
// importは上記mockより後にしないとホイスト順序が狂うためdynamic import
const loadModule = async () => await import('../chatAiService')

// ---------------------------------------------------------------------------
// テストヘルパー
// ---------------------------------------------------------------------------

const baseConfig: ChatSupportConfig = {
  apiKey: 'test-api-key',
  model: 'gpt-5-mini',
  uiMode: 'widget',
  sidebarWidth: 400,
  shortcuts: {} as ChatSupportConfig['shortcuts'],
}

const userMessage = [{ role: 'user', content: 'テスト' }]

const mockSuccess = (text: string, finishReason: string = 'stop') => {
  generateTextMock.mockResolvedValueOnce({
    text,
    finishReason,
    usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
  })
}

beforeEach(() => {
  generateTextMock.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// callAI
// ---------------------------------------------------------------------------

describe('callAI', () => {
  describe('正常系', () => {
    it('生成テキストを文字列で返す', async () => {
      mockSuccess('こんにちは')
      const { callAI } = await loadModule()

      const result = await callAI(baseConfig, userMessage)

      expect(result).toBe('こんにちは')
      expect(generateTextMock).toHaveBeenCalledOnce()
    })

    it('messages を ModelMessage 配列に変換して渡す', async () => {
      mockSuccess('ok')
      const { callAI } = await loadModule()

      await callAI(baseConfig, [
        { role: 'system', content: 'システム指示' },
        { role: 'user', content: 'ユーザー質問' },
        { role: 'assistant', content: '以前の回答' },
      ])

      const callArgs = generateTextMock.mock.calls[0][0]
      expect(callArgs.messages).toEqual([
        { role: 'system', content: 'システム指示' },
        { role: 'user', content: 'ユーザー質問' },
        { role: 'assistant', content: '以前の回答' },
      ])
    })

    it('未知のロールは user として扱う', async () => {
      mockSuccess('ok')
      const { callAI } = await loadModule()

      await callAI(baseConfig, [{ role: 'unknown', content: 'テスト' }])

      const callArgs = generateTextMock.mock.calls[0][0]
      expect(callArgs.messages[0]).toEqual({ role: 'user', content: 'テスト' })
    })
  })

  describe('maxOutputTokens の決定', () => {
    it('isTest=true の場合は 50', async () => {
      mockSuccess('ok')
      const { callAI } = await loadModule()

      await callAI(baseConfig, userMessage, true)

      expect(generateTextMock.mock.calls[0][0].maxOutputTokens).toBe(50)
    })

    it('nano モデルは 4000', async () => {
      mockSuccess('ok')
      const { callAI } = await loadModule()

      await callAI({ ...baseConfig, model: 'gpt-5-nano' }, userMessage)

      expect(generateTextMock.mock.calls[0][0].maxOutputTokens).toBe(4000)
    })

    it('gpt-5/o1/o3 系は 16000', async () => {
      const { callAI } = await loadModule()

      for (const model of ['gpt-5-mini', 'o1-preview', 'o3-mini']) {
        mockSuccess('ok')
        await callAI({ ...baseConfig, model }, userMessage)
        const lastCall = generateTextMock.mock.calls.at(-1)?.[0]
        expect(lastCall.maxOutputTokens).toBe(16000)
      }
    })

    it('その他のモデルは 4000', async () => {
      mockSuccess('ok')
      const { callAI } = await loadModule()

      await callAI({ ...baseConfig, model: 'gpt-4.1-mini' }, userMessage)

      expect(generateTextMock.mock.calls[0][0].maxOutputTokens).toBe(4000)
    })
  })

  describe('finish_reason フォールバック', () => {
    it('空テキスト + finishReason=length の場合はトークン上限メッセージを返す', async () => {
      mockSuccess('', 'length')
      const { callAI } = await loadModule()

      const result = await callAI(baseConfig, userMessage)

      expect(result).toContain('トークン上限')
    })

    it('テキストがある場合は finishReason に関係なくそのまま返す', async () => {
      mockSuccess('部分的な回答', 'length')
      const { callAI } = await loadModule()

      const result = await callAI(baseConfig, userMessage)

      expect(result).toBe('部分的な回答')
    })
  })

  describe('エラーハンドリング', () => {
    it('TimeoutError はタイムアウトメッセージに変換', async () => {
      const timeoutError = new Error('Request timed out')
      timeoutError.name = 'TimeoutError'
      generateTextMock.mockRejectedValueOnce(timeoutError)
      const { callAI } = await loadModule()

      await expect(callAI(baseConfig, userMessage)).rejects.toThrow(
        'リクエストがタイムアウトしました'
      )
    })

    it('AbortError もタイムアウトメッセージに変換', async () => {
      const abortError = new Error('The operation was aborted')
      abortError.name = 'AbortError'
      generateTextMock.mockRejectedValueOnce(abortError)
      const { callAI } = await loadModule()

      await expect(callAI(baseConfig, userMessage)).rejects.toThrow(
        'リクエストがタイムアウトしました'
      )
    })

    it('通常のエラーはそのまま再スロー', async () => {
      generateTextMock.mockRejectedValueOnce(new Error('Invalid API key'))
      const { callAI } = await loadModule()

      await expect(callAI(baseConfig, userMessage)).rejects.toThrow(
        'Invalid API key'
      )
    })

    it('Error 以外の例外は汎用メッセージでラップ', async () => {
      generateTextMock.mockRejectedValueOnce('string error')
      const { callAI } = await loadModule()

      await expect(callAI(baseConfig, userMessage)).rejects.toThrow(
        'AI呼び出しに失敗しました'
      )
    })
  })

  describe('abortSignal', () => {
    it('AbortSignal を渡す', async () => {
      mockSuccess('ok')
      const { callAI } = await loadModule()

      await callAI(baseConfig, userMessage)

      const callArgs = generateTextMock.mock.calls[0][0]
      expect(callArgs.abortSignal).toBeInstanceOf(AbortSignal)
    })
  })
})

// ---------------------------------------------------------------------------
// extractContent（後方互換のパススルー）
// ---------------------------------------------------------------------------

describe('extractContent', () => {
  it('文字列はそのまま返す', async () => {
    const { extractContent } = await loadModule()
    expect(extractContent('hello')).toBe('hello')
  })

  it('非文字列はフォールバックメッセージを返す', async () => {
    const { extractContent } = await loadModule()
    // console.error をスパイして出力抑制
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(extractContent({ unexpected: 'shape' })).toContain(
      'レスポンスの解析に失敗しました'
    )
    expect(extractContent(null)).toContain('レスポンスの解析に失敗しました')
    expect(extractContent(undefined)).toContain(
      'レスポンスの解析に失敗しました'
    )

    spy.mockRestore()
  })
})
