import moment from 'moment'
import { getClassList } from '@src/store/redux/dashboard/academics/classes/classes.service'
import { getClassSectionList } from '@src/store/redux/dashboard/academics/classSections/sections.service'
import { teacherServices } from '@src/store/redux/dashboard/teachers/teachers.service'
import { manageStudentServices } from '@src/store/redux/dashboard/manageStudents/manageStudents.service'
import { ROLE } from '@src/constants/users.constants'

export type SelectOption = { label: string; value: number }

/** Root path of the announcement pages, shared by every screen. */
export const ANNOUNCEMENT_BASE_PATH = '/dashboard/academics/announcements'

export interface IStatusMeta {
  label: string
  text: string
  bg: string
  border: string
  dot: string
  description: string
}

export const ANNOUNCEMENT_STATUS_ORDER: Announcement.Status[] = [
  'draft',
  'scheduled',
  'published',
  'archived',
]

export const ANNOUNCEMENT_STATUS_META: Record<
  Announcement.Status,
  IStatusMeta
> = {
  draft: {
    label: 'Draft',
    text: '#475569',
    bg: '#f1f5f9',
    border: '#e2e8f0',
    dot: '#94a3b8',
    description: 'Only visible in the board, still being prepared.',
  },
  scheduled: {
    label: 'Scheduled',
    text: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    dot: '#f59e0b',
    description: 'Goes live automatically on its publish date.',
  },
  published: {
    label: 'Published',
    text: '#047857',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    dot: '#10b981',
    description: 'Live on the notice board of its audience.',
  },
  archived: {
    label: 'Archived',
    text: '#4338ca',
    bg: '#eef2ff',
    border: '#c7d2fe',
    dot: '#6366f1',
    description: 'Removed from the board but kept as history.',
  },
}

/**
 * Mirrors `ANNOUNCEMENT_STATUS_TRANSITIONS` of the backend so the UI never
 * offers a transition the API would reject.
 */
export const ANNOUNCEMENT_STATUS_TRANSITIONS: Record<
  Announcement.Status,
  Announcement.Status[]
> = {
  draft: ['scheduled', 'published', 'archived'],
  scheduled: ['published', 'draft', 'archived'],
  published: ['draft', 'archived'],
  archived: ['draft', 'published'],
}

/** Announcements in these statuses can no longer be edited (backend guard). */
export const ANNOUNCEMENT_LOCKED_STATUSES: Announcement.Status[] = ['archived']

export const ANNOUNCEMENT_CATEGORY_OPTIONS: {
  label: string
  value: Announcement.Category
}[] = [
  { label: 'General', value: 'general' },
  { label: 'Academic', value: 'academic' },
  { label: 'Examination', value: 'examination' },
  { label: 'Event', value: 'event' },
  { label: 'Holiday', value: 'holiday' },
  { label: 'Fee', value: 'fee' },
  { label: 'Transport', value: 'transport' },
  { label: 'Sports', value: 'sports' },
  { label: 'Emergency', value: 'emergency' },
  { label: 'Other', value: 'other' },
]

export const ANNOUNCEMENT_PRIORITY_OPTIONS: {
  label: string
  value: Announcement.Priority
}[] = [
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]

export const ANNOUNCEMENT_PRIORITY_META: Record<
  Announcement.Priority,
  { label: string; text: string; bg: string; border: string }
