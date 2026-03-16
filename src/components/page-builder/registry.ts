/**
 * コンポーネントレジストリ
 * Page Builder で使用可能なコンポーネントを登録
 */

import {
  Box,
  Typography,
  Paper,
  TextField as MuiTextField,
} from '@mui/material'
import { Grid } from '@mui/material'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

import type { BuilderComponentMeta } from './types'

export const COMPONENT_REGISTRY: BuilderComponentMeta[] = [
  // --- Layout ---
  {
    id: 'box',
    name: 'Box',
    category: 'layout',
    icon: 'Square',
    description: '汎用コンテナ',
    component: Box as React.ComponentType<Record<string, unknown>>,
    defaultProps: { sx: { p: 2 } },
    propSchema: [
      { name: 'padding', type: 'number', label: 'パディング', defaultValue: 2 },
    ],
    acceptsChildren: true,
    importPath: '@mui/material',
    importName: 'Box',
  },
  {
    id: 'grid',
    name: 'Grid',
    category: 'layout',
    icon: 'LayoutGrid',
    description: 'グリッドレイアウト',
    component: Grid as React.ComponentType<Record<string, unknown>>,
    defaultProps: { container: true, spacing: 2 },
    propSchema: [
      { name: 'spacing', type: 'number', label: '間隔', defaultValue: 2 },
    ],
    acceptsChildren: true,
    importPath: '@mui/material',
    importName: 'Grid',
  },
  {
    id: 'card',
    name: 'Card',
    category: 'layout',
    icon: 'CreditCard',
    description: 'カード',
    component: Card as React.ComponentType<Record<string, unknown>>,
    defaultProps: {},
    propSchema: [],
    acceptsChildren: true,
    importPath: '@/components/ui/Card',
    importName: 'Card',
  },
  {
    id: 'paper',
    name: 'Paper',
    category: 'layout',
    icon: 'FileText',
    description: 'ペーパー',
    component: Paper as React.ComponentType<Record<string, unknown>>,
    defaultProps: { sx: { p: 2 } },
    propSchema: [
      {
        name: 'elevation',
        type: 'number',
        label: 'エレベーション',
        defaultValue: 1,
      },
    ],
    acceptsChildren: true,
    importPath: '@mui/material',
    importName: 'Paper',
  },

  // --- Text ---
  {
    id: 'typography',
    name: 'Typography',
    category: 'text',
    icon: 'Type',
    description: 'テキスト',
    component: Typography as React.ComponentType<Record<string, unknown>>,
    defaultProps: { children: 'テキスト' },
    propSchema: [
      {
        name: 'children',
        type: 'string',
        label: 'テキスト',
        defaultValue: 'テキスト',
      },
      {
        name: 'variant',
        type: 'select',
        label: 'バリアント',
        defaultValue: 'body1',
        options: [
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'body1',
          'body2',
          'caption',
        ],
      },
      {
        name: 'color',
        type: 'select',
        label: 'カラー',
        defaultValue: 'text.primary',
        options: [
          'text.primary',
          'text.secondary',
          'primary.main',
          'error.main',
        ],
      },
    ],
    acceptsChildren: false,
    importPath: '@mui/material',
    importName: 'Typography',
  },

  // --- Action ---
  {
    id: 'button',
    name: 'Button',
    category: 'action',
    icon: 'MousePointer',
    description: 'ボタン',
    component: Button as React.ComponentType<Record<string, unknown>>,
    defaultProps: { children: 'ボタン', variant: 'default' },
    propSchema: [
      {
        name: 'children',
        type: 'string',
        label: 'ラベル',
        defaultValue: 'ボタン',
      },
      {
        name: 'variant',
        type: 'select',
        label: 'バリアント',
        defaultValue: 'default',
        options: [
          'default',
          'destructive',
          'outline',
          'secondary',
          'ghost',
          'link',
        ],
      },
      {
        name: 'size',
        type: 'select',
        label: 'サイズ',
        defaultValue: 'default',
        options: ['default', 'sm', 'lg'],
      },
      { name: 'disabled', type: 'boolean', label: '無効', defaultValue: false },
    ],
    acceptsChildren: false,
    importPath: '@/components/ui/Button',
    importName: 'Button',
  },

  // --- Input ---
  {
    id: 'textfield',
    name: 'TextField',
    category: 'input',
    icon: 'TextCursorInput',
    description: 'テキスト入力',
    component: MuiTextField as React.ComponentType<Record<string, unknown>>,
    defaultProps: {
      label: 'ラベル',
      variant: 'outlined',
      size: 'small',
      fullWidth: true,
    },
    propSchema: [
      {
        name: 'label',
        type: 'string',
        label: 'ラベル',
        defaultValue: 'ラベル',
      },
      {
        name: 'placeholder',
        type: 'string',
        label: 'プレースホルダー',
        defaultValue: '',
      },
      {
        name: 'variant',
        type: 'select',
        label: 'バリアント',
        defaultValue: 'outlined',
        options: ['outlined', 'filled', 'standard'],
      },
      {
        name: 'size',
        type: 'select',
        label: 'サイズ',
        defaultValue: 'small',
        options: ['small', 'medium'],
      },
      { name: 'required', type: 'boolean', label: '必須', defaultValue: false },
      {
        name: 'fullWidth',
        type: 'boolean',
        label: '幅100%',
        defaultValue: true,
      },
    ],
    acceptsChildren: false,
    importPath: '@mui/material',
    importName: 'TextField',
  },
]

// カテゴリ別にグループ化
export const CATEGORIES: Record<string, string> = {
  layout: 'レイアウト',
  text: 'テキスト',
  action: 'アクション',
  input: '入力',
  display: '表示',
  feedback: 'フィードバック',
}

// ID でコンポーネントメタを取得
export const getComponentMeta = (
  id: string
): BuilderComponentMeta | undefined =>
  COMPONENT_REGISTRY.find((c) => c.id === id)
