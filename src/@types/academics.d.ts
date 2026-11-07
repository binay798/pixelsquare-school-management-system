declare namespace Academics {
  interface IClass {
    id: number
    created_at: string
    updated_at: string
    name: string
    numeric_name: string
    school_id: number
  }

  interface IClassSection {
    id: number
    created_at: string
    updated_at: string
    name: string
    class_id: number
  }

  interface IClassSectionList {
    class_details: Pick<IClass, 'id' | 'name' | 'numeric_name'>
    section_details: IClassSection
  }

  interface ISubject {
    id: number
    created_at: string
    updated_at: string
    name: string
    type: string
    author: string | null
    class_id: number
    school_id: number
    is_active: boolean
  }

  interface ISubjectDetail {
    subject_id: number
    subject_details: Pick<
      ISubject,
      'id' | 'name' | 'type' | 'author' | 'class_id'
    >
    teacher_profile_list: User.IUserProfile[]
  }

  interface ISubjectList {
    subject_id: number
    subject_details: Pick<ISubject, 'name' | 'type' | 'author' | 'class_id'>
    teacher_profile_list: {
      id: number
      firstname: string
      lastname: string
      teacher_id: number
    }[]
    class_details: { id: number; name: string }
  }

  interface IChapter {
    id: number
    created_at: string
    updated_at: string
    name: string
    description?: string
    duration: number
    deadline: string
    subject_id: number
    chapter_number: number
    difficulty_level: string
    status: string
    objectives?: string
  }

  interface IChapterList
    extends Api.PaginatedData<{
      chapter_details: IChapter
    }> {
    total: string
  }

  interface ITopic {
    id: number
    created_at: string
    updated_at: string
    name: string
    description?: string
    subject_id: number
    chapter_id: number
    sequence_order?: number
    estimated_periods?: number
  }

  interface ITopicList {
    topic_details: ITopic
  }

  interface IScheduleTemplate {
    id: number
    created_at: string
    updated_at: string
    name: string
    is_active: boolean
    school_id: number
  }

  interface IScheduleTemplateList {
    schedule_template_details: IScheduleTemplate
  }

  interface IWorkingDay {
    id: number
    created_at: string
    updated_at: string
    name: string
    sequence_order: number
    is_working_day: boolean
    school_id: number
  }

  interface IWorkingDayList {
    working_day_details: IWorkingDay
  }

  interface ITimeSlot {
    id: number
    created_at: string
    updated_at: string
    schedule_template_id: number
    working_day_id: number
    name: string
    start_time: string
    end_time: string
    slot_type: string
    sequence_order: number
    school_id: number
  }

  interface ITimeSlotList {
    time_slot_details: ITimeSlot
    schedule_template_details: Pick<IScheduleTemplate, 'id' | 'name'>
    working_day_details: Pick<IWorkingDay, 'id' | 'name'>
  }

  interface IClassRoutine {
    id: number
    working_day_id: number
    time_slot_id: number
    class_id: number
    class_section_id: number
    subject_id: number
    teacher_id: number
  }

  interface IClassRoutineList {
    class_routine_details: IClassRoutine
    user_profile_details: Pick<
      User.IUserProfile,
      'id' | 'firstname' | 'middlename' | 'lastname'
    >
    subject_details: Pick<ISubject, 'id' | 'name'>
    class_section_details: Pick<IClassSection, 'id' | 'name'>
    working_day_details: Pick<IWorkingDay, 'id' | 'name' | 'sequence_order'>
    time_slot_details: Pick<
      ITimeSlot,
      'id' | 'name' | 'start_time' | 'end_time' | 'slot_type' | 'sequence_order'
    >
    schedule_template_details: Pick<IScheduleTemplate, 'id' | 'name'>
  }
}
