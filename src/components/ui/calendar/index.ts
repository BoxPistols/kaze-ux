// src/components/ui/calendar/index.ts
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import 'dayjs/locale/ja'

import { initCalendarSettings } from '@/hooks/useCalendarSettings'

// Date Pickers / カレンダー全体で週開始曜日を設定する
// MUI X Date Pickers はアダプターの locale 設定に従うため、dayjs 側の locale を上書きする
// 初期設定はlocalStorageから読み込み、なければデフォルト（月曜始まり）を使用
dayjs.extend(updateLocale)
const initialSettings = initCalendarSettings()
dayjs.updateLocale('ja', {
  weekStart: initialSettings.weekStart,
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
