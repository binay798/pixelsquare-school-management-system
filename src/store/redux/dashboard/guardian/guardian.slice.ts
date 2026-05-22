import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import { guardianServices, TCreateGuardianDto } from './guardian.service'

interface InitialState {
  list: {
    data: Guardian.IList | null
    loading: boolean
  }
  create: {
    loading: boolean
  }
  edit: {
    loading: boolean
  }
  guardianDetail: {
    data: Guardian.IGuardianDetail | null
    loading: boolean
  }
  changeProfilePic: {
    loading: boolean
  }
}
const initialState: InitialState = {
  list: {
    data: null,
    loading: false,
  },
  create: {
    loading: false,
  },
  edit: {
    loading: false,
  },
  guardianDetail: {
    data: null,
    loading: false,
  },
  changeProfilePic: {
    loading: false,
  },
}

export const listGuardians = createAsyncThunk(
  'guardian/list',
  catchAsync(async (data: { payload: { page?: number; limit?: number } }) => {
    const res = await guardianServices.getGuardianList(
      data.payload.page,
      data.payload.limit
    )

    return res
  })
)

export const createGuardianAction = createAsyncThunk(
  'guardian/create',
  catchAsync(
    async (data: { payload: TCreateGuardianDto; onSuccess?: () => void }) => {
      const res = await guardianServices.createGuardian(data.payload)
      data?.onSuccess?.()

      return res
    }
  )
)

export const updateGuardianAction = createAsyncThunk(
  'guardian/update',
  catchAsync(
    async (data: {
      guardianId: number
      payload: TCreateGuardianDto['user_profile']
      onSuccess?: () => void
    }) => {
      const res = await guardianServices.updateGuardian(
        data.guardianId,
        data.payload
      )

      return res
    }
  )
)

export const getGuardianDetailsAction = createAsyncThunk(
  'guardian/getDetails',
  catchAsync(async (data: { guardianId: number; onSuccess?: () => void }) => {
    const res = await guardianServices.getGuardianDetails(data.guardianId)

    return res
  })
)

export const changeGuardianProfilePic = createAsyncThunk(
  'guardian/change-profile-pic',
  catchAsync(
    async (data: {
      guardianId: number
      image: File
      onSuccess?: () => void
    }) => {
      const res = await guardianServices.changeGuardianProfilePicService(
        data.guardianId,
        data.image
      )

      data?.onSuccess?.()

      return res
    }
  )
)

export const guardianSlice = createSlice({
  name: 'guardianSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GUARDIAN LIST
    builder.addCase(listGuardians.pending, (state) => {
      state.list.loading = true
    })
    builder.addCase(listGuardians.fulfilled, (state, action) => {
      state.list.loading = false
      state.list.data = action.payload.data
    })
    builder.addCase(listGuardians.rejected, (state) => {
      state.list.loading = false
    })
    // CREATE GUARDIAN
    builder.addCase(createGuardianAction.pending, (state) => {
      state.create.loading = true
    })
    builder.addCase(createGuardianAction.fulfilled, (state) => {
      state.create.loading = false
    })
    builder.addCase(createGuardianAction.rejected, (state) => {
      state.create.loading = false
    })
    // UPDATE GUARDIAN
    builder.addCase(updateGuardianAction.pending, (state) => {
      state.edit.loading = true
    })
    builder.addCase(updateGuardianAction.fulfilled, (state) => {
      state.edit.loading = false
    })
    builder.addCase(updateGuardianAction.rejected, (state) => {
      state.edit.loading = false
    })
    // GET GUARDIAN DETAILS
    builder.addCase(getGuardianDetailsAction.pending, (state) => {
      state.guardianDetail.loading = true
    })
    builder.addCase(getGuardianDetailsAction.fulfilled, (state, action) => {
      state.guardianDetail.loading = false
      state.guardianDetail.data = action.payload.data
    })
    builder.addCase(getGuardianDetailsAction.rejected, (state) => {
      state.guardianDetail.loading = false
    })
    // CHANGE GUARDIAN PROFILE PIC
    builder.addCase(changeGuardianProfilePic.pending, (state) => {
      state.changeProfilePic.loading = true
    })
    builder.addCase(changeGuardianProfilePic.fulfilled, (state) => {
      state.changeProfilePic.loading = false
    })
    builder.addCase(changeGuardianProfilePic.rejected, (state) => {
      state.changeProfilePic.loading = false
    })
  },
})

export default guardianSlice.reducer