> = {
  low: { label: 'Low', text: '#475569', bg: '#f8fafc', border: '#e2e8f0' },
  normal: {
    label: 'Normal',
    text: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  high: { label: 'High', text: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  urgent: {
    label: 'Urgent',
    text: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
  },
}

export const ANNOUNCEMENT_AUDIENCE_TYPE_META: Record<
  Announcement.AudienceType,
  { label: string; hint: string }
> = {
  school: { label: 'Whole school', hint: 'Every user of the school.' },
  role: { label: 'By role', hint: 'Students, teachers, guardians...' },
  class: { label: 'By class', hint: 'Every section of the class.' },
  section: { label: 'By section', hint: 'A single class section.' },
  student: { label: 'Specific students', hint: 'Hand picked students.' },
  teacher: { label: 'Specific teachers', hint: 'Hand picked teachers.' },
  user: { label: 'Specific users', hint: 'Hand picked accounts.' },
}

export const AUDIENCE_TYPE_FILTER_OPTIONS: {
  label: string
  value: Announcement.AudienceType
}[] = (
  Object.keys(ANNOUNCEMENT_AUDIENCE_TYPE_META) as Announcement.AudienceType[]
).map((type) => ({
  label: ANNOUNCEMENT_AUDIENCE_TYPE_META[type].label,
  value: type,
}))

export const ROLE_AUDIENCE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Students', value: ROLE.student },
  { label: 'Teachers', value: ROLE.teacher },
  { label: 'Guardians', value: ROLE.guardian },
  { label: 'Admin', value: ROLE.admin },
  { label: 'Staff', value: ROLE.staff },
]

export const ANNOUNCEMENT_STATUS_FILTER_OPTIONS: {
  label: string
  value: Announcement.Status
}[] = ANNOUNCEMENT_STATUS_ORDER.map((status) => ({
  label: ANNOUNCEMENT_STATUS_META[status].label,
  value: status,
}))

export const isAnnouncementLocked = (status?: Announcement.Status) =>
  Boolean(status && ANNOUNCEMENT_LOCKED_STATUSES.includes(status))

export const getAllowedTransitions = (
  status: Announcement.Status
): Announcement.Status[] => ANNOUNCEMENT_STATUS_TRANSITIONS[status] ?? []

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

export const loadTeacherOptions = async (): Promise<SelectOption[]> => {
  const res = await teacherServices.getTeacherList(1, 300)

  return (res.data.rows ?? []).map((row) => ({
    label: [
      row.user_profile_details.firstname,
      row.user_profile_details.lastname,
    ]
      .filter(Boolean)
      .join(' '),
    value: row.teacher_details.id,
  }))
}

export const loadStudentOptions = async (
  search?: string
): Promise<SelectOption[]> => {
  const res = await manageStudentServices.getStudentList(1, 100, search)

  return (res.data.rows ?? []).map((row) => ({
    label: `${
      [row.user_profile_details.firstname, row.user_profile_details.lastname]
        .filter(Boolean)
        .join(' ') || 'Student'
    }${
      row.class_details?.name
        ? ` · ${row.class_details.name}${
            row.class_section_details?.name
              ? ` - ${row.class_section_details.name}`
              : ''
          }`
        : ''
    }`,
    value: row.student_details.id,
  }))
}

/**
 * `teachers.id` of the logged in user, used to know whether the current user is
 * the author of a notice (teachers only manage their own notices).
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

// MARK: - FORMATTERS
export const getPersonName = (person?: Announcement.IPerson | null) => {
  if (!person) {
    return 'Not available'
  }

  return (
    [person.firstname, person.middlename, person.lastname]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Not available'
  )
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

export const getAnnouncementTitle = (
  announcement: Announcement.IAnnouncement
) => announcement.title?.trim() || 'Untitled announcement'

export const formatAnnouncementDate = (
  value?: string | null,
  format = 'DD MMM YYYY'
) => (value && moment(value).isValid() ? moment(value).format(format) : '—')

export const formatAnnouncementDateTime = (value?: string | null) =>
  formatAnnouncementDate(value, 'DD MMM YYYY, hh:mm A')

/** Plain text preview of the TinyMCE html of a notice. */
export const stripAnnouncementHtml = (html?: string | null, limit = 180) => {
  if (!html) {
    return ''
  }
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()

  return text.length > limit ? `${text.slice(0, limit)}…` : text
}

export const getTargetLabel = (target: Announcement.ITarget) => {
  if (target.label) {
    return target.label
  }

  switch (target.target_type) {
    case 'school':
      return 'Whole school'
    case 'role':
      return target.role ? `Role · ${target.role}` : 'Role'
    case 'class':
      return target.class_name ? `Class ${target.class_name}` : 'Class'
    case 'section':
      return target.class_section_name
        ? `Section ${target.class_section_name}`
        : 'Section'
    case 'student':
      return 'Student'
    case 'teacher':
      return 'Teacher'
    default:
      return 'User'
  }
}

/** ISO string accepted by the API (`publish_at`, `expires_at`). */
export const toIsoDateTime = (value?: Date | string | null) =>
  value && moment(value).isValid() ? moment(value).toISOString() : undefined

/**
 * Rebuilds the audience payload of the form from the target rows returned by
 * the API (the update endpoint replaces the whole audience).
 */
export const audienceFromTargets = (
  targets: Announcement.ITarget[],
  audienceType: Announcement.AudienceType
): Announcement.IAudience => {
  const audience: Announcement.IAudience = { type: audienceType }

  if (audienceType === 'role') {
    audience.roles = targets
      .map((target) => target.role)
      .filter((role): role is string => Boolean(role))
  }
  if (audienceType === 'class') {
    audience.class_ids = targets
      .map((target) => target.class_id)
      .filter((id): id is number => Boolean(id))
  }
  if (audienceType === 'section') {
    audience.class_section_ids = targets
      .map((target) => target.class_section_id)
      .filter((id): id is number => Boolean(id))
  }
  if (audienceType === 'student') {
    audience.student_ids = targets
      .map((target) => target.student_id)
      .filter((id): id is number => Boolean(id))
  }
  if (audienceType === 'teacher') {
    audience.teacher_ids = targets
      .map((target) => target.teacher_id)
      .filter((id): id is number => Boolean(id))
  }
  if (audienceType === 'user') {
    audience.user_ids = targets
      .map((target) => target.user_id)
      .filter((id): id is number => Boolean(id))
  }

  return audience
}

/** `true` when the audience payload actually reaches somebody. */
export const isAudienceFilled = (audience: Announcement.IAudience) => {
  switch (audience.type) {
    case 'school':
      return true
    case 'role':
      return Boolean(audience.roles?.length)
    case 'class':
      return Boolean(audience.class_ids?.length)
    case 'section':
      return Boolean(audience.class_section_ids?.length)
    case 'student':
      return Boolean(audience.student_ids?.length)
    case 'teacher':
      return Boolean(audience.teacher_ids?.length)
    default:
      return Boolean(audience.user_ids?.length)
  }
}
