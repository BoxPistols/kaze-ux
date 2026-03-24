// セマンティック検索: FAQ・StoryGuide・MUI知識をembeddingベースで検索

import { VectorIndex, fetchSingleEmbedding } from './embeddingService'
import { FAQ_DATABASE } from './faqDatabase'
import { detectMuiTopics } from './muiKnowledge'
import { STORY_GUIDE_MAP } from './storyGuideMap'

import type { SemanticSearchResult, EmbeddingVector } from './embeddingService'
import type { StoryGuideEntry } from './storyGuideMap'

// ---------------------------------------------------------------------------
// シングルトンインデックス
// ---------------------------------------------------------------------------

let globalIndex: VectorIndex | null = null
let buildError: string | null = null

export const getEmbeddingIndex = (): VectorIndex | null => globalIndex

export const getEmbeddingBuildError = (): string | null => buildError

// ---------------------------------------------------------------------------
// 知識ベースからembedding用テキストを生成
// ---------------------------------------------------------------------------

interface IndexEntry {
  id: string
  text: string
  category: EmbeddingVector['category']
  sourceKey: string
}

/**
 * FAQ → embedding用テキスト
 * title + キーワード + 回答冒頭を結合してセマンティック表現を作る
 */
const buildFaqEntries = (): IndexEntry[] =>
  FAQ_DATABASE.map((faq, idx) => ({
    id: `faq-${idx}`,
    text: `${faq.title}\nキーワード: ${faq.keywords.join(', ')}\n${faq.answer.slice(0, 300)}`,
    category: 'faq' as const,
    sourceKey: String(idx),
  }))

/**
 * StoryGuide → embedding用テキスト
 */
const buildStoryGuideEntries = (): IndexEntry[] =>
  Object.entries(STORY_GUIDE_MAP).map(
    ([title, entry]: [string, StoryGuideEntry]) => ({
      id: `guide-${title}`,
      text: `${title}\n${entry.summary}\n${entry.codeContext.join('\n')}`,
      category: 'storyGuide' as const,
      sourceKey: title,
    })
  )

/**
 * MUI Knowledge → embedding用テキスト
 * detectMuiTopics の全セクションを取得するため空クエリ+全キーワードでトリガー
 */
const buildMuiKnowledgeEntries = (): IndexEntry[] => {
  // 代表的なキーワードで各セクションを取得
  const triggerQueries = [
    'MUI material overview 概要',
    'Button ボタン',
    'Card カード',
    'TextField 入力 フォーム',
    'Select セレクト',
    'Dialog ダイアログ モーダル',
    'Grid グリッド レイアウト',
    'Table テーブル',
    'Tabs タブ',
    'AppBar ナビゲーション',
    'Drawer ドロワー',
    'Breadcrumbs パンくず',
    'Chip チップ',
    'Avatar アバター',
    'Alert アラート',
    'Tooltip ツールチップ',
    'Accordion アコーディオン',
    'Snackbar トースト',
    'Pagination ページネーション',
    'Stepper ステッパー',
    'Skeleton スケルトン',
    'sx prop スタイリング theme テーマ',
    'Checkbox Radio Switch フォーム',
    'Autocomplete オートコンプリート',
    'Slider スライダー',
    'DatePicker 日付',
    'DataGrid データグリッド',
    'List リスト',
    'Menu メニュー',
    'Popover ポップオーバー',
    'Icon アイコン',
    'Typography タイポグラフィ',
    'Paper ペーパー',
    'Stack スタック',
    'Container コンテナ',
    'Progress プログレス',
    'Divider ディバイダー',
    'Badge バッジ',
    'FAB ボタン',
  ]

  const seen = new Set<string>()
  const entries: IndexEntry[] = []

  for (const q of triggerQueries) {
    const sections = detectMuiTopics(q)
    for (const section of sections) {
      if (seen.has(section.id)) continue
      seen.add(section.id)
      entries.push({
        id: `mui-${section.id}`,
        text: `${section.id}\nキーワード: ${section.keywords.join(', ')}\n${section.content.slice(0, 400)}`,
        category: 'muiKnowledge' as const,
        sourceKey: section.id,
      })
    }
  }

  return entries
}

// ---------------------------------------------------------------------------
// インデックスの初期化
// ---------------------------------------------------------------------------

/**
 * 全知識ベースをembedding化してインデックスを構築
 * ChatSupportの初期化時に1回呼ぶ（APIキーがある場合のみ）
 */
export const initEmbeddingIndex = async (apiKey: string): Promise<void> => {
  if (globalIndex?.isReady()) return

  buildError = null
  globalIndex = new VectorIndex()

  try {
    const entries = [
      ...buildFaqEntries(),
      ...buildStoryGuideEntries(),
      ...buildMuiKnowledgeEntries(),
    ]
    console.log(
      `[Embedding] ${entries.length}件の知識ベースをインデックス化中...`
    )
    await globalIndex.build(apiKey, entries)
    console.log(
      `[Embedding] インデックス構築完了 (${globalIndex.getVectorCount()}件)`
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    buildError = msg
    console.warn('[Embedding] インデックス構築失敗:', msg)
    globalIndex = null
  }
}

// ---------------------------------------------------------------------------
// セマンティック検索
// ---------------------------------------------------------------------------

/**
 * ユーザークエリをembeddingして類似知識を検索
 * @returns 上位k件のマッチ結果。インデックス未構築なら空配列
 */
export const semanticSearch = async (
  apiKey: string,
  query: string,
  topK = 5,
  threshold = 0.3
): Promise<SemanticSearchResult[]> => {
  if (!globalIndex?.isReady()) return []

  try {
    const queryVector = await fetchSingleEmbedding(apiKey, query)
    return globalIndex.search(queryVector, topK, threshold)
  } catch (e) {
    console.warn('[Embedding] 検索エラー:', e)
    return []
  }
}

/**
 * セマンティック検索結果からシステムプロンプト用コンテキストを構築
 */
export const buildSemanticContext = (
  results: SemanticSearchResult[]
): string => {
  if (results.length === 0) return ''

  const sections = results.map((r) => {
    const categoryLabel =
      r.category === 'faq'
        ? 'FAQ'
        : r.category === 'storyGuide'
          ? 'ページガイド'
          : 'MUIリファレンス'
    return `### ${categoryLabel} (関連度: ${(r.score * 100).toFixed(0)}%)\n${r.text}`
  })

  return `\n## セマンティック検索結果（以下の情報を参考に回答すること）\n${sections.join('\n\n')}`
}

/**
 * セマンティック検索結果からFAQ回答を取得
 * FAQ カテゴリの最上位マッチの元データを返す
 */
export const findSemanticFaqAnswer = (
  results: SemanticSearchResult[]
): string | null => {
  const faqResult = results.find((r) => r.category === 'faq' && r.score >= 0.5)
  if (!faqResult) return null

  const idx = parseInt(faqResult.sourceKey, 10)
  if (isNaN(idx) || idx < 0 || idx >= FAQ_DATABASE.length) return null

  return FAQ_DATABASE[idx].answer
}

// ---------------------------------------------------------------------------
// クリーンアップ
// ---------------------------------------------------------------------------

export const clearEmbeddingIndex = (): void => {
  globalIndex?.clear()
  globalIndex = null
  buildError = null
}
