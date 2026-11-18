import moment from 'moment'

/** Root path of the complaint pages, shared by every screen. */
export const COMPLAINT_BASE_PATH = '/dashboard/complaints'

export interface IStatusMeta {
  label: string
  text: string
  bg: string
  border: string
  dot: string
  description: string
}

export const COMPLAINT_STATUS_ORDER: Complaint.Status[] = [
  'new',
  'acknowledged',
  'in_progress',
  'pending_info',
  'escalated',
  'reopened',
  'resolved',
  'closed',
  'rejected',
  'withdrawn',
]

export const COMPLAINT_STATUS_META: Record<Complaint.Status, IStatusMeta> = {
  new: {
    label: 'New',
    text: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
    dot: '#3b82f6',
    description: 'Logged by the office, nobody has picked it up yet.',
  },
  acknowledged: {
    label: 'Acknowledged',
    text: '#0e7490',
    bg: '#ecfeff',
    border: '#a5f3fc',
    dot: '#06b6d4',
    description: 'Seen and assigned, the work has not started.',
  },
  in_progress: {
    label: 'In progress',
    text: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    dot: '#f59e0b',
    description: 'The assigned staff member is working on it.',
  },
  pending_info: {
    label: 'Pending info',
    text: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    dot: '#8b5cf6',
    description: 'Waiting for the complainant or a third party.',
  },
  escalated: {
    label: 'Escalated',
    text: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
    dot: '#ef4444',
    description: 'Past its SLA target or raised to a supervisor.',
  },
  reopened: {
    label: 'Reopened',
    text: '#c2410c',
    bg: '#fff7ed',
    border: '#fed7aa',
    dot: '#f97316',
    description: 'The complainant came back after the resolution.',
  },
  resolved: {
    label: 'Resolved',
    text: '#047857',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    dot: '#10b981',
    description: 'A resolution was recorded, waiting to be closed.',
  },
  closed: {
    label: 'Closed',
    text: '#334155',
    bg: '#f8fafc',
    border: '#e2e8f0',
    dot: '#64748b',
    description: 'Settled and archived, reopen is the only way back.',
  },
  rejected: {
    label: 'Rejected',
    text: '#4b5563',
    bg: '#f3f4f6',
    border: '#e5e7eb',
    dot: '#6b7280',
    description: 'Not a complaint, or filed by mistake.',
  },
  withdrawn: {
    label: 'Withdrawn',
    text: '#4b5563',
    bg: '#f3f4f6',
    border: '#e5e7eb',
    dot: '#6b7280',
    description: 'Pulled back by the complainant or the office.',
  },
}

export const COMPLAINT_PRIORITY_META: Record<
  Complaint.Priority,
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

export const COMPLAINT_SEVERITY_META: Record<
  Complaint.Severity,
  { label: string; text: string; bg: string; border: string }
