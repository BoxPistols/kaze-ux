// src/themes/theme.ts（統合後）
import {
  type Components,
  type CssVarsTheme,
  type Theme,
  createTheme,
} from '@mui/material/styles'

import {
  breakpointValues,
  containerMaxWidth,
  muiBreakpoints,
} from './breakpoints'
import { colorData } from './colorToken'
import {
  fontSizesVariant,
  typographyComponentsOverrides,
  typographyOptions,
} from './typography'

import type { AppTheme } from '../types/theme'

// Button共通
const CommomButtonStyles = {
  height: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1.5,
  fontWeight: 500,
  whiteSpace: 'nowrap',
}

// 共通設定 - kaze-ux準拠
const commonThemeOptions = {
  typography: typographyOptions,
  shape: { borderRadius: 8 }, // モダンな角丸
  transitions: {
    easing: {
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    duration: { leavingScreen: 150, enteringScreen: 200 },
  },
  spacing: 4,
  zIndex: { appBar: 1100, drawer: 1000 },
  breakpoints: muiBreakpoints,
  layout: {
    containerMaxWidth,
  },
  // カスタムシャドウ
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ] as unknown as Theme['shadows'],
}

// コンポーネントスタイルの定義
const componentStyles = {
  ...typographyComponentsOverrides,
  MuiCssBaseline: {
    styleOverrides: {
      // 1rem = 14px に設定
      html: {
        fontSize: '14px',
      },
      body: ({ theme }: { theme: Theme }) => ({
        fontSize: '14px',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }),
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        height: 44,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }),
    },
  },
  MuiToolbar: {
    styleOverrides: {
      root: {
        minHeight: 44,
        '@media(min-width:0px)': {
          minHeight: 44,
        },
      },
    },
  },
  // Button UI
  MuiButton: {
    defaultProps: {
      variant: 'contained',
      // disableElevation: true, // デフォルトの影を削除
      // disableRipple: true, // リップル効果を無効化
      // disableFocusRipple: true, // フォーカス時のリップル効果を無効化
      color: 'primary',
      size: 'medium',
    },
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 6,
        minWidth: 80,
      },
      sizeSmall: {
        padding: '0.25em 1.2em',
        fontSize: fontSizesVariant.sm, // 最小フォントサイズ12px原則に準拠
        ...CommomButtonStyles,
      },
      sizeMedium: {
        padding: '0.45em 1.5em',
        fontSize: fontSizesVariant.sm,
        ...CommomButtonStyles,
      },
      sizeLarge: {
        padding: '0.5em 1.75em',
        fontSize: fontSizesVariant.md,
        ...CommomButtonStyles,
      },
      '&.Mui-disabled': {
        color: colorData.text.disabled,
        backgroundColor: colorData.grey[300],
      },
      contained: ({ theme }: { theme: Theme }) => ({
        '&.MuiButton-contained.MuiButton-root': {
          color:
            theme.palette.mode === 'light'
              ? colorData.text.white
              : colorData.dark.text.white,
        },
        '&.MuiButton-contained.MuiButton-root.MuiButton-containedInherit': {
          color: theme.palette.text.primary,
        },
        '&.MuiButton-root.Mui-disabled': {
          color:
            theme.palette.mode === 'light'
              ? colorData.text.disabled
              : colorData.grey[500],
          backgroundColor:
            theme.palette.mode === 'light'
              ? colorData.grey[300]
              : colorData.grey[700],
        },
      }),
    },
  },
  // フォームラベル: 分離スタイル（アニメーションなし、常に上部固定）
  MuiInputLabel: {
    defaultProps: {
      shrink: true,
    },
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        position: 'static',
        transform: 'none',
        transition: 'none',
        pointerEvents: 'auto',
        fontSize: fontSizesVariant.md,
        fontWeight: 500,
        color: theme.palette.text.primary,
        marginBottom: 4,
        '&.Mui-focused': {
          color: theme.palette.text.primary,
        },
        '&.Mui-error': {
          color: theme.palette.error.main,
        },
      }),
      sizeSmall: {
        fontSize: fontSizesVariant.sm, // 最小フォントサイズ12px原則に準拠
      },
    },
  },
  // TextField: デフォルトサイズsmall + ラベル分離
  MuiTextField: {
    defaultProps: {
      size: 'small',
      InputLabelProps: {
        shrink: true,
      },
    },
  },
  // Select: デフォルトサイズsmall
  MuiSelect: {
    defaultProps: {
      size: 'small',
    },
  },
  // Autocomplete: デフォルトサイズsmall
  MuiAutocomplete: {
    defaultProps: {
      size: 'small',
    },
  },
  // OutlinedInput: ラベル分離時のnotch（切り欠き）を非表示
  MuiOutlinedInput: {
    styleOverrides: {
      notchedOutline: {
        '& legend': {
          display: 'none',
        },
      },
    },
  },
  // FormLabel: 共通のラベルスタイル
  MuiFormLabel: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        '&.Mui-focused': {
          color: theme.palette.text.primary,
        },
      }),
      asterisk: ({ theme }: { theme: Theme }) => ({
        color: theme.palette.error.main,
      }),
    },
  },
  // ツールチップのカスタマイズ
  MuiTooltip: {
    styleOverrides: {
      tooltip: ({ theme }: { theme: Theme }) => ({
        fontSize: fontSizesVariant.md,
        backgroundColor:
          theme.palette.mode === 'dark'
            ? theme.palette.grey[700]
            : theme.palette.grey[900],
        color:
          theme.palette.mode === 'dark'
            ? theme.palette.text.primary
            : theme.palette.common.white,
        borderRadius: 6,
        padding: '8px 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }),
      arrow: ({ theme }: { theme: Theme }) => ({
        color:
          theme.palette.mode === 'dark'
            ? theme.palette.grey[700]
            : theme.palette.grey[900],
      }),
    },
  },
  // ToggleButtonのダークモード対応
  MuiToggleButton: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        color: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        '&.Mui-selected': {
          color: theme.palette.primary.contrastText,
          backgroundColor: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        },
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }),
    },
  },
  // ToggleButtonGroupのダークモード対応
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        '& .MuiToggleButtonGroup-grouped': {
          borderColor: theme.palette.divider,
        },
      }),
    },
  },
  // ListItemIconのダークモード対応
  MuiListItemIcon: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        color: theme.palette.text.secondary,
        minWidth: 40,
      }),
    },
  },
  // ListItemButtonのダークモード対応
  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        '&.Mui-selected': {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '& .MuiListItemIcon-root': {
            color: theme.palette.primary.contrastText,
          },
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        },
      }),
    },
  },
  // Card - モダンでクリーンなスタイル
  MuiCard: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        backgroundColor: theme.palette.background.paper,
        borderRadius: 12,
        border: `1px solid ${
          theme.palette.mode === 'light'
            ? 'rgba(0, 0, 0, 0.08)'
            : 'rgba(255, 255, 255, 0.08)'
        }`,
        boxShadow:
          theme.palette.mode === 'light'
            ? '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)'
            : '0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.12)',
        transition:
          'box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
        overflow: 'hidden',
        '&:hover': {
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)'
              : '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.15)',
          borderColor:
            theme.palette.mode === 'light'
              ? 'rgba(0, 0, 0, 0.12)'
              : 'rgba(255, 255, 255, 0.12)',
        },
      }),
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        padding: '16px 20px',
        borderBottom: `1px solid ${theme.palette.divider}`,
        '& .MuiCardHeader-title': {
          fontSize: fontSizesVariant.md,
          fontWeight: 600,
          color: theme.palette.text.primary,
        },
        '& .MuiCardHeader-subheader': {
          fontSize: fontSizesVariant.sm,
          color: theme.palette.text.secondary,
          marginTop: 2,
        },
      }),
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: '20px',
        '&:last-child': {
          paddingBottom: '20px',
        },
      },
    },
  },
  MuiCardActions: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        padding: '12px 20px',
        borderTop: `1px solid ${theme.palette.divider}`,
        gap: 8,
      }),
    },
  },
  // Chip - kaze-ux準拠
  MuiChip: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderRadius: 3,
        fontWeight: 600,
        fontSize: fontSizesVariant.sm, // 最小フォントサイズ12px原則に準拠
        height: 24,
        '& .MuiChip-label': {
          paddingLeft: 8,
          paddingRight: 8,
        },
        '&.MuiChip-outlined': {
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
        },
      }),
      sizeSmall: {
        height: 20,
        fontSize: fontSizesVariant.sm, // 最小フォントサイズ12px原則に準拠
        '& .MuiChip-label': {
          paddingLeft: 6,
          paddingRight: 6,
        },
      },
    },
  },
  // Table - モダンでクリーンなスタイル
  MuiTableContainer: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderRadius: 12,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        // Container Queries対応: コンテナとして設定
        containerType: 'inline-size',
        // 横スクロールを常に許容
        overflowX: 'auto',
        overflowY: 'hidden',
        // スクロールバーのスタイリング
        '&::-webkit-scrollbar': {
          height: 6,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor:
            theme.palette.mode === 'light'
              ? 'rgba(0, 0, 0, 0.04)'
              : 'rgba(255, 255, 255, 0.04)',
          borderRadius: 3,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor:
            theme.palette.mode === 'light'
              ? 'rgba(0, 0, 0, 0.2)'
              : 'rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'light'
                ? 'rgba(0, 0, 0, 0.3)'
                : 'rgba(255, 255, 255, 0.3)',
          },
        },
        // Container Query: tablet(768px)以下でテーブルに最小幅を設定し横スクロールを発生させる
        '& .MuiTable-root': {
          [`@container (max-width: ${breakpointValues.tablet}px)`]: {
            minWidth: 800,
          },
        },
      }),
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        '& .MuiTableCell-head': {
          backgroundColor:
            theme.palette.mode === 'light'
              ? 'rgba(0, 0, 0, 0.02)'
              : 'rgba(255, 255, 255, 0.03)',
          fontWeight: 600,
          fontSize: fontSizesVariant.sm, // 最小フォントサイズ12px原則に準拠
          color: theme.palette.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          borderBottom: `1px solid ${theme.palette.divider}`,
          padding: '12px 16px',
          whiteSpace: 'nowrap',
        },
      }),
    },
  },
  MuiTableBody: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        '& .MuiTableRow-root': {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'light'
                ? 'rgba(0, 0, 0, 0.02)'
                : 'rgba(255, 255, 255, 0.02)',
          },
        },
      }),
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderBottom: `1px solid ${
          theme.palette.mode === 'light'
            ? 'rgba(0, 0, 0, 0.06)'
            : 'rgba(255, 255, 255, 0.06)'
        }`,
        padding: '14px 16px',
        fontSize: fontSizesVariant.sm,
        color: theme.palette.text.primary,
        verticalAlign: 'middle',
      }),
      sizeSmall: {
        padding: '10px 12px',
        fontSize: fontSizesVariant.sm, // 最小フォントサイズ12px原則に準拠
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        '&:last-child td': {
          borderBottom: 'none',
        },
        '&.Mui-selected': {
          backgroundColor:
            theme.palette.mode === 'light'
              ? `${theme.palette.primary.main}08`
              : `${theme.palette.primary.main}15`,
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'light'
                ? `${theme.palette.primary.main}12`
                : `${theme.palette.primary.main}20`,
          },
        },
      }),
    },
  },
  MuiTablePagination: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderTop: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.secondary,
        fontSize: fontSizesVariant.sm,
      }),
      selectLabel: {
        fontSize: fontSizesVariant.sm,
      },
      displayedRows: {
        fontSize: fontSizesVariant.sm,
      },
    },
  },
  // Tab - kaze-ux準拠
  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: 40,
      },
      indicator: ({ theme }: { theme: Theme }) => ({
        backgroundColor: theme.palette.primary.main,
        height: 2,
      }),
    },
  },
  MuiTab: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        textTransform: 'none',
        fontWeight: 500,
        fontSize: fontSizesVariant.sm,
        minHeight: 40,
        padding: '8px 16px',
        color: theme.palette.text.secondary,
        '&.Mui-selected': {
          color: theme.palette.primary.main,
          fontWeight: 600,
        },
      }),
    },
  },
  // Avatar - kaze-ux準拠
  MuiAvatar: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
        fontWeight: 600,
        fontSize: fontSizesVariant.sm,
      }),
    },
  },
  // Menu - kaze-ux準拠
  MuiMenu: {
    styleOverrides: {
      paper: ({ theme }: { theme: Theme }) => ({
        borderRadius: 6,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: `1px solid ${theme.palette.divider}`,
      }),
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        fontSize: fontSizesVariant.sm,
        padding: '8px 16px',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }),
    },
  },
  // IconButton
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderRadius: 8,
        transition: 'background-color 0.15s ease, color 0.15s ease',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }),
      sizeSmall: {
        padding: 6,
      },
      sizeMedium: {
        padding: 8,
      },
    },
  },
  // Dialog - モダンでクリーンなスタイル
  MuiDialog: {
    defaultProps: {
      PaperProps: {
        elevation: 0,
      },
    },
    styleOverrides: {
      paper: ({ theme }: { theme: Theme }) => ({
        borderRadius: 16,
        border: `1px solid ${
          theme.palette.mode === 'light'
            ? 'rgba(0, 0, 0, 0.08)'
            : 'rgba(255, 255, 255, 0.08)'
        }`,
        boxShadow:
          theme.palette.mode === 'light'
            ? '0 20px 40px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)'
            : '0 20px 40px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.3)',
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'none',
        overflow: 'hidden',
      }),
      paperWidthSm: {
        maxWidth: 440,
      },
      paperWidthMd: {
        maxWidth: 600,
      },
      paperWidthLg: {
        maxWidth: 900,
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        padding: '20px 24px 16px',
        fontSize: fontSizesVariant.lg,
        fontWeight: 600,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }),
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        padding: '24px',
        color: theme.palette.text.primary,
        '&.MuiDialogContent-dividers': {
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
      }),
    },
  },
  MuiDialogContentText: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        color: theme.palette.text.secondary,
        fontSize: fontSizesVariant.sm,
        lineHeight: 1.6,
      }),
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        padding: '16px 24px 20px',
        gap: 12,
        borderTop: `1px solid ${theme.palette.divider}`,
        '& > :not(:first-of-type)': {
          marginLeft: 0,
        },
      }),
    },
  },
  MuiBackdrop: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        // backdropFilter は削除（ブラー不要の要望対応）
      },
    },
  },
  // Paper - モダンなスタイル
  MuiPaper: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        backgroundImage: 'none',
        backgroundColor: theme.palette.background.paper,
      }),
      rounded: {
        borderRadius: 12,
      },
      outlined: ({ theme }: { theme: Theme }) => ({
        border: `1px solid ${theme.palette.divider}`,
      }),
    },
  },
  // Divider
  MuiDivider: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderColor: theme.palette.divider,
      }),
    },
  },
  // Alert - モダンなスタイル
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        padding: '12px 16px',
        alignItems: 'center',
        '& .MuiAlert-icon': {
          marginRight: 12,
          padding: 0,
          opacity: 1,
        },
        '& .MuiAlert-message': {
          padding: 0,
          fontSize: fontSizesVariant.sm,
        },
        '& .MuiAlert-action': {
          padding: 0,
          marginRight: -4,
        },
      },
      standardSuccess: ({ theme }: { theme: Theme }) => ({
        backgroundColor:
          theme.palette.mode === 'light'
            ? theme.palette.success.lighter
            : `${theme.palette.success.main}20`,
        color: theme.palette.success.dark,
        border: `1px solid ${theme.palette.success.light}`,
      }),
      standardError: ({ theme }: { theme: Theme }) => ({
        backgroundColor:
          theme.palette.mode === 'light'
            ? theme.palette.error.lighter
            : `${theme.palette.error.main}20`,
        color: theme.palette.error.dark,
        border: `1px solid ${theme.palette.error.light}`,
      }),
      standardWarning: ({ theme }: { theme: Theme }) => ({
        backgroundColor:
          theme.palette.mode === 'light'
            ? theme.palette.warning.lighter
            : `${theme.palette.warning.main}20`,
        color: theme.palette.warning.dark,
        border: `1px solid ${theme.palette.warning.light}`,
      }),
      standardInfo: ({ theme }: { theme: Theme }) => ({
        backgroundColor:
          theme.palette.mode === 'light'
            ? theme.palette.info.lighter
            : `${theme.palette.info.main}20`,
        color: theme.palette.info.dark,
        border: `1px solid ${theme.palette.info.light}`,
      }),
    },
  },
  // Skeleton - モダンなアニメーション
  MuiSkeleton: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        backgroundColor:
          theme.palette.mode === 'light'
            ? 'rgba(0, 0, 0, 0.06)'
            : 'rgba(255, 255, 255, 0.06)',
      }),
      rounded: {
        borderRadius: 8,
      },
    },
  },
  // Switchのダークモード対応
  MuiSwitch: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        '& .MuiSwitch-track': {
          backgroundColor:
            theme.palette.mode === 'dark'
              ? theme.palette.grey[600]
              : theme.palette.grey[400],
        },
      }),
    },
  },
}

