// src/components/ui/calendar/weekView.tsx
// sdpf-frontend-nextに準拠した週表示カレンダーコンポーネント
import { Box, Typography } from '@mui/material'
import dayjs from 'dayjs'

import { useCalendarSettings } from '@/hooks'

import type { Dayjs } from 'dayjs'

export interface Schedule {
  id: string
  title: string
  date: string
  time: string
  duration: string
  type: string
  assignee: string
}

export interface WeekViewProps {
  /** 表示する週の基準日 */
  currentDate: Dayjs
  /** スケジュールデータ */
  schedules: Schedule[]
  /** スケジュールクリック時のコールバック */
  onScheduleClick?: (schedule: Schedule) => void
  /** 時間スロットクリック時のコールバック */
  onTimeSlotClick?: (date: Dayjs, hour: number) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i) // 0:00 - 23:00

const getTypeColor = (type: string) => {
  switch (type) {
    case '点検':
      return '#1976d2' // primary
    case '整備':
      return '#ed6c02' // warning
    case '飛行':
      return '#2e7d32' // success
    default:
      return '#9e9e9e' // grey
  }
}

// 時間文字列から時間を取得
const parseTime = (timeStr: string): number => {
  const [hours] = timeStr.split(':').map(Number)
  return hours
}

// 所要時間から時間数を取得
const parseDuration = (durationStr: string): number => {
  const match = durationStr.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 1
}

export const WeekView = ({
  currentDate,
  schedules,
  onScheduleClick,
  onTimeSlotClick,
}: WeekViewProps) => {
  const { getDaysOfWeek, isSaturday, isSunday } = useCalendarSettings()
  const daysOfWeek = getDaysOfWeek()

  // 週の日付配列を生成
  // dayjs locale設定に従う
  const startOfWeek = currentDate.startOf('week')
  const weekDays: Dayjs[] = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.add(i, 'day')
  )

  // 特定の日付のスケジュールを取得
  const getSchedulesForDate = (date: Dayjs) => {
    return schedules.filter((schedule) =>
      dayjs(schedule.date).isSame(date, 'day')
    )
  }

  const isToday = (date: Dayjs) => date.isSame(dayjs(), 'day')

  return (
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'grid',
          // 内容に列幅が引っ張られてヘッダーとズレるのを防ぐ
          gridTemplateColumns: '60px repeat(7, minmax(0, 1fr))',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
        }}>
        {/* 時間列ヘッダー */}
        <Box
          sx={{
            borderRight: '1px solid',
            borderColor: 'divider',
            p: 1,
          }}
        />
        {/* 曜日ヘッダー */}
        {weekDays.map((date, index) => (
          <Box
            key={date.format('YYYY-MM-DD')}
            sx={{
              p: 1,
              textAlign: 'center',
              borderRight: index < 6 ? '1px solid' : 'none',
              borderColor: 'divider',
              bgcolor: isToday(date) ? 'primary.50' : 'transparent',
            }}>
            <Typography
              variant='body2'
              sx={{
                color: isSunday(index)
                  ? 'error.main'
                  : isSaturday(index)
                    ? 'info.main'
                    : 'text.secondary',
              }}>
              {daysOfWeek[index]}
            </Typography>
            <Typography
              variant='h6'
              sx={{
                fontWeight: isToday(date) ? 700 : 400,
                color: isToday(date) ? 'primary.main' : 'text.primary',
              }}>
              {date.date()}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* 時間グリッド */}
      <Box sx={{ position: 'relative' }}>
        {HOURS.map((hour) => (
          <Box
            key={hour}
            sx={{
              display: 'grid',
              gridTemplateColumns: '60px repeat(7, minmax(0, 1fr))',
              borderBottom: '1px solid',
              borderColor: 'divider',
              minHeight: 60,
            }}>
            {/* 時間ラベル */}
            <Box
              sx={{
                borderRight: '1px solid',
                borderColor: 'divider',
                p: 0.5,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
              }}>
              <Typography variant='caption' color='text.secondary'>
                {hour}:00
              </Typography>
            </Box>
            {/* 日付セル */}
            {weekDays.map((date, index) => (
              <Box
                key={date.format('YYYY-MM-DD')}
                onClick={() => onTimeSlotClick?.(date, hour)}
                sx={{
                  minWidth: 0,
                  borderRight: index < 6 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  position: 'relative',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}>
                {/* この時間帯のスケジュールを表示 */}
                {getSchedulesForDate(date)
                  .filter((schedule) => parseTime(schedule.time) === hour)
                  .map((schedule, scheduleIndex) => {
                    const durationHours = parseDuration(schedule.duration)
                    return (
                      <Box
                        key={schedule.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onScheduleClick?.(schedule)
                        }}
                        sx={{
                          position: 'absolute',
                          top: 2,
                          left: scheduleIndex * 4 + 2,
                          right: 2,
                          height: `calc(${durationHours * 60}px - 4px)`,
                          bgcolor: getTypeColor(schedule.type),
                          color: 'white',
                          borderRadius: 0.5,
                          p: 0.5,
                          fontSize: '11px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          zIndex: scheduleIndex + 1,
                          '&:hover': {
                            opacity: 0.9,
                            zIndex: 10,
                          },
                        }}>
                        <Typography
                          variant='caption'
                          sx={{
                            display: 'block',
                            fontWeight: 600,
                            fontSize: '10px',
                            color: 'inherit',
                          }}>
                          {schedule.time}
                        </Typography>
                        <Typography
                          variant='caption'
                          sx={{
                            display: 'block',
                            fontSize: '11px',
                            lineHeight: 1.2,
                            color: 'inherit',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                          {schedule.title}
                        </Typography>
                        {durationHours >= 2 && (
                          <Typography
                            variant='caption'
                            sx={{
                              display: 'block',
                              fontSize: '10px',
                              color: 'rgba(255,255,255,0.8)',
                              mt: 0.25,
                            }}>
                            {schedule.assignee}
                          </Typography>
                        )}
                      </Box>
                    )
                  })}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default WeekView
