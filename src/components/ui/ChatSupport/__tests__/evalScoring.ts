// 回答スコアリング関数

import type { EvalCase } from './evalDataset'

// ---------------------------------------------------------------------------
// スコア結果型
// ---------------------------------------------------------------------------

export interface ScoreResult {
  /** 関連性: 期待要素のカバー率 (0-1) */
  relevance: number
  /** 正確性: 禁止要素の不在率 (0-1) */
  accuracy: number
  /** 簡潔性: 目標文字数内か (0-1) */
  conciseness: number
  /** 行動性: アクション語の有無 (0-1) */
  actionability: number
  /** 特性適合: コード例/URL等の特性一致 (0-1) */
  traitMatch: number
  /** 加重総合スコア (0-1) */
  total: number
}

// ---------------------------------------------------------------------------
// 重み定義
// ---------------------------------------------------------------------------

const WEIGHTS = {
  relevance: 0.35,
  accuracy: 0.25,
  conciseness: 0.1,
  actionability: 0.15,
  traitMatch: 0.15,
}

// アクション語パターン
const ACTION_WORDS = [
  'してください',
  'を使う',
  'を使用',
  'で確認',
  'を参照',
  'を設定',
  'で指定',
  'で検索',
  'で実行',
  'を確認',
  'を作成',
  'を定義',
  '推奨',
]

// ---------------------------------------------------------------------------
// スコアリング関数
// ---------------------------------------------------------------------------

/**
 * FAQ回答をスコアリングする
 */
export const scoreAnswer = (
  answer: string,
  evalCase: EvalCase
): ScoreResult => {
  const lowerAnswer = answer.toLowerCase()

  // 1. 関連性: 期待キーワードのカバー率
  const expectedMatches = evalCase.expectedKeywords.filter((kw) =>
    lowerAnswer.includes(kw.toLowerCase())
  )
  const relevance =
    evalCase.expectedKeywords.length > 0
      ? expectedMatches.length / evalCase.expectedKeywords.length
      : 1

  // 2. 正確性: 禁止キーワードの不在率
  let accuracy = 1
  if (evalCase.prohibitedKeywords && evalCase.prohibitedKeywords.length > 0) {
    const violations = evalCase.prohibitedKeywords.filter((kw) =>
      lowerAnswer.includes(kw.toLowerCase())
    )
    accuracy = 1 - violations.length / evalCase.prohibitedKeywords.length
  }

  // 3. 簡潔性: 目標文字数内か
  let conciseness = 1
  if (evalCase.traits?.maxLength) {
    const ratio = answer.length / evalCase.traits.maxLength
    if (ratio <= 1) {
      conciseness = 1
    } else if (ratio <= 1.5) {
      conciseness = 1 - (ratio - 1) // 1.0-1.5の間で線形減少
    } else {
      conciseness = 0.5
    }
  }

  // 4. 行動性: アクション語の有無
  const hasActionWord = ACTION_WORDS.some((word) => answer.includes(word))
  const actionability = hasActionWord ? 1 : 0.3

  // 5. 特性適合
  let traitMatch = 1
  if (evalCase.traits) {
    const traitChecks: boolean[] = []
    if (evalCase.traits.hasCode !== undefined) {
      const hasCode = answer.includes('```') || answer.includes('`')
      traitChecks.push(evalCase.traits.hasCode === hasCode)
    }
    if (evalCase.traits.hasUrl !== undefined) {
      const hasUrl = /https?:\/\//.test(answer)
      traitChecks.push(evalCase.traits.hasUrl === hasUrl)
    }
    if (traitChecks.length > 0) {
      traitMatch = traitChecks.filter(Boolean).length / traitChecks.length
    }
  }

  // 加重総合スコア
  const total =
    relevance * WEIGHTS.relevance +
    accuracy * WEIGHTS.accuracy +
    conciseness * WEIGHTS.conciseness +
    actionability * WEIGHTS.actionability +
    traitMatch * WEIGHTS.traitMatch

  return {
    relevance,
    accuracy,
    conciseness,
    actionability,
    traitMatch,
    total,
  }
}

/**
 * スコアレポートをフォーマットする
 */
export const formatScoreReport = (
  scores: { evalCase: EvalCase; score: ScoreResult }[]
): string => {
  const lines: string[] = ['--- FAQ品質評価レポート ---', '']

  // 集計
  const avgRelevance =
    scores.reduce((sum, s) => sum + s.score.relevance, 0) / scores.length
  const avgAccuracy =
    scores.reduce((sum, s) => sum + s.score.accuracy, 0) / scores.length
  const avgTotal =
    scores.reduce((sum, s) => sum + s.score.total, 0) / scores.length

  lines.push(
    `平均関連性: ${(avgRelevance * 100).toFixed(1)}%`,
    `平均正確性: ${(avgAccuracy * 100).toFixed(1)}%`,
    `平均総合: ${(avgTotal * 100).toFixed(1)}%`,
    ''
  )

  // 低スコアケース
  const lowScores = scores
    .filter((s) => s.score.total < 0.7)
    .sort((a, b) => a.score.total - b.score.total)

  if (lowScores.length > 0) {
    lines.push('低スコアケース:')
    for (const s of lowScores) {
      lines.push(
        `  "${s.evalCase.query}" → ${(s.score.total * 100).toFixed(1)}% ` +
          `(関連=${(s.score.relevance * 100).toFixed(0)}%, ` +
          `正確=${(s.score.accuracy * 100).toFixed(0)}%)`
      )
    }
  }

  return lines.join('\n')
}
