import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import {
  ICreateLessonPlanDto,
  ICreateLessonPlanTemplateDto,
  ILessonPlanFilters,
  IUpdateLessonPlanDto,
  IUpdateLessonPlanTemplateDto,
  lessonPlanServices,
} from './lessonPlans.service'

interface InitialState {
  planList: {
    data: LessonPlan.IList | null
    loading: boolean
  }
  planStats: {
    data: LessonPlan.IListRow[] | null
    loading: boolean
  }
  myPlanList: {
    data: LessonPlan.IList | null
    loading: boolean
  }
  planDetail: {
    data: LessonPlan.IDetail | null
    loading: boolean
  }
  planSummary: {
    data: LessonPlan.IDetail | null
    loading: boolean
  }
  weeklyGrid: {
    data: LessonPlan.IWeeklyGrid | null
    loading: boolean
  }
  syllabusCompletion: {
    data: LessonPlan.ISyllabusCompletion | null
    loading: boolean
  }
  templateList: {
    data: LessonPlan.ITemplate[] | null
    loading: boolean
  }
  createPlan: { loading: boolean }
  updatePlan: { loading: boolean }
  deletePlan: { loading: boolean }
  statusMutation: { loading: boolean }
  reflectionMutation: { loading: boolean }
  topicMutation: { loading: boolean }
  resourceMutation: { loading: boolean }
  templateMutation: { loading: boolean }
}

const initialState: InitialState = {
  planList: { data: null, loading: false },
  planStats: { data: null, loading: false },
  myPlanList: { data: null, loading: false },
  planDetail: { data: null, loading: false },
  planSummary: { data: null, loading: false },
  weeklyGrid: { data: null, loading: false },
  syllabusCompletion: { data: null, loading: false },
  templateList: { data: null, loading: false },
  createPlan: { loading: false },
  updatePlan: { loading: false },
  deletePlan: { loading: false },
  statusMutation: { loading: false },
  reflectionMutation: { loading: false },
  topicMutation: { loading: false },
  resourceMutation: { loading: false },
  templateMutation: { loading: false },
}

// MARK: - READS
export const getLessonPlanListAction = createAsyncThunk(
  'lessonPlanSlice/getList',
  catchAsync(
    async (data: {
      filters?: ILessonPlanFilters
      page?: number
      limit?: number
    }) => {
      const res = await lessonPlanServices.getLessonPlanListService(
        data.filters,
        data.page,
        data.limit
      )

      return res.data
    }
  )
)

export const getLessonPlanStatsAction = createAsyncThunk(
  'lessonPlanSlice/getStats',
  catchAsync(async (filters?: ILessonPlanFilters) => {
    const res = await lessonPlanServices.getLessonPlanListService(
      filters,
      1,
      500
    )

    return res.data.rows ?? []
  })
)

export const getMyLessonPlanListAction = createAsyncThunk(
  'lessonPlanSlice/getMyList',
  catchAsync(
    async (data?: {
      page?: number
      limit?: number
      status?: LessonPlan.Status | ''
      fromDate?: string
      toDate?: string
    }) => {
      const res = await lessonPlanServices.getMyLessonPlanListService(data)

      return res.data
    }
  )
)

export const getLessonPlanDetailAction = createAsyncThunk(
  'lessonPlanSlice/getDetail',
  catchAsync(async (lessonPlanId: number) => {
    const res =
      await lessonPlanServices.getLessonPlanDetailService(lessonPlanId)

    return res.data
  })
)

export const getLessonPlanSummaryAction = createAsyncThunk(
  'lessonPlanSlice/getSummary',
  catchAsync(async (lessonPlanId: number) => {
    const res =
      await lessonPlanServices.getLessonPlanSummaryService(lessonPlanId)

    return res.data
  })
)

export const getWeeklyGridAction = createAsyncThunk(
  'lessonPlanSlice/getWeeklyGrid',
  catchAsync(async (data: { weekStartDate?: string; teacherId?: number }) => {
    const res = await lessonPlanServices.getWeeklyGridService(data)

    return res.data
  })
)