> = {
  low: { label: 'Low', text: '#475569', bg: '#f8fafc', border: '#e2e8f0' },
  medium: {
    label: 'Medium',
    text: '#0e7490',
    bg: '#ecfeff',
    border: '#a5f3fc',
  },
  high: { label: 'High', text: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  critical: {
    label: 'Critical',
    text: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
  },
}

/**
 * Mirrors `COMPLAINT_STATUS_TRANSITIONS` of the backend, so the UI never offers a
 * transition the API would reject.
 */
export const COMPLAINT_STATUS_TRANSITIONS: Record<
  Complaint.Status,
  Complaint.Status[]
> = {
  new: [
    'acknowledged',
    'in_progress',
    'pending_info',
    'escalated',
    'rejected',
    'withdrawn',
  ],
  acknowledged: [
    'in_progress',
    'pending_info',
    'escalated',
    'resolved',
    'withdrawn',
  ],
  in_progress: ['pending_info', 'escalated', 'resolved', 'withdrawn'],
  pending_info: ['in_progress', 'escalated', 'resolved', 'closed', 'withdrawn'],
  escalated: ['in_progress', 'pending_info', 'resolved'],
  resolved: ['closed', 'reopened'],
  closed: ['reopened'],
  reopened: [
    'acknowledged',
    'in_progress',
    'pending_info',
    'escalated',
    'resolved',
  ],
  rejected: ['reopened'],
  withdrawn: ['reopened'],
}

export const COMPLAINT_LOCKED_STATUSES: Complaint.Status[] = [
  'closed',
  'withdrawn',
]

export const getAllowedComplaintTransitions = (
  status: Complaint.Status
): Complaint.Status[] => COMPLAINT_STATUS_TRANSITIONS[status] ?? []

export const isComplaintLocked = (status: Complaint.Status) =>
  COMPLAINT_LOCKED_STATUSES.includes(status)

export const COMPLAINT_STATUS_FILTER_OPTIONS = COMPLAINT_STATUS_ORDER.map(
  (status) => ({
    label: COMPLAINT_STATUS_META[status].label,
    value: status,
  })
)

export const COMPLAINT_PRIORITY_OPTIONS: {
  label: string
  value: Complaint.Priority
}[] = [
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]

export const COMPLAINT_SEVERITY_OPTIONS: {
  label: string
  value: Complaint.Severity
}[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
]

export const COMPLAINT_CHANNEL_OPTIONS: {
  label: string
  value: Complaint.Channel
}[] = [
  { label: 'Walk in', value: 'walk_in' },
  { label: 'Phone', value: 'phone' },
  { label: 'Email', value: 'email' },
  { label: 'Web portal', value: 'web_portal' },
  { label: 'Mobile app', value: 'mobile_app' },
  { label: 'Letter', value: 'letter' },
  { label: 'Suggestion box', value: 'suggestion_box' },
  { label: 'Other', value: 'other' },
]

export const COMPLAINT_PARTY_TYPE_OPTIONS: {
  label: string
  value: Complaint.PartyType
}[] = [
  { label: 'Student', value: 'student' },
  { label: 'Guardian', value: 'guardian' },
  { label: 'Teacher', value: 'teacher' },
  { label: 'Employee', value: 'employee' },
  { label: 'User', value: 'user' },
  { label: 'External person', value: 'external' },
]

export const COMPLAINT_PARTY_ROLE_OPTIONS: {
  label: string
  value: Complaint.PartyRole
}[] = [
  { label: 'Complainant', value: 'complainant' },
  { label: 'Subject of the complaint', value: 'subject' },
  { label: 'Witness', value: 'witness' },
  { label: 'Affected student', value: 'affected_student' },
  { label: 'Other', value: 'other' },
]

export const COMPLAINT_RESOLUTION_TYPE_OPTIONS: {
  label: string
  value: Complaint.ResolutionType
}[] = [
  { label: 'Resolved by the school', value: 'resolved_by_school' },
  { label: 'No action required', value: 'no_action_required' },
  { label: 'Referred externally', value: 'referred_externally' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'Withdrawn by the complainant', value: 'withdrawn_by_complainant' },
  { label: 'Not a complaint', value: 'not_a_complaint' },
]

export const COMPLAINT_SLA_FILTER_OPTIONS: {
  label: string
  value: 'breached' | 'due_soon' | 'on_track'
}[] = [
  { label: 'Breached', value: 'breached' },
  { label: 'Due within 4 hours', value: 'due_soon' },
  { label: 'On track', value: 'on_track' },
]

/* ------------------------------------------------------------------ *
 * Permissions (mirror of `complaint.roles.ts` of the backend)
 * ------------------------------------------------------------------ */

const READ_ROLES = ['superadmin', 'admin', 'staff']
const RESOLVE_ROLES = ['superadmin', 'admin']
const CONFIG_ROLES = ['superadmin', 'admin']

export type ComplaintPermission =
  | 'complaint.desk.view'
  | 'complaint.desk.create'
  | 'complaint.desk.comment'
  | 'complaint.desk.assign'
  | 'complaint.desk.resolve'
  | 'complaint.desk.escalate'
  | 'complaint.reports.view'
  | 'complaint.config.manage'

export const COMPLAINT_PERMISSION_ROLES: Record<ComplaintPermission, string[]> =
  {
    'complaint.desk.view': READ_ROLES,
    'complaint.desk.create': READ_ROLES,
    'complaint.desk.comment': READ_ROLES,
    'complaint.desk.assign': READ_ROLES,
    'complaint.desk.resolve': RESOLVE_ROLES,
    'complaint.desk.escalate': RESOLVE_ROLES,
    'complaint.reports.view': READ_ROLES,
    'complaint.config.manage': CONFIG_ROLES,
  }

export const hasComplaintPermission = (
  roles: string[] | undefined,
  permission: ComplaintPermission
) =>
  Boolean(
    roles?.some((role) => COMPLAINT_PERMISSION_ROLES[permission].includes(role))
  )

export const hasAnyComplaintPermission = (
  roles: string[] | undefined,
  permissions: ComplaintPermission[]
) => permissions.some((permission) => hasComplaintPermission(roles, permission))

export const canViewComplaintModule = (roles: string[] | undefined) =>
  hasComplaintPermission(roles, 'complaint.desk.view')

export const isComplaintPermission = (permission: string) =>
  permission.startsWith('complaint.')

/* ------------------------------------------------------------------ *
 * SLA and formatting
 * ------------------------------------------------------------------ */

export type TSlaState = 'breached' | 'due_soon' | 'on_track' | 'met' | 'none'

/**
 * Badge state of a row. The backend flag wins (it is the historical fact), the
 * live deadline only refines the rows that are not breached yet.
 */
export const slaStateOf = (
  row: Pick<
    Complaint.IListRow,
    | 'status'
    | 'is_sla_breached'
    | 'first_response_at'
    | 'response_due_at'
    | 'resolution_due_at'
  >
): TSlaState => {
  if (['closed', 'resolved', 'rejected', 'withdrawn'].includes(row.status)) {
    return row.is_sla_breached ? 'breached' : 'met'
  }

  if (row.is_sla_breached) {
    return 'breached'
  }

  const due =
    !row.first_response_at && row.response_due_at
      ? moment(row.response_due_at)
      : row.resolution_due_at
      ? moment(row.resolution_due_at)
      : null

  if (!due) {
    return 'none'
  }

  if (due.isBefore(moment())) {
    return 'breached'
  }

  return due.diff(moment(), 'hours') <= 4 ? 'due_soon' : 'on_track'
}

export const formatComplaintDate = (
  value?: string | null,
  format = 'DD MMM YYYY'
) => (value && moment(value).isValid() ? moment(value).format(format) : '—')

export const formatComplaintDateTime = (value?: string | null) =>
  formatComplaintDate(value, 'DD MMM YYYY, HH:mm')

export const fromNow = (value?: string | null) =>
  value && moment(value).isValid() ? moment(value).fromNow() : '—'

export const formatSlaMinutes = (minutes?: number | null) => {
  if (minutes === null || minutes === undefined) {
    return '—'
  }

  if (minutes < 60) {
    return `${minutes} min`
  }

  if (minutes % 60 === 0 && minutes < 1440) {
    return `${minutes / 60} h`
  }

  if (minutes % 1440 === 0) {
    return `${minutes / 1440} d`
  }

  return `${Math.round((minutes / 60) * 10) / 10} h`
}

export const complaintInitials = (name?: string | null) =>
  (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '—'
