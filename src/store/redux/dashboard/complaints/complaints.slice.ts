import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import { complaintServices, IComplaintFilters } from './complaints.service'

interface InitialState {
  complaintList: { data: Complaint.IList | null; loading: boolean }
  complaintStats: { data: Complaint.IStats | null; loading: boolean }
  complaintDetail: { data: Complaint.IDetail | null; loading: boolean }
  assignees: { data: Complaint.IAssignee[] | null; loading: boolean }
  createComplaint: { loading: boolean }
  updateComplaint: { loading: boolean }
  statusMutation: { loading: boolean }
  assignMutation: { loading: boolean }
  commentMutation: { loading: boolean }
  partyMutation: { loading: boolean }
  attachmentMutation: { loading: boolean }
  escalationMutation: { loading: boolean }
  reopenMutation: { loading: boolean }
  sweepMutation: { loading: boolean }
}

const initialState: InitialState = {
  complaintList: { data: null, loading: false },
  complaintStats: { data: null, loading: false },
  complaintDetail: { data: null, loading: false },
  assignees: { data: null, loading: false },
  createComplaint: { loading: false },
  updateComplaint: { loading: false },
  statusMutation: { loading: false },
  assignMutation: { loading: false },
  commentMutation: { loading: false },
  partyMutation: { loading: false },
  attachmentMutation: { loading: false },
  escalationMutation: { loading: false },
  reopenMutation: { loading: false },
  sweepMutation: { loading: false },
}

// MARK: - READS
export const getComplaintListAction = createAsyncThunk(
  'complaintSlice/getList',
  catchAsync(
    async (data: {
      filters?: IComplaintFilters
      page?: number
      limit?: number
    }) =>
      complaintServices.getComplaintListService(
        data.filters,
        data.page,
        data.limit
      )
  )
)

export const getComplaintStatsAction = createAsyncThunk(
  'complaintSlice/getStats',
  catchAsync<Complaint.IStats, void>(async () =>
    complaintServices.getComplaintStatsService()
  )
)

export const getComplaintDetailAction = createAsyncThunk(
  'complaintSlice/getDetail',
  catchAsync(async (complaintId: number) =>
    complaintServices.getComplaintDetailService(complaintId)
  )
)

export const getComplaintAssigneesAction = createAsyncThunk(
  'complaintSlice/getAssignees',
  catchAsync<Complaint.IAssignee[], void>(async () =>
    complaintServices.getComplaintAssigneesService()
  )
)

// MARK: - INTAKE
export const createComplaintAction = createAsyncThunk(
  'complaintSlice/create',
  catchAsync(
    async (
      data: Complaint.ICreateDto & { onSuccess?: (id: number) => void }
    ) => {
      const detail = await complaintServices.createComplaintService(data)
      data.onSuccess?.(detail.complaint_details.id)

      return detail
    },
    true,
    false,
    'Complaint logged successfully'
  )
)

