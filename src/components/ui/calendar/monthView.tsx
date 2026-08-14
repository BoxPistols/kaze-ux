// src/components/ui/calendar/monthView.tsx
import { Box, Typography } from '@mui/material'
import dayjs from 'dayjs'

import { useCalendarSettings } from '@/hooks'

import type { Dayjs } from 'dayjs'

export interface Schedule {
  id: string
  title: string
  date: string
  time: string
  type: string
  assignee: string
}

export interface MonthViewProps {
  /** 表示する月 */
  currentDate: Dayjs
  /** スケジュールデータ */
  schedules: Schedule[]
  /** 日付クリック時のコールバック */
  onDateClick?: (date: Dayjs) => void
  /** スケジュールクリック時のコールバック */
  onScheduleClick?: (schedule: Schedule) => void
}

type ScheduleTone = 'primary' | 'warning' | 'success' | 'secondary'

/**
 * 種別をセマンティック色に対応づける。
 *
 * 色を直に書くとテーマ切替に追随せず、文字色との対比も保証できない。
 * 実際、旧実装の警告色に白文字は 3.11:1、既定色では 2.68:1 しかなく、
 * 10px の文字に必要な 4.5:1 を割っていた。tone を返して
 * `${tone}.main` / `${tone}.contrastText` の組で使う
 */
const getTypeTone = (type: string): ScheduleTone => {
  switch (type) {
    case '点検':
      return 'primary'
    case '整備':
      return 'warning'
    case '配送':
      return 'success'
    default:
      return 'secondary'
  }
}

export const MonthView = ({
  currentDate,
  schedules,
  onDateClick,
  onScheduleClick,
}: MonthViewProps) => {
  const { getDaysOfWeek, isSaturday, isSunday } = useCalendarSettings()
  const daysOfWeek = getDaysOfWeek()

  // 月の最初の日を取得
  const startOfMonth = currentDate.startOf('month')

  // カレンダーの開始日（週の開始日から / dayjs locale設定に従う）
  const startOfCalendar = startOfMonth.startOf('week')
  // 6週間分を表示
  const endOfCalendar = startOfCalendar.add(41, 'day')

  // カレンダーの日付配列を生成
  const days: Dayjs[] = []
  let day = startOfCalendar
  while (day.isBefore(endOfCalendar) || day.isSame(endOfCalendar, 'day')) {
    days.push(day)
    day = day.add(1, 'day')
  }

  // 週ごとにグループ化
  const weeks: Dayjs[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  // 特定の日付のスケジュールを取得
  const getSchedulesForDate = (date: Dayjs) => {
    return schedules.filter((schedule) =>
      dayjs(schedule.date).isSame(date, 'day')
    )
  }

  const isToday = (date: Dayjs) => date.isSame(dayjs(), 'day')
  const isCurrentMonth = (date: Dayjs) => date.month() === currentDate.month()

  return (
    <Box sx={{ width: '100%' }}>
      {/* 曜日ヘッダー */}
      <Box
        sx={{
          display: 'grid',
          // 予定タイトルなどの内容に列幅が引っ張られてヘッダーとズレるのを防ぐ
          // minmax(0, 1fr) にすることで各列が常に均等割りになる
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
        {daysOfWeek.map((dayName, index) => (
          <Box
            key={dayName}
            sx={{
              py: 1,
              textAlign: 'center',
              borderRight: index < 6 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 400,
                // main は面のための色。文字に使うと 12px で 2.5〜4.4:1 にしかならない
                color: isSunday(index)
                  ? 'error.textContrast'
                  : isSaturday(index)
                    ? 'info.textContrast'
                    : 'text.primary',
              }}>
              {dayName}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* カレンダーグリッド */}
      <Box>
        {weeks.map((week, weekIndex) => (
          <Box
            key={weekIndex}
            sx={{
              display: 'grid',
              // ヘッダーと同じ列幅計算に揃える
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              borderBottom: weekIndex < weeks.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}>
            {week.map((date, dayIndex) => {
              const daySchedules = getSchedulesForDate(date)
              const displaySchedules = daySchedules.slice(0, 3)
              const hasMore = daySchedules.length > 3

              return (
                <Box
                  key={date.format('YYYY-MM-DD')}
                  onClick={() => onDateClick?.(date)}
                  sx={{
                    minHeight: 100,
                    // CSS Gridのデフォルト(min-width: auto)で内容に引っ張られるのを防ぐ
                    minWidth: 0,
                    p: 0.5,
                    borderRight: dayIndex < 6 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    bgcolor: !isCurrentMonth(date)
                      ? 'action.hover'
                      : 'transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}>
                  {/* 日付 */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      mb: 0.5,
                    }}>
                    <Typography
                      variant='body2'
                      sx={{
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: isToday(date) ? 'primary.main' : 'transparent',
                        color: isToday(date)
                          ? 'primary.contrastText'
                          : // 当月外の日付は「無効な操作対象」ではなく読む情報。
                            // text.disabled では 1.64:1 で読めない
                            !isCurrentMonth(date)
                            ? 'text.secondary'
                            : isSunday(dayIndex)
                              ? 'error.textContrast'
                              : isSaturday(dayIndex)
                                ? 'info.textContrast'
                                : 'text.primary',
                        fontWeight: isToday(date) ? 700 : 400,
                      }}>
                      {date.date()}
                    </Typography>
                  </Box>

                  {/* スケジュール */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.25,
                    }}>
                    {displaySchedules.map((schedule) => (
                      <Box
                        key={schedule.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onScheduleClick?.(schedule)
                        }}
                        sx={{
                          px: 0.5,
                          py: 0.25,
                          borderRadius: 0.5,
                          bgcolor: `${getTypeTone(schedule.type)}.main`,
                          color: `${getTypeTone(schedule.type)}.contrastText`,
                          fontSize: '12px',
                          lineHeight: 1.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.9,
                          },
                        }}>
                        {schedule.time} {schedule.title}
                      </Box>
                    ))}
                    {hasMore && (
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          fontSize: '12px',
                          pl: 0.5,
                        }}>
                        +{daySchedules.length - 3}件
                      </Typography>
                    )}
                  </Box>
                </Box>
              )
            })}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default MonthView
