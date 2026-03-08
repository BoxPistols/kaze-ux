# GitHub Copilot Instructions

## プロジェクトコンテキスト

このプロジェクトは「KDDI Smart Drone Platform UI Theme」で、以下の規約に従います：

- **統一ルール**: `AI_DEVELOPMENT_RULES.md` を必ず参照
- **技術スタック**: MUI v7, Tailwind CSS v3, TypeScript, React, Storybook
- **言語**: 日本語コメント、英語コード
- **スタイル**: プロジェクトの ESLint/Prettier 設定に準拠

## コード生成ルール

### 基本原則

1. **型安全性**: TypeScript strict mode に準拠、`any`型は原則禁止
2. **MUI v7新API**: `<Grid size={{ xs: 12, sm: 6, md: 4 }}>` 形式を使用
3. **絵文字禁止**: すべてのコード、コメント、ドキュメントで絵文字を使用しない
4. **日本語コメント**: コードコメントは日本語で記述
5. **pnpm専用**: npmコマンドは使用禁止

### コンポーネント生成時

- **型定義**: propsの型を明確に定義（interfaceまたはtype）
- **関数形式**: アロー関数（`const Component = () => {}`）を使用
- **エクスポート**: `export const` を使用
- **ファイル名**: camelCase（例: `userCard.tsx`）
- **コンポーネント名**: PascalCase（例: `UserCard`）

```typescript
// 良い例
interface UserCardProps {
  name: string
  email: string
  avatar?: string
  onEdit?: () => void
}

export const UserCard = ({ name, email, avatar, onEdit }: UserCardProps) => {
  // 実装
  return (
    <Card>
      {/* コンポーネント内容 */}
    </Card>
  )
}

// 悪い例（避けるべき）
export const UserCard = (props: any) => {
  // any型は禁止
}
```

### MUI コンポーネント使用時

```typescript
// 良い例：新しいGrid API
<Grid container spacing={2}>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Card>Content</Card>
  </Grid>
</Grid>

// 悪い例：古いAPI（使用禁止）
<Grid item xs={12} sm={6} md={4}>
  <Card>Content</Card>
</Grid>
```

### カスタムフック生成時

- **命名**: `use` + PascalCase（例: `useTheme`, `useBreakpoint`）
- **型定義**: 戻り値の型を明確に定義
- **依存配列**: useEffectやuseCallbackの依存配列を正確に記述

```typescript
// 良い例
interface UseUserDataReturn {
  user: User | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

export const useUserData = (userId: string): UseUserDataReturn => {
  // 実装
  return { user, loading, error, refetch }
}
```

### Storybook ストーリー生成時

```typescript
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { UserCard } from './userCard'

const meta = {
  title: 'Components/UserCard',
  component: UserCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UserCard>

export default meta
type Story = StoryObj<typeof meta>

// デフォルトストーリー
export const Default: Story = {
  args: {
    name: '山田太郎',
    email: 'yamada@example.com',
  },
}

// バリエーション
export const WithAvatar: Story = {
  args: {
    ...Default.args,
    avatar: '/avatar.jpg',
  },
}
```

## 優先パターン

### 1. 早期リターン

```typescript
// 良い例
const processData = (data: Data | null) => {
  if (!data) return null
  if (!data.isValid) return null

  return data.process()
}

// 悪い例（深いネスト）
const processData = (data: Data | null) => {
  if (data) {
    if (data.isValid) {
      return data.process()
    }
  }
  return null
}
```

### 2. 関数型プログラミング

```typescript
// 良い例
const activeUsers = users.filter((user) => user.isActive)
const userNames = activeUsers.map((user) => user.name)

// 悪い例（手続き型）
const activeUsers = []
for (let i = 0; i < users.length; i++) {
  if (users[i].isActive) {
    activeUsers.push(users[i])
  }
}
```

### 3. イミュータブルデータ

```typescript
// 良い例
const updatedUser = { ...user, name: 'new name' }
const updatedItems = [...items, newItem]

// 悪い例（直接変更）
user.name = 'new name'
items.push(newItem)
```

## エラーハンドリング

```typescript
// 良い例：try-catchとエラーメッセージ
const fetchUserData = async (userId: string) => {
  try {
    const response = await fetch(`/api/users/${userId}`)
    if (!response.ok) {
      throw new Error('ユーザーデータの取得に失敗しました')
    }
    return await response.json()
  } catch (error) {
    console.error('エラー:', error)
    throw error
  }
}
```

## アクセシビリティ

```typescript
// 良い例：ARIA属性とキーボード対応
<button
  onClick={handleClick}
  aria-label="ユーザー情報を編集"
  disabled={isLoading}
>
  編集
</button>

// テキストフィールド
<TextField
  label="メールアドレス"
  type="email"
  required
  aria-describedby="email-helper-text"
  helperText="例: user@example.com"
/>
```

## レスポンシブデザイン

```typescript
// MUI Breakpoints使用例
<Box
  sx={{
    width: { xs: '100%', sm: '80%', md: '60%' },
    padding: { xs: 2, sm: 3, md: 4 },
  }}
>
  {/* コンテンツ */}
</Box>

// Tailwind CSS使用例
<div className="w-full sm:w-4/5 md:w-3/5 p-2 sm:p-3 md:p-4">
  {/* コンテンツ */}
</div>
```

## テスト記述時

```typescript
// Vitest + React Testing Library
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserCard } from './userCard'

describe('UserCard', () => {
  it('ユーザー名とメールアドレスを表示する', () => {
    render(
      <UserCard
        name="山田太郎"
        email="yamada@example.com"
      />
    )

    expect(screen.getByText('山田太郎')).toBeInTheDocument()
    expect(screen.getByText('yamada@example.com')).toBeInTheDocument()
  })

  it('編集ボタンクリック時にonEditが呼ばれる', async () => {
    const handleEdit = vi.fn()
    render(
      <UserCard
        name="山田太郎"
        email="yamada@example.com"
        onEdit={handleEdit}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: '編集' }))
    expect(handleEdit).toHaveBeenCalledTimes(1)
  })
})
```

## 禁止事項

1. **any型の使用** → 適切な型定義を行う
2. **古いMUI Grid API** → 新しい`size`プロパティを使用
3. **console.logの残存** → デバッグ後は削除
4. **絵文字の使用** → テキストのみで表現
5. **npmコマンド** → pnpmを使用

## コミットメッセージ形式

```bash
# 良い例（日本語、絵文字なし）
feat: ユーザーカードコンポーネント追加
fix: テーマカラーの型定義を修正
docs: Storybookドキュメント更新

# 悪い例（英語、絵文字あり）
feat: Add user card component
fix: 🐛 Fix theme color type definition
```

## 参考リンク

- [AI_DEVELOPMENT_RULES.md](../AI_DEVELOPMENT_RULES.md) - 統一開発ルール
- [MUI v7 Documentation](https://mui.com/material-ui/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Storybook Documentation](https://storybook.js.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
