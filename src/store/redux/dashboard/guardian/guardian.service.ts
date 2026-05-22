import { api } from '@src/helpers/api.helpers'

const getGuardianList = async (page = 1, limit = 10) => {
  const res = await api<Api.Base<Guardian.IList>>('get')('guardians', {
    page,
    limit,
  })

  return res.data.data
}

export interface TCreateGuardianDto {
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
  user_credential: { email: string }
  profilePic: File
}
const createGuardian = async (data: TCreateGuardianDto) => {
  const fd = new FormData()
  fd.append('user_profile', JSON.stringify(data.user_profile))
  fd.append('user_credential', JSON.stringify(data.user_credential))
  fd.append('image', data.profilePic)
  const res = await api<Api.Base<object>>('post')('guardians', undefined, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return res.data.data
}

const updateGuardian = async (
  guardianId: number,
  data: TCreateGuardianDto['user_profile']
) => {
  const res = await api<Api.Base<object>>('patch')(
    `guardians/${guardianId}`,
    undefined,
    { user_profile: data }
  )

  return res.data.data
}

const getGuardianDetails = async (guardianId: number) => {
  const res = await api<Api.Base<Guardian.IGuardianDetail>>('get')(
    `guardians/${guardianId}`
  )

  return res.data.data
}

const changeGuardianProfilePicService = async (
  guardianId: number,
  image: File
) => {
  const fd = new FormData()
  fd.append('image', image)
  const res = await api<Api.Base<object>>('patch')(
    `guardians/${guardianId}/change-profile-pic`,
    undefined,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )

  return res.data.data
}

export const guardianServices = {
  getGuardianList,
  createGuardian,
  updateGuardian,
  getGuardianDetails,
  changeGuardianProfilePicService,
}
