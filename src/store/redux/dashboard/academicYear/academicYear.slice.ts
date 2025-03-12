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
  toggleActivation: {
    loading: boolean
  }
  selectedAcademicYearDetails: {
    loading: boolean
    data: AcademicYear.IAcademicYear | null
  }
  activeAcademicYearOfSchool: {
    data: AcademicYear.IAcademicYear | null
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
  toggleActivation: {
    loading: false,
  },
  selectedAcademicYearDetails: {
    loading: false,
    data: null,
  },
  activeAcademicYearOfSchool: {
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

export const toggleActivationOfAcademicYear = createAsyncThunk(
  'academicYear/toggle-activation',
  catchAsync(
    async (data: {
      payload: { is_active: boolean; academicYearId: number }
      onSuccess?: () => void
    }) => {
      const res = await services.toggleActiveStatusOfAcademicYear(
        data.payload.academicYearId,
        data.payload.is_active
      )
      data?.onSuccess?.()

      return res
    },
    true,
    false,
    'Activation successful',
    'Activation failed'
  )
)

export const getAcademicYearDetailsSlice = createAsyncThunk(
  'academic-year/getById',
  catchAsync(async (data: { payload: { academicYearId: number } }) => {
    const res = await services.getAcademicYearDetails(
      data.payload.academicYearId
    )

    return res
  })
)

export const getActiveAcademicYearAction = createAsyncThunk(
  'academic-year/get-active',
  catchAsync(async () => {
    const res = await services.getActiveAcademicYearOfSchool()

    return res
  })
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
    // TOGGLE ACTIVATION OF ACADEMIC YEAR
    builder.addCase(toggleActivationOfAcademicYear.pending, (state) => {
      state.toggleActivation.loading = true
    })
    builder.addCase(toggleActivationOfAcademicYear.fulfilled, (state) => {
      state.toggleActivation.loading = false
    })
    builder.addCase(toggleActivationOfAcademicYear.rejected, (state) => {
      state.toggleActivation.loading = false
    })
    // GET ACADEMIC YEAR DETAILS
    builder.addCase(getAcademicYearDetailsSlice.pending, (state) => {
      state.selectedAcademicYearDetails.loading = true
    })
    builder.addCase(getAcademicYearDetailsSlice.fulfilled, (state, action) => {
      state.selectedAcademicYearDetails.loading = false
      state.selectedAcademicYearDetails.data = action.payload.data
    })
    builder.addCase(getAcademicYearDetailsSlice.rejected, (state) => {
      state.selectedAcademicYearDetails.loading = false
    })
    // GET ACTIVE ACADEMIC YEAR OF SCHOOL
    builder.addCase(getActiveAcademicYearAction.pending, (state) => {
      state.activeAcademicYearOfSchool.loading = true
    })
    builder.addCase(getActiveAcademicYearAction.fulfilled, (state, action) => {
      state.activeAcademicYearOfSchool.loading = false
      state.activeAcademicYearOfSchool.data = action.payload.data
    })
    builder.addCase(getActiveAcademicYearAction.rejected, (state) => {
      state.activeAcademicYearOfSchool.loading = false
    })
  },
})

export default academicYearSlice.reducer
