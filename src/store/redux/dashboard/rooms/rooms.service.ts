import { api } from '@src/helpers/api.helpers'

type RequestBody = Record<string, unknown>

/** Drops `undefined` values so the shared axios param serializer stays clean. */
const toParams = <T extends object>(params: T) => {
  const cleaned: { [key: string]: string | number } = {}

  Object.entries(params as Record<string, string | number | undefined>).forEach(
    ([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value
      }
    }
  )

  return cleaned
}

// MARK: - MASTER DATA
export const getRoomMasterDataService = async () => {
  const res = await api<Api.Base<Rooms.IMasterData>>('get')('rooms/master')

  return res.data.data.data
}

// MARK: - ROOMS
export interface IRoomFilters {
  page?: number
  limit?: number
  building_id?: number
  floor_id?: number
  room_type_id?: number
  status?: string
  search?: string
}

export const getRoomListService = async (filters: IRoomFilters = {}) => {
  const res = await api<Api.Base<Api.PaginatedData<Rooms.IRoomListRow>>>('get')(
    'rooms',
    toParams(filters)
  )

  return res.data.data.data
}

export const getRoomDetailService = async (roomId: number) => {
  const res = await api<Api.Base<Rooms.IRoomDetailRow>>('get')(
    `rooms/${roomId}`
  )

  return res.data.data.data
}

export const createRoomService = async (body: RequestBody) => {
  const res = await api<Api.Base<Rooms.IRoom>>('post')('rooms', undefined, body)

  return res.data.data.data
}

export const updateRoomService = async (roomId: number, body: RequestBody) => {
  const res = await api<Api.Base<Rooms.IRoom>>('patch')(
    `rooms/${roomId}`,
    undefined,
    body
  )

  return res.data.data.data
}

export const deactivateRoomService = async (roomId: number) => {
  const res = await api<Api.Base<object>>('delete')(`rooms/${roomId}`)

  return res.data.data.data
}

// MARK: - BUILDINGS / FLOORS
export const createBuildingService = async (body: RequestBody) => {
  const res = await api<Api.Base<Rooms.IBuilding>>('post')(
    'rooms/buildings',
    undefined,
    body
  )

  return res.data.data.data
}

export const updateBuildingService = async (
  buildingId: number,
  body: RequestBody
) => {
  const res = await api<Api.Base<Rooms.IBuilding>>('patch')(
    `rooms/buildings/${buildingId}`,
    undefined,
    body
  )

  return res.data.data.data
}

export const deleteBuildingService = async (buildingId: number) => {
  const res = await api<Api.Base<object>>('delete')(
    `rooms/buildings/${buildingId}`
  )

  return res.data.data.data
}

export const getFloorListService = async (buildingId: number) => {
  const res = await api<Api.Base<Rooms.IFloor[]>>('get')(
    `rooms/buildings/${buildingId}/floors`
  )

  return res.data.data.data
}

export const createFloorService = async (
  buildingId: number,
  body: RequestBody
) => {
  const res = await api<Api.Base<Rooms.IFloor>>('post')(
    `rooms/buildings/${buildingId}/floors`,
    undefined,
    body
  )

  return res.data.data.data
}

export const updateFloorService = async (
  buildingId: number,
  floorId: number,
  body: RequestBody
) => {
  const res = await api<Api.Base<Rooms.IFloor>>('patch')(
    `rooms/buildings/${buildingId}/floors/${floorId}`,
    undefined,
    body
  )

  return res.data.data.data
}

export const deleteFloorService = async (
  buildingId: number,
  floorId: number
) => {
  const res = await api<Api.Base<object>>('delete')(
    `rooms/buildings/${buildingId}/floors/${floorId}`
  )

  return res.data.data.data
}

// MARK: - ROOM TYPES / FACILITIES
export const createRoomTypeService = async (body: RequestBody) => {
  const res = await api<Api.Base<Rooms.IRoomType>>('post')(
    'rooms/room-types',
    undefined,
    body
  )

  return res.data.data.data
}

export const updateRoomTypeService = async (
  roomTypeId: number,
  body: RequestBody
) => {
  const res = await api<Api.Base<Rooms.IRoomType>>('patch')(
    `rooms/room-types/${roomTypeId}`,
    undefined,
    body
  )

  return res.data.data.data
}

export const deleteRoomTypeService = async (roomTypeId: number) => {
  const res = await api<Api.Base<object>>('delete')(
    `rooms/room-types/${roomTypeId}`
  )

  return res.data.data.data
}

export const createFacilityService = async (body: RequestBody) => {
  const res = await api<Api.Base<Rooms.IFacility>>('post')(
    'rooms/facilities',
    undefined,
    body
  )

  return res.data.data.data
}

export const updateFacilityService = async (
  facilityId: number,
  body: RequestBody
) => {
  const res = await api<Api.Base<Rooms.IFacility>>('patch')(
    `rooms/facilities/${facilityId}`,
    undefined,
    body
  )

  return res.data.data.data
}

export const deleteFacilityService = async (facilityId: number) => {
  const res = await api<Api.Base<object>>('delete')(
    `rooms/facilities/${facilityId}`
  )

  return res.data.data.data
}

// MARK: - SECTION ALLOCATIONS
export interface IAllocationFilters {
  page?: number
  limit?: number
  academic_year_id?: number
  section_id?: number
  room_id?: number
  class_id?: number
  status?: string
}

