import { api } from '@src/helpers/api.helpers'

// MARK: - DTOs
export interface TCreateClassRoutineDto {
  class_section_id: number
  teacher_id: number
  subject_id: number
  working_day_id: number
  time_slot_id: number
}

export type TUpdateClassRoutineDto = Pick<
  TCreateClassRoutineDto,
  'working_day_id' | 'time_slot_id'
>

export interface TCreateTimeSlotDto {
  schedule_template_id: number
  working_day_id: number
  name: string
  start_time: string
  end_time: string
  slot_type: string
  sequence_order?: number
}

export type TUpdateTimeSlotDto = Partial<TCreateTimeSlotDto>

export interface TCreateWorkingDayDto {
  name: string
  sequence_order?: number
  is_working_day?: boolean
}

export type TUpdateWorkingDayDto = Partial<TCreateWorkingDayDto>

export interface TCreateScheduleTemplateDto {
  name: string
  is_active?: boolean
}

export type TUpdateScheduleTemplateDto = Partial<TCreateScheduleTemplateDto>

export interface IClassRoutineFilters {
  classId?: number
  classSectionId?: number
  teacherId?: number
}

// MARK: - CLASS ROUTINE
const getClassRoutineListService = async (filters?: IClassRoutineFilters) => {
  const params: { [key: string]: number } = {}

  if (filters?.classId) {
    params.class_id = filters.classId
  }
  if (filters?.classSectionId) {
    params.class_section_id = filters.classSectionId
  }
  if (filters?.teacherId) {
    params.teacher_id = filters.teacherId
  }

  const res = await api<Api.Base<Academics.IClassRoutineList[]>>('get')(
    'academics/routines',
    params
  )

  return res.data.data
}

const getMyRoutineListService = async () => {
  const res = await api<Api.Base<Academics.IClassRoutineList[]>>('get')(
    'academics/routines/mine'
  )

  return res.data.data
}

const createClassRoutineService = async (
  classId: number,
  data: TCreateClassRoutineDto
) => {
  const res = await api<Api.Base<object>>('post')(
    `academics/classes/${classId}/routines`,
    undefined,
    data
  )

  return res.data.data
}

const updateClassRoutineService = async (
  classId: number,
  routineId: number,
  data: TUpdateClassRoutineDto
) => {
  const res = await api<Api.Base<object>>('patch')(
    `academics/classes/${classId}/routines/${routineId}`,
    undefined,
    data
  )

  return res.data.data
}

const deleteClassRoutineService = async (
  classId: number,
  routineId: number
) => {
  const res = await api<Api.Base<object>>('delete')(
    `academics/classes/${classId}/routines/${routineId}`
  )

  return res.data.data
}

// MARK: - TIME SLOT
const getTimeSlotListService = async (classId: number) => {
  const res = await api<Api.Base<Academics.ITimeSlotList[]>>('get')(
    `academics/classes/${classId}/routines/time-slots`
  )

  return res.data.data
}

const createTimeSlotService = async (
  classId: number,
  data: TCreateTimeSlotDto
) => {
  const res = await api<Api.Base<object>>('post')(
    `academics/classes/${classId}/routines/time-slots`,
    undefined,
    data
  )

  return res.data.data
}

const updateTimeSlotService = async (
  classId: number,
  timeSlotId: number,
  data: TUpdateTimeSlotDto
) => {
  const res = await api<Api.Base<object>>('patch')(
    `academics/classes/${classId}/routines/time-slots/${timeSlotId}`,
    undefined,
    data
  )

  return res.data.data
}

const deleteTimeSlotService = async (classId: number, timeSlotId: number) => {
  const res = await api<Api.Base<object>>('delete')(
    `academics/classes/${classId}/routines/time-slots/${timeSlotId}`
  )

  return res.data.data
}

// MARK: - WORKING DAY
const getWorkingDayListService = async (classId: number) => {
  const res = await api<Api.Base<Academics.IWorkingDayList[]>>('get')(
    `academics/classes/${classId}/routines/working-days`
  )

  return res.data.data
}

const createWorkingDayService = async (
  classId: number,
  data: TCreateWorkingDayDto
) => {
  const res = await api<Api.Base<object>>('post')(
    `academics/classes/${classId}/routines/working-days`,
    undefined,
    data
  )

  return res.data.data
}

const updateWorkingDayService = async (
  classId: number,
  workingDayId: number,
  data: TUpdateWorkingDayDto
) => {
  const res = await api<Api.Base<object>>('patch')(
    `academics/classes/${classId}/routines/working-days/${workingDayId}`,
    undefined,
    data
  )

  return res.data.data
}

const deleteWorkingDayService = async (
  classId: number,
  workingDayId: number
) => {
  const res = await api<Api.Base<object>>('delete')(
    `academics/classes/${classId}/routines/working-days/${workingDayId}`
  )

  return res.data.data
}

// MARK: - SCHEDULE TEMPLATE
const getScheduleTemplateListService = async (classId: number) => {
  const res = await api<Api.Base<Academics.IScheduleTemplateList[]>>('get')(
    `academics/classes/${classId}/routines/schedule-templates`
  )

  return res.data.data
}

const createScheduleTemplateService = async (
  classId: number,
  data: TCreateScheduleTemplateDto
) => {
  const res = await api<Api.Base<object>>('post')(
    `academics/classes/${classId}/routines/schedule-templates`,
    undefined,
    data
  )

  return res.data.data
}

const updateScheduleTemplateService = async (
  classId: number,
  scheduleTemplateId: number,
  data: TUpdateScheduleTemplateDto
) => {
  const res = await api<Api.Base<object>>('patch')(
    `academics/classes/${classId}/routines/schedule-templates/${scheduleTemplateId}`,
    undefined,
    data
  )

  return res.data.data
}

const deleteScheduleTemplateService = async (
  classId: number,
  scheduleTemplateId: number
) => {
  const res = await api<Api.Base<object>>('delete')(
    `academics/classes/${classId}/routines/schedule-templates/${scheduleTemplateId}`
  )

  return res.data.data
}

export const classRoutineServices = {
  getClassRoutineListService,
  getMyRoutineListService,
  createClassRoutineService,
  updateClassRoutineService,
  deleteClassRoutineService,
  getTimeSlotListService,
  createTimeSlotService,
  updateTimeSlotService,
  deleteTimeSlotService,
  getWorkingDayListService,
  createWorkingDayService,
  updateWorkingDayService,
  deleteWorkingDayService,
  getScheduleTemplateListService,
  createScheduleTemplateService,
  updateScheduleTemplateService,
  deleteScheduleTemplateService,
}
