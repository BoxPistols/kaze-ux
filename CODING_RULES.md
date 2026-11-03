# Coding Rules / コーディングルール

This document describes the coding rules used in the Kaze UX Design System project.

## MUI v7 Grid Component Rules / MUI v7 Grid コンポーネントの使用ルール

### Overview / 概要

MUI v7 introduced significant changes to the Grid component API. The old API is deprecated, and the new API is required.

### Changes / 変更点

#### 1. Removal of `item` property / `item` プロパティの削除

**[Deprecated] Old syntax**

```tsx
<Grid item xs={12} sm={6} md={4}>
  <Content />
</Grid>
```

**[Recommended] New syntax**

```tsx
<Grid size={{ xs: 12, sm: 6, md: 4 }}>
  <Content />
</Grid>
```

#### 2. Introduction of `size` property / `size` プロパティの導入

**[Deprecated] Old syntax**

```tsx
<Grid xs={12} sm={6} md={4} lg={3}>
  <Content />
</Grid>
```

**[Recommended] New syntax**

```tsx
<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
  <Content />
</Grid>
```

### Responsive Breakpoints / レスポンシブブレークポイント

MUI v7 Grid system supports the following breakpoints:

- `xs`: 0px and above
- `sm`: 600px and above
- `md`: 900px and above
- `lg`: 1200px and above
- `xl`: 1536px and above

### Examples / 使用例

#### Basic Grid Layout / 基本的なグリッドレイアウト

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

#### Responsive Grid / レスポンシブグリッド

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

#### Using Offset / オフセットの使用

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

### Migration Guide / マイグレーションガイド

When migrating existing code to the new API:

1. **Remove `item` property**: Change all `<Grid item>` to `<Grid>`
2. **Add `size` property**: Consolidate individual breakpoint props into `size` object
3. **Verify responsive values**: Ensure all breakpoints are correctly specified

### Notes / 注意事項

- **`direction="column"` not supported**: Grid component is for column-direction layout only
- **Auto-placement not supported**: Use CSS Grid instead
- **Row span not supported**: Use CSS Grid for multi-row items

### Type Safety / 型安全性

When using TypeScript:

```tsx
import { Grid } from '@mui/material'

// Type-safe usage
;<Grid size={{ xs: 12, sm: 6, md: 4 }} offset={{ md: 2 }} container={false}>
  <Content />
</Grid>
```

### Best Practices / ベストプラクティス

1. **Consistency**: Use the same syntax throughout the project
2. **Responsive design**: Adopt mobile-first approach
3. **Performance**: Avoid unnecessary nesting
4. **Readability**: Add comments for complex layouts

### References / 参考リンク

- [MUI Grid Documentation](https://mui.com/material-ui/react-grid/)
- [MUI v7 Migration Guide](https://mui.com/material-ui/migration/migration-v6/)

---

**Last updated**: 2024-12
**Version**: MUI v7.x
