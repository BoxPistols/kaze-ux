// chatAiService ユニットテスト

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { extractContent, callAI } from '../chatAiService'
import type { ChatSupportConfig } from '../chatSupportTypes'

// ---------------------------------------------------------------------------
// extractContent
// ---------------------------------------------------------------------------

describe('extractContent', () => {
  describe('OpenAI標準形式', () => {
    it('choices[0].message.content から抽出する', () => {
      const data = {
        choices: [{ message: { content: 'こんにちは' } }],
      }
      expect(extractContent(data)).toBe('こんにちは')
    })

    it('数値contentを文字列に変換する', () => {
      const data = { choices: [{ message: { content: 42 } }] }
      expect(extractContent(data)).toBe('42')
    })
  })

  describe('Gemini互換形式', () => {
    it('choices[0].text から抽出する', () => {
      const data = { choices: [{ text: 'Gemini応答' }] }
      expect(extractContent(data)).toBe('Gemini応答')
    })
  })

  describe('Geminiネイティブ形式', () => {
    it('candidates[0].content.parts[0].text から抽出する', () => {
      const data = {
        candidates: [{ content: { parts: [{ text: 'ネイティブ応答' }] } }],
      }
      expect(extractContent(data)).toBe('ネイティブ応答')
    })
  })

  describe('OpenAI Responses API形式', () => {
    it('output[].content[].text から抽出する', () => {
      const data = {
        output: [
          {
            type: 'message',
            content: [{ type: 'output_text', text: 'Responses API応答' }],
          },
        ],
      }
      expect(extractContent(data)).toBe('Responses API応答')
    })

    it('output内のmessage以外のtypeはスキップする', () => {
      const data = {
        output: [
          {
            type: 'reasoning',
            content: [{ type: 'output_text', text: '思考' }],
          },
          {
            type: 'message',
            content: [{ type: 'output_text', text: '回答' }],
          },
        ],
      }
      expect(extractContent(data)).toBe('回答')
    })
  })

  describe('refusal形式', () => {
    it('message.refusal から抽出する', () => {
      const data = {
        choices: [{ message: { content: null, refusal: 'ポリシー違反です' } }],
      }
      expect(extractContent(data)).toBe('ポリシー違反です')
    })
  })

  describe('推論モデル空content', () => {
    it('finish_reason=length + 空contentでトークン上限メッセージを返す', () => {
      const data = {
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: '', refusal: null },
            finish_reason: 'length',
          },
        ],
      }
      const result = extractContent(data)
      expect(result).toContain('トークン上限に達しました')
    })

    it('finish_reason=length + content=nullでもトークン上限メッセージを返す', () => {
      const data = {
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: null, refusal: null },
            finish_reason: 'length',
          },
        ],
      }
      const result = extractContent(data)
      expect(result).toContain('トークン上限に達しました')
    })
  })

  describe('フラットtext形式', () => {
    it('data.text から抽出する', () => {
      const data = { text: 'フラット応答' }
      expect(extractContent(data)).toBe('フラット応答')
    })
  })

  describe('深層探索フォールバック', () => {
    it('ネストされたtext フィールドを探索する', () => {
      const data = {
        result: { nested: { text: '深層テキスト' } },
      }
      expect(extractContent(data)).toBe('深層テキスト')
    })

    it('配列内のtext フィールドを探索する', () => {
      const data = {
        items: [{ id: 1 }, { text: '配列内テキスト' }],
      }
      expect(extractContent(data)).toBe('配列内テキスト')
    })

    it('深さ制限（4）を超えると探索しない', () => {
      const data = {
        a: { b: { c: { d: { e: { text: '深すぎる' } } } } },
      }
      const result = extractContent(data)
      expect(result).toContain('レスポンス形式を解析できませんでした')
    })
  })

  describe('エッジケース', () => {
    it('空choicesでフォールバックメッセージを返す', () => {
      const data = { choices: [] }
      const result = extractContent(data)
      expect(result).toContain('レスポンス形式を解析できませんでした')
    })

    it('空オブジェクトでフォールバックメッセージを返す', () => {
      const result = extractContent({})
      expect(result).toContain('レスポンス形式を解析できませんでした')
    })

    it('choicesにmessageがない場合、深層探索でフォールバック', () => {
      const data = { choices: [{}] }
      const result = extractContent(data)
      expect(result).toContain('レスポンス形式を解析できませんでした')
    })

    it('message.contentが空文字の場合フォールバック', () => {
      const data = { choices: [{ message: { content: '' } }] }
      const result = extractContent(data)
      // 空文字はfalsyなのでフォールバックされる
      expect(result).toContain('レスポンス形式を解析できませんでした')
    })

    it('OpenAI形式がResponses APIより優先される', () => {
      const data = {
        choices: [{ message: { content: 'OpenAI' } }],
        output: [
          {
            type: 'message',
            content: [{ type: 'output_text', text: 'Responses' }],
          },
        ],
      }
      expect(extractContent(data)).toBe('OpenAI')
    })

    it('OpenAI形式がGeminiネイティブより優先される', () => {
      const data = {
        choices: [{ message: { content: 'OpenAI' } }],
        candidates: [{ content: { parts: [{ text: 'Gemini' }] } }],
      }
      expect(extractContent(data)).toBe('OpenAI')
    })
  })
})

