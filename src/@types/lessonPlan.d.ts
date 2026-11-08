declare namespace LessonPlan {
  type Status = 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed'

  type PlanType = 'daily' | 'weekly'

  interface IPerson {
    id: number | null
    firstname: string | null
    middlename: string | null
    lastname: string | null
  }

  interface IPlan {
    id: number
    created_at: string
    updated_at: string
    school_id: number
    academic_year_id: number
    class_id: number
    class_section_id: number
    subject_id: number
    teacher_id: number | null
    class_routine_id: number | null
    template_id: number | null
    reviewed_by_user_id: number | null
    plan_type: PlanType
    plan_date: string
    week_start_date: string | null
    title: string | null
    objectives: string | null
    methodology: string | null
    resources: string | null
    assessment: string | null
    homework: string | null
    teacher_reflection: string | null
    status: Status
    review_comment: string | null
    reviewed_at: string | null
    completed_at: string | null
    is_published: boolean
  }

  interface ITopicSummary {
    id: number
    name: string
    chapter_id: number
    chapter_name: string
    chapter_number: number
    sequence_order: number | null
    estimated_periods: number | null
  }

  interface IResource {
    id: number
    asset_id: number | null
    label: string | null
    file_type: string | null
    path: string | null
    external_url: string | null
  }

  interface IListRow {
    total_count: string
    lesson_plan_details: IPlan
    subject_details: { id: number; name: string }
    class_details: { id: number; name: string; numeric_name?: string }
    class_section_details: { id: number; name: string }
    teacher_details: IPerson | null
    topics_details: ITopicSummary[]
    resource_count: string
  }

  type IList = Api.PaginatedData<IListRow>

  interface IDetail {
    lesson_plan_details: IPlan
    subject_details: { id: number; name: string }
    class_details: { id: number; name: string; numeric_name?: string }
    class_section_details: { id: number; name: string }
    teacher_details: IPerson | null
    reviewer_details: IPerson | null
    topics_details: ITopicSummary[]
    resources_details: IResource[]
  }

  interface IWeeklySlot {
    class_routine_details: {
      id: number
      class_id: number
      class_section_id: number
      subject_id: number
      teacher_id: number | null
    }
    time_slot_details: {
      id: number
      name: string
      start_time: string
      end_time: string
      slot_type: string
      sequence_order: number
    }
    subject_details: { id: number; name: string }
    class_details: { id: number; name: string; numeric_name?: string }
    class_section_details: { id: number; name: string }
    lesson_plan_details: IPlan | null
    additional_plan_count: number
  }

  interface IWeeklyDay {
    date: string
    working_day: { id: number; name: string; sequence_order: number }
    slots: IWeeklySlot[]
  }

  interface IWeeklyGrid {
    week_start_date: string
    week_end_date: string
    days: IWeeklyDay[]
    unscheduled_plans: IPlan[]
  }

  interface ISyllabusChapter {
    chapter_id: number
    chapter_name: string
    chapter_number: number
    total_topics: number
    taught_topics: number
    completion_percentage: number
  }

  interface ISyllabusCompletion {
    class_section_id: number
    subject_id: number
    total_topics: number
    taught_topics: number
    pending_topics: number
    completion_percentage: number
    chapters: ISyllabusChapter[]
  }

  interface ITemplateField {
    key: string
    label: string
    required?: boolean
    placeholder?: string
  }

  interface ITemplate {
    id: number
    created_at: string
    updated_at: string
    name: string
    description: string | null
    is_default: boolean
    is_active: boolean
    fields: ITemplateField[]
    default_objectives: string | null
    default_methodology: string | null
    default_assessment: string | null
    school_id: number
    academic_year_id: number
  }
}
