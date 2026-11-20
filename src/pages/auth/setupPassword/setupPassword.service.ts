import { api } from '@src/helpers/api.helpers'

/**
 * `POST /api/auth/password-setup` (public).
 *
 * The token from the invitation email is the credential; no session or school
 * code is required.
 */
export const completePasswordSetup = async (
  data: Service.Auth.CompletePasswordSetup
) => {
  const res = await api<Api.Base<object>>('post')(
    'auth/password-setup',
    undefined,
    data
  )

  return res.data.data
}
