import { api } from '@src/helpers/api.helpers'

// MARK: - DTOs
export interface ICreateAnnouncementDto {
  title: string
  summary?: string
  content: string
  category?: Announcement.Category
  priority?: Announcement.Priority
  /** initial state of the notice: draft by default, `scheduled` requires `publish_at` */
  status?: Exclude<Announcement.Status, 'archived'>
  audience: Announcement.IAudience
  is_pinned?: boolean
  require_acknowledgement?: boolean
  publish_at?: string
  expires_at?: string
  external_url?: string
  attachment_asset_id?: number
}

export type IUpdateAnnouncementDto = Partial<
  Omit<ICreateAnnouncementDto, 'status'>
>

export interface IUpdateAnnouncementStatusDto {
  status: Announcement.Status
  /** only used together with the `scheduled` status */
  publish_at?: string
}

export interface IAnnouncementFilters {
  status?: Announcement.Status | ''
  category?: Announcement.Category | ''
  priority?: Announcement.Priority | ''
  audienceType?: Announcement.AudienceType | ''
  fromDate?: string
  toDate?: string
  search?: string
}

export interface IAnnouncementFeedFilters {
  category?: Announcement.Category | ''
  priority?: Announcement.Priority | ''
  unreadOnly?: boolean
  requireAcknowledgementOnly?: boolean
  search?: string
}

export interface IAnnouncementRecipientFilters {
  readState?: Announcement.ReadState | ''
  search?: string
}

type TQueryParams = { [key: string]: number | string }

const buildListFilterParams = (filters?: IAnnouncementFilters) => {
  const params: TQueryParams = {}

  if (filters?.status) {
    params.status = filters.status
  }
  if (filters?.category) {
    params.category = filters.category
  }
  if (filters?.priority) {
    params.priority = filters.priority
  }
  if (filters?.audienceType) {
    params.audienceType = filters.audienceType
  }
  if (filters?.fromDate) {
    params.fromDate = filters.fromDate
  }
  if (filters?.toDate) {
    params.toDate = filters.toDate
  }
  if (filters?.search) {
    params.search = filters.search
  }

  return params
}

// MARK: - ANNOUNCEMENT BOARD
const getAnnouncementListService = async (
  filters?: IAnnouncementFilters,
  page = 1,
  limit = 10
) => {
  const res = await api<Api.Base<Announcement.IList>>('get')('announcements', {
    ...buildListFilterParams(filters),
    page,
    limit,
  })

  return res.data.data.data
}

const getAnnouncementStatsService = async () => {
  const res = await api<Api.Base<{ stats: Announcement.IStats }>>('get')(
    'announcements/stats'
  )

  return res.data.data.data.stats
}

const getAnnouncementDetailService = async (announcementId: number) => {
  const res = await api<Api.Base<Announcement.IDetail>>('get')(
    `announcements/${announcementId}`
  )

  return res.data.data.data
}

const createAnnouncementService = async (data: ICreateAnnouncementDto) => {
  const res = await api<Api.Base<{ id: number }>>('post')(
    'announcements',
    undefined,
    data
  )

  return res.data.data.data
}

const updateAnnouncementService = async (
  announcementId: number,
  data: IUpdateAnnouncementDto
) => {
  const res = await api<Api.Base<{ id: number }>>('patch')(
    `announcements/${announcementId}`,
    undefined,
    data
  )

  return res.data.data.data
}

const updateAnnouncementStatusService = async (
  announcementId: number,
  data: IUpdateAnnouncementStatusDto
) => {
  const res = await api<Api.Base<{ id: number; status: Announcement.Status }>>(
    'patch'
  )(`announcements/${announcementId}/status`, undefined, data)

  return res.data.data.data
}

const deleteAnnouncementService = async (announcementId: number) => {
  const res = await api<Api.Base<{ id: number }>>('delete')(
    `announcements/${announcementId}`
  )

  return res.data.data.data
}

const getAnnouncementAnalyticsService = async (announcementId: number) => {
  const res = await api<Api.Base<Announcement.IAnalytics>>('get')(
    `announcements/${announcementId}/analytics`
  )

  return res.data.data.data
}

const getAnnouncementRecipientsService = async (
  announcementId: number,
  filters?: IAnnouncementRecipientFilters,
  page = 1,
  limit = 20
) => {
  const params: TQueryParams = { page, limit }

  if (filters?.readState) {
    params.readState = filters.readState
  }
  if (filters?.search) {
    params.search = filters.search
  }

  const res = await api<Api.Base<Announcement.IRecipientList>>('get')(
    `announcements/${announcementId}/recipients`,
    params
  )

  return res.data.data.data
}

// MARK: - READER BOARD
const getAnnouncementFeedService = async (
  filters?: IAnnouncementFeedFilters,
  page = 1,
  limit = 10
) => {
  const params: TQueryParams = { page, limit }

  if (filters?.category) {
    params.category = filters.category
  }
  if (filters?.priority) {
    params.priority = filters.priority
  }
  if (filters?.unreadOnly) {
    params.unreadOnly = 'true'
  }
  if (filters?.requireAcknowledgementOnly) {
    params.requireAcknowledgementOnly = 'true'
  }
  if (filters?.search) {
    params.search = filters.search
  }

  const res = await api<Api.Base<Announcement.IFeed>>('get')(
    'announcements/feed',
    params
  )

  return res.data.data.data
}

const getAnnouncementUnreadSummaryService = async () => {
  const res = await api<Api.Base<Announcement.IUnreadSummary>>('get')(
    'announcements/unread-summary'
  )

  return res.data.data.data
}

const markAnnouncementReadService = async (announcementId: number) => {
  const res = await api<Api.Base<Announcement.IReceiptResult>>('post')(
    `announcements/${announcementId}/read`
  )

  return res.data.data.data
}

const acknowledgeAnnouncementService = async (announcementId: number) => {
  const res = await api<Api.Base<Announcement.IReceiptResult>>('post')(
    `announcements/${announcementId}/acknowledge`
  )

  return res.data.data.data
}

export const announcementServices = {
  getAnnouncementListService,
  getAnnouncementStatsService,
  getAnnouncementDetailService,
  createAnnouncementService,
  updateAnnouncementService,
  updateAnnouncementStatusService,
  deleteAnnouncementService,
  getAnnouncementAnalyticsService,
  getAnnouncementRecipientsService,
  getAnnouncementFeedService,
  getAnnouncementUnreadSummaryService,
  markAnnouncementReadService,
  acknowledgeAnnouncementService,
}
