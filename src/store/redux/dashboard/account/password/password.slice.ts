import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import * as services from './password.service'

interface InitialState {
  updatePassword: {
    loading: boolean
  }
}
const initialState: InitialState = {
  updatePassword: {
    loading: false,
  },
}

/**
 * Password change of the account section.
 *
 * It is intentionally kept apart from the profile and email sections: each of
 * them owns its own action (and its own backend endpoint).
 */
export const updatePasswordAction = createAsyncThunk(
  'account/password/update',
  catchAsync(
    async (data: {
      payload: Service.Account.UpdatePassword
      onSuccess?: () => void
    }) => {
      const res = await services.updatePassword(data.payload)
      data?.onSuccess?.()

      return res
    },
    true,
    undefined,
    'Password updated successfully'
  )
)

export const accountPasswordSlice = createSlice({
  name: 'accountPassword',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // UPDATE PASSWORD
    builder.addCase(updatePasswordAction.pending, (state) => {
      state.updatePassword.loading = true
    })
    builder.addCase(updatePasswordAction.fulfilled, (state) => {
      state.updatePassword.loading = false
    })
    builder.addCase(updatePasswordAction.rejected, (state) => {
      state.updatePassword.loading = false
    })
  },
})

export default accountPasswordSlice.reducer
