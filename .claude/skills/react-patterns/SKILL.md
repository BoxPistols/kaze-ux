---
name: react-patterns
description: Reactコンポーネント実装パターン。React.FC禁止ルールと推奨される代替パターンを提供。
version: 1.0.0
---

# React コンポーネント実装パターン

このスキルは、KDDI Smart Drone Platform UI Theme プロジェクトでReactコンポーネントを実装する際の必須ルールとベストプラクティスを提供します。

## 適用タイミング

以下の作業時に自動的に適用されます:

- 新しいReactコンポーネントの作成
- 既存コンポーネントのリファクタリング
- TypeScript型定義の追加・修正
- コンポーネント設計のレビュー

---

## 🚨 重要: React.FC 完全禁止

### 禁止される記法

以下のすべての記法が禁止されています:

```tsx
// ❌ 禁止 - React.FC
import { FC } from 'react'
export const Component: FC<Props> = (props) => { ... }

// ❌ 禁止 - React.FC (フルネーム)
import React from 'react'
export const Component: React.FC<Props> = (props) => { ... }

// ❌ 禁止 - React.FunctionComponent
import React from 'react'
export const Component: React.FunctionComponent<Props> = (props) => { ... }

// ❌ 禁止 - FunctionComponent
import { FunctionComponent } from 'react'
export const Component: FunctionComponent<Props> = (props) => { ... }
```

### React.FC を使ってはいけない理由

1. **暗黙的な children の型定義**: React.FC は children を暗黙的に追加するため、意図しない props が受け入れられる
2. **ジェネリック型の制約**: 複雑なジェネリック型を扱う際に制約がある
3. **defaultProps の非互換性**: React 18+ で defaultProps のサポートが限定的
4. **不要な抽象化**: TypeScript の型システムを直接使用する方が明示的で安全
5. **React公式の非推奨**: React チームが React.FC の使用を推奨していない

---

## ✅ 推奨パターン

### 基本パターン: 関数定義 + Props 型

```tsx
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

// ✅ 推奨 - 通常の関数定義
export const Button = ({ label, onClick, disabled = false }: ButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}
```

### children を含むコンポーネント

```tsx
import { ReactNode } from 'react'

interface CardProps {
  title: string
  children: ReactNode // 明示的に children を定義
  className?: string
}

// ✅ 推奨 - children を明示的に型定義
export const Card = ({ title, children, className }: CardProps) => {
  return (
    <div className={className}>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  )
}
```

### ジェネリック型を使用するコンポーネント

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => ReactNode
  keyExtractor: (item: T) => string
}

// ✅ 推奨 - ジェネリック型を直接使用
export const List = <T,>({ items, renderItem, keyExtractor }: ListProps<T>) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}

// 使用例
interface User {
  id: number
  name: string
}

const users: User[] = [...]

<List
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => user.id.toString()}
/>
```

### MUI コンポーネントの Props 継承

```tsx
import { BoxProps } from '@mui/material/Box'
import { Box } from '@mui/material'

interface CustomBoxProps extends BoxProps {
  highlight?: boolean
  variant: 'primary' | 'secondary'
}

// ✅ 推奨 - MUI Props を継承
export const CustomBox = ({
  highlight = false,
  variant,
  children,
  ...boxProps
}: CustomBoxProps) => {
  return (
    <Box
      {...boxProps}
      sx={{
        border: highlight ? '2px solid' : 'none',
        borderColor: variant === 'primary' ? 'primary.main' : 'secondary.main',
        ...boxProps.sx,
      }}>
      {children}
    </Box>
  )
}
```

### デフォルト値の設定

```tsx
interface TooltipProps {
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  children: ReactNode
}

// ✅ 推奨 - デストラクチャリング時にデフォルト値を設定
export const Tooltip = ({
  content,
  placement = 'top',
  delay = 200,
  children,
}: TooltipProps) => {
  // 実装
  return <div>{children}</div>
}
```

### イベントハンドラーの型定義

```tsx
import { MouseEvent, ChangeEvent } from 'react'

interface FormProps {
  onSubmit: (data: FormData) => void
  onCancel: () => void
}

export const Form = ({ onSubmit, onCancel }: FormProps) => {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    // 処理
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // 処理
  }

  return (
    <form>
      <input onChange={handleChange} />
      <button onClick={handleClick}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </form>
  )
}
```

### Ref の転送

```tsx
import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

// ✅ 推奨 - forwardRef で ref を転送
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...inputProps }, ref) => {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} {...inputProps} />
        {error && <span>{error}</span>}
      </div>
    )
  }
)

