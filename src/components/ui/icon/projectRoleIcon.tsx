// src/components/ui/icon/projectRoleIcon.tsx
// sdpf-frontend-nextに準拠したプロジェクトロールアイコンコンポーネント
import { ManageAccountsOutlined, PeopleOutline } from '@mui/icons-material'
import { Box, IconButton, Popover, Typography } from '@mui/material'
import { useState } from 'react'

type Size = 'small' | 'medium' | 'large'

export interface ProjectRoleIconProps {
  /** 管理者かどうか */
  isAdmin: boolean
  /** アイコンサイズ */
  size?: Size
}

const getIconSize = (size: Size) => {
  switch (size) {
    case 'small':
      return '14px'
    case 'medium':
      return '18px'
    case 'large':
      return '22px'
    default:
      return '14px'
  }
}

export const getUserProjectRoleIcon = (isAdmin: boolean, size: Size) => {
  if (isAdmin) {
    return <ManageAccountsOutlined sx={{ fontSize: getIconSize(size) }} />
  }
  return <PeopleOutline sx={{ fontSize: getIconSize(size) }} />
}

const getUserProjectRoleDescription = (isAdmin: boolean) => {
  if (isAdmin) {
    return {
      title: 'プロジェクト管理者',
      description:
        '指定プロジェクト内のすべての操作が可能です。\nメンバー管理、スケジュール管理、\nデータ管理などの権限を持ちます。',
    }
  }
  return {
    title: 'プロジェクトメンバー',
    description:
      '指定プロジェクト内ですべての閲覧及び指定操作が可能です。\n基本「削除」以外の操作はできません。\nデータのアップロード、ダウンロード等は可能です。',
  }
}

/**
 * プロジェクトロールのアイコンを表示するコンポーネント
 */
export const ProjectRoleIcon = ({
  isAdmin,
  size = 'small',
}: ProjectRoleIconProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [showTooltip, setShowTooltip] = useState<boolean>(false)

  const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    setShowTooltip(true)
  }
  const handleMouseLeave = () => {
    setAnchorEl(null)
    setShowTooltip(false)
  }

  const roleDescription = getUserProjectRoleDescription(isAdmin)

  return (
    <>
      <IconButton
        aria-owns={anchorEl ? `project-role-popover-${isAdmin}` : undefined}
        aria-haspopup='true'
        color='secondary'
        size={size}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          minWidth: 'auto',
          width: size === 'small' ? 24 : size === 'medium' ? 32 : 40,
          height: size === 'small' ? 24 : size === 'medium' ? 32 : 40,
        }}>
        {getUserProjectRoleIcon(isAdmin, size)}
      </IconButton>

      {showTooltip && (
        <Popover
          id={`project-role-popover-${isAdmin}`}
          sx={{
            pointerEvents: 'none',
            '& .MuiPaper-root': {
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
            },
          }}
          open={showTooltip}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          onClose={handleMouseLeave}
          disableRestoreFocus
          disableScrollLock>
          <Box sx={{ p: 1.5 }}>
            <Typography
              variant='caption'
              fontWeight='bold'
              sx={{ mb: 0.5, display: 'block' }}>
              {roleDescription.title}
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontSize: '0.7rem', whiteSpace: 'pre-wrap' }}>
              {roleDescription.description}
            </Typography>
          </Box>
        </Popover>
      )}
    </>
  )
}

export default ProjectRoleIcon
