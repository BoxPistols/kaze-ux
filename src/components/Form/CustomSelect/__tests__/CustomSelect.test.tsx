import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { describe, it, expect } from 'vitest'

import { CustomSelect } from '..'

const theme = createTheme()

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

const mockOptions = [
  { value: 'option1', label: 'オプション1' },
  { value: 'option2', label: 'オプション2' },
  { value: 'option3', label: 'オプション3' },
]

describe('CustomSelect コンポーネント', () => {
  describe('表示テスト', () => {
    it('ラベルとオプションが正しく表示される', () => {
      console.log('テスト中: ラベルとオプションの表示')
      render(
        <TestWrapper>
          <CustomSelect label='テストセレクト' options={mockOptions} />
        </TestWrapper>
      )

      expect(screen.getByText('テストセレクト')).toBeInTheDocument()
      console.log('成功: ラベルが表示されました')
    })

    it('プレースホルダーテキストが表示される', () => {
      console.log('テスト中: プレースホルダーの表示')
      render(
        <TestWrapper>
          <CustomSelect
            label='テストセレクト'
            options={mockOptions}
            placeholder='選択してください'
          />
        </TestWrapper>
      )

      expect(screen.getByText('選択してください')).toBeInTheDocument()
      console.log('成功: プレースホルダーが表示されました')
    })

    it('初期値が正しく設定される', () => {
      console.log('テスト中: 初期値の設定')
      render(
        <TestWrapper>
          <CustomSelect
            label='テストセレクト'
            options={mockOptions}
            value='option1'
          />
        </TestWrapper>
      )

      expect(screen.getByText('オプション1')).toBeInTheDocument()
      console.log('成功: 初期値が設定されました')
    })
  })

  describe('操作テスト', () => {
    it('クリック時にオプションが表示される', () => {
      console.log('テスト中: クリック時のオプション表示')
      render(
        <TestWrapper>
          <CustomSelect label='テストセレクト' options={mockOptions} />
        </TestWrapper>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)

      expect(screen.getByText('オプション2')).toBeInTheDocument()
      expect(screen.getByText('オプション3')).toBeInTheDocument()
      console.log('成功: クリック時にオプションが表示されました')
    })

    it('オプション選択が可能', () => {
      console.log('テスト中: オプション選択機能')
      render(
        <TestWrapper>
          <CustomSelect label='テストセレクト' options={mockOptions} />
        </TestWrapper>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)

      const option = screen.getByRole('option', { name: 'オプション2' })
      fireEvent.click(option)

      expect(screen.getByDisplayValue('option2')).toBeInTheDocument()
      console.log('成功: オプションを選択できました')
    })
  })

  describe('エラー状態テスト', () => {
    it('エラーメッセージが正しく表示される', () => {
      console.log('テスト中: エラーメッセージの表示')
      render(
        <TestWrapper>
          <CustomSelect
            label='エラーセレクト'
            options={mockOptions}
            error={true}
            helperText='エラーメッセージ'
          />
        </TestWrapper>
      )

      expect(screen.getByText('エラーメッセージ')).toBeInTheDocument()
      console.log('成功: エラーメッセージが表示されました')
    })
  })

  /**
   * `value` を渡したら、マウント後の変更にも追従することを固定する。
   *
   * 以前は useState の初期値としてしか読んでおらず、制御コンポーネントの
   * 見た目をしていて制御されていなかった。エラーは出ず、表示だけが親の
   * state とずれるので、フォームのリセットや非同期の初期値の流し込みで
   * 静かに壊れる。ds-equivalents.mjs が MUI の Select の代替として
   * CustomSelect を強制しているので、全アプリのフォームがこの経路を通る。
   */
  describe('制御コンポーネントとして振る舞う', () => {
    it('value prop の変更に追従する', () => {
      const { rerender } = render(
        <TestWrapper>
          <CustomSelect
            label='テストセレクト'
            options={mockOptions}
            value='option1'
            onChange={() => {}}
          />
        </TestWrapper>
      )
      expect(screen.getByDisplayValue('option1')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <CustomSelect
            label='テストセレクト'
            options={mockOptions}
            value='option3'
            onChange={() => {}}
          />
        </TestWrapper>
      )
      // ここが option1 のままだと、親の state と表示がずれたまま気づけない
      expect(screen.getByDisplayValue('option3')).toBeInTheDocument()
    })

    it('フォームのリセット（空文字に戻す）にも追従する', () => {
      const { rerender } = render(
        <TestWrapper>
          <CustomSelect
            label='テストセレクト'
            options={mockOptions}
            value='option2'
            onChange={() => {}}
          />
        </TestWrapper>
      )
      expect(screen.getByDisplayValue('option2')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <CustomSelect
            label='テストセレクト'
            options={mockOptions}
            value=''
            onChange={() => {}}
          />
        </TestWrapper>
      )
      expect(screen.queryByDisplayValue('option2')).not.toBeInTheDocument()
    })

    it('value を渡さないときは今までどおり自分で状態を持つ', () => {
      // 制御化のために既定値を外したので、非制御の使い方が壊れていないことを見る
      render(
        <TestWrapper>
          <CustomSelect label='テストセレクト' options={mockOptions} />
        </TestWrapper>
      )

      fireEvent.mouseDown(screen.getByRole('combobox'))
      fireEvent.click(screen.getByRole('option', { name: 'オプション2' }))
      expect(screen.getByDisplayValue('option2')).toBeInTheDocument()
    })

    it('選択すると onChange に選んだ値が渡る', () => {
      const seen: string[] = []
      render(
        <TestWrapper>
          <CustomSelect
            label='テストセレクト'
            options={mockOptions}
            value='option1'
            onChange={(_, v) => seen.push(v as string)}
          />
        </TestWrapper>
      )

      fireEvent.mouseDown(screen.getByRole('combobox'))
      fireEvent.click(screen.getByRole('option', { name: 'オプション3' }))
      expect(seen).toEqual(['option3'])
    })
  })
})