// MUI 6のcolorSchemesを使用した統合テーマ
// @ts-expect-error MUI v7の型互換性問題
const theme = createTheme({
  ...commonThemeOptions,
  defaultColorScheme: 'light',
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        ...colorData,
        background: {
          ...colorData.background,
          default: colorData.background.default,
          paper: colorData.background.paper,
        },
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        ...colorData.dark,
        background: {
          ...colorData.dark.background,
          default: colorData.dark.background.default,
          paper: colorData.dark.background.paper,
        },
      },
    },
  },
  components: componentStyles as Components<
    Omit<Theme, 'components' | 'palette'> & CssVarsTheme
  >,
})

// 後方互換性のために従来のテーマも提供
// @ts-expect-error MUI v7の型互換性問題
const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'light',
    ...colorData,
    background: {
      ...colorData.background,
      default: colorData.background.default,
      paper: colorData.background.paper,
    },
  },
  components: componentStyles as Components<Theme>,
})

// @ts-expect-error MUI v7の型互換性問題
const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'dark',
    ...colorData.dark,
    background: {
      ...colorData.dark.background,
      default: colorData.dark.background.default,
      paper: colorData.dark.background.paper,
    },
  },
  components: componentStyles as Components<Theme>,
})

// Theme 型も明示的にエクスポート
export type { AppTheme }

export { theme, lightTheme, darkTheme }
