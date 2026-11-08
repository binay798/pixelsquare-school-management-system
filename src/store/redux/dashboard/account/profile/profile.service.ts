import { api } from '@src/helpers/api.helpers'

/**
 * `GET /api/account/profile`
 *
 * The user is resolved from the access token on the server. `profile` is `null`
 * while the account does not have a profile row yet.
 */
export const getProfile = async () => {
  const res =
    await api<Api.Base<{ profile: User.IUserProfile | null }>>('get')(
      'account/profile'
    )

  return res.data.data
}

/**
 * `PATCH /api/account/profile`
 *
 * Only the details of the logged in user are written, the body can never
 * target another account.
 */
export const updateProfile = async (data: Service.Account.UpdateProfile) => {
  const res = await api<Api.Base<{ profile: User.IUserProfile }>>('patch')(
    'account/profile',
    undefined,
    data
  )

  return res.data.data
}
