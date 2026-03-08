# React.FC 完全防止システム

このドキュメントは、React.FCの使用を二度と再発させないために実装された包括的な防止システムについて説明します。

## 🚨 重要: React.FC は完全に禁止されています

このプロジェクトでは、以下のすべての記法が禁止されています:

- `React.FC<Props>`
- `FC<Props>`
- `React.FunctionComponent<Props>`
- `FunctionComponent<Props>`

## 実装された防止システム（5層の防御）

### レイヤー1: ESLint 自動検出（リアルタイム）

**ファイル**: `eslint.config.js`

```javascript
'no-restricted-syntax': [
  'error',
  {
    selector: "TSTypeReference[typeName.name='FC']",
    message: '🚨 React.FC の使用は禁止されています...',
  },
  // ... 他のパターン
]
```

**動作**:

- コード入力時にリアルタイムで検出
- `pnpm lint` コマンドで検証
- IDEでエラー表示（VSCode、Cursor等）
- 自動修正は不可（手動修正が必要）

**テスト方法**:

```bash
pnpm lint
# React.FC使用箇所でエラーが表示されることを確認
```

---

### レイヤー2: pre-commit Hook（コミット前検出）

**ファイル**:

- `scripts/check-react-fc.sh`
- `.husky/pre-commit`

**動作**:

- gitコミット時に自動実行
- ステージングされたファイルのみをチェック
- React.FCパターンを検出すると、コミットをブロック
- 詳細なエラーメッセージと修正方法を表示

**テスト方法**:

```bash
# React.FCを含むファイルをステージング
git add some-file-with-fc.tsx
git commit -m "test"
# → コミットがブロックされ、エラーメッセージが表示される
```

---

### レイヤー3: Claude Code Skills（AI開発支援）

**ファイル**: `.claude/skills/react-patterns/SKILL.md`

**内容**:

- React.FC禁止の詳細な理由説明
- 推奨される代替パターン（10以上の実例）
- ジェネリック型、Ref転送、パフォーマンス最適化パターン
- チェックリストとトラブルシューティング

**動作**:

- Reactコンポーネント作成時に自動参照
- Claude CodeがReact.FCを使用しようとすると、このSkillが適用される
- 明示的な警告とベストプラクティスを提示

---

### レイヤー4: プロジェクトドキュメント（開発者教育）

**更新されたファイル**:

1. **`AI_DEVELOPMENT_RULES.md`**
   - React.FC禁止を強調表示（🚨アイコン付き）
   - コンポーネント実装規約セクションに詳細記載
   - アンチパターンリストの最上位に配置

2. **`.claude/CLAUDE.md`**
   - 起動メッセージに警告を追加
   - 必須確認事項の最上位に配置
   - Skills紹介で`react-patterns`を最重要として強調

3. **`.claude/skills/mui-v7-component/SKILL.md`**
   - すべてのReact.FC使用例を削除
   - 代替パターンに置き換え
   - 明示的な禁止警告を追加

**動作**:

- 開発開始時に必ず目にする
- AIエージェント（Claude、Cursor等）が参照
- 新規開発者へのオンボーディング資料として機能

---

### レイヤー5: CI/CD自動チェック（既存設定）

**ファイル**: `.github/workflows/ai-review.yml`

**動作**:

- PR作成時に自動実行
- プロジェクトルールチェックでReact.FC使用を検出
- レビューコメントで警告

---

## 防止システムの動作フロー

```
開発開始
  ↓
【レイヤー4】ドキュメント参照
  ↓
コード記述
  ↓
【レイヤー3】Claude Code Skillsが適切なパターンを提案
  ↓
【レイヤー1】ESLintがリアルタイムで検出
  ↓
コード修正
  ↓
git add
  ↓
git commit
  ↓
【レイヤー2】pre-commit hookが検出
  ↓
（React.FCが無いことを確認）
  ↓
コミット成功
  ↓
git push
  ↓
【レイヤー5】CI/CDで最終チェック
  ↓
PRマージ
```

---

