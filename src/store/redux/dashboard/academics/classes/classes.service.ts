import { api } from '@src/helpers/api.helpers'

export const createClassService = async (data: {
  name: string
  numeric_name: string
}) => {
  const res = await api<Api.Base<object>>('post')(
    'academics/classes',
    undefined,
    data
  )

  return res.data.data
}

export const getClassList = async () => {
  const res = await api<Api.Base<Api.IClassList>>('get')('academics/classes', {
    page: 1,
    limit: 1000,
  })

  return res.data.data
}

export const editClassService = async (
  classId: number,
  data: { name: string; numeric_name: string }
) => {
  const res = await api<Api.Base<object>>('patch')(
    `academics/classes/${classId}`,
    undefined,
    data
  )

  return res.data.data
}
