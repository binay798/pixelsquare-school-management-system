import { api } from '@src/helpers/api.helpers'

const createStudentTypeService = async (name: string) => {
  const res = await api<Api.Base<object>>('post')('students/types', undefined, {
    name,
  })

  return res.data.data
}
const getStudentTypeList = async () => {
  const res =
    await api<Api.Base<Students.IStudentType[]>>('get')('students/types')

  return res.data.data
}

const updateStudentType = async (studentTypeId: number, name: string) => {
  const res = await api<Api.Base<object>>('patch')(
    `students/types/${studentTypeId}`,
    undefined,
    {
      name,
    }
  )

  return res.data.data
}

export const manageStudentServices = {
  createStudentTypeService,
  getStudentTypeList,
  updateStudentType,
}
