// src/components/ui/calendar/miniCalendar.tsx
// ミニカレンダーコンポーネント
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import {
  Box,
  Collapse,
  IconButton,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import {
  PickersDay,
  type PickersDayProps,
} from '@mui/x-date-pickers/PickersDay'
import { useMemo, useState } from 'react'

import { useCalendarSettings } from '@/hooks'

import type { Dayjs } from 'dayjs'
import 'dayjs/locale/ja'

export interface MiniCalendarProps {
  /** 選択中の日付 */
  currentDate: Dayjs
  /** 日付変更時のコールバック */
  onDateChange: (date: Dayjs) => void
  /** カスタムスタイル */
  sx?: SxProps<Theme>
  /** トグル（開閉）ボタンを表示 */
  showToggle?: boolean
  /** 初期表示（開） */
  defaultOpen?: boolean
  /** 開閉状態（制御用） */
  open?: boolean
  /** 開閉状態変更（制御用） */
  onOpenChange?: (open: boolean) => void
  /** 見出し */
  title?: string
}

type MiniCalendarDayProps = Omit<PickersDayProps, 'day'> & {
  day: Dayjs
}

const MiniCalendarDay = (props: MiniCalendarDayProps) => {
  const { day, outsideCurrentMonth, selected, sx, ...rest } = props

  const isSunday = day.day() === 0
  const isSaturday = day.day() === 6

  const mergedSx: SxProps<Theme> = [
    // 月間カレンダーと同様に「土=青 / 日=赤」
    // 選択中/当月外はMUIの標準スタイルを優先する
    !selected && !outsideCurrentMonth && (isSunday || isSaturday)
      ? { color: isSunday ? 'error.main' : 'info.main' }
      : {},
    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
  ]

  return (
    <PickersDay
      {...rest}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      selected={selected}
      sx={mergedSx}
    />
  )
}

export const MiniCalendar = ({
  currentDate,
  onDateChange,
  sx,
  showToggle = false,
  defaultOpen = true,
  open,
  onOpenChange,
  title = 'カレンダー',
}: MiniCalendarProps) => {
  const { settings } = useCalendarSettings()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isOpen = open ?? uncontrolledOpen

  // 週開始曜日に応じた土曜/日曜のnth-of-type位置を計算
  // nth-of-typeは1始まり
  const weekdayPositions = useMemo(() => {
    const weekStart = settings.weekStart
    // 土曜(6)と日曜(0)が週の何番目に来るかを計算
    const saturdayPos = ((6 - weekStart + 7) % 7) + 1
    const sundayPos = ((0 - weekStart + 7) % 7) + 1
    return { saturday: saturdayPos, sunday: sundayPos }
  }, [settings.weekStart])

  const setOpen = (nextOpen: boolean) => {
    if (open === undefined) {
      setUncontrolledOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  const handleDateChange = (newDate: Dayjs | null) => {
    if (newDate) {
      onDateChange(newDate)
    }
  }

  const headerText = showToggle ? title : undefined

  return (
    <Box sx={sx}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ja'>
        {headerText && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
              minWidth: 0,
            }}>
            <Typography
              variant='subtitle2'
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                minWidth: 0,
                maxWidth: isOpen ? '100%' : 0,
                opacity: isOpen ? 1 : 0,
                transition: 'max-width 200ms ease, opacity 200ms ease',
              }}>
              {headerText}
            </Typography>
            <IconButton
              size='small'
              aria-label={
                isOpen ? 'ミニカレンダーを閉じる' : 'ミニカレンダーを開く'
              }
              onClick={() => setOpen(!isOpen)}>
              {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Box>
        )}

        <Collapse in={!headerText || isOpen} timeout={200} unmountOnExit>
          <DateCalendar
            key={`calendar-${settings.weekStart}`}
            sx={{
              '&.MuiDateCalendar-root': {
                width: '100%',
                maxHeight: '310px',
              },
              // 曜日ヘッダーと日付グリッドのズレ防止
              // DayCalendarは内部的に flex レイアウトのため、各セルの寸法を揃えて同一の配置規則にする
              '& .MuiDayCalendar-header': {
                justifyContent: 'space-between',
              },
              '& .MuiDayCalendar-weekContainer': {
                justifyContent: 'space-between',
              },
              '& .MuiDayCalendar-weekDayLabel': {
                width: '32px',
                height: '32px',
                m: 0,
              },
              // 週開始曜日に応じた土曜/日曜の色付け
              [`& .MuiDayCalendar-weekDayLabel:nth-of-type(${weekdayPositions.saturday})`]:
                {
                  color: 'info.main',
                },
              [`& .MuiDayCalendar-weekDayLabel:nth-of-type(${weekdayPositions.sunday})`]:
                {
                  color: 'error.main',
                },
              '& .MuiPickersArrowSwitcher-button': {
                color: 'secondary.main',
              },
              '& .MuiPickersCalendarHeader-root': {
                my: 1,
              },
              '& .MuiPickersDay-root': {
                width: '32px',
                height: '32px',
                m: 0,
              },
              '& .MuiPickersDay-dayOutsideMonth': {
                color: 'grey.400',
              },
            }}
            value={currentDate}
            onChange={handleDateChange}
            views={['day']}
            showDaysOutsideCurrentMonth
            fixedWeekNumber={0}
            slots={{ day: MiniCalendarDay }}
          />
        </Collapse>
      </LocalizationProvider>
    </Box>
  )
}

export default MiniCalendar
