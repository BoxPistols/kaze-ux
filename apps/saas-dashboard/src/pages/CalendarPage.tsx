import { Box } from '@mui/material'
import dayjs, { type Dayjs } from 'dayjs'
import { useState, useMemo } from 'react'

import {
  CalendarControl,
  MonthView,
  WeekView,
  DayView,
} from '@/components/ui/calendar'
import type { CalendarViewMode } from '@/components/ui/calendar'
import { WeekStartSelector } from '@/components/ui/calendar/WeekStartSelector'
import { Card, CardContent } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/text'

import { scheduleEvents } from '~/data/schedules'

export const CalendarPage = () => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs())

  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate((d) => d.subtract(1, 'month'))
    else if (viewMode === 'week') setCurrentDate((d) => d.subtract(1, 'week'))
    else setCurrentDate((d) => d.subtract(1, 'day'))
  }

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate((d) => d.add(1, 'month'))
    else if (viewMode === 'week') setCurrentDate((d) => d.add(1, 'week'))
    else setCurrentDate((d) => d.add(1, 'day'))
  }

  const dateHeaderText = useMemo(() => {
    if (viewMode === 'month') return currentDate.format('MMMM YYYY')
    if (viewMode === 'week') {
      const start = currentDate.startOf('week')
      const end = currentDate.endOf('week')
      return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`
    }
    return currentDate.format('dddd, MMMM D, YYYY')
  }, [currentDate, viewMode])

  const schedules = useMemo(
    () =>
      scheduleEvents.map((e) => {
        const start = dayjs(e.start)
        const end = dayjs(e.end)
        const durationMinutes = end.diff(start, 'minute')
        const hours = Math.floor(durationMinutes / 60)
        const mins = durationMinutes % 60
        return {
          id: e.id,
          title: e.title,
          date: start.format('YYYY-MM-DD'),
          time: start.format('HH:mm'),
          duration: mins > 0 ? `${hours}h ${mins}m` : `${hours}h`,
          type: e.type,
          assignee: e.attendees?.[0] ?? '',
        }
      }),
    []
  )

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title='Calendar' subtitle='View and manage your schedule.'>
        <WeekStartSelector compact />
      </PageHeader>

      <Card>
        <CardContent sx={{ p: { xs: 1.5, md: 2.5 } }}>
          <CalendarControl
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            dateHeaderText={dateHeaderText}
            onPrev={handlePrev}
            onNext={handleNext}
            onTodayClick={() => setCurrentDate(dayjs())}
          />

          <Box sx={{ mt: 2 }}>
            {viewMode === 'month' && (
              <MonthView
                currentDate={currentDate}
                schedules={schedules}
                onDateClick={(date: Dayjs) => {
                  setCurrentDate(date)
                  setViewMode('day')
                }}
              />
            )}
            {viewMode === 'week' && (
              <WeekView currentDate={currentDate} schedules={schedules} />
            )}
            {viewMode === 'day' && (
              <DayView currentDate={currentDate} schedules={schedules} />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
