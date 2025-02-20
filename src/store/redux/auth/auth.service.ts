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

export const logoutService = async () => {
  const res = await api<Api.Base<object>>('get')('auth/logout')

  return res.data.data
}
