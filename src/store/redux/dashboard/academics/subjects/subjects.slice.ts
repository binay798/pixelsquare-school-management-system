import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import { teacherServices } from '@src/store/redux/dashboard/teachers/teachers.service'
import {
  CreateChapterDto,
  subjectServices,
  TCreateSubject,
  UpdateChapterDto,
} from '@src/store/redux/dashboard/academics/subjects/subjects.service'

interface InitialState {
  createSubject: {
    loading: boolean
    teachers: {
      data: Teachers.ITeacherList | null
      loading: boolean
    }
  }
  updateSubject: {
    loading: boolean
  }
  subjectList: {
    selectedClass: { label: string; value: number } | null
    data: Academics.ISubjectList[] | null
    loading: boolean
  }
  selectedSubject: {
    data: Academics.ISubjectDetail | null
    loading: boolean
  }
  chapterList: {
    data: Academics.IChapterList | null
    loading: boolean
  }
  createChapter: {
    loading: boolean
  }
  updateChapter: {
    loading: boolean
  }
  deleteChapter: {
    loading: boolean
  }
}
const initialState: InitialState = {
  createSubject: {
    loading: false,
    teachers: {
      data: null,
      loading: false,
    },
  },
  updateSubject: {
    loading: false,
  },
  subjectList: {
    selectedClass: null,
    data: null,
    loading: false,
  },
  selectedSubject: {
    data: null,
    loading: false,
  },
  chapterList: {
    data: null,
    loading: false,
  },
  createChapter: {
    loading: false,
  },
  updateChapter: {
    loading: false,
  },
  deleteChapter: {
    loading: false,
  },
}

export const getTeacherList = createAsyncThunk(
  'subjectSlice/getTeacherList',
  catchAsync(async () => {
    const res = await teacherServices.getTeacherList(1, 100)

    return res
  })
)

