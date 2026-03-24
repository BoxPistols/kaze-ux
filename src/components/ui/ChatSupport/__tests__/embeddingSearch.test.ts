// embeddingSearch ユニットテスト

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  buildSemanticContext,
  findSemanticFaqAnswer,
  clearEmbeddingIndex,
  getEmbeddingIndex,
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