// ---------------------------------------------------------------------------
// callAI
// ---------------------------------------------------------------------------

describe('callAI', () => {
  const baseConfig: ChatSupportConfig = {
    apiKey: 'test-key-123',
    model: 'gpt-4.1-nano',
    uiMode: 'widget',
    sidebarWidth: 400,
    shortcuts: {} as ChatSupportConfig['shortcuts'],
  }

  const mockMessages = [{ role: 'user', content: 'テスト' }]

  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockFetchSuccess = (data: Record<string, unknown>) => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
    })
  }

  describe('URL切替', () => {
    it('OpenAIモデルはOpenAI URLを使用する', async () => {
      const data = { choices: [{ message: { content: 'ok' } }] }
      mockFetchSuccess(data)

      await callAI(baseConfig, mockMessages)

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('GeminiモデルはGemini URLを使用する', async () => {
      const geminiConfig = { ...baseConfig, model: 'gemini-2.5-flash' }
      const data = { choices: [{ message: { content: 'ok' } }] }
      mockFetchSuccess(data)

      await callAI(geminiConfig, mockMessages)

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('リクエストボディ', () => {
    it('gpt-5-miniはmax_completion_tokens=16000を使用する', async () => {
      const gpt5Config = { ...baseConfig, model: 'gpt-5-mini' }
      const data = { choices: [{ message: { content: 'ok' } }] }
      mockFetchSuccess(data)

      await callAI(gpt5Config, mockMessages)

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
      expect(body.max_completion_tokens).toBe(16000)
      expect(body.max_tokens).toBeUndefined()
      expect(body.temperature).toBeUndefined()
    })

    it('gpt-5-nanoはmax_completion_tokens=4000を使用する（コスト最適化）', async () => {
      const gpt5NanoConfig = { ...baseConfig, model: 'gpt-5-nano' }
      const data = { choices: [{ message: { content: 'ok' } }] }
      mockFetchSuccess(data)

      await callAI(gpt5NanoConfig, mockMessages)

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
      expect(body.max_completion_tokens).toBe(4000)
      expect(body.max_tokens).toBeUndefined()
      expect(body.temperature).toBeUndefined()
    })

    it('通常モデルはmax_tokensとtemperatureを使用する', async () => {
      const data = { choices: [{ message: { content: 'ok' } }] }
      mockFetchSuccess(data)

      await callAI(baseConfig, mockMessages)

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
      expect(body.max_tokens).toBe(4000)
      expect(body.temperature).toBe(0.7)
      expect(body.max_completion_tokens).toBeUndefined()
    })

    it('isTest=trueでトークン数を50に制限する', async () => {
      const data = { choices: [{ message: { content: 'ok' } }] }
      mockFetchSuccess(data)

      await callAI(baseConfig, mockMessages, true)

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
      expect(body.max_tokens).toBe(50)
    })

    it('gpt-5 + isTest=trueでmax_completion_tokens=50', async () => {
      const gpt5Config = { ...baseConfig, model: 'gpt-5-mini' }
      const data = { choices: [{ message: { content: 'ok' } }] }
      mockFetchSuccess(data)

      await callAI(gpt5Config, mockMessages, true)

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
      expect(body.max_completion_tokens).toBe(50)
    })
  })

  describe('認証ヘッダー', () => {
    it('Bearer認証ヘッダーを送信する', async () => {
      const data = { choices: [{ message: { content: 'ok' } }] }
      mockFetchSuccess(data)

      await callAI(baseConfig, mockMessages)

      const headers = fetchSpy.mock.calls[0][1].headers
      expect(headers.Authorization).toBe('Bearer test-key-123')
    })
  })

  describe('エラーハンドリング', () => {
    it('HTTPエラーでエラーメッセージを投げる', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: 'Invalid API key' } }),
      })

      await expect(callAI(baseConfig, mockMessages)).rejects.toThrow(
        'Invalid API key'
      )
    })

    it('choicesもoutputもないレスポンスでエラーを投げる', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: '123' }),
      })

      await expect(callAI(baseConfig, mockMessages)).rejects.toThrow(
        'レスポンス形式が不正です'
      )
    })

    it('output[]があればchoicesなしでも成功する', async () => {
      const data = {
        output: [
          {
            type: 'message',
            content: [{ type: 'output_text', text: 'Responses API' }],
          },
        ],
      }
      mockFetchSuccess(data)

      const result = await callAI(baseConfig, mockMessages)
      expect(result).toEqual(data)
    })

    it('JSONパースエラーで適切なメッセージを投げる', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('invalid json')),
      })

      await expect(callAI(baseConfig, mockMessages)).rejects.toThrow(
        'レスポンスの解析に失敗しました'
      )
    })

    it('AbortErrorがそのまま伝播する', async () => {
      const abortError = new DOMException('signal is aborted', 'AbortError')
      fetchSpy.mockRejectedValue(abortError)

      await expect(callAI(baseConfig, mockMessages)).rejects.toThrow()
    })
  })

  describe('レスポンス', () => {
    it('成功時にレスポンスデータを返す', async () => {
      const data = {
        id: 'chatcmpl-123',
        choices: [{ message: { content: 'テスト応答' } }],
      }
      mockFetchSuccess(data)

      const result = await callAI(baseConfig, mockMessages)
      expect(result).toEqual(data)
    })
  })
})