export const getSyllabusCompletionAction = createAsyncThunk(
  'lessonPlanSlice/getSyllabusCompletion',
  catchAsync(async (data: { classSectionId: number; subjectId: number }) => {
    const res = await lessonPlanServices.getSyllabusCompletionService(data)

    return res.data
  })
)

export const getLessonPlanTemplateListAction = createAsyncThunk(
  'lessonPlanSlice/getTemplateList',
  catchAsync(async (activeOnly?: boolean) => {
    const res =
      await lessonPlanServices.getLessonPlanTemplateListService(activeOnly)

    return res.data
  })
)

// MARK: - WRITES
export const createLessonPlanAction = createAsyncThunk(
  'lessonPlanSlice/create',
  catchAsync(
    async (data: {
      body: ICreateLessonPlanDto
      onSuccess?: (id: number) => void
    }) => {
      const res = await lessonPlanServices.createLessonPlanService(data.body)
      data.onSuccess?.(Number(res.data.id))

      return res
    },
    true,
    false
  )
)

export const updateLessonPlanAction = createAsyncThunk(
  'lessonPlanSlice/update',
  catchAsync(
    async (data: {
      lessonPlanId: number
      body: IUpdateLessonPlanDto
      onSuccess?: () => void
    }) => {
      const res = await lessonPlanServices.updateLessonPlanService(
        data.lessonPlanId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true,
    false
  )
)

export const deleteLessonPlanAction = createAsyncThunk(
  'lessonPlanSlice/delete',
  catchAsync(
    async (data: { lessonPlanId: number; onSuccess?: () => void }) => {
      const res = await lessonPlanServices.deleteLessonPlanService(
        data.lessonPlanId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false
  )
)

export const updateLessonPlanStatusAction = createAsyncThunk(
  'lessonPlanSlice/updateStatus',
  catchAsync(
    async (data: {
      lessonPlanId: number
      status: LessonPlan.Status
      review_comment?: string
      onSuccess?: () => void
    }) => {
      const res = await lessonPlanServices.updateLessonPlanStatusService(
        data.lessonPlanId,
        { status: data.status, review_comment: data.review_comment }
      )
      data.onSuccess?.()

      return res
    },
    true,
    false
  )
)

export const updateLessonPlanReflectionAction = createAsyncThunk(
  'lessonPlanSlice/updateReflection',
  catchAsync(
    async (data: {
      lessonPlanId: number
      teacherReflection: string
      onSuccess?: () => void
    }) => {
      const res = await lessonPlanServices.updateLessonPlanReflectionService(
        data.lessonPlanId,
        data.teacherReflection
      )
      data.onSuccess?.()

      return res
    },
    true,
    false
  )
)

export const addLessonPlanTopicsAction = createAsyncThunk(
  'lessonPlanSlice/addTopics',
  catchAsync(
    async (data: {
      lessonPlanId: number
      topicIds: number[]
      onSuccess?: () => void
    }) => {
      const res = await lessonPlanServices.addLessonPlanTopicsService(
        data.lessonPlanId,
        data.topicIds
      )
      data.onSuccess?.()

      return res
    },
    true,
    false
  )
)

export const removeLessonPlanTopicAction = createAsyncThunk(
  'lessonPlanSlice/removeTopic',
  catchAsync(
    async (data: {
      lessonPlanId: number
      topicId: number
      onSuccess?: () => void
    }) => {
      const res = await lessonPlanServices.removeLessonPlanTopicService(
        data.lessonPlanId,
        data.topicId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false
  )
)

export const uploadLessonPlanResourcesAction = createAsyncThunk(
  'lessonPlanSlice/uploadResources',
  catchAsync(
    async (data: {
      lessonPlanId: number
      files: File[]
      onSuccess?: () => void
    }) => {
      const res = await lessonPlanServices.uploadLessonPlanResourcesService(
        data.lessonPlanId,
        data.files
      )
      data.onSuccess?.()

      return res
    },
    true,
    false
  )
)

export const attachLessonPlanLinkAction = createAsyncThunk(
  'lessonPlanSlice/attachLink',
  catchAsync(
    async (data: {
      lessonPlanId: number
      url: string
      label?: string
      onSuccess?: () => void
    }) => {
      const res = await lessonPlanServices.attachLessonPlanLinkService(
        data.lessonPlanId,
        { url: data.url, label: data.label }
      )
      data.onSuccess?.()

      return res
    },
    true,
    false
  )
)

export const deleteLessonPlanResourceAction = createAsyncThunk(
  'lessonPlanSlice/deleteResource',
  catchAsync(
    async (data: {
      lessonPlanId: number
      resourceId: number
      onSuccess?: () => void
    }) => {
      const res = await lessonPlanServices.deleteLessonPlanResourceService(
        data.lessonPlanId,
        data.resourceId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false
  )
)

// MARK: - TEMPLATES
export const createLessonPlanTemplateAction = createAsyncThunk(
  'lessonPlanSlice/createTemplate',
  catchAsync(
    async (data: {
      body: ICreateLessonPlanTemplateDto
      onSuccess?: () => void
    }) => {
      const res = await lessonPlanServices.createLessonPlanTemplateService(
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true,
    false
  )
)

export const updateLessonPlanTemplateAction = createAsyncThunk(
  'lessonPlanSlice/updateTemplate',
  catchAsync(
    async (data: {
      templateId: number
      body: IUpdateLessonPlanTemplateDto
      onSuccess?: () => void
    }) => {
      const res = await lessonPlanServices.updateLessonPlanTemplateService(
        data.templateId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true,
    false
  )
)

export const setDefaultLessonPlanTemplateAction = createAsyncThunk(
  'lessonPlanSlice/setDefaultTemplate',
  catchAsync(
    async (data: { templateId: number; onSuccess?: () => void }) => {
      const res = await lessonPlanServices.setDefaultLessonPlanTemplateService(
        data.templateId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false
  )
)

export const deleteLessonPlanTemplateAction = createAsyncThunk(
  'lessonPlanSlice/deleteTemplate',
  catchAsync(
    async (data: { templateId: number; onSuccess?: () => void }) => {
      const res = await lessonPlanServices.deleteLessonPlanTemplateService(
        data.templateId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false
  )
)

const lessonPlanSlice = createSlice({
  name: 'lessonPlanSlice',
  initialState,
  reducers: {
    resetLessonPlanDetail: (state) => {
      state.planDetail.data = null
    },
  },
  extraReducers: (builder) => {
    // PLAN LIST
    builder.addCase(getLessonPlanListAction.pending, (state) => {
      state.planList.loading = true
    })
    builder.addCase(getLessonPlanListAction.fulfilled, (state, action) => {
      state.planList.loading = false
      state.planList.data = action.payload
    })
    builder.addCase(getLessonPlanListAction.rejected, (state) => {
      state.planList.loading = false
    })
    // PLAN STATS
    builder.addCase(getLessonPlanStatsAction.pending, (state) => {
      state.planStats.loading = true
    })
    builder.addCase(getLessonPlanStatsAction.fulfilled, (state, action) => {
      state.planStats.loading = false
      state.planStats.data = action.payload
    })
    builder.addCase(getLessonPlanStatsAction.rejected, (state) => {
      state.planStats.loading = false
    })
    // MY PLAN LIST
    builder.addCase(getMyLessonPlanListAction.pending, (state) => {
      state.myPlanList.loading = true
    })
    builder.addCase(getMyLessonPlanListAction.fulfilled, (state, action) => {
      state.myPlanList.loading = false
      state.myPlanList.data = action.payload
    })
    builder.addCase(getMyLessonPlanListAction.rejected, (state) => {
      state.myPlanList.loading = false
    })
    // PLAN DETAIL
    builder.addCase(getLessonPlanDetailAction.pending, (state) => {
      state.planDetail.loading = true
    })
    builder.addCase(getLessonPlanDetailAction.fulfilled, (state, action) => {
      state.planDetail.loading = false
      state.planDetail.data = action.payload
    })
    builder.addCase(getLessonPlanDetailAction.rejected, (state) => {
      state.planDetail.loading = false
    })
    // PLAN SUMMARY
    builder.addCase(getLessonPlanSummaryAction.pending, (state) => {
      state.planSummary.loading = true
    })
    builder.addCase(getLessonPlanSummaryAction.fulfilled, (state, action) => {
      state.planSummary.loading = false
      state.planSummary.data = action.payload
    })
    builder.addCase(getLessonPlanSummaryAction.rejected, (state) => {
      state.planSummary.loading = false
    })
    // WEEKLY GRID
    builder.addCase(getWeeklyGridAction.pending, (state) => {
      state.weeklyGrid.loading = true
    })
    builder.addCase(getWeeklyGridAction.fulfilled, (state, action) => {
      state.weeklyGrid.loading = false
      state.weeklyGrid.data = action.payload
    })
    builder.addCase(getWeeklyGridAction.rejected, (state) => {
      state.weeklyGrid.loading = false
    })
    // SYLLABUS COMPLETION
    builder.addCase(getSyllabusCompletionAction.pending, (state) => {
      state.syllabusCompletion.loading = true
    })
    builder.addCase(getSyllabusCompletionAction.fulfilled, (state, action) => {
      state.syllabusCompletion.loading = false
      state.syllabusCompletion.data = action.payload
    })
    builder.addCase(getSyllabusCompletionAction.rejected, (state) => {
      state.syllabusCompletion.loading = false
    })
    // TEMPLATE LIST
    builder.addCase(getLessonPlanTemplateListAction.pending, (state) => {
      state.templateList.loading = true
    })
    builder.addCase(
      getLessonPlanTemplateListAction.fulfilled,
      (state, action) => {
        state.templateList.loading = false
        state.templateList.data = action.payload
      }
    )
    builder.addCase(getLessonPlanTemplateListAction.rejected, (state) => {
      state.templateList.loading = false
    })
    // CREATE / UPDATE / DELETE PLAN
    builder.addCase(createLessonPlanAction.pending, (state) => {
      state.createPlan.loading = true
    })
    builder.addCase(createLessonPlanAction.fulfilled, (state) => {
      state.createPlan.loading = false
    })
    builder.addCase(createLessonPlanAction.rejected, (state) => {
      state.createPlan.loading = false
    })
    builder.addCase(updateLessonPlanAction.pending, (state) => {
      state.updatePlan.loading = true
    })
    builder.addCase(updateLessonPlanAction.fulfilled, (state) => {
      state.updatePlan.loading = false
    })
    builder.addCase(updateLessonPlanAction.rejected, (state) => {
      state.updatePlan.loading = false
    })
    builder.addCase(deleteLessonPlanAction.pending, (state) => {
      state.deletePlan.loading = true
    })
    builder.addCase(deleteLessonPlanAction.fulfilled, (state) => {
      state.deletePlan.loading = false
    })
    builder.addCase(deleteLessonPlanAction.rejected, (state) => {
      state.deletePlan.loading = false
    })
    // STATUS / REFLECTION / TOPICS / RESOURCES
    builder.addCase(updateLessonPlanStatusAction.pending, (state) => {
      state.statusMutation.loading = true
    })
    builder.addCase(updateLessonPlanStatusAction.fulfilled, (state) => {
      state.statusMutation.loading = false
    })
    builder.addCase(updateLessonPlanStatusAction.rejected, (state) => {
      state.statusMutation.loading = false
    })
    builder.addCase(updateLessonPlanReflectionAction.pending, (state) => {
      state.reflectionMutation.loading = true
    })
    builder.addCase(updateLessonPlanReflectionAction.fulfilled, (state) => {
      state.reflectionMutation.loading = false
    })
    builder.addCase(updateLessonPlanReflectionAction.rejected, (state) => {
      state.reflectionMutation.loading = false
    })
    builder.addCase(addLessonPlanTopicsAction.pending, (state) => {
      state.topicMutation.loading = true
    })
    builder.addCase(addLessonPlanTopicsAction.fulfilled, (state) => {
      state.topicMutation.loading = false
    })
    builder.addCase(addLessonPlanTopicsAction.rejected, (state) => {
      state.topicMutation.loading = false
    })
    builder.addCase(removeLessonPlanTopicAction.pending, (state) => {
      state.topicMutation.loading = true
    })
    builder.addCase(removeLessonPlanTopicAction.fulfilled, (state) => {
      state.topicMutation.loading = false
    })
    builder.addCase(removeLessonPlanTopicAction.rejected, (state) => {
      state.topicMutation.loading = false
    })
    builder.addCase(uploadLessonPlanResourcesAction.pending, (state) => {
      state.resourceMutation.loading = true
    })
    builder.addCase(uploadLessonPlanResourcesAction.fulfilled, (state) => {
      state.resourceMutation.loading = false
    })
    builder.addCase(uploadLessonPlanResourcesAction.rejected, (state) => {
      state.resourceMutation.loading = false
    })
    builder.addCase(attachLessonPlanLinkAction.pending, (state) => {
      state.resourceMutation.loading = true
    })
    builder.addCase(attachLessonPlanLinkAction.fulfilled, (state) => {
      state.resourceMutation.loading = false
    })
    builder.addCase(attachLessonPlanLinkAction.rejected, (state) => {
      state.resourceMutation.loading = false
    })
    builder.addCase(deleteLessonPlanResourceAction.pending, (state) => {
      state.resourceMutation.loading = true
    })
    builder.addCase(deleteLessonPlanResourceAction.fulfilled, (state) => {
      state.resourceMutation.loading = false
    })
    builder.addCase(deleteLessonPlanResourceAction.rejected, (state) => {
      state.resourceMutation.loading = false
    })
    // TEMPLATE MUTATIONS
    builder.addCase(createLessonPlanTemplateAction.pending, (state) => {
      state.templateMutation.loading = true
    })
    builder.addCase(createLessonPlanTemplateAction.fulfilled, (state) => {
      state.templateMutation.loading = false
    })
    builder.addCase(createLessonPlanTemplateAction.rejected, (state) => {
      state.templateMutation.loading = false
    })
    builder.addCase(updateLessonPlanTemplateAction.pending, (state) => {
      state.templateMutation.loading = true
    })
    builder.addCase(updateLessonPlanTemplateAction.fulfilled, (state) => {
      state.templateMutation.loading = false
    })
    builder.addCase(updateLessonPlanTemplateAction.rejected, (state) => {
      state.templateMutation.loading = false
    })
    builder.addCase(setDefaultLessonPlanTemplateAction.pending, (state) => {
      state.templateMutation.loading = true
    })
    builder.addCase(setDefaultLessonPlanTemplateAction.fulfilled, (state) => {
      state.templateMutation.loading = false
    })
    builder.addCase(setDefaultLessonPlanTemplateAction.rejected, (state) => {
      state.templateMutation.loading = false
    })
    builder.addCase(deleteLessonPlanTemplateAction.pending, (state) => {
      state.templateMutation.loading = true
    })
    builder.addCase(deleteLessonPlanTemplateAction.fulfilled, (state) => {
      state.templateMutation.loading = false
    })
    builder.addCase(deleteLessonPlanTemplateAction.rejected, (state) => {
      state.templateMutation.loading = false
    })
  },
})

export const { resetLessonPlanDetail } = lessonPlanSlice.actions

export default lessonPlanSlice.reducer
