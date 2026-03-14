import AddIcon from '@mui/icons-material/Add'
import { Box, Grid } from '@mui/material'
import dayjs, { type Dayjs } from 'dayjs'
import { useState, useMemo, useCallback } from 'react'

import { CustomSelect } from '@/components/Form/CustomSelect'
import { CustomTextField } from '@/components/Form/CustomTextField'
import { Button } from '@/components/ui/Button'
import {
  CalendarControl,
  MonthView,
  WeekView,
  DayView,
} from '@/components/ui/calendar'
import type { CalendarViewMode } from '@/components/ui/calendar'
import { WeekStartSelector } from '@/components/ui/calendar/WeekStartSelector'
import { Card, CardContent } from '@/components/ui/Card'
import { ConfirmDialog, FormDialog } from '@/components/ui/dialog'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import type { ScheduleEvent } from '~/data/schedules'

import { scheduleEvents as initialEvents } from '~/data/schedules'

type EventType = ScheduleEvent['type']

const typeOptions: { value: EventType; label: string }[] = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'review', label: 'Review' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'social', label: 'Social' },
]

const emptyForm = {
  title: '',
  date: '',
  startTime: '09:00',
  endTime: '10:00',
  type: 'meeting' as EventType,
  description: '',
  attendees: '',
}

export const CalendarPage = () => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs())
  const [eventList, setEventList] = useState<ScheduleEvent[]>(initialEvents)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ScheduleEvent | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ScheduleEvent | null>(null)
  const [form, setForm] = useState(emptyForm)

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
      eventList.map((e) => {
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
          duration:
            mins > 0
              ? `${Math.max(hours, 1)}h ${mins}m`
              : `${Math.max(hours, 1)}h`,
          type: e.type,
          assignee: e.attendees?.[0] ?? '',
        }
      }),
    [eventList]
  )

  const openAdd = useCallback((date?: string, time?: string) => {
    setEditTarget(null)
    setForm({
      ...emptyForm,
      date: date ?? dayjs().format('YYYY-MM-DD'),
      startTime: time ?? '09:00',
      endTime: time
        ? `${String((Number(time.split(':')[0]) + 1) % 24).padStart(2, '0')}:00`
        : '10:00',
    })
    setFormOpen(true)
  }, [])

  const openEdit = useCallback(
    (scheduleId: string) => {
      const event = eventList.find((e) => e.id === scheduleId)
      if (!event) return
      const start = dayjs(event.start)
      const end = dayjs(event.end)
      setEditTarget(event)
      setForm({
        title: event.title,
        date: start.format('YYYY-MM-DD'),
        startTime: start.format('HH:mm'),
        endTime: end.format('HH:mm'),
        type: event.type,
        description: event.description ?? '',
        attendees: event.attendees?.join(', ') ?? '',
      })
      setFormOpen(true)
    },
    [eventList]
  )

  const openDelete = useCallback(
    (scheduleId: string) => {
      const event = eventList.find((e) => e.id === scheduleId)
      if (event) {
        setDeleteTarget(event)
        setDeleteOpen(true)
      }
    },
    [eventList]
  )

  const handleScheduleClick = useCallback(
    (schedule: { id: string }) => {
      openEdit(schedule.id)
    },
    [openEdit]
  )

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!form.date) {
      toast.error('Date is required')
      return
    }

    const startStr = `${form.date}T${form.startTime}`
    const endStr = `${form.date}T${form.endTime}`
    const attendees = form.attendees
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean)

    if (editTarget) {
      setEventList((prev) =>
        prev.map((e) =>
          e.id === editTarget.id
            ? {
                ...e,
                title: form.title,
                start: new Date(startStr).toISOString(),
                end: new Date(endStr).toISOString(),
                type: form.type,
                description: form.description || undefined,
                attendees: attendees.length > 0 ? attendees : undefined,
              }
            : e
        )
      )
      toast.success(`Updated event: ${form.title}`)
    } else {
      const newEvent: ScheduleEvent = {
        id: `s${Date.now()}`,
        title: form.title,
        start: new Date(startStr).toISOString(),
        end: new Date(endStr).toISOString(),
        type: form.type,
        description: form.description || undefined,
        attendees: attendees.length > 0 ? attendees : undefined,
      }
      setEventList((prev) => [...prev, newEvent])
      toast.success(`Created event: ${form.title}`)
    }
    setFormOpen(false)
  }

  const handleDelete = () => {
    if (deleteTarget) {
      setEventList((prev) => prev.filter((e) => e.id !== deleteTarget.id))
      toast.success(`Deleted event: ${deleteTarget.title}`)
    }
    setDeleteOpen(false)
    setDeleteTarget(null)
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title='Calendar' subtitle='View and manage your schedule.'>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <WeekStartSelector compact />
          <Button variant='default' onClick={() => openAdd()}>
            <AddIcon sx={{ fontSize: 18, mr: 0.5 }} aria-hidden='true' /> Add
            Event
          </Button>
        </Box>
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
                onScheduleClick={handleScheduleClick}
              />
            )}
            {viewMode === 'week' && (
              <WeekView
                currentDate={currentDate}
                schedules={schedules}
                onScheduleClick={handleScheduleClick}
                onTimeSlotClick={(date: Dayjs, hour: number) =>
                  openAdd(
                    date.format('YYYY-MM-DD'),
                    `${String(hour).padStart(2, '0')}:00`
                  )
                }
              />
            )}
            {viewMode === 'day' && (
              <DayView
                currentDate={currentDate}
                schedules={schedules}
                onScheduleClick={handleScheduleClick}
                onTimeSlotClick={(hour: number) =>
                  openAdd(
                    currentDate.format('YYYY-MM-DD'),
                    `${String(hour).padStart(2, '0')}:00`
                  )
                }
              />
            )}
          </Box>
        </CardContent>
      </Card>

      <FormDialog
        open={formOpen}
        title={editTarget ? 'Edit Event' : 'New Event'}
        onSubmit={handleSubmit}
        onCancel={() => setFormOpen(false)}
        submitText={editTarget ? 'Update' : 'Create'}
        maxWidth='sm'
        fullWidth>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CustomTextField
              label='Title'
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomTextField
              label='Date'
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
              fullWidth
              type='date'
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <CustomTextField
              label='Start Time'
              value={form.startTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, startTime: e.target.value }))
              }
              fullWidth
              type='time'
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <CustomTextField
              label='End Time'
              value={form.endTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, endTime: e.target.value }))
              }
              fullWidth
              type='time'
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomSelect
              label='Type'
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value as EventType,
                }))
              }
              options={typeOptions}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomTextField
              label='Attendees'
              value={form.attendees}
              onChange={(e) =>
                setForm((f) => ({ ...f, attendees: e.target.value }))
              }
              fullWidth
              placeholder='Comma-separated names'
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomTextField
              label='Description'
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
        {editTarget && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              variant='destructive'
              onClick={() => {
                setFormOpen(false)
                openDelete(editTarget.id)
              }}>
              Delete Event
            </Button>
          </Box>
        )}
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        title='Delete Event'
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onCancel={() => {
          setDeleteOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        confirmColor='error'
        confirmText='Delete'
      />
    </Box>
  )
}
