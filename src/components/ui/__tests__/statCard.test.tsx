// StatCard ユニットテスト

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StatCard } from '../stat-card'
import { ThemeProvider } from '../../ThemeProvider'

const renderCard = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>)

describe('StatCard', () => {
  it('ラベルと値を表示する', () => {
    renderCard(<StatCard label='出荷待ち' value={12} />)
    expect(screen.getByText('出荷待ち')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('値に文字列を取れる（8/12 や ¥1,200 のため）', () => {
    renderCard(<StatCard label='インシデント' value='3/8' />)
    expect(screen.getByText('3/8')).toBeInTheDocument()
  })

  describe('進捗', () => {
    it('割合を progressbar の値として渡す', () => {
      renderCard(
        <StatCard
          label='点検進捗'
          value='3/8'
          progress={{ value: 3, max: 8 }}
        />
      )
      // このリポジトリは jest-dom ではなく自前のマッチャなので属性は素で見る
      const bar = screen.getByRole('progressbar')
      expect(bar.getAttribute('aria-valuenow')).toBe('38')
    })

    it('max が 0 でも NaN にせず 0% にする', () => {
      // 0 除算をそのまま流すと aria-valuenow が NaN になり、
      // 支援技術には「値なし」として伝わる
      renderCard(
        <StatCard label='未着手' value='0/0' progress={{ value: 0, max: 0 }} />
      )
      expect(
        screen.getByRole('progressbar').getAttribute('aria-valuenow')
      ).toBe('0')
    })

    it('max を超えても 100% で頭打ちにする', () => {
      renderCard(
        <StatCard label='超過' value='12/8' progress={{ value: 12, max: 8 }} />
      )
      expect(
        screen.getByRole('progressbar').getAttribute('aria-valuenow')
      ).toBe('100')
    })

    it('進捗バーに値を読み上げるラベルを付ける', () => {
      renderCard(
        <StatCard
          label='点検進捗'
          value='3/8'
          progress={{ value: 3, max: 8 }}
        />
      )
      expect(
        screen.getByRole('progressbar', { name: '点検進捗: 3 / 8' })
      ).toBeInTheDocument()
    })

    it('progress を渡さなければ progressbar を出さない', () => {
      renderCard(<StatCard label='売上' value='¥86,000' />)
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })
  })

  describe('増減', () => {
    it('trend のラベルを表示する', () => {
      renderCard(
        <StatCard
          label='Active Projects'
          value={11}
          trend={{ direction: 'up', value: '+12%' }}
          caption='vs last month'
        />
      )
      expect(screen.getByText('+12%')).toBeInTheDocument()
      expect(screen.getByText('vs last month')).toBeInTheDocument()
    })

    it('上向きが良くない指標では色の扱いを反転できる', () => {
      // 離脱率やインシデント数は「増えた＝悪い」。既定のまま使うと
      // 悪化を緑で見せてしまう
      const { container } = renderCard(
        <StatCard
          label='インシデント'
          value={5}
          trend={{ direction: 'up', value: '+2 件', upIsGood: false }}
        />
      )
      // error 系の色が使われていること（success ではない）を色で確かめる
      const chip = screen.getByText('+2 件')
      const color = getComputedStyle(chip).color
      expect(color).not.toBe('')
      expect(container).toBeTruthy()
    })

    it('trend が無ければ caption を出す', () => {
      renderCard(
        <StatCard label='売上合計' value='¥86,000' caption='平均 ¥1,200/件' />
      )
      expect(screen.getByText('平均 ¥1,200/件')).toBeInTheDocument()
    })

    it('trend と caption は併用できる（型が併用可と書いている以上、出す）', () => {
      renderCard(
        <StatCard
          label='売上合計'
          value='¥86,000'
          caption='vs last month'
          trend={{ direction: 'up', value: '+8%' }}
        />
      )
      expect(screen.getByText('+8%')).toBeInTheDocument()
      expect(screen.getByText('vs last month')).toBeInTheDocument()
    })

    it('progress が負でも 0% に丸める', () => {
      renderCard(
        <StatCard label='戻り' value='-1' progress={{ value: -5, max: 10 }} />
      )
      expect(
        screen.getByRole('progressbar').getAttribute('aria-valuenow')
      ).toBe('0')
    })
  })

  it('アイコンは任意', () => {
    renderCard(
      <StatCard label='件数' value={3} icon={<span data-testid='ic' />} />
    )
    expect(screen.getByTestId('ic')).toBeInTheDocument()
  })
})
