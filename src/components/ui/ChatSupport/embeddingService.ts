// text-embedding-3-small によるセマンティック検索サービス

// ---------------------------------------------------------------------------
// 型定義
// ---------------------------------------------------------------------------

export interface EmbeddingVector {
  id: string
  vector: number[]
  text: string
  /** 元データのカテゴリ（faq / storyGuide / muiKnowledge） */
  category: 'faq' | 'storyGuide' | 'muiKnowledge'
  /** 元データへの参照キー */
  sourceKey: string
}

export interface SemanticSearchResult {
  id: string
  score: number
  text: string
  category: EmbeddingVector['category']
  sourceKey: string
}

// ---------------------------------------------------------------------------
// コサイン類似度
// ---------------------------------------------------------------------------

export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

// ---------------------------------------------------------------------------
// OpenAI Embedding API 呼び出し
// ---------------------------------------------------------------------------

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 512 // コスト・速度のバランスで512次元に短縮

/**
 * テキスト配列をバッチでembedding化する
 * OpenAI API は1回のリクエストで最大2048入力まで対応
 */
export const fetchEmbeddings = async (
  apiKey: string,
  texts: string[]
): Promise<number[][]> => {
  if (texts.length === 0) return []

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: texts,
        dimensions: EMBEDDING_DIMENSIONS,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errRecord = errorData as Record<string, unknown>
      const errObj = errRecord.error as Record<string, unknown> | undefined
      const msg = errObj?.message ?? `Embedding API Error: ${response.status}`
      throw new Error(String(msg))
    }

    const data = (await response.json()) as {
      data: { embedding: number[]; index: number }[]
    }
    // APIはindex順に返すとは限らないためソート
    const sorted = [...data.data].sort((a, b) => a.index - b.index)
    return sorted.map((d) => d.embedding)
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * 単一テキストのembeddingを取得
 */
export const fetchSingleEmbedding = async (
  apiKey: string,
  text: string
): Promise<number[]> => {
  const results = await fetchEmbeddings(apiKey, [text])
  return results[0]
}

// ---------------------------------------------------------------------------
// インメモリベクトルインデックス
// ---------------------------------------------------------------------------

export class VectorIndex {
  private vectors: EmbeddingVector[] = []
  private initialized = false
  private initializing: Promise<void> | null = null

  isReady(): boolean {
    return this.initialized
  }

  getVectorCount(): number {
    return this.vectors.length
  }

  /**
   * 知識ベースのテキストをバッチembedding化してインデックスに格納
   */
  async build(
    apiKey: string,
    entries: {
      id: string
      text: string
      category: EmbeddingVector['category']
      sourceKey: string
    }[]
  ): Promise<void> {
    // 重複ビルド防止
    if (this.initializing) {
      await this.initializing
      return
    }

    this.initializing = (async () => {
      try {
        const texts = entries.map((e) => e.text)
        // バッチサイズ100でAPI呼び出し（レート制限対策）
        const batchSize = 100
        const allVectors: number[][] = []

        for (let i = 0; i < texts.length; i += batchSize) {
          const batch = texts.slice(i, i + batchSize)
          const vectors = await fetchEmbeddings(apiKey, batch)
          allVectors.push(...vectors)
        }

        this.vectors = entries.map((entry, idx) => ({
          ...entry,
          vector: allVectors[idx],
        }))
        this.initialized = true
      } finally {
        this.initializing = null
      }
    })()

    await this.initializing
  }

  /**
   * クエリベクトルとの類似度で上位k件を返す
   */
  search(
    queryVector: number[],
    topK = 5,
    threshold = 0.3
  ): SemanticSearchResult[] {
    if (!this.initialized) return []

    const scored = this.vectors.map((v) => ({
      id: v.id,
      score: cosineSimilarity(queryVector, v.vector),
      text: v.text,
      category: v.category,
      sourceKey: v.sourceKey,
    }))

    return scored
      .filter((s) => s.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
  }

  /**
   * インデックスをクリア
   */
  clear(): void {
    this.vectors = []
    this.initialized = false
    this.initializing = null
  }
}
