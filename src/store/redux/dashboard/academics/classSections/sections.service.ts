import { api } from '@src/helpers/api.helpers'

export const createClassSectionService = async (
  classId: number,
  name: string
) => {
  const res = await api<Api.Base<object>>('post')(
    `academics/classes/${classId}/sections`,
    undefined,
    { name }
  )

  return res.data.data
}
export const updateSectionService = async (
  classId: number,
  sectionId: number,
  name: string
) => {
  const res = await api<Api.Base<object>>('patch')(
    `academics/classes/${classId}/sections/${sectionId}`,
    undefined,
    { name }
  )

  return res.data.data
}
export const getClassSectionList = async (classId: number) => {
  const res = await api<Api.Base<Academics.IClassSectionList[]>>('get')(
    `academics/classes/${classId}/sections`
  )

  return res.data.data
}
