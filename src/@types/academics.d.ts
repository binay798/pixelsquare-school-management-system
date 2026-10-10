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
}