## React.FC禁止の理由

1. **暗黙的なchildren型定義**: 意図しないpropsが受け入れられる
2. **ジェネリック型の制約**: 複雑な型を扱う際に制約がある
3. **defaultPropsの非互換性**: React 18+でサポートが限定的
4. **不要な抽象化**: TypeScriptの型システムを直接使用する方が明示的
5. **React公式の非推奨**: Reactチームが推奨していない

---

## 推奨される代替パターン

### 基本パターン

```tsx
// ❌ 禁止
import { FC } from 'react'
export const Button: FC<ButtonProps> = (props) => { ... }

// ✅ 推奨
export const Button = (props: ButtonProps) => { ... }
```

### childrenを含むパターン

```tsx
import { ReactNode } from 'react'

interface CardProps {
  title: string
  children: ReactNode // 明示的に定義
}

export const Card = ({ title, children }: CardProps) => {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  )
}
```

### ジェネリック型パターン

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => ReactNode
}

export const List = <T,>({ items, renderItem }: ListProps<T>) => {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}
```

**詳細は `.claude/skills/react-patterns/SKILL.md` を参照してください。**

---

## トラブルシューティング

### ESLintエラーが出た場合

```
Error: 🚨 React.FC の使用は禁止されています。
```

**対処法**:

1. `React.FC<Props>` を削除
2. 関数パラメータに型を直接指定: `(props: Props)`
3. `pnpm lint` で確認

### pre-commitでブロックされた場合

```
🚨 React.FC / FC / FunctionComponent の使用が検出されました！
```

**対処法**:

1. エラーメッセージで表示されたファイルと行を確認
2. React.FCを代替パターンに修正
3. `git add` でステージング
4. 再度 `git commit`

### 既存コードにReact.FCがある場合

```bash
# 検出
pnpm lint

# 該当箇所を手動で修正
# - React.FCを削除
# - propsに型を直接指定

# 確認
pnpm lint
```

---

## 統計と効果測定

### 実装された防御レイヤー

- ✅ **5層の防御システム**
- ✅ **3つのドキュメント更新**
- ✅ **1つの新規Skill作成**
- ✅ **1つのESLintルール追加**
- ✅ **1つのpre-commit hook追加**

### 検出タイミング

| タイミング   | 検出方法        | 自動/手動 |
| :----------- | :-------------- | :-------- |
| コード入力時 | ESLint          | 自動      |
| 保存時       | IDE統合         | 自動      |
| コミット前   | pre-commit hook | 自動      |
| PR作成時     | CI/CD           | 自動      |
| 開発開始時   | ドキュメント    | 手動      |

---

## メンテナンス

### 定期確認事項

1. **ESLint設定の動作確認**（月1回）

   ```bash
   pnpm lint
   ```

2. **pre-commit hookの動作確認**（月1回）

   ```bash
   # テストファイルでReact.FCを使用してコミット試行
   ```

3. **ドキュメントの更新**（必要時）
   - 新しいパターンの追加
   - トラブルシューティングの更新

### 新規開発者向けオンボーディング

1. `AI_DEVELOPMENT_RULES.md` を読む
2. `.claude/skills/react-patterns/SKILL.md` を読む
3. サンプルコンポーネントで実践
4. `pnpm lint` で確認

---

## 参考資料

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React 公式ドキュメント - TypeScript](https://react.dev/learn/typescript)
- [Why I Don't Use React.FC](https://kentcdodds.com/blog/how-to-use-react-context-effectively)
- `.claude/skills/react-patterns/SKILL.md` - 包括的なパターン集

---

## まとめ

このプロジェクトでは、**5層の防御システム**により、React.FCの使用を完全に防止します:

1. ✅ **ESLint** - リアルタイム検出
2. ✅ **pre-commit hook** - コミット前ブロック
3. ✅ **Claude Code Skills** - AI開発支援
4. ✅ **プロジェクトドキュメント** - 開発者教育
5. ✅ **CI/CD** - PR時の最終チェック

**React.FCは二度と使用されることはありません。**
