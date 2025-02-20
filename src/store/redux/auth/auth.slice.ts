import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import * as services from './auth.service'
interface InitialState {
  user: {
    data: Api.Auth.Login | null
    loading: boolean
    sessionLoading: boolean
  }
  logout: {
    loading: boolean
  }
}
const initialState: InitialState = {
  user: {
    data: null,
    loading: false,
    sessionLoading: false,
  },
  logout: {
    loading: false,
  },
}

export const authSliceLogin = createAsyncThunk(
  'auth/login',
  catchAsync(
    async (data: { body: Service.Auth.Login; onSuccess?: () => void }) => {
      const res = await services.login(data.body)
      data.onSuccess?.()

      return res
    },
    true,
    false
  )
)
export const authSliceGetUserSession = createAsyncThunk(
  'auth/getUserSession',
  catchAsync(
    async () => {
      const res = await services.getUserSession()

      return res
    },
    false,
    false
  )
)

export const authSliceLogout = createAsyncThunk(
  'auth/logout',
  catchAsync(
    async () => {
      const res = await services.logoutService()

      return res
    },
    true,
    false
  )
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // LOGIN
    builder.addCase(authSliceLogin.pending, (state) => {
      state.user.loading = true
    })
    builder.addCase(authSliceLogin.fulfilled, (state, action) => {
      state.user.data = action.payload.data
      state.user.loading = false
    })
    builder.addCase(authSliceLogin.rejected, (state) => {
      state.user.loading = false
    })
    // GET USER SESSION
    builder.addCase(authSliceGetUserSession.pending, (state) => {
      state.user.sessionLoading = true
    })
    builder.addCase(authSliceGetUserSession.fulfilled, (state, action) => {
      state.user.data = action.payload.data
      state.user.sessionLoading = false
    })
    builder.addCase(authSliceGetUserSession.rejected, (state) => {
      state.user.sessionLoading = false
    })
    // LOGOUT
    builder.addCase(authSliceLogout.pending, (state) => {
      state.logout.loading = true
    })
    builder.addCase(authSliceLogout.fulfilled, (state) => {
      state.logout.loading = false
      state.user.data = null
    })
    builder.addCase(authSliceLogout.rejected, (state) => {
      state.logout.loading = false
    })
  },
})

export default authSlice.reducer
