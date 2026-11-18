import { api } from '@src/helpers/api.helpers'

// MARK: - DTOs
export interface IComplaintFilters {
  status?: Complaint.Status | ''
  categoryId?: number | ''
  priority?: Complaint.Priority | ''
  severity?: Complaint.Severity | ''
  assignedToUserId?: number | ''
  assignedDepartmentId?: number | ''
  channel?: Complaint.Channel | ''
  sla?: 'breached' | 'due_soon' | 'on_track' | ''
  unassigned?: boolean
  confidential?: boolean
  academicYearId?: number | ''
  fromDate?: string
  toDate?: string
  search?: string
  includeClosed?: boolean
  sort?: 'created_at' | 'last_activity_at' | 'resolution_due_at' | 'priority'
}

type QueryParams = { [key: string]: number | string }

/** Only the values that are actually set reach the query string. */
const buildFilterParams = (filters?: IComplaintFilters): QueryParams => {
  const params: QueryParams = {}

  if (!filters) {
    return params
  }

  if (filters.status) params.status = filters.status
  if (filters.categoryId) params.categoryId = filters.categoryId
  if (filters.priority) params.priority = filters.priority
  if (filters.severity) params.severity = filters.severity
  if (filters.assignedToUserId)
    params.assignedToUserId = filters.assignedToUserId
  if (filters.assignedDepartmentId)
    params.assignedDepartmentId = filters.assignedDepartmentId
  if (filters.channel) params.channel = filters.channel
  if (filters.sla) params.sla = filters.sla
  if (filters.unassigned) params.unassigned = 'true'
  if (filters.confidential) params.confidential = 'true'
  if (filters.academicYearId) params.academicYearId = filters.academicYearId
  if (filters.fromDate) params.fromDate = filters.fromDate
  if (filters.toDate) params.toDate = filters.toDate
  if (filters.search) params.search = filters.search
  if (filters.includeClosed) params.includeClosed = 'true'
  if (filters.sort) params.sort = filters.sort

  return params
}

const unwrap = <T>(res: { data: Api.Base<T> }) => res.data.data.data

/* ------------------------------------------------------------------ *
 * Desk
 * ------------------------------------------------------------------ */

const getComplaintListService = async (
  filters?: IComplaintFilters,
  page = 1,
  limit = 10
) =>
  unwrap(
    await api<Api.Base<Complaint.IList>>('get')('complaints', {
      ...buildFilterParams(filters),
      page,
      limit,
    })
  )

const getComplaintStatsService = async () =>
  unwrap(
    await api<Api.Base<{ stats: Complaint.IStats }>>('get')('complaints/stats')
  ).stats

const getComplaintDetailService = async (complaintId: number) =>
  unwrap(
    await api<Api.Base<Complaint.IDetail>>('get')(`complaints/${complaintId}`)
  )

const getNextComplaintNumberService = async () =>
  unwrap(
    await api<Api.Base<{ complaint_no: string; sequence: number }>>('get')(
      'complaints/next-number'
    )
  )

const getComplaintAssigneesService = async () =>
  unwrap(
    await api<Api.Base<{ assignees: Complaint.IAssignee[] }>>('get')(
      'complaints/assignees'
    )
  ).assignees

const createComplaintService = async (data: Complaint.ICreateDto) =>
  unwrap(
    await api<Api.Base<Complaint.IDetail>>('post')(
      'complaints',
      undefined,
      data
    )
  )

const updateComplaintService = async (
  complaintId: number,
  data: Partial<Complaint.ICreateDto>
) =>
  unwrap(
    await api<Api.Base<{ complaint: Complaint.IComplaint }>>('patch')(
      `complaints/${complaintId}`,
      undefined,
      data
    )
  )

const changeComplaintStatusService = async (
  complaintId: number,
  data: Complaint.IChangeStatusDto
) =>
  unwrap(
    await api<Api.Base<{ complaint: Complaint.IComplaint }>>('patch')(
      `complaints/${complaintId}/status`,
      undefined,
      data
    )
  )

const assignComplaintService = async (
  complaintId: number,
  data: {
    assigned_to_user_id?: number | null
    assigned_department_id?: number | null
    reason?: string
    acknowledge?: boolean
  }
) =>
  unwrap(
    await api<Api.Base<{ complaint: Complaint.IComplaint }>>('patch')(
      `complaints/${complaintId}/assign`,
      undefined,
      data
    )
  )

const reopenComplaintService = async (complaintId: number, reason: string) =>
  unwrap(
    await api<Api.Base<{ complaint: Complaint.IComplaint }>>('post')(
      `complaints/${complaintId}/reopen`,
      undefined,
      { reason }
    )
  )

const escalateComplaintService = async (
  complaintId: number,
  data: {
    level?: number
    to_user_id?: number | null
    to_department_id?: number | null
    reason: string
  }
) =>
  unwrap(
    await api<Api.Base<{ complaint: Complaint.IComplaint }>>('post')(
      `complaints/${complaintId}/escalate`,
      undefined,
      data
    )
  )

const addComplaintCommentService = async (
  complaintId: number,
  data: {
    body: string
    comment_type?: Complaint.CommentType
    visibility?: Complaint.Visibility
  }
) =>
  unwrap(
    await api<Api.Base<{ comment: Complaint.IComment }>>('post')(
      `complaints/${complaintId}/comments`,
      undefined,
      data
    )
  )

