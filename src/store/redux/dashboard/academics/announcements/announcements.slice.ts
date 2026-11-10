import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import {
  announcementServices,
  IAnnouncementFeedFilters,
  IAnnouncementFilters,
  IAnnouncementRecipientFilters,
  ICreateAnnouncementDto,
  IUpdateAnnouncementDto,
  IUpdateAnnouncementStatusDto,
} from './announcements.service'

interface InitialState {
  announcementList: {
    data: Announcement.IList | null
    loading: boolean
  }
  announcementStats: {
    data: Announcement.IStats | null
    loading: boolean
  }
  feedList: {
    data: Announcement.IFeed | null
    loading: boolean
  }
  unreadSummary: {
    data: Announcement.IUnreadSummary | null
    loading: boolean
  }
  announcementDetail: {
    data: Announcement.IDetail | null
    loading: boolean
  }
  analytics: {
    data: Announcement.IAnalytics | null
    loading: boolean
  }
  recipientList: {
    data: Announcement.IRecipientList | null
    loading: boolean
  }
  createAnnouncement: { loading: boolean }
  updateAnnouncement: { loading: boolean }
  deleteAnnouncement: { loading: boolean }
  statusMutation: { loading: boolean }
  receiptMutation: { loading: boolean }
}

const initialState: InitialState = {
  announcementList: { data: null, loading: false },
  announcementStats: { data: null, loading: false },
  feedList: { data: null, loading: false },
  unreadSummary: { data: null, loading: false },
  announcementDetail: { data: null, loading: false },
  analytics: { data: null, loading: false },
  recipientList: { data: null, loading: false },
  createAnnouncement: { loading: false },
  updateAnnouncement: { loading: false },
  deleteAnnouncement: { loading: false },
  statusMutation: { loading: false },
  receiptMutation: { loading: false },
}

/** Mirrors a read/acknowledge receipt into the cached detail & feed rows. */
const applyReceiptToState = (
  state: InitialState,
  announcementId: number,
  receipt: Announcement.IReceipt
) => {
  if (
    state.announcementDetail.data?.announcement_details.id === announcementId
  ) {
    state.announcementDetail.data = {
      ...state.announcementDetail.data,
      ...receipt,
    }
  }

  state.feedList.data?.rows.forEach((row) => {
    if (row.announcement_details.id === announcementId) {
      row.is_read = receipt.is_read
      row.read_at = receipt.read_at
      row.acknowledged_at = receipt.acknowledged_at
    }
  })
}

// MARK: - READS
export const getAnnouncementListAction = createAsyncThunk(
  'announcementSlice/getList',
  catchAsync(
    async (data: {
      filters?: IAnnouncementFilters
      page?: number
      limit?: number
    }) => {
      const res = await announcementServices.getAnnouncementListService(
        data.filters,
        data.page,
        data.limit
      )

      return res
    }
  )
)

export const getAnnouncementStatsAction = createAsyncThunk(
  'announcementSlice/getStats',
  catchAsync(async (data?: { onSuccess?: () => void }) => {
    const res = await announcementServices.getAnnouncementStatsService()
    data?.onSuccess?.()

    return res
  })
)

export const getAnnouncementDetailAction = createAsyncThunk(
  'announcementSlice/getDetail',
  catchAsync(async (announcementId: number) => {
    const res =
      await announcementServices.getAnnouncementDetailService(announcementId)

    return res
  })
)

export const getAnnouncementAnalyticsAction = createAsyncThunk(
  'announcementSlice/getAnalytics',
  catchAsync(async (announcementId: number) => {
    const res =
      await announcementServices.getAnnouncementAnalyticsService(announcementId)

    return res
  })
)

export const getAnnouncementRecipientsAction = createAsyncThunk(
  'announcementSlice/getRecipients',
  catchAsync(
    async (data: {
      announcementId: number
      filters?: IAnnouncementRecipientFilters
      page?: number
      limit?: number
    }) => {
      const res = await announcementServices.getAnnouncementRecipientsService(
        data.announcementId,
        data.filters,
        data.page,
        data.limit
      )

      return res
    }
  )
)

// MARK: - READER BOARD
export const getAnnouncementFeedAction = createAsyncThunk(
  'announcementSlice/getFeed',
  catchAsync(
    async (data: {
      filters?: IAnnouncementFeedFilters
      page?: number
      limit?: number
    }) => {
      const res = await announcementServices.getAnnouncementFeedService(
        data.filters,
        data.page,
        data.limit
      )

      return res
    }
  )
)

