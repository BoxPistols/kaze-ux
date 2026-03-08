# テスト環境構築とテスト実装の詳細

このドキュメントでは、KDDI Smart Drone Platform UI Theme コンポーネントプロジェクトで実装したテスト環境とテストケースについて説明します。

## 1. テスト環境の構築

### 1.1 Vitest設定（vitest.config.ts）

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.stories.tsx',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'src/stories/',
        '.storybook/',
        'coverage/',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    logLevel: 'warn',
    silent: false,
    reporters: ['basic'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**主な設定項目：**

- **JSDOM環境**: React コンポーネントテスト用のブラウザ環境をシミュレート
- **カバレッジ設定**: v8プロバイダーを使用、しきい値70%設定
- **除外パターン**: テストファイル、Storybook、型定義ファイルを除外
- **レポーター**: 基本レポーターでクリーンな出力

### 1.2 テストセットアップ（src/test/setup.ts）

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll } from 'vitest'

beforeAll(() => {
  // React 18のact警告を抑制
  global.IS_REACT_ACT_ENVIRONMENT = true

  // MUIの警告を抑制
  const originalError = console.error
  console.error = (...args: Parameters<typeof console.error>) => {
    if (
      args[0]?.includes?.('findDOMNode') ||
      args[0]?.includes?.('Warning:') ||
      args[0]?.includes?.('ReactDOM.render')
    ) {
      return
    }
    originalError(...args)
  }
})

afterEach(() => {
  cleanup()
})
```

**機能：**

- **jest-dom**: カスタムマッチャーの追加
- **自動クリーンアップ**: テスト後のDOMクリーンアップ
- **警告抑制**: React 18のact警告とMUI警告を抑制

### 1.3 TypeScript設定（tsconfig.test.json）

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/test/**/*"],
  "exclude": ["src/**/*.stories.tsx"]
}
```

**設定内容：**

- テスト専用のTypeScript設定
- Vitestグローバル型とjest-dom型を追加
- テストファイルのみをインクルード

## 2. コンポーネントテストの実装

### 2.1 CustomSelectコンポーネントテスト

#### 基本テスト（CustomSelect.test.tsx）

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../../../themes/theme'
import { CustomSelect } from '../index'

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('CustomSelect', () => {
  const mockOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' }
  ]

  // テストケース群...
})
```

**テストケース：**

1. **基本レンダリング**
   - ラベル表示の確認
   - プレースホルダー表示の確認
   - 初期値の表示確認

2. **基本操作**
   - セレクトボックスのクリック
   - オプション一覧の表示
   - オプションの選択機能

3. **エラー状態**
   - エラー状態の表示確認
   - エラーメッセージの表示

#### ユーティリティテスト（utils.test.ts）

```typescript
import { describe, it, expect } from 'vitest'
import { createInputId, getInitialValue, hasValue } from '../utils'

describe('CustomSelect utils', () => {
  describe('createInputId', () => {
    it('ラベルからIDを作成する', () => {
      expect(createInputId('User Name')).toBe('user-name')
      expect(createInputId('Email Address')).toBe('email-address')
    })
  })

  describe('getInitialValue', () => {
    it('初期値を正しく設定する', () => {
      expect(getInitialValue('test')).toBe('test')
      expect(getInitialValue(undefined)).toBe('')
    })
  })

  describe('hasValue', () => {
    it('値の有無を正しく判定する', () => {
      expect(hasValue('test')).toBe(true)
      expect(hasValue('')).toBe(false)
      expect(hasValue(undefined)).toBe(false)
    })
  })
})
```

**テスト対象関数：**

- `createInputId`: ラベルからID生成
- `getInitialValue`: 初期値設定
- `hasValue`: 値の有無判定

### 2.2 CustomTextFieldコンポーネントテスト

#### 基本テスト（CustomTextField.test.tsx）

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CustomTextField } from '../index'

describe('CustomTextField', () => {
  // テストケース群...
})
```

**テストケース：**

