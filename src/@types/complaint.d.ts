declare namespace Complaint {
  type Status =
    | 'new'
    | 'acknowledged'
    | 'in_progress'
    | 'pending_info'
    | 'escalated'
    | 'resolved'
    | 'closed'
    | 'reopened'
    | 'rejected'
    | 'withdrawn'

  type Priority = 'low' | 'normal' | 'high' | 'urgent'
  type Severity = 'low' | 'medium' | 'high' | 'critical'

  type Channel =
    | 'walk_in'
    | 'phone'
    | 'email'
    | 'web_portal'
    | 'mobile_app'
    | 'letter'
    | 'suggestion_box'
    | 'other'

  type PartyType =
    | 'student'
    | 'guardian'
    | 'teacher'
    | 'employee'
    | 'user'
    | 'external'

  type PartyRole =
    | 'complainant'
    | 'subject'
    | 'witness'
    | 'affected_student'
    | 'other'

  type CommentType =
    | 'note'
    | 'reply'
    | 'status_change'
    | 'assignment'
    | 'escalation'
    | 'resolution'
    | 'system'

  type Visibility = 'internal' | 'shared'

  type ResolutionType =
    | 'resolved_by_school'
    | 'no_action_required'
    | 'referred_externally'
    | 'duplicate'
    | 'withdrawn_by_complainant'
    | 'not_a_complaint'

  /** One row of the desk list (flat projection of the backend query). */
  interface IListRow {
    total_count: string
    id: number
    complaint_no: string
    title: string
    status: Status
    priority: Priority
    severity: Severity
    channel: Channel
    is_anonymous: boolean
    is_confidential: boolean
    is_sla_breached: boolean
    escalation_level: number
    complainant_name: string | null
    complainant_phone: string | null
    created_at: string
    updated_at: string
    last_activity_at: string
    assigned_to_user_id: number | null
    assigned_department_id: number | null
    response_due_at: string | null
    resolution_due_at: string | null
    first_response_at: string | null
    resolved_at: string | null
    closed_at: string | null
    reopened_at: string | null
    category_id: number
    category_name: string
    category_code: string
    assignee_name: string | null
    created_by_name: string | null
    department_name: string | null
    merged_into_no: string | null
  }

  type IList = Api.PaginatedData<IListRow>

  /** Detail header: the row plus the resolution and merge columns. */
  interface IComplaint {
    id: number
    school_id: number
    academic_year_id: number | null
    complaint_no: string
    title: string
    description: string
    category_id: number
    category_name: string | null
    category_code: string | null
    status: Status
    priority: Priority
    severity: Severity
    channel: Channel
    is_anonymous: boolean
    is_confidential: boolean
    complainant_user_id: number | null
    complainant_name: string | null
    complainant_phone: string | null
    complainant_email: string | null
    created_by_user_id: number | null
    created_by_name: string | null
    assigned_to_user_id: number | null
    assignee_name: string | null
    assignee_email: string | null
    assigned_department_id: number | null
    department_name: string | null
    assigned_at: string | null
    sla_policy_id: number | null
    response_due_at: string | null
    resolution_due_at: string | null
    first_response_at: string | null
    acknowledged_at: string | null
    resolved_at: string | null
    closed_at: string | null
    reopened_at: string | null
    escalation_level: number
    escalated_at: string | null
    is_sla_breached: boolean
    resolution_type: ResolutionType | null
    resolution_summary: string | null
    resolved_by_name: string | null
    closed_by_name: string | null
    reopen_count: number
    merged_into_complaint_id: number | null
    merged_into_no: string | null
    merged_into_title: string | null
    satisfaction_rating: number | null
    satisfaction_comment: string | null
    last_activity_at: string
    created_at: string
    updated_at: string
    comment_count: string
    attachment_count: string
    escalation_count: string
  }

  interface IParty {
    id: number
    party_type: PartyType
    party_role: PartyRole
    is_primary: boolean
    user_id: number | null
    student_id: number | null
    guardian_id: number | null
    teacher_id: number | null
    employee_id: number | null
    external_name: string | null
    external_phone: string | null
    external_email: string | null
    notes: string | null
    display_name: string | null
  }

  interface IComment {
    id: number
    complaint_id: number
    author_user_id: number | null
    author_name: string | null
    author_email: string | null
    comment_type: CommentType
    visibility: Visibility
    body: string
    is_edited: boolean
    edited_at: string | null
    deleted_at: string | null
    created_at: string
  }

  interface IAttachment {
    id: number
    complaint_id: number
    comment_id: number | null
    asset_id: number | null
    asset_path: string | null
    label: string | null
    file_type: string | null
    external_url: string | null
    uploaded_by_user_id: number | null
    uploaded_by_name: string | null
    created_at: string
  }

  interface IEscalation {
    id: number
    complaint_id: number
    level: number
    from_user_id: number | null
    from_user_name: string | null
    to_user_id: number | null
    to_user_name: string | null
    to_department_id: number | null
    to_department_name: string | null
    rule: string
    reason: string | null
    triggered_by_user_id: number | null
    triggered_by_name: string | null
    acknowledged_at: string | null
    created_at: string
  }

  interface IActivity {
    id: number
    complaint_id: number
    actor_user_id: number | null
    actor_name: string | null
    action: string
    from_value: string | null
    to_value: string | null
    details: Record<string, unknown> | null
    ip_address: string | null
    created_at: string
  }

  interface IDetail {
    complaint_details: IComplaint
    parties: IParty[]
    comments: IComment[]
    attachments: IAttachment[]
    escalations: IEscalation[]
    activity: IActivity[]
  }

  interface IStats {
    total: string | number
    open: string | number
    unassigned: string | number
    overdue: string | number
    escalated: string | number
    breached: string | number
    resolved_today: string | number
    resolved_this_month: string | number
    avg_first_response_hours: string | number | null
    avg_resolution_hours: string | number | null
    sla_compliance_pct: string | number | null
    by_status: { status: Status; count: string }[]
    by_priority: { priority: Priority; count: string }[]
    by_severity: { severity: Severity; count: string }[]
    by_category: { category: string; count: string }[]
  }

  interface ICategory {
    id: number
    name: string
    code: string
    description: string | null
    default_priority: Priority
    default_severity: Severity
    is_active: boolean
    sort_order: number
    usage_count: number
  }

  interface ISlaPolicy {
    id: number
    category_id: number | null
    category_name: string | null
    category_code: string | null
    severity: Severity | null
    first_response_minutes: number
    resolution_minutes: number
    level_1_after_minutes: number | null
    level_2_after_minutes: number | null
    level_3_after_minutes: number | null
    business_hours_only: boolean
    effective_from: string | null
    effective_until: string | null
    is_active: boolean
  }

  interface ISweepResult {
    scanned: number
    breached: number
    escalated: number
    autoClosed: number
  }

  /** Staff member of the assignment picker. */
  interface IAssignee {
    id: number
    email: string
    full_name: string
    role: string
  }

  /** Intake payload, mirrors `CREATE_COMPLAINT_SCHEMA` of the backend. */
  interface ICreateDto {
    title: string
    description: string
    category_id: number
    priority?: Priority
    severity?: Severity
    channel?: Channel
    is_anonymous?: boolean
    is_confidential?: boolean
    assigned_to_user_id?: number | null
    assigned_department_id?: number | null
    complainant_user_id?: number | null
    complainant_name?: string | null
    complainant_phone?: string | null
    complainant_email?: string | null
    parties?: IPartyDto[]
  }

  interface IPartyDto {
    party_type: PartyType
    party_role?: PartyRole
    user_id?: number
    student_id?: number
    guardian_id?: number
    teacher_id?: number
    employee_id?: number
    external_name?: string
    external_phone?: string
    external_email?: string
    is_primary?: boolean
    notes?: string
  }

  interface IChangeStatusDto {
    status: Status
    reason?: string
    resolution_type?: ResolutionType
    resolution_summary?: string
  }
}
