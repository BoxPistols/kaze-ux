// Visual Editor AI サービス
// 既存の ChatSupport 基盤を再利用

import { COMPONENT_REGISTRY } from './componentRegistry'
import {
  callAI,
  extractContent,
} from '../../../components/ui/ChatSupport/chatAiService'
import { loadChatConfig } from '../../../components/ui/ChatSupport/chatSupportConstants'

import type { EditorLayout } from './editorTypes'
import type { ChatSupportConfig } from '../../../components/ui/ChatSupport/chatSupportTypes'

// 利用可能コンポーネント一覧をシステムプロンプトに埋め込む
const AVAILABLE_COMPONENTS = Object.keys(COMPONENT_REGISTRY).join(', ')

const SYSTEM_PROMPT = `あなたはデザインシステムのビジュアルエディタAIです。
ユーザーの自然言語指示に基づいて、コンポーネント構成をJSON形式で出力してください。

## 利用可能コンポーネント（これ以外は使用禁止）
${AVAILABLE_COMPONENTS}

## 出力フォーマット（厳守）
JSONのみを出力。説明文やマークダウンは不要。

\`\`\`json
{
  "layout": [
    {
      "component": "コンポーネント名",
      "props": { "prop名": "値" },
      "sx": { "MUI sxオブジェクト" },
      "children": [
        { "component": "子コンポーネント", "children": "テキスト内容" }
      ]
    }
  ]
}
\`\`\`

## ルール
- componentは利用可能コンポーネント一覧のみ使用可能
- childrenはコンポーネント配列またはテキスト文字列
- MUI v7 Grid: size={{ xs: 12, sm: 6 }} を使用（旧 item prop 禁止）
- 色はデザイントークン参照（primary.main, text.secondary 等）。HEX直書き禁止
- spacing は MUI の数値（1=8px, 2=16px, 3=24px）
- レスポンシブ対応: Grid の size prop でブレークポイント指定
- 現実的なダミーデータを使用（"Lorem ipsum" 禁止）

## コンポーネント補足
- Card = CardHeader + CardContent + CardFooter の組み合わせ
- CardHeader の中に CardTitle, CardDescription を配置
- CustomTextField: label, placeholder, required, size("small"/"medium") prop対応
- CustomSelect: label, options=[{value,label}] prop対応
- StatusTag: text, status("active"/"inactive"/"pending"/"error") prop対応
- Button: variant("default"/"destructive"/"outline"/"secondary"/"ghost"), size("default"/"sm"/"lg") prop対応
- Stack: direction("row"/"column"), spacing, alignItems prop対応
- Typography: variant("h4"/"h5"/"h6"/"body1"/"body2"/"caption"), color prop対応

## 出力例
ユーザー: "KPIカードを2枚横並びで"
\`\`\`json
{
  "layout": [
    {
      "component": "Grid",
      "props": { "container": true, "spacing": 2 },
      "children": [
        {
          "component": "Grid",
          "props": { "size": { "xs": 12, "sm": 6 } },
          "children": [
            {
              "component": "Card",
              "children": [
                {
                  "component": "CardHeader",
                  "children": [
                    { "component": "CardTitle", "children": "月間売上" }
                  ]
                },
                {
                  "component": "CardContent",
                  "children": [
                    { "component": "Typography", "props": { "variant": "h4" }, "children": "¥2,450,000" },
                    { "component": "Typography", "props": { "variant": "caption", "color": "text.secondary" }, "children": "前月比 +12.5%" }
                  ]
                }
              ]
            }
          ]
        },
        {
          "component": "Grid",
          "props": { "size": { "xs": 12, "sm": 6 } },
          "children": [
            {
              "component": "Card",
              "children": [
                {
                  "component": "CardHeader",
                  "children": [
                    { "component": "CardTitle", "children": "アクティブユーザー" }
                  ]
                },
                {
                  "component": "CardContent",
                  "children": [
                    { "component": "Typography", "props": { "variant": "h4" }, "children": "1,284" },
                    { "component": "Typography", "props": { "variant": "caption", "color": "text.secondary" }, "children": "前月比 +8.3%" }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
\`\`\``

// JSONブロックを抽出（マークダウンコードブロック対応）
const extractJson = (text: string): string => {
  // ```json ... ``` ブロックを抽出
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (codeBlockMatch) return codeBlockMatch[1].trim()
  // { で始まるJSON直書き
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) return jsonMatch[0]
  return text
}

export const generateLayout = async (
  prompt: string,
  config?: ChatSupportConfig
): Promise<EditorLayout> => {
  const resolvedConfig = config ?? loadChatConfig()

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ]

  const data = await callAI(resolvedConfig, messages)
  const rawText = extractContent(data)
  const jsonStr = extractJson(rawText)

  const parsed = JSON.parse(jsonStr) as EditorLayout
  if (!parsed.layout || !Array.isArray(parsed.layout)) {
    throw new Error('不正なレイアウト形式です')
  }

  return parsed
}
