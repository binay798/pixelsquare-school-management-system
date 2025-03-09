import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import { CreateAcademicYearDto } from './academicYear.service'
import * as services from './academicYear.service'
import { AcademicYear } from '@src/@types/academicYear'

interface InitialState {
  createAcademicYear: {
    loading: boolean
  }
  academicYearList: {
    data: AcademicYear.IAcademicYear[] | null
    loading: boolean
  }
}

const initialState: InitialState = {
  createAcademicYear: {
    loading: false,
  },
  academicYearList: {
    data: null,
    loading: false,
  },
}

export const createAcademicYearSlice = createAsyncThunk(
  'academicYear/create',
  catchAsync(
    async (data: {
      payload: CreateAcademicYearDto
      onSuccess?: () => void
    }) => {
      const res = await services.createAcademicYear(data.payload)
      data?.onSuccess?.()

      return res
    },
    true,
    undefined
  )
)

export const getAcademicYearListSlice = createAsyncThunk(
  'academicYear/getList',
  catchAsync(
    async (data: {
      query: {
        page?: number
        limit?: number
        search?: string
        onSuccess?: () => void
      }
    }) => {
      const res = await services.getAcademicYearList(
        data.query?.page,
        data?.query?.limit,
        data?.query?.search
      )

      return res
    }
  )
)

const academicYearSlice = createSlice({
  name: 'academicYear',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    // CREATE ACADEMIC YEAR
    builder.addCase(createAcademicYearSlice.pending, (state) => {
      state.createAcademicYear.loading = true
    })
    builder.addCase(createAcademicYearSlice.fulfilled, (state) => {
      state.createAcademicYear.loading = false
    })
    builder.addCase(createAcademicYearSlice.rejected, (state) => {
      state.createAcademicYear.loading = false
    })
    // GET ACADEMIC YEAR LIST
    builder.addCase(getAcademicYearListSlice.pending, (state) => {
      state.academicYearList.loading = true
    })
    builder.addCase(getAcademicYearListSlice.fulfilled, (state, action) => {
      state.academicYearList.loading = false
      state.academicYearList.data = action.payload.data
    })
    builder.addCase(getAcademicYearListSlice.rejected, (state) => {
      state.academicYearList.loading = false
    })
  },
})

export default academicYearSlice.reducer
