#!/bin/bash

# コンポーネントに対応するストーリーファイルの存在チェック
# src/components/ 配下の新規 .tsx に .stories.tsx が必要

echo "Storybook ストーリーファイル存在チェック..."

STAGED_FILES=$(git diff --cached --name-only --diff-filter=A | grep -E '^src/components/.*\.tsx$' | grep -v '\.stories\.tsx$' | grep -v '\.test\.tsx$' | grep -v 'index\.tsx$')

if [ -z "$STAGED_FILES" ]; then
  echo "  チェック対象のコンポーネントはありません"
  exit 0
fi

MISSING=0

for FILE in $STAGED_FILES; do
  # 対応するストーリーファイルのパスを生成
  STORY_FILE="${FILE%.tsx}.stories.tsx"

  # ストーリーが同階層にない場合、stories/ディレクトリも探す
  COMPONENT_NAME=$(basename "$FILE" .tsx)
  STORY_IN_STORIES=$(find src/stories -name "${COMPONENT_NAME}.stories.tsx" 2>/dev/null | head -1)

  if [ ! -f "$STORY_FILE" ] && [ -z "$STORY_IN_STORIES" ]; then
    echo "  [不足] $FILE にストーリーがありません"
    echo "         -> ${STORY_FILE} を作成してください"
    MISSING=1
  fi
done

if [ $MISSING -eq 1 ]; then
  echo ""
  echo "[エラー] 新規コンポーネントにはストーリーファイルが必要です"
  echo ""
  echo "[対処法]"
  echo "  コンポーネントと同じディレクトリに .stories.tsx を作成してください。"
  echo "  例: src/components/ui/MyButton/MyButton.stories.tsx"
  echo ""
  echo "  最低限の内容:"
  echo "    import type { Meta, StoryObj } from '@storybook/react-vite'"
  echo "    import { MyButton } from './MyButton'"
  echo "    const meta: Meta<typeof MyButton> = { component: MyButton }"
  echo "    export default meta"
  echo "    export const Default: StoryObj<typeof MyButton> = {}"
  echo ""
  exit 1
fi

echo "  ストーリーファイルチェック OK"
exit 0
