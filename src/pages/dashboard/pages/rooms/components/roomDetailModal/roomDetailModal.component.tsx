import { useEffect } from 'react'
import { Box, Divider, Stack, Typography } from '@mui/material'
import SpringModal from '@src/components/modal/modal.component'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getRoomDetailAction } from '@src/store/redux/dashboard/rooms/rooms.slice'
import { colors } from '@src/helpers/colors.helpers'
import { StatusChip } from '../statusChip/statusChip.component'
import { formatDate, formatTime, WEEKDAY_OPTIONS } from '../../rooms.helpers'

interface Props {
  open: boolean
  roomId: number | null
  onClose: () => void
}

const Row = ({ label, value }: { label: string; value: string | number }) => (
  <Stack direction="row" justifyContent="space-between" spacing={2}>
    <Typography fontSize={12.5} color={colors.grey[600]}>
      {label}
    </Typography>
    <Typography fontSize={12.5} fontWeight={500} textAlign="right">
      {value}
    </Typography>
  </Stack>
)

export function RoomDetailModal({ open, roomId, onClose }: Props) {
  const dispatch = useDispatch()
  const { data, loading } = useSelector((store) => store.rooms.roomDetail)

  useEffect(() => {
    if (open && roomId) {
      dispatch(getRoomDetailAction(roomId))
    }
  }, [open, roomId])

  const room = data?.room_details
  const dayLabels = (room?.available_days ?? [])
    .map((day) => WEEKDAY_OPTIONS.find((option) => option.value === day)?.label)
    .filter(Boolean)

  return (
    <SpringModal open={open} close={onClose} size="md">
      <Box>
        <Typography variant="h6" fontWeight={700}>
          {room?.name ?? 'Room details'}
        </Typography>
        <Typography fontSize={12.5} color={colors.grey[600]} mb={2}>
          {loading
            ? 'Loading room…'
            : `${room?.code ?? ''} · ${
                data?.room_type_details?.name ?? 'No type'
              }`}
        </Typography>

        {room ? (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <StatusChip status={room.status} />
              {data?.building_details ? (
                <Typography fontSize={12.5}>
                  {data.building_details.name}
                  {data.floor_details ? ` · ${data.floor_details.name}` : ''}
                </Typography>
              ) : (
                <Typography fontSize={12.5} color={colors.grey[600]}>
                  No building assigned
                </Typography>
              )}
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Row label="Capacity" value={`${room.capacity} seats`} />
              <Row
                label="Area"
                value={room.area ? `${room.area} sq. m` : '—'}
              />
              <Row
                label="Operating hours"
                value={
                  room.available_from && room.available_to
                    ? `${formatTime(room.available_from)} – ${formatTime(
                        room.available_to
                      )}`
                    : 'Daily 08:00 – 18:00'
                }
              />
              <Row
                label="Available days"
                value={dayLabels.length ? dayLabels.join(', ') : 'Every day'}
              />
            </Stack>

            <Box>
              <Typography fontSize={13} fontWeight={700} mb={0.75}>
                Facilities
              </Typography>
              {data?.facilities_details.length ? (
                <Typography fontSize={12.5}>
                  {data.facilities_details
                    .map(
                      (item) =>
                        `${item.facility_details.name}${
                          item.quantity > 1 ? ` ×${item.quantity}` : ''
                        }`
                    )
                    .join(', ')}
                </Typography>
              ) : (
                <Typography fontSize={12.5} color={colors.grey[600]}>
                  No facilities recorded.
                </Typography>
              )}
            </Box>

            <Box>
              <Typography fontSize={13} fontWeight={700} mb={0.75}>
                Allocation history
              </Typography>
              {data?.allocations.length ? (
                <Stack spacing={1}>
                  {data.allocations.map((item) => (
                    <Box
                      key={item.allocation_details.id}
                      sx={{ p: 1, borderRadius: 1.5, bgcolor: colors.grey[50] }}
                    >
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontSize={12.5} fontWeight={600}>
                          {item.class_details.name} {item.section_details.name}
                        </Typography>
                        <StatusChip status={item.allocation_details.status} />
                      </Stack>
                      <Typography fontSize={11.5} color={colors.grey[600]}>
                        {item.academic_year_details.name} ·{' '}
                        {formatDate(item.allocation_details.effective_from)} →{' '}
                        {item.allocation_details.effective_to
                          ? formatDate(item.allocation_details.effective_to)
                          : 'open'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography fontSize={12.5} color={colors.grey[600]}>
                  No section has been allocated to this room yet.
                </Typography>
              )}
            </Box>

            <Box>
              <Typography fontSize={13} fontWeight={700} mb={0.75}>
                Upcoming bookings
              </Typography>
              {data?.upcoming_bookings.length ? (
                <Stack spacing={0.75}>
                  {data.upcoming_bookings.map((item) => (
                    <Stack
                      key={item.booking_details.id}
                      direction="row"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Typography fontSize={12.5}>
                        {item.booking_details.title}
                      </Typography>
                      <Typography
                        fontSize={12}
                        color={colors.grey[600]}
                        textAlign="right"
                      >
                        {formatDate(item.booking_details.booking_date)} ·{' '}
                        {formatTime(item.booking_details.start_time)} –{' '}
                        {formatTime(item.booking_details.end_time)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography fontSize={12.5} color={colors.grey[600]}>
                  No upcoming booking.
                </Typography>
              )}
            </Box>
          </Stack>
        ) : null}
      </Box>
    </SpringModal>
  )
}
