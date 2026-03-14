/**
 * 各Storybookページの解説データ
 * ChatSupportが「今見ている画面」の文脈で回答するために使用
 *
 * 方針:
 * - 実際のソースコード（theme.ts, colorToken.ts 等）に基づくデータを含める
 * - MUI公式ドキュメントURLを含める
 * - 汎用的な説明ではなく、プロジェクト固有の情報を優先する
 */

export interface StoryGuideEntry {
  /** ページの要約（1-2文） */
  summary: string
  /** 実装の具体的な情報（コード参照先、実際の値など） */
  codeContext: string[]
  /** MUI公式ドキュメント等の関連URL */
  references?: string[]
  /** 関連するStorybookページ */
  related?: string[]
}

/**
 * story title をキーにしたガイドマップ
 * title は Storybook meta の title（例: "Guide/Introduction"）
 */
export const STORY_GUIDE_MAP: Record<string, StoryGuideEntry> = {
  // --- Guide ---
  'Guide/Introduction': {
    summary:
      'デザインシステムの入口。Storybookの基本操作とプロジェクト概要を説明する。',
    codeContext: [
      'テーマ定義: src/themes/theme.ts（lightTheme / darkTheme）',
      'Storybook設定: .storybook/preview.tsx でテーマ切替・デコレータ定義',
      'ツールバーの Theme ボタンで Light/Dark 切替可能',
    ],
    related: ['Guide/How to Use', 'Guide/For Designers'],
  },
  'Guide/How to Use': {
    summary:
      'Storybookの操作方法。サイドバー、Canvas、Controls、Docsの使い方。',
    codeContext: [
      'ストーリーファイル: src/stories/**/*.stories.tsx',
      'args / argTypes でControlsパネルの項目が決まる',
      'parameters.layout で Canvas のレイアウトを制御',
    ],
    references: ['https://storybook.js.org/docs/writing-stories'],
    related: ['Guide/Introduction'],
  },
  'Guide/MUI + Tailwind CSS': {
    summary:
      'MUI v7 と Tailwind CSS の統合。CSS変数による連携と使い分けルール。',
    codeContext: [
      'CSS変数定義: src/index.css の :root / .dark',
      'Tailwind設定: tailwind.config.js でCSS変数を参照',
      'MUIテーマ: src/themes/theme.ts でパレット定義',
      'cn()ユーティリティ: src/utils/className.ts（clsx + tailwind-merge）',
      'ルール: MUIコンポーネント→sx prop / 純HTML→Tailwind className / 混在禁止',
    ],
    references: [
      'https://mui.com/system/getting-started/the-sx-prop/',
      'https://tailwindcss.com/docs/configuration',
    ],
    related: ['Guide/HTML CSS Basics', 'Design Tokens/Spacing'],
  },
  'Guide/Material Design': {
    summary: 'Material Designの3原則と本プロジェクトでの適用。',
    codeContext: [
      'Elevation: MUI Paper elevation={0-24}。本テーマではCard=0、Dialog=24',
      'スペーシング: theme.spacing(n) = n*4px。p:2 = 8px',
      'Ripple: MUI ButtonBase に内蔵。disableRipple で無効化可',
    ],
    references: [
      'https://m3.material.io/',
      'https://mui.com/material-ui/react-paper/',
    ],
    related: ['Design Tokens/Shadows & Elevation', 'Design Tokens/Spacing'],
  },
  'Guide/For Designers': {
    summary: 'デザイナー向け。Figma連携とデザイントークン参照方法。',
    codeContext: [
      'html.to.design プラグインでStorybookからFigmaにコンポーネント取り込み可',
      'トークン値は src/themes/colorToken.ts に全色定義あり',
      'タイポグラフィは src/themes/typography.ts に全サイズ定義あり',
    ],
    related: ['Design Tokens/Color Palette', 'Design Tokens/Typography'],
  },
  'Guide/Component Development': {
    summary: 'コンポーネント開発ワークフロー。ファイル構成と命名規則。',
    codeContext: [
      'ファイル構成: Component.tsx + Component.stories.tsx をセットで作成',
      'React.FC禁止。const MyComponent = ({ title }: Props) => ... 形式を使う',
      'ディレクトリ: src/components/ui/, src/components/form/',
      'lint: pnpm lint / format: pnpm format / 型チェック: TypeScript strict mode',
    ],
    references: ['https://mui.com/material-ui/getting-started/'],
    related: ['Guide/React Basics'],
  },
  'Guide/Ergonomics': {
    summary:
      '人間工学に基づくUI設計。認知法則、タッチターゲット、アクセシビリティ。',
    codeContext: [
      'タッチターゲット最小44x44px（MUI Button minWidth: 80px, minHeight: 36px）',
      'WCAG コントラスト比: src/themes/colorToken.ts で Light/Dark 両方 AA 準拠',
      'フォーカスリング: MUI デフォルトの :focus-visible スタイルを使用',
    ],
    references: ['https://www.w3.org/WAI/WCAG21/quickref/'],
    related: ['Design Tokens/Accessibility'],
  },
  'Guide/HTML CSS Basics': {
    summary: 'HTML/CSSの基礎。ボックスモデル、Flexbox、Grid、レスポンシブ。',
    codeContext: [
      'MUI Box = div のラッパー。sx={{ display: "flex" }} で Flexbox',
      'MUI Grid v7: <Grid container spacing={2}><Grid size={6}> 形式',
      'ブレークポイント: src/themes/breakpoints.ts で定義',
    ],
    references: [
      'https://mui.com/material-ui/react-box/',
      'https://mui.com/material-ui/react-grid/',
    ],
    related: ['Guide/MUI + Tailwind CSS', 'Layout/Grid System'],
  },
  'Guide/CSS Reference': {
    summary: 'CSS主要プロパティのリファレンス一覧表。',
    codeContext: [
      'MUI sx prop でCSS値を指定: sx={{ p: 2, display: "flex", color: "primary.main" }}',
      'Tailwind: className="flex gap-2 p-4 text-primary"',
    ],
    references: ['https://mui.com/system/properties/'],
    related: ['Guide/HTML CSS Basics'],
  },
  'Guide/React Basics': {
    summary: 'Reactの基礎。コンポーネント、Props、State、JSX。',
    codeContext: [
      '本プロジェクトではReact 19 + TypeScript strict mode',
      'React.FC禁止: interface Props + 通常の関数定義を使う',
      'State管理: useState / useEffect / useCallback',
    ],
    references: ['https://react.dev/learn'],
    related: ['Guide/Component Development'],
  },
  'Guide/AI and Design System': {
    summary: 'AI時代のデザインシステム活用法。',
    codeContext: [
      'AIにはトークン名（primary.main等）を正確に指示する',
      'AI生成コードはStorybookで動作確認してからマージ',
      'このコンシェルジュ自体がAI活用の実例',
    ],
  },

  // --- Design Philosophy ---
  'Design Philosophy/Overview': {
    summary: 'デザインシステムの設計思想。信頼感、革新性、共創のブランド価値。',
    codeContext: [
      'ブランドカラー primary=#2642be がブランドの信頼感を表現',
      'テーマ構造: src/themes/ 配下に分離（theme.ts, colorToken.ts, typography.ts, breakpoints.ts）',
    ],
    related: ['Design Philosophy/Component Design Guide'],
  },
  'Design Philosophy/Technical Stack': {
    summary: '技術スタックの選定理由。',
    codeContext: [
      'MUI v7: 新Grid API（size prop）、TypeScript完全対応',
      'Tailwind CSS v3: JIT、CSS変数連携、cn()ユーティリティ',
      'Storybook 9: Vite統合、autodocs、interaction testing',
      'package.json の dependencies で正確なバージョンを確認可能',
    ],
    references: [
      'https://mui.com/material-ui/',
      'https://tailwindcss.com/',
      'https://storybook.js.org/',
    ],
  },
  'Design Philosophy/Component Design Guide': {
    summary: 'コンポーネント設計の6原則と応用理論。',
    codeContext: [
      '6原則: 間接化、カプセル化、制約、意味の符号化、合成、慣習',
      'UIステートスタック: Empty/Loading/Error/Partial/Ideal の5状態設計',
      'サイジング: Fill(width:100%)/Hug(width:fit-content)/Fixed(width:300px)',
      '変数型: Boolean(isOpen)→Enum(variant)→自由入力 の優先順位',
    ],
  },

  // --- Design Tokens ---
  'Design Tokens/Token Overview': {
    summary: 'デザイントークンの全体像。MUIテーマとCSS変数の対応一覧。',
    codeContext: [
      'トークン定義元: src/themes/colorToken.ts（createThemeColors関数）',
      'テーマ適用: src/themes/theme.ts で createTheme() に渡す',
      'CSS変数出力: src/index.css の :root / .dark セクション',
      'Tailwind連携: tailwind.config.js の colors で CSS変数を参照',
    ],
    references: ['https://mui.com/material-ui/customization/theming/'],
  },
  'Design Tokens/Color Palette': {
    summary: 'カラーパレット。colorToken.ts で定義された実際の色値を表示。',
    codeContext: [
      '定義ファイル: src/themes/colorToken.ts',
      'Light primary: #2642be(main) #1a2c80(dark) #4d68d4(light)',
      'Dark primary: #5d7ce8(main) #4a66c9(dark) #7b94ec(light)',
      'グレースケール: grey.50=#fafafa 〜 grey.900=#292929（全11段階）',
      'grey.850=#323232 はカスタム追加（MUI標準にはない）',
      'セマンティック: success=#46ab4a, info=#1dafc2, warning=#eb8117, error=#da3737',
      'ダークモード: createThemeColors(isLight) で Light/Dark を分岐生成',
      'ColorSet型: main, dark, light, lighter, contrastText の5値セット',
    ],
    references: [
      'https://mui.com/material-ui/customization/palette/',
      'https://mui.com/material-ui/customization/color/',
    ],
    related: ['Guide/MUI + Tailwind CSS', 'Design Tokens/Dark Mode'],
  },
  'Design Tokens/Typography': {
    summary: 'タイポグラフィ体系。src/themes/typography.ts で定義。',
    codeContext: [
      '定義ファイル: src/themes/typography.ts',
      'フォント: Inter, "Noto Sans JP", sans-serif',
      'サイズ体系: displayLarge=32px, xxl=22px, xl=20px, lg=18px, ml=16px, md=14px, sm=12px, xs=10px',
      'variant対応: h1=xxl(22px), h4=ml(16px), h5=md(14px), body1=md(14px), body2=sm(12px)',
      'ウェイト: bold=700, medium=500, normal=400',
      '行高: medium=1.5, small=1.25',
    ],
    references: [
      'https://mui.com/material-ui/customization/typography/',
      'https://mui.com/material-ui/react-typography/',
    ],
  },
  'Design Tokens/Spacing': {
    summary: 'スペーシング基準値。MUIの4px単位。',
    codeContext: [
      'MUI: theme.spacing(1)=4px → sx={{ p: 2 }} = 8px',
      'Tailwind: p-1=4px, p-2=8px（MUIと同じ基準）',
      'デフォルトspacingFactor: 4（MUI標準）',
      '余白責任: margin=親が制御 / padding=自コンポーネントが制御',
    ],
    references: ['https://mui.com/material-ui/customization/spacing/'],
  },
  'Design Tokens/Shadows & Elevation': {
    summary: 'MUI Elevation。影の深度で要素階層を表現。',
    codeContext: [
      'MUI: elevation={0-24} で Paper/Card の影を制御',
      'プロジェクト標準: Card=elevation:0(outlined), Dialog=elevation:24',
      'カスタム影: src/themes/theme.ts の shadows 配列',
      'Darkモード: 影ではなくsurface色の明るさで階層を表現',
    ],
    references: [
      'https://mui.com/material-ui/react-paper/',
      'https://mui.com/material-ui/react-card/',
    ],
  },
  'Design Tokens/Breakpoints': {
    summary: 'レスポンシブブレークポイント。src/themes/breakpoints.ts で定義。',
    codeContext: [
      '定義ファイル: src/themes/breakpoints.ts',
      'カスタムブレークポイント: mobile=0, tablet=640, laptop=1024, desktop=1440',
      'MUI標準(xs,sm,md,lg,xl)とは異なる独自定義',
      'Grid: size={{ xs: 12, sm: 6, md: 3 }} でレスポンシブ指定',
    ],
    references: [
      'https://mui.com/material-ui/customization/breakpoints/',
      'https://mui.com/material-ui/react-grid/',
    ],
    related: ['Layout/Grid System'],
  },
  'Design Tokens/Motion': {
    summary: 'アニメーション・トランジション定義。',
    codeContext: [
      'MUI: theme.transitions.duration, theme.transitions.easing',
      'マイクロインタラクション: 150-300ms（ホバー、トグル）',
      'ページ遷移: 300-500ms',
      'prefers-reduced-motion 対応必須',
    ],
    references: ['https://mui.com/material-ui/transitions/'],
  },
  'Design Tokens/Dark Mode': {
    summary: 'ダークモード。CSS変数とMUI ThemeProviderの二重管理。',
    codeContext: [
      'テーマ切替: .storybook/preview.tsx の Decorator で globals.theme を監視',
      'CSS: html[data-theme="dark"] + .dark クラスで Tailwind dark mode を連動',
      'MUI: darkTheme = createTheme({ palette: { mode: "dark", ...colorData } })',
      'カラー定義: colorToken.ts の createThemeColors(false) がダークモード値を生成',
      'コントラスト比: ダークモードでも WCAG AA (4.5:1) 準拠',
    ],
    references: ['https://mui.com/material-ui/customization/dark-mode/'],
    related: ['Design Tokens/Color Palette'],
  },
  'Design Tokens/Accessibility': {
    summary: 'アクセシビリティ対応。WCAG準拠、ARIA、キーボード操作。',
    codeContext: [
      'コントラスト比: colorToken.ts の各色は Light/Dark 両方で 4.5:1 以上',
      'ARIA: MUIコンポーネントが標準でaria属性を出力',
      'フォーカス: MUIのfocusVisibleスタイルを使用',
      'フォーム: MUI TextField は label + htmlFor を自動紐付け',
    ],
    references: [
      'https://mui.com/material-ui/getting-started/accessibility/',
      'https://www.w3.org/WAI/WCAG21/quickref/',
    ],
    related: ['Guide/Ergonomics'],
  },

  // --- Layout ---
  'Layout/Grid System': {
    summary: 'MUI v7 Gridシステム。12カラム、レスポンシブ、ネスト。',
    codeContext: [
      'MUI v7新API: <Grid container spacing={2}><Grid size={{ xs: 12, md: 6 }}>',
      '旧API(item prop)は廃止。size prop で直接カラム数を指定',
      'spacing: spacing={2} = 8px gap（theme.spacing(2)）',
      'ネスト: Grid container 内に更に Grid container を配置可能',
    ],
    references: ['https://mui.com/material-ui/react-grid/'],
    related: ['Design Tokens/Breakpoints', 'Design Tokens/Spacing'],
  },
}

/**
 * story title から最も適合するガイドエントリを取得
 * 完全一致→前方一致 の順で検索
 */
export const findStoryGuide = (storyTitle: string): StoryGuideEntry | null => {
  // 完全一致
  if (STORY_GUIDE_MAP[storyTitle]) {
    return STORY_GUIDE_MAP[storyTitle]
  }

  // 前方一致（ストーリー名のバリエーション対応）
  for (const [key, entry] of Object.entries(STORY_GUIDE_MAP)) {
    if (storyTitle.startsWith(key)) {
      return entry
    }
  }

  return null
}