export const getAllocationListService = async (
  filters: IAllocationFilters = {}
) => {
  const res = await api<Api.Base<Api.PaginatedData<Rooms.IAllocationListRow>>>(
    'get'
  )('rooms/section-allocations', toParams(filters))

  return res.data.data.data
}

export const getSectionOverviewService = async (academicYearId?: number) => {
  const res = await api<Api.Base<Rooms.ISectionOverviewRow[]>>('get')(
    'rooms/sections',
    toParams({ academic_year_id: academicYearId })
  )

  return res.data.data.data
}

export const createAllocationService = async (body: RequestBody) => {
  const res = await api<Api.Base<object>>('post')(
    'rooms/section-allocations',
    undefined,
    body
  )

  return res.data.data.data
}

export const updateAllocationService = async (
  allocationId: number,
  body: RequestBody
) => {
  const res = await api<Api.Base<object>>('patch')(
    `rooms/section-allocations/${allocationId}`,
    undefined,
    body
  )

  return res.data.data.data
}

export const deactivateAllocationService = async (allocationId: number) => {
  const res = await api<Api.Base<object>>('delete')(
    `rooms/section-allocations/${allocationId}`
  )

  return res.data.data.data
}

// MARK: - BOOKINGS
export interface IBookingFilters {
  page?: number
  limit?: number
  room_id?: number
  from_date?: string
  to_date?: string
  purpose_type?: string
  status?: string
  booking_type?: string
  search?: string
}

export const getBookingListService = async (filters: IBookingFilters = {}) => {
  const res = await api<Api.Base<Api.PaginatedData<Rooms.IBookingListRow>>>(
    'get'
  )('rooms/bookings', toParams(filters))

  return res.data.data.data
}

export const createBookingService = async (body: RequestBody) => {
  const res = await api<
    Api.Base<{ bookings: Rooms.IBooking[]; occurrence_count: number }>
  >('post')('rooms/bookings', undefined, body)

  return res.data.data.data
}

export const updateBookingService = async (
  bookingId: number,
  body: RequestBody
) => {
  const res = await api<Api.Base<Rooms.IBooking>>('patch')(
    `rooms/bookings/${bookingId}`,
    undefined,
    body
  )

  return res.data.data.data
}

export const cancelBookingService = async (bookingId: number) => {
  const res = await api<Api.Base<{ cancelled_count: number }>>('post')(
    `rooms/bookings/${bookingId}/cancel`
  )

  return res.data.data.data
}

export const deleteBookingService = async (bookingId: number) => {
  const res = await api<Api.Base<object>>('delete')(
    `rooms/bookings/${bookingId}`
  )

  return res.data.data.data
}

export const checkRoomAvailabilityService = async (body: RequestBody) => {
  const res = await api<Api.Base<{ available: boolean; reason?: string }>>(
    'post'
  )('rooms/bookings/availability-check', undefined, body)

  return res.data.data.data
}

// MARK: - SCHEDULE / OVERVIEW
export const getRoomScheduleService = async (
  date: string,
  roomIds?: number[]
) => {
  const res = await api<Api.Base<Rooms.IScheduleRow[]>>('get')(
    'rooms/schedule',
    toParams({
      date,
      room_ids: roomIds?.length ? roomIds.join(',') : undefined,
    })
  )

  return res.data.data.data
}

export const getRoomAvailabilityService = async (
  roomId: number,
  date: string
) => {
  const res = await api<Api.Base<Rooms.IAvailability>>('get')(
    'rooms/availability',
    toParams({ room_id: roomId, date })
  )

  return res.data.data.data
}

export const getRoomOverviewService = async (date?: string) => {
  const res = await api<Api.Base<Rooms.IOverview>>('get')(
    'rooms/overview',
    toParams({ date })
  )

  return res.data.data.data
}

export const getRoomUtilisationReportService = async (
  fromDate: string,
  toDate: string
) => {
  const res = await api<Api.Base<Rooms.IUtilisationReport>>('get')(
    'rooms/reports/utilisation',
    toParams({ from_date: fromDate, to_date: toDate })
  )

  return res.data.data.data
}

// MARK: - MAINTENANCE
export interface IMaintenanceFilters {
  page?: number
  limit?: number
  room_id?: number
  status?: string
  from_date?: string
  to_date?: string
  search?: string
}

export const getMaintenanceListService = async (
  filters: IMaintenanceFilters = {}
) => {
  const res = await api<Api.Base<Api.PaginatedData<Rooms.IMaintenanceListRow>>>(
    'get'
  )('rooms/maintenance', toParams(filters))

  return res.data.data.data
}

export const createMaintenanceService = async (body: RequestBody) => {
  const res = await api<Api.Base<Rooms.IMaintenance>>('post')(
    'rooms/maintenance',
    undefined,
    body
  )

  return res.data.data.data
}

export const updateMaintenanceService = async (
  maintenanceId: number,
  body: RequestBody
) => {
  const res = await api<Api.Base<Rooms.IMaintenance>>('patch')(
    `rooms/maintenance/${maintenanceId}`,
    undefined,
    body
  )

  return res.data.data.data
}

export const deleteMaintenanceService = async (maintenanceId: number) => {
  const res = await api<Api.Base<object>>('delete')(
    `rooms/maintenance/${maintenanceId}`
  )

  return res.data.data.data
}
