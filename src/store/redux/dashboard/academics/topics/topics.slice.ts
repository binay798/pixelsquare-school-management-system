import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import {
  CreateTopicDto,
  topicServices,
  UpdateTopicDto,
} from '@src/store/redux/dashboard/academics/topics/topics.service'

interface InitialState {
  createTopic: {
    loading: boolean
  }
  topicList: {
    data: Academics.ITopicList[] | null
    loading: boolean
  }
  selectedTopic: {
    data: Academics.ITopic | null
    loading: boolean
  }
  updateTopic: {
    loading: boolean
  }
  deleteTopic: {
    loading: boolean
  }
}

const initialState: InitialState = {
  createTopic: {
    loading: false,
  },
  topicList: {
    data: null,
    loading: false,
  },
  selectedTopic: {
    data: null,
    loading: false,
  },
  updateTopic: {
    loading: false,
  },
  deleteTopic: {
    loading: false,
  },
}

// TOPIC ACTIONS
export const createTopicAction = createAsyncThunk(
  'topicSlice/create',
  catchAsync(
    async (data: {
      classId: number
      subjectId: number
      chapterId: number
      body: CreateTopicDto
      onSuccess?: () => void
    }) => {
      const res = await topicServices.createTopic(
        data.classId,
        data.subjectId,
        data.chapterId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true
  )
)

export const updateTopicAction = createAsyncThunk(
  'topicSlice/update',
  catchAsync(
    async (data: {
      classId: number
      subjectId: number
      chapterId: number
      topicId: number
      body: UpdateTopicDto
      onSuccess?: () => void
    }) => {
      const res = await topicServices.updateTopic(
        data.classId,
        data.subjectId,
        data.chapterId,
        data.topicId,
        data.body
      )
      data?.onSuccess?.()

      return res
    },
    true,
    undefined,
    'Topic updated successfully'
  )
)

export const deleteTopicAction = createAsyncThunk(
  'topicSlice/delete',
  catchAsync(
    async (data: {
      classId: number
      subjectId: number
      chapterId: number
      topicId: number
      onSuccess?: () => void
    }) => {
      const res = await topicServices.deleteTopic(
        data.classId,
        data.subjectId,
        data.chapterId,
        data.topicId
      )
      data?.onSuccess?.()

      return res
    },
    true,
    undefined,
    'Topic deleted successfully'
  )
)

export const getTopicListAction = createAsyncThunk(
  'topicSlice/getTopicList',
  catchAsync(
    async (data: { classId: number; subjectId: number; chapterId: number }) => {
      const res = await topicServices.getTopicList(
        data.classId,
        data.subjectId,
        data.chapterId
      )

      return res
    }
  )
)

export const getTopicDetailAction = createAsyncThunk(
  'topicSlice/getTopicDetail',
  catchAsync(
    async (data: {
      classId: number
      subjectId: number
      chapterId: number
      topicId: number
    }) => {
      const res = await topicServices.getTopicDetail(
        data.classId,
        data.subjectId,
        data.chapterId,
        data.topicId
      )

      return res
    }
  )
)

const topicSlice = createSlice({
  name: 'TopicSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // CREATE TOPIC ACTION
    builder.addCase(createTopicAction.pending, (state) => {
      state.createTopic.loading = true
    })
    builder.addCase(createTopicAction.fulfilled, (state) => {
      state.createTopic.loading = false
    })
    builder.addCase(createTopicAction.rejected, (state) => {
      state.createTopic.loading = false
    })
    // UPDATE TOPIC ACTION
    builder.addCase(updateTopicAction.pending, (state) => {
      state.updateTopic.loading = true
    })
    builder.addCase(updateTopicAction.fulfilled, (state) => {
      state.updateTopic.loading = false
    })
    builder.addCase(updateTopicAction.rejected, (state) => {
      state.updateTopic.loading = false
    })
    // DELETE TOPIC ACTION
    builder.addCase(deleteTopicAction.pending, (state) => {
      state.deleteTopic.loading = true
    })
    builder.addCase(deleteTopicAction.fulfilled, (state) => {
      state.deleteTopic.loading = false
    })
    builder.addCase(deleteTopicAction.rejected, (state) => {
      state.deleteTopic.loading = false
    })
    // TOPIC LIST ACTION
    builder.addCase(getTopicListAction.pending, (state) => {
      state.topicList.loading = true
    })
    builder.addCase(getTopicListAction.fulfilled, (state, action) => {
      state.topicList.loading = false
      state.topicList.data = action.payload.data
    })
    builder.addCase(getTopicListAction.rejected, (state) => {
      state.topicList.loading = false
    })
    // TOPIC DETAIL ACTION
    builder.addCase(getTopicDetailAction.pending, (state) => {
      state.selectedTopic.loading = true
    })
    builder.addCase(getTopicDetailAction.fulfilled, (state, action) => {
      state.selectedTopic.loading = false
      state.selectedTopic.data = action.payload.data
    })
    builder.addCase(getTopicDetailAction.rejected, (state) => {
      state.selectedTopic.loading = false
    })
  },
})

export default topicSlice.reducer
