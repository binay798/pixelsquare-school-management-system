import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import * as services from './rooms.service'

interface InitialState {
  master: { data: Rooms.IMasterData | null; loading: boolean }
  rooms: { data: Rooms.IRoomListRow[] | null; total: number; loading: boolean }
  roomDetail: { data: Rooms.IRoomDetailRow | null; loading: boolean }
  bookings: {
    data: Rooms.IBookingListRow[] | null
    total: number
    loading: boolean
  }
  allocations: {
    data: Rooms.IAllocationListRow[] | null
    total: number
    loading: boolean
  }
  sections: { data: Rooms.ISectionOverviewRow[] | null; loading: boolean }
  maintenance: {
    data: Rooms.IMaintenanceListRow[] | null
    total: number
    loading: boolean
  }
  schedule: { data: Rooms.IScheduleRow[] | null; loading: boolean }
  overview: { data: Rooms.IOverview | null; loading: boolean }
  availability: { data: Rooms.IAvailability | null; loading: boolean }
  mutation: { loading: boolean }
}

const initialState: InitialState = {
  master: { data: null, loading: false },
  rooms: { data: null, total: 0, loading: false },
  roomDetail: { data: null, loading: false },
  bookings: { data: null, total: 0, loading: false },
  allocations: { data: null, total: 0, loading: false },
  sections: { data: null, loading: false },
  maintenance: { data: null, total: 0, loading: false },
  schedule: { data: null, loading: false },
  overview: { data: null, loading: false },
  availability: { data: null, loading: false },
  mutation: { loading: false },
}

// MARK: - MASTER DATA
export const getRoomMasterDataAction = createAsyncThunk(
  'rooms/getMasterData',
  catchAsync(async () => services.getRoomMasterDataService())
)

// MARK: - ROOMS
export const getRoomListAction = createAsyncThunk(
  'rooms/getList',
  catchAsync(async (filters: services.IRoomFilters) =>
    services.getRoomListService(filters)
  )
)

export const getRoomDetailAction = createAsyncThunk(
  'rooms/getDetail',
  catchAsync(async (roomId: number) => services.getRoomDetailService(roomId))
)

