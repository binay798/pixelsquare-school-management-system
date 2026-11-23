import moment from 'moment'

export const ROOM_STATUS_OPTIONS = [
  { label: 'Available', value: 'available' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Inactive', value: 'inactive' },
]

export const ROOM_PURPOSE_OPTIONS = [
  { label: 'Section / class', value: 'section' },
  { label: 'Timetable period', value: 'timetable' },
  { label: 'Examination', value: 'examination' },
  { label: 'Event', value: 'event' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Temporary', value: 'temporary' },
  { label: 'Other', value: 'other' },
]

export const BOOKING_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const MAINTENANCE_STATUS_OPTIONS = [
  { label: 'Open', value: 'open' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const WEEKDAY_OPTIONS = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
]

export const PURPOSE_LABEL: Record<string, string> =
  ROOM_PURPOSE_OPTIONS.reduce(
    (acc, option) => ({ ...acc, [option.value]: option.label }),
    {}
  )

export const titleCase = (value: string) =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export const formatTime = (time?: string | null) =>
  time ? moment(time, ['HH:mm:ss', 'HH:mm']).format('hh:mm A') : '—'

export const formatDate = (date?: string | null) =>
  date ? moment(date).format('DD MMM YYYY') : '—'

export const formatMinutes = (minutes?: number | null) => {
  const value = Number(minutes ?? 0)
  const hours = Math.floor(value / 60)
  const rest = value % 60

  if (!value) {
    return '0m'
  }

  return hours ? `${hours}h ${rest ? `${rest}m` : ''}`.trim() : `${rest}m`
}

export const getRoomCapacityLabel = (
  enrolled: number,
  capacity?: number | null
) => {
  if (!capacity) {
    return `${enrolled} students`
  }

  return `${enrolled} / ${capacity} students`
}

export const getInitials = (
  firstname?: string | null,
  lastname?: string | null
) =>
  `${firstname?.charAt(0) ?? ''}${lastname?.charAt(0) ?? ''}`.toUpperCase() ||
  '—'
