# コーディングルール

このドキュメントでは、KDDI Smart Drone Platform UI Theme プロジェクトで使用するコーディングルールについて説明します。

## MUI v7 Grid コンポーネントの使用ルール

### 概要

MUI v7では、GridコンポーネントのAPIが大幅に変更されました。古いAPIは非推奨となり、新しいAPIの使用が推奨されています。

### 変更点

#### 1. `item` プロパティの削除

**[非推奨] 古い書き方（非推奨）**

```tsx
<Grid item xs={12} sm={6} md={4}>
  <Content />
</Grid>
```

**[推奨] 新しい書き方（推奨）**

```tsx
<Grid size={{ xs: 12, sm: 6, md: 4 }}>
  <Content />
</Grid>
```

#### 2. `size` プロパティの導入

**[非推奨] 古い書き方（非推奨）**

```tsx
<Grid xs={12} sm={6} md={4} lg={3}>
  <Content />
</Grid>
```

**[推奨] 新しい書き方（推奨）**

```tsx
<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
  <Content />
</Grid>
```

### レスポンシブブレークポイント

MUI v7のGridシステムでは、以下のブレークポイントが使用できます：

- `xs`: 0px以上
- `sm`: 600px以上
- `md`: 900px以上
- `lg`: 1200px以上
- `xl`: 1536px以上

### 使用例

#### 基本的なグリッドレイアウト

```tsx
<Grid container spacing={2}>
  <Grid size={8}>
    <Item>size=8</Item>
  </Grid>
  <Grid size={4}>
    <Item>size=4</Item>
  </Grid>
</Grid>
```

#### レスポンシブグリッド

```tsx
<Grid container spacing={2}>
  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
    <Item>Responsive Item</Item>
  </Grid>
  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
    <Item>Responsive Item</Item>
  </Grid>
  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
    <Item>Responsive Item</Item>
  </Grid>
  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
    <Item>Responsive Item</Item>
  </Grid>
</Grid>
```

#### オフセットの使用

```tsx
<Grid container spacing={3}>
  <Grid size={{ xs: 6, md: 2 }} offset={{ xs: 3, md: 0 }}>
    <Item>1</Item>
  </Grid>
  <Grid size={{ xs: 4, md: 2 }} offset={{ md: 'auto' }}>
    <Item>2</Item>
  </Grid>
</Grid>
```

### マイグレーションガイド

既存のコードを新しいAPIに移行する際は、以下の手順に従ってください：

1. **`item`プロパティの削除**: すべての`<Grid item>`を`<Grid>`に変更
2. **`size`プロパティの追加**: 個別のブレークポイントプロパティを`size`オブジェクトに統合
3. **レスポンシブ値の確認**: すべてのブレークポイントが正しく指定されていることを確認

### 注意事項

- **`direction="column"`は非対応**: Gridコンポーネントは列方向のレイアウト専用です
- **自動配置は非対応**: CSS Gridを使用することを推奨
- **行スパンは非対応**: 複数行にまたがるアイテムにはCSS Gridを使用

### 型安全性

TypeScriptを使用する場合、以下の型定義が利用できます：

```tsx
import { Grid } from '@mui/material'

// 型安全な使用例
;<Grid size={{ xs: 12, sm: 6, md: 4 }} offset={{ md: 2 }} container={false}>
  <Content />
</Grid>
```

### ベストプラクティス

1. **一貫性の維持**: プロジェクト全体で同じ書き方を使用
2. **レスポンシブデザイン**: モバイルファーストのアプローチを採用
3. **パフォーマンス**: 不要なネストを避ける
4. **可読性**: 複雑なレイアウトにはコメントを追加

### 参考リンク

- [MUI Grid Documentation](https://mui.com/material-ui/react-grid/)
- [MUI v7 Migration Guide](https://mui.com/material-ui/migration/migration-v6/)

---

**更新日**: 2024年12月
**バージョン**: MUI v7.x
