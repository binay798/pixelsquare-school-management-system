import { AcademicYear } from '@src/@types/academicYear'
import { CmnOmit } from '@src/@types/base'
import { api } from '@src/helpers/api.helpers'

export interface CreateAcademicYearDto
  extends CmnOmit<AcademicYear.IAcademicYear> {}

export const createAcademicYear = async (data: CreateAcademicYearDto) => {
  const res = await api<Api.Base<object>>('post')(
    'schools/academic-years',
    undefined,
    data
  )

  return res.data.data
}

export const getAcademicYearList = async (
  page?: number,
  limit?: number,
  search?: string
) => {
  const res = await api<Api.Base<AcademicYear.IAcademicYear[]>>('get')(
    'schools/academic-years',
    {
      page,
      limit,
      search,
    }
  )

  return res.data.data
}
