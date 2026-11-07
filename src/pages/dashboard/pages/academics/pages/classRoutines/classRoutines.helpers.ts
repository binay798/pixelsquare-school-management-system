import moment from 'moment'
import { sortBy, uniqBy } from 'lodash'

export interface ISelectOption {
  label: string
  value: number
}

export const SLOT_TYPE = {
  period: 'period',
  break: 'break',
} as const

export const SLOT_TYPE_OPTIONS = [
  { label: 'Period', value: SLOT_TYPE.period },
  { label: 'Break', value: SLOT_TYPE.break },
]

/**
 * MUI `Card` applies `overflow: hidden` (and modals use `overflow-y: auto`),
 * which clips the react-select menu so the dropdown options become invisible.
 * Rendering the menu inside a portal attached to `document.body` keeps it
 * visible above cards, tables and modals.
 */
export const routineSelectPortalProps = {
  menuPortalTarget:
    typeof document === 'undefined' ? null : (document.body as HTMLElement),
  menuPosition: 'fixed' as const,
  menuPlacement: 'auto' as const,
}

/** Formats a `HH:mm:ss` time coming from the api into a 12 hour format. */
export const formatRoutineTime = (time?: string | null) => {
  if (!time) {
    return ''
  }

  const parsed = moment(time, ['HH:mm:ss', 'HH:mm'], true)

  return parsed.isValid() ? parsed.format('hh:mm A') : time
}

export const getTeacherFullName = (routine: Academics.IClassRoutineList) => {
  const profile = routine?.user_profile_details

  return [profile?.firstname, profile?.middlename, profile?.lastname]
    .filter(Boolean)
    .join(' ')
}

export interface IRoutineSlotSeries {
  key: string
  name: string
  start_time: string
  end_time: string
  slot_type: string
  sequence_order: number
  schedule_template_id: number
}

/** Collapses the day specific time slots into a single ordered slot series. */
export const getRoutineSlotSeries = (
  timeSlotList: Academics.ITimeSlotList[] | null,
  templateId?: number | null
) => {
  const filtered = (timeSlotList ?? []).filter((el) =>
    templateId ? el.time_slot_details.schedule_template_id === templateId : true
  )

  const series = filtered.map((el) => ({
    key: `${el.time_slot_details.name}_${el.time_slot_details.start_time}_${el.time_slot_details.end_time}`,
    name: el.time_slot_details.name,
    start_time: el.time_slot_details.start_time,
    end_time: el.time_slot_details.end_time,
    slot_type: el.time_slot_details.slot_type,
    sequence_order: el.time_slot_details.sequence_order,
    schedule_template_id: el.time_slot_details.schedule_template_id,
  }))

  return sortBy(uniqBy(series, 'key'), 'sequence_order') as IRoutineSlotSeries[]
}

/** Ordered list of the working days that a routine can be assigned to. */
export const getRoutineWorkingDays = (
  workingDayList: Academics.IWorkingDayList[] | null
) => {
  const days = (workingDayList ?? []).map((el) => el.working_day_details)

  return sortBy(days, 'sequence_order')
}

export interface IRoutineGridRow {
  series: IRoutineSlotSeries
  cells: { [workingDayId: number]: Academics.IClassRoutineList[] }
}

interface IBuildRoutineGridProps {
  routineList: Academics.IClassRoutineList[] | null
  workingDayList: Academics.IWorkingDayList[] | null
  timeSlotList: Academics.ITimeSlotList[] | null
  templateId?: number | null
}

export const buildRoutineGrid = ({
  routineList,
  workingDayList,
  timeSlotList,
  templateId,
}: IBuildRoutineGridProps) => {
  const workingDays = getRoutineWorkingDays(workingDayList).filter(
    (el) => el.is_working_day
  )
  const slotSeries = getRoutineSlotSeries(timeSlotList, templateId)

  const routines = (routineList ?? []).filter((el) =>
    templateId ? el.schedule_template_details?.id === templateId : true
  )

  const rows: IRoutineGridRow[] = slotSeries.map((series) => {
    const cells: { [workingDayId: number]: Academics.IClassRoutineList[] } = {}

    workingDays.forEach((day) => {
      cells[day.id] = routines.filter((routine) => {
        const slot = routine.time_slot_details

        return (
          routine.class_routine_details?.working_day_id === day.id &&
          slot?.name === series.name &&
          slot?.start_time === series.start_time &&
          slot?.end_time === series.end_time
        )
      })
    })

    return { series, cells }
  })

  return { rows, workingDays }
}

/** Groups the routines day wise, used by the responsive (mobile) routine view. */
export const groupRoutinesByWorkingDay = (
  routineList: Academics.IClassRoutineList[] | null,
  workingDayList: Academics.IWorkingDayList[] | null,
  templateId?: number | null
) => {
  const workingDays = getRoutineWorkingDays(workingDayList).filter(
    (el) => el.is_working_day
  )
  const routines = (routineList ?? []).filter((el) =>
    templateId ? el.schedule_template_details?.id === templateId : true
  )

  return workingDays
    .map((day) => ({
      workingDay: day,
      routines: sortBy(
        routines.filter(
          (routine) => routine.class_routine_details?.working_day_id === day.id
        ),
        (routine) => routine.time_slot_details?.sequence_order ?? 0
      ),
    }))
    .filter((el) => el.routines.length > 0)
}