const deleteComplaintCommentService = async (
  complaintId: number,
  commentId: number
) =>
  unwrap(
    await api<Api.Base<{ id: number; deleted: boolean }>>('delete')(
      `complaints/${complaintId}/comments/${commentId}`
    )
  )

const addComplaintPartyService = async (
  complaintId: number,
  data: Complaint.IPartyDto
) =>
  unwrap(
    await api<Api.Base<{ party: Complaint.IParty }>>('post')(
      `complaints/${complaintId}/parties`,
      undefined,
      data
    )
  )

const removeComplaintPartyService = async (
  complaintId: number,
  partyId: number
) =>
  unwrap(
    await api<Api.Base<{ id: number; deleted: boolean }>>('delete')(
      `complaints/${complaintId}/parties/${partyId}`
    )
  )

const addComplaintAttachmentService = async (
  complaintId: number,
  data: {
    external_url?: string
    label?: string
    file_type?: string
    asset_id?: number
  }
) =>
  unwrap(
    await api<Api.Base<{ attachment: Complaint.IAttachment }>>('post')(
      `complaints/${complaintId}/attachments`,
      undefined,
      data
    )
  )

const removeComplaintAttachmentService = async (
  complaintId: number,
  attachmentId: number
) =>
  unwrap(
    await api<Api.Base<{ id: number; deleted: boolean }>>('delete')(
      `complaints/${complaintId}/attachments/${attachmentId}`
    )
  )

/* ------------------------------------------------------------------ *
 * Configuration and automation
 * ------------------------------------------------------------------ */

const getComplaintCategoriesService = async (includeInactive = true) =>
  unwrap(
    await api<Api.Base<{ categories: Complaint.ICategory[] }>>('get')(
      'complaints/categories',
      includeInactive ? { includeInactive: 'true' } : undefined
    )
  ).categories

type CategoryPayload = {
  name: string
  code: string
  description?: string | null
  default_priority?: Complaint.Priority
  default_severity?: Complaint.Severity
  sort_order?: number
  is_active?: boolean
}

const createComplaintCategoryService = async (data: CategoryPayload) =>
  unwrap(
    await api<Api.Base<{ category: Complaint.ICategory }>>('post')(
      'complaints/categories',
      undefined,
      data
    )
  )

const updateComplaintCategoryService = async (
  categoryId: number,
  data: Partial<CategoryPayload>
) =>
  unwrap(
    await api<Api.Base<{ category: Complaint.ICategory }>>('patch')(
      `complaints/categories/${categoryId}`,
      undefined,
      data
    )
  )

const deleteComplaintCategoryService = async (categoryId: number) =>
  unwrap(
    await api<Api.Base<{ id: number; deleted: boolean }>>('delete')(
      `complaints/categories/${categoryId}`
    )
  )

type SlaPolicyPayload = {
  category_id?: number | null
  severity?: Complaint.Severity | null
  first_response_minutes: number
  resolution_minutes: number
  level_1_after_minutes?: number | null
  level_2_after_minutes?: number | null
  level_3_after_minutes?: number | null
  is_active?: boolean
}

const getComplaintSlaPoliciesService = async () =>
  unwrap(
    await api<Api.Base<{ policies: Complaint.ISlaPolicy[] }>>('get')(
      'complaints/sla-policies'
    )
  ).policies

const createComplaintSlaPolicyService = async (data: SlaPolicyPayload) =>
  unwrap(
    await api<Api.Base<{ policy: Complaint.ISlaPolicy }>>('post')(
      'complaints/sla-policies',
      undefined,
      data
    )
  )

const updateComplaintSlaPolicyService = async (
  policyId: number,
  data: Partial<SlaPolicyPayload>
) =>
  unwrap(
    await api<Api.Base<{ policy: Complaint.ISlaPolicy }>>('patch')(
      `complaints/sla-policies/${policyId}`,
      undefined,
      data
    )
  )

const deleteComplaintSlaPolicyService = async (policyId: number) =>
  unwrap(
    await api<Api.Base<{ id: number; deleted: boolean }>>('delete')(
      `complaints/sla-policies/${policyId}`
    )
  )

const runComplaintSlaSweepService = async () =>
  unwrap(
    await api<Api.Base<{ result: Complaint.ISweepResult }>>('post')(
      'complaints/automation/sla-sweep'
    )
  ).result

export const complaintServices = {
  getComplaintListService,
  getComplaintStatsService,
  getComplaintDetailService,
  getNextComplaintNumberService,
  getComplaintAssigneesService,
  createComplaintService,
  updateComplaintService,
  changeComplaintStatusService,
  assignComplaintService,
  reopenComplaintService,
  escalateComplaintService,
  addComplaintCommentService,
  deleteComplaintCommentService,
  addComplaintPartyService,
  removeComplaintPartyService,
  addComplaintAttachmentService,
  removeComplaintAttachmentService,
  getComplaintCategoriesService,
  createComplaintCategoryService,
  updateComplaintCategoryService,
  deleteComplaintCategoryService,
  getComplaintSlaPoliciesService,
  createComplaintSlaPolicyService,
  updateComplaintSlaPolicyService,
  deleteComplaintSlaPolicyService,
  runComplaintSlaSweepService,
}
