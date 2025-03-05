import { api } from '@src/helpers/api.helpers'

export const getSchoolDetails = async () => {
  const res = await api<Api.Base<Api.ISchool>>('get')('schools/get-details')

  return res.data.data
}

export const updateSchoolDetails = async (body: Partial<Api.ISchool>) => {
  const res = await api<Api.Base<object>>('patch')(
    'schools/update-details',
    undefined,
    body
  )

  return res.data.data
}
