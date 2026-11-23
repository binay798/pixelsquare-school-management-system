declare namespace Rooms {
  import { BaseAttribute } from './base'

  type RoomStatus = 'available' | 'maintenance' | 'inactive'
  type BookingPurpose =
    | 'section'
    | 'timetable'
    | 'examination'
    | 'event'
    | 'meeting'
    | 'temporary'
    | 'other'
  type BookingStatus = 'pending' | 'confirmed' | 'cancelled'
  type BookingType = 'one_time' | 'recurring'
  type MaintenanceStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
  type AllocationStatus = 'active' | 'inactive'

  interface IBuilding extends BaseAttribute {
    id: number
    created_at: string
    updated_at: string
    school_id?: number
    name: string
    code: string
    description: string | null
    is_active: boolean
  }

  interface IFloor extends BaseAttribute {
    id: number
    created_at: string
    updated_at: string
    school_id?: number
    building_id: number
    name: string
    floor_number: number
    description: string | null
    is_active: boolean
  }

  interface IRoomType extends BaseAttribute {
    id: number
    created_at: string
    updated_at: string
    name: string
    code: string
    description: string | null
    is_active: boolean
  }

  interface IFacility extends BaseAttribute {
    id: number
    created_at: string
    updated_at: string
    name: string
    code: string
    description: string | null
    is_active: boolean
  }

  interface IRoom extends BaseAttribute {
    id: number
    created_at: string
    updated_at: string
    school_id?: number
    building_id: number | null
    floor_id: number | null
    room_type_id: number | null
    name: string
    code: string
    capacity: number
    area: string | null
    status: RoomStatus
    description: string | null
    notes: string | null
    photo_url: string | null
    responsible_staff_id: number | null
    available_days: number[] | null
    available_from: string | null
    available_to: string | null
  }

  interface IFacilityAssignment {
    id: number
    facility_id: number
    quantity: number
    condition: string
    remarks: string | null
    facility_details: Pick<IFacility, 'id' | 'name' | 'code'>
  }

  interface IPrimaryAllocation {
    id: number
    is_primary: boolean
    effective_from: string
    effective_to: string | null
    academic_year_id: number
  }

  interface IRoomListRow {
    room_details: IRoom
    building_details: Pick<IBuilding, 'id' | 'name' | 'code'> | null
    floor_details: Pick<IFloor, 'id' | 'name' | 'floor_number'> | null
    room_type_details: Pick<IRoomType, 'id' | 'name' | 'code'> | null
    facilities_details: IFacilityAssignment[]
    allocation_details: IPrimaryAllocation | null
    section_details: { id: number; name: string } | null
    class_details: { id: number; name: string; numeric_name: string } | null
  }

  interface IBooking {
    id: number
    room_id: number
    purpose_type: BookingPurpose
    purpose_id: number | null
    title: string
    description: string | null
    booking_date: string
    start_time: string
    end_time: string
    expected_capacity: number | null
    status: BookingStatus
    booking_type: BookingType
    recurrence_rule: IRecurrenceRule | null
    parent_booking_id: number | null
    created_by: number | null
  }

  interface IRecurrenceRule {
    frequency: 'daily' | 'weekly'
    interval?: number
    days_of_week?: number[]
    until: string
  }

  interface IRoomDetailRow extends IRoomListRow {
    allocations: Array<{
      allocation_details: {
        id: number
        section_id: number
        room_id: number
        academic_year_id: number
        effective_from: string
        effective_to: string | null
        is_primary: boolean
        status: AllocationStatus
        notes: string | null
      }
      section_details: { id: number; name: string }
      class_details: { id: number; name: string; numeric_name: string }
      academic_year_details: { id: number; name: string }
    }>
    upcoming_bookings: Array<{
      booking_details: {
        id: number
        title: string
        purpose_type: BookingPurpose
        booking_date: string
        start_time: string
        end_time: string
        status: BookingStatus
      }
    }>
  }

  interface IBookingListRow {
    booking_details: IBooking
    room_details: Pick<IRoom, 'id' | 'name' | 'code' | 'capacity' | 'status'>
    building_details: Pick<IBuilding, 'id' | 'name' | 'code'> | null
    creator_details: { id: number; firstname: string; lastname: string } | null
  }

  interface IAllocationListRow {
    allocation_details: {
      id: number
      section_id: number
      room_id: number
      academic_year_id: number
      effective_from: string
      effective_to: string | null
      is_primary: boolean
      status: AllocationStatus
      notes: string | null
    }
    section_details: { id: number; name: string }
    class_details: { id: number; name: string; numeric_name: string }
    room_details: Pick<
      IRoom,
      'id' | 'name' | 'code' | 'capacity' | 'status'
    > | null
    building_details: Pick<IBuilding, 'id' | 'name' | 'code'> | null
    academic_year_details: { id: number; name: string }
    enrolled_students: number
  }

  interface ISectionOverviewRow {
    section_details: { id: number; name: string }
    class_details: { id: number; name: string; numeric_name: string }
    enrolled_students: number
    allocation_id: number | null
    room_details: Pick<
      IRoom,
      'id' | 'name' | 'code' | 'capacity' | 'status'
    > | null
    effective_from: string | null
    effective_to: string | null
    is_primary: boolean | null
  }

  interface IMaintenance {
    id: number
    room_id: number
    issue: string
    description: string | null
    maintenance_date: string
    scheduled_from: string | null
    scheduled_to: string | null
    completed_at: string | null
    status: MaintenanceStatus
    cost: string | null
    remarks: string | null
    reported_by: number | null
  }

  interface IMaintenanceListRow {
    maintenance_details: IMaintenance
    room_details: Pick<IRoom, 'id' | 'name' | 'code' | 'capacity' | 'status'>
    building_details: Pick<IBuilding, 'id' | 'name' | 'code'> | null
    reporter_details: { id: number; firstname: string; lastname: string } | null
  }

  interface IAgendaEntry {
    source: 'booking' | 'timetable' | 'maintenance'
    id: number
    title: string
    start_time: string
    end_time: string
    booking_date: string
    purpose_type?: BookingPurpose
    status?: BookingStatus
    section_name?: string
    subject_name?: string
    teacher_name?: string
  }

  interface IScheduleRow {
    room: {
      id: number
      name: string
      code: string
      capacity: number
      status: RoomStatus
      building_name: string | null
      room_type_name: string | null
      available_from: string | null
      available_to: string | null
    }
    entries: IAgendaEntry[]
    is_bookable: boolean
  }

  interface IAvailability {
    booking_date: string
    weekday: string
    opening_time: string
    closing_time: string
    room_status: RoomStatus
    is_bookable: boolean
    busy: IAgendaEntry[]
    free_windows: Array<{ start_time: string; end_time: string }>
  }

  interface IUtilisationRoom {
    room_id: number
    name: string
    code: string
    capacity: number
    status: RoomStatus
    booking_count: number
    booked_minutes: number
    timetable_minutes: number
    occupied_minutes: number
    available_minutes: number
    utilisation_percent: number
  }

  interface IUtilisationReport {
    from_date: string
    to_date: string
    total_rooms: number
    total_occupied_minutes: number
    total_available_minutes: number
    utilisation_percent: number
    rooms: IUtilisationRoom[]
  }

  interface IOverviewEntry {
    room_id: number
    room_name: string
    room_code: string
    building_name: string | null
    source: 'booking' | 'timetable' | 'maintenance'
    title: string
    start_time: string
    end_time: string
    purpose_type: BookingPurpose | null
    status: BookingStatus | null
  }

  interface IOverview {
    date: string
    total_rooms: number
    available_rooms: number
    occupied_rooms: number
    maintenance_rooms: number
    inactive_rooms: number
    active_maintenance_records: number
    unallocated_sections: number
    today_booking_count: number
    utilisation_percent: number
    schedule: IOverviewEntry[]
    utilisation: IUtilisationReport
  }

  interface IMasterData {
    buildings: IBuilding[]
    floors: IFloor[]
    room_types: IRoomType[]
    facilities: IFacility[]
    academic_years: Array<{
      id: number
      name: string
      session_start_at: string
      session_end_at: string
      is_active: boolean
    }>
  }
}
