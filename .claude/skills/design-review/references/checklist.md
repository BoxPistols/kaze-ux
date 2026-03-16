# Design Review チェックリスト

## 1. コンポーネント規約

- [ ] React.FC / FC / FunctionComponent を使っていない
- [ ] export default を使っていない（export const）
- [ ] セミコロンを使っていない
- [ ] シングルクォートを使っている
- [ ] any 型を使っていない
- [ ] MUI v7 Grid API（`size={{ }}`）を使っている

## 2. カラー

- [ ] ハードコード HEX 値を使っていない（primary.main 等のトークン参照）
- [ ] text-black / text-white を使っていない
- [ ] bg-gray-\* を直接使っていない

## 3. タイポグラフィ

- [ ] fontSize に px 直書きをしていない（MUI typography variant を使用）
- [ ] Inter / Noto Sans JP 以外のフォントを使っていない

## 4. スペーシング

- [ ] margin/padding に奇数 px を使っていない（4px グリッド基準）

## 5. レイアウト

- [ ] position: fixed を直接使っていない（Fab コンポーネント推奨）
- [ ] z-index に任意の値を使っていない

## 6. アクセシビリティ

- [ ] IconButton に aria-label がある
- [ ] 色だけで状態を伝えていない
- [ ] outline: none でフォーカスリングを削除していない
- [ ] img に alt がある（装飾画像は alt="" + aria-hidden）

## 7. AI 生成パターン

- [ ] カード上部にカラーバー装飾がない
- [ ] 過度なグラデーション背景がない
- [ ] カードに rounded-full を使っていない
