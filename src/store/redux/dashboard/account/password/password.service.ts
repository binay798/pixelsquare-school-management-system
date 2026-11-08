import { api } from '@src/helpers/api.helpers'

/**
 * `PATCH /api/account/password`
 *
 * The user is resolved from the access token on the server, so the body only
 * carries the two credentials.
 */
export const updatePassword = async (data: Service.Account.UpdatePassword) => {
  const res = await api<Api.Base<object>>('patch')(
    'account/password',
    undefined,
    data
  )

  return res.data.data
}
