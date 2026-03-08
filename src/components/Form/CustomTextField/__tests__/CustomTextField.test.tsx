import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { describe, it, expect } from 'vitest'

import { CustomTextField } from '..'

const theme = createTheme()

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

describe('CustomTextField コンポーネント', () => {
  describe('表示テスト', () => {
    it('ラベルと入力フィールドが正しく表示される', () => {
      console.log('テスト中: ラベルと入力フィールドの表示')
      render(
        <TestWrapper>
          <CustomTextField
            label='テストフィールド'
            placeholder='テキストを入力'
          />
        </TestWrapper>
      )

      expect(screen.getByLabelText('テストフィールド')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('テキストを入力')).toBeInTheDocument()
      console.log('成功: ラベルとプレースホルダーが表示されました')
    })

    it('必須マークが表示される', () => {
      console.log('テスト中: 必須マークの表示')
      render(
        <TestWrapper>
          <CustomTextField label='必須フィールド' required />
        </TestWrapper>
      )

      expect(screen.getByText('*')).toBeInTheDocument()
      console.log('成功: 必須マークが表示されました')
    })

    it('初期値が設定される', () => {
      console.log('テスト中: 初期値の設定')
      render(
        <TestWrapper>
          <CustomTextField label='初期値テスト' value='初期値' />
        </TestWrapper>
      )

      const input = screen.getByDisplayValue('初期値')
      expect(input).toBeInTheDocument()
      console.log('成功: 初期値が設定されました')
    })
  })

  describe('操作テスト', () => {
    it('テキスト入力が可能', () => {
      console.log('テスト中: テキスト入力機能')
      render(
        <TestWrapper>
          <CustomTextField label='入力テスト' />
        </TestWrapper>
      )

      const input = screen.getByLabelText('入力テスト')
      fireEvent.change(input, { target: { value: 'テスト入力' } })

      expect(input).toHaveValue('テスト入力')
      console.log('成功: テキスト入力が正常に動作しました')
    })

    it('フォーカスが正しく動作する', () => {
      console.log('テスト中: フォーカス機能')
      render(
        <TestWrapper>
          <CustomTextField label='フォーカステスト' />
        </TestWrapper>
      )

      const input = screen.getByLabelText('フォーカステスト')
      input.focus()

      expect(input).toHaveFocus()
      console.log('成功: フォーカスが正しく動作しました')
    })
  })

  describe('エラー状態テスト', () => {
    it('エラー状態が正しく表示される', () => {
      console.log('テスト中: エラー状態の表示')
      render(
        <TestWrapper>
          <CustomTextField
            label='エラーフィールド'
            error={true}
            helperText='エラーメッセージ'
          />
        </TestWrapper>
      )

      expect(screen.getByText('エラーメッセージ')).toBeInTheDocument()
      console.log('成功: エラーメッセージが表示されました')
    })

    it('ヘルパーテキストが表示される', () => {
      console.log('テスト中: ヘルパーテキストの表示')
      render(
        <TestWrapper>
          <CustomTextField
            label='ヘルパーテキストテスト'
            helperText='これはヘルパーテキストです'
          />
        </TestWrapper>
      )

      expect(screen.getByText('これはヘルパーテキストです')).toBeInTheDocument()
      console.log('成功: ヘルパーテキストが表示されました')
    })
  })
})
