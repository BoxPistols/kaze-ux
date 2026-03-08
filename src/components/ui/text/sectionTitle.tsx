import { Box, Typography, type TypographyProps } from '@mui/material'
import { useTheme } from '@mui/material/styles'

export type SectionTitleProps = {
  /** 必須マーク（*）を表示するか */
  required?: boolean
} & TypographyProps

/**
 * セクションタイトルコンポーネント
 * フォーム内のセクション見出しに使用
 */
export const SectionTitle = ({
  required = false,
  children,
  ...props
}: SectionTitleProps) => {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex' }}>
      {required && (
        <Typography
          aria-hidden='true'
          component='span'
          {...props}
          sx={{
            pt: 0.5,
            mb: -0.5,
            mr: 1,
            ml: 0,
            color: theme.palette.error.main,
            fontSize: '1.3em',
            lineHeight: '1',
            ...(props.sx || {}),
          }}>
          *
        </Typography>
      )}
      <Typography
        fontSize='13px'
        fontWeight='bold'
        color={theme.palette.primary.main}
        display='block'
        {...props}>
        {children}
      </Typography>
    </Box>
  )
}
