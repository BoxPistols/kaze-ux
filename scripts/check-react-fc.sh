#!/bin/bash

# React.FC / FC / FunctionComponent の使用をチェックするスクリプト

echo "🔍 React.FC 使用チェックを実行中..."

# 検索対象のパターン
# - React.FC
# - React.FunctionComponent
# - : FC<
# - : FunctionComponent<
# ただし、コメントとドキュメント内は除外

# ステージングされたファイルのみをチェック
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(tsx?)$')

if [ -z "$STAGED_FILES" ]; then
  echo "✅ チェック対象のTypeScriptファイルがありません"
  exit 0
fi

# React.FCのパターンを検索
FOUND_ISSUES=0

for FILE in $STAGED_FILES; do
  # コメント行を除外して検索
  # 1. React.FC<
  if grep -n "React\.FC<" "$FILE" | grep -v "^[[:space:]]*\/\/" | grep -v "^[[:space:]]*\*" | grep -q .; then
    echo "❌ $FILE: React.FC の使用が検出されました"
    grep -n "React\.FC<" "$FILE" | grep -v "^[[:space:]]*\/\/" | grep -v "^[[:space:]]*\*"
    FOUND_ISSUES=1
  fi

  # 2. : FC<
  if grep -n ": FC<" "$FILE" | grep -v "^[[:space:]]*\/\/" | grep -v "^[[:space:]]*\*" | grep -q .; then
    echo "❌ $FILE: FC の使用が検出されました"
    grep -n ": FC<" "$FILE" | grep -v "^[[:space:]]*\/\/" | grep -v "^[[:space:]]*\*"
    FOUND_ISSUES=1
  fi

  # 3. React.FunctionComponent<
  if grep -n "React\.FunctionComponent<" "$FILE" | grep -v "^[[:space:]]*\/\/" | grep -v "^[[:space:]]*\*" | grep -q .; then
    echo "❌ $FILE: React.FunctionComponent の使用が検出されました"
    grep -n "React\.FunctionComponent<" "$FILE" | grep -v "^[[:space:]]*\/\/" | grep -v "^[[:space:]]*\*"
    FOUND_ISSUES=1
  fi

  # 4. : FunctionComponent<
  if grep -n ": FunctionComponent<" "$FILE" | grep -v "^[[:space:]]*\/\/" | grep -v "^[[:space:]]*\*" | grep -q .; then
    echo "❌ $FILE: FunctionComponent の使用が検出されました"
    grep -n ": FunctionComponent<" "$FILE" | grep -v "^[[:space:]]*\/\/" | grep -v "^[[:space:]]*\*"
    FOUND_ISSUES=1
  fi
done

if [ $FOUND_ISSUES -eq 1 ]; then
  echo ""
  echo "🚨 React.FC / FC / FunctionComponent の使用が検出されました！"
  echo ""
  echo "【エラー】React.FC の使用は禁止されています。"
  echo ""
  echo "【修正方法】"
  echo "以下のように通常の関数定義とprops型を使用してください："
  echo ""
  echo "❌ 禁止パターン:"
  echo "  import { FC } from 'react'"
  echo "  export const Component: FC<Props> = (props) => { ... }"
  echo ""
  echo "✅ 推奨パターン:"
  echo "  export const Component = (props: Props) => { ... }"
  echo ""
  echo "詳細は .claude/skills/react-patterns/SKILL.md を参照してください。"
  echo ""
  exit 1
fi

echo "✅ React.FC の使用は検出されませんでした"
exit 0
