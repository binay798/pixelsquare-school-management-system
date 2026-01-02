import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import * as services from './sections.service'

interface InitialState {
  createSection: {
    loading: boolean
  }
  sectionList: {
    data: Academics.IClassSectionList[] | null
    loading: boolean
  }
  updateSection: {
    loading: boolean
  }
}
const initialState: InitialState = {
  createSection: {
    loading: false,
  },
  updateSection: {
    loading: false,
  },
  sectionList: {
    data: null,
    loading: false,
  },
}

export const createClassSectionAction = createAsyncThunk(
  'classSection/create',
  catchAsync(
    async (data: {
      payload: { classId: number; name: string }
      onSuccess: () => void
    }) => {
      const res = await services.createClassSectionService(
        data.payload.classId,
        data.payload.name
      )

      data.onSuccess()

      return res
    }
  )
)

export const updateSectionAction = createAsyncThunk(
  'classSection/update',
  catchAsync(
    async (data: {
      classId: number
      sectionId: number
      name: string
      onSuccess?: () => void
    }) => {
      const res = await services.updateSectionService(
        data.classId,
        data.sectionId,
        data.name
      )
      data.onSuccess?.()

      return res
    }
  )
)

export const getClassSectionListAction = createAsyncThunk(
  'classSection/getList',
  catchAsync(
    async (data: {
      payload: { classId: number }
      onSuccess: (data: Academics.IClassSectionList[]) => void
    }) => {
      const res = await services.getClassSectionList(data.payload.classId)

      data.onSuccess(res.data)

      return res
    }
  )
)

const classSectionSlice = createSlice({
  name: 'classSection',
  initialState,
  reducers: {},
  extraReducers: (builders) => {
    // CREATE CLASS SECTION
    builders.addCase(createClassSectionAction.pending, (state) => {
      state.createSection.loading = true
    })
    builders.addCase(createClassSectionAction.fulfilled, (state) => {
      state.createSection.loading = false
    })
    builders.addCase(createClassSectionAction.rejected, (state) => {
      state.createSection.loading = false
    })
    // GET CLASS SECTION LIST
    builders.addCase(getClassSectionListAction.pending, (state) => {
      state.sectionList.loading = true
    })
    builders.addCase(getClassSectionListAction.fulfilled, (state, action) => {
      state.sectionList.loading = false
      state.sectionList.data = action.payload.data
    })
    builders.addCase(getClassSectionListAction.rejected, (state) => {
      state.sectionList.loading = false
    })
    // UPDATE SECTION ACTION
    builders.addCase(updateSectionAction.pending, (state) => {
      state.updateSection.loading = true
    })
    builders.addCase(updateSectionAction.fulfilled, (state) => {
      state.updateSection.loading = false
    })
    builders.addCase(updateSectionAction.rejected, (state) => {
      state.updateSection.loading = false
    })
  },
})

export default classSectionSlice.reducer
