import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import * as services from './profile.service'

interface InitialState {
  details: {
    data: User.IUserProfile | null
    loading: boolean
  }
  updateProfile: {
    loading: boolean
  }
}
const initialState: InitialState = {
  details: {
    data: null,
    loading: false,
  },
  updateProfile: {
    loading: false,
  },
}

/**
 * Profile details of the account section.
 *
 * It is intentionally kept apart from the password and email sections: each of
 * them owns its own action (and its own backend endpoint).
 */
export const getProfileAction = createAsyncThunk(
  'account/profile/get',
  catchAsync(async () => {
    const res = await services.getProfile()

    return res
  })
)

export const updateProfileAction = createAsyncThunk(
  'account/profile/update',
  catchAsync(
    async (data: {
      payload: Service.Account.UpdateProfile
      onSuccess?: () => void
    }) => {
      const res = await services.updateProfile(data.payload)
      data?.onSuccess?.()

      return res
    },
    true,
    undefined,
    'Profile details updated successfully'
  )
)

export const accountProfileSlice = createSlice({
  name: 'accountProfile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET PROFILE
    builder.addCase(getProfileAction.pending, (state) => {
      state.details.loading = true
    })
    builder.addCase(getProfileAction.fulfilled, (state, action) => {
      state.details.loading = false
      state.details.data = action.payload.data.profile
    })
    builder.addCase(getProfileAction.rejected, (state) => {
      state.details.loading = false
    })
    // UPDATE PROFILE
    builder.addCase(updateProfileAction.pending, (state) => {
      state.updateProfile.loading = true
    })
    builder.addCase(updateProfileAction.fulfilled, (state, action) => {
      state.updateProfile.loading = false
      state.details.data = action.payload.data.profile
    })
    builder.addCase(updateProfileAction.rejected, (state) => {
      state.updateProfile.loading = false
    })
  },
})

export default accountProfileSlice.reducer
