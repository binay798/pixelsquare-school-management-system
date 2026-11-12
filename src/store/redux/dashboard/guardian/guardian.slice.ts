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
  linkedStudents: {
    data: Guardian.ILinkedStudentList | null
    loading: boolean
  }
  availableStudents: {
    data: Guardian.IAvailableStudentList | null
    loading: boolean
  }
  link: {
    attach: boolean
    update: boolean
    detach: boolean
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
  linkedStudents: {
    data: null,
    loading: false,
  },
  availableStudents: {
    data: null,
    loading: false,
  },
  link: {
    attach: false,
    update: false,
    detach: false,
  },
}

export const listGuardians = createAsyncThunk(
  'guardian/list',
  catchAsync(
    async (data: {
      payload: { page?: number; limit?: number; search?: string }
    }) => {
      const res = await guardianServices.getGuardianList(
        data.payload.page,
        data.payload.limit,
        data.payload.search
      )

      return res
    }
  )
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

export const getGuardianStudentsAction = createAsyncThunk(
  'guardian/students',
  catchAsync(
    async (data: {
      guardianId: number
      page?: number
      limit?: number
      search?: string
    }) => {
      const res = await guardianServices.getGuardianStudentList(
        data.guardianId,
        data.page,
        data.limit,
        data.search
      )

      return res
    }
  )
)

export const searchAvailableStudentsAction = createAsyncThunk(
  'guardian/students/available',
  catchAsync(
    async (data: {
      guardianId: number
      page?: number
      limit?: number
      search?: string
    }) => {
      const res = await guardianServices.searchAvailableStudents(
        data.guardianId,
        data.page,
        data.limit,
        data.search
      )

      return res
    }
  )
)

export const attachStudentToGuardianAction = createAsyncThunk(
  'guardian/students/attach',
  catchAsync(
    async (data: {
      guardianId: number
      payload: Guardian.IAttachStudentPayload
      onSuccess?: () => void
    }) => {
      const res = await guardianServices.attachStudentToGuardian(
        data.guardianId,
        data.payload
      )
      data.onSuccess?.()

      return res
    }
  )
)

export const updateGuardianStudentLinkAction = createAsyncThunk(
  'guardian/students/update',
  catchAsync(
    async (data: {
      guardianId: number
      studentId: number
      payload: Guardian.IGuardianStudentLinkPayload
      onSuccess?: () => void
    }) => {
      const res = await guardianServices.updateGuardianStudentLink(
        data.guardianId,
        data.studentId,
        data.payload
      )
      data.onSuccess?.()

      return res
    }
  )
)

export const detachStudentFromGuardianAction = createAsyncThunk(
  'guardian/students/detach',
  catchAsync(
    async (data: {
      guardianId: number
      studentId: number
      onSuccess?: () => void
    }) => {
      const res = await guardianServices.detachStudentFromGuardian(
        data.guardianId,
        data.studentId
      )
      data.onSuccess?.()

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
    // LINKED STUDENTS
    builder.addCase(getGuardianStudentsAction.pending, (state) => {
      state.linkedStudents.loading = true
    })
    builder.addCase(getGuardianStudentsAction.fulfilled, (state, action) => {
      state.linkedStudents.loading = false
      state.linkedStudents.data = action.payload.data
    })
    builder.addCase(getGuardianStudentsAction.rejected, (state) => {
      state.linkedStudents.loading = false
    })
    // AVAILABLE STUDENTS
    builder.addCase(searchAvailableStudentsAction.pending, (state) => {
      state.availableStudents.loading = true
    })
    builder.addCase(
      searchAvailableStudentsAction.fulfilled,
      (state, action) => {
        state.availableStudents.loading = false
        state.availableStudents.data = action.payload.data
      }
    )
    builder.addCase(searchAvailableStudentsAction.rejected, (state) => {
      state.availableStudents.loading = false
    })
    // ATTACH STUDENT
    builder.addCase(attachStudentToGuardianAction.pending, (state) => {
      state.link.attach = true
    })
    builder.addCase(attachStudentToGuardianAction.fulfilled, (state) => {
      state.link.attach = false
    })
    builder.addCase(attachStudentToGuardianAction.rejected, (state) => {
      state.link.attach = false
    })
    // UPDATE LINK
    builder.addCase(updateGuardianStudentLinkAction.pending, (state) => {
      state.link.update = true
    })
    builder.addCase(updateGuardianStudentLinkAction.fulfilled, (state) => {
      state.link.update = false
    })
    builder.addCase(updateGuardianStudentLinkAction.rejected, (state) => {
      state.link.update = false
    })
    // DETACH STUDENT
    builder.addCase(detachStudentFromGuardianAction.pending, (state) => {
      state.link.detach = true
    })
    builder.addCase(detachStudentFromGuardianAction.fulfilled, (state) => {
      state.link.detach = false
    })
    builder.addCase(detachStudentFromGuardianAction.rejected, (state) => {
      state.link.detach = false
    })
  },
})

export default guardianSlice.reducer
