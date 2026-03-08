import { Close } from '@mui/icons-material'
import { Box, IconButton, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

/**
 * サイドバーヘッダーコンポーネントのProps型定義
 */
interface SidebarHeaderProps {
  /** サイドバーの開閉状態 */
  isOpen: boolean
  /** 閉じるコールバック */
  onClose: () => void
  /** サイドバーの開閉を切り替えるコールバック */
  onToggle?: () => void
  /** アプリケーション名 */
  appName: string
  /** デフォルトのURL */
  defaultUrl: string
  /** タイトルの文字色（オプション） */
  titleColor?: string
  /** タイトルの背景色（オプション） */
  titleBackgroundColor?: string
}

/**
 * ロゴコンポーネント
 * Kaze UXのテキストベースロゴを表示
 */
export const Logo = ({ size = 24 }: { size?: number }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        // テーマのprimary.main色を使用
        backgroundColor: 'primary.main',
        borderRadius: '4px',
        color: 'white',
        fontSize: `${size * 0.4}px`,
        fontWeight: 'bold',
        letterSpacing: '-0.5px',
      }}>
      KU
    </Box>
  )
}

export const SidebarHeader = ({
  isOpen,
  onClose,
  onToggle,
  appName,
  defaultUrl,
  titleColor,
  titleBackgroundColor,
}: SidebarHeaderProps) => {
  return (
    <Box
      sx={{
        p: isOpen ? 2 : 1,
        pr: isOpen ? 1 : 0,
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'space-between' : 'center',
        minHeight: 56,
        position: 'relative',
        backgroundColor: titleBackgroundColor,
      }}>
      {/* 展開時のロゴとタイトル表示 */}
      {isOpen ? (
        <>
          <Link
            to={defaultUrl}
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              gap: '8px',
              color: 'inherit',
              cursor: 'pointer',
            }}>
            <Logo size={24} />
            <Typography
              variant='body1'
              component='h1'
              sx={{
                color: titleColor,
                fontWeight: 'bold',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                '&:hover': {
                  opacity: 0.8,
                },
                transition: 'opacity 0.2s ease',
              }}>
              {appName}
            </Typography>
          </Link>

          {/* 閉じるボタン（展開時のみ表示） */}
          {onToggle && (
            <IconButton
              size='small'
              onClick={onToggle}
              aria-label='サイドバーを閉じる'
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}>
              <Close fontSize='small' />
            </IconButton>
          )}
        </>
      ) : (
        /* 折りたたみ時のロゴのみ表示 */
        <Link
          to={defaultUrl}
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
          }}>
          <Box
            sx={{
              '&:hover': {
                opacity: 0.8,
              },
              transition: 'opacity 0.2s ease',
            }}>
            <Logo size={24} />
          </Box>
        </Link>
      )}
    </Box>
  )
}
