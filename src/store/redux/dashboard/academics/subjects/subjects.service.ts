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

export const subjectServices = {
  createSubjectService,
  getSubjectListService,
  updateSubjectService,
}