export const getAnnouncementUnreadSummaryAction = createAsyncThunk(
  'announcementSlice/getUnreadSummary',
  catchAsync(async (data?: { onSuccess?: () => void }) => {
    const res = await announcementServices.getAnnouncementUnreadSummaryService()
    data?.onSuccess?.()

    return res
  })
)

// MARK: - WRITES
export const createAnnouncementAction = createAsyncThunk(
  'announcementSlice/create',
  catchAsync(
    async (data: {
      body: ICreateAnnouncementDto
      onSuccess?: (id: number) => void
    }) => {
      const res = await announcementServices.createAnnouncementService(
        data.body
      )
      data.onSuccess?.(Number(res.id))

      return res
    },
    true,
    false,
    'Announcement created successfully'
  )
)

export const updateAnnouncementAction = createAsyncThunk(
  'announcementSlice/update',
  catchAsync(
    async (data: {
      announcementId: number
      body: IUpdateAnnouncementDto
      onSuccess?: () => void
    }) => {
      const res = await announcementServices.updateAnnouncementService(
        data.announcementId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Announcement updated successfully'
  )
)

export const updateAnnouncementStatusAction = createAsyncThunk(
  'announcementSlice/updateStatus',
  catchAsync(
    async (data: {
      announcementId: number
      body: IUpdateAnnouncementStatusDto
      onSuccess?: () => void
    }) => {
      const res = await announcementServices.updateAnnouncementStatusService(
        data.announcementId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Announcement status updated'
  )
)

export const deleteAnnouncementAction = createAsyncThunk(
  'announcementSlice/delete',
  catchAsync(
    async (data: { announcementId: number; onSuccess?: () => void }) => {
      const res = await announcementServices.deleteAnnouncementService(
        data.announcementId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Announcement deleted successfully'
  )
)

export const markAnnouncementReadAction = createAsyncThunk(
  'announcementSlice/markRead',
  catchAsync(async (announcementId: number) => {
    const res =
      await announcementServices.markAnnouncementReadService(announcementId)

    return { announcementId, receipt: res.receipt }
  }, false)
)

export const acknowledgeAnnouncementAction = createAsyncThunk(
  'announcementSlice/acknowledge',
  catchAsync(
    async (announcementId: number) => {
      const res =
        await announcementServices.acknowledgeAnnouncementService(
          announcementId
        )

      return { announcementId, receipt: res.receipt }
    },
    true,
    false,
    'Acknowledgement recorded'
  )
)

const announcementSlice = createSlice({
  name: 'announcementSlice',
  initialState,
  reducers: {
    resetAnnouncementDetail: (state) => {
      state.announcementDetail.data = null
    },
    resetAnnouncementAnalytics: (state) => {
      state.analytics.data = null
    },
    resetAnnouncementRecipients: (state) => {
      state.recipientList.data = null
    },
    resetAnnouncementFeed: (state) => {
      state.feedList.data = null
    },
  },
  extraReducers: (builder) => {
    // LIST
    builder.addCase(getAnnouncementListAction.pending, (state) => {
      state.announcementList.loading = true
    })
    builder.addCase(getAnnouncementListAction.fulfilled, (state, action) => {
      state.announcementList.loading = false
      state.announcementList.data = action.payload
    })
    builder.addCase(getAnnouncementListAction.rejected, (state) => {
      state.announcementList.loading = false
    })
    // STATS
    builder.addCase(getAnnouncementStatsAction.pending, (state) => {
      state.announcementStats.loading = true
    })
    builder.addCase(getAnnouncementStatsAction.fulfilled, (state, action) => {
      state.announcementStats.loading = false
      state.announcementStats.data = action.payload
    })
    builder.addCase(getAnnouncementStatsAction.rejected, (state) => {
      state.announcementStats.loading = false
    })
    // DETAIL
    builder.addCase(getAnnouncementDetailAction.pending, (state) => {
      state.announcementDetail.loading = true
    })
    builder.addCase(getAnnouncementDetailAction.fulfilled, (state, action) => {
      state.announcementDetail.loading = false
      state.announcementDetail.data = action.payload
    })
    builder.addCase(getAnnouncementDetailAction.rejected, (state) => {
      state.announcementDetail.loading = false
    })
    // ANALYTICS
    builder.addCase(getAnnouncementAnalyticsAction.pending, (state) => {
      state.analytics.loading = true
    })
    builder.addCase(
      getAnnouncementAnalyticsAction.fulfilled,
      (state, action) => {
        state.analytics.loading = false
        state.analytics.data = action.payload
      }
    )
    builder.addCase(getAnnouncementAnalyticsAction.rejected, (state) => {
      state.analytics.loading = false
    })
    // RECIPIENTS
    builder.addCase(getAnnouncementRecipientsAction.pending, (state) => {
      state.recipientList.loading = true
    })
    builder.addCase(
      getAnnouncementRecipientsAction.fulfilled,
      (state, action) => {
        state.recipientList.loading = false
        state.recipientList.data = action.payload
      }
    )
    builder.addCase(getAnnouncementRecipientsAction.rejected, (state) => {
      state.recipientList.loading = false
    })
    // FEED
    builder.addCase(getAnnouncementFeedAction.pending, (state) => {
      state.feedList.loading = true
    })
    builder.addCase(getAnnouncementFeedAction.fulfilled, (state, action) => {
      state.feedList.loading = false
      state.feedList.data = action.payload
    })
    builder.addCase(getAnnouncementFeedAction.rejected, (state) => {
      state.feedList.loading = false
    })
    // UNREAD SUMMARY
    builder.addCase(getAnnouncementUnreadSummaryAction.pending, (state) => {
      state.unreadSummary.loading = true
    })
    builder.addCase(
      getAnnouncementUnreadSummaryAction.fulfilled,
      (state, action) => {
        state.unreadSummary.loading = false
        state.unreadSummary.data = action.payload
      }
    )
    builder.addCase(getAnnouncementUnreadSummaryAction.rejected, (state) => {
      state.unreadSummary.loading = false
    })
    // CREATE
    builder.addCase(createAnnouncementAction.pending, (state) => {
      state.createAnnouncement.loading = true
    })
    builder.addCase(createAnnouncementAction.fulfilled, (state) => {
      state.createAnnouncement.loading = false
    })
    builder.addCase(createAnnouncementAction.rejected, (state) => {
      state.createAnnouncement.loading = false
    })
    // UPDATE
    builder.addCase(updateAnnouncementAction.pending, (state) => {
      state.updateAnnouncement.loading = true
    })
    builder.addCase(updateAnnouncementAction.fulfilled, (state) => {
      state.updateAnnouncement.loading = false
    })
    builder.addCase(updateAnnouncementAction.rejected, (state) => {
      state.updateAnnouncement.loading = false
    })
    // DELETE
    builder.addCase(deleteAnnouncementAction.pending, (state) => {
      state.deleteAnnouncement.loading = true
    })
    builder.addCase(deleteAnnouncementAction.fulfilled, (state) => {
      state.deleteAnnouncement.loading = false
    })
    builder.addCase(deleteAnnouncementAction.rejected, (state) => {
      state.deleteAnnouncement.loading = false
    })
    // STATUS
    builder.addCase(updateAnnouncementStatusAction.pending, (state) => {
      state.statusMutation.loading = true
    })
    builder.addCase(updateAnnouncementStatusAction.fulfilled, (state) => {
      state.statusMutation.loading = false
    })
    builder.addCase(updateAnnouncementStatusAction.rejected, (state) => {
      state.statusMutation.loading = false
    })
    // RECEIPTS
    builder.addCase(markAnnouncementReadAction.pending, (state) => {
      state.receiptMutation.loading = true
    })
    builder.addCase(markAnnouncementReadAction.fulfilled, (state, action) => {
      state.receiptMutation.loading = false
      applyReceiptToState(
        state,
        action.payload.announcementId,
        action.payload.receipt
      )
    })
    builder.addCase(markAnnouncementReadAction.rejected, (state) => {
      state.receiptMutation.loading = false
    })
    builder.addCase(acknowledgeAnnouncementAction.pending, (state) => {
      state.receiptMutation.loading = true
    })
    builder.addCase(
      acknowledgeAnnouncementAction.fulfilled,
      (state, action) => {
        state.receiptMutation.loading = false
        applyReceiptToState(
          state,
          action.payload.announcementId,
          action.payload.receipt
        )
      }
    )
    builder.addCase(acknowledgeAnnouncementAction.rejected, (state) => {
      state.receiptMutation.loading = false
    })
  },
})

export const {
  resetAnnouncementDetail,
  resetAnnouncementAnalytics,
  resetAnnouncementRecipients,
  resetAnnouncementFeed,
} = announcementSlice.actions

export default announcementSlice.reducer
