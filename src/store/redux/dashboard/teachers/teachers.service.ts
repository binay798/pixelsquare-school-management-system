import { api } from '@src/helpers/api.helpers'

const getTeacherList = async (
  page = import.meta.env.VITE_DEFAULT_PAGE,
  limit = import.meta.env.VITE_DEFAULT_PAGE_LIMIT
) => {
  const res = await api<Api.Base<Teachers.ITeacherList>>('get')('teachers', {
    page,
    limit,
  })

  return res.data.data
}

export interface TCreateTeacherDto {
  user_profile: {
    firstname: string
    middlename?: string
    lastname: string
    mobile: string
    temporary_address: string
    permanent_address: string
    religion: string
    blood_group: string
    date_of_birth: string
    gender: string
    nationality: string
  }
  user_credential: { email: string; password: string }
  teacher_profile: {
    national_id: string
    joining_date: string
    school_department_id: number
  }
  profilePic: File
}

const createTeacherService = async (data: TCreateTeacherDto) => {
  const fd = new FormData()
  fd.append('user_profile', JSON.stringify(data.user_profile))
  fd.append('user_credential', JSON.stringify(data.user_credential))
  fd.append('teacher_profile', JSON.stringify(data.teacher_profile))
  fd.append('image', data.profilePic)
  const res = await api<Api.Base<object>>('post')('teachers', undefined, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return res.data.data
}

const getTeacherDetails = async (teacherId: number) => {
  const res = await api<Api.Base<Teachers.ITeacherDetail>>('get')(
    `teachers/${teacherId}`
  )

  return res.data.data
}

export interface TUpdateTeacherDetailDto {
  user_profile: Partial<User.IUserProfile>
  teacher_profile: Partial<Teachers.ITeacher>
}
const editTeacherDetails = async (
  teacherId: number,
  data: TUpdateTeacherDetailDto
) => {
  const res = await api<Api.Base<object>>('patch')(
    `teachers/${teacherId}`,
    undefined,
    data
  )

  return res.data.data
}

export const teacherServices = {
  getTeacherList,
  createTeacherService,
  getTeacherDetails,
  editTeacherDetails,
}
