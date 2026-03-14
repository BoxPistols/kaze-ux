/**
 * W3C DTCG トークン形式の型定義
 */

// DTCG トークン値
export interface TokenValue {
  $value: string | number | boolean
  $type: string
  $description?: string
}

// DTCG トークングループ（再帰）
export interface TokenGroup {
  [key: string]: TokenValue | TokenGroup | string | undefined
  $description?: string
}

// DTCG ルートドキュメント
export interface DTCGDocument {
  $schema?: string
  $description?: string
  [key: string]: TokenGroup | TokenValue | string | undefined
}

// エクストラクターの抽出結果（中間表現）
export interface ExtractedTokens {
  color?: {
    light: Record<string, Record<string, string>>
    dark: Record<string, Record<string, string>>
  }
  typography?: {
    fontFamily: string
    baseFontSize: number
    sizes: Record<string, { px: number; rem: string }>
    weights: Record<string, number>
  }
  spacing?: {
    base: number
    values: Record<string, number>
  }
  borderRadius?: Record<string, number | string>
  shadows?: string[]
  breakpoints?: Record<string, number>
}

// エクストラクター共通インターフェース
export interface Extractor {
  name: string
  extract: (inputPath: string) => Promise<ExtractedTokens>
}