// displayName を設定（開発時のデバッグ用）
Input.displayName = 'Input'
```

---

## コンポーネント設計のベストプラクティス

### 1. Props 型は interface で定義

```tsx
// ✅ 推奨 - interface
interface ButtonProps {
  label: string
  onClick: () => void
}

// ❌ 非推奨 - type（特別な理由がない限り）
type ButtonProps = {
  label: string
  onClick: () => void
}
```

### 2. 型定義のエクスポート

```tsx
// ✅ 推奨 - 型もエクスポート
export interface CardProps {
  title: string
  content: string
}

export const Card = ({ title, content }: CardProps) => {
  // 実装
  return null
}
```

### 3. 省略可能な Props の命名

```tsx
interface AlertProps {
  message: string
  severity?: 'info' | 'warning' | 'error' // ? で省略可能を明示
  onClose?: () => void
}
```

### 4. 複雑な型は別ファイルで管理

```tsx
// components/DataGrid/DataGrid.types.ts
export interface DataGridProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
}

export interface Column<T> {
  field: keyof T
  header: string
  render?: (value: T[keyof T]) => ReactNode
}

// components/DataGrid/DataGrid.tsx
import type { DataGridProps } from './DataGrid.types'

export const DataGrid = <T,>({
  data,
  columns,
  onRowClick,
}: DataGridProps<T>) => {
  // 実装
  return null
}
```

---

## パフォーマンス最適化パターン

### memo の使用

```tsx
import { memo } from 'react'

interface ExpensiveComponentProps {
  data: ComplexData
  config: Config
}

// ✅ 推奨 - memo で最適化
export const ExpensiveComponent = memo<ExpensiveComponentProps>(
  ({ data, config }) => {
    // 重い処理
    return <div>Expensive Render</div>
  }
)

// propsCompare 関数でカスタム比較
export const OptimizedComponent = memo<ExpensiveComponentProps>(
  ({ data, config }) => {
    return <div>Optimized Render</div>
  },
  (prevProps, nextProps) => {
    // true を返すと再レンダリングをスキップ
    return prevProps.data.id === nextProps.data.id
  }
)
```

### useMemo と useCallback

```tsx
import { useMemo, useCallback } from 'react'

interface DataTableProps {
  data: DataItem[]
  onItemClick: (item: DataItem) => void
}

export const DataTable = ({ data, onItemClick }: DataTableProps) => {
  // 重い計算結果をメモ化
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  // コールバック関数をメモ化
  const handleClick = useCallback(
    (item: DataItem) => {
      onItemClick(item)
    },
    [onItemClick]
  )

  return (
    <ul>
      {sortedData.map((item) => (
        <li key={item.id} onClick={() => handleClick(item)}>
          {item.name}
        </li>
      ))}
    </ul>
  )
}
```

---

## ESLint エラー対応

### React.FC 使用時のエラーメッセージ

```
Error: React.FCの使用は禁止されています。
代わりに通常の関数定義とprops型定義を使用してください。
詳細は.claude/skills/react-patterns/SKILL.mdを参照してください。
```

### 修正方法

```tsx
// ❌ エラーが出るコード
import { FC } from 'react'

interface Props {
  name: string
}

export const Greeting: FC<Props> = ({ name }) => {
  return <h1>Hello, {name}!</h1>
}

// ✅ 修正後
interface GreetingProps {
  name: string
}

export const Greeting = ({ name }: GreetingProps) => {
  return <h1>Hello, {name}!</h1>
}
```

---

## チェックリスト

コンポーネント作成時に確認:

- [ ] `React.FC`, `FC`, `FunctionComponent` を使用していない
- [ ] Props 型を interface で明確に定義している
- [ ] children が必要な場合は明示的に `ReactNode` 型で定義
- [ ] イベントハンドラーの型を正しく定義している
- [ ] デフォルト値はデストラクチャリング時に設定
- [ ] ジェネリック型を使用する場合は関数定義で直接使用
- [ ] 必要に応じて memo, useMemo, useCallback で最適化
- [ ] ref の転送が必要な場合は forwardRef を使用
- [ ] displayName を設定（デバッグ用）

---

## 参考資料

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React 公式ドキュメント - TypeScript](https://react.dev/learn/typescript)
- [TypeScript Deep Dive - React](https://basarat.gitbook.io/typescript/tsx/react)
- [Why I Don't Use React.FC](https://kentcdodds.com/blog/how-to-use-react-context-effectively)

---

## まとめ

**React.FC は使用禁止です。常に通常の関数定義とprops型を直接使用してください。**

これにより、より明示的で型安全なコンポーネント実装が可能になります。
