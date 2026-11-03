// muiKnowledge ユニットテスト

import { describe, it, expect } from 'vitest'
import { detectMuiTopics, buildMuiContext } from '../muiKnowledge'

describe('detectMuiTopics', () => {
  it('指示語+ページコンテキストでコンポーネントを解決する', () => {
    // 「このUIはMUI標準？」+ パンくずリストページ → navigationセクションが返る
    const sections = detectMuiTopics(
      'このUIはMUI標準？',
      'Patterns/Navigation',
      'パンくずリストパターン'
    )
    const ids = sections.map((s) => s.id)
    expect(ids).toContain('navigation')
  })

  it('指示語なしの場合はページコンテキストを使わない', () => {
    const sections = detectMuiTopics(
      'Buttonの使い方を教えて',
      'Patterns/Navigation',
      'パンくずリストパターン'
    )
    const ids = sections.map((s) => s.id)
    expect(ids).toContain('button')
    // ページがNavigationでもButtonについて回答する
    expect(ids[0]).toBe('button')
  })

  it('MUIキーワードがない場合は空配列', () => {
    const sections = detectMuiTopics('今日の天気は？')
    expect(sections).toEqual([])
  })

  it('具体的なコンポーネント名で正しいセクションを返す', () => {
    expect(detectMuiTopics('Gridの使い方')[0].id).toBe('grid')
    expect(detectMuiTopics('Cardコンポーネント')[0].id).toBe('card')
    expect(detectMuiTopics('TextFieldのバリデーション')[0].id).toBe('textfield')
    expect(detectMuiTopics('Dialogの開閉')[0].id).toBe('dialog')
  })

  it('日本語キーワードでも検出する', () => {
    expect(detectMuiTopics('ボタンの色を変えたい')[0].id).toBe('button')
    expect(detectMuiTopics('アコーディオンの開閉')[0].id).toBe('accordion')
    expect(detectMuiTopics('テーブルのソート')[0].id).toBe('table')
  })

  it('「これはMUI標準？」+ページコンテキストで解決', () => {
    // Chipページで「これはMUI標準？」→ chip-badgeセクション
    const sections = detectMuiTopics(
      'これはMUI標準？',
      'Components/UI',
      'Chip パターン'
    )
    const ids = sections.map((s) => s.id)
    expect(ids).toContain('chip-badge')
  })

  it('最大3セクションまで返す', () => {
    const sections = detectMuiTopics('MUI sx テーマ Grid Button Card TextField')
    expect(sections.length).toBeLessThanOrEqual(3)
  })
})

describe('buildMuiContext', () => {
  it('MUI関連の質問でコンテキスト文字列を返す', () => {
    const ctx = buildMuiContext('Buttonの使い方', null, null)
    expect(ctx).toContain('MUI公式リファレンス')
    expect(ctx).toContain('Button')
  })

  it('MUI無関係の質問で空文字を返す', () => {
    const ctx = buildMuiContext('TypeScriptの型定義について', null, null)
    expect(ctx).toBe('')
  })

  it('指示語+ページコンテキストで正しいリファレンスを返す', () => {
    const ctx = buildMuiContext(
      'このUIはMUI標準？',
      'Patterns/Navigation',
      'パンくずリストパターン'
    )
    expect(ctx).toContain('Breadcrumbs')
  })
})
