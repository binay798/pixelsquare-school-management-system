import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import * as services from './manageSchool.service'

interface InitialState {
  schoolDetail: {
    data: Api.ISchool | null
    loading: boolean
  }
  updateSchoolDetail: {
    loading: boolean
  }
}
const initialState: InitialState = {
  schoolDetail: {
    data: null,
    loading: false,
  },
  updateSchoolDetail: {
    loading: false,
  },
}
export const getSchoolDetailSlice = createAsyncThunk(
  'manageSchool/getSchoolDetail',
  catchAsync(async () => {
    const res = await services.getSchoolDetails()

    return res
  })
)

export const updateSchoolDetailsSlice = createAsyncThunk(
  'manageSchool/updateSchoolDetail',
  catchAsync(
    async (body: { data: Partial<Api.ISchool>; onSuccess?: () => void }) => {
      const res = await services.updateSchoolDetails(body.data)
      body.onSuccess?.()

      return res
    },
    true,
    false,
    'Successfully updated school details'
  )
)

const manageSchoolSlice = createSlice({
  name: 'manageSchool',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET SCHOOL DETAILS
    builder.addCase(getSchoolDetailSlice.pending, (state) => {
      state.schoolDetail.loading = true
    })
    builder.addCase(getSchoolDetailSlice.fulfilled, (state, action) => {
      state.schoolDetail.loading = false
      state.schoolDetail.data = action.payload.data
    })
    builder.addCase(getSchoolDetailSlice.rejected, (state) => {
      state.schoolDetail.loading = false
    })
    // UPDATE SCHOOL DETAILS
    builder.addCase(updateSchoolDetailsSlice.pending, (state) => {
      state.updateSchoolDetail.loading = true
    })
    builder.addCase(updateSchoolDetailsSlice.fulfilled, (state) => {
      state.updateSchoolDetail.loading = false
    })
    builder.addCase(updateSchoolDetailsSlice.rejected, (state) => {
      state.updateSchoolDetail.loading = false
    })
  },
})

export default manageSchoolSlice.reducer
