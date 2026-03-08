import { Box } from '@mui/material'
import dayjs from 'dayjs'
import { useState } from 'react'
import { action } from 'storybook/actions'
import 'dayjs/locale/ja'

import {
  CalendarControl,
  type CalendarViewMode,
} from '@/components/ui/calendar/calendarControl'
import { MiniCalendar } from '@/components/ui/calendar/miniCalendar'
import { MonthView } from '@/components/ui/calendar/monthView'
import { CalendarSettingsProvider } from '@/providers/CalendarSettingsProvider'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Dayjs } from 'dayjs'

dayjs.locale('ja')

const mockSchedules = [
  {
    id: '1',
    title: '東京湾岸 定期点検',
    date: dayjs().format('YYYY-MM-DD'),
    time: '09:00',
    duration: '2時間',
    type: '点検',
    assignee: '山田太郎',
  },
  {
    id: '2',
    title: 'ドローン機体整備',
    date: dayjs().format('YYYY-MM-DD'),
    time: '14:00',
    duration: '1時間',
    type: '整備',
    assignee: '鈴木花子',
  },
  {
    id: '3',
    title: '農地モニタリング飛行',
    date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    time: '10:00',
    duration: '3時間',
    type: '飛行',
    assignee: '佐藤一郎',
  },
]

const meta: Meta = {
  title: 'Components/UI/Calendar',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'カレンダーコンポーネント群。日/週/月ビューの切替、ミニカレンダー、週開始日設定に対応。ドローン運用スケジュール管理に使用。',
      },
    },
  },
  decorators: [
    (Story) => (
      <CalendarSettingsProvider>
        <Box sx={{ p: 3 }}>
          <Story />
        </Box>
      </CalendarSettingsProvider>
    ),
  ],
}

export default meta

export const MiniCalendarDefault: StoryObj<typeof MiniCalendar> = {
  render: () => {
    const Demo = () => {
      const [date, setDate] = useState<Dayjs>(dayjs())
      return (
        <Box sx={{ maxWidth: 320 }}>
          <MiniCalendar currentDate={date} onDateChange={setDate} />
        </Box>
      )
    }
    return <Demo />
  },
}

export const CalendarControlDefault: StoryObj<typeof CalendarControl> = {
  render: () => {
    const Demo = () => {
      const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
      const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs())

      const formatDateHeader = () => {
        if (viewMode === 'month') return currentDate.format('YYYY年 M月')
        if (viewMode === 'week') {
          const weekStart = currentDate.startOf('week')
          const weekEnd = currentDate.endOf('week')
          return `${weekStart.format('M/D')} - ${weekEnd.format('M/D')}`
        }
        return currentDate.format('YYYY年 M月 D日 (ddd)')
      }

      const handleNavigate = (direction: 'prev' | 'next') => {
        const unit =
          viewMode === 'month' ? 'month' : viewMode === 'week' ? 'week' : 'day'
        setCurrentDate(
          direction === 'prev'
            ? currentDate.subtract(1, unit)
            : currentDate.add(1, unit)
        )
      }

      return (
        <CalendarControl
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          dateHeaderText={formatDateHeader()}
          onPrev={() => handleNavigate('prev')}
          onNext={() => handleNavigate('next')}
          onTodayClick={() => setCurrentDate(dayjs())}
        />
      )
    }
    return <Demo />
  },
}

export const MonthViewDefault: StoryObj<typeof MonthView> = {
  render: () => {
    const Demo = () => {
      const [date, setDate] = useState<Dayjs>(dayjs())
      return (
        <Box
          sx={{ maxWidth: 900, border: '1px solid', borderColor: 'divider' }}>
          <MonthView
            currentDate={date}
            schedules={mockSchedules}
            onDateClick={setDate}
            onScheduleClick={action('onScheduleClick')}
          />
        </Box>
      )
    }
    return <Demo />
  },
}
