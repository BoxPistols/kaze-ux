// src/components/ui/calendar/dayView.tsx
// sdpf-frontend-nextに準拠した日表示カレンダーコンポーネント
import { Box, Typography, Avatar } from '@mui/material'
import dayjs from 'dayjs'

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

export interface DayViewProps {
  /** 表示する日付 */
  currentDate: Dayjs
  /** スケジュールデータ */
  schedules: Schedule[]
  /** スケジュールクリック時のコールバック */
  onScheduleClick?: (schedule: Schedule) => void
  /** 時間スロットクリック時のコールバック */
  onTimeSlotClick?: (hour: number, assignee: string) => void
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 6) // 6:00 - 19:00

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

// ユーザーごとの色
const getUserColor = (name: string): string => {
  const colors = [
    '#e91e63',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#00bcd4',
    '#009688',
    '#4caf50',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
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

// 名前からイニシャルを取得
const getInitials = (name: string): string => {
  const parts = name.split(/\s+/)
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0]
  }
  return name.slice(0, 2)
}

export const DayView = ({
  currentDate,
  schedules,
  onScheduleClick,
  onTimeSlotClick,
}: DayViewProps) => {
  // この日のスケジュールを取得
  const daySchedules = schedules.filter((schedule) =>
    dayjs(schedule.date).isSame(currentDate, 'day')
  )

  // 担当者リストを取得（重複削除）
  const assignees = Array.from(
    new Set(daySchedules.map((s) => s.assignee))
  ).sort()

  // 担当者がいない場合のフォールバック
  const displayAssignees = assignees.length > 0 ? assignees : ['担当者未設定']

  // 特定の担当者のスケジュールを取得
  const getSchedulesForAssignee = (assignee: string) => {
    return daySchedules.filter((schedule) => schedule.assignee === assignee)
  }

  return (
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'grid',
          // 内容に列幅が引っ張られてヘッダーとズレるのを防ぐ
          gridTemplateColumns: `60px repeat(${displayAssignees.length}, minmax(0, 1fr))`,
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Typography variant='caption' color='text.secondary'>
            時間
          </Typography>
        </Box>
        {/* 担当者ヘッダー */}
        {displayAssignees.map((assignee, index) => (
          <Box
            key={assignee}
            sx={{
              p: 1.5,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              borderRight:
                index < displayAssignees.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: getUserColor(assignee),
                fontSize: '14px',
              }}>
              {getInitials(assignee)}
            </Avatar>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {assignee}
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
              gridTemplateColumns: `60px repeat(${displayAssignees.length}, minmax(0, 1fr))`,
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
            {/* 担当者セル */}
            {displayAssignees.map((assignee, index) => (
              <Box
                key={assignee}
                onClick={() => onTimeSlotClick?.(hour, assignee)}
                sx={{
                  minWidth: 0,
                  borderRight:
                    index < displayAssignees.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  position: 'relative',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}>
                {/* この時間帯のスケジュールを表示 */}
                {getSchedulesForAssignee(assignee)
                  .filter((schedule) => parseTime(schedule.time) === hour)
                  .map((schedule) => {
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
                          left: 2,
                          right: 2,
                          height: `calc(${durationHours * 60}px - 4px)`,
                          bgcolor: getTypeColor(schedule.type),
                          color: 'white',
                          borderRadius: 0.5,
                          p: 0.75,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          zIndex: 1,
                          '&:hover': {
                            opacity: 0.9,
                            zIndex: 10,
                          },
                        }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mb: 0.25,
                          }}>
                          <Typography
                            variant='caption'
                            sx={{
                              fontWeight: 600,
                              fontSize: '10px',
                              color: 'inherit',
                            }}>
                            {schedule.time}
                          </Typography>
                          <Typography
                            variant='caption'
                            sx={{
                              fontSize: '10px',
                              color: 'rgba(255,255,255,0.8)',
                            }}>
                            ({schedule.duration})
                          </Typography>
                        </Box>
                        <Typography
                          variant='body2'
                          sx={{
                            fontSize: '12px',
                            fontWeight: 500,
                            lineHeight: 1.3,
                            color: 'inherit',
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
                              mt: 0.5,
                            }}>
                            {schedule.type}
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

export default DayView
