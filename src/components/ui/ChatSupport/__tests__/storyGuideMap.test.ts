// storyGuideMap ユニットテスト

import { describe, it, expect } from 'vitest'
import { findStoryGuide, STORY_GUIDE_MAP } from '../storyGuideMap'

// ---------------------------------------------------------------------------
// findStoryGuide
// ---------------------------------------------------------------------------

describe('findStoryGuide', () => {
  describe('完全一致', () => {
    it('完全一致でエントリを返す', () => {
      const result = findStoryGuide('Guide/Introduction')
      expect(result).not.toBeNull()
      expect(result!.summary).toContain('デザインシステム')
    })

    it('Design Tokens/Color Palette にマッチする', () => {
      const result = findStoryGuide('Design Tokens/Color Palette')
      expect(result).not.toBeNull()
      expect(result!.summary).toContain('カラーパレット')
    })

    it('Layout/Grid System にマッチする', () => {
      const result = findStoryGuide('Layout/Grid System')
      expect(result).not.toBeNull()
      expect(result!.summary).toContain('Grid')
    })
  })

  describe('前方一致', () => {
    it('ストーリー名バリエーションで前方一致する', () => {
      // "Guide/Introduction/Default" のようなケース
      const result = findStoryGuide('Guide/Introduction/Default')
      expect(result).not.toBeNull()
      expect(result!.summary).toContain('デザインシステム')
    })

    it('サブストーリーで親にフォールバックする', () => {
      const result = findStoryGuide('Design Tokens/Typography/SomeVariant')
      expect(result).not.toBeNull()
      expect(result!.summary).toContain('タイポグラフィ')
    })
  })

  describe('マッチなし', () => {
    it('存在しないタイトルでnullを返す', () => {
      expect(findStoryGuide('NonExistent/Page')).toBeNull()
    })

    it('空文字でnullを返す', () => {
      expect(findStoryGuide('')).toBeNull()
    })
  })
})

// ---------------------------------------------------------------------------
// STORY_GUIDE_MAP 整合性
// ---------------------------------------------------------------------------

describe('STORY_GUIDE_MAP', () => {
  const entries = Object.entries(STORY_GUIDE_MAP)

  it('全エントリのsummaryが非空', () => {
    for (const [key, entry] of entries) {
      expect(entry.summary.length, `${key} の summary が空`).toBeGreaterThan(0)
    }
  })

  it('全エントリのcodeContextが非空配列', () => {
    for (const [key, entry] of entries) {
      expect(
        entry.codeContext.length,
        `${key} の codeContext が空`
      ).toBeGreaterThan(0)
      for (const ctx of entry.codeContext) {
        expect(ctx.length).toBeGreaterThan(0)
      }
    }
  })

  it('referencesがある場合はURL形式', () => {
    for (const [key, entry] of entries) {
      if (entry.references) {
        for (const ref of entry.references) {
          expect(ref, `${key} のreference "${ref}" がURL形式でない`).toMatch(
            /^https?:\/\//
          )
        }
      }
    }
  })

  it('relatedがある場合はSTORY_GUIDE_MAPのキーを参照', () => {
    const allKeys = new Set(Object.keys(STORY_GUIDE_MAP))
    for (const [key, entry] of entries) {
      if (entry.related) {
        for (const rel of entry.related) {
          expect(
            allKeys.has(rel),
            `${key} の related "${rel}" がSTORY_GUIDE_MAPに存在しない`
          ).toBe(true)
        }
      }
    }
  })
})