1. **基本レンダリング**
   - ラベル表示の確認
   - 必須マーク（\*）の表示確認
   - 初期値の表示確認

2. **基本操作**
   - テキスト入力機能
   - フォーカス状態の確認
   - onChange イベントの発火確認

3. **エラー状態**
   - エラー状態の表示確認
   - ヘルパーテキストの表示確認

## 3. テストコマンドの整備

### 3.1 基本コマンド

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:all": "vitest run --coverage --reporter=basic --reporter=html",
    "test:all:ui": "vitest --ui --coverage --reporter=basic --reporter=html",
    "test:all:watch": "vitest --coverage --reporter=basic"
  }
}
```

### 3.2 コマンド詳細

| コマンド              | 説明                                 |
| --------------------- | ------------------------------------ |
| `pnpm test`           | 基本的なテスト実行（watch モード）   |
| `pnpm test:run`       | 1回だけテスト実行                    |
| `pnpm test:ui`        | Vitest UI でテスト実行               |
| `pnpm test:coverage`  | カバレッジ付きテスト実行             |
| `pnpm test:all`       | カバレッジ + HTMLレポート + 詳細ログ |
| `pnpm test:all:ui`    | UI付きフルテスト                     |
| `pnpm test:all:watch` | watchモードでフルテスト              |

## 4. ESLint設定の最適化

### 4.1 テストファイル除外設定

```javascript
export default [
  // ... その他の設定 ...
  {
    ignores: [
      // ... その他の除外パターン ...
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/test/**/*',
    ],
  },
]
```

### 4.2 Storybookルール修正

```javascript
{
  files: ['**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  rules: {
    'storybook/no-renderer-packages': 'off'
  }
}
```

## 5. Git設定の改善

### 5.1 .gitignore追加

```gitignore
# Testing
coverage/
.nyc_output/

# Test reports
html/
```

### 5.2 Huskyフック（.husky/pre-push）

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running tests..."
pnpm test:run

echo "🏗️ Running build..."
pnpm run build

echo "✅ All checks passed!"
```

## 6. テスト結果とカバレッジ

### 6.1 実行結果

```bash
✓ src/components/Form/CustomSelect/__tests__/CustomSelect.test.tsx (8)
✓ src/components/Form/CustomSelect/__tests__/utils.test.ts (8)
✓ src/components/Form/CustomTextField/__tests__/CustomTextField.test.tsx (7)

Test Files  3 passed (3)
Tests  23 passed (23)
```

### 6.2 カバレッジ結果

| ファイル                  | カバレッジ |
| ------------------------- | ---------- |
| CustomSelect/index.tsx    | 78.06%     |
| CustomTextField/index.tsx | 90.56%     |
| 全体平均                  | 84.31%     |

## 7. 技術的な課題と解決策

### 7.1 型安全性の確保

- `any` 型の使用を禁止
- 外部型定義がない場合も最小限の厳格な型を定義
- TypeScript strictモードでの開発

### 7.2 MUIコンポーネントの特殊対応

- ARIA属性の適切な使用
- MUI特有のイベント処理への対応
- テーマプロバイダーでのラッピング

### 7.3 パフォーマンス最適化

- テスト実行時間の短縮（約2.5秒）
- カバレッジ生成の効率化
- 不要な警告の抑制

### 7.4 開発体験の向上

- クリーンな出力とログ
- 直感的なコマンド体系
- CI/CD連携での品質保証

## 8. 今後の拡張予定

### 8.1 追加テストケース

- エッジケースのテスト
- アクセシビリティテスト
- パフォーマンステスト

### 8.2 テスト環境の改善

- E2Eテストの導入（Playwright等）
- ビジュアルリグレッションテスト
- モックサーバーの整備

### 8.3 CI/CD統合

- GitHub Actionsでの自動テスト
- テストカバレッジの自動レポート
- 品質ゲートの設定

---

このテスト環境により、コンポーネントの品質を継続的に保証し、安全なリファクタリングと機能追加が可能になります。
