// src/components/ui/calendar/WeekStartSelector.tsx
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material'

import {
  useCalendarSettings,
  WEEK_START_OPTIONS,
  type WeekStart,
} from '@/hooks'

// アクセシビリティ用ラベル定数
const ARIA_LABELS = {
  weekStartSelector: '週開始曜日選択',
} as const

export interface WeekStartSelectorProps {
  /** コンパクト表示（ラベルなし） */
  compact?: boolean
  /** カスタムスタイル */
  sx?: SxProps<Theme>
  /** ラベルテキスト */
  label?: string
  /** 説明テキスト */
  description?: string
}

/**
 * 週開始曜日を選択するコンポーネント
 * 日曜/月曜/土曜から選択可能
 */
export const WeekStartSelector = ({
  compact = false,
  sx,
  label = '週の開始曜日',
  description = 'カレンダーの週開始曜日を選択してください',
}: WeekStartSelectorProps) => {
  const { settings, setWeekStart } = useCalendarSettings()

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: WeekStart | null
  ) => {
    if (newValue !== null) {
      setWeekStart(newValue)
    }
  }

  if (compact) {
    return (
      <Box sx={sx}>
        <ToggleButtonGroup
          value={settings.weekStart}
          exclusive
          onChange={handleChange}
          aria-label={ARIA_LABELS.weekStartSelector}
          size='small'>
          {WEEK_START_OPTIONS.map((option) => (
            <ToggleButton
              key={option.value}
              value={option.value}
              aria-label={option.label}>
              {option.shortLabel}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    )
  }

  return (
    <Box sx={sx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <CalendarTodayIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        <Typography variant='subtitle2' fontWeight={600}>
          {label}
        </Typography>
      </Box>
      {description && (
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      <ToggleButtonGroup
        value={settings.weekStart}
        exclusive
        onChange={handleChange}
        aria-label={ARIA_LABELS.weekStartSelector}>
        {WEEK_START_OPTIONS.map((option) => (
          <ToggleButton
            key={option.value}
            value={option.value}
            aria-label={option.label}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  )
}

export default WeekStartSelector
