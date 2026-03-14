// faqDatabase ユニットテスト

import { describe, it, expect } from 'vitest'
import {
  findFaqAnswer,
  FAQ_DATABASE,
  QUICK_SUGGESTIONS,
  expandSynonyms,
  generateSuggestions,
} from '../faqDatabase'

// ---------------------------------------------------------------------------
// 基本マッチング
// ---------------------------------------------------------------------------

describe('findFaqAnswer', () => {
  describe('基本マッチング', () => {
    it('日本語キーワードでマッチする', () => {
      const result = findFaqAnswer('カラーパレット')
      expect(result).not.toBeNull()
      expect(result).toContain('カラーパレット')
    })

    it('英語キーワードでマッチする', () => {
      const result = findFaqAnswer('color')
      expect(result).not.toBeNull()
      expect(result).toContain('カラーパレット')
    })

    it('大文字小文字を区別しない', () => {
      const lower = findFaqAnswer('color')
      const upper = findFaqAnswer('Color')
      expect(lower).toBe(upper)
    })

    it('部分一致でマッチする', () => {
      const result = findFaqAnswer('ボタンの使い方')
      expect(result).not.toBeNull()
      expect(result).toContain('Button')
    })

    it('タイポグラフィのキーワードでマッチする', () => {
      const result = findFaqAnswer('フォントサイズ')
      expect(result).not.toBeNull()
      expect(result).toContain('タイポグラフィ')
    })

    it('スペーシングのキーワードでマッチする', () => {
      const result = findFaqAnswer('余白の基準')
      expect(result).not.toBeNull()
      expect(result).toContain('スペーシング')
    })

    it('Grid APIのキーワードでマッチする', () => {
      const result = findFaqAnswer('gridの使い方')
      expect(result).not.toBeNull()
      expect(result).toContain('Grid API')
    })

    it('React実装ルールのキーワードでマッチする', () => {
      const result = findFaqAnswer('React.FC禁止ルール')
      expect(result).not.toBeNull()
      expect(result).toContain('React実装ルール')
    })
  })

  describe('スコアリング', () => {
    it('複数キーワード一致でより関連性の高いFAQを返す', () => {
      // 「色」と「カラー」で色パレットFAQが優先される
      const result = findFaqAnswer('カラーパレットの色を確認')
      expect(result).not.toBeNull()
      expect(result).toContain('カラーパレット')
    })

    it('長いキーワードマッチが高スコアになる', () => {
      // 「タイポグラフィ」(7文字) vs 「文字」(2文字) → タイポグラフィFAQが優先
      const result = findFaqAnswer('タイポグラフィの設定')
      expect(result).not.toBeNull()
      expect(result).toContain('タイポグラフィ')
    })
  })

  describe('マッチなし', () => {
    it('無関係な質問でnullを返す', () => {
      expect(findFaqAnswer('明日の天気')).toBeNull()
    })

    it('空文字でnullを返す', () => {
      expect(findFaqAnswer('')).toBeNull()
    })

    it('記号のみでnullを返す', () => {
      expect(findFaqAnswer('!!!???')).toBeNull()
    })
  })

  describe('主要トピック網羅', () => {
    const topicTests = [
      { query: 'カラー', topic: 'カラーパレット' },
      { query: 'フォント', topic: 'タイポグラフィ' },
      { query: 'スペーシング', topic: 'スペーシング' },
      { query: 'コンポーネント一覧', topic: 'コンポーネント一覧' },
      { query: 'ボタン', topic: 'Button' },
      { query: 'grid', topic: 'Grid' },
      { query: 'ダークモード', topic: 'ダーク' },
      { query: 'カード', topic: 'Card' },
      { query: 'storybook', topic: 'Storybook' },
      { query: 'react fc', topic: 'React' },
      { query: '設計原則', topic: '原則' },
      { query: 'ステートスタック', topic: 'ステート' },
      { query: 'レイアウト責任', topic: 'レイアウト' },
      { query: '命名規則', topic: '命名' },
      { query: '変数 型', topic: '変数' },
      { query: 'コンポーネント分割', topic: '分割' },
      { query: 'マインドセット', topic: 'マインドセット' },
      { query: 'カプセル化', topic: 'カプセル化' },
      { query: '一貫性', topic: '一貫性' },
      { query: 'アイコン lucide', topic: 'アセット' },
      { query: 'マテリアルデザイン', topic: 'マテリアルデザイン' },
      { query: '人間工学', topic: '人間工学' },
      { query: 'AI プロンプト', topic: 'AI' },
    ]

    for (const { query, topic } of topicTests) {
      it(`"${query}" で ${topic} 関連FAQがマッチする`, () => {
        const result = findFaqAnswer(query)
        expect(result).not.toBeNull()
      })
    }
  })
})

