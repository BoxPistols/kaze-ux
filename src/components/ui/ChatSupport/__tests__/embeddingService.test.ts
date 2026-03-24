// embeddingService ユニットテスト

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  cosineSimilarity,
  fetchEmbeddings,
  fetchSingleEmbedding,
  VectorIndex,
} from '../embeddingService'

// ---------------------------------------------------------------------------
// cosineSimilarity
// ---------------------------------------------------------------------------

describe('cosineSimilarity', () => {
  it('同一ベクトルで1.0を返す', () => {
    const v = [1, 2, 3]
    expect(cosineSimilarity(v, v)).toBeCloseTo(1.0)
  })

  it('直交ベクトルで0.0を返す', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0.0)
  })

  it('逆向きベクトルで-1.0を返す', () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1.0)
  })

  it('長さが異なるベクトルで0を返す', () => {
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0)
  })

  it('ゼロベクトルで0を返す', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0)
  })

  it('類似したベクトルで高いスコアを返す', () => {
    const a = [0.8, 0.2, 0.1]
    const b = [0.7, 0.3, 0.1]
    expect(cosineSimilarity(a, b)).toBeGreaterThan(0.95)
  })
})

// ---------------------------------------------------------------------------
// fetchEmbeddings
// ---------------------------------------------------------------------------

describe('fetchEmbeddings', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('空配列で空配列を返す', async () => {
    const result = await fetchEmbeddings('test-key', [])
    expect(result).toEqual([])
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('APIレスポンスからembeddingをindex順に返す', async () => {
    const mockData = {
      data: [
        { embedding: [0.2, 0.3], index: 1 },
        { embedding: [0.1, 0.4], index: 0 },
      ],
    }
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    const result = await fetchEmbeddings('test-key', ['テスト1', 'テスト2'])
    expect(result).toEqual([
      [0.1, 0.4],
      [0.2, 0.3],
    ])
  })

  it('正しいリクエストパラメータを送信する', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ embedding: [0.1], index: 0 }] }),
    })

    await fetchEmbeddings('my-key', ['hello'])

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.openai.com/v1/embeddings',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer my-key',
        },
      })
    )

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(body.model).toBe('text-embedding-3-small')
    expect(body.input).toEqual(['hello'])
    expect(body.dimensions).toBe(512)
  })

  it('APIエラーでエラーを投げる', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { message: 'Invalid API key' } }),
    })

    await expect(fetchEmbeddings('bad-key', ['test'])).rejects.toThrow(
      'Invalid API key'
    )
  })
})

// ---------------------------------------------------------------------------
// fetchSingleEmbedding
// ---------------------------------------------------------------------------

describe('fetchSingleEmbedding', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('単一テキストのembeddingを返す', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ embedding: [0.5, 0.3, 0.2], index: 0 }],
        }),
    })

    const result = await fetchSingleEmbedding('key', 'テスト')
    expect(result).toEqual([0.5, 0.3, 0.2])
  })
})

// ---------------------------------------------------------------------------
// VectorIndex
// ---------------------------------------------------------------------------

describe('VectorIndex', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('初期状態ではisReady=false', () => {
    const idx = new VectorIndex()
    expect(idx.isReady()).toBe(false)
    expect(idx.getVectorCount()).toBe(0)
  })

  it('build後にisReady=trueになる', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            { embedding: [0.1, 0.2], index: 0 },
            { embedding: [0.3, 0.4], index: 1 },
          ],
        }),
    })

    const idx = new VectorIndex()
    await idx.build('key', [
      { id: 'a', text: 'テスト1', category: 'faq', sourceKey: '0' },
      { id: 'b', text: 'テスト2', category: 'faq', sourceKey: '1' },
    ])

    expect(idx.isReady()).toBe(true)
    expect(idx.getVectorCount()).toBe(2)
  })

  it('searchがスコア順で結果を返す', async () => {
    // ビルド時のembedding
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            { embedding: [1, 0], index: 0 },
            { embedding: [0, 1], index: 1 },
          ],
        }),
    })

    const idx = new VectorIndex()
    await idx.build('key', [
      { id: 'a', text: '色について', category: 'faq', sourceKey: '0' },
      {
        id: 'b',
        text: 'レイアウト',
        category: 'storyGuide',
        sourceKey: 'Layout/Grid',
      },
    ])

    // [1, 0]に近いクエリベクトル → 'a'が上位
    const results = idx.search([0.9, 0.1], 2, 0.0)
    expect(results.length).toBe(2)
    expect(results[0].id).toBe('a')
    expect(results[0].score).toBeGreaterThan(results[1].score)
  })

  it('thresholdでフィルタリングされる', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            { embedding: [1, 0], index: 0 },
            { embedding: [0, 1], index: 1 },
          ],
        }),
    })

    const idx = new VectorIndex()
    await idx.build('key', [
      { id: 'a', text: 'test1', category: 'faq', sourceKey: '0' },
      { id: 'b', text: 'test2', category: 'faq', sourceKey: '1' },
    ])

    // [1, 0]に近いクエリ → threshold 0.9だとaのみ
    const results = idx.search([0.95, 0.05], 10, 0.9)
    expect(results.length).toBe(1)
    expect(results[0].id).toBe('a')
  })

  it('未初期化時は空配列を返す', () => {
    const idx = new VectorIndex()
    const results = idx.search([1, 0], 5)
    expect(results).toEqual([])
  })

  it('clearでインデックスがリセットされる', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ embedding: [0.1], index: 0 }],
        }),
    })

    const idx = new VectorIndex()
    await idx.build('key', [
      { id: 'a', text: 'test', category: 'faq', sourceKey: '0' },
    ])
    expect(idx.isReady()).toBe(true)

    idx.clear()
    expect(idx.isReady()).toBe(false)
    expect(idx.getVectorCount()).toBe(0)
  })

  it('重複buildは1回のみ実行される', async () => {
    let callCount = 0
    fetchSpy.mockImplementation(() => {
      callCount++
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ embedding: [0.1], index: 0 }],
          }),
      })
    })

    const idx = new VectorIndex()
    const entries = [
      { id: 'a', text: 'test', category: 'faq' as const, sourceKey: '0' },
    ]

    // 同時にbuildを2回呼ぶ
    await Promise.all([idx.build('key', entries), idx.build('key', entries)])

    // fetch呼び出しは1回のみ
    expect(callCount).toBe(1)
  })
})
