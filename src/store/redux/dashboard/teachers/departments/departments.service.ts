import { api } from '@src/helpers/api.helpers'

export const createDepartment = async (data: {
  name: string
  academicYearId: number
}) => {
  const res = await api<Api.Base<object>>('post')(
    'schools/departments',
    undefined,
    data
  )

  return res.data.data
}

export const getDepartmentList = async (page?: number, limit?: number) => {
  const res = await api<Api.Base<Api.IDepartmentList>>('get')(
    'schools/departments',
    { page, limit }
  )

  return res.data.data
}
