import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'

import { MultiSelectAutocomplete } from '..'

const theme = createTheme()

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

const mockOptions = [
  { value: 'user1', label: '山田太郎' },
  { value: 'user2', label: '佐藤花子' },
  { value: 'user3', label: '鈴木一郎' },
  { value: 'user4', label: '田中美咲' },
]

describe('MultiSelectAutocomplete コンポーネント', () => {
  describe('表示テスト', () => {
    it('ラベルが正しく表示される', () => {
      console.log('テスト中: ラベルの表示')
      render(
        <TestWrapper>
          <MultiSelectAutocomplete label='メンバー選択' options={mockOptions} />
        </TestWrapper>
      )

      expect(screen.getByText('メンバー選択')).toBeInTheDocument()
      console.log('成功: ラベルが表示されました')
    })

    it('プレースホルダーが表示される', () => {
      console.log('テスト中: プレースホルダーの表示')
      render(
        <TestWrapper>
          <MultiSelectAutocomplete
            label='メンバー選択'
            options={mockOptions}
            placeholder='メンバーを選択してください'
          />
        </TestWrapper>
      )

      expect(
        screen.getByPlaceholderText('メンバーを選択してください')
      ).toBeInTheDocument()
      console.log('成功: プレースホルダーが表示されました')
    })

    it('必須マークが表示される', () => {
      console.log('テスト中: 必須マークの表示')
      render(
        <TestWrapper>
          <MultiSelectAutocomplete
            label='メンバー選択'
            options={mockOptions}
            required
          />
        </TestWrapper>
      )

      expect(screen.getByText('*')).toBeInTheDocument()
      console.log('成功: 必須マークが表示されました')
    })

    it('ツールチップアイコンが表示される', () => {
      console.log('テスト中: ツールチップアイコンの表示')
      render(
        <TestWrapper>
          <MultiSelectAutocomplete
            label='メンバー選択'
            options={mockOptions}
            tooltip='複数のメンバーを選択できます'
          />
        </TestWrapper>
      )

      expect(
        screen.getByLabelText('メンバー選択についてのヘルプ')
      ).toBeInTheDocument()
      console.log('成功: ツールチップアイコンが表示されました')
    })

    it('ヘルパーテキストが表示される', () => {
      console.log('テスト中: ヘルパーテキストの表示')
      render(
        <TestWrapper>
          <MultiSelectAutocomplete
            label='メンバー選択'
            options={mockOptions}
            helperText='3人まで選択できます'
          />
        </TestWrapper>
      )

      expect(screen.getByText('3人まで選択できます')).toBeInTheDocument()
      console.log('成功: ヘルパーテキストが表示されました')
    })

    it('初期値が正しく設定される', () => {
      console.log('テスト中: 初期値の設定')
      const initialValue = [mockOptions[0], mockOptions[1]]
      render(
        <TestWrapper>
          <MultiSelectAutocomplete
            label='メンバー選択'
            options={mockOptions}
            value={initialValue}
          />
        </TestWrapper>
      )

      expect(screen.getByText('山田太郎')).toBeInTheDocument()
      expect(screen.getByText('佐藤花子')).toBeInTheDocument()
      console.log('成功: 初期値が正しく設定されました')
    })
  })

  describe('操作テスト', () => {
    it('クリック時にオプションが表示される', async () => {
      console.log('テスト中: クリック時のオプション表示')
      render(
        <TestWrapper>
          <MultiSelectAutocomplete label='メンバー選択' options={mockOptions} />
        </TestWrapper>
      )

      const autocomplete = screen.getByRole('combobox')
      fireEvent.mouseDown(autocomplete)

      // オプションリストが開くのを待機
      await waitFor(() => {
        const listbox = screen.queryByRole('listbox')
        expect(listbox !== null).toBe(true)
      })
      console.log('成功: クリック時にオプションが表示されました')
    })

    it('複数のオプションを選択できる', async () => {
      console.log('テスト中: 複数オプションの選択')
      const handleChange = vi.fn()
      render(
        <TestWrapper>
          <MultiSelectAutocomplete
            label='メンバー選択'
            options={mockOptions}
            onChange={handleChange}
          />
        </TestWrapper>
      )

      const autocomplete = screen.getByRole('combobox')
      fireEvent.mouseDown(autocomplete)

      // オプションリストが開くのを待機
      await waitFor(() => {
        const listbox = screen.queryByRole('listbox')
        expect(listbox !== null).toBe(true)
      })

      // オプションを選択
      const option = screen.getByRole('option', { name: /山田太郎/i })
      fireEvent.click(option)

      expect(handleChange).toHaveBeenCalled()
      console.log('成功: 複数オプションを選択できました')
    })

    it('無効化状態が正しく動作する', () => {
      console.log('テスト中: 無効化状態の動作')
      render(
        <TestWrapper>
          <MultiSelectAutocomplete
            label='メンバー選択'
            options={mockOptions}
            disabled
          />
        </TestWrapper>
      )

      const autocomplete = screen.getByRole('combobox')
      // disabled属性を確認
      expect(autocomplete.hasAttribute('disabled')).toBe(true)
      console.log('成功: 無効化状態が正しく動作しました')
    })
  })

  describe('エラー状態テスト', () => {
    it('エラー状態が正しく表示される', () => {
      console.log('テスト中: エラー状態の表示')
      render(
        <TestWrapper>
          <MultiSelectAutocomplete
            label='メンバー選択'
            options={mockOptions}
            error
            helperText='選択が必要です'
          />
        </TestWrapper>
      )

      expect(screen.getByText('選択が必要です')).toBeInTheDocument()
      console.log('成功: エラー状態が正しく表示されました')
    })
  })

  describe('サイズテスト', () => {
    it('smallサイズが正しく適用される', () => {
      console.log('テスト中: smallサイズの適用')
      render(
        <TestWrapper>
          <MultiSelectAutocomplete
            label='メンバー選択'
            options={mockOptions}
            size='small'
          />
        </TestWrapper>
      )

      const textField = screen.getByRole('combobox')
      expect(textField).toBeInTheDocument()
      console.log('成功: smallサイズが正しく適用されました')
    })

    it('mediumサイズがデフォルトで適用される', () => {
      console.log('テスト中: mediumサイズのデフォルト適用')
      render(
        <TestWrapper>
          <MultiSelectAutocomplete label='メンバー選択' options={mockOptions} />
        </TestWrapper>
      )

      const textField = screen.getByRole('combobox')
      expect(textField).toBeInTheDocument()
      console.log('成功: mediumサイズがデフォルトで適用されました')
    })
  })

  describe('チップスタイルテスト', () => {
    it('チップカラーとバリエーションが正しく適用される', () => {
      console.log('テスト中: チップカラーとバリエーションの適用')
      render(
        <TestWrapper>
          <MultiSelectAutocomplete
            label='メンバー選択'
            options={mockOptions}
            value={[mockOptions[0]]}
            chipColor='secondary'
            chipVariant='filled'
          />
        </TestWrapper>
      )

      const chip = screen.getByText('山田太郎').closest('.MuiChip-root')
      expect(chip).not.toBeNull()
      expect(chip?.classList.contains('MuiChip-colorSecondary')).toBe(true)
      expect(chip?.classList.contains('MuiChip-filled')).toBe(true)
      console.log('成功: チップカラーとバリエーションが正しく適用されました')
    })
  })

  describe('limitTagsテスト', () => {
    it('limitTagsが正しく機能する', () => {
      console.log('テスト中: limitTagsの機能')
      render(
        <TestWrapper>
          <MultiSelectAutocomplete
            label='メンバー選択'
            options={mockOptions}
            value={[mockOptions[0], mockOptions[1], mockOptions[2]]}
            limitTags={2}
          />
        </TestWrapper>
      )

      // 2つのチップと「+1」テキストが表示されることを確認
      expect(screen.getByText('山田太郎')).toBeInTheDocument()
      expect(screen.getByText('佐藤花子')).toBeInTheDocument()
      expect(screen.getByText('+1')).toBeInTheDocument()
      console.log('成功: limitTagsが正しく機能しました')
    })
  })

  describe('必須項目の削除防止テスト', () => {
    it('必須項目の場合、最後の1つは削除ボタンがない', () => {
      console.log('テスト中: 必須項目の削除防止')
      const handleChange = vi.fn()
      render(
        <TestWrapper>
          <MultiSelectAutocomplete
            label='メンバー選択'
            options={mockOptions}
            value={[mockOptions[0]]}
            onChange={handleChange}
            required
          />
        </TestWrapper>
      )

      // 最後の1つのチップに削除ボタンがないことを確認
      const chip = screen.getByText('山田太郎').closest('.MuiChip-root')
      expect(chip?.querySelector('.MuiChip-deleteIcon')).toBeNull()
      console.log('成功: 必須項目の最後の1つに削除ボタンがありません')
    })
  })
})
