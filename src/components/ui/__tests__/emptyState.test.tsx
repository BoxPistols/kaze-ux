// EmptyState ユニットテスト

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EmptyState } from '../feedback'
import { ThemeProvider } from '../../ThemeProvider'

const renderEmpty = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>)

describe('EmptyState', () => {
  it('タイトルを見出しとして出す', () => {
    renderEmpty(<EmptyState title='カートは空です' />)
    expect(screen.getByText('カートは空です')).toBeInTheDocument()
  })

  it('説明と操作を出せる', () => {
    renderEmpty(
      <EmptyState
        title='該当する店舗がありません'
        description='検索語やカテゴリを変えてみてください'
        action={<button type='button'>条件をクリア</button>}
      />
    )
    expect(
      screen.getByText('検索語やカテゴリを変えてみてください')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '条件をクリア' })
    ).toBeInTheDocument()
  })

  it('説明と操作は任意', () => {
    renderEmpty(<EmptyState title='まだ履歴がありません' />)
    expect(screen.getByText('まだ履歴がありません')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('アイコンは装飾なので支援技術から隠す', () => {
    // 「買い物かごの絵」を読み上げても情報は増えない。
    // 意味はタイトルが持つ
    const { container } = renderEmpty(
      <EmptyState title='カートは空です' icon={<span data-testid='ic' />} />
    )
    const hidden = container.querySelector('[aria-hidden="true"]')
    expect(hidden).toBeTruthy()
    expect(hidden?.contains(screen.getByTestId('ic'))).toBe(true)
  })

  it('size で余白が変わる', () => {
    const { container: page } = renderEmpty(
      <EmptyState title='A' size='page' />
    )
    const { container: compact } = renderEmpty(
      <EmptyState title='B' size='compact' />
    )
    const pad = (c: HTMLElement) =>
      parseFloat(getComputedStyle(c.firstElementChild as Element).paddingTop)
    expect(pad(page)).toBeGreaterThan(pad(compact))
  })
})