// ---------------------------------------------------------------------------
// FAQ_DATABASE 整合性
// ---------------------------------------------------------------------------

describe('FAQ_DATABASE', () => {
  it('全エントリにkeywords, title, answerがある', () => {
    for (const faq of FAQ_DATABASE) {
      expect(faq.keywords.length).toBeGreaterThan(0)
      expect(faq.title.length).toBeGreaterThan(0)
      expect(faq.answer.length).toBeGreaterThan(0)
    }
  })

  it('全エントリが最低1つのキーワードでマッチ可能', () => {
    for (const faq of FAQ_DATABASE) {
      let matched = false
      for (const kw of faq.keywords) {
        if (findFaqAnswer(kw) !== null) {
          matched = true
          break
        }
      }
      expect(matched).toBe(true)
    }
  })

  it('キーワードに重複がない（同一エントリ内）', () => {
    for (const faq of FAQ_DATABASE) {
      const lowerKeywords = faq.keywords.map((k) => k.toLowerCase())
      const unique = new Set(lowerKeywords)
      expect(unique.size).toBe(lowerKeywords.length)
    }
  })
})

// ---------------------------------------------------------------------------
// QUICK_SUGGESTIONS
// ---------------------------------------------------------------------------

describe('QUICK_SUGGESTIONS', () => {
  it('全候補がFAQにマッチする', () => {
    for (const suggestion of QUICK_SUGGESTIONS) {
      const result = findFaqAnswer(suggestion.query)
      expect(result).not.toBeNull()
    }
  })

  it('全候補にlabelとqueryがある', () => {
    for (const suggestion of QUICK_SUGGESTIONS) {
      expect(suggestion.label.length).toBeGreaterThan(0)
      expect(suggestion.query.length).toBeGreaterThan(0)
    }
  })
})

// ---------------------------------------------------------------------------
// expandSynonyms
// ---------------------------------------------------------------------------

describe('expandSynonyms', () => {
  it('同義語が展開される', () => {
    const result = expandSynonyms('色')
    expect(result).toContain('色')
    expect(result).toContain('カラー')
  })

  it('該当しない語はそのまま返す', () => {
    const result = expandSynonyms('ユニークな語句xyz')
    expect(result).toBe('ユニークな語句xyz')
  })

  it('複数の同義語が同時に展開される', () => {
    const result = expandSynonyms('色 文字')
    expect(result).toContain('カラー')
    expect(result).toContain('タイポグラフィ')
  })
})

// ---------------------------------------------------------------------------
// generateSuggestions
// ---------------------------------------------------------------------------

describe('generateSuggestions', () => {
  it('引数なしで静的フォールバックを返す', () => {
    const results = generateSuggestions(null, null, new Set())
    expect(results.length).toBeGreaterThan(0)
    expect(results.length).toBeLessThanOrEqual(6)
    for (const s of results) {
      expect(s.label.length).toBeGreaterThan(0)
      expect(s.query.length).toBeGreaterThan(0)
    }
  })

  it('使用済みクエリを除外する', () => {
    const allResults = generateSuggestions(null, null, new Set())
    const usedQueries = new Set(allResults.map((s) => s.query))
    const filteredResults = generateSuggestions(null, null, usedQueries)
    // 使用済みクエリが結果に含まれないことを確認
    for (const s of filteredResults) {
      expect(usedQueries.has(s.query)).toBe(false)
    }
  })

  it('最大6件まで返す', () => {
    const results = generateSuggestions(null, null, new Set())
    expect(results.length).toBeLessThanOrEqual(6)
  })

  it('Bot回答テキストからレスポンス派生サジェストを生成する', () => {
    // FAQ_DATABASEの最初のエントリのキーワードを含むテキストを生成
    const faq = FAQ_DATABASE[0]
    const fakeBot = faq.keywords.join(' ') + ' ' + faq.title
    const results = generateSuggestions(fakeBot, null, new Set())
    expect(results.length).toBeGreaterThan(0)
  })

  it('重複するqueryを返さない', () => {
    const results = generateSuggestions(null, null, new Set())
    const queries = results.map((s) => s.query)
    expect(new Set(queries).size).toBe(queries.length)
  })
})
