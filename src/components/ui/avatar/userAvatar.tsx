// src/components/ui/avatar/userAvatar.tsx
// sdpf-frontend-nextに準拠したユーザーアバターコンポーネント
import {
  Avatar,
  type AvatarProps as MuiAvatarProps,
  type SxProps,
  type Theme,
} from '@mui/material'
import type { ReactNode } from 'react'

export interface UserAvatarProps {
  /** ユーザー名 */
  name?: string
  /** カスタムスタイル */
  sx?: SxProps<Theme>
  /** アバターサイズ */
  size?: 'small' | 'medium' | 'large'
  /** 表示する文字数の上限 (1 or 2) */
  maxChars?: 1 | 2
  /** アイコンで代替表示 */
  icon?: ReactNode
  /** 画像URL */
  src?: string
  /** 画像の代替テキスト */
  alt?: string
  /** アバターの形状 */
  variant?: MuiAvatarProps['variant']
  /** 背景色 */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
}

const sizeMap = {
  small: 24,
  medium: 40,
  large: 56,
}

const fontSizeMap = {
  small: 12,
  medium: 16,
  large: 22,
}

/**
 * イニシャルを生成
 * @param name ユーザー名（undefinedの場合は空文字を返す）
 * @param maxChars 最大文字数
 */
const getInitials = (name: string | undefined, maxChars: 1 | 2): string => {
  if (!name) return ''

  const words = name.trim().split(/\s+/)
  if (maxChars === 1 || words.length === 1) {
    return name.charAt(0).toUpperCase()
  }

  // 2文字の場合: 姓名の頭文字
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

export const UserAvatar = ({
  name,
  sx = {},
  size = 'medium',
  maxChars = 1,
  icon,
  src,
  alt,
  variant = 'circular',
  color = 'primary',
}: UserAvatarProps) => {
  const dimension = sizeMap[size]
  const fontSize = fontSizeMap[size]

  // 表示コンテンツの決定: src > icon > initials
  const renderContent = () => {
    if (src) return undefined // srcがある場合はAvatarが自動で画像表示
    if (icon) return icon
    if (name) return getInitials(name, maxChars)
    return undefined
  }

  return (
    <Avatar
      src={src}
      alt={alt || name}
      variant={variant}
      sx={{
        bgcolor: src ? undefined : `${color}.main`,
        width: dimension,
        height: dimension,
        fontSize,
        ...sx,
      }}>
      {renderContent()}
    </Avatar>
  )
}

export default UserAvatar
