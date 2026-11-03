import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import { describe, it, expect } from 'vitest'

import { Fab } from '..'

/**
 * `visible` が両方向に効くことを固定する。
 *
 * 以前は `visible ? animatedButton : fabButton` と三項が逆で、
 * 非表示にしたいときにだけ Zoom を迂回して素の FAB を返していた。
 * つまり visible={false} で消えることが無く、**片方向にしか効かない
 * prop が、両方向に効くように見える形で存在していた**。
 */
const theme = createTheme()

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

describe('Fab の visible', () => {
  it('visible={true} なら描画される', () => {
    render(
      <Wrapper>
        <Fab icon={<AddIcon />} aria-label='追加' visible />
      </Wrapper>
    )
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument()
  })

  it('visible={false} なら描画されない', () => {
    render(
      <Wrapper>
        <Fab icon={<AddIcon />} aria-label='追加' visible={false} />
      </Wrapper>
    )
    expect(screen.queryByRole('button', { name: '追加' })).toBeNull()
  })

  it('tooltip 付きでも visible={false} なら描画されない', () => {
    // Tooltip は要素の子を 1 つ要求するので、この経路だけ別に確かめる
    render(
      <Wrapper>
        <Fab
          icon={<AddIcon />}
          aria-label='追加'
          tooltip='項目を追加'
          visible={false}
        />
      </Wrapper>
    )
    expect(screen.queryByRole('button', { name: '追加' })).toBeNull()
  })

  it('tooltip 付きで visible={true} なら描画される', () => {
    render(
      <Wrapper>
        <Fab
          icon={<AddIcon />}
          aria-label='追加'
          tooltip='項目を追加'
          visible
        />
      </Wrapper>
    )
    // MUI の Tooltip は子の読み上げ名を title で上書きするので、
    // 名前ではなく role で見る（読み上げ名は '項目を追加' になる）
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('既定では描画される（visible を渡さない）', () => {
    render(
      <Wrapper>
        <Fab icon={<AddIcon />} aria-label='追加' />
      </Wrapper>
    )
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument()
  })
})
