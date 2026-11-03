/**
 * MUI の部品と DS の同等品の対応表。**単一ソース。**
 *
 * ここを見る側が 2 つある。
 * - `scripts/ds-adoption.mjs`: 準拠率の計測
 * - `eslint.config.js`: アプリからの MUI 直 import の禁止
 *
 * 別々に持つと、DS に部品を足したときに片方だけ更新されて、
 * 「計測では未準拠なのに lint は通る」状態になる。
 *
 * - `mui`: MUI から直接 import したら未準拠になる名前
 * - `ds` : 同等品として数える DS 側の名前
 */
export const EQUIVALENTS = [
  { mui: ['TextField'], ds: ['CustomTextField'] },
  { mui: ['Select'], ds: ['CustomSelect'] },
  { mui: ['Autocomplete'], ds: ['MultiSelectAutocomplete'] },
  { mui: ['Chip'], ds: ['CustomChip', 'ConnectionStatusChip'] },
  { mui: ['Button'], ds: ['Button', 'LoadingButton', 'SaveButton'] },
  { mui: ['IconButton'], ds: ['IconButton'] },
  {
    mui: ['Card', 'CardContent', 'CardHeader', 'CardActions'],
    ds: [
      'Card',
      'CardContent',
      'CardHeader',
      'CardTitle',
      'CardDescription',
      'CardFooter',
      'ServiceCard',
    ],
  },
  {
    mui: ['Table', 'TableContainer'],
    ds: ['CustomTable', 'ResourceTable', 'TableToolbar'],
  },
  { mui: ['Tooltip'], ds: ['CustomTooltip'] },
  { mui: ['Avatar'], ds: ['UserAvatar'] },
  { mui: ['Accordion'], ds: ['CustomAccordion'] },
  { mui: ['Dialog'], ds: ['ConfirmDialog', 'FormDialog'] },
  { mui: ['Pagination'], ds: ['Pagination'] },
  { mui: ['Fab'], ds: ['Fab'] },
  { mui: ['Menu'], ds: ['ActionMenu'] },
  { mui: ['ToggleButton'], ds: ['ToggleButton'] },
  { mui: ['ToggleButtonGroup'], ds: ['ToggleButtonGroup'] },
  { mui: ['ButtonGroup'], ds: ['ButtonGroup'] },
  { mui: ['Snackbar', 'Alert'], ds: ['CustomToaster'] },
]

/** MUI 名 → 置き換え先の表示 */
export const DS_EQUIVALENT = Object.fromEntries(
  EQUIVALENTS.flatMap((e) => e.mui.map((m) => [m, e.ds.join(' / ')]))
)

/** 準拠率の分子に数える DS 部品名 */
export const DS_COUNTED = new Set(EQUIVALENTS.flatMap((e) => e.ds))

/** MUI から直接 import したら止める名前 */
export const RESTRICTED_MUI_IMPORTS = EQUIVALENTS.flatMap((e) => e.mui)
