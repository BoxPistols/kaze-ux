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

    // reasoning token 分の buffer 加算を担保（不足すると本文が空になる）
    it('Gemini 2.5 系は 4000 + buffer 1200', async () => {
      mockSuccess('ok')
      const { callAI } = await loadModule()

      await callAI({ ...baseConfig, model: 'gemini-2.5-flash' }, userMessage)

      expect(generateTextMock.mock.calls[0][0].maxOutputTokens).toBe(5200)
    })

    it('isTest=true かつ Gemini 2.5 系は reasoning buffer + 10', async () => {
      mockSuccess('ok')
      const { callAI } = await loadModule()

      await callAI({ ...baseConfig, model: 'gemini-2.5-flash' }, userMessage, true)

      expect(generateTextMock.mock.calls[0][0].maxOutputTokens).toBe(1210)
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

// ---------------------------------------------------------------------------
// callAI (バックエンドモード) — VITE_API_BASE が設定されている場合の挙動
// ---------------------------------------------------------------------------

describe('callAI (backend mode)', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_API_BASE', 'https://api.example.com')
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  const mockBackendResponse = (
    status: number,
    body: object,
    headers: Record<string, string> = {}
  ) => {
    fetchSpy.mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      headers: new Headers(headers),
      json: () => Promise.resolve(body),
    })
  }

  describe('正常系', () => {
    it('VITE_API_BASE が設定されると /api/ai を呼ぶ', async () => {
      mockBackendResponse(200, { text: 'こんにちは', finishReason: 'stop' })
      const { callAI } = await import('../chatAiService')

      const result = await callAI(baseConfig, userMessage)

      expect(result).toBe('こんにちは')
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.example.com/api/ai',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('config.apiKey があれば X-User-API-Key ヘッダーを送る', async () => {
      mockBackendResponse(200, { text: 'ok', finishReason: 'stop' })
      const { callAI } = await import('../chatAiService')

      await callAI({ ...baseConfig, apiKey: 'sk-user-key' }, userMessage)

      const callArgs = fetchSpy.mock.calls[0][1]
      expect(callArgs.headers['X-User-API-Key']).toBe('sk-user-key')
    })

    it('config.apiKey が空なら X-User-API-Key を送らない', async () => {
      mockBackendResponse(200, { text: 'ok', finishReason: 'stop' })
      const { callAI } = await import('../chatAiService')

      await callAI({ ...baseConfig, apiKey: '' }, userMessage)

      const callArgs = fetchSpy.mock.calls[0][1]
      expect(callArgs.headers['X-User-API-Key']).toBeUndefined()
    })

    it('リクエストボディに messages / model / maxOutputTokens を含む', async () => {
      mockBackendResponse(200, { text: 'ok', finishReason: 'stop' })
      const { callAI } = await import('../chatAiService')

      await callAI({ ...baseConfig, model: 'gpt-5-nano' }, userMessage)

      const callArgs = fetchSpy.mock.calls[0][1]
      const body = JSON.parse(callArgs.body)
      expect(body.messages).toEqual(userMessage)
      expect(body.model).toBe('gpt-5-nano')
      expect(body.maxOutputTokens).toBe(4000)
    })
  })

  describe('エラーハンドリング', () => {
    it('429 → AIQuotaError をスロー', async () => {
      mockBackendResponse(
        429,
        { error: 'Daily quota exceeded', limit: 30, remaining: 0, reset: 123 },
        { 'X-RateLimit-Limit': '30', 'X-RateLimit-Remaining': '0' }
      )
      const { callAI, AIQuotaError } = await import('../chatAiService')

      await expect(callAI(baseConfig, userMessage)).rejects.toThrow(
        AIQuotaError
      )
    })

    it('AIQuotaError は remaining/limit/reset を持つ', async () => {
      mockBackendResponse(429, {
        error: 'Daily quota exceeded',
        limit: 30,
        remaining: 0,
        reset: 999,
      })
      const { callAI, AIQuotaError } = await import('../chatAiService')

      try {
        await callAI(baseConfig, userMessage)
        expect.fail('should throw')
      } catch (error) {
        expect(error).toBeInstanceOf(AIQuotaError)
        if (error instanceof AIQuotaError) {
          expect(error.limit).toBe(30)
          expect(error.remaining).toBe(0)
          expect(error.reset).toBe(999)
        }
      }
    })

    it('403 + USER_KEY_REQUIRED → AIUserKeyRequiredError をスロー', async () => {
      mockBackendResponse(403, {
        error: 'requires user key',
        code: 'USER_KEY_REQUIRED',
      })
      const { callAI, AIUserKeyRequiredError } =
        await import('../chatAiService')

      await expect(callAI(baseConfig, userMessage)).rejects.toThrow(
        AIUserKeyRequiredError
      )
    })

    it('403 (オリジン拒否等) は通常のエラー', async () => {
      mockBackendResponse(403, { error: 'Origin not allowed' })
      const { callAI } = await import('../chatAiService')

      await expect(callAI(baseConfig, userMessage)).rejects.toThrow(
        'Origin not allowed'
      )
    })

    it('5xx エラーをスロー', async () => {
      mockBackendResponse(502, { error: 'AI provider error' })
      const { callAI } = await import('../chatAiService')

      await expect(callAI(baseConfig, userMessage)).rejects.toThrow(
        'AI provider error'
      )
    })
  })

  describe('finishReason フォールバック', () => {
    it('空テキスト + finishReason=length でトークン上限メッセージ', async () => {
      mockBackendResponse(200, { text: '', finishReason: 'length' })
      const { callAI } = await import('../chatAiService')

      const result = await callAI(baseConfig, userMessage)
      expect(result).toContain('トークン上限')
    })
  })
})
