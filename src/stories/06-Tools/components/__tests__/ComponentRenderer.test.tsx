import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { describe, it, expect, vi, afterEach } from 'vitest'

import { ComponentRenderer } from '../ComponentRenderer'

import type { ComponentNode } from '../editorTypes'

/**
 * ここは AI の出力をそのまま描画する場所なので、想定外の形が来る前提で
 * 見る。壊れ方が「パネルが白紙になって理由も出ない」だと、何を直せば
 * いいのかが利用者にも作った側にも分からない。
 */
const theme = createTheme()

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

/** 不正な形を意図的に渡すので、型を外して構築する */
const nodes = (...items: unknown[]) => items as ComponentNode[]

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ComponentRenderer', () => {
  it('正常なノードを描画する', () => {
    render(
      <Wrapper>
        <ComponentRenderer
          nodes={nodes({ component: 'Box', children: 'こんにちは' })}
        />
      </Wrapper>
    )
    expect(screen.getByText('こんにちは')).toBeInTheDocument()
  })

  it('null が混ざっても落ちず、何が来たかを出す', () => {
    // generateLayout は Array.isArray(parsed.layout) しか見ないので、
    // [null] や children の中の null がそのまま渡る。以前はここで
    // node.component を読んで TypeError になり、パネルごと白紙になった
    render(
      <Wrapper>
        <ComponentRenderer
          nodes={nodes(null, { component: 'Box', children: '生き残る' })}
        />
      </Wrapper>
    )
    expect(screen.getByText(/Invalid node/)).toBeInTheDocument()
    // 壊れたノードの隣は描画され続ける
    expect(screen.getByText('生き残る')).toBeInTheDocument()
  })

  it('children の中の null でも落ちない', () => {
    render(
      <Wrapper>
        <ComponentRenderer
          nodes={nodes({ component: 'Box', children: [null] })}
        />
      </Wrapper>
    )
    expect(screen.getByText(/Invalid node/)).toBeInTheDocument()
  })

  it('レジストリに無い部品は名前を出す', () => {
    render(
      <Wrapper>
        <ComponentRenderer nodes={nodes({ component: 'NotRegistered' })} />
      </Wrapper>
    )
    expect(screen.getByText(/Unknown: NotRegistered/)).toBeInTheDocument()
  })

  it('dangerouslySetInnerHTML を素通ししない', () => {
    // 部品は COMPONENT_REGISTRY でホワイトリスト制御しているのに、
    // props は無検査で spread していた
    const { container } = render(
      <Wrapper>
        <ComponentRenderer
          nodes={nodes({
            component: 'Box',
            props: {
              'data-testid': 'target',
              dangerouslySetInnerHTML: { __html: '<img src=x onerror=1>' },
            },
          })}
        />
      </Wrapper>
    )
    expect(screen.getByTestId('target')).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
  })

  it('props に入れた children が undefined で潰れない', () => {
    // createElement を常に第 3 引数付きで呼ぶと、props.children が
    // undefined で上書きされてテキストが消える
    render(
      <Wrapper>
        <ComponentRenderer
          nodes={nodes({ component: 'Box', props: { children: 'props 側' } })}
        />
      </Wrapper>
    )
    expect(screen.getByText('props 側')).toBeInTheDocument()
  })

  it('nodes が配列でなくても落ちない', () => {
    render(
      <Wrapper>
        <ComponentRenderer nodes={null as unknown as ComponentNode[]} />
      </Wrapper>
    )
    expect(screen.getByText(/Invalid layout/)).toBeInTheDocument()
  })
})
