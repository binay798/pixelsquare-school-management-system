import { api } from '@src/helpers/api.helpers'

export interface TCreateSubject {
  name: string
  author?: string
  type: string
  teacherIds: number[]
}

const createSubjectService = async (classId: number, data: TCreateSubject) => {
  const res = await api<Api.Base<object>>('post')(
    `academics/classes/${classId}/subjects`,
    undefined,
    data
  )

  return res.data.data
}

const getSubjectListService = async (
  classId: number,
  page = import.meta.env.VITE_DEFAULT_PAGE,
  limit = import.meta.env.VITE_DEFAULT_PAGE_LIMIT
) => {
  const res = await api<Api.Base<Academics.ISubjectList[]>>('get')(
    `academics/classes/${classId}/subjects`,
    {
      page,
      limit,
    }
  )

  return res.data.data
}

const updateSubjectService = async (
  subjectId: number,
  classId: number,
  data: Partial<TCreateSubject>
) => {
  const res = await api<Api.Base<object>>('patch')(
    `academics/classes/${classId}/subjects/${subjectId}`,
    undefined,
    data
  )

  return res.data.data
}

const getSubjectDetail = async (classId: number, subjectId: number) => {
  const res = await api<Api.Base<Academics.ISubjectDetail>>('get')(
    `academics/classes/${classId}/subjects/${subjectId}`
  )

  return res.data.data
}

// CHAPTER SERVICE
export interface CreateChapterDto
  extends Omit<Academics.IChapter, 'id' | 'created_at' | 'updated_at'> {}
const createChapter = async (
  classId: number,
  subjectId: number,
  data: CreateChapterDto
) => {
  const res = await api<Api.Base<object>>('post')(
    `academics/classes/${classId}/subjects/${subjectId}/chapters`,
    undefined,
    data
  )

  return res.data.data
}

const getChapterList = async (
  classId: number,
  subjectId: number,
  page = 1,
  limit = 5,
  search?: string
) => {
  const res = await api<Api.Base<Academics.IChapterList>>('get')(
    `academics/classes/${classId}/subjects/${subjectId}/chapters`,
    { page, limit, search }
  )

  return res.data.data
}

export interface UpdateChapterDto extends Partial<CreateChapterDto> {}
const updateChapter = async (
  classId: number,
  subjectId: number,
  chapterId: number,
  data: UpdateChapterDto
) => {
  const res = await api<Api.Base<object>>('patch')(
    `academics/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}`,
    undefined,
    data
  )

  return res.data.data
}

const deleteChapter = async (
  classId: number,
  subjectId: number,
  chapterId: number
) => {
  const res = await api<Api.Base<object>>('delete')(
    `academics/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}`
  )

  return res.data.data
}

export const subjectServices = {
  createSubjectService,
  getSubjectDetail,
  getSubjectListService,
  updateSubjectService,
  getChapterList,
  createChapter,
  updateChapter,
  deleteChapter,
}
