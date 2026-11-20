import { api } from '@src/helpers/api.helpers'

export const login = async (data: Service.Auth.Login) => {
  const res = await api<Api.Base<Api.Auth.Login>>('post')(
    'auth/login',
    undefined,
    data
  )

  return res.data.data
}

export const getUserSession = async () => {
  const res = await api<Api.Base<Api.Auth.Login>>('get')('users/session')

  return res.data.data
}

/**
 * Public, unauthenticated lookup: turns the typed code into the school it
 * belongs to, so the sign-in screen can show which tenant is being entered.
 */
export const resolveSchoolByCode = async (code: string) => {
  const res = await api<Api.Base<Api.IPublicSchool>>('get')(
    `public/schools/${encodeURIComponent(code)}`
  )

  return res.data.data.data
}

export const logoutService = async () => {
  const res = await api<Api.Base<object>>('get')('auth/logout')

  return res.data.data
}
