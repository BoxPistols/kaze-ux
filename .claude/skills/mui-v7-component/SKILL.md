---
name: mui-v7-component
description: Material-UI v7コンポーネント作成時に使用。新しいGrid APIの使用、TypeScript型定義、Tailwind CSS統合、レスポンシブデザイン対応を含む。
version: 1.0.0
---

# MUI v7 コンポーネント作成ガイドライン

このスキルは、KDDI Smart Drone Platform UI Theme プロジェクトでMaterial-UI v7コンポーネントを作成する際のベストプラクティスを提供します。

## 適用タイミング

以下の作業時に自動的に適用されます：

- 新しいMUIコンポーネントの作成
- 既存コンポーネントのMUI v7への移行
- レスポンシブレイアウトの実装
- MUIテーマカスタマイズ

## MUI v7 Grid コンポーネント

### 新しいAPI（必須）

```tsx
import Grid from '@mui/material/Grid'

// 正しい実装
;<Grid container spacing={2}>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Item>Content</Item>
  </Grid>
</Grid>
```

### 避けるべき古いAPI

```tsx
// 非推奨 - 使用しない
<Grid item xs={12} sm={6} md={4}>
  <Item>Content</Item>
</Grid>
```

### レスポンシブブレークポイント

- `xs`: 0px以上（モバイル）
- `sm`: 600px以上（タブレット）
- `md`: 900px以上（小型デスクトップ）
- `lg`: 1200px以上（デスクトップ）
- `xl`: 1536px以上（大型デスクトップ）

## TypeScript型定義

### Props型定義（厳格な型を使用）

**重要**: `React.FC`や`FC`の使用は禁止されています。代わりに通常の関数定義とprops型定義を使用してください。

```tsx
import { BoxProps } from '@mui/material/Box'

interface CustomComponentProps extends BoxProps {
  title: string
  description?: string
  variant: 'primary' | 'secondary' | 'tertiary'
  onAction: (id: string) => void
}

// 推奨パターン: 通常の関数定義とprops型を直接指定
export const CustomComponent = ({
  title,
  description,
  variant = 'primary',
  onAction,
  ...boxProps
}: CustomComponentProps) => {
  // 実装
  return null
}
```

### 型のエクスポート

```tsx
// コンポーネントと一緒に型をエクスポート
export type { CustomComponentProps }
```

## Tailwind CSS統合

### MUI + Tailwind併用パターン

```tsx
import { Box } from '@mui/material'
import { twMerge } from 'tailwind-merge'

interface ComponentProps {
  className?: string
}

export const Component = ({ className, ...props }: ComponentProps) => (
  <Box
    className={twMerge('p-4 rounded-lg shadow-md', className)}
    sx={{
      backgroundColor: 'primary.main',
      '&:hover': {
        backgroundColor: 'primary.dark',
      },
    }}
    {...props}>
    Content
  </Box>
)
```

### スタイリング優先順位

1. MUI `sx` prop - テーマ変数、状態管理
2. Tailwind classes - レイアウト、スペーシング
3. `className` - カスタムスタイル

## コンポーネント構造

### ファイル配置

```
src/components/
├── CustomComponent/
│   ├── index.ts          # エクスポート
│   ├── CustomComponent.tsx
│   └── CustomComponent.types.ts
```

### インポート順序

```tsx
// 1. React関連（注: FCは使用禁止）
import { useState, useEffect } from 'react'

// 2. MUIコンポーネント
import { Box, Typography, Button } from '@mui/material'
import Grid from '@mui/material/Grid'

// 3. サードパーティ
import { twMerge } from 'tailwind-merge'

// 4. プロジェクト内部
import { CustomType } from '@/types'
import { useCustomHook } from '@/hooks'

// 5. 型定義（ローカル）
import type { CustomComponentProps } from './CustomComponent.types'
```

## アクセシビリティ

### 必須属性

```tsx
<Button
  aria-label="閉じる"
  aria-describedby="dialog-description"
  role="button"
>
  <CloseIcon />
</Button>

<Typography id="dialog-description" variant="body2">
  この操作は取り消せません
</Typography>
```

### キーボードナビゲーション

```tsx
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onAction()
  }
}

;<Box tabIndex={0} onKeyDown={handleKeyDown} role='button'>
  Clickable Content
</Box>
```

## パフォーマンス最適化

### メモ化

```tsx
import { memo, useMemo, useCallback } from 'react'

export const ExpensiveComponent = memo<Props>(({ data, onUpdate }) => {
  const processedData = useMemo(() => heavyComputation(data), [data])

  const handleUpdate = useCallback(
    (id: string) => {
      onUpdate(id)
    },
    [onUpdate]
  )

  return <div>{/* レンダリング */}</div>
})

ExpensiveComponent.displayName = 'ExpensiveComponent'
```

### 遅延読み込み

```tsx
import { lazy, Suspense } from 'react'
import { CircularProgress } from '@mui/material'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

export const Page = () => (
  <Suspense fallback={<CircularProgress />}>
    <HeavyComponent />
  </Suspense>
)
```

## テーマカスタマイズ

### テーマ変数の使用

```tsx
import { useTheme } from '@mui/material/styles'

export const ThemedComponent = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        padding: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderRadius: theme.shape.borderRadius,
        [theme.breakpoints.up('md')]: {
          padding: theme.spacing(4),
        },
      }}>
      Content
    </Box>
  )
}
```

## バリデーション

### PropTypes不使用

TypeScriptの型定義を使用するため、PropTypesは使用しません。

### ランタイムバリデーション（必要時のみ）

```tsx
interface ComponentProps {
  value: number
}

export const Component = ({ value }: ComponentProps) => {
  if (process.env.NODE_ENV === 'development') {
    if (value < 0 || value > 100) {
      console.warn('valueは0-100の範囲で指定してください')
    }
  }

  // 実装
  return null
}
```

## コード品質チェック

コンポーネント作成後は必ず実行：

```bash
pnpm lint    # ESLint
pnpm format  # Prettier
```

## 参考資料

- [MUI v7 Grid Documentation](https://mui.com/material-ui/react-grid/)
- [MUI v7 Migration Guide](https://mui.com/material-ui/migration/migration-grid-v2/)
- [MUI Customization](https://mui.com/material-ui/customization/how-to-customize/)
