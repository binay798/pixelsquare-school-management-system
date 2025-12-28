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

interface IExtendedStudentProfile extends Students.IStudent {
  roll_no: number
  class_id: number
  class_section_id: number
}
// STUDENT SERVICE
export interface TCreateStudent {
  user_credential: Pick<User.IUser, 'email' | 'password'>
  user_profile: Omit<
    User.IUserProfile,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
  student_profile: Omit<
    IExtendedStudentProfile,
    | 'id'
    | 'created_at'
    | 'updated_at'
    | 'profile_photo'
    | 'user_id'
    | 'school_id'
  >
  image: File
}
const createStudent = async (data: TCreateStudent) => {
  const fd = new FormData()
  fd.append('user_credential', JSON.stringify(data.user_credential))
  fd.append('user_profile', JSON.stringify(data.user_profile))
  fd.append('student_profile', JSON.stringify(data.student_profile))
  fd.append('image', data.image)

  const res = await api<Api.Base<object>>('post')('students', undefined, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return res.data.data
}

const updateStudent = async (
  studentId: number,
  data: Partial<Omit<TCreateStudent, 'image' | 'user_credential'>>
) => {
  const res = await api<Api.Base<object>>('patch')(
    `students/${studentId}`,
    undefined,
    data
  )

  return res.data.data
}

const getStudentList = async (
  page?: number,
  limit?: number,
  search?: string
) => {
  const res = await api<Api.Base<Students.IStudentList>>('get')('students', {
    page,
    limit,
    search,
  })

  return res.data.data
}

const getStudentDetail = async (studentId: number) => {
  const res = await api<Api.Base<Students.IStudentDetail>>('get')(
    `students/${studentId}`
  )

  return res.data.data
}

const changeProfilePictureService = async (studentId: number, image: File) => {
  const fd = new FormData()
  fd.append('image', image)
  const res = await api<Api.Base<object>>('patch')(
    `students/${studentId}/change-profile-pic`,
    undefined,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )

  return res.data.data
}

export const manageStudentServices = {
  createStudentTypeService,
  getStudentTypeList,
  updateStudentType,
  createStudent,
  updateStudent,
  getStudentList,
  getStudentDetail,
  changeProfilePictureService,
}
