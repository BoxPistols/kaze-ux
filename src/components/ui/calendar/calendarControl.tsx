// src/components/ui/calendar/calendarControl.tsx
// カレンダーコントロールコンポーネント
import { ChevronLeft, ChevronRight, Today } from '@mui/icons-material'
import {
  Box,
  Typography,
  IconButton,
  Button,
  ButtonGroup,
  type SxProps,
  type Theme,
} from '@mui/material'

export type CalendarViewMode = 'day' | 'week' | 'month'

export interface CalendarControlProps {
  /** 現在の表示モード */
  viewMode: CalendarViewMode
  /** 表示モード変更時のコールバック */
  onViewModeChange: (mode: CalendarViewMode) => void
  /** 日付表示テキスト（例: "2024年1月"） */
  dateHeaderText: string
  /** 前へナビゲート */
  onPrev: () => void
  /** 次へナビゲート */
  onNext: () => void
  /** 今日へ移動 */
  onTodayClick: () => void
  /** カスタムスタイル */
  sx?: SxProps<Theme>
  /** 今日ボタンを表示 */
  showTodayButton?: boolean
  /** 表示モード切替を表示 */
  showViewModeToggle?: boolean
}

export const CalendarControl = ({
  viewMode,
  onViewModeChange,
  dateHeaderText,
  onPrev,
  onNext,
  onTodayClick,
  sx,
  showTodayButton = true,
  showViewModeToggle = true,
}: CalendarControlProps) => {
  return (
    <Box sx={sx}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        {/* ナビゲーション部分 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={onPrev}
              color='secondary'
              aria-label='前へ'
              size='small'>
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={onNext}
              color='secondary'
              aria-label='次へ'
              size='small'>
              <ChevronRight />
            </IconButton>
          </Box>
          <Typography
            variant='h5'
            sx={{
              fontWeight: '600',
              color: 'text.primary',
              ml: 1,
            }}>
            {dateHeaderText}
          </Typography>
        </Box>

        {/* コントロール部分 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {showViewModeToggle && (
            <ButtonGroup size='small'>
              <Button
                variant={viewMode === 'month' ? 'contained' : 'outlined'}
                onClick={() => onViewModeChange('month')}
                sx={{ minHeight: 38 }}>
                月
              </Button>
              <Button
                variant={viewMode === 'week' ? 'contained' : 'outlined'}
                onClick={() => onViewModeChange('week')}
                sx={{ minHeight: 38 }}>
                週
              </Button>
              <Button
                variant={viewMode === 'day' ? 'contained' : 'outlined'}
                onClick={() => onViewModeChange('day')}
                sx={{ minHeight: 38 }}>
                日
              </Button>
            </ButtonGroup>
          )}
          {showTodayButton && (
            <Button
              variant='outlined'
              startIcon={<Today />}
              onClick={onTodayClick}>
              今日
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default CalendarControl
