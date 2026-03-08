---
name: storybook-story
description: Storybookストーリー作成時に使用。MUI v7コンポーネントのストーリー生成、バリエーション定義、ドキュメント作成、アクセシビリティチェックを含む。
version: 1.0.0
---

# Storybook ストーリー作成ガイドライン

このスキルは、KDDI Smart Drone Platform UI Theme プロジェクトでStorybookストーリーを作成する際のベストプラクティスを提供します。

## 適用タイミング

以下の作業時に自動的に適用されます：

- 新しいコンポーネントのストーリー作成
- 既存ストーリーの拡張・改善
- ドキュメント作成
- バリエーション追加

## ファイル配置

```
src/stories/
├── Components/
│   ├── Button.stories.tsx
│   ├── Card.stories.tsx
│   └── Grid.stories.tsx
└── Pages/
    └── Dashboard.stories.tsx
```

## 基本構造

### TypeScript + CSF 3.0形式

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { CustomButton } from '@/components/CustomButton'

const meta: Meta<typeof CustomButton> = {
  title: 'Components/CustomButton',
  component: CustomButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'MUI v7ベースのカスタムボタンコンポーネント',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'outlined', 'contained'],
      description: 'ボタンの表示バリエーション',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'ボタンのサイズ',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
  },
}

export default meta
type Story = StoryObj<typeof CustomButton>

export const Primary: Story = {
  args: {
    variant: 'contained',
    size: 'medium',
    children: 'Primary Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'outlined',
    size: 'medium',
    children: 'Secondary Button',
  },
}

export const Small: Story = {
  args: {
    variant: 'contained',
    size: 'small',
    children: 'Small Button',
  },
}

export const Disabled: Story = {
  args: {
    variant: 'contained',
    disabled: true,
    children: 'Disabled Button',
  },
}
```

## MUI v7 Grid コンポーネントのストーリー

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import Grid from '@mui/material/Grid'
import { Box, Paper } from '@mui/material'

const meta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof Grid>

const Item = ({ children }: { children: React.ReactNode }) => (
  <Paper
    sx={{
      padding: 2,
      textAlign: 'center',
      backgroundColor: 'primary.light',
    }}>
    {children}
  </Paper>
)

export const BasicGrid: Story = {
  render: () => (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Item>xs=12 sm=6 md=4</Item>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Item>xs=12 sm=6 md=4</Item>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Item>xs=12 sm=6 md=4</Item>
        </Grid>
      </Grid>
    </Box>
  ),
}

export const ResponsiveGrid: Story = {
  render: () => (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Item>Full Width</Item>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Item>Half on Desktop</Item>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Item>Half on Desktop</Item>
        </Grid>
      </Grid>
    </Box>
  ),
}
```

## インタラクティブストーリー

### アクションとイベント

```tsx
import { action } from '@storybook/addon-actions'

export const Interactive: Story = {
  args: {
    onClick: action('clicked'),
    onFocus: action('focused'),
    onBlur: action('blurred'),
  },
}
```

### Play関数でテスト

```tsx
import { expect, userEvent, within } from '@storybook/test'

export const InteractionTest: Story = {
  args: {
    children: 'Test Button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await expect(button).toBeInTheDocument()
    await userEvent.click(button)
    await expect(button).toHaveFocus()
  },
}
```

## デコレーターの使用

### テーマプロバイダー

```tsx
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '@/themes/theme'

const meta: Meta<typeof Component> = {
  title: 'Components/ThemedComponent',
  component: Component,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
}
```

### グローバルデコレーター（.storybook/preview.tsx）

```tsx
import type { Preview } from '@storybook/react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { theme } from '../src/themes/theme'

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default preview
```

## バリエーションパターン

### すべての状態を網羅

```tsx
// 基本バリエーション
export const Text: Story = { args: { variant: 'text' } }
export const Outlined: Story = { args: { variant: 'outlined' } }
export const Contained: Story = { args: { variant: 'contained' } }

// サイズバリエーション
export const Small: Story = { args: { size: 'small' } }
export const Medium: Story = { args: { size: 'medium' } }
export const Large: Story = { args: { size: 'large' } }

// 状態バリエーション
export const Disabled: Story = { args: { disabled: true } }
export const Loading: Story = { args: { loading: true } }
export const Error: Story = { args: { error: true } }
```

## ドキュメント強化

### MDX形式のドキュメント

```mdx
import { Meta, Story, Canvas, Controls } from '@storybook/blocks'
import * as ButtonStories from './Button.stories'

<Meta of={ButtonStories} />

# CustomButton

MUI v7ベースのカスタムボタンコンポーネント

## 使用方法

\`\`\`tsx
import { CustomButton } from '@/components/CustomButton';

<CustomButton variant='contained' size='medium'>
  Click me
</CustomButton>
\`\`\`

## バリエーション

<Canvas of={ButtonStories.Primary} />
<Canvas of={ButtonStories.Secondary} />

## Props

<Controls of={ButtonStories.Primary} />
```

## パフォーマンステスト

### レンダリング計測

```tsx
import { performance } from '@storybook/addon-measure'

export const PerformanceTest: Story = {
  parameters: {
    measure: {
      enabled: true,
    },
  },
  play: async ({ canvasElement }) => {
    const start = performance.now()
    // テストロジック
    const end = performance.now()
    console.log(`Render time: ${end - start}ms`)
  },
}
```

## アクセシビリティ

### A11yアドオン活用

```tsx
export const AccessibilityTest: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
}
```

## レスポンシブビューポート

```tsx
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}

export const DesktopView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
}
```

## ストーリー命名規則

### 階層構造

```
Components/
├── Buttons/
│   ├── PrimaryButton
│   └── IconButton
├── Forms/
│   ├── TextField
│   └── Select
└── Layout/
    ├── Grid
    └── Container
```

### タイトル命名

- `Components/Button` - コンポーネント
- `Layout/Grid` - レイアウト
- `Pages/Dashboard` - ページ
- `Examples/ComplexForm` - 複合例

## ベストプラクティス

1. 各ストーリーは独立して動作すること
2. デフォルトストーリーは最も一般的なユースケースを示す
3. エッジケース（空データ、エラー状態）も含める
4. インタラクションテストで動作を検証
5. アクセシビリティチェックを実施
6. レスポンシブ対応を確認

## コード品質

ストーリー作成後は必ず実行：

```bash
pnpm storybook  # ローカル確認
pnpm lint       # ESLint
pnpm format     # Prettier
```

## 参考資料

- [Storybook公式ドキュメント](https://storybook.js.org/docs)
- [Component Story Format 3.0](https://storybook.js.org/docs/api/csf)
- [Storybook Testing](https://storybook.js.org/docs/writing-tests)
