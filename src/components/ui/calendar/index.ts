// src/components/ui/calendar/index.ts
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import 'dayjs/locale/ja'

// Date Pickers / カレンダー全体で週開始曜日を設定する
// MUI X Date Pickers はアダプターの locale 設定に従うため、dayjs 側の locale を上書きする
// デフォルト: 月曜始まり (weekStart: 1)
dayjs.extend(updateLocale)
dayjs.updateLocale('ja', {
  weekStart: 1,
})

export { MiniCalendar, type MiniCalendarProps } from './miniCalendar'
export {
  WeekStartSelector,
  type WeekStartSelectorProps,
} from './WeekStartSelector'
export {
  CalendarControl,
  type CalendarControlProps,
  type CalendarViewMode,
} from './calendarControl'
export {
  MonthView,
  type MonthViewProps,
  type Schedule as MonthViewSchedule,
} from './monthView'
export {
  WeekView,
  type WeekViewProps,
  type Schedule as WeekViewSchedule,
} from './weekView'
export {
  DayView,
  type DayViewProps,
  type Schedule as DayViewSchedule,
} from './dayView'
