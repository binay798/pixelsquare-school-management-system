import { useEffect, useMemo, useState } from 'react'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { GoPlus } from 'react-icons/go'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  cancelBookingAction,
  getBookingListAction,
  getRoomMasterDataAction,
} from '@src/store/redux/dashboard/rooms/rooms.slice'
import { getRoomListService } from '@src/store/redux/dashboard/rooms/rooms.service'
import { PageHeader } from '../../components/pageHeader/pageHeader.component'
import { StatusChip } from '../../components/statusChip/statusChip.component'
import { BookingModal } from '../../components/bookingModal/bookingModal.component'
import {
  BOOKING_STATUS_OPTIONS,
  PURPOSE_LABEL,
  ROOM_PURPOSE_OPTIONS,
  formatDate,
  formatTime,
} from '../../rooms.helpers'

type Option = { label: string; value: string | number }

export function BookingsPage() {
  const dispatch = useDispatch()
  const master = useSelector((store) => store.rooms.master.data)
  const bookings = useSelector((store) => store.rooms.bookings)
  const { loading: mutationLoading } = useSelector(
    (store) => store.rooms.mutation
  )

  const [rooms, setRooms] = useState<Rooms.IRoomListRow[]>([])
  const [room, setRoom] = useState<Option | null>(null)
  const [status, setStatus] = useState<Option | null>(null)
  const [purpose, setPurpose] = useState<Option | null>(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    if (!master) {
      dispatch(getRoomMasterDataAction(undefined))
    }
    getRoomListService({ limit: 500 })
      .then((res) => setRooms(res.rows))
      .catch(() => setRooms([]))
  }, [])

  const load = () => {
    dispatch(
      getBookingListAction({
        page,
        limit: 10,
        room_id: room?.value as number | undefined,
        status: status?.value as string | undefined,
        purpose_type: purpose?.value as string | undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      })
    )
  }

  useEffect(() => {
    load()
  }, [page, room, status, purpose, fromDate, toDate])

  const roomOptions: Option[] = rooms.map((item) => ({
    label: `${item.room_details.name} (${item.room_details.code})`,
    value: item.room_details.id,
  }))

  const rows = useMemo(
    () =>
      (bookings.data ?? []).map((row) => ({
        ...row,
        id: row.booking_details.id,
        title_label: row.booking_details.title,
        room_label: `${row.room_details.name} (${row.room_details.code})`,
        date_label: formatDate(row.booking_details.booking_date),
        time_label: `${formatTime(
          row.booking_details.start_time
        )} – ${formatTime(row.booking_details.end_time)}`,
        purpose_label:
          PURPOSE_LABEL[row.booking_details.purpose_type] ??
          row.booking_details.purpose_type,
        type_label:
          row.booking_details.booking_type === 'recurring'
            ? 'Recurring'
            : 'One time',
        status_label: row.booking_details.status,
        capacity_label: `${row.booking_details.expected_capacity ?? '—'} / ${
          row.room_details.capacity
        }`,
        row,
      })),
    [bookings.data]
  )

  return (
    <Box>
      <PageHeader
        title="Room Bookings"
        subtitle="Examinations, events, meetings and any ad-hoc use of a room, validated by the central allocation engine."
        action={
          <ButtonComp startIcon={<GoPlus />} onClick={() => setOpenModal(true)}>
            New booking
          </ButtonComp>
        }
      />

      <TableComp
        data={rows}
        loading={bookings.loading}
        count={bookings.total}
        page={page}
        rowsPerPage={10}
        onPageChange={setPage}
        columns={[
          {
            field: 'title_label',
            name: 'Booking',
            render: (value, item) => (
              <Box>
                <Typography fontSize={13.5} fontWeight={600}>
                  {String(value)}
                </Typography>
                <Typography fontSize={11.5} color="text.secondary">
                  {item.room_label} · {item.purpose_label}
                </Typography>
              </Box>
            ),
          },
          { field: 'date_label', name: 'Date' },
          { field: 'time_label', name: 'Time' },
          {
            field: 'type_label',
            name: 'Type',
            render: (value, item) => (
              <Stack spacing={0.5}>
                <Chip
                  size="small"
                  label={String(value)}
                  sx={{ height: 20, fontSize: 11 }}
                />
                {item.booking_details.parent_booking_id ? (
                  <Typography fontSize={10.5} color="text.secondary">
                    Series #{item.booking_details.parent_booking_id}
                  </Typography>
                ) : null}
              </Stack>
            ),
          },
          { field: 'capacity_label', name: 'Expected / Capacity' },
          {
            field: 'status_label',
            name: 'Status',
            render: (value) => <StatusChip status={String(value)} />,
          },
        ]}
        actions={{
          onDelete: (item, onClose) => {
            dispatch(
              cancelBookingAction({
                bookingId: item.id,
                onSuccess: () => {
                  onClose?.()
                  load()
                },
              })
            )
          },
        }}
        deleteConfirmLoader={mutationLoading}
        deleteConfirmationModalDescription={
          <Typography fontSize={13.5}>
            Cancelling releases the time slot immediately. For a recurring
            series the whole series is cancelled; every occurrence re-appears as
            free in the schedule.
          </Typography>
        }
        headerEl={
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            alignItems="center"
          >
            <Box sx={{ minWidth: 180 }}>
              <SelectField
                isClearable
                placeholder="Room"
                options={roomOptions}
                value={room}
                onChange={(option) => {
                  setRoom(option as Option | null)
                  setPage(1)
                }}
              />
            </Box>
            <Box sx={{ minWidth: 160 }}>
              <SelectField
                isClearable
                placeholder="Purpose"
                options={ROOM_PURPOSE_OPTIONS}
                value={purpose}
                onChange={(option) => {
                  setPurpose(option as Option | null)
                  setPage(1)
                }}
              />
            </Box>
            <Box sx={{ minWidth: 140 }}>
              <SelectField
                isClearable
                placeholder="Status"
                options={BOOKING_STATUS_OPTIONS}
                value={status}
                onChange={(option) => {
                  setStatus(option as Option | null)
                  setPage(1)
                }}
              />
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <InputField
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setFromDate(event.target.value)
                  setPage(1)
                }}
              />
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <InputField
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value)
                  setPage(1)
                }}
              />
            </Box>
          </Stack>
        }
      />

      <BookingModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSaved={() => {
          load()
          getRoomListService({ limit: 500 })
            .then((res) => setRooms(res.rows))
            .catch(() => undefined)
        }}
      />
    </Box>
  )
}
