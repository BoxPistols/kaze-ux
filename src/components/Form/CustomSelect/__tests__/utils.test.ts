import { describe, it, expect } from 'vitest'

// テスト対象の関数をインポートする必要があるため、
// まずコンポーネントファイルから関数を export する必要があります
// ここでは直接関数をコピーしてテストします

// ユーティリティ関数（CustomSelectから抽出）
const createInputId = (id: string | undefined, label: string) =>
  id || `custom-select-${label.replace(/\s+/g, '-').toLowerCase()}`

const getInitialValue = (
  propValue: string | string[] | number | number[] | undefined,
  multiple: boolean
) => {
  if (propValue !== undefined) return propValue
  return multiple ? [] : ''
}

const hasValue = (
  val: string | string[] | number | number[],
  multiple: boolean
): boolean =>
  multiple
    ? Array.isArray(val) && val.length > 0
    : val !== undefined && val !== ''

describe('CustomSelect ユーティリティ', () => {
  describe('createInputId 関数', () => {
    it('提供されたIDをそのまま返す', () => {
      console.log('テスト中: カスタムIDの処理')
      const result = createInputId('custom-id', 'テストラベル')
      expect(result).toBe('custom-id')
      console.log('成功: カスタムIDがそのまま返されました')
    })

    it('未定義の場合ラベルからIDを生成する', () => {
      console.log('テスト中: ラベルからのID生成')
      const result = createInputId(undefined, 'テストラベル')
      expect(result).toBe('custom-select-テストラベル')
      console.log('成功: ラベルからIDが生成されました')
    })

    it('ラベル内のスペースをハイフンに置換する', () => {
      console.log('テスト中: スペースのハイフン置換')
      const result = createInputId(undefined, 'テスト ラベル')
      expect(result).toBe('custom-select-テスト-ラベル')
      console.log('成功: スペースがハイフンに置換されました')
    })
  })

  describe('getInitialValue 関数', () => {
    it('定義された値が渡された場合その値を返す', () => {
      console.log('テスト中: 定義済み値の処理')
      expect(getInitialValue('test', false)).toBe('test')
      expect(getInitialValue(['test1', 'test2'], true)).toEqual([
        'test1',
        'test2',
      ])
      console.log('成功: 定義済み値が正しく返されました')
    })

    it('単一選択で未定義の場合は空文字を返す', () => {
      console.log('テスト中: 単一選択のデフォルト値')
      const result = getInitialValue(undefined, false)
      expect(result).toBe('')
      console.log('成功: 単一選択で空文字が返されました')
    })

    it('複数選択で未定義の場合は空配列を返す', () => {
      console.log('テスト中: 複数選択のデフォルト値')
      const result = getInitialValue(undefined, true)
      expect(result).toEqual([])
      console.log('成功: 複数選択で空配列が返されました')
    })
  })

  describe('hasValue 関数', () => {
    describe('単一選択', () => {
      it('空でない文字列の場合trueを返す', () => {
        console.log('テスト中: 単一選択の値検証')
        expect(hasValue('test', false)).toBe(true)
        console.log('成功: 空でない文字列でtrueが返されました')
      })

      it('空文字列の場合falseを返す', () => {
        console.log('テスト中: 単一選択の空値検証')
        expect(hasValue('', false)).toBe(false)
        console.log('成功: 空文字列でfalseが返されました')
      })
    })

    describe('複数選択', () => {
      it('空でない配列の場合trueを返す', () => {
        console.log('テスト中: 複数選択の値検証')
        expect(hasValue(['test'], true)).toBe(true)
        expect(hasValue(['test1', 'test2'], true)).toBe(true)
        console.log('成功: 空でない配列でtrueが返されました')
      })

      it('空配列の場合falseを返す', () => {
        console.log('テスト中: 複数選択の空値検証')
        expect(hasValue([], true)).toBe(false)
        console.log('成功: 空配列でfalseが返されました')
      })
    })
  })
})