export const saveRoomAction = createAsyncThunk(
  'rooms/save',
  catchAsync(
    async (data: {
      roomId?: number
      body: Record<string, unknown>
      onSuccess?: () => void
    }) => {
      const res = data.roomId
        ? await services.updateRoomService(data.roomId, data.body)
        : await services.createRoomService(data.body)

      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Room saved successfully.'
  )
)

export const deactivateRoomAction = createAsyncThunk(
  'rooms/deactivate',
  catchAsync(
    async (data: { roomId: number; onSuccess?: () => void }) => {
      const res = await services.deactivateRoomService(data.roomId)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Room deactivated.'
  )
)

// MARK: - SECTION ALLOCATIONS
export const getAllocationListAction = createAsyncThunk(
  'rooms/getAllocations',
  catchAsync(async (filters: services.IAllocationFilters) =>
    services.getAllocationListService(filters)
  )
)

export const getSectionOverviewAction = createAsyncThunk(
  'rooms/getSectionOverview',
  catchAsync(async (academicYearId?: number) =>
    services.getSectionOverviewService(academicYearId)
  )
)

export const saveAllocationAction = createAsyncThunk(
  'rooms/saveAllocation',
  catchAsync(
    async (data: {
      allocationId?: number
      body: Record<string, unknown>
      onSuccess?: () => void
    }) => {
      const res = data.allocationId
        ? await services.updateAllocationService(data.allocationId, data.body)
        : await services.createAllocationService(data.body)

      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Classroom allocation saved.'
  )
)

export const deactivateAllocationAction = createAsyncThunk(
  'rooms/deactivateAllocation',
  catchAsync(
    async (data: { allocationId: number; onSuccess?: () => void }) => {
      const res = await services.deactivateAllocationService(data.allocationId)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Allocation closed.'
  )
)

// MARK: - BOOKINGS
export const getBookingListAction = createAsyncThunk(
  'rooms/getBookings',
  catchAsync(async (filters: services.IBookingFilters) =>
    services.getBookingListService(filters)
  )
)

export const createBookingAction = createAsyncThunk(
  'rooms/createBooking',
  catchAsync(
    async (data: {
      body: Record<string, unknown>
      onSuccess?: () => void
      catchFailure?: () => void
    }) => {
      const res = await services.createBookingService(data.body)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Booking confirmed.'
  )
)

export const cancelBookingAction = createAsyncThunk(
  'rooms/cancelBooking',
  catchAsync(
    async (data: { bookingId: number; onSuccess?: () => void }) => {
      const res = await services.cancelBookingService(data.bookingId)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Booking cancelled.'
  )
)

export const checkRoomAvailabilityAction = createAsyncThunk(
  'rooms/checkAvailability',
  catchAsync(async (body: Record<string, unknown>) =>
    services.checkRoomAvailabilityService(body)
  )
)

// MARK: - MAINTENANCE
export const getMaintenanceListAction = createAsyncThunk(
  'rooms/getMaintenance',
  catchAsync(async (filters: services.IMaintenanceFilters) =>
    services.getMaintenanceListService(filters)
  )
)

export const saveMaintenanceAction = createAsyncThunk(
  'rooms/saveMaintenance',
  catchAsync(
    async (data: {
      maintenanceId?: number
      body: Record<string, unknown>
      onSuccess?: () => void
    }) => {
      const res = data.maintenanceId
        ? await services.updateMaintenanceService(data.maintenanceId, data.body)
        : await services.createMaintenanceService(data.body)

      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Maintenance record saved.'
  )
)

export const deleteMaintenanceAction = createAsyncThunk(
  'rooms/deleteMaintenance',
  catchAsync(
    async (data: { maintenanceId: number; onSuccess?: () => void }) => {
      const res = await services.deleteMaintenanceService(data.maintenanceId)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Maintenance record deleted.'
  )
)

// MARK: - SCHEDULE / OVERVIEW
export const getScheduleAction = createAsyncThunk(
  'rooms/getSchedule',
  catchAsync(async (data: { date: string; roomIds?: number[] }) =>
    services.getRoomScheduleService(data.date, data.roomIds)
  )
)

export const getRoomAvailabilityAction = createAsyncThunk(
  'rooms/getAvailability',
  catchAsync(async (data: { roomId: number; date: string }) =>
    services.getRoomAvailabilityService(data.roomId, data.date)
  )
)

export const getRoomOverviewAction = createAsyncThunk(
  'rooms/getOverview',
  catchAsync(async (date?: string) => services.getRoomOverviewService(date))
)

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getRoomMasterDataAction.pending, (state) => {
      state.master.loading = true
    })
    builder.addCase(getRoomMasterDataAction.fulfilled, (state, action) => {
      state.master.loading = false
      state.master.data = action.payload
    })
    builder.addCase(getRoomMasterDataAction.rejected, (state) => {
      state.master.loading = false
    })

    builder.addCase(getRoomListAction.pending, (state) => {
      state.rooms.loading = true
    })
    builder.addCase(getRoomListAction.fulfilled, (state, action) => {
      state.rooms.loading = false
      state.rooms.data = action.payload.rows
      state.rooms.total = Number(action.payload.total)
    })
    builder.addCase(getRoomListAction.rejected, (state) => {
      state.rooms.loading = false
    })

    builder.addCase(getRoomDetailAction.pending, (state) => {
      state.roomDetail.loading = true
    })
    builder.addCase(getRoomDetailAction.fulfilled, (state, action) => {
      state.roomDetail.loading = false
      state.roomDetail.data = action.payload
    })
    builder.addCase(getRoomDetailAction.rejected, (state) => {
      state.roomDetail.loading = false
    })

    builder.addCase(getAllocationListAction.pending, (state) => {
      state.allocations.loading = true
    })
    builder.addCase(getAllocationListAction.fulfilled, (state, action) => {
      state.allocations.loading = false
      state.allocations.data = action.payload.rows
      state.allocations.total = Number(action.payload.total)
    })
    builder.addCase(getAllocationListAction.rejected, (state) => {
      state.allocations.loading = false
    })

    builder.addCase(getSectionOverviewAction.pending, (state) => {
      state.sections.loading = true
    })
    builder.addCase(getSectionOverviewAction.fulfilled, (state, action) => {
      state.sections.loading = false
      state.sections.data = action.payload
    })
    builder.addCase(getSectionOverviewAction.rejected, (state) => {
      state.sections.loading = false
    })

    builder.addCase(getBookingListAction.pending, (state) => {
      state.bookings.loading = true
    })
    builder.addCase(getBookingListAction.fulfilled, (state, action) => {
      state.bookings.loading = false
      state.bookings.data = action.payload.rows
      state.bookings.total = Number(action.payload.total)
    })
    builder.addCase(getBookingListAction.rejected, (state) => {
      state.bookings.loading = false
    })

    builder.addCase(getMaintenanceListAction.pending, (state) => {
      state.maintenance.loading = true
    })
    builder.addCase(getMaintenanceListAction.fulfilled, (state, action) => {
      state.maintenance.loading = false
      state.maintenance.data = action.payload.rows
      state.maintenance.total = Number(action.payload.total)
    })
    builder.addCase(getMaintenanceListAction.rejected, (state) => {
      state.maintenance.loading = false
    })

    builder.addCase(getScheduleAction.pending, (state) => {
      state.schedule.loading = true
    })
    builder.addCase(getScheduleAction.fulfilled, (state, action) => {
      state.schedule.loading = false
      state.schedule.data = action.payload
    })
    builder.addCase(getScheduleAction.rejected, (state) => {
      state.schedule.loading = false
    })

    builder.addCase(getRoomOverviewAction.pending, (state) => {
      state.overview.loading = true
    })
    builder.addCase(getRoomOverviewAction.fulfilled, (state, action) => {
      state.overview.loading = false
      state.overview.data = action.payload
    })
    builder.addCase(getRoomOverviewAction.rejected, (state) => {
      state.overview.loading = false
    })

    builder.addCase(getRoomAvailabilityAction.pending, (state) => {
      state.availability.loading = true
    })
    builder.addCase(getRoomAvailabilityAction.fulfilled, (state, action) => {
      state.availability.loading = false
      state.availability.data = action.payload
    })
    builder.addCase(getRoomAvailabilityAction.rejected, (state) => {
      state.availability.loading = false
    })

    // every write shares one loading flag: only one dialog is open at a time
    ;[
      saveRoomAction,
      deactivateRoomAction,
      saveAllocationAction,
      deactivateAllocationAction,
      createBookingAction,
      cancelBookingAction,
      saveMaintenanceAction,
      deleteMaintenanceAction,
    ].forEach((thunkAction) => {
      builder.addCase(thunkAction.pending, (state) => {
        state.mutation.loading = true
      })
      builder.addCase(thunkAction.fulfilled, (state) => {
        state.mutation.loading = false
      })
      builder.addCase(thunkAction.rejected, (state) => {
        state.mutation.loading = false
      })
    })
  },
})

export default roomsSlice.reducer
