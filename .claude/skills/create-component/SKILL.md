---
name: create-component
description: Kaze DS準拠の新コンポーネントをscaffold。ファイル・Story・メタデータ・テストを一括生成
user_invocable: true
---

# /create-component

新しいコンポーネントを Kaze Design System の規約に従って scaffold する。

## 使い方

```
/create-component Button
/create-component ServiceCard --category=UI
/create-component DateRangePicker --category=Form
```

## 生成ファイル

引数 `ComponentName` から以下を生成:

1. `src/components/ui/{componentName}/{componentName}.tsx` — コンポーネント本体
2. `src/stories/04-Components/UI/{ComponentName}/{ComponentName}.stories.tsx` — Storybook Story
3. `metadata/components.json` に新エントリ追加
4. テストが必要な場合: `src/components/ui/{componentName}/__tests__/{componentName}.test.tsx`

## 規約

生成コードは以下に従う:

- `foundations/prohibited.md` の全ルール
- `CLAUDE.md` の Key Rules
- plain function + typed props（React.FC 禁止）
- `export const`（default export 禁止）
- セミコロンなし / シングルクォート
- MUI sx prop + Tailwind クラスのハイブリッド
- `aria-*` 属性を適切に付与

## テンプレート

```tsx
// src/components/ui/{componentName}/{componentName}.tsx
import { Box } from '@mui/material'

import type { SxProps, Theme } from '@mui/material'

interface {ComponentName}Props {
  // props
  sx?: SxProps<Theme>
}

export const {ComponentName} = ({ sx, ...props }: {ComponentName}Props) => {
  return (
    <Box sx={sx} {...props}>
      {/* component content */}
    </Box>
  )
}
```

## metadata/components.json への追加

```json
{
  "{componentName}": {
    "name": "{ComponentName}",
    "category": "{category}",
    "path": "src/components/ui/{componentName}/{componentName}.tsx",
    "description": "{description}",
    "accessibility": []
  }
}
```