export const updateComplaintAction = createAsyncThunk(
  'complaintSlice/update',
  catchAsync(
    async (data: {
      complaintId: number
      payload: Partial<Complaint.ICreateDto>
      onSuccess?: () => void
    }) => {
      const res = await complaintServices.updateComplaintService(
        data.complaintId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Complaint updated'
  )
)

// MARK: - WORKFLOW
export const changeComplaintStatusAction = createAsyncThunk(
  'complaintSlice/changeStatus',
  catchAsync(
    async (data: {
      complaintId: number
      payload: Complaint.IChangeStatusDto
      onSuccess?: () => void
    }) => {
      const res = await complaintServices.changeComplaintStatusService(
        data.complaintId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Status updated'
  )
)

export const assignComplaintAction = createAsyncThunk(
  'complaintSlice/assign',
  catchAsync(
    async (data: {
      complaintId: number
      payload: {
        assigned_to_user_id?: number | null
        assigned_department_id?: number | null
        reason?: string
        acknowledge?: boolean
      }
      onSuccess?: () => void
    }) => {
      const res = await complaintServices.assignComplaintService(
        data.complaintId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Complaint assigned'
  )
)

export const reopenComplaintAction = createAsyncThunk(
  'complaintSlice/reopen',
  catchAsync(
    async (data: {
      complaintId: number
      reason: string
      onSuccess?: () => void
    }) => {
      const res = await complaintServices.reopenComplaintService(
        data.complaintId,
        data.reason
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Complaint reopened'
  )
)

export const escalateComplaintAction = createAsyncThunk(
  'complaintSlice/escalate',
  catchAsync(
    async (data: {
      complaintId: number
      payload: {
        level?: number
        to_user_id?: number | null
        to_department_id?: number | null
        reason: string
      }
      onSuccess?: () => void
    }) => {
      const res = await complaintServices.escalateComplaintService(
        data.complaintId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Complaint escalated'
  )
)

// MARK: - TIMELINE, PARTIES, ATTACHMENTS
export const addComplaintCommentAction = createAsyncThunk(
  'complaintSlice/addComment',
  catchAsync(
    async (data: {
      complaintId: number
      payload: {
        body: string
        comment_type?: Complaint.CommentType
        visibility?: Complaint.Visibility
      }
      onSuccess?: () => void
    }) => {
      const res = await complaintServices.addComplaintCommentService(
        data.complaintId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Note added'
  )
)

export const deleteComplaintCommentAction = createAsyncThunk(
  'complaintSlice/deleteComment',
  catchAsync(
    async (data: {
      complaintId: number
      commentId: number
      onSuccess?: () => void
    }) => {
      const res = await complaintServices.deleteComplaintCommentService(
        data.complaintId,
        data.commentId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Note deleted'
  )
)

export const addComplaintPartyAction = createAsyncThunk(
  'complaintSlice/addParty',
  catchAsync(
    async (data: {
      complaintId: number
      payload: Complaint.IPartyDto
      onSuccess?: () => void
    }) => {
      const res = await complaintServices.addComplaintPartyService(
        data.complaintId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Party added'
  )
)

export const removeComplaintPartyAction = createAsyncThunk(
  'complaintSlice/removeParty',
  catchAsync(
    async (data: {
      complaintId: number
      partyId: number
      onSuccess?: () => void
    }) => {
      const res = await complaintServices.removeComplaintPartyService(
        data.complaintId,
        data.partyId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Party removed'
  )
)

export const addComplaintAttachmentAction = createAsyncThunk(
  'complaintSlice/addAttachment',
  catchAsync(
    async (data: {
      complaintId: number
      payload: {
        external_url?: string
        label?: string
        file_type?: string
        asset_id?: number
      }
      onSuccess?: () => void
    }) => {
      const res = await complaintServices.addComplaintAttachmentService(
        data.complaintId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Attachment added'
  )
)

export const removeComplaintAttachmentAction = createAsyncThunk(
  'complaintSlice/removeAttachment',
  catchAsync(
    async (data: {
      complaintId: number
      attachmentId: number
      onSuccess?: () => void
    }) => {
      const res = await complaintServices.removeComplaintAttachmentService(
        data.complaintId,
        data.attachmentId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Attachment removed'
  )
)

// MARK: - AUTOMATION
export const runComplaintSlaSweepAction = createAsyncThunk(
  'complaintSlice/sweep',
  catchAsync(
    async (data?: { onSuccess?: (result: Complaint.ISweepResult) => void }) => {
      const result = await complaintServices.runComplaintSlaSweepService()
      data?.onSuccess?.(result)

      return result
    },
    true,
    false,
    'SLA sweep completed'
  )
)

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    resetComplaintDetail: (state) => {
      state.complaintDetail = { data: null, loading: false }
    },
  },
  extraReducers: (builder) => {
    builder
      // reads
      .addCase(getComplaintListAction.pending, (state) => {
        state.complaintList.loading = true
      })
      .addCase(getComplaintListAction.fulfilled, (state, action) => {
        state.complaintList = { data: action.payload, loading: false }
      })
      .addCase(getComplaintListAction.rejected, (state) => {
        state.complaintList.loading = false
      })
      .addCase(getComplaintStatsAction.pending, (state) => {
        state.complaintStats.loading = true
      })
      .addCase(getComplaintStatsAction.fulfilled, (state, action) => {
        state.complaintStats = { data: action.payload, loading: false }
      })
      .addCase(getComplaintStatsAction.rejected, (state) => {
        state.complaintStats.loading = false
      })
      .addCase(getComplaintDetailAction.pending, (state) => {
        state.complaintDetail.loading = true
      })
      .addCase(getComplaintDetailAction.fulfilled, (state, action) => {
        state.complaintDetail = { data: action.payload, loading: false }
      })
      .addCase(getComplaintDetailAction.rejected, (state) => {
        state.complaintDetail.loading = false
      })
      .addCase(getComplaintAssigneesAction.pending, (state) => {
        state.assignees.loading = true
      })
      .addCase(getComplaintAssigneesAction.fulfilled, (state, action) => {
        state.assignees = { data: action.payload, loading: false }
      })
      .addCase(getComplaintAssigneesAction.rejected, (state) => {
        state.assignees.loading = false
      })
      // intake
      .addCase(createComplaintAction.pending, (state) => {
        state.createComplaint.loading = true
      })
      .addCase(createComplaintAction.fulfilled, (state) => {
        state.createComplaint.loading = false
      })
      .addCase(createComplaintAction.rejected, (state) => {
        state.createComplaint.loading = false
      })
      .addCase(updateComplaintAction.pending, (state) => {
        state.updateComplaint.loading = true
      })
      .addCase(updateComplaintAction.fulfilled, (state) => {
        state.updateComplaint.loading = false
      })
      .addCase(updateComplaintAction.rejected, (state) => {
        state.updateComplaint.loading = false
      })
      // workflow
      .addCase(changeComplaintStatusAction.pending, (state) => {
        state.statusMutation.loading = true
      })
      .addCase(changeComplaintStatusAction.fulfilled, (state) => {
        state.statusMutation.loading = false
      })
      .addCase(changeComplaintStatusAction.rejected, (state) => {
        state.statusMutation.loading = false
      })
      .addCase(assignComplaintAction.pending, (state) => {
        state.assignMutation.loading = true
      })
      .addCase(assignComplaintAction.fulfilled, (state) => {
        state.assignMutation.loading = false
      })
      .addCase(assignComplaintAction.rejected, (state) => {
        state.assignMutation.loading = false
      })
      .addCase(reopenComplaintAction.pending, (state) => {
        state.reopenMutation.loading = true
      })
      .addCase(reopenComplaintAction.fulfilled, (state) => {
        state.reopenMutation.loading = false
      })
      .addCase(reopenComplaintAction.rejected, (state) => {
        state.reopenMutation.loading = false
      })
      .addCase(escalateComplaintAction.pending, (state) => {
        state.escalationMutation.loading = true
      })
      .addCase(escalateComplaintAction.fulfilled, (state) => {
        state.escalationMutation.loading = false
      })
      .addCase(escalateComplaintAction.rejected, (state) => {
        state.escalationMutation.loading = false
      })

      // timeline / parties / attachments
      .addCase(addComplaintCommentAction.pending, (state) => {
        state.commentMutation.loading = true
      })
      .addCase(addComplaintCommentAction.fulfilled, (state) => {
        state.commentMutation.loading = false
      })
      .addCase(addComplaintCommentAction.rejected, (state) => {
        state.commentMutation.loading = false
      })
      .addCase(deleteComplaintCommentAction.pending, (state) => {
        state.commentMutation.loading = true
      })
      .addCase(deleteComplaintCommentAction.fulfilled, (state) => {
        state.commentMutation.loading = false
      })
      .addCase(deleteComplaintCommentAction.rejected, (state) => {
        state.commentMutation.loading = false
      })
      .addCase(addComplaintPartyAction.pending, (state) => {
        state.partyMutation.loading = true
      })
      .addCase(addComplaintPartyAction.fulfilled, (state) => {
        state.partyMutation.loading = false
      })
      .addCase(addComplaintPartyAction.rejected, (state) => {
        state.partyMutation.loading = false
      })
      .addCase(removeComplaintPartyAction.pending, (state) => {
        state.partyMutation.loading = true
      })
      .addCase(removeComplaintPartyAction.fulfilled, (state) => {
        state.partyMutation.loading = false
      })
      .addCase(removeComplaintPartyAction.rejected, (state) => {
        state.partyMutation.loading = false
      })
      .addCase(addComplaintAttachmentAction.pending, (state) => {
        state.attachmentMutation.loading = true
      })
      .addCase(addComplaintAttachmentAction.fulfilled, (state) => {
        state.attachmentMutation.loading = false
      })
      .addCase(addComplaintAttachmentAction.rejected, (state) => {
        state.attachmentMutation.loading = false
      })
      .addCase(removeComplaintAttachmentAction.pending, (state) => {
        state.attachmentMutation.loading = true
      })
      .addCase(removeComplaintAttachmentAction.fulfilled, (state) => {
        state.attachmentMutation.loading = false
      })
      .addCase(removeComplaintAttachmentAction.rejected, (state) => {
        state.attachmentMutation.loading = false
      })
      .addCase(runComplaintSlaSweepAction.pending, (state) => {
        state.sweepMutation.loading = true
      })
      .addCase(runComplaintSlaSweepAction.fulfilled, (state) => {
        state.sweepMutation.loading = false
      })
      .addCase(runComplaintSlaSweepAction.rejected, (state) => {
        state.sweepMutation.loading = false
      })
  },
})

export const { resetComplaintDetail } = complaintsSlice.actions

export default complaintsSlice.reducer
