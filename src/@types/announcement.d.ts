declare namespace Announcement {
  type Status = 'draft' | 'scheduled' | 'published' | 'archived'

  type Category =
    | 'general'
    | 'academic'
    | 'examination'
    | 'event'
    | 'holiday'
    | 'fee'
    | 'transport'
    | 'sports'
    | 'emergency'
    | 'other'

  type Priority = 'low' | 'normal' | 'high' | 'urgent'

  type AudienceType =
    | 'school'
    | 'role'
    | 'class'
    | 'section'
    | 'student'
    | 'teacher'
    | 'user'

  /** Receipt filters of the recipients report (`GET :id/recipients`). */
  type ReadState = 'read' | 'unread' | 'acknowledged' | 'pending'

  interface IPerson {
    id: number | null
    firstname: string | null
    middlename: string | null
    lastname: string | null
  }

  interface IAnnouncement {
    id: number
    created_at: string
    updated_at: string
    school_id: number
    academic_year_id: number
    created_by_user_id: number | null
    published_by_user_id: number | null
    title: string
    summary: string | null
    content: string
    category: Category
    priority: Priority
    status: Status
    audience_type: AudienceType
    is_pinned: boolean
    require_acknowledgement: boolean
    publish_at: string | null
    published_at: string | null
    expires_at: string | null
    archived_at: string | null
    external_url: string | null
    attachment_asset_id: number | null
  }

  /** One recipient group of the announcement, resolved by the API. */
  interface ITarget {
    id: number
    target_type: AudienceType
    role: string | null
    class_id: number | null
    class_name: string | null
    class_section_id: number | null
    class_section_name: string | null
    student_id: number | null
    teacher_id: number | null
    user_id: number | null
    label: string | null
  }

  interface IReceipt {
    is_read: boolean
    read_at: string | null
    acknowledged_at: string | null
  }

  interface IListRow {
    total_count: string
    announcement_details: IAnnouncement
    creator_details: IPerson | null
    publisher_details: IPerson | null
    targets_details: ITarget[]
    read_count: string
    acknowledgement_count: string
  }

  type IList = Api.PaginatedData<IListRow>

  interface IFeedRow {
    total_count: string
    announcement_details: IAnnouncement
    creator_details: IPerson | null
    targets_details: ITarget[]
  }

  type IFeedRowWithReceipt = IFeedRow & IReceipt

  type IFeed = Api.PaginatedData<IFeedRowWithReceipt>

  interface IDetail extends IReceipt {
    announcement_details: IAnnouncement
    creator_details: IPerson | null
    publisher_details: IPerson | null
    targets_details: ITarget[]
    read_count: string
    acknowledgement_count: string
  }

  interface IStats {
    total: string
    draft: string
    scheduled: string
    published: string
    expired: string
    archived: string
    total_reads: string
    total_acknowledgements: string
  }

  interface IAnalytics {
    announcement_id: number
    require_acknowledgement: boolean
    recipient_count: number
    read_count: number
    unread_count: number
    acknowledgement_count: number
    pending_acknowledgement_count: number
    read_percentage: number
    acknowledgement_percentage: number
  }

  interface IRecipientRow {
    total_count: string
    user_id: number
    user_profile_details: IPerson | null
    email: string
    is_read: boolean
    read_at: string | null
    acknowledged_at: string | null
  }

  type IRecipientList = Api.PaginatedData<IRecipientRow>

  interface IUnreadSummary {
    unread_count: number
    pending_acknowledgement_count: number
  }

  /** Payload of the audience selector, mirrors `ANNOUNCEMENT_AUDIENCE_SCHEMA`. */
  interface IAudience {
    type: AudienceType
    roles?: string[]
    class_ids?: number[]
    class_section_ids?: number[]
    student_ids?: number[]
    teacher_ids?: number[]
    user_ids?: number[]
  }

  interface IReceiptResult {
    receipt: IReceipt
  }
}
