// src/components/ui/split-button/splitButton.tsx
// SplitButtonコンポーネント
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  type SxProps,
  type Theme,
} from '@mui/material'
import { useRef, useState, type ReactNode } from 'react'

export interface SplitButtonOption {
  /** オプションの値 */
  value: string
  /** 表示ラベル */
  label: string
  /** アイコン */
  icon?: ReactNode
  /** 無効化 */
  disabled?: boolean
  /** 危険なアクション（赤色表示） */
  danger?: boolean
}

export interface SplitButtonProps {
  /** メインボタンのラベル */
  label: string
  /** メインボタンのアイコン */
  icon?: ReactNode
  /** メインボタンクリック時のコールバック */
  onClick: () => void
  /** ドロップダウンオプション */
  options: SplitButtonOption[]
  /** オプション選択時のコールバック */
  onOptionClick?: (option: SplitButtonOption) => void
  /** ボタンのバリアント */
  variant?: 'contained' | 'outlined' | 'text'
  /** ボタンの色 */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  /** ボタンのサイズ */
  size?: 'small' | 'medium' | 'large'
  /** 無効化 */
  disabled?: boolean
  /** ローディング状態 */
  loading?: boolean
  /** フルワイド */
  fullWidth?: boolean
  /** カスタムスタイル */
  sx?: SxProps<Theme>
}

/**
 * SplitButtonコンポーネント
 * メインアクションと追加オプションを持つドロップダウンボタン
 *
 * @example
 * ```tsx
 * import { SplitButton } from '@/components/ui/split-button'
 * import SaveIcon from '@mui/icons-material/Save'
 *
 * <SplitButton
 *   label="保存"
 *   icon={<SaveIcon />}
 *   onClick={handleSave}
 *   options={[
 *     { value: 'saveAs', label: '名前を付けて保存' },
 *     { value: 'saveDraft', label: '下書きとして保存' },
 *     { value: 'saveTemplate', label: 'テンプレートとして保存' },
 *   ]}
 *   onOptionClick={(option) => handleOptionClick(option.value)}
 * />
 * ```
 */
export const SplitButton = ({
  label,
  icon,
  onClick,
  options,
  onOptionClick,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  sx,
}: SplitButtonProps) => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return
    }
    setOpen(false)
  }

  const handleMenuItemClick = (option: SplitButtonOption) => {
    onOptionClick?.(option)
    setOpen(false)
  }

  return (
    <>
      <ButtonGroup
        ref={anchorRef}
        variant={variant}
        color={color}
        disabled={disabled || loading}
        fullWidth={fullWidth}
        sx={{
          '& .MuiButton-root': {
            textTransform: 'none',
            fontWeight: 500,
            // フォントサイズ: small=12px(0.86rem), medium=14px(1rem), large=16px(1.14rem)
            fontSize:
              size === 'small'
                ? '0.86rem'
                : size === 'large'
                  ? '1.14rem'
                  : '1rem',
            // 最小ヒットターゲット24px確保
            minHeight: size === 'small' ? 28 : size === 'large' ? 40 : 32,
            py: size === 'small' ? 0.375 : size === 'large' ? 0.75 : 0.5,
            px: size === 'small' ? 1 : size === 'large' ? 2 : 1.5,
          },
          ...sx,
        }}>
        <Button
          size={size}
          onClick={onClick}
          startIcon={icon}
          sx={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}>
          {label}
        </Button>
        <Button
          size={size}
          onClick={handleToggle}
          sx={{
            px: size === 'small' ? 0.5 : size === 'large' ? 1 : 0.75,
            minWidth: 'auto',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup='menu'>
          <ArrowDropDownIcon
            sx={{
              transition: 'transform 0.2s',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        placement='bottom-end'
        sx={{ zIndex: 1300 }}>
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper
              elevation={8}
              sx={{
                mt: 0.5,
                minWidth: anchorRef.current?.offsetWidth,
                borderRadius: 1.5,
              }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id='split-button-menu' autoFocusItem sx={{ py: 0.5 }}>
                  {options.map((option) => (
                    <MenuItem
                      key={option.value}
                      disabled={option.disabled}
                      onClick={() => handleMenuItemClick(option)}
                      sx={{
                        py: 1,
                        px: 2,
                        ...(option.danger && {
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'error.lighter',
                          },
                        }),
                      }}>
                      {option.icon && (
                        <ListItemIcon
                          sx={{
                            minWidth: 36,
                            ...(option.danger && { color: 'error.main' }),
                          }}>
                          {option.icon}
                        </ListItemIcon>
                      )}
                      <ListItemText>{option.label}</ListItemText>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}

export default SplitButton
