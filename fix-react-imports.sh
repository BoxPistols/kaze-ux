#!/bin/bash

# Reactインポートを一括修正するスクリプト

echo "Reactインポートを修正中..."

# StorybookファイルにReactインポートを追加
find src/stories -name "*.stories.tsx" -type f | while read file; do
    # 既にReactインポートがあるかチェック
    if ! grep -q "import React" "$file"; then
        # 最初のimport文の前にReactインポートを追加
        sed -i '' '1i\
import React from "react"
' "$file"
        echo "✅ $file にReactインポートを追加"
    else
        echo "⏭️  $file は既にReactインポート済み"
    fi
done

# @/components/ui パスを相対パスに修正
find src/stories -name "*.stories.tsx" -type f | while read file; do
    # @/components/ui を相対パスに変更
    sed -i '' 's|@/components/ui|../../components/ui|g' "$file"
    sed -i '' 's|@/components/ui/|../../components/ui/|g' "$file"
    echo "✅ $file のパスを修正"
done

echo "修正完了！"
