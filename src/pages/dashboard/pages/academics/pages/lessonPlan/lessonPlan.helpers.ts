import moment from 'moment'
import { getClassList } from '@src/store/redux/dashboard/academics/classes/classes.service'
import { getClassSectionList } from '@src/store/redux/dashboard/academics/classSections/sections.service'
import { subjectServices } from '@src/store/redux/dashboard/academics/subjects/subjects.service'
import { topicServices } from '@src/store/redux/dashboard/academics/topics/topics.service'
import { teacherServices } from '@src/store/redux/dashboard/teachers/teachers.service'

export type SelectOption = { label: string; value: number }

export interface IStatusMeta {
  label: string
  text: string
  bg: string
  border: string
  dot: string
  description: string
}

/**
 * Mirrors `LESSON_PLAN_STATUS_TRANSITIONS` of the backend so that the UI never
 * offers a transition the API would reject.
 */
export const LESSON_PLAN_STATUS_TRANSITIONS: Record<
  LessonPlan.Status,
  LessonPlan.Status[]
> = {
  draft: ['submitted', 'completed'],
  submitted: ['approved', 'rejected', 'draft'],
  approved: ['completed', 'draft'],
  rejected: ['submitted', 'draft'],
  completed: ['approved'],
}

/** Plans in these statuses can no longer be edited (backend guard). */
export const LESSON_PLAN_LOCKED_STATUSES: LessonPlan.Status[] = [
  'approved',
  'completed',
]

export const LESSON_PLAN_STATUS_ORDER: LessonPlan.Status[] = [
  'draft',
  'submitted',
  'approved',
  'rejected',
  'completed',
]

export const LESSON_PLAN_STATUS_META: Record<LessonPlan.Status, IStatusMeta> = {
  draft: {
    label: 'Draft',
    text: '#475569',
    bg: '#f1f5f9',
    border: '#e2e8f0',
    dot: '#94a3b8',
    description: 'Still being prepared by the teacher.',
  },
  submitted: {
    label: 'Submitted',
    text: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    dot: '#f59e0b',
    description: 'Waiting for a coordinator to review the plan.',
  },
  approved: {
    label: 'Approved',
    text: '#047857',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    dot: '#10b981',
    description: 'Reviewed and shared with the students of the section.',
  },
  rejected: {
    label: 'Needs changes',
    text: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
    dot: '#ef4444',
    description: 'Sent back by the reviewer, update and resubmit.',
  },
  completed: {
    label: 'Completed',
    text: '#4338ca',
    bg: '#eef2ff',
    border: '#c7d2fe',
    dot: '#6366f1',
    description: 'The lesson was executed and reflected upon.',
  },
}

export const PLAN_TYPE_OPTIONS: {
  label: string
  value: LessonPlan.PlanType
}[] = [
  { label: 'Daily plan', value: 'daily' },
  { label: 'Weekly plan', value: 'weekly' },
]

export const STATUS_FILTER_OPTIONS: {
  label: string
  value: LessonPlan.Status
}[] = LESSON_PLAN_STATUS_ORDER.map((status) => ({
  label: LESSON_PLAN_STATUS_META[status].label,
  value: status,
}))

export const isLessonPlanLocked = (status?: LessonPlan.Status) =>
  Boolean(status && LESSON_PLAN_LOCKED_STATUSES.includes(status))

export const getAllowedTransitions = (
  status: LessonPlan.Status,
  isAdmin: boolean
): LessonPlan.Status[] => {
  const transitions = LESSON_PLAN_STATUS_TRANSITIONS[status] ?? []

  // only a school admin/coordinator may approve or reject a plan
  return transitions.filter((next) =>
    ['approved', 'rejected'].includes(next) ? isAdmin : true
  )
}

export const formatPlanDate = (date?: string | null, format = 'DD MMM YYYY') =>
  date ? moment(date).format(format) : '—'

export const formatWeekRange = (weekStartDate?: string | null) => {
  if (!weekStartDate) {
    return '—'
  }
  const start = moment(weekStartDate)
  const end = start.clone().add(6, 'days')

  return `${start.format('DD MMM')} – ${end.format('DD MMM YYYY')}`
}

export const formatTime = (time?: string | null) =>
  time ? moment(time, ['HH:mm:ss', 'HH:mm']).format('hh:mm A') : ''

export const getPersonName = (person?: LessonPlan.IPerson | null) => {
  if (!person || !person.firstname) {
    return ''
  }

  return [person.firstname, person.middlename, person.lastname]
    .filter(Boolean)
    .join(' ')
}

export const getInitials = (name?: string | null) => {
  if (!name) {
    return 'NA'
  }
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export const getPlanTitle = (plan: LessonPlan.IPlan) =>
  plan.title?.trim() || 'Untitled lesson plan'

export const getResourceKind = (resource: LessonPlan.IResource) => {
  if (resource.external_url) {
    return 'link' as const
  }
  const fileType = (resource.file_type ?? '').toLowerCase()
  if (fileType.includes('image')) {
    return 'image' as const
  }
  if (fileType.includes('pdf')) {
    return 'pdf' as const
  }

  return 'file' as const
}

// MARK: - SELECT OPTIONS
export const loadClassOptions = async (): Promise<SelectOption[]> => {
  const res = await getClassList()

  return (res.data.rows ?? []).map((row) => ({
    label: `${row.class_details.name}${
      row.class_details.numeric_name
        ? ` (${row.class_details.numeric_name})`
        : ''
    }`,
    value: row.class_details.id,
  }))
}

export const loadSectionOptions = async (
  classId: number
): Promise<SelectOption[]> => {
  const res = await getClassSectionList(classId)

  return (res.data ?? []).map((row) => ({
    label: `Section ${row.section_details.name}`,
    value: row.section_details.id,
  }))
}

export const loadSubjectOptions = async (
  classId: number
): Promise<SelectOption[]> => {
  const res = await subjectServices.getSubjectListService(classId, 1, 500)

  return (res.data ?? []).map((row) => ({
    label: row.subject_details.name,
    value: row.subject_id,
  }))
}

export const loadChapterOptions = async (
  classId: number,
  subjectId: number
): Promise<SelectOption[]> => {
  const res = await subjectServices.getChapterList(classId, subjectId, 1, 200)

  return (res.data.rows ?? []).map((row) => ({
    label: `Ch ${row.chapter_details.chapter_number} · ${row.chapter_details.name}`,
    value: row.chapter_details.id,
  }))
}

export const loadTopicOptions = async (
  classId: number,
  subjectId: number,
  chapterId: number
): Promise<SelectOption[]> => {
  const res = await topicServices.getTopicList(classId, subjectId, chapterId)

  return (res.data ?? []).map((row) => ({
    label: row.topic_details.name,
    value: row.topic_details.id,
  }))
}

export const loadTeacherOptions = async (): Promise<SelectOption[]> => {
  const res = await teacherServices.getTeacherList(1, 300)

  return (res.data.rows ?? []).map((row) => ({
    label: `${row.user_profile_details.firstname} ${row.user_profile_details.lastname}`,
    value: row.teacher_details.id,
  }))
}

/**
 * `teachers.id` of the logged in user (undefined when the user is not a teacher),
 * used to know whether the current user authored a plan.
 */
export const loadMyTeacherId = async (
  userId?: number
): Promise<number | undefined> => {
  if (!userId) {
    return undefined
  }
  const res = await teacherServices.getTeacherList(1, 300)
  const row = (res.data.rows ?? []).find(
    (teacher) => teacher.user_details?.id === userId
  )

  return row?.teacher_details?.id
}
