import { api } from '@src/helpers/api.helpers'

export const createDesignation = async (data: { designation: string }) => {
  const res = await api<Api.Base<object>>('post')(
    'human-resources/designations',
    undefined,
    {
      designation: data.designation,
    }
  )

  return res.data.data
}

export const listDesignations = async (page?: number, limit?: number) => {
  const res = await api<Api.Base<Api.IDesignationList>>('get')(
    'human-resources/designations',
    { page, limit }
  )

  return res.data.data
}