export const createSubjectAction = createAsyncThunk(
  'subjectSlice/create',
  catchAsync(
    async (data: {
      body: TCreateSubject
      classId: number
      onSuccess?: () => void
    }) => {
      const res = await subjectServices.createSubjectService(
        data.classId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true
  )
)

export const getSubjectDetailAction = createAsyncThunk(
  'subjectSlice/getSubjectDetail',
  catchAsync(async (data: { classId: number; subjectId: number }) => {
    const res = await subjectServices.getSubjectDetail(
      data.classId,
      data.subjectId
    )

    return res
  })
)

export const updateSubjectAction = createAsyncThunk(
  'subjectSlice/update',
  catchAsync(
    async (data: {
      subjectId: number
      classId: number
      body: Partial<TCreateSubject>
      onSuccess?: () => void
    }) => {
      const res = await subjectServices.updateSubjectService(
        data.subjectId,
        data.classId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true
  )
)

export const getSubjectListAction = createAsyncThunk(
  'subjectSlice/getSubjectList',
  catchAsync(
    async (data: {
      body: { page?: number; limit?: number }
      classId: number
    }) => {
      const res = await subjectServices.getSubjectListService(
        data.classId,
        data.body.page,
        data.body.limit
      )

      return res
    }
  )
)

// CHAPTER ACTION
export const createChapterAction = createAsyncThunk(
  'chapterSlice/create',
  catchAsync(
    async (data: {
      classId: number
      subjectId: number
      body: CreateChapterDto
      onSuccess?: () => void
    }) => {
      const res = await subjectServices.createChapter(
        data.classId,
        data.subjectId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true
  )
)

export const updateChapterAction = createAsyncThunk(
  'chapterSlice/update',
  catchAsync(
    async (data: {
      classId: number
      subjectId: number
      chapterId: number
      body: UpdateChapterDto
    }) => {
      const res = await subjectServices.updateChapter(
        data.classId,
        data.subjectId,
        data.chapterId,
        data.body
      )

      return res
    }
  )
)

export const deleteChapterAction = createAsyncThunk(
  'chapterSlice/delete',
  catchAsync(
    async (data: { classId: number; subjectId: number; chapterId: number }) => {
      const res = await subjectServices.deleteChapter(
        data.classId,
        data.subjectId,
        data.chapterId
      )

      return res
    }
  )
)

export const getChapterListAction = createAsyncThunk(
  'chapterSlice/getChapterList',
  catchAsync(
    async (data: {
      classId: number
      subjectId: number
      page?: number
      limit?: number
      search?: string
    }) => {
      const res = await subjectServices.getChapterList(
        data.classId,
        data.subjectId,
        data.page,
        data.limit,
        data.search
      )

      return res
    }
  )
)

const subjectSlice = createSlice({
  name: 'SubjectSlice',
  initialState,
  reducers: {
    updateSelectedClass: (
      state,
      action: { payload: { label: string; value: number } }
    ) => {
      state.subjectList.selectedClass = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getTeacherList.pending, (state) => {
      state.createSubject.teachers.loading = true
    })
    builder.addCase(getTeacherList.fulfilled, (state, action) => {
      state.createSubject.teachers.loading = false
      state.createSubject.teachers.data = action.payload.data
    })
    builder.addCase(getTeacherList.rejected, (state) => {
      state.createSubject.teachers.loading = false
    })
    // CREATE SUBJECT
    builder.addCase(createSubjectAction.pending, (state) => {
      state.createSubject.loading = true
    })
    builder.addCase(createSubjectAction.fulfilled, (state) => {
      state.createSubject.loading = false
    })
    builder.addCase(createSubjectAction.rejected, (state) => {
      state.createSubject.loading = false
    })
    // GET SUBJECT DETAIL ACTION
    builder.addCase(getSubjectDetailAction.pending, (state) => {
      state.selectedSubject.loading = true
    })
    builder.addCase(getSubjectDetailAction.fulfilled, (state, action) => {
      state.selectedSubject.loading = false
      state.selectedSubject.data = action.payload.data
    })
    builder.addCase(getSubjectDetailAction.rejected, (state) => {
      state.selectedSubject.loading = false
    })
    // GET SUBJECT LIST ACTION
    builder.addCase(getSubjectListAction.pending, (state) => {
      state.subjectList.loading = true
    })
    builder.addCase(getSubjectListAction.fulfilled, (state, action) => {
      state.subjectList.loading = false
      state.subjectList.data = action.payload.data
    })
    builder.addCase(getSubjectListAction.rejected, (state) => {
      state.subjectList.loading = false
    })
    // UPDATE SUBJECT ACTION
    builder.addCase(updateSubjectAction.pending, (state) => {
      state.updateSubject.loading = true
    })
    builder.addCase(updateSubjectAction.fulfilled, (state) => {
      state.updateSubject.loading = false
    })
    builder.addCase(updateSubjectAction.rejected, (state) => {
      state.updateSubject.loading = false
    })
    // CREATE CHAPTER ACTION
    builder.addCase(createChapterAction.pending, (state) => {
      state.createChapter.loading = true
    })
    builder.addCase(createChapterAction.fulfilled, (state) => {
      state.createChapter.loading = false
    })
    builder.addCase(createChapterAction.rejected, (state) => {
      state.createChapter.loading = false
    })
    // UPDATE CHAPTER ACTION
    builder.addCase(updateChapterAction.pending, (state) => {
      state.updateChapter.loading = true
    })
    builder.addCase(updateChapterAction.fulfilled, (state) => {
      state.updateChapter.loading = false
    })
    builder.addCase(updateChapterAction.rejected, (state) => {
      state.updateChapter.loading = false
    })
    // DELETE CHAPTER ACTION
    builder.addCase(deleteChapterAction.pending, (state) => {
      state.deleteChapter.loading = true
    })
    builder.addCase(deleteChapterAction.fulfilled, (state) => {
      state.deleteChapter.loading = false
    })
    builder.addCase(deleteChapterAction.rejected, (state) => {
      state.deleteChapter.loading = false
    })
    // CHAPTER LIST ACTION
    builder.addCase(getChapterListAction.pending, (state) => {
      state.chapterList.loading = true
    })
    builder.addCase(getChapterListAction.fulfilled, (state, action) => {
      state.chapterList.loading = false
      state.chapterList.data = action.payload.data
    })
    builder.addCase(getChapterListAction.rejected, (state) => {
      state.chapterList.loading = false
    })
  },
})

export default subjectSlice.reducer
export const { updateSelectedClass } = subjectSlice.actions
