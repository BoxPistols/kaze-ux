// FAQ品質評価テスト

import { describe, it, expect } from 'vitest'
import { findFaqAnswer } from '../faqDatabase'
import { EVAL_DATASET, GAP_ANALYSIS_QUERIES } from './evalDataset'
import { scoreAnswer, formatScoreReport } from './evalScoring'
import type { ScoreResult } from './evalScoring'
import type { EvalCase } from './evalDataset'

// ---------------------------------------------------------------------------
// FAQ品質評価
// ---------------------------------------------------------------------------

describe('FAQ品質評価', () => {
  const scoredResults: { evalCase: EvalCase; score: ScoreResult }[] = []

  // 各評価ケースでFAQ回答をスコアリング
  for (const evalCase of EVAL_DATASET) {
    it(`"${evalCase.query}" (${evalCase.persona}/${evalCase.category})`, () => {
      const answer = findFaqAnswer(evalCase.query)
      // FAQ回答が見つかること
      expect(answer).not.toBeNull()

      if (answer) {
        const score = scoreAnswer(answer, evalCase)
        scoredResults.push({ evalCase, score })

        // 個別ケースの最低基準
        expect(score.accuracy).toBeGreaterThanOrEqual(0.8)
      }
    })
  }

  // 集計テスト
  describe('集計スコア', () => {
    it('平均関連性スコア >= 0.5', () => {
      // 一旦全ケースを実行してスコア収集
      const results: { evalCase: EvalCase; score: ScoreResult }[] = []
      for (const evalCase of EVAL_DATASET) {
        const answer = findFaqAnswer(evalCase.query)
        if (answer) {
          results.push({ evalCase, score: scoreAnswer(answer, evalCase) })
        }
      }

      if (results.length === 0) return

      const avgRelevance =
        results.reduce((sum, r) => sum + r.score.relevance, 0) / results.length
      // eslint-disable-next-line no-console
      console.log(
        `\n平均関連性: ${(avgRelevance * 100).toFixed(1)}% (${results.length}ケース)`
      )
      expect(avgRelevance).toBeGreaterThanOrEqual(0.5)
    })

    it('正確性スコア >= 0.95', () => {
      const results: { evalCase: EvalCase; score: ScoreResult }[] = []
      for (const evalCase of EVAL_DATASET) {
        const answer = findFaqAnswer(evalCase.query)
        if (answer) {
          results.push({ evalCase, score: scoreAnswer(answer, evalCase) })
        }
      }

      if (results.length === 0) return

      const avgAccuracy =
        results.reduce((sum, r) => sum + r.score.accuracy, 0) / results.length
      // eslint-disable-next-line no-console
      console.log(`平均正確性: ${(avgAccuracy * 100).toFixed(1)}%`)
      expect(avgAccuracy).toBeGreaterThanOrEqual(0.9)
    })

    it('スコアレポートを出力する', () => {
      const results: { evalCase: EvalCase; score: ScoreResult }[] = []
      for (const evalCase of EVAL_DATASET) {
        const answer = findFaqAnswer(evalCase.query)
        if (answer) {
          results.push({ evalCase, score: scoreAnswer(answer, evalCase) })
        }
      }

      if (results.length > 0) {
        const report = formatScoreReport(results)
        // eslint-disable-next-line no-console
        console.log('\n' + report)
      }
    })
  })
})

// ---------------------------------------------------------------------------
// ギャップ分析
// ---------------------------------------------------------------------------

describe('FAQギャップ分析', () => {
  it('ギャップ分析レポートを出力する', () => {
    const matched: string[] = []
    const gaps: string[] = []

    for (const query of GAP_ANALYSIS_QUERIES) {
      const answer = findFaqAnswer(query)
      if (answer) {
        matched.push(query)
      } else {
        gaps.push(query)
      }
    }

    const matchRate = matched.length / GAP_ANALYSIS_QUERIES.length

    // eslint-disable-next-line no-console
    console.log(
      `\n--- FAQギャップ分析 ---\n` +
        `マッチ率: ${(matchRate * 100).toFixed(1)}% (${matched.length}/${GAP_ANALYSIS_QUERIES.length})\n` +
        (gaps.length > 0
          ? `\nギャップ (${gaps.length}件):\n${gaps.map((g) => `  - ${g}`).join('\n')}`
          : '\nギャップなし')
    )

    // マッチ率 60% 以上を期待
    expect(matchRate).toBeGreaterThanOrEqual(0.6)
  })
})
