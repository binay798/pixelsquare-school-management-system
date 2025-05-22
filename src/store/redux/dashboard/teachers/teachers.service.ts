import { api } from '@src/helpers/api.helpers'

export const getTeacherList = async (
  page = import.meta.env.VITE_DEFAULT_PAGE,
  limit = import.meta.env.VITE_DEFAULT_PAGE_LIMIT
) => {
  const res = await api<Api.Base<Teachers.ITeacherList>>('get')('teachers', {
    page,
    limit,
  })

  return res.data.data
}
