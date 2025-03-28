import { api } from '@src/helpers/api.helpers'

export const createStudentType = async (data: { name: string }) => {
  const res = await api<Api.Base<object>>('post')(
    'students/types',
    undefined,
    data
  )
  return res.data.data
}

export const getStudentTypeList = async (page?: number, limit?: number) => {
  const res = await api<Api.Base<Api.IStudentTypeList>>('get')(
    'students/types',
    { page, limit }
  )

  return res.data.data
}

export const editStudentType = async (
  studentTypeId: number,
  data: { studentType: string }
) => {
  const res = await api<Api.Base<object>>('patch')(
    `students/types/${studentTypeId}`,
    undefined,
    data
  )
  return res.data.data
}
