// モデル別 maxOutputTokens の単一ソース
//
// ブラウザ側 (src/components/ui/ChatSupport/chatAiService.ts) と
// サーバー側 (api/ai.ts) の両方がここを参照する。
// 以前は同じロジックを 2 箇所に書いていたため、Gemini 2.5 の buffer 分岐が
// サーバー側にだけ無く、バックエンド経由の Gemini が空応答になっていた。

// Gemini 2.5 系は reasoning tokens を maxOutputTokens から消費する。
// 消費分は応答に現れないため、加算しないと finishReason='length' で本文が空になる
export const GEMINI_REASONING_BUFFER = 1200

// 接続テストは疎通だけ見るので最小トークンに絞る
const TEST_OUTPUT_TOKENS = 50
// reasoning に食われても本文が数トークン出るだけの余白
const TEST_BODY_TOKENS = 10

const DEFAULT_OUTPUT_TOKENS = 4000
// gpt-5 / o1 / o3 系は reasoning に使う分だけ上限を広げる
const REASONING_MODEL_OUTPUT_TOKENS = 16000
// 呼び出し側の希望値として受け付ける上限
const MAX_REQUESTED_TOKENS = 32000

export interface MaxOutputTokensOptions {
  /**
   * 呼び出し側が明示した希望値。
   * この関数の戻り値をそのまま渡す前提（buffer 加算済み）なので、
   * 範囲内ならそのまま返す。二重加算しない
   */
  requested?: number
  /** 接続テスト（疎通確認のみ） */
  isTest?: boolean
}

/**
 * プロバイダにそのまま渡せる maxOutputTokens を返す（Gemini の buffer 加算込み）
 */
export const resolveMaxOutputTokens = (
  model: string,
  options: MaxOutputTokensOptions = {}
): number => {
  const { requested, isTest = false } = options
  const buffer = model.includes('gemini-2.5') ? GEMINI_REASONING_BUFFER : 0

  if (isTest) {
    return buffer > 0 ? buffer + TEST_BODY_TOKENS : TEST_OUTPUT_TOKENS
  }

  if (
    typeof requested === 'number' &&
    requested > 0 &&
    requested <= MAX_REQUESTED_TOKENS
  ) {
    return requested
  }

  // コスト最適枠（nano）は出力上限を絞る
  // luna をここに入れると推論トークンが上限を食い切り可視出力が空になる（実測）
  if (model.includes('nano')) {
    return DEFAULT_OUTPUT_TOKENS + buffer
  }
  if (model.includes('gpt-5') || model.includes('o1') || model.includes('o3')) {
    return REASONING_MODEL_OUTPUT_TOKENS + buffer
  }
  return DEFAULT_OUTPUT_TOKENS + buffer
}
