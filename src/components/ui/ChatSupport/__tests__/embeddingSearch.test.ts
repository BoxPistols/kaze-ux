// embeddingSearch ユニットテスト

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  buildSemanticContext,
  findSemanticFaqAnswer,
  clearEmbeddingIndex,
  getEmbeddingIndex,
  initEmbeddingIndex,
} from '../embeddingSearch'
import { FAQ_DATABASE } from '../faqDatabase'

import type { SemanticSearchResult } from '../embeddingService'

// ---------------------------------------------------------------------------
// buildSemanticContext
// ---------------------------------------------------------------------------

describe('buildSemanticContext', () => {
  it('空配列で空文字を返す', () => {
    expect(buildSemanticContext([])).toBe('')
  })

  it('結果をカテゴリ別にフォーマットする', () => {
    const results: SemanticSearchResult[] = [
      {
        id: 'faq-0',
        score: 0.85,
        text: 'カラーパレットについて',
        category: 'faq',
        sourceKey: '0',
      },
      {
        id: 'guide-typography',
        score: 0.72,
        text: 'タイポグラフィガイド',
        category: 'storyGuide',
        sourceKey: 'Design Tokens/Typography',
      },
    ]

    const context = buildSemanticContext(results)
    expect(context).toContain('セマンティック検索結果')
    expect(context).toContain('FAQ')
    expect(context).toContain('85%')
    expect(context).toContain('ページガイド')
    expect(context).toContain('72%')
  })

  it('MUIリファレンスカテゴリを表示する', () => {
    const results: SemanticSearchResult[] = [
      {
        id: 'mui-button',
        score: 0.9,
        text: 'Buttonコンポーネント',
        category: 'muiKnowledge',
        sourceKey: 'button',
      },
    ]

    const context = buildSemanticContext(results)
    expect(context).toContain('MUIリファレンス')
  })
})

// ---------------------------------------------------------------------------
// findSemanticFaqAnswer
// ---------------------------------------------------------------------------

describe('findSemanticFaqAnswer', () => {
  it('FAQカテゴリでスコア0.5以上の場合に回答を返す', () => {
    const results: SemanticSearchResult[] = [
      {
        id: 'faq-0',
        score: 0.75,
        text: 'カラー',
        category: 'faq',
        sourceKey: '0',
      },
    ]

    const answer = findSemanticFaqAnswer(results)
    expect(answer).toBe(FAQ_DATABASE[0].answer)
  })

  it('スコア0.5未満ではnullを返す', () => {
    const results: SemanticSearchResult[] = [
      {
        id: 'faq-0',
        score: 0.3,
        text: 'カラー',
        category: 'faq',
        sourceKey: '0',
      },
    ]

    expect(findSemanticFaqAnswer(results)).toBeNull()
  })

  it('FAQカテゴリがなければnullを返す', () => {
    const results: SemanticSearchResult[] = [
      {
        id: 'guide-1',
        score: 0.9,
        text: 'ガイド',
        category: 'storyGuide',
        sourceKey: 'Guide/Introduction',
      },
    ]

    expect(findSemanticFaqAnswer(results)).toBeNull()
  })

  it('空配列でnullを返す', () => {
    expect(findSemanticFaqAnswer([])).toBeNull()
  })

  it('不正なsourceKeyでnullを返す', () => {
    const results: SemanticSearchResult[] = [
      {
        id: 'faq-999',
        score: 0.8,
        text: 'test',
        category: 'faq',
        sourceKey: '999',
      },
    ]

    expect(findSemanticFaqAnswer(results)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// clearEmbeddingIndex
// ---------------------------------------------------------------------------

describe('clearEmbeddingIndex', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    clearEmbeddingIndex()
  })

  it('クリア後にインデックスがnullになる', () => {
    clearEmbeddingIndex()
    expect(getEmbeddingIndex()).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// initEmbeddingIndex の二重構築防止
// ---------------------------------------------------------------------------

describe('initEmbeddingIndex', () => {
  // embedding API は課金対象。同時呼び出しで二重に叩かないことを担保する。
  // VectorIndex 側の initializing はインスタンス変数なので、呼び出しごとに
  // new する initEmbeddingIndex では効かない（それが元の不具合）
  const stubEmbeddingApi = () => {
    const fetchMock = vi.fn(
      async (_url: string | URL | Request, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body)) as { input: string[] }
        // 実 API と同じく index 付きで返す
        await new Promise((resolve) => setTimeout(resolve, 5))
        return {
          ok: true,
          json: async () => ({
            data: body.input.map((_text, index) => ({
              embedding: [1, 0, 0],
              index,
            })),
          }),
        } as unknown as Response
      }
    )
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
  }

  beforeEach(() => {
    clearEmbeddingIndex()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    clearEmbeddingIndex()
  })

  it('同時に呼んでも embedding API の呼び出しは 1 回分で済む', async () => {
    const fetchMock = stubEmbeddingApi()

    await Promise.all([
      initEmbeddingIndex('test-key'),
      initEmbeddingIndex('test-key'),
      initEmbeddingIndex('test-key'),
    ])

    const single = fetchMock.mock.calls.length
    expect(single).toBeGreaterThan(0)

    // 逐次で 1 回構築した場合と同じ回数であること
    clearEmbeddingIndex()
    fetchMock.mockClear()
    await initEmbeddingIndex('test-key')
    expect(single).toBe(fetchMock.mock.calls.length)
  })

  it('構築済みなら再度呼んでも API を叩かない', async () => {
    const fetchMock = stubEmbeddingApi()

    await initEmbeddingIndex('test-key')
    expect(getEmbeddingIndex()?.isReady()).toBe(true)

    fetchMock.mockClear()
    await initEmbeddingIndex('test-key')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('失敗した構築は次の呼び出しで再試行できる', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, json: async () => ({}) }) as Response)
    )
    await initEmbeddingIndex('test-key')
    expect(getEmbeddingIndex()).toBeNull()

    // 失敗後に buildPromise が残っていると、以後永久に再構築できない
    const fetchMock = stubEmbeddingApi()
    await initEmbeddingIndex('test-key')
    expect(fetchMock).toHaveBeenCalled()
    expect(getEmbeddingIndex()?.isReady()).toBe(true)
  })
})
