import { useEffect, useMemo, useState } from 'react'
import { Box, Card, Chip, Grid, Stack, Typography } from '@mui/material'
import { GiCheckMark } from 'react-icons/gi'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getScheduleAction } from '@src/store/redux/dashboard/rooms/rooms.slice'
import { getRoomListService } from '@src/store/redux/dashboard/rooms/rooms.service'
import { PageHeader } from '../../components/pageHeader/pageHeader.component'
import { StatusChip } from '../../components/statusChip/statusChip.component'
import { BookingModal } from '../../components/bookingModal/bookingModal.component'
import { formatTime } from '../../rooms.helpers'

type Option = { label: string; value: number }

const SOURCE_COLOR: Record<string, string> = {
  booking: colors.blue[50],
  timetable: colors.green[50],
  maintenance: colors.orange[50],
}

export function RoomSchedulePage() {
  const dispatch = useDispatch()
  const schedule = useSelector((store) => store.rooms.schedule)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [roomFilter, setRoomFilter] = useState<Option[]>([])
  const [rooms, setRooms] = useState<Rooms.IRoomListRow[]>([])
  const [bookingDefaults, setBookingDefaults] = useState<{
    roomId: number
    date: string
  } | null>(null)

  useEffect(() => {
    getRoomListService({ limit: 500 })
      .then((res) => setRooms(res.rows))
      .catch(() => setRooms([]))
  }, [])

  useEffect(() => {
    dispatch(
      getScheduleAction({
        date,
        roomIds: roomFilter.length
          ? roomFilter.map((item) => item.value)
          : undefined,
      })
    )
  }, [date, roomFilter])

  const roomOptions: Option[] = useMemo(
    () =>
      rooms.map((room) => ({
        label: `${room.room_details.name} (${room.room_details.code})`,
        value: room.room_details.id,
      })),
    [rooms]
  )

  return (
    <Box>
      <PageHeader
        title="Room Schedule"
        subtitle="Time-interval availability: a room can be occupied from 9–10 and free from 10–11, so the agenda is calculated per interval."
      />

      <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, mb: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Box sx={{ minWidth: 180 }}>
            <InputField
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </Box>
          <Box sx={{ minWidth: 280, flex: 1 }}>
            <SelectField
              isMulti
              isClearable
              placeholder="All rooms"
              options={roomOptions}
              value={roomFilter}
              onChange={(options) => setRoomFilter((options ?? []) as Option[])}
              styles={{ menuList: (base) => ({ ...base, maxHeight: 220 }) }}
            />
          </Box>
        </Stack>
      </Card>

      {schedule.loading ? (
        <Typography fontSize={13} color="text.secondary">
          Loading schedule…
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {(schedule.data ?? []).map((row) => (
            <Grid item xs={12} md={6} lg={4} key={row.room.id}>
              <Card
                variant="outlined"
                sx={{ borderRadius: 2.5, height: '100%' }}
              >
                <Box
                  px={2}
                  py={1.5}
                  borderBottom={`1px solid ${colors.grey[200]}`}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography fontSize={13.5} fontWeight={700}>
                        {row.room.name}
                      </Typography>
                      <Typography fontSize={11.5} color="text.secondary">
                        {row.room.code} ·{' '}
                        {row.room.building_name ?? 'No building'} ·{' '}
                        {row.room.capacity} seats
                      </Typography>
                    </Box>
                    <StatusChip status={row.room.status} />
                  </Stack>
                </Box>

                <Stack spacing={0.75} p={1.5} minHeight={120}>
                  {row.entries.length ? (
                    row.entries.map((entry) => (
                      <Box
                        key={`${entry.source}-${entry.id}`}
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          bgcolor:
                            SOURCE_COLOR[entry.source] ?? colors.grey[50],
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Typography fontSize={12.5} fontWeight={600} noWrap>
                            {entry.title}
                          </Typography>
                          <Typography fontSize={11.5} flexShrink={0}>
                            {formatTime(entry.start_time)} –{' '}
                            {formatTime(entry.end_time)}
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                          mt={0.25}
                        >
                          <Chip
                            size="small"
                            label={entry.source}
                            sx={{ height: 18, fontSize: 10 }}
                          />
                          {entry.teacher_name ? (
                            <Typography fontSize={11} color="text.secondary">
                              {entry.teacher_name}
                            </Typography>
                          ) : null}
                        </Stack>
                      </Box>
                    ))
                  ) : (
                    <Stack
                      direction="row"
                      spacing={0.75}
                      alignItems="center"
                      justifyContent="center"
                      sx={{ flex: 1, color: colors.green[600] }}
                    >
                      <GiCheckMark size={14} />
                      <Typography fontSize={12.5}>Free all day</Typography>
                    </Stack>
                  )}
                </Stack>

                <Box px={1.5} pb={1.5}>
                  <ButtonComp
                    size="small"
                    variant="outlined"
                    fullWidth
                    disabled={!row.is_bookable}
                    onClick={() =>
                      setBookingDefaults({ roomId: row.room.id, date })
                    }
                  >
                    Book this room
                  </ButtonComp>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <BookingModal
        open={Boolean(bookingDefaults)}
        defaults={bookingDefaults ?? undefined}
        onClose={() => setBookingDefaults(null)}
        onSaved={() => {
          dispatch(getScheduleAction({ date }))
        }}
      />
    </Box>
  )
}
