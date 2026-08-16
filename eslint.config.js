// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import * as eslintPluginImport from 'eslint-plugin-import'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginTailwindCSS from 'eslint-plugin-tailwindcss'
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'

import {
  DS_CORE_FORBIDDEN_PATTERNS,
  DS_CORE_MODULES,
  DS_CORE_VIOLATION_MESSAGE,
} from './scripts/ds-core.mjs'
import {
  DS_EQUIVALENT,
  RESTRICTED_MUI_IMPORTS,
} from './scripts/ds-equivalents.mjs'

export default tseslint.config({
  ignores: [
    '**/node_modules',
    '**/.turbo',
    '**/dist',
    '**/.next',
    '**/storybook-static',
    '*.d.ts',
    '*.config.js',
    '*.config.ts',
    '**/public',
    '**/test-reports',
    '.git',
    '.vscode',
    '.idea',
    '.DS_Store',
    'pnpm-lock.yaml',
    'pnpm-debug.log',
    'routeTree.gen.ts',
    '**/gql',
    '.schema',
    '**/.env*',
    "~/.continue",
    // テストファイルを完全に除外
    '**/__tests__/**/*',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/test/**/*',
    '**/src/test/**/*'
  ],
}, {
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    globals: {
      browser: true,
      es2021: true,
      node: true,
      process: true,
    },
  },
  plugins: {
    import: eslintPluginImport,
    'unused-imports': eslintPluginUnusedImports,
    react: eslintPluginReact,
    'react-hooks': eslintPluginReactHooks,
    tailwindcss: eslintPluginTailwindCSS,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'import/order': [
      'error',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'object',
          'type'
        ],
        'pathGroups': [
          {
            'pattern': '@mui/icons-material/**',
            'group': 'external',
            'position': 'before'
          },
          {
            'pattern': '@mui/material',
            'group': 'external',
            'position': 'after'
          },
          {
            'pattern': '@tanstack/**',
            'group': 'external',
            'position': 'after'
          },
          {
            'pattern': 'react',
            'group': 'external',
            'position': 'after'
          },
          {
            'pattern': '@maplibre/**',
            'group': 'external',
            'position': 'after'
          },
          {
            'pattern': '@googlemaps/**',
            'group': 'external',
            'position': 'after'
          },
          {
            'pattern': 'geojson',
            'group': 'external',
            'position': 'after'
          },
          {
            'pattern': '@repo/**',
            'group': 'external',
            'position': 'after'
          },
          {
            'pattern': '@/**',
            'group': 'internal',
            'position': 'after'
          }
        ],
        'distinctGroup': false,
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }
    ],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_'
      }
    ],
    'no-debugger': 'error',
    'no-empty': 'error',
    'no-constant-condition': 'error',
    'no-duplicate-case': 'error',
    'no-fallthrough': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'no-prototype-builtins': 'error',
  },
}, {
  files: ['**/*.ts', '**/*.tsx'],
  extends: [
    tseslint.configs.strict,
    eslintPluginReact.configs.flat.recommended,
    eslintPluginReact.configs.flat['jsx-runtime'],
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', {
      vars: 'all',
      varsIgnorePattern: '^_',
      args: 'after-used',
      argsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-extra-non-null-assertion': 'warn',
    'react/display-name': 'off',
    '@typescript-eslint/no-non-null-assertion': 'error', // Changed from array to string
    // React.FCの使用を完全に禁止（通常のno-restricted-syntaxを使用）
    'no-restricted-syntax': [
      'error',
      {
        selector: "TSTypeReference[typeName.name='FC']",
        message: '🚨 React.FC の使用は禁止されています。代わりに通常の関数定義とprops型定義を使用してください。See CODING_RULES.md for details.',
      },
      {
        selector: "TSTypeReference[typeName.left.name='React'][typeName.right.name='FC']",
        message: '🚨 React.FC の使用は禁止されています。代わりに通常の関数定義とprops型定義を使用してください。See CODING_RULES.md for details.',
      },
      {
        selector: "TSTypeReference[typeName.name='FunctionComponent']",
        message: '🚨 FunctionComponent の使用は禁止されています。代わりに通常の関数定義とprops型定義を使用してください。See CODING_RULES.md for details.',
      },
      {
        selector: "TSTypeReference[typeName.left.name='React'][typeName.right.name='FunctionComponent']",
        message: '🚨 React.FunctionComponent の使用は禁止されています。代わりに通常の関数定義とprops型定義を使用してください。See CODING_RULES.md for details.',
      },
    ],
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        'enableDangerousAutofixThisMayCauseInfiniteLoops': true,
        'additionalHooks': '(useRecoilCallback|useRecoilTransaction_UNSTABLE)'
      }
    ],
    ...eslintPluginReactHooks.configs.recommended.rules,
  },
}, {
  // プロダクト側から MUI を直に取らせない（DS に同等品があるものだけ）
  //
  // 対象はアプリと LP だけ。DS 本体 (src/components) は MUI を包む側なので
  // 当然 MUI を import する。Storybook の story も比較のために直に使う。
  //
  // 一覧は scripts/ds-equivalents.mjs が単一ソース。計測 (pnpm ds:adoption)
  // と同じ表を見るので、片方だけ更新されて食い違うことがない。
  name: 'kaze/ds-first',
  files: ['apps/*/src/**/*.{ts,tsx}', 'src/pages/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        // 名前ごとに 1 エントリにする。まとめて 1 つの message にすると
        // 対応表 20 件分が毎回出て、肝心の置き換え先が読み取れない
        paths: RESTRICTED_MUI_IMPORTS.map((name) => ({
          name: '@mui/material',
          importNames: [name],
          message: `DS の ${DS_EQUIVALENT[name]} を使ってください。レイアウト原始要素 (Box / Grid / Stack / Typography 等) は対象外です。`,
        })),
      },
    ],
  },
}, {
  // DS コア層に UI ライブラリを持ち込ませない
  //
  // 「MUI があってもなくても使えるデザインシステム」にするための境界線。
  // 部品 10,321 行を一度に剥がすのは無理なので、外から使いたい層
  // （トークン・色の計算・タイポグラフィ）だけ先に線を引いて固定する。
  //
  // 一覧は scripts/ds-core.mjs が単一ソース。同じ表を
  // coreDependencies.test.ts も見ており、そちらは依存グラフを辿るので
  // 「コア以外のファイル経由で MUI が入る」経路も塞ぐ。
  name: 'kaze/ds-core-no-ui-library',
  files: DS_CORE_MODULES,
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: DS_CORE_FORBIDDEN_PATTERNS.map((group) => ({
          group: [group],
          message: DS_CORE_VIOLATION_MESSAGE,
        })),
      },
    ],
  },
}, {
  name: 'eslint-config-prettier',
  ...eslintConfigPrettier,
});
